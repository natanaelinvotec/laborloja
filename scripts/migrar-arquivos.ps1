# =====================================================================
#  Migra fotos e PDFs do WordPress antigo para o projeto novo.
#
#  1. No painel: Importar e backup -> "Baixar backup (.json)"
#  2. Dê dois cliques em MIGRAR-ARQUIVOS.bat (na pasta do projeto)
#  3. O script:
#     - acha o backup mais recente na pasta Downloads
#     - baixa cada arquivo de laborloja.com.br/wp-content/uploads/ para
#       a pasta "uploads" do projeto (mesma estrutura de pastas)
#     - cria "laborloja-backup-migrado.json" com os endereços novos
#  4. Envie a pasta "uploads" ao GitHub e restaure o backup migrado no painel.
# =====================================================================
param(
  [string]$Backup = ""
)
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$raiz = Split-Path -Parent $PSScriptRoot
$pastaUploads = Join-Path $raiz "uploads"
$antigo = "https://laborloja.com.br/wp-content/uploads/"

if (-not $Backup) {
  $downloads = Join-Path $env:USERPROFILE "Downloads"
  $arq = Get-ChildItem -Path $downloads -Filter "laborloja-backup-*.json" -ErrorAction SilentlyContinue |
         Where-Object { $_.Name -notlike "*migrado*" } |
         Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $arq) {
    Write-Host "Nao encontrei nenhum laborloja-backup-*.json em $downloads." -ForegroundColor Red
    Write-Host "Baixe o backup no painel (Importar e backup -> Baixar backup) e rode de novo."
    exit 1
  }
  $Backup = $arq.FullName
}
Write-Host "Backup: $Backup" -ForegroundColor Cyan

$utf8 = New-Object System.Text.UTF8Encoding($false)
$texto = [IO.File]::ReadAllText($Backup, $utf8)

# Endereços do WordPress (com http ou https, com ou sem www)
$padrao = 'https?://(www\.)?laborloja\.com\.br/wp-content/uploads/[^"''\s<>\\)]+'
# mais longos primeiro, para um endereço nunca ser trocado "dentro" de outro maior
$urls = @([regex]::Matches($texto, $padrao) | ForEach-Object { $_.Value } | Sort-Object -Unique | Sort-Object Length -Descending)
Write-Host ("{0} arquivos encontrados." -f $urls.Count) -ForegroundColor Cyan

$ok = 0; $falhas = @(); $grandes = @(); $total = 0
foreach ($url in $urls) {
  $rel = ($url -replace '^https?://(www\.)?laborloja\.com\.br/wp-content/uploads/', '') -replace '\?.*$', ''
  $relDisco = [Uri]::UnescapeDataString($rel) -replace '/', '\'
  $destino = Join-Path $pastaUploads $relDisco
  try {
    if (-not (Test-Path $destino)) {
      New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destino) | Out-Null
      Invoke-WebRequest -Uri ($antigo + $rel) -OutFile $destino -UseBasicParsing -TimeoutSec 120
      Write-Host "  OK  $rel"
    } else {
      Write-Host "  --  $rel (ja baixado)"
    }
    $tam = (Get-Item $destino).Length
    $total += $tam
    if ($tam -gt 25MB) { $grandes += "$rel ({0:N1} MB)" -f ($tam / 1MB) }
    $texto = $texto.Replace($url, "uploads/" + $rel)
    $ok++
  } catch {
    $falhas += "$rel  ->  $($_.Exception.Message)"
    Write-Host "  ERRO $rel" -ForegroundColor Red
  }
}

$saida = Join-Path (Split-Path -Parent $Backup) "laborloja-backup-migrado.json"
[IO.File]::WriteAllText($saida, $texto, $utf8)

Write-Host ""
Write-Host ("Baixados: {0} de {1}  ({2:N1} MB no total)" -f $ok, $urls.Count, ($total / 1MB)) -ForegroundColor Green
Write-Host "Pasta com os arquivos: $pastaUploads"
Write-Host "Backup com enderecos novos: $saida"
if ($falhas.Count) {
  Write-Host ""
  Write-Host "Nao foi possivel baixar (estes continuam apontando para o site antigo):" -ForegroundColor Yellow
  $falhas | ForEach-Object { Write-Host "  $_" }
}
if ($grandes.Count) {
  Write-Host ""
  Write-Host "Arquivos acima de 25 MB (o upload pelo site do GitHub nao aceita; use GitHub Desktop/git):" -ForegroundColor Yellow
  $grandes | ForEach-Object { Write-Host "  $_" }
}
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. Envie a pasta 'uploads' para o repositorio no GitHub."
Write-Host "  2. Espere ~1 minuto o GitHub Pages publicar."
Write-Host "  3. No painel: Importar e backup -> Restaurar de um backup -> escolha laborloja-backup-migrado.json"

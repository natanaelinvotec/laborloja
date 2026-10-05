// Baixa todas as imagens/PDFs que ainda apontam para o site antigo (WordPress)
// para a pasta assets/uploads e atualiza data/conteudo.json.
// Use ANTES de desligar o WordPress:   node scripts/baixar-imagens.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ANTIGO = "https://laborloja.com.br/wp-content/uploads/";
const DESTINO = "assets/uploads";
const arq = "data/conteudo.json";
let texto = await readFile(arq, "utf8");
const urls = [...new Set(texto.match(/https:\/\/laborloja\.com\.br\/wp-content\/uploads\/[^"\\\s]+/g) || [])];
console.log(`${urls.length} arquivos para baixar…`);
for (const url of urls) {
  const local = path.join(DESTINO, decodeURIComponent(url.slice(ANTIGO.length)));
  if (!existsSync(local)) {
    const r = await fetch(url);
    if (!r.ok) { console.warn("✗", r.status, url); continue; }
    await mkdir(path.dirname(local), { recursive: true });
    await writeFile(local, Buffer.from(await r.arrayBuffer()));
    console.log("✓", local);
  }
  texto = texto.split(url).join(local.replaceAll(path.sep, "/"));
}
await writeFile(arq, texto);
console.log("Pronto! data/conteudo.json atualizado. Faça commit da pasta assets/uploads.");

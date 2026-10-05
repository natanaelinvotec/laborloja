# LaborLoja — site + painel de gerenciamento

Site da LaborLoja (catálogo de produtos para diagnóstico) com um **painel simples** em `/admin` onde qualquer pessoa troca textos, fotos, produtos, cores e contatos — sem mexer em código.

- **Site:** `index.html` (página inicial), `produtos.html`, `produto.html`, `categorias.html`, `pagina.html` (Quem Somos, Contato, Privacidade) e `orcamento.html` (lista de cotação → WhatsApp).
- **Painel:** `admin/` — login com e-mail e senha.
- **Banco de dados e arquivos:** Firebase (gratuito para o tamanho deste site).

---

## Para quem vai usar o painel (pessoa leiga)

1. Acesse `https://SEU-SITE/admin/` e entre com seu e-mail e senha.
2. No menu da esquerda escolha o que quer mudar:
   | Quero… | Vá em |
   |---|---|
   | Trocar logo ou cores | **Aparência** |
   | Mudar WhatsApp, e-mail, redes | **Contato e redes** |
   | Mudar o banner principal, promoções, banners da home | **Página inicial** |
   | Adicionar/editar/esconder um produto | **Produtos** → *Editar* ou *+ Novo produto* |
   | Criar ou organizar categorias | **Categorias** |
   | Editar Quem Somos, Política de privacidade | **Páginas** |
   | Mudar links do menu e do rodapé | **Menu e rodapé** |
3. Depois de alterar, clique no botão verde **💾 Salvar**.
4. Para trocar sua senha: menu **🔑 Mudar senha**. A mudança aparece no site na hora (recarregue a página do site).

Dicas:
- Fotos podem ser enviadas direto do computador ou celular — o painel reduz o tamanho automaticamente.
- Para tirar um produto do ar sem apagar, desmarque **Mostrar no site**.
- Em qualquer campo de link, digite `whatsapp` para o botão abrir uma conversa no WhatsApp.
- Em **Importar e backup** baixe uma cópia de segurança de vez em quando.

---

## Como está configurado (já feito)

| Item | Situação |
|---|---|
| Projeto Firebase | `laborloja-b2fac` (plano gratuito Spark) |
| Banco de dados | Firestore, região São Paulo (`southamerica-east1`) |
| Login | E-mail/senha. Administrador: `marcelo.teruo.mts@gmail.com` |
| Site publicado | GitHub Pages: https://natanaelinvotec.github.io/laborloja/ |
| Painel | https://natanaelinvotec.github.io/laborloja/admin/ |

**Fotos e PDFs:** o Firebase Storage exige plano pago para projetos novos, então os arquivos enviados pelo painel são guardados no próprio Firestore (divididos em partes de ~700 KB, até 20 MB por arquivo) e ficam em cache no navegador do visitante. Tudo continua gratuito.

### Adicionar outra pessoa ao painel
1. Inclua o e-mail em `assets/js/firebase-config.js` (`emailsAdmin`) **e** em `firestore.rules`.
2. Publique as regras no console: **Firestore → Regras → colar → Publicar**.
3. A pessoa entra em `/admin` → **Primeiro acesso** e cria a própria senha.

### Antes de desligar o WordPress
As fotos iniciais ainda apontam para `laborloja.com.br/wp-content/uploads`. Antes de desligar o site antigo, rode na pasta do projeto:
```bash
node scripts/baixar-imagens.mjs
```
Isso baixa as imagens/PDFs para `assets/uploads/` e atualiza `data/conteudo.json`; depois envie ao GitHub e, no painel, use **Importar e backup → Restaurar de um backup** com o JSON, ou troque as imagens pelo próprio painel.

### Usar o domínio laborloja.com.br
GitHub → Settings → Pages → *Custom domain* → `laborloja.com.br`, e no DNS crie os registros indicados pelo GitHub. Depois adicione o domínio no Firebase em **Authentication → Configurações → Domínios autorizados**.

## Modo demonstração
Se `apiKey` em `firebase-config.js` for apagado, o site lê `data/conteudo.json` e o painel abre **sem senha**, salvando apenas no navegador. Serve para testar localmente:
```bash
python3 -m http.server 8080   # depois abra http://localhost:8080 e http://localhost:8080/admin/
```

## Estrutura
```
index.html, produtos.html, produto.html, categorias.html, pagina.html, orcamento.html
assets/css/style.css           visual do site (cores/fontes vêm do painel)
assets/js/site.js              cabeçalho, rodapé, cartões, lista de orçamento
assets/js/paginas/*.js         uma por página
assets/js/data.js              leitura do Firebase (ou do JSON em modo demo)
assets/js/firebase-config.js   ← colar a configuração aqui
admin/esquemas.js              campos do painel (adicione um campo = 1 linha)
admin/admin.js                 motor do painel
data/conteudo.json             conteúdo inicial / modo demonstração
firestore.rules                ← e-mails administradores
```

## Modelo de dados (Firestore)
| Coleção / documento | Conteúdo |
|---|---|
| `conteudo/tudo` | um único documento com `site` (aparência, contatos, menu, home, rodapé), `produtos`, `categorias` e `paginas` |
| `arquivos/{id}/partes/{000…}` | fotos/PDFs enviados pelo painel, em partes base64 (`arquivo:{id}`) |

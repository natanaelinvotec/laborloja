// Núcleo do site público: monta cabeçalho, rodapé, cartões e a lista de orçamento.
import { carregarDados, ativarArquivos } from "./data.js";

export const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const qs = (n) => new URLSearchParams(location.search).get(n);
const ICONE = {
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  busca: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  coracao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7.5-4.6-9.5-9.3C1.2 8.4 3.4 5 6.9 5c2 0 3.5 1.1 5.1 3 1.6-1.9 3.1-3 5.1-3 3.5 0 5.7 3.4 4.4 6.7C19.5 16.4 12 21 12 21z"/></svg>',
  carrinho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 4h2l2.4 11h11l2-8H6.2"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/></svg>',
  presente: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8zm0 0s2-5 4.5-3.5S15 8 12 8z"/></svg>',
  whats: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.5-.3z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8V6c0-.9.6-1 1-1h3V1h-4C10.1 1 9 3.9 9 5.8V8H6v4h3v11h5V12h3.5l.5-4z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>'
};

let D = null; // dados carregados

/* ---------------- Lista de orçamento (carrinho de cotação) ---------------- */
const CHAVE_LISTA = "laborloja-orcamento";
export function lerLista() { try { return JSON.parse(localStorage.getItem(CHAVE_LISTA) || "[]"); } catch { return []; } }
function gravarLista(l) { try { localStorage.setItem(CHAVE_LISTA, JSON.stringify(l)); } catch {} atualizarContador(); }
export function naLista(id) { return lerLista().some((i) => i.id === id); }
export function alternarLista(id) {
  const l = lerLista();
  const i = l.findIndex((x) => x.id === id);
  if (i >= 0) { l.splice(i, 1); toast("Removido da lista de orçamento"); }
  else { l.push({ id, qtd: 1 }); toast("Adicionado à lista de orçamento"); }
  gravarLista(l);
  return i < 0;
}
export function alterarQtd(id, qtd) { const l = lerLista(); const it = l.find((x) => x.id === id); if (it) it.qtd = Math.max(1, qtd | 0); gravarLista(l); }
export function limparLista() { gravarLista([]); }
function atualizarContador() { document.querySelectorAll("[data-contador]").forEach((e) => { const n = lerLista().length; e.textContent = n; e.hidden = !n; }); }

/**
 * Monta a mensagem de WhatsApp enviada quando o cliente pede cotação.
 * É aqui que se define o "tom" do primeiro contato com o vendedor.
 */
// Segue o roteiro de atendimento B2B: o vendedor já recebe os itens, quem é o
// cliente (empresa/CNPJ/cidade, para calcular frete e faturamento) e o que ele
// espera na resposta. *texto* = negrito no WhatsApp.
export function montarMensagemOrcamento(itens, cliente = {}) {
  const loja = D?.site?.geral?.nomeLoja || "LaborLoja";
  const fechamento = D?.site?.contato?.mensagemOrcamento || "Aguardo o retorno com valores, prazo de entrega e condições de pagamento. Obrigado!";
  const dados = [
    ["Nome", cliente.nome], ["Empresa/Laboratório", cliente.empresa], ["CNPJ/CPF", cliente.cnpj],
    ["Cidade/UF", cliente.cidade], ["Telefone/E-mail", cliente.contato]
  ].filter(([, v]) => v && String(v).trim()).map(([k, v]) => `${k}: ${String(v).trim()}`);
  return [
    `Olá! Vim pelo site da ${loja} e gostaria de um orçamento.`,
    "", "*Produtos:*", ...itens.map((it) => `• ${it.qtd}x ${it.nome}`),
    ...(dados.length ? ["", "*Meus dados:*", ...dados] : []),
    ...(cliente.obs?.trim() ? ["", `*Observações:* ${cliente.obs.trim()}`] : []),
    "", fechamento
  ].join("\n");
}

export function linkWhats(texto = "", numero) {
  const n = String(numero || D?.site?.contato?.whatsapp || "").replace(/\D/g, "");
  return `https://wa.me/${n}${texto ? "?text=" + encodeURIComponent(texto) : ""}`;
}
/** Converte o valor "whatsapp" usado no painel em link real. */
export function resolverLink(link, textoWhats = "Olá! Vim pelo site e gostaria de mais informações.") {
  if (!link) return "#";
  if (link === "whatsapp") return linkWhats(textoWhats);
  return link;
}

export function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
  t.textContent = msg; t.classList.add("visivel");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("visivel"), 2200);
}

/* ---------------- Ajudantes de catálogo ---------------- */
export const produtosAtivos = () => D.produtos.filter((p) => p.ativo !== false);
export const produto = (id) => D.produtos.find((p) => p.id === id);
export const categoria = (id) => D.categorias.find((c) => c.id === id);
export const nomeCats = (p) => (p.categorias || []).map((c) => categoria(c)?.nome).filter(Boolean).join(", ");
export function filhosDe(id) { return D.categorias.filter((c) => c.pai === id); }
export function idsComDescendentes(id) { const r = [id]; filhosDe(id).forEach((f) => r.push(...idsComDescendentes(f.id))); return r; }
export function produtosDaCategoria(id) { const ids = idsComDescendentes(id); return produtosAtivos().filter((p) => (p.categorias || []).some((c) => ids.includes(c))); }

/** Botão principal do produto: PDF (folder), WhatsApp (cotação) ou página do produto. */
export function botaoProduto(p, classe = "btn") {
  if (p.pdf) return `<a class="${classe}" href="${esc(p.pdf)}" target="_blank" rel="noopener">${esc(p.botao || "Baixe Nosso Folder")}</a>`;
  return `<a class="${classe}" href="produto.html?p=${encodeURIComponent(p.id)}">${esc(p.botao || "Sob consulta")}</a>`;
}
export function botaoCoracao(p) {
  return `<button class="coracao ${naLista(p.id) ? "ativo" : ""}" data-lista="${esc(p.id)}" aria-label="Adicionar à lista de orçamento" title="Adicionar à lista de orçamento">${ICONE.coracao}</button>`;
}
export function cartaoProduto(p) {
  return `<article class="cartao-prod">
    <div class="img">${botaoCoracao(p)}<a href="produto.html?p=${encodeURIComponent(p.id)}"><img loading="lazy" src="${esc(p.imagens?.[0] || "")}" alt="${esc(p.nome)}"></a></div>
    <div class="categorias-mini">${esc(nomeCats(p))}</div>
    <h4><a href="produto.html?p=${encodeURIComponent(p.id)}">${esc(p.nome)}</a></h4>
    ${botaoProduto(p)}
  </article>`;
}
export function linhaProduto(p) {
  return `<article class="prod-linha">
    <div class="img">${botaoCoracao(p)}<a href="produto.html?p=${encodeURIComponent(p.id)}"><img loading="lazy" src="${esc(p.imagens?.[0] || "")}" alt="${esc(p.nome)}"></a></div>
    <div><div class="categorias-mini">${esc(nomeCats(p))}</div><h4><a href="produto.html?p=${encodeURIComponent(p.id)}">${esc(p.nome)}</a></h4>${p.pdf ? "" : botaoProduto(p)}</div>
  </article>`;
}

/* ---------------- Cabeçalho e rodapé ---------------- */
function arvoreCategorias(cls = "") {
  const raiz = D.categorias.filter((c) => !c.pai);
  return raiz.map((c) => `<a class="${cls}" href="produtos.html?cat=${c.id}">${esc(c.nome)}</a>` +
    filhosDe(c.id).map((f) => `<a class="sub" href="produtos.html?cat=${f.id}">${esc(f.nome)}</a>`).join("")).join("");
}
function cabecalho() {
  const g = D.site.geral, atual = location.pathname.split("/").pop() || "index.html";
  return `<header class="topo"><div class="container">
    <div class="topo-linha">
      <a class="logo" href="index.html"><img src="${esc(g.logo)}" alt="${esc(g.nomeLoja)}"></a>
      <div class="catalogo-wrap"><button class="btn-catalogo" aria-expanded="false">${ICONE.menu.replace("<svg", '<svg width="18" height="18"')}<span>Catálogo</span></button>
        <nav class="catalogo-menu">${arvoreCategorias()}</nav></div>
      <form class="busca" action="produtos.html" role="search">
        <input name="q" placeholder="Buscar produtos..." aria-label="Buscar" value="${esc(qs("q") || "")}">
        <select name="cat" aria-label="Categoria"><option value="">Todas as categorias</option>${D.categorias.filter((c) => !c.pai).map((c) => `<option value="${c.id}">${esc(c.nome)}</option>`).join("")}</select>
        <button aria-label="Buscar">${ICONE.busca}</button>
      </form>
      <div class="icones-topo">
        <a class="icone" href="orcamento.html" title="Lista de orçamento">${ICONE.coracao}<span class="contador" data-contador hidden></span></a>
        <a class="icone" href="orcamento.html" title="Pedir cotação">${ICONE.carrinho}</a>
      </div>
      <button class="menu-mobile" aria-label="Abrir menu">${ICONE.menu.replace("<svg", '<svg width="26" height="26"')}</button>
    </div>
    <div class="nav-linha">
      <a class="nav-ofertas" href="${esc(g.linkOfertas || "produtos.html")}"><i>%</i>${esc(g.rotuloOfertas || "OFERTAS")}</a>
      <nav class="nav-principal">${D.site.menu.map((m) => `<a href="${esc(resolverLink(m.link))}" class="${m.link === atual ? "ativo" : ""}">${esc(m.texto)}</a>`).join("")}</nav>
      ${g.avisoTopo ? `<div class="aviso-topo">${ICONE.presente}${esc(g.avisoTopo)}</div>` : ""}
    </div>
  </div></header>`;
}
function rodape() {
  const r = D.site.rodape, c = D.site.contato, g = D.site.geral;
  const redes = [c.facebook && `<a href="${esc(c.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${ICONE.facebook}</a>`, c.instagram && `<a href="${esc(c.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${ICONE.instagram}</a>`].filter(Boolean).join("");
  return `<section class="faixa"><div class="container">
      <div><h3>${esc(r.tituloRedes)}</h3><div class="redes">${redes}</div></div>
      <div><h3>${esc(r.tituloNovidades)}</h3><p>${esc(r.textoNovidades || "")}</p>
        <form class="form-news" data-news><input type="email" required placeholder="Seu e-mail" aria-label="Seu e-mail"><button class="btn escuro">Assinar</button></form></div>
    </div></section>
    <footer class="rodape"><div class="container rodape-grade">
      <div><img class="logo-rodape" src="${esc(g.logoRodape || g.logo)}" alt="${esc(g.nomeLoja)}"><div class="slogan">${esc(g.slogan)}</div></div>
      ${r.colunas.map((col) => `<div><h4>${esc(col.titulo)}</h4><ul>${col.links.map((l) => `<li><a href="${esc(resolverLink(l.link))}">${esc(l.texto)}</a></li>`).join("")}</ul></div>`).join("")}
    </div>
    <div class="rodape-base"><div class="container"><span>${esc(r.copyright)} ${new Date().getFullYear()}.</span>
      <div class="pagamentos"><span>${esc(c.endereco)}</span>${(r.pagamentos || []).map((s) => `<img src="${esc(s)}" alt="">`).join("")}</div></div></div>
    </footer>
    <a class="whats-flutuante" href="${linkWhats("Olá! Vim pelo site da " + g.nomeLoja + ".")}" target="_blank" rel="noopener"><i>${ICONE.whats}</i><span>${esc(c.textoBotaoWhatsapp || "Whatsapp Online")}</span></a>
    <button class="voltar-topo" aria-label="Voltar ao topo">▲</button>`;
}

function aplicarTema() {
  const g = D.site.geral, r = document.documentElement.style;
  if (g.corPrincipal) r.setProperty("--cor-principal", g.corPrincipal);
  if (g.corTexto) r.setProperty("--cor-texto", g.corTexto);
  if (g.corFundoCinza) r.setProperty("--cor-cinza", g.corFundoCinza);
  if (g.corRodape) r.setProperty("--cor-rodape", g.corRodape);
  const fontes = [g.fonteTitulos, g.fonteTexto].filter(Boolean);
  if (fontes.length) {
    r.setProperty("--fonte-titulos", `"${g.fonteTitulos}",system-ui,sans-serif`);
    r.setProperty("--fonte-texto", `"${g.fonteTexto}",system-ui,sans-serif`);
    const l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?" + fontes.map((f) => "family=" + encodeURIComponent(f) + ":wght@400;500;600;700").join("&") + "&display=swap";
    document.head.append(l);
  }
  if (g.favicon || g.logo) { const f = document.createElement("link"); f.rel = "icon"; f.href = g.favicon || g.logo; document.head.append(f); }
}

function ligarEventos() {
  document.addEventListener("click", (e) => {
    const cor = e.target.closest("[data-lista]");
    if (cor) { e.preventDefault(); const on = alternarLista(cor.dataset.lista); document.querySelectorAll(`[data-lista="${CSS.escape(cor.dataset.lista)}"]`).forEach((b) => b.classList.toggle("ativo", on)); return; }
    const cat = document.querySelector(".catalogo-wrap");
    if (e.target.closest(".btn-catalogo")) { cat.classList.toggle("aberto"); return; }
    if (cat && !e.target.closest(".catalogo-wrap")) cat.classList.remove("aberto");
    if (e.target.closest(".menu-mobile")) document.querySelector(".topo").classList.toggle("menu-aberto");
    if (e.target.closest(".voltar-topo")) scrollTo({ top: 0 });
  });
  document.addEventListener("submit", (e) => {
    if (e.target.matches("[data-news]")) {
      e.preventDefault();
      const email = e.target.querySelector("input").value;
      open(linkWhats(`Olá! Quero receber as novidades da ${D.site.geral.nomeLoja}. Meu e-mail: ${email}`), "_blank");
      e.target.reset();
    }
  });
  const topo = document.querySelector(".voltar-topo");
  addEventListener("scroll", () => topo?.classList.toggle("visivel", scrollY > 500), { passive: true });
}

/** Inicia uma página: carrega dados, desenha cabeçalho/rodapé e chama render(main, dados). */
export async function iniciarPagina(render) {
  const main = document.querySelector("main");
  main.innerHTML = '<div class="carregando">Carregando…</div>';
  try {
    D = await carregarDados();
    aplicarTema();
    document.body.insertAdjacentHTML("afterbegin", cabecalho());
    document.body.insertAdjacentHTML("beforeend", rodape());
    main.innerHTML = "";
    ativarArquivos(document.body); // fotos/PDFs enviados pelo painel ("arquivo:…")
    await render(main, D);
    ligarEventos();
    atualizarContador();
  } catch (e) {
    console.error(e);
    main.innerHTML = '<div class="carregando">Não foi possível carregar o conteúdo. Tente novamente em instantes.</div>';
  }
}

/** Carrossel simples com pontinhos (usado na home). */
export function ativarCarrossel(el) {
  const trilho = el.querySelector(".carrossel-trilho"), pontos = el.querySelector(".pontos");
  if (!trilho || !pontos) return;
  const paginas = () => Math.max(1, Math.round(trilho.scrollWidth / trilho.clientWidth));
  const desenhar = () => {
    const n = paginas(), atual = Math.round(trilho.scrollLeft / trilho.clientWidth);
    pontos.innerHTML = n < 2 ? "" : Array.from({ length: n }, (_, i) => `<button aria-label="Página ${i + 1}" class="${i === atual ? "ativo" : ""}" data-i="${i}"></button>`).join("");
  };
  pontos.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) trilho.scrollTo({ left: b.dataset.i * trilho.clientWidth, behavior: "smooth" }); });
  trilho.addEventListener("scroll", () => { clearTimeout(trilho._t); trilho._t = setTimeout(desenhar, 80); }, { passive: true });
  addEventListener("resize", desenhar);
  desenhar();
}

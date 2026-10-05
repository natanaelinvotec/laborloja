// Painel administrativo LaborLoja — tudo que aparece no site é editável aqui.
import { firebase, carregarDados, carregarSeed, limparDemo, salvarTudo, enviarArquivoFirestore, ativarArquivos } from "../assets/js/data.js";
import { firebaseAtivo, emailsAdmin } from "../assets/js/firebase-config.js";
import { esquemas } from "./esquemas.js";

const $ = (s, el = document) => el.querySelector(s);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const clone = (o) => JSON.parse(JSON.stringify(o));
export const slug = (s = "") => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&[a-z#0-9]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "item";
const pegar = (o, caminho) => caminho.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
const colocar = (o, caminho, v) => { const ks = caminho.split("."); const ult = ks.pop(); const alvo = ks.reduce((a, k) => (a[k] ??= {}), o); alvo[ult] = v; };

let D = null;        // conteúdo completo
let FB = null;       // firebase (ou null no modo demonstração)
let secaoAtual = "inicio";
let sujo = false;    // alterações não salvas nas seções do "site"

/* ======================= Utilidades de interface ======================= */
function toast(msg, tipo = "") {
  let t = $(".toast"); if (!t) { t = h('<div class="toast" role="status"></div>'); document.body.append(t); }
  t.className = "toast visivel " + tipo; t.textContent = msg;
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("visivel"), 2800);
}
function marcarSujo(v = true) { sujo = v; $(".salvar-barra")?.classList.toggle("visivel", v); }
addEventListener("beforeunload", (e) => { if (sujo) { e.preventDefault(); e.returnValue = ""; } });

/* ======================= Envio de arquivos ======================= */
async function comprimirImagem(arquivo, max = 1600) {
  if (!arquivo.type.startsWith("image/") || arquivo.type === "image/svg+xml" || arquivo.type === "image/gif") return arquivo;
  const bmp = await createImageBitmap(arquivo);
  const escala = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * escala); c.height = Math.round(bmp.height * escala);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  const tipo = arquivo.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise((r) => c.toBlob(r, tipo, 0.85));
  return blob && blob.size < arquivo.size ? new File([blob], arquivo.name, { type: tipo }) : arquivo;
}
async function enviarArquivo(arquivo) {
  const f = await comprimirImagem(arquivo);
  if (FB) {
    if (f.size > 20e6) throw new Error("arquivo muito grande (máx. 20 MB)");
    return enviarArquivoFirestore(f, (p) => p < 1 && toast(`Enviando… ${Math.round(p * 100)}%`));
  }
  if (f.size > 1.5e6) toast("Modo demonstração: arquivo grande. Configure o Firebase para enviar arquivos de verdade.", "erro");
  return new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(f); });
}
function escolherArquivo(aceita, multiplo = false) {
  return new Promise((ok) => {
    const i = h(`<input type="file" accept="${aceita}" ${multiplo ? "multiple" : ""} hidden>`);
    i.onchange = () => { ok([...i.files]); i.remove(); };
    document.body.append(i); i.click();
  });
}

/* ======================= Construtor de campos ======================= */
// Cada definição: { k: "caminho.no.objeto", t: tipo, rot: "Rótulo", dica, largo, ... }
function sugestoesLinks() {
  return [
    ["whatsapp", "Abrir conversa no WhatsApp"], ["index.html", "Página inicial"], ["produtos.html", "Todos os produtos"],
    ["categorias.html", "Categorias"], ["orcamento.html", "Lista de orçamento"],
    ...D.paginas.map((p) => [`pagina.html?p=${p.id}`, "Página: " + p.titulo]),
    ...D.categorias.map((c) => [`produtos.html?cat=${c.id}`, "Categoria: " + c.nome]),
    ...D.produtos.map((p) => [`produto.html?p=${p.id}`, "Produto: " + p.nome])
  ];
}

function campo(def, obj, aoMudar) {
  const valor = pegar(obj, def.k);
  const muda = (v) => { colocar(obj, def.k, v); aoMudar?.(def.k, v); };
  const wrap = h(`<div class="campo ${def.largo || ["area", "rico", "lista", "galeria", "produtos", "categorias"].includes(def.t) ? "largo" : ""}">
    ${def.t === "check" ? "" : `<label>${esc(def.rot)}</label>`}${def.dica ? `<span class="dica">${esc(def.dica)}</span>` : ""}</div>`);
  let el;
  switch (def.t) {
    case "area":
      el = h(`<textarea></textarea>`); el.value = valor ?? ""; el.oninput = () => muda(el.value); break;
    case "linhas":
      el = h(`<textarea placeholder="Uma por linha"></textarea>`); el.value = (valor || []).join("\n"); el.oninput = () => muda(el.value.split("\n").map((s) => s.trim()).filter(Boolean)); wrap.classList.add("largo"); break;
    case "numero":
      el = h(`<input type="number">`); el.value = valor ?? 0; el.oninput = () => muda(+el.value); break;
    case "check":
      el = h(`<label class="check"><input type="checkbox"> ${esc(def.rot)}</label>`); $("input", el).checked = !!valor; $("input", el).onchange = (e) => muda(e.target.checked); break;
    case "cor":
      el = h(`<div class="cor"><input type="color"><input type="text" style="max-width:130px"></div>`);
      const [c1, c2] = el.querySelectorAll("input"); c1.value = valor || "#000000"; c2.value = valor || "";
      c1.oninput = () => { c2.value = c1.value; muda(c1.value); }; c2.oninput = () => { if (/^#[0-9a-f]{6}$/i.test(c2.value)) { c1.value = c2.value; muda(c2.value); } }; break;
    case "select": {
      const ops = typeof def.opcoes === "function" ? def.opcoes() : def.opcoes;
      el = h(`<select>${ops.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join("")}</select>`); el.value = valor ?? ""; el.onchange = () => muda(el.value); break;
    }
    case "link": {
      const id = "dl-" + Math.random().toString(36).slice(2);
      el = h(`<div><input type="text" list="${id}" placeholder="Escolha da lista ou cole um endereço"><datalist id="${id}">${sugestoesLinks().map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join("")}</datalist></div>`);
      $("input", el).value = valor ?? ""; $("input", el).oninput = (e) => muda(e.target.value);
      if (!def.dica) wrap.querySelector("label").insertAdjacentHTML("afterend", '<span class="dica">Comece a digitar para ver sugestões. Use “whatsapp” para abrir conversa.</span>');
      break;
    }
    case "imagem": case "arquivo": {
      const ehImg = def.t === "imagem";
      el = h(`<div class="imagem-campo">${ehImg ? '<div class="prev">sem imagem</div>' : ""}<div class="acoes">
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn sec peq" data-env>${ehImg ? "📷 Enviar imagem" : "📄 Enviar arquivo (PDF)"}</button><button type="button" class="btn perigo peq" data-rem>Remover</button></div>
        <input type="url" class="input" placeholder="…ou cole o endereço (URL)"></div></div>`);
      const inp = $("input", el), prev = $(".prev", el);
      const mostra = (v) => { inp.value = v || ""; if (prev) { prev.style.backgroundImage = v ? `url("${v}")` : ""; prev.textContent = v ? "" : "sem imagem"; } };
      mostra(valor); inp.oninput = () => { mostra(inp.value); muda(inp.value); };
      $("[data-rem]", el).onclick = () => { mostra(""); muda(""); };
      $("[data-env]", el).onclick = async (e) => {
        const [f] = await escolherArquivo(ehImg ? "image/*" : "application/pdf,image/*"); if (!f) return;
        e.target.disabled = true; e.target.textContent = "Enviando…";
        try { const url = await enviarArquivo(f); mostra(url); muda(url); toast("Arquivo enviado ✔", "ok"); }
        catch (err) { console.error(err); toast("Falha no envio: " + err.message, "erro"); }
        e.target.disabled = false; e.target.textContent = ehImg ? "📷 Enviar imagem" : "📄 Enviar arquivo (PDF)";
      };
      break;
    }
    case "galeria": {
      el = h(`<div class="galeria"></div>`);
      const lista = () => pegar(obj, def.k) || [];
      const desenhar = () => {
        el.innerHTML = lista().map((s, i) => `<div class="item" style="background-image:url('${esc(s)}')">${i === 0 ? '<span class="capa">capa</span>' : `<span class="capa" style="background:#555;cursor:pointer" data-capa="${i}">tornar capa</span>`}<button type="button" data-i="${i}" aria-label="Remover">×</button></div>`).join("") + '<button type="button" class="add">+ Adicionar fotos</button>';
        el.querySelectorAll("[data-i]").forEach((b) => b.onclick = () => { const l = lista(); l.splice(+b.dataset.i, 1); muda(l); desenhar(); });
        el.querySelectorAll("[data-capa]").forEach((b) => b.onclick = () => { const l = lista(); const [x] = l.splice(+b.dataset.capa, 1); l.unshift(x); muda(l); desenhar(); });
        $(".add", el).onclick = async (e) => {
          const fs = await escolherArquivo("image/*", true); if (!fs.length) return;
          e.target.textContent = "Enviando…"; e.target.disabled = true;
          try { const urls = []; for (const f of fs) urls.push(await enviarArquivo(f)); muda([...lista(), ...urls]); toast("Fotos enviadas ✔", "ok"); }
          catch (err) { toast("Falha no envio: " + err.message, "erro"); }
          desenhar();
        };
      };
      desenhar(); break;
    }
    case "rico": el = editorRico(valor || "", muda); break;
    case "categorias": {
      const sel = new Set(valor || []);
      el = h(`<div class="checks">${D.categorias.map((c) => `<label class="${c.pai ? "sub" : ""}"><input type="checkbox" value="${esc(c.id)}" ${sel.has(c.id) ? "checked" : ""}> ${esc(c.nome)}</label>`).join("")}</div>`);
      el.onchange = () => muda([...el.querySelectorAll("input:checked")].map((i) => i.value)); break;
    }
    case "produtos": {
      const sel = new Set(valor || []);
      el = h(`<div><input class="input" placeholder="Filtrar produtos…" style="margin-bottom:8px"><div class="checks">${D.produtos.map((p) => `<label><input type="checkbox" value="${esc(p.id)}" ${sel.has(p.id) ? "checked" : ""}> ${esc(p.nome)}</label>`).join("")}</div></div>`);
      $(".checks", el).onchange = () => muda([...el.querySelectorAll(".checks input:checked")].map((i) => i.value));
      $("input.input", el).oninput = (e) => { const t = e.target.value.toLowerCase(); el.querySelectorAll(".checks label").forEach((l) => l.hidden = !l.textContent.toLowerCase().includes(t)); };
      break;
    }
    case "lista": el = listaRepetivel(def, obj, aoMudar); break;
    default:
      el = h(`<input type="text">`); el.value = valor ?? ""; el.oninput = () => muda(el.value);
  }
  wrap.append(el);
  return wrap;
}

function listaRepetivel(def, obj, aoMudar) {
  const box = h(`<div><div class="lista-itens"></div><button type="button" class="btn sec peq" style="margin-top:12px">+ Adicionar ${esc(def.item || "item")}</button></div>`);
  const itens = () => pegar(obj, def.k) || (colocar(obj, def.k, []), pegar(obj, def.k));
  const avisa = () => aoMudar?.(def.k, itens());
  const desenhar = () => {
    const alvo = $(".lista-itens", box); alvo.innerHTML = "";
    itens().forEach((it, i) => {
      const card = h(`<div class="item-rep"><div class="topo-item"><strong>${esc(def.item || "Item")} ${i + 1}${def.titulo ? " — " + esc(pegar(it, def.titulo) || "") : ""}</strong>
        <div><button type="button" class="btn sec peq" data-a="sobe" title="Mover para cima">↑</button><button type="button" class="btn sec peq" data-a="desce" title="Mover para baixo">↓</button><button type="button" class="btn perigo peq" data-a="rem">Remover</button></div></div><div class="campos"></div></div>`);
      def.campos.forEach((c) => $(".campos", card).append(campo(c, it, avisa)));
      card.querySelectorAll("[data-a]").forEach((b) => b.onclick = () => {
        const l = itens(), a = b.dataset.a;
        if (a === "rem") { if (!confirm("Remover este item?")) return; l.splice(i, 1); }
        if (a === "sobe" && i > 0) [l[i - 1], l[i]] = [l[i], l[i - 1]];
        if (a === "desce" && i < l.length - 1) [l[i + 1], l[i]] = [l[i], l[i + 1]];
        avisa(); desenhar();
      });
      alvo.append(card);
    });
  };
  box.querySelector(":scope > button").onclick = () => { itens().push(clone(def.novo || {})); avisa(); desenhar(); };
  desenhar();
  return box;
}

function editorRico(html, muda) {
  const el = h(`<div class="editor"><div class="ferramentas">
    <button type="button" data-c="bold" title="Negrito"><b>N</b></button><button type="button" data-c="italic" title="Itálico"><i>I</i></button>
    <button type="button" data-c="formatBlock" data-v="h2" title="Título">T</button><button type="button" data-c="formatBlock" data-v="h3" title="Subtítulo">t</button><button type="button" data-c="formatBlock" data-v="p" title="Parágrafo">¶</button>
    <button type="button" data-c="insertUnorderedList" title="Lista">• Lista</button><button type="button" data-c="createLink" title="Link">🔗 Link</button>
    <button type="button" data-img title="Imagem">🖼 Imagem</button><button type="button" data-c="removeFormat" title="Limpar formatação">⌫ Limpar</button>
    <button type="button" data-html title="Editar código HTML">&lt;/&gt;</button></div>
    <div class="area" contenteditable="true"></div></div>`);
  const area = $(".area", el); area.innerHTML = html;
  const sync = () => muda(area.innerHTML);
  area.oninput = sync;
  el.querySelectorAll("[data-c]").forEach((b) => b.onclick = () => {
    area.focus();
    let v = b.dataset.v;
    if (b.dataset.c === "createLink") { v = prompt("Endereço do link (https://…)"); if (!v) return; }
    document.execCommand(b.dataset.c, false, v); sync();
  });
  $("[data-img]", el).onclick = async () => {
    const [f] = await escolherArquivo("image/*"); if (!f) return;
    toast("Enviando imagem…"); const url = await enviarArquivo(f);
    area.focus(); document.execCommand("insertImage", false, url); sync();
  };
  $("[data-html]", el).onclick = () => {
    if (area.tagName === "DIV" && !area.dataset.codigo) {
      const ta = h(`<textarea class="area" style="width:100%;border:0;font-family:monospace;font-size:13px;min-height:260px"></textarea>`);
      ta.value = area.innerHTML; ta.dataset.codigo = "1"; ta.oninput = () => { area.innerHTML = ta.value; sync(); };
      area.replaceWith(ta); el._ta = ta;
    } else if (el._ta) { el._ta.replaceWith(area); el._ta = null; }
  };
  return el;
}

/* ======================= Persistência ======================= */
// Todo o conteúdo fica num único documento: salvar = gravar o conjunto inteiro.
async function salvarSite() { await salvarTudo(D); D.publicado = !!FB; }
async function salvarItem(colecao, item) {
  const lista = D[colecao]; const i = lista.findIndex((x) => x.id === item.id);
  const anterior = i >= 0 ? lista[i] : null;
  if (i >= 0) lista[i] = item; else lista.push(item);
  try { await salvarSite(); } catch (e) { if (anterior) lista[i] = anterior; else lista.pop(); throw e; }
}
async function excluirItem(colecao, id) {
  const antes = D[colecao];
  D[colecao] = antes.filter((x) => x.id !== id);
  try { await salvarSite(); } catch (e) { D[colecao] = antes; throw e; }
}
/** Grava TODO o conteúdo de uma vez (publicação inicial, importações, backups). */
async function publicarTudo(log = () => {}) {
  await salvarSite();
  log(FB ? "Conteúdo gravado no Firebase." : "Salvo no navegador (modo demonstração).");
}

/* ======================= Seções ======================= */
const SECOES = [
  ["inicio", "🏠", "Início"],
  ["aparencia", "🎨", "Aparência"],
  ["contato", "📞", "Contato e redes"],
  ["home", "🧩", "Página inicial"],
  ["produtos", "📦", "Produtos"],
  ["categorias", "🗂️", "Categorias"],
  ["paginas", "📄", "Páginas"],
  ["menu", "🧭", "Menu e rodapé"],
  ["ferramentas", "🛠️", "Importar e backup"],
  ["senha", "🔑", "Mudar senha"]
];

function montarLayout(usuario) {
  $("#app").innerHTML = `<div class="layout">
    <aside class="lateral"><div class="marca"><img src="${esc(D.site.geral.logo)}" alt="">Painel</div>
      <nav>${SECOES.map(([id, ic, t]) => `<button data-sec="${id}"><span class="ic">${ic}</span>${t}</button>`).join("")}</nav>
      <div class="rodape-lat"><a class="btn sec peq" href="../index.html" target="_blank" style="color:#cfd6df;background:none;border-color:#333c48">↗ Ver o site</a>
        <span>${FB ? "Conectado: " + esc(usuario?.email || "") : "Modo demonstração"}</span>${FB ? '<button data-sair>Sair</button>' : ""}</div>
    </aside>
    <main class="principal"></main></div>
    <div class="salvar-barra"><span>Você tem alterações não salvas.</span><div style="display:flex;gap:10px"><button class="btn sec" data-descartar>Descartar</button><button class="btn ok" data-salvar>💾 Salvar alterações</button></div></div>`;
  $("#app").addEventListener("click", (e) => {
    const b = e.target.closest("[data-sec]"); if (b) { abrir(b.dataset.sec); $(".lateral").classList.remove("aberta"); }
    if (e.target.closest("[data-menu-mob]")) $(".lateral").classList.toggle("aberta");
  });
  $("[data-sair]")?.addEventListener("click", () => FB.authMod.signOut(FB.auth));
  $("[data-salvar]").onclick = async (e) => {
    e.target.disabled = true; e.target.textContent = "Salvando…";
    try { await salvarSite(); marcarSujo(false); toast("Alterações publicadas no site ✔", "ok"); }
    catch (err) { console.error(err); toast("Erro ao salvar: " + err.message, "erro"); }
    e.target.disabled = false; e.target.textContent = "💾 Salvar alterações";
  };
  $("[data-descartar]").onclick = async () => { if (!confirm("Descartar as alterações não salvas?")) return; D = await carregarDados(); marcarSujo(false); abrir(secaoAtual, true); };
  abrir(location.hash.slice(1) || "inicio");
}

function cabecalhoSecao(titulo, sub, extra = "") {
  return `<div class="cabecalho"><div style="display:flex;gap:12px;align-items:center"><button class="btn sec menu-mob" data-menu-mob>☰</button><div><h1>${esc(titulo)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div></div>${extra}</div>`;
}

function abrir(id, forcar = false) {
  if (!forcar && sujo && id !== secaoAtual && !confirm("Há alterações não salvas. Sair desta seção mesmo assim? (Elas continuam guardadas até você salvar ou descartar.)")) return;
  secaoAtual = id; location.hash = id;
  document.querySelectorAll("[data-sec]").forEach((b) => b.classList.toggle("ativo", b.dataset.sec === id));
  const main = $(".principal"); main.innerHTML = ""; main.onclick = null; scrollTo(0, 0);
  ({ inicio: secInicio, produtos: () => secColecao("produtos"), categorias: () => secColecao("categorias"), paginas: () => secColecao("paginas"), ferramentas: secFerramentas, senha: secSenha }[id] || (() => secSite(id)))(main);
}

function secInicio(main) {
  const ativos = D.produtos.filter((p) => p.ativo !== false).length;
  main.innerHTML = cabecalhoSecao(`Olá! 👋`, "O que você quer atualizar hoje?") + `
    ${FB ? "" : `<div class="aviso">Você está no <b>modo demonstração</b>: as alterações ficam salvas apenas neste navegador. Para publicar de verdade, siga o passo a passo do arquivo <b>LEIA-ME.md</b> (configurar o Firebase).</div>`}
    <div class="grade-inicio">
      <div class="cartao" style="margin:0"><div class="num">${ativos}</div>produtos no site</div>
      <div class="cartao" style="margin:0"><div class="num">${D.categorias.length}</div>categorias</div>
      <div class="cartao" style="margin:0"><div class="num">${D.paginas.length}</div>páginas</div>
    </div>
    <div class="grade-inicio">
      ${[["produtos", "📦", "Adicionar ou editar produtos", "Fotos, descrição, folder em PDF"], ["home", "🧩", "Mudar a página inicial", "Banner principal, promoções, destaques"], ["aparencia", "🎨", "Logo e cores", "Identidade visual do site"], ["contato", "📞", "WhatsApp e redes", "Números, e-mail, endereço"], ["paginas", "📄", "Textos das páginas", "Quem somos, contato, privacidade"], ["ferramentas", "🛠️", "Importar do WordPress", "Trazer descrições e textos do site antigo"]]
        .map(([s, ic, t, d]) => `<button class="atalho" data-sec="${s}"><span class="ic">${ic}</span><b>${t}</b><span>${d}</span></button>`).join("")}
    </div>`;
}

function secSite(id) {
  const main = $(".principal");
  const esq = esquemas[id];
  main.innerHTML = cabecalhoSecao(esq.titulo, esq.sub, `<a class="btn sec" href="../index.html" target="_blank">↗ Ver o site</a>`);
  esq.cartoes.forEach((c) => {
    const card = h(`<section class="cartao"><h2>${esc(c.titulo)}</h2>${c.ajuda ? `<p class="ajuda">${esc(c.ajuda)}</p>` : '<p class="ajuda"></p>'}<div class="campos"></div></section>`);
    c.campos.forEach((def) => $(".campos", card).append(campo(def, D.site, () => marcarSujo())));
    main.append(card);
  });
}

/* ---------- Coleções (produtos, categorias, páginas) ---------- */
function secColecao(col) {
  const main = $(".principal"), cfg = esquemas[col];
  main.innerHTML = cabecalhoSecao(cfg.titulo, cfg.sub, `<button class="btn" data-novo>+ ${esc(cfg.novoRotulo)}</button>`) +
    `<div class="barra"><input class="input" data-busca placeholder="🔎 Buscar…">${col === "produtos" ? `<select class="input" data-filtro style="max-width:240px"><option value="">Todas as categorias</option>${D.categorias.map((c) => `<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join("")}</select>` : ""}</div>
    <table class="tabela"><thead><tr>${cfg.colunas.map((c) => `<th class="${c.mob === false ? "esconde-mob" : ""}">${c.rot}</th>`).join("")}<th></th></tr></thead><tbody></tbody></table>`;
  const desenhar = () => {
    const t = ($("[data-busca]").value || "").toLowerCase(), f = $("[data-filtro]")?.value;
    const lista = D[col].filter((x) => JSON.stringify(x).toLowerCase().includes(t) && (!f || x.categorias?.includes(f)));
    $("tbody", main).innerHTML = lista.map((x) => `<tr>${cfg.colunas.map((c) => `<td class="${c.mob === false ? "esconde-mob" : ""}">${c.v(x, D)}</td>`).join("")}
      <td style="text-align:right;white-space:nowrap"><button class="btn sec peq" data-editar="${esc(x.id)}">✏️ Editar</button></td></tr>`).join("") || `<tr><td colspan="9" style="text-align:center;color:#6b7785;padding:30px">Nada encontrado.</td></tr>`;
  };
  desenhar();
  $("[data-busca]").oninput = desenhar; $("[data-filtro]") && ($("[data-filtro]").onchange = desenhar);
  // onclick (e não addEventListener): <main> é reaproveitado entre seções e não pode acumular ouvintes
  main.onclick = (e) => {
    const b = e.target.closest("[data-editar]"); if (b) editarItem(col, D[col].find((x) => x.id === b.dataset.editar), desenhar);
    if (e.target.closest("[data-novo]")) editarItem(col, null, desenhar);
  };
}

function editarItem(col, original, aoFechar) {
  const cfg = esquemas[col], novo = !original;
  const item = novo ? clone(cfg.novo) : clone(original);
  const fundo = h(`<div class="modal-fundo"><div class="modal" role="dialog" aria-modal="true">
    <header><h2>${novo ? esc(cfg.novoRotulo) : "Editar: " + esc(item[cfg.campoTitulo] || "")}</h2><button class="btn sec peq" data-fechar>✕ Fechar</button></header>
    <div class="corpo"></div>
    <footer>${novo ? "<span></span>" : `<button class="btn perigo" data-excluir>🗑 Excluir</button>`}<div style="display:flex;gap:10px">${!novo && cfg.link ? `<a class="btn sec" target="_blank" href="../${cfg.link(item)}">↗ Ver no site</a>` : ""}<button class="btn ok" data-salvar-item>💾 Salvar</button></div></footer>
  </div></div>`);
  let mudou = false;
  cfg.cartoes.forEach((c) => {
    const card = h(`<section class="cartao"><h2>${esc(c.titulo)}</h2>${c.ajuda ? `<p class="ajuda">${esc(c.ajuda)}</p>` : '<p class="ajuda"></p>'}<div class="campos"></div></section>`);
    c.campos.forEach((def) => $(".campos", card).append(campo(def, item, () => (mudou = true))));
    $(".corpo", fundo).append(card);
  });
  const fechar = (forcar) => { if (!forcar && mudou && !confirm("Fechar sem salvar?")) return; fundo.remove(); aoFechar?.(); };
  fundo.onclick = (e) => { if (e.target === fundo || e.target.closest("[data-fechar]")) fechar(); };
  $("[data-salvar-item]", fundo).onclick = async (e) => {
    const titulo = item[cfg.campoTitulo]?.trim();
    if (!titulo) { toast(`Preencha o campo “${cfg.rotuloTitulo}”.`, "erro"); return; }
    if (novo) { let id = slug(titulo), n = 2; while (D[col].some((x) => x.id === id)) id = slug(titulo) + "-" + n++; item.id = id; item.ordem ??= D[col].length; }
    e.target.disabled = true; e.target.textContent = "Salvando…";
    try { await salvarItem(col, item); toast("Salvo e publicado ✔", "ok"); fechar(true); }
    catch (err) { console.error(err); toast("Erro ao salvar: " + err.message, "erro"); e.target.disabled = false; e.target.textContent = "💾 Salvar"; }
  };
  $("[data-excluir]", fundo)?.addEventListener("click", async () => {
    if (!confirm(`Excluir “${item[cfg.campoTitulo]}” definitivamente?`)) return;
    try { await excluirItem(col, item.id); toast("Excluído.", "ok"); fechar(true); } catch (err) { toast("Erro: " + err.message, "erro"); }
  });
  document.body.append(fundo);
}

/* ---------- Mudar senha ---------- */
function secSenha(main) {
  main.innerHTML = cabecalhoSecao("Mudar senha", "Troque a senha de acesso ao painel.");
  if (!FB) { main.insertAdjacentHTML("beforeend", '<div class="aviso">Disponível quando o Firebase estiver configurado.</div>'); return; }
  const card = h(`<form class="cartao" style="max-width:520px">
    <p class="ajuda">Use pelo menos 8 caracteres, misturando letras e números. Evite senhas óbvias como 123456.</p>
    <div class="campo" style="margin-bottom:14px"><label>Senha atual</label><input type="password" name="atual" required autocomplete="current-password"></div>
    <div class="campo" style="margin-bottom:14px"><label>Nova senha</label><input type="password" name="nova" required minlength="6" autocomplete="new-password"></div>
    <div class="campo" style="margin-bottom:20px"><label>Repita a nova senha</label><input type="password" name="repete" required minlength="6" autocomplete="new-password"></div>
    <button class="btn ok">🔑 Salvar nova senha</button></form>`);
  card.onsubmit = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(card));
    if (f.nova !== f.repete) return toast("As duas senhas novas não são iguais.", "erro");
    if (f.nova.length < 6) return toast("A nova senha precisa de pelo menos 6 caracteres.", "erro");
    const btn = $("button", card); btn.disabled = true;
    try {
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = FB.authMod;
      const u = FB.auth.currentUser;
      await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, f.atual));
      await updatePassword(u, f.nova);
      card.reset(); toast("Senha alterada ✔", "ok");
    } catch (err) {
      toast(/wrong-password|invalid-credential/.test(err.code) ? "Senha atual incorreta." : "Erro: " + err.message, "erro");
    }
    btn.disabled = false;
  };
  main.append(card);
}

/* ---------- Ferramentas: importar do WordPress, backup ---------- */
function secFerramentas(main) {
  main.innerHTML = cabecalhoSecao("Importar e backup", "Ferramentas para trazer conteúdo e guardar cópias de segurança.") + `
  ${FB ? `<section class="cartao"><h2>Publicar conteúdo inicial</h2><p class="ajuda">${D.publicado ? "✔ O conteúdo já está publicado. Use este botão só se quiser regravar tudo." : "⚠️ O site ainda está mostrando o conteúdo padrão. Clique para publicar no banco de dados."}</p><button class="btn" data-publicar>🚀 Publicar todo o conteúdo</button></section>` : ""}
  <section class="cartao"><h2>Importar do site antigo (WordPress)</h2>
    <p class="ajuda">Busca no site WordPress as descrições completas, fotos e categorias de todos os produtos, além dos textos das páginas “Quem Somos” e “Política de privacidade”. Produtos que já existem aqui são atualizados; os novos são adicionados.</p>
    <div class="campos"><div class="campo largo"><label>Endereço do site antigo</label><input type="url" class="input" data-wp value="https://laborloja.com.br"></div></div>
    <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-importar>⬇️ Importar agora</button></div>
    <div class="progresso" data-log hidden></div></section>
  <section class="cartao"><h2>Cópia de segurança</h2><p class="ajuda">Baixe um arquivo com todo o conteúdo do site. Guarde-o: com ele é possível restaurar tudo.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn sec" data-exportar>💾 Baixar backup (.json)</button><button class="btn sec" data-restaurar>📂 Restaurar de um backup</button>
    ${FB ? "" : '<button class="btn perigo" data-padrao>↺ Voltar ao conteúdo padrão</button>'}</div></section>`;
  const log = (m) => { const l = $("[data-log]"); l.hidden = false; l.textContent += m + "\n"; l.scrollTop = l.scrollHeight; };

  $("[data-publicar]")?.addEventListener("click", async (e) => {
    if (!confirm("Isto vai gravar todo o conteúdo atual no Firebase (substituindo o que houver lá). Continuar?")) return;
    e.target.disabled = true;
    try { await publicarTudo((m) => toast(m)); toast("Conteúdo publicado ✔", "ok"); } catch (err) { toast("Erro: " + err.message, "erro"); }
    e.target.disabled = false;
  });
  $("[data-importar]").onclick = async (e) => {
    e.target.disabled = true; $("[data-log]").textContent = "";
    try { await importarWordPress($("[data-wp]").value.replace(/\/$/, ""), log); log("✅ Importação concluída!"); toast("Importação concluída ✔", "ok"); }
    catch (err) { console.error(err); log("❌ Erro: " + err.message + "\nDica: o site antigo precisa estar no ar e com a API REST do WordPress ativa."); }
    e.target.disabled = false;
  };
  $("[data-exportar]").onclick = () => {
    const a = h(`<a download="laborloja-backup-${new Date().toISOString().slice(0, 10)}.json"></a>`);
    a.href = URL.createObjectURL(new Blob([JSON.stringify(D, null, 1)], { type: "application/json" })); a.click();
  };
  $("[data-restaurar]").onclick = async () => {
    const [f] = await escolherArquivo("application/json"); if (!f) return;
    try {
      const novo = JSON.parse(await f.text());
      if (!novo.site || !Array.isArray(novo.produtos)) throw new Error("arquivo não é um backup válido");
      if (!confirm(`Restaurar backup com ${novo.produtos.length} produtos? O conteúdo atual será substituído.`)) return;
      D = novo; await publicarTudo((m) => toast(m)); toast("Backup restaurado ✔", "ok");
    } catch (err) { toast("Erro: " + err.message, "erro"); }
  };
  $("[data-padrao]")?.addEventListener("click", async () => { if (!confirm("Apagar as alterações de demonstração e voltar ao conteúdo padrão?")) return; limparDemo(); D = await carregarSeed(); toast("Conteúdo padrão restaurado", "ok"); });
}

const decodificar = (s = "") => { const t = document.createElement("textarea"); t.innerHTML = s; return t.value; };
async function wpGet(base, caminho) {
  const r = await fetch(base + caminho, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`${caminho} respondeu ${r.status}`);
  return { dados: await r.json(), total: +r.headers.get("X-WP-TotalPages") || 1 };
}
const limparHtml = (s = "") => s.replace(/<!--[\s\S]*?-->/g, "").replace(/\s(class|style|id|data-[\w-]+|srcset|sizes|loading|decoding)="[^"]*"/g, "").replace(/<\/?(span|div)[^>]*>/g, "").replace(/\n\s*\n/g, "\n").trim();

async function importarWordPress(base, log) {
  log("Buscando categorias…");
  const { dados: cats } = await wpGet(base, "/wp-json/wc/store/v1/products/categories?per_page=100");
  const idParaSlug = Object.fromEntries(cats.map((c) => [c.id, c.slug]));
  cats.forEach((c, i) => {
    const ex = D.categorias.find((x) => x.id === c.slug);
    const novo = { id: c.slug, nome: decodificar(c.name), pai: idParaSlug[c.parent] || "", imagem: c.image?.src || ex?.imagem || "", ordem: ex?.ordem ?? 100 + i, destaque: ex?.destaque ?? false };
    if (ex) Object.assign(ex, novo); else D.categorias.push(novo);
  });
  log(`✔ ${cats.length} categorias`);

  let pagina = 1, total = 1, n = 0;
  do {
    log(`Buscando produtos (página ${pagina})…`);
    const r = await wpGet(base, `/wp-json/wc/store/v1/products?per_page=100&page=${pagina}`); total = r.total;
    for (const p of r.dados) {
      const ex = D.produtos.find((x) => x.id === p.slug);
      const link = p.add_to_cart?.url || "";
      const pdf = /\.pdf($|\?)/i.test(link) ? link : ex?.pdf || "";
      const novo = {
        id: p.slug, nome: decodificar(p.name), categorias: p.categories.map((c) => c.slug), imagens: p.images.map((i) => i.src),
        resumo: limparHtml(p.short_description), descricao: limparHtml(p.description),
        botao: ex?.botao || decodificar(p.add_to_cart?.text || "Sob consulta").replace("Read more", "Saiba mais"),
        pdf, preco: p.prices?.price && +p.prices.price ? `R$ ${(p.prices.price / 10 ** (p.prices.currency_minor_unit || 2)).toFixed(2).replace(".", ",")}` : (ex?.preco || "Sob consulta"),
        destaque: ex?.destaque ?? false, ativo: ex?.ativo ?? true, ordem: ex?.ordem ?? D.produtos.length
      };
      if (ex) Object.assign(ex, novo); else D.produtos.push(novo);
      n++;
    }
  } while (++pagina <= total);
  log(`✔ ${n} produtos`);

  const paginasWp = [["politica-de-privacidade", "/wp-json/wp/v2/pages?slug=politica-de-privacidade&_embed"], ["quem-somos", "/wp-json/wp/v2/posts?slug=quem-somos-nos&_embed"]];
  for (const [id, caminho] of paginasWp) {
    try {
      const { dados } = await wpGet(base, caminho);
      if (!dados[0]) { log(`• página “${id}” não encontrada no WordPress (mantida como está)`); continue; }
      const pg = D.paginas.find((x) => x.id === id) || (D.paginas.push({ id }), D.paginas.at(-1));
      pg.titulo = decodificar(dados[0].title.rendered); pg.conteudo = limparHtml(dados[0].content.rendered);
      pg.imagem = dados[0]._embedded?.["wp:featuredmedia"]?.[0]?.source_url || pg.imagem || "";
      log(`✔ página “${pg.titulo}”`);
    } catch (e) { log(`• não foi possível importar “${id}”: ${e.message}`); }
  }
  log("Salvando…");
  await publicarTudo(log);
}

/* ======================= Login e início ======================= */
function telaLogin(erro = "") {
  $("#app").innerHTML = `<div class="tela-centro"><form class="login">
    <img src="${esc(D.site.geral.logo)}" alt="">
    <h1>Entrar no painel</h1><p>Use o e-mail e a senha cadastrados.</p>
    ${erro ? `<div class="aviso">${esc(erro)}</div>` : ""}
    <div class="campo" style="margin-bottom:14px"><label>E-mail</label><input type="email" name="email" required autocomplete="username"></div>
    <div class="campo" style="margin-bottom:20px"><label>Senha</label><input type="password" name="senha" required autocomplete="current-password"></div>
    <button class="btn" style="width:100%">Entrar</button>
    <p style="margin:16px 0 0;text-align:center"><a href="#" data-esqueci>Esqueci minha senha</a> · <a href="#" data-primeiro>Primeiro acesso</a></p></form></div>`;
  $(".login").onsubmit = async (e) => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
    e.submitter.disabled = true; e.submitter.textContent = "Entrando…";
    try { await FB.authMod.signInWithEmailAndPassword(FB.auth, f.email.trim(), f.senha); }
    catch { telaLogin("E-mail ou senha incorretos. Se é sua primeira vez, clique em “Primeiro acesso”."); }
  };
  $("[data-primeiro]").onclick = (e) => { e.preventDefault(); telaPrimeiroAcesso(); };
  $("[data-esqueci]").onclick = async (e) => {
    e.preventDefault(); const email = $("input[name=email]").value || prompt("Digite seu e-mail:"); if (!email) return;
    try { await FB.authMod.sendPasswordResetEmail(FB.auth, email); toast("Enviamos um link para redefinir a senha ✔", "ok"); } catch (err) { toast("Erro: " + err.message, "erro"); }
  };
}

/** Cria a conta do administrador (só funciona para os e-mails autorizados). */
function telaPrimeiroAcesso(erro = "") {
  $("#app").innerHTML = `<div class="tela-centro"><form class="login">
    <img src="${esc(D.site.geral.logo)}" alt="">
    <h1>Primeiro acesso</h1><p>Crie a senha do painel. Só e-mails autorizados conseguem entrar.</p>
    ${erro ? `<div class="aviso">${esc(erro)}</div>` : ""}
    <div class="campo" style="margin-bottom:14px"><label>E-mail</label><input type="email" name="email" required autocomplete="username"></div>
    <div class="campo" style="margin-bottom:14px"><label>Crie uma senha</label><input type="password" name="senha" required minlength="6" autocomplete="new-password"></div>
    <div class="campo" style="margin-bottom:20px"><label>Repita a senha</label><input type="password" name="repete" required minlength="6" autocomplete="new-password"></div>
    <button class="btn" style="width:100%">Criar acesso</button>
    <p style="margin:16px 0 0;text-align:center"><a href="#" data-voltar>← Voltar ao login</a></p></form></div>`;
  $("[data-voltar]").onclick = (e) => { e.preventDefault(); telaLogin(); };
  $(".login").onsubmit = async (e) => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); const email = f.email.trim().toLowerCase();
    if (!emailsAdmin.includes(email)) return telaPrimeiroAcesso("Este e-mail não está autorizado a administrar o site.");
    if (f.senha !== f.repete) return telaPrimeiroAcesso("As senhas não são iguais.");
    e.submitter.disabled = true; e.submitter.textContent = "Criando…";
    try { await FB.authMod.createUserWithEmailAndPassword(FB.auth, email, f.senha); }
    catch (err) { telaPrimeiroAcesso(err.code === "auth/email-already-in-use" ? "Este e-mail já tem acesso. Volte e entre com sua senha (ou use “Esqueci minha senha”)." : "Erro: " + err.message); }
  };
}

(async function iniciar() {
  ativarArquivos(document.body);
  try {
    D = await carregarDados();
    window.__categoriasOpcoes = () => [["", "— escolha —"], ...D.categorias.map((c) => [c.id, (c.pai ? "↳ " : "") + c.nome])];
    FB = firebaseAtivo ? await firebase() : null;
    if (!FB) { montarLayout(); return; }
    FB.authMod.onAuthStateChanged(FB.auth, (u) => {
      if (!u) return telaLogin();
      if (!emailsAdmin.includes((u.email || "").toLowerCase())) { FB.authMod.signOut(FB.auth); return telaLogin("Este e-mail não tem permissão para o painel."); }
      montarLayout(u);
    });
  } catch (e) {
    console.error(e);
    $("#app").innerHTML = `<div class="tela-centro"><div class="login"><h1>Ops!</h1><p>Não foi possível abrir o painel: ${esc(e.message)}</p></div></div>`;
  }
})();

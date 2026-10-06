// Camada de dados do site e do painel.
// - Conteúdo: um único documento no Firestore (conteudo/tudo) → 1 leitura por visita.
// - Arquivos (fotos/PDFs enviados pelo painel): guardados no próprio Firestore em
//   partes de ~700 KB (arquivos/{id}/partes/000…), endereçados como "arquivo:{id}".
//   Assim tudo funciona no plano gratuito (o Firebase Storage exige plano pago).
import { firebaseConfig, firebaseAtivo } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.4";
const CHAVE_DEMO = "laborloja-demo-conteudo";
export const PREFIXO_ARQUIVO = "arquivo:";
let _fb = null;

export async function firebase() {
  if (!firebaseAtivo) return null;
  if (_fb) return _fb;
  const [app, fs, auth] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-firestore.js`),
    import(`${SDK}/firebase-auth.js`)
  ]);
  const a = app.initializeApp(firebaseConfig);
  _fb = { app: a, fs, authMod: auth, db: fs.getFirestore(a), auth: auth.getAuth(a) };
  return _fb;
}

function base() { return location.pathname.includes("/admin/") ? "../" : "./"; }

export async function carregarSeed() {
  const r = await fetch(base() + "data/conteudo.json", { cache: "no-store" });
  return r.json();
}
function lerDemo() { try { return JSON.parse(localStorage.getItem(CHAVE_DEMO) || "null"); } catch { return null; } }
export function salvarDemo(dados) { try { localStorage.setItem(CHAVE_DEMO, JSON.stringify(dados)); return true; } catch { return false; } }
export function limparDemo() { try { localStorage.removeItem(CHAVE_DEMO); } catch {} }

/** Copia do padrão só as chaves que não existem (não sobrescreve nada que foi editado). */
function preencherFaltantes(alvo, padrao) {
  if (!alvo || !padrao || typeof padrao !== "object" || Array.isArray(padrao)) return;
  for (const [k, v] of Object.entries(padrao)) {
    if (!(k in alvo)) alvo[k] = v;
    else if (v && typeof v === "object" && !Array.isArray(v)) preencherFaltantes(alvo[k], v);
  }
}

const ordenar = (l = []) => l.sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));

/** Carrega todo o conteúdo: { site, paginas, categorias, produtos }. `publicado` indica se veio do Firebase. */
export async function carregarDados() {
  const fb = await firebase().catch(() => null);
  if (fb) {
    try {
      const snap = await fb.fs.getDoc(fb.fs.doc(fb.db, "conteudo", "tudo"));
      if (snap.exists()) {
        const d = snap.data();
        // Recursos novos do site (ex.: mega menu) ganham o conteúdo padrão até serem editados no painel.
        try { preencherFaltantes(d.site, (await carregarSeed()).site); } catch {}
        ordenar(d.produtos); ordenar(d.categorias);
        return Object.assign(d, { publicado: true });
      }
    } catch (e) { console.warn("Firebase indisponível, usando conteúdo padrão.", e); }
  }
  return Object.assign((!fb && lerDemo()) || (await carregarSeed()), { publicado: false });
}

/** Grava todo o conteúdo (Firebase ou navegador, no modo demonstração). */
export async function salvarTudo(dados) {
  const { publicado, ...limpo } = dados;
  const fb = await firebase();
  if (!fb) return salvarDemo(limpo);
  const tamanho = new Blob([JSON.stringify(limpo)]).size;
  if (tamanho > 950_000) throw new Error("o conteúdo passou do limite de 1 MB. Remova imagens coladas dentro dos textos.");
  await fb.fs.setDoc(fb.fs.doc(fb.db, "conteudo", "tudo"), limpo);
}

/* ======================= Arquivos no Firestore ======================= */
const TAM_PARTE = 700_000; // caracteres base64 por documento (limite do Firestore: 1 MiB)

function paraBase64(buf) {
  let s = ""; const b = new Uint8Array(buf);
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Envia um arquivo (Blob/File) e devolve o endereço "arquivo:{id}". */
export async function enviarArquivoFirestore(arquivo, aoProgredir = () => {}) {
  const fb = await firebase();
  const { doc, collection, writeBatch } = fb.fs;
  const b64 = paraBase64(await arquivo.arrayBuffer());
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const partes = Math.ceil(b64.length / TAM_PARTE);
  for (let i = 0; i < partes; i += 8) {           // até 8 partes (~4 MB) por gravação
    const lote = writeBatch(fb.db);
    for (let j = i; j < Math.min(i + 8, partes); j++) {
      lote.set(doc(collection(fb.db, "arquivos", id, "partes"), String(j).padStart(3, "0")), {
        d: b64.slice(j * TAM_PARTE, (j + 1) * TAM_PARTE),
        ...(j === 0 ? { t: arquivo.type || "application/octet-stream", n: arquivo.name || "", total: partes } : {})
      });
    }
    await lote.commit();
    aoProgredir(Math.min(i + 8, partes) / partes);
  }
  return PREFIXO_ARQUIVO + id;
}

const _cacheUrls = new Map();
/** Converte "arquivo:{id}" num endereço utilizável (blob:), com cache no navegador. */
export function urlDoArquivo(ref) {
  if (!ref || !ref.startsWith(PREFIXO_ARQUIVO)) return Promise.resolve(ref);
  if (_cacheUrls.has(ref)) return _cacheUrls.get(ref);
  const p = (async () => {
    const id = ref.slice(PREFIXO_ARQUIVO.length);
    const chaveCache = new Request(location.origin + "/__arquivo/" + id);
    let cache = null;
    try { cache = await caches.open("laborloja-arquivos"); const r = await cache.match(chaveCache); if (r) return URL.createObjectURL(await r.blob()); } catch {}
    const fb = await firebase();
    const snap = await fb.fs.getDocs(fb.fs.collection(fb.db, "arquivos", id, "partes"));
    const docs = snap.docs.sort((a, b) => a.id.localeCompare(b.id)).map((d) => d.data());
    if (!docs.length) throw new Error("arquivo não encontrado: " + id);
    const bin = atob(docs.map((d) => d.d).join(""));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: docs[0].t });
    try { await cache?.put(chaveCache, new Response(blob, { headers: { "Content-Type": docs[0].t } })); } catch {}
    return URL.createObjectURL(blob);
  })();
  _cacheUrls.set(ref, p);
  return p;
}

/** Observa a página e troca automaticamente todo "arquivo:…" (src, href, background) pelo arquivo real. */
export function ativarArquivos(raiz = document.body) {
  const re = /arquivo:[a-z0-9]+/gi;
  // Arquivos migrados do WordPress ficam em "uploads/…" (relativo à raiz do site);
  // dentro do painel (/admin/) é preciso subir um nível para enxergá-los.
  const noAdmin = location.pathname.includes("/admin/");
  const corrigirRelativo = (el) => {
    for (const attr of ["src", "href"]) { const v = el.getAttribute(attr); if (v?.startsWith("uploads/")) el.setAttribute(attr, "../" + v); }
    const st = el.getAttribute("style");
    if (st && /url\(["']?uploads\//.test(st)) el.setAttribute("style", st.replace(/url\((["']?)uploads\//g, "url($1../uploads/"));
  };
  const tratar = (el) => {
    if (el.nodeType !== 1) return;
    if (noAdmin) corrigirRelativo(el);
    for (const attr of ["src", "href"]) {
      const v = el.getAttribute(attr);
      if (v?.startsWith(PREFIXO_ARQUIVO)) urlDoArquivo(v).then((u) => { if (el.getAttribute(attr) === v) el.setAttribute(attr, u); }).catch(console.warn);
    }
    const st = el.getAttribute("style");
    if (st && st.includes(PREFIXO_ARQUIVO)) {
      for (const ref of st.match(re) || []) urlDoArquivo(ref).then((u) => { el.setAttribute("style", el.getAttribute("style").split(ref).join(u)); }).catch(console.warn);
    }
  };
  const varrer = (n) => { tratar(n); n.querySelectorAll?.("[src^='arquivo:'],[href^='arquivo:'],[style*='arquivo:'],[src^='uploads/'],[href^='uploads/'],[style*='uploads/']").forEach(tratar); };
  varrer(raiz);
  new MutationObserver((ms) => ms.forEach((m) => (m.type === "attributes" ? tratar(m.target) : m.addedNodes.forEach(varrer))))
    .observe(raiz, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "href", "style"] });
}

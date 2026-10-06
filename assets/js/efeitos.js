// Efeitos visuais do site: revelação ao rolar, entrada em cascata nas grades,
// inclinação suave das imagens promocionais e o mega menu de Categorias.
// Tudo respeita "reduzir movimento" do sistema e o conteúdo aparece mesmo sem JS.

const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

// O que recebe animação de entrada ao aparecer na tela (sem precisar mexer no HTML).
const ALVOS = [
  ".secao-titulo", ".cartao-cat", ".prod-linha", ".banner", ".cartao-prod", ".lista-mini", ".popular",
  ".cartao-noticia", ".parceiros > *", ".faixa .container > *", ".rodape-grade > *", ".promo",
  ".titulo-pagina h1", ".produto-layout > *", ".pagina-conteudo > *", ".filtros", ".tabela-orcamento"
].join(",");

export function ativarEfeitos(raiz = document) {
  document.documentElement.classList.add("efeitos");
  ligarMegaMenu();
  if (reduzir || !("IntersectionObserver" in window)) { raiz.querySelectorAll(ALVOS).forEach((e) => e.classList.add("visivel")); return; }

  const obs = new IntersectionObserver((itens) => {
    itens.forEach((it) => { if (it.isIntersecting) { it.target.classList.add("visivel"); obs.unobserve(it.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  const preparar = (el) => {
    if (el.dataset.rev || el.closest(".mega")) return;
    el.dataset.rev = "1";
    el.classList.add("revelar");
    // cascata: atraso proporcional à posição entre os irmãos
    const irmaos = el.parentElement ? [...el.parentElement.children].filter((x) => x.matches(ALVOS)) : [];
    const pos = Math.max(0, irmaos.indexOf(el));
    el.style.setProperty("--atraso", `${Math.min(pos, 8) * 70}ms`);
    // já visível no carregamento? mostra sem esperar
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) requestAnimationFrame(() => el.classList.add("visivel"));
    else obs.observe(el);
  };
  raiz.querySelectorAll(ALVOS).forEach(preparar);
  // conteúdo desenhado depois (abas, carrosséis, filtros) também ganha o efeito
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType !== 1) return;
    if (n.matches(ALVOS)) preparar(n);
    n.querySelectorAll?.(ALVOS).forEach(preparar);
  }))).observe(document.body, { childList: true, subtree: true });

  inclinarPromos();
}

/** Imagem dos cartões escuros acompanha levemente o mouse (efeito 3D). */
function inclinarPromos() {
  if (matchMedia("(hover: none)").matches) return;
  document.querySelectorAll(".promo").forEach((card) => {
    const img = card.querySelector(".promo-moldura img");
    if (!img) return;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      img.style.transform = `translateX(-6%) rotateY(${x * 14}deg) rotateX(${-y * 12}deg) scale(1.06)`;
    });
    card.addEventListener("mouseleave", () => { img.style.transform = ""; });
  });
}

/** Abre ao passar o mouse (com pequena tolerância) e por toque/teclado. */
function ligarMegaMenu() {
  document.querySelectorAll(".tem-mega").forEach((item) => {
    if (item.dataset.ok) return; item.dataset.ok = "1";
    let t;
    const abrir = () => { clearTimeout(t); item.classList.add("aberto"); };
    const fechar = () => { t = setTimeout(() => item.classList.remove("aberto"), 180); };
    item.addEventListener("mouseenter", abrir);
    item.addEventListener("mouseleave", fechar);
    item.addEventListener("focusin", abrir);
    item.addEventListener("focusout", (e) => { if (!item.contains(e.relatedTarget)) fechar(); });
    // toque (celular) ou tela sem mouse: primeiro toque abre, o segundo segue o link
    item.querySelector(":scope > a").addEventListener("click", (e) => {
      if (matchMedia("(hover: none), (max-width: 820px)").matches && !item.classList.contains("aberto")) { e.preventDefault(); abrir(); }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") item.classList.remove("aberto"); });
    // ao rolar a página o menu fecha (só no computador; no celular ele fica dentro do menu)
    addEventListener("scroll", () => { if (!matchMedia("(max-width: 820px)").matches) item.classList.remove("aberto"); }, { passive: true });
  });
}

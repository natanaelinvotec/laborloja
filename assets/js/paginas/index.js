import { iniciarPagina, esc, resolverLink, produto, produtosAtivos, produtosDaCategoria, cartaoProduto, linhaProduto, ativarCarrossel } from "../site.js";
import { ativarSlider } from "../slider.js";

const ICO_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
const ICO_ALERTA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4.5M12 17.6v.1"/></svg>';
const ICO_WHATS = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.2-.5-.3z"/></svg>';

/** Slides do banner principal. Sites antigos tinham um único "hero": vira o 1º slide. */
export function slidesDe(h) {
  if (Array.isArray(h.slides) && h.slides.length) return h.slides.filter((s) => s.ativo !== false);
  return h.hero ? [h.hero] : [];
}

const ehAviso = (l) => /^(aten[cç][aã]o|obs|importante)\b/i.test(l.trim());
const alvo = (link) => (link === "whatsapp" || /^https?:/.test(link || "") ? ' target="_blank" rel="noopener"' : "");

function slideHtml(s, i) {
  const linhas = (s.linhas || []).filter(Boolean);
  const avisos = [...linhas.filter(ehAviso), ...(s.aviso ? [s.aviso] : [])];
  const itens = linhas.filter((l) => !ehAviso(l));
  const temPreco = s.preco || s.condicao || s.validade;
  const chamada = !temPreco && (s.textoLateral || s.textoLateralDestaque);
  const imgPrincipal = s.imagem || "";
  const tema = s.tema || (s.imagemFundo ? "foto" : "claro");
  const msgWhats = `Olá! Tenho interesse em ${s.titulo || "um produto"} que vi no site.`;
  return `<article class="slide tema-${esc(tema)}" data-slide="${i}" aria-roledescription="slide" aria-label="${i + 1}">
    ${s.imagemFundo ? `<div class="slide-fundo" style="background-image:url('${esc(s.imagemFundo)}')"></div>` : '<div class="slide-luzes" aria-hidden="true"><span></span><span></span></div>'}
    <div class="slide-texto">
      ${s.etiqueta ? `<span class="slide-etiqueta anima" style="--d:.05s">${esc(s.etiqueta)}</span>` : ""}
      <h2 class="slide-titulo anima" style="--d:.15s">${esc(s.titulo || "")}</h2>
      ${s.subtitulo ? `<p class="slide-sub anima" style="--d:.25s">${esc(s.subtitulo)}</p>` : ""}
      ${itens.length ? `<ul class="slide-lista">${itens.map((l, k) => `<li class="anima" style="--d:${(0.3 + k * 0.08).toFixed(2)}s"><i>${ICO_CHECK}</i>${esc(l)}</li>`).join("")}</ul>` : ""}
      ${temPreco ? `<div class="slide-preco anima" style="--d:.55s">
          ${s.precoChamada ? `<small>${esc(s.precoChamada)}</small>` : ""}
          ${s.preco ? `<strong>${esc(s.preco)}</strong>` : ""}
          ${s.condicao ? `<span>${esc(s.condicao)}</span>` : ""}
          ${s.validade ? `<em>${esc(s.validade)}</em>` : ""}
        </div>` : ""}
      ${chamada ? `<p class="slide-chamada anima" style="--d:.55s">${esc(s.textoLateral || "")} <b>${esc(s.textoLateralDestaque || "")}</b></p>` : ""}
      <div class="slide-botoes anima" style="--d:.65s">
        ${s.botaoTexto ? `<a class="btn grande btn-brilho" href="${esc(resolverLink(s.botaoLink, msgWhats))}"${alvo(s.botaoLink)}>${s.botaoLink === "whatsapp" ? ICO_WHATS : ""}${esc(s.botaoTexto)}</a>` : ""}
        ${s.botao2Texto ? `<a class="btn grande contorno" href="${esc(resolverLink(s.botao2Link, msgWhats))}"${alvo(s.botao2Link)}>${esc(s.botao2Texto)}</a>` : ""}
      </div>
      ${avisos.length ? `<p class="slide-aviso anima" style="--d:.75s"><i>${ICO_ALERTA}</i>${avisos.map(esc).join(" · ")}</p>` : ""}
    </div>
    ${imgPrincipal ? `<figure class="slide-midia anima-midia">
        <div class="slide-produto"><img src="${esc(imgPrincipal)}" alt="${esc(s.titulo || "")}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></div>
        ${s.marca ? `<img class="slide-marca" src="${esc(s.marca)}" alt="">` : ""}
        ${s.selo ? `<span class="slide-selo">${esc(s.selo)}</span>` : ""}
      </figure>` : ""}
  </article>`;
}

function destaqueLateral(h) {
  // Cartão opcional à direita do slider (antigo "banner da direita")
  const d = h.destaqueLateral || (h.hero?.bannerLateral && !h.slides?.length ? { imagem: h.hero.bannerLateral, link: h.hero.bannerLateralLink } : null);
  if (!d?.imagem) return "";
  return `<a class="hero-lateral" href="${esc(resolverLink(d.link || "whatsapp"))}"${alvo(d.link || "whatsapp")}>
    ${d.selo ? `<span class="slide-selo">${esc(d.selo)}</span>` : ""}
    <span class="hero-lateral-img"><img src="${esc(d.imagem)}" alt="${esc(d.titulo || "")}"></span>
    ${d.titulo || d.texto ? `<span class="hero-lateral-txt">${d.titulo ? `<b>${esc(d.titulo)}</b>` : ""}${d.texto ? `<small>${esc(d.texto)}</small>` : ""}</span>` : ""}
  </a>`;
}

iniciarPagina((main, D) => {
  const h = D.site.home;
  const lista = (ids) => (ids || []).map(produto).filter(Boolean);
  const destaques = produtosAtivos().filter((p) => p.destaque).slice(0, 6);
  const folders = produtosDaCategoria(h.categoriaFolders || "").filter((p) => p.pdf);
  const catsHome = D.categorias.filter((c) => c.destaque);
  const pop = lista(h.produtosPopulares);
  const slides = slidesDe(h);
  const lateral = destaqueLateral(h);

  main.innerHTML = `
  ${slides.length ? `<section class="hero"><div class="container hero-grade ${lateral ? "com-lateral" : ""}">
    <div class="slider" data-slider data-intervalo="${Number(h.intervaloSlides) || 7}">
      <div class="slider-trilho">${slides.map(slideHtml).join("")}</div>
      ${slides.length > 1 ? `<button class="slider-seta ant" aria-label="Slide anterior">‹</button><button class="slider-seta prox" aria-label="Próximo slide">›</button>
      <div class="slider-pontos">${slides.map((_, i) => `<button aria-label="Ir para o slide ${i + 1}" data-ir="${i}"><span></span></button>`).join("")}</div>` : ""}
    </div>
    ${lateral}
  </div></section>` : ""}

  <section class="secao" style="padding-top:20px"><div class="container">
    ${h.tituloCategorias ? `<div class="secao-titulo"><h2>${esc(h.tituloCategorias)}</h2></div>` : ""}
    <div class="grade-categorias">${catsHome.map((c) => `<a class="cartao-cat" href="produtos.html?cat=${c.id}"><img loading="lazy" src="${esc(c.imagem)}" alt=""><span>${esc(c.nome)}</span></a>`).join("")}</div>
  </div></section>

  <section class="secao cinza"><div class="container">
    <div class="grade-promos">${(h.promos || []).map((p) => `
      <div class="promo"><div class="promo-texto">${p.selo ? `<span class="promo-selo">${esc(p.selo)}</span>` : ""}<h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p>
        <a class="btn" href="${esc(resolverLink(p.botaoLink, "Olá! Gostaria de saber mais sobre: " + p.titulo))}"${alvo(p.botaoLink)}>${esc(p.botaoTexto)}</a></div>
        ${p.imagem ? `<div class="promo-vitrine"><img loading="lazy" src="${esc(p.imagem)}" alt="${esc(p.titulo)}"></div>` : ""}</div>`).join("")}</div>
    ${destaques.length ? `<div class="secao-titulo" style="margin-top:56px"><h2>${esc(h.tituloDestaques)}</h2></div>
    <div class="grade-lista">${destaques.map(linhaProduto).join("")}</div>` : ""}
  </div></section>

  <section class="secao"><div class="container">
    ${h.tituloBanners || h.linkBannersTexto ? `<div class="secao-titulo">${h.tituloBanners ? `<h2>${esc(h.tituloBanners)}</h2>` : "<span></span>"}${h.linkBannersTexto ? `<a class="link-seta" href="${esc(h.linkBanners)}">${esc(h.linkBannersTexto)} <span aria-hidden="true">→</span></a>` : ""}</div>` : ""}
    <div class="grade-banners">${(h.banners || []).map((b) => `
      <a class="banner banner-v3" href="${esc(resolverLink(b.botaoLink, "Olá! Gostaria de saber mais sobre: " + b.titulo))}"${alvo(b.botaoLink)}>
        ${b.imagem ? `<img class="banner-img" src="${esc(b.imagem)}" alt="" loading="lazy">` : ""}
        <span class="banner-txt"><h3>${esc(b.titulo)}</h3><p>${esc(b.texto)}</p>
        <span class="btn ${b.botaoClaro ? "claro" : ""}">${esc(b.botaoTexto)}</span></span></a>`).join("")}</div>
    ${folders.length ? `<div class="carrossel" style="margin-top:50px"><div class="carrossel-trilho">${folders.map(cartaoProduto).join("")}</div><div class="pontos"></div></div>` : ""}

    ${h.abas?.length ? `<div class="secao-titulo" style="margin-top:50px"><h2>${esc(h.tituloAbas)}</h2>
      <div class="abas" role="tablist">${h.abas.map((a, i) => `<button role="tab" data-aba="${esc(a.categoria)}" class="${i ? "" : "ativo"}">${esc(a.texto)}</button>`).join("")}</div></div>
    <div class="carrossel" data-abas><div class="carrossel-trilho"></div><div class="pontos"></div></div>` : ""}
  </div></section>

  <section class="secao" style="padding-top:0"><div class="container grade-listas">
    ${(h.listas || []).map((l) => `<div class="lista-mini"><h3>${esc(l.titulo)}</h3>${lista(l.produtos).map((p) => `<a class="item-mini" href="produto.html?p=${encodeURIComponent(p.id)}"><img loading="lazy" src="${esc(p.imagens?.[0])}" alt=""><span>${esc(p.nome)}</span></a>`).join("")}</div>`).join("")}
    ${pop.length ? `<div class="popular"><h3>${esc(h.tituloPopular)}</h3><a href="produto.html?p=${encodeURIComponent(pop[0].id)}"><img src="${esc(pop[0].imagens?.[0])}" alt=""><strong>${esc(pop[0].nome)}</strong></a></div>` : ""}
  </div></section>

  ${(h.parceiros || []).length ? `<section class="secao cinza secao-parceiros"><div class="container">
    <div class="secao-titulo centro"><h2>${esc(h.tituloParceiros || "Nossos Parceiros")}</h2></div>
    <div class="parceiros">${h.parceiros.map((p) => { const img = `<img loading="lazy" src="${esc(p.imagem)}" alt="${esc(p.nome)}" title="${esc(p.nome)}">`; return p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${img}</a>` : `<span>${img}</span>`; }).join("")}</div>
  </div></section>` : ""}`;

  if (slides.length) ativarSlider(main.querySelector("[data-slider]"));
  main.querySelectorAll(".carrossel:not([data-abas])").forEach(ativarCarrossel);

  // Abas de produtos
  const box = main.querySelector("[data-abas]");
  if (box) {
    const mostrarAba = (cat) => {
      box.querySelector(".carrossel-trilho").innerHTML = produtosDaCategoria(cat).map(cartaoProduto).join("") || '<div class="vazio">Nenhum produto nesta aba ainda.</div>';
      box.querySelector(".carrossel-trilho").scrollLeft = 0;
    };
    main.querySelectorAll("[data-aba]").forEach((b) => b.addEventListener("click", () => {
      main.querySelectorAll("[data-aba]").forEach((x) => x.classList.toggle("ativo", x === b));
      mostrarAba(b.dataset.aba);
    }));
    mostrarAba(h.abas[0].categoria); ativarCarrossel(box);
  }
});

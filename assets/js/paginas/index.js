import { iniciarPagina, esc, resolverLink, produto, produtosAtivos, produtosDaCategoria, cartaoProduto, linhaProduto, ativarCarrossel } from "../site.js";

iniciarPagina((main, D) => {
  const h = D.site.home, hero = h.hero;
  const lista = (ids) => (ids || []).map(produto).filter(Boolean);
  const destaques = produtosAtivos().filter((p) => p.destaque).slice(0, 6);
  const folders = produtosDaCategoria(h.categoriaFolders || "").filter((p) => p.pdf);
  const catsHome = D.categorias.filter((c) => c.destaque);
  const noticias = D.paginas.filter((p) => p.noticia);
  const pop = lista(h.produtosPopulares);

  main.innerHTML = `
  <section class="hero"><div class="container hero-grade">
    <div class="hero-principal" style="${hero.imagemFundo ? `background-image:url('${esc(hero.imagemFundo)}')` : ""}">
      <div class="hero-texto">
        ${hero.etiqueta ? `<span class="hero-etiqueta">${esc(hero.etiqueta)}</span>` : ""}
        <h1>${esc(hero.titulo)}</h1>
        <div class="hero-linhas">${(hero.linhas || []).map((l) => `<span>${esc(l)}</span>`).join("")}</div>
      </div>
      <div class="hero-lado">
        ${hero.imagem ? `<img src="${esc(hero.imagem)}" alt="">` : ""}
        <div class="hero-lado-texto">${esc(hero.textoLateral || "")}<b>${esc(hero.textoLateralDestaque || "")}</b></div>
        ${hero.botaoTexto ? `<a class="btn escuro grande" href="${esc(resolverLink(hero.botaoLink))}" target="${hero.botaoLink === "whatsapp" ? "_blank" : "_self"}">${esc(hero.botaoTexto)}</a>` : ""}
      </div>
    </div>
    ${hero.bannerLateral ? `<a class="hero-banner" href="${esc(resolverLink(hero.bannerLateralLink))}"><img src="${esc(hero.bannerLateral)}" alt=""></a>` : ""}
  </div></section>

  <section class="secao" style="padding-top:20px"><div class="container">
    <div class="secao-titulo"><h2>${esc(h.tituloCategorias)}</h2></div>
    <div class="grade-categorias">${catsHome.map((c) => `<a class="cartao-cat" href="produtos.html?cat=${c.id}"><img loading="lazy" src="${esc(c.imagem)}" alt=""><span>${esc(c.nome)}</span></a>`).join("")}</div>
  </div></section>

  <section class="secao cinza"><div class="container">
    <div class="grade-promos">${(h.promos || []).map((p) => `
      <div class="promo"><div><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p>
        <a class="btn" href="${esc(resolverLink(p.botaoLink, "Olá! Gostaria de uma cotação: " + p.titulo))}" ${p.botaoLink === "whatsapp" ? 'target="_blank"' : ""}>${esc(p.botaoTexto)}</a></div>
        ${p.imagem ? `<img loading="lazy" src="${esc(p.imagem)}" alt="">` : ""}</div>`).join("")}</div>
    ${destaques.length ? `<div class="secao-titulo" style="margin-top:56px"><h2>${esc(h.tituloDestaques)}</h2></div>
    <div class="grade-lista">${destaques.map(linhaProduto).join("")}</div>` : ""}
  </div></section>

  <section class="secao"><div class="container">
    <div class="secao-titulo"><h2>${esc(h.tituloBanners)}</h2>${h.linkBannersTexto ? `<a href="${esc(h.linkBanners)}">${esc(h.linkBannersTexto)}</a>` : ""}</div>
    <div class="grade-banners">${(h.banners || []).map((b) => `
      <div class="banner" style="background-image:url('${esc(b.imagem)}')"><h3>${esc(b.titulo)}</h3><p>${esc(b.texto)}</p>
        <a class="btn ${b.botaoClaro ? "claro" : ""}" href="${esc(resolverLink(b.botaoLink))}">${esc(b.botaoTexto)}</a></div>`).join("")}</div>
    ${folders.length ? `<div class="carrossel" style="margin-top:50px"><div class="carrossel-trilho">${folders.map(cartaoProduto).join("")}</div><div class="pontos"></div></div>` : ""}

    <div class="secao-titulo" style="margin-top:50px"><h2>${esc(h.tituloAbas)}</h2>
      <div class="abas" role="tablist">${(h.abas || []).map((a, i) => `<button role="tab" data-aba="${esc(a.categoria)}" class="${i ? "" : "ativo"}">${esc(a.texto)}</button>`).join("")}</div></div>
    <div class="carrossel" data-abas><div class="carrossel-trilho"></div><div class="pontos"></div></div>
  </div></section>

  <section class="secao" style="padding-top:0"><div class="container grade-listas">
    ${(h.listas || []).map((l) => `<div class="lista-mini"><h3>${esc(l.titulo)}</h3>${lista(l.produtos).map((p) => `<a class="item-mini" href="produto.html?p=${encodeURIComponent(p.id)}"><img loading="lazy" src="${esc(p.imagens?.[0])}" alt=""><span>${esc(p.nome)}</span></a>`).join("")}</div>`).join("")}
    ${pop.length ? `<div class="popular"><h3>${esc(h.tituloPopular)}</h3><a href="produto.html?p=${encodeURIComponent(pop[0].id)}"><img src="${esc(pop[0].imagens?.[0])}" alt=""><strong>${esc(pop[0].nome)}</strong></a></div>` : ""}
  </div></section>

  <section class="secao cinza"><div class="container">
    ${noticias.length ? `<div class="secao-titulo"><h2>${esc(h.tituloNoticias)}</h2></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,480px));gap:30px">${noticias.map((n) => `<a class="cartao-noticia" href="pagina.html?p=${n.id}"><img src="${esc(n.imagem || D.site.geral.logo)}" alt=""><div><small>${esc(D.site.geral.nomeLoja)}</small><h4>${esc(n.titulo)}</h4></div></a>`).join("")}</div>` : ""}
    <div class="parceiros">${(h.parceiros || []).map((p) => { const img = `<img loading="lazy" src="${esc(p.imagem)}" alt="${esc(p.nome)}">`; return p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${img}</a>` : img; }).join("")}</div>
  </div></section>`;

  main.querySelectorAll(".carrossel:not([data-abas])").forEach(ativarCarrossel);

  // Abas de produtos
  const box = main.querySelector("[data-abas]");
  const mostrarAba = (cat) => {
    box.querySelector(".carrossel-trilho").innerHTML = produtosDaCategoria(cat).map(cartaoProduto).join("") || '<div class="vazio">Nenhum produto nesta aba ainda.</div>';
    box.querySelector(".carrossel-trilho").scrollLeft = 0;
  };
  main.querySelectorAll("[data-aba]").forEach((b) => b.addEventListener("click", () => {
    main.querySelectorAll("[data-aba]").forEach((x) => x.classList.toggle("ativo", x === b));
    mostrarAba(b.dataset.aba);
  }));
  if (h.abas?.length) { mostrarAba(h.abas[0].categoria); ativarCarrossel(box); }
});

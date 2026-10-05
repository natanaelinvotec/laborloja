import { iniciarPagina, esc, produtosDaCategoria } from "../site.js";
iniciarPagina((main, D) => {
  const cats = D.categorias.filter((c) => !c.pai);
  main.innerHTML = `<div class="titulo-pagina"><div class="container"><h1>Categorias</h1><div class="migalhas"><a href="index.html">Home</a> / Categorias</div></div></div>
  <section class="secao"><div class="container"><div class="grade-categorias">
    ${cats.map((c) => `<a class="cartao-cat" href="produtos.html?cat=${c.id}"><img loading="lazy" src="${esc(c.imagem || D.site.geral.logo)}" alt=""><span>${esc(c.nome)}</span><small style="color:#8a96a3">${produtosDaCategoria(c.id).length} produtos</small></a>`).join("")}
  </div></div></section>`;
});

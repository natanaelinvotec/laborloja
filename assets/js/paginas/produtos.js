import { iniciarPagina, esc, qs, categoria, filhosDe, produtosAtivos, produtosDaCategoria, cartaoProduto } from "../site.js";

const normalizar = (s = "") => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

iniciarPagina((main, D) => {
  const catId = qs("cat") || "", busca = qs("q") || "";
  const cat = categoria(catId);
  let lista = catId ? produtosDaCategoria(catId) : produtosAtivos();
  if (busca) { const t = normalizar(busca); lista = lista.filter((p) => normalizar(p.nome + " " + (p.resumo || "")).includes(t)); }
  const titulo = busca ? `Resultados para “${busca}”` : cat ? cat.nome : "Todos os produtos";
  document.title = `${titulo} — ${D.site.geral.nomeLoja}`;
  const raiz = D.categorias.filter((c) => !c.pai);
  main.innerHTML = `
  <div class="titulo-pagina"><div class="container"><h1>${esc(titulo)}</h1>
    <div class="migalhas"><a href="index.html">Home</a> / <a href="produtos.html">Produtos</a>${cat ? " / " + esc(cat.nome) : ""}</div></div></div>
  <div class="container catalogo-layout">
    <aside class="filtros"><h3>Categorias</h3>
      <a href="produtos.html" class="${catId ? "" : "ativo"}">Todos os produtos</a>
      ${raiz.map((c) => `<a href="produtos.html?cat=${c.id}" class="${c.id === catId ? "ativo" : ""}">${esc(c.nome)}</a>` + filhosDe(c.id).map((f) => `<a class="sub ${f.id === catId ? "ativo" : ""}" href="produtos.html?cat=${f.id}">${esc(f.nome)}</a>`).join("")).join("")}
    </aside>
    <div>
      <div class="barra-resultado"><span>${lista.length} produto(s)</span>
        <select aria-label="Ordenar" data-ordem><option value="">Ordem padrão</option><option value="az">Nome A–Z</option><option value="za">Nome Z–A</option></select></div>
      <div class="grade-produtos tres" data-grade></div>
    </div>
  </div>`;
  const grade = main.querySelector("[data-grade]");
  const desenhar = (l) => grade.innerHTML = l.length ? l.map(cartaoProduto).join("") : '<div class="vazio" style="grid-column:1/-1">Nenhum produto encontrado.</div>';
  desenhar(lista);
  main.querySelector("[data-ordem]").addEventListener("change", (e) => {
    const v = e.target.value, l = [...lista];
    if (v) l.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR") * (v === "az" ? 1 : -1));
    desenhar(l);
  });
});

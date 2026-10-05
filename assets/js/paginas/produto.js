import { iniciarPagina, esc, qs, produto, nomeCats, botaoCoracao, naLista, alternarLista, linkWhats, produtosAtivos, cartaoProduto } from "../site.js";
iniciarPagina((main, D) => {
  const p = produto(qs("p"));
  if (!p || p.ativo === false) { main.innerHTML = '<div class="carregando">Produto não encontrado. <a class="btn" href="produtos.html">Ver produtos</a></div>'; return; }
  document.title = `${p.nome} — ${D.site.geral.nomeLoja}`;
  const imgs = p.imagens?.length ? p.imagens : [""];
  const relacionados = produtosAtivos().filter((x) => x.id !== p.id && x.categorias?.some((c) => p.categorias?.includes(c))).slice(0, 4);
  const textoWhats = `Olá! Vim pelo site da ${D.site.geral.nomeLoja} e gostaria de um orçamento do produto *${p.nome}*.\n${location.href}\n\n${D.site.contato.mensagemOrcamento || "Aguardo o retorno com valores, prazo de entrega e condições de pagamento. Obrigado!"}`;
  main.innerHTML = `
  <div class="container produto-layout">
    <div>
      <div class="galeria-principal" style="position:relative">${botaoCoracao(p)}<img data-principal src="${esc(imgs[0])}" alt="${esc(p.nome)}"></div>
      ${imgs.length > 1 ? `<div class="miniaturas">${imgs.map((s, i) => `<button data-img="${esc(s)}" class="${i ? "" : "ativo"}"><img src="${esc(s)}" alt=""></button>`).join("")}</div>` : ""}
    </div>
    <div class="produto-info">
      <div class="migalhas"><a href="index.html">Home</a> / <a href="produtos.html">Produtos</a></div>
      <div class="categorias-mini" style="margin-top:14px">${esc(nomeCats(p))}</div>
      <h1>${esc(p.nome)}</h1>
      <div class="preco">${esc(p.preco || "Sob consulta")}</div>
      <div class="conteudo-rico">${p.resumo || ""}</div>
      <div class="produto-acoes">
        <a class="btn grande" href="${linkWhats(textoWhats, D.site.contato.whatsappOrcamento)}" target="_blank" rel="noopener">Obter cotação pelo WhatsApp</a>
        <button class="btn grande contorno" data-add>${naLista(p.id) ? "✓ Na lista de orçamento" : "Adicionar à lista de orçamento"}</button>
        ${p.pdf ? `<a class="btn grande escuro" href="${esc(p.pdf)}" target="_blank" rel="noopener">${esc(p.botao || "Baixe Nosso Folder")}</a>` : ""}
      </div>
    </div>
  </div>
  ${p.descricao ? `<section class="descricao"><div class="container"><h2>Descrição</h2><div class="conteudo-rico">${p.descricao}</div></div></section>` : ""}
  ${relacionados.length ? `<section class="secao cinza"><div class="container"><div class="secao-titulo"><h2>Produtos relacionados</h2></div><div class="grade-produtos">${relacionados.map(cartaoProduto).join("")}</div></div></section>` : ""}`;
  main.querySelectorAll("[data-img]").forEach((b) => b.addEventListener("click", () => {
    main.querySelector("[data-principal]").src = b.dataset.img;
    main.querySelectorAll("[data-img]").forEach((x) => x.classList.toggle("ativo", x === b));
  }));
  main.querySelector("[data-add]").addEventListener("click", (e) => {
    const on = alternarLista(p.id);
    e.target.textContent = on ? "✓ Na lista de orçamento" : "Adicionar à lista de orçamento";
    main.querySelectorAll(`[data-lista]`).forEach((b) => b.classList.toggle("ativo", on));
  });
});

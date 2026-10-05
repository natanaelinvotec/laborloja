import { iniciarPagina, esc, lerLista, produto, alterarQtd, alternarLista, limparLista, montarMensagemOrcamento, linkWhats } from "../site.js";
iniciarPagina((main, D) => {
  main.innerHTML = `<div class="titulo-pagina"><div class="container"><h1>Lista de orçamento</h1><div class="migalhas"><a href="index.html">Home</a> / Orçamento</div></div></div>
    <div class="container pagina-conteudo" data-box></div>`;
  const box = main.querySelector("[data-box]");
  const desenhar = () => {
    const itens = lerLista().map((i) => ({ ...i, p: produto(i.id) })).filter((i) => i.p);
    if (!itens.length) { box.innerHTML = `<div class="vazio">Sua lista está vazia. Toque no ♡ dos produtos para adicioná-los.<br><br><a class="btn" href="produtos.html">Ver produtos</a></div>`; return; }
    box.innerHTML = `<table class="tabela-orcamento"><tbody>${itens.map((i) => `<tr>
      <td style="width:80px"><img src="${esc(i.p.imagens?.[0])}" alt=""></td>
      <td><a href="produto.html?p=${encodeURIComponent(i.id)}"><b>${esc(i.p.nome)}</b></a></td>
      <td style="width:110px"><label>Qtd <input type="number" min="1" value="${i.qtd}" data-qtd="${esc(i.id)}"></label></td>
      <td style="width:40px"><button class="remover" data-rem="${esc(i.id)}" aria-label="Remover">×</button></td></tr>`).join("")}</tbody></table>
      <form class="form-contato" data-enviar style="margin-top:0">
        <h3 style="margin:10px 0 0">Seus dados para o orçamento</h3>
        <input name="nome" placeholder="Seu nome *" required>
        <input name="empresa" placeholder="Empresa / Laboratório / Clínica *" required>
        <input name="cnpj" placeholder="CNPJ ou CPF (para faturamento)">
        <input name="cidade" placeholder="Cidade / UF * (para calcular o frete)" required>
        <input name="contato" placeholder="Telefone ou e-mail">
        <textarea name="obs" placeholder="Observações (prazo desejado, volume mensal, equipamento que já possui…)"></textarea>
        <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn grande">Enviar pedido de cotação pelo WhatsApp</button><button type="button" class="btn grande contorno" data-limpar>Limpar lista</button></div>
      </form>`;
    box.querySelectorAll("[data-qtd]").forEach((inp) => inp.addEventListener("change", () => alterarQtd(inp.dataset.qtd, +inp.value)));
    box.querySelectorAll("[data-rem]").forEach((b) => b.addEventListener("click", () => { alternarLista(b.dataset.rem); desenhar(); }));
    box.querySelector("[data-limpar]").addEventListener("click", () => { limparLista(); desenhar(); });
    box.querySelector("[data-enviar]").addEventListener("submit", (e) => {
      e.preventDefault();
      const cliente = Object.fromEntries(new FormData(e.target));
      const msg = montarMensagemOrcamento(lerLista().map((i) => ({ qtd: i.qtd, nome: produto(i.id)?.nome })).filter((i) => i.nome), cliente);
      open(linkWhats(msg, D.site.contato.whatsappOrcamento), "_blank");
    });
  };
  desenhar();
});

import { iniciarPagina, esc, qs, linkWhats } from "../site.js";
iniciarPagina((main, D) => {
  const pg = D.paginas.find((x) => x.id === qs("p"));
  if (!pg) { main.innerHTML = '<div class="carregando">Página não encontrada.</div>'; return; }
  document.title = `${pg.titulo} — ${D.site.geral.nomeLoja}`;
  main.innerHTML = `<div class="titulo-pagina"><div class="container"><h1>${esc(pg.titulo)}</h1><div class="migalhas"><a href="index.html">Home</a> / ${esc(pg.titulo)}</div></div></div>
  <div class="container pagina-conteudo">
    ${pg.imagem ? `<img src="${esc(pg.imagem)}" alt="" style="border-radius:8px;margin-bottom:30px;max-height:420px;object-fit:cover;width:100%">` : ""}
    <div class="conteudo-rico">${pg.conteudo || ""}</div>
    ${pg.formulario ? `<form class="form-contato" data-contato>
      <input name="nome" required placeholder="Seu nome"><input name="empresa" placeholder="Empresa / Laboratório"><input name="tel" placeholder="Telefone">
      <textarea name="msg" required placeholder="Como podemos ajudar?"></textarea>
      <button class="btn grande">Enviar pelo WhatsApp</button></form>` : ""}
  </div>`;
  main.querySelector("[data-contato]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    open(linkWhats(`Olá! Meu nome é ${f.nome}${f.empresa ? " (" + f.empresa + ")" : ""}.${f.tel ? " Telefone: " + f.tel + "." : ""}\n\n${f.msg}`), "_blank");
  });
});

// Definição dos formulários do painel. Para criar um novo campo editável,
// basta acrescentar uma linha aqui — o painel desenha o formulário sozinho.
// Tipos: texto, area, linhas, numero, check, cor, select, link, imagem, arquivo, galeria, rico, categorias, produtos, lista
import { opcoesIcones } from "../assets/js/icones.js";
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const FONTES = ["Plus Jakarta Sans", "DM Sans", "Manrope", "Rubik", "Source Sans Pro", "Montserrat", "Poppins", "Open Sans", "Roboto", "Lato", "Inter", "Nunito"].map((f) => [f, f]);
const botao = (k = "") => [
  { k: k + "botaoTexto", t: "texto", rot: "Texto do botão" },
  { k: k + "botaoLink", t: "link", rot: "Para onde o botão leva" }
];

export const esquemas = {
  aparencia: {
    titulo: "Aparência", sub: "Logo, cores e letras do site.",
    cartoes: [
      { titulo: "Identidade", campos: [
        { k: "geral.nomeLoja", t: "texto", rot: "Nome da loja" },
        { k: "geral.slogan", t: "texto", rot: "Frase do rodapé", dica: "Aparece embaixo do logo no rodapé" },
        { k: "geral.logo", t: "imagem", rot: "Logo (fundo claro)", dica: "Usado no topo do site. Ideal: PNG com fundo transparente." },
        { k: "geral.logoRodape", t: "imagem", rot: "Logo do rodapé (fundo escuro)" },
        { k: "geral.favicon", t: "imagem", rot: "Ícone da aba do navegador", dica: "Opcional. Se vazio, usa o logo." }
      ]},
      { titulo: "Cores", ajuda: "Clique no quadradinho para escolher a cor.", campos: [
        { k: "geral.corPrincipal", t: "cor", rot: "Cor principal (botões, destaques)" },
        { k: "geral.corTexto", t: "cor", rot: "Cor dos textos" },
        { k: "geral.corFundoCinza", t: "cor", rot: "Cor das faixas de fundo" },
        { k: "geral.corRodape", t: "cor", rot: "Cor do rodapé" }
      ]},
      { titulo: "Letras (fontes)", campos: [
        { k: "geral.fonteTitulos", t: "select", rot: "Fonte dos títulos", opcoes: FONTES },
        { k: "geral.fonteTexto", t: "select", rot: "Fonte dos textos", opcoes: FONTES }
      ]},
      { titulo: "Topo do site", campos: [
        { k: "geral.rotuloOfertas", t: "texto", rot: "Texto do destaque (ex.: OFERTAS)" },
        { k: "geral.linkOfertas", t: "link", rot: "Link do destaque" },
        { k: "geral.avisoTopo", t: "texto", rot: "Aviso à direita do menu", largo: true, dica: "Deixe vazio para esconder" }
      ]}
    ]
  },

  contato: {
    titulo: "Contato e redes", sub: "Números e endereços usados em todo o site.",
    cartoes: [
      { titulo: "WhatsApp", ajuda: "Digite só números, com 55 + DDD. Ex.: 5567999998888", campos: [
        { k: "contato.whatsapp", t: "texto", rot: "WhatsApp principal (botão verde)" },
        { k: "contato.whatsappOrcamento", t: "texto", rot: "WhatsApp que recebe as cotações" },
        { k: "contato.textoBotaoWhatsapp", t: "texto", rot: "Texto ao lado do botão verde" },
        { k: "contato.mensagemOrcamento", t: "area", rot: "Frase final da mensagem de orçamento", dica: "Vai no fim da mensagem que o cliente envia ao pedir cotação." }
      ]},
      { titulo: "Outros contatos", campos: [
        { k: "contato.email", t: "texto", rot: "E-mail" },
        { k: "contato.telefone", t: "texto", rot: "Telefone" },
        { k: "contato.endereco", t: "texto", rot: "Cidade / endereço", largo: true }
      ]},
      { titulo: "Redes sociais", ajuda: "Cole o endereço completo do perfil. Deixe vazio para esconder o ícone.", campos: [
        { k: "contato.facebook", t: "texto", rot: "Facebook" },
        { k: "contato.instagram", t: "texto", rot: "Instagram" }
      ]}
    ]
  },

  home: {
    titulo: "Página inicial", sub: "Cada bloco abaixo corresponde a uma parte da página inicial, de cima para baixo.",
    cartoes: [
      { titulo: "① Banner principal (slides)", ajuda: "Cada slide aparece em sequência, trocando sozinho. Use a seta ↑↓ para mudar a ordem.", campos: [
        { k: "home.slides", t: "lista", item: "Slide", titulo: "titulo", novo: { ativo: true, etiqueta: "", titulo: "", subtitulo: "", linhas: [], preco: "", condicao: "", validade: "", aviso: "", imagem: "", marca: "", selo: "", botaoTexto: "Fale com um especialista", botaoLink: "whatsapp", botao2Texto: "", botao2Link: "", imagemFundo: "", tema: "claro" }, campos: [
          { k: "ativo", t: "check", rot: "Mostrar este slide" },
          { k: "etiqueta", t: "texto", rot: "Etiqueta (ex.: Automação em Bioquímica)" },
          { k: "titulo", t: "texto", rot: "Título grande" },
          { k: "subtitulo", t: "texto", rot: "Frase abaixo do título (opcional)", largo: true },
          { k: "linhas", t: "linhas", rot: "Vantagens (uma por linha, aparecem com ✓)", dica: "Linhas que começam com “Atenção” viram um aviso amarelo." },
          { k: "precoChamada", t: "texto", rot: "Texto acima do preço (ex.: Condição especial)" },
          { k: "preco", t: "texto", rot: "Preço (ex.: R$ 65.000,00)" },
          { k: "condicao", t: "texto", rot: "Condição (ex.: em 10x sem juros)" },
          { k: "validade", t: "texto", rot: "Validade (ex.: Válido até 30/11/2026)" },
          { k: "aviso", t: "texto", rot: "Aviso (opcional)", largo: true },
          { k: "imagem", t: "imagem", rot: "Foto do equipamento", dica: "De preferência PNG sem fundo. Fundo branco também funciona." },
          { k: "marca", t: "imagem", rot: "Logo do fabricante (canto da foto)", dica: "Opcional. Use “Remover fundo” se o logo vier com fundo." },
          { k: "selo", t: "texto", rot: "Selo (ex.: OFERTA, LANÇAMENTO)" },
          { k: "tema", t: "select", rot: "Estilo do fundo", opcoes: [["claro", "Claro (padrão)"], ["escuro", "Azul escuro"], ["foto", "Imagem de fundo"]] },
          { k: "imagemFundo", t: "imagem", rot: "Imagem de fundo (só para o estilo “Imagem de fundo”)" },
          ...botao(""),
          { k: "botao2Texto", t: "texto", rot: "Segundo botão (opcional)" },
          { k: "botao2Link", t: "link", rot: "Para onde o segundo botão leva" }
        ]},
        { k: "home.intervaloSlides", t: "numero", rot: "Tempo de cada slide (segundos)" }
      ]},
      { titulo: "① Cartão ao lado do banner (opcional)", ajuda: "Deixe a imagem vazia para o banner ocupar toda a largura.", campos: [
        { k: "home.destaqueLateral.imagem", t: "imagem", rot: "Imagem", largo: true },
        { k: "home.destaqueLateral.titulo", t: "texto", rot: "Título" },
        { k: "home.destaqueLateral.texto", t: "texto", rot: "Texto" },
        { k: "home.destaqueLateral.selo", t: "texto", rot: "Selo (ex.: OFERTA)" },
        { k: "home.destaqueLateral.link", t: "link", rot: "Para onde leva" }
      ]},
      { titulo: "② Categorias em destaque", ajuda: "Quais categorias aparecem aqui é escolhido em Categorias → “Mostrar na página inicial”.", campos: [
        { k: "home.tituloCategorias", t: "texto", rot: "Título da seção", largo: true }
      ]},
      { titulo: "③ Cartões escuros de promoção", campos: [
        { k: "home.promos", t: "lista", item: "Cartão", titulo: "titulo", novo: { titulo: "", texto: "", botaoTexto: "Saiba mais", botaoLink: "produtos.html", imagem: "" }, campos: [
          { k: "titulo", t: "texto", rot: "Título" }, { k: "texto", t: "texto", rot: "Texto" }, { k: "selo", t: "texto", rot: "Selo (opcional, ex.: PROMOÇÃO)" }, ...botao(), { k: "imagem", t: "imagem", rot: "Imagem (aparece inteira, sem cortes)", largo: true }
        ]}
      ]},
      { titulo: "④ Produtos em destaque", ajuda: "Marque “Destaque na página inicial” no cadastro do produto para ele aparecer aqui.", campos: [
        { k: "home.tituloDestaques", t: "texto", rot: "Título da seção", largo: true }
      ]},
      { titulo: "⑤ Banners grandes", campos: [
        { k: "home.tituloBanners", t: "texto", rot: "Título da seção" },
        { k: "home.linkBannersTexto", t: "texto", rot: "Texto do link à direita" },
        { k: "home.linkBanners", t: "link", rot: "Link à direita" },
        { k: "home.banners", t: "lista", item: "Banner", titulo: "titulo", novo: { titulo: "", texto: "", botaoTexto: "Saiba mais", botaoLink: "produtos.html", imagem: "" }, campos: [
          { k: "titulo", t: "texto", rot: "Título" }, { k: "texto", t: "texto", rot: "Texto" }, ...botao(), { k: "botaoClaro", t: "check", rot: "Botão branco" }, { k: "imagem", t: "imagem", rot: "Imagem de fundo", largo: true }
        ]}
      ]},
      { titulo: "⑥ Carrossel de folders", campos: [
        { k: "home.categoriaFolders", t: "select", rot: "Mostrar os produtos com PDF desta categoria", opcoes: () => window.__categoriasOpcoes?.() || [] }
      ]},
      { titulo: "⑦ Abas de produtos", campos: [
        { k: "home.tituloAbas", t: "texto", rot: "Título da seção", largo: true },
        { k: "home.abas", t: "lista", item: "Aba", titulo: "texto", novo: { texto: "", categoria: "" }, campos: [
          { k: "texto", t: "texto", rot: "Nome da aba" }, { k: "categoria", t: "select", rot: "Categoria mostrada", opcoes: () => window.__categoriasOpcoes?.() || [] }
        ]}
      ]},
      { titulo: "⑧ Listas (Mais visitados, etc.)", campos: [
        { k: "home.listas", t: "lista", item: "Lista", titulo: "titulo", novo: { titulo: "", produtos: [] }, campos: [
          { k: "titulo", t: "texto", rot: "Título", largo: true }, { k: "produtos", t: "produtos", rot: "Produtos da lista" }
        ]},
        { k: "home.tituloPopular", t: "texto", rot: "Título do cartão azul" },
        { k: "home.produtosPopulares", t: "produtos", rot: "Produto do cartão azul (o primeiro marcado aparece)" }
      ]},
      { titulo: "⑨ Nossos Parceiros", campos: [
        { k: "home.tituloParceiros", t: "texto", rot: "Título da seção", largo: true },
        { k: "home.parceiros", t: "lista", item: "Marca", titulo: "nome", novo: { nome: "", imagem: "", link: "" }, campos: [
          { k: "nome", t: "texto", rot: "Nome" }, { k: "link", t: "texto", rot: "Site da marca (opcional)" }, { k: "imagem", t: "imagem", rot: "Logo", largo: true }
        ]}
      ]}
    ]
  },

  menu: {
    titulo: "Menu e rodapé", sub: "Links do topo e do rodapé do site.",
    cartoes: [
      { titulo: "Menu do topo", campos: [
        { k: "menu", t: "lista", item: "Link", titulo: "texto", novo: { texto: "", link: "", mega: false }, campos: [
          { k: "texto", t: "texto", rot: "Texto" }, { k: "link", t: "link", rot: "Endereço" },
          { k: "mega", t: "check", rot: "Abrir o menu de categorias ao passar o mouse" }
        ]}
      ]},
      { titulo: "Menu de categorias (abre ao passar o mouse)", ajuda: "Painel grande com ícones, banner de atendimento e novos produtos.", campos: [
        { k: "megaMenu.itens", t: "lista", item: "Categoria", titulo: "nome", novo: { nome: "", subtitulo: "", icone: "frasco", link: "produtos.html" }, campos: [
          { k: "nome", t: "texto", rot: "Nome" }, { k: "subtitulo", t: "texto", rot: "Texto menor (ex.: marca)" },
          { k: "icone", t: "select", rot: "Ícone", opcoes: opcoesIcones }, { k: "link", t: "link", rot: "Para onde leva" }
        ]},
        { k: "megaMenu.banner.imagem", t: "imagem", rot: "Foto do banner do meio", largo: true },
        { k: "megaMenu.banner.linha1", t: "texto", rot: "Texto 1 (ex.: Converse com nossa)" },
        { k: "megaMenu.banner.destaque", t: "texto", rot: "Texto em destaque (ex.: ESPECIALISTA)" },
        { k: "megaMenu.banner.linha2", t: "texto", rot: "Texto 2 (ex.: EQUIPE PRONTA)" },
        { k: "megaMenu.banner.botaoTexto", t: "texto", rot: "Texto do botão" },
        { k: "megaMenu.banner.botaoLink", t: "link", rot: "Para onde o banner leva" },
        { k: "megaMenu.tituloNovos", t: "texto", rot: "Título da coluna de produtos" },
        { k: "megaMenu.novos", t: "produtos", rot: "Produtos mostrados (até 4)" }
      ]},
      { titulo: "Faixa azul", campos: [
        { k: "rodape.tituloRedes", t: "texto", rot: "Título das redes sociais" },
        { k: "rodape.tituloNovidades", t: "texto", rot: "Título de novidades" },
        { k: "rodape.textoNovidades", t: "area", rot: "Texto de novidades" }
      ]},
      { titulo: "Colunas do rodapé", campos: [
        { k: "rodape.colunas", t: "lista", item: "Coluna", titulo: "titulo", novo: { titulo: "", links: [] }, campos: [
          { k: "titulo", t: "texto", rot: "Título da coluna", largo: true },
          { k: "links", t: "lista", item: "Link", titulo: "texto", novo: { texto: "", link: "" }, campos: [{ k: "texto", t: "texto", rot: "Texto" }, { k: "link", t: "link", rot: "Endereço" }] }
        ]},
        { k: "rodape.copyright", t: "texto", rot: "Texto de direitos autorais", largo: true }
      ]}
    ]
  },

  produtos: {
    titulo: "Produtos", sub: "Clique em Editar para alterar um produto.", novoRotulo: "Novo produto", campoTitulo: "nome", rotuloTitulo: "Nome do produto",
    link: (p) => `produto.html?p=${encodeURIComponent(p.id)}`,
    novo: { nome: "", categorias: [], imagens: [], resumo: "", descricao: "", botao: "Sob consulta", pdf: "", preco: "Sob consulta", destaque: false, ativo: true },
    colunas: [
      { rot: "", v: (p) => `<img src="${esc(p.imagens?.[0] || "")}" alt="">` },
      { rot: "Produto", v: (p) => `<b>${esc(p.nome)}</b>` },
      { rot: "Categorias", mob: false, v: (p, D) => (p.categorias || []).map((c) => D.categorias.find((x) => x.id === c)?.nome).filter(Boolean).slice(0, 2).map((n) => `<span class="selo">${esc(n)}</span>`).join(" ") },
      { rot: "Situação", v: (p) => `${p.ativo === false ? '<span class="selo">Oculto</span>' : '<span class="selo on">No site</span>'} ${p.destaque ? '<span class="selo az">Destaque</span>' : ""}` }
    ],
    cartoes: [
      { titulo: "Informações", campos: [
        { k: "nome", t: "texto", rot: "Nome do produto", largo: true },
        { k: "preco", t: "texto", rot: "Preço", dica: "Ex.: Sob consulta ou R$ 199,90" },
        { k: "botao", t: "texto", rot: "Texto do botão", dica: "Ex.: Sob consulta, Baixe Nosso Folder" },
        { k: "ativo", t: "check", rot: "Mostrar no site" },
        { k: "destaque", t: "check", rot: "Destaque na página inicial" }
      ]},
      { titulo: "Fotos", ajuda: "A primeira foto é a capa. Pode enviar várias de uma vez — elas são otimizadas automaticamente.", campos: [{ k: "imagens", t: "galeria", rot: "Fotos do produto" }] },
      { titulo: "Categorias", campos: [{ k: "categorias", t: "categorias", rot: "Em quais categorias o produto aparece" }] },
      { titulo: "Textos", campos: [
        { k: "resumo", t: "rico", rot: "Resumo (aparece ao lado da foto)" },
        { k: "descricao", t: "rico", rot: "Descrição completa" }
      ]},
      { titulo: "Folder / catálogo em PDF", ajuda: "Se houver um PDF, o botão do produto passa a baixar o arquivo.", campos: [{ k: "pdf", t: "arquivo", rot: "Arquivo PDF", largo: true }] },
      { titulo: "Ordem", campos: [{ k: "ordem", t: "numero", rot: "Posição na lista (menor aparece primeiro)" }] }
    ]
  },

  categorias: {
    titulo: "Categorias", sub: "Organize o catálogo. Subcategorias aparecem dentro da categoria “mãe”.", novoRotulo: "Nova categoria", campoTitulo: "nome", rotuloTitulo: "Nome",
    link: (c) => `produtos.html?cat=${c.id}`,
    novo: { nome: "", pai: "", imagem: "", destaque: false },
    colunas: [
      { rot: "", v: (c) => `<img src="${esc(c.imagem || "")}" alt="">` },
      { rot: "Categoria", v: (c, D) => `<b>${esc(c.nome)}</b>${c.pai ? `<br><small style="color:#6b7785">dentro de ${esc(D.categorias.find((x) => x.id === c.pai)?.nome || "")}</small>` : ""}` },
      { rot: "Produtos", mob: false, v: (c, D) => D.produtos.filter((p) => p.categorias?.includes(c.id)).length },
      { rot: "Início", v: (c) => (c.destaque ? '<span class="selo az">Na página inicial</span>' : "") }
    ],
    cartoes: [{ titulo: "Categoria", campos: [
      { k: "nome", t: "texto", rot: "Nome" },
      { k: "pai", t: "select", rot: "Fica dentro de", opcoes: () => [["", "— Nenhuma (categoria principal) —"], ...(window.__categoriasOpcoes?.() || []).filter(([v]) => v)] },
      { k: "destaque", t: "check", rot: "Mostrar na página inicial" },
      { k: "ordem", t: "numero", rot: "Posição (menor aparece primeiro)" },
      { k: "imagem", t: "imagem", rot: "Imagem", largo: true }
    ]}]
  },

  paginas: {
    titulo: "Páginas", sub: "Textos institucionais: Quem Somos, Contato, Política de privacidade…", novoRotulo: "Nova página", campoTitulo: "titulo", rotuloTitulo: "Título",
    link: (p) => `pagina.html?p=${p.id}`,
    novo: { titulo: "", conteudo: "", imagem: "", noticia: false, formulario: false },
    colunas: [
      { rot: "Página", v: (p) => `<b>${esc(p.titulo)}</b>` },
      { rot: "Endereço", mob: false, v: (p) => `<code>pagina.html?p=${esc(p.id)}</code>` },
    ],
    cartoes: [{ titulo: "Página", campos: [
      { k: "titulo", t: "texto", rot: "Título", largo: true },
      { k: "conteudo", t: "rico", rot: "Conteúdo" },
      { k: "imagem", t: "imagem", rot: "Imagem de capa (opcional)", largo: true },
      { k: "formulario", t: "check", rot: "Mostrar formulário de contato (envia pelo WhatsApp)" }
    ]}]
  }
};

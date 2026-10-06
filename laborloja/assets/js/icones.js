// Ícones de linha simples (desenho próprio, 24×24) usados no mega menu de categorias.
// O nome do ícone é escolhido no painel (Menu e rodapé → Menu de categorias).
const p = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

export const ICONES = {
  monitor:     ["Monitor / Point of Care", p('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M12 7v6M9 10h6"/>')],
  folha:       ["Folha", p('<path d="M5 19c9 0 14-5 14-14-9 0-14 5-14 14z"/><path d="M5 19l8-8"/>')],
  atomo:       ["Átomo / Molecular", p('<circle cx="12" cy="12" r="1.6" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>')],
  maca:        ["Maçã / Alimentos", p('<path d="M12 8c-2-1.6-6-1.4-7 2.5-1 4 1.6 9.5 4.6 9.5 1 0 1.5-.5 2.4-.5s1.4.5 2.4.5c3 0 5.6-5.5 4.6-9.5-1-3.9-5-4.1-7-2.5z"/><path d="M12 8c0-2 1-3.6 3-4.4"/>')],
  gato:        ["Gato / Pet", p('<path d="M5 5l3 4h8l3-4v9a7 7 0 0 1-14 0z"/><circle cx="9.5" cy="13" r=".8" fill="currentColor"/><circle cx="14.5" cy="13" r=".8" fill="currentColor"/><path d="M11 16h2l-1 1z"/>')],
  pata:        ["Pata", p('<circle cx="7" cy="9" r="1.8"/><circle cx="11" cy="6" r="1.8"/><circle cx="15" cy="7" r="1.8"/><circle cx="18" cy="11" r="1.8"/><path d="M8.5 17.5c0-3 2-5.5 4-5.5s4 2.5 4 5c0 2-1.5 2.5-3 2-1-.3-1.6-.3-2.5 0-1.5.5-2.5 0-2.5-1.5z"/>')],
  fazenda:     ["Fazenda / Produção", p('<path d="M3 11l9-6 9 6"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6M9 14l6 6M15 14l-6 6"/>')],
  catalogo:    ["Catálogo / Folder", p('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/>')],
  frasco:      ["Frasco / Laboratório", p('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>')],
  microscopio: ["Microscópio", p('<path d="M6 21h12M9 21a6 6 0 0 1 6-10"/><path d="M10 4l4 2-3 6-4-2z"/><path d="M13 13a3 3 0 0 0 3 3"/>')],
  coracao:     ["Coração / Saúde", p('<path d="M12 20s-7-4.4-8.8-8.6C2 8.4 4 5 7.2 5c1.9 0 3.3 1 4.8 2.8C13.5 6 14.9 5 16.8 5 20 5 22 8.4 20.8 11.4 19 15.6 12 20 12 20z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>')],
  gota:        ["Gota / Sangue", p('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>')],
  virus:       ["Vírus", p('<circle cx="12" cy="12" r="5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>')],
  equipamento: ["Equipamento", p('<rect x="4" y="3" width="16" height="18" rx="2"/><rect x="7" y="6" width="10" height="6" rx="1"/><path d="M8 16h3M15 16h1"/>')]
};

export const iconeSvg = (nome) => (ICONES[nome] || ICONES.frasco)[1];
export const opcoesIcones = () => Object.entries(ICONES).map(([k, [rot]]) => [k, rot]);

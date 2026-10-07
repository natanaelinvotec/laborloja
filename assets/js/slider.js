// Slider do banner principal: troca automática com barra de progresso,
// setas, pontos e arrastar com o dedo. Gira sozinho o tempo todo.
const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ativarSlider(raiz) {
  if (!raiz) return;
  const slides = [...raiz.querySelectorAll(".slide")];
  const pontos = [...raiz.querySelectorAll("[data-ir]")];
  const intervalo = Math.max(3, Number(raiz.dataset.intervalo) || 7) * 1000;
  let atual = 0, timer = null, pausado = false;

  raiz.style.setProperty("--intervalo", intervalo + "ms");
  const mostrar = (i) => {
    atual = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      const ativo = k === atual;
      s.classList.toggle("ativo", ativo);
      s.setAttribute("aria-hidden", ativo ? "false" : "true");
      s.querySelectorAll("a,button").forEach((el) => (ativo ? el.removeAttribute("tabindex") : el.setAttribute("tabindex", "-1")));
    });
    pontos.forEach((p, k) => {
      p.classList.toggle("ativo", k === atual);
      // reinicia a animação da barrinha de progresso
      const barra = p.querySelector("span"); if (barra) { barra.style.animation = "none"; void barra.offsetWidth; barra.style.animation = ""; }
    });
    agendar();
  };
  const agendar = () => {
    clearTimeout(timer);
    if (slides.length > 1 && !pausado) timer = setTimeout(() => mostrar(atual + 1), intervalo);
  };

  raiz.querySelector(".ant")?.addEventListener("click", () => mostrar(atual - 1));
  raiz.querySelector(".prox")?.addEventListener("click", () => mostrar(atual + 1));
  pontos.forEach((p) => p.addEventListener("click", () => mostrar(+p.dataset.ir)));

  // gira sozinho sempre; só pausa quando a aba do navegador está escondida
  const pausar = (v) => { pausado = v; raiz.classList.toggle("pausado", v); agendar(); };
  document.addEventListener("visibilitychange", () => pausar(document.hidden));

  // arrastar / deslizar
  let x0 = null;
  raiz.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") x0 = e.clientX; });
  raiz.addEventListener("pointerup", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 45) mostrar(atual + (dx < 0 ? 1 : -1));
  });
  raiz.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") mostrar(atual - 1);
    if (e.key === "ArrowRight") mostrar(atual + 1);
  });

  // efeito de profundidade: o produto acompanha levemente o mouse
  if (!reduzir && matchMedia("(hover: hover)").matches) {
    raiz.addEventListener("mousemove", (e) => {
      const r = raiz.getBoundingClientRect();
      raiz.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      raiz.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    raiz.addEventListener("mouseleave", () => { raiz.style.setProperty("--mx", 0); raiz.style.setProperty("--my", 0); });
  }
  mostrar(0);
}

const greetings = [
  { lang: "EN", text: "Hello World" },
  { lang: "ES", text: "Hola Mundo" },
  { lang: "FR", text: "Bonjour le Monde" },
  { lang: "DE", text: "Hallo Welt" },
  { lang: "JP", text: "こんにちは世界" },
  { lang: "IT", text: "Ciao Mondo" },
  { lang: "PT", text: "Olá Mundo" },
  { lang: "KO", text: "안녕 세상" },
];

const palettes = [
  { id: "signal", label: "Signal" },
  { id: "citrus", label: "Citrus" },
  { id: "bloom", label: "Bloom" },
];

const greetingEl = document.getElementById("greeting");
const langTag = document.getElementById("langTag");
const paletteTag = document.getElementById("paletteTag");
const burstCountEl = document.getElementById("burstCount");
const floaters = document.getElementById("floaters");
const spotlight = document.querySelector(".spotlight");
const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

let langIndex = 0;
let paletteIndex = 0;
let bursts = 0;
let pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.4 };
let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const particles = [];
const PARTICLE_COUNT = 48;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function spawnParticles() {
  particles.length = 0;
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.2 + Math.random() * 2.4,
    });
  }
}

function particleColor() {
  return getComputedStyle(document.documentElement).getPropertyValue("--particle").trim();
}

function drawField() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const color = particleColor();

  for (const p of particles) {
    const dx = pointer.x - p.x;
    const dy = pointer.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    const pull = Math.min(28 / dist, 0.45);

    if (!reduceMotion) {
      p.vx += (dx / dist) * pull * 0.08;
      p.vy += (dy / dist) * pull * 0.08;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;
      if (p.y < -20) p.y = window.innerHeight + 20;
      if (p.y > window.innerHeight + 20) p.y = -20;
    }

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 120) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(drawField);
}

function setGreeting(index) {
  langIndex = (index + greetings.length) % greetings.length;
  const item = greetings[langIndex];
  greetingEl.textContent = item.text;
  greetingEl.dataset.lang = item.lang;
  langTag.textContent = item.lang;
}

function setPalette(index) {
  paletteIndex = (index + palettes.length) % palettes.length;
  const item = palettes[paletteIndex];
  if (item.id === "signal") {
    document.documentElement.removeAttribute("data-palette");
  } else {
    document.documentElement.setAttribute("data-palette", item.id);
  }
  paletteTag.textContent = item.label;
}

function burstHello(originX, originY) {
  bursts += 1;
  burstCountEl.textContent = String(bursts);
  greetingEl.classList.remove("is-bursting");
  void greetingEl.offsetWidth;
  greetingEl.classList.add("is-bursting");

  const word = greetings[langIndex].text.split(/\s+/)[0] || "Hello";
  const count = reduceMotion ? 4 : 14;

  for (let i = 0; i < count; i += 1) {
    const node = document.createElement("span");
    node.className = "floater";
    node.textContent = word;
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const distance = 80 + Math.random() * 140;
    node.style.left = `${originX}px`;
    node.style.top = `${originY}px`;
    node.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    node.style.setProperty("--dy", `${Math.sin(angle) * distance - 40}px`);
    floaters.appendChild(node);
    window.setTimeout(() => node.remove(), 1200);
  }
}

document.getElementById("langBtn").addEventListener("click", () => {
  setGreeting(langIndex + 1);
});

document.getElementById("paletteBtn").addEventListener("click", () => {
  setPalette(paletteIndex + 1);
});

document.getElementById("burstBtn").addEventListener("click", (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  burstHello(rect.left + rect.width / 2, rect.top + rect.height / 2);
});

greetingEl.addEventListener("click", (event) => {
  burstHello(event.clientX, event.clientY);
});

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  document.body.classList.add("is-tracking");
  spotlight.style.left = `${event.clientX}px`;
  spotlight.style.top = `${event.clientY}px`;
});

window.addEventListener("pointerleave", () => {
  document.body.classList.remove("is-tracking");
});

window.addEventListener("resize", () => {
  resizeCanvas();
  spawnParticles();
});

window
  .matchMedia("(prefers-reduced-motion: reduce)")
  .addEventListener("change", (event) => {
    reduceMotion = event.matches;
  });

resizeCanvas();
spawnParticles();
setGreeting(0);
setPalette(0);
drawField();

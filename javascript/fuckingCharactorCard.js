document.addEventListener("DOMContentLoaded", function () {
  //Codes for Charactor card

  const w = document.getElementById("w"),
    c = document.getElementById("c"),
    ma = document.getElementById("ma"),
    mia = document.getElementById("mia"),
    pn = document.getElementById("pn"),
    pt = document.getElementById("pt"),
    ph = document.getElementById("ph"),
    ps = document.getElementById("ps"),
    cb = document.getElementById("cb");
  const CFG = { S: 600, I: 1500, IX: 70, IY: 60 };
  const N = "KRLEE",
    T = "Software Engineer",
    H = "GISNE4",
    S = "Online",
    CT = "Contact Me",
    A = "resourses/Untitled-2.png";
  // NEW: Customizable Color/Design Values
  const CLR = {
    mainBg: "#1a1a1a",
    textLight: "white",
    textMedium: "rgba(255, 255, 255, 0.7)",
    cardInnerBgOpacity: 0.9,
    glassBaseOpacity: 0.1,
    buttonHoverOpacity: 0.4,
    h3GradBottom: "#6f6fbe",
    pGradBottom: "#4a4ac0",
  };
  const V = {
    clamp: (v, n = 0, x = 100) => Math.min(Math.max(v, n), x),
    round: (v, p = 3) => parseFloat(v.toFixed(p)),
    adj: (v, fm, fM, tm, tM) =>
      V.round(tm + ((tM - tm) * (v - fm)) / (fM - fm)),
    ease: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  };
  let animId = null;
  const upd = (_, Y) => {
    const W = c.clientWidth,
      H = c.clientHeight,
      pX = V.clamp((100 / W) * _),
      pY = V.clamp((100 / H) * Y),
      cX = pX - 50,
      cY = pY - 50;
    w.style.setProperty("--pointer-x", `${pX}%`);
    w.style.setProperty("--pointer-y", `${pY}%`);
    w.style.setProperty("--background-x", `${V.adj(pX, 0, 100, 35, 65)}%`);
    w.style.setProperty("--background-y", `${V.adj(pY, 0, 100, 35, 65)}%`);
    w.style.setProperty(
      "--pointer-from-center",
      `${V.clamp(Math.hypot(pY - 50, pX - 50) / 50, 0, 1)}`
    );
    w.style.setProperty("--pointer-from-top", `${pY / 100}`);
    w.style.setProperty("--pointer-from-left", `${pX / 100}`);
    w.style.setProperty("--rotate-x", `${V.round(-(cX / 5))}deg`);
    w.style.setProperty("--rotate-y", `${V.round(cY / 4)}deg`);
  };
  const startA = (d, sX, sY) => {
    const st = performance.now(),
      tX = w.clientWidth / 2,
      tY = w.clientHeight / 2;
    const ani = (ct) => {
      const el = ct - st,
        pr = V.clamp(el / d, 0, 1),
        eP = V.ease(pr),
        cuX = V.adj(eP, 0, 1, sX, tX),
        cuY = V.adj(eP, 0, 1, sY, tY);
      upd(cuX, cuY);
      if (pr < 1) {
        animId = requestAnimationFrame(ani);
      } else {
        animId = null;
      }
    };
    cancelAnimationFrame(animId);
    animId = requestAnimationFrame(ani);
  };
  const hPM = (e) => {
    const r = c.getBoundingClientRect();
    upd(e.clientX - r.left, e.clientY - r.top);
  };
  const hPE = () => {
    cancelAnimationFrame(animId);
    w.classList.add("active");
    c.classList.add("active");
  };
  const hPL = (e) => {
    startA(CFG.S, e.offsetX, e.offsetY);
    w.classList.remove("active");
    c.classList.remove("active");
  };
  const oCC = () => {
    console.log("Contact clicked");
  };

  if (!c || !w) {
    return;
  }
  ma.src = A;
  ma.alt = `${N} avatar`;
  mia.src = A;
  mia.alt = `${N} mini avatar`;
  pn.textContent = N;
  pt.textContent = T;
  ph.textContent = `@${H}`;
  ps.textContent = S;
  cb.textContent = CT;
  cb.setAttribute("aria-label", `Contact ${N}`);
  // NEW: Set custom color/design properties
  w.style.setProperty("--pc-main-bg", CLR.mainBg);
  w.style.setProperty("--pc-text-light", CLR.textLight);
  w.style.setProperty("--pc-text-medium", CLR.textMedium);
  w.style.setProperty("--pc-card-inner-bg-opacity", CLR.cardInnerBgOpacity);
  w.style.setProperty("--pc-glass-base-opacity", CLR.glassBaseOpacity);
  w.style.setProperty("--pc-button-hover-opacity", CLR.buttonHoverOpacity);
  w.style.setProperty("--pc-h3-gradient-bottom", CLR.h3GradBottom);
  w.style.setProperty("--pc-p-gradient-bottom", CLR.pGradBottom);

  w.style.setProperty(
    "--behind-gradient",
    "radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)"
  );
  w.style.setProperty(
    "--inner-gradient",
    "linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
  );
  c.addEventListener("pointerenter", hPE);
  c.addEventListener("pointermove", hPM);
  c.addEventListener("pointerleave", hPL);
  cb.addEventListener("click", oCC);
  const iX = w.clientWidth - CFG.IX,
    iY = CFG.IY;
  upd(iX, iY);
  startA(CFG.I, iX, iY);

  window.addEventListener("beforeunload", () => {
    if (c) {
      c.removeEventListener("pointerenter", hPE);
      c.removeEventListener("pointermove", hPM);
      c.removeEventListener("pointerleave", hPL);
    }
    if (cb) {
      cb.removeEventListener("click", oCC);
    }
    cancelAnimationFrame(animId);
  });
});

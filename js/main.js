/* ==========================================================================
   KESAR BOTANICALS — interactions
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Sticky nav shadow ---------- */
  const nav = document.getElementById("nav");
  const onScrollNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");

  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });

  navLinks.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Gentle parallax ---------- */
  const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
  if (parallaxEls.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let ticking = false;
    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const speed = parseFloat(el.dataset.parallax) || 0.05;
        const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
        el.style.transform = `translate3d(0, ${(-offset).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- Toast helper ---------- */
  let toastEl = null;
  let toastTimer = null;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
  }

  /* ---------- Quantity selector ---------- */
  const qtyValue = document.getElementById("qtyValue");
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  let qty = 1;

  function setQty(v) {
    qty = Math.min(10, Math.max(1, v));
    qtyValue.textContent = qty;
  }
  qtyMinus.addEventListener("click", () => setQty(qty - 1));
  qtyPlus.addEventListener("click", () => setQty(qty + 1));

  /* ---------- Cart ---------- */
  const cartCount = document.getElementById("cartCount");
  let cart = 0;

  function bumpCart() {
    cart += qty;
    cartCount.textContent = cart;
    cartCount.classList.add("is-visible");
    cartCount.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.5)" }, { transform: "scale(1)" }],
      { duration: 350, easing: "ease-out" }
    );
  }

  document.getElementById("addToCart").addEventListener("click", () => {
    bumpCart();
    toast(`Added ${qty} bar${qty > 1 ? "s" : ""} to your cart`);
  });

  document.getElementById("buyNow").addEventListener("click", () => {
    toast("Taking you to secure checkout…");
  });

  /* ---------- Testimonial carousel ---------- */
  const track = document.getElementById("carouselTrack");
  const dotsWrap = document.getElementById("carouselDots");
  const prevBtn = document.getElementById("prevReview");
  const nextBtn = document.getElementById("nextReview");
  const cards = track.children.length;

  let index = 0;
  let autoTimer = null;

  function perView() {
    return window.matchMedia("(max-width: 760px)").matches ? 1 : 2;
  }
  function maxIndex() {
    return Math.max(0, cards - perView());
  }

  function renderDots() {
    dotsWrap.innerHTML = "";
    for (let i = 0; i <= maxIndex(); i++) {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", `Go to review ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(i) {
    index = Math.min(maxIndex(), Math.max(0, i));
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const slideW = track.children[0].getBoundingClientRect().width + gap;
    track.style.transform = `translateX(${-index * slideW}px)`;
    Array.from(dotsWrap.children).forEach((d, di) =>
      d.classList.toggle("is-active", d === dotsWrap.children[index])
    );
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === maxIndex();
  }

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));

  window.addEventListener("resize", () => {
    renderDots();
    goTo(0);
  });

  renderDots();
  goTo(0);

  /* auto-advance, pause on hover */
  let auto = setInterval(() => {
    goTo(index >= maxIndex() ? 0 : index + 1);
  }, 6000);

  const carousel = document.querySelector(".carousel");
  carousel.addEventListener("mouseenter", () => clearInterval(auto));
  carousel.addEventListener("mouseleave", () => {
    auto = setInterval(() => {
      goTo(index >= maxIndex() ? 0 : index + 1);
    }, 6000);
  });

  /* ---------- Newsletter ---------- */
  const newsForm = document.getElementById("newsForm");
  const newsMsg = document.getElementById("newsMsg");
  newsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    newsForm.hidden = true;
    newsMsg.hidden = false;
  });

  /* ---------- Mobile sticky CTA ---------- */
  const stickyCta = document.getElementById("stickyCta");
  const shopSection = document.getElementById("shop");
  const footer = document.getElementById("contact");

  const onScrollSticky = () => {
    if (window.innerWidth > 760) return;
    const shopRect = shopSection.getBoundingClientRect();
    const footRect = footer.getBoundingClientRect();
    const inShopZone =
      shopRect.top < window.innerHeight * 0.6 && footRect.top > window.innerHeight;
    stickyCta.classList.toggle("is-visible", inShopZone);
  };
  window.addEventListener("scroll", onScrollSticky, { passive: true });
  onScrollSticky();
})();
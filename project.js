// Shared script for all project pages
(function () {
  // ANIMATION SETTINGS: change these values
  var GLIDE = 120;     // distance that the page glides, in pixels
  var OUT_TIME = 220;  // time for the page to glide out, in milliseconds
  var IN_TIME = 520;   // time for the page to glide in, in milliseconds

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sheet = document.querySelector(".sheet");

  function remember(d) { try { sessionStorage.setItem("glide", String(d)); } catch (e) {} }

  // 1. Glide the page in. The direction comes from the Previous or Next link.
  var dir = 0;
  try { dir = parseInt(sessionStorage.getItem("glide") || "0", 10) || 0; sessionStorage.removeItem("glide"); } catch (e) {}
  if (sheet && sheet.animate && !reduce) {
    sheet.animate(
      [{ opacity: 0, transform: dir ? "translateX(" + dir * GLIDE + "px)" : "translateY(16px)" },
       { opacity: 1, transform: "none" }],
      { duration: IN_TIME, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
    );
  }

  // 2. Glide the page out when a Previous or Next link is selected
  document.querySelectorAll("[data-glide]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var d = parseInt(a.getAttribute("data-glide"), 10);
      remember(d);
      if (reduce || !sheet || !sheet.animate || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      var out = sheet.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(" + -d * GLIDE + "px)" }],
        { duration: OUT_TIME, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" }
      );
      out.onfinish = function () { window.location.href = a.href; };
    });
  });

  // If the person uses the browser Back button, show the page again
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && sheet && sheet.getAnimations) sheet.getAnimations().forEach(function (x) { x.cancel(); });
  });

  // 3. Full-screen picture viewer
  var viewer = document.querySelector(".viewer");
  var pics = Array.prototype.slice.call(document.querySelectorAll(".grid img"));
  var vImg = viewer.querySelector("img");
  var vCap = viewer.querySelector("figcaption");
  var index = 0;

  function show(i, d) {
    index = (i + pics.length) % pics.length;
    vImg.src = pics[index].src;
    vImg.alt = pics[index].alt;
    vCap.textContent = pics[index].alt + "  (" + (index + 1) + " of " + pics.length + ")";
    if (d && vImg.animate && !reduce) {
      vImg.animate([{ opacity: 0, transform: "translateX(" + d * 60 + "px)" }, { opacity: 1, transform: "none" }],
        { duration: 320, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" });
    }
    var many = pics.length > 1;
    viewer.querySelector(".v-prev").hidden = !many;
    viewer.querySelector(".v-next").hidden = !many;
  }

  document.querySelectorAll(".pic").forEach(function (b) {
    b.addEventListener("click", function () {
      show(parseInt(b.getAttribute("data-index"), 10) || 0);
      if (viewer.showModal) viewer.showModal(); else viewer.setAttribute("open", "");
    });
  });
  function close() { if (viewer.close) viewer.close(); else viewer.removeAttribute("open"); }
  viewer.querySelector(".v-close").addEventListener("click", close);
  viewer.querySelector(".v-prev").addEventListener("click", function () { show(index - 1, -1); });
  viewer.querySelector(".v-next").addEventListener("click", function () { show(index + 1, 1); });
  viewer.addEventListener("click", function (e) { if (e.target === viewer) close(); });
  viewer.addEventListener("keydown", function (e) {
    if (pics.length < 2) return;
    if (e.key === "ArrowLeft") show(index - 1, -1);
    if (e.key === "ArrowRight") show(index + 1, 1);
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();

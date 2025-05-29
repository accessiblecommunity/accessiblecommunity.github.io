document.addEventListener("DOMContentLoaded", function () {
  const mobileNav = document.getElementById("site-nav");

  if (mobileNav) {
    mobileNav.addEventListener("shown.bs.collapse", () => {
      document.body.classList.add("no-scroll");
    });

    mobileNav.addEventListener("hidden.bs.collapse", () => {
      document.body.classList.remove("no-scroll");
    });
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", chargerBurgerMenu);
} else {
  chargerBurgerMenu();
}

async function chargerBurgerMenu() {
  const container = document.getElementById("burger-menu-container");

  if (!container) return;

  const siteBase = window.SITE_BASE || "";

  try {
    const response = await fetch(siteBase + "/OBJETS/BLOCS/burger-menu.html");

    if (!response.ok) {
      throw new Error("Impossible de charger le menu");
    }

    const html = await response.text();
    container.innerHTML = html;

    corrigerLiensAvecSiteBase(container);

    const burgerButton = container.querySelector(".burger-button");
    const burgerNav = container.querySelector(".burger-nav");

    if (!burgerButton || !burgerNav) return;

    burgerButton.addEventListener("click", () => {
      const isOpen = burgerButton.classList.toggle("is-open");
      burgerNav.classList.toggle("is-open", isOpen);
      burgerButton.setAttribute("aria-expanded", String(isOpen));
    });

    container.addEventListener("click", (event) => {
      const lienLightbox = event.target.closest("[data-lightbox-information-message]");

      if (!lienLightbox) return;

      event.preventDefault();

      const titre = lienLightbox.dataset.lightboxInformationTitle || "Information";
      const message = lienLightbox.dataset.lightboxInformationMessage || "";

      afficherLightboxInformation(titre, message);
    });

    document.addEventListener("click", (event) => {
      const clickInsideMenu = container.contains(event.target);

      if (!clickInsideMenu) {
        burgerButton.classList.remove("is-open");
        burgerNav.classList.remove("is-open");
        burgerButton.setAttribute("aria-expanded", "false");
      }
    });
  } catch (error) {
    console.error("Erreur de chargement du burger menu :", error);
  }
}

function corrigerLiensAvecSiteBase(scope) {
  const siteBase = window.SITE_BASE || "";

  if (!siteBase) return;

  scope.querySelectorAll("a[href^='/']").forEach((lien) => {
    lien.setAttribute("href", siteBase + lien.getAttribute("href"));
  });

  scope.querySelectorAll("img[src^='/']").forEach((image) => {
    image.setAttribute("src", siteBase + image.getAttribute("src"));
  });
}
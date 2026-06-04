if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", chargerFooter);
} else {
  chargerFooter();
}

async function chargerFooter() {
  const container = document.getElementById("footer-container");

  if (!container) return;

  const siteBase = window.SITE_BASE || "";

  try {
    const response = await fetch(siteBase + "/OBJETS/BLOCS/footer.html");

    if (!response.ok) {
      throw new Error("Impossible de charger le footer");
    }

    const html = await response.text();
    container.innerHTML = html;

    corrigerLiensFooterAvecSiteBase(container);
  } catch (error) {
    console.error("Erreur de chargement du footer :", error);
  }
}

function corrigerLiensFooterAvecSiteBase(scope) {
  const siteBase = window.SITE_BASE || "";

  if (!siteBase) return;

  scope.querySelectorAll("a[href^='/']").forEach((lien) => {
    lien.setAttribute("href", siteBase + lien.getAttribute("href"));
  });
}
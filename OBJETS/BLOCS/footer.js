document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("footer-container");

  if (!container) return;

  try {
    const response = await fetch("/OBJETS/BLOCS/footer.html");

    if (!response.ok) {
      throw new Error("Impossible de charger le footer");
    }

    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error("Erreur de chargement du footer :", error);
  }
});
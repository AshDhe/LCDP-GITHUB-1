let lightboxInformationReady = null;

document.addEventListener("DOMContentLoaded", () => {
  lightboxInformationReady = chargerLightboxInformation();
});

async function chargerLightboxInformation() {
  const container = document.getElementById("lightbox-information-container");

  if (!container) return;

  try {
    const response = await fetch("/OBJETS/BLOCS/lightbox-information.html");

    if (!response.ok) {
      throw new Error("Impossible de charger la lightbox d'information");
    }

    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error("Erreur lightbox d'information :", error);
  }
}

window.afficherLightboxInformation = async function (
  titre,
  message,
  options = {}
) {
  if (lightboxInformationReady) {
    await lightboxInformationReady;
  }

  const lightbox = document.getElementById("lightbox-information");
  const titleElement = document.getElementById("lightbox-information-title");
  const messageElement = document.getElementById("lightbox-information-message");
  const okButton = document.getElementById("lightbox-information-ok");

  if (!lightbox || !titleElement || !messageElement || !okButton) return;

  titleElement.textContent = titre;
  messageElement.textContent = message;

  lightbox.hidden = false;

  okButton.onclick = () => {
    lightbox.hidden = true;

    if (options.redirectUrl) {
      window.location.href = options.redirectUrl;
    }
  };
};
document.addEventListener("DOMContentLoaded", () => {
  const formulaire = document.getElementById("formulaire-mdp-compte");
  const champMotDePasse = document.getElementById("mdp-membre");
  const boutonValider = document.getElementById("bouton-valider-formulaire");

  const params = new URLSearchParams(window.location.search);

  const token = params.get("token");
  const mode = params.get("mode");

  const URL_WORKER_MDPTOKENZ =
    "https://worker-mdpokenz.hugues-pavret.workers.dev/";

  if (!formulaire || !champMotDePasse || !boutonValider) {
    afficherMessage("Erreur technique : formulaire incomplet.");
    return;
  }

  if (!token) {
    champMotDePasse.disabled = true;
    boutonValider.disabled = true;
    afficherMessage("Le lien utilisé n’est pas valide ou a expiré.");
    return;
  }

  formulaire.addEventListener("submit", async (event) => {
    event.preventDefault();

    const passwordmembre = champMotDePasse.value.trim();

    if (!passwordmembre) {
      afficherMessage("Veuillez saisir un mot de passe.");
      return;
    }

    if (passwordmembre.length < 10) {
      afficherMessage("Le mot de passe doit contenir au moins 10 caractères.");
      return;
    }

    boutonValider.disabled = true;
    boutonValider.textContent = "Validation en cours...";

    const payload = {
      action: "write-mdp",
      token,
      passwordmembre
    };

    if (mode) {
      payload.mode = mode;
    }

    try {
      const response = await fetch(URL_WORKER_MDPTOKENZ, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || data.success !== true) {
        afficherMessage(
          data?.message || "La demande n’a pas pu être enregistrée."
        );

        boutonValider.disabled = false;
        boutonValider.textContent = "Valider";
        return;
      }

      afficherMessage("Votre demande est enregistrée", () => {
        window.location.href =
          window.SITE_BASE + "/PAGES/PUBLIQUES/CONNEXION%20MEMBRE/connexion-membre.html";
      });

    } catch (error) {
      afficherMessage("Une erreur est survenue. Veuillez réessayer.");

      boutonValider.disabled = false;
      boutonValider.textContent = "Valider";
    }
  });

  function afficherMessage(message, callback) {
    if (typeof window.afficherLightboxInformation === "function") {
      window.afficherLightboxInformation(message, callback);
      return;
    }

    alert(message);

    if (typeof callback === "function") {
      callback();
    }
  }
});
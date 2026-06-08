if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiserPageMdpMembre);
} else {
  initialiserPageMdpMembre();
}

function initialiserPageMdpMembre() {
  const formulaire = document.getElementById("formulaire-mdp-compte");
  const champMotDePasse = document.getElementById("mdp-membre");
  const boutonValider = document.getElementById("bouton-valider-formulaire");
  const afficherMotDePasse = document.getElementById("afficher-mdp-membre");

  const params = new URLSearchParams(window.location.search);

  const token = params.get("token");
  const mode = params.get("mode");

  const URL_WORKER_MDPTOKENZ =
    "https://worker-mdptokenz.hugues-pavret.workers.dev/";

  const URL_CONNEXION_MEMBRE =
    "/PAGES/PUBLIQUES/CONNEXION%20MEMBRE/connexion-membre.html";

  let envoiEnCours = false;

  if (!formulaire || !champMotDePasse || !boutonValider) {
    afficherInformation(
      "Erreur technique",
      "Le formulaire est incomplet. Veuillez réessayer plus tard.",
      "erreur"
    );
    return;
  }

  if (!token || !mode) {
    champMotDePasse.disabled = true;
    boutonValider.disabled = true;

    afficherInformation(
      "Lien invalide",
      "Le lien utilisé n’est pas valide ou a expiré.",
      "erreur"
    );
    return;
  }

  if (afficherMotDePasse) {
    afficherMotDePasse.addEventListener("change", () => {
      champMotDePasse.type = afficherMotDePasse.checked ? "text" : "password";
    });
  }

  boutonValider.addEventListener("click", traiterValidationMotDePasse);

  formulaire.addEventListener("submit", (event) => {
    event.preventDefault();
    traiterValidationMotDePasse();
  });

  async function traiterValidationMotDePasse() {
    if (envoiEnCours) return;

    const passwordmembre = champMotDePasse.value.trim();

    if (!passwordmembre) {
      afficherInformation(
        "Mot de passe manquant",
        "Veuillez saisir un mot de passe.",
        "erreur"
      );
      return;
    }

    if (passwordmembre.length < 10) {
      afficherInformation(
        "Mot de passe trop court",
        "Le mot de passe doit contenir au moins 10 caractères.",
        "erreur"
      );
      return;
    }

    envoiEnCours = true;
    boutonValider.disabled = true;
    boutonValider.textContent = "Validation en cours...";

    const payload = {
      action: "write-mdp",
      token,
      mode,
      passwordmembre
    };

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
        console.error("Erreur worker MDP :", data);

        afficherInformation(
          "Demande non enregistrée",
          data?.message || "La demande n’a pas pu être enregistrée.",
          "erreur"
        );

        envoiEnCours = false;
        boutonValider.disabled = false;
        boutonValider.textContent = "Valider";
        return;
      }

      afficherInformation(
        "Demande enregistrée",
        "Votre mot de passe a bien été enregistré. Vous pouvez maintenant vous connecter à votre compte membre.",
        "validation",
        URL_CONNEXION_MEMBRE
      );

    } catch (error) {
      console.error("Erreur appel worker MDP :", error);

      afficherInformation(
        "Erreur",
        "Une erreur est survenue. Veuillez réessayer.",
        "erreur"
      );

      envoiEnCours = false;
      boutonValider.disabled = false;
      boutonValider.textContent = "Valider";
    }
  }

  async function afficherInformation(titre, message, type = "information", redirectUrl = null) {
    if (typeof window.afficherLightboxInformation === "function") {
      await window.afficherLightboxInformation(titre, message, {
        type,
        redirectUrl
      });
      return;
    }

    alert(message);

    if (redirectUrl) {
      window.location.href = window.SITE_BASE + redirectUrl;
    }
  }
}
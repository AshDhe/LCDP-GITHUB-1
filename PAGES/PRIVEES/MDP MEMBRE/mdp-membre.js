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

  if (!formulaire || !champMotDePasse || !boutonValider) {
    afficherInformation(
      "Erreur technique",
      "Le formulaire est incomplet. Veuillez réessayer plus tard.",
      "erreur"
    );
    return;
  }

if (afficherMotDePasse) {
  afficherMotDePasse.addEventListener("change", () => {
    champMotDePasse.type = afficherMotDePasse.checked ? "text" : "password";
  });
}

  if (!token) {
    champMotDePasse.disabled = true;
    boutonValider.disabled = true;

    afficherInformation(
      "Lien invalide",
      "Le lien utilisé n’est pas valide ou a expiré.",
      "erreur"
    );
    return;
  }

  boutonValider.addEventListener("click", traiterValidationMotDePasse);

  formulaire.addEventListener("submit", (event) => {
    event.preventDefault();
    traiterValidationMotDePasse();
  });

  async function traiterValidationMotDePasse() {
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
  console.error("Erreur complète worker MDP :", data);

  afficherInformation(
    "Demande non enregistrée",
    data?.detail || data?.message || "La demande n’a pas pu être enregistrée.",
    "erreur"
  );

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
      afficherInformation(
        "Erreur",
        "Une erreur est survenue. Veuillez réessayer.",
        "erreur"
      );

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
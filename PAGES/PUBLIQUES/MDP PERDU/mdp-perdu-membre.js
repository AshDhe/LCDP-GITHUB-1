document.addEventListener("DOMContentLoaded", () => {
  const formulaire = document.getElementById("formulaire-mdp-perdu-membre");
  const champEmail = document.getElementById("emailmembre");
  const boutonValider = document.getElementById("bouton-valider-formulaire");

  const URL_WORKER_EMAILTOKENZ =
    "https://worker-emailtokenz.hugues-pavret.workers.dev/mdp-perdu";

  if (!formulaire || !champEmail || !boutonValider) {
    afficherMessage("Erreur technique : formulaire incomplet.");
    return;
  }

  boutonValider.addEventListener("click", envoyerDemandeMdpPerdu);

  formulaire.addEventListener("submit", (event) => {
    event.preventDefault();
    envoyerDemandeMdpPerdu();
  });

  async function envoyerDemandeMdpPerdu() {
    const emailmembre = champEmail.value.trim().toLowerCase();

    if (!emailmembre) {
      afficherMessage("Veuillez saisir votre adresse e-mail.");
      return;
    }

    if (!emailValide(emailmembre)) {
      afficherMessage("L’adresse e-mail saisie n’est pas valide.");
      return;
    }

    boutonValider.disabled = true;
    boutonValider.textContent = "Envoi en cours...";

    try {
      const response = await fetch(URL_WORKER_EMAILTOKENZ, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emailmembre
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || data.success !== true) {
        afficherMessage(
          data?.message || "La demande n’a pas pu être enregistrée."
        );

        boutonValider.disabled = false;
        boutonValider.textContent = "Envoyer";
        return;
      }

      afficherMessage(
        "Si un compte membre correspond à cette adresse e-mail, un lien vient d’être envoyé."
      );

      champEmail.value = "";
      boutonValider.disabled = false;
      boutonValider.textContent = "Envoyer";

    } catch (error) {
      afficherMessage("Une erreur est survenue. Veuillez réessayer.");

      boutonValider.disabled = false;
      boutonValider.textContent = "Envoyer";
    }
  }

  function emailValide(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

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
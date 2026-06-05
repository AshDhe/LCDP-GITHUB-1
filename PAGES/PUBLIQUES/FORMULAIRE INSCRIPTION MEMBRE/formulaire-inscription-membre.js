const WORKER_URL = "https://lcdp-github-1.hugues-pavret.workers.dev/";
const REDIRECT_URL = "/index.html?source=formulaire-inscription-membre";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".formulaire-inscription");

  if (!form) {
    console.error("Formulaire introuvable.");
    return;
  }

  const submitButton = document.getElementById("bouton-envoyer-inscription");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  submitButton.addEventListener("click", async () => {

    const erreur = verifierFormulaire(form);

    if (erreur) {
      afficherAlerte("Attention", erreur);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";

    const data = lireDonneesFormulaire(form);

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const messageErreur = result.erreurs
          ? result.erreurs[0]
          : result.message || "Erreur lors de l’envoi du formulaire.";

        afficherAlerte("Attention", messageErreur);

        submitButton.disabled = false;
        submitButton.textContent = "Envoyer";
        return;
      }

      form.reset();

      afficherValidation(
        "Enregistrement confirmé",
        "Votre demande a bien été enregistrée."
      );

    } catch (error) {
      afficherAlerte(
        "Attention",
        "Impossible d’envoyer le formulaire pour le moment."
      );

      submitButton.disabled = false;
      submitButton.textContent = "Envoyer";
      return;
    }

    submitButton.disabled = false;
    submitButton.textContent = "Envoyer";
  });
});

function lireDonneesFormulaire(form) {
  return {
    nommembre: getValue(form, "nommembre"),
    prenommembre: getValue(form, "prenommembre"),
    dptmtmembre: getValue(form, "dptmtmembre"),
    emailmembre: getValue(form, "emailmembre"),
    emailparrain: getValue(form, "emailparrain"),
    regleclub_v1: getChecked(form, "regleclub_v1"),
    regleapp_v1: getChecked(form, "regleapp_v1")
  };
}

function getValue(form, name) {
  const field = form.querySelector(`[name="${name}"]`);
  return field ? field.value.trim() : "";
}

function getChecked(form, name) {
  const field = form.querySelector(`[name="${name}"]`);
  return field ? field.checked : false;
}

function verifierFormulaire(form) {
  const nommembre = getValue(form, "nommembre");
  const prenommembre = getValue(form, "prenommembre");
  const dptmtmembre = getValue(form, "dptmtmembre");
  const emailmembre = getValue(form, "emailmembre");
  const emailparrain = getValue(form, "emailparrain");
  const regleclub = getChecked(form, "regleclub_v1");
  const regleapp = getChecked(form, "regleapp_v1");

  if (!nommembre) {
    return "Le nom est obligatoire.";
  }

  if (!prenommembre) {
    return "Le prénom est obligatoire.";
  }

  if (!dptmtmembre) {
    return "Le département est obligatoire.";
  }

  if (!/^(?:\d{2,3}|2A|2B)$/i.test(dptmtmembre)) {
    return "Le numéro de département est invalide.";
  }

  if (!emailmembre) {
    return "L’adresse e-mail est obligatoire.";
  }

  if (!isValidEmail(emailmembre)) {
    return "L’adresse e-mail est invalide.";
  }

  if (emailparrain && !isValidEmail(emailparrain)) {
    return "L’adresse e-mail du parrain est invalide.";
  }

  if (!regleclub) {
    return "Le règlement du club doit être accepté.";
  }

  if (!regleapp) {
    return "Le règlement de l’application doit être accepté.";
  }

  return "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function afficherAlerte(titre, message) {
  if (typeof window.afficherLightboxInformation === "function") {
    window.afficherLightboxInformation(titre, message, {
      type: "erreur"
    });
  } else {
    alert(message);
  }
}

function afficherValidation(titre, message) {
  if (typeof window.afficherLightboxInformation === "function") {
    window.afficherLightboxInformation(titre, message, {
      type: "validation",
      redirectUrl: REDIRECT_URL
    });
  } else {
    alert(message);
    window.location.href = REDIRECT_URL;
  }
}
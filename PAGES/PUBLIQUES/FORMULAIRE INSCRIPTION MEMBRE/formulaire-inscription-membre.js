const WORKER_URL = "https://lcdp-github-1.hugues-pavret.workers.dev/";
const REDIRECT_URL = "index.html";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".formulaire-inscription");

  if (!form) {
    console.error("Formulaire introuvable.");
    return;
  }

  const submitButton = form.querySelector("button[type='submit']");

  const lightbox = document.getElementById("formulaire-lightbox");
  const lightboxBox = lightbox ? lightbox.querySelector(".formulaire-lightbox") : null;
  const lightboxTitre = document.getElementById("formulaire-lightbox-titre");
  const lightboxMessage = document.getElementById("formulaire-lightbox-message");
  const lightboxOk = document.getElementById("formulaire-lightbox-ok");

  if (!lightbox || !lightboxBox || !lightboxTitre || !lightboxMessage || !lightboxOk) {
    console.error("Lightbox introuvable ou incomplète.");
    return;
  }

  let actionValidation = null;
  let dernierChampErreur = null;

  lightboxOk.addEventListener("click", () => {
    fermerLightbox();

    if (typeof actionValidation === "function") {
      actionValidation();
      return;
    }

    if (dernierChampErreur) {
      dernierChampErreur.focus();
    }
  });

  const champsTexte = [
    "nommembre",
    "prenommembre",
    "dptmtmembre",
    "emailmembre",
    "emailparrain"
  ];

  champsTexte.forEach((name) => {
    const champ = form.querySelector(`[name="${name}"]`);

    if (!champ) return;

    champ.addEventListener("blur", () => {
      const erreur = verifierChamp(champ);

      if (erreur) {
        dernierChampErreur = champ;
        ouvrirLightboxErreur(erreur);
      }
    });
  });

  const checkboxes = [
    "regleclub_v1",
    "regleapp_v1"
  ];

  checkboxes.forEach((name) => {
    const checkbox = form.querySelector(`[name="${name}"]`);

    if (!checkbox) return;

    checkbox.addEventListener("change", () => {
      if (!checkbox.checked) {
        dernierChampErreur = checkbox;
        ouvrirLightboxErreur("Ce règlement doit être accepté pour envoyer le formulaire.");
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const premierControle = verifierPremierChampInvalide(form);

    if (premierControle) {
      dernierChampErreur = premierControle.champ;
      ouvrirLightboxErreur(premierControle.message);
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
        const texteErreur = result.erreurs
          ? result.erreurs[0]
          : result.message || "Erreur lors de l’envoi du formulaire.";

        ouvrirLightboxErreur(texteErreur);
        submitButton.disabled = false;
        submitButton.textContent = "Envoyer";
        return;
      }

      form.reset();

      ouvrirLightboxValidation(
        "Votre demande a bien été enregistrée.",
        () => {
          window.location.href = REDIRECT_URL;
        }
      );

    } catch (error) {
      ouvrirLightboxErreur("Impossible d’envoyer le formulaire pour le moment.");
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer";
      return;
    }

    submitButton.disabled = false;
    submitButton.textContent = "Envoyer";
  });

  function ouvrirLightboxErreur(message) {
    actionValidation = null;

    lightboxTitre.textContent = "Attention";
    lightboxMessage.textContent = message;

    lightboxBox.classList.remove("formulaire-lightbox-validation");
    lightboxBox.classList.add("formulaire-lightbox-erreur");

    lightbox.hidden = false;
    document.body.classList.add("formulaire-lightbox-active");

    lightboxOk.focus();
  }

  function ouvrirLightboxValidation(message, actionOk) {
    actionValidation = actionOk;

    lightboxTitre.textContent = "Confirmation";
    lightboxMessage.textContent = message;

    lightboxBox.classList.remove("formulaire-lightbox-erreur");
    lightboxBox.classList.add("formulaire-lightbox-validation");

    lightbox.hidden = false;
    document.body.classList.add("formulaire-lightbox-active");

    lightboxOk.focus();
  }

  function fermerLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("formulaire-lightbox-active");

    lightboxBox.classList.remove("formulaire-lightbox-erreur");
    lightboxBox.classList.remove("formulaire-lightbox-validation");
  }
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

function verifierChamp(champ) {
  const name = champ.name;
  const value = champ.value.trim();

  if (name === "nommembre" && !value) {
    return "Le nom est obligatoire.";
  }

  if (name === "prenommembre" && !value) {
    return "Le prénom est obligatoire.";
  }

  if (name === "dptmtmembre") {
    if (!value) {
      return "Le département est obligatoire.";
    }

    if (!/^(?:\d{2,3}|2A|2B)$/i.test(value)) {
      return "Le numéro de département est invalide.";
    }
  }

  if (name === "emailmembre") {
    if (!value) {
      return "L’adresse e-mail est obligatoire.";
    }

    if (!isValidEmail(value)) {
      return "L’adresse e-mail est invalide.";
    }
  }

  if (name === "emailparrain" && value && !isValidEmail(value)) {
    return "L’adresse e-mail du parrain est invalide.";
  }

  return "";
}

function verifierPremierChampInvalide(form) {
  const controles = [
    {
      name: "nommembre",
      message: "Le nom est obligatoire."
    },
    {
      name: "prenommembre",
      message: "Le prénom est obligatoire."
    },
    {
      name: "dptmtmembre",
      message: "Le département est obligatoire."
    },
    {
      name: "emailmembre",
      message: "L’adresse e-mail est obligatoire."
    }
  ];

  for (const controle of controles) {
    const champ = form.querySelector(`[name="${controle.name}"]`);

    if (!champ || !champ.value.trim()) {
      return {
        champ,
        message: controle.message
      };
    }

    const erreur = verifierChamp(champ);

    if (erreur) {
      return {
        champ,
        message: erreur
      };
    }
  }

  const emailParrain = form.querySelector('[name="emailparrain"]');

  if (emailParrain) {
    const erreurParrain = verifierChamp(emailParrain);

    if (erreurParrain) {
      return {
        champ: emailParrain,
        message: erreurParrain
      };
    }
  }

  const regleClub = form.querySelector('[name="regleclub_v1"]');

  if (!regleClub || !regleClub.checked) {
    return {
      champ: regleClub,
      message: "Le règlement du club doit être accepté."
    };
  }

  const regleApp = form.querySelector('[name="regleapp_v1"]');

  if (!regleApp || !regleApp.checked) {
    return {
      champ: regleApp,
      message: "Le règlement de l’application doit être accepté."
    };
  }

  return null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
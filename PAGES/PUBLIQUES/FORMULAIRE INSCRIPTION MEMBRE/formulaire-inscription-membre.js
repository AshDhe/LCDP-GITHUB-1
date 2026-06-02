const WORKER_URL = "https://lcdp-github-1.hugues-pavret.workers.dev/";
const REDIRECT_URL = "index.html";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".formulaire-inscription");

  if (!form) {
    console.error("Formulaire introuvable.");
    return;
  }

  const champsAControler = [
    "nommembre",
    "prenommembre",
    "dptmtmembre",
    "emailmembre",
    "emailparrain"
  ];

  champsAControler.forEach((name) => {
    const champ = form.querySelector(`[name="${name}"]`);

    if (!champ) return;

    champ.addEventListener("blur", () => {
      const data = lireDonneesFormulaire(form);
      const erreur = verifierChamp(name, data);

      if (erreur) {
        ouvrirLightbox(erreur);
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";

    const data = lireDonneesFormulaire(form);
    const erreurs = verifierFormulaire(data);

    if (erreurs.length > 0) {
      ouvrirLightbox(erreurs[0]);
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer";
      return;
    }

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

        ouvrirLightbox(texteErreur);
        submitButton.disabled = false;
        submitButton.textContent = "Envoyer";
        return;
      }

      form.reset();

      ouvrirLightbox(
        "Votre demande a bien été enregistrée.",
        () => {
          window.location.href = REDIRECT_URL;
        }
      );

    } catch (error) {
      ouvrirLightbox("Impossible d’envoyer le formulaire pour le moment.");
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

function verifierChamp(name, data) {
  if (name === "nommembre" && !data.nommembre) {
    return "Le nom est obligatoire.";
  }

  if (name === "prenommembre" && !data.prenommembre) {
    return "Le prénom est obligatoire.";
  }

  if (name === "dptmtmembre") {
    if (!data.dptmtmembre) {
      return "Le département est obligatoire.";
    }

    if (!/^(?:\d{2,3}|2A|2B)$/i.test(data.dptmtmembre)) {
      return "Le numéro de département est invalide.";
    }
  }

  if (name === "emailmembre") {
    if (!data.emailmembre) {
      return "L’adresse e-mail est obligatoire.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailmembre)) {
      return "L’adresse e-mail est invalide.";
    }
  }

  if (name === "emailparrain" && data.emailparrain) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailparrain)) {
      return "L’adresse e-mail du parrain est invalide.";
    }
  }

  return "";
}

function verifierFormulaire(data) {
  const erreurs = [];

  if (!data.nommembre) {
    erreurs.push("Le nom est obligatoire.");
  }

  if (!data.prenommembre) {
    erreurs.push("Le prénom est obligatoire.");
  }

  if (!data.dptmtmembre) {
    erreurs.push("Le département est obligatoire.");
  } else if (!/^(?:\d{2,3}|2A|2B)$/i.test(data.dptmtmembre)) {
    erreurs.push("Le numéro de département est invalide.");
  }

  if (!data.emailmembre) {
    erreurs.push("L’adresse e-mail est obligatoire.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailmembre)) {
    erreurs.push("L’adresse e-mail est invalide.");
  }

  if (data.emailparrain && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailparrain)) {
    erreurs.push("L’adresse e-mail du parrain est invalide.");
  }

  if (!data.regleclub_v1) {
    erreurs.push("Le règlement du club doit être accepté.");
  }

  if (!data.regleapp_v1) {
    erreurs.push("Le règlement de l’application doit être accepté.");
  }

  return erreurs;
}

function ouvrirLightbox(texte, actionOk = null) {
  const ancienneLightbox = document.querySelector(".formulaire-lightbox-overlay");

  if (ancienneLightbox) {
    ancienneLightbox.remove();
  }

  const overlay = document.createElement("div");
  overlay.className = "formulaire-lightbox-overlay";

  const box = document.createElement("div");
  box.className = "formulaire-lightbox";

  const message = document.createElement("p");
  message.textContent = texte;

  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.textContent = "OK";

  bouton.addEventListener("click", () => {
    overlay.remove();

    if (typeof actionOk === "function") {
      actionOk();
    }
  });

  box.appendChild(message);
  box.appendChild(bouton);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  bouton.focus();
}
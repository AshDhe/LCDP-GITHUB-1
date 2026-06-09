const ENDPOINT_MES_INFORMATIONS =
  "https://informations-membre-api.lacleduparc.fr";

const ENDPOINT_MAJ_EMAIL_MEMBRE =
  "https://maj-email-membre-api.lacleduparc.fr";

const PAGE_CONNEXION_MEMBRE =
  (window.SITE_BASE || "") + "/PAGES/PUBLIQUES/CONNEXION%20MEMBRE/connexion-membre.html";

let emailMembreActuel = "";

async function initialiserMesInformationsMembre() {
  try {
    const reponse = await fetch(ENDPOINT_MES_INFORMATIONS, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    const resultat = await reponse.json();

    if (!reponse.ok || !resultat.ok || !resultat.informations) {
      window.location.href =
        PAGE_CONNEXION_MEMBRE + "?source=mes-informations-membre&session=inactive";
      return;
    }

    const infos = resultat.informations;

    emailMembreActuel = nettoyerEmail(infos.email);

    remplirTexte("valeur-nom-membre", infos.nom);
    remplirTexte("valeur-prenom-membre", infos.prenom);
    remplirTexte("valeur-email-membre", infos.email);
    remplirTexte("valeur-date-creation-membre", formaterDate(infos.membreDepuis));
    remplirTexte("valeur-statut-membre", infos.statut);
    remplirTexte("valeur-parrain-membre", infos.parrain);
    remplirTexte("valeur-departement-membre", infos.departement);
    remplirTexte("valeur-reglement-club", formaterDate(infos.reglementClub));
    remplirTexte("valeur-reglement-application", formaterDate(infos.reglementApplication));

    initialiserModificationEmailMembre();

  } catch (erreur) {
    window.location.href =
      PAGE_CONNEXION_MEMBRE + "?source=mes-informations-membre&session=erreur";
  }
}

function initialiserModificationEmailMembre() {
  const bouton =
    document.getElementById("modifier-email-membre") ||
    document.querySelector("[data-action='modifier-email-membre']");

  if (!bouton) return;

  if (bouton.dataset.initialise === "true") return;
  bouton.dataset.initialise = "true";

  bouton.addEventListener("click", ouvrirBoiteDialogueEmailMembre);
}

async function ouvrirBoiteDialogueEmailMembre() {
  if (typeof window.afficherBoiteDialogue !== "function") {
    console.error("La fonction afficherBoiteDialogue est introuvable.");
    return;
  }

  const resultat = await window.afficherBoiteDialogue({
    titre: "Modifier mon e-mail",
    texteAnnuler: "Annuler",
    texteValider: "Valider",
    champs: [
      {
        id: "nouvel-email-membre",
        name: "emailmembre",
        label: "Nouveau mail",
        type: "email",
        autocomplete: "email",
        required: true
      }
    ]
  });

  if (!resultat) return;

  const nouveauMail = nettoyerEmail(resultat.emailmembre);

  if (!emailValide(nouveauMail)) {
    afficherMessageErreur("L’adresse e-mail saisie est invalide.");
    return;
  }

  if (nouveauMail === emailMembreActuel) {
    afficherMessageErreur("Ce mail est déjà celui de votre compte.");
    return;
  }

  await envoyerDemandeModificationEmail(nouveauMail);
}

async function envoyerDemandeModificationEmail(nouveauMail) {
  try {
    const reponse = await fetch(ENDPOINT_MAJ_EMAIL_MEMBRE, {
      method: "POST",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emailmembre: nouveauMail
      })
    });

    const resultat = await reponse.json().catch(() => null);

    if (!reponse.ok || !resultat || resultat.ok !== true) {
      afficherMessageErreur(
        resultat && resultat.message
          ? resultat.message
          : "Impossible d’envoyer l’e-mail de validation."
      );
      return;
    }

    if (typeof window.afficherLightboxInformation === "function") {
      await window.afficherLightboxInformation(
        "Email de validation envoyé",
        "Un email de validation a été envoyé. Votre e-mail actuel reste inchangé tant que le nouveau mail n'est pas validé.",
        { type: "validation" }
      );
    } else {
      alert("Un email de validation a été envoyé. Votre e-mail actuel reste inchangé tant que le nouveau mail n'est pas validé.");
    }

  } catch (erreur) {
    console.error("Erreur modification email membre :", erreur);
    afficherMessageErreur("Erreur technique. Merci de réessayer.");
  }
}

function afficherMessageErreur(message) {
  if (typeof window.afficherLightboxInformation === "function") {
    window.afficherLightboxInformation(
      "Erreur",
      message,
      { type: "erreur" }
    );
    return;
  }

  alert(message);
}

function remplirTexte(id, valeur) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = valeur || "Non renseigné";
}

function formaterDate(valeur) {
  if (!valeur) return "Non renseigné";
  const date = new Date(valeur);
  if (Number.isNaN(date.getTime())) return valeur;
  return date.toLocaleDateString("fr-FR");
}

function nettoyerEmail(valeur) {
  return String(valeur || "").trim().toLowerCase();
}

function emailValide(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

initialiserMesInformationsMembre();
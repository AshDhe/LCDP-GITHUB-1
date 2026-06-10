const ENDPOINT_MES_INVITES_MEMBRES =
  "https://mes-invites-membres-api.lacleduparc.fr";

const messageInvites = document.getElementById("message-mes-invites-membres");
const resumeInvites = document.getElementById("resume-mes-invites-membres");
const tableWrapperInvites = document.getElementById("table-wrapper-mes-invites-membres");
const listeInvites = document.getElementById("liste-mes-invites-membres");

document.addEventListener("DOMContentLoaded", chargerMesInvitesMembres);

async function chargerMesInvitesMembres() {
  afficherChargement();

  try {
    const reponse = await fetch(ENDPOINT_MES_INVITES_MEMBRES, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    const resultat = await reponse.json().catch(() => null);

    if (!reponse.ok || !resultat || resultat.success !== true) {
      afficherErreur(
        resultat?.message || "Impossible de charger vos invités membres."
      );
      return;
    }

    const invites = Array.isArray(resultat.invites) ? resultat.invites : [];

    afficherInvites(invites);
  } catch (erreur) {
    afficherErreur("Erreur de connexion. Merci de réessayer.");
  }
}

function afficherChargement() {
  messageInvites.hidden = false;
  messageInvites.className = "message-invites";
  messageInvites.textContent = "Chargement...";

  resumeInvites.hidden = true;
  resumeInvites.textContent = "";

  tableWrapperInvites.hidden = true;
  listeInvites.innerHTML = "";
}

function afficherErreur(message) {
  messageInvites.hidden = false;
  messageInvites.className = "message-invites message-invites-erreur";
  messageInvites.textContent = message;

  resumeInvites.hidden = true;
  resumeInvites.textContent = "";

  tableWrapperInvites.hidden = true;
  listeInvites.innerHTML = "";
}

function afficherInvites(invites) {
  listeInvites.innerHTML = "";

  if (invites.length === 0) {
    messageInvites.hidden = false;
    messageInvites.className = "message-invites";
    messageInvites.textContent =
      "Aucun membre ne vous a encore indiqué comme parrain.";

    resumeInvites.hidden = true;
    resumeInvites.textContent = "";

    tableWrapperInvites.hidden = true;
    return;
  }

  messageInvites.hidden = true;

  resumeInvites.hidden = false;
  resumeInvites.textContent =
    invites.length === 1
      ? "1 membre vous a indiqué comme parrain."
      : `${invites.length} membres vous ont indiqué comme parrain.`;

  tableWrapperInvites.hidden = false;

  invites.forEach((invite) => {
    const ligne = document.createElement("tr");

    const celluleMembre = document.createElement("td");
    celluleMembre.dataset.label = "Membre";

    const nom = document.createElement("span");
    nom.className = "invite-nom";
    nom.textContent = construireNomComplet(invite);

    const email = document.createElement("span");
    email.className = "invite-email";
    email.textContent = invite.emailmembre || "Email non renseigné";

    celluleMembre.appendChild(nom);
    celluleMembre.appendChild(email);

    const celluleDepartement = creerCellule(
      "Département",
      invite.dptmtmembre || "Non renseigné"
    );

    const celluleValidation = document.createElement("td");
    celluleValidation.dataset.label = "Email validé";

    const badge = document.createElement("span");
    badge.className = invite.emailvalid
      ? "badge-invite badge-invite-valide"
      : "badge-invite badge-invite-non-valide";
    badge.textContent = invite.emailvalid ? "Oui" : "Non";

    celluleValidation.appendChild(badge);

    const celluleDate = creerCellule(
      "Date de parrainage",
      formaterDate(invite.dateparrainage)
    );

    ligne.appendChild(celluleMembre);
    ligne.appendChild(celluleDepartement);
    ligne.appendChild(celluleValidation);
    ligne.appendChild(celluleDate);

    listeInvites.appendChild(ligne);
  });
}

function creerCellule(label, valeur) {
  const cellule = document.createElement("td");
  cellule.dataset.label = label;
  cellule.textContent = valeur;
  return cellule;
}

function construireNomComplet(invite) {
  const prenom = invite.prenommembre || "";
  const nom = invite.nommembre || "";
  const nomComplet = `${prenom} ${nom}`.trim();

  return nomComplet || "Membre";
}

function formaterDate(dateISO) {
  if (!dateISO) {
    return "Non renseignée";
  }

  const date = new Date(dateISO);

  if (Number.isNaN(date.getTime())) {
    return "Non renseignée";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
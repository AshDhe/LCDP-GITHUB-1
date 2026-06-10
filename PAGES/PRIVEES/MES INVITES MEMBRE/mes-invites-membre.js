const ENDPOINT_MES_INVITES_MEMBRE =
  "https://mes-invites-membre-api.lacleduparc.fr";

const listeInvites = document.getElementById("liste-mes-invites-membre");
const boutonInviter = document.getElementById("bouton-inviter-membre");

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", chargerMesInvitesMembre);
} else {
  chargerMesInvitesMembre();
}

if (boutonInviter) {
  boutonInviter.addEventListener("click", inviterMembresSelectionnes);
}

async function chargerMesInvitesMembre() {
  afficherMessage("Chargement de vos invités...");

  try {
    const reponse = await fetch(ENDPOINT_MES_INVITES_MEMBRE, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    const resultat = await reponse.json().catch(() => null);

    if (!reponse.ok || !resultat || resultat.success !== true) {
      afficherMessage(resultat?.message || "Impossible de charger vos invités.");
      return;
    }

    const invites = Array.isArray(resultat.invites) ? resultat.invites : [];

    afficherInvites(invites);
  } catch (erreur) {
    afficherMessage("Erreur de connexion. Merci de réessayer.");
  }
}

function afficherMessage(message) {
  listeInvites.innerHTML = "";

  const ligne = document.createElement("tr");
  const cellule = document.createElement("td");

  cellule.colSpan = 4;
  cellule.id = "message-mes-invites-membre";
  cellule.textContent = message;

  ligne.appendChild(cellule);
  listeInvites.appendChild(ligne);
}

function afficherInvites(invites) {
  listeInvites.innerHTML = "";

  if (invites.length === 0) {
    afficherMessage("Aucun membre ne vous a encore indiqué comme parrain.");
    return;
  }

  invites.forEach((invite) => {
    const ligne = document.createElement("tr");

    const celluleEmail = document.createElement("td");
    celluleEmail.textContent = invite.emailmembre || "Email non renseigné";

    const celluleNom = document.createElement("td");
    celluleNom.textContent = invite.nommembre || "";

    const cellulePrenom = document.createElement("td");
    cellulePrenom.textContent = invite.prenommembre || "";

    const celluleCheckbox = document.createElement("td");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox-inviter";
    checkbox.value = invite.emailmembre || "";
    checkbox.dataset.idmembre = invite.idmembre || "";

    celluleCheckbox.appendChild(checkbox);

    ligne.appendChild(celluleEmail);
    ligne.appendChild(celluleNom);
    ligne.appendChild(cellulePrenom);
    ligne.appendChild(celluleCheckbox);

    listeInvites.appendChild(ligne);
  });
}

function inviterMembresSelectionnes() {
  const selection = Array.from(
    document.querySelectorAll(".checkbox-inviter:checked")
  ).map((checkbox) => ({
    idmembre: checkbox.dataset.idmembre,
    emailmembre: checkbox.value
  }));

  if (selection.length === 0) {
    afficherInformationSimple("Aucun membre sélectionné.");
    return;
  }

  console.log("Membres à inviter :", selection);
}

function afficherInformationSimple(message) {
  if (typeof afficherLightboxInformation === "function") {
    afficherLightboxInformation(message);
    return;
  }

  alert(message);
}
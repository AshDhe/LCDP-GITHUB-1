const ENDPOINT_LISTE_PARCS = "https://autocomplete-parc-api.lacleduparc.fr";

const inputNomParc = document.getElementById("nom-parc");
const inputDptmtParc = document.getElementById("dptmt-parc");
const suggestionsParcs = document.getElementById("suggestions-parcs");

const formSelectionParc = document.getElementById("form-selection-parc");
const messageSelectionParc = document.getElementById("message-selection-parc");

const sectionBriefIa = document.getElementById("section-brief-ia");
const parcSelectionne = document.getElementById("parc-selectionne");

const formBriefIa = document.getElementById("form-brief-ia");
const texteBrief = document.getElementById("texte-brief");
const messageBriefIa = document.getElementById("message-brief-ia");
const resultatJsonBrief = document.getElementById("resultat-json-brief");

let parcsDisponibles = [];
let parcActif = null;

document.addEventListener("DOMContentLoaded", chargerParcs);

async function chargerParcs() {
  try {
    const response = await fetch(ENDPOINT_LISTE_PARCS);
    const result = await response.json();

    if (!response.ok || !result.success) {
      messageSelectionParc.textContent = "Impossible de charger la liste des parcs.";
      return;
    }

    parcsDisponibles = result.parcs || [];

  } catch (error) {
    messageSelectionParc.textContent = "Erreur de connexion au serveur des parcs.";
  }
}

inputNomParc.addEventListener("input", () => {
  const saisie = inputNomParc.value.trim().toUpperCase();

  suggestionsParcs.innerHTML = "";
  parcActif = null;
  sectionBriefIa.hidden = true;

  if (saisie.length < 1) {
    return;
  }

  const resultats = parcsDisponibles.filter((parc) =>
    String(parc.nom).toUpperCase().includes(saisie)
  );

  resultats.slice(0, 8).forEach((parc) => {
    const item = document.createElement("div");
    item.textContent = `${parc.nom} - ${parc.dptmt}`;
    item.style.cursor = "pointer";

    item.addEventListener("click", () => {
      inputNomParc.value = parc.nom;
      inputDptmtParc.value = parc.dptmt;
      parcActif = parc;
      suggestionsParcs.innerHTML = "";
      messageSelectionParc.textContent = "";
    });

    suggestionsParcs.appendChild(item);
  });
});

formSelectionParc.addEventListener("submit", (event) => {
  event.preventDefault();

  messageSelectionParc.textContent = "";

  const nomSaisi = inputNomParc.value.trim().toUpperCase();
  const dptmtSaisi = inputDptmtParc.value.trim();

  const parcTrouve = parcsDisponibles.find((parc) =>
    String(parc.nom).trim().toUpperCase() === nomSaisi &&
    String(parc.dptmt).trim() === dptmtSaisi
  );

  if (!parcTrouve) {
    messageSelectionParc.textContent = "Aucun parc trouvé avec ce nom et ce département.";
    sectionBriefIa.hidden = true;
    return;
  }

  parcActif = parcTrouve;

  messageSelectionParc.textContent = "Parc validé.";

  parcSelectionne.textContent =
    `${parcActif.nom} - département ${parcActif.dptmt} - ${parcActif.localite || ""}`;

  sectionBriefIa.hidden = false;
});

formBriefIa.addEventListener("submit", (event) => {
  event.preventDefault();

  messageBriefIa.textContent = "";
  resultatJsonBrief.textContent = "";

  if (!parcActif) {
    messageBriefIa.textContent = "Aucun parc sélectionné.";
    return;
  }

  const texte = texteBrief.value.trim();

  if (!texte) {
    messageBriefIa.textContent = "Le brief est vide.";
    return;
  }

  const payloadProvisoire = {
    idparc: parcActif.idparc,
    nom: parcActif.nom,
    dptmt: parcActif.dptmt,
    textebrief: texte
  };

  messageBriefIa.textContent = "Brief prêt à être envoyé à l’IA.";
  resultatJsonBrief.textContent = JSON.stringify(payloadProvisoire, null, 2);
});
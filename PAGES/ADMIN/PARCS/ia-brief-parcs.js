const ENDPOINT_LISTE_PARCS = "https://autocomplete-parc-api.lacleduparc.fr";
const ENDPOINT_IA_SHIFT_HPARCS = "https://ia-shift-hparcs-1-api.lacleduparc.fr";

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

const sectionValidationJson = document.getElementById("section-validation-json");
const resumeJsonBrief = document.getElementById("resume-json-brief");
const resultatJsonBrief = document.getElementById("resultat-json-brief");
const btnCorrigerBrief = document.getElementById("btn-corriger-brief");
const btnValiderJson = document.getElementById("btn-valider-json");
const messageValidationJson = document.getElementById("message-validation-json");

let parcsDisponibles = [];
let parcActif = null;
let jsonBriefActuel = null;

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
  sectionValidationJson.hidden = true;

  if (!saisie) return;

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

  if (!parcActif) {
    messageBriefIa.textContent = "Aucun parc sélectionné.";
    return;
  }

  const texte = texteBrief.value.trim();

  if (!texte) {
    messageBriefIa.textContent = "Le brief est vide.";
    return;
  }

  jsonBriefActuel = {
    idparc: parcActif.idparc,
    nom: parcActif.nom,
    dptmt: parcActif.dptmt,
    textebrief: texte,
    jsonbrief: {
      type: "hparcs",
      source: "brief_admin",
      regles: [],
      exceptions: []
    }
  };

  afficherValidationJson(jsonBriefActuel);

  messageBriefIa.textContent = "JSON généré. Merci de le vérifier.";
  sectionValidationJson.hidden = false;
});

function afficherValidationJson(data) {
  resumeJsonBrief.innerHTML = `
    <p>Parc : ${data.nom}</p>
    <p>Département : ${data.dptmt}</p>
    <p>Type de brief : horaires du parc</p>
    <p>Statut : prêt à validation</p>
  `;

  resultatJsonBrief.textContent = JSON.stringify(data, null, 2);
}

btnCorrigerBrief.addEventListener("click", () => {
  sectionValidationJson.hidden = true;
  messageBriefIa.textContent = "Corrige le brief puis relance l’IA.";
});

btnValiderJson.addEventListener("click", () => {
  if (!jsonBriefActuel) {
    messageValidationJson.textContent = "Aucun JSON à valider.";
    return;
  }

  messageValidationJson.textContent =
    "Validation prête. Prochaine étape : envoi au worker d’enregistrement iabriefparcs.";
});
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
    sectionValidationJson.hidden = true;
    return;
  }

  parcActif = parcTrouve;
  messageSelectionParc.textContent = "Parc validé.";

  parcSelectionne.textContent =
    `${parcActif.nom} - département ${parcActif.dptmt} - ${parcActif.localite || ""}`;

  sectionBriefIa.hidden = false;
  sectionValidationJson.hidden = true;
});

formBriefIa.addEventListener("submit", async (event) => {
  event.preventDefault();

  messageBriefIa.textContent = "";
  messageValidationJson.textContent = "";
  resultatJsonBrief.textContent = "";
  resumeJsonBrief.innerHTML = "";
  sectionValidationJson.hidden = true;

  if (!parcActif) {
    messageBriefIa.textContent = "Aucun parc sélectionné.";
    return;
  }

  const texte = texteBrief.value.trim();

  if (!texte) {
    messageBriefIa.textContent = "Le brief est vide.";
    return;
  }

  const payload = {
    idparc: parcActif.idparc,
    nom: parcActif.nom,
    dptmt: parcActif.dptmt,
    textebrief: texte
  };

  const boutonSubmit = formBriefIa.querySelector("button[type='submit']");
  boutonSubmit.disabled = true;
  boutonSubmit.textContent = "Analyse IA en cours...";

  try {
    const response = await fetch(ENDPOINT_IA_SHIFT_HPARCS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      messageBriefIa.textContent = "Erreur pendant l’analyse IA.";
      resultatJsonBrief.textContent = JSON.stringify(result, null, 2);
      sectionValidationJson.hidden = false;
      return;
    }

    jsonBriefActuel = {
      idparc: result.idparc,
      nom: result.nom,
      dptmt: result.dptmt,
      textebrief: result.textebrief,
      jsonbrief: result.jsonbrief
    };

    afficherValidationJson(jsonBriefActuel);

    messageBriefIa.textContent = "Analyse IA terminée. Merci de vérifier le résultat.";
    sectionValidationJson.hidden = false;

  } catch (error) {
    messageBriefIa.textContent = "Erreur de connexion au worker IA.";
    resultatJsonBrief.textContent = error.message;
    sectionValidationJson.hidden = false;
  } finally {
    boutonSubmit.disabled = false;
    boutonSubmit.textContent = "Lancer le brief IA";
  }
});

function afficherValidationJson(data) {
  const json = data.jsonbrief || {};
  const regles = Array.isArray(json.regles) ? json.regles : [];
  const exceptions = Array.isArray(json.exceptions) ? json.exceptions : [];
  const resumeLisible = Array.isArray(json.resume_lisible) ? json.resume_lisible : [];
  const alertes = Array.isArray(json.alertes) ? json.alertes : [];

  let html = "";

  html += `<p>Parc : ${data.nom}</p>`;
  html += `<p>Département : ${data.dptmt}</p>`;

  if (resumeLisible.length > 0) {
    html += `<h4>Résumé général</h4><ul>`;
    resumeLisible.forEach((phrase) => {
      html += `<li>${escapeHtml(phrase)}</li>`;
    });
    html += `</ul>`;
  }

  if (regles.length > 0) {
  html += "<h3>Interprétation du brief</h3>";

    (json.resume_lisible || []).forEach(ligne => {
    html += `<p>${escapeHtml(ligne)}</p>`;
  });

  }

  if (exceptions.length > 0) {
    html += `<h3>Fermetures exceptionnelles</h3><ul>`;

    exceptions.forEach((exception) => {
      html += `<li>`;
      let libelle = exception.type || "";

if (libelle === "fermeture_journee") {
  libelle = "fermé toute la journée";
}

if (libelle === "fermeture_partielle") {
  libelle = "fermeture partielle";
}

html += `${formatDateFr(exception.date)} : ${libelle}`;

      if (exception.resume) {
        html += ` - ${escapeHtml(exception.resume)}`;
      }

      html += `</li>`;
    });

    html += `</ul>`;
  }

  if (alertes.length > 0) {
    html += `<h4>Alertes</h4><ul>`;

    alertes.forEach((alerte) => {
      html += `<li>${escapeHtml(alerte)}</li>`;
    });

    html += `</ul>`;
  }

  if (!regles.length && !exceptions.length && !resumeLisible.length) {
    html += `<p>Aucune règle lisible détectée dans le JSON.</p>`;
  }

  resumeJsonBrief.innerHTML = html;
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
    "JSON validé côté page. Prochaine étape : enregistrement dans iabriefparcs.";
});

function formatDateFr(dateStr) {
  if (!dateStr) return "?";

  const [jourRaw, moisRaw] = String(dateStr).split("/");

  const jour = parseInt(jourRaw, 10);
  const mois = String(moisRaw).padStart(2, "0");

  const moisFr = {
    "01": "janvier",
    "02": "février",
    "03": "mars",
    "04": "avril",
    "05": "mai",
    "06": "juin",
    "07": "juillet",
    "08": "août",
    "09": "septembre",
    "10": "octobre",
    "11": "novembre",
    "12": "décembre"
  };

  return `${jour} ${moisFr[mois] || "?"}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
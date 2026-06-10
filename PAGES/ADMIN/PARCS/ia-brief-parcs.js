const ENDPOINT_LISTE_PARCS = "https://autocomplete-parc-api.lacleduparc.fr";
const ENDPOINT_IA_SHIFT_HPARCS_1 = "https://ia-shift-hparcs-1-api.lacleduparc.fr";
const ENDPOINT_IA_SHIFT_HPARCS_2 = "https://ia-shift-hparcs-2-api.lacleduparc.fr";
const URL_RETOUR_ADMIN = "https://ashdhe.github.io/LCDP-GITHUB-1/PAGES/ADMIN/admin-pannel-core.html";

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
const btnDemarrerDictee = document.getElementById("btn-demarrer-dictee");
const btnArreterDictee = document.getElementById("btn-arreter-dictee");
const messageDictee = document.getElementById("message-dictee");

const sectionValidationJson = document.getElementById("section-validation-json");
const resumeJsonBrief = document.getElementById("resume-json-brief");
const resultatJsonBrief = document.getElementById("resultat-json-brief");
const btnCorrigerBrief = document.getElementById("btn-corriger-brief");
const btnValiderJson = document.getElementById("btn-valider-json");
const messageValidationJson = document.getElementById("message-validation-json");

const dialogValidationBrief = document.getElementById("dialog-validation-brief");
const btnDialogLancerMaj = document.getElementById("btn-dialog-lancer-maj");
const dialogFinTraitement = document.getElementById("dialog-fin-traitement");
const btnRetourAdmin = document.getElementById("btn-retour-admin");

let parcsDisponibles = [];
let parcActif = null;
let briefEnregistre = null;

let recognition = null;
let dicteeActive = false;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  btnDemarrerDictee.disabled = true;
  btnArreterDictee.disabled = true;
  messageDictee.textContent =
    "La dictée vocale n’est pas disponible sur ce navigateur.";
} else {
  recognition = new SpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.addEventListener("result", (event) => {
    let texteFinal = "";
    let texteIntermediaire = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        texteFinal += transcript + " ";
      } else {
        texteIntermediaire += transcript;
      }
    }

    if (texteFinal) {
      texteBrief.value = `${texteBrief.value.trim()} ${texteFinal.trim()}`.trim();
    }

    if (texteIntermediaire) {
      messageDictee.textContent = `Dictée en cours : ${texteIntermediaire}`;
    }
  });

  recognition.addEventListener("start", () => {
    dicteeActive = true;
    btnDemarrerDictee.disabled = true;
    btnArreterDictee.disabled = false;
    messageDictee.textContent = "Dictée en cours...";
  });

  recognition.addEventListener("end", () => {
    dicteeActive = false;
    btnDemarrerDictee.disabled = false;
    btnArreterDictee.disabled = true;

    if (messageDictee.textContent.startsWith("Dictée en cours")) {
      messageDictee.textContent = "Dictée arrêtée.";
    }
  });

  recognition.addEventListener("error", (event) => {
    messageDictee.textContent = `Erreur dictée : ${event.error}`;
    btnDemarrerDictee.disabled = false;
    btnArreterDictee.disabled = true;
    dicteeActive = false;
  });
}

btnDemarrerDictee.addEventListener("click", () => {
  if (!recognition || dicteeActive) return;

  try {
    recognition.start();
  } catch (error) {
    messageDictee.textContent = "Impossible de démarrer la dictée.";
  }
});

btnArreterDictee.addEventListener("click", () => {
  if (!recognition || !dicteeActive) return;
  recognition.stop();
});


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
  briefEnregistre = null;

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
    const response = await fetch(ENDPOINT_IA_SHIFT_HPARCS_1, {
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

    briefEnregistre = {
      idbrief: result.idbrief,
      idparc: result.idparc,
      nom: result.nom,
      dptmt: result.dptmt,
      textebrief: result.textebrief,
      increment: result.increment,
      jsonbrief: result.jsonbrief
    };

    afficherValidationJson(briefEnregistre);

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
  const resumeLisible = Array.isArray(json.resume_lisible) ? json.resume_lisible : [];

  let html = "";

  html += `<h3>Interprétation du brief</h3>`;
  html += `<p>Parc : ${escapeHtml(data.nom)}</p>`;
  html += `<p>Département : ${escapeHtml(data.dptmt)}</p>`;

  if (resumeLisible.length > 0) {
    resumeLisible.forEach((phrase) => {
      html += `<p>${escapeHtml(phrase)}</p>`;
    });
  } else {
    html += `<p>Aucun résumé lisible n’a été généré.</p>`;
  }

  resumeJsonBrief.innerHTML = html;
  resultatJsonBrief.textContent = JSON.stringify(data, null, 2);
}

btnCorrigerBrief.addEventListener("click", () => {
  sectionValidationJson.hidden = true;
  messageBriefIa.textContent = "Corrige le brief puis relance l’IA.";
});

btnValiderJson.addEventListener("click", () => {
  if (!briefEnregistre || !briefEnregistre.idbrief) {
    messageValidationJson.textContent = "Aucun brief enregistré à valider.";
    return;
  }

  dialogValidationBrief.showModal();
});

btnDialogLancerMaj.addEventListener("click", async () => {
  dialogValidationBrief.close();

  messageValidationJson.textContent = "Mise à jour du planning en cours...";
  btnValiderJson.disabled = true;
  btnCorrigerBrief.disabled = true;

  try {
    const response = await fetch(ENDPOINT_IA_SHIFT_HPARCS_2, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idbrief: briefEnregistre.idbrief,
        idparc: briefEnregistre.idparc
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      messageValidationJson.textContent = "Erreur pendant la mise à jour du planning.";
      resultatJsonBrief.textContent = JSON.stringify(result, null, 2);
      btnValiderJson.disabled = false;
      btnCorrigerBrief.disabled = false;
      return;
    }

    messageValidationJson.textContent = "Planning mis à jour.";
    dialogFinTraitement.showModal();
  } catch (error) {
    messageValidationJson.textContent = "Erreur de connexion au worker de mise à jour.";
    resultatJsonBrief.textContent = error.message;
    btnValiderJson.disabled = false;
    btnCorrigerBrief.disabled = false;
  }
});

btnRetourAdmin.addEventListener("click", () => {
  window.location.href = URL_RETOUR_ADMIN;
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
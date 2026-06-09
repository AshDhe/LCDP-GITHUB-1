let boiteDialogueReady = null;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiserBoiteDialogue);
} else {
  initialiserBoiteDialogue();
}

function initialiserBoiteDialogue() {
  boiteDialogueReady = chargerBoiteDialogue();
}

async function chargerBoiteDialogue() {
  const container = document.getElementById("boite-dialogue-container");

  if (!container) {
    console.error("Conteneur boite-dialogue-container introuvable.");
    return false;
  }

  const siteBase = window.SITE_BASE || "";

  try {
    const response = await fetch(siteBase + "/OBJETS/BLOCS/boite-dialogue.html");

    if (!response.ok) {
      throw new Error("Impossible de charger la boîte de dialogue.");
    }

    const html = await response.text();
    container.innerHTML = html;

    return true;
  } catch (error) {
    console.error("Erreur boîte de dialogue :", error);
    return false;
  }
}

window.afficherBoiteDialogue = async function (options = {}) {
  if (boiteDialogueReady) {
    await boiteDialogueReady;
  }

  const boite = document.getElementById("boite-dialogue");
  const titre = document.getElementById("boite-dialogue-titre");
  const form = document.getElementById("boite-dialogue-form");
  const contenu = document.getElementById("boite-dialogue-contenu");
  const erreur = document.getElementById("boite-dialogue-erreur");
  const boutonAnnuler = document.getElementById("boite-dialogue-annuler");
  const boutonValider = document.getElementById("boite-dialogue-valider");

  if (!boite || !titre || !form || !contenu || !erreur || !boutonAnnuler || !boutonValider) {
    console.error("Boîte de dialogue introuvable ou incomplète.");
    return null;
  }

  titre.textContent = options.titre || "";
  contenu.innerHTML = "";
  erreur.textContent = "";
  erreur.hidden = true;

  boutonAnnuler.textContent = options.texteAnnuler || "Annuler";
  boutonValider.textContent = options.texteValider || "Valider";

  const champs = Array.isArray(options.champs) ? options.champs : [];

  champs.forEach((champ) => {
    const wrapper = document.createElement("div");
    wrapper.className = "dialog-field";

    const label = document.createElement("label");
    label.setAttribute("for", champ.id);
    label.textContent = champ.label || "";

    const input = document.createElement("input");
    input.type = champ.type || "text";
    input.id = champ.id;
    input.name = champ.name || champ.id;
    input.value = champ.value || "";

    if (champ.placeholder) input.placeholder = champ.placeholder;
    if (champ.autocomplete) input.autocomplete = champ.autocomplete;
    if (champ.required) input.required = true;

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    contenu.appendChild(wrapper);
  });

  boite.hidden = false;

  const premierChamp = contenu.querySelector("input, textarea, select");
  if (premierChamp) {
    premierChamp.focus();
  }

  return new Promise((resolve) => {
    function fermer(resultat) {
      boite.hidden = true;
      form.reset();
      contenu.innerHTML = "";
      erreur.textContent = "";
      erreur.hidden = true;

      boutonAnnuler.onclick = null;
      form.onsubmit = null;

      resolve(resultat);
    }

    boutonAnnuler.onclick = () => {
      fermer(null);
    };

    form.onsubmit = async (event) => {
      event.preventDefault();

      erreur.textContent = "";
      erreur.hidden = true;

      if (!form.checkValidity()) {
        erreur.textContent = "Merci de vérifier le champ saisi.";
        erreur.hidden = false;
        return;
      }

      const formData = new FormData(form);
      const valeurs = {};

      for (const [key, value] of formData.entries()) {
        valeurs[key] = String(value || "").trim();
      }

      fermer(valeurs);
    };
  });
};
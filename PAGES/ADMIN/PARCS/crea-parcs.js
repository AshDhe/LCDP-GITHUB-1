const ENDPOINT_CREA_PARCS = "https://crea-parcs-api.lacleduparc.fr";
const URL_RETOUR_ADMIN = "https://ashdhe.github.io/LCDP-GITHUB-1/PAGES/ADMIN/admin-pannel-core.html";

const textarea = document.getElementById("json-parcs");
const bouton = document.getElementById("btn-creer-parcs");
const message = document.getElementById("message-resultat");
const details = document.getElementById("details-resultat");

let creationTerminee = false;

bouton.addEventListener("click", async () => {
  if (creationTerminee) {
    window.location.href = URL_RETOUR_ADMIN;
    return;
  }

  message.textContent = "";
  details.textContent = "";

  let parcs;

  try {
    parcs = JSON.parse(textarea.value);
  } catch (error) {
    message.textContent = "JSON invalide.";
    return;
  }

  if (!Array.isArray(parcs)) {
    message.textContent = "Le JSON doit être un tableau de parcs.";
    return;
  }

  bouton.disabled = true;
  bouton.textContent = "Création en cours...";

  try {
    const response = await fetch(ENDPOINT_CREA_PARCS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parcs)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      message.textContent = "Erreur lors de la création des parcs.";
      details.textContent = JSON.stringify(result, null, 2);
      bouton.textContent = "Créer les parcs";
      return;
    }

    message.textContent =
      `Création terminée : ${result.created} parc(s) créé(s), ` +
      `${result.skipped} doublon(s) ignoré(s), ` +
      `${result.errors} erreur(s).`;

    details.textContent = JSON.stringify(result.results, null, 2);

    creationTerminee = true;
    bouton.textContent = "OK";

  } catch (error) {
    message.textContent = "Erreur de connexion au worker.";
    details.textContent = error.message;
    bouton.textContent = "Créer les parcs";
  } finally {
    bouton.disabled = false;
  }
});
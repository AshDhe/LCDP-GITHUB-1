const ENDPOINT_CREA_PARCS = "https://crea-parcs-api.lacleduparc.fr";
const URL_RETOUR_ADMIN = "https://ashdhe.github.io/LCDP-GITHUB-1/PAGES/ADMIN/admin-pannel-core.html";

const textarea = document.getElementById("json-parcs");
const bouton = document.getElementById("btn-creer-parcs");
const message = document.getElementById("message-resultat");

let creationTerminee = false;

bouton.addEventListener("click", async () => {
  if (creationTerminee) {
    window.location.href = URL_RETOUR_ADMIN;
    return;
  }

  message.textContent = "";

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
      console.error(result);
      bouton.textContent = "Créer les parcs";
      return;
    }

    const succes = result.results.filter(r => r.success).length;
    const erreurs = result.results.filter(r => !r.success).length;

    message.textContent = `Création terminée : ${succes} parc(s) créé(s), ${erreurs} erreur(s).`;

    creationTerminee = true;
    bouton.textContent = "OK";

    console.log(result);

  } catch (error) {
    message.textContent = "Erreur de connexion au worker.";
    console.error(error);
    bouton.textContent = "Créer les parcs";
  } finally {
    bouton.disabled = false;
  }
});
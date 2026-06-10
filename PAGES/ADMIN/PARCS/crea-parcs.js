const ENDPOINT_CREA_PARCS = "https://crea-parcs-api.lacleduparc.fr";

const textarea = document.getElementById("json-parcs");
const bouton = document.getElementById("btn-creer-parcs");
const message = document.getElementById("message-resultat");

bouton.addEventListener("click", async () => {
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
      return;
    }

    const succes = result.results.filter(r => r.success).length;
    const erreurs = result.results.filter(r => !r.success).length;

    message.textContent = `Création terminée : ${succes} parc(s) créé(s), ${erreurs} erreur(s).`;

    console.log(result);

  } catch (error) {
    message.textContent = "Erreur de connexion au worker.";
    console.error(error);
  } finally {
    bouton.disabled = false;
    bouton.textContent = "Créer les parcs";
  }
});
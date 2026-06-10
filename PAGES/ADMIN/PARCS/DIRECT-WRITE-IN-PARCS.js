const ENDPOINT_WRITE_IN_HPARCS = "https://write-in-hparcs-api.lacleduparc.fr";

const textareaPayload = document.getElementById("payload-write-hparcs");
const boutonWrite = document.getElementById("btn-write-hparcs");
const messageWrite = document.getElementById("message-write-hparcs");
const resultatWrite = document.getElementById("resultat-write-hparcs");

boutonWrite.addEventListener("click", async () => {
  messageWrite.textContent = "";
  resultatWrite.textContent = "";

  let payload;

  try {
    payload = JSON.parse(textareaPayload.value);
  } catch (error) {
    messageWrite.textContent = "JSON invalide.";
    return;
  }

  if (!payload.idparc || !payload.idbrief || !payload.jsonfinal) {
    messageWrite.textContent = "Le JSON doit contenir idparc, idbrief et jsonfinal.";
    return;
  }

  boutonWrite.disabled = true;
  boutonWrite.textContent = "Écriture en cours...";

  try {
    const response = await fetch(ENDPOINT_WRITE_IN_HPARCS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      messageWrite.textContent = "Erreur pendant l’écriture dans hparcs.";
      resultatWrite.textContent = JSON.stringify(result, null, 2);
      return;
    }

    messageWrite.textContent = "Écriture hparcs réussie.";
    resultatWrite.textContent = JSON.stringify(result, null, 2);

  } catch (error) {
    messageWrite.textContent = "Erreur de connexion au worker.";
    resultatWrite.textContent = error.message;
  } finally {
    boutonWrite.disabled = false;
    boutonWrite.textContent = "Lancer write-in-hparcs";
  }
});
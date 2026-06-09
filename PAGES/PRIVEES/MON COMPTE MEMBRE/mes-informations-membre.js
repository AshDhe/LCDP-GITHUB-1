console.log("JS mes-informations chargé");

fetch("https://worker-mes-informations-membre.hugues-pavret.workers.dev/api/membre/mes-informations", {
  method: "GET",
  credentials: "include",
  headers: {
    "Accept": "application/json"
  }
})
  .then((reponse) => {
    console.log("Statut Worker :", reponse.status);
    return reponse.json();
  })
  .then((data) => {
    console.log("Réponse Worker :", data);
    document.getElementById("valeur-nom-membre").textContent =
      JSON.stringify(data);
  })
  .catch((erreur) => {
    console.error("Erreur fetch Worker :", erreur);
  });
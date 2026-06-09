document.addEventListener("DOMContentLoaded", async () => {
  const WORKER_URL = "https://worker-moncompte-membre.workers.dev";

  const PAGE_CONNEXION_MEMBRE =
    window.SITE_BASE + "/PAGES/PUBLIQUES/CONNEXION%20MEMBRE/connexion-membre.html";

  const ENDPOINT_SESSION_MEMBRE =
    WORKER_URL + "/api/membre/session/verifier";

  async function verifierSessionMembre() {
    try {
      const reponse = await fetch(ENDPOINT_SESSION_MEMBRE, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });

      const resultat = await reponse.json();

      if (!reponse.ok || !resultat.ok) {
        redirigerVersConnexion();
        return null;
      }

      return resultat.membre || null;

    } catch (erreur) {
      redirigerVersConnexion();
      return null;
    }
  }

  function redirigerVersConnexion() {
    window.location.href =
      PAGE_CONNEXION_MEMBRE + "?source=mon-compte-membre&session=inactive";
  }

  function afficherCompteActif(membre) {
    console.log("Session membre active :", membre);
  }

  const membre = await verifierSessionMembre();

  if (!membre) return;

  afficherCompteActif(membre);
});
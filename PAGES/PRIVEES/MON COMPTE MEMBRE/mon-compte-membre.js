document.addEventListener("DOMContentLoaded", async () => {
  const WORKER_URL = "https://TON-WORKER.workers.dev";

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
    window.location.href = PAGE_CONNEXION_MEMBRE + "?source=mon-compte-membre&session=inactive";
  }

  function initialiserLiensCompte() {
    document.getElementById("lien-informations-compte").href =
      window.SITE_BASE + "/PAGES/PRIVEES/MON%20COMPTE%20MEMBRE/INFORMATIONS%20COMPTE/informations-compte-membre.html";

    document.getElementById("lien-invites").href =
      window.SITE_BASE + "/PAGES/PRIVEES/MON%20COMPTE%20MEMBRE/MES%20INVITES/mes-invites-membre.html";

    document.getElementById("lien-abonnement").href =
      window.SITE_BASE + "/PAGES/PRIVEES/MON%20COMPTE%20MEMBRE/MON%20ABONNEMENT/mon-abonnement-membre.html";

    document.getElementById("lien-activite").href =
      window.SITE_BASE + "/PAGES/PRIVEES/MON%20COMPTE%20MEMBRE/MON%20ACTIVITE/mon-activite-membre.html";

    document.getElementById("lien-points-activite").href =
      window.SITE_BASE + "/PAGES/PRIVEES/MON%20COMPTE%20MEMBRE/MES%20POINTS/mes-points-activite-membre.html";

    document.getElementById("lien-support-lcdp").href =
      window.SITE_BASE + "/PAGES/PRIVEES/MON%20COMPTE%20MEMBRE/SUPPORT/support-lcdp-membre.html";
  }

  function afficherCompteActif(membre) {
    console.log("Session membre active :", membre);
  }

  const membre = await verifierSessionMembre();

  if (!membre) return;

  initialiserLiensCompte();
  afficherCompteActif(membre);
});
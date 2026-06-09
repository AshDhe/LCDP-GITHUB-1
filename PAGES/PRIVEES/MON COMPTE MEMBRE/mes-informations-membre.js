document.addEventListener("DOMContentLoaded", async () => {
  const WORKER_URL = "https://worker-moncompte-membre.workers.dev";

  const PAGE_CONNEXION_MEMBRE =
    window.SITE_BASE + "/PAGES/PUBLIQUES/CONNEXION%20MEMBRE/connexion-membre.html";

  const ENDPOINT_SESSION_MEMBRE =
    WORKER_URL + "/api/membre/session/verifier";

  async function chargerInformationsMembre() {
    try {
      const reponse = await fetch(ENDPOINT_SESSION_MEMBRE, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });

      const resultat = await reponse.json();

      if (!reponse.ok || !resultat.ok || !resultat.membre) {
        redirigerVersConnexion();
        return;
      }

      afficherInformationsMembre(resultat.membre);

    } catch (erreur) {
      redirigerVersConnexion();
    }
  }

  function redirigerVersConnexion() {
    window.location.href =
      PAGE_CONNEXION_MEMBRE + "?source=mes-informations-membre&session=inactive";
  }

  function afficherInformationsMembre(membre) {
    remplirTexte("valeur-nom-membre", membre.nom);
    remplirTexte("valeur-prenom-membre", membre.prenom);
    remplirTexte("valeur-email-membre", membre.email);
    remplirTexte("valeur-departement-membre", membre.departement);

    remplirTexte("valeur-date-creation-membre", membre.membreDepuis || "Non renseigné");
    remplirTexte("valeur-statut-membre", membre.statut || "Invité");
    remplirTexte("valeur-parrain-membre", membre.parrain || "Non renseigné");
    remplirTexte("valeur-reglement-club", membre.reglementClub || "Non renseigné");
    remplirTexte("valeur-reglement-application", membre.reglementApplication || "Non renseigné");
  }

  function remplirTexte(id, valeur) {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = valeur || "Non renseigné";
  }

  chargerInformationsMembre();
});
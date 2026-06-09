async function initialiserMesInformationsMembre() {
  const WORKER_URL = "https://worker-mes-informations-membre.workers.dev";

  const PAGE_CONNEXION_MEMBRE =
    window.SITE_BASE + "/PAGES/PUBLIQUES/CONNEXION%20MEMBRE/connexion-membre.html";

  const ENDPOINT_MES_INFORMATIONS =
    WORKER_URL + "/api/membre/mes-informations";

  try {
    const reponse = await fetch(ENDPOINT_MES_INFORMATIONS, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    const resultat = await reponse.json();

    if (!reponse.ok || !resultat.ok || !resultat.informations) {
      redirigerVersConnexion();
      return;
    }

    afficherInformationsMembre(resultat.informations);

  } catch (erreur) {
    console.error("Erreur chargement informations membre :", erreur);
    redirigerVersConnexion();
  }

  function redirigerVersConnexion() {
    window.location.href =
      PAGE_CONNEXION_MEMBRE + "?source=mes-informations-membre&session=inactive";
  }

  function afficherInformationsMembre(informations) {
    remplirTexte("valeur-nom-membre", informations.nom);
    remplirTexte("valeur-prenom-membre", informations.prenom);
    remplirTexte("valeur-email-membre", informations.email);
    remplirTexte("valeur-date-creation-membre", formaterDate(informations.membreDepuis));
    remplirTexte("valeur-statut-membre", informations.statut);
    remplirTexte("valeur-parrain-membre", informations.parrain);
    remplirTexte("valeur-departement-membre", informations.departement);
    remplirTexte("valeur-reglement-club", formaterDate(informations.reglementClub));
    remplirTexte("valeur-reglement-application", formaterDate(informations.reglementApplication));
  }

  function remplirTexte(id, valeur) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = valeur || "Non renseigné";
  }

  function formaterDate(valeur) {
    if (!valeur) return "Non renseigné";
    const date = new Date(valeur);
    if (Number.isNaN(date.getTime())) return valeur;
    return date.toLocaleDateString("fr-FR");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiserMesInformationsMembre);
} else {
  initialiserMesInformationsMembre();
}
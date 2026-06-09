async function initialiserMonCompteMembre() {
  const ENDPOINT_SESSION_MEMBRE =
    "https://mon-compte-membre-api.lacleduparc.fr";

  const PAGE_CONNEXION_MEMBRE =
    window.SITE_BASE + "/PAGES/PUBLIQUES/CONNEXION%20MEMBRE/connexion-membre.html";

  try {
    const reponse = await fetch(ENDPOINT_SESSION_MEMBRE, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    const resultat = await reponse.json();

    if (!reponse.ok || !resultat.ok || !resultat.idmembre) {
      window.location.href =
        PAGE_CONNEXION_MEMBRE + "?source=mon-compte-membre&session=inactive";
      return;
    }

    console.log("Session membre active :", resultat.idmembre);

  } catch (erreur) {
    window.location.href =
      PAGE_CONNEXION_MEMBRE + "?source=mon-compte-membre&session=erreur";
  }
}

initialiserMonCompteMembre();
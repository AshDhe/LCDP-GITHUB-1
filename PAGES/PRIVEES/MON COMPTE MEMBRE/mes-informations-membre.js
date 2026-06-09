async function initialiserMesInformationsMembre() {
  const ENDPOINT_MES_INFORMATIONS =
    "https://informations-membre-api.lacleduparc.fr";

  const PAGE_CONNEXION_MEMBRE =
    window.SITE_BASE + "/PAGES/PUBLIQUES/CONNEXION%20MEMBRE/connexion-membre.html";

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
      window.location.href =
        PAGE_CONNEXION_MEMBRE + "?source=mes-informations-membre&session=inactive";
      return;
    }

    const infos = resultat.informations;

    remplirTexte("valeur-nom-membre", infos.nom);
    remplirTexte("valeur-prenom-membre", infos.prenom);
    remplirTexte("valeur-email-membre", infos.email);
    remplirTexte("valeur-date-creation-membre", formaterDate(infos.membreDepuis));
    remplirTexte("valeur-statut-membre", infos.statut);
    remplirTexte("valeur-parrain-membre", infos.parrain);
    remplirTexte("valeur-departement-membre", infos.departement);
    remplirTexte("valeur-reglement-club", formaterDate(infos.reglementClub));
    remplirTexte("valeur-reglement-application", formaterDate(infos.reglementApplication));

  } catch (erreur) {
    window.location.href =
      PAGE_CONNEXION_MEMBRE + "?source=mes-informations-membre&session=erreur";
  }
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

initialiserMesInformationsMembre();
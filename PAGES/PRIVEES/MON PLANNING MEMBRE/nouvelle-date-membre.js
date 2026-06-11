(function initialiserNouvelleDateMembre() {
  console.log("NOUVELLE DATE MEMBRE JS DEMARRE");

  const ENDPOINT_NOUVELLE_DATE_MEMBRE =
    "https://nouvelle-date-membre-api.lacleduparc.fr";

  const SITE_BASE = window.SITE_BASE || "";

  function redirigerConnexionMembre(sourcePage) {
    window.location.href =
      SITE_BASE +
      "/PAGES/PUBLIQUES/CONNEXION%20MEMBRE/connexion-membre.html?source=" +
      encodeURIComponent(sourcePage);
  }

  function gererSessionExpiree(reponse, sourcePage) {
    if (reponse.status === 401) {
      redirigerConnexionMembre(sourcePage);
      return true;
    }

    return false;
  }

  const listeParcs = document.getElementById("liste-parcs-membre");
  const boutonDemanderIA = document.getElementById("bouton-demander-ia");
  const boutonModifierDepartement = document.getElementById("bouton-modifier-departement");
  const titreDepartement = document.getElementById("titre-departement-membre");

  let departementMembre = null;
  let departementAffiche = null;
  let modeAutourDeMoi = true;
  let parcsCharges = [];

  chargerParcsAutourDeMoi();

  if (boutonDemanderIA) {
    boutonDemanderIA.addEventListener("click", () => {
      alert("La demande à l’IA sera raccordée ensuite.");
    });
  }

  if (boutonModifierDepartement) {
    boutonModifierDepartement.addEventListener("click", ouvrirDialogueDepartement);
  }

  function normaliserDepartement(valeur) {
    const departement = String(valeur || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    if (/^[1-9]$/.test(departement)) {
      return "0" + departement;
    }

    return departement;
  }

  async function ouvrirDialogueDepartement() {
    if (typeof window.afficherBoiteDialogue !== "function") {
      afficherErreur("La boîte de dialogue est indisponible.");
      return;
    }

    const resultat = await window.afficherBoiteDialogue({
      titre: "Choisissez un département",
      texteAnnuler: "Annuler",
      texteValider: "Valider",
      champs: [
        {
          id: "nouveau-departement-recherche",
          name: "dptmt",
          label: "Entrez le n° du département (France métropole)",
          type: "text",
          value: "",
          required: true
        }
      ]
    });

    if (!resultat) return;

    const nouveauDepartement = normaliserDepartement(resultat.dptmt);

    if (!nouveauDepartement) {
      afficherErreur("Le département est obligatoire.");
      return;
    }

    departementAffiche = nouveauDepartement;
    modeAutourDeMoi = false;

    await chargerParcsDepartement(departementAffiche);
  }

  async function chargerParcsAutourDeMoi() {
    try {
      afficherChargement();

      const reponse = await fetch(ENDPOINT_NOUVELLE_DATE_MEMBRE + "/autour-de-moi", {
        method: "GET",
        credentials: "include"
      });

      if (gererSessionExpiree(reponse, "nouvelle-date-membre")) {
        return;
      }

      const data = await reponse.json().catch(() => null);

      if (!reponse.ok || !data || data.success !== true) {
        throw new Error(
          data && data.message
            ? data.message
            : "Impossible de charger les parcs autour de vous."
        );
      }

      departementMembre = data.departement;
      departementAffiche = data.departement;
      modeAutourDeMoi = true;
      parcsCharges = data.parcs || [];

      afficherTitreDepartement();
      afficherParcs(parcsCharges);

    } catch (erreur) {
      afficherErreur(erreur.message);
    }
  }

  async function chargerParcsDepartement(departement) {
    try {
      afficherChargement();

      const reponse = await fetch(
        ENDPOINT_NOUVELLE_DATE_MEMBRE + "/departement?dptmt=" + encodeURIComponent(departement),
        {
          method: "GET",
          credentials: "include"
        }
      );

      if (gererSessionExpiree(reponse, "nouvelle-date-membre")) {
        return;
      }

      const data = await reponse.json().catch(() => null);

      if (!reponse.ok || !data || data.success !== true) {
        throw new Error(
          data && data.message
            ? data.message
            : "Impossible de charger les parcs de ce département."
        );
      }

      departementAffiche = data.departement || departement;
      modeAutourDeMoi = false;
      parcsCharges = data.parcs || [];

      afficherTitreDepartement();
      afficherParcs(parcsCharges);

    } catch (erreur) {
      afficherErreur(erreur.message);
    }
  }

  function afficherTitreDepartement() {
    if (!titreDepartement) return;

    if (modeAutourDeMoi) {
      titreDepartement.textContent = "Autour de moi";
      return;
    }

    titreDepartement.textContent = "Parcs dans le " + departementAffiche;
  }

  function afficherChargement() {
    if (!listeParcs) return;

    listeParcs.innerHTML = `
      <tr>
        <td colspan="2">
          Chargement des parcs...
        </td>
      </tr>
    `;
  }

  function afficherErreur(message) {
    if (!listeParcs) return;

    listeParcs.innerHTML = `
      <tr>
        <td colspan="2">
          ${echapperHtml(message)}
        </td>
      </tr>
    `;
  }

  function afficherParcs(parcs) {
    if (!listeParcs) return;

    if (!parcs.length) {
      listeParcs.innerHTML = `
        <tr>
          <td colspan="2">
            Il n'y a pas de parc accessible par ici.
          </td>
        </tr>
      `;
      return;
    }

    let html = "";

    for (let i = 0; i < parcs.length; i += 2) {
      html += `
        <tr>
          <td>
            ${creerCarteParc(parcs[i])}
          </td>
          <td>
            ${parcs[i + 1] ? creerCarteParc(parcs[i + 1]) : ""}
          </td>
        </tr>
      `;
    }

    listeParcs.innerHTML = html;
  }

  function creerCarteParc(parc) {
    const idParc = parc.idparc || parc.id;
    const nomParc = echapperHtml(parc.nom);
    const departement = echapperHtml(parc.dptmt || parc.departement || "");
    const imageUrl = construireUrlImageParc(parc.imageparc);

    return `
      <article class="carte-parc-membre">

        <img
          class="carte-parc-membre-image"
          src="${imageUrl}"
          alt="Image du parc ${nomParc}"
        >

        <div class="carte-parc-membre-contenu">

          <h3>
            ${nomParc} (${departement})
          </h3>

          <div class="carte-parc-membre-actions">

            <button class="lien-fiche-parc" type="button" data-action="ouvrir-fiche-parc" data-id="${idParc}">
              Le parc
            </button>

            <button class="micro-action" type="button" data-action="nouvelle-date-parc" data-id="${idParc}">
              Nouvelle date
            </button>

          </div>

        </div>

      </article>
    `;
  }

  function construireUrlImageParc(imageparc) {
    const fichier = imageparc && imageparc.trim() ? imageparc.trim() : "parc-defaut.jpg";

    return SITE_BASE + "/OBJETS/IMAGES/IMAGE%20PARC/" + encodeURIComponent(fichier);
  }

function ouvrirLightboxParc(parc) {
  fermerLightboxParc();

  const idParc = encodeURIComponent(parc.idparc || parc.id || "");
  const nomParc = encodeURIComponent(parc.nom || "");
  const departement = encodeURIComponent(parc.dptmt || parc.departement || "");

  const urlFiche =
    SITE_BASE +
    "/PAGES/PRIVEES/MON%20PLANNING%20MEMBRE/fiche-parc-nouvelle-date.html" +
    "?idparc=" + idParc +
    "&nom=" + nomParc +
    "&dptmt=" + departement;

  const lightbox = document.createElement("div");
  lightbox.id = "lightbox-fiche-parc";
  lightbox.className = "lightbox-fiche-parc-nouvelle-date-overlay";

  lightbox.innerHTML = `
    <div class="lightbox-fiche-parc-nouvelle-date-box" role="dialog" aria-modal="true">

      <button class="micro-action lightbox-fiche-parc-nouvelle-date-fermer" type="button" data-action="fermer-fiche-parc">
        Fermer
      </button>

      <iframe
        class="lightbox-fiche-parc-nouvelle-date-frame"
        src="${urlFiche}"
        title="Fiche du parc"
      ></iframe>

    </div>
  `;

  document.body.appendChild(lightbox);
}

  function fermerLightboxParc() {
    const lightbox = document.getElementById("lightbox-fiche-parc");

    if (lightbox) {
      lightbox.remove();
    }
  }

  function echapperHtml(valeur) {
    return String(valeur ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  document.addEventListener("click", (event) => {
    const lienFicheParc = event.target.closest("[data-action='ouvrir-fiche-parc']");
    const boutonNouvelleDate = event.target.closest("[data-action='nouvelle-date-parc']");
    const boutonFermerFiche = event.target.closest("[data-action='fermer-fiche-parc']");

    if (lienFicheParc) {
      event.preventDefault();

      const idParc = lienFicheParc.dataset.id;

      const parc = parcsCharges.find((item) => {
        return String(item.idparc || item.id) === String(idParc);
      });

      if (!parc) {
        afficherErreur("Fiche parc introuvable.");
        return;
      }

      ouvrirLightboxParc(parc);
      return;
    }

    if (boutonNouvelleDate) {
      alert("La réservation de cette nouvelle date sera raccordée ensuite.");
      return;
    }

    if (boutonFermerFiche) {
      fermerLightboxParc();
    }
  });
})();
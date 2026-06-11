(function initialiserNouvelleDateMembre() {
  console.log("NOUVELLE DATE MEMBRE JS DEMARRE");
  const ENDPOINT_NOUVELLE_DATE_MEMBRE = "https://nouvelle-date-membre-api.lacleduparc.fr";

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
    boutonModifierDepartement.addEventListener("click", async () => {
      const nouveauDepartement = prompt(
        "Indiquez le département souhaité :",
        departementAffiche || departementMembre || ""
      );

      if (!nouveauDepartement) return;

      departementAffiche = nouveauDepartement.trim();
      modeAutourDeMoi = false;

      await chargerParcsDepartement(departementAffiche);
    });
  }

  async function chargerParcsAutourDeMoi() {
    try {
      afficherChargement("Connexion aux parcs");

      const reponse = await fetch(ENDPOINT_NOUVELLE_DATE_MEMBRE + "/autour-de-moi", {
        method: "GET",
        credentials: "include"
      });

if (gererSessionExpiree(reponse, "nouvelle-date-membre")) {
  return;
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

    listeParcs.innerHTML = parcs.map(creerCarteParc).join("");
  }

  function creerCarteParc(parc) {
    const idParc = parc.idparc || parc.id;
    const nomParc = echapperHtml(parc.nom);
    const departement = echapperHtml(parc.dptmt || parc.departement || "");
    const imageUrl = construireUrlImageParc(parc.imageparc);

    return `
      <tr>
        <td colspan="2">

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

              <a href="#" class="lien-fiche-parc" data-action="ouvrir-fiche-parc" data-id="${idParc}">
                Le parc
              </a>

              <button class="micro-action" type="button" data-action="nouvelle-date-parc" data-id="${idParc}">
                Nouvelle date
              </button>

            </div>

          </article>

        </td>
      </tr>
    `;
  }

  function construireUrlImageParc(imageparc) {
    const SITE_BASE = window.SITE_BASE || "";
    const fichier = imageparc && imageparc.trim() ? imageparc.trim() : "parc-defaut.jpg";

    return SITE_BASE + "/OBJETS/IMAGES/IMAGE%20PARC/" + encodeURIComponent(fichier);
  }

  function ouvrirLightboxParc(parc) {
    fermerLightboxParc();

    const nomParc = echapperHtml(parc.nom);
    const departement = echapperHtml(parc.dptmt || parc.departement || "");
    const presentation = echapperHtml(parc.prez || parc.description || "Présentation du parc à renseigner.");
    const imageUrl = construireUrlImageParc(parc.imageparc);

    const lightbox = document.createElement("div");
    lightbox.id = "lightbox-fiche-parc";
    lightbox.className = "lightbox-parc-overlay";

    lightbox.innerHTML = `
      <div class="lightbox-parc-box" role="dialog" aria-modal="true">

        <button class="micro-action lightbox-parc-fermer" type="button" data-action="fermer-fiche-parc">
          Fermer
        </button>

        <img
          class="lightbox-parc-image"
          src="${imageUrl}"
          alt="Image du parc ${nomParc}"
        >

        <h2>
          ${nomParc} (${departement})
        </h2>

        <p>
          ${presentation}
        </p>

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
      const parc = parcsCharges.find((item) => String(item.idparc || item.id) === String(idParc));

      if (!parc) return;

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
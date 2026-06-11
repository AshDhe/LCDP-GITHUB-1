document.addEventListener("DOMContentLoaded", () => {
  const listeParcs = document.getElementById("liste-parcs-membre");
  const boutonDemanderIA = document.getElementById("bouton-demander-ia");
  const boutonModifierDepartement = document.getElementById("bouton-modifier-departement");
  const titreDepartement = document.getElementById("titre-departement-membre");

  let departementMembre = "41";

  const parcsDemo = [
    {
      id: "parc-1",
      nom: "Parc de Ménars",
      departement: "41",
      ville: "Ménars",
      description: "Parc privé accessible aux membres La Clé du Parc."
    },
    {
      id: "parc-2",
      nom: "Parc de Rochambeau",
      departement: "41",
      ville: "Vendôme",
      description: "Parc partenaire disponible selon les créneaux ouverts."
    },
    {
      id: "parc-3",
      nom: "Parc de La Ferté-Saint-Aubin",
      departement: "45",
      ville: "La Ferté-Saint-Aubin",
      description: "Parc accessible sur demande selon disponibilités."
    }
  ];

  afficherDepartement();
  afficherParcs();

  if (boutonDemanderIA) {
    boutonDemanderIA.addEventListener("click", () => {
      alert("La demande à l’IA sera raccordée ensuite.");
    });
  }

  if (boutonModifierDepartement) {
    boutonModifierDepartement.addEventListener("click", () => {
      const nouveauDepartement = prompt(
        "Indiquez le département souhaité :",
        departementMembre
      );

      if (!nouveauDepartement) return;

      departementMembre = nouveauDepartement.trim();
      afficherDepartement();
      afficherParcs();
    });
  }

  function afficherDepartement() {
    if (!titreDepartement) return;

    titreDepartement.textContent = "Votre département : " + departementMembre;
  }

  function afficherParcs() {
    if (!listeParcs) return;

    const parcsFiltres = parcsDemo.filter((parc) => {
      return parc.departement === departementMembre;
    });

    if (parcsFiltres.length === 0) {
      listeParcs.innerHTML = `
        <tr>
          <td colspan="2">
            Il n'y a pas de parc accessible par ici.
          </td>
        </tr>
      `;
      return;
    }

    listeParcs.innerHTML = parcsFiltres.map(creerCarteParc).join("");
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

function echapperHtml(valeur) {
  return String(valeur ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

document.addEventListener("click", (event) => {
  const lienFicheParc = event.target.closest("[data-action='ouvrir-fiche-parc']");
  const boutonNouvelleDate = event.target.closest("[data-action='nouvelle-date-parc']");
  const boutonFermerFiche = event.target.closest("[data-action='fermer-fiche-parc']");

  if (lienFicheParc) {
    event.preventDefault();

    const idParc = lienFicheParc.dataset.id;
    const parc = parcsDemo.find((item) => String(item.idparc || item.id) === String(idParc));

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

});
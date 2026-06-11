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
            Aucun parc trouvé dans ce département.
          </td>
        </tr>
      `;
      return;
    }

    listeParcs.innerHTML = parcsFiltres.map(creerCarteParc).join("");
  }

  function creerCarteParc(parc) {
    return `
      <tr>
        <td colspan="2">

          <article class="carte-parc-membre">

            <h3>
              ${parc.nom}
            </h3>

            <p>
              ${parc.ville} (${parc.departement})
            </p>

            <p>
              ${parc.description}
            </p>

            <button class="micro-action" type="button" data-action="voir-disponibilites" data-id="${parc.id}">
              Voir les disponibilités
            </button>

          </article>

        </td>
      </tr>
    `;
  }

  document.addEventListener("click", (event) => {
    const boutonDisponibilites = event.target.closest("[data-action='voir-disponibilites']");

    if (!boutonDisponibilites) return;

    const idParc = boutonDisponibilites.dataset.id;

    alert("Les disponibilités du parc " + idParc + " seront raccordées ensuite.");
  });
});
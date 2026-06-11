document.addEventListener("DOMContentLoaded", () => {
  const SITE_BASE = window.SITE_BASE || "";

  const listePlanning = document.getElementById("liste-planning-membre");
  const lienPasse = document.getElementById("planning-membre-passe");
  const boutonNouvelleDate = document.getElementById("bouton-nouvelle-date-planning");

  const URL_NOUVELLE_DATE = SITE_BASE + "/PAGES/PRIVEES/MON%20PLANNING%20MEMBRE/nouvelle-date-membre.html";

  let affichageActuel = "avenir";

  const rendezVousDemo = [
    {
      id: "rdv-1",
      date: "2026-06-18",
      heureDebut: "14:00",
      heureFin: "16:00",
      parc: "Parc de Ménars",
      departement: "41",
      adresse: "Adresse du parc à renseigner"
    },
    {
      id: "rdv-2",
      date: "2026-05-22",
      heureDebut: "10:00",
      heureFin: "12:00",
      parc: "Parc de Rochambeau",
      departement: "41",
      adresse: "Adresse du parc à renseigner"
    }
  ];

  if (boutonNouvelleDate) {
    boutonNouvelleDate.addEventListener("click", () => {
      window.location.href = URL_NOUVELLE_DATE;
    });
  }

  if (lienPasse) {
    lienPasse.addEventListener("click", (event) => {
      event.preventDefault();

      affichageActuel = affichageActuel === "avenir" ? "passe" : "avenir";

      lienPasse.textContent = affichageActuel === "avenir" ? "Passé" : "À venir";
      lienPasse.dataset.affichage = affichageActuel === "avenir" ? "passe" : "avenir";

      afficherPlanning();
    });
  }

  function afficherPlanning() {
    if (!listePlanning) return;

    const maintenant = new Date();

    const rendezVousFiltres = rendezVousDemo.filter((rdv) => {
      const dateRdv = new Date(rdv.date + "T" + rdv.heureFin);

      if (affichageActuel === "avenir") {
        return dateRdv >= maintenant;
      }

      return dateRdv < maintenant;
    });

    if (rendezVousFiltres.length === 0) {
      listePlanning.innerHTML = `
        <tr>
          <td colspan="3">
            Aucun rendez-vous ${affichageActuel === "avenir" ? "à venir" : "passé"}.
          </td>
        </tr>
      `;
      return;
    }

    listePlanning.innerHTML = rendezVousFiltres.map(creerCartePlanning).join("");
  }

  function creerCartePlanning(rdv) {
    const estPasse = new Date(rdv.date + "T" + rdv.heureFin) < new Date();

    return `
      <tr>
        <td colspan="3">
          <article class="carte-planning-membre">

            <p>
              <span class="date-planning-membre">${formaterDate(rdv.date)}</span>
              <span class="heure-planning-membre">${rdv.heureDebut} - ${rdv.heureFin}</span>
            </p>

            <p>
              <span class="parc-planning-membre">${rdv.parc}</span>
              <span class="departement-planning-membre">(${rdv.departement})</span>
            </p>

            <button class="micro-action" type="button" data-action="adresse" data-adresse="${rdv.adresse}">
              Voir l’adresse
            </button>

            ${
              estPasse
                ? ""
                : `
                  <button class="micro-action" type="button" data-action="annuler" data-id="${rdv.id}">
                    Annuler
                  </button>
                `
            }

          </article>
        </td>
      </tr>
    `;
  }

  function formaterDate(dateIso) {
    return new Date(dateIso + "T00:00:00").toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  document.addEventListener("click", (event) => {
    const boutonAdresse = event.target.closest("[data-action='adresse']");
    const boutonAnnuler = event.target.closest("[data-action='annuler']");

    if (boutonAdresse) {
      alert(boutonAdresse.dataset.adresse || "Adresse non disponible.");
      return;
    }

    if (boutonAnnuler) {
      alert("L’annulation du rendez-vous sera raccordée ensuite.");
    }
  });

  afficherPlanning();
});
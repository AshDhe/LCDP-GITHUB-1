document.addEventListener("DOMContentLoaded", () => {
  const SITE_BASE = window.SITE_BASE || "";
  const ENDPOINT_FLUXM =
    "https://worker-fluxm-api.lacleduparc.fr";

  const listePlanning = document.getElementById("liste-planning-membre");
  const lienPasse = document.getElementById("planning-membre-passe");
  const boutonNouvelleDate = document.getElementById("bouton-nouvelle-date-planning");

  const URL_NOUVELLE_DATE =
    SITE_BASE + "/PAGES/PRIVEES/MON%20PLANNING%20MEMBRE/nouvelle-date-membre.html";

  let affichageActuel = "avenir";
  let reservations = [];

  if (boutonNouvelleDate) {
    boutonNouvelleDate.addEventListener("click", (event) => {
      event.preventDefault();
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

  chargerReservations();

  async function chargerReservations() {
    try {
      afficherChargement();

      const reponse = await fetch(ENDPOINT_FLUXM + "/mes-reservations", {
        method: "GET",
        credentials: "include"
      });

      if (reponse.status === 401) {
        redirigerConnexionMembre("mon-planning-membre");
        return;
      }

      const data = await reponse.json().catch(() => null);

      if (!reponse.ok || !data || data.success !== true) {
        throw new Error(
          data && data.message
            ? data.message
            : "Impossible de charger votre planning."
        );
      }

      reservations = data.reservations || [];
      afficherPlanning();

    } catch (erreur) {
      afficherErreur(erreur.message);
    }
  }

  function redirigerConnexionMembre(sourcePage) {
    window.location.href =
      SITE_BASE +
      "/PAGES/PUBLIQUES/CONNEXION%20MEMBRE/connexion-membre.html?source=" +
      encodeURIComponent(sourcePage);
  }

  function afficherChargement() {
    if (!listePlanning) return;

    listePlanning.innerHTML = `
      <tr>
        <td colspan="3">
          Chargement de votre planning...
        </td>
      </tr>
    `;
  }

  function afficherErreur(message) {
    if (!listePlanning) return;

    listePlanning.innerHTML = `
      <tr>
        <td colspan="3">
          ${echapperHtml(message)}
        </td>
      </tr>
    `;
  }

  function afficherPlanning() {
    if (!listePlanning) return;

    const maintenant = new Date();

    const reservationsFiltrees = reservations.filter((reservation) => {
      const dateReservation = new Date(reservation.datebookd);

      if (affichageActuel === "avenir") {
        return dateReservation >= maintenant;
      }

      return dateReservation < maintenant;
    });

    if (reservationsFiltrees.length === 0) {
      listePlanning.innerHTML = `
        <tr>
          <td colspan="3">
            Aucune date ${affichageActuel === "avenir" ? "à venir" : "passée"}.
          </td>
        </tr>
      `;
      return;
    }

    listePlanning.innerHTML = reservationsFiltrees.map(creerCartePlanning).join("");
  }

  function creerCartePlanning(reservation) {
    const dateReservation = new Date(reservation.datebookd);
    const estPasse = dateReservation < new Date();

    const parc = reservation.parc || {};
    const nomParc = parc.nom || "Parc";
    const departement = parc.dptmt || "";

    return `
      <tr>
        <td colspan="3">
          <article class="carte-planning-membre">

            <p>
              <span class="date-planning-membre">${formaterDateReservation(reservation.datebookd)}</span>
              <span class="heure-planning-membre">Arrivée à ${formaterHeureReservation(reservation.datebookd)}</span>
            </p>

            <p>
              <span class="parc-planning-membre">${echapperHtml(nomParc)}</span>
              <span class="departement-planning-membre">${departement ? "(" + echapperHtml(departement) + ")" : ""}</span>
            </p>

            <button class="micro-action" type="button" data-action="adresse">
              Voir l’adresse
            </button>

            ${
              estPasse
                ? ""
                : `
                  <button class="micro-action" type="button" data-action="annuler" data-id="${reservation.idflux}">
                    Annuler
                  </button>
                `
            }

          </article>
        </td>
      </tr>
    `;
  }

  function formaterDateReservation(dateIso) {
    return new Date(dateIso).toLocaleDateString("fr-FR", {
      timeZone: "Europe/Paris",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function formaterHeureReservation(dateIso) {
    return new Date(dateIso).toLocaleTimeString("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit"
    }).replace(":", "h");
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
    const boutonAdresse = event.target.closest("[data-action='adresse']");
    const boutonAnnuler = event.target.closest("[data-action='annuler']");

    if (boutonAdresse) {
      alert("L’adresse sera raccordée ensuite.");
      return;
    }

    if (boutonAnnuler) {
      alert("L’annulation de la réservation sera raccordée ensuite.");
    }
  });
});
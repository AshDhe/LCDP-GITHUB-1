function initialiserMonPlanningMembre() {
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

    const reservationsFiltrees = reservations
      .filter((reservation) => {
        const dateReservation = new Date(reservation.datebookd);

        if (affichageActuel === "avenir") {
          return dateReservation >= maintenant;
        }

        return dateReservation < maintenant;
      })
      .sort((a, b) => {
        const dateA = new Date(a.datebookd);
        const dateB = new Date(b.datebookd);

        if (affichageActuel === "avenir") {
          return dateA - dateB;
        }

        return dateB - dateA;
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

    const ligneInvitation = creerLigneInvitation(reservation);

    return `
      <tr>
        <td colspan="3">
          <article class="carte-planning-membre">

            ${
              ligneInvitation
                ? `
                  <p class="carte-planning-membre-ligne carte-planning-membre-invitation">
                    ${ligneInvitation}
                  </p>
                `
                : ""
            }

            <p class="carte-planning-membre-ligne carte-planning-membre-date">
              <span class="date-planning-membre">
                ${formaterDateCourte(reservation.datebookd)}
              </span>

              <span class="heure-planning-membre">
                ${formaterHeureReservation(reservation.datebookd)}
              </span>
            </p>

            <p class="carte-planning-membre-ligne carte-planning-membre-parc">
              <span class="parc-planning-membre">
                Parc de ${echapperHtml(nomParc)}
              </span>

              <span class="departement-planning-membre">
                ${departement ? "(" + echapperHtml(departement) + ")" : ""}
              </span>
            </p>

            <div class="carte-planning-membre-actions">

              <button
                class="micro-action"
                type="button"
                data-action="adresse"
                data-idparc="${echapperHtml(parc.idparc || reservation.idparc || "")}"
              >
                Voir l’adresse
              </button>

              ${
                estPasse
                  ? ""
                  : `
                    <button
                      class="micro-action"
                      type="button"
                      data-action="annuler"
                      data-id="${echapperHtml(reservation.idflux)}"
                    >
                      Annuler
                    </button>
                  `
              }

            </div>

          </article>
        </td>
      </tr>
    `;
  }

  function creerLigneInvitation(reservation) {
    if (reservation.invitation !== true) {
      return "";
    }

    const parrain =
      reservation.parrain ||
      reservation.inviteur ||
      reservation.membre_parrain ||
      null;

    if (!parrain) {
      return "Invitation";
    }

    const nom = parrain.nommembre || parrain.nom || "";
    const prenom = parrain.prenommembre || parrain.prenom || "";

    const identite = [nom, prenom]
      .map((valeur) => String(valeur || "").trim())
      .filter(Boolean)
      .join(" ");

    return identite
      ? "Invitation (" + echapperHtml(identite) + ")"
      : "Invitation";
  }

  function formaterDateCourte(dateIso) {
    const dateFormatee = new Date(dateIso).toLocaleDateString("fr-FR", {
      timeZone: "Europe/Paris",
      weekday: "long",
      day: "numeric",
      month: "long"
    });

    return majusculePremiereLettre(dateFormatee);
  }

  function formaterHeureReservation(dateIso) {
    const heure = new Date(dateIso).toLocaleTimeString("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit"
    });

    return heure
      .replace(":", "h")
      .replace("h00", "h");
  }

  function majusculePremiereLettre(texte) {
    const valeur = String(texte || "");

    if (!valeur) return "";

    return valeur.charAt(0).toUpperCase() + valeur.slice(1);
  }

  async function annulerReservation(idflux) {
    const reponse = await fetch(ENDPOINT_FLUXM + "/annuler-reservation", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idflux: idflux
      })
    });

    const data = await reponse.json().catch(() => null);

    if (reponse.status === 401) {
      redirigerConnexionMembre("mon-planning-membre");
      return;
    }

    if (!reponse.ok || !data || data.success !== true) {
      throw new Error(
        data && data.message
          ? data.message
          : "Impossible d’annuler cette réservation."
      );
    }

    return data.reservation;
  }

  function ouvrirLightboxConfirmationAnnulation(idflux) {
    fermerLightboxPlanningMembre();

    const lightbox = document.createElement("div");
    lightbox.id = "lightbox-planning-membre";
    lightbox.className = "dialog-overlay";

    lightbox.innerHTML = `
      <div class="dialog-box" role="dialog" aria-modal="true">

        <h2>
          Confirmer l’annulation
        </h2>

        <p>
          Voulez-vous vraiment annuler cette date ?
        </p>

        <div class="dialog-actions">

          <button
            class="button button-secondaire"
            type="button"
            data-action="annuler-lightbox-annulation"
          >
            Non
          </button>

          <button
            class="button"
            type="button"
            data-action="confirmer-annulation-reservation"
            data-id="${echapperHtml(idflux)}"
          >
            Oui
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(lightbox);
  }

  function ouvrirLightboxAnnulationEnregistree() {
    fermerLightboxPlanningMembre();

    const lightbox = document.createElement("div");
    lightbox.id = "lightbox-planning-membre";
    lightbox.className = "dialog-overlay";

    lightbox.innerHTML = `
      <div class="dialog-box" role="dialog" aria-modal="true">

        <h2>
          Annulation enregistrée
        </h2>

        <p>
          Votre annulation est enregistrée.
        </p>

        <div class="dialog-actions">

          <button
            class="button"
            type="button"
            data-action="retour-planning-apres-annulation"
          >
            OK
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(lightbox);
  }

  function fermerLightboxPlanningMembre() {
    const lightbox = document.getElementById("lightbox-planning-membre");

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

  document.addEventListener("click", async (event) => {
    const boutonAdresse = event.target.closest("[data-action='adresse']");
    const boutonAnnuler = event.target.closest("[data-action='annuler']");
    const boutonAnnulerLightbox = event.target.closest("[data-action='annuler-lightbox-annulation']");
    const boutonConfirmerAnnulation = event.target.closest("[data-action='confirmer-annulation-reservation']");
    const boutonRetourPlanning = event.target.closest("[data-action='retour-planning-apres-annulation']");

    if (boutonAdresse) {
      alert("L’adresse sera raccordée ensuite.");
      return;
    }

    if (boutonAnnuler) {
      ouvrirLightboxConfirmationAnnulation(boutonAnnuler.dataset.id);
      return;
    }

    if (boutonAnnulerLightbox) {
      fermerLightboxPlanningMembre();
      return;
    }

    if (boutonConfirmerAnnulation) {
      const idflux = boutonConfirmerAnnulation.dataset.id;

      boutonConfirmerAnnulation.disabled = true;
      boutonConfirmerAnnulation.textContent = "Annulation...";

      try {
        await annulerReservation(idflux);
        ouvrirLightboxAnnulationEnregistree();
      } catch (erreur) {
        boutonConfirmerAnnulation.disabled = false;
        boutonConfirmerAnnulation.textContent = "Oui";
        alert(erreur.message);
      }

      return;
    }

    if (boutonRetourPlanning) {
      window.location.reload();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiserMonPlanningMembre);
} else {
  initialiserMonPlanningMembre();
}
function initialiserMonPlanningMembre() {
  const SITE_BASE = window.SITE_BASE || "";
  const ENDPOINT_FLUXM =
    "https://worker-fluxm-api.lacleduparc.fr";
  const ENDPOINT_IA_SHIFT_FLUXM =
    "https://worker-ia-shift-fluxm.lacleduparc.fr";
  const ROUTE_RECHERCHE_IA =
    ENDPOINT_IA_SHIFT_FLUXM + "/chercher-parcs";

  const listePlanning = document.getElementById("liste-planning-membre");
  const lienPasse = document.getElementById("planning-membre-passe");
  const boutonNouvelleDate = document.getElementById("bouton-nouvelle-date-planning");
  const boutonIaPlanning = document.getElementById("bouton-ia-planning");

  const lightboxIaPlanning = document.getElementById("lightbox-ia-planning");
  const conversationIaPlanning = document.getElementById("ia-planning-conversation");
  const transcriptionIaPlanning = document.getElementById("ia-planning-transcription-texte");
  const statutIaPlanning = document.getElementById("ia-planning-statut");
  const erreurIaPlanning = document.getElementById("ia-planning-erreur");
  const boutonFermerIaPlanning = document.getElementById("bouton-fermer-ia-planning");
  const boutonRecommencerIaPlanning = document.getElementById("bouton-recommencer-ia-planning");
  const boutonMicroIaPlanning = document.getElementById("bouton-micro-ia-planning");

  const URL_NOUVELLE_DATE =
    SITE_BASE + "/PAGES/PRIVEES/MON%20PLANNING%20MEMBRE/nouvelle-date-membre.html";

  let affichageActuel = "avenir";
  let reservations = [];
  let reconnaissanceVocale = null;
  let reconnaissanceActive = false;
  let demandeIaEnCours = false;
  let texteReconnuIa = "";
  let derniereDemandeIaEnvoyee = "";

  if (boutonNouvelleDate) {
    boutonNouvelleDate.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = URL_NOUVELLE_DATE;
    });
  }

  if (boutonIaPlanning) {
    boutonIaPlanning.addEventListener("click", (event) => {
      event.preventDefault();
      ouvrirLightboxIaPlanning();
    });
  }

  if (boutonFermerIaPlanning) {
    boutonFermerIaPlanning.addEventListener("click", fermerLightboxIaPlanning);
  }

  if (boutonRecommencerIaPlanning) {
    boutonRecommencerIaPlanning.addEventListener("click", reinitialiserLightboxIaPlanning);
  }

  if (boutonMicroIaPlanning) {
    boutonMicroIaPlanning.addEventListener("click", gererClicMicroIaPlanning);
  }

  if (lightboxIaPlanning) {
    lightboxIaPlanning.addEventListener("click", (event) => {
      if (event.target === lightboxIaPlanning) {
        fermerLightboxIaPlanning();
      }
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

  function ouvrirLightboxIaPlanning() {
    if (!lightboxIaPlanning) return;

    reinitialiserLightboxIaPlanning();
    lightboxIaPlanning.hidden = false;

    if (boutonMicroIaPlanning) {
      boutonMicroIaPlanning.focus();
    }
  }

  function fermerLightboxIaPlanning() {
    arreterReconnaissanceVocaleIa();

    if (lightboxIaPlanning) {
      lightboxIaPlanning.hidden = true;
    }
  }

  function reinitialiserLightboxIaPlanning() {
    arreterReconnaissanceVocaleIa();

    demandeIaEnCours = false;
    texteReconnuIa = "";
    derniereDemandeIaEnvoyee = "";

    if (conversationIaPlanning) {
      conversationIaPlanning.innerHTML = `
        <p class="ia-planning-message ia-planning-message-systeme">
          Exemple : “Je cherche un parc calme demain après-midi près de Blois.”
        </p>
      `;
    }

    if (transcriptionIaPlanning) {
      transcriptionIaPlanning.textContent = "Aucune demande pour le moment.";
    }

    afficherStatutIaPlanning("Micro en attente.");
    afficherErreurIaPlanning("");

    if (boutonMicroIaPlanning) {
      boutonMicroIaPlanning.disabled = false;
      boutonMicroIaPlanning.textContent = "🎙️ Parler";
    }

    if (boutonRecommencerIaPlanning) {
      boutonRecommencerIaPlanning.disabled = false;
    }
  }

  function gererClicMicroIaPlanning() {
    if (demandeIaEnCours) return;

    if (reconnaissanceActive) {
      arreterReconnaissanceVocaleIa();
      return;
    }

    demarrerReconnaissanceVocaleIa();
  }

  function demarrerReconnaissanceVocaleIa() {
    const APIReconnaissance =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!APIReconnaissance) {
      afficherErreurIaPlanning(
        "La reconnaissance vocale n’est pas disponible sur ce navigateur."
      );
      afficherStatutIaPlanning("Micro indisponible.");
      return;
    }

    if (!reconnaissanceVocale) {
      reconnaissanceVocale = new APIReconnaissance();
      reconnaissanceVocale.lang = "fr-FR";
      reconnaissanceVocale.interimResults = true;
      reconnaissanceVocale.continuous = false;
      reconnaissanceVocale.maxAlternatives = 1;

      reconnaissanceVocale.onstart = () => {
        reconnaissanceActive = true;
        texteReconnuIa = "";
        derniereDemandeIaEnvoyee = "";
        afficherErreurIaPlanning("");
        afficherStatutIaPlanning("Je t’écoute...");
        mettreAJourBoutonMicroIaPlanning();
      };

      reconnaissanceVocale.onresult = (event) => {
        let texteFinal = "";
        let texteIntermediaire = "";

        for (let index = 0; index < event.results.length; index += 1) {
          const resultat = event.results[index];
          const transcription = resultat[0] && resultat[0].transcript
            ? resultat[0].transcript
            : "";

          if (resultat.isFinal) {
            texteFinal += transcription;
          } else {
            texteIntermediaire += transcription;
          }
        }

        texteReconnuIa = texteFinal.trim();

        const texteAffiche = (texteReconnuIa + " " + texteIntermediaire).trim();

        if (transcriptionIaPlanning) {
          transcriptionIaPlanning.textContent =
            texteAffiche || "Aucune demande pour le moment.";
        }
      };

      reconnaissanceVocale.onerror = (event) => {
        reconnaissanceActive = false;
        mettreAJourBoutonMicroIaPlanning();

        if (event.error === "no-speech") {
          afficherErreurIaPlanning("Je n’ai pas entendu de demande.");
          afficherStatutIaPlanning("Micro en attente.");
          return;
        }

        if (event.error === "not-allowed") {
          afficherErreurIaPlanning("Le navigateur n’a pas accès au micro.");
          afficherStatutIaPlanning("Micro bloqué.");
          return;
        }

        afficherErreurIaPlanning("La reconnaissance vocale a échoué.");
        afficherStatutIaPlanning("Micro en attente.");
      };

      reconnaissanceVocale.onend = () => {
        reconnaissanceActive = false;
        mettreAJourBoutonMicroIaPlanning();

        const demande = String(texteReconnuIa || "").trim();

        if (!demande) {
          afficherStatutIaPlanning("Micro en attente.");
          return;
        }

        if (demande === derniereDemandeIaEnvoyee) {
          return;
        }

        derniereDemandeIaEnvoyee = demande;
        envoyerDemandeIaPlanning(demande);
      };
    }

    try {
      reconnaissanceVocale.start();
    } catch (erreur) {
      afficherErreurIaPlanning("Le micro est déjà en cours d’écoute.");
    }
  }

  function arreterReconnaissanceVocaleIa() {
    if (!reconnaissanceVocale || !reconnaissanceActive) {
      reconnaissanceActive = false;
      mettreAJourBoutonMicroIaPlanning();
      return;
    }

    reconnaissanceVocale.stop();
  }

  async function envoyerDemandeIaPlanning(demande) {
    demandeIaEnCours = true;
    afficherErreurIaPlanning("");
    afficherStatutIaPlanning("Recherche en cours...");
    ajouterMessageIaPlanning("utilisateur", demande);

    if (boutonMicroIaPlanning) {
      boutonMicroIaPlanning.disabled = true;
      boutonMicroIaPlanning.textContent = "Recherche...";
    }

    if (boutonRecommencerIaPlanning) {
      boutonRecommencerIaPlanning.disabled = true;
    }

    try {
      const reponse = await fetch(ROUTE_RECHERCHE_IA, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: demande,
          source: "mon-planning-membre"
        })
      });

      const data = await reponse.json().catch(() => null);

      if (reponse.status === 401) {
        redirigerConnexionMembre("mon-planning-membre");
        return;
      }

      if (!reponse.ok || !data || data.success === false) {
        throw new Error(
          data && data.message
            ? data.message
            : "La recherche IA n’a pas répondu correctement."
        );
      }

      const texteReponse = extraireTexteReponseIaPlanning(data);

      ajouterMessageIaPlanning(
        "assistant",
        texteReponse || "Je n’ai pas trouvé de parc correspondant à cette demande."
      );

      afficherStatutIaPlanning("Réponse affichée.");

    } catch (erreur) {
      afficherErreurIaPlanning(erreur.message);
      afficherStatutIaPlanning("Recherche interrompue.");
    } finally {
      demandeIaEnCours = false;

      if (boutonMicroIaPlanning) {
        boutonMicroIaPlanning.disabled = false;
        boutonMicroIaPlanning.textContent = "🎙️ Parler";
      }

      if (boutonRecommencerIaPlanning) {
        boutonRecommencerIaPlanning.disabled = false;
      }
    }
  }

  function extraireTexteReponseIaPlanning(data) {
    if (!data) return "";

    if (typeof data.reponse === "string") return data.reponse;
    if (typeof data.response === "string") return data.response;
    if (typeof data.message === "string") return data.message;
    if (typeof data.texte === "string") return data.texte;

    if (Array.isArray(data.parcs)) {
      return creerTexteDepuisParcsIaPlanning(data.parcs);
    }

    if (Array.isArray(data.resultats)) {
      return creerTexteDepuisParcsIaPlanning(data.resultats);
    }

    return "";
  }

  function creerTexteDepuisParcsIaPlanning(parcs) {
    if (!parcs.length) {
      return "Je n’ai pas trouvé de parc disponible pour cette demande.";
    }

    return parcs
      .map((parc, index) => {
        const nom = parc.nom || parc.nomparc || parc.nom_parc || "Parc";
        const dptmt = parc.dptmt || parc.departement || "";
        const disponibilite = parc.disponibilite || parc.creneau || parc.horaire || "";

        return [
          index + 1 + ". Parc de " + nom + (dptmt ? " (" + dptmt + ")" : ""),
          disponibilite ? "Créneau : " + disponibilite : ""
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");
  }

  function ajouterMessageIaPlanning(type, texte) {
    if (!conversationIaPlanning) return;

    const message = document.createElement("p");

    message.className =
      "ia-planning-message " +
      (type === "utilisateur"
        ? "ia-planning-message-utilisateur"
        : "ia-planning-message-assistant");

    message.innerHTML = echapperHtml(texte).replaceAll("\n", "<br>");

    conversationIaPlanning.appendChild(message);
    conversationIaPlanning.scrollTop = conversationIaPlanning.scrollHeight;
  }

  function afficherStatutIaPlanning(message) {
    if (statutIaPlanning) {
      statutIaPlanning.textContent = message;
    }
  }

  function afficherErreurIaPlanning(message) {
    if (!erreurIaPlanning) return;

    if (!message) {
      erreurIaPlanning.hidden = true;
      erreurIaPlanning.textContent = "";
      return;
    }

    erreurIaPlanning.hidden = false;
    erreurIaPlanning.textContent = message;
  }

  function mettreAJourBoutonMicroIaPlanning() {
    if (!boutonMicroIaPlanning) return;

    if (reconnaissanceActive) {
      boutonMicroIaPlanning.textContent = "Arrêter";
      boutonMicroIaPlanning.disabled = false;
      return;
    }

    if (!demandeIaEnCours) {
      boutonMicroIaPlanning.textContent = "🎙️ Parler";
      boutonMicroIaPlanning.disabled = false;
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
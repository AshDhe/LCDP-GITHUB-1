const WORKER_CONNEXION_MEMBRE_URL = "https://api.lacleduparc.fr";

const URL_MON_COMPTE_MEMBRE =
  window.SITE_BASE + "/PAGES/PRIVEES/MON%20COMPTE%20MEMBRE/mon-compte-membre.html";

function initialiserConnexionMembre() {
  const formulaire = document.getElementById("formulaire-connexion-membre");
  const champEmail = document.getElementById("emailmembre");
  const champMdp = document.getElementById("mdpmembre");
  const bouton = document.getElementById("bouton-valider-formulaire");

  if (!formulaire || !champEmail || !champMdp || !bouton) {
    afficherMessage("Une erreur est survenue au chargement de la page.");
    return;
  }

  bouton.addEventListener("click", connecterMembre);

  formulaire.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      connecterMembre();
    }
  });

  async function connecterMembre() {
    if (bouton.disabled) return;

    const emailmembre = champEmail.value.trim().toLowerCase();
    const mdpmembre = champMdp.value;

    if (!emailmembre) {
      afficherMessage("Veuillez renseigner votre identifiant de compte.");
      return;
    }

    if (!mdpmembre) {
      afficherMessage("Veuillez renseigner votre mot de passe.");
      return;
    }

    bouton.disabled = true;
    bouton.textContent = "Connexion en cours...";

    try {
      const reponse = await fetch(WORKER_CONNEXION_MEMBRE_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emailmembre,
          mdpmembre
        })
      });

      const resultat = await reponse.json().catch(() => null);

      if (!reponse.ok || !resultat || resultat.success !== true) {
        afficherMessage(
          resultat?.message || "Identifiant ou mot de passe incorrect."
        );
        return;
      }

      window.location.href = URL_MON_COMPTE_MEMBRE;

    } catch (erreur) {
      afficherMessage("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      bouton.disabled = false;
      bouton.textContent = "Connexion";
    }
  }
}

function afficherMessage(message) {
  if (typeof window.afficherLightboxInformation === "function") {
    window.afficherLightboxInformation(message);
    return;
  }

  if (typeof window.ouvrirLightboxInformation === "function") {
    window.ouvrirLightboxInformation(message);
    return;
  }

  alert(message);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiserConnexionMembre);
} else {
  initialiserConnexionMembre();
}
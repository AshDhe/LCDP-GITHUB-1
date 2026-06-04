if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", chargerCarrouselArrivee);
} else {
  chargerCarrouselArrivee();
}

async function chargerCarrouselArrivee() {
  const container = document.getElementById("carousel-container");

  if (!container) return;

  const siteBase = window.SITE_BASE || "";

  try {
    const response = await fetch(siteBase + "/OBJETS/BLOCS/carrousel-arrivee.html");

    if (!response.ok) {
      throw new Error("Impossible de charger le carrousel");
    }

    const html = await response.text();
    container.innerHTML = html;

    corrigerImagesCarrouselAvecSiteBase(container);
    initCarrousel(container);
  } catch (error) {
    console.error("Erreur de chargement du carrousel :", error);
  }
}

function corrigerImagesCarrouselAvecSiteBase(scope) {
  const siteBase = window.SITE_BASE || "";

  if (!siteBase) return;

  scope.querySelectorAll("img[src^='/']").forEach((image) => {
    image.setAttribute("src", siteBase + image.getAttribute("src"));
  });
}

function initCarrousel(container) {
  const carousel = container.querySelector(".carousel");
  const images = container.querySelectorAll(".carousel-track img");
  const prevButton = container.querySelector(".carousel-btn.prev");
  const nextButton = container.querySelector(".carousel-btn.next");
  const dotsContainer = container.querySelector(".carousel-dots");

  if (!carousel || images.length === 0 || !prevButton || !nextButton || !dotsContainer) return;

  let currentIndex = 0;
  let autoPlay;

  images.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Afficher l’image ${index + 1}`);

    if (index === 0) {
      dot.classList.add("active");
    }

    dot.addEventListener("click", () => {
      showImage(index);
      restartAutoPlay();
    });

    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll("button");

  function showImage(index) {
    images[currentIndex].classList.remove("active");
    dots[currentIndex].classList.remove("active");

    currentIndex = index;

    images[currentIndex].classList.add("active");
    dots[currentIndex].classList.add("active");
  }

  function showNextImage() {
    const nextIndex = (currentIndex + 1) % images.length;
    showImage(nextIndex);
  }

  function showPrevImage() {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(prevIndex);
  }

  function startAutoPlay() {
    autoPlay = setInterval(showNextImage, 5000);
  }

  function stopAutoPlay() {
    clearInterval(autoPlay);
  }

  function restartAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  nextButton.addEventListener("click", () => {
    showNextImage();
    restartAutoPlay();
  });

  prevButton.addEventListener("click", () => {
    showPrevImage();
    restartAutoPlay();
  });

  carousel.addEventListener("mouseenter", stopAutoPlay);
  carousel.addEventListener("mouseleave", startAutoPlay);

  startAutoPlay();
}
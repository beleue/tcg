async function loadCards() {
  try {
    const res = await fetch("./cards.json");
    if (!res.ok) throw new Error(`Error cargando cards.json: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("No se pudo cargar cards.json:", e);
    return [];
  }
}

/**
 * Selecciona una carta basada en su peso y devuelve tanto la carta como su posición.
 */
function weightedRandom(cards) {
  const totalWeight = cards.reduce((s, c) => s + (c.weight || 0), 0);
  if (totalWeight <= 0) return { card: null, index: -1 };
  
  let random = Math.random() * totalWeight;
  for (let i = 0; i < cards.length; i++) {
    random -= (cards[i].weight || 0);
    if (random <= 0) return { card: cards[i], index: i };
  }
  return { card: null, index: -1 };
}

/**
 * Mapea la rareza a la clase CSS, incluyendo las clases de glow.
 */
function rarityClass(rarity) {
  if (!rarity) return "common";
  const r = rarity.toString().trim().toLowerCase();
  
  if (r === "sur") return "sur glow-sur"; // Gold Glow
  if (r === "sfa") return "sfa glow-sfa"; // Purple Glow
  if (r === "sir") return "sir glow-sir"; // Pink Glow
  
  return "common";
}

async function setup() {
  const cards = await loadCards();
  if (!cards.length) return;

  const drawOneBtn = document.getElementById("draw-one");
  const drawFiveBtn = document.getElementById("draw-five");
  const drawTenBtn = document.getElementById("draw-ten");
  const resultsDiv = document.getElementById("results");

  function renderDrawn(drawn) {
    resultsDiv.innerHTML = "";

    drawn.forEach(card => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "card"; 
      
      const specialClasses = rarityClass(card.rarity);
      cardDiv.dataset.rarity = specialClasses;

      // Imagen aleatoria de la lista de la carta
      const randomImage = card.images[Math.floor(Math.random() * card.images.length)];

      cardDiv.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <img src="back.png" alt="Dorso de la carta" />
          </div>
          <div class="card-back">
            <img src="${randomImage}" alt="${card.name}" />
          </div>
        </div>
      `;

      // Evento de clic para girar y aplicar el glow
      cardDiv.addEventListener("click", function() {
        if (!this.classList.contains("flipped")) {
          this.classList.add("flipped");
          const classesToAdd = this.dataset.rarity.split(" ");
          this.classList.add(...classesToAdd);
        }
      });

      resultsDiv.appendChild(cardDiv);
    });
  }

  function draw(n) {
    const drawn = [];
    // Clonamos el mazo original para poder extraer cartas sin afectarlo permanentemente
    let pool = [...cards]; 

    for (let i = 0; i < n; i++) {
      if (pool.length === 0) break; // Detener si nos quedamos sin cartas en el JSON

      const result = weightedRandom(pool);
      
      if (result.card) {
        drawn.push(result.card);
        // Quitamos la carta del mazo temporal para que no salga repetida
        pool.splice(result.index, 1);
      }
    }

    renderDrawn(drawn);
  }

  // Event Listeners
  drawOneBtn?.addEventListener("click", () => draw(1));
  drawFiveBtn?.addEventListener("click", () => draw(5));
  drawTenBtn?.addEventListener("click", () => draw(10));
}

// Iniciamos la configuración
setup();

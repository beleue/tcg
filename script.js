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

function weightedRandom(cards) {
  const totalWeight = cards.reduce((s, c) => s + (c.weight || 0), 0);
  let random = Math.random() * totalWeight;
  for (let card of cards) {
    random -= (card.weight || 0);
    if (random <= 0) return card;
  }
  return null;
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
    // 1. Limpiamos los resultados anteriores
    resultsDiv.innerHTML = "";

    // 2. Creamos cada carta con su dorso (back.png)
    drawn.forEach(card => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "card"; // Solo la clase base para la animación
      
      // Guardamos la rareza en un atributo temporal
      const specialClasses = rarityClass(card.rarity);
      cardDiv.dataset.rarity = specialClasses;

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
      resultsDiv.appendChild(cardDiv);
    });

    // 3. Aplicar el efecto de giro y brillo escalonado
    document.querySelectorAll(".card").forEach((card, i) => {
      setTimeout(() => {
        // Añadimos la clase de giro
        card.classList.add("flipped");
        
        // Añadimos las clases de rareza (y el glow correspondiente)
        const classesToAdd = card.dataset.rarity.split(" ");
        card.classList.add(...classesToAdd);
      }, 200 + i * 180); // Cada carta gira un poco después que la anterior
    });
  }

  function draw(n) {
    const drawn = [];
    const pool = [...cards]; 

    for (let i = 0; i < n; i++) {
      const c = weightedRandom(pool);
      if (!c) break;
      drawn.push(c);
    }

    renderDrawn(drawn);
  }

  // Event Listeners para los botones
  drawOneBtn?.addEventListener("click", () => draw(1));
  drawFiveBtn?.addEventListener("click", () => draw(5));
  drawTenBtn?.addEventListener("click", () => draw(10));
}

// Iniciamos la configuración
setup();

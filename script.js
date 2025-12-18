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
 * @param {string} rarity - La rareza de la carta (e.g., 'SIR', 'SFA', 'SUR').
 * @returns {string} - Clases CSS (e.g., 'sir glow-sir').
 */
function rarityClass(rarity) {
  if (!rarity) return "common";
  const r = rarity.toString().trim().toLowerCase();
  
  // Modificación para añadir la clase de GLOW
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

    // Añadir todas las cartas primero
    drawn.forEach(card => {
      const cardDiv = document.createElement("div");
      // APLICACIÓN DEL GLOW: La función rarityClass ahora devuelve 'rarity glow-rarity'
      cardDiv.className = `card ${rarityClass(card.rarity)}`; 
      
      const randomImage = card.images[Math.floor(Math.random() * card.images.length)];

      cardDiv.innerHTML = `
        <div class="card-inner">
          <div class="card-front"></div>
          <div class="card-back">
            <img src="${randomImage}" alt="${card.name}" />
          </div>
        </div>
      `;
      resultsDiv.appendChild(cardDiv);
    });

    // Aplicar flip con retraso, pero después de que todas estén en el DOM
    document.querySelectorAll(".card").forEach((card, i) => {
      setTimeout(() => card.classList.add("flipped"), 200 + i * 180);
    });

    // CAMBIO SOLICITADO: Desactivar el scroll automático
    // resultsDiv.scrollIntoView({ behavior: "smooth", block: "end" }); 
    // ^^^ LÍNEA ELIMINADA O COMENTADA ^^^
  }

  function draw(n) {
    const drawn = [];
    const pool = [...cards]; 

    for (let i = 0; i < n; i++) {
      const c = weightedRandom(pool);
      if (!c) break;
      drawn.push(c);
      // opcional: eliminar c del pool si no quieres repetir cartas en el mismo saque
      // pool.splice(pool.indexOf(c), 1);
    }

    renderDrawn(drawn);
  }

  drawOneBtn?.addEventListener("click", () => draw(1));
  drawFiveBtn?.addEventListener("click", () => draw(5));
  drawTenBtn?.addEventListener("click", () => draw(10));
}

setup();

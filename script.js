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
  if (totalWeight <= 0) return null; // Evita errores si el mazo se queda vacío
  
  let random = Math.random() * totalWeight;
  for (let card of cards) {
    random -= (card.weight || 0);
    if (random <= 0) return card;
  }
  return null;
}

function rarityClass(rarity) {
  if (!rarity) return "common";
  const r = rarity.toString().trim().toLowerCase();
  if (r === "sur") return "sur glow-sur"; 
  if (r === "sfa") return "sfa glow-sfa"; 
  if (r === "sir") return "sir glow-sir"; 
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

      // Elegimos una imagen al azar de las disponibles para esa carta
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

  // --- FUNCIÓN ACTUALIZADA: SIN DUPLICADOS ---
  function draw(n) {
    const drawn = [];
    // Creamos una copia del mazo para poder quitar cartas sin romper el original
    let pool = [...cards]; 

    for (let i = 0; i < n; i++) {
      const c = weightedRandom(pool);
      if (!c) break;
      
      drawn.push(c);

      // Eliminamos la carta seleccionada del pool para que no pueda salir otra vez
      // Buscamos por nombre o ID (asumiendo que card.name es único)
      pool = pool.filter(card => card !== c); 
    }

    renderDrawn(drawn);
  }

  drawOneBtn?.addEventListener("click", () => draw(1));
  drawFiveBtn?.addEventListener("click", () => draw(5));
  drawTenBtn?.addEventListener("click", () => draw(10));
}

setup();

import "./styles.css";

import { defaultPlayerColors } from "./core/defaults";
import { GameEngine } from "./core/game";
import { loadWorldMap } from "./plugins/maps/world";
import { builtInPlayerPlugins } from "./plugins/players";
import { GamePhase, TurnPhase, type AttackMode, type Card, type CountryId, type MapDefinition } from "./types/game";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing #app");

const imageSizeCache = new Map<string, { width: number; height: number }>();
const alphaMaskCache = new Map<CountryId, { width: number; height: number; ctx: CanvasRenderingContext2D }>();

const toolbarButtons = [
  { id: "newGame", label: "New Game", icon: "/ui/icons/NewGameIcon.png", side: "left" },
  { id: "cards", label: "Cards", icon: "/ui/icons/CardsItem.png", side: "left" },
  { id: "fortify", label: "Fortify", icon: "/ui/icons/FortifyItem.png", side: "right" },
  { id: "done", label: "Done", icon: "/ui/icons/DoneItem.png", side: "right" },
] as const;
const playerNamesStorageKey = "iconquer.playerNames.v1";

type Personality = "human" | "aggressive" | "defensive" | "unpredictable";

interface PlayerSetup {
  name: string;
  personality: Personality;
}

interface UiRefs {
  root: HTMLDivElement;
  toolbar: HTMLDivElement;
  toolbarLeft: HTMLDivElement;
  toolbarCenter: HTMLDivElement;
  toolbarRight: HTMLDivElement;
  mapFrame: HTMLDivElement;
  mapStage: HTMLDivElement;
  mapBackground: HTMLImageElement;
  overlayLegend: HTMLDivElement;
  armiesPanel: HTMLDivElement;
  cardsModal: HTMLDivElement;
  cardsPane: HTMLDivElement;
  setupModal: HTMLDivElement;
  setupPane: HTMLDivElement;
  victoryModal: HTMLDivElement;
  victoryPane: HTMLDivElement;
}

interface CountryNode {
  wrap: HTMLDivElement;
  tint: HTMLDivElement;
  dot: HTMLDivElement;
}

interface MapGeometry {
  scale: number;
  frameHeight: number;
  offsetY: number;
}

function createDefaultSetup(): PlayerSetup[] {
  return [
    { name: "Player", personality: "human" },
    { name: "Aggressive 1", personality: "aggressive" },
    { name: "Defensive 2", personality: "defensive" },
    { name: "Unpredictable 3", personality: "unpredictable" },
    { name: "Aggressive 4", personality: "aggressive" },
    { name: "Defensive 5", personality: "defensive" },
  ];
}

function savePlayerNames(setup: PlayerSetup[]): void {
  try {
    const names = setup.map((p) => p.name);
    localStorage.setItem(playerNamesStorageKey, JSON.stringify(names));
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

function applyStoredPlayerNames(setup: PlayerSetup[]): PlayerSetup[] {
  try {
    const raw = localStorage.getItem(playerNamesStorageKey);
    if (!raw) return setup;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return setup;
    return setup.map((player, i) => {
      const storedName = parsed[i];
      return typeof storedName === "string" && storedName.trim().length > 0
        ? { ...player, name: storedName }
        : player;
    });
  } catch {
    return setup;
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function rgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const num = Number.parseInt(value, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function countryImageUrl(countryId: CountryId): string {
  return `/maps/iconquer-world/${encodeURIComponent(countryId)}.png`;
}

function armyTokenPlaces(): number[] {
  return [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
}

function splitsThreeWays(place: number): boolean {
  return place === 5 || place === 50 || place === 500;
}

function computeArmyTokens(totalArmies: number): number[] {
  const places = armyTokenPlaces();
  const tokens: number[] = [];
  let remaining = Math.max(0, totalArmies);

  for (const place of places) {
    while (remaining >= place && tokens.length < 10) {
      tokens.push(place);
      remaining -= place;
    }
  }

  while (tokens.length < 10) {
    let splitIndex = -1;
    for (let i = tokens.length - 1; i >= 0; i -= 1) {
      if (tokens[i] > 1) {
        splitIndex = i;
        break;
      }
    }
    if (splitIndex === -1) break;

    const place = tokens[splitIndex];
    tokens.splice(splitIndex, 1);
    const fifth = splitsThreeWays(place) ? place / 5 : 0;
    const half = (place - fifth) / 2;
    tokens.push(half, half);
    if (fifth > 0) tokens.push(fifth);
    tokens.sort((a, b) => b - a);
    if (tokens.length > 10) {
      tokens.length = 10;
      break;
    }
  }

  return tokens;
}

async function ensureImageSize(src: string): Promise<{ width: number; height: number }> {
  const cached = imageSizeCache.get(src);
  if (cached) return cached;
  const size = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
  imageSizeCache.set(src, size);
  return size;
}

async function mapWithSizes(map: MapDefinition): Promise<MapDefinition> {
  for (const country of Object.values(map.countries)) {
    const size = await ensureImageSize(countryImageUrl(country.id));
    country.width = size.width;
    country.height = size.height;
  }
  return map;
}

async function ensureAlphaMask(countryId: CountryId): Promise<{ width: number; height: number; ctx: CanvasRenderingContext2D }> {
  const cached = alphaMaskCache.get(countryId);
  if (cached) return cached;

  const image = new Image();
  image.src = countryImageUrl(countryId);
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(`Missing canvas context for ${countryId}`);
  ctx.drawImage(image, 0, 0);

  const mask = { width: image.naturalWidth, height: image.naturalHeight, ctx };
  alphaMaskCache.set(countryId, mask);
  return mask;
}

async function alphaAt(countryId: CountryId, x: number, y: number): Promise<number> {
  const mask = await ensureAlphaMask(countryId);
  const px = clamp(Math.floor(x), 0, mask.width - 1);
  const py = clamp(Math.floor(y), 0, mask.height - 1);
  return mask.ctx.getImageData(px, py, 1, 1).data[3];
}

function countryBoundsInFrame(
  countryId: CountryId,
  map: MapDefinition,
  geometry: MapGeometry,
): { left: number; top: number; width: number; height: number } {
  const country = map.countries[countryId];
  const width = (country.width ?? 0) * geometry.scale;
  const height = (country.height ?? 0) * geometry.scale;
  const left = country.x * geometry.scale;
  const bottom = geometry.offsetY + country.y * geometry.scale;
  const top = geometry.frameHeight - bottom - height;
  return { left, top, width, height };
}

function createLayout(): UiRefs {
  const root = document.createElement("div");
  root.className = "app-shell";

  const toolbar = document.createElement("div");
  toolbar.className = "top-toolbar";

  const toolbarLeft = document.createElement("div");
  toolbarLeft.className = "toolbar-group toolbar-left";

  const toolbarCenter = document.createElement("div");
  toolbarCenter.className = "toolbar-center";

  const toolbarRight = document.createElement("div");
  toolbarRight.className = "toolbar-group toolbar-right";

  toolbar.append(toolbarLeft, toolbarCenter, toolbarRight);

  const mapFrame = document.createElement("div");
  mapFrame.className = "map-frame";

  const mapStage = document.createElement("div");
  mapStage.className = "map-stage";

  const mapBackground = document.createElement("img");
  mapBackground.className = "map-background";
  mapStage.append(mapBackground);

  const overlayLegend = document.createElement("div");
  overlayLegend.className = "map-legend";

  const armiesPanel = document.createElement("div");
  armiesPanel.className = "armies-panel";

  const cardsModal = document.createElement("div");
  cardsModal.className = "modal hidden";
  const cardsPane = document.createElement("div");
  cardsPane.className = "modal-pane cards-pane";
  cardsModal.append(cardsPane);

  const setupModal = document.createElement("div");
  setupModal.className = "modal";
  const setupPane = document.createElement("div");
  setupPane.className = "modal-pane setup-pane";
  setupModal.append(setupPane);

  const victoryModal = document.createElement("div");
  victoryModal.className = "modal hidden";
  const victoryPane = document.createElement("div");
  victoryPane.className = "modal-pane victory-pane";
  victoryModal.append(victoryPane);

  mapFrame.append(mapStage, overlayLegend);
  root.append(toolbar, mapFrame, armiesPanel, cardsModal, setupModal, victoryModal);

  return {
    root,
    toolbar,
    toolbarLeft,
    toolbarCenter,
    toolbarRight,
    mapFrame,
    mapStage,
    mapBackground,
    overlayLegend,
    armiesPanel,
    cardsModal,
    cardsPane,
    setupModal,
    setupPane,
    victoryModal,
    victoryPane,
  };
}

function personalityLabel(v: Personality): string {
  if (v === "human") return "Human";
  return v[0].toUpperCase() + v.slice(1);
}

function createEngine(map: MapDefinition, setup: PlayerSetup[], assignCountries: boolean): GameEngine {
  const players = setup.map((p, i) => ({
    id: i === 0 ? "p0" : `p${i}`,
    name: p.name,
    color: defaultPlayerColors[i],
    isComputer: p.personality !== "human",
    pluginId: p.personality === "human" ? undefined : p.personality,
  }));

  return new GameEngine({
    map,
    players,
    plugins: builtInPlayerPlugins,
    settings: {
      assignCountries,
      attacksPerClick: 2 as AttackMode,
      diceToRoll: 3,
      lossesExceedValue: 5,
      cardValues: 1,
      allowTurningInCards: true,
      advanceArmies: true,
    },
  });
}

(async function bootstrap() {
  const map = await mapWithSizes(await loadWorldMap());
  const ui = createLayout();
  app.append(ui.root);

  let selectedArmyAmount = 1;
  let showCardsModal = false;
  let setup = applyStoredPlayerNames(createDefaultSetup());
  let assignCountries = true;
  let engine = createEngine(map, setup, assignCountries);
  let aiRunning = false;
  let handlingMapClick = false;
  let dismissedWinnerId: string | null = null;

  const countryNodes = new Map<CountryId, CountryNode>();
  const countryDrawOrder = Object.keys(map.countries);
  let geometry: MapGeometry = { scale: 1, frameHeight: map.baseHeight, offsetY: 0 };

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  async function runAi(): Promise<void> {
    if (aiRunning) return;
    aiRunning = true;

    try {
      while (true) {
        const step = engine.stepAiTurn();
        render();
        if (step.conquestOccurred) {
          await sleep(250);
        }
        if (!step.pending) break;
        if (!step.conquestOccurred) await sleep(0);
      }
    } finally {
      aiRunning = false;
    }
  }

  function startNewGame(): void {
    engine = createEngine(map, setup, assignCountries);
    selectedArmyAmount = 1;
    showCardsModal = false;
    dismissedWinnerId = null;
    engine.startGame();
    engine.beginTurnIfReady();
    render();
    void runAi();
  }

  function resolveCardTurnIn(cards: Card[]): void {
    const snap = engine.getSnapshot();
    engine.resolveCardTurnIn(snap.currentPlayerId, cards);
    showCardsModal = false;
    render();
    void runAi();
  }

  function updateMapGeometry(): void {
    const frameWidth = ui.mapFrame.clientWidth;
    const frameHeight = ui.mapFrame.clientHeight;

    const scale = frameWidth / map.baseWidth;
    const drawHeight = map.baseHeight * scale;
    const offsetY = (frameHeight - drawHeight) / 2;

    geometry = { scale, frameHeight, offsetY };

    ui.mapBackground.style.left = "0px";
    ui.mapBackground.style.top = `${offsetY}px`;
    ui.mapBackground.style.width = `${frameWidth}px`;
    ui.mapBackground.style.height = `${drawHeight}px`;

    for (const country of Object.values(map.countries)) {
      const node = countryNodes.get(country.id);
      if (!node) continue;
      const { left, top, width, height } = countryBoundsInFrame(country.id, map, geometry);

      node.wrap.style.left = `${left}px`;
      node.wrap.style.top = `${top}px`;
      node.wrap.style.width = `${width}px`;
      node.wrap.style.height = `${height}px`;

      node.dot.style.left = `${width / 2 + (country.dotOffsetX ?? 0) * scale}px`;
      node.dot.style.top = `${height / 2 - (country.dotOffsetY ?? 0) * scale}px`;
    }
  }

  function initializeMapNodes(): void {
    ui.mapBackground.src = map.background;

    for (const country of Object.values(map.countries)) {
      const wrap = document.createElement("div");
      wrap.className = "country";

      const mask = document.createElement("img");
      mask.src = countryImageUrl(country.id);
      mask.className = "country-mask";

      const tint = document.createElement("div");
      tint.className = "country-tint";
      const url = countryImageUrl(country.id);
      tint.style.maskImage = `url('${url}')`;
      tint.style.webkitMaskImage = `url('${url}')`;

      const dot = document.createElement("div");
      dot.className = "army-dot";

      wrap.append(mask, tint, dot);
      ui.mapStage.append(wrap);
      countryNodes.set(country.id, { wrap, tint, dot });
    }

    updateMapGeometry();
  }

  async function pickCountryAtFramePoint(frameX: number, frameY: number): Promise<CountryId | null> {
    for (let i = countryDrawOrder.length - 1; i >= 0; i -= 1) {
      const countryId = countryDrawOrder[i];
      const bounds = countryBoundsInFrame(countryId, map, geometry);
      if (
        frameX < bounds.left ||
        frameX > bounds.left + bounds.width ||
        frameY < bounds.top ||
        frameY > bounds.top + bounds.height
      ) {
        continue;
      }

      const localX = (frameX - bounds.left) / geometry.scale;
      const localY = (frameY - bounds.top) / geometry.scale;
      const alpha = await alphaAt(countryId, localX, localY);
      if (alpha >= 50) return countryId;
    }
    return null;
  }

  async function onMapClick(event: MouseEvent): Promise<void> {
    if (handlingMapClick) return;
    handlingMapClick = true;
    try {
      const snap = engine.getSnapshot();
      const current = snap.players[snap.currentPlayerId];
      if (current.isComputer || snap.phase === GamePhase.Victory || snap.needsCardTurnIn) return;

      const frameRect = ui.mapFrame.getBoundingClientRect();
      const frameX = event.clientX - frameRect.left;
      const frameY = event.clientY - frameRect.top;
      const clickedCountryId = await pickCountryAtFramePoint(frameX, frameY);
      if (!clickedCountryId) return;

      if ((snap.turnPhase === TurnPhase.AssignArmies || snap.phase === GamePhase.InitializeArmies) && current.unallocatedArmies > 0) {
        const amount = event.shiftKey
          ? current.unallocatedArmies
          : clamp(selectedArmyAmount, 1, current.unallocatedArmies);
        engine.placeArmies(current.id, clickedCountryId, amount);
      } else {
        engine.humanClickCountry(clickedCountryId);
      }

      render();
      void runAi();
    } finally {
      handlingMapClick = false;
    }
  }

  function renderToolbar(): void {
    const snap = engine.getSnapshot();
    const current = snap.players[snap.currentPlayerId];

    ui.toolbarLeft.innerHTML = "";
    ui.toolbarRight.innerHTML = "";

    for (const b of toolbarButtons) {
      const button = document.createElement("button");
      button.className = "toolbar-btn";
      button.dataset.action = b.id;

      const icon = document.createElement("img");
      icon.src = b.icon;
      icon.alt = "";
      icon.onerror = () => {
        icon.style.display = "none";
      };

      const text = document.createElement("span");
      text.textContent = b.label;

      button.append(icon, text);

      if (b.id === "newGame") {
        button.onclick = () => {
          ui.setupModal.classList.remove("hidden");
          renderSetupModal();
        };
      } else if (b.id === "cards") {
        button.onclick = () => {
          showCardsModal = true;
          renderCardsModal();
        };
      } else if (b.id === "fortify") {
        button.disabled = snap.turnPhase !== TurnPhase.Attack || current.isComputer;
        button.onclick = () => {
          engine.finishAttackPhase();
          render();
          void runAi();
        };
      } else if (b.id === "done") {
        button.disabled = (snap.turnPhase !== TurnPhase.Attack && snap.turnPhase !== TurnPhase.Fortify) || current.isComputer;
        button.onclick = () => {
          engine.finishTurn();
          render();
          void runAi();
        };
      }

      if (b.side === "left") ui.toolbarLeft.append(button);
      else ui.toolbarRight.append(button);
    }

    ui.toolbarCenter.textContent = "";
  }

  function renderLegend(): void {
    const snap = engine.getSnapshot();
    ui.overlayLegend.innerHTML = "";

    Object.values(snap.players).forEach((player) => {
      const row = document.createElement("div");
      row.className = "legend-row";
      if (player.id === snap.currentPlayerId) {
        row.classList.add("current");
      }

      const dot = document.createElement("span");
      dot.className = "legend-dot";
      dot.style.background = player.color;
      dot.textContent = player.cards.length > 0 ? String(player.cards.length) : "";

      const label = document.createElement("span");
      label.className = "legend-name";
      label.textContent = player.name;

      row.append(dot, label);
      ui.overlayLegend.append(row);
    });
  }

  function renderArmiesPanel(): void {
    const snap = engine.getSnapshot();
    const player = snap.players[snap.currentPlayerId];

    ui.armiesPanel.innerHTML = "";

    const tokens = computeArmyTokens(player.unallocatedArmies);
    const strip = document.createElement("div");
    strip.className = "armies-strip";

    for (const token of tokens) {
      const item = document.createElement("button");
      item.className = `army-token ${selectedArmyAmount === token ? "selected" : ""}`;
      item.onclick = () => {
        selectedArmyAmount = token;
        renderArmiesPanel();
      };

      const img = document.createElement("img");
      img.src = `/ui/roman/${token}R.png`;
      img.alt = String(token);
      img.onerror = () => {
        img.style.display = "none";
        item.textContent = String(token);
      };

      item.append(img);
      strip.append(item);
    }

    ui.armiesPanel.append(strip);
  }

  function renderCardsModal(): void {
    const snap = engine.getSnapshot();
    ui.cardsPane.innerHTML = "";

    const shouldShow = showCardsModal || snap.needsCardTurnIn;
    if (!shouldShow) {
      ui.cardsModal.classList.add("hidden");
      return;
    }

    const player = snap.players[snap.currentPlayerId];
    const cards = player.cards;

    const heading = document.createElement("h3");
    heading.textContent = "Cards";

    const info = document.createElement("p");
    info.textContent = snap.needsCardTurnIn
      ? `${player.name}, you have ${cards.length} cards and must turn in a set.`
      : `${player.name} has ${cards.length} cards.`;

    const list = document.createElement("ul");
    list.className = "cards-list";
    cards.forEach((card) => {
      const li = document.createElement("li");
      li.textContent = card.name;
      list.append(li);
    });

    ui.cardsPane.append(heading, info, list);

    if (snap.needsCardTurnIn) {
      const best = engine.bestCardsToTurnIn(player.id).slice(0, 3);
      const selected = document.createElement("p");
      selected.className = "preselect";
      selected.textContent = `Preselected: ${best.map((c) => c.name).join(", ")}`;

      const ok = document.createElement("button");
      ok.textContent = "OK";
      ok.onclick = () => resolveCardTurnIn(best);
      ui.cardsPane.append(selected, ok);
    } else {
      const close = document.createElement("button");
      close.textContent = "Close";
      close.onclick = () => {
        showCardsModal = false;
        renderCardsModal();
      };
      ui.cardsPane.append(close);
    }

    ui.cardsModal.classList.remove("hidden");
  }

  function renderSetupModal(): void {
    ui.setupPane.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "New Game";

    const rows = document.createElement("div");
    rows.className = "setup-rows";

    setup.forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "setup-row";

      const swatch = document.createElement("span");
      swatch.className = "setup-color";
      swatch.style.background = defaultPlayerColors[i];

      const name = document.createElement("input");
      name.value = p.name;
      name.oninput = () => {
        setup[i].name = name.value;
        savePlayerNames(setup);
      };

      const personality = document.createElement("select");
      const options: Personality[] = ["human", "aggressive", "defensive", "unpredictable"];
      options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = personalityLabel(opt);
        if (opt === p.personality) option.selected = true;
        personality.append(option);
      });
      personality.onchange = () => {
        setup[i].personality = personality.value as Personality;
      };

      row.append(swatch, name, personality);
      rows.append(row);
    });

    const countryModes = document.createElement("div");
    countryModes.className = "country-modes";

    const randomLabel = document.createElement("label");
    const random = document.createElement("input");
    random.type = "radio";
    random.name = "countryMode";
    random.checked = assignCountries;
    random.onchange = () => {
      assignCountries = true;
    };
    randomLabel.append(random, document.createTextNode("Assign Randomly"));

    const manualLabel = document.createElement("label");
    const manual = document.createElement("input");
    manual.type = "radio";
    manual.name = "countryMode";
    manual.checked = !assignCountries;
    manual.onchange = () => {
      assignCountries = false;
    };
    manualLabel.append(manual, document.createTextNode("Pick Manually"));

    countryModes.append(randomLabel, manualLabel);

    const actions = document.createElement("div");
    actions.className = "setup-actions";

    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.onclick = () => {
      ui.setupModal.classList.add("hidden");
    };

    const ok = document.createElement("button");
    ok.textContent = "OK";
    ok.onclick = () => {
      ui.setupModal.classList.add("hidden");
      startNewGame();
    };

    actions.append(cancel, ok);
    ui.setupPane.append(title, rows, countryModes, actions);
  }

  function renderVictoryModal(): void {
    const snap = engine.getSnapshot();
    if (snap.phase !== GamePhase.Victory || !snap.winnerId || dismissedWinnerId === snap.winnerId) {
      ui.victoryModal.classList.add("hidden");
      return;
    }

    const winner = snap.players[snap.winnerId];
    ui.victoryPane.innerHTML = "";

    const logo = document.createElement("img");
    logo.className = "victory-logo";
    logo.src = "/ui/icons/LargeAppIcon.png";
    logo.alt = "iConquer";

    const title = document.createElement("h2");
    title.className = "victory-title";
    title.textContent = "Victory";

    const message = document.createElement("p");
    message.className = "victory-message";
    message.textContent = `${winner.name} wins!`;

    const actions = document.createElement("div");
    actions.className = "victory-actions";

    const newGame = document.createElement("button");
    newGame.textContent = "New Game";
    newGame.onclick = () => {
      ui.victoryModal.classList.add("hidden");
      startNewGame();
    };

    const ok = document.createElement("button");
    ok.textContent = "OK";
    ok.onclick = () => {
      dismissedWinnerId = snap.winnerId;
      ui.victoryModal.classList.add("hidden");
    };

    actions.append(newGame, ok);
    ui.victoryPane.append(logo, title, message, actions);
    ui.victoryModal.classList.remove("hidden");
  }

  function renderMapState(): void {
    const snap = engine.getSnapshot();

    for (const country of Object.values(map.countries)) {
      const node = countryNodes.get(country.id);
      if (!node) continue;

      const state = snap.countries[country.id];
      const owner = state.ownerId ? snap.players[state.ownerId] : null;

      node.wrap.classList.toggle("selected", state.selected);
      node.tint.style.background = owner ? rgba(owner.color, state.selected ? 0.58 : 0.42) : "rgba(255,255,255,0.03)";
      if (state.armies > 0) {
        node.dot.style.display = "grid";
        node.dot.style.background = owner?.color ?? "#ddd";
        node.dot.textContent = String(state.armies);
      } else {
        node.dot.style.display = "none";
      }
    }
  }

  function render(): void {
    renderToolbar();
    updateMapGeometry();
    renderMapState();
    renderLegend();
    renderArmiesPanel();
    renderCardsModal();
    renderVictoryModal();
  }

  window.addEventListener("resize", render);
  ui.mapStage.addEventListener("click", (event) => {
    void onMapClick(event);
  });

  initializeMapNodes();
  renderSetupModal();
  startNewGame();
})();

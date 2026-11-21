// ============================================================================
// TERRITÓRIO VIVO: CRÔNICAS DE UM ACS — STARDEW-STYLE 2D PIXEL ART ENGINE
// ============================================================================

class ACSGame {
  constructor() {
    this.TILE = window.ACS_DATA.TILE_SIZE; // 32
    this.COLS = window.ACS_DATA.MAP_COLS;  // 80
    this.ROWS = window.ACS_DATA.MAP_ROWS;  // 48
    this.worldWidth = this.COLS * this.TILE;   // 2560
    this.worldHeight = this.ROWS * this.TILE;  // 1536

    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Build all procedural 16-bit pixel art sprites & tiles in memory
    window.pixelArt.buildAll();

    // Time & Calendar system (Phase 1: Continuous Weeks, 6 playable days + Sunday Turnaround, 07:00–22:00)
    this.weekNumber = 1;
    this.dayOfWeek = 0; // 0 = Segunda .. 5 = Sábado
    this.timeMinutes = 7 * 60; // 07:00
    this.timeSpeed = 1.6; // game minutes per real second (~9 min real per full day)
    this.paused = true;
    this.inMainMenu = true;
    this._menuSelectedIndex = 0;
    this._menuBound = false;
    this.elapsedTime = 0;
    this._lastHour = 7;
    this.currentLocation = 'PLAYER_HOME'; // 'OVERWORLD' | 'UBS_INTERIOR' | 'ESF_ROOM' | 'PLAYER_HOME'

    // Protagonist's Home & Community Hubs coordinates in Overworld
    this.playerHome = window.ACS_DATA.playerHome;
    this.vendinha = window.ACS_DATA.vendinha;
    this.pracinha = window.ACS_DATA.pracinha;
    this.associacao = window.ACS_DATA.associacao;
    this.horta = window.ACS_DATA.horta;
    this.campinho = window.ACS_DATA.campinho;
    this.mysteryHouse = window.ACS_DATA.mysteryHouse;

    // UBS coordinates (aligned to 32x32 tiles: x=4..12, y=17..24)
    this.ubs = {
      x: 4 * 32,
      y: 17 * 32,
      w: 256,
      h: 224,
      doorX: 8 * 32,      // center front entrance
      doorY: 24 * 32 + 6,
      sortY: 23 * 32 + 20
    };

    // Player state (wakes up inside Casa do ACS at 07:00!)
    this.player = {
      x: 4.8 * 32,
      y: 6.4 * 32,
      speed: 205,
      sprintMultiplier: 1.42,
      dir: 'down',
      isMoving: false,
      animTimer: 0,
      animFrame: 0,
      stamina: 100,
      maxStamina: 100,
      hydration: 100,
      maxHydration: 100,
      sunscreenTimer: 0,
      umbrellaOpen: false,
      inShade: false,
      onSunTrail: false,
      emote: null,
      emoteTimer: 0,
      stepDustTimer: 0
    };

    // Smooth camera (with lerp)
    this.camera = {
      x: 0,
      y: Math.max(0, this.player.y - window.innerHeight / 2)
    };

    // Input & interaction (managed via Core Engine Framework)
    this.events = new window.ACSEngine.EventBus();
    this.input = new window.ACSEngine.InputManager(window);
    this.keys = this.input.keys;
    this.saveManager = new window.ACSEngine.SaveManager();
    this.nearTarget = null;
    this.typewriterTimer = null;
    this.typewriterFullText = '';

    // World entities
    this.inventory = JSON.parse(JSON.stringify(window.ACS_DATA.items));
    this.families = JSON.parse(JSON.stringify(window.ACS_DATA.families)).map(f => ({
      ...f,
      emote: null,
      emoteTimer: 0
    }));
    this.dogs = JSON.parse(JSON.stringify(window.ACS_DATA.dogs)).map(d => ({
      ...d,
      homeX: d.x,
      homeY: d.y,
      dir: 'down',
      animTimer: 0,
      calmedUntil: 0,
      cooldownUntil: 0,
      angle: Math.random() * Math.PI * 2,
      emote: null,
      emoteTimer: 0
    }));
    this.cats = JSON.parse(JSON.stringify(window.ACS_DATA.cats || [])).map(c => ({
      ...c,
      homeX: c.x,
      homeY: c.y,
      dir: 'down',
      animTimer: 0,
      calmedUntil: 0,
      scareCooldown: 0,
      meowCooldown: 0,
      pettedToday: false,
      startledNoticeShown: false,
      angle: Math.random() * Math.PI * 2,
      pauseTimer: Math.random() * 2,
      emote: null,
      emoteTimer: 0
    }));
    this.dengueSpots = JSON.parse(JSON.stringify(window.ACS_DATA.dengueSpots));

    // Weekly & Daily progression (Phase 1: Flexible Weekly Goal + Priorities)
    this.weeklyGoal = 15;
    this.weeklyVisits = 0;
    this.visitedThisWeek = new Set();
    this.weeklyPriorities = [];
    this.weeklyReportSubmitted = false;
    this.dailyVisits = 0;
    this.dailyGoal = 15;
    this.visitedToday = new Set();
    this.knockedAwayToday = new Set();
    this.dengueClearedCount = 0;
    this.schedulesDiscoveredCount = 0;
    this.unreadNotifs = 1;
    this.activeTabletTab = 'mission';

    // Particles (leaves, footsteps dust, sun motes, rain)
    this.dustParticles = [];
    this.leafParticles = Array.from({ length: 24 }, () => this.spawnLeaf(true));
    this.sunMotes = Array.from({ length: 28 }, () => ({
      x: Math.random() * this.worldWidth,
      y: Math.random() * this.worldHeight,
      phase: Math.random() * Math.PI * 2,
      size: Math.random() > 0.5 ? 4 : 2
    }));
    this.rainParticles = Array.from({ length: 130 }, () => ({
      x: Math.random() * 1600,
      y: Math.random() * 950,
      len: 12 + Math.random() * 8
    }));
    this.rainSplashes = [];

    // Build 32x32 Tile Map & Pre-bake static terrain layer
    this.tileMap = this.generateTileGrid();
    this.terrainCanvas = this.bakeStaticTerrain(false);
    this.terrainRainCanvas = this.bakeStaticTerrain(true);

    // Territorial Navigation, Minimap & Compass System (M1)
    this.navigation = new window.NavigationSystem(this);

    // Longitudinal Narrative System (M2) & Story Memory (Etapa H1)
    this.narrative = new window.NarrativeSystem(this);
    this.storyState = new window.StoryStateSystem(this);
    this.relationships = window.RelationshipSystem ? new window.RelationshipSystem(this) : null;
    this.investigation = window.InvestigationSystem ? new window.InvestigationSystem(this) : null;
    this.notebook = window.NotebookSystem ? new window.NotebookSystem(this) : null;

    // Multi-Turn Dialogue System (Phase 1 / H1 v2) & Resolver
    this.dialogue = new window.DialogueSystem(this);
    this.dialogueResolver = new window.DialogueResolver(this);

    // Phase 2: Dynamic Weekly Schedules, Personal Smartphone & Community Spaces
    this.schedule = new window.ScheduleSystem(this);
    this.phone = new window.PhoneSystem(this);

    // Unified Scene Manager + Interiors (UBS, Sala ESF, Casa do ACS, Vendinha & Associação)
    this.sceneManager = new window.SceneManager(this);
    this.animations = window.AnimationSystem ? new window.AnimationSystem(this) : null;
    this.playerHomeSystem = new window.PlayerHomeSystem(this);
    this.ubsInterior = new window.UBSInteriorSystem(this);
    this.communitySpaces = new window.CommunitySpacesSystem(this);
    this.sceneManager.register('PLAYER_HOME', this.playerHomeSystem);
    this.sceneManager.register('UBS_INTERIOR', this.ubsInterior);
    this.sceneManager.register('ESF_ROOM', this.ubsInterior);
    this.sceneManager.register('VENDINHA', this.communitySpaces);
    this.sceneManager.register('ASSOCIACAO', this.communitySpaces);

    // Etapa H2/H3/H4: World Exploration & States, Story Quests, Heart Events & Ending
    this.worldState = new window.WorldStateSystem(this);
    this.endingAssembler = window.EndingAssembler ? new window.EndingAssembler(this) : null;
    this.quests = new window.QuestSystem(this);
    this.storyEvents = new window.StoryEventSystem(this);
    this.musicDirector = window.MusicDirector ? new window.MusicDirector(this) : null;

    this.generateWeeklyPriorities();

    this.initEvents();
    this.initAudioControls();
    this.resizeCanvas();
    this.sceneManager.snapCamera();
    this.renderHotbar();
    this.updateHUD();
    this.navigation.resolveObjective();
    this.navigation.updateTrackerUI();
    this.navigation.drawMinimap();
    this.showIntroModal();

    // Resilient requestAnimationFrame loop (eliminates Frame-1 negative dt crash!)
    this.gameLoop = new window.ACSEngine.GameLoop((dt) => this.tick(dt));
    this.gameLoop.start();
  }

  // ==========================================================================
  // 1. 32x32 TILE MAP GENERATION & PRE-BAKING
  // ==========================================================================
  generateTileGrid() {
    // Tile types: 'G' grass, 'D' dirt road, 'S' street, 'W' sidewalk, 'P' patio, 'R' river, 'B' bridge
    const grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill('G'));

    const fill = (c1, r1, c2, r2, val) => {
      for (let r = Math.max(0, r1); r <= Math.min(this.ROWS - 1, r2); r++) {
        for (let c = Math.max(0, c1); c <= Math.min(this.COLS - 1, c2); c++) {
          grid[r][c] = val;
        }
      }
    };

    // UBS Patio (around UBS at cols 3..13, rows 19..26)
    fill(3, 21, 13, 26, 'P');

    // "Estrada do Sol" organic dirt road connecting UBS to Microarea 04 (rows 23..25, cols 13..25)
    fill(13, 23, 26, 25, 'D');
    // Small scenic curve near bridge
    fill(15, 22, 18, 22, 'D');
    fill(20, 26, 23, 26, 'D');

    // Stream / Córrego flowing North-South across cols 17..18
    fill(17, 0, 18, this.ROWS - 1, 'R');
    // Wooden bridge crossing stream at rows 23..25, cols 16..19
    fill(16, 23, 19, 25, 'B');

    // Neighborhood Paved Streets + Sidewalks (Calçadas)
    // Av. da Saúde (North-South cols 26..27)
    fill(25, 11, 28, 42, 'W');
    fill(26, 12, 27, 41, 'S');

    // North Street — Rua das Acácias (rows 12..13, cols 26..76)
    fill(25, 11, 77, 14, 'W');
    fill(26, 12, 76, 13, 'S');

    // Central Street — Rua da Esperança (rows 26..27, cols 26..76)
    fill(25, 25, 77, 28, 'W');
    fill(26, 26, 76, 27, 'S');

    // South Street — Rua dos Ipês (rows 40..41, cols 26..76)
    fill(25, 39, 77, 42, 'W');
    fill(26, 40, 76, 41, 'S');

    // East Connector Street (cols 75..76, rows 12..41 — clear of houses H05/H10/H15!)
    fill(74, 11, 77, 42, 'W');
    fill(75, 12, 76, 41, 'S');

    // Clean street intersections (overwrite sidewalk edges inside intersections)
    fill(26, 12, 27, 41, 'S');
    fill(26, 12, 76, 13, 'S');
    fill(26, 26, 76, 27, 'S');
    fill(26, 40, 76, 41, 'S');
    fill(75, 12, 76, 41, 'S');

    // Connect Estrada do Sol smoothly into Av. da Saúde
    fill(24, 24, 25, 25, 'D');

    // Cozy front paths leading from every house gate onto the sidewalk/street!
    window.ACS_DATA.families.forEach(fam => {
      fill(fam.tx, fam.ty, fam.tx + 1, fam.ty + 2, 'D');
    });

    // Front path from Casa do ACS (tx: 22, ty: 21) down onto Estrada do Sol (row 23)
    fill(this.playerHome.tx, this.playerHome.ty, this.playerHome.tx + 1, this.playerHome.ty + 2, 'D');

    // Phase 2: Vendinha path onto Av. da Saúde (tx: 22, ty: 32 -> cols 22..25)
    fill(this.vendinha.tx, this.vendinha.ty, 25, this.vendinha.ty + 1, 'D');

    // Phase 2: Pracinha dos Ipês (cols 35..53, rows 43..52) connected to Rua dos Ipês (row 42)
    fill(35, 43, 53, 52, 'P');
    fill(39, 42, 40, 43, 'W');
    fill(48, 42, 49, 43, 'W');

    // Phase 2: Associação de Moradores path (cols 54..63, rows 42..51)
    fill(54, 42, 63, 43, 'W');
    fill(59, 43, 61, 51, 'W');
    fill(this.associacao.tx, this.associacao.ty, this.associacao.tx + 1, this.associacao.ty + 2, 'D');

    // Phase 2: Horta Comunitária ground (cols 65..74, rows 44..52)
    fill(65, 44, 74, 52, 'D');
    fill(66, 45, 73, 51, 'G');
    fill(64, 47, 66, 48, 'D'); // Gate path connecting Associação & Horta

    // Bairro Vizinho (Vila Aurora — cols 78..119)
    // Connecting avenues from East Connector (cols 75..76) into Av. dos Esportes (cols 84..85)
    fill(77, 25, 84, 28, 'W');
    fill(77, 26, 84, 27, 'S');
    fill(77, 39, 84, 42, 'W');
    fill(77, 40, 84, 41, 'S');

    // Av. dos Esportes (North-South cols 84..85) & East Perimeter (cols 114..115)
    fill(83, 11, 86, 42, 'W');
    fill(84, 12, 85, 41, 'S');
    fill(113, 11, 116, 42, 'W');
    fill(114, 12, 115, 41, 'S');

    // Rua da Aurora (North rows 12..13), Rua do Campinho (Central rows 26..27), Rua das Mangueiras (South rows 40..41)
    fill(83, 11, 116, 14, 'W');
    fill(84, 12, 115, 13, 'S');
    fill(83, 25, 116, 28, 'W');
    fill(84, 26, 115, 27, 'S');
    fill(83, 39, 116, 42, 'W');
    fill(84, 40, 115, 41, 'S');

    // Clean street intersections in Bairro Vizinho
    fill(84, 12, 85, 41, 'S');
    fill(114, 12, 115, 41, 'S');
    fill(84, 12, 115, 13, 'S');
    fill(84, 26, 115, 27, 'S');
    fill(84, 40, 115, 41, 'S');

    // Campinho de Futebol (cols 89..109, rows 29..38 — lush grass pitch framed by dirt border)
    fill(88, 29, 110, 38, 'D');
    fill(89, 29, 109, 38, 'G');

    // Front path to Casa Misteriosa (tx: 106, ty: 10)
    if (this.mysteryHouse) {
      fill(this.mysteryHouse.tx, this.mysteryHouse.ty, this.mysteryHouse.tx + 1, this.mysteryHouse.ty + 2, 'D');
    }

    return grid;
  }

  bakeStaticTerrain(isRain) {
    const c = document.createElement('canvas');
    c.width = this.worldWidth;
    c.height = this.worldHeight;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const T = this.TILE;
    const pa = window.pixelArt;

    for (let r = 0; r < this.ROWS; r++) {
      for (let col = 0; col < this.COLS; col++) {
        const type = this.tileMap[r][col];
        const x = col * T;
        const y = r * T;
        const h = Math.floor(pa.rand(col * 59 + r * 131) * 100);

        if (type === 'G') {
          const variant = h < 58
            ? (h % 3)
            : (3 + (h % Math.max(1, pa.tiles.grass.length - 3)));
          ctx.drawImage(pa.tiles.grass[variant], x, y);
        } else if (type === 'D') {
          const mudVars = pa.tiles.mudVariants;
          const tile = isRain
            ? (mudVars ? mudVars[h % mudVars.length] : pa.tiles.mud)
            : pa.tiles.dirt[h % pa.tiles.dirt.length];
          ctx.drawImage(tile, x, y);
        } else if (type === 'S') {
          ctx.drawImage(pa.tiles.street[h % pa.tiles.street.length], x, y);
        } else if (type === 'W') {
          const swVars = pa.tiles.sidewalkVariants;
          const tile = swVars ? swVars[h % swVars.length] : pa.tiles.sidewalk;
          ctx.drawImage(tile, x, y);
        } else if (type === 'P') {
          const ptVars = pa.tiles.patioVariants;
          const tile = ptVars ? ptVars[h % ptVars.length] : pa.tiles.patio;
          ctx.drawImage(tile, x, y);
        } else if (type === 'B') {
          ctx.drawImage(pa.tiles.bridge, x, y);
        } else if (type === 'R') {
          // Drawn live for animated water; deep riverbed shadow underneath
          ctx.fillStyle = '#204d63';
          ctx.fillRect(x, y, T, T);
        }
      }
    }

    // Organic Multi-Layered Edge Transitions, Curbs & Riverbanks
    for (let r = 1; r < this.ROWS - 1; r++) {
      for (let col = 1; col < this.COLS - 1; col++) {
        const type = this.tileMap[r][col];
        const x = col * T;
        const y = r * T;

        if (type === 'D') {
          // Top overhanging multi-layered grass turf & AO shadow onto dirt
          if (this.tileMap[r - 1][col] === 'G') {
            for (let gx = 0; gx < T; gx += 4) {
              const depth = (pa.rand(col * 31 + gx) > 0.42) ? 7 : 4;
              ctx.fillStyle = 'rgba(38, 24, 12, 0.28)';
              ctx.fillRect(x + gx, y + depth, 4, 3);
              ctx.fillStyle = '#4e6121';
              ctx.fillRect(x + gx, y, 4, depth + 1);
              ctx.fillStyle = '#7d933a';
              ctx.fillRect(x + gx, y, 4, depth - 1);
              ctx.fillStyle = (gx % 8 === 0) ? '#b5c458' : '#92a845';
              ctx.fillRect(x + gx + 1, y + Math.max(0, depth - 2), 2, 2);
            }
          }
          // Bottom scalloped grass edge
          if (this.tileMap[r + 1][col] === 'G') {
            for (let gx = 0; gx < T; gx += 4) {
              const depth = (pa.rand(col * 47 + gx) > 0.48) ? 6 : 4;
              ctx.fillStyle = 'rgba(38, 24, 12, 0.20)';
              ctx.fillRect(x + gx, y + T - depth - 2, 4, 2);
              ctx.fillStyle = '#6f8532';
              ctx.fillRect(x + gx, y + T - depth, 4, depth);
              ctx.fillStyle = '#92a845';
              ctx.fillRect(x + gx + 1, y + T - depth, 2, 2);
            }
          }
          // Left scalloped turf edge
          if (this.tileMap[r][col - 1] === 'G') {
            for (let gy = 0; gy < T; gy += 4) {
              const depth = (pa.rand(r * 41 + gy) > 0.45) ? 5 : 3;
              ctx.fillStyle = 'rgba(38, 24, 12, 0.24)';
              ctx.fillRect(x + depth, y + gy, 2, 4);
              ctx.fillStyle = '#4e6121';
              ctx.fillRect(x, y + gy, depth + 1, 4);
              ctx.fillStyle = '#7d933a';
              ctx.fillRect(x, y + gy, depth, 4);
            }
          }
          // Right scalloped turf edge
          if (this.tileMap[r][col + 1] === 'G') {
            for (let gy = 0; gy < T; gy += 4) {
              const depth = (pa.rand(r * 67 + gy) > 0.45) ? 5 : 3;
              ctx.fillStyle = 'rgba(38, 24, 12, 0.18)';
              ctx.fillRect(x + T - depth - 2, y + gy, 2, 4);
              ctx.fillStyle = '#6f8532';
              ctx.fillRect(x + T - depth, y + gy, depth, 4);
            }
          }
        }

        // Cobblestone Street Curbs & Gutter Ambient Occlusion
        if (type === 'S') {
          if (this.tileMap[r - 1][col] !== 'S') {
            ctx.fillStyle = '#dfd5c2';
            ctx.fillRect(x, y, T, 2);
            ctx.fillStyle = '#8c7e6c';
            ctx.fillRect(x, y + 2, T, 2);
            ctx.fillStyle = 'rgba(32, 22, 14, 0.30)';
            ctx.fillRect(x, y + 4, T, 4);
          }
          if (this.tileMap[r + 1][col] !== 'S') {
            ctx.fillStyle = 'rgba(32, 22, 14, 0.20)';
            ctx.fillRect(x, y + T - 5, T, 2);
            ctx.fillStyle = '#bfb19c';
            ctx.fillRect(x, y + T - 3, T, 2);
            ctx.fillStyle = '#5c5147';
            ctx.fillRect(x, y + T - 1, T, 1);
          }
          if (this.tileMap[r][col - 1] !== 'S') {
            ctx.fillStyle = '#dfd5c2';
            ctx.fillRect(x, y, 2, T);
            ctx.fillStyle = '#8c7e6c';
            ctx.fillRect(x + 2, y, 2, T);
            ctx.fillStyle = 'rgba(32, 22, 14, 0.26)';
            ctx.fillRect(x + 4, y, 3, T);
          }
          if (this.tileMap[r][col + 1] !== 'S') {
            ctx.fillStyle = '#bfb19c';
            ctx.fillRect(x + T - 3, y, 2, T);
            ctx.fillStyle = '#5c5147';
            ctx.fillRect(x + T - 1, y, 1, T);
          }
        }

        // Subtle turf overhang onto stone sidewalks & patios
        if (type === 'W' || type === 'P') {
          if (this.tileMap[r - 1][col] === 'G') {
            ctx.fillStyle = 'rgba(38, 24, 12, 0.22)';
            ctx.fillRect(x, y + 2, T, 2);
            ctx.fillStyle = '#566924';
            ctx.fillRect(x, y, T, 2);
          }
          if (this.tileMap[r][col - 1] === 'G') {
            ctx.fillStyle = 'rgba(38, 24, 12, 0.20)';
            ctx.fillRect(x + 2, y, 2, T);
            ctx.fillStyle = '#566924';
            ctx.fillRect(x, y, 2, T);
          }
        }

        // Lush Layered Riverbanks
        if (type === 'R') {
          if (this.tileMap[r][col - 1] !== 'R') {
            ctx.fillStyle = 'rgba(16, 30, 38, 0.42)';
            ctx.fillRect(x + 2, y, 4, T);
            ctx.fillStyle = '#473322';
            ctx.fillRect(x - 4, y, 6, T);
            ctx.fillStyle = '#614730';
            ctx.fillRect(x - 4, y, 4, T);
            ctx.fillStyle = '#4e6121';
            ctx.fillRect(x - 5, y, 3, T);
            ctx.fillStyle = '#7d933a';
            ctx.fillRect(x - 6, y, 3, T);
            if (pa.rand(r * 23 + col) > 0.55) {
              ctx.fillStyle = '#827668';
              ctx.fillRect(x - 1, y + 10, 3, 4);
              ctx.fillStyle = '#b5a898';
              ctx.fillRect(x - 1, y + 10, 2, 1);
            }
          }
          if (this.tileMap[r][col + 1] !== 'R') {
            ctx.fillStyle = 'rgba(16, 30, 38, 0.42)';
            ctx.fillRect(x + T - 6, y, 4, T);
            ctx.fillStyle = '#473322';
            ctx.fillRect(x + T - 2, y, 6, T);
            ctx.fillStyle = '#614730';
            ctx.fillRect(x + T, y, 4, T);
            ctx.fillStyle = '#4e6121';
            ctx.fillRect(x + T + 2, y, 3, T);
            ctx.fillStyle = '#7d933a';
            ctx.fillRect(x + T + 3, y, 3, T);
          }
        }

        // Wooden Bridge Guardrails & River Cast Shadow
        if (type === 'B') {
          if (this.tileMap[r - 1][col] !== 'B') {
            ctx.fillStyle = '#2b1b12';
            ctx.fillRect(x, y - 5, T, 9);
            ctx.fillStyle = '#945e32';
            ctx.fillRect(x, y - 3, T, 5);
            ctx.fillStyle = '#be8750';
            ctx.fillRect(x, y - 3, T, 2);
            ctx.fillStyle = '#2b1b12';
            ctx.fillRect(x + 1, y - 8, 8, 12);
            ctx.fillStyle = '#6b3e1f';
            ctx.fillRect(x + 2, y - 7, 6, 10);
            ctx.fillStyle = '#cfa06b';
            ctx.fillRect(x + 2, y - 7, 6, 2);
          }
          if (this.tileMap[r + 1][col] !== 'B') {
            ctx.fillStyle = 'rgba(22, 14, 10, 0.36)';
            ctx.fillRect(x, y + T + 3, T, 7);
            ctx.fillStyle = '#2b1b12';
            ctx.fillRect(x, y + T - 5, T, 9);
            ctx.fillStyle = '#945e32';
            ctx.fillRect(x, y + T - 3, T, 5);
            ctx.fillStyle = '#be8750';
            ctx.fillRect(x, y + T - 3, T, 2);
            ctx.fillStyle = '#2b1b12';
            ctx.fillRect(x + 1, y + T - 8, 8, 12);
            ctx.fillStyle = '#6b3e1f';
            ctx.fillRect(x + 2, y + T - 7, 6, 10);
            ctx.fillStyle = '#cfa06b';
            ctx.fillRect(x + 2, y + T - 7, 6, 2);
          }
        }
      }
    }

    // Warm weathered ochre lane markings on cobblestone streets
    [13 * T - 2, 27 * T - 2, 41 * T - 2].forEach(ly => {
      for (let lx = 28 * T; lx < 74 * T; lx += 44) {
        ctx.fillStyle = 'rgba(66, 55, 47, 0.55)';
        ctx.fillRect(lx - 1, ly - 1, 22, 6);
        ctx.fillStyle = '#b58d42';
        ctx.fillRect(lx, ly, 20, 4);
        ctx.fillStyle = '#dfc177';
        ctx.fillRect(lx, ly, 20, 2);
      }
    });

    // Cozy wooden fences framing UBS yard & Horta Comunitária
    this.drawFenceRun(ctx, 3 * T, 21 * T, 3 * T, 26 * T, true);
    this.drawFenceRun(ctx, 3 * T, 26 * T, 7 * T, 26 * T, false);
    this.drawFenceRun(ctx, 10 * T, 26 * T, 13 * T, 26 * T, false);

    this.drawFenceRun(ctx, 65 * T, 44 * T, 74 * T, 44 * T, false);
    this.drawFenceRun(ctx, 65 * T, 52 * T, 74 * T, 52 * T, false);
    this.drawFenceRun(ctx, 74 * T, 44 * T, 74 * T, 52 * T, true);
    this.drawFenceRun(ctx, 65 * T, 44 * T, 65 * T, 46 * T + 16, true);
    this.drawFenceRun(ctx, 65 * T, 49 * T, 65 * T, 52 * T, true);

    // Rain puddles on dirt/streets
    if (isRain) {
      [[14, 24], [21, 24], [26, 18], [35, 12], [46, 26], [56, 40], [66, 26], [84, 26], [98, 33]].forEach(([pc, pr]) => {
        ctx.drawImage(pa.tiles.puddle, pc * T, pr * T);
      });
    }

    // Campinho de Futebol white chalk pitch lines (cols 89..109, rows 29..38)
    if (this.campinho) {
      const fx = this.campinho.c1 * T + 12;
      const fy = this.campinho.r1 * T + 10;
      const fw = (this.campinho.c2 - this.campinho.c1) * T - 24;
      const fh = (this.campinho.r2 - this.campinho.r1) * T - 20;
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.85)';
      ctx.lineWidth = 3;
      ctx.strokeRect(fx, fy, fw, fh);
      // Halfway line
      ctx.beginPath();
      ctx.moveTo(fx + fw / 2, fy);
      ctx.lineTo(fx + fw / 2, fy + fh);
      ctx.stroke();
      // Center circle & spot
      ctx.beginPath();
      ctx.arc(fx + fw / 2, fy + fh / 2, 42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(fx + fw / 2 - 3, fy + fh / 2 - 3, 6, 6);
      // Left & Right penalty boxes
      ctx.strokeRect(fx, fy + fh / 2 - 64, 68, 128);
      ctx.strokeRect(fx + fw - 68, fy + fh / 2 - 64, 68, 128);
    }

    return c;
  }

  drawFenceRun(ctx, x1, y1, x2, y2, vertical) {
    if (vertical) {
      ctx.fillStyle = 'rgba(30, 18, 10, 0.24)';
      ctx.fillRect(x1 + 2, y1 + 4, 8, y2 - y1 + 14);
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(x1 + 2, y1, 4, y2 - y1 + 8);
      ctx.fillStyle = '#85532c';
      ctx.fillRect(x1 + 3, y1, 2, y2 - y1 + 8);
      for (let y = y1; y <= y2; y += 16) {
        ctx.fillStyle = '#2b1b12';
        ctx.fillRect(x1, y, 8, 16);
        ctx.fillStyle = '#9c6638';
        ctx.fillRect(x1 + 1, y + 1, 6, 14);
        ctx.fillStyle = '#cfa06b';
        ctx.fillRect(x1 + 1, y + 1, 6, 2);
        ctx.fillStyle = '#5c361a';
        ctx.fillRect(x1 + 5, y + 3, 2, 12);
      }
    } else {
      // Ground contact shadow
      ctx.fillStyle = 'rgba(30, 18, 10, 0.28)';
      ctx.fillRect(x1, y1 + 14, x2 - x1 + 8, 4);
      // Double wooden horizontal rails
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(x1, y1 + 3, x2 - x1, 4);
      ctx.fillRect(x1, y1 + 9, x2 - x1, 4);
      ctx.fillStyle = '#b57d47';
      ctx.fillRect(x1, y1 + 4, x2 - x1, 2);
      ctx.fillRect(x1, y1 + 10, x2 - x1, 2);
      ctx.fillStyle = '#d4a373';
      ctx.fillRect(x1, y1 + 4, x2 - x1, 1);
      ctx.fillRect(x1, y1 + 10, x2 - x1, 1);
      for (let x = x1; x <= x2; x += 24) {
        ctx.fillStyle = '#2b1b12';
        ctx.fillRect(x, y1, 8, 16);
        ctx.fillStyle = '#a6713f';
        ctx.fillRect(x + 1, y1 + 1, 6, 14);
        ctx.fillStyle = '#e3b882';
        ctx.fillRect(x + 1, y1 + 1, 6, 2);
        ctx.fillStyle = '#5c361a';
        ctx.fillRect(x + 5, y1 + 3, 2, 12);
        ctx.fillStyle = '#3b2416';
        ctx.fillRect(x + 3, y1 + 5, 2, 1);
        ctx.fillRect(x + 3, y1 + 11, 2, 1);
      }
    }
  }

  // ==========================================================================
  // 2. EVENTS & RESIZE
  // ==========================================================================
  initEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (this.animations && this.animations.isBlocking()) {
        if (k === 'n') this.toggleAudioMute();
        return;
      }
      this.input.setKey(k, true);

      // Allow Enter/Space to confirm primary button in Intro / Day Summary modal
      const summaryOverlay = document.getElementById('summary-overlay');
      if (this.paused && summaryOverlay && !summaryOverlay.classList.contains('hidden')) {
        if (k === 'enter') {
          const primaryBtn = summaryOverlay.querySelector('.primary-btn');
          if (primaryBtn) {
            e.preventDefault();
            primaryBtn.click();
          }
        }
        return;
      }

      if (k === 'tab' || k === 't') {
        e.preventDefault();
        this.toggleTablet();
        return;
      }
      if (k === 'c') {
        e.preventDefault();
        if (this.phone) this.phone.toggle();
        return;
      }
      if (k === 'j') {
        e.preventDefault();
        if (this.notebook) this.notebook.toggle();
        return;
      }
      if (k === 'm') {
        this.toggleMap();
        return;
      }
      if (k === 'n') {
        this.toggleAudioMute();
        return;
      }
      if (k === 'escape') {
        this.closeOverlays();
        return;
      }

      // Keyboard controls inside Dialogue (Space/E skips typewriter; 1..4 picks choice)
      const dlgOverlay = document.getElementById('dialogue-overlay');
      if (this.paused && dlgOverlay && !dlgOverlay.classList.contains('hidden')) {
        if ((k === ' ' || k === 'e' || k === 'enter') && this.typewriterTimer) {
          e.preventDefault();
          this.finishTypewriter();
          return;
        }
        if (['1', '2', '3', '4'].includes(k)) {
          const btns = dlgOverlay.querySelectorAll('.choice-btn');
          const idx = parseInt(k, 10) - 1;
          if (btns[idx]) {
            e.preventDefault();
            btns[idx].click();
          }
          return;
        }
        if (k === 'enter') {
          const btns = dlgOverlay.querySelectorAll('.choice-btn');
          if (btns.length === 1) {
            e.preventDefault();
            btns[0].click();
          }
        }
        return;
      }

      if (!this.paused) {
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
          this.navigation.clearWalkTarget();
        }
        if (k === 'e' || k === ' ') {
          e.preventDefault();
          this.triggerInteraction();
        }
        if (['1', '2', '3', '4'].includes(k)) {
          this.useItemByKey(k);
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.input.setKey(e.key, false);
    });

    // Click-to-walk on the game canvas (optional mouse navigation!)
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.paused || (this.animations && this.animations.isBlocking()) || e.button !== 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const b = this.sceneManager.getBounds();
      const worldX = window.ACSEngine.clamp(e.clientX - rect.left + this.camera.x, b.minX, b.maxX);
      const worldY = window.ACSEngine.clamp(e.clientY - rect.top + this.camera.y, b.minY, b.maxY);
      this.navigation.setWalkTarget(worldX, worldY);
    });

    document.getElementById('btn-journal').addEventListener('click', () => {
      this.activeTabletTab = 'mission';
      this.toggleTablet(true);
    });
    const btnPhone = document.getElementById('btn-phone');
    if (btnPhone) {
      btnPhone.addEventListener('click', () => {
        if (this.phone) this.phone.toggle(true);
      });
    }
    const btnNotebook = document.getElementById('btn-notebook');
    if (btnNotebook) {
      btnNotebook.addEventListener('click', () => {
        if (this.notebook) this.notebook.toggle(true);
      });
    }
    const btnCloseNotebook = document.getElementById('btn-close-notebook');
    if (btnCloseNotebook) {
      btnCloseNotebook.addEventListener('click', () => this.closeOverlays());
    }
    document.querySelectorAll('.notebook-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.notebook) return;
        this.notebook.activeTab = btn.dataset.notebookTab;
        this.notebook.render();
      });
    });
    const btnClosePhone = document.getElementById('btn-close-phone');
    if (btnClosePhone) {
      btnClosePhone.addEventListener('click', () => this.closeOverlays());
    }
    document.querySelectorAll('.phone-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.phone) return;
        this.phone.activeTab = btn.dataset.phoneTab;
        this.phone.render();
      });
    });
    document.getElementById('btn-close-tablet').addEventListener('click', () => this.closeOverlays());
    document.getElementById('btn-close-map').addEventListener('click', () => this.closeOverlays());

    const trackerEl = document.getElementById('objective-tracker');
    if (trackerEl) {
      trackerEl.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'btn-clear-pin') return;
        this.toggleMap();
      });
    }
    const storyPill = document.getElementById('story-hud-pill');
    if (storyPill) {
      storyPill.addEventListener('click', () => {
        this.activeTabletTab = 'story';
        this.toggleTablet(true);
      });
    }
    const clearPinBtn = document.getElementById('btn-clear-pin');
    if (clearPinBtn) {
      clearPinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigation.clearPin();
        this.toast('📍 Rota manual limpa — seguindo sugestão automática.', 'info');
      });
    }
    const minimapBox = document.getElementById('hud-bottom-left');
    if (minimapBox) {
      minimapBox.addEventListener('click', () => this.toggleMap());
    }

    // Click any house or UBS inside Tactical Map to pin GPS route!
    const tacticalCanvas = document.getElementById('tactical-map-canvas');
    if (tacticalCanvas) {
      tacticalCanvas.style.cursor = 'pointer';
      tacticalCanvas.addEventListener('click', (e) => {
        const rect = tacticalCanvas.getBoundingClientRect();
        const wx = ((e.clientX - rect.left) / rect.width) * this.worldWidth;
        const wy = ((e.clientY - rect.top) / rect.height) * this.worldHeight;

        if (wx >= this.ubs.x && wx <= this.ubs.x + this.ubs.w && wy >= this.ubs.y && wy <= this.ubs.y + this.ubs.h) {
          this.navigation.setPin({ type: 'UBS', id: 'UBS' });
          this.toast('📍 Rota marcada: UBS Vila Esperança!', 'info');
          this.closeOverlays();
          return;
        }

        if (Math.hypot(wx - this.playerHome.x, wy - (this.playerHome.y - 40)) < 95) {
          this.navigation.setPin({ type: 'HOME', id: 'PLAYER_HOME' });
          this.toast('📍 Rota marcada: Casa do ACS!', 'info');
          this.closeOverlays();
          return;
        }

        if (this.vendinha && Math.hypot(wx - this.vendinha.x, wy - (this.vendinha.y - 40)) < 95) {
          this.navigation.setPin({ type: 'VENDINHA', id: 'VENDINHA' });
          this.toast('📍 Rota marcada: Vendinha do Seu Zé!', 'info');
          this.closeOverlays();
          return;
        }
        if (this.associacao && Math.hypot(wx - this.associacao.x, wy - (this.associacao.y - 40)) < 95) {
          this.navigation.setPin({ type: 'ASSOCIACAO', id: 'ASSOCIACAO' });
          this.toast('📍 Rota marcada: Associação de Moradores!', 'info');
          this.closeOverlays();
          return;
        }
        if (this.pracinha && Math.hypot(wx - this.pracinha.x, wy - this.pracinha.y) < 180) {
          this.navigation.setPin({ type: 'PRACA', id: 'PRACINHA' });
          this.toast('📍 Rota marcada: Pracinha dos Ipês!', 'info');
          this.closeOverlays();
          return;
        }
        if (this.horta && Math.hypot(wx - this.horta.x, wy - this.horta.y) < 140) {
          this.navigation.setPin({ type: 'HORTA', id: 'HORTA' });
          this.toast('📍 Rota marcada: Horta Comunitária!', 'info');
          this.closeOverlays();
          return;
        }
        if (this.campinho && wx >= this.campinho.c1 * 32 && wx <= this.campinho.c2 * 32 && wy >= this.campinho.r1 * 32 && wy <= this.campinho.r2 * 32) {
          this.navigation.setPin({ type: 'CAMPINHO', id: 'CAMPINHO' });
          this.toast('📍 Rota marcada: Campinho de Futebol!', 'info');
          this.closeOverlays();
          return;
        }
        if (this.mysteryHouse && Math.hypot(wx - this.mysteryHouse.x, wy - (this.mysteryHouse.y - 40)) < 110) {
          this.navigation.setPin({ type: 'MYSTERY_HOUSE', id: 'MYSTERY_HOUSE' });
          this.toast('📍 Rota marcada: Casa Misteriosa!', 'info');
          this.closeOverlays();
          return;
        }

        let closest = null;
        let minDist = 110;
        for (const fam of this.families) {
          const d = Math.hypot(wx - fam.x, wy - (fam.y - 40));
          if (d < minDist) {
            minDist = d;
            closest = fam;
          }
        }
        if (closest) {
          this.navigation.setPin({ type: 'HOUSE', id: closest.id });
          this.toast(`📍 Rota marcada: ${closest.code} (${closest.name})!`, 'info');
          this.closeOverlays();
        }
      });
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.dataset.tab) return;
        document.querySelectorAll('.tab-btn').forEach(b => {
          if (b.dataset.tab) b.classList.remove('active');
        });
        btn.classList.add('active');
        this.activeTabletTab = btn.dataset.tab;
        this.renderTabletContent();
      });
    });

    // Click dialogue text to finish typewriter immediately
    document.getElementById('dlg-text').addEventListener('click', () => this.finishTypewriter());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false;
    if (this.animations) {
      this.animations.resize(this.canvas.width, this.canvas.height);
    }
  }

  initAudioControls() {
    const muteBtn = document.getElementById('btn-mute');
    const volSlider = document.getElementById('audio-volume');
    const settingsBtn = document.getElementById('btn-audio-settings');
    const mixerPopover = document.getElementById('audio-mixer-popover');
    const musicSlider = document.getElementById('music-volume');
    const sfxSlider = document.getElementById('sfx-volume');
    const ambSlider = document.getElementById('ambience-volume');

    if (muteBtn) {
      muteBtn.addEventListener('click', () => this.toggleAudioMute());
    }
    if (volSlider) {
      volSlider.value = String(Math.round(window.sfx.volume * 100));
      volSlider.addEventListener('input', (e) => {
        window.sfx.init();
        window.sfx.setVolume(Number(e.target.value) / 100);
        this.syncAudioUI();
      });
    }
    if (musicSlider) {
      musicSlider.value = String(Math.round((window.sfx.musicVolume ?? 0.55) * 100));
      musicSlider.addEventListener('input', (e) => {
        window.sfx.init();
        window.sfx.setMusicVolume(Number(e.target.value) / 100);
        this.syncAudioUI();
      });
    }
    if (sfxSlider) {
      sfxSlider.value = String(Math.round((window.sfx.sfxVolume ?? 0.8) * 100));
      sfxSlider.addEventListener('input', (e) => {
        window.sfx.init();
        window.sfx.setSfxVolume(Number(e.target.value) / 100);
        this.syncAudioUI();
      });
    }
    if (ambSlider) {
      ambSlider.value = String(Math.round((window.sfx.ambienceVolume ?? 0.6) * 100));
      ambSlider.addEventListener('input', (e) => {
        window.sfx.init();
        window.sfx.setAmbienceVolume(Number(e.target.value) / 100);
        this.syncAudioUI();
      });
    }
    if (settingsBtn && mixerPopover) {
      settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mixerPopover.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!mixerPopover.classList.contains('hidden') &&
            !mixerPopover.contains(e.target) &&
            e.target !== settingsBtn) {
          mixerPopover.classList.add('hidden');
        }
      });
    }
    this.syncAudioUI();
  }

  toggleAudioMute() {
    window.sfx.init();
    const enabled = window.sfx.toggleMute();
    this.syncAudioUI();
    this.toast(enabled ? '🔊 Áudio e paisagem sonora ativados.' : '🔇 Áudio silenciado.', 'info');
  }

  syncAudioUI() {
    const muteBtn = document.getElementById('btn-mute');
    const volSlider = document.getElementById('audio-volume');
    const musicSlider = document.getElementById('music-volume');
    const sfxSlider = document.getElementById('sfx-volume');
    const ambSlider = document.getElementById('ambience-volume');
    if (muteBtn) {
      muteBtn.textContent = (!window.sfx.enabled || window.sfx.volume <= 0.01) ? '🔇' : '🔊';
    }
    if (volSlider) {
      volSlider.value = String(Math.round((window.sfx.enabled ? window.sfx.volume : 0) * 100));
    }
    if (musicSlider) {
      musicSlider.value = String(Math.round((window.sfx.musicVolume ?? 0.55) * 100));
    }
    if (sfxSlider) {
      sfxSlider.value = String(Math.round((window.sfx.sfxVolume ?? 0.8) * 100));
    }
    if (ambSlider) {
      ambSlider.value = String(Math.round((window.sfx.ambienceVolume ?? 0.6) * 100));
    }
  }

  // ==========================================================================
  // 3. HELPERS & GAME STATE
  // ==========================================================================
  get dayIndex() {
    return this.dayOfWeek;
  }

  set dayIndex(v) {
    this.dayOfWeek = window.ACSEngine.clamp(Number(v) || 0, 0, window.ACS_DATA.days.length - 1);
  }

  getCurrentDayData() {
    return window.ACS_DATA.days[this.dayOfWeek] || window.ACS_DATA.days[0];
  }

  isUBSOpen() {
    // UBS operates Monday..Friday (dayOfWeek 0..4), 08:00 to 18:00
    return this.dayOfWeek < 5 && this.timeMinutes >= 8 * 60 && this.timeMinutes < 18 * 60;
  }

  generateWeeklyPriorities() {
    // Select 4 deterministic priority families per week mixing high-risk/priority/low-bond profiles
    const sorted = [...this.families].sort((a, b) => {
      const scoreA = (a.risk === 'Alto Risco' || a.risk === 'Prioridade' ? 0 : 1) * 100 + a.bond;
      const scoreB = (b.risk === 'Alto Risco' || b.risk === 'Prioridade' ? 0 : 1) * 100 + b.bond;
      return scoreA - scoreB;
    });
    const offset = ((this.weekNumber - 1) * 2) % Math.max(1, sorted.length - 4);
    this.weeklyPriorities = sorted.slice(offset, offset + 4).map(f => f.id);
  }

  getWeeklyPrioritiesCompletedCount() {
    return this.weeklyPriorities.filter(id => this.visitedThisWeek.has(id)).length;
  }

  restOnBench() {
    if (this.timeMinutes >= 22 * 60) {
      this.toast('🌙 Já está tarde! Volte para sua casa para dormir e encerrar o dia.', 'info');
      return;
    }
    this.timeMinutes = Math.min(22 * 60, this.timeMinutes + 60);
    this.player.stamina = Math.min(100, this.player.stamina + 25);
    this.setPlayerEmote('heart', 2.0);
    if (window.sfx && typeof window.sfx.rest === 'function') window.sfx.rest();
    this.toast(`🪑 Você descansou 1 hora no banco (${this.formatClock(this.timeMinutes)}) e recuperou +25 Energia!`, 'success');
    this.updateHUD();
    this.navigation.resolveObjective();
    this.navigation.updateTrackerUI();
    this.saveProgress();
  }

  getCurrentWeather() {
    const hour = Math.floor(this.timeMinutes / 60);
    return this.getCurrentDayData().weatherSchedule[hour] || 'SUNNY';
  }

  getWeatherShortLabel(w) {
    switch (w) {
      case 'HEATWAVE': return 'Sol 37°C';
      case 'RAIN': return 'Chuva';
      case 'CLOUDY': return 'Nublado';
      default: return 'Sol Ameno';
    }
  }

  formatClock(mins) {
    const total = Math.floor(mins);
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  isFamilyAtHome(fam) {
    if (this.schedule) {
      return this.schedule.isFamilyAtHome(fam);
    }
    const hourFloat = this.timeMinutes / 60;
    return fam.schedule.some(([start, end]) => hourFloat >= start && hourFloat <= end);
  }

  getCommunityBondAverage() {
    const sum = this.families.reduce((acc, f) => acc + f.bond, 0);
    return Math.round(sum / this.families.length);
  }

  setPlayerEmote(emote, duration = 2.6) {
    this.player.emote = emote;
    this.player.emoteTimer = duration;
  }

  toast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = msg;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.35s';
      setTimeout(() => el.remove(), 350);
    }, 3500);
  }

  // ==========================================================================
  // 4. INVENTORY & HOTBAR
  // ==========================================================================
  useItemByKey(key) {
    const item = this.inventory.find(i => i.key === key);
    if (!item) return;

    if (item.id === 'water') {
      if (item.count <= 0) {
        this.toast('💧 Garrafa vazia! Encha na UBS ou com um morador amigo (Dona Dulce, Seu Raimundo, Dona Lourdes).', 'warn');
        window.sfx.warn();
        return;
      }
      item.count--;
      this.player.hydration = Math.min(100, this.player.hydration + 42);
      this.player.stamina = Math.min(100, this.player.stamina + 16);
      this.setPlayerEmote('water', 2.2);
      window.sfx.item();
      this.toast('💧 Você bebeu água fresca! (+42% Hidratação, +16 Energia)', 'success');
    } else if (item.id === 'sunscreen') {
      if (item.count <= 0) {
        this.toast('🧴 Protetor solar acabou! Reabasteça na UBS.', 'warn');
        window.sfx.warn();
        return;
      }
      item.count--;
      this.player.sunscreenTimer = 180;
      this.setPlayerEmote('check', 2.2);
      window.sfx.item();
      this.toast('🧴 Protetor Solar FPS 50 aplicado! Protegido contra o Sol Escaldante por 3h.', 'success');
    } else if (item.id === 'umbrella') {
      if (this.currentLocation !== 'OVERWORLD') {
        this.player.umbrellaOpen = false;
        this.toast('🏥 Você está dentro da UBS — não precisa abrir o guarda-sol aqui!', 'info');
        return;
      }
      this.player.umbrellaOpen = !this.player.umbrellaOpen;
      window.sfx.item();
      this.toast(
        this.player.umbrellaOpen
          ? '☂️ Guarda-Sol / Capa do SUS aberta! Protegido contra chuva e sol direto.'
          : '☂️ Guarda-Sol guardado na mochila.',
        'info'
      );
    } else if (item.id === 'treats') {
      if (item.count <= 0) {
        this.toast('🦴 Sem biscoitos caninos! Pegue mais na UBS.', 'warn');
        window.sfx.warn();
        return;
      }
      let calmedDog = false;
      let calmedCat = false;
      this.dogs.forEach(d => {
        if (Math.hypot(d.x - this.player.x, d.y - this.player.y) < 230 && d.calmedUntil <= this.timeMinutes) {
          d.calmedUntil = this.timeMinutes + 150;
          d.emote = 'heart';
          d.emoteTimer = 3.5;
          calmedDog = true;
        }
      });
      this.cats.forEach(c => {
        if (c.personality === 'medroso' && Math.hypot(c.x - this.player.x, c.y - this.player.y) < 230 && c.calmedUntil <= this.timeMinutes) {
          c.calmedUntil = this.timeMinutes + 150;
          c.emote = 'heart';
          c.emoteTimer = 3.5;
          calmedCat = true;
        }
      });
      if (calmedDog || calmedCat) {
        item.count--;
        this.setPlayerEmote('bone', 2.2);
        window.sfx.success();
        if (calmedCat && !calmedDog) {
          window.sfx.meow(false);
          this.toast('🐱 O gatinho medroso cheirou o petisco e perdeu o medo! Agora dá para fazer carinho!', 'success');
        } else {
          this.toast('🦴 Você jogou um biscoito! O bichinho adorou e ficou mansinho!', 'success');
        }
      } else {
        this.toast('🐾 Nenhum cachorro bravo ou gatinho medroso por perto agora.', 'info');
      }
    }

    this.renderHotbar();
    this.updateHUD();
    this.navigation.resolveObjective();
    this.navigation.updateTrackerUI();
    this.navigation.drawMinimap();
    this.saveProgress();
  }

  renderHotbar() {
    const bar = document.getElementById('hotbar');
    const tooltip = document.getElementById('hotbar-tooltip');
    bar.innerHTML = '';

    const bindTooltip = (el, text) => {
      el.addEventListener('mouseenter', () => {
        tooltip.textContent = text;
        tooltip.classList.remove('hidden');
      });
      el.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));
    };

    // Backpack item slots 1..4
    this.inventory.forEach(item => {
      const slot = document.createElement('div');
      const isActive = (item.id === 'umbrella' && this.player.umbrellaOpen) ||
        (item.id === 'sunscreen' && this.player.sunscreenTimer > 0);
      slot.className = `hotbar-slot ${isActive ? 'active-buff' : ''}`;

      let badge = `${item.count}`;
      if (item.id === 'umbrella') badge = this.player.umbrellaOpen ? 'ON' : 'OFF';
      else if (item.id === 'sunscreen' && this.player.sunscreenTimer > 0) badge = `${Math.ceil(this.player.sunscreenTimer)}m`;

      const emptyClass = (!item.isToggle && item.count <= 0) ? 'empty' : '';
      slot.innerHTML = `
        <span class="slot-key">${item.key}</span>
        <img src="${window.pixelArt.icons[item.id]}" class="pixel-img" alt="${item.name}">
        <span class="slot-count ${emptyClass}">${badge}</span>
      `;
      slot.addEventListener('click', () => this.useItemByKey(item.key));
      bindTooltip(slot, `[${item.key}] ${item.name} — ${item.desc}`);
      bar.appendChild(slot);
    });

    // Divider
    const div = document.createElement('div');
    div.className = 'hotbar-divider';
    bar.appendChild(div);

    // Tablet e-SUS quick slot
    const tabSlot = document.createElement('div');
    tabSlot.className = 'hotbar-slot';
    tabSlot.innerHTML = `
      <span class="slot-key">TAB</span>
      <img src="${window.pixelArt.icons.tablet}" class="pixel-img" alt="Tablet e-SUS">
      <span class="slot-count">e-SUS</span>
    `;
    tabSlot.addEventListener('click', () => this.toggleTablet());
    bindTooltip(tabSlot, '[TAB] Tablet e-SUS Território — Missão do Dia, 15 Famílias & Horários');
    bar.appendChild(tabSlot);

    // Map quick slot
    const mapSlot = document.createElement('div');
    mapSlot.className = 'hotbar-slot';
    mapSlot.innerHTML = `
      <span class="slot-key">M</span>
      <img src="${window.pixelArt.icons.map}" class="pixel-img" alt="Mapa">
      <span class="slot-count">Mapa</span>
    `;
    mapSlot.addEventListener('click', () => this.toggleMap());
    bindTooltip(mapSlot, '[M] Mapa da Vila Esperança — Veja casas abertas, sombras e cachorros');
    bar.appendChild(mapSlot);
  }

  // ==========================================================================
  // 5. MAIN LOOP & UPDATE (Resilient Framework Tick)
  // ==========================================================================
  tick(dt) {
    const safeDt = window.ACSEngine.clamp(dt, 0, 0.05);
    this.elapsedTime += safeDt;

    if (this.musicDirector) {
      this.musicDirector.update(safeDt);
    }

    if (this.animations) {
      this.animations.update(safeDt);
    }

    if (this.inMainMenu) {
      this.updateMainMenuCamera(safeDt);
    } else if (!this.paused && !(this.animations && this.animations.isBlocking())) {
      this.update(safeDt);
    }
    this.draw();
  }

  update(dt) {
    // Clock progression
    this.timeMinutes += dt * this.timeSpeed;
    if (this.player.sunscreenTimer > 0) {
      this.player.sunscreenTimer = Math.max(0, this.player.sunscreenTimer - dt * this.timeSpeed);
    }

    const currentHour = Math.floor(this.timeMinutes / 60);
    if (currentHour !== this._lastHour) {
      this._lastHour = currentHour;
      this.events.emit('time:hourChanged', {
        weekNumber: this.weekNumber,
        dayOfWeek: this.dayOfWeek,
        hour: currentHour
      });
    }

    // Politely close UBS at 18:00 if player is still inside UBS_INTERIOR or ESF_ROOM
    if ((this.currentLocation === 'UBS_INTERIOR' || this.currentLocation === 'ESF_ROOM') && !this.isUBSOpen()) {
      this.ubsInterior.exitUBS('🕕 São 18:00 — o expediente da UBS encerrou! Aproveite a noite livre pela Vila ou descanse em casa.');
      return;
    }

    // Late night gentle return home at 22:30 (no Game Over!)
    if (this.timeMinutes >= 22.5 * 60) {
      this.sleepToNextDay('LATE_NIGHT');
      return;
    }

    const weather = this.getCurrentWeather();
    const isIndoor = this.sceneManager.isIndoor();
    const bounds = this.sceneManager.getBounds();
    this.sceneManager.update(dt);

    // Check shade (indoors is always sheltered; outdoors check trees or UBS entrance overhang)
    if (isIndoor) {
      this.player.inShade = true;
      this.player.onSunTrail = false;
    } else {
      this.player.inShade = window.ACS_DATA.trees.some(t => Math.hypot(this.player.x - t.x, this.player.y - t.y) <= t.r + 6)
        || (this.player.x >= this.ubs.x && this.player.x <= this.ubs.x + this.ubs.w && this.player.y >= this.ubs.y + 180 && this.player.y <= this.ubs.y + 250);
      // Exposed "Estrada do Sol" zone (cols 13..25)
      this.player.onSunTrail = this.player.x > 13 * 32 && this.player.x < 25 * 32;
    }

    // Movement input (Keyboard WASD/Arrows or optional Click-to-Walk)
    let { dx, dy } = this.input.getMovementVector();
    if (dx === 0 && dy === 0 && this.navigation.walkTarget) {
      const tx = this.navigation.walkTarget.x - this.player.x;
      const ty = this.navigation.walkTarget.y - this.player.y;
      const dist = Math.hypot(tx, ty);
      if (dist <= 10) {
        this.navigation.clearWalkTarget();
      } else {
        dx = tx / dist;
        dy = ty / dist;
      }
    }

    this.player.isMoving = dx !== 0 || dy !== 0;

    if (this.player.isMoving) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.player.dir = dx > 0 ? 'right' : 'left';
      } else {
        this.player.dir = dy > 0 ? 'down' : 'up';
      }

      const sprinting = this.keys['shift'] && this.player.stamina > 10;
      let speed = this.player.speed;
      if (sprinting) speed *= this.player.sprintMultiplier;
      if (!isIndoor && this.player.umbrellaOpen) speed *= 0.91;
      if (!isIndoor && weather === 'RAIN' && !this.player.umbrellaOpen) speed *= 0.78;
      if (this.player.hydration < 25) speed *= 0.78;

      const prevX = this.player.x;
      const prevY = this.player.y;
      const nextX = Math.max(bounds.minX, Math.min(bounds.maxX, this.player.x + dx * speed * dt));
      const nextY = Math.max(bounds.minY, Math.min(bounds.maxY, this.player.y + dy * speed * dt));

      if (!this.collides(nextX, this.player.y)) this.player.x = nextX;
      if (!this.collides(this.player.x, nextY)) this.player.y = nextY;

      // Cancel click-to-walk if blocked by an obstacle
      if (this.navigation.walkTarget && Math.hypot(this.player.x - prevX, this.player.y - prevY) < 0.2) {
        this.navigation.clearWalkTarget();
      }

      // 4-frame walk animation cycle (guaranteed non-negative index)
      this.player.animTimer += dt * (sprinting ? 11 : 7.5);
      this.player.animFrame = window.ACSEngine.safeMod(this.player.animTimer, 4);

      // Footstep dust particles & terrain-aware footstep audio!
      this.player.stepDustTimer += dt * (sprinting ? 1.8 : 1.0);
      if (this.player.stepDustTimer >= 0.24) {
        this.player.stepDustTimer = 0;
        if (isIndoor) {
          window.sfx.footstep(this.sceneManager.getFootstepTile());
        } else {
          this.spawnFootDust(this.player.x, this.player.y + 4);
          const col = Math.floor(this.player.x / this.TILE);
          const row = Math.floor(this.player.y / this.TILE);
          const tileType = (this.tileMap[row] && this.tileMap[row][col]) || 'G';
          window.sfx.footstep(tileType);
        }
      }
    } else {
      this.player.animFrame = 0;
    }

    // Stamina & Hydration environmental simulation
    const sprinting = this.keys['shift'] && this.player.stamina > 10 && this.player.isMoving;
    let hydrationDrain = isIndoor ? 0.06 : 0.34;
    let staminaDrain = this.player.isMoving ? (isIndoor ? 0.15 : 0.42) : (isIndoor ? -4.5 : -2.0);
    if (sprinting) staminaDrain += isIndoor ? 1.5 : 4.0;

    if (!isIndoor) {
      if (weather === 'HEATWAVE') {
        let factor = this.player.onSunTrail ? 2.5 : 1.7;
        if (this.player.inShade) factor = 0.2;
        if (this.player.umbrellaOpen) factor *= 0.5;
        if (this.player.sunscreenTimer > 0) factor *= 0.35;
        hydrationDrain *= factor;
      } else if (weather === 'SUNNY') {
        let factor = this.player.onSunTrail ? 1.35 : 1.0;
        if (this.player.inShade) factor = 0.25;
        if (this.player.umbrellaOpen) factor *= 0.6;
        hydrationDrain *= factor;
      } else if (weather === 'RAIN') {
        hydrationDrain = 0.14;
        if (!this.player.umbrellaOpen && !this.player.inShade) {
          staminaDrain += 1.5;
        }
      }

      if (this.player.inShade && !this.player.isMoving) {
        staminaDrain = -5.0; // Rest quickly in tree shade
      }
    }

    this.player.hydration = Math.max(0, Math.min(100, this.player.hydration - hydrationDrain * dt));
    this.player.stamina = Math.max(0, Math.min(100, this.player.stamina - staminaDrain * dt));

    if (!isIndoor && this.player.hydration <= 5) {
      this.player.stamina = Math.max(0, this.player.stamina - 3.5 * dt);
    }

    // Occasional warning emote above ACS head if very thirsty
    if (this.player.hydration < 25 && this.player.emoteTimer <= 0 && Math.random() < dt * 0.4) {
      this.setPlayerEmote('sweat', 2.0);
    }

    if (!isIndoor && this.player.stamina <= 0.5 && this.player.hydration <= 2) {
      this.handleExhaustion();
      return;
    }

    // Decrement emote timers
    if (this.player.emoteTimer > 0) this.player.emoteTimer -= dt;
    this.families.forEach(f => { if (f.emoteTimer > 0) f.emoteTimer -= dt; });
    this.dogs.forEach(d => { if (d.emoteTimer > 0) d.emoteTimer -= dt; });
    this.cats.forEach(c => {
      if (c.emoteTimer > 0) c.emoteTimer -= dt;
      if (c.scareCooldown > 0) c.scareCooldown -= dt;
      if (c.meowCooldown > 0) c.meowCooldown -= dt;
    });

    if (!isIndoor) {
      this.updateDogs(dt);
      this.updateCats(dt);
      this.updateParticles(dt, weather);
    }
    this.checkNearbyInteractions();
    this.navigation.update(dt);
    window.sfx.updateAmbience(dt, {
      weather,
      hourFloat: this.timeMinutes / 60,
      nearStream: !isIndoor && Math.abs(this.player.x - 17.5 * this.TILE) < 180,
      umbrellaOpen: this.player.umbrellaOpen,
      paused: this.paused,
      indoor: isIndoor
    });

    // Smooth Camera Lerp (Centers compact indoor rooms cleanly!)
    let targetCamX;
    let targetCamY;
    if (isIndoor) {
      targetCamX = bounds.width <= this.canvas.width
        ? -(this.canvas.width - bounds.width) / 2
        : window.ACSEngine.clamp(this.player.x - this.canvas.width / 2, 0, bounds.width - this.canvas.width);
      targetCamY = bounds.height <= this.canvas.height
        ? -(this.canvas.height - bounds.height) / 2
        : window.ACSEngine.clamp(this.player.y - this.canvas.height / 2, 0, bounds.height - this.canvas.height);
    } else {
      targetCamX = Math.max(0, Math.min(this.worldWidth - this.canvas.width, this.player.x - this.canvas.width / 2));
      targetCamY = Math.max(0, Math.min(this.worldHeight - this.canvas.height, this.player.y - this.canvas.height / 2));
    }
    const lerpAlpha = 1 - Math.exp(-7.5 * dt);
    this.camera.x += (targetCamX - this.camera.x) * lerpAlpha;
    this.camera.y += (targetCamY - this.camera.y) * lerpAlpha;

    // Periodic HUD refresh
    if (Math.floor(this.timeMinutes) !== this._lastMin) {
      this._lastMin = Math.floor(this.timeMinutes);
      this.updateHUD();
      if (this._lastMin % 15 === 0) this.renderHotbar();
    }
  }

  // Smart Y-Sorting Collision Footprints (only base walls & trunks collide — roofs & canopies are walkable behind!)
  collides(px, py) {
    if (this.currentLocation !== 'OVERWORLD' && this.sceneManager) {
      return this.sceneManager.collides(px, py);
    }

    // River collision (cols 17..18 except bridge rows 23..25)
    const col = Math.floor(px / this.TILE);
    const row = Math.floor(py / this.TILE);
    if (row >= 0 && row < this.ROWS && col >= 0 && col < this.COLS) {
      if (this.tileMap[row][col] === 'R') return true;
    }

    // UBS solid lower base (allows walking behind its upper terracotta roof!)
    if (px > this.ubs.x + 18 && px < this.ubs.x + this.ubs.w - 18 &&
        py > this.ubs.y + 110 && py < this.ubs.y + this.ubs.h - 24) {
      return true;
    }

    // UBS wooden perimeter fences (west fence col 3, south fence row 26 with gate opening cols 7..10)
    const T = this.TILE;
    if (px > 3 * T - 6 && px < 3 * T + 14 && py > 21 * T && py < 26 * T + 16) {
      return true;
    }
    if (py > 26 * T - 4 && py < 26 * T + 16) {
      if ((px > 3 * T && px < 7 * T + 4) || (px > 10 * T - 4 && px < 13 * T + 8)) {
        return true;
      }
    }

    // Protagonist's Home, Vendinha, Associação & Casa Misteriosa lower base footprints
    for (const bldg of [this.playerHome, this.vendinha, this.associacao, this.mysteryHouse]) {
      if (!bldg) continue;
      if (px > bldg.x - 62 && px < bldg.x + 62 && py > bldg.y - 76 && py < bldg.y - 24) {
        return true;
      }
    }

    // Horta Comunitária perimeter wooden fences (cols 65..74, rows 44..52, gate open rows 47..48 on col 65)
    if (px > 65 * T - 6 && px < 74 * T + 10) {
      if ((py > 44 * T - 4 && py < 44 * T + 14) || (py > 52 * T - 4 && py < 52 * T + 14)) return true;
    }
    if (py > 44 * T && py < 52 * T + 14) {
      if (px > 74 * T - 6 && px < 74 * T + 12) return true;
      if (px > 65 * T - 6 && px < 65 * T + 12 && (py < 47 * T || py > 49 * T)) return true;
    }

    // Pracinha Domino tables (at 41*T, 48*T and 47*T, 48*T)
    for (const dx of [41 * T, 47 * T]) {
      if (px > dx - 28 && px < dx + 28 && py > 48 * T - 18 && py < 48 * T + 12) return true;
    }

    // Market Stalls on Tuesdays during Feira Livre (07:30..14:00)
    if (this.schedule && this.schedule.isFeiraActive()) {
      for (const sx of [39 * T, 44 * T, 49 * T]) {
        if (px > sx - 38 && px < sx + 38 && py > 45.5 * T - 20 && py < 45.5 * T + 14) return true;
      }
    }

    // Houses lower base footprints (house sprite is 160x160 anchored around fam.x, fam.y)
    // Leaves upper pitched roof completely walkable behind for true Y-Sorting!
    for (const fam of this.families) {
      const left = fam.x - 62;
      const right = fam.x + 62;
      const top = fam.y - 76;
      const bottom = fam.y - 24;
      if (px > left && px < right && py > top && py < bottom) {
        return true;
      }
    }

    // Tree trunks only (canopy is walkable behind!)
    for (const t of window.ACS_DATA.trees) {
      if (Math.hypot(px - t.x, py - (t.y - 6)) < 14) {
        return true;
      }
    }

    return false;
  }

  handleExhaustion() {
    window.sfx.warn();
    this.currentLocation = 'OVERWORLD';
    this.player.x = this.ubs.doorX;
    this.player.y = this.ubs.doorY + 28;
    this.ubsInterior._snapCameraToCurrentRoom();
    this.player.stamina = 75;
    this.player.hydration = 90;
    this.timeMinutes = Math.min(17.75 * 60, this.timeMinutes + 60);
    const water = this.inventory.find(i => i.id === 'water');
    if (water) water.count = water.maxCount;
    this.toast('🚑 Exaustão pelo calor! Você voltou à UBS para hidratação oral (+1h). Use sombras e água [1]!', 'danger');
    this.renderHotbar();
    this.updateHUD();
    this.navigation.resolveObjective();
    this.navigation.updateTrackerUI();
    this.navigation.drawMinimap();
    this.saveProgress();
  }

  // ==========================================================================
  // 6. DOGS AI & AMBIENT PARTICLES
  // ==========================================================================
  updateDogs(dt) {
    for (const dog of this.dogs) {
      const isCalmed = dog.calmedUntil > this.timeMinutes;
      const onCooldown = dog.cooldownUntil > this.timeMinutes;
      const dist = Math.hypot(this.player.x - dog.x, this.player.y - dog.y);

      let vx = 0;
      let vy = 0;

      if (!isCalmed && !onCooldown && dist < dog.aggroRadius) {
        const angle = Math.atan2(this.player.y - dog.y, this.player.x - dog.x);
        vx = Math.cos(angle) * dog.speed;
        vy = Math.sin(angle) * dog.speed;
        dog.emote = 'alert';
        dog.emoteTimer = 0.4;
        if (dist < 30) {
          this.triggerDogEncounter(dog);
          break;
        }
      } else {
        dog.angle += dt * 0.9;
        const tx = dog.homeX + Math.cos(dog.angle) * 44;
        const ty = dog.homeY + Math.sin(dog.angle) * 30;
        vx = (tx - dog.x) * 1.8;
        vy = (ty - dog.y) * 1.8;
      }

      dog.x += vx * dt;
      dog.y += vy * dt;

      if (Math.abs(vx) > Math.abs(vy)) {
        dog.dir = vx >= 0 ? 'right' : 'left';
      } else if (Math.abs(vy) > 1) {
        dog.dir = vy >= 0 ? 'down' : 'up';
      }
      dog.animTimer += dt * (Math.hypot(vx, vy) > 40 ? 9 : 4);
    }
  }

  updateCats(dt) {
    for (const cat of this.cats) {
      const isScaredy = cat.personality === 'medroso' && cat.calmedUntil <= this.timeMinutes;
      const dist = Math.hypot(this.player.x - cat.x, this.player.y - cat.y);

      let vx = 0;
      let vy = 0;

      if (isScaredy) {
        const fleeR = cat.fleeRadius || 118;
        if (dist < fleeR) {
          // Run away from player!
          const angle = Math.atan2(cat.y - this.player.y, cat.x - this.player.x);
          vx = Math.cos(angle) * cat.speed;
          vy = Math.sin(angle) * cat.speed;
          cat.emote = 'alert';
          cat.emoteTimer = 0.9;
          if (cat.scareCooldown <= 0) {
            window.sfx.meow(true);
            cat.scareCooldown = 4.5;
            if (!cat.startledNoticeShown) {
              cat.startledNoticeShown = true;
              this.toast(`🙀 ${cat.shortName} se assustou e saiu correndo! (Dica: um petisco [4] pode acalmá-lo)`, 'info');
            }
          }
        } else if (dist > fleeR + 55) {
          // Slowly creep back toward home spot when safe
          const homeDist = Math.hypot(cat.homeX - cat.x, cat.homeY - cat.y);
          if (homeDist > 26) {
            const angle = Math.atan2(cat.homeY - cat.y, cat.homeX - cat.x);
            vx = Math.cos(angle) * 42;
            vy = Math.sin(angle) * 42;
          }
        }
      } else {
        // Friendly / fofinho cat (or calmed scaredy cat): approaches player gently or lounges nearby!
        if (dist < 95 && dist > 30) {
          const angle = Math.atan2(this.player.y - cat.y, this.player.x - cat.x);
          vx = Math.cos(angle) * (cat.speed || 58);
          vy = Math.sin(angle) * (cat.speed || 58);
          if (cat.meowCooldown <= 0 && dist < 72) {
            window.sfx.meow(false);
            cat.meowCooldown = 9;
            cat.emote = 'heart';
            cat.emoteTimer = 2.0;
          }
        } else if (dist <= 30) {
          // Sit cutely next to player waiting for pets
          vx = 0;
          vy = 0;
        } else {
          cat.pauseTimer -= dt;
          if (cat.pauseTimer <= 0) {
            cat.angle += dt * 0.7;
            const r = Math.min(34, cat.patrolRadius || 45);
            const tx = cat.homeX + Math.cos(cat.angle) * r;
            const ty = cat.homeY + Math.sin(cat.angle) * (r * 0.7);
            vx = (tx - cat.x) * 1.3;
            vy = (ty - cat.y) * 1.3;
            if (Math.random() < dt * 0.25) cat.pauseTimer = 2.0 + Math.random() * 2.5;
          }
        }
      }

      const speedMag = Math.hypot(vx, vy);
      if (speedMag > 1) {
        const nextX = Math.max(48, Math.min(this.worldWidth - 48, cat.x + vx * dt));
        const nextY = Math.max(48, Math.min(this.worldHeight - 48, cat.y + vy * dt));
        const movedX = !this.collides(nextX, cat.y);
        const movedY = !this.collides(cat.x, nextY);
        if (movedX) cat.x = nextX;
        if (movedY) cat.y = nextY;

        // If a scaredy cat is cornered against an obstacle, sidestep smoothly
        if (isScaredy && !movedX && !movedY) {
          const perpAngle = Math.atan2(cat.y - this.player.y, cat.x - this.player.x) + Math.PI / 2;
          const sx = cat.x + Math.cos(perpAngle) * cat.speed * dt;
          const sy = cat.y + Math.sin(perpAngle) * cat.speed * dt;
          if (!this.collides(sx, cat.y)) cat.x = sx;
          if (!this.collides(cat.x, sy)) cat.y = sy;
        }

        if (Math.abs(vx) > Math.abs(vy)) {
          cat.dir = vx >= 0 ? 'right' : 'left';
        } else if (Math.abs(vy) > 1) {
          cat.dir = vy >= 0 ? 'down' : 'up';
        }
        cat.animTimer += dt * (speedMag > 80 ? 11 : 5);
      } else {
        cat.animTimer = 0;
      }
    }
  }

  spawnLeaf(randomScreen = false) {
    const colors = ['#758f3b', '#e0a92d', '#cc5a8b', '#b3c258'];
    return {
      x: randomScreen ? Math.random() * this.worldWidth : this.camera.x + Math.random() * (this.canvas.width + 200),
      y: randomScreen ? Math.random() * this.worldHeight : this.camera.y - 20,
      vx: -14 - Math.random() * 18,
      vy: 12 + Math.random() * 14,
      sway: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  }

  spawnFootDust(x, y) {
    for (let i = 0; i < 2; i++) {
      this.dustParticles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 16,
        vy: -8 - Math.random() * 10,
        life: 0.42,
        maxLife: 0.42,
        size: Math.random() > 0.5 ? 4 : 6
      });
    }
  }

  updateParticles(dt, weather) {
    // Footstep dust
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const p = this.dustParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.dustParticles.splice(i, 1);
    }

    // Drifting leaves
    for (const leaf of this.leafParticles) {
      leaf.sway += dt * 2.2;
      leaf.x += (leaf.vx + Math.sin(leaf.sway) * 12) * dt;
      leaf.y += leaf.vy * dt;
      if (leaf.y > this.worldHeight || leaf.x < 0) {
        Object.assign(leaf, this.spawnLeaf(false));
      }
    }

    // Rain droplets + splashes
    if (weather === 'RAIN') {
      for (const rp of this.rainParticles) {
        rp.x -= 160 * dt;
        rp.y += 560 * dt;
        if (rp.y > this.canvas.height) {
          if (Math.random() < 0.28) {
            this.rainSplashes.push({ x: rp.x, y: Math.random() * this.canvas.height, life: 0.25 });
          }
          rp.y = -15;
          rp.x = Math.random() * (this.canvas.width + 200);
        }
      }
      for (let i = this.rainSplashes.length - 1; i >= 0; i--) {
        this.rainSplashes[i].life -= dt;
        if (this.rainSplashes[i].life <= 0) this.rainSplashes.splice(i, 1);
      }
    }
  }

  // ==========================================================================
  // 7. INTERACTIONS & STARDEW BOTTOM DIALOGUE BOX
  // ==========================================================================
  checkNearbyInteractions() {
    if (this.currentLocation !== 'OVERWORLD' && this.sceneManager) {
      this.sceneManager.checkNearbyInteractions();
      return;
    }

    this.nearTarget = null;

    // Assembleia Aberta na Pracinha dos Ipês (Capítulo 4 — Etapa H4, prioridade máxima na praça)
    if (
      this.pracinha &&
      this.storyState &&
      this.storyState.chapter === 4 &&
      this.storyState.hasFlag('q4_equipe_ok') &&
      !this.storyState.hasFlag('q4_assembleia_concluida')
    ) {
      const distPraca = Math.hypot(this.player.x - this.pracinha.x, this.player.y - this.pracinha.y);
      if (distPraca < 140) {
        if (!this.paused && this.storyEvents && !this.storyEvents.activeEvent && (!this.dialogue || !this.dialogue.activeSession)) {
          this.storyEvents.evaluateTriggers('OVERWORLD');
        }
        this.nearTarget = {
          type: 'PRACA_ASSEMBLEIA',
          x: this.pracinha.x,
          y: this.pracinha.y - 36,
          label: '[E] Abrir Assembleia na Pracinha dos Ipês'
        };
        return;
      }
    }

    if (Math.hypot(this.player.x - this.ubs.doorX, this.player.y - this.ubs.doorY) < 64) {
      const open = this.isUBSOpen();
      this.nearTarget = {
        type: 'UBS',
        x: this.ubs.doorX,
        y: this.ubs.doorY - 70,
        label: open ? '[E] Entrar na UBS' : '[E] UBS Fechada (Seg–Sex 08h–18h)'
      };
      return;
    }

    if (this.playerHome && Math.hypot(this.player.x - this.playerHome.x, this.player.y - this.playerHome.y) < 62) {
      this.nearTarget = {
        type: 'PLAYER_HOME',
        x: this.playerHome.x,
        y: this.playerHome.y - 44,
        label: '[E] Entrar em Casa'
      };
      return;
    }

    if (this.vendinha && Math.hypot(this.player.x - this.vendinha.x, this.player.y - this.vendinha.y) < 62) {
      const open = this.communitySpaces.isVendinhaOpen();
      this.nearTarget = {
        type: 'VENDINHA',
        x: this.vendinha.x,
        y: this.vendinha.y - 44,
        label: open ? '[E] Entrar na Vendinha do Zé' : '[E] Vendinha Fechada (07h–21h30)'
      };
      return;
    }

    if (this.associacao && Math.hypot(this.player.x - this.associacao.x, this.player.y - this.associacao.y) < 62) {
      const open = this.communitySpaces.isAssociacaoOpen();
      this.nearTarget = {
        type: 'ASSOCIACAO',
        x: this.associacao.x,
        y: this.associacao.y - 44,
        label: open ? '[E] Entrar na Associação' : '[E] Associação Fechada (09h–19h)'
      };
      return;
    }

    // Tia Bete outside by the Horta on Saturday mornings (09h–12h30)
    if (this.communitySpaces && this.communitySpaces.isTiaBeteAtHorta()) {
      const tb = this.communitySpaces.npcs.npc_tia_bete;
      if (Math.hypot(this.player.x - tb.hortaX, this.player.y - tb.hortaY) < 62) {
        this.nearTarget = {
          type: 'TIA_BETE_HORTA',
          x: tb.hortaX,
          y: tb.hortaY - 48,
          label: '[E] Conversar com Tia Bete (Horta)'
        };
        return;
      }
    }

    // Scheduled residents out in Overworld (Feira / Roda de Dominó)
    if (this.schedule) {
      for (const { fam, loc } of this.schedule.getFamiliesInScene('OVERWORLD')) {
        if (Math.hypot(this.player.x - loc.x, this.player.y - loc.y) < 58) {
          this.nearTarget = {
            type: 'INFORMAL_NPC',
            family: fam,
            loc,
            x: loc.x,
            y: loc.y - 48,
            label: `[E] Conversar com ${fam.name.split(' ')[0]}`
          };
          return;
        }
      }
    }

    // Environmental Clues (WorldStateSystem — Etapa H3)
    if (this.worldState) {
      const nearbyClue = this.worldState.getNearbyClue('OVERWORLD');
      if (nearbyClue) {
        this.nearTarget = {
          type: 'WORLD_CLUE',
          clue: nearbyClue,
          x: nearbyClue.x,
          y: nearbyClue.y - 34,
          label: nearbyClue.prompt
        };
        return;
      }
    }

    // Horta Comunitária inspection point (center of garden)
    if (this.horta && Math.hypot(this.player.x - this.horta.x, this.player.y - this.horta.y) < 64) {
      this.nearTarget = {
        type: 'HORTA_SIGN',
        x: this.horta.x,
        y: this.horta.y - 34,
        label: '[E] Inspecionar Terreno da Horta'
      };
      return;
    }

    // Campinho de Futebol (Bairro Vizinho)
    if (this.campinho && Math.hypot(this.player.x - this.campinho.x, this.player.y - this.campinho.y) < 64) {
      this.nearTarget = {
        type: 'CAMPINHO',
        x: this.campinho.x,
        y: this.campinho.y - 34,
        label: '[E] Bater Bola / Olhar o Campinho'
      };
      return;
    }

    // Casa Misteriosa (Bairro Vizinho)
    if (this.mysteryHouse && Math.hypot(this.player.x - this.mysteryHouse.x, this.player.y - this.mysteryHouse.y) < 64) {
      this.nearTarget = {
        type: 'MYSTERY_HOUSE',
        x: this.mysteryHouse.x,
        y: this.mysteryHouse.y - 44,
        label: '[E] Investigar Portão da Casa Misteriosa'
      };
      return;
    }

    for (const spot of this.dengueSpots) {
      if (!spot.cleared && Math.hypot(this.player.x - spot.x, this.player.y - spot.y) < 52) {
        this.nearTarget = { type: 'DENGUE', spot, x: spot.x, y: spot.y - 32, label: '[E] Eliminar Foco' };
        return;
      }
    }

    // Friendly / Calmed Neighborhood Cats — Pettable!
    for (const cat of this.cats) {
      const canPet = cat.personality === 'fofinho' || cat.calmedUntil > this.timeMinutes;
      if (canPet && Math.hypot(this.player.x - cat.x, this.player.y - cat.y) < 56) {
        this.nearTarget = {
          type: 'CAT',
          cat,
          x: cat.x,
          y: cat.y - 32,
          label: `[E] Fazer carinho em ${cat.shortName} 🐱`
        };
        return;
      }
    }

    for (const fam of this.families) {
      if (Math.hypot(this.player.x - fam.x, this.player.y - fam.y) < 62) {
        const atHome = this.isFamilyAtHome(fam);
        this.nearTarget = {
          type: 'HOUSE',
          family: fam,
          x: fam.x,
          y: fam.y - 44,
          label: atHome ? `[E] Visitar ${fam.code}` : `[E] Bater na ${fam.code}`
        };
        return;
      }
    }

    // Neighborhood wooden benches — rest 1 hour to recover stamina or wait for schedules!
    for (const p of window.ACS_DATA.props) {
      if (p.type === 'bench' && Math.hypot(this.player.x - p.x, this.player.y - p.y) < 54) {
        this.nearTarget = {
          type: 'BENCH',
          x: p.x,
          y: p.y - 28,
          label: '[E] Descansar 1h (+25 Energia)'
        };
        return;
      }
    }
  }

  triggerInteraction() {
    if (this.currentLocation !== 'OVERWORLD' && this.sceneManager) {
      this.sceneManager.triggerInteraction();
      return;
    }
    if (!this.nearTarget) return;
    if (this.nearTarget.type === 'UBS') {
      if (this.isUBSOpen()) {
        this.ubsInterior.enterUBS();
      } else {
        window.sfx.warn();
        this.toast('🏥 A UBS Vila Esperança funciona de Segunda a Sexta, das 08:00 às 18:00.', 'info');
      }
    } else if (this.nearTarget.type === 'PLAYER_HOME') {
      this.playerHomeSystem.enterHome(false);
    } else if (this.nearTarget.type === 'VENDINHA') {
      this.communitySpaces.enterVendinha();
    } else if (this.nearTarget.type === 'ASSOCIACAO') {
      this.communitySpaces.enterAssociacao();
    } else if (this.nearTarget.type === 'TIA_BETE_HORTA') {
      this.communitySpaces.openTiaBeteDialogue();
    } else if (this.nearTarget.type === 'INFORMAL_NPC') {
      this.schedule.openInformalEncounter(this.nearTarget.family, this.nearTarget.loc);
    } else if (this.nearTarget.type === 'WORLD_CLUE' && this.worldState) {
      this.worldState.inspectClue(this.nearTarget.clue);
    } else if (this.nearTarget.type === 'PRACA_ASSEMBLEIA' && this.storyEvents) {
      this.storyEvents.evaluateTriggers('OVERWORLD');
    } else if (this.nearTarget.type === 'HORTA_SIGN') {
      const stage = this.worldState ? this.worldState.getHortaStage() : 0;
      const stageMsgs = [
        '🌱 Horta Comunitária (Estágio 0): 10 canteiros aguardando o mutirão da Associação!',
        '🌿 Horta Comunitária (Estágio 1): Canteiros limpos e preparados com apoio da Tia Bete!',
        '🥬 Horta Comunitária (Estágio 2): Primeiras mudas plantadas em parceria com a comunidade!',
        '🌻 Horta Comunitária (Estágio 3): Canteiros vivos, irrigados e produtivos na Vila Esperança!'
      ];
      this.toast(stageMsgs[stage] || stageMsgs[0], 'info');
    } else if (this.nearTarget.type === 'CAMPINHO') {
      this.interactWithCampinho();
    } else if (this.nearTarget.type === 'MYSTERY_HOUSE') {
      this.openMysteryHouseDialogue();
    } else if (this.nearTarget.type === 'BENCH') {
      this.restOnBench();
    } else if (this.nearTarget.type === 'DENGUE') {
      this.clearDengueSpot(this.nearTarget.spot);
    } else if (this.nearTarget.type === 'CAT') {
      this.interactWithCat(this.nearTarget.cat);
    } else if (this.nearTarget.type === 'HOUSE') {
      this.visitHouse(this.nearTarget.family);
    }
  }

  interactWithCampinho() {
    this.timeMinutes += 10;
    this.player.stamina = Math.min(100, this.player.stamina + 8);
    this.setPlayerEmote('heart', 2.2);
    if (window.sfx && typeof window.sfx.success === 'function') window.sfx.success();
    this.toast('⚽ Você deu uns toques na bola no Campinho da Vila Aurora! (+8 Energia, +10 min)', 'success');
    if (this.notebook) {
      this.notebook.addChronicleEntry(
        '⚽ Campinho da Vila Aurora',
        'O campinho do bairro vizinho reúne jovens no fim da tarde — e comentam sobre o casarão fechado no canto nordeste.'
      );
    }
    this.updateHUD();
    this.saveProgress();
  }

  openMysteryHouseDialogue() {
    const g = this;
    const mh = this.mysteryHouse;
    if (!mh || !this.dialogue) return;
    const alreadyChecked = this.storyState && this.storyState.hasFlag('mystery_house_inspected');

    const graph = {
      startNode: 'portao',
      nodes: {
        portao: {
          speaker: 'player',
          text: alreadyChecked
            ? 'O portão de ferro do Casarão Nº 00 segue trancado com corrente. A tigela de água fresca para os gatos continua ali no canto do muro — alguém cuida dela à noite.'
            : 'Um casarão silencioso de janelas fechadas no canto da Vila Aurora. A caixa de correio está cheia de cartas antigas, mas há uma tigela limpa com água fresca perto da fresta do portão.',
          note: 'Bairro Vizinho (Vila Aurora) • Casa Misteriosa (Nº 00).',
          choices: [
            {
              text: 'Examinar os envelopes na caixa de correio e as pegadas na calçada.',
              intent: '🔍 Investigar vestígios',
              next: 'descoberta',
              effects: {
                setFlags: { mystery_house_inspected: true }
              }
            },
            {
              text: 'Deixar o portão em paz e seguir explorando o bairro.',
              intent: '🚶 Seguir caminho',
              reply: 'Você anotou a localização do casarão para observar em outro momento.'
            }
          ]
        },
        descoberta: {
          speaker: 'player',
          text: 'Os envelopes trazem o nome "Sr. Arnaldo V. — Antiga Ferrovia", com avisos antigos sem retorno. Ninguém aparece no cadastro da UBS, mas há sinais claros de que alguém ainda entra aqui tarde da noite.',
          note: 'Pista anotada no Caderno de Campo [J] — mistério realista do território.',
          choices: [
            {
              text: 'Registrar a descoberta no Caderno de Campo.',
              intent: '📓 Anotar no Caderno',
              effects: {
                postureDelta: { acolhimento: 1 }
              },
              reply: 'Anotado! Um antigo ferroviário sem cadastro no SUS pode estar vivendo isolado aqui.'
            }
          ]
        }
      }
    };

    const profile = this.dialogue.resolveSpeakerProfile('player');
    this.dialogue.startGraph({
      entityType: 'STAFF',
      entityData: profile ? profile.entityData : {},
      entityId: 'player',
      tag: 'Vila Aurora • Bairro Vizinho',
      name: mh.name,
      badgesHtml: '<span class="badge trabalhador">❓ Casarão Fechado</span>',
      bondPct: 30,
      bondText: 'Desconhecido',
      graph,
      onFinish: (choice) => {
        if (g.notebook && g.storyState && g.storyState.hasFlag('mystery_house_inspected')) {
          g.notebook.addChronicleEntry(
            '❓ Casa Misteriosa (Casarão Nº 00)',
            'Caixa de correio em nome de Sr. Arnaldo V. (ex-ferroviário), tigela de água limpa e sinais de presença noturna fora do cadastro da UBS.'
          );
        }
        g.setDialogueText(choice.reply);
        const choicesEl = document.getElementById('dlg-choices');
        choicesEl.innerHTML = '';
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = '<span>Voltar para a rua.</span><span class="choice-tag">Prosseguir</span>';
        btn.addEventListener('click', () => g.closeOverlays());
        choicesEl.appendChild(btn);
      }
    });
  }

  clearDengueSpot(spot) {
    spot.cleared = true;
    this.dengueClearedCount++;
    this.timeMinutes += 8;
    this.setPlayerEmote('check', 2.4);
    window.sfx.success();
    this.toast(`🦟 Foco eliminado: ${spot.label}! A comunidade agradece!`, 'success');
    const fam = this.families.find(f => f.id === spot.houseId);
    if (fam) {
      fam.bond = Math.min(100, fam.bond + 6);
      fam.emote = 'heart';
      fam.emoteTimer = 3.0;
    }
    if (this.events) {
      this.events.emit('dengue:cleared', { spotId: spot.id, totalCleared: this.dengueClearedCount });
    }
    this.updateHUD();
    this.navigation.resolveObjective();
    this.navigation.updateTrackerUI();
    this.navigation.drawMinimap();
    this.saveProgress();
  }

  // Typewriter text helper for Stardew dialogue feel
  setDialogueText(text) {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    this.typewriterFullText = text;
    const el = document.getElementById('dlg-text');
    el.textContent = '';
    let idx = 0;
    this.typewriterTimer = setInterval(() => {
      idx += 2;
      el.textContent = text.slice(0, idx);
      if (idx >= text.length) {
        this.finishTypewriter();
      }
    }, 16);
  }

  finishTypewriter() {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    document.getElementById('dlg-text').textContent = this.typewriterFullText;
  }

  renderHearts(bond) {
    const filled = Math.round(bond / 20);
    return '❤️'.repeat(filled) + '🤍'.repeat(5 - filled);
  }

  openDialogueShell(entityType, data, tag, name, badgesHtml, bondPct, bondText) {
    this.paused = true;
    this.input.clear();
    this.navigation.clearWalkTarget();
    document.getElementById('dialogue-overlay').classList.remove('hidden');

    const pCanvas = document.getElementById('dlg-portrait-canvas');
    window.pixelArt.drawPortraitToCanvas(pCanvas, entityType, data);

    document.getElementById('dlg-tag').textContent = tag;
    document.getElementById('dlg-name').textContent = name;
    document.getElementById('dlg-badges').innerHTML = badgesHtml;
    document.getElementById('dlg-hearts').textContent = this.renderHearts(bondPct);
    document.getElementById('dlg-bond-val').textContent = bondText;
    document.getElementById('dlg-choices').innerHTML = '';
  }

  triggerDogEncounter(dog) {
    window.sfx.bark();
    dog.emote = 'anger';
    dog.emoteTimer = 2.5;

    const treats = this.inventory.find(i => i.id === 'treats');
    const hasTreats = treats && treats.count > 0;

    this.openDialogueShell(
      'DOG',
      dog,
      'Dificuldade do Território • Cachorro Solto na Rua',
      dog.name,
      `<span class="badge teimoso">🐾 Territorialista</span>`,
      20,
      'Alerta Canino!'
    );

    this.setDialogueText(
      `Au! Au! Grrrr! ${dog.name} avançou latindo para proteger a calçada! Ele está bloqueando sua passagem. Como o ACS reage?`
    );

    const noteEl = document.getElementById('dlg-clinical-note');
    noteEl.classList.remove('hidden');
    noteEl.textContent = 'Dica de Campo: Mantenha a calma, ofereça um biscoito canino ou use a pasta do e-SUS como barreira sem correr.';

    const choicesEl = document.getElementById('dlg-choices');
    const opts = [];
    if (hasTreats) {
      opts.push({
        text: `Jogar um Biscoito Canino (${treats.count} restantes) com voz tranquila.`,
        tag: '🦴 Acalma por 2h30 • Sem fadiga',
        fn: () => {
          treats.count--;
          dog.calmedUntil = this.timeMinutes + 150;
          dog.emote = 'heart';
          dog.emoteTimer = 3.5;
          window.sfx.success();
          this.toast(`🐕 ${dog.name} adorou o petisco e ficou mansinho!`, 'success');
          this.closeOverlays();
          this.renderHotbar();
        }
      });
    }
    opts.push({
      text: 'Usar a prancheta como barreira visual e recuar calmamente sem dar as costas.',
      tag: '🛡️ Técnica Segura • -10 Energia • +10m',
      fn: () => {
        this.player.stamina = Math.max(5, this.player.stamina - 10);
        this.timeMinutes += 10;
        dog.cooldownUntil = this.timeMinutes + 35;
        this.toast('🛡️ Você recuou com técnica e segurança!', 'info');
        this.closeOverlays();
      }
    });
    opts.push({
      text: 'Sair correndo pela rua para despistar!',
      tag: '🏃 Susto • -25 Energia • -15% Água • +15m',
      fn: () => {
        this.player.stamina = Math.max(5, this.player.stamina - 25);
        this.player.hydration = Math.max(5, this.player.hydration - 15);
        this.timeMinutes += 15;
        dog.cooldownUntil = this.timeMinutes + 30;
        window.sfx.warn();
        this.toast(`😮‍💨 Que susto! Você correu de ${dog.name}!`, 'warn');
        this.closeOverlays();
      }
    });

    opts.forEach(o => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span>${o.text}</span><span class="choice-tag">${o.tag}</span>`;
      btn.addEventListener('click', o.fn);
      choicesEl.appendChild(btn);
    });
  }

  interactWithCat(cat) {
    window.sfx.meow(false);
    cat.emote = 'heart';
    cat.emoteTimer = 2.5;

    const isCalmedScaredy = cat.personality === 'medroso' && cat.calmedUntil > this.timeMinutes;
    const treats = this.inventory.find(i => i.id === 'treats');
    const hasTreats = treats && treats.count > 0;

    this.openDialogueShell(
      'CAT',
      cat,
      'Mascote da Comunidade • Gatinho da Vila Esperança',
      cat.name,
      isCalmedScaredy
        ? `<span class="badge amigo">🐱 Medroso (Confiante!)</span>`
        : `<span class="badge amigo">💖 Fofinho & Carinhoso</span>`,
      cat.pettedToday ? 100 : 80,
      cat.pettedToday ? 'Ronronando Feliz!' : 'Querendo Carinho!'
    );

    this.setDialogueText(
      isCalmedScaredy
        ? `Miau... ${cat.shortName} cheirou sua mão devagarinho e deixou você se aproximar! Agora ele parece confiar em você.`
        : `Miau~! ${cat.shortName} se esfregou na sua perna levantando o rabinho e fechando os olhos esperando um carinho! ${cat.desc}`
    );

    const noteEl = document.getElementById('dlg-clinical-note');
    noteEl.classList.remove('hidden');
    noteEl.textContent = cat.pettedToday
      ? 'Bem-Estar do ACS: Fazer carinho nos gatinhos do bairro sempre melhora o humor durante a caminhada!'
      : 'Bem-Estar do ACS: Uma pausa rápida para fazer carinho num gatinho fofinho recarrega +6 Energia!';

    const doPet = (msg) => {
      window.sfx.purr();
      cat.emote = 'heart';
      cat.emoteTimer = 3.8;
      this.setPlayerEmote('heart', 2.8);
      if (!cat.pettedToday) {
        cat.pettedToday = true;
        this.player.stamina = Math.min(100, this.player.stamina + 6);
        this.toast(`🐱 ${msg} (+6 Energia!)`, 'success');
      } else {
        this.toast(`🐱 ${msg}`, 'success');
      }
      this.closeOverlays();
      this.updateHUD();
    };

    const choicesEl = document.getElementById('dlg-choices');
    const opts = [
      {
        text: `Fazer carinho atrás das orelhinhas de ${cat.shortName}.`,
        tag: cat.pettedToday ? '💖 Ronrona feliz' : '💖 Ronrona feliz • +6 Energia',
        fn: () => doPet(`${cat.shortName} ronronou bem alto com seu carinho!`)
      },
      {
        text: `Coçar o queixinho bem devagar.`,
        tag: cat.pettedToday ? '🐾 Muito fofinho' : '🐾 Muito fofinho • +6 Energia',
        fn: () => doPet(`${cat.shortName} fechou os olhinhos e amassou pãozinho!`)
      }
    ];

    if (hasTreats) {
      opts.push({
        text: `Oferecer um petisco (${treats.count} restantes) e fazer cafuné.`,
        tag: '🦴 +10 Energia • Muito Amor',
        fn: () => {
          treats.count--;
          cat.pettedToday = true;
          cat.calmedUntil = Math.max(cat.calmedUntil, this.timeMinutes + 180);
          this.player.stamina = Math.min(100, this.player.stamina + 10);
          window.sfx.purr();
          window.sfx.success();
          cat.emote = 'heart';
          cat.emoteTimer = 4.2;
          this.setPlayerEmote('heart', 3.0);
          this.toast(`🐱 ${cat.shortName} amou o petisco e o cafuné! (+10 Energia!)`, 'success');
          this.closeOverlays();
          this.renderHotbar();
          this.updateHUD();
        }
      });
    }

    opts.push({
      text: 'Dar um sorrisinho e seguir a caminhada.',
      tag: '👋 Até logo, gatinho!',
      fn: () => this.closeOverlays()
    });

    opts.forEach(o => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span>${o.text}</span><span class="choice-tag">${o.tag}</span>`;
      btn.addEventListener('click', o.fn);
      choicesEl.appendChild(btn);
    });
  }

  openUBSModal() {
    this.openDialogueShell(
      'UBS',
      null,
      'Unidade Básica de Saúde • Equipe Saúde da Família',
      'Enfª Marina (UBS)',
      `<span class="badge amigo">💧 Bebedouro</span><span class="badge prioritario">📊 e-SUS</span>`,
      Math.min(100, Math.round((this.weeklyVisits / this.weeklyGoal) * 100)),
      `Semana: ${this.weeklyVisits}/${this.weeklyGoal}`
    );

    const dayData = this.getCurrentDayData();
    const bonus = this.narrative.evaluateBonusGoal(this.dayIndex);
    this.setDialogueText(
      `“Olá, Agente! Semana ${this.weekNumber} (${dayData.name}): ${dayData.title}. Aqui na UBS você pode reabastecer sua garrafa d'água, pegar insumos ou sincronizar a produção semanal no e-SUS.”`
    );

    const noteEl = document.getElementById('dlg-clinical-note');
    noteEl.classList.remove('hidden');
    noteEl.innerHTML = `Semana ${this.weekNumber}: <strong>${this.weeklyVisits}/${this.weeklyGoal}</strong> visitas (${this.formatClock(this.timeMinutes)}) • Objetivo Bônus: ${bonus.met ? '✅' : '🎯'} ${bonus.progress}`;

    const choicesEl = document.getElementById('dlg-choices');
    [
      {
        text: 'Reabastecer Garrafa d\'Água, Protetor, Petiscos e descansar 15 min no ar-condicionado.',
        tag: '💧 100% Água • ⚡ +35 Energia • 🎒 Mochila Cheia',
        fn: () => {
          this.player.hydration = 100;
          this.player.stamina = Math.min(100, this.player.stamina + 35);
          this.timeMinutes += 15;
          this.inventory.forEach(i => { i.count = i.maxCount; });
          this.setPlayerEmote('water', 2.4);
          window.sfx.success();
          this.toast('🏥 Mochila reabastecida e energias renovadas na UBS!', 'success');
          this.renderHotbar();
          this.updateHUD();
          this.navigation.resolveObjective();
          this.navigation.updateTrackerUI();
          this.saveProgress();
          this.closeOverlays();
        }
      },
      {
        text: `Sincronizar Tablet e-SUS e Encerrar o Dia ${this.dayIndex + 1} (${this.dailyVisits}/${this.dailyGoal} visitas).`,
        tag: this.dailyVisits >= this.dailyGoal ? '✅ Meta Cumprida!' : '⚠️ Fechar Turno',
        fn: () => {
          this.closeOverlays();
          this.endDay('UBS_SUBMIT');
        }
      },
      {
        text: 'Voltar para o território agora.',
        tag: '🚶 Continuar Rota',
        fn: () => this.closeOverlays()
      }
    ].forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span>${a.text}</span><span class="choice-tag">${a.tag}</span>`;
      btn.addEventListener('click', a.fn);
      choicesEl.appendChild(btn);
    });
  }

  visitHouse(fam) {
    window.sfx.knock();
    const badgeClass = fam.archetype.toLowerCase();
    const bondLabel = fam.bond >= 80 ? 'Vínculo Forte' : fam.bond >= 55 ? 'Confiante' : fam.bond >= 35 ? 'Em Construção' : 'Desconfiado';

    this.openDialogueShell(
      'FAMILY',
      fam,
      `${fam.code} • ${fam.condition} • ${fam.risk}`,
      fam.name,
      `<span class="badge ${badgeClass}">${fam.archetypeLabel}</span><span class="badge">⏰ ${fam.knownSchedule ? fam.scheduleText : 'Horário ???'}</span>`,
      fam.bond,
      `${fam.bond}% (${bondLabel})`
    );

    const noteEl = document.getElementById('dlg-clinical-note');
    const choicesEl = document.getElementById('dlg-choices');

    // Already visited today
    if (this.visitedToday.has(fam.id)) {
      this.setDialogueText(
        fam.archetype === 'AMIGO'
          ? '“Voltou pra tomar mais um copo d\'água fresca na sombra, meu anjo? Minha porta está sempre aberta!”'
          : '“Oi, agente! Já conversamos hoje e você anotou tudo no tablet. Até a próxima visita!”'
      );
      noteEl.classList.remove('hidden');
      noteEl.textContent = 'Visita domiciliar já registrada no e-SUS hoje.';

      if (fam.archetype === 'AMIGO') {
        const btnDrink = document.createElement('button');
        btnDrink.className = 'choice-btn';
        btnDrink.innerHTML = `<span>Beber água gelada na varanda de ${fam.name}.</span><span class="choice-tag">💧 +30 Água • ⚡ +15 Energia (+10m)</span>`;
        btnDrink.addEventListener('click', () => {
          this.player.hydration = Math.min(100, this.player.hydration + 30);
          this.player.stamina = Math.min(100, this.player.stamina + 15);
          const w = this.inventory.find(i => i.id === 'water');
          if (w) w.count = Math.min(w.maxCount, w.count + 1);
          this.timeMinutes += 10;
          this.setPlayerEmote('water', 2.4);
          fam.emote = 'heart';
          fam.emoteTimer = 2.6;
          window.sfx.item();
          this.toast(`💧 ${fam.name} encheu seu copo e sua garrafa!`, 'success');
          this.renderHotbar();
          this.updateHUD();
          this.navigation.resolveObjective();
          this.navigation.updateTrackerUI();
          this.saveProgress();
          this.closeOverlays();
        });
        choicesEl.appendChild(btnDrink);
      }

      const btnLeave = document.createElement('button');
      btnLeave.className = 'choice-btn';
      btnLeave.innerHTML = '<span>Despedir-se e seguir pela rua.</span><span class="choice-tag">Continuar</span>';
      btnLeave.addEventListener('click', () => this.closeOverlays());
      choicesEl.appendChild(btnLeave);
      return;
    }

    // Nobody is home!
    if (!this.isFamilyAtHome(fam)) {
      this.knockedAwayToday.add(fam.id);
      if (!fam.knownSchedule) {
        fam.knownSchedule = true;
        this.schedulesDiscoveredCount++;
        this.unreadNotifs++;
      }

      this.setDialogueText(
        `Clap, clap! Você bateu palmas no portão da ${fam.code}, mas não há ninguém em casa agora (${this.formatClock(this.timeMinutes)}). Um vizinho avisou o horário em que a família costuma estar!`
      );
      noteEl.classList.remove('hidden');
      noteEl.innerHTML = `📌 <strong>Horário salvo no Tablet e-SUS [TAB]:</strong> ${fam.scheduleText} — <em>${fam.neighborClue}</em>`;

      const btnOk = document.createElement('button');
      btnOk.className = 'choice-btn';
      btnOk.innerHTML = '<span>Anotar horário no Tablet e voltar na hora certa (+8 min).</span><span class="choice-tag">📓 Horário Memorizado</span>';
      btnOk.addEventListener('click', () => {
        this.timeMinutes += 8;
        this.toast(`⏰ Horário da ${fam.code} registrado no Tablet e-SUS!`, 'info');
        this.updateHUD();
        this.closeOverlays();
      });
      choicesEl.appendChild(btnOk);
      return;
    }

    // Family is at home!
    if (!fam.knownSchedule) {
      fam.knownSchedule = true;
      this.schedulesDiscoveredCount++;
    }

    // Resolve visit dialogue through DialogueResolver (Quest > Reaction > Chapter/Bond > Legacy/Pilot)
    const graph = this.dialogueResolver
      ? this.dialogueResolver.resolveFamilyVisitGraph(fam)
      : (() => {
          const pilotFlag = `pilot_${fam.id.toLowerCase()}_seen`;
          const pilotGraph = (this.weekNumber === 1 && !this.narrative.flags[pilotFlag])
            ? this.dialogue.getPilotGraph(fam.id)
            : null;
          if (pilotGraph) this.narrative.flags[pilotFlag] = true;
          return pilotGraph || this.dialogue.adaptLegacyDialogue(this.narrative.getDialogueForFamily(fam, this.dayOfWeek));
        })();

    this.dialogue.startGraph({
      entityType: 'FAMILY',
      entityData: fam,
      entityId: fam.id,
      tag: `${fam.code} • ${fam.condition} • ${fam.risk}`,
      name: fam.name,
      badgesHtml: `<span class="badge ${badgeClass}">${fam.archetypeLabel}</span><span class="badge">⏰ ${fam.knownSchedule ? fam.scheduleText : 'Horário ???'}</span>`,
      bondPct: fam.bond,
      bondText: `${fam.bond}% (${bondLabel})`,
      graph,
      onFinish: (choice) => this.resolveVisitChoice(fam, choice)
    });
  }

  resolveVisitChoice(fam, choice) {
    this.timeMinutes += 20;
    const ok = choice.type !== 'AUTHORITARIAN';
    let bondDelta = choice.bondDelta || 0;
    let relFeedback = '';

    if (this.relationships) {
      const preRec = this.relationships.getContextualReceptivity(fam.id);
      const relRes = this.relationships.recordInteraction(fam.id, choice, ok);
      if (ok && (fam.stubbornness || 0) >= 60 && preRec < 35 && !relRes.matchedPreferred && bondDelta > 0) {
        bondDelta = Math.max(4, Math.round(bondDelta * 0.6));
        relFeedback = ' • Resistência alta limitou o avanço (tente ajustar a abordagem no Caderno [J])';
      } else if (relRes.matchedPreferred && ok) {
        bondDelta += relRes.bondBonus;
        fam.stubbornness = Math.max(0, (fam.stubbornness || 0) - 5);
        relFeedback = ` • Estilo certeiro (${this.relationships.getStyleMeta(relRes.style).short})!`;
      } else if (relRes.matchedAverse && ok) {
        bondDelta = Math.max(2, bondDelta + relRes.bondBonus);
        relFeedback = ' • Morador preferiria outra abordagem';
      }
    }

    fam.bond = Math.max(5, Math.min(100, fam.bond + bondDelta));
    if (choice.stubbornDelta) fam.stubbornness = Math.max(0, fam.stubbornness + choice.stubbornDelta);
    if (choice.staminaDelta) this.player.stamina = Math.min(100, this.player.stamina + choice.staminaDelta);
    if (choice.hydrationDelta) {
      this.player.hydration = Math.min(100, this.player.hydration + choice.hydrationDelta);
      const w = this.inventory.find(i => i.id === 'water');
      if (w) w.count = Math.min(w.maxCount, w.count + 1);
    }

    const revealed = [];
    if (choice.revealNeighbors) {
      choice.revealNeighbors.forEach(nid => {
        const n = this.families.find(f => f.id === nid);
        if (n && !n.knownSchedule) {
          n.knownSchedule = true;
          this.schedulesDiscoveredCount++;
          this.unreadNotifs++;
          revealed.push(n.code);
        }
      });
    }

    this.narrative.recordVisit(fam, choice, ok);
    if (ok && choice.flag && this.storyState) {
      this.storyState.setFlag(choice.flag, true);
    }
    if (ok) {
      this.visitedToday.add(fam.id);
      this.visitedThisWeek.add(fam.id);
      this.dailyVisits++;
      this.weeklyVisits++;
      fam.emote = 'heart';
      fam.emoteTimer = 4.0;
      this.setPlayerEmote('heart', 2.4);
      window.sfx.bondUp();
    } else {
      fam.emote = 'anger';
      fam.emoteTimer = 3.5;
      window.sfx.warn();
    }

    this.events.emit('visit:completed', {
      familyId: fam.id,
      choiceType: choice.type,
      bond: fam.bond,
      ok
    });

    // Refresh portrait & hearts dynamically
    window.pixelArt.drawPortraitToCanvas(document.getElementById('dlg-portrait-canvas'), 'FAMILY', fam);
    document.getElementById('dlg-hearts').textContent = this.renderHearts(fam.bond);
    const bondLabel = fam.bond >= 80 ? 'Vínculo Forte' : fam.bond >= 55 ? 'Confiante' : fam.bond >= 35 ? 'Em Construção' : 'Desconfiado';
    document.getElementById('dlg-bond-val').textContent = `${fam.bond}% (${bondLabel})`;

    this.setDialogueText(choice.reply);

    const noteEl = document.getElementById('dlg-clinical-note');
    if (ok) {
      const extra = revealed.length > 0 ? ` • Horários descobertos no Tablet: ${revealed.join(', ')}!` : '';
      noteEl.innerHTML = `✅ <strong>Visita registrada no e-SUS!</strong> (Semana: ${this.weeklyVisits}/${this.weeklyGoal} • Vínculo: ${fam.bond}%)${extra}${relFeedback}`;
    } else {
      noteEl.innerHTML = '⚠️ <strong>Resistência aumentou!</strong> O morador encerrou a conversa. Volte outro dia com escuta acolhedora!';
    }

    const choicesEl = document.getElementById('dlg-choices');
    choicesEl.innerHTML = '';
    const btnDone = document.createElement('button');
    btnDone.className = 'choice-btn';
    btnDone.innerHTML = '<span>Concluir registro no Tablet e continuar caminhada (+20 min).</span><span class="choice-tag">Prosseguir</span>';
    btnDone.addEventListener('click', () => {
      this.renderHotbar();
      this.updateHUD();
      this.navigation.resolveObjective();
      this.navigation.updateTrackerUI();
      this.navigation.drawMinimap();
      this.saveProgress();
      this.closeOverlays();
      if (this.weeklyVisits === this.weeklyGoal) {
        window.sfx.success();
        this.toast(`🎉 META SEMANAL DE ${this.weeklyGoal} VISITAS ATINGIDA! Passe na UBS para sincronizar o e-SUS quando puder!`, 'success');
      }
    });
    choicesEl.appendChild(btnDone);
  }

  // ==========================================================================
  // 8. HUD, TABLET e-SUS (TAB), TACTICAL MAP (M) & DAY SUMMARY
  // ==========================================================================
  updateHUD() {
    const d = this.getCurrentDayData();
    const w = this.getCurrentWeather();

    document.getElementById('hud-day').textContent = `Sem. ${this.weekNumber} • ${d.shortName}`;
    document.getElementById('hud-clock').textContent = this.formatClock(this.timeMinutes);
    document.getElementById('hud-weather-img').src = window.pixelArt.icons[w];
    document.getElementById('hud-weather-label').textContent = this.getWeatherShortLabel(w);

    const ubsPill = document.getElementById('hud-ubs-status');
    if (ubsPill) {
      const open = this.isUBSOpen();
      ubsPill.className = `ubs-status-pill ${open ? 'open' : 'closed'}`;
      if (open) {
        ubsPill.textContent = '🏥 UBS Aberta (até 18h)';
      } else if (this.dayOfWeek === 5) {
        ubsPill.textContent = '🌿 Sábado Livre (UBS Fechada)';
      } else if (this.timeMinutes < 8 * 60) {
        ubsPill.textContent = '🏥 UBS abre às 08h';
      } else {
        ubsPill.textContent = '🌙 Noite Livre (UBS Fechada)';
      }
    }

    document.getElementById('visits-text').textContent = `${this.weeklyVisits}/${this.weeklyGoal}`;
    document.getElementById('bond-text').textContent = `${this.getCommunityBondAverage()}%`;

    const st = Math.round(this.player.stamina);
    const stBar = document.getElementById('stamina-bar');
    stBar.style.height = `${st}%`;
    stBar.classList.toggle('low', st < 28);
    document.getElementById('stamina-text').textContent = st;

    const hy = Math.round(this.player.hydration);
    const hyBar = document.getElementById('hydration-bar');
    hyBar.style.height = `${hy}%`;
    hyBar.classList.toggle('low', hy < 28);
    document.getElementById('hydration-text').textContent = hy;

    const badge = document.getElementById('notif-badge');
    badge.textContent = this.unreadNotifs;
    badge.classList.toggle('zero', this.unreadNotifs <= 0);
    this.updateStoryHudPill();
  }

  updateStoryHudPill() {
    const chEl = document.getElementById('story-hud-chapter');
    const stepEl = document.getElementById('story-hud-step');
    if (!chEl || !stepEl || !this.quests) return;

    const meta = this.quests.getChapterMeta();
    const tracked = this.quests.getPrimaryTrackedStep();
    chEl.textContent = `📖 ${meta.kicker}: ${meta.title}`;
    if (tracked && tracked.currentStep) {
      stepEl.textContent = `📌 ${tracked.currentStep.label}`;
    } else {
      stepEl.textContent = `✨ ${meta.desc}`;
    }
  }

  showChapterBanner(chapterNum = null) {
    const banner = document.getElementById('chapter-banner');
    if (!banner || !this.quests) return;
    const meta = this.quests.getChapterMeta(chapterNum);
    const kickerEl = document.getElementById('chapter-banner-kicker');
    const titleEl = document.getElementById('chapter-banner-title');
    const subEl = document.getElementById('chapter-banner-sub');

    if (kickerEl) kickerEl.textContent = `📖 ${meta.kicker}`;
    if (titleEl) titleEl.textContent = meta.title;
    if (subEl) subEl.textContent = meta.desc;
    banner.classList.remove('hidden');

    if (this._chapterBannerTimer) {
      clearTimeout(this._chapterBannerTimer);
    }
    this._chapterBannerTimer = setTimeout(() => {
      banner.classList.add('hidden');
    }, 4500);
  }

  toggleTablet(forceOpen = false) {
    const overlay = document.getElementById('tablet-overlay');
    const isHidden = overlay.classList.contains('hidden');
    this.closeOverlays();
    if (isHidden || forceOpen) {
      this.paused = true;
      this.input.clear();
      this.navigation.clearWalkTarget();
      this.unreadNotifs = 0;
      this.updateHUD();
      overlay.classList.remove('hidden');
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === this.activeTabletTab);
      });
      this.renderTabletContent();
    }
  }

  renderTabletContent() {
    const c = document.getElementById('tablet-content');
    const dayData = this.getCurrentDayData();

    if (this.activeTabletTab === 'mission') {
      const pct = Math.min(100, Math.round((this.weeklyVisits / this.weeklyGoal) * 100));
      const prioDone = this.getWeeklyPrioritiesCompletedCount();
      const prioHtml = this.weeklyPriorities.map(id => {
        const f = this.families.find(x => x.id === id);
        if (!f) return '';
        const done = this.visitedThisWeek.has(id);
        return `${done ? '✅' : '⭐'} <b>${f.code}</b> — ${f.name} (${f.risk})`;
      }).filter(Boolean).join('<br>');

      c.innerHTML = `
        <div class="feature-item" style="margin-bottom:14px">
          <strong style="font-size:17px">📋 Semana ${this.weekNumber} • ${dayData.name} — ${dayData.weekTag || dayData.title}</strong>
          <p style="margin-top:6px;font-size:14px">${dayData.missionDesc}</p>
          <p style="margin-top:8px;color:#166534;font-weight:800">⭐ Prioridades da Semana (${prioDone}/${this.weeklyPriorities.length}):</p>
          <div style="margin-top:4px;font-size:13px">${prioHtml}</div>
        </div>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-num">${this.weeklyVisits} / ${this.weeklyGoal}</div>
            <div class="kpi-label">Meta Semanal (${pct}%)</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-num">${this.getCommunityBondAverage()}%</div>
            <div class="kpi-label">Vínculo da Microárea</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-num">${this.families.filter(f => f.knownSchedule).length} / 15</div>
            <div class="kpi-label">Horários Mapeados</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-num">${this.dengueClearedCount} / 4</div>
            <div class="kpi-label">Focos Eliminados</div>
          </div>
        </div>
        <div class="feature-grid">
          <div class="feature-item">
            <strong>⏰ Quem está em casa AGORA (${this.formatClock(this.timeMinutes)})?</strong>
            ${this.families
              .filter(f => !this.visitedToday.has(f.id) && f.knownSchedule && this.isFamilyAtHome(f))
              .map(f => `${this.weeklyPriorities.includes(f.id) ? '⭐' : '•'} <b>${f.code}</b> — ${f.name}`).join('<br>') || '<em>Nenhuma casa conhecida pendente em casa neste exato minuto! Descanse num banco (1h) ou explore horários desconhecidos!</em>'}
          </div>
          <div class="feature-item">
            <strong>⚙️ Preferências & Controles</strong>
            • <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / Setas: Andar • <kbd>E</kbd>: Interagir / Descansar em Bancos<br>
            • <strong>UBS:</strong> Seg–Sex (08h–18h) • <strong>Casa do ACS:</strong> Dormir após 17h<br>
            <button id="btn-toggle-dlg-hints" class="pin-btn" style="margin-top:8px">
              ${this.dialogue.showHints ? '👁️ Dicas Pedagógicas nos Diálogos: LIGADAS' : '💬 Dicas Pedagógicas nos Diálogos: DESLIGADAS (Imersivo)'}
            </button>
          </div>
        </div>
      `;

      const hintBtn = document.getElementById('btn-toggle-dlg-hints');
      if (hintBtn) {
        hintBtn.addEventListener('click', () => {
          this.dialogue.showHints = !this.dialogue.showHints;
          this.saveProgress();
          this.renderTabletContent();
        });
      }
    } else if (this.activeTabletTab === 'story') {
      const chMeta = this.quests ? this.quests.getChapterMeta() : { title: 'Prólogo', desc: '' };
      const dom = this.storyState ? this.storyState.getDominantPosture() : { axis: 'acolhimento', value: 0 };
      const postureLabels = {
        acolhimento: '💛 Escuta Acolhedora',
        articulacao: '🤝 Articulação Comunitária',
        firmeza: '🛡️ Firmeza Protetora',
        burocracia: '📋 Rigor de Protocolo'
      };
      const activeQuests = this.quests ? this.quests.getActiveQuestsList() : [];
      const doneQuests = this.quests ? this.quests.getCompletedQuestsList() : [];

      const activeHtml = activeQuests.map((q, idx) => `
        <div class="feature-item" style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <strong>📌 ${q.def.title} (Etapa ${q.stepIndex + 1}/${q.totalSteps})</strong>
            ${q.currentStep && q.currentStep.targetPin ? `<button class="pin-btn" data-quest-pin="${idx}">📍 Marcar Rota</button>` : ''}
          </div>
          <p style="margin:4px 0;font-size:13px">${q.currentStep ? q.currentStep.label : q.def.summary}</p>
          ${q.currentStep && q.currentStep.hint ? `<small style="color:#63432b">💡 ${q.currentStep.hint}</small>` : ''}
        </div>
      `).join('') || '<em>Nenhuma missão ativa no momento. Explore o bairro e converse com a equipe!</em>';

      const doneHtml = doneQuests.map(q => `✅ <strong>${q.title}</strong>`).join('<br>') || '<em>Nenhuma missão concluída ainda.</em>';

      const npcEntries = [
        ...(this.ubsInterior ? this.ubsInterior.staff : []),
        ...(this.communitySpaces ? Object.values(this.communitySpaces.npcs) : [])
      ];
      const npcBondsHtml = npcEntries.map(npc => {
        const b = this.storyState ? this.storyState.getNpcBond(npc.id) : 50;
        const lbl = this.storyState ? this.storyState.getBondLabel(b) : 'Equipe';
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px dashed #d6b98d;font-size:12.5px">
            <span><strong>${npc.name}</strong> <small>(${npc.role})</small></span>
            <span>${this.renderHearts(b)} <strong>${b}%</strong> <small>(${lbl})</small></span>
          </div>
        `;
      }).join('');

      const epilogueBanner = (this.storyState && this.storyState.chapter >= 5 && this.endingAssembler)
        ? (() => {
            const endData = this.endingAssembler.assemble();
            return `
              <div class="feature-item" style="margin-bottom:12px;background:#fefce8;border:2px solid #eab308">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
                  <strong>🏆 ${endData.overallTitle}</strong>
                  <button id="btn-reopen-ending" class="pin-btn">📜 Rever Desfecho Completo</button>
                </div>
                <p style="margin-top:4px;font-size:13px">${endData.subtitle} Você está no <strong>Modo Livre (Epílogo)</strong> — continue visitando famílias, cultivando a Horta e completando histórias secundárias!</p>
              </div>
            `;
          })()
        : '';

      c.innerHTML = `
        ${epilogueBanner}
        <div class="feature-item" style="margin-bottom:12px">
          <strong style="font-size:17px">📖 ${chMeta.title}</strong>
          <p style="margin-top:4px;font-size:13.5px">${chMeta.desc}</p>
          <p style="margin-top:6px;font-size:12.5px;color:#035388">
            <strong>Estilo de Atuação Predominante:</strong> ${postureLabels[dom.axis] || '💛 Escuta Acolhedora'}
          </p>
        </div>
        <div class="feature-grid">
          <div class="feature-item">
            <strong>🗺️ Missões em Andamento</strong>
            <div style="margin-top:6px">${activeHtml}</div>
            <strong style="display:block;margin-top:10px">🏁 Missões Concluídas</strong>
            <div style="margin-top:4px;font-size:12.5px">${doneHtml}</div>
          </div>
          <div class="feature-item">
            <strong>🤝 Vínculos com Equipe UBS & Comunidade</strong>
            <div style="margin-top:6px;max-height:260px;overflow-y:auto">${npcBondsHtml}</div>
          </div>
        </div>
      `;

      c.querySelectorAll('[data-quest-pin]').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = activeQuests[Number(btn.dataset.questPin)];
          if (item && item.currentStep && item.currentStep.targetPin) {
            this.navigation.setPin(item.currentStep.targetPin);
            this.toast(`📍 Rota marcada para missão: ${item.def.title}`, 'info');
            this.closeOverlays();
          }
        });
      });

      const reopenEndBtn = document.getElementById('btn-reopen-ending');
      if (reopenEndBtn) {
        reopenEndBtn.addEventListener('click', () => {
          this.showCampaignEndingModal();
        });
      }
    } else if (this.activeTabletTab === 'families') {
      const rows = this.families.map(f => {
        const visited = this.visitedToday.has(f.id);
        const loc = this.schedule ? this.schedule.getFamilyLocation(f) : { type: this.isFamilyAtHome(f) ? 'HOME' : 'AWAY', label: '🟢 Em Casa' };
        const statusBadge = visited
          ? '<span class="badge amigo">✅ Visitada</span>'
          : !f.knownSchedule
            ? '<span class="badge trabalhador">❓ Descobrir</span>'
            : loc.type === 'HOME'
              ? '<span class="badge amigo">🟢 Em Casa</span>'
              : loc.type === 'AWAY'
                ? '<span class="badge teimoso">🔴 Ausente</span>'
                : `<span class="badge prioritario">${loc.label}</span>`;

        return `
          <tr>
            <td><strong>${f.code}</strong></td>
            <td><strong>${f.name}</strong><br><small style="color:#63432b">${f.archetypeLabel}</small></td>
            <td>${f.condition}<br><small style="color:#035388">${f.risk}</small></td>
            <td><strong>${f.knownSchedule ? f.scheduleText : '??? (Bata no portão ou pergunte aos amigos)'}</strong></td>
            <td>${statusBadge}</td>
            <td>
              <strong>${f.bond}%</strong> ${this.renderHearts(f.bond)}
              <div class="mini-progress"><div class="mini-progress-fill" style="width:${f.bond}%"></div></div>
            </td>
            <td>
              ${visited ? '<small style="color:#166534;font-weight:800">Concluída</small>' : `<button class="pin-btn" data-pin-house="${f.id}">📍 Rota</button>`}
            </td>
          </tr>
        `;
      }).join('');

      c.innerHTML = `
        <table class="families-table">
          <thead>
            <tr>
              <th>Casa</th>
              <th>Família / Perfil</th>
              <th>Condição de Saúde</th>
              <th>Horário em Casa</th>
              <th>Agora (${this.formatClock(this.timeMinutes)})</th>
              <th>Vínculo</th>
              <th>GPS</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;

      c.querySelectorAll('[data-pin-house]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.pinHouse;
          const fam = this.families.find(f => f.id === id);
          if (fam) {
            this.navigation.setPin({ type: 'HOUSE', id: fam.id });
            this.toast(`📍 Rota marcada: ${fam.code} (${fam.name})!`, 'info');
            this.closeOverlays();
          }
        });
      });
    } else {
      const stubbornWon = this.families.filter(f => f.archetype === 'TEIMOSO' && f.bond >= 55).length;
      c.innerHTML = `
        <div class="feature-grid">
          <div class="feature-item">
            <strong>🩺 Pacientes Teimosos Conquistados: ${stubbornWon} / 4</strong>
            Seu Tião (Casa 04), Dona Neide (Casa 05), Dr. Cláudio (Casa 10) e Seu Tonho (Casa 14) respondem muito melhor à escuta qualificada e analogias culturais do que a broncas autoritárias.
          </div>
          <div class="feature-item">
            <strong>💚 Moradores Amigos (Pontos de Apoio)</strong>
            Dona Dulce (Casa 01), Seu Raimundo (Casa 07) e Dona Lourdes (Casa 12) estão sempre em casa (08h–18h), reabastecem sua água/energia e revelam horários dos vizinhos trabalhadores!
          </div>
          <div class="feature-item">
            <strong>☀️ Sobrevivendo ao Sol e à Chuva</strong>
            Atravesse a <em>Estrada do Sol</em> protegido com Protetor Solar (<kbd>2</kbd>) e Guarda-Sol/Capa (<kbd>3</kbd>). Parar sob a copa das árvores recupera energia rapidamente!
          </div>
          <div class="feature-item">
            <strong>🐕 Cachorros da Microárea</strong>
            Trovão (Caramelo), Brutus (Fila) e Fumaça (Pinscher) patrulham as esquinas. Um Biscoito Canino (<kbd>4</kbd>) deixa o cão manso por 2h30!
          </div>
          <div class="feature-item">
            <strong>🐱 Gatinhos do Bairro</strong>
            Mingau, Paçoca e Bolinha são fofinhos e adoram receber carinho (<kbd>E</kbd>) — recuperando energia! Já Sombra e Frajola são medrosos e saem correndo, mas um petisco (<kbd>4</kbd>) conquista a confiança deles!
          </div>
        </div>
      `;
    }
  }

  toggleMap() {
    const overlay = document.getElementById('map-overlay');
    const isHidden = overlay.classList.contains('hidden');
    this.closeOverlays();
    if (isHidden) {
      this.paused = true;
      this.input.clear();
      this.navigation.clearWalkTarget();
      overlay.classList.remove('hidden');
      this.drawTacticalMap();
    }
  }

  drawTacticalMap() {
    const c = document.getElementById('tactical-map-canvas');
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const sx = c.width / this.worldWidth;
    const sy = c.height / this.worldHeight;

    // Draw scaled miniature of the actual baked pixel-art terrain!
    ctx.drawImage(this.terrainCanvas, 0, 0, c.width, c.height);

    // UBS highlight
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(this.ubs.x * sx, this.ubs.y * sy, this.ubs.w * sx, this.ubs.h * sy);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.ubs.x * sx, this.ubs.y * sy, this.ubs.w * sx, this.ubs.h * sy);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Trebuchet MS';
    ctx.fillText('UBS', (this.ubs.x + 80) * sx, (this.ubs.y + 125) * sy);

    // Protagonist's Home highlight (Casa do ACS)
    if (this.playerHome) {
      ctx.fillStyle = '#d97706';
      ctx.fillRect((this.playerHome.x - 52) * sx, (this.playerHome.y - 95) * sy, 104 * sx, 76 * sy);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.strokeRect((this.playerHome.x - 52) * sx, (this.playerHome.y - 95) * sy, 104 * sx, 76 * sy);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Consolas';
      ctx.fillText('CASA', (this.playerHome.x - 36) * sx, (this.playerHome.y - 45) * sy);
    }

    // Phase 2 Community Hubs on Tactical Map
    if (this.vendinha) {
      ctx.fillStyle = '#ea580c';
      ctx.fillRect((this.vendinha.x - 52) * sx, (this.vendinha.y - 95) * sy, 104 * sx, 76 * sy);
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 2;
      ctx.strokeRect((this.vendinha.x - 52) * sx, (this.vendinha.y - 95) * sy, 104 * sx, 76 * sy);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Consolas';
      ctx.fillText('VENDINHA', (this.vendinha.x - 42) * sx, (this.vendinha.y - 45) * sy);
    }
    if (this.pracinha) {
      ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';
      ctx.fillRect(this.pracinha.c1 * 32 * sx, this.pracinha.r1 * 32 * sy, (this.pracinha.c2 - this.pracinha.c1) * 32 * sx, (this.pracinha.r2 - this.pracinha.r1) * 32 * sy);
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.pracinha.c1 * 32 * sx, this.pracinha.r1 * 32 * sy, (this.pracinha.c2 - this.pracinha.c1) * 32 * sx, (this.pracinha.r2 - this.pracinha.r1) * 32 * sy);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Consolas';
      ctx.fillText('PRACINHA', (this.pracinha.x - 55) * sx, this.pracinha.y * sy);
    }
    if (this.associacao) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect((this.associacao.x - 52) * sx, (this.associacao.y - 95) * sy, 104 * sx, 76 * sy);
      ctx.strokeStyle = '#dcfce7';
      ctx.lineWidth = 2;
      ctx.strokeRect((this.associacao.x - 52) * sx, (this.associacao.y - 95) * sy, 104 * sx, 76 * sy);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Consolas';
      ctx.fillText('ASSOC.', (this.associacao.x - 36) * sx, (this.associacao.y - 45) * sy);
    }
    if (this.horta) {
      ctx.fillStyle = 'rgba(132, 204, 22, 0.42)';
      ctx.fillRect(this.horta.c1 * 32 * sx, this.horta.r1 * 32 * sy, (this.horta.c2 - this.horta.c1) * 32 * sx, (this.horta.r2 - this.horta.r1) * 32 * sy);
      ctx.strokeStyle = '#bef264';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.horta.c1 * 32 * sx, this.horta.r1 * 32 * sy, (this.horta.c2 - this.horta.c1) * 32 * sx, (this.horta.r2 - this.horta.r1) * 32 * sy);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Consolas';
      ctx.fillText('HORTA', (this.horta.x - 36) * sx, this.horta.y * sy);
    }
    if (this.campinho) {
      ctx.fillStyle = 'rgba(22, 163, 74, 0.45)';
      ctx.fillRect(this.campinho.c1 * 32 * sx, this.campinho.r1 * 32 * sy, (this.campinho.c2 - this.campinho.c1) * 32 * sx, (this.campinho.r2 - this.campinho.r1) * 32 * sy);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.campinho.c1 * 32 * sx, this.campinho.r1 * 32 * sy, (this.campinho.c2 - this.campinho.c1) * 32 * sx, (this.campinho.r2 - this.campinho.r1) * 32 * sy);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Consolas';
      ctx.fillText('CAMPINHO', (this.campinho.x - 65) * sx, this.campinho.y * sy);
    }
    if (this.mysteryHouse) {
      ctx.fillStyle = '#334155';
      ctx.fillRect((this.mysteryHouse.x - 52) * sx, (this.mysteryHouse.y - 95) * sy, 104 * sx, 76 * sy);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect((this.mysteryHouse.x - 52) * sx, (this.mysteryHouse.y - 95) * sy, 104 * sx, 76 * sy);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9px Consolas';
      ctx.fillText('???', (this.mysteryHouse.x - 20) * sx, (this.mysteryHouse.y - 45) * sy);
    }

    // Dogs zones
    this.dogs.forEach(d => {
      ctx.fillStyle = 'rgba(220, 38, 38, 0.30)';
      ctx.beginPath();
      ctx.arc(d.x * sx, d.y * sy, d.aggroRadius * sx, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(d.x * sx - 4, d.y * sy - 4, 8, 8);
    });

    // Cats markers
    this.cats.forEach(c => {
      ctx.fillStyle = c.personality === 'fofinho' ? '#f472b6' : '#c084fc';
      ctx.beginPath();
      ctx.arc(c.x * sx, c.y * sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b200f';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Dengue spots
    this.dengueSpots.forEach(s => {
      if (!s.cleared) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(s.x * sx - 4, s.y * sy - 4, 8, 8);
        ctx.strokeStyle = '#3b200f';
        ctx.strokeRect(s.x * sx - 4, s.y * sy - 4, 8, 8);
      }
    });

    // Houses markers
    this.families.forEach(f => {
      const visited = this.visitedToday.has(f.id);
      const atHome = this.isFamilyAtHome(f);
      ctx.fillStyle = visited ? '#38bdf8' : (!f.knownSchedule ? '#eab308' : (atHome ? '#22c55e' : '#64748b'));
      ctx.fillRect((f.x - 50) * sx, (f.y - 95) * sy, 100 * sx, 75 * sy);
      ctx.strokeStyle = '#3b200f';
      ctx.lineWidth = 2;
      ctx.strokeRect((f.x - 50) * sx, (f.y - 95) * sy, 100 * sx, 75 * sy);
      ctx.fillStyle = '#1e1b18';
      ctx.font = 'bold 9px Consolas';
      ctx.fillText(f.code.replace('Casa ', 'C'), (f.x - 32) * sx, (f.y - 45) * sy);
    });

    // Player pin
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(this.player.x * sx, this.player.y * sy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3b200f';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  updateMainMenuCamera(dt) {
    // Gentle scenic camera pan over Vila Esperança (UBS, stream bridge, Vendinha & houses)
    const maxCamX = Math.max(0, this.worldWidth - this.canvas.width);
    const maxCamY = Math.max(0, this.worldHeight - this.canvas.height);
    const centerX = window.ACSEngine.clamp(16 * this.TILE - this.canvas.width * 0.35, 0, maxCamX);
    const centerY = window.ACSEngine.clamp(21 * this.TILE - this.canvas.height * 0.45, 0, maxCamY);
    const panX = Math.sin(this.elapsedTime * 0.11) * Math.min(180, maxCamX * 0.25);
    const panY = Math.cos(this.elapsedTime * 0.08) * Math.min(85, maxCamY * 0.2);

    this.camera.x = window.ACSEngine.clamp(centerX + panX, 0, maxCamX);
    this.camera.y = window.ACSEngine.clamp(centerY + panY, 0, maxCamY);

    // Keep ambient leaves & cats gently alive on the title screen
    if (this.leafParticles) {
      for (const leaf of this.leafParticles) {
        leaf.x += leaf.vx * dt;
        leaf.y += leaf.vy * dt;
        if (leaf.x > this.worldWidth + 20 || leaf.y > this.worldHeight + 20) {
          Object.assign(leaf, this.spawnLeaf(false));
        }
      }
    }
  }

  closeOverlays() {
    document.getElementById('dialogue-overlay').classList.add('hidden');
    document.getElementById('tablet-overlay').classList.add('hidden');
    const notebookOverlay = document.getElementById('notebook-overlay');
    if (notebookOverlay) notebookOverlay.classList.add('hidden');
    const phoneOverlay = document.getElementById('phone-overlay');
    if (phoneOverlay) phoneOverlay.classList.add('hidden');
    document.getElementById('map-overlay').classList.add('hidden');
    document.getElementById('summary-overlay').classList.add('hidden');
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.input.clear();
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    this.paused = false;
    if (this.dialogue && typeof this.dialogue.clearSession === 'function') {
      this.dialogue.clearSession();
    }
    if (this.musicDirector) {
      this.musicDirector.setModalMode(null);
    }
  }

  // ==========================================================================
  // 8B. PROGRESS PERSISTENCE (SaveManager Schema v2 — Phase 1)
  // ==========================================================================
  saveProgress() {
    if (!this.saveManager) return false;
    return this.saveManager.save({
      weekNumber: this.weekNumber,
      dayOfWeek: this.dayOfWeek,
      dayIndex: this.dayOfWeek,
      timeMinutes: this.timeMinutes,
      weeklyVisits: this.weeklyVisits,
      dailyVisits: this.dailyVisits,
      visitedThisWeek: Array.from(this.visitedThisWeek),
      weeklyPriorities: this.weeklyPriorities.slice(),
      weeklyReportSubmitted: this.weeklyReportSubmitted,
      showDialogueHints: this.dialogue ? this.dialogue.showHints : false,
      currentLocation: this.currentLocation,
      visitedToday: Array.from(this.visitedToday),
      knockedAwayToday: Array.from(this.knockedAwayToday),
      dengueClearedCount: this.dengueClearedCount,
      schedulesDiscoveredCount: this.schedulesDiscoveredCount,
      player: {
        x: this.player.x,
        y: this.player.y,
        dir: this.player.dir,
        stamina: this.player.stamina,
        hydration: this.player.hydration,
        sunscreenTimer: this.player.sunscreenTimer,
        umbrellaOpen: this.player.umbrellaOpen
      },
      inventory: this.inventory.map(i => ({ id: i.id, count: i.count })),
      families: this.families.map(f => ({
        id: f.id,
        bond: f.bond,
        stubbornness: f.stubbornness,
        knownSchedule: f.knownSchedule
      })),
      dengueSpots: this.dengueSpots.map(s => ({ id: s.id, cleared: s.cleared })),
      narrative: this.narrative ? this.narrative.exportState() : null,
      storyState: this.storyState ? this.storyState.exportState() : null,
      relationships: this.relationships ? this.relationships.exportState() : null,
      investigation: this.investigation ? this.investigation.exportState() : null,
      notebook: this.notebook ? this.notebook.exportState() : null,
      ubsInterior: this.ubsInterior ? this.ubsInterior.exportState() : null,
      playerHome: this.playerHomeSystem ? this.playerHomeSystem.exportState() : null,
      phone: this.phone ? this.phone.exportState() : null,
      schedule: this.schedule ? this.schedule.exportState() : null,
      community: this.communitySpaces ? this.communitySpaces.exportState() : null
    });
  }

  loadProgress() {
    if (!this.saveManager) return false;
    const saved = this.saveManager.load();
    if (!saved) return false;

    this.weekNumber = Math.max(1, Number(saved.weekNumber) || 1);
    this.dayOfWeek = window.ACSEngine.clamp(saved.dayOfWeek ?? saved.dayIndex ?? 0, 0, window.ACS_DATA.days.length - 1);
    this.timeMinutes = window.ACSEngine.clamp(saved.timeMinutes || 7 * 60, 7 * 60, 22.4 * 60);
    this._lastHour = Math.floor(this.timeMinutes / 60);
    this.weeklyVisits = saved.weeklyVisits ?? saved.dailyVisits ?? 0;
    this.dailyVisits = saved.dailyVisits || 0;
    this.visitedThisWeek = new Set(saved.visitedThisWeek || saved.visitedToday || []);
    this.weeklyReportSubmitted = !!saved.weeklyReportSubmitted;
    if (Array.isArray(saved.weeklyPriorities) && saved.weeklyPriorities.length > 0) {
      this.weeklyPriorities = saved.weeklyPriorities.slice();
    } else {
      this.generateWeeklyPriorities();
    }
    if (this.dialogue) {
      this.dialogue.showHints = !!saved.showDialogueHints;
    }

    this.currentLocation = ['OVERWORLD', 'UBS_INTERIOR', 'ESF_ROOM', 'PLAYER_HOME', 'VENDINHA', 'ASSOCIACAO'].includes(saved.currentLocation)
      ? saved.currentLocation
      : 'PLAYER_HOME';
    this.visitedToday = new Set(saved.visitedToday || []);
    this.knockedAwayToday = new Set(saved.knockedAwayToday || []);
    this.dengueClearedCount = saved.dengueClearedCount || 0;
    this.schedulesDiscoveredCount = saved.schedulesDiscoveredCount || 0;

    if (saved.player) {
      const b = this.sceneManager.getBounds(this.currentLocation);
      this.player.x = window.ACSEngine.clamp(saved.player.x || b.minX, b.minX, b.maxX);
      this.player.y = window.ACSEngine.clamp(saved.player.y || b.minY, b.minY, b.maxY);
      this.player.dir = ['down', 'up', 'left', 'right'].includes(saved.player.dir) ? saved.player.dir : 'down';
      this.player.stamina = window.ACSEngine.clamp(saved.player.stamina ?? 100, 5, 100);
      this.player.hydration = window.ACSEngine.clamp(saved.player.hydration ?? 100, 5, 100);
      this.player.sunscreenTimer = Math.max(0, saved.player.sunscreenTimer || 0);
      this.player.umbrellaOpen = this.currentLocation === 'OVERWORLD' ? !!saved.player.umbrellaOpen : false;
    }

    if (Array.isArray(saved.inventory)) {
      saved.inventory.forEach(si => {
        const item = this.inventory.find(i => i.id === si.id);
        if (item) item.count = window.ACSEngine.clamp(si.count, 0, item.maxCount);
      });
    }

    if (Array.isArray(saved.families)) {
      saved.families.forEach(sf => {
        const fam = this.families.find(f => f.id === sf.id);
        if (fam) {
          fam.bond = window.ACSEngine.clamp(sf.bond, 5, 100);
          fam.stubbornness = Math.max(0, sf.stubbornness ?? fam.stubbornness);
          fam.knownSchedule = !!sf.knownSchedule;
        }
      });
    }

    if (Array.isArray(saved.dengueSpots)) {
      saved.dengueSpots.forEach(ss => {
        const spot = this.dengueSpots.find(s => s.id === ss.id);
        if (spot) spot.cleared = !!ss.cleared;
      });
    }

    if (saved.narrative && this.narrative) {
      this.narrative.importState(saved.narrative);
    }
    if (this.storyState) {
      this.storyState.importState(saved.storyState || null);
    }
    if (this.relationships) {
      this.relationships.importState(saved.relationships || null);
    }
    if (this.investigation) {
      this.investigation.importState(saved.investigation || null);
    }
    if (this.notebook) {
      this.notebook.importState(saved.notebook || null);
    }
    if (this.quests) {
      this.quests.ensureInitialQuest();
    }
    if (saved.ubsInterior && this.ubsInterior) {
      this.ubsInterior.importState(saved.ubsInterior);
    }
    if (saved.playerHome && this.playerHomeSystem) {
      this.playerHomeSystem.importState(saved.playerHome);
    }
    if (saved.phone && this.phone) {
      this.phone.importState(saved.phone);
    }
    if (saved.schedule && this.schedule) {
      this.schedule.importState(saved.schedule);
    }
    if (saved.community && this.communitySpaces) {
      this.communitySpaces.importState(saved.community);
    }

    this.sceneManager.snapCamera();
    this.renderHotbar();
    this.updateHUD();
    this.navigation.resolveObjective();
    this.navigation.updateTrackerUI();
    this.navigation.drawMinimap();
    return true;
  }

  showIntroModal() {
    this.inMainMenu = true;
    this.paused = true;
    this.input.clear();
    document.body.classList.add('main-menu-active');

    const menuOverlay = document.getElementById('main-menu-overlay');
    const summaryOverlay = document.getElementById('summary-overlay');
    if (summaryOverlay) summaryOverlay.classList.add('hidden');
    if (!menuOverlay) return;
    menuOverlay.classList.remove('hidden');

    const saved = this.saveManager ? this.saveManager.load() : null;
    const savedDay = saved ? (window.ACS_DATA.days[saved.dayOfWeek ?? saved.dayIndex ?? 0] || window.ACS_DATA.days[0]) : null;
    const savedWeek = saved ? (saved.weekNumber || 1) : 1;
    const savedVisits = saved ? (saved.weeklyVisits ?? saved.dailyVisits ?? 0) : 0;

    const btnContinue = menuOverlay.querySelector('[data-action="continue"]');
    const saveMeta = document.getElementById('menu-save-meta');
    if (btnContinue && saveMeta) {
      if (saved) {
        btnContinue.classList.remove('is-disabled');
        btnContinue.disabled = false;
        saveMeta.textContent = `Sem.${savedWeek} • ${savedDay.shortName} • ${savedVisits}/15`;
        saveMeta.classList.remove('hidden');
      } else {
        btnContinue.classList.add('is-disabled');
        btnContinue.disabled = true;
        saveMeta.classList.add('hidden');
      }
    }

    const buttons = Array.from(menuOverlay.querySelectorAll('.menu-item-btn'));
    const selectIndex = (idx) => {
      const safeIdx = ((idx % buttons.length) + buttons.length) % buttons.length;
      this._menuSelectedIndex = safeIdx;
      buttons.forEach((b, i) => b.classList.toggle('is-selected', i === safeIdx));
    };

    // Default highlight on Continuar if save exists, else Novo Jogo
    selectIndex(saved ? 1 : 0);

    const exitMainMenu = () => {
      this.inMainMenu = false;
      document.body.classList.remove('main-menu-active');
      menuOverlay.classList.add('hidden');
      const submodal = document.getElementById('menu-submodal');
      if (submodal) submodal.classList.add('hidden');
      this.sceneManager.snapCamera();
      this.closeOverlays();
    };

    const startFreshGame = () => {
      if (window.sfx) {
        window.sfx.init();
        window.sfx.success();
      }
      if (this.saveManager) this.saveManager.clear();
      if (this.storyState) this.storyState.reset();
      if (this.relationships) this.relationships.reset();
      if (this.investigation) this.investigation.reset();
      if (this.notebook) this.notebook.reset();
      if (this.quests) this.quests.ensureInitialQuest();
      exitMainMenu();
      this.updateStoryHudPill();
      if (this.animations) {
        this.animations.playWakeUp({
          onComplete: () => {
            if (this.storyEvents) this.storyEvents.triggerPrologueIntro();
          }
        });
      } else if (this.storyEvents) {
        this.storyEvents.triggerPrologueIntro();
      }
      if (this.musicDirector) this.musicDirector.markStarted();
    };

    const continueSavedGame = () => {
      if (!saved) return;
      if (window.sfx) {
        window.sfx.init();
        window.sfx.success();
      }
      this.loadProgress();
      exitMainMenu();
      if (this.animations) {
        this.animations.playWakeUp({
          onComplete: () => {
            this.toast('💾 Progresso restaurado! Boa caminhada na Microárea 04!', 'success');
          }
        });
      } else {
        this.toast('💾 Progresso restaurado! Boa caminhada na Microárea 04!', 'success');
      }
      if (this.musicDirector) this.musicDirector.markStarted();
    };

    const openSubmodal = (html) => {
      const sub = document.getElementById('menu-submodal');
      const card = document.getElementById('menu-submodal-card');
      if (!sub || !card) return;
      card.innerHTML = html;
      sub.classList.remove('hidden');
    };

    const closeSubmodal = () => {
      const sub = document.getElementById('menu-submodal');
      if (sub) sub.classList.add('hidden');
    };

    const openSettingsModal = () => {
      const sfx = window.sfx || { volume: 0.7, musicVolume: 0.55, sfxVolume: 0.8, ambienceVolume: 0.6, enabled: true };
      openSubmodal(`
        <h2>⚙️ Configurações</h2>
        <div class="menu-settings-row">
          <span>🔊 Áudio Geral</span>
          <button id="menu-btn-mute" class="wood-close-btn" style="padding:5px 12px">${sfx.enabled ? 'Ativado' : 'Mutado'}</button>
        </div>
        <div class="menu-settings-row">
          <span>🎚️ Volume Geral</span>
          <input id="menu-vol-master" type="range" min="0" max="100" value="${Math.round(sfx.volume * 100)}">
        </div>
        <div class="menu-settings-row">
          <span>🎵 Música</span>
          <input id="menu-vol-music" type="range" min="0" max="100" value="${Math.round(sfx.musicVolume * 100)}">
        </div>
        <div class="menu-settings-row">
          <span>🔔 Efeitos</span>
          <input id="menu-vol-sfx" type="range" min="0" max="100" value="${Math.round(sfx.sfxVolume * 100)}">
        </div>
        <div class="menu-settings-row">
          <span>🌿 Ambiente</span>
          <input id="menu-vol-amb" type="range" min="0" max="100" value="${Math.round(sfx.ambienceVolume * 100)}">
        </div>
        <div class="feature-item" style="margin-top:10px">
          <strong>⌨️ Controles do Jogo</strong>
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / Setas ou clique: Andar • <kbd>SHIFT</kbd>: Correr<br>
          <kbd>E</kbd> / <kbd>ESPAÇO</kbd>: Interagir • <kbd>TAB</kbd>: Tablet e-SUS • <kbd>C</kbd>: Celular • <kbd>M</kbd>: Mapa • <kbd>N</kbd>: Mutar
        </div>
        <button class="primary-btn" id="menu-sub-close">Voltar ao Menu</button>
      `);

      const syncSlider = (id, hudId, fn) => {
        const el = document.getElementById(id);
        const hudEl = document.getElementById(hudId);
        if (!el) return;
        el.addEventListener('input', () => {
          if (window.sfx) {
            window.sfx.init();
            window.sfx[fn](el.value / 100);
          }
          if (hudEl) hudEl.value = el.value;
        });
      };

      syncSlider('menu-vol-master', 'audio-volume', 'setVolume');
      syncSlider('menu-vol-music', 'music-volume', 'setMusicVolume');
      syncSlider('menu-vol-sfx', 'sfx-volume', 'setSfxVolume');
      syncSlider('menu-vol-amb', 'ambience-volume', 'setAmbienceVolume');

      const muteBtn = document.getElementById('menu-btn-mute');
      if (muteBtn) {
        muteBtn.addEventListener('click', () => {
          this.toggleAudioMute();
          muteBtn.textContent = window.sfx && window.sfx.enabled ? 'Ativado' : 'Mutado';
        });
      }
      document.getElementById('menu-sub-close').addEventListener('click', closeSubmodal);
    };

    const openCreditsModal = () => {
      openSubmodal(`
        <h2>📜 Créditos & Sobre o Jogo</h2>
        <div class="feature-item" style="margin-bottom:10px">
          <strong>🩺 Território Vivo: Crônicas de um ACS</strong>
          Um RPG 2D narrativo sobre o cotidiano, os vínculos e a humanidade do trabalho dos <strong>Agentes Comunitários de Saúde (ACS)</strong> no SUS e na Estratégia Saúde da Família (ESF).
        </div>
        <div class="feature-item" style="margin-bottom:10px">
          <strong>🏡 Vila Esperança — Microárea 04</strong>
          15 famílias com rotinas próprias, UBS visitável, Sala ESF, eventos comunitários, vigilância ambiental e histórias interligadas ao longo das semanas.
        </div>
        <div style="font-size:12.5px;color:var(--ink-mid);text-align:center;margin-top:6px">
          Versão 1.0.1 Beta • Pixel Art & Áudio Procedural WebAudio
        </div>
        <button class="primary-btn" id="menu-sub-close">Voltar ao Menu</button>
      `);
      document.getElementById('menu-sub-close').addEventListener('click', closeSubmodal);
    };

    const handleAction = (action) => {
      if (window.sfx) {
        window.sfx.init();
        if (typeof window.sfx.click === 'function') window.sfx.click();
      }
      if (action === 'continue') {
        continueSavedGame();
        return;
      }
      if (action === 'new') {
        if (saved) {
          openSubmodal(`
            <h2>🌻 Começar Nova Jornada?</h2>
            <p style="font-size:14px;line-height:1.5;margin-bottom:8px">
              Você já possui uma jornada salva (<strong>Semana ${savedWeek} • ${savedDay.shortName} • ${savedVisits}/15 visitas</strong>). Iniciar um novo jogo substituirá o progresso salvo.
            </p>
            <div class="menu-submodal-actions">
              <button class="primary-btn" id="confirm-new-game">Sim, Começar do Zero</button>
              <button class="secondary-btn" id="cancel-new-game">Cancelar</button>
            </div>
          `);
          document.getElementById('confirm-new-game').addEventListener('click', startFreshGame);
          document.getElementById('cancel-new-game').addEventListener('click', closeSubmodal);
        } else {
          startFreshGame();
        }
        return;
      }
      if (action === 'settings') {
        openSettingsModal();
        return;
      }
      if (action === 'credits') {
        openCreditsModal();
        return;
      }
      if (action === 'exit') {
        try { window.close(); } catch (_) {}
        openSubmodal(`
          <h2>👋 Até logo, ACS!</h2>
          <p style="font-size:14px;line-height:1.5;margin-bottom:8px">
            O navegador protege abas abertas contra fechamento automático. Você pode fechar esta aba com segurança ou voltar para a Vila Esperança!
          </p>
          <button class="primary-btn" id="menu-sub-close">Voltar ao Menu</button>
        `);
        document.getElementById('menu-sub-close').addEventListener('click', closeSubmodal);
      }
    };

    if (!this._menuBound) {
      this._menuBound = true;
      buttons.forEach((btn, idx) => {
        btn.addEventListener('mouseenter', () => {
          if (!btn.disabled) selectIndex(idx);
        });
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          handleAction(btn.dataset.action);
        });
      });

      const submodal = document.getElementById('menu-submodal');
      if (submodal) {
        submodal.addEventListener('click', (e) => {
          if (e.target === submodal) closeSubmodal();
        });
      }

      window.addEventListener('keydown', (e) => {
        if (!this.inMainMenu) return;
        const subOpen = submodal && !submodal.classList.contains('hidden');
        const k = e.key.toLowerCase();
        if (subOpen) {
          if (k === 'escape') {
            e.preventDefault();
            closeSubmodal();
          }
          return;
        }
        if (k === 'arrowdown' || k === 's') {
          e.preventDefault();
          let next = this._menuSelectedIndex + 1;
          if (buttons[next % buttons.length]?.disabled) next++;
          selectIndex(next);
        } else if (k === 'arrowup' || k === 'w') {
          e.preventDefault();
          let prev = this._menuSelectedIndex - 1;
          if (buttons[((prev % buttons.length) + buttons.length) % buttons.length]?.disabled) prev--;
          selectIndex(prev);
        } else if (k === 'enter' || k === ' ') {
          e.preventDefault();
          const activeBtn = buttons[this._menuSelectedIndex];
          if (activeBtn && !activeBtn.disabled) {
            handleAction(activeBtn.dataset.action);
          }
        }
      });
    }
  }

  // Sleep / Advance Day (Phase 1: Continuous 6-Day Week + Sunday Turnaround)
  sleepToNextDay(reason = 'SLEEP') {
    if (this.animations && this.animations.isPlaying('sleep')) return;

    const isSaturday = this.dayOfWeek >= 5;
    const isLateNight = reason === 'LATE_NIGHT';

    if (this.animations) {
      this.animations.playSleep({
        mode: isLateNight ? 'LATE_NIGHT' : 'NIGHT',
        stopAtDark: isSaturday,
        onMidpoint: () => {
          this.events.emit('day:ended', {
            weekNumber: this.weekNumber,
            dayOfWeek: this.dayOfWeek,
            reason
          });
          if (!isSaturday) {
            this.dayOfWeek++;
            this.startNewDay(isLateNight, { deferToast: true });
          }
        },
        onComplete: () => {
          if (isSaturday) {
            this.showWeeklySummaryModal(reason);
          } else {
            this._showMorningToast(isLateNight);
            this.setPlayerEmote('heart', 2.0);
          }
        }
      });
      return;
    }

    this.events.emit('day:ended', {
      weekNumber: this.weekNumber,
      dayOfWeek: this.dayOfWeek,
      reason
    });

    if (window.sfx && typeof window.sfx.rest === 'function') window.sfx.rest();

    // Saturday night -> Sunday Weekly Summary Turnaround!
    if (isSaturday) {
      this.showWeeklySummaryModal(reason);
      return;
    }

    this.dayOfWeek++;
    this.startNewDay(isLateNight);
  }

  showCampaignEndingModal() {
    if (!this.endingAssembler) return;
    this.paused = true;
    this.input.clear();
    const overlay = document.getElementById('summary-overlay');
    const card = document.getElementById('summary-card');
    if (!overlay || !card) return;
    overlay.classList.remove('hidden');
    if (this.musicDirector) this.musicDirector.setModalMode('CAMPAIGN_ENDING');

    card.innerHTML = `
      ${this.endingAssembler.renderEndingHtml()}
      <div style="margin-top:14px;text-align:center">
        <button class="primary-btn" id="btn-enter-freeplay">🌻 Seguir no Modo Livre — Epílogo na Vila Esperança</button>
      </div>
    `;

    const btn = document.getElementById('btn-enter-freeplay');
    if (btn) {
      btn.addEventListener('click', () => {
        if (window.sfx && typeof window.sfx.success === 'function') window.sfx.success();
        this.closeOverlays();
        this.updateStoryHudPill();
        this.saveProgress();
        this.toast('🌅 Epílogo iniciado! A Vila Esperança segue viva no Modo Livre.', 'success');
      });
    }
  }

  showWeeklySummaryModal(reason = 'SLEEP') {
    this.paused = true;
    this.input.clear();
    const overlay = document.getElementById('summary-overlay');
    const card = document.getElementById('summary-card');
    overlay.classList.remove('hidden');
    if (this.musicDirector) this.musicDirector.setModalMode('WEEKLY_SUMMARY');

    const avgBond = this.getCommunityBondAverage();
    const goalMet = this.weeklyVisits >= this.weeklyGoal;
    const prioDone = this.getWeeklyPrioritiesCompletedCount();
    const prioTotal = this.weeklyPriorities.length;

    this.events.emit('week:ended', {
      weekNumber: this.weekNumber,
      weeklyVisits: this.weeklyVisits,
      weeklyGoal: this.weeklyGoal,
      prioritiesCompleted: prioDone,
      avgBond
    });

    if (goalMet) window.sfx.success();
    else window.sfx.rest();

    card.innerHTML = `
      <h1>🌅 Domingo de Descanso — Fim da Semana ${this.weekNumber}</h1>
      <h2>${goalMet ? `🌟 Meta Semanal Cumprida! (${this.weeklyVisits}/${this.weeklyGoal})` : `📋 Balanço da Semana ${this.weekNumber} (${this.weeklyVisits}/${this.weeklyGoal} Visitas)`}</h2>
      <p style="font-size:14px;margin-bottom:10px">
        ${reason === 'LATE_NIGHT'
          ? 'Você voltou tarde para casa no sábado à noite e descansou durante o domingo na Vila Esperança.'
          : 'Domingo tranquilo na Vila Esperança! Todos os vínculos construídos e horários descobertos permanecem salvos para a próxima semana.'}
      </p>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-num" style="color:${goalMet ? '#15803d' : '#b45309'}">${this.weeklyVisits} / ${this.weeklyGoal}</div>
          <div class="kpi-label">Visitas na Semana</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">${prioDone} / ${prioTotal}</div>
          <div class="kpi-label">Prioridades Atendidas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">${avgBond}%</div>
          <div class="kpi-label">Vínculo Médio</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">${this.families.filter(f => f.knownSchedule).length} / 15</div>
          <div class="kpi-label">Horários Salvos</div>
        </div>
      </div>
      <div class="feature-item" style="margin-bottom:12px">
        <strong>📰 Boletim da Vila Esperança:</strong>
        Uma nova semana começa amanhã às 07:00! Novas famílias prioritárias serão destacadas no seu Caderno e no Quadro da Sala ESF.
      </div>
      <button class="primary-btn" id="btn-next-week">
        ☀️ Iniciar Semana ${this.weekNumber + 1} (Segunda-feira • 07:00)
      </button>
    `;

    document.getElementById('btn-next-week').addEventListener('click', () => {
      this.startNewWeek();
      this.closeOverlays();
      if (this.animations) {
        this.animations.playWakeUp();
      }
    });
  }

  startNewWeek() {
    this.weekNumber++;
    this.dayOfWeek = 0;
    this.weeklyVisits = 0;
    this.visitedThisWeek.clear();
    this.weeklyReportSubmitted = false;
    this.generateWeeklyPriorities();
    // Respawn dengue spots on new week so environmental vigilance stays alive
    this.dengueSpots.forEach(s => { s.cleared = false; });
    this.startNewDay(false);
  }

  // Backward-compatible alias
  endDay(reason) {
    this.sleepToNextDay(reason);
  }

  _showMorningToast(lateWake = false) {
    const d = this.getCurrentDayData();
    this.toast(
      lateWake
        ? `😴 Você acordou às 07:30 um pouco cansado (Sem. ${this.weekNumber} • ${d.name}). Tome um café em casa!`
        : `☀️ Semana ${this.weekNumber} • ${d.name} (${d.weekTag || d.title})`,
      'info'
    );
  }

  startNewDay(lateWake = false, { deferToast = false } = {}) {
    this.timeMinutes = lateWake ? (7 * 60 + 30) : (7 * 60);
    this._lastHour = Math.floor(this.timeMinutes / 60);
    this.dailyVisits = 0;
    this.visitedToday.clear();
    this.knockedAwayToday.clear();
    this.unreadNotifs = 1;
    if (this.ubsInterior) this.ubsInterior.resetDaily();
    if (this.playerHomeSystem) this.playerHomeSystem.resetDaily();
    if (this.schedule) this.schedule.resetDaily();
    if (this.communitySpaces) this.communitySpaces.resetDaily();

    this.player.stamina = lateWake ? 75 : 100;
    this.player.hydration = 100;
    this.player.sunscreenTimer = 0;
    this.player.umbrellaOpen = false;

    this.inventory.forEach(i => { i.count = i.maxCount; });
    this.dogs.forEach(d => {
      d.calmedUntil = 0;
      d.cooldownUntil = 0;
      d.x = d.homeX;
      d.y = d.homeY;
    });
    this.cats.forEach(c => {
      c.calmedUntil = 0;
      c.scareCooldown = 0;
      c.meowCooldown = 0;
      c.pettedToday = false;
      c.x = c.homeX;
      c.y = c.homeY;
    });

    // Wake up inside Casa do ACS!
    this.playerHomeSystem.enterHome(true);

    this.events.emit('day:started', { weekNumber: this.weekNumber, dayOfWeek: this.dayOfWeek });
    if (!deferToast) {
      this._showMorningToast(lateWake);
    }
    this.renderHotbar();
    this.updateHUD();
    this.navigation.resolveObjective();
    this.navigation.updateTrackerUI();
    this.navigation.drawMinimap();
    this.saveProgress();
  }

  // ==========================================================================
  // 9. PIXEL-PERFECT RENDERING + Y-SORTING + TIME-OF-DAY LIGHTING
  // ==========================================================================
  draw() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render active interior scene (Casa do ACS, UBS Interior or Sala ESF)
    if (!this.inMainMenu && this.currentLocation !== 'OVERWORLD' && this.sceneManager) {
      this.sceneManager.draw(ctx);
      if (this.animations) this.animations.drawOverlay();
      return;
    }

    const camX = Math.round(this.camera.x);
    const camY = Math.round(this.camera.y);
    const weather = this.getCurrentWeather();

    ctx.save();
    ctx.translate(-camX, -camY);

    // 1. Pre-baked Pixel Art Terrain (Grass, Scalloped Dirt, Cobblestone Streets, Fences)
    const terrain = weather === 'RAIN' ? this.terrainRainCanvas : this.terrainCanvas;
    ctx.drawImage(terrain, 0, 0);

    // 2. Animated Stream / Córrego Water Tiles (visible viewport only — safe non-negative frame index!)
    const waterFrame = window.ACSEngine.safeMod(this.elapsedTime * 3.5, window.pixelArt.tiles.water.length);
    const minRow = Math.max(0, Math.floor(camY / this.TILE));
    const maxRow = Math.min(this.ROWS - 1, Math.ceil((camY + this.canvas.height) / this.TILE));
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = 17; c <= 18; c++) {
        if (this.tileMap[r][c] === 'R') {
          ctx.drawImage(window.pixelArt.tiles.water[waterFrame], c * this.TILE, r * this.TILE);
        }
      }
    }

    // 3. Footstep Dust Particles (ground level)
    for (const dp of this.dustParticles) {
      const alpha = Math.max(0, dp.life / dp.maxLife) * 0.65;
      ctx.fillStyle = `rgba(222, 194, 146, ${alpha})`;
      ctx.fillRect(Math.round(dp.x), Math.round(dp.y), dp.size, dp.size);
    }

    // 4. Unified Y-SORTING Queue (Houses, UBS, Trees, Props, Dengue, NPCs, Dogs, Player!)
    const renderList = [];
    const hourFloat = this.timeMinutes / 60;
    const isDusk = hourFloat >= 16.5;

    // 3B. Dedicated Ground Contact & Late-Afternoon Cast Shadows (underneath all Y-sorted entities)
    this.drawOverworldGroundShadows(ctx, hourFloat, weather);

    // UBS Building
    renderList.push({
      sortY: this.ubs.sortY,
      draw: () => {
        const playerBehind = this.player.y < this.ubs.sortY &&
          this.player.x > this.ubs.x && this.player.x < this.ubs.x + this.ubs.w &&
          this.player.y > this.ubs.y - 10;
        if (playerBehind) ctx.globalAlpha = 0.72;
        ctx.drawImage(window.pixelArt.ubsSprite, this.ubs.x, this.ubs.y);
        ctx.globalAlpha = 1;
      }
    });

    // Protagonist's Home, Vendinha, Associação & Casa Misteriosa buildings
    [
      { data: this.playerHome, spriteObj: window.pixelArt.playerHomeSprite, label: '🏡 Casa do ACS', col: '#0369a1' },
      { data: this.vendinha, spriteObj: window.pixelArt.vendinhaSprite, label: '🏪 Vendinha do Zé', col: '#b45309' },
      { data: this.associacao, spriteObj: window.pixelArt.associacaoSprite, label: '🏛️ Associação', col: '#166534' },
      { data: this.mysteryHouse, spriteObj: window.pixelArt.mysteryHouseSprite, label: '❓ Casarão Nº 00', col: '#334155' }
    ].forEach(b => {
      if (!b.data || !b.spriteObj) return;
      const bx0 = b.data.x - 80;
      const by0 = b.data.y - 144;
      const bSortY = b.data.y - 18;
      renderList.push({
        sortY: bSortY,
        draw: () => {
          const playerBehind = this.player.y < bSortY &&
            this.player.x > bx0 + 6 && this.player.x < bx0 + 154 &&
            this.player.y > by0;
          if (playerBehind) ctx.globalAlpha = 0.74;
          const isLit = hourFloat >= 16.5;
          const spr = isLit ? b.spriteObj.lit : b.spriteObj.unlit;
          ctx.drawImage(spr, bx0, by0);
          ctx.globalAlpha = 1;

          if (isLit) {
            this.drawWindowGlowPool(ctx, bx0 + 44, by0 + 114, 24);
            this.drawWindowGlowPool(ctx, bx0 + 116, by0 + 114, 24);
          }

          ctx.font = 'bold 11px Trebuchet MS';
          const lw = ctx.measureText(b.label).width + 16;
          const px = Math.round(b.data.x - lw / 2);
          const py = Math.round(by0 - 6);
          ctx.fillStyle = '#3b200f';
          ctx.fillRect(px - 2, py - 2, lw + 4, 20);
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(px, py, lw, 16);
          ctx.fillStyle = b.col;
          ctx.fillText(b.label, px + 8, py + 12);
        }
      });
    });

    // Pracinha dos Ipês: 2 Domino Tables & 4 Street Lamps (with evening glow)
    const T = this.TILE;
    // Campinho de Futebol Goalposts & Soccer Ball (Y-sorted)
    if (this.campinho) {
      const midY = this.campinho.y;
      const leftGoalX = (this.campinho.c1 + 0.7) * T;
      const rightGoalX = (this.campinho.c2 - 0.7) * T;
      [
        { x: leftGoalX, isLeft: true },
        { x: rightGoalX, isLeft: false }
      ].forEach(gp => {
        renderList.push({
          sortY: midY + 28,
          draw: () => {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(Math.round(gp.x - 4), Math.round(midY - 34), 8, 66);
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(Math.round(gp.x - 2), Math.round(midY - 32), 4, 62);
            ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
            ctx.lineWidth = 1;
            const netX = gp.isLeft ? gp.x - 16 : gp.x + 2;
            ctx.strokeRect(Math.round(netX), Math.round(midY - 30), 14, 58);
          }
        });
      });
      renderList.push({
        sortY: midY,
        draw: () => {
          const bx = Math.round(this.campinho.x);
          const by = Math.round(midY);
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(bx, by, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(bx, by, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(bx - 2, by - 2, 4, 4);
        }
      });
    }
    [41 * T, 47 * T].forEach(dx => {
      renderList.push({
        sortY: 48 * T,
        draw: () => {
          const spr = window.pixelArt.community.dominoTable;
          if (spr) ctx.drawImage(spr, Math.round(dx - spr.width / 2), Math.round(48 * T - spr.height + 8));
        }
      });
    });
    [[36 * T, 43.5 * T], [52 * T, 43.5 * T], [36 * T, 51.5 * T], [52 * T, 51.5 * T]].forEach(([lx, ly]) => {
      renderList.push({
        sortY: ly,
        draw: () => {
          const spr = window.pixelArt.community.streetLamp;
          if (spr) ctx.drawImage(spr, Math.round(lx - spr.width / 2), Math.round(ly - spr.height + 6));
          if (hourFloat >= 17.0) {
            const gx = Math.round(lx);
            const gy = Math.round(ly - 54);
            const intensity = Math.min(1, (hourFloat - 17.0) / 1.5);
            const outer = ctx.createRadialGradient(gx, gy, 4, gx, gy, 48);
            outer.addColorStop(0, `rgba(254, 240, 138, ${0.28 + intensity * 0.20})`);
            outer.addColorStop(0.45, `rgba(245, 158, 11, ${0.14 + intensity * 0.10})`);
            outer.addColorStop(1, 'rgba(245, 158, 11, 0)');
            ctx.fillStyle = outer;
            ctx.beginPath();
            ctx.arc(gx, gy, 48, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    });

    // Tuesday Feira Livre Market Stalls on Pracinha dos Ipês
    if (this.schedule && this.schedule.isFeiraActive()) {
      [
        { x: 39 * T, key: 'stall_veg' },
        { x: 44 * T, key: 'stall_sewing' },
        { x: 49 * T, key: 'stall_fruit' }
      ].forEach(st => {
        renderList.push({
          sortY: 45.5 * T,
          draw: () => {
            const spr = window.pixelArt.community[st.key];
            if (spr) ctx.drawImage(spr, Math.round(st.x - spr.width / 2), Math.round(45.5 * T - spr.height + 10));
          }
        });
      });
    }

    // Horta Comunitária: 10 Soil Beds inside cols 66..73, rows 45..50 + WorldState visual evolution (stages 0..3)
    const hortaStage = this.worldState ? this.worldState.getHortaStage() : 0;
    for (let hr = 0; hr < 2; hr++) {
      for (let hc = 0; hc < 5; hc++) {
        const bx = (66.5 + hc * 1.55) * T;
        const by = (46.5 + hr * 2.2) * T;
        renderList.push({
          sortY: by,
          draw: () => {
            const spr = window.pixelArt.community.hortaBed;
            if (spr) ctx.drawImage(spr, Math.round(bx - spr.width / 2), Math.round(by - spr.height + 8));
            if (hortaStage >= 1) {
              ctx.fillStyle = '#2b1b12';
              ctx.fillRect(Math.round(bx - 17), Math.round(by - 9), 34, 5);
              ctx.fillStyle = hortaStage >= 2 ? '#166534' : '#5c3317';
              ctx.fillRect(Math.round(bx - 16), Math.round(by - 8), 32, 3);
            }
            if (hortaStage >= 2) {
              for (let s = -12; s <= 12; s += 8) {
                ctx.fillStyle = '#2b1b12';
                ctx.fillRect(Math.round(bx + s - 3), Math.round(by - 13), 6, 7);
                ctx.fillStyle = '#3b6b25';
                ctx.fillRect(Math.round(bx + s - 2), Math.round(by - 12), 4, 5);
                ctx.fillStyle = '#84cc16';
                ctx.fillRect(Math.round(bx + s - 2), Math.round(by - 12), 3, 2);
              }
            }
            if (hortaStage >= 3) {
              ctx.fillStyle = '#b45309';
              ctx.fillRect(Math.round(bx - 10), Math.round(by - 15), 5, 5);
              ctx.fillRect(Math.round(bx + 6), Math.round(by - 15), 5, 5);
              ctx.fillStyle = '#facc15';
              ctx.fillRect(Math.round(bx - 9), Math.round(by - 14), 3, 3);
              ctx.fillRect(Math.round(bx + 7), Math.round(by - 14), 3, 3);
            }
          }
        });
      }
    }

    // Pracinha dos Ipês visual banner & Mesa Posta (Etapas H3 & H4)
    const pracStatus = this.worldState ? this.worldState.getPracinhaStatus() : 'default';
    const pracAssembleiaAtiva = (pracStatus === 'mobilizada' || pracStatus === 'celebracao') ||
      (this.storyEvents && this.storyEvents.activeEvent && this.storyEvents.activeEvent.id === 'evt_cap4_assembleia_pracinha');
    if (pracAssembleiaAtiva && this.pracinha) {
      renderList.push({
        sortY: 44.2 * T,
        draw: () => {
          // Faixa comunitária / bandeirinhas da Assembleia Aberta
          ctx.fillStyle = '#2b1b12';
          ctx.fillRect(Math.round(41.5 * T - 1), Math.round(43.4 * T - 1), 162, 16);
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(Math.round(41.5 * T), Math.round(43.4 * T), 160, 14);
          ctx.fillStyle = pracStatus === 'celebracao' ? '#d97706' : '#15803d';
          ctx.fillRect(Math.round(41.5 * T + 2), Math.round(43.4 * T + 2), 156, 10);

          // Mesa Posta central com toalha quadriculada e café
          const mx = Math.round(this.pracinha.x - 32);
          const my = Math.round(this.pracinha.y - 10);
          ctx.fillStyle = 'rgba(30, 18, 10, 0.28)';
          ctx.fillRect(mx + 2, my + 20, 62, 5);
          ctx.fillStyle = '#2b1b12';
          ctx.fillRect(mx - 1, my - 1, 66, 24);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(mx, my, 64, 22);
          ctx.fillStyle = '#fef2f2';
          ctx.fillRect(mx + 2, my + 2, 60, 14);
          ctx.fillStyle = '#dc2626';
          for (let rx = 0; rx < 56; rx += 12) {
            ctx.fillRect(mx + 4 + rx, my + 4, 6, 5);
            ctx.fillRect(mx + 10 + rx, my + 9, 6, 5);
          }
          // Garrafa térmica de café do Seu Zé
          ctx.fillStyle = '#2b1b12';
          ctx.fillRect(mx + 27, my - 5, 10, 11);
          ctx.fillStyle = '#1d4ed8';
          ctx.fillRect(mx + 28, my - 4, 8, 9);
          ctx.fillStyle = '#60a5fa';
          ctx.fillRect(mx + 29, my - 3, 2, 7);
        }
      });
    }

    // Staged Story Event Cast in Overworld (e.g. Assembleia Aberta na Pracinha)
    if (this.storyEvents && this.communitySpaces) {
      for (const actor of this.storyEvents.getStagedCastInScene('OVERWORLD')) {
        const ref = actor.ref;
        let frames = null;
        if (actor.type === 'staff' || actor.type === 'npc') {
          frames = window.pixelArt.getStaffSprite(ref.id, ref.appearance);
        } else if (actor.type === 'family') {
          frames = window.pixelArt.npcSprites[ref.id];
        }
        if (frames) {
          this.communitySpaces._pushNpcDraw(renderList, {
            id: ref.id,
            name: (ref.name || '').split(' ')[0],
            role: ref.role || ref.code || '',
            x: ref.x,
            y: ref.y,
            emote: ref.emote,
            emoteTimer: ref.emoteTimer
          }, frames);
        }
      }
    }

    // Investigation Clue Markers [?] in Overworld
    if (this.worldState) {
      renderList.push({
        sortY: 99999,
        draw: () => this.worldState.drawWorldClueMarkers(ctx, 'OVERWORLD')
      });
    }

    // Tia Bete outside by the Horta on Saturday mornings
    if (this.communitySpaces && this.communitySpaces.isTiaBeteAtHorta()) {
      const tb = this.communitySpaces.npcs.npc_tia_bete;
      const frames = window.pixelArt.getStaffSprite(tb.id, tb.appearance);
      this.communitySpaces._pushNpcDraw(renderList, { ...tb, x: tb.hortaX, y: tb.hortaY }, frames);
    }

    // Scheduled residents out in Overworld (Feira / Roda de Dominó)
    if (this.schedule && this.communitySpaces) {
      for (const { fam, loc } of this.schedule.getFamiliesInScene('OVERWORLD')) {
        const frames = window.pixelArt.npcSprites[fam.id];
        if (frames) {
          this.communitySpaces._pushNpcDraw(renderList, {
            id: fam.id,
            name: fam.name.split(' ')[0],
            role: fam.code,
            x: loc.x,
            y: loc.y,
            emote: fam.emote,
            emoteTimer: fam.emoteTimer
          }, frames);
        }
      }
    }

    // 15 Brazilian Houses + Living NPC Residents in Front Yards!
    this.families.forEach(fam => {
      const atHome = this.isFamilyAtHome(fam);
      const visited = this.visitedToday.has(fam.id);
      const hx = fam.x - 80;
      const hy = fam.y - 144;
      const houseSortY = fam.y - 18;

      renderList.push({
        sortY: houseSortY,
        draw: () => {
          const playerBehind = this.player.y < houseSortY &&
            this.player.x > hx + 6 && this.player.x < hx + 154 &&
            this.player.y > hy;
          if (playerBehind) ctx.globalAlpha = 0.74;

          const isLit = atHome || isDusk;
          const sprite = isLit
            ? window.pixelArt.houses[fam.id].lit
            : window.pixelArt.houses[fam.id].unlit;
          ctx.drawImage(sprite, hx, hy);
          ctx.globalAlpha = 1;

          if (isLit && hourFloat >= 16.5) {
            this.drawWindowGlowPool(ctx, hx + 44, hy + 114, 24);
            this.drawWindowGlowPool(ctx, hx + 116, hy + 114, 24);
          }

          // Cozy wooden house nameplate above gate/roof edge
          this.drawHouseTag(ctx, fam, fam.x, hy + 6, visited, atHome);
        }
      });

      // When family is AT HOME, draw their animated pixel-art Resident standing in the yard!
      if (atHome) {
        const npcX = fam.x + 28;
        const npcY = fam.y - 6;
        renderList.push({
          sortY: npcY,
          draw: () => {
            const waveFrame = (window.ACSEngine.safeMod(this.elapsedTime * 1.4 + fam.tx, 5) === 0) ? 1 : 0;
            const spr = window.pixelArt.npcSprites[fam.id][waveFrame];
            ctx.drawImage(spr, Math.round(npcX - 16), Math.round(npcY - 42));

            // Floating pixel emoticon bubble above NPC head!
            let emoteKey = null;
            if (fam.emoteTimer > 0 && fam.emote) {
              emoteKey = fam.emote;
            } else if (visited) {
              emoteKey = fam.archetype === 'AMIGO' ? 'water' : 'check';
            } else if (!fam.knownSchedule) {
              emoteKey = 'question';
            } else {
              emoteKey = 'chat';
            }
            if (emoteKey && window.pixelArt.emotes[emoteKey]) {
              const floatY = Math.sin(this.elapsedTime * 3.5 + fam.tx) * 3;
              ctx.drawImage(
                window.pixelArt.emotes[emoteKey],
                Math.round(npcX - 16),
                Math.round(npcY - 76 + floatY)
              );
            }
          }
        });
      }
    });

    // Trees (Player walks behind lush canopies cleanly!)
    window.ACS_DATA.trees.forEach(t => {
      const variants = window.pixelArt.treeVariants && window.pixelArt.treeVariants[t.style];
      const sprite = (variants && variants.length)
        ? variants[Math.abs(Math.floor(t.x + t.y)) % variants.length]
        : (window.pixelArt.trees[t.style] || window.pixelArt.trees.mango);
      renderList.push({
        sortY: t.y - 2,
        draw: () => {
          const behindCanopy = this.player.y < t.y - 4 &&
            Math.hypot(this.player.x - t.x, this.player.y - (t.y - 42)) < 58;
          if (behindCanopy) ctx.globalAlpha = 0.72;
          ctx.drawImage(sprite, Math.round(t.x - 64), Math.round(t.y - 126));
          ctx.globalAlpha = 1;
        }
      });
    });

    // Decorative Props (Benches, Bushes, Flowerpots, Signpost, Rocks)
    window.ACS_DATA.props.forEach(p => {
      const spr = window.pixelArt.props[p.type];
      if (!spr) return;
      renderList.push({
        sortY: p.y,
        draw: () => {
          ctx.drawImage(spr, Math.round(p.x - spr.width / 2), Math.round(p.y - spr.height + 8));
        }
      });
    });

    // Dengue Spots
    this.dengueSpots.forEach(s => {
      if (s.cleared) return;
      const spr = window.pixelArt.dengue[s.type] || window.pixelArt.dengue.tire;
      renderList.push({
        sortY: s.y,
        draw: () => {
          ctx.drawImage(spr, Math.round(s.x - spr.width / 2), Math.round(s.y - spr.height + 8));
          const bob = Math.sin(this.elapsedTime * 5) * 3;
          ctx.drawImage(window.pixelArt.emotes.alert, Math.round(s.x - 16), Math.round(s.y - 52 + bob));
        }
      });
    });

    // Dogs (Animated 4-Direction Pixel Sprites!)
    this.dogs.forEach(d => {
      renderList.push({
        sortY: d.y,
        draw: () => {
          const isCalmed = d.calmedUntil > this.timeMinutes;
          // Subtle danger zone indicator on ground when approaching
          if (!isCalmed && Math.hypot(this.player.x - d.x, this.player.y - d.y) < d.aggroRadius + 80) {
            ctx.strokeStyle = 'rgba(220, 38, 38, 0.35)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(Math.round(d.x), Math.round(d.y), d.aggroRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          const frames = window.pixelArt.dogFrames[d.breed][d.dir];
          const spr = frames[window.ACSEngine.safeMod(d.animTimer, frames.length)];
          ctx.drawImage(spr, Math.round(d.x - 20), Math.round(d.y - 28));

          // Dog Emote Bubble
          const emKey = (d.emoteTimer > 0 && d.emote) ? d.emote : (isCalmed ? 'bone' : null);
          if (emKey && window.pixelArt.emotes[emKey]) {
            ctx.drawImage(window.pixelArt.emotes[emKey], Math.round(d.x - 16), Math.round(d.y - 60));
          }
        }
      });
    });

    // Cats (Animated 4-Direction Pixel Sprites — Fofinhos & Medrosos!)
    this.cats.forEach(c => {
      renderList.push({
        sortY: c.y,
        draw: () => {
          const coatFrames = window.pixelArt.catFrames[c.coat] || window.pixelArt.catFrames.branco;
          const frames = coatFrames[c.dir] || coatFrames.down;
          const spr = frames[window.ACSEngine.safeMod(c.animTimer, frames.length)];
          ctx.drawImage(spr, Math.round(c.x - 16), Math.round(c.y - 24));

          // Cat Emote Bubble
          const emKey = (c.emoteTimer > 0 && c.emote) ? c.emote : null;
          if (emKey && window.pixelArt.emotes[emKey]) {
            ctx.drawImage(window.pixelArt.emotes[emKey], Math.round(c.x - 16), Math.round(c.y - 54));
          }
        }
      });
    });

    // ACS Player (Animated 4-Direction Sprite + Ground Locator Ring + Idle Breathing + Umbrella + Emote!)
    renderList.push({
      sortY: this.player.y,
      draw: () => {
        const px = Math.round(this.player.x);
        const py = Math.round(this.player.y);

        // Subtle crisp ground locator ring so the ACS character is unmistakable on any terrain
        const ringPulse = 0.55 + 0.25 * Math.sin(this.elapsedTime * 4.5);
        ctx.save();
        ctx.strokeStyle = this.player.hydration < 25
          ? `rgba(249, 115, 22, ${ringPulse})`
          : (this.player.inShade ? `rgba(74, 222, 128, ${ringPulse})` : `rgba(56, 189, 248, ${ringPulse})`);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py + 1, 14, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        const frames = window.pixelArt.playerFrames[this.player.dir] || window.pixelArt.playerFrames.down;
        const safeFrame = window.ACSEngine.safeMod(this.player.animFrame, frames.length);
        const spr = frames[safeFrame];
        const idleBob = this.player.isMoving ? 0 : Math.round(Math.sin(this.elapsedTime * 3.2) * 0.6);
        ctx.drawImage(spr, px - 16, py - 42 + idleBob);

        if (this.player.umbrellaOpen) {
          ctx.drawImage(window.pixelArt.umbrellaSprite, px - 28, py - 68 + idleBob);
        }

        if (this.player.emoteTimer > 0 && this.player.emote && window.pixelArt.emotes[this.player.emote]) {
          const fy = Math.sin(this.elapsedTime * 6) * 2;
          ctx.drawImage(
            window.pixelArt.emotes[this.player.emote],
            px - 16,
            Math.round(py - (this.player.umbrellaOpen ? 98 : 76) + fy)
          );
        }
      }
    });

    // Execute Y-Sorting!
    renderList.sort((a, b) => a.sortY - b.sortY);
    for (const item of renderList) {
      item.draw();
    }

    // 4B. World-Space Navigation Overlay (Click-to-Walk Marker + Golden Directional Compass Arrow)
    this.navigation.drawWorldOverlay(ctx);

    // 5. Drifting Ambient Leaves (above canopy level!)
    for (const leaf of this.leafParticles) {
      const lx = Math.round(leaf.x);
      const ly = Math.round(leaf.y);
      ctx.fillStyle = 'rgba(43, 27, 18, 0.55)';
      ctx.fillRect(lx, ly + 1, 4, 4);
      ctx.fillStyle = leaf.color;
      ctx.fillRect(lx, ly, 4, 3);
      ctx.fillStyle = 'rgba(255, 246, 200, 0.55)';
      ctx.fillRect(lx, ly, 2, 1);
    }

    // 6. Subtle Golden Afternoon Sun Motes (when sunny/heatwave)
    if (weather === 'SUNNY' || weather === 'HEATWAVE') {
      for (const m of this.sunMotes) {
        const pulse = (Math.sin(this.elapsedTime * 2 + m.phase) + 1) * 0.5;
        ctx.fillStyle = `rgba(255, 232, 158, ${0.18 + pulse * 0.36})`;
        ctx.fillRect(Math.round(m.x), Math.round(m.y + Math.sin(this.elapsedTime + m.phase) * 6), m.size, m.size);
      }
    }

    // 7. World-Space Cozy Pixel Interact Prompt Bubble above nearby target!
    if (this.nearTarget && !this.paused) {
      this.drawWorldPrompt(ctx, this.nearTarget.x, this.nearTarget.y, this.nearTarget.label);
    }

    if (this.animations) {
      this.animations.drawWorld(ctx);
    }

    ctx.restore();

    // 8. Dynamic Time-of-Day Lighting & Weather Screen Grading!
    this.drawTimeAndWeatherLighting(ctx, weather, hourFloat);

    // 9. Smooth room transition fade when exiting indoors
    if (this.sceneManager && this.sceneManager.transitionAlpha > 0) {
      ctx.fillStyle = `rgba(20, 15, 10, ${this.sceneManager.transitionAlpha})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 10. Fullscreen Cinematic Animation Layer (Sleep Fade, Wake-Up Light, Effects)
    if (this.animations) {
      this.animations.drawOverlay();
    }
  }

  drawOverworldGroundShadows(ctx, hourFloat, weather) {
    const isSoft = weather === 'RAIN' || weather === 'CLOUDY';
    const baseAlpha = isSoft ? 0.16 : (hourFloat >= 15.5 && hourFloat < 18.5 ? 0.30 : 0.24);
    const drawEllipticalShadow = (cx, cy, rx, ry, alphaMult = 1) => {
      const a1 = (baseAlpha * 0.45 * alphaMult).toFixed(2);
      const a2 = (baseAlpha * 0.72 * alphaMult).toFixed(2);
      ctx.fillStyle = `rgba(32, 20, 12, ${a1})`;
      ctx.beginPath();
      ctx.ellipse(Math.round(cx), Math.round(cy), rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(26, 16, 10, ${a2})`;
      ctx.beginPath();
      ctx.ellipse(Math.round(cx - 2), Math.round(cy - 1), rx * 0.72, ry * 0.70, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    // Late-afternoon directional bias (sun upper-left -> shadows fall gently lower-right)
    const ox = isSoft ? 4 : (hourFloat >= 15 ? 10 : 6);
    const oy = isSoft ? 3 : 6;

    // UBS Building contact & cast shadow
    if (this.ubs) {
      drawEllipticalShadow(this.ubs.x + this.ubs.w * 0.52 + ox, this.ubs.y + this.ubs.h - 10 + oy, 128, 16, 1.05);
    }

    // Community Hubs, Casa do ACS & Casa Misteriosa
    [this.playerHome, this.vendinha, this.associacao, this.mysteryHouse].forEach(b => {
      if (!b) return;
      drawEllipticalShadow(b.x + ox * 0.8, b.y - 14 + oy, 76, 12, 1.0);
    });

    // 15 Houses
    for (const fam of this.families) {
      drawEllipticalShadow(fam.x + ox * 0.8, fam.y - 14 + oy, 76, 12, 1.0);
    }

    // Trees (soft dappled canopy shadow on turf/paths)
    for (const t of window.ACS_DATA.trees) {
      drawEllipticalShadow(t.x + ox, t.y + 2 + oy, 46, 15, 0.95);
    }

    // Yard Props & Dengue Spots
    for (const p of window.ACS_DATA.props) {
      drawEllipticalShadow(p.x + ox * 0.4, p.y + 3, 18, 6, 0.72);
    }
    for (const s of this.dengueSpots) {
      if (!s.cleared) {
        drawEllipticalShadow(s.x + ox * 0.35, s.y + 3, 18, 6, 0.75);
      }
    }

    // Pracinha tables, lamps, Feira stalls & Horta beds
    const T = this.TILE;
    [41 * T, 47 * T].forEach(dx => drawEllipticalShadow(dx + 4, 48 * T + 3, 30, 8, 0.8));
    [[36 * T, 43.5 * T], [52 * T, 43.5 * T], [36 * T, 51.5 * T], [52 * T, 51.5 * T]].forEach(([lx, ly]) => {
      drawEllipticalShadow(lx + 4, ly + 2, 14, 5, 0.8);
    });
    if (this.schedule && this.schedule.isFeiraActive()) {
      [39 * T, 44 * T, 49 * T].forEach(sx => drawEllipticalShadow(sx + 5, 45.5 * T + 5, 42, 10, 0.85));
    }
    for (let hr = 0; hr < 2; hr++) {
      for (let hc = 0; hc < 5; hc++) {
        drawEllipticalShadow((66.5 + hc * 1.55) * T + 2, (46.5 + hr * 2.2) * T + 4, 24, 6, 0.65);
      }
    }
  }

  drawWindowGlowPool(ctx, cx, cy, radius) {
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
    grad.addColorStop(0, 'rgba(253, 224, 71, 0.24)');
    grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.10)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(Math.round(cx), Math.round(cy), radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHouseTag(ctx, fam, cx, topY, visited, atHome) {
    const isPriority = this.weeklyPriorities.includes(fam.id) && !this.visitedThisWeek.has(fam.id);
    const label = isPriority ? `⭐ ${fam.code}` : fam.code;
    ctx.font = 'bold 11px Trebuchet MS';
    const w = ctx.measureText(label).width + 24;
    const bx = Math.round(cx - w / 2);
    const by = Math.round(topY - 12);

    // Mini wooden pixel sign
    ctx.fillStyle = isPriority ? '#b45309' : '#3b200f';
    ctx.fillRect(bx - 2, by - 2, w + 4, 20);
    ctx.fillStyle = isPriority ? '#fef9c3' : '#f8e6c2';
    ctx.fillRect(bx, by, w, 16);

    // Status pixel gem on left
    ctx.fillStyle = visited ? '#0284c7' : (!fam.knownSchedule ? '#d97706' : (atHome ? '#16a34a' : '#64748b'));
    ctx.fillRect(bx + 4, by + 4, 8, 8);

    ctx.fillStyle = '#382213';
    ctx.fillText(label, bx + 16, by + 12);
  }

  drawWorldPrompt(ctx, x, y, text) {
    const bob = Math.sin(this.elapsedTime * 5) * 3;
    ctx.font = 'bold 13px Trebuchet MS';
    const w = ctx.measureText(text).width + 22;
    const bx = Math.round(x - w / 2);
    const by = Math.round(y - 26 + bob);

    ctx.fillStyle = '#3b200f';
    ctx.fillRect(bx - 3, by - 3, w + 6, 28);
    ctx.fillStyle = '#9c6234';
    ctx.fillRect(bx - 1, by - 1, w + 2, 24);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(bx + 1, by + 1, w - 2, 20);

    ctx.fillStyle = '#382213';
    ctx.fillText(text, bx + 11, by + 15);
  }

  drawTimeAndWeatherLighting(ctx, weather, hourFloat) {
    const W = this.canvas.width;
    const H = this.canvas.height;

    // 1. Directional Time-of-Day Gradients (Warm Upper-Left Sun -> Atmospheric Lower-Right Depth)
    if (hourFloat < 9.5) {
      const t = (9.5 - hourFloat) / 2.5;
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, `rgba(255, 238, 188, ${(0.12 * t).toFixed(3)})`);
      grad.addColorStop(0.55, `rgba(255, 244, 214, ${(0.04 * t).toFixed(3)})`);
      grad.addColorStop(1, `rgba(60, 48, 68, ${(0.06 * t).toFixed(3)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (hourFloat < 14.5) {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, 'rgba(255, 232, 174, 0.08)');
      grad.addColorStop(0.55, 'rgba(255, 224, 150, 0.02)');
      grad.addColorStop(1, 'rgba(52, 34, 22, 0.06)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (hourFloat >= 14.5 && hourFloat < 17.2) {
      // Signature Warm Late-Afternoon Golden Hour Glow
      const t = (hourFloat - 14.5) / 2.7;
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, `rgba(255, 206, 114, ${(0.10 + 0.12 * t).toFixed(3)})`);
      grad.addColorStop(0.55, `rgba(232, 148, 60, ${(0.05 + 0.05 * t).toFixed(3)})`);
      grad.addColorStop(1, `rgba(58, 34, 42, ${(0.07 + 0.08 * t).toFixed(3)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Gentle upper-left golden sun bloom
      const sunBloom = ctx.createRadialGradient(W * 0.12, H * 0.10, 20, W * 0.18, H * 0.14, W * 0.75);
      sunBloom.addColorStop(0, `rgba(255, 224, 140, ${(0.10 + 0.08 * t).toFixed(3)})`);
      sunBloom.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = sunBloom;
      ctx.fillRect(0, 0, W, H);
    } else if (hourFloat >= 17.2 && hourFloat < 19.0) {
      // Warm Terracotta Sunset fading into Twilight Plum
      const t = Math.min(1, (hourFloat - 17.2) / 1.8);
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, `rgba(234, 118, 46, ${(0.18 + 0.08 * (1 - t)).toFixed(3)})`);
      grad.addColorStop(0.5, `rgba(148, 62, 54, ${(0.14 + 0.06 * t).toFixed(3)})`);
      grad.addColorStop(1, `rgba(38, 36, 94, ${(0.18 + 0.18 * t).toFixed(3)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (hourFloat >= 19.0) {
      // Cozy Brazilian Community Night (warm deep indigo keeping full readability)
      const t = Math.min(1, (hourFloat - 19.0) / 1.5);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, `rgba(18, 24, 60, ${(0.30 + 0.14 * t).toFixed(3)})`);
      grad.addColorStop(1, `rgba(32, 38, 86, ${(0.24 + 0.12 * t).toFixed(3)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // 2. Weather Overlays
    if (weather === 'HEATWAVE') {
      const grad = ctx.createRadialGradient(W * 0.5, 0, 40, W * 0.5, H * 0.5, W * 0.78);
      grad.addColorStop(0, 'rgba(253, 224, 71, 0.24)');
      grad.addColorStop(1, 'rgba(217, 119, 6, 0.08)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      if (this.player.onSunTrail && !this.player.inShade && !this.player.umbrellaOpen) {
        const msg = '🔥 SOL FORTE NA ESTRADA SEM SOMBRA! Use Guarda-Sol [3], Protetor [2] ou Água [1]!';
        ctx.font = 'bold 13px Trebuchet MS';
        const mw = ctx.measureText(msg).width + 24;
        const mx = Math.round((W - mw) / 2);
        ctx.fillStyle = '#3b200f';
        ctx.fillRect(mx - 2, 16, mw + 4, 30);
        ctx.fillStyle = '#fee2e2';
        ctx.fillRect(mx, 18, mw, 26);
        ctx.fillStyle = '#991b1b';
        ctx.fillText(msg, mx + 12, 35);
      }
    } else if (weather === 'RAIN') {
      ctx.fillStyle = 'rgba(28, 46, 68, 0.26)';
      ctx.fillRect(0, 0, W, H);

      // Pixel rain streaks
      ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
      for (const rp of this.rainParticles) {
        ctx.fillRect(Math.round(rp.x), Math.round(rp.y), 2, Math.round(rp.len));
      }
      // Ground splashes
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.55)';
      ctx.lineWidth = 2;
      for (const sp of this.rainSplashes) {
        ctx.strokeRect(Math.round(sp.x - 4), Math.round(sp.y - 2), 8, 4);
      }
    } else if (weather === 'CLOUDY') {
      ctx.fillStyle = 'rgba(46, 50, 58, 0.11)';
      ctx.fillRect(0, 0, W, H);
    }

    // 3. Subtle Atmospheric Depth Vignette (preserves full center gameplay clarity)
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.36, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
    vig.addColorStop(0, 'rgba(34, 20, 12, 0)');
    vig.addColorStop(1, 'rgba(34, 20, 12, 0.14)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new ACSGame();
});

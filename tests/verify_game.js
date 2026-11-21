// ============================================================================
// TERRITÓRIO VIVO — AUTOMATED QUALITY GATE SUITE (Framework Pillar 4)
// Run via: npm test
// ============================================================================

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function createHarness() {
  const drawCalls = [];
  const storageMap = new Map();
  let elCounter = 0;

  function makeCtx(canvasId) {
    let tx = 0, ty = 0;
    const stack = [];
    return {
      imageSmoothingEnabled: true,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      globalAlpha: 1,
      fillRect() {},
      strokeRect() {},
      clearRect() {},
      drawImage(img, x, y) {
        if (!img) throw new Error(`drawImage called with falsy img on ${canvasId}!`);
        if (canvasId === 'game-canvas') {
          drawCalls.push({ imgId: img.id, x: x + tx, y: y + ty });
        }
      },
      beginPath() {},
      arc() {},
      ellipse() {},
      moveTo() {},
      lineTo() {},
      closePath() {},
      fill() {},
      stroke() {},
      setLineDash() {},
      save() { stack.push([tx, ty]); },
      restore() { [tx, ty] = stack.pop() || [0, 0]; },
      translate(dx, dy) { tx += dx; ty += dy; },
      rotate() {},
      measureText(t) { return { width: (t || '').length * 7 }; },
      fillText() {},
      createLinearGradient() { return { addColorStop() {} }; },
      createRadialGradient() { return { addColorStop() {} }; }
    };
  }

  function makeEl(id) {
    const classes = new Set();
    if (['dialogue-overlay', 'tablet-overlay', 'notebook-overlay', 'phone-overlay', 'map-overlay', 'hotbar-tooltip', 'btn-clear-pin'].includes(id)) {
      classes.add('hidden');
    }
    const listeners = {};
    return {
      id,
      width: id === 'minimap-canvas' ? 196 : (id === 'tactical-map-canvas' ? 780 : 0),
      height: id === 'minimap-canvas' ? 118 : (id === 'tactical-map-canvas' ? 468 : 0),
      style: {},
      dataset: {},
      textContent: '',
      innerHTML: '',
      src: '',
      className: '',
      classList: {
        add(c) { classes.add(c); },
        remove(c) { classes.delete(c); },
        contains(c) { return classes.has(c); },
        toggle(c, force) { force ? classes.add(c) : classes.delete(c); }
      },
      getContext() { return makeCtx(id); },
      getBoundingClientRect() { return { left: 0, top: 0, width: 1366, height: 820 }; },
      toDataURL() { return 'data:image/png;base64,'; },
      addEventListener(ev, fn) { listeners[ev] = listeners[ev] || []; listeners[ev].push(fn); },
      click() { (listeners.click || []).forEach(fn => fn({ preventDefault() {}, stopPropagation() {} })); },
      querySelector() { return null; },
      querySelectorAll() { return []; },
      appendChild() {},
      remove() {},
      blur() {},
      _listeners: listeners
    };
  }

  const els = {};
  const docListeners = {};
  const doc = {
    hidden: false,
    body: makeEl('body'),
    activeElement: { blur() {} },
    getElementById(id) { if (!els[id]) els[id] = makeEl(id); return els[id]; },
    createElement(tag) { return makeEl(`${tag}_${++elCounter}`); },
    querySelectorAll() { return []; },
    addEventListener(ev, fn) { docListeners[ev] = fn; }
  };

  let rafCallback = null;
  let rafCount = 0;
  const winListeners = {};
  const win = {
    document: doc,
    innerWidth: 1366,
    innerHeight: 820,
    localStorage: {
      getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
      setItem: (k, v) => storageMap.set(k, String(v)),
      removeItem: (k) => storageMap.delete(k)
    },
    addEventListener(ev, fn) { winListeners[ev] = winListeners[ev] || []; winListeners[ev].push(fn); },
    performance: { now: () => 250.5 },
    requestAnimationFrame(fn) { rafCallback = fn; rafCount++; return rafCount; },
    cancelAnimationFrame() { rafCallback = null; },
    setTimeout: () => 1,
    setInterval: () => 1,
    clearInterval: () => {},
    Math, JSON, Set, Map, Array, Object, Number, String, parseInt, console
  };
  win.window = win;

  const ctx = vm.createContext(win);
  const scripts = [
    'public/js/core/engine.js',
    'public/js/data.js',
    'public/js/pixelArt.js',
    'public/js/audio.js',
    'public/js/systems/musicDirector.js',
    'public/js/systems/sceneManager.js',
    'public/js/systems/navigation.js',
    'public/js/systems/narrative.js',
    'public/js/systems/storyState.js',
    'public/js/systems/relationships.js',
    'public/js/systems/investigation.js',
    'public/js/systems/notebook.js',
    'public/js/systems/planner.js',
    'public/js/systems/dialogue.js',
    'public/js/systems/dialogueResolver.js',
    'public/js/systems/worldState.js',
    'public/js/systems/endingAssembler.js',
    'public/js/systems/quests.js',
    'public/js/systems/storyEvents.js',
    'public/js/systems/schedule.js',
    'public/js/systems/phone.js',
    'public/js/systems/playerHome.js',
    'public/js/systems/ubsInterior.js',
    'public/js/systems/communitySpaces.js',
    'public/js/game.js'
  ];
  for (const rel of scripts) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx, { filename: rel });
  }

  // Trigger DOMContentLoaded
  (winListeners.DOMContentLoaded || []).forEach(fn => fn());
  if (win.game) {
    win.game.inMainMenu = false;
  }

  return {
    win,
    game: win.game,
    drawCalls,
    stepFrame(ts) {
      assert(rafCallback, 'requestAnimationFrame must remain scheduled!');
      const cb = rafCallback;
      rafCallback = null;
      cb(ts);
    },
    emitWindow(ev, payload) {
      (winListeners[ev] || []).forEach(fn => fn(payload));
    }
  };
}

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}\n    ${err.stack || err.message}`);
    process.exitCode = 1;
  }
}

console.log('Running Território Vivo Quality Gate Suite...\n');

test('1. Regression: Frame-1 negative rAF timestamp does NOT crash and renders ACS player', () => {
  const h = createHarness();
  h.game.closeOverlays();
  h.game.playerHomeSystem.exitHome();
  h.drawCalls.length = 0;
  // Simulate Chromium vsync timestamp earlier than performance.now() (250.5)
  h.stepFrame(240.0);
  assert(h.game.elapsedTime >= 0, 'elapsedTime must never become negative');
  const playerSpriteId = h.win.pixelArt.playerFrames.down[0].id;
  const playerDraw = h.drawCalls.find(d => d.imgId === playerSpriteId);
  assert(playerDraw, 'Player sprite MUST be drawn on Frame 1!');
  assert(playerDraw.x >= 0 && playerDraw.x < 1366, 'Player X must be visible on screen');
  assert(playerDraw.y >= 0 && playerDraw.y < 820, 'Player Y must be visible on screen');
  // Next frame must still run cleanly
  h.stepFrame(256.6);
});

test('2. Map Spatial Integrity: Zero house/dengue/playerHome overlaps with streets & all doors reachable', () => {
  const h = createHarness();
  const g = h.game;
  g.currentLocation = 'OVERWORLD';
  for (const fam of g.families) {
    const baseTopRow = (fam.y - 76) / 32;
    const baseBotRow = (fam.y - 24) / 32;
    const baseLeftCol = (fam.x - 62) / 32;
    const baseRightCol = (fam.x + 62) / 32;
    assert(!(baseBotRow > 11 && baseTopRow < 14), `${fam.id} overlaps North street`);
    assert(!(baseBotRow > 25 && baseTopRow < 28), `${fam.id} overlaps Central street`);
    assert(!(baseBotRow > 39 && baseTopRow < 42), `${fam.id} overlaps South street`);
    assert(!(baseRightCol > 74 && baseLeftCol < 77), `${fam.id} overlaps East street`);
    assert(!g.collides(fam.x, fam.y), `${fam.id} interaction point must not be colliding`);
  }
  // Casa do ACS spatial integrity (clear of river cols 17..18, Estrada do Sol rows 23..25, Av. da Saúde col 25)
  const ph = g.playerHome;
  assert(ph.x - 62 > 19 * 32, 'Casa do ACS must be east of the river');
  assert(ph.x + 62 < 25 * 32, 'Casa do ACS must be west of Av. da Saúde sidewalk');
  assert(!g.collides(ph.x, ph.y), 'Casa do ACS door interaction point must be walkable');

  for (const spot of g.dengueSpots) {
    const col = Math.floor(spot.x / 32);
    const row = Math.floor(spot.y / 32);
    assert.notStrictEqual(g.tileMap[row][col], 'S', `Dengue spot ${spot.id} should not sit in street asphalt`);
  }
});

test('3. Player Movement, Collisions (River + UBS Fence) & Window Blur Key Reset', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();
  g.playerHomeSystem.exitHome();
  const startX = g.player.x;
  const startY = g.player.y;

  g.input.setKey('d', true);
  for (let i = 0; i < 30; i++) g.tick(0.016);
  assert(g.player.x > startX + 50, 'Player should move right when holding D');

  // Window blur must clear stuck keys
  h.emitWindow('blur');
  assert.strictEqual(g.input.isDown('d'), false, 'Blur must clear held keys');

  // River collision (col 17, row 10)
  assert.strictEqual(g.collides(17 * 32 + 16, 10 * 32 + 16), true, 'River must block movement');
  // Bridge walkable (col 17, row 24)
  assert.strictEqual(g.collides(17 * 32 + 16, 24 * 32 + 16), false, 'Wooden bridge must be walkable');
  // UBS west wooden fence solid
  assert.strictEqual(g.collides(3 * 32 + 4, 23 * 32), true, 'UBS wooden fence must collide');
  // Player exit point clear
  assert.strictEqual(g.collides(startX, startY), false, 'Player exit point must be walkable');
});

test('4. Navigation System: Objective Resolution, Manual Pinning & Click-to-Walk', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();
  g.playerHomeSystem.exitHome();
  g.timeMinutes = 9 * 60; // 09:00 so UBS is open

  const autoObj = g.navigation.resolveObjective();
  assert(autoObj && autoObj.type === 'HOUSE', 'Initial overworld auto objective should target an open house');

  g.navigation.setPin({ type: 'HOUSE', id: 'H10' });
  const pinned = g.navigation.resolveObjective();
  assert.strictEqual(pinned.id, 'H10', 'Manual GPS pin should override auto objective');
  assert.strictEqual(pinned.pinned, true);

  // Click-to-walk moves player toward target
  const beforeX = g.player.x;
  g.navigation.setWalkTarget(beforeX + 120, g.player.y);
  for (let i = 0; i < 20; i++) g.tick(0.016);
  assert(g.player.x > beforeX + 20, 'Click-to-walk should move player smoothly');

  // Completing weekly goal switches auto objective to UBS when open
  g.navigation.clearPin();
  g.weeklyVisits = g.weeklyGoal;
  const ubsObj = g.navigation.resolveObjective();
  assert.strictEqual(ubsObj.type, 'UBS', 'Meeting weekly goal while UBS is open must guide player to UBS');
});

test('5. SaveManager Persistence Round-Trip', () => {
  const h = createHarness();
  const g = h.game;
  g.dayIndex = 2;
  g.timeMinutes = 11 * 60 + 30;
  g.dailyVisits = 5;
  g.visitedToday.add('H01');
  g.families[0].bond = 95;
  g.families[1].knownSchedule = true;
  assert.strictEqual(g.saveProgress(), true, 'saveProgress should succeed');

  // Reset in-memory state and reload from SaveManager
  g.dayIndex = 0;
  g.dailyVisits = 0;
  g.visitedToday.clear();
  g.families[0].bond = 10;
  g.families[1].knownSchedule = false;

  assert.strictEqual(g.loadProgress(), true, 'loadProgress should restore saved state');
  assert.strictEqual(g.dayIndex, 2);
  assert.strictEqual(g.dailyVisits, 5);
  assert.strictEqual(g.visitedToday.has('H01'), true);
  assert.strictEqual(g.families[0].bond, 95);
  assert.strictEqual(g.families[1].knownSchedule, true);
});

test('6. Narrative System (M2): All 15 families have unique dialogues for Days 1–5 + bond-reactive Day 5', () => {
  const h = createHarness();
  const g = h.game;
  assert(g.narrative, 'NarrativeSystem should be initialized');

  for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
    for (const fam of g.families) {
      const dlg = g.narrative.getDialogueForFamily(fam, dayIdx);
      assert(dlg && typeof dlg.greeting === 'string' && dlg.greeting.length > 15, `Missing greeting for ${fam.id} day ${dayIdx + 1}`);
      assert(typeof dlg.note === 'string' && dlg.note.length > 5, `Missing clinical note for ${fam.id} day ${dayIdx + 1}`);
      assert(Array.isArray(dlg.choices) && dlg.choices.length >= 2, `Need >= 2 choices for ${fam.id} day ${dayIdx + 1}`);
    }
  }

  // Verify bond-reactive Day 5 payoff on H04 (Seu Tião)
  const tiao = g.families.find(f => f.id === 'H04');
  tiao.bond = 30;
  const lowDlg = g.narrative.getDialogueForFamily(tiao, 4);
  tiao.bond = 80;
  const highDlg = g.narrative.getDialogueForFamily(tiao, 4);
  assert.notStrictEqual(lowDlg.greeting, highDlg.greeting, 'Day 5 dialogue for H04 should react to bond level');

  // Verify longitudinal flag & bonus goal evaluation on Day 3
  g.dayIndex = 2;
  g.narrative.recordVisit(tiao, { type: 'EMPATHY', flag: 'vaccine_myth_busted' }, true);
  const bonus3 = g.narrative.evaluateBonusGoal(2);
  assert.strictEqual(bonus3.met, true, 'Day 3 bonus goal should be met after vaccine_myth_busted');

  // Verify SaveManager persists narrative flags
  assert.strictEqual(g.saveProgress(), true);
  g.narrative.reset();
  assert.strictEqual(g.loadProgress(), true);
  assert.strictEqual(g.narrative.flags.vaccine_myth_busted, true, 'Narrative flags should survive save/load');
});

test('7. Audio & Ambience System (M3): Volume, mute toggle, footstep & ambience update', () => {
  const h = createHarness();
  const g = h.game;
  const sfx = h.win.sfx;
  assert(sfx, 'SoundFX should be attached to window.sfx');

  const initialEnabled = sfx.enabled;
  g.toggleAudioMute();
  assert.strictEqual(sfx.enabled, !initialEnabled, 'toggleAudioMute should flip enabled state');
  g.toggleAudioMute();
  assert.strictEqual(sfx.enabled, initialEnabled, 'second toggleAudioMute should restore state');

  sfx.setVolume(0.45);
  assert.strictEqual(sfx.volume, 0.45, 'setVolume should update volume');

  // Ensure footstep & updateAmbience do not throw in headless/non-AudioContext environments
  sfx.footstep('G');
  sfx.footstep('B');
  sfx.footstep('I');
  sfx.footstep('E');
  sfx.door();
  sfx.updateAmbience(0.016, { weather: 'RAIN', hourFloat: 17.5, nearStream: true, umbrellaOpen: true, paused: false, indoor: true });
});

test('8. UBS Interior: Enterable from Overworld (when open), Reception, Water Cooler & All Healthcare Staff', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();
  g.playerHomeSystem.exitHome();
  g.timeMinutes = 9 * 60; // 09:00 Monday -> UBS open

  // Interacting with UBS door during open hours must enter UBS_INTERIOR
  g.player.x = g.ubs.doorX;
  g.player.y = g.ubs.doorY + 24;
  g.checkNearbyInteractions();
  assert(g.nearTarget && g.nearTarget.type === 'UBS', 'Should detect UBS door in Overworld');
  g.triggerInteraction();
  assert.strictEqual(g.currentLocation, 'UBS_INTERIOR', 'Pressing interact at UBS door must enter UBS_INTERIOR');
  assert.strictEqual(g.collides(g.player.x, g.player.y), false, 'UBS interior spawn must be walkable');

  // Verify rendering & updating inside UBS_INTERIOR works cleanly
  h.drawCalls.length = 0;
  g.tick(0.016);
  assert(h.drawCalls.length > 0, 'UBS_INTERIOR should render room, furniture, staff, and player');

  // Verify all requested professional roles exist inside UBS_INTERIOR
  const ubsStaff = g.ubsInterior.getStaffInRoom('UBS_INTERIOR');
  const roles = ubsStaff.map(s => s.roleKey);
  ['fisioterapeuta', 'medico', 'escriturario', 'vigia', 'limpeza'].forEach(reqRole => {
    assert(roles.includes(reqRole), `UBS_INTERIOR must include role: ${reqRole}`);
  });
  const nurses = ubsStaff.filter(s => s.roleKey === 'enfermeiro');
  assert(nurses.length >= 2, 'UBS_INTERIOR must include enfermeiros (plural, >=2)');

  // Verify each staff member has a sprite, portrait, dialogue, and reachable interaction
  for (const s of ubsStaff) {
    const spr = h.win.pixelArt.getStaffSprite(s.id, s.appearance);
    assert(Array.isArray(spr) && spr.length === 2, `Staff ${s.id} must have 2-frame sprite`);
    const dlg = g.ubsInterior.getStaffDialogueContent(s);
    assert(dlg && dlg.greeting.length > 15 && dlg.choices.length >= 2, `Staff ${s.id} must have rich dialogue`);
    g.ubsInterior.openStaffDialogue(s);
    assert.strictEqual(g.paused, true, `Opening dialogue with ${s.id} should pause simulation`);
    g.closeOverlays();
  }

  // Test Water Cooler station inside Reception
  g.player.hydration = 40;
  const water = g.inventory.find(i => i.id === 'water');
  water.count = 1;
  g.ubsInterior.useWaterCooler();
  assert.strictEqual(g.player.hydration, 100, 'UBS Water Cooler must restore hydration to 100%');
  assert.strictEqual(water.count, water.maxCount, 'UBS Water Cooler must refill water bottle');
});

test('9. Visitable Sala ESF inside UBS: ACS Colleagues, Supply Locker, e-SUS & Clean Exits', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();
  g.ubsInterior.enterUBS();

  // Walk to Sala ESF door inside UBS and enter
  const esfDoor = g.ubsInterior.doors.UBS_INTERIOR.find(d => d.id === 'door_esf');
  assert(esfDoor, 'UBS_INTERIOR must have a door to Sala ESF');
  g.player.x = esfDoor.x;
  g.player.y = esfDoor.y + 12;
  assert.strictEqual(g.collides(g.player.x, g.player.y), false, 'Approach point in front of Sala ESF door must be walkable');
  g.checkNearbyInteractions();
  assert(g.nearTarget && g.nearTarget.type === 'INTERIOR_DOOR' && g.nearTarget.door.id === 'door_esf', 'Should detect Sala ESF door');
  g.triggerInteraction();

  assert.strictEqual(g.currentLocation, 'ESF_ROOM', 'Interacting with ESF door must enter ESF_ROOM');
  assert.strictEqual(g.collides(g.player.x, g.player.y), false, 'ESF_ROOM spawn must be walkable');

  // Verify ACS colleagues inside Sala ESF
  const acsColleagues = g.ubsInterior.getStaffInRoom('ESF_ROOM').filter(s => s.roleKey === 'acs');
  assert(acsColleagues.length >= 3, 'ESF_ROOM must contain fellow ACS colleagues (>=3)');
  for (const col of acsColleagues) {
    g.ubsInterior.openStaffDialogue(col);
    g.closeOverlays();
  }

  // Verify render & Supply Locker inside Sala ESF
  h.drawCalls.length = 0;
  g.tick(0.016);
  assert(h.drawCalls.length > 0, 'ESF_ROOM should render cleanly');

  g.inventory.forEach(i => { i.count = 0; });
  g.ubsInterior.useSupplyLocker();
  g.inventory.forEach(i => {
    assert.strictEqual(i.count, i.maxCount, `ESF Supply Locker must refill ${i.id}`);
  });

  // Exit ESF_ROOM -> UBS_INTERIOR -> OVERWORLD
  g.ubsInterior.exitESF();
  assert.strictEqual(g.currentLocation, 'UBS_INTERIOR', 'Exiting Sala ESF must return to UBS_INTERIOR');
  assert.strictEqual(g.collides(g.player.x, g.player.y), false, 'Return spawn outside ESF door must be walkable');

  g.ubsInterior.exitUBS();
  assert.strictEqual(g.currentLocation, 'OVERWORLD', 'Exiting UBS must return to OVERWORLD');
  assert.strictEqual(g.collides(g.player.x, g.player.y), false, 'Overworld UBS exit spawn must be walkable');
});

test('10. SaveManager Persistence inside UBS Interior & Sala ESF', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();
  g.timeMinutes = 9 * 60;
  g.ubsInterior.enterUBS();
  g.ubsInterior.enterESF();
  g.ubsInterior.talkedToday.add('acs_joana');
  g.ubsInterior.coffeeUsedToday = true;
  assert.strictEqual(g.saveProgress(), true, 'saveProgress inside ESF_ROOM should succeed');

  g.currentLocation = 'OVERWORLD';
  g.ubsInterior.resetDaily();
  assert.strictEqual(g.loadProgress(), true, 'loadProgress should succeed');
  assert.strictEqual(g.currentLocation, 'ESF_ROOM', 'loadProgress must restore ESF_ROOM location');
  assert.strictEqual(g.ubsInterior.talkedToday.has('acs_joana'), true, 'talkedToday must persist');
  assert.strictEqual(g.ubsInterior.coffeeUsedToday, true, 'coffeeUsedToday must persist');
});

test('11. Phase 1 — Casa do ACS (PLAYER_HOME): Wakeup, Clay Filter, Coffee, Bed Nap vs Sleep & Exit/Re-enter', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  // Game starts at 07:00 inside PLAYER_HOME
  assert.strictEqual(g.currentLocation, 'PLAYER_HOME', 'Game should start inside Casa do ACS (PLAYER_HOME)');
  assert.strictEqual(g.timeMinutes, 7 * 60, 'Day should start at 07:00');
  assert.strictEqual(g.collides(g.player.x, g.player.y), false, 'PLAYER_HOME wake spawn must be walkable');

  // Test Clay Filter & Coffee Corner
  g.player.hydration = 30;
  g.player.stamina = 50;
  g.playerHomeSystem.useClayFilter();
  assert.strictEqual(g.player.hydration, 100, 'Clay filter must restore 100% hydration');
  g.playerHomeSystem.useCoffeeCorner();
  assert(g.player.stamina >= 80, 'Morning coffee should boost stamina');
  assert.strictEqual(g.playerHomeSystem.coffeeUsedToday, true);

  // Bed before 17:00 takes a 1h nap instead of ending the day
  const dayBeforeNap = g.dayOfWeek;
  g.timeMinutes = 10 * 60;
  g.playerHomeSystem.useBed();
  assert.strictEqual(g.dayOfWeek, dayBeforeNap, 'Bed before 17:00 should nap, not advance day');
  assert.strictEqual(g.timeMinutes, 11 * 60, 'Nap should advance clock by 1 hour');

  // Exit to Overworld & re-enter via front door
  g.playerHomeSystem.exitHome();
  assert.strictEqual(g.currentLocation, 'OVERWORLD');
  g.player.x = g.playerHome.x;
  g.player.y = g.playerHome.y + 10;
  g.checkNearbyInteractions();
  assert(g.nearTarget && g.nearTarget.type === 'PLAYER_HOME', 'Should detect Casa do ACS door in Overworld');
  g.triggerInteraction();
  assert.strictEqual(g.currentLocation, 'PLAYER_HOME', 'Interacting with Casa do ACS door must enter PLAYER_HOME');

  // Bed at/after 17:00 sleeps and advances to next day at 07:00
  g.timeMinutes = 18 * 60;
  g.playerHomeSystem.useBed();
  assert.strictEqual(g.dayOfWeek, dayBeforeNap + 1, 'Sleeping after 17:00 must advance to next day');
  assert.strictEqual(g.timeMinutes, 7 * 60, 'Next day starts at 07:00');
  assert.strictEqual(g.currentLocation, 'PLAYER_HOME', 'Player wakes up inside Casa do ACS');
});

test('12. Phase 1 — UBS Operating Hours (08h–18h Mon–Fri), Bench Rest & 22:30 Late Night Return', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();
  g.playerHomeSystem.exitHome();

  // At 07:00 Monday, UBS is closed
  g.timeMinutes = 7 * 60;
  assert.strictEqual(g.isUBSOpen(), false, 'UBS must be closed at 07:00');
  g.player.x = g.ubs.doorX;
  g.player.y = g.ubs.doorY + 24;
  g.checkNearbyInteractions();
  g.triggerInteraction();
  assert.strictEqual(g.currentLocation, 'OVERWORLD', 'Cannot enter UBS before 08:00');

  // At 09:00 Monday, UBS is open; hitting 18:00 inside UBS politely escorts player out
  g.timeMinutes = 9 * 60;
  assert.strictEqual(g.isUBSOpen(), true, 'UBS must be open at 09:00 Monday');
  g.triggerInteraction();
  assert.strictEqual(g.currentLocation, 'UBS_INTERIOR');
  g.timeMinutes = 18 * 60 + 1;
  g.tick(0.016);
  assert.strictEqual(g.currentLocation, 'OVERWORLD', 'UBS closing at 18:00 must escort player outside');

  // Saturday (dayOfWeek = 5) -> UBS closed all day
  g.dayOfWeek = 5;
  g.timeMinutes = 10 * 60;
  assert.strictEqual(g.isUBSOpen(), false, 'UBS must be closed on Saturdays');

  // Bench rest advances 1h & restores stamina
  g.dayOfWeek = 0;
  g.timeMinutes = 14 * 60;
  g.player.stamina = 40;
  g.restOnBench();
  assert.strictEqual(g.timeMinutes, 15 * 60, 'Bench rest must advance clock by 1h');
  assert.strictEqual(g.player.stamina, 65, 'Bench rest must restore +25 stamina');

  // 22:30 outside returns player home gently (waking at 07:30 with 75 stamina, no Game Over)
  g.timeMinutes = 22.5 * 60;
  g.tick(0.016);
  assert.strictEqual(g.dayOfWeek, 1, 'Late night 22:30 must advance to next day');
  assert.strictEqual(g.currentLocation, 'PLAYER_HOME');
  assert.strictEqual(g.timeMinutes, 7 * 60 + 30, 'Late night wake up should be 07:30');
  assert.strictEqual(g.player.stamina, 75, 'Late night wake up should start with 75% stamina');
});

test('13. Phase 1 — Sunday Turnaround & Continuous Weeks + Weekly Priorities', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  assert.strictEqual(g.weekNumber, 1);
  assert.strictEqual(g.weeklyPriorities.length, 4, 'Each week must select 4 priority families');

  // Simulate Saturday night sleep -> opens Sunday Weekly Summary modal
  let weekEndedPayload = null;
  g.events.on('week:ended', (p) => { weekEndedPayload = p; });
  g.dayOfWeek = 5;
  g.weeklyVisits = 10;
  g.families[0].bond = 92;
  g.sleepToNextDay('SLEEP');
  assert(weekEndedPayload && weekEndedPayload.weekNumber === 1, 'week:ended event must fire on Saturday sleep');
  assert.strictEqual(g.paused, true, 'Sunday Weekly Summary modal must pause game');

  // Start Week 2
  g.startNewWeek();
  assert.strictEqual(g.weekNumber, 2, 'Should advance to Week 2');
  assert.strictEqual(g.dayOfWeek, 0, 'Week 2 must start on Monday');
  assert.strictEqual(g.weeklyVisits, 0, 'Weekly visits reset for new week');
  assert.strictEqual(g.families[0].bond, 92, 'Family bonds must persist across weeks');
});

test('14. Phase 1 — Multi-Turn DialogueSystem (Pilot Graphs, Spoiler-Free Mode & Legacy Adapter)', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  // Spoiler-free by default
  assert.strictEqual(g.dialogue.showHints, false, 'Dialogue spoilers/hints must be OFF by default');

  // Verify all 5 pilot multi-turn graphs exist and have >= 2 nodes
  ['H01', 'H04', 'H13', 'medico', 'acs_joana'].forEach(id => {
    const graph = g.dialogue.getPilotGraph(id);
    assert(graph && graph.startNode && Object.keys(graph.nodes).length >= 2, `Pilot graph ${id} must have >=2 nodes`);
  });

  // Walk through H04 (Seu Tião) multi-turn pilot conversation and verify dialogue:choice event
  let choiceEvents = 0;
  g.events.on('dialogue:choice', () => { choiceEvents++; });
  const tiao = g.families.find(f => f.id === 'H04');
  const startBond = tiao.bond;
  g.timeMinutes = 9 * 60;
  g.visitHouse(tiao);
  const gH04 = g.dialogue.activeSession.graph;
  assert.strictEqual(gH04.startNode, 'portao', 'Seu Tião should open with multi-turn pilot graph');
  // Pick turn 1 empathetic choice -> moves to 'domino_abertura'
  g.dialogue.selectChoice('portao', gH04.nodes.portao.choices[0], 0);
  // Pick turn 2 analogy choice -> resolves visit & increases bond
  g.dialogue.selectChoice('domino_abertura', gH04.nodes.domino_abertura.choices[0], 0);
  assert(tiao.bond > startBond, 'Multi-turn empathetic path must increase bond');
  assert.strictEqual(choiceEvents, 2, 'dialogue:choice event must emit on every turn');
  assert.strictEqual(g.weeklyVisits, 1, 'Completing visit must increment weeklyVisits');
});

test('15. Phase 1 — SaveManager v1 -> v2 Automatic Migration & v2 Persistence', () => {
  const h = createHarness();
  const g = h.game;

  // Inject a legacy v1 save into localStorage
  h.win.localStorage.setItem('territorio_vivo_acs_save_v1', JSON.stringify({
    version: 1,
    savedAt: Date.now(),
    data: {
      dayIndex: 3,
      timeMinutes: 11 * 60,
      dailyVisits: 7,
      visitedToday: ['H01', 'H07'],
      currentLocation: 'OVERWORLD',
      families: [{ id: 'H01', bond: 99, knownSchedule: true }]
    }
  }));

  assert.strictEqual(g.loadProgress(), true, 'SaveManager must automatically migrate v1 saves to v2');
  assert.strictEqual(g.weekNumber, 1);
  assert.strictEqual(g.dayOfWeek, 3);
  assert.strictEqual(g.weeklyVisits, 7);
  assert.strictEqual(g.families[0].bond, 99);

  // Save in v2 inside PLAYER_HOME with Week 2 and reload
  g.weekNumber = 2;
  g.dayOfWeek = 5;
  g.currentLocation = 'PLAYER_HOME';
  g.dialogue.showHints = true;
  assert.strictEqual(g.saveProgress(), true);

  g.weekNumber = 1;
  g.dayOfWeek = 0;
  g.currentLocation = 'OVERWORLD';
  g.dialogue.showHints = false;
  assert.strictEqual(g.loadProgress(), true);
  assert.strictEqual(g.weekNumber, 2);
  assert.strictEqual(g.dayOfWeek, 5);
  assert.strictEqual(g.currentLocation, 'PLAYER_HOME');
  assert.strictEqual(g.dialogue.showHints, true);
});

test('16. Phase 2 — Expanded 80x56 Map Spatial Integrity (Vendinha, Pracinha, Associação & Horta)', () => {
  const h = createHarness();
  const g = h.game;
  g.currentLocation = 'OVERWORLD';
  assert(g.COLS >= 80);
  assert.strictEqual(g.ROWS, 56);
  assert.strictEqual(g.worldHeight, 56 * 32);

  // Vendinha, Associação, Pracinha & Horta entry/center points must be walkable
  assert.strictEqual(g.collides(g.vendinha.x, g.vendinha.y), false, 'Vendinha entrance must be walkable');
  assert.strictEqual(g.collides(g.associacao.x, g.associacao.y), false, 'Associação entrance must be walkable');
  assert.strictEqual(g.collides(g.pracinha.x, g.pracinha.y), false, 'Pracinha center must be walkable');
  assert.strictEqual(g.collides(g.horta.x, g.horta.y), false, 'Horta center must be walkable');
  // Horta gate walkable (col 65, row 47.5) & Horta north fence solid (col 68, row 44)
  assert.strictEqual(g.collides(65 * 32 + 4, 47.5 * 32), false, 'Horta gate must be walkable');
  assert.strictEqual(g.collides(68 * 32, 44 * 32 + 4), true, 'Horta north fence must collide');
});

test('17. Phase 2 — Vendinha do Zé (Hours, Interior, Seu Zé Multi-Turn & Coffee)', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  // Closed at 22:00
  g.dayOfWeek = 0;
  g.timeMinutes = 22 * 60;
  assert.strictEqual(g.communitySpaces.isVendinhaOpen(), false, 'Vendinha must be closed at 22:00');

  // Open at 10:00 Monday -> enter Vendinha
  g.timeMinutes = 10 * 60;
  assert.strictEqual(g.communitySpaces.isVendinhaOpen(), true, 'Vendinha must be open at 10:00');
  g.communitySpaces.enterVendinha();
  assert.strictEqual(g.currentLocation, 'VENDINHA');
  assert.strictEqual(g.collides(g.player.x, g.player.y), false, 'Vendinha spawn must be walkable');

  // Render & Seu Zé dialogue + coffee buff
  h.drawCalls.length = 0;
  g.tick(0.016);
  assert(h.drawCalls.length > 0, 'VENDINHA interior should render cleanly');

  g.player.stamina = 60;
  g.communitySpaces.openSeuZeDialogue();
  const graph = g.dialogue.activeSession.graph;
  g.dialogue.selectChoice(graph.startNode, graph.nodes[graph.startNode].choices[0], 0);
  assert(g.player.stamina >= 75, 'Seu Zé coffee choice must restore +15 stamina');
  assert.strictEqual(g.communitySpaces.vendinhaCoffeeUsedToday, true);
  g.closeOverlays();

  g.communitySpaces.exitVendinha();
  assert.strictEqual(g.currentLocation, 'OVERWORLD');
});

test('18. Phase 2 — Associação de Moradores, Tia Bete & Projects Board', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();
  g.dayOfWeek = 2; // Wednesday
  g.timeMinutes = 15 * 60;

  assert.strictEqual(g.communitySpaces.isAssociacaoOpen(), true);
  g.communitySpaces.enterAssociacao();
  assert.strictEqual(g.currentLocation, 'ASSOCIACAO');
  assert.strictEqual(g.collides(g.player.x, g.player.y), false, 'Associação spawn must be walkable');

  // Tia Bete multi-turn dialogue
  g.communitySpaces.openTiaBeteDialogue();
  const graph = g.dialogue.activeSession.graph;
  g.dialogue.selectChoice(graph.startNode, graph.nodes[graph.startNode].choices[0], 0);
  g.dialogue.selectChoice('pautas_vila', graph.nodes.pautas_vila.choices[0], 0);
  assert.strictEqual(g.narrative.flags.tia_bete_ally, true);
  g.closeOverlays();

  // Projects Board
  g.communitySpaces.openProjectsBoard();
  assert.strictEqual(g.paused, true);
  g.closeOverlays();

  // Saturday morning Tia Bete is outside by the Horta
  g.communitySpaces.exitAssociacao();
  g.dayOfWeek = 5;
  g.timeMinutes = 10 * 60;
  assert.strictEqual(g.communitySpaces.isTiaBeteAtHorta(), true, 'Tia Bete should be at Horta on Saturday mornings');
});

test('19. Phase 2 — Dona Carla (Weekly Visitor Mon Morning & Fri Afternoon inside UBS)', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  // Monday 09:30 -> Present at UBS
  g.dayOfWeek = 0;
  g.timeMinutes = 9.5 * 60;
  assert.strictEqual(g.communitySpaces.isDonaCarlaAtUBS(), true, 'Dona Carla must be at UBS Monday 09:30');

  // Tuesday 09:30 -> Absent
  g.dayOfWeek = 1;
  assert.strictEqual(g.communitySpaces.isDonaCarlaAtUBS(), false, 'Dona Carla must be absent on Tuesday');

  // Friday 15:00 -> Present at UBS & dialogue sets flag
  g.dayOfWeek = 4;
  g.timeMinutes = 15 * 60;
  assert.strictEqual(g.communitySpaces.isDonaCarlaAtUBS(), true, 'Dona Carla must be at UBS Friday 15:00');
  g.ubsInterior.enterUBS();
  g.communitySpaces.openDonaCarlaDialogue();
  const graph = g.dialogue.activeSession.graph;
  g.dialogue.selectChoice(graph.startNode, graph.nodes[graph.startNode].choices[0], 0);
  assert.strictEqual(g.narrative.flags.dona_carla_met, true);
  g.closeOverlays();
});

test('20. Phase 2 — Dynamic Weekly Schedules (Feira Tue, Assoc Wed, Dominó Thu, Vendinha Night) & Informal Encounters', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  const tonho = g.families.find(f => f.id === 'H14');
  const tiao = g.families.find(f => f.id === 'H04');
  const raimundo = g.families.find(f => f.id === 'H07');
  const marcos = g.families.find(f => f.id === 'H02');

  // Tuesday 09:00 -> Seu Tonho at Feira (not at HOME, no duplicate!)
  g.dayOfWeek = 1;
  g.timeMinutes = 9 * 60;
  assert.strictEqual(g.schedule.isFeiraActive(), true);
  const tonhoLoc = g.schedule.getFamilyLocation(tonho);
  assert.strictEqual(tonhoLoc.type, 'PRACA_FEIRA');
  assert.strictEqual(g.isFamilyAtHome(tonho), false, 'Resident at Feira must not also be at HOME');

  // Wednesday 15:00 -> Seu Raimundo at Associação
  g.dayOfWeek = 2;
  g.timeMinutes = 15 * 60;
  assert.strictEqual(g.schedule.getFamilyLocation(raimundo).type, 'ASSOCIACAO');

  // Thursday 17:00 -> Seu Tião at Pracinha Dominó; informal talk gives +5 bond without counting as clinical visit
  g.dayOfWeek = 3;
  g.timeMinutes = 17 * 60;
  const tiaoLoc = g.schedule.getFamilyLocation(tiao);
  assert.strictEqual(tiaoLoc.type, 'PRACA_DOMINO');
  const oldBond = tiao.bond;
  const oldVisits = g.weeklyVisits;
  g.schedule.openInformalEncounter(tiao, tiaoLoc);
  const sGraph = g.dialogue.activeSession.graph;
  g.dialogue.selectChoice(sGraph.startNode, sGraph.nodes[sGraph.startNode].choices[0], 0);
  assert.strictEqual(tiao.bond, oldBond + 5, 'Informal social encounter must boost bond by +5');
  assert.strictEqual(g.weeklyVisits, oldVisits, 'Informal social encounter must not count as clinical visit');
  g.closeOverlays();

  // Monday 19:00 -> Marcos at Vendinha
  g.dayOfWeek = 0;
  g.timeMinutes = 19 * 60;
  assert.strictEqual(g.schedule.getFamilyLocation(marcos).type, 'VENDINHA');
});

test('21. Phase 2 — Personal Smartphone (PhoneSystem): Group Messages, Read Badge & Persistence', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  const initialCount = g.phone.messages.length;
  g.events.emit('time:hourChanged', { weekNumber: 1, dayOfWeek: 1, hour: 7 });
  assert(g.phone.messages.length > initialCount, 'Tuesday 07h event should trigger Feira message in Grupo da Vila');
  assert(g.phone.unreadCount > 0);

  // Opening phone in group tab clears unreadCount
  g.phone.activeTab = 'group';
  g.phone.toggle(true);
  assert.strictEqual(g.paused, true);
  assert.strictEqual(g.phone.unreadCount, 0, 'Viewing Grupo da Vila must clear unreadCount');
  g.closeOverlays();

  // Persistence round-trip for phone + community + VENDINHA location
  g.dayOfWeek = 0;
  g.timeMinutes = 10 * 60;
  g.communitySpaces.enterVendinha();
  g.communitySpaces.vendinhaCoffeeUsedToday = true;
  assert.strictEqual(g.saveProgress(), true);

  g.currentLocation = 'OVERWORLD';
  g.communitySpaces.resetDaily();
  g.phone.messages = [];
  assert.strictEqual(g.loadProgress(), true);
  assert.strictEqual(g.currentLocation, 'VENDINHA', 'loadProgress must restore VENDINHA location');
  assert.strictEqual(g.communitySpaces.vendinhaCoffeeUsedToday, true);
  assert(g.phone.messages.length > initialCount, 'Phone messages must survive save/load');
});

test('22. Story Mode H1 — StoryState, npcBonds, Expiring recentFlags & SaveManager v2 -> v3 Migration', () => {
  const h = createHarness();
  const g = h.game;

  // Verify initial npcBonds roster (10 UBS staff + 3 community NPCs)
  assert.strictEqual(Object.keys(h.win.ACS_DEFAULT_NPC_BONDS).length, 13, 'Must track 13 non-family NPCs');
  assert.strictEqual(g.storyState.getNpcBond('npc_dona_carla'), 30);
  assert.strictEqual(g.storyState.getNpcBond('acs_joana'), 55);

  // Simulate legacy v2 save migration -> v3
  h.win.localStorage.setItem('territorio_vivo_acs_save_v1', JSON.stringify({
    version: 2,
    savedAt: Date.now(),
    data: {
      weekNumber: 2,
      dayOfWeek: 2,
      dayIndex: 2,
      timeMinutes: 14 * 60,
      weeklyVisits: 11,
      weeklyPriorities: ['H01', 'H04'],
      currentLocation: 'UBS_INTERIOR',
      narrative: { visitHistory: {}, flags: { tia_bete_ally: true } }
    }
  }));

  assert.strictEqual(g.loadProgress(), true, 'SaveManager must automatically migrate v2 saves to v3');
  assert.strictEqual(g.weekNumber, 2);
  assert.strictEqual(g.currentLocation, 'UBS_INTERIOR');
  assert.strictEqual(g.storyState.hasFlag('tia_bete_ally'), true, 'v2 narrative flags must mirror into StoryState v3');

  // Expiring recentFlags & full v3 round-trip
  g.storyState.chapter = 1;
  g.storyState.addPosture('acolhimento', 3);
  g.storyState.addNpcBond('escriturario', 12);
  g.storyState.setRecentFlag('temp_reacao', 'ok', 2); // expires after totalDay + 2
  g.storyState.markEventCompleted('evt_intro_esf');
  assert.strictEqual(g.saveProgress(), true);

  g.storyState.reset();
  assert.strictEqual(g.storyState.chapter, 0);
  assert.strictEqual(g.loadProgress(), true);
  assert.strictEqual(g.storyState.chapter, 1);
  assert.strictEqual(g.storyState.getPosture('acolhimento'), 3);
  assert.strictEqual(g.storyState.getNpcBond('escriturario'), 47);
  assert.strictEqual(g.storyState.getRecentFlag('temp_reacao'), 'ok');
  assert.strictEqual(g.storyState.isEventCompleted('evt_intro_esf'), true);

  // Advance days until beyond TTL and verify day:started prunes expired recentFlags
  g.weekNumber = 3;
  g.dayOfWeek = 1;
  g.events.emit('day:started', { weekNumber: 3, dayOfWeek: 1 });
  assert.strictEqual(g.storyState.getRecentFlag('temp_reacao'), undefined, 'Expired recentFlag must be pruned on new day');
});

test('23. Story Mode H1 — DialogueSystem v2 Multi-Speaker Switching, Conditions & Narrative Effects', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  const joana = g.ubsInterior.staff.find(s => s.id === 'acs_joana');
  const startMedicoBond = g.storyState.getNpcBond('medico');
  const startJoanaBond = g.storyState.getNpcBond('acs_joana');

  // Test multi-speaker graph (esf_alinhamento_h1: acs_joana -> medico -> acs_joana) + conditional choice restoration
  const customGraph = {
    startNode: 'turn1',
    nodes: {
      turn1: {
        speaker: 'acs_joana',
        text: 'Joana abre a conversa.',
        choices: [
          {
            text: 'Chamar o Dr. Henrique.',
            next: 'turn2_medico',
            effects: { npcBondDelta: { acs_joana: 4 }, postureDelta: { articulacao: 1 } }
          },
          {
            text: 'Escolha bloqueada sem flag.',
            conditions: { hasFlags: ['never_set_flag'] },
            reply: 'Nunca aparece.'
          }
        ]
      },
      turn2_medico: {
        speaker: 'medico',
        text: 'Dr. Henrique assume a fala e muda o retrato!',
        choices: [
          {
            text: 'Voltar para a fala base sem speaker explícito.',
            next: 'turn3_restored',
            effects: {
              npcBondDelta: { medico: 6 },
              postureDelta: { acolhimento: 2 },
              setFlags: { h1_multifalante_ok: true },
              setRecentFlags: { alinhamento_recente: true }
            }
          }
        ]
      },
      turn3_restored: {
        // Omits speaker -> must restore baseSpeaker (acs_joana)
        text: 'Joana retoma a palavra no final.',
        choices: [
          {
            text: 'Encerrar.',
            effects: { staminaDelta: 5 },
            reply: 'Fim da reunião!'
          }
        ]
      }
    }
  };

  g.dialogue.startGraph({
    entityType: 'STAFF',
    entityData: joana,
    entityId: joana.id,
    tag: joana.sector,
    name: `${joana.name} • ${joana.role}`,
    badgesHtml: '<span class="badge amigo">ESF</span>',
    bondPct: startJoanaBond,
    bondText: `${startJoanaBond}%`,
    graph: customGraph
  });

  // Condition filtering check
  const renderedChoices = h.win.document.getElementById('dlg-choices');
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'acs_joana');
  assert.strictEqual(h.win.document.getElementById('dlg-name').textContent.includes('Joana'), true);

  // Advance to medico speaker node
  g.dialogue.selectChoice('turn1', customGraph.nodes.turn1.choices[0], 0);
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'medico', 'Speaker must switch dynamically to Dr. Henrique');
  assert.strictEqual(h.win.document.getElementById('dlg-name').textContent.includes('Dr. Henrique'), true);

  // Advance to turn3_restored (omits speaker -> restores baseSpeaker Joana)
  g.dialogue.selectChoice('turn2_medico', customGraph.nodes.turn2_medico.choices[0], 0);
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'acs_joana', 'Omitting node.speaker must restore session baseSpeaker');
  assert.strictEqual(h.win.document.getElementById('dlg-name').textContent.includes('Joana'), true);

  // Leaf resolution + side effects check
  g.dialogue.selectChoice('turn3_restored', customGraph.nodes.turn3_restored.choices[0], 0);
  assert.strictEqual(g.storyState.getNpcBond('acs_joana'), startJoanaBond + 4);
  assert.strictEqual(g.storyState.getNpcBond('medico'), startMedicoBond + 6);
  assert.strictEqual(g.storyState.getPosture('articulacao'), 1);
  assert.strictEqual(g.storyState.getPosture('acolhimento'), 2);
  assert.strictEqual(g.storyState.hasFlag('h1_multifalante_ok'), true);
  assert.strictEqual(g.storyState.hasRecentFlag('alinhamento_recente'), true);
  assert.strictEqual(!!renderedChoices, true);
  g.closeOverlays();
});

test('24. Story Mode H1 — DialogueResolver Priority, Staff/Community Bond Gains & Cross-Character Reactions', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  // 1. Talking to Dona Carla once increments her npcBond by +3 (capped 1x/day) and sets dona_carla_met
  g.dayOfWeek = 0;
  g.timeMinutes = 9.5 * 60;
  const carlaBefore = g.storyState.getNpcBond('npc_dona_carla');
  const renanBefore = g.storyState.getNpcBond('escriturario');

  g.ubsInterior.enterUBS();
  g.communitySpaces.openDonaCarlaDialogue();
  let graph = g.dialogue.activeSession.graph;
  g.dialogue.selectChoice(graph.startNode, graph.nodes[graph.startNode].choices[0], 0); // sets dona_carla_met
  assert.strictEqual(g.storyState.getNpcBond('npc_dona_carla'), carlaBefore + 3);
  assert.strictEqual(g.storyState.hasFlag('dona_carla_met'), true);
  g.closeOverlays();

  // Second talk same day does not stack the +3 daily greet bonus
  g.communitySpaces.openDonaCarlaDialogue();
  assert.strictEqual(g.storyState.getNpcBond('npc_dona_carla'), carlaBefore + 3);
  g.closeOverlays();

  // 2. Talking to Renan now triggers reactive dialogue referencing Dona Carla!
  const renan = g.ubsInterior.staff.find(s => s.id === 'escriturario');
  g.ubsInterior.openStaffDialogue(renan);
  graph = g.dialogue.activeSession.graph;
  assert.strictEqual(graph.startNode, 'renan_guiche', 'Renan must react to prior dona_carla_met decision');
  // Choose empathetic mediation (adds +3 daily npc:talked + 8 npcBondDelta on escriturario)
  g.dialogue.selectChoice('renan_guiche', graph.nodes.renan_guiche.choices[0], 0);
  assert.strictEqual(g.storyState.hasFlag('ubs_clima_mediado') || g.storyState.hasRecentFlag('ubs_clima_mediado'), true);
  assert.strictEqual(g.storyState.getNpcBond('escriturario'), renanBefore + 11);
  g.dialogue.selectChoice('renan_escuta', graph.nodes.renan_escuta.choices[0], 0);
  g.closeOverlays();

  // 3. Talking to Joana after q0_joana_acolheu & joana_schedule_tip opens multi-speaker ESF scene (Joana + Dr. Henrique)
  g.storyState.setFlag('q0_joana_acolheu', true);
  g.quests.evaluateAll({ silent: true });
  g.storyState.setFlag('joana_schedule_tip', true);
  const joana = g.ubsInterior.staff.find(s => s.id === 'acs_joana');
  g.ubsInterior.openStaffDialogue(joana);
  assert.strictEqual(g.dialogue.activeSession.graph.startNode, 'joana_abre', 'Joana must open H1 multi-speaker ESF scene');
  g.dialogue.selectChoice('joana_abre', g.dialogue.activeSession.graph.nodes.joana_abre.choices[0], 0);
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'medico');
  g.closeOverlays();

  // 4. H04 pilot followed by reactive follow-up on later visit
  g.ubsInterior.exitUBS();
  const tiao = g.families.find(f => f.id === 'H04');
  g.storyState.setFlag('pilot_h04_seen', true);
  g.storyState.setFlag('pilot_h04_connected', true);
  g.narrative.flags.pilot_h04_seen = true;
  const resolvedH04 = g.dialogueResolver.resolveFamilyVisitGraph(tiao);
  assert.strictEqual(resolvedH04.startNode, 'retorno_tiao', 'H04 next visit must use reactive follow-up dialogue');
});

test('25. Story Mode H2 — QuestSystem & Prologue Full Flow (Cap 0 -> Cap 1 + Phone Hook)', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  // Initial quest must activate automatically on Cap 0
  assert.strictEqual(g.quests.isActive('q0_primeira_prancheta'), true, 'Prologue quest must start automatically');
  let active = g.quests.getActiveQuestsList();
  assert.strictEqual(active[0].currentStep.id, 'q0_step_esf');

  // Step 1: Talk to Joana in ESF_ROOM -> Priority 1 Quest Dialogue
  g.dayOfWeek = 0;
  g.timeMinutes = 9 * 60;
  g.ubsInterior.enterUBS();
  g.ubsInterior.enterESF();
  const joana = g.ubsInterior.staff.find(s => s.id === 'acs_joana');
  g.ubsInterior.openStaffDialogue(joana);
  const qGraph = g.dialogue.activeSession.graph;
  assert.strictEqual(qGraph.startNode, 'joana_chegada', 'Quest step must override Joana dialogue with Prologue opening');
  g.dialogue.selectChoice('joana_chegada', qGraph.nodes.joana_chegada.choices[0], 0);
  g.dialogue.selectChoice('joana_orienta', qGraph.nodes.joana_orienta.choices[0], 0);
  g.closeOverlays();

  assert.strictEqual(g.storyState.hasFlag('q0_joana_acolheu'), true);
  active = g.quests.getActiveQuestsList();
  assert.strictEqual(active[0].currentStep.id, 'q0_step_visitas', 'Must advance to 2 home visits step');

  // Step 2: Complete 2 visits -> automatically advances to q0_step_vendinha
  g.weeklyVisits = 2;
  g.events.emit('visit:completed', { familyId: 'H01', ok: true });
  active = g.quests.getActiveQuestsList();
  assert.strictEqual(active[0].currentStep.id, 'q0_step_vendinha', '2 visits must advance Prologue to Vendinha step');

  // Step 3: Talk to Seu Zé at Vendinha -> completes Prologue, advances to Cap 1, starts q1_ecos_da_fila & pushes Phone msg
  g.ubsInterior.exitESF();
  g.ubsInterior.exitUBS();
  g.communitySpaces.enterVendinha();
  const prevMsgCount = g.phone.messages.length;
  g.communitySpaces.openSeuZeDialogue();
  const zeGraph = g.dialogue.activeSession.graph;
  assert.strictEqual(zeGraph.startNode, 'ze_abertura', 'Quest step must override Seu Zé dialogue for Prologue finale');
  g.dialogue.selectChoice('ze_abertura', zeGraph.nodes.ze_abertura.choices[0], 0);
  g.dialogue.selectChoice('ze_resposta', zeGraph.nodes.ze_resposta.choices[0], 0);
  g.closeOverlays();

  assert.strictEqual(g.quests.isCompleted('q0_primeira_prancheta'), true, 'Prologue quest must be completed');
  assert.strictEqual(g.storyState.chapter, 1, 'Completing Prologue must advance StoryState to Chapter 1');
  assert.strictEqual(g.quests.isActive('q1_ecos_da_fila'), true, 'Chapter 1 quest must auto-start');
  assert(g.phone.messages.length > prevMsgCount, 'Dona Sueli must send phone hook introducing Chapter 1');
});

test('26. Story Mode H2 — Chapter 1 Climax & StoryEventSystem Cast Staging (UBS Reception)', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  // Fast-forward cleanly to Chapter 1 start
  g.storyState.chapter = 1;
  g.quests.completeQuest('q0_primeira_prancheta', { silent: true });
  g.quests.startQuest('q1_ecos_da_fila', { silent: true });

  // Step 1: Talk to Dona Sueli inside UBS
  g.dayOfWeek = 1; // Tuesday (Note: Dona Carla normally absent Tuesday! Tests cast staging!)
  g.timeMinutes = 10 * 60;
  g.ubsInterior.enterUBS();
  const sueli = g.ubsInterior.staff.find(s => s.id === 'limpeza');
  g.ubsInterior.openStaffDialogue(sueli);
  const sGraph = g.dialogue.activeSession.graph;
  assert.strictEqual(sGraph.startNode, 'sueli_corredor');
  g.dialogue.selectChoice('sueli_corredor', sGraph.nodes.sueli_corredor.choices[0], 0);
  g.dialogue.selectChoice('sueli_detalhe', sGraph.nodes.sueli_detalhe.choices[0], 0);
  g.closeOverlays();
  assert.strictEqual(g.storyState.hasFlag('q1_sueli_pista'), true);

  // Step 2: Reach Cap 1 territorial threshold -> Enfª Marina sends urgent Phone message
  g.ubsInterior.exitUBS();
  const msgCountBefore = g.phone.messages.length;
  g.weeklyVisits = 4;
  g.events.emit('visit:completed', { familyId: 'H04', ok: true });
  assert.strictEqual(g.storyState.hasFlag('q1_territorio_ouvido'), true);
  assert(g.phone.messages.length > msgCountBefore, 'Enfª Marina must message player before UBS Climax');
  assert.strictEqual(g.quests.getActiveQuestsList()[0].currentStep.id, 'q1_step_climax_ubs');

  // Step 3: Enter UBS -> StoryEventSystem triggers evt_cap1_climax_ubs with Cast Staging!
  const carlaOrigX = g.communitySpaces.npcs.npc_dona_carla.x;
  const renanOrigY = g.ubsInterior.staff.find(s => s.id === 'escriturario').y;

  g.ubsInterior.enterUBS();
  assert(g.storyEvents.activeEvent && g.storyEvents.activeEvent.id === 'evt_cap1_climax_ubs', 'Entering UBS must trigger Cap 1 Climax event');
  assert.strictEqual(g.storyEvents.isNpcForcedInScene('UBS_INTERIOR', 'npc_dona_carla'), true, 'Cast staging must force Dona Carla into UBS_INTERIOR');

  // Multi-speaker climax flow: Carla -> Renan -> Enfª Marina -> Mediation Choice
  const cGraph = g.dialogue.activeSession.graph;
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'npc_dona_carla');
  g.dialogue.selectChoice('carla_cobra', cGraph.nodes.carla_cobra.choices[0], 0);
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'escriturario');
  g.dialogue.selectChoice('renan_responde', cGraph.nodes.renan_responde.choices[0], 0);
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'enfermeira_marina');

  // Pick mediation option (index 1)
  g.dialogue.selectChoice('marina_pergunta', cGraph.nodes.marina_pergunta.choices[1], 1);
  assert.strictEqual(g.storyState.getFlag('cap1_ubs_postura'), 'mediacao');
  g.dialogue.selectChoice('fechamento_mediacao', cGraph.nodes.fechamento_mediacao.choices[0], 0);
  g.closeOverlays();

  // Staging must be cleanly restored, event marked completed once, Chapter -> 2
  assert.strictEqual(g.communitySpaces.npcs.npc_dona_carla.x, carlaOrigX, 'Dona Carla staging position must restore after event');
  assert.strictEqual(g.ubsInterior.staff.find(s => s.id === 'escriturario').y, renanOrigY);
  assert.strictEqual(g.storyEvents.isNpcForcedInScene('UBS_INTERIOR', 'npc_dona_carla'), false);
  assert.strictEqual(g.storyState.isEventCompleted('evt_cap1_climax_ubs'), true);
  assert.strictEqual(g.quests.isCompleted('q1_ecos_da_fila'), true);
  assert.strictEqual(g.storyState.chapter, 2, 'Completing Cap 1 must advance StoryState to Chapter 2');
});

test('27. Story Mode H2 — Heart Events Triggers (Joana & Seu Zé), Tablet Story Tab & v3 Quest Persistence', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  g.storyState.chapter = 1;
  g.storyState.setFlag('q0_joana_acolheu', true);
  g.storyState.setFlag('q0_vendinha_conversa', true);
  g.storyState.npcBonds.acs_joana = 62;
  g.storyState.npcBonds.npc_seu_ze = 50;

  // Heart Event #1: Enter ESF_ROOM -> triggers evt_heart_joana_esf exactly once
  g.dayOfWeek = 0;
  g.timeMinutes = 10 * 60;
  g.ubsInterior.enterUBS();
  g.ubsInterior.enterESF();
  assert(g.storyEvents.activeEvent && g.storyEvents.activeEvent.id === 'evt_heart_joana_esf', 'Joana Heart Event must trigger on entering ESF_ROOM with bond >= 58');

  const jGraph = g.dialogue.activeSession.graph;
  g.dialogue.selectChoice('joana_cafe', jGraph.nodes.joana_cafe.choices[0], 0);
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'acs_rosana', 'Rosana must join Joana Heart Event');
  g.dialogue.selectChoice('rosana_entra', jGraph.nodes.rosana_entra.choices[0], 0);
  g.closeOverlays();
  assert.strictEqual(g.storyState.isEventCompleted('evt_heart_joana_esf'), true);

  // Re-entering ESF_ROOM must NOT re-trigger completed Heart Event
  g.ubsInterior.exitESF();
  g.ubsInterior.enterESF();
  assert.strictEqual(g.storyEvents.activeEvent, null, 'Completed Heart Event must never re-trigger');

  // Heart Event #2: Seu Zé at Vendinha after 18h
  g.ubsInterior.exitESF();
  g.ubsInterior.exitUBS();
  g.timeMinutes = 19 * 60;
  g.communitySpaces.enterVendinha();
  assert(g.storyEvents.activeEvent && g.storyEvents.activeEvent.id === 'evt_heart_ze_caderno', 'Seu Zé Heart Event must trigger in Vendinha after 18h');
  const zGraph = g.dialogue.activeSession.graph;
  g.dialogue.selectChoice('ze_caderno', zGraph.nodes.ze_caderno.choices[0], 0);
  g.dialogue.selectChoice('ze_alianca', zGraph.nodes.ze_alianca.choices[0], 0);
  g.closeOverlays();
  assert.strictEqual(g.storyState.hasFlag('ze_confiou_caderno'), true);

  // Tablet Story & Bonds Tab renders cleanly without crashing & v3 save restores active/completed quests
  g.activeTabletTab = 'story';
  g.toggleTablet(true);
  assert.strictEqual(g.paused, true);
  g.closeOverlays();

  assert.strictEqual(g.saveProgress(), true);
  g.storyState.reset();
  assert.strictEqual(g.loadProgress(), true);
  assert.strictEqual(g.storyState.isEventCompleted('evt_heart_joana_esf'), true);
  assert.strictEqual(g.storyState.isEventCompleted('evt_heart_ze_caderno'), true);
  assert.strictEqual(g.storyState.hasFlag('ze_confiou_caderno'), true);
});

test('28. Story Mode H3 — Immediate Visual Prologue Opening, Chapter Banner & HUD Pill', () => {
  const h = createHarness();
  const g = h.game;

  // Starting a new game must show the chapter banner and launch evt_prologo_abertura immediately
  g.closeOverlays();
  g.storyEvents.triggerPrologueIntro();

  assert(g.storyEvents.activeEvent && g.storyEvents.activeEvent.id === 'evt_prologo_abertura', 'Starting a new game must launch visual Prologue cutscene');
  assert.strictEqual(h.win.document.getElementById('chapter-banner').classList.contains('hidden'), false, 'Chapter banner must display visually');
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'player');

  // Advance Prologue opening -> Joana appears on portrait
  const pGraph = g.dialogue.activeSession.graph;
  g.dialogue.selectChoice('alex_acorda', pGraph.nodes.alex_acorda.choices[0], 0);
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'acs_joana', 'Joana must appear in Prologue opening');
  g.dialogue.selectChoice('joana_janela', pGraph.nodes.joana_janela.choices[0], 0);
  g.dialogue.selectChoice('joana_despede', pGraph.nodes.joana_despede.choices[0], 0);
  g.closeOverlays();

  assert.strictEqual(g.storyState.hasFlag('prologo_abertura_vista'), true);
  assert.strictEqual(h.win.document.getElementById('story-hud-chapter').textContent.includes('PRÓLOGO'), true);
});

test('29. Story Mode H3 — WorldStateSystem Clues, Horta Evolution & Chapter 2 Full Arc', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  // Position campaign cleanly at start of Chapter 2
  g.storyState.chapter = 2;
  g.quests.completeQuest('q0_primeira_prancheta', { silent: true });
  g.quests.completeQuest('q1_ecos_da_fila', { silent: true });
  g.quests.startQuest('q2_alem_do_prontuario', { silent: true });
  assert.strictEqual(g.quests.getPrimaryTrackedStep().currentStep.id, 'q2_step_circular');
  assert.strictEqual(g.worldState.getHortaStage(), 0);

  // Step 1 & 2: Inspect 2 environmental clues (UBS mural + Baixada entulho)
  g.worldState.inspectClue('clue_mural_ubs');
  g.closeOverlays();
  assert.strictEqual(g.quests.getPrimaryTrackedStep().currentStep.id, 'q2_step_pistas');

  g.worldState.inspectClue('clue_baixada_entulho');
  g.closeOverlays();
  assert.strictEqual(g.worldState.getCluesFound().length, 2);
  assert.strictEqual(g.quests.getPrimaryTrackedStep().currentStep.id, 'q2_step_tia_bete');

  // Step 3: Talk to Tia Bete inside Associação -> unlocks hortaStage 1
  g.dayOfWeek = 2;
  g.timeMinutes = 15 * 60;
  g.communitySpaces.enterAssociacao();
  g.communitySpaces.openTiaBeteDialogue();
  const tbGraph = g.dialogue.activeSession.graph;
  assert.strictEqual(tbGraph.startNode, 'bete_cap2_abre');
  g.dialogue.selectChoice('bete_cap2_abre', tbGraph.nodes.bete_cap2_abre.choices[0], 0);
  g.dialogue.selectChoice('bete_cap2_fecha', tbGraph.nodes.bete_cap2_fecha.choices[0], 0);
  g.closeOverlays();
  assert.strictEqual(g.worldState.getHortaStage(), 1, 'Tia Bete alliance must advance Horta to Stage 1');
  assert.strictEqual(g.quests.getPrimaryTrackedStep().currentStep.id, 'q2_step_mobilizar');

  // Step 4: Mobilize Seu Raimundo (H07) -> advances Horta to Stage 2 & transitions Chapter -> 3!
  const raimundo = g.families.find(f => f.id === 'H07');
  const mobGraph = g.dialogueResolver.resolveFamilyVisitGraph(raimundo);
  assert.strictEqual(mobGraph.startNode, 'convite_mutirao');
  g.dialogue.startGraph({
    entityType: 'FAMILY',
    entityData: raimundo,
    entityId: raimundo.id,
    tag: raimundo.code,
    name: raimundo.name,
    badgesHtml: '',
    bondPct: raimundo.bond,
    bondText: '50%',
    graph: mobGraph
  });
  g.dialogue.selectChoice('convite_mutirao', mobGraph.nodes.convite_mutirao.choices[0], 0);
  g.closeOverlays();

  assert.strictEqual(g.quests.isCompleted('q2_alem_do_prontuario'), true);
  assert.strictEqual(g.worldState.getHortaStage(), 2, 'Completing Cap 2 must advance Horta to Stage 2');
  assert.strictEqual(g.storyState.chapter, 3, 'Must advance cleanly to Chapter 3');
  assert.strictEqual(g.quests.isActive('q3_sobrecarga_e_fratura'), true);
});

test('30. Story Mode H3 — Chapter 3 Dilemma, Side Quests, Heart Events & World Visual Changes', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  g.storyState.chapter = 3;
  g.storyState.npcBonds.npc_tia_bete = 55;
  g.storyState.npcBonds.enfermeira_marina = 55;
  g.storyState.setFlag('tia_bete_ally', true);
  g.quests.completeQuest('q0_primeira_prancheta', { silent: true });
  g.quests.completeQuest('q1_ecos_da_fila', { silent: true });
  g.quests.completeQuest('q2_alem_do_prontuario', { silent: true });
  g.quests.startQuest('q3_sobrecarga_e_fratura', { silent: true });
  g.quests.startQuest('qs_sombra_baixada', { silent: true });

  // Step 1: Talk to Tiago in ESF_ROOM
  g.dayOfWeek = 1;
  g.timeMinutes = 10 * 60;
  g.ubsInterior.enterUBS();
  g.ubsInterior.enterESF();
  const tiago = g.ubsInterior.staff.find(s => s.id === 'acs_tiago');
  g.ubsInterior.openStaffDialogue(tiago);
  let tGraph = g.dialogue.activeSession.graph;
  assert.strictEqual(tGraph.startNode, 'tiago_sobrecarga');
  g.dialogue.selectChoice('tiago_sobrecarga', tGraph.nodes.tiago_sobrecarga.choices[0], 0);
  g.dialogue.selectChoice('tiago_respira', tGraph.nodes.tiago_respira.choices[0], 0);
  g.closeOverlays();

  // Step 2: Talk to Seu Zé in Vendinha + clear 1 dengue spot (also completes qs_sombra_baixada alongside 2 spots)
  g.ubsInterior.exitESF();
  g.ubsInterior.exitUBS();
  g.communitySpaces.enterVendinha();
  g.communitySpaces.openSeuZeDialogue();
  let zeGraph = g.dialogue.activeSession.graph;
  assert.strictEqual(zeGraph.startNode, 'ze_cap3');
  g.dialogue.selectChoice('ze_cap3', zeGraph.nodes.ze_cap3.choices[0], 0);
  g.closeOverlays();
  g.communitySpaces.exitVendinha();

  // Clear dengue spots -> advances q3_step_campo_minimo & qs_sombra_baixada
  g.worldState.inspectClue('clue_baixada_entulho');
  g.closeOverlays();
  g.clearDengueSpot(g.dengueSpots[0]);
  g.clearDengueSpot(g.dengueSpots[1]);
  assert.strictEqual(g.storyState.hasFlag('q3_campo_ok'), true);
  assert.strictEqual(g.quests.isCompleted('qs_sombra_baixada'), true);
  assert.strictEqual(g.quests.getPrimaryTrackedStep().currentStep.id, 'q3_step_fratura_ubs');

  // Step 3: Enter UBS -> triggers evt_cap3_fratura_ubs & choose Open Assembly dilemma
  g.ubsInterior.enterUBS();
  assert(g.storyEvents.activeEvent && g.storyEvents.activeEvent.id === 'evt_cap3_fratura_ubs', 'Must trigger Cap 3 UBS dilemma cutscene');
  const fGraph = g.dialogue.activeSession.graph;
  g.dialogue.selectChoice('henrique_abertura', fGraph.nodes.henrique_abertura.choices[0], 0);
  g.dialogue.selectChoice('bete_cobra', fGraph.nodes.bete_cobra.choices[0], 0); // assembleia_aberta
  g.dialogue.selectChoice('desfecho_assembleia', fGraph.nodes.desfecho_assembleia.choices[0], 0);
  g.closeOverlays();

  assert.strictEqual(g.storyState.getFlag('cap3_decisao'), 'assembleia_aberta');
  assert.strictEqual(g.worldState.getUBSMural(), 'acolhimento');
  assert.strictEqual(g.worldState.getPracinhaStatus(), 'mobilizada');
  assert.strictEqual(g.worldState.getHortaStage(), 3);
  assert.strictEqual(g.storyState.chapter, 4, 'Cap 3 climax must transition cleanly to Chapter 4');

  // Check new H3 Heart Events (Tia Bete at Associação & Marina/Sueli late afternoon at UBS)
  g.ubsInterior.exitUBS();
  g.communitySpaces.enterAssociacao();
  assert(g.storyEvents.activeEvent && g.storyEvents.activeEvent.id === 'evt_heart_tia_bete_horta');
  g.dialogue.selectChoice('bete_confidencia', g.dialogue.activeSession.graph.nodes.bete_confidencia.choices[0], 0);
  g.closeOverlays();

  g.communitySpaces.exitAssociacao();
  g.timeMinutes = 16.5 * 60;
  g.ubsInterior.enterUBS();
  assert(g.storyEvents.activeEvent && g.storyEvents.activeEvent.id === 'evt_heart_marina_sueli_ubs');
  g.dialogue.selectChoice('marina_exausta', g.dialogue.activeSession.graph.nodes.marina_exausta.choices[0], 0);
  g.dialogue.selectChoice('sueli_cafe', g.dialogue.activeSession.graph.nodes.sueli_cafe.choices[0], 0);
  g.closeOverlays();
  assert.strictEqual(g.storyState.isEventCompleted('evt_heart_marina_sueli_ubs'), true);
});

test('31. Story Mode H4 — Chapter 4 Pracinha Cutscene, Modular EndingAssembler & Freeplay Epilogue', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();

  // Setup Chapter 4 following an Open Assembly path in Chapter 3
  g.storyState.chapter = 4;
  g.storyState.setFlag('cap3_decisao', 'assembleia_aberta');
  g.storyState.setFlag('cap3_chamado_assembleia', true);
  g.storyState.setFlag('tia_bete_ally', true);
  g.storyState.setFlag('qs_canteiro_domino_ok', true);
  g.storyState.setFlag('qs_balanco_guiche_ok', true);
  g.storyState.setFlag('qs_turno_noite_ok', true);
  g.storyState.npcBonds.npc_tia_bete = 72;
  g.storyState.npcBonds.enfermeira_marina = 65;
  g.storyState.npcBonds.acs_joana = 70;
  g.worldState.setUBSMural('acolhimento');
  g.worldState.setPracinhaStatus('mobilizada');
  g.worldState.advanceHortaStage(3, 'test_h4');
  g.quests.completeQuest('q0_primeira_prancheta', { silent: true });
  g.quests.completeQuest('q1_ecos_da_fila', { silent: true });
  g.quests.completeQuest('q2_alem_do_prontuario', { silent: true });
  g.quests.completeQuest('q3_sobrecarga_e_fratura', { silent: true });
  g.storyState.markEventCompleted('evt_heart_tia_bete_horta');
  g.storyState.markEventCompleted('evt_heart_marina_sueli_ubs');
  g.quests.startQuest('q4_mesa_posta_pracinha', { silent: true });

  assert.strictEqual(g.quests.getPrimaryTrackedStep().currentStep.id, 'q4_step_convites');

  // Step 1: Confirm with Tia Bete at Associação
  g.dayOfWeek = 2;
  g.timeMinutes = 15 * 60;
  g.communitySpaces.enterAssociacao();
  g.communitySpaces.openTiaBeteDialogue();
  const beteGraph = g.dialogue.activeSession.graph;
  assert.strictEqual(beteGraph.startNode, 'bete_cap4_convite');
  g.dialogue.selectChoice('bete_cap4_convite', beteGraph.nodes.bete_cap4_convite.choices[0], 0);
  g.closeOverlays();
  g.communitySpaces.exitAssociacao();
  assert.strictEqual(g.quests.getPrimaryTrackedStep().currentStep.id, 'q4_step_equipe');

  // Step 2: Align with Joana inside Sala ESF
  g.ubsInterior.enterUBS();
  g.ubsInterior.enterESF();
  const joana = g.ubsInterior.staff.find(s => s.id === 'acs_joana');
  g.ubsInterior.openStaffDialogue(joana);
  const joanaGraph = g.dialogue.activeSession.graph;
  assert.strictEqual(joanaGraph.startNode, 'joana_cap4_prepara');
  g.dialogue.selectChoice('joana_cap4_prepara', joanaGraph.nodes.joana_cap4_prepara.choices[0], 0);
  g.closeOverlays();
  g.ubsInterior.exitESF();
  g.ubsInterior.exitUBS();
  assert.strictEqual(g.quests.getPrimaryTrackedStep().currentStep.id, 'q4_step_assembleia');

  // Step 3: Walk into Pracinha dos Ipês -> triggers choral cutscene evt_cap4_assembleia_pracinha
  g.player.x = g.pracinha.x;
  g.player.y = g.pracinha.y + 10;
  g.checkNearbyInteractions();
  assert(g.storyEvents.activeEvent && g.storyEvents.activeEvent.id === 'evt_cap4_assembleia_pracinha', 'Arriving at Pracinha dos Ipês must trigger Chapter 4 choral cutscene');
  assert.strictEqual(g.storyEvents.getStagedCastInScene('OVERWORLD').length, 8, 'All 8 cast members must be staged in Pracinha during cutscene');

  // Verify Overworld renders cleanly with Mesa Posta + Staged Cast
  h.drawCalls.length = 0;
  g.tick(0.016);
  assert(h.drawCalls.length > 0, 'Pracinha cutscene world render must draw cleanly');

  const aGraph = g.dialogue.activeSession.graph;
  g.dialogue.selectChoice('assembleia_abertura', aGraph.nodes.assembleia_abertura.choices[0], 0);
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'npc_seu_ze');
  g.dialogue.selectChoice('ze_testemunho', aGraph.nodes.ze_testemunho.choices[0], 0);
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'npc_dona_carla', 'Open Assembly path must route to Dona Carla');
  assert.strictEqual(g.typewriterFullText.includes('dossiê real'), true, 'Open Assembly path must render carla_unida dialogue');
  g.dialogue.selectChoice('carla_unida', aGraph.nodes.carla_unida.choices[0], 0);
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'H04');
  g.dialogue.selectChoice('tiao_testemunho', aGraph.nodes.tiao_testemunho.choices[0], 0);
  assert.strictEqual(g.dialogue.activeSession.currentSpeakerId, 'enfermeira_marina');
  g.dialogue.selectChoice('marina_pacto', aGraph.nodes.marina_pacto.choices[1], 1); // Articulação

  // Completing the cutscene finishes Chapter 4, advances to Epilogue (Chapter 5), and opens Ending Modal
  g.closeOverlays();
  assert.strictEqual(g.storyState.hasFlag('q4_assembleia_concluida'), true);
  assert.strictEqual(g.quests.isCompleted('q4_mesa_posta_pracinha'), true);
  assert.strictEqual(g.storyState.chapter, 5, 'Campaign must transition to Epilogue (Chapter 5)');
  assert.strictEqual(g.worldState.getPracinhaStatus(), 'celebracao');

  const endingData = g.endingAssembler.assemble();
  assert.strictEqual(endingData.pillars.length, 4, 'EndingAssembler must compose all 4 pillars');
  assert.strictEqual(endingData.pillars[0].tier, 'transformadora');
  assert.strictEqual(endingData.pillars[1].tier, 'florescendo');

  // Enter Freeplay Mode from Ending Modal and verify Tablet Story Epilogue Banner + Save/Load
  const freeplayBtn = h.win.document.getElementById('btn-enter-freeplay');
  assert(freeplayBtn, 'Campaign ending modal must render Freeplay continuation button');
  freeplayBtn.click();
  assert.strictEqual(g.paused, false, 'Clicking Freeplay button must resume gameplay in Epilogue');
  assert.strictEqual(h.win.document.getElementById('story-hud-chapter').textContent.includes('EPÍLOGO'), true);

  g.activeTabletTab = 'story';
  g.toggleTablet(true);
  assert.strictEqual(h.win.document.getElementById('tablet-content').innerHTML.includes('Rever Desfecho Completo'), true);
  g.closeOverlays();

  assert.strictEqual(g.saveProgress(), true);
  g.storyState.reset();
  assert.strictEqual(g.loadProgress(), true);
  assert.strictEqual(g.storyState.chapter, 5);
  assert.strictEqual(g.storyState.hasFlag('campaign_completed'), true);
});

test('32. Story Mode H4 — Alternative NarrativeMemory Branch (relatorio_rapido) in Pracinha Cutscene & EndingAssembler', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();
  g.playerHomeSystem.exitHome();

  g.storyState.chapter = 4;
  g.storyState.setFlag('cap1_ubs_postura', 'protocolo');
  g.storyState.setFlag('cap3_decisao', 'relatorio_rapido');
  g.storyState.setFlag('q4_convites_ok', true);
  g.storyState.setFlag('q4_equipe_ok', true);
  g.quests.completeQuest('q0_primeira_prancheta', { silent: true });
  g.quests.completeQuest('q1_ecos_da_fila', { silent: true });
  g.quests.completeQuest('q2_alem_do_prontuario', { silent: true });
  g.quests.completeQuest('q3_sobrecarga_e_fratura', { silent: true });
  g.storyState.markEventCompleted('evt_heart_tia_bete_horta');
  g.storyState.markEventCompleted('evt_heart_marina_sueli_ubs');
  g.quests.startQuest('q4_mesa_posta_pracinha', { silent: true });

  g.player.x = g.pracinha.x;
  g.player.y = g.pracinha.y;
  g.checkNearbyInteractions();
  assert(g.storyEvents.activeEvent && g.storyEvents.activeEvent.id === 'evt_cap4_assembleia_pracinha');

  const aGraph = g.dialogue.activeSession.graph;
  g.dialogue.selectChoice('assembleia_abertura', aGraph.nodes.assembleia_abertura.choices[0], 0);
  // Only the fallback choice (carla_cobranca) is visible when cap3_chamado_assembleia is not set
  const zeVisibleChoices = aGraph.nodes.ze_testemunho.choices.filter(
    c => !c.conditions || g.dialogue.evaluateConditions(c.conditions, g.dialogue.activeSession.entityData, 'npc_seu_ze')
  );
  assert.strictEqual(zeVisibleChoices.length, 1);
  assert.strictEqual(zeVisibleChoices[0].next, 'carla_cobranca', 'Quick report path must route Dona Carla to carla_cobranca');

  const endingData = g.endingAssembler.assemble();
  assert.strictEqual(endingData.pillars[0].tier, 'sobrecarregada', 'Protocolo + relatorio_rapido must reflect in UBS pillar');
});

test('33. Soundtrack & MusicDirector: Independent volumes, contextual tracks, continuity, drama, celebrations & ducking', () => {
  const h = createHarness();
  const g = h.game;
  const sfx = h.win.sfx;
  const md = g.musicDirector;

  assert(md, 'MusicDirector should be attached to game');
  assert.strictEqual(md.resolveDesiredContext().track, null, 'Music should be silent before starting game');

  // Main Menu theme music
  g.inMainMenu = true;
  md.startMenuMusic();
  assert.strictEqual(md.resolveDesiredContext().track, 'main_theme', 'Main Menu should play main_theme');
  g.inMainMenu = false;

  // Independent volume controls & persistence
  sfx.setMusicVolume(0.35);
  sfx.setSfxVolume(0.85);
  sfx.setAmbienceVolume(0.4);
  assert.strictEqual(sfx.musicVolume, 0.35);
  assert.strictEqual(sfx.sfxVolume, 0.85);
  assert.strictEqual(sfx.ambienceVolume, 0.4);

  // Start game -> Player Home morning = contemplation; Overworld daytime = main_theme
  g.closeOverlays();
  md.markStarted();
  g.timeMinutes = 9 * 60;
  assert.strictEqual(md.resolveDesiredContext().track, 'contemplation', 'PLAYER_HOME daytime should play contemplation');

  // Late night at home -> ambient-only silence
  g.timeMinutes = 21.5 * 60;
  assert.strictEqual(md.resolveDesiredContext().track, null, 'PLAYER_HOME late night should fade to ambient-only silence');

  // Overworld daytime -> main_theme; continuity into Vendinha & Associacao
  g.timeMinutes = 10 * 60;
  g.playerHomeSystem.exitHome();
  md.evaluate({ immediate: true });
  assert.strictEqual(sfx.getCurrentTrack(), 'main_theme', 'OVERWORLD daytime should play main_theme');

  g.communitySpaces.enterVendinha();
  assert.strictEqual(md.resolveDesiredContext().track, 'main_theme', 'VENDINHA daytime should preserve main_theme continuity');

  // Evening / Rain -> contemplation
  g.communitySpaces.exitVendinha();
  g.timeMinutes = 18 * 60;
  assert.strictEqual(md.resolveDesiredContext().track, 'contemplation', 'OVERWORLD dusk/evening should play contemplation');

  // UBS Interior & ESF Room -> health_center seamlessly
  g.timeMinutes = 10 * 60;
  g.ubsInterior.enterUBS();
  assert.strictEqual(md.resolveDesiredContext().track, 'health_center', 'UBS_INTERIOR should play health_center');
  g.ubsInterior.enterESF();
  assert.strictEqual(md.resolveDesiredContext().track, 'health_center', 'ESF_ROOM should continue health_center seamlessly');

  // Ongoing dramatic state during Chapter 3 crisis (not just quest start)
  g.storyState.chapter = 3;
  assert.strictEqual(md.resolveDesiredContext().track, 'dramatic', 'Chapter 3 tension inside UBS should play dramatic');

  // Story Event overrides (Heart Event -> contemplation, Cap 4 Assembly -> celebration)
  g.storyEvents.activeEvent = { id: 'evt_heart_joana_esf' };
  assert.strictEqual(md.resolveDesiredContext().track, 'contemplation', 'Heart Events should play contemplation');
  g.storyEvents.activeEvent = { id: 'evt_cap4_assembleia_pracinha' };
  assert.strictEqual(md.resolveDesiredContext().track, 'celebration', 'Cap 4 Assembly should play celebration');
  g.storyEvents.activeEvent = null;

  // Ducking during dialogue and menus
  h.win.document.getElementById('dialogue-overlay').classList.remove('hidden');
  md.evaluate({ immediate: true });
  assert(sfx._duckFactor < 0.5, 'Music must duck smoothly when dialogue is open');
  g.closeOverlays();
  md.evaluate({ immediate: true });
  assert.strictEqual(sfx._duckFactor, 1.0, 'Music ducking must restore to 1.0 when overlays close');
});

test('34. Etapa E1 — RelationshipSystem: Receptivity, Stubbornness, Communication Styles & Cooperation Perks', () => {
  const h = createHarness();
  const g = h.game;
  const rel = g.relationships;
  assert(rel, 'RelationshipSystem must be initialized');

  // H04 (stubbornness 85) starts with lower receptivity than H01 (stubbornness 0)
  const h04Rec = rel.getBaseReceptivity('H04');
  const h01Rec = rel.getBaseReceptivity('H01');
  assert(h04Rec < h01Rec, 'Resistant families must start with lower receptivity');

  // Contextual receptivity boosts during Dominó gathering on Thursday afternoon
  g.dayOfWeek = 3; // Thursday
  g.timeMinutes = 16 * 60;
  const h04DominoRec = rel.getContextualReceptivity('H04');
  assert.strictEqual(h04DominoRec, Math.min(100, h04Rec + 12), 'Informal gathering should boost contextual receptivity by +12');

  // Matching preferred style vs averse style
  const h10 = g.families.find(f => f.id === 'H10'); // preferred: tecnica, averse: pratica
  const resBad = rel.recordInteraction('H10', { style: 'pratica', type: 'EMPATHY' }, true);
  assert.strictEqual(resBad.matchedAverse, true);
  const resGood = rel.recordInteraction('H10', { style: 'tecnica', type: 'EDUCATE' }, true);
  assert.strictEqual(resGood.matchedPreferred, true);
  assert.strictEqual(rel.isStyleRevealed('H10'), true, 'Matching preferred style must reveal preference in Notebook');

  // Cooperation perk: Dona Dulce (H01) intercedes with most stubborn neighbor (H10 or H04)
  const beforeStubborn = h10.stubbornness;
  const perkRes = rel.usePerk('perk_dulce_intercede');
  assert.strictEqual(perkRes.ok, true, 'Unlocked Dona Dulce perk should execute cleanly');
  assert.strictEqual(h10.stubbornness, beforeStubborn - 15, 'Dona Dulce intercession must reduce target stubbornness by 15');

  // Calling same perk twice in one day is blocked
  const secondTry = rel.usePerk('perk_dulce_intercede');
  assert.strictEqual(secondTry.ok, false, 'Cooperation perk should have daily cooldown');
});

test('35. Etapa E1 — NotebookSystem, Home Desk Integration & SaveManager v3 -> v4 Migration', () => {
  const h = createHarness();
  const g = h.game;
  const nb = g.notebook;
  assert(nb, 'NotebookSystem must be initialized');

  // Home desk station opens Notebook instead of Tablet
  const desk = g.playerHomeSystem.getStations().find(s => s.id === 'home_desk');
  assert(desk, 'home_desk station must exist');
  desk.action();
  assert.strictEqual(h.win.document.getElementById('notebook-overlay').classList.contains('hidden'), false, 'home_desk must open Notebook');
  g.closeOverlays();

  // Inspecting a clue adds it to Notebook chronicle & Cases tab
  g.worldState.inspectClue('clue_mural_ubs');
  g.closeOverlays();
  assert(nb.chronicle.some(c => c.title.includes('Mural Interno')), 'Clue inspection must log to Notebook chronicle');

  nb.toggle(true, 'cases');
  assert(h.win.document.getElementById('notebook-content').innerHTML.includes('Mural Interno'), 'Cases tab must display inspected clues');
  nb.toggle(true, 'profiles');
  assert(h.win.document.getElementById('notebook-content').innerHTML.includes('Cooperações Comunitárias'), 'Profiles tab must display cooperation perks');
  g.closeOverlays();

  // SaveManager v4 round-trip
  g.relationships.addReceptivity('H04', 10);
  nb.addNote('H04', 'Gosta de conversar sobre dominó.');
  assert.strictEqual(g.saveProgress(), true);

  g.relationships.reset();
  nb.reset();
  assert.strictEqual(g.loadProgress(), true);
  assert(nb.notes.H04 && nb.notes.H04.includes('Gosta de conversar sobre dominó.'), 'Notebook notes must persist across save/load');

  // SaveManager v3 -> v4 automatic migration
  const storage = g.saveManager._getStorage();
  storage.setItem(g.saveManager.storageKey, JSON.stringify({
    version: 3,
    savedAt: Date.now(),
    data: {
      weekNumber: 2,
      dayOfWeek: 1,
      timeMinutes: 600,
      storyState: { chapter: 1, storyFlags: { q0_joana_acolheu: true } }
    }
  }));
  const migrated = g.saveManager.load();
  assert(migrated && migrated.relationships && migrated.notebook && migrated.investigation && migrated.planner && migrated.competencies && migrated.dynamicEvents, 'v3 save must automatically migrate to v4 defaults');
  assert.strictEqual(migrated.storyState.chapter, 1);
});

test('36. Etapa E2 — InvestigationSystem: Multi-Source Clues, Contradiction Synthesis, Dialogue Injection & Resolution', () => {
  const h = createHarness();
  const g = h.game;
  const inv = g.investigation;
  assert(inv, 'InvestigationSystem must be initialized');

  // Caso 1 (A Receita que Não Chega) starts active
  assert.strictEqual(inv.getCaseState('caso_receita').status, 'active');

  // Talk to Renan (escriturario) -> DialogueResolver injects investigation choice
  const renan = g.ubsInterior.staff.find(s => s.id === 'escriturario');
  g.ubsInterior.openStaffDialogue(renan);
  const renanGraph = g.dialogue.activeSession.graph;
  const renanStartChoices = renanGraph.nodes[renanGraph.startNode || 'start'].choices;
  const invRenanChoice = renanStartChoices.find(c => c.next && c.next.startsWith('inv_clue_caso_receita_'));
  assert(invRenanChoice, 'DialogueResolver must inject investigation clue option into Renan dialogue');

  g.dialogue.selectChoice(renanGraph.startNode || 'start', invRenanChoice, 0);
  const renanClueNode = renanGraph.nodes[invRenanChoice.next];
  g.dialogue.selectChoice(invRenanChoice.next, renanClueNode.choices[0], 0);
  g.closeOverlays();
  assert.strictEqual(inv.hasClue('caso_receita', 'c1_ubs_registro'), true, 'Renan clue must be recorded');

  // Cannot synthesize yet with only 1 key clue
  assert.strictEqual(inv.canSynthesizeHypothesis('caso_receita'), false);

  // Talk to Seu Zé (Vendinha) -> collect second contradicting key clue
  g.communitySpaces.openSeuZeDialogue();
  const zeGraph = g.dialogue.activeSession.graph;
  const zeStartKey = zeGraph.startNode || 'start';
  const zeInvChoice = zeGraph.nodes[zeStartKey].choices.find(c => c.next && c.next.startsWith('inv_clue_caso_receita_'));
  assert(zeInvChoice, 'DialogueResolver must inject investigation clue option into Seu Zé dialogue');
  g.dialogue.selectChoice(zeStartKey, zeInvChoice, 0);
  g.dialogue.selectChoice(zeInvChoice.next, zeGraph.nodes[zeInvChoice.next].choices[0], 0);
  g.closeOverlays();
  assert.strictEqual(inv.hasClue('caso_receita', 'c1_vendinha_recados'), true);

  // Now contradiction is detected -> synthesize hypothesis in Notebook
  assert.strictEqual(inv.canSynthesizeHypothesis('caso_receita'), true, 'Contradiction must be detectable once both key clues are found');
  assert.strictEqual(inv.synthesizeHypothesis('caso_receita'), true);
  assert.strictEqual(inv.getCaseState('caso_receita').hypothesisUnlocked, true);

  // Resolution choice [💡 Hipótese] now appears in Seu Zé's dialogue
  g.communitySpaces.openSeuZeDialogue();
  const zeResGraph = g.dialogue.activeSession.graph;
  const zeResStart = zeResGraph.startNode || 'start';
  const zeResChoice = zeResGraph.nodes[zeResStart].choices.find(c => c.next && c.next.startsWith('inv_res_caso_receita_'));
  assert(zeResChoice, 'Synthesizing hypothesis must unlock resolution option in dialogue');
  const neideBefore = g.families.find(f => f.id === 'H05').bond;
  g.dialogue.selectChoice(zeResStart, zeResChoice, 0);
  g.dialogue.selectChoice(zeResChoice.next, zeResGraph.nodes[zeResChoice.next].choices[0], 0);
  g.closeOverlays();

  assert.strictEqual(inv.getCaseState('caso_receita').status, 'resolved');
  assert.strictEqual(g.storyState.getFlag('caso_receita_via'), 'ponte_vendinha');
  assert(g.families.find(f => f.id === 'H05').bond > neideBefore, 'Resolving Caso 1 must improve affected family bond');

  // Persistence round-trip
  assert.strictEqual(g.saveProgress(), true);
  inv.reset();
  assert.strictEqual(g.loadProgress(), true);
  assert.strictEqual(inv.getCaseState('caso_receita').status, 'resolved');
});

test('37. Expanded Map (120x56) — Bairro Vizinho, Campinho de Futebol & Casa Misteriosa', () => {
  const h = createHarness();
  const g = h.game;
  g.closeOverlays();
  g.currentLocation = 'OVERWORLD';

  assert.strictEqual(g.COLS, 120, 'Map must be expanded to 120 columns');
  assert.strictEqual(g.ROWS, 56, 'Map must retain 56 rows');
  assert.strictEqual(g.worldWidth, 3840);

  // Campinho spatial integrity & interaction
  assert(g.campinho, 'Campinho de Futebol must exist');
  assert.strictEqual(g.collides(g.campinho.x, g.campinho.y), false, 'Campinho center must be walkable');
  const pitchCol = Math.floor(g.campinho.x / 32);
  const pitchRow = Math.floor(g.campinho.y / 32);
  assert.strictEqual(g.tileMap[pitchRow][pitchCol], 'G', 'Campinho pitch must be grass');

  g.player.stamina = 60;
  g.player.x = g.campinho.x;
  g.player.y = g.campinho.y;
  g.checkNearbyInteractions();
  assert.strictEqual(g.nearTarget && g.nearTarget.type, 'CAMPINHO');
  g.triggerInteraction();
  assert.strictEqual(g.player.stamina, 68, 'Interacting with Campinho must restore +8 stamina');

  // Casa Misteriosa spatial integrity & investigation dialogue
  assert(g.mysteryHouse, 'Casa Misteriosa must exist');
  assert.strictEqual(g.collides(g.mysteryHouse.x, g.mysteryHouse.y), false, 'Casa Misteriosa gate must be walkable');
  g.player.x = g.mysteryHouse.x;
  g.player.y = g.mysteryHouse.y;
  g.checkNearbyInteractions();
  assert.strictEqual(g.nearTarget && g.nearTarget.type, 'MYSTERY_HOUSE');
  g.triggerInteraction();

  const mhGraph = g.dialogue.activeSession.graph;
  assert.strictEqual(mhGraph.startNode, 'portao');
  g.dialogue.selectChoice('portao', mhGraph.nodes.portao.choices[0], 0);
  g.dialogue.selectChoice('descoberta', mhGraph.nodes.descoberta.choices[0], 0);
  g.closeOverlays();
  assert.strictEqual(g.storyState.hasFlag('mystery_house_inspected'), true);

  // GPS pinning for new landmarks
  g.navigation.setPin({ type: 'CAMPINHO', id: 'CAMPINHO' });
  assert.strictEqual(g.navigation.resolveObjective().type, 'CAMPINHO');
  g.navigation.setPin({ type: 'MYSTERY_HOUSE', id: 'MYSTERY_HOUSE' });
  assert.strictEqual(g.navigation.resolveObjective().type, 'MYSTERY_HOUSE');
});

test('38. Etapa E3 — PlannerSystem: Demands Queue, Route of the Day, Navigation, Visita Preparada & Persistence', () => {
  const h = createHarness();
  const g = h.game;
  const pl = g.planner;
  assert(pl, 'PlannerSystem must be initialized');

  g.closeOverlays();
  g.currentLocation = 'OVERWORLD';

  // Demands queue classifies into URGENT, WINDOW, FOLLOWUP
  const demands = pl.getDemands();
  assert(demands.length > 0, 'Demands queue must contain active territorial demands');
  assert(demands.some(d => d.tier === 'URGENT'), 'Demands must include URGENT tier (dengue/cases)');
  assert(demands.some(d => d.tier === 'WINDOW'), 'Demands must include WINDOW tier (workers/priorities)');

  // Unknown schedule must stay hidden as ??? in planner availability
  const unknownFam = g.families.find(f => !f.knownSchedule);
  if (unknownFam) {
    const avail = pl.getTargetAvailability('HOUSE', unknownFam.id);
    assert.strictEqual(avail.status, 'UNKNOWN', 'Planner must not spoil unknown schedules');
  }

  // Build Route of the Day (up to 3 stops) and reorder
  assert.strictEqual(pl.getMaxStops(), 3);
  const r1 = pl.addStop({ type: 'HOUSE', refId: 'H01' });
  const r2 = pl.addStop({ type: 'HOUSE', refId: 'H04' });
  const r3 = pl.addStop({ type: 'DENGUE', refId: g.dengueSpots[0].id });
  assert(r1.ok && r2.ok && r3.ok, 'Must allow adding 3 stops to Route of the Day');
  const r4 = pl.addStop({ type: 'UBS', refId: 'UBS' });
  assert.strictEqual(r4.ok, false);
  assert.strictEqual(r4.reason, 'FULL', 'Route must enforce maxStops limit');

  assert.strictEqual(pl.moveStop(1, -1), true, 'Must support reordering stops');
  assert.strictEqual(pl.route[0].refId, 'H04');

  // NavigationSystem guides to next pending stop when no manual pin is set
  g.navigation.clearPin();
  const obj = g.navigation.resolveObjective();
  assert.strictEqual(obj.fromPlanner, true, 'NavigationSystem must guide to next pending Route stop');
  assert.strictEqual(obj.id, 'H04');

  // Pausing route falls back to automatic suggestion without deleting route
  pl.togglePauseRoute(true);
  const pausedObj = g.navigation.resolveObjective();
  assert(!pausedObj.fromPlanner, 'Paused route must not override navigation');
  assert.strictEqual(pl.route.length, 3, 'Pausing must keep route stops intact');
  pl.togglePauseRoute(false);

  // Tablet Operações & Campanhas tabs render cleanly + Tactical Map draws route
  g.activeTabletTab = 'mission';
  g.toggleTablet(true);
  assert(h.win.document.getElementById('tablet-content').innerHTML.includes('Rota do Dia'), 'Operações tab must render Rota do Dia');
  g.activeTabletTab = 'campaigns';
  g.renderTabletContent();
  assert(h.win.document.getElementById('tablet-content').innerHTML.includes('Canal de Encaminhamento'), 'Campanhas tab must render UBS referrals');
  g.closeOverlays();
  g.toggleMap();
  g.closeOverlays();

  // Visita Preparada bonus on planned stop (no punishment if visiting non-route family)
  const h04 = g.families.find(f => f.id === 'H04');
  g.player.stamina = 80;
  g.timeMinutes = 9 * 60;
  const startTime = g.timeMinutes;
  g.resolveVisitChoice(h04, { type: 'EMPATHY', bondDelta: 10, reply: 'Boa conversa!' });
  assert.strictEqual(g.timeMinutes, startTime + 15, 'Visita Preparada must save 5 min (15 min instead of 20)');
  assert.strictEqual(g.player.stamina, 84, 'Visita Preparada must grant +4 stamina');
  assert.strictEqual(pl.route[0].completed, true, 'Completed stop must be marked completed in route');
  assert.strictEqual(g.navigation.resolveObjective().id, 'H01', 'Navigation must advance to next pending stop');

  // SaveManager v4 round-trip & daily reset
  assert.strictEqual(g.saveProgress(), true);
  pl.reset();
  assert.strictEqual(g.loadProgress(), true);
  assert.strictEqual(pl.route.length, 3, 'Planned route must persist across save/load');
  assert.strictEqual(pl.route[0].completed, true, 'Completed stop state must persist across save/load');

  pl.resetDaily();
  assert.strictEqual(pl.route.length, 0, 'Daily reset must clear previous day route');
});

if (!process.exitCode) {
  console.log(`\nAll ${passed} quality-gate checks PASSED!`);
}

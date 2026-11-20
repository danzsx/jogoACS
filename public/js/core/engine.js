// ============================================================================
// TERRITÓRIO VIVO — CORE ENGINE MODULE (Framework Pillar 1 & 2)
// ============================================================================
// Provides resilient GameLoop, EventBus, InputManager, SaveManager, and safe
// math helpers. Classic script namespace for 100% file:// and http:// support.

(function (global) {
  'use strict';

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // Always returns an integer in [0, len - 1] even if n is negative
  function safeMod(n, len) {
    if (!len || len <= 0) return 0;
    const i = Math.floor(n);
    return ((i % len) + len) % len;
  }

  class EventBus {
    constructor() {
      this._listeners = new Map();
    }

    on(event, handler) {
      if (!this._listeners.has(event)) {
        this._listeners.set(event, new Set());
      }
      this._listeners.get(event).add(handler);
      return () => this.off(event, handler);
    }

    off(event, handler) {
      const set = this._listeners.get(event);
      if (set) set.delete(handler);
    }

    emit(event, payload) {
      const set = this._listeners.get(event);
      if (!set) return;
      for (const fn of set) {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[EventBus] Error in listener for "${event}":`, err);
        }
      }
    }
  }

  // Resilient requestAnimationFrame loop:
  // - Never produces negative dt on Frame 1 (initializes lastTimestamp lazily)
  // - Clamps dt to [0, maxDt]
  // - Always schedules the next frame before invoking callbacks so one transient
  //   error cannot permanently freeze the game.
  class GameLoop {
    constructor(onTick, maxDt = 0.05) {
      this.onTick = onTick;
      this.maxDt = maxDt;
      this.running = false;
      this.lastTimestamp = null;
      this.rafId = null;
      this._errorLogged = false;
      this._boundStep = this._step.bind(this);
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.lastTimestamp = null;
      this.rafId = global.requestAnimationFrame(this._boundStep);
    }

    stop() {
      this.running = false;
      if (this.rafId !== null && typeof global.cancelAnimationFrame === 'function') {
        global.cancelAnimationFrame(this.rafId);
      }
      this.rafId = null;
    }

    _step(timestamp) {
      if (!this.running) return;
      // Schedule next frame first so loop stays alive even if a frame throws
      this.rafId = global.requestAnimationFrame(this._boundStep);

      const now = typeof timestamp === 'number' && !Number.isNaN(timestamp)
        ? timestamp
        : (global.performance ? global.performance.now() : Date.now());

      let dt = 0;
      if (this.lastTimestamp !== null) {
        dt = clamp((now - this.lastTimestamp) / 1000, 0, this.maxDt);
      }
      this.lastTimestamp = now;

      try {
        this.onTick(dt, now);
        this._errorLogged = false;
      } catch (err) {
        if (!this._errorLogged) {
          console.error('[GameLoop] Uncaught frame error:', err);
          this._errorLogged = true;
        }
      }
    }
  }

  class InputManager {
    constructor(targetWindow = global) {
      this.keys = {};
      this._win = targetWindow;
      this._onBlur = () => this.clear();
      this._onVisibility = () => {
        if (this._win.document && this._win.document.hidden) {
          this.clear();
        }
      };

      if (this._win && typeof this._win.addEventListener === 'function') {
        this._win.addEventListener('blur', this._onBlur);
      }
      if (this._win && this._win.document && typeof this._win.document.addEventListener === 'function') {
        this._win.document.addEventListener('visibilitychange', this._onVisibility);
      }
    }

    setKey(key, pressed) {
      if (!key) return;
      this.keys[String(key).toLowerCase()] = !!pressed;
    }

    isDown(key) {
      return !!this.keys[String(key).toLowerCase()];
    }

    getMovementVector() {
      let dx = 0;
      let dy = 0;
      if (this.isDown('w') || this.isDown('arrowup')) dy -= 1;
      if (this.isDown('s') || this.isDown('arrowdown')) dy += 1;
      if (this.isDown('a') || this.isDown('arrowleft')) dx -= 1;
      if (this.isDown('d') || this.isDown('arrowright')) dx += 1;
      return { dx, dy };
    }

    clear() {
      for (const k of Object.keys(this.keys)) {
        this.keys[k] = false;
      }
    }
  }

  class SaveManager {
    constructor(storageKey = 'territorio_vivo_acs_save_v1') {
      this.storageKey = storageKey;
      this.schemaVersion = 3;
    }

    _getStorage() {
      try {
        if (global.localStorage) return global.localStorage;
      } catch (_) {
        // Storage blocked in restricted contexts
      }
      return null;
    }

    hasSave() {
      return this.load() !== null;
    }

    migrateV1ToV2(v1) {
      const dayOfWeek = clamp(v1.dayIndex || 0, 0, 5);
      const visitedToday = Array.isArray(v1.visitedToday) ? v1.visitedToday : [];
      return {
        ...v1,
        weekNumber: 1,
        dayOfWeek,
        weeklyVisits: v1.dailyVisits || visitedToday.length || 0,
        visitedThisWeek: visitedToday.slice(),
        weeklyPriorities: [],
        weeklyReportSubmitted: false,
        showDialogueHints: false,
        currentLocation: ['OVERWORLD', 'UBS_INTERIOR', 'ESF_ROOM', 'PLAYER_HOME'].includes(v1.currentLocation)
          ? v1.currentLocation
          : 'OVERWORLD',
        playerHome: { coffeeUsedToday: false }
      };
    }

    migrateV2ToV3(v2) {
      if (v2.storyState && typeof v2.storyState === 'object') {
        return v2;
      }
      const migratedFlags = {};
      if (v2.narrative && v2.narrative.flags && typeof v2.narrative.flags === 'object') {
        for (const k of Object.keys(v2.narrative.flags)) {
          if (v2.narrative.flags[k]) migratedFlags[k] = v2.narrative.flags[k];
        }
      }
      return {
        ...v2,
        storyState: {
          chapter: 0,
          storyFlags: migratedFlags,
          recentFlags: {},
          posture: { acolhimento: 0, firmeza: 0, articulacao: 0, burocracia: 0 },
          npcBonds: {},
          completedEvents: [],
          talkedBondToday: [],
          quests: { active: {}, completed: [] },
          worldStates: { hortaStage: 0, ubsMural: 'default', pracinhaStatus: 'default', cluesFound: [] }
        }
      };
    }

    save(snapshot) {
      const storage = this._getStorage();
      if (!storage) return false;
      try {
        const payload = {
          version: this.schemaVersion,
          savedAt: Date.now(),
          data: snapshot
        };
        storage.setItem(this.storageKey, JSON.stringify(payload));
        return true;
      } catch (err) {
        console.warn('[SaveManager] Failed to save progress:', err);
        return false;
      }
    }

    load() {
      const storage = this._getStorage();
      if (!storage) return null;
      try {
        const raw = storage.getItem(this.storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.data) {
          return null;
        }
        if (parsed.version === 1) {
          return this.migrateV2ToV3(this.migrateV1ToV2(parsed.data));
        }
        if (parsed.version === 2) {
          return this.migrateV2ToV3(parsed.data);
        }
        if (parsed.version !== this.schemaVersion) {
          return null;
        }
        return parsed.data;
      } catch (err) {
        console.warn('[SaveManager] Failed to load save:', err);
        return null;
      }
    }

    clear() {
      const storage = this._getStorage();
      if (!storage) return;
      try {
        storage.removeItem(this.storageKey);
      } catch (_) {}
    }
  }

  global.ACSEngine = {
    clamp,
    safeMod,
    EventBus,
    GameLoop,
    InputManager,
    SaveManager
  };
})(window);

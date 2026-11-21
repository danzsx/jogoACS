// ============================================================================
// TERRITÓRIO VIVO — ORGANIC MUSIC DIRECTOR (Soundtrack Context & Transitions)
// ============================================================================
// Maps game environments, time of day, weather, narrative states, quests,
// and story events to the 5 soundtrack compositions without abrupt cuts,
// mechanical track-switching, or intrusiveness during dialogues/SFX.

(function (global) {
  'use strict';

  const TRACKS = ['main_theme', 'contemplation', 'health_center', 'dramatic', 'celebration'];

  const EVENT_TRACK_MAP = {
    evt_prologo_abertura: 'main_theme',
    evt_cap1_climax_ubs: 'dramatic',
    evt_cap3_fratura_ubs: 'dramatic',
    evt_cap4_assembleia_pracinha: 'celebration'
  };

  class MusicDirector {
    constructor(game) {
      this.game = game;
      this.started = false;
      this.modalMode = null; // null | 'INTRO' | 'WEEKLY_SUMMARY' | 'CAMPAIGN_ENDING'
      this._celebrationTimer = 0;
      this._pendingTrack = undefined;
      this._pendingTimer = 0;
      this._lastDuck = 1.0;

      this._bindEvents();
    }

    _bindEvents() {
      const g = this.game;
      if (!g || !g.events) return;

      // Immediate re-evaluation on major narrative/scene milestones
      g.events.on('scene:changed', () => {
        this.evaluate({ immediate: false, debounceSeconds: 1.0 });
      });

      g.events.on('story:eventCompleted', ({ eventId } = {}) => {
        if (eventId === 'evt_cap4_assembleia_pracinha') {
          this.triggerCelebration(24);
        }
        this.evaluate({ immediate: true, fadeSeconds: 2.2 });
      });

      g.events.on('quest:completed', ({ questId } = {}) => {
        // Celebrate main chapter completions organically
        if (questId && /^q[1-4]_/.test(questId)) {
          this.triggerCelebration(20);
        }
      });

      g.events.on('world:stateChanged', ({ key, value } = {}) => {
        if ((key === 'pracinhaStatus' && (value === 'REVITALIZADA' || value === 'mobilizada' || value === 'celebracao')) ||
            (key === 'hortaStage' && value >= 3)) {
          this.triggerCelebration(18);
        }
      });

      g.events.on('day:ended', () => {
        // Gentle fade down when sleeping/ending the day
        this._celebrationTimer = 0;
      });
    }

    markStarted() {
      this.started = true;
      this.modalMode = null;
      if (global.sfx) {
        global.sfx.init();
        global.sfx.preloadTracks(TRACKS);
      }
      this.evaluate({ immediate: true, fadeSeconds: 2.0 });
    }

    setModalMode(mode) {
      this.modalMode = mode || null;
      this.evaluate({ immediate: true, fadeSeconds: 1.6 });
    }

    triggerCelebration(seconds = 20) {
      this._celebrationTimer = Math.max(this._celebrationTimer, seconds);
      this.evaluate({ immediate: true, fadeSeconds: 1.4 });
    }

    _isOverlayOpen(id) {
      if (typeof document === 'undefined') return false;
      const el = document.getElementById(id);
      return !!(el && !el.classList.contains('hidden'));
    }

    // Determines the ideal track (or null for ambient-only silence) and priority
    resolveDesiredContext() {
      const g = this.game;
      if (!this.started || this.modalMode === 'INTRO') {
        return { track: null, priority: 'HIGH', fadeSeconds: 1.5 };
      }

      // 1. Active Story / Heart Event
      const activeEvent = g.storyEvents && g.storyEvents.activeEvent;
      if (activeEvent) {
        if (EVENT_TRACK_MAP[activeEvent.id]) {
          return { track: EVENT_TRACK_MAP[activeEvent.id], priority: 'HIGH', fadeSeconds: 1.6 };
        }
        if (activeEvent.id && activeEvent.id.startsWith('evt_heart_')) {
          return { track: 'contemplation', priority: 'HIGH', fadeSeconds: 1.8 };
        }
      }

      // 2. Major Summary / Ending Modals
      if (this.modalMode === 'CAMPAIGN_ENDING') {
        return { track: 'celebration', priority: 'HIGH', fadeSeconds: 1.6 };
      }
      if (this.modalMode === 'WEEKLY_SUMMARY') {
        const goalMet = g.weeklyVisits >= g.weeklyGoal;
        return { track: goalMet ? 'celebration' : 'contemplation', priority: 'HIGH', fadeSeconds: 1.8 };
      }

      // 3. Post-milestone celebration window
      if (this._celebrationTimer > 0) {
        return { track: 'celebration', priority: 'HIGH', fadeSeconds: 1.6 };
      }

      const loc = g.currentLocation || 'OVERWORLD';
      const hourFloat = (g.timeMinutes || 0) / 60;
      const weather = typeof g.getCurrentWeather === 'function' ? g.getCurrentWeather() : 'SUNNY';
      const story = g.storyState;
      const chapter = story ? story.chapter : 0;

      // 4. Ongoing Dramatic Narrative States (during quest development, not just start)
      const isInUBS = loc === 'UBS_INTERIOR' || loc === 'ESF_ROOM';
      if (story) {
        // Chapter 1: Tension builds in the UBS after hearing neighborhood complaints until climax is resolved
        if (chapter === 1 && isInUBS &&
            story.hasFlag('q1_territorio_ouvido') && !story.hasFlag('q1_climax_ubs_visto')) {
          return { track: 'dramatic', priority: 'MEDIUM', fadeSeconds: 2.2 };
        }
        // Chapter 3: "Sobrecarga & Fratura" — clinic pressure & moral dilemma before resolution
        if (chapter === 3 && !story.hasFlag('q3_fratura_ubs_vista')) {
          if (isInUBS || story.hasFlag('q3_ze_campo_ok')) {
            return { track: 'dramatic', priority: 'MEDIUM', fadeSeconds: 2.2 };
          }
        }
      }

      // 5. Scene & Environment Contexts
      if (isInUBS) {
        return { track: 'health_center', priority: 'LOW', fadeSeconds: 2.4 };
      }

      if (loc === 'PLAYER_HOME') {
        // Late night at home: quiet rest with ambient-only soundscape
        if (hourFloat >= 21.0) {
          return { track: null, priority: 'LOW', fadeSeconds: 2.8 };
        }
        return { track: 'contemplation', priority: 'LOW', fadeSeconds: 2.6 };
      }

      // OVERWORLD, VENDINHA, ASSOCIACAO share continuous community soundscape
      if (hourFloat >= 17.5 || weather === 'RAIN') {
        return { track: 'contemplation', priority: 'LOW', fadeSeconds: 3.0 };
      }

      return { track: 'main_theme', priority: 'LOW', fadeSeconds: 2.6 };
    }

    _updateDucking() {
      if (!global.sfx || typeof global.sfx.setMusicDuck !== 'function') return;

      let targetDuck = 1.0;
      let fade = 0.65;

      if (this._isOverlayOpen('dialogue-overlay')) {
        targetDuck = 0.38;
        fade = 0.35;
      } else if (
        this._isOverlayOpen('tablet-overlay') ||
        this._isOverlayOpen('phone-overlay') ||
        this._isOverlayOpen('map-overlay')
      ) {
        targetDuck = 0.45;
        fade = 0.4;
      }

      if (Math.abs(targetDuck - this._lastDuck) > 0.01) {
        this._lastDuck = targetDuck;
        global.sfx.setMusicDuck(targetDuck, fade);
      }
    }

    evaluate({ immediate = false, debounceSeconds = 1.1, fadeSeconds = null } = {}) {
      this._updateDucking();

      if (!global.sfx || typeof global.sfx.playMusic !== 'function') return;

      const desired = this.resolveDesiredContext();
      const targetFade = fadeSeconds !== null ? fadeSeconds : desired.fadeSeconds;
      const currentTarget = global.sfx.getTargetTrack();

      if (desired.track === currentTarget) {
        this._pendingTrack = undefined;
        this._pendingTimer = 0;
        return;
      }

      if (immediate || desired.priority === 'HIGH') {
        this._pendingTrack = undefined;
        this._pendingTimer = 0;
        global.sfx.playMusic(desired.track, { fadeSeconds: targetFade, loop: true, resume: true });
        return;
      }

      // Debounce low-priority environment changes to prevent ping-ponging on quick door exits
      if (this._pendingTrack !== desired.track) {
        this._pendingTrack = desired.track;
        this._pendingTimer = debounceSeconds;
        this._pendingFade = targetFade;
      }
    }

    update(dt) {
      if (global.sfx && typeof global.sfx.updateMusicMixer === 'function') {
        global.sfx.updateMusicMixer(dt);
      }

      if (this._celebrationTimer > 0) {
        this._celebrationTimer = Math.max(0, this._celebrationTimer - dt);
        if (this._celebrationTimer === 0) {
          this.evaluate({ immediate: false, debounceSeconds: 0.4, fadeSeconds: 3.0 });
        }
      }

      if (this._pendingTrack !== undefined) {
        this._pendingTimer -= dt;
        if (this._pendingTimer <= 0) {
          const track = this._pendingTrack;
          const fade = this._pendingFade || 2.5;
          this._pendingTrack = undefined;
          this._pendingTimer = 0;
          if (global.sfx && typeof global.sfx.playMusic === 'function') {
            global.sfx.playMusic(track, { fadeSeconds: fade, loop: true, resume: true });
          }
        }
      }

      this.evaluate({ immediate: false, debounceSeconds: 1.2 });
    }
  }

  global.MusicDirector = MusicDirector;
})(window);

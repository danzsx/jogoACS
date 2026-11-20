// ============================================================================
// TERRITÓRIO VIVO — STORY STATE & NARRATIVE MEMORY SYSTEM (Etapa H1)
// ============================================================================
// Centraliza a memória persistente do Modo História (SaveManager schema v3):
//   - chapter (0 = Prólogo, 1..4 = Capítulos, 5 = Epílogo / Modo Livre)
//   - storyFlags & recentFlags (memória de curto prazo com expiração em dias)
//   - posture (acolhimento, firmeza, articulacao, burocracia)
//   - npcBonds (vínculo individual 0..100 para os 10 staff da UBS + 3 comunidade)
//   - completedEvents, quests e worldStates (estrutura pronta para H2–H4)

(function (global) {
  'use strict';

  const DEFAULT_NPC_BONDS = {
    // 10 Profissionais da UBS & Sala ESF (ubsInterior.js)
    vigia: 45,
    escriturario: 35,
    limpeza: 45,
    medico: 40,
    enfermeira_marina: 40,
    enfermeiro_carlos: 45,
    fisioterapeuta: 45,
    acs_joana: 55,
    acs_tiago: 45,
    acs_rosana: 50,
    // 3 Lideranças & Espaços Comunitários (communitySpaces.js)
    npc_seu_ze: 45,
    npc_tia_bete: 40,
    npc_dona_carla: 30
  };

  const DEFAULT_POSTURE = {
    acolhimento: 0,
    firmeza: 0,
    articulacao: 0,
    burocracia: 0
  };

  const DEFAULT_WORLD_STATES = {
    hortaStage: 0,
    ubsMural: 'default',
    pracinhaStatus: 'default',
    cluesFound: []
  };

  class StoryStateSystem {
    constructor(game) {
      this.game = game;
      this.reset();
      this._bindEvents();
    }

    reset() {
      this.chapter = 0; // 0 = Prólogo
      this.storyFlags = {};
      this.recentFlags = {}; // { [key]: { value, expiresAtDay } }
      this.posture = { ...DEFAULT_POSTURE };
      this.npcBonds = { ...DEFAULT_NPC_BONDS };
      this.completedEvents = new Set();
      this.talkedBondToday = new Set();
      this.quests = {
        active: {},
        completed: []
      };
      this.worldStates = {
        ...DEFAULT_WORLD_STATES,
        cluesFound: []
      };
    }

    _bindEvents() {
      const g = this.game;
      if (!g.events) return;

      g.events.on('day:started', () => {
        this.talkedBondToday.clear();
        this.pruneExpiredRecentFlags();
      });

      g.events.on('npc:talked', (payload) => {
        if (!payload || !payload.npcId) return;
        const npcId = payload.npcId;
        if (!(npcId in this.npcBonds)) return;
        if (this.talkedBondToday.has(npcId)) return;

        this.talkedBondToday.add(npcId);
        this.addNpcBond(npcId, 3);
      });
    }

    getTotalDayIndex() {
      const g = this.game;
      const week = Math.max(1, Number(g.weekNumber) || 1);
      const day = Math.max(0, Number(g.dayOfWeek) || 0);
      return (week - 1) * 6 + day;
    }

    getNpcBond(npcId) {
      if (!npcId) return 0;
      if (npcId in this.npcBonds) return this.npcBonds[npcId];
      return 0;
    }

    hasNpcBondEntry(npcId) {
      return !!npcId && (npcId in this.npcBonds);
    }

    addNpcBond(npcId, delta) {
      if (!npcId || !(npcId in this.npcBonds) || !delta) return this.getNpcBond(npcId);
      const next = global.ACSEngine.clamp((this.npcBonds[npcId] || 0) + Number(delta), 0, 100);
      this.npcBonds[npcId] = next;
      return next;
    }

    // Unified bond lookup across families (H01..H15), UBS staff and community NPCs
    getEntityBond(entityId) {
      if (!entityId) return 50;
      if (this.hasNpcBondEntry(entityId)) {
        return this.npcBonds[entityId];
      }
      const fam = (this.game.families || []).find(f => f.id === entityId);
      if (fam) return fam.bond;
      return 50;
    }

    getBondLabel(score) {
      if (score >= 80) return 'Aliado';
      if (score >= 55) return 'Confiante';
      if (score >= 35) return 'Conhecido';
      return 'Distante';
    }

    setFlag(key, value = true) {
      if (!key) return;
      this.storyFlags[key] = value;
      // Keep legacy NarrativeSystem flags synchronized when truthy boolean
      if (value === true && this.game.narrative && this.game.narrative.flags) {
        this.game.narrative.flags[key] = true;
      }
    }

    getFlag(key) {
      if (!key) return undefined;
      if (key in this.storyFlags) return this.storyFlags[key];
      if (this.game.narrative && this.game.narrative.flags && (key in this.game.narrative.flags)) {
        return this.game.narrative.flags[key];
      }
      return undefined;
    }

    hasFlag(key) {
      return !!this.getFlag(key);
    }

    setRecentFlag(key, value = true, ttlDays = 3) {
      if (!key) return;
      const expiresAtDay = this.getTotalDayIndex() + Math.max(1, Number(ttlDays) || 3);
      this.recentFlags[key] = { value, expiresAtDay };
    }

    getRecentFlag(key) {
      if (!key) return undefined;
      const entry = this.recentFlags[key];
      if (!entry) return undefined;
      if (this.getTotalDayIndex() > entry.expiresAtDay) {
        delete this.recentFlags[key];
        return undefined;
      }
      return entry.value;
    }

    hasRecentFlag(key) {
      return !!this.getRecentFlag(key);
    }

    pruneExpiredRecentFlags() {
      const today = this.getTotalDayIndex();
      for (const key of Object.keys(this.recentFlags)) {
        const entry = this.recentFlags[key];
        if (!entry || today > entry.expiresAtDay) {
          delete this.recentFlags[key];
        }
      }
    }

    addPosture(axis, delta = 1) {
      if (!axis || !(axis in this.posture)) return 0;
      this.posture[axis] = Math.max(0, (this.posture[axis] || 0) + Number(delta || 0));
      return this.posture[axis];
    }

    getPosture(axis) {
      return this.posture[axis] || 0;
    }

    getDominantPosture() {
      let bestAxis = 'acolhimento';
      let bestVal = -1;
      for (const axis of Object.keys(DEFAULT_POSTURE)) {
        const v = this.posture[axis] || 0;
        if (v > bestVal) {
          bestVal = v;
          bestAxis = axis;
        }
      }
      return { axis: bestAxis, value: bestVal };
    }

    isEventCompleted(eventId) {
      return !!eventId && this.completedEvents.has(eventId);
    }

    markEventCompleted(eventId) {
      if (!eventId) return;
      this.completedEvents.add(eventId);
    }

    syncFromLegacyNarrative() {
      const nFlags = this.game.narrative && this.game.narrative.flags;
      if (!nFlags) return;
      for (const key of Object.keys(nFlags)) {
        if (nFlags[key] && !(key in this.storyFlags)) {
          this.storyFlags[key] = nFlags[key];
        }
      }
    }

    exportState() {
      this.pruneExpiredRecentFlags();
      return {
        chapter: this.chapter,
        storyFlags: { ...this.storyFlags },
        recentFlags: JSON.parse(JSON.stringify(this.recentFlags)),
        posture: { ...this.posture },
        npcBonds: { ...this.npcBonds },
        completedEvents: Array.from(this.completedEvents),
        talkedBondToday: Array.from(this.talkedBondToday),
        quests: {
          active: JSON.parse(JSON.stringify(this.quests.active || {})),
          completed: Array.isArray(this.quests.completed) ? this.quests.completed.slice() : []
        },
        worldStates: {
          hortaStage: this.worldStates.hortaStage || 0,
          ubsMural: this.worldStates.ubsMural || 'default',
          pracinhaStatus: this.worldStates.pracinhaStatus || 'default',
          cluesFound: Array.isArray(this.worldStates.cluesFound) ? this.worldStates.cluesFound.slice() : []
        }
      };
    }

    importState(data) {
      this.reset();
      if (!data || typeof data !== 'object') {
        this.syncFromLegacyNarrative();
        return;
      }

      this.chapter = global.ACSEngine.clamp(Number(data.chapter) || 0, 0, 5);
      this.storyFlags = data.storyFlags && typeof data.storyFlags === 'object'
        ? { ...data.storyFlags }
        : {};
      this.recentFlags = data.recentFlags && typeof data.recentFlags === 'object'
        ? JSON.parse(JSON.stringify(data.recentFlags))
        : {};

      if (data.posture && typeof data.posture === 'object') {
        for (const axis of Object.keys(DEFAULT_POSTURE)) {
          this.posture[axis] = Math.max(0, Number(data.posture[axis]) || 0);
        }
      }

      if (data.npcBonds && typeof data.npcBonds === 'object') {
        for (const npcId of Object.keys(DEFAULT_NPC_BONDS)) {
          if (typeof data.npcBonds[npcId] === 'number') {
            this.npcBonds[npcId] = global.ACSEngine.clamp(data.npcBonds[npcId], 0, 100);
          }
        }
      }

      this.completedEvents = new Set(Array.isArray(data.completedEvents) ? data.completedEvents : []);
      this.talkedBondToday = new Set(Array.isArray(data.talkedBondToday) ? data.talkedBondToday : []);

      if (data.quests && typeof data.quests === 'object') {
        this.quests = {
          active: data.quests.active && typeof data.quests.active === 'object' ? { ...data.quests.active } : {},
          completed: Array.isArray(data.quests.completed) ? data.quests.completed.slice() : []
        };
      }

      if (data.worldStates && typeof data.worldStates === 'object') {
        this.worldStates = {
          hortaStage: Number(data.worldStates.hortaStage) || 0,
          ubsMural: data.worldStates.ubsMural || 'default',
          pracinhaStatus: data.worldStates.pracinhaStatus || 'default',
          cluesFound: Array.isArray(data.worldStates.cluesFound) ? data.worldStates.cluesFound.slice() : []
        };
      }

      this.pruneExpiredRecentFlags();
      this.syncFromLegacyNarrative();
    }
  }

  global.StoryStateSystem = StoryStateSystem;
  global.ACS_DEFAULT_NPC_BONDS = DEFAULT_NPC_BONDS;
})(window);

// ============================================================================
// TERRITÓRIO VIVO — STRATEGIC PLANNER & ROUTE SYSTEM (Etapa E3)
// ============================================================================
// Generates daily territorial demands classified by urgency, manages the
// "Rota do Dia" (3–5 ordered stops with feasibility & weather preview),
// grants "Visita Preparada" bonuses without punishing free exploration,
// and coordinates UBS Campaigns & Referrals.

(function (global) {
  'use strict';

  const WEATHER_LABELS = {
    SUNNY: { icon: '☀️', label: 'Sol' },
    HEATWAVE: { icon: '🔥', label: 'Calor Forte' },
    CLOUDY: { icon: '⛅', label: 'Nublado' },
    RAIN: { icon: '🌧️', label: 'Chuva' }
  };

  const CAMPAIGN_DEFS = [
    {
      id: 'camp_dengue',
      title: '🦟 Controle Vetorial (Dengue)',
      lead: 'Seu Oswaldo & ACS',
      desc: 'Eliminar focos de Aedes aegypti nos quintais e pontos críticos da microárea.',
      targetPin: { type: 'UBS', id: 'UBS' }
    },
    {
      id: 'camp_cronicos',
      title: '❤️ Acompanhamento de Crônicos',
      lead: 'Dr. Henrique & Enfª Marina',
      desc: 'Garantir retorno e vínculo com hipertensos, diabéticos e idosos (H01, H04, H05, H07, H09, H12, H14).',
      familyIds: ['H01', 'H04', 'H05', 'H07', 'H09', 'H12', 'H14']
    },
    {
      id: 'camp_materno',
      title: '🤱 Saúde Materno-Infantil & Vacina',
      lead: 'Enf. Carlos & Enfª Marina',
      desc: 'Acompanhar gestantes, puérperas e caderneta vacinal das crianças (H03, H08, H15).',
      familyIds: ['H03', 'H08', 'H15']
    },
    {
      id: 'camp_trabalhadores',
      title: '👷 Saúde do Homem & Trabalhadores',
      lead: 'Equipe ESF & Vendinha',
      desc: 'Alcançar moradores com janela curta de horário ou turno noturno (H02, H04, H06, H10, H11).',
      familyIds: ['H02', 'H04', 'H06', 'H10', 'H11']
    }
  ];

  const UBS_REFERRAL_DEFS = [
    {
      id: 'ref_marina_h08',
      staffName: 'Enfª Marina',
      role: 'Enfermeira ESF',
      familyId: 'H08',
      title: 'Pré-natal da Bia (H08)',
      note: 'Checar pressão e retorno de exame — janela flexível pela manhã/tarde.'
    },
    {
      id: 'ref_henrique_h05',
      staffName: 'Dr. Henrique',
      role: 'Médico ESF',
      familyId: 'H05',
      title: 'Renovação de receita — Dona Neide (H05)',
      note: 'Verificar adesão ao anti-hipertensivo e motivo de falta na UBS.'
    },
    {
      id: 'ref_carlos_h03',
      staffName: 'Enf. Carlos',
      role: 'Sala de Vacina',
      familyId: 'H03',
      title: 'Vacinação infantil — Camila (H03)',
      note: 'Sair cedo (07h–09h15) ou fim da tarde (17h–20h) para encontrar Camila.'
    },
    {
      id: 'ref_patricia_h13',
      staffName: 'Dra. Patrícia',
      role: 'eMulti / Psicóloga',
      familyId: 'H13',
      title: 'Escuta protegida — Lucas (H13)',
      note: 'Abordagem sem pressa; evitar tom burocrático.'
    }
  ];

  class PlannerSystem {
    constructor(game) {
      this.game = game;
      this.route = [];
      this.completedStopsToday = [];
      this.routePaused = false;
      this._bindEvents();
    }

    _bindEvents() {
      const g = this.game;
      if (!g || !g.events) return;

      g.events.on('dengue:cleared', ({ spotId }) => {
        if (!spotId) return;
        const res = this.completeStopByTarget('DENGUE', spotId);
        if (res.prepared) {
          g.player.stamina = Math.min(100, g.player.stamina + 4);
          if (typeof g.toast === 'function') {
            g.toast('📋 Parada da Rota concluída! (+4⚡ Visita Preparada)', 'success');
          }
          g.saveProgress();
        }
      });

      g.events.on('scene:changed', ({ to }) => {
        if (to === 'UBS_INTERIOR') {
          this.completeStopByTarget('UBS', 'UBS');
        } else if (to === 'VENDINHA') {
          this.completeStopByTarget('VENDINHA', 'VENDINHA');
        } else if (to === 'ASSOCIACAO') {
          this.completeStopByTarget('ASSOCIACAO', 'ASSOCIACAO');
        }
      });
    }

    reset() {
      this.route = [];
      this.completedStopsToday = [];
      this.routePaused = false;
    }

    resetDaily() {
      this.route = [];
      this.completedStopsToday = [];
      this.routePaused = false;
    }

    getMaxStops() {
      // Base 3 stops; ready for E4 CompetenciesSystem to expand up to 5
      if (this.game && this.game.competencies && typeof this.game.competencies.getMaxRouteStops === 'function') {
        return this.game.competencies.getMaxRouteStops();
      }
      return 3;
    }

    _makeStopId(type, refId) {
      return `${type}:${refId}`;
    }

    _resolveTargetCoords(type, refId) {
      const g = this.game;
      if (type === 'HOUSE') {
        const fam = g.families.find(f => f.id === refId);
        if (!fam) return null;
        let x = fam.x;
        let y = fam.y;
        let locationLabel = 'Casa';
        if (fam.knownSchedule && g.schedule) {
          const loc = g.schedule.getFamilyLocation(fam);
          if (loc.scene === 'OVERWORLD' && loc.type !== 'AWAY') {
            x = loc.x;
            y = loc.y;
            locationLabel = loc.label;
          } else if (loc.type === 'VENDINHA' && g.vendinha) {
            x = g.vendinha.x;
            y = g.vendinha.y;
            locationLabel = loc.label;
          } else if (loc.type === 'ASSOCIACAO' && g.associacao) {
            x = g.associacao.x;
            y = g.associacao.y;
            locationLabel = loc.label;
          } else if (loc.type === 'UBS_ESPERA' && g.ubs) {
            x = g.ubs.doorX;
            y = g.ubs.doorY;
            locationLabel = loc.label;
          }
        }
        return { x, y, fam, locationLabel };
      }
      if (type === 'DENGUE') {
        const spot = g.dengueSpots.find(s => s.id === refId);
        return spot ? { x: spot.x, y: spot.y, spot } : null;
      }
      if (type === 'UBS' && g.ubs) {
        return { x: g.ubs.doorX, y: g.ubs.doorY };
      }
      if (type === 'VENDINHA' && g.vendinha) {
        return { x: g.vendinha.x, y: g.vendinha.y };
      }
      if (type === 'ASSOCIACAO' && g.associacao) {
        return { x: g.associacao.x, y: g.associacao.y };
      }
      if (type === 'HORTA' && g.horta) {
        return { x: g.horta.x, y: g.horta.y };
      }
      if (type === 'PRACA' && g.pracinha) {
        return { x: g.pracinha.x, y: g.pracinha.y };
      }
      return null;
    }

    getTargetAvailability(type, refId) {
      const g = this.game;
      if (type === 'HOUSE') {
        const fam = g.families.find(f => f.id === refId);
        if (!fam) return { status: 'UNKNOWN', text: '???' };
        if (g.visitedToday && g.visitedToday.has(fam.id)) {
          return { status: 'DONE', text: '✅ Visitada hoje' };
        }
        if (!fam.knownSchedule) {
          return { status: 'UNKNOWN', text: '❓ Horário desconhecido (???)' };
        }
        const loc = g.schedule ? g.schedule.getFamilyLocation(fam) : { type: g.isFamilyAtHome(fam) ? 'HOME' : 'AWAY', label: 'Em casa' };
        if (loc.type === 'HOME') {
          return { status: 'OPEN', text: `🟢 Em casa agora (${fam.scheduleText})` };
        }
        if (loc.type !== 'AWAY') {
          return { status: 'OPEN', text: `🔵 ${loc.label} (${fam.scheduleText})` };
        }
        return { status: 'CLOSED', text: `🔴 Ausente agora (em casa: ${fam.scheduleText})` };
      }
      if (type === 'DENGUE') {
        const spot = g.dengueSpots.find(s => s.id === refId);
        if (!spot || spot.cleared) return { status: 'DONE', text: '✅ Foco eliminado' };
        return { status: 'OPEN', text: '🦟 Foco ativo — vistoriar com [E]' };
      }
      if (type === 'UBS') {
        return g.isUBSOpen()
          ? { status: 'OPEN', text: '🟢 Aberta agora (Seg–Sex 08h–18h)' }
          : { status: 'CLOSED', text: '🔴 Fechada agora (Seg–Sex 08h–18h)' };
      }
      if (type === 'VENDINHA') {
        const open = g.timeMinutes >= 7 * 60 && g.timeMinutes <= 21.5 * 60;
        return open
          ? { status: 'OPEN', text: '🟢 Aberta agora (07h–21h30)' }
          : { status: 'CLOSED', text: '🔴 Fechada agora (07h–21h30)' };
      }
      if (type === 'ASSOCIACAO') {
        const open = g.timeMinutes >= 9 * 60 && g.timeMinutes <= 19 * 60;
        return open
          ? { status: 'OPEN', text: '🟢 Aberta agora (09h–19h)' }
          : { status: 'CLOSED', text: '🔴 Fechada agora (09h–19h)' };
      }
      return { status: 'OPEN', text: '🟢 Acesso livre' };
    }

    isStopInRoute(type, refId) {
      const id = this._makeStopId(type, refId);
      return this.route.some(s => s.id === id);
    }

    addStop(stopInput) {
      if (!stopInput || !stopInput.type || !stopInput.refId) {
        return { ok: false, reason: 'INVALID' };
      }
      const id = this._makeStopId(stopInput.type, stopInput.refId);
      if (this.route.some(s => s.id === id)) {
        return { ok: false, reason: 'DUPLICATE' };
      }
      const maxStops = this.getMaxStops();
      if (this.route.length >= maxStops) {
        return { ok: false, reason: 'FULL', maxStops };
      }
      const coords = this._resolveTargetCoords(stopInput.type, stopInput.refId);
      if (!coords) {
        return { ok: false, reason: 'NOT_FOUND' };
      }

      let label = stopInput.label;
      if (!label) {
        if (stopInput.type === 'HOUSE' && coords.fam) {
          label = `${coords.fam.code} (${coords.fam.name.split(' ')[0]})`;
        } else if (stopInput.type === 'DENGUE' && coords.spot) {
          label = coords.spot.label || 'Foco de Dengue';
        } else if (stopInput.type === 'UBS') {
          label = 'UBS Vila Esperança';
        } else if (stopInput.type === 'VENDINHA') {
          label = 'Vendinha do Seu Zé';
        } else if (stopInput.type === 'ASSOCIACAO') {
          label = 'Associação de Moradores';
        } else {
          label = stopInput.refId;
        }
      }

      const stop = {
        id,
        type: stopInput.type,
        refId: stopInput.refId,
        label,
        reason: stopInput.reason || '',
        x: coords.x,
        y: coords.y,
        completed: false
      };

      this.route.push(stop);
      this.routePaused = false;
      this._notifyRouteChanged();
      return { ok: true, stop };
    }

    removeStop(stopId) {
      const before = this.route.length;
      this.route = this.route.filter(s => s.id !== stopId);
      if (this.route.length !== before) {
        this._notifyRouteChanged();
        return true;
      }
      return false;
    }

    moveStop(index, delta) {
      const next = index + delta;
      if (index < 0 || index >= this.route.length || next < 0 || next >= this.route.length) {
        return false;
      }
      const item = this.route[index];
      this.route.splice(index, 1);
      this.route.splice(next, 0, item);
      this._notifyRouteChanged();
      return true;
    }

    clearRoute() {
      this.route = [];
      this.routePaused = false;
      this._notifyRouteChanged();
    }

    togglePauseRoute(forceState) {
      this.routePaused = typeof forceState === 'boolean' ? forceState : !this.routePaused;
      this._notifyRouteChanged();
      return this.routePaused;
    }

    _notifyRouteChanged() {
      const g = this.game;
      if (g && g.events) {
        g.events.emit('planner:route_changed', {
          count: this.route.length,
          paused: this.routePaused
        });
      }
      if (g && g.navigation) {
        g.navigation.resolveObjective();
        g.navigation.updateTrackerUI();
        g.navigation.drawMinimap();
      }
    }

    getNextPendingStop() {
      const g = this.game;
      for (let i = 0; i < this.route.length; i++) {
        const s = this.route[i];
        if (s.completed) continue;
        // Skip already visited today or cleared dengue spot automatically
        if (s.type === 'HOUSE' && g.visitedToday && g.visitedToday.has(s.refId)) {
          s.completed = true;
          continue;
        }
        if (s.type === 'DENGUE') {
          const spot = g.dengueSpots.find(sp => sp.id === s.refId);
          if (spot && spot.cleared) {
            s.completed = true;
            continue;
          }
        }
        const live = this._resolveTargetCoords(s.type, s.refId);
        return {
          ...s,
          index: i,
          x: live ? live.x : s.x,
          y: live ? live.y : s.y
        };
      }
      return null;
    }

    completeStopByTarget(type, refId) {
      const id = this._makeStopId(type, refId);
      const stop = this.route.find(s => s.id === id && !s.completed);
      if (!stop) {
        return { prepared: false, stop: null };
      }
      stop.completed = true;
      if (!this.completedStopsToday.includes(id)) {
        this.completedStopsToday.push(id);
      }
      if (this.game && this.game.events) {
        this.game.events.emit('planner:stop_completed', { stopId: id, type, refId });
      }
      this._notifyRouteChanged();
      return { prepared: true, stop };
    }

    getDemands() {
      const g = this.game;
      const demands = [];
      const seenIds = new Set();

      const pushDemand = (item) => {
        const id = this._makeStopId(item.type, item.refId);
        if (seenIds.has(id)) return;
        seenIds.add(id);
        const avail = this.getTargetAvailability(item.type, item.refId);
        demands.push({
          id,
          type: item.type,
          refId: item.refId,
          label: item.label,
          tier: item.tier,
          reason: item.reason,
          availability: avail,
          inRoute: this.isStopInRoute(item.type, item.refId)
        });
      };

      // 1. URGENT: Weekly sync at UBS if goal met
      if (g.weeklyVisits >= g.weeklyGoal && !g.weeklyReportSubmitted) {
        pushDemand({
          type: 'UBS',
          refId: 'UBS',
          label: 'UBS Vila Esperança (Sincronizar e-SUS)',
          tier: 'URGENT',
          reason: `Meta semanal cumprida (${g.weeklyVisits}/${g.weeklyGoal})`
        });
      }

      // 2. URGENT: Active Dengue spots
      (g.dengueSpots || []).filter(s => !s.cleared).forEach(spot => {
        pushDemand({
          type: 'DENGUE',
          refId: spot.id,
          label: spot.label || 'Foco de Dengue',
          tier: 'URGENT',
          reason: 'Foco de Aedes aegypti ativo'
        });
      });

      // 3. URGENT: Active investigation cases pointing to families or hubs
      if (g.investigation && typeof g.investigation.getActiveCases === 'function') {
        const activeCases = g.investigation.getActiveCases();
        activeCases.forEach(c => {
          if (Array.isArray(c.relatedFamilies)) {
            c.relatedFamilies.forEach(fid => {
              const fam = g.families.find(f => f.id === fid);
              if (fam && !g.visitedToday.has(fam.id)) {
                pushDemand({
                  type: 'HOUSE',
                  refId: fam.id,
                  label: `${fam.code} — ${fam.name}`,
                  tier: 'URGENT',
                  reason: `Caso aberto: ${c.title}`
                });
              }
            });
          }
        });
      }

      // 4. WINDOW: Weekly priorities not yet visited this week
      const prioSet = new Set(g.weeklyPriorities || []);
      g.families.forEach(fam => {
        if (prioSet.has(fam.id) && !g.visitedThisWeek.has(fam.id) && !g.visitedToday.has(fam.id)) {
          pushDemand({
            type: 'HOUSE',
            refId: fam.id,
            label: `${fam.code} — ${fam.name}`,
            tier: 'WINDOW',
            reason: `⭐ Prioridade da Semana (${fam.risk})`
          });
        }
      });

      // 5. WINDOW: Tight-schedule workers & special community days
      g.families.forEach(fam => {
        if (g.visitedToday.has(fam.id)) return;
        const isTightWorker = fam.archetype === 'TRABALHADOR' || ['H02', 'H03', 'H06', 'H11'].includes(fam.id);
        if (isTightWorker) {
          pushDemand({
            type: 'HOUSE',
            refId: fam.id,
            label: `${fam.code} — ${fam.name}`,
            tier: 'WINDOW',
            reason: fam.knownSchedule ? `Janela de trabalhador (${fam.scheduleText})` : 'Trabalhador — horário a descobrir'
          });
        }
      });

      // Dona Carla at UBS on Mon morning / Fri afternoon
      if ((g.dayOfWeek === 0 || g.dayOfWeek === 4) && g.isUBSOpen()) {
        pushDemand({
          type: 'UBS',
          refId: 'UBS',
          label: 'UBS — Dona Carla & Equipe',
          tier: 'WINDOW',
          reason: g.dayOfWeek === 0 ? 'Dona Carla na UBS (Seg 08h30–12h)' : 'Dona Carla na UBS (Sex 14h–17h30)'
        });
      }

      // 6. FOLLOWUP: Remaining unvisited families
      g.families.forEach(fam => {
        if (g.visitedToday.has(fam.id)) return;
        pushDemand({
          type: 'HOUSE',
          refId: fam.id,
          label: `${fam.code} — ${fam.name}`,
          tier: 'FOLLOWUP',
          reason: `${fam.condition} • Vínculo ${fam.bond}%`
        });
      });

      return demands;
    }

    getWeatherForecastBlocks() {
      const g = this.game;
      const dayData = g.getCurrentDayData ? g.getCurrentDayData() : null;
      const ws = dayData && dayData.weatherSchedule ? dayData.weatherSchedule : {};
      const curH = Math.max(7, Math.min(22, Math.floor((g.timeMinutes || 420) / 60)));
      const blocks = [];

      for (let h = curH; h <= 21 && blocks.length < 4; h += 3) {
        const endH = Math.min(22, h + 2);
        const wKey = ws[h] || 'SUNNY';
        const meta = WEATHER_LABELS[wKey] || WEATHER_LABELS.SUNNY;
        blocks.push({
          range: `${String(h).padStart(2, '0')}h–${String(endH).padStart(2, '0')}h`,
          weather: wKey,
          icon: meta.icon,
          label: meta.label
        });
      }
      return blocks;
    }

    getRouteFeasibility() {
      const g = this.game;
      if (this.route.length === 0) {
        return {
          totalMeters: 0,
          estimatedMinutes: 0,
          stops: [],
          weatherAlert: null
        };
      }

      let prevX = g.player ? g.player.x : 0;
      let prevY = g.player ? g.player.y : 0;
      let totalPx = 0;

      const stops = this.route.map((stop, idx) => {
        const live = this._resolveTargetCoords(stop.type, stop.refId);
        const sx = live ? live.x : stop.x;
        const sy = live ? live.y : stop.y;
        const segDistPx = stop.completed ? 0 : Math.hypot(sx - prevX, sy - prevY);
        if (!stop.completed) {
          totalPx += segDistPx;
          prevX = sx;
          prevY = sy;
        }
        return {
          ...stop,
          index: idx,
          segmentMeters: Math.round(segDistPx / 12),
          availability: this.getTargetAvailability(stop.type, stop.refId)
        };
      });

      const pendingCount = stops.filter(s => !s.completed).length;
      const totalMeters = Math.round(totalPx / 12);
      const estimatedMinutes = Math.round(totalMeters / 18) + pendingCount * 15;

      const curWeather = g.getCurrentWeather ? g.getCurrentWeather() : 'SUNNY';
      let weatherAlert = null;
      if (curWeather === 'HEATWAVE') {
        weatherAlert = '🔥 Calor forte agora: leve Água [1] e Protetor [2] ao cruzar trechos sem sombra.';
      } else if (curWeather === 'RAIN') {
        weatherAlert = '🌧️ Chuva agora: ative o Guarda-Sol/Capa [3] para proteger energia e hidratação.';
      }

      return {
        totalMeters,
        estimatedMinutes,
        stops,
        weatherAlert
      };
    }

    getCampaigns() {
      const g = this.game;
      return CAMPAIGN_DEFS.map(def => {
        if (def.id === 'camp_dengue') {
          const total = (g.dengueSpots || []).length || 4;
          const done = g.dengueClearedCount || 0;
          return {
            ...def,
            done,
            total,
            pct: Math.min(100, Math.round((done / total) * 100))
          };
        }
        const fams = (def.familyIds || []).map(id => g.families.find(f => f.id === id)).filter(Boolean);
        const done = fams.filter(f => (g.visitedThisWeek && g.visitedThisWeek.has(f.id)) || f.bond >= 75).length;
        const total = fams.length || 1;
        return {
          ...def,
          done,
          total,
          pct: Math.min(100, Math.round((done / total) * 100))
        };
      });
    }

    getUBSReferrals() {
      const g = this.game;
      return UBS_REFERRAL_DEFS.map(ref => {
        const fam = g.families.find(f => f.id === ref.familyId);
        const visitedToday = g.visitedToday && g.visitedToday.has(ref.familyId);
        const visitedWeek = g.visitedThisWeek && g.visitedThisWeek.has(ref.familyId);
        return {
          ...ref,
          familyName: fam ? fam.name : ref.familyId,
          scheduleText: fam && fam.knownSchedule ? fam.scheduleText : '??? (a descobrir)',
          visitedToday: !!visitedToday,
          visitedWeek: !!visitedWeek,
          inRoute: this.isStopInRoute('HOUSE', ref.familyId)
        };
      });
    }

    exportState() {
      return {
        route: this.route.map(s => ({ ...s })),
        completedStopsToday: this.completedStopsToday.slice(),
        routePaused: !!this.routePaused
      };
    }

    importState(data) {
      this.reset();
      if (!data || typeof data !== 'object') return;
      if (Array.isArray(data.route)) {
        this.route = data.route.slice(0, this.getMaxStops()).map(s => ({ ...s }));
      }
      if (Array.isArray(data.completedStopsToday)) {
        this.completedStopsToday = data.completedStopsToday.slice();
      }
      this.routePaused = !!data.routePaused;
    }
  }

  global.PlannerSystem = PlannerSystem;
})(window);

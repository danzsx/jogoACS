// ============================================================================
// TERRITÓRIO VIVO — TERRITORIAL NAVIGATION, MINIMAP & COMPASS SYSTEM (M1)
// ============================================================================
// Resolves smart territorial objectives, manages manual GPS pins, draws the
// live corner minimap HUD, and renders a crisp in-world directional compass.

(function (global) {
  'use strict';

  class NavigationSystem {
    constructor(game) {
      this.game = game;
      this.pinnedTarget = null; // { type: 'HOUSE'|'UBS'|'DENGUE', id, label, x, y }
      this.activeObjective = null;
      this.walkTarget = null; // Optional click-to-walk world point { x, y }
      this._minimapTimer = 0;
    }

    setPin(target) {
      this.pinnedTarget = target;
      this.resolveObjective();
      this.updateTrackerUI();
      this.drawMinimap();
    }

    clearPin() {
      this.pinnedTarget = null;
      this.resolveObjective();
      this.updateTrackerUI();
      this.drawMinimap();
    }

    setWalkTarget(worldX, worldY) {
      this.walkTarget = { x: worldX, y: worldY };
    }

    clearWalkTarget() {
      this.walkTarget = null;
    }

    // Determines the best current territorial destination (manual pin takes priority)
    resolveObjective() {
      const g = this.game;

      // 0. Indoor location-aware guidance (Player Home, UBS Interior & Sala ESF)
      if (g.currentLocation && g.currentLocation !== 'OVERWORLD') {
        if (g.currentLocation === 'PLAYER_HOME') {
          if (g.timeMinutes >= 20 * 60 || g.player.stamina < 25) {
            this.activeObjective = {
              type: 'HOME_BED',
              id: 'home_bed',
              pinned: false,
              x: 4.5 * 32,
              y: 5.7 * 32,
              title: '😴 Descansar / Dormir em Casa',
              sub: g.timeMinutes >= 17 * 60 ? 'Vá até a cama para encerrar o dia' : 'Tire um cochilo ou tome café',
              color: '#0284c7'
            };
            return this.activeObjective;
          }
          this.activeObjective = {
            type: 'HOME_EXIT',
            id: 'home_exit',
            pinned: false,
            x: 9.0 * 32,
            y: 11.4 * 32,
            title: '🚪 Sair para a Vila Esperança',
            sub: `Semana ${g.weekNumber} • ${g.weeklyVisits}/${g.weeklyGoal} visitas na semana`,
            color: '#16a34a'
          };
          return this.activeObjective;
        }

        if (g.currentLocation === 'UBS_INTERIOR' && g.ubsInterior) {
          if (g.weeklyVisits >= g.weeklyGoal && !g.weeklyReportSubmitted) {
            const marina = g.ubsInterior.staff.find(s => s.id === 'enfermeira_marina');
            this.activeObjective = {
              type: 'UBS_STAFF',
              id: 'enfermeira_marina',
              pinned: false,
              x: marina ? marina.x : 13.4 * 32,
              y: marina ? marina.y : 6.6 * 32,
              title: '💻 Sincronizar Meta Semanal com Enfª Marina',
              sub: `${g.weeklyVisits}/${g.weeklyGoal} visitas — valide no e-SUS`,
              color: '#0284c7'
            };
            return this.activeObjective;
          }
          const esfDoor = g.ubsInterior.doors.UBS_INTERIOR.find(d => d.id === 'door_esf');
          const exitDoor = g.ubsInterior.doors.UBS_INTERIOR.find(d => d.id === 'door_exit_ubs');
          const visitedESF = g.ubsInterior.staff.some(s => s.room === 'ESF_ROOM' && g.ubsInterior.talkedToday.has(s.id));
          if (!visitedESF && esfDoor) {
            this.activeObjective = {
              type: 'ESF_DOOR',
              id: 'door_esf',
              pinned: false,
              x: esfDoor.x,
              y: esfDoor.y,
              title: '👥 Visite a Sala ESF (Colegas ACS)',
              sub: 'Converse com a equipe da UBS ou entre na Sala ESF à direita',
              color: '#b45309'
            };
            return this.activeObjective;
          }
          this.activeObjective = {
            type: 'UBS_EXIT',
            id: 'door_exit_ubs',
            pinned: false,
            x: exitDoor ? exitDoor.x : 17.5 * 32,
            y: exitDoor ? exitDoor.y : 20.5 * 32,
            title: '🚪 Sair da UBS para Microárea 04',
            sub: `${g.weeklyVisits}/${g.weeklyGoal} visitas na semana`,
            color: '#16a34a'
          };
          return this.activeObjective;
        }

        if (g.currentLocation === 'ESF_ROOM' && g.ubsInterior) {
          if (g.weeklyVisits >= g.weeklyGoal && !g.weeklyReportSubmitted) {
            const term = g.ubsInterior.stations.ESF_ROOM.find(s => s.id === 'esus_terminal');
            this.activeObjective = {
              type: 'ESUS_TERMINAL',
              id: 'esus_terminal',
              pinned: false,
              x: term ? term.x : 3.4 * 32,
              y: term ? term.y : 5.1 * 32,
              title: '💻 Sincronizar no Terminal e-SUS',
              sub: `Meta semanal cumprida (${g.weeklyVisits}/${g.weeklyGoal})!`,
              color: '#0284c7'
            };
            return this.activeObjective;
          }
          const exitESF = g.ubsInterior.doors.ESF_ROOM.find(d => d.id === 'door_exit_esf');
          this.activeObjective = {
            type: 'ESF_EXIT',
            id: 'door_exit_esf',
            pinned: false,
            x: exitESF ? exitESF.x : 11 * 32,
            y: exitESF ? exitESF.y : 13.5 * 32,
            title: '👥 Sala ESF — Colegas ACS',
            sub: 'Converse com Joana, Tiago e Rosana ou volte à UBS',
            color: '#0284c7'
          };
          return this.activeObjective;
        }
      }

      // 1. Validate manual pin
      if (this.pinnedTarget) {
        if (this.pinnedTarget.type === 'HOUSE') {
          const fam = g.families.find(f => f.id === this.pinnedTarget.id);
          if (fam && !g.visitedToday.has(fam.id)) {
            const loc = g.schedule ? g.schedule.getFamilyLocation(fam) : { type: g.isFamilyAtHome(fam) ? 'HOME' : 'AWAY', x: fam.x, y: fam.y, label: '' };
            const atHome = loc.type === 'HOME';
            // If family is known and currently at an overworld community spot (Feira/Pracinha), point directly there!
            let targetX = fam.x;
            let targetY = fam.y;
            if (fam.knownSchedule && loc.scene === 'OVERWORLD' && loc.type !== 'AWAY') {
              targetX = loc.x;
              targetY = loc.y;
            } else if (fam.knownSchedule && loc.type === 'VENDINHA' && g.vendinha) {
              targetX = g.vendinha.x;
              targetY = g.vendinha.y;
            } else if (fam.knownSchedule && loc.type === 'ASSOCIACAO' && g.associacao) {
              targetX = g.associacao.x;
              targetY = g.associacao.y;
            } else if (fam.knownSchedule && loc.type === 'UBS_ESPERA') {
              targetX = g.ubs.doorX;
              targetY = g.ubs.doorY;
            }
            this.activeObjective = {
              type: 'HOUSE',
              id: fam.id,
              pinned: true,
              x: targetX,
              y: targetY,
              title: `📍 Rota: ${fam.code} (${fam.name.split(' ')[0]})`,
              sub: !fam.knownSchedule
                ? 'Horário a descobrir — bata no portão'
                : (atHome ? 'Em casa agora! Vá visitar.' : `${loc.label} (${fam.scheduleText})`),
              color: atHome ? '#16a34a' : (loc.type !== 'AWAY' ? '#0284c7' : '#d97706')
            };
            return this.activeObjective;
          }
        } else if (this.pinnedTarget.type === 'UBS') {
          this.activeObjective = {
            type: 'UBS',
            id: 'UBS',
            pinned: true,
            x: g.ubs.doorX,
            y: g.ubs.doorY,
            title: '📍 Rota: UBS Vila Esperança',
            sub: g.isUBSOpen() ? 'Reabasteça a mochila ou sincronize o e-SUS' : 'UBS fechada agora (Seg–Sex 08h–18h)',
            color: '#0284c7'
          };
          return this.activeObjective;
        } else if (this.pinnedTarget.type === 'HOME') {
          this.activeObjective = {
            type: 'HOME',
            id: 'PLAYER_HOME',
            pinned: true,
            x: g.playerHome.x,
            y: g.playerHome.y,
            title: '📍 Rota: Casa do ACS',
            sub: 'Descanse, beba água no filtro ou durma',
            color: '#b45309'
          };
          return this.activeObjective;
        } else if (this.pinnedTarget.type === 'VENDINHA' && g.vendinha) {
          this.activeObjective = {
            type: 'VENDINHA',
            id: 'VENDINHA',
            pinned: true,
            x: g.vendinha.x,
            y: g.vendinha.y,
            title: '📍 Rota: Vendinha do Seu Zé',
            sub: 'Aberta Seg–Sáb (07h–21h30) — cafezinho e prosa',
            color: '#d97706'
          };
          return this.activeObjective;
        } else if (this.pinnedTarget.type === 'ASSOCIACAO' && g.associacao) {
          this.activeObjective = {
            type: 'ASSOCIACAO',
            id: 'ASSOCIACAO',
            pinned: true,
            x: g.associacao.x,
            y: g.associacao.y,
            title: '📍 Rota: Associação de Moradores',
            sub: 'Tia Bete & Projetos do Bairro (09h–19h)',
            color: '#15803d'
          };
          return this.activeObjective;
        } else if (this.pinnedTarget.type === 'PRACA' && g.pracinha) {
          this.activeObjective = {
            type: 'PRACA',
            id: 'PRACINHA',
            pinned: true,
            x: g.pracinha.x,
            y: g.pracinha.y,
            title: '📍 Rota: Pracinha dos Ipês',
            sub: 'Feira (Ter) • Dominó (Qui/Sáb) • Sombras & Bancos',
            color: '#ec4899'
          };
          return this.activeObjective;
        } else if (this.pinnedTarget.type === 'HORTA' && g.horta) {
          this.activeObjective = {
            type: 'HORTA',
            id: 'HORTA',
            pinned: true,
            x: g.horta.x,
            y: g.horta.y,
            title: '📍 Rota: Horta Comunitária',
            sub: 'Terreno ao lado da Associação de Moradores',
            color: '#16a34a'
          };
          return this.activeObjective;
        } else if (this.pinnedTarget.type === 'CAMPINHO' && g.campinho) {
          this.activeObjective = {
            type: 'CAMPINHO',
            id: 'CAMPINHO',
            pinned: true,
            x: g.campinho.x,
            y: g.campinho.y,
            title: '📍 Rota: Campinho de Futebol',
            sub: 'Bairro Vizinho (Vila Aurora — Leste)',
            color: '#16a34a'
          };
          return this.activeObjective;
        } else if (this.pinnedTarget.type === 'MYSTERY_HOUSE' && g.mysteryHouse) {
          this.activeObjective = {
            type: 'MYSTERY_HOUSE',
            id: 'MYSTERY_HOUSE',
            pinned: true,
            x: g.mysteryHouse.x,
            y: g.mysteryHouse.y,
            title: '📍 Rota: Casa Misteriosa',
            sub: 'Casarão Nº 00 — Bairro Vizinho (Nordeste)',
            color: '#475569'
          };
          return this.activeObjective;
        }
        // Pin became obsolete (e.g. house already visited)
        this.pinnedTarget = null;
      }

      // 2. Late night guidance -> return to Casa do ACS to sleep!
      if (g.timeMinutes >= 20.5 * 60) {
        this.activeObjective = {
          type: 'HOME',
          id: 'PLAYER_HOME',
          pinned: false,
          x: g.playerHome.x,
          y: g.playerHome.y,
          title: '🌙 Noite Alta! Volte para Casa',
          sub: 'Durma na sua cama para descansar e virar o dia',
          color: '#6366f1'
        };
        return this.activeObjective;
      }

      // 3. Weekly goal met & UBS open & report not yet submitted -> sync at UBS
      if (g.weeklyVisits >= g.weeklyGoal && !g.weeklyReportSubmitted && g.isUBSOpen()) {
        this.activeObjective = {
          type: 'UBS',
          id: 'UBS',
          pinned: false,
          x: g.ubs.doorX,
          y: g.ubs.doorY,
          title: '🏥 Meta Semanal Cumprida! Vá à UBS',
          sub: `${g.weeklyVisits}/${g.weeklyGoal} visitas — sincronize o e-SUS`,
          color: '#0284c7'
        };
        return this.activeObjective;
      }

      // 4. Urgent hydration survival tip if water bottle is empty
      const waterItem = g.inventory.find(i => i.id === 'water');
      if (g.player.hydration < 28 && (!waterItem || waterItem.count <= 0)) {
        const friends = g.families.filter(f => f.archetype === 'AMIGO');
        const candidates = [
          { x: g.playerHome.x, y: g.playerHome.y, label: 'Filtro de Barro (Casa)' },
          ...friends.map(f => ({ x: f.x, y: f.y, label: `${f.code} (${f.name.split(' ')[0]})` }))
        ];
        if (g.isUBSOpen()) {
          candidates.push({ x: g.ubs.doorX, y: g.ubs.doorY, label: 'UBS Vila Esperança' });
        }
        candidates.sort((a, b) =>
          Math.hypot(a.x - g.player.x, a.y - g.player.y) - Math.hypot(b.x - g.player.x, b.y - g.player.y)
        );
        const nearest = candidates[0];
        this.activeObjective = {
          type: 'WATER',
          id: 'WATER',
          pinned: false,
          x: nearest.x,
          y: nearest.y,
          title: `💧 Reabasteça Água: ${nearest.label}`,
          sub: 'Hidratação baixa e garrafa vazia!',
          color: '#0284c7'
        };
        return this.activeObjective;
      }

      // 4.5 Planned Route of the Day (Etapa E3) — guides to next pending stop if no manual pin
      if (g.planner && !g.planner.routePaused) {
        const nextStop = g.planner.getNextPendingStop();
        if (nextStop) {
          const avail = g.planner.getTargetAvailability(nextStop.type, nextStop.refId);
          this.activeObjective = {
            type: nextStop.type,
            id: nextStop.refId,
            pinned: false,
            fromPlanner: true,
            routeIndex: nextStop.index,
            routeTotal: g.planner.route.length,
            x: nextStop.x,
            y: nextStop.y,
            title: `📋 Rota ${nextStop.index + 1}/${g.planner.route.length}: ${nextStop.label}`,
            sub: avail ? avail.text : 'Parada planejada no Tablet [TAB]',
            color: '#0284c7'
          };
          return this.activeObjective;
        }
      }

      // 5. Weekly Priority family that is unvisited this week, known & at home right now
      const prioritySet = new Set(g.weeklyPriorities || []);
      const unvisitedToday = g.families.filter(f => !g.visitedToday.has(f.id));
      const priorityHome = unvisitedToday.filter(
        f => prioritySet.has(f.id) && !g.visitedThisWeek.has(f.id) && f.knownSchedule && g.isFamilyAtHome(f)
      );
      if (priorityHome.length > 0) {
        priorityHome.sort((a, b) =>
          Math.hypot(a.x - g.player.x, a.y - g.player.y) - Math.hypot(b.x - g.player.x, b.y - g.player.y)
        );
        const fam = priorityHome[0];
        this.activeObjective = {
          type: 'HOUSE',
          id: fam.id,
          pinned: false,
          x: fam.x,
          y: fam.y,
          title: `⭐ Prioridade: ${fam.code} (${fam.name.split(' ')[0]})`,
          sub: `Em casa agora • Semana: ${g.weeklyVisits}/${g.weeklyGoal}`,
          color: '#b45309'
        };
        return this.activeObjective;
      }

      // 6. Nearest unvisited house that is KNOWN & AT HOME right now
      const knownHome = unvisitedToday.filter(f => f.knownSchedule && g.isFamilyAtHome(f));
      if (knownHome.length > 0) {
        knownHome.sort((a, b) =>
          Math.hypot(a.x - g.player.x, a.y - g.player.y) - Math.hypot(b.x - g.player.x, b.y - g.player.y)
        );
        const fam = knownHome[0];
        this.activeObjective = {
          type: 'HOUSE',
          id: fam.id,
          pinned: false,
          x: fam.x,
          y: fam.y,
          title: `🏠 Visitar ${fam.code} (${fam.name.split(' ')[0]})`,
          sub: `Em casa agora • Semana: ${g.weeklyVisits}/${g.weeklyGoal}`,
          color: '#16a34a'
        };
        return this.activeObjective;
      }

      // 7. Nearest unvisited house with UNKNOWN schedule
      const unknown = unvisitedToday.filter(f => !f.knownSchedule);
      if (unknown.length > 0) {
        unknown.sort((a, b) =>
          Math.hypot(a.x - g.player.x, a.y - g.player.y) - Math.hypot(b.x - g.player.x, b.y - g.player.y)
        );
        const fam = unknown[0];
        this.activeObjective = {
          type: 'HOUSE',
          id: fam.id,
          pinned: false,
          x: fam.x,
          y: fam.y,
          title: `🔍 Descobrir Horário: ${fam.code}`,
          sub: 'Bata no portão ou pergunte aos moradores amigos',
          color: '#d97706'
        };
        return this.activeObjective;
      }

      // 8. Nearest remaining dengue spot
      const dengue = g.dengueSpots.filter(s => !s.cleared);
      if (dengue.length > 0) {
        dengue.sort((a, b) =>
          Math.hypot(a.x - g.player.x, a.y - g.player.y) - Math.hypot(b.x - g.player.x, b.y - g.player.y)
        );
        const spot = dengue[0];
        this.activeObjective = {
          type: 'DENGUE',
          id: spot.id,
          pinned: false,
          x: spot.x,
          y: spot.y,
          title: '🦟 Vistoriar Foco de Dengue',
          sub: spot.label,
          color: '#eab308'
        };
        return this.activeObjective;
      }

      // 9. Fallback: UBS if open, else Casa do ACS
      if (g.isUBSOpen()) {
        this.activeObjective = {
          type: 'UBS',
          id: 'UBS',
          pinned: false,
          x: g.ubs.doorX,
          y: g.ubs.doorY,
          title: '🏥 Passar na UBS ou Descansar',
          sub: 'Converse com a equipe ou aguarde horários nos bancos',
          color: '#0284c7'
        };
      } else {
        this.activeObjective = {
          type: 'HOME',
          id: 'PLAYER_HOME',
          pinned: false,
          x: g.playerHome.x,
          y: g.playerHome.y,
          title: '🏡 Voltar para Casa do ACS',
          sub: g.timeMinutes >= 17 * 60 ? 'Já pode dormir para iniciar o próximo dia!' : 'Descanse ou confira o Caderno Semanal',
          color: '#b45309'
        };
      }
      return this.activeObjective;
    }

    update(dt) {
      this._minimapTimer += dt;
      if (this._minimapTimer >= 0.12) {
        this._minimapTimer = 0;
        this.resolveObjective();
        this.updateTrackerUI();
        this.drawMinimap();
      }
    }

    updateTrackerUI() {
      const titleEl = document.getElementById('tracker-title');
      const subEl = document.getElementById('tracker-sub');
      const distEl = document.getElementById('tracker-dist');
      const clearBtn = document.getElementById('btn-clear-pin');
      if (!titleEl || !subEl || !distEl) return;

      const obj = this.activeObjective || this.resolveObjective();
      if (!obj) return;

      const g = this.game;
      const distMeters = Math.max(0, Math.round(Math.hypot(obj.x - g.player.x, obj.y - g.player.y) / 12));
      titleEl.textContent = obj.title;
      subEl.textContent = obj.sub;
      distEl.textContent = distMeters <= 5 ? 'Aqui!' : `${distMeters}m`;
      distEl.style.backgroundColor = obj.color;

      if (clearBtn) {
        clearBtn.classList.toggle('hidden', !obj.pinned && !obj.fromPlanner);
        clearBtn.title = obj.pinned ? 'Limpar marcador manual' : (obj.fromPlanner ? 'Pausar Rota do Dia' : '');
      }
    }

    // Draws subtle click-to-walk ground marker and in-world directional compass arrow
    drawWorldOverlay(ctx) {
      const g = this.game;

      // 1. Click-to-walk ground pulse ring
      if (this.walkTarget) {
        const pulse = 0.65 + 0.35 * Math.sin(g.elapsedTime * 8);
        const rx = Math.round(this.walkTarget.x);
        const ry = Math.round(this.walkTarget.y);
        ctx.save();
        ctx.strokeStyle = `rgba(254, 240, 138, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rx, ry, 8 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(rx - 2, ry - 2, 4, 4);
        ctx.restore();
      }

      // 2. Directional Compass Arrow orbiting player when objective is >140px away
      const obj = this.activeObjective;
      if (!obj || g.paused) return;

      const dx = obj.x - g.player.x;
      const dy = obj.y - g.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140) return;

      const angle = Math.atan2(dy, dx);
      const orbit = 42 + Math.sin(g.elapsedTime * 5) * 3;
      const ax = g.player.x + Math.cos(angle) * orbit;
      const ay = (g.player.y - 16) + Math.sin(angle) * orbit;

      ctx.save();
      ctx.translate(Math.round(ax), Math.round(ay));
      ctx.rotate(angle);

      // Dark wood outline triangle
      ctx.fillStyle = '#3b200f';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-6, -8);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      ctx.fill();

      // Bright golden/objective inner chevron
      ctx.fillStyle = obj.pinned ? '#facc15' : '#fef08a';
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(-4, -5);
      ctx.lineTo(-2, 0);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    drawMinimap() {
      const c = document.getElementById('minimap-canvas');
      if (!c) return;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const g = this.game;
      const W = c.width;
      const H = c.height;

      // Update minimap title dynamically based on current scene
      const headerEl = document.getElementById('minimap-title');
      if (headerEl) {
        headerEl.textContent = g.sceneManager
          ? g.sceneManager.getMinimapTitle()
          : '🗺️ Microárea 04';
      }

      // Render interior floorplan minimap when indoors
      if (g.currentLocation && g.currentLocation !== 'OVERWORLD' && g.sceneManager) {
        if (g.sceneManager.drawMinimap(ctx, W, H)) return;
      }

      const sx = W / g.worldWidth;
      const sy = H / g.worldHeight;

      // Miniature baked terrain
      ctx.drawImage(g.terrainCanvas, 0, 0, W, H);

      // UBS marker
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(Math.round(g.ubs.x * sx), Math.round(g.ubs.y * sy), Math.max(8, Math.round(g.ubs.w * sx)), Math.max(7, Math.round(g.ubs.h * sy)));
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(g.ubs.x * sx), Math.round(g.ubs.y * sy), Math.max(8, Math.round(g.ubs.w * sx)), Math.max(7, Math.round(g.ubs.h * sy)));

      // Protagonist Home marker (Casa do ACS)
      if (g.playerHome) {
        const hx = Math.round(g.playerHome.x * sx);
        const hy = Math.round((g.playerHome.y - 36) * sy);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(hx - 4, hy - 3, 9, 7);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(hx - 4, hy - 3, 9, 7);
      }

      // Vendinha, Pracinha, Associação & Horta markers on minimap
      if (g.vendinha) {
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(Math.round(g.vendinha.x * sx) - 4, Math.round((g.vendinha.y - 32) * sy) - 3, 8, 6);
      }
      if (g.pracinha) {
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(Math.round(g.pracinha.x * sx) - 5, Math.round(g.pracinha.y * sy) - 3, 10, 6);
      }
      if (g.associacao) {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(Math.round(g.associacao.x * sx) - 4, Math.round((g.associacao.y - 32) * sy) - 3, 8, 6);
      }
      if (g.horta) {
        ctx.fillStyle = '#84cc16';
        ctx.fillRect(Math.round(g.horta.x * sx) - 4, Math.round(g.horta.y * sy) - 3, 8, 6);
      }
      if (g.campinho) {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(Math.round(g.campinho.c1 * 32 * sx), Math.round(g.campinho.r1 * 32 * sy), Math.max(8, Math.round((g.campinho.c2 - g.campinho.c1) * 32 * sx)), Math.max(6, Math.round((g.campinho.r2 - g.campinho.r1) * 32 * sy)));
      }
      if (g.mysteryHouse) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(Math.round(g.mysteryHouse.x * sx) - 4, Math.round((g.mysteryHouse.y - 32) * sy) - 3, 8, 6);
      }

      // Active Dengue spots
      g.dengueSpots.forEach(s => {
        if (!s.cleared) {
          ctx.fillStyle = '#facc15';
          ctx.fillRect(Math.round(s.x * sx) - 2, Math.round(s.y * sy) - 2, 4, 4);
        }
      });

      // Dogs
      g.dogs.forEach(d => {
        const calmed = d.calmedUntil > g.timeMinutes;
        ctx.fillStyle = calmed ? '#4ade80' : '#ef4444';
        ctx.fillRect(Math.round(d.x * sx) - 2, Math.round(d.y * sy) - 2, 4, 4);
      });

      // Cats
      if (g.cats) {
        g.cats.forEach(c => {
          ctx.fillStyle = c.personality === 'fofinho' ? '#f472b6' : '#c084fc';
          ctx.fillRect(Math.round(c.x * sx) - 2, Math.round(c.y * sy) - 2, 3, 3);
        });
      }

      // Houses
      const obj = this.activeObjective;
      const prioritySet = new Set(g.weeklyPriorities || []);
      g.families.forEach(f => {
        const visited = g.visitedToday.has(f.id);
        const isPriority = prioritySet.has(f.id) && !g.visitedThisWeek.has(f.id);
        const atHome = g.isFamilyAtHome(f);
        const mx = Math.round(f.x * sx);
        const my = Math.round((f.y - 36) * sy);

        ctx.fillStyle = visited ? '#38bdf8' : (!f.knownSchedule ? '#eab308' : (atHome ? '#22c55e' : '#64748b'));
        ctx.fillRect(mx - 4, my - 3, 8, 6);
        ctx.strokeStyle = isPriority ? '#facc15' : '#3b200f';
        ctx.lineWidth = isPriority ? 1.5 : 1;
        ctx.strokeRect(mx - 4, my - 3, 8, 6);

        // Pulsing ring on tracked objective house
        if (obj && obj.type === 'HOUSE' && obj.id === f.id) {
          const pulse = 5 + Math.sin(g.elapsedTime * 7) * 2;
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(mx, my, pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Pulsing ring if objective is UBS
      if (obj && obj.type === 'UBS') {
        const pulse = 7 + Math.sin(g.elapsedTime * 7) * 2;
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(Math.round(g.ubs.doorX * sx), Math.round((g.ubs.y + g.ubs.h / 2) * sy), pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Camera viewport rectangle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        Math.round(g.camera.x * sx),
        Math.round(g.camera.y * sy),
        Math.round(g.canvas.width * sx),
        Math.round(g.canvas.height * sy)
      );

      // Player bright dot
      const px = Math.round(g.player.x * sx);
      const py = Math.round(g.player.y * sy);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b200f';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  global.NavigationSystem = NavigationSystem;
})(window);

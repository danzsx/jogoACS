// ============================================================================
// TERRITÓRIO VIVO — COMMUNITY SPACES & NEW KEY NPCs (Phase 2)
// ============================================================================
// Implements:
//   - Vendinha & Padaria do Zé (VENDINHA interior + Seu Zé)
//   - Associação de Moradores (ASSOCIACAO interior + Tia Bete + Projects Board)
//   - Dona Carla (Weekly District Coordinator inside UBS_INTERIOR on Mon/Fri)
//   - Dynamic rendering/interaction for scheduled residents inside interiors

(function (global) {
  'use strict';

  const T = 32;

  class CommunitySpacesSystem {
    constructor(game) {
      this.game = game;
      this.vendinhaCoffeeUsedToday = false;

      this.rooms = {
        VENDINHA: {
          id: 'VENDINHA',
          title: '🏪 Vendinha & Padaria do Zé',
          cols: 18,
          rows: 13,
          width: 18 * T,
          height: 13 * T,
          spawn: { x: 9.0 * T, y: 10.6 * T, dir: 'up' }
        },
        ASSOCIACAO: {
          id: 'ASSOCIACAO',
          title: '🏛️ Associação de Moradores',
          cols: 18,
          rows: 13,
          width: 18 * T,
          height: 13 * T,
          spawn: { x: 9.0 * T, y: 10.6 * T, dir: 'up' }
        }
      };

      this.npcs = {
        npc_seu_ze: {
          id: 'npc_seu_ze',
          name: 'Seu Zé',
          role: 'Comerciante (Vendinha)',
          roleKey: 'comerciante',
          sector: 'Vendinha & Padaria do Zé • Esquina da Av. da Saúde',
          badgeClass: 'amigo',
          portraitBg: '#fde68a',
          x: 6.0 * T,
          y: 4.5 * T,
          interactX: 6.0 * T,
          interactY: 6.4 * T,
          interactRadius: 86,
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#b97e56',
            hair: '#d1d5db',
            hairStyle: 'short',
            shirt: '#d97706',
            apron: '#fef3c7',
            mustache: true,
            badge: true,
            gender: 'm'
          }
        },
        npc_tia_bete: {
          id: 'npc_tia_bete',
          name: 'Tia Bete',
          role: 'Liderança Comunitária',
          roleKey: 'lideranca',
          sector: 'Associação de Moradores • Conselho Local',
          badgeClass: 'prioritario',
          portraitBg: '#dcfce7',
          x: 9.0 * T,
          y: 5.4 * T,
          interactX: 9.0 * T,
          interactY: 5.4 * T,
          interactRadius: 72,
          // On Saturday morning (09:00..12:30) Tia Bete is outside by the Horta!
          hortaX: 66.5 * T,
          hortaY: 48.0 * T,
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#7a4f34',
            hair: '#e5e7eb',
            hairStyle: 'bun',
            shirt: '#15803d',
            glasses: true,
            gender: 'f'
          }
        },
        npc_dona_carla: {
          id: 'npc_dona_carla',
          name: 'Dona Carla',
          role: 'Coordenadora Distrital',
          roleKey: 'gestao',
          sector: 'Coordenação Distrital de Saúde • Visita Semanal na UBS',
          badgeClass: 'trabalhador',
          portraitBg: '#e2e8f0',
          x: 21.5 * T,
          y: 16.5 * T,
          interactX: 21.5 * T,
          interactY: 16.5 * T,
          interactRadius: 72,
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#e8b896',
            hair: '#3b2416',
            hairStyle: 'bun',
            shirt: '#334155',
            glasses: true,
            badge: true,
            uniformPants: true,
            gender: 'f'
          }
        }
      };

      this.furniture = {
        VENDINHA: [
          { sprite: 'vendinhaCounter', x: 6.0 * T, y: 5.5 * T },
          { sprite: 'groceryShelf', x: 12.2 * T, y: 4.3 * T },
          { sprite: 'drinkFridge', x: 15.5 * T, y: 4.5 * T },
          { sprite: 'pottedPlant', x: 2.2 * T, y: 10.8 * T },
          { sprite: 'pottedPlant', x: 15.8 * T, y: 10.8 * T }
        ],
        ASSOCIACAO: [
          { sprite: 'meetingTable', x: 9.0 * T, y: 7.6 * T },
          { sprite: 'pottedPlant', x: 2.2 * T, y: 10.8 * T },
          { sprite: 'pottedPlant', x: 15.8 * T, y: 10.8 * T }
        ]
      };

      this.colliders = {
        VENDINHA: [
          [3.3 * T, 4.3 * T, 8.7 * T, 5.8 * T],   // Vendinha counter
          [10.8 * T, 3.3 * T, 13.6 * T, 4.6 * T], // Grocery shelf
          [14.7 * T, 3.4 * T, 16.3 * T, 4.8 * T], // Drink fridge
          [1.7 * T, 10.1 * T, 2.7 * T, 11.0 * T],
          [15.3 * T, 10.1 * T, 16.3 * T, 11.0 * T]
        ],
        ASSOCIACAO: [
          [7.1 * T, 6.6 * T, 10.9 * T, 8.0 * T],  // Meeting table
          [1.7 * T, 10.1 * T, 2.7 * T, 11.0 * T],
          [15.3 * T, 10.1 * T, 16.3 * T, 11.0 * T]
        ]
      };

      this.roomCanvases = {
        VENDINHA: this.bakeVendinhaRoom(),
        ASSOCIACAO: this.bakeAssociacaoRoom()
      };
    }

    bakeVendinhaRoom() {
      const room = this.rooms.VENDINHA;
      const c = document.createElement('canvas');
      c.width = room.width;
      c.height = room.height;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const pa = global.pixelArt;

      for (let r = 3; r < room.rows - 1; r++) {
        for (let col = 1; col < room.cols - 1; col++) {
          ctx.drawImage(pa.interior.esfFloor[(r + col) % 2], col * T, r * T);
        }
      }

      // Warm textured bakery walls
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(0, 0, room.width, 14);
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(0, 14, room.width, 10);
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(0, 14, room.width, 2);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(T, 24, room.width - 2 * T, 58);
      for (let py = 28; py < 78; py += 6) {
        for (let px0 = T + 8; px0 < room.width - T - 8; px0 += 14) {
          if (pa.rand(px0 * 13 + py * 29) > 0.58) {
            ctx.fillStyle = '#f5e4b8';
            ctx.fillRect(px0, py, 4, 2);
          }
        }
      }
      ctx.fillStyle = '#b45309';
      ctx.fillRect(T, 82, room.width - 2 * T, 14);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(T, 82, room.width - 2 * T, 2);

      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(0, 0, T, room.height);
      ctx.fillRect(room.width - T, 0, T, room.height);
      ctx.fillRect(0, room.height - T, room.width, T);
      ctx.fillStyle = '#8c5a32';
      ctx.fillRect(6, 14, T - 12, room.height - 20);
      ctx.fillRect(room.width - T + 6, 14, T - 12, room.height - 20);
      ctx.fillRect(6, room.height - T + 6, room.width - 12, T - 12);
      ctx.fillStyle = '#b57b4a';
      ctx.fillRect(6, 14, 2, room.height - 20);
      ctx.fillRect(room.width - T + 6, 14, 2, room.height - 20);
      ctx.fillRect(6, room.height - T + 6, room.width - 12, 2);

      // Wall-to-floor ambient occlusion
      const vAo = ctx.createLinearGradient(0, 3 * T, 0, 3 * T + 12);
      vAo.addColorStop(0, 'rgba(32, 18, 10, 0.34)');
      vAo.addColorStop(1, 'rgba(32, 18, 10, 0)');
      ctx.fillStyle = vAo;
      ctx.fillRect(T, 3 * T, room.width - 2 * T, 12);
      ctx.fillStyle = 'rgba(32, 18, 10, 0.16)';
      ctx.fillRect(T, 3 * T, 6, room.height - 4 * T);
      ctx.fillRect(room.width - T - 6, 3 * T, 6, room.height - 4 * T);
      ctx.fillRect(T, room.height - T - 6, room.width - 2 * T, 6);

      // Wall notice board on left-back wall
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(2.2 * T, 1.1 * T, 48, 36);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(2.2 * T + 3, 1.1 * T + 3, 42, 30);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(2.2 * T + 5, 1.1 * T + 5, 38, 26);
      ctx.fillStyle = '#fef9c3';
      ctx.fillRect(2.2 * T + 7, 1.1 * T + 7, 14, 12);
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(2.2 * T + 24, 1.1 * T + 9, 15, 14);

      // Title banner
      ctx.font = 'bold 11px Trebuchet MS';
      const label = '🏪 VENDINHA & PADARIA DO SEU ZÉ';
      const pw = ctx.measureText(label).width + 18;
      const bx = Math.round(room.width / 2 - pw / 2);
      ctx.fillStyle = '#291d14';
      ctx.fillRect(bx - 2, 2, pw + 4, 20);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(bx, 4, pw, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, bx + 9, 16);

      // Exit door
      ctx.fillStyle = '#6b3e1f';
      ctx.fillRect(8 * T - 2, room.height - T, 2 * T + 4, T);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(8 * T + 2, room.height - T + 4, 2 * T - 4, T - 8);
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(8 * T - 2, 11 * T + 4, 2 * T + 4, 24);
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 10px Trebuchet MS';
      ctx.fillText('SAIR', 8 * T + 18, 11 * T + 20);

      return c;
    }

    bakeAssociacaoRoom() {
      const room = this.rooms.ASSOCIACAO;
      const c = document.createElement('canvas');
      c.width = room.width;
      c.height = room.height;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const pa = global.pixelArt;

      for (let r = 3; r < room.rows - 1; r++) {
        for (let col = 1; col < room.cols - 1; col++) {
          ctx.drawImage(pa.interior.clinicFloor[(r + col) % 2], col * T, r * T);
        }
      }

      // Textured sage green & wood community hall walls
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(0, 0, room.width, 14);
      ctx.fillStyle = '#166534';
      ctx.fillRect(0, 14, room.width, 10);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, 14, room.width, 1);
      ctx.fillStyle = '#edf7ee';
      ctx.fillRect(T, 24, room.width - 2 * T, 58);
      for (let py = 28; py < 78; py += 6) {
        for (let px0 = T + 8; px0 < room.width - T - 8; px0 += 14) {
          if (pa.rand(px0 * 17 + py * 31) > 0.58) {
            ctx.fillStyle = '#dcebdd';
            ctx.fillRect(px0, py, 4, 2);
          }
        }
      }
      ctx.fillStyle = '#15803d';
      ctx.fillRect(T, 82, room.width - 2 * T, 14);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(T, 82, room.width - 2 * T, 2);

      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(0, 0, T, room.height);
      ctx.fillRect(room.width - T, 0, T, room.height);
      ctx.fillRect(0, room.height - T, room.width, T);
      ctx.fillStyle = '#7a5238';
      ctx.fillRect(6, 14, T - 12, room.height - 20);
      ctx.fillRect(room.width - T + 6, 14, T - 12, room.height - 20);
      ctx.fillRect(6, room.height - T + 6, room.width - 12, T - 12);
      ctx.fillStyle = '#a6713f';
      ctx.fillRect(6, 14, 2, room.height - 20);
      ctx.fillRect(room.width - T + 6, 14, 2, room.height - 20);
      ctx.fillRect(6, room.height - T + 6, room.width - 12, 2);

      // Wall-to-floor ambient occlusion
      const aAo = ctx.createLinearGradient(0, 3 * T, 0, 3 * T + 12);
      aAo.addColorStop(0, 'rgba(32, 18, 10, 0.30)');
      aAo.addColorStop(1, 'rgba(32, 18, 10, 0)');
      ctx.fillStyle = aAo;
      ctx.fillRect(T, 3 * T, room.width - 2 * T, 12);
      ctx.fillStyle = 'rgba(32, 18, 10, 0.14)';
      ctx.fillRect(T, 3 * T, 6, room.height - 4 * T);
      ctx.fillRect(room.width - T - 6, 3 * T, 6, room.height - 4 * T);
      ctx.fillRect(T, room.height - T - 6, room.width - 2 * T, 6);

      // Projects Board on back wall (center-right)
      ctx.drawImage(pa.interior.projectsBoard, Math.round(13.5 * T - 48), 22);
      ctx.drawImage(pa.interior.wallPosterSUS, Math.round(3.5 * T - 28), 26);

      ctx.font = 'bold 11px Trebuchet MS';
      const label = '🏛️ ASSOCIAÇÃO DE MORADORES • VILA ESPERANÇA';
      const pw = ctx.measureText(label).width + 18;
      const bx = Math.round(room.width / 2 - pw / 2);
      ctx.fillStyle = '#291d14';
      ctx.fillRect(bx - 2, 2, pw + 4, 20);
      ctx.fillStyle = '#166534';
      ctx.fillRect(bx, 4, pw, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, bx + 9, 16);

      // Exit door
      ctx.fillStyle = '#6b3e1f';
      ctx.fillRect(8 * T - 2, room.height - T, 2 * T + 4, T);
      ctx.fillStyle = '#166534';
      ctx.fillRect(8 * T + 2, room.height - T + 4, 2 * T - 4, T - 8);
      ctx.fillStyle = '#14532d';
      ctx.fillRect(8 * T - 2, 11 * T + 4, 2 * T + 4, 24);
      ctx.fillStyle = '#dcfce7';
      ctx.font = 'bold 10px Trebuchet MS';
      ctx.fillText('SAIR', 8 * T + 18, 11 * T + 20);

      return c;
    }

    isVendinhaOpen() {
      const g = this.game;
      return g.dayOfWeek < 6 && g.timeMinutes >= 7 * 60 && g.timeMinutes < 21.5 * 60;
    }

    isAssociacaoOpen() {
      const g = this.game;
      return g.dayOfWeek < 6 && g.timeMinutes >= 9 * 60 && g.timeMinutes < 19 * 60;
    }

    isDonaCarlaAtUBS() {
      const g = this.game;
      const hr = g.timeMinutes / 60;
      return (g.dayOfWeek === 0 && hr >= 8.5 && hr <= 12.0) ||
             (g.dayOfWeek === 4 && hr >= 14.0 && hr <= 17.5);
    }

    isTiaBeteAtHorta() {
      const g = this.game;
      const hr = g.timeMinutes / 60;
      return g.dayOfWeek === 5 && hr >= 9.0 && hr <= 12.5;
    }

    getBounds(sceneId) {
      const room = this.rooms[sceneId];
      if (!room) return null;
      return {
        width: room.width,
        height: room.height,
        minX: T + 12,
        maxX: room.width - T - 12,
        minY: 3 * T + 12,
        maxY: room.height - T - 4
      };
    }

    getMinimapTitle(sceneId) {
      return sceneId === 'VENDINHA' ? '🏪 Vendinha do Zé' : '🏛️ Associação';
    }

    getFootstepTile() {
      return 'I';
    }

    enterVendinha() {
      if (!this.isVendinhaOpen()) {
        global.sfx.warn();
        this.game.toast('🏪 A Vendinha do Seu Zé funciona de Seg a Sáb, das 07:00 às 21:30.', 'info');
        return;
      }
      const sp = this.rooms.VENDINHA.spawn;
      this.game.sceneManager.enter('VENDINHA', {
        x: sp.x,
        y: sp.y,
        dir: sp.dir,
        toast: '🏪 Você entrou na Vendinha & Padaria do Seu Zé!'
      });
    }

    exitVendinha() {
      const v = window.ACS_DATA.vendinha;
      this.game.sceneManager.enter('OVERWORLD', {
        x: v.x,
        y: v.y + 22,
        dir: 'down',
        toast: '🌤️ Você saiu da Vendinha do Zé.'
      });
    }

    enterAssociacao() {
      if (!this.isAssociacaoOpen()) {
        global.sfx.warn();
        this.game.toast('🏛️ A Associação de Moradores funciona de Seg a Sáb, das 09:00 às 19:00.', 'info');
        return;
      }
      const sp = this.rooms.ASSOCIACAO.spawn;
      this.game.sceneManager.enter('ASSOCIACAO', {
        x: sp.x,
        y: sp.y,
        dir: sp.dir,
        toast: '🏛️ Você entrou na Associação de Moradores da Vila Esperança!'
      });
    }

    exitAssociacao() {
      const a = window.ACS_DATA.associacao;
      this.game.sceneManager.enter('OVERWORLD', {
        x: a.x,
        y: a.y + 22,
        dir: 'down',
        toast: '🌤️ Você saiu da Associação de Moradores.'
      });
    }

    resetDaily() {
      this.vendinhaCoffeeUsedToday = false;
    }

    update(dt) {
      Object.values(this.npcs).forEach(n => {
        if (n.emoteTimer > 0) n.emoteTimer -= dt;
      });
    }

    collides(sceneId, px, py) {
      const b = this.getBounds(sceneId);
      if (!b) return false;
      if (px < b.minX || px > b.maxX || py < b.minY || py > b.maxY) return true;

      for (const [x1, y1, x2, y2] of (this.colliders[sceneId] || [])) {
        if (px > x1 - 8 && px < x2 + 8 && py > y1 - 4 && py < y2 + 6) return true;
      }

      if (sceneId === 'ASSOCIACAO' && !this.isTiaBeteAtHorta()) {
        const tb = this.npcs.npc_tia_bete;
        if (Math.hypot(px - tb.x, py - tb.y) < 18) return true;
      }

      if (this.game.schedule) {
        for (const { loc } of this.game.schedule.getFamiliesInScene(sceneId)) {
          if (Math.hypot(px - loc.x, py - loc.y) < 18) return true;
        }
      }
      return false;
    }

    checkNearbyInteractions() {
      const g = this.game;
      const locId = g.currentLocation;
      g.nearTarget = null;

      // Exit door
      if (Math.hypot(g.player.x - 9.0 * T, g.player.y - 11.4 * T) < 56) {
        g.nearTarget = {
          type: 'COMMUNITY_ACTION',
          x: 9.0 * T,
          y: 10.5 * T,
          label: '[E] Sair para a Vila Esperança',
          action: () => (locId === 'VENDINHA' ? this.exitVendinha() : this.exitAssociacao())
        };
        return;
      }

      // Scheduled residents inside Vendinha / Associacao
      if (g.schedule) {
        for (const { fam, loc } of g.schedule.getFamiliesInScene(locId)) {
          if (Math.hypot(g.player.x - loc.x, g.player.y - loc.y) < 58) {
            g.nearTarget = {
              type: 'COMMUNITY_ACTION',
              x: loc.x,
              y: loc.y - 48,
              label: `[E] Conversar com ${fam.name.split(' ')[0]}`,
              action: () => g.schedule.openInformalEncounter(fam, loc)
            };
            return;
          }
        }
      }

      if (locId === 'VENDINHA') {
        const ze = this.npcs.npc_seu_ze;
        if (Math.hypot(g.player.x - ze.interactX, g.player.y - ze.interactY) < ze.interactRadius) {
          g.nearTarget = {
            type: 'COMMUNITY_ACTION',
            x: ze.x,
            y: ze.y - 44,
            label: '[E] Conversar com Seu Zé (Vendinha)',
            action: () => this.openSeuZeDialogue()
          };
          return;
        }
        if (Math.hypot(g.player.x - 2.9 * T, g.player.y - 3.6 * T) < 52) {
          g.nearTarget = {
            type: 'COMMUNITY_ACTION',
            x: 2.9 * T,
            y: 3.1 * T,
            label: '[E] Mural de Recados da Vendinha',
            action: () => this.openVendinhaBoard()
          };
          return;
        }
      }

      if (locId === 'ASSOCIACAO') {
        const tb = this.npcs.npc_tia_bete;
        if (!this.isTiaBeteAtHorta() && Math.hypot(g.player.x - tb.interactX, g.player.y - tb.interactY) < tb.interactRadius) {
          g.nearTarget = {
            type: 'COMMUNITY_ACTION',
            x: tb.x,
            y: tb.y - 50,
            label: '[E] Conversar com Tia Bete (Associação)',
            action: () => this.openTiaBeteDialogue()
          };
          return;
        }
        if (Math.hypot(g.player.x - 13.5 * T, g.player.y - 3.6 * T) < 58) {
          g.nearTarget = {
            type: 'COMMUNITY_ACTION',
            x: 13.5 * T,
            y: 3.1 * T,
            label: '[E] Quadro de Projetos do Bairro',
            action: () => this.openProjectsBoard()
          };
          return;
        }
      }

      // WorldState environmental clues inside Vendinha / Associação (Etapa H3)
      if (g.worldState) {
        const clue = g.worldState.getNearbyClue(locId);
        if (clue) {
          g.nearTarget = {
            type: 'COMMUNITY_ACTION',
            x: clue.x,
            y: clue.y - 32,
            label: clue.prompt,
            action: () => g.worldState.inspectClue(clue)
          };
          return;
        }
      }
    }

    triggerInteraction() {
      const t = this.game.nearTarget;
      if (!t || t.type !== 'COMMUNITY_ACTION') return false;
      t.action();
      return true;
    }

    openSeuZeDialogue() {
      const g = this.game;
      const ze = this.npcs.npc_seu_ze;
      if (g.events) g.events.emit('npc:talked', { npcId: ze.id, roleKey: ze.roleKey, scene: 'VENDINHA' });

      const fallbackFn = () => ({
        greeting: '“Entra, agente! Pão quente e café passado na hora!”',
        note: 'Vendinha do Zé',
        choices: [{ text: 'Dar bom dia e seguir rota.', intent: '💬 Cumprimentar', reply: '“Bom trabalho na microárea!”' }]
      });
      const graph = g.dialogueResolver
        ? g.dialogueResolver.resolveCommunityNpcGraph(ze, fallbackFn)
        : (g.dialogue.getPilotGraph(ze.id) || g.dialogue.adaptLegacyDialogue(fallbackFn()));

      const bondPct = g.storyState ? g.storyState.getNpcBond(ze.id) : 85;
      const bondText = g.storyState ? `${bondPct}% (${g.storyState.getBondLabel(bondPct)})` : 'Parceiro do Bairro';

      g.dialogue.startGraph({
        entityType: 'STAFF',
        entityData: ze,
        entityId: ze.id,
        tag: ze.sector,
        name: `${ze.name} • ${ze.role}`,
        badgesHtml: `<span class="badge amigo">☕ Vendinha</span><span class="badge">🏪 Vila Esperança</span>`,
        bondPct,
        bondText,
        graph,
        onFinish: (choice) => {
          let reply = choice.reply;
          if (choice.flag && g.storyState) g.storyState.setFlag(choice.flag, true);
          if (choice.flag === 'vendinha_coffee' && !this.vendinhaCoffeeUsedToday) {
            this.vendinhaCoffeeUsedToday = true;
            g.player.stamina = Math.min(100, g.player.stamina + 15);
            global.sfx.success();
            g.toast('☕ Cafezinho do Seu Zé! (+15 Energia)', 'success');
          } else if (choice.flag === 'vendinha_coffee' && this.vendinhaCoffeeUsedToday) {
            reply = '“Hoje você já tomou seu cafezinho de cortesia, mas fica à vontade pra prosear! Logo mais teremos mercearia completa aqui no balcão.”';
          }
          if (choice.revealOneUnknown) {
            const unk = g.families.filter(f => !f.knownSchedule);
            if (unk.length > 0) {
              const target = unk[0];
              target.knownSchedule = true;
              g.schedulesDiscoveredCount++;
              g.unreadNotifs++;
              global.sfx.bondUp();
              g.toast(`☕ Seu Zé contou o horário da ${target.code} (${target.name})!`, 'success');
              reply = `“O pessoal da ${target.code} (${target.name}) passa sempre aqui antes de ir pra casa: eles ficam lá ${target.scheduleText}. Já anota no seu Tablet!”`;
            }
          }
          ze.emote = 'heart';
          ze.emoteTimer = 2.6;
          g.setDialogueText(reply);
          g.updateHUD();
          g.saveProgress();

          const choicesEl = document.getElementById('dlg-choices');
          choicesEl.innerHTML = '';
          const btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.innerHTML = '<span>Agradecer ao Seu Zé.</span><span class="choice-tag">Prosseguir</span>';
          btn.addEventListener('click', () => g.closeOverlays());
          choicesEl.appendChild(btn);
        }
      });
    }

    openTiaBeteDialogue() {
      const g = this.game;
      const tb = this.npcs.npc_tia_bete;
      if (g.events) g.events.emit('npc:talked', { npcId: tb.id, roleKey: tb.roleKey, scene: g.currentLocation });

      const fallbackFn = () => ({
        greeting: '“Fala, agente! A Vila Esperança precisa de quem ouve e age junto com a gente.”',
        note: 'Associação de Moradores',
        choices: [{ text: 'Conversar sobre os projetos do bairro.', intent: '🤝 Alinhar ideias', reply: '“Vamos tirar a Ponte, a Pracinha e a Horta do papel!”' }]
      });
      const graph = g.dialogueResolver
        ? g.dialogueResolver.resolveCommunityNpcGraph(tb, fallbackFn)
        : (g.dialogue.getPilotGraph(tb.id) || g.dialogue.adaptLegacyDialogue(fallbackFn()));

      const bondPct = g.storyState ? g.storyState.getNpcBond(tb.id) : 80;
      const bondText = g.storyState ? `${bondPct}% (${g.storyState.getBondLabel(bondPct)})` : 'Liderança Comunitária';

      g.dialogue.startGraph({
        entityType: 'STAFF',
        entityData: tb,
        entityId: tb.id,
        tag: tb.sector,
        name: `${tb.name} • ${tb.role}`,
        badgesHtml: `<span class="badge prioritario">🏛️ Associação</span><span class="badge amigo">🤝 Conselho Local</span>`,
        bondPct,
        bondText,
        graph,
        onFinish: (choice) => {
          tb.emote = 'heart';
          tb.emoteTimer = 2.6;
          if (choice.flag) {
            if (g.narrative) g.narrative.flags[choice.flag] = true;
            if (g.storyState) g.storyState.setFlag(choice.flag, true);
          }
          g.setDialogueText(choice.reply);
          g.saveProgress();

          const choicesEl = document.getElementById('dlg-choices');
          choicesEl.innerHTML = '';
          const btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.innerHTML = '<span>Encerrar conversa com Tia Bete.</span><span class="choice-tag">Prosseguir</span>';
          btn.addEventListener('click', () => g.closeOverlays());
          choicesEl.appendChild(btn);
        }
      });
    }

    openDonaCarlaDialogue() {
      const g = this.game;
      const dc = this.npcs.npc_dona_carla;
      if (g.events) g.events.emit('npc:talked', { npcId: dc.id, roleKey: dc.roleKey, scene: 'UBS_INTERIOR' });

      const knownCount = g.families.filter(f => f.knownSchedule).length;
      const prioDone = g.getWeeklyPrioritiesCompletedCount();
      const goodNumbers = g.weeklyVisits >= 8 || prioDone >= 2;

      const buildDynamicLegacy = () => ({
        greeting: goodNumbers
          ? `“Bom dia, agente. Olhei a planilha da Microárea 04 agora: ${g.weeklyVisits}/${g.weeklyGoal} visitas na semana e ${knownCount}/15 cadastros com horário mapeado. É um avanço depois de quatro meses sem agente.”`
          : `“Bom dia, agente. Precisamos conversar com objetividade: a Microárea 04 ficou meses descoberta e na secretaria ainda consta apenas ${g.weeklyVisits}/${g.weeklyGoal} visitas e ${prioDone}/${g.weeklyPriorities.length} prioridades atendidas esta semana.”`,
        note: 'Coordenação Distrital (Segundas manhã e Sextas tarde na UBS) — avalia indicadores reais.',
        choices: [
          {
            text: 'Mostrar o trabalho de campo e explicar que os moradores trabalham o dia todo.',
            intent: '📊 Defender o território',
            hintTag: '💬 Argumento técnico',
            type: 'EMPATHY',
            flag: 'dona_carla_met',
            reply: '“Entendo a realidade da rua, mas em gestão pública o que não está registrado no e-SUS não existe no papel. Mantenha os cadastros em dia e mostre mobilização concreta na comunidade.”'
          },
          {
            text: 'Perguntar o que a secretaria exige para manter a equipe completa na UBS Vila Esperança.',
            intent: '🩺 Pedir clareza sobre metas',
            hintTag: '🔍 Prepara Ato I',
            type: 'EDUCATE',
            flag: 'dona_carla_pressure',
            reply: '“A cobertura cadastral, a busca ativa das prioridades e a frequência de acesso pela ponte do córrego vão pesar bastante nas próximas avaliações. Faça sua parte no território.”'
          }
        ]
      });

      const graph = g.dialogueResolver
        ? g.dialogueResolver.resolveCommunityNpcGraph(dc, buildDynamicLegacy)
        : g.dialogue.adaptLegacyDialogue(buildDynamicLegacy());

      const bondPct = g.storyState ? g.storyState.getNpcBond(dc.id) : (goodNumbers ? 65 : 40);
      const bondText = g.storyState ? `${bondPct}% (${g.storyState.getBondLabel(bondPct)})` : 'Avaliação Institucional';

      g.dialogue.startGraph({
        entityType: 'STAFF',
        entityData: dc,
        entityId: dc.id,
        tag: dc.sector,
        name: `${dc.name} • ${dc.role}`,
        badgesHtml: `<span class="badge trabalhador">📋 Coordenação</span><span class="badge">🏥 Seg/Sex</span>`,
        bondPct,
        bondText,
        graph,
        onFinish: (choice) => {
          if (choice.flag) {
            if (g.narrative) g.narrative.flags[choice.flag] = true;
            if (g.storyState) g.storyState.setFlag(choice.flag, true);
          }
          g.setDialogueText(choice.reply);
          g.saveProgress();
          const choicesEl = document.getElementById('dlg-choices');
          choicesEl.innerHTML = '';
          const btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.innerHTML = '<span>Registrar orientações e continuar na UBS.</span><span class="choice-tag">Prosseguir</span>';
          btn.addEventListener('click', () => g.closeOverlays());
          choicesEl.appendChild(btn);
        }
      });
    }

    openVendinhaBoard() {
      const g = this.game;
      g.openDialogueShell(
        'STAFF',
        this.npcs.npc_seu_ze,
        'Mural da Vendinha • Vila Esperança',
        'Recados do Bairro',
        `<span class="badge amigo">📌 Avisos</span>`,
        85,
        'Comunidade'
      );
      g.setDialogueText(
        'Mural da Vendinha do Zé:\n• Terças (07h30–14h): Feira Livre na Pracinha dos Ipês!\n• Quintas (15h–21h) e Sábados (14h–20h): Roda de Dominó na Pracinha!\n• Quartas (14h–19h): Reunião na Associação de Moradores.'
      );
      document.getElementById('dlg-clinical-note').classList.add('hidden');
      const choicesEl = document.getElementById('dlg-choices');
      choicesEl.innerHTML = '';
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = '<span>Fechar mural</span><span class="choice-tag">Voltar</span>';
      btn.addEventListener('click', () => g.closeOverlays());
      choicesEl.appendChild(btn);
    }

    openProjectsBoard() {
      const g = this.game;
      g.openDialogueShell(
        'STAFF',
        this.npcs.npc_tia_bete,
        'Associação de Moradores • Planejamento Coletivo',
        'Quadro de Projetos do Bairro',
        `<span class="badge prioritario">🛠️ Mutirões Futuros</span>`,
        80,
        'Horizonte Comunitário'
      );
      g.setDialogueText(
        'Projetos em pauta pela Associação (em articulação para as próximas semanas):\n1. Reforma da Ponte do Córrego (acesso seguro e sem lama).\n2. Revitalização da Pracinha dos Ipês (sombras, bancos e convivência).\n3. Horta Comunitária Ativa (ao lado da Associação).\n4. Sala de Grupos na UBS Vila Esperança.'
      );
      const noteEl = document.getElementById('dlg-clinical-note');
      noteEl.classList.remove('hidden');
      noteEl.textContent = 'Na Fase 3 e Fase 5 estes projetos ganharão missões e execução cooperativa em mutirões de sábado!';
      const choicesEl = document.getElementById('dlg-choices');
      choicesEl.innerHTML = '';
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = '<span>Voltar para a Associação</span><span class="choice-tag">Prosseguir</span>';
      btn.addEventListener('click', () => g.closeOverlays());
      choicesEl.appendChild(btn);
    }

    draw(ctx, sceneId) {
      const g = this.game;
      const room = this.rooms[sceneId];
      const roomCanvas = this.roomCanvases[sceneId];
      if (!room || !roomCanvas) return;

      ctx.fillStyle = '#1f1610';
      ctx.fillRect(0, 0, g.canvas.width, g.canvas.height);

      const camX = Math.round(g.camera.x);
      const camY = Math.round(g.camera.y);
      const pa = global.pixelArt;

      ctx.save();
      ctx.translate(-camX, -camY);

      ctx.drawImage(roomCanvas, 0, 0);

      const renderList = [];
      for (const f of (this.furniture[sceneId] || [])) {
        const spr = pa.interior[f.sprite];
        if (!spr) continue;
        renderList.push({
          sortY: f.y,
          draw: () => ctx.drawImage(spr, Math.round(f.x - spr.width / 2), Math.round(f.y - spr.height + 10))
        });
      }

      // Main NPC of the room
      if (sceneId === 'VENDINHA') {
        const ze = this.npcs.npc_seu_ze;
        this._pushNpcDraw(renderList, ze, pa.getStaffSprite(ze.id, ze.appearance));
      } else if (sceneId === 'ASSOCIACAO' && !this.isTiaBeteAtHorta()) {
        const tb = this.npcs.npc_tia_bete;
        this._pushNpcDraw(renderList, tb, pa.getStaffSprite(tb.id, tb.appearance));
      }

      // Scheduled residents visiting this room right now
      if (g.schedule) {
        for (const { fam, loc } of g.schedule.getFamiliesInScene(sceneId)) {
          const frames = pa.npcSprites[fam.id];
          if (frames) {
            this._pushNpcDraw(renderList, {
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

      // Player
      renderList.push({
        sortY: g.player.y,
        draw: () => {
          const px = Math.round(g.player.x);
          const py = Math.round(g.player.y);
          const ringPulse = 0.55 + 0.25 * Math.sin(g.elapsedTime * 4.5);
          ctx.save();
          ctx.strokeStyle = `rgba(56, 189, 248, ${ringPulse})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(px, py + 1, 14, 6, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          const frames = pa.playerFrames[g.player.dir] || pa.playerFrames.down;
          const safeFrame = global.ACSEngine.safeMod(g.player.animFrame, frames.length);
          const idleBob = g.player.isMoving ? 0 : Math.round(Math.sin(g.elapsedTime * 3.2) * 0.6);
          ctx.drawImage(frames[safeFrame], px - 16, py - 42 + idleBob);
        }
      });

      renderList.sort((a, b) => a.sortY - b.sortY);
      for (const item of renderList) item.draw();

      if (g.worldState) {
        g.worldState.drawWorldClueMarkers(ctx, sceneId);
      }

      g.navigation.drawWorldOverlay(ctx);
      if (g.nearTarget && !g.paused) {
        g.drawWorldPrompt(ctx, g.nearTarget.x, g.nearTarget.y, g.nearTarget.label);
      }

      ctx.restore();

      // Warm cozy interior atmospheric lighting + soft edge vignette
      const W = g.canvas.width;
      const H = g.canvas.height;
      const grad = ctx.createLinearGradient(0, 0, W, H);
      if (sceneId === 'VENDINHA') {
        grad.addColorStop(0, 'rgba(255, 214, 138, 0.10)');
        grad.addColorStop(1, 'rgba(46, 26, 14, 0.06)');
      } else {
        grad.addColorStop(0, 'rgba(255, 240, 200, 0.08)');
        grad.addColorStop(1, 'rgba(26, 38, 28, 0.06)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.34, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
      vig.addColorStop(0, 'rgba(24, 16, 10, 0)');
      vig.addColorStop(1, 'rgba(24, 16, 10, 0.16)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    }

    _pushNpcDraw(renderList, npc, frames) {
      const g = this.game;
      const ctx = g.ctx;
      const pa = global.pixelArt;
      renderList.push({
        sortY: npc.y,
        draw: () => {
          const waveFrame = (global.ACSEngine.safeMod(g.elapsedTime * 1.4 + npc.x, 5) === 0) ? 1 : 0;
          ctx.drawImage(frames[waveFrame], Math.round(npc.x - 16), Math.round(npc.y - 42));

          // Nameplate
          const label = `${npc.name} • ${npc.role.replace(/\s*\(.*?\)/g, '')}`;
          ctx.font = 'bold 10px Trebuchet MS';
          const w = ctx.measureText(label).width + 12;
          const bx = Math.round(npc.x - w / 2);
          const by = Math.round(npc.y + 5);
          ctx.fillStyle = 'rgba(41, 29, 20, 0.85)';
          ctx.fillRect(bx - 1, by - 1, w + 2, 16);
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(bx, by, w, 14);
          ctx.fillStyle = '#382213';
          ctx.fillText(label, bx + 6, by + 10);

          const emKey = (npc.emoteTimer > 0 && npc.emote) ? npc.emote : 'chat';
          if (pa.emotes[emKey]) {
            const floatY = Math.sin(g.elapsedTime * 3.5 + npc.x) * 2.5;
            ctx.drawImage(pa.emotes[emKey], Math.round(npc.x - 16), Math.round(npc.y - 78 + floatY));
          }
        }
      });
    }

    drawMinimap(ctx, W, H, sceneId) {
      const g = this.game;
      const room = this.rooms[sceneId];
      const roomCanvas = this.roomCanvases[sceneId];
      if (!room || !roomCanvas) return;

      ctx.fillStyle = '#1f1610';
      ctx.fillRect(0, 0, W, H);
      const scale = Math.min(W / room.width, H / room.height);
      const dw = Math.round(room.width * scale);
      const dh = Math.round(room.height * scale);
      const ox = Math.round((W - dw) / 2);
      const oy = Math.round((H - dh) / 2);
      ctx.drawImage(roomCanvas, ox, oy, dw, dh);

      const px = Math.round(ox + g.player.x * scale);
      const py = Math.round(oy + g.player.y * scale);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b200f';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    exportState() {
      return {
        vendinhaCoffeeUsedToday: this.vendinhaCoffeeUsedToday
      };
    }

    importState(data) {
      if (!data) return;
      this.vendinhaCoffeeUsedToday = !!data.vendinhaCoffeeUsedToday;
    }
  }

  global.CommunitySpacesSystem = CommunitySpacesSystem;
})(window);

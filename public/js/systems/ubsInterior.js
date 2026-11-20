// ============================================================================
// TERRITÓRIO VIVO — UBS VILA ESPERANÇA INTERIOR & SALA ESF (ACS) SYSTEM
// ============================================================================
// Provides two explorable, Y-sorted interior environments:
//   1. UBS_INTERIOR: Reception Hall, Waiting Area, Drinking Fountain,
//      Consultório Médico, Enfermagem & Vacina, Fisioterapia (eMulti),
//      Central Corridor (Limpeza), Portaria (Vigia) and Door to Sala ESF.
//   2. ESF_ROOM: Cozy Estratégia Saúde da Família team room where ACS
//      colleagues gather around the territorial map, coffee table,
//      e-SUS sync terminal, and ACS backpack supply locker.

(function (global) {
  'use strict';

  const T = 32;

  class UBSInteriorSystem {
    constructor(game) {
      this.game = game;
      this.talkedToday = new Set();
      this.stretchUsedToday = false;
      this.coffeeUsedToday = false;
      this.transitionAlpha = 0;

      // Room dimensions in tiles & world pixels
      this.rooms = {
        UBS_INTERIOR: {
          id: 'UBS_INTERIOR',
          title: '🏥 UBS Vila Esperança',
          cols: 36,
          rows: 22,
          width: 36 * T,
          height: 22 * T,
          spawn: { x: 17.5 * T, y: 19.3 * T, dir: 'up' },
          fromESFSpawn: { x: 32.5 * T, y: 11.4 * T, dir: 'down' }
        },
        ESF_ROOM: {
          id: 'ESF_ROOM',
          title: '👥 Sala ESF — Equipe ACS',
          cols: 22,
          rows: 15,
          width: 22 * T,
          height: 15 * T,
          spawn: { x: 11 * T, y: 12.2 * T, dir: 'up' }
        }
      };

      this.staff = this.buildStaffRoster();
      this.furniture = this.buildFurnitureLayout();
      this.doors = this.buildDoors();
      this.stations = this.buildStations();
      this.colliders = this.buildColliders();

      // Pre-bake static interior room canvases (floors, walls, signs, wall posters)
      this.roomCanvases = {
        UBS_INTERIOR: this.bakeUBSRoom(),
        ESF_ROOM: this.bakeESFRoom()
      };
    }

    // ========================================================================
    // 1. HEALTHCARE PROFESSIONALS & ACS COLLEAGUES ROSTER (10 NPCs)
    // ========================================================================
    buildStaffRoster() {
      return [
        // --- UBS MAIN HALL & CLINICAL WING ---
        {
          id: 'vigia',
          room: 'UBS_INTERIOR',
          name: 'Seu Oswaldo',
          role: 'Vigia Patrimonial',
          roleKey: 'vigia',
          sector: 'Portaria • Entrada da UBS',
          badgeClass: 'trabalhador',
          portraitBg: '#cbd5e1',
          x: 14.2 * T,
          y: 19.0 * T,
          interactX: 14.2 * T,
          interactY: 19.0 * T,
          emoteDefault: 'chat',
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#9e6b47',
            hair: '#9ca3af',
            hairStyle: 'short',
            shirt: '#1e3a5f',
            pants: '#1e293b',
            hat: '#0f172a',
            mustache: true,
            badge: true,
            gender: 'm'
          }
        },
        {
          id: 'escriturario',
          room: 'UBS_INTERIOR',
          name: 'Renan',
          role: 'Escriturário (Recepção)',
          roleKey: 'escriturario',
          sector: 'Sala de Recepção • Acolhimento & Cartão SUS',
          badgeClass: 'prioritario',
          portraitBg: '#bae6fd',
          x: 6.0 * T,
          y: 15.0 * T,
          // Player talks comfortably from the front of the reception counter!
          interactX: 6.0 * T,
          interactY: 17.2 * T,
          interactRadius: 88,
          emoteDefault: 'chat',
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#e8b896',
            hair: '#2b2420',
            hairStyle: 'short',
            shirt: '#0284c7',
            pants: '#334155',
            glasses: true,
            badge: true,
            gender: 'm'
          }
        },
        {
          id: 'limpeza',
          room: 'UBS_INTERIOR',
          name: 'Dona Sueli',
          role: 'Auxiliar de Limpeza',
          roleKey: 'limpeza',
          sector: 'Serviços Gerais • Higienização da UBS',
          badgeClass: 'amigo',
          portraitBg: '#d1fae5',
          x: 19.3 * T,
          y: 12.2 * T,
          interactX: 19.3 * T,
          interactY: 12.2 * T,
          emoteDefault: 'chat',
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#8d593a',
            hair: '#3b2820',
            hairStyle: 'bun',
            shirt: '#0d9488',
            apron: '#ccfbf1',
            pants: '#115e59',
            uniformPants: true,
            gender: 'f'
          }
        },
        {
          id: 'medico',
          room: 'UBS_INTERIOR',
          name: 'Dr. Henrique',
          role: 'Médico de Família (ESF)',
          roleKey: 'medico',
          sector: 'Consultório Médico • Atenção Primária',
          badgeClass: 'prioritario',
          portraitBg: '#dbeafe',
          x: 5.5 * T,
          y: 6.6 * T,
          interactX: 5.5 * T,
          interactY: 6.6 * T,
          emoteDefault: 'chat',
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#d9a482',
            hair: '#3f2d21',
            hairStyle: 'short',
            shirt: '#1d4ed8',
            labCoat: true,
            stethoscope: true,
            glasses: true,
            gender: 'm'
          }
        },
        {
          id: 'enfermeira_marina',
          room: 'UBS_INTERIOR',
          name: 'Enfª Marina',
          role: 'Enfermeira da ESF',
          roleKey: 'enfermeiro',
          sector: 'Sala de Enfermagem • Coordenação ESF',
          badgeClass: 'amigo',
          portraitBg: '#bae6fd',
          x: 13.4 * T,
          y: 6.6 * T,
          interactX: 13.4 * T,
          interactY: 6.6 * T,
          emoteDefault: 'chat',
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#d8a07c',
            hair: '#3b2416',
            hairStyle: 'bun',
            shirt: '#0284c7',
            labCoat: true,
            stethoscope: true,
            glasses: true,
            gender: 'f'
          }
        },
        {
          id: 'enfermeiro_carlos',
          room: 'UBS_INTERIOR',
          name: 'Enf. Carlos',
          role: 'Enfermeiro (Vacina & Curativos)',
          roleKey: 'enfermeiro',
          sector: 'Sala de Vacinação & Procedimentos',
          badgeClass: 'prioritario',
          portraitBg: '#e0f2fe',
          x: 17.4 * T,
          y: 6.6 * T,
          interactX: 17.4 * T,
          interactY: 6.6 * T,
          emoteDefault: 'chat',
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#a87049',
            hair: '#1f1a17',
            hairStyle: 'short',
            shirt: '#0369a1',
            labCoat: true,
            gender: 'm'
          }
        },
        {
          id: 'fisioterapeuta',
          room: 'UBS_INTERIOR',
          name: 'Dra. Patrícia',
          role: 'Fisioterapeuta (eMulti)',
          roleKey: 'fisioterapeuta',
          sector: 'Sala de Fisioterapia & Reabilitação',
          badgeClass: 'amigo',
          portraitBg: '#ccfbf1',
          x: 25.2 * T,
          y: 6.6 * T,
          interactX: 25.2 * T,
          interactY: 6.6 * T,
          emoteDefault: 'chat',
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#f0c4a8',
            hair: '#523422',
            hairStyle: 'long',
            shirt: '#0f766e',
            pants: '#134e4a',
            uniformPants: true,
            badge: true,
            gender: 'f'
          }
        },

        // --- SALA ESF (COLEGAS ACS) ---
        {
          id: 'acs_joana',
          room: 'ESF_ROOM',
          name: 'ACS Joana',
          role: 'Colega ACS (Microárea 01)',
          roleKey: 'acs',
          sector: 'Sala ESF • Estratégia Saúde da Família',
          badgeClass: 'amigo',
          portraitBg: '#fef3c7',
          x: 11.0 * T,
          y: 5.2 * T,
          interactX: 11.0 * T,
          interactY: 5.2 * T,
          emoteDefault: 'chat',
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#b97e56',
            hair: '#291f1a',
            hairStyle: 'bun',
            shirt: '#f8fafc',
            acsVest: true,
            gender: 'f'
          }
        },
        {
          id: 'acs_tiago',
          room: 'ESF_ROOM',
          name: 'ACS Tiago',
          role: 'Colega ACS (Microárea 02)',
          roleKey: 'acs',
          sector: 'Sala ESF • Estratégia Saúde da Família',
          badgeClass: 'trabalhador',
          portraitBg: '#fde68a',
          x: 7.2 * T,
          y: 8.6 * T,
          interactX: 7.2 * T,
          interactY: 8.6 * T,
          emoteDefault: 'chat',
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#e6b18a',
            hair: '#3b2618',
            hairStyle: 'messy',
            shirt: '#f8fafc',
            acsVest: true,
            glasses: true,
            gender: 'm'
          }
        },
        {
          id: 'acs_rosana',
          room: 'ESF_ROOM',
          name: 'ACS Rosana',
          role: 'Colega ACS (Microárea 03)',
          roleKey: 'acs',
          sector: 'Sala ESF • Estratégia Saúde da Família',
          badgeClass: 'amigo',
          portraitBg: '#fed7aa',
          x: 14.8 * T,
          y: 8.6 * T,
          interactX: 14.8 * T,
          interactY: 8.6 * T,
          emoteDefault: 'chat',
          emote: null,
          emoteTimer: 0,
          appearance: {
            skin: '#8a583b',
            hair: '#1f1a17',
            hairStyle: 'long',
            shirt: '#f8fafc',
            acsVest: true,
            gender: 'f'
          }
        }
      ];
    }

    // ========================================================================
    // 2. FURNITURE, DOORS, STATIONS & COLLIDERS
    // ========================================================================
    buildFurnitureLayout() {
      return {
        UBS_INTERIOR: [
          // Consultório Médico (cols 1..9)
          { sprite: 'examTable', x: 2.8 * T, y: 5.2 * T },
          { sprite: 'clinicDesk', x: 7.8 * T, y: 5.2 * T },
          // Enfermagem & Vacina (cols 11..19)
          { sprite: 'clinicDesk', x: 12.8 * T, y: 5.1 * T },
          { sprite: 'vaccineFridge', x: 18.6 * T, y: 5.1 * T },
          // Fisioterapia / eMulti (cols 21..28)
          { sprite: 'physioMat', x: 23.0 * T, y: 5.3 * T },
          { sprite: 'clinicDesk', x: 27.2 * T, y: 5.1 * T },
          // Corridor Limpeza equipment
          { sprite: 'mopBucket', x: 21.3 * T, y: 12.3 * T },
          // Reception & Waiting Hall
          { sprite: 'receptionDesk', x: 6.0 * T, y: 16.4 * T },
          { sprite: 'waterCooler', x: 11.3 * T, y: 15.8 * T },
          { sprite: 'waitingBench', x: 24.5 * T, y: 15.6 * T },
          { sprite: 'waitingBench', x: 29.2 * T, y: 15.6 * T },
          { sprite: 'waitingBench', x: 24.5 * T, y: 18.3 * T },
          { sprite: 'waitingBench', x: 29.2 * T, y: 18.3 * T },
          // Potted plants
          { sprite: 'pottedPlant', x: 2.0 * T, y: 19.6 * T },
          { sprite: 'pottedPlant', x: 33.8 * T, y: 19.6 * T },
          { sprite: 'pottedPlant', x: 33.8 * T, y: 14.5 * T }
        ],
        ESF_ROOM: [
          { sprite: 'esusComputer', x: 3.4 * T, y: 4.5 * T },
          { sprite: 'supplyLocker', x: 18.6 * T, y: 4.5 * T },
          { sprite: 'esfTable', x: 11.0 * T, y: 8.6 * T },
          { sprite: 'pottedPlant', x: 2.1 * T, y: 12.8 * T },
          { sprite: 'pottedPlant', x: 19.9 * T, y: 12.8 * T }
        ]
      };
    }

    buildDoors() {
      return {
        UBS_INTERIOR: [
          {
            id: 'door_esf',
            x: 32.5 * T,
            y: 10.4 * T,
            radius: 58,
            promptY: 9.2 * T,
            label: '[E] Entrar na Sala ESF (ACS)',
            action: () => this.enterESF()
          },
          {
            id: 'door_exit_ubs',
            x: 17.5 * T,
            y: 20.5 * T,
            radius: 62,
            promptY: 19.6 * T,
            label: '[E] Sair para a Vila Esperança',
            action: () => this.exitUBS()
          }
        ],
        ESF_ROOM: [
          {
            id: 'door_exit_esf',
            x: 11.0 * T,
            y: 13.5 * T,
            radius: 60,
            promptY: 12.5 * T,
            label: '[E] Voltar para a Recepção da UBS',
            action: () => this.exitESF()
          }
        ]
      };
    }

    buildStations() {
      return {
        UBS_INTERIOR: [
          {
            id: 'water_cooler',
            x: 11.3 * T,
            y: 16.3 * T,
            radius: 52,
            promptY: 14.4 * T,
            label: '[E] Beber Água & Encher Garrafa',
            action: () => this.useWaterCooler()
          }
        ],
        ESF_ROOM: [
          {
            id: 'esus_terminal',
            x: 3.4 * T,
            y: 5.1 * T,
            radius: 58,
            promptY: 3.4 * T,
            label: '[E] Terminal e-SUS (Sincronizar / Fechar Dia)',
            action: () => this.openESUSTerminal()
          },
          {
            id: 'supply_locker',
            x: 18.6 * T,
            y: 5.1 * T,
            radius: 58,
            promptY: 3.3 * T,
            label: '[E] Armário ESF (Reabastecer Mochila)',
            action: () => this.useSupplyLocker()
          }
        ]
      };
    }

    buildColliders() {
      // Each collider is [x1, y1, x2, y2] in room pixel coordinates
      return {
        UBS_INTERIOR: [
          // Vertical clinical wing partitions
          [10 * T, 3 * T, 11 * T, 10 * T],
          [20 * T, 3 * T, 21 * T, 10 * T],
          [29 * T, 3 * T, 30 * T, 10 * T],
          // Front walls of Consultório Médico (archway cols 4..6)
          [1 * T, 9 * T, 4 * T, 10 * T],
          [7 * T, 9 * T, 10 * T, 10 * T],
          // Front walls of Enfermagem & Vacina (archway cols 14..16)
          [11 * T, 9 * T, 14 * T, 10 * T],
          [17 * T, 9 * T, 20 * T, 10 * T],
          // Front walls of Fisioterapia (archway cols 24..26)
          [21 * T, 9 * T, 24 * T, 10 * T],
          [27 * T, 9 * T, 29 * T, 10 * T],
          // Enclosed Sala ESF wall block inside UBS (door sits on row 9 at col 32.5)
          [30 * T, 3 * T, 35 * T, 10 * T],
          // Consultório Médico furniture
          [1.5 * T, 4.0 * T, 4.1 * T, 5.4 * T], // exam table
          [6.6 * T, 4.1 * T, 9.0 * T, 5.4 * T], // doctor desk
          // Enfermagem & Vacina furniture
          [11.6 * T, 4.0 * T, 14.0 * T, 5.3 * T], // nurse desk
          [17.9 * T, 3.9 * T, 19.3 * T, 5.3 * T], // vaccine fridge
          // Fisioterapia furniture
          [21.7 * T, 4.3 * T, 24.3 * T, 5.5 * T], // physio mat & ball
          [26.0 * T, 4.0 * T, 28.4 * T, 5.3 * T], // physio desk
          // Corridor mop bucket
          [20.6 * T, 11.7 * T, 22.0 * T, 12.5 * T],
          // Reception Desk (solid counter separating Escriturário)
          [3.0 * T, 15.1 * T, 9.0 * T, 16.6 * T],
          // Water Cooler
          [10.8 * T, 15.0 * T, 11.8 * T, 16.0 * T],
          // Waiting Benches
          [23.1 * T, 14.7 * T, 25.9 * T, 15.8 * T],
          [27.8 * T, 14.7 * T, 30.6 * T, 15.8 * T],
          [23.1 * T, 17.4 * T, 25.9 * T, 18.5 * T],
          [27.8 * T, 17.4 * T, 30.6 * T, 18.5 * T],
          // Potted plants
          [1.5 * T, 18.9 * T, 2.5 * T, 19.8 * T],
          [33.3 * T, 18.9 * T, 34.3 * T, 19.8 * T],
          [33.3 * T, 13.8 * T, 34.3 * T, 14.7 * T]
        ],
        ESF_ROOM: [
          [2.3 * T, 3.6 * T, 4.5 * T, 4.8 * T],   // e-SUS computer desk
          [17.7 * T, 3.5 * T, 19.5 * T, 4.8 * T], // supply locker
          [9.2 * T, 7.6 * T, 12.8 * T, 8.9 * T],  // ESF center meeting table
          [1.6 * T, 12.1 * T, 2.6 * T, 13.0 * T], // plant left
          [19.4 * T, 12.1 * T, 20.4 * T, 13.0 * T] // plant right
        ]
      };
    }

    // ========================================================================
    // 3. PRE-BAKED STATIC INTERIOR ROOM CANVASES
    // ========================================================================
    bakeUBSRoom() {
      const room = this.rooms.UBS_INTERIOR;
      const c = document.createElement('canvas');
      c.width = room.width;
      c.height = room.height;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const pa = global.pixelArt;

      // 1. Ceramic Tile Floor & Pale-Blue Central Corridor
      for (let r = 3; r < room.rows - 1; r++) {
        for (let col = 1; col < room.cols - 1; col++) {
          const isCorridor = r >= 10 && r <= 13;
          const tile = isCorridor
            ? pa.interior.corridorFloor
            : pa.interior.clinicFloor[(r + col) % 2];
          ctx.drawImage(tile, col * T, r * T);
        }
      }

      // 2. Outer Walls (3/4 warm clinic walls with SUS blue wainscot & subtle plaster texture)
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(0, 0, room.width, 16);
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, 16, room.width, 12);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, 16, room.width, 2);
      ctx.fillStyle = '#f5efe2';
      ctx.fillRect(T, 28, room.width - 2 * T, 52);
      for (let py = 32; py < 76; py += 6) {
        for (let px0 = T + 10; px0 < room.width - T - 10; px0 += 18) {
          if (pa.rand(px0 * 13 + py * 37) > 0.58) {
            ctx.fillStyle = '#e7dfd0';
            ctx.fillRect(px0, py, 5, 2);
          }
        }
      }
      // SUS blue mid stripe & baseboard
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(T, 72, room.width - 2 * T, 14);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(T, 72, room.width - 2 * T, 2);
      ctx.fillStyle = '#035388';
      ctx.fillRect(T, 86, room.width - 2 * T, 6);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(T, 92, room.width - 2 * T, 4);

      // Left, Right & Bottom Perimeter Trim Walls
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(0, 0, T, room.height);
      ctx.fillRect(room.width - T, 0, T, room.height);
      ctx.fillRect(0, room.height - T, room.width, T);
      ctx.fillStyle = '#7a5238';
      ctx.fillRect(6, 16, T - 12, room.height - 22);
      ctx.fillRect(room.width - T + 6, 16, T - 12, room.height - 22);
      ctx.fillRect(6, room.height - T + 6, room.width - 12, T - 12);
      ctx.fillStyle = '#a6713f';
      ctx.fillRect(6, 16, 2, room.height - 22);
      ctx.fillRect(room.width - T + 6, 16, 2, room.height - 22);
      ctx.fillRect(6, room.height - T + 6, room.width - 12, 2);

      // Wall-to-floor ambient occlusion along back wall & room perimeter
      const ubsAo = ctx.createLinearGradient(0, 3 * T, 0, 3 * T + 12);
      ubsAo.addColorStop(0, 'rgba(32, 22, 14, 0.26)');
      ubsAo.addColorStop(1, 'rgba(32, 22, 14, 0)');
      ctx.fillStyle = ubsAo;
      ctx.fillRect(T, 3 * T, room.width - 2 * T, 12);
      ctx.fillStyle = 'rgba(32, 22, 14, 0.14)';
      ctx.fillRect(T, 3 * T, 6, room.height - 4 * T);
      ctx.fillRect(room.width - T - 6, 3 * T, 6, room.height - 4 * T);
      ctx.fillRect(T, room.height - T - 6, room.width - 2 * T, 6);

      // 3. Clinical Wing Interior Partition Walls with beveled trim & floor AO
      const drawWallRect = (c1, r1, c2, r2) => {
        const x = c1 * T;
        const y = r1 * T;
        const w = (c2 - c1) * T;
        const h = (r2 - r1) * T;
        ctx.fillStyle = 'rgba(26, 18, 12, 0.22)';
        ctx.fillRect(x, y + h, w, 6);
        ctx.fillStyle = '#2b1b12';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#e7e1d3';
        ctx.fillRect(x + 3, y + 3, w - 6, h - 10);
        ctx.fillStyle = '#f5f0e6';
        ctx.fillRect(x + 3, y + 3, w - 6, 2);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 3, y + h - 10, w - 6, 7);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 3, y + h - 10, w - 6, 1);
      };

      drawWallRect(10, 3, 11, 10);
      drawWallRect(20, 3, 21, 10);
      drawWallRect(29, 3, 30, 10);

      // Front partition walls (row 9) with clean open archways
      drawWallRect(1, 9, 4, 10);
      drawWallRect(7, 9, 10, 10);
      drawWallRect(11, 9, 14, 10);
      drawWallRect(17, 9, 20, 10);
      drawWallRect(21, 9, 24, 10);
      drawWallRect(27, 9, 29, 10);

      // East Wing: Enclosed Facade of the Visitable Sala ESF!
      ctx.fillStyle = '#3b2416';
      ctx.fillRect(30 * T, 3 * T, 5 * T, 7 * T);
      ctx.fillStyle = '#f5eedc';
      ctx.fillRect(30 * T + 4, 3 * T + 4, 5 * T - 8, 7 * T - 24);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(30 * T + 4, 9 * T + 4, 5 * T - 8, 16);
      // Warm glowing interior window looking into the ESF room
      ctx.fillStyle = '#3b2416';
      ctx.fillRect(31 * T - 4, 4 * T + 4, 3 * T + 8, 2 * T);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(31 * T, 4 * T + 8, 3 * T, 2 * T - 8);
      ctx.fillStyle = '#fef9c3';
      ctx.fillRect(31 * T + 6, 4 * T + 12, 22, 18);
      ctx.fillStyle = '#7a5238';
      ctx.fillRect(32.5 * T - 2, 4 * T + 8, 4, 2 * T - 8);

      // Blue SUS Door leading into Sala ESF!
      ctx.drawImage(pa.interior.esfDoor, Math.round(32.5 * T - 36), Math.round(7.4 * T));
      // Welcoming ESF Doormat
      ctx.fillStyle = '#035388';
      ctx.fillRect(31.5 * T, 10 * T + 2, 2 * T, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(31.5 * T + 4, 10 * T + 6, 2 * T - 8, 16);

      // 4. SUS Wall Posters & Room Nameplates
      ctx.drawImage(pa.interior.wallPosterSUS, 4.6 * T, 1.1 * T);
      ctx.drawImage(pa.interior.wallPosterSUS, 14.6 * T, 1.1 * T);
      ctx.drawImage(pa.interior.wallPosterSUS, 24.1 * T, 1.1 * T);

      this.drawRoomPlaque(ctx, 5.5 * T, 8.9 * T, '🩺 CONSULTÓRIO MÉDICO', '#0369a1');
      this.drawRoomPlaque(ctx, 15.5 * T, 8.9 * T, '💉 ENFERMAGEM & VACINA', '#0284c7');
      this.drawRoomPlaque(ctx, 25.0 * T, 8.9 * T, '🤸 FISIOTERAPIA (eMulti)', '#0f766e');
      this.drawRoomPlaque(ctx, 32.5 * T, 7.1 * T, '🚪 SALA ESF (ACS)', '#b45309');
      this.drawRoomPlaque(ctx, 6.0 * T, 13.7 * T, '📋 RECEPÇÃO • ACOLHIMENTO', '#0369a1');
      this.drawRoomPlaque(ctx, 27.0 * T, 13.7 * T, '🪑 SALA DE ESPERA', '#475569');

      // 5. Main Glass Sliding Entrance / Exit Doorway (Bottom Center, cols 16..19)
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(16 * T - 4, room.height - T, 3 * T + 8, T);
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(16 * T, room.height - T + 4, 3 * T, T - 8);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(16 * T + 6, room.height - T + 6, 24, T - 12);
      // Welcome Mat inside entrance
      ctx.fillStyle = '#035388';
      ctx.fillRect(16 * T + 4, 20 * T + 2, 3 * T - 8, 26);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(16 * T + 8, 20 * T + 6, 3 * T - 16, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Trebuchet MS';
      ctx.fillText('SAÍDA • SUS', 16.5 * T + 2, 20 * T + 19);

      return c;
    }

    bakeESFRoom() {
      const room = this.rooms.ESF_ROOM;
      const c = document.createElement('canvas');
      c.width = room.width;
      c.height = room.height;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const pa = global.pixelArt;

      // 1. Cozy Honey-Wood Parquet Floor
      for (let r = 3; r < room.rows - 1; r++) {
        for (let col = 1; col < room.cols - 1; col++) {
          ctx.drawImage(pa.interior.esfFloor[(r + col) % 2], col * T, r * T);
        }
      }

      // Cozy woven rug under central ACS meeting table with border & floor contact shadow
      ctx.fillStyle = 'rgba(26, 15, 8, 0.24)';
      ctx.fillRect(7.5 * T - 2, 6.8 * T + 3, 7 * T + 4, 3.6 * T);
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(7.5 * T - 2, 6.8 * T - 2, 7 * T + 4, 3.6 * T + 4);
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(7.5 * T, 6.8 * T, 7 * T, 3.6 * T);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(7.5 * T + 6, 6.8 * T + 6, 7 * T - 12, 3.6 * T - 12);
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(7.5 * T + 12, 6.8 * T + 12, 7 * T - 24, 3.6 * T - 24);
      ctx.fillStyle = '#7dd3fc';
      for (let rx = 7.5 * T + 20; rx < 14.5 * T - 20; rx += 14) {
        ctx.fillRect(rx, 6.8 * T + 16, 6, 3.6 * T - 32);
      }

      // 2. Warm Cream & Wood Paneling Walls
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(0, 0, room.width, 14);
      ctx.fillStyle = '#6b3e1f';
      ctx.fillRect(0, 14, room.width, 10);
      ctx.fillStyle = '#9c6234';
      ctx.fillRect(0, 14, room.width, 2);
      ctx.fillStyle = '#f8efd8';
      ctx.fillRect(T, 24, room.width - 2 * T, 52);
      for (let py = 28; py < 72; py += 6) {
        for (let px0 = T + 8; px0 < room.width - T - 8; px0 += 16) {
          if (pa.rand(px0 * 19 + py * 23) > 0.58) {
            ctx.fillStyle = '#ebe0c5';
            ctx.fillRect(px0, py, 4, 2);
          }
        }
      }
      // Warm wood wainscot
      ctx.fillStyle = '#9c6234';
      ctx.fillRect(T, 72, room.width - 2 * T, 22);
      ctx.fillStyle = '#cfa06b';
      ctx.fillRect(T, 72, room.width - 2 * T, 2);
      ctx.fillStyle = '#6b3e1f';
      ctx.fillRect(T, 74, room.width - 2 * T, 2);
      for (let wx = T; wx < room.width - T; wx += 24) {
        ctx.fillRect(wx, 75, 2, 19);
      }

      // Outer wooden frame walls
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
      const esfAo = ctx.createLinearGradient(0, 3 * T, 0, 3 * T + 12);
      esfAo.addColorStop(0, 'rgba(32, 18, 10, 0.34)');
      esfAo.addColorStop(1, 'rgba(32, 18, 10, 0)');
      ctx.fillStyle = esfAo;
      ctx.fillRect(T, 3 * T, room.width - 2 * T, 12);
      ctx.fillStyle = 'rgba(32, 18, 10, 0.16)';
      ctx.fillRect(T, 3 * T, 6, room.height - 4 * T);
      ctx.fillRect(room.width - T - 6, 3 * T, 6, room.height - 4 * T);
      ctx.fillRect(T, room.height - T - 6, room.width - 2 * T, 6);

      // 3. Giant Territorial Map & SUS Posters on Back Wall!
      ctx.drawImage(pa.interior.territoryMapWall, Math.round(11 * T - 68), 20);
      ctx.drawImage(pa.interior.wallPosterSUS, 4.5 * T, 24);
      ctx.drawImage(pa.interior.wallPosterSUS, 15.8 * T, 24);

      this.drawRoomPlaque(ctx, 11 * T, 0.5 * T, '🗺️ SALA ESF — EQUIPE DE AGENTES COMUNITÁRIOS (ACS)', '#0369a1');

      // 4. Exit Doorway back to UBS Reception (Bottom Center, cols 10..12)
      ctx.fillStyle = '#035388';
      ctx.fillRect(10 * T - 2, room.height - T, 2 * T + 4, T);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(10 * T + 2, room.height - T + 4, 2 * T - 4, T - 8);
      // Doormat
      ctx.fillStyle = '#6b3e1f';
      ctx.fillRect(10 * T - 4, 13 * T + 4, 2 * T + 8, 24);
      ctx.fillStyle = '#cfa06b';
      ctx.fillRect(10 * T, 13 * T + 8, 2 * T, 16);
      ctx.fillStyle = '#382213';
      ctx.font = 'bold 10px Trebuchet MS';
      ctx.fillText('← UBS', 10 * T + 16, 13 * T + 20);

      return c;
    }

    drawRoomPlaque(ctx, cx, topY, text, bgColor = '#0369a1') {
      ctx.font = 'bold 11px Trebuchet MS';
      const w = ctx.measureText(text).width + 18;
      const bx = Math.round(cx - w / 2);
      const by = Math.round(topY);
      ctx.fillStyle = '#291d14';
      ctx.fillRect(bx - 2, by - 2, w + 4, 22);
      ctx.fillStyle = bgColor;
      ctx.fillRect(bx, by, w, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, bx + 9, by + 13);
    }

    // ========================================================================
    // 4. ROOM TRANSITIONS & STATE HELPERS
    // ========================================================================
    getCurrentRoom(sceneId = null) {
      return this.rooms[sceneId || this.game.currentLocation] || null;
    }

    getBounds(sceneId = null) {
      const room = this.getCurrentRoom(sceneId);
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
      return sceneId === 'ESF_ROOM' ? '👥 Sala ESF (ACS)' : '🏥 UBS Vila Esperança';
    }

    getFootstepTile(sceneId) {
      return sceneId === 'ESF_ROOM' ? 'E' : 'I';
    }

    drawMinimap(ctx, W, H) {
      this.drawInteriorMinimap(ctx, W, H);
    }

    getStaffInRoom(roomId) {
      return this.staff.filter(s => s.room === roomId);
    }

    _snapCameraToCurrentRoom() {
      if (this.game.sceneManager) {
        this.game.sceneManager.snapCamera();
      }
    }

    enterUBS() {
      const sp = this.rooms.UBS_INTERIOR.spawn;
      this.game.sceneManager.enter('UBS_INTERIOR', {
        x: sp.x,
        y: sp.y,
        dir: sp.dir,
        toast: '🏥 Você entrou na UBS Vila Esperança! Converse com a equipe ou visite a Sala ESF à direita.'
      });
    }

    exitUBS(customToast = null) {
      const g = this.game;
      g.sceneManager.enter('OVERWORLD', {
        x: g.ubs.doorX,
        y: g.ubs.doorY + 28,
        dir: 'down',
        toast: customToast || '🌤️ Você saiu para a Vila Esperança — Microárea 04.'
      });
    }

    enterESF() {
      const sp = this.rooms.ESF_ROOM.spawn;
      this.game.sceneManager.enter('ESF_ROOM', {
        x: sp.x,
        y: sp.y,
        dir: sp.dir,
        toast: '👥 Sala ESF — Base dos Agentes Comunitários de Saúde (ACS)!',
        toastType: 'success'
      });
    }

    exitESF() {
      const sp = this.rooms.UBS_INTERIOR.fromESFSpawn;
      this.game.sceneManager.enter('UBS_INTERIOR', {
        x: sp.x,
        y: sp.y,
        dir: sp.dir
      });
    }

    resetDaily() {
      this.talkedToday.clear();
      this.stretchUsedToday = false;
      this.coffeeUsedToday = false;
    }

    // ========================================================================
    // 5. COLLISION, UPDATE & INTERACTION DETECTION INDOORS
    // ========================================================================
    collides(location, px, py) {
      const room = this.rooms[location];
      if (!room) return false;

      // Perimeter wall bounds
      if (px < T + 12 || px > room.width - T - 12) return true;
      if (py < 3 * T + 12) return true;
      if (py > room.height - T - 4) return true;

      // Furniture & partition rects
      const rects = this.colliders[location] || [];
      for (const [x1, y1, x2, y2] of rects) {
        if (px > x1 - 8 && px < x2 + 8 && py > y1 - 4 && py < y2 + 6) {
          return true;
        }
      }

      // Soft personal-space circle around staff NPCs (so player doesn't overlap them)
      for (const s of this.getStaffInRoom(location)) {
        if (Math.hypot(px - s.x, py - s.y) < 18) {
          return true;
        }
      }

      if (location === 'UBS_INTERIOR' && this.game.communitySpaces && this.game.communitySpaces.isDonaCarlaAtUBS()) {
        const dc = this.game.communitySpaces.npcs.npc_dona_carla;
        if (Math.hypot(px - dc.x, py - dc.y) < 18) return true;
      }

      if (location === 'UBS_INTERIOR' && this.game.schedule) {
        for (const { loc } of this.game.schedule.getFamiliesInScene('UBS_INTERIOR')) {
          if (Math.hypot(px - loc.x, py - loc.y) < 18) return true;
        }
      }

      return false;
    }

    update(dt) {
      if (this.transitionAlpha > 0) {
        this.transitionAlpha = Math.max(0, this.transitionAlpha - dt * 2.6);
      }
      for (const s of this.staff) {
        if (s.emoteTimer > 0) s.emoteTimer -= dt;
      }
    }

    checkNearbyInteractions() {
      const g = this.game;
      const loc = g.currentLocation;
      g.nearTarget = null;

      // 1. Check doors
      const doors = this.doors[loc] || [];
      for (const d of doors) {
        if (Math.hypot(g.player.x - d.x, g.player.y - d.y) < d.radius) {
          g.nearTarget = {
            type: 'INTERIOR_DOOR',
            door: d,
            x: d.x,
            y: d.promptY,
            label: d.label
          };
          return;
        }
      }

      // 2. Check staff NPCs in current room (choose closest within radius)
      let closestStaff = null;
      let minDist = Infinity;
      for (const s of this.getStaffInRoom(loc)) {
        const rad = s.interactRadius || 66;
        const dist = Math.hypot(g.player.x - s.interactX, g.player.y - s.interactY);
        if (dist < rad && dist < minDist) {
          minDist = dist;
          closestStaff = s;
        }
      }
      if (closestStaff) {
        g.nearTarget = {
          type: 'STAFF',
          staff: closestStaff,
          x: closestStaff.x,
          y: closestStaff.y - 52,
          label: `[E] Conversar com ${closestStaff.name} (${closestStaff.role.split(' ')[0]})`
        };
        return;
      }

      // 2B. Check Dona Carla (Weekly visitor Mon morning & Fri afternoon inside UBS_INTERIOR)
      if (loc === 'UBS_INTERIOR' && g.communitySpaces && g.communitySpaces.isDonaCarlaAtUBS()) {
        const dc = g.communitySpaces.npcs.npc_dona_carla;
        if (Math.hypot(g.player.x - dc.interactX, g.player.y - dc.interactY) < dc.interactRadius) {
          g.nearTarget = {
            type: 'INTERIOR_STATION',
            station: { action: () => g.communitySpaces.openDonaCarlaDialogue() },
            x: dc.x,
            y: dc.y - 52,
            label: '[E] Conversar com Dona Carla (Coordenação)'
          };
          return;
        }
      }

      // 2C. Check residents waiting inside UBS_INTERIOR
      if (loc === 'UBS_INTERIOR' && g.schedule) {
        for (const { fam, loc: floc } of g.schedule.getFamiliesInScene('UBS_INTERIOR')) {
          if (Math.hypot(g.player.x - floc.x, g.player.y - floc.y) < 58) {
            g.nearTarget = {
              type: 'INTERIOR_STATION',
              station: { action: () => g.schedule.openInformalEncounter(fam, floc) },
              x: floc.x,
              y: floc.y - 48,
              label: `[E] Conversar com ${fam.name.split(' ')[0]} (Espera)`
            };
            return;
          }
        }
      }

      // 3. Check interactive stations (water cooler, supply locker, e-SUS terminal)
      const stations = this.stations[loc] || [];
      for (const st of stations) {
        if (Math.hypot(g.player.x - st.x, g.player.y - st.y) < st.radius) {
          g.nearTarget = {
            type: 'INTERIOR_STATION',
            station: st,
            x: st.x,
            y: st.promptY,
            label: st.label
          };
          return;
        }
      }

      // 4. WorldState clues inside UBS / Sala ESF (Etapa H3)
      if (g.worldState) {
        const clue = g.worldState.getNearbyClue(loc);
        if (clue) {
          g.nearTarget = {
            type: 'INTERIOR_STATION',
            station: { action: () => g.worldState.inspectClue(clue) },
            x: clue.x,
            y: clue.y - 32,
            label: clue.prompt
          };
          return;
        }
      }
    }

    triggerInteraction() {
      const t = this.game.nearTarget;
      if (!t) return false;
      if (t.type === 'INTERIOR_DOOR') {
        t.door.action();
        return true;
      }
      if (t.type === 'INTERIOR_STATION') {
        t.station.action();
        return true;
      }
      if (t.type === 'STAFF') {
        this.openStaffDialogue(t.staff);
        return true;
      }
      return false;
    }

    // ========================================================================
    // 6. INTERACTIVE STATIONS & RICH STAFF DIALOGUES
    // ========================================================================
    useWaterCooler() {
      const g = this.game;
      g.player.hydration = 100;
      g.player.stamina = Math.min(100, g.player.stamina + 18);
      const water = g.inventory.find(i => i.id === 'water');
      if (water) water.count = water.maxCount;
      g.setPlayerEmote('water', 2.4);
      global.sfx.item();
      g.toast('💧 Você bebeu água gelada no bebedouro da UBS e encheu sua garrafa (100%)!', 'success');
      g.renderHotbar();
      g.updateHUD();
      g.navigation.resolveObjective();
      g.navigation.updateTrackerUI();
      g.saveProgress();
    }

    useSupplyLocker() {
      const g = this.game;
      g.player.hydration = 100;
      g.player.stamina = Math.min(100, g.player.stamina + 30);
      g.timeMinutes += 10;
      g.inventory.forEach(i => { i.count = i.maxCount; });
      g.setPlayerEmote('check', 2.4);
      global.sfx.success();
      g.toast('🎒 Mochila do ACS reabastecida no Armário da Sala ESF (Água, Protetor FPS 50 e Petiscos)!', 'success');
      g.renderHotbar();
      g.updateHUD();
      g.navigation.resolveObjective();
      g.navigation.updateTrackerUI();
      g.saveProgress();
    }

    openESUSTerminal() {
      const g = this.game;
      const dayData = g.getCurrentDayData();
      const prioDone = g.getWeeklyPrioritiesCompletedCount();
      const prioTotal = g.weeklyPriorities.length;
      const marina = this.staff.find(s => s.id === 'enfermeira_marina');
      const prioListText = g.weeklyPriorities
        .map(id => {
          const f = g.families.find(x => x.id === id);
          if (!f) return '';
          const ok = g.visitedThisWeek.has(id);
          return `${ok ? '✅' : '⭐'} ${f.code}`;
        })
        .filter(Boolean)
        .join(' • ');

      g.openDialogueShell(
        'STAFF',
        marina,
        `Terminal e-SUS PEC • Semana ${g.weekNumber}`,
        'Sistema e-SUS Território',
        `<span class="badge prioritario">💻 Sincronização</span><span class="badge amigo">📊 Sem. ${g.weekNumber} • ${dayData.shortName}</span>`,
        Math.min(100, Math.round((g.weeklyVisits / g.weeklyGoal) * 100)),
        `Semana: ${g.weeklyVisits}/${g.weeklyGoal} visitas`
      );

      g.setDialogueText(
        `Terminal e-SUS conectado! Na Semana ${g.weekNumber} (${dayData.name}), você acompanhou ${g.weeklyVisits} de ${g.weeklyGoal} visitas na Microárea 04. Sincronize seus registros quando quiser — para encerrar o dia, basta dormir em sua casa à noite!`
      );

      const noteEl = document.getElementById('dlg-clinical-note');
      noteEl.classList.remove('hidden');
      noteEl.innerHTML = `Prioridades da Semana (${prioDone}/${prioTotal}): <strong>${prioListText}</strong> • Vínculo Médio: <strong>${g.getCommunityBondAverage()}%</strong>`;

      const choicesEl = document.getElementById('dlg-choices');
      const opts = [
        {
          text: g.weeklyVisits >= g.weeklyGoal || g.dayOfWeek === 4
            ? `Sincronizar e registrar Fechamento Semanal no e-SUS (${g.weeklyVisits}/${g.weeklyGoal} visitas).`
            : `Sincronizar visitas registradas até agora no e-SUS (${g.weeklyVisits}/${g.weeklyGoal}).`,
          tag: g.weeklyVisits >= g.weeklyGoal ? '✅ Meta Semanal!' : '💾 Sincronizar',
          fn: () => {
            g.weeklyReportSubmitted = g.weeklyVisits >= g.weeklyGoal || g.dayOfWeek === 4 || g.weeklyReportSubmitted;
            global.sfx.success();
            g.toast(
              g.weeklyVisits >= g.weeklyGoal
                ? `🎉 Relatório da Semana ${g.weekNumber} sincronizado com meta batida (${g.weeklyVisits}/${g.weeklyGoal})!`
                : `💻 Dados da Microárea 04 sincronizados no e-SUS (${g.weeklyVisits}/${g.weeklyGoal} na semana)!`,
              'success'
            );
            g.saveProgress();
            g.updateHUD();
            g.navigation.resolveObjective();
            g.navigation.updateTrackerUI();
            g.closeOverlays();
          }
        },
        {
          text: 'Abrir Tablet e-SUS completo para revisar prioridades, famílias e horários.',
          tag: '📋 Ver Famílias',
          fn: () => {
            g.closeOverlays();
            g.activeTabletTab = 'families';
            g.toggleTablet(true);
          }
        },
        {
          text: 'Continuar explorando a Sala ESF e o território.',
          tag: '🚶 Voltar',
          fn: () => g.closeOverlays()
        }
      ];

      opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `<span>${opt.text}</span><span class="choice-tag">${opt.tag}</span>`;
        btn.addEventListener('click', opt.fn);
        choicesEl.appendChild(btn);
      });
    }

    getStaffDialogueContent(staff) {
      const g = this.game;
      const dayData = g.getCurrentDayData();
      const dayNum = dayData.day;
      const bonus = g.narrative.evaluateBonusGoal(g.dayIndex);
      const unknownFams = g.families.filter(f => !f.knownSchedule);
      const pendingDengue = g.dengueSpots.filter(s => !s.cleared).length;

      switch (staff.id) {
        case 'vigia':
          return {
            greeting: `“Bom dia, colega! Tudo tranquilo aqui na portaria da UBS Vila Esperança! Só fica de olho nos cachorros lá fora: o Trovão na Rua das Acácias e o Fumaça lá no Sul estavam agitados cedo. Leva biscoito na mochila!”`,
            note: `Portaria & Segurança: Seu Oswaldo conhece o movimento da rua e avisa sobre cães soltos e horários de pico na recepção.`,
            choices: [
              {
                text: 'Perguntar como está o movimento do bairro e se algum morador passou por aqui hoje.',
                tag: '👀 Informações do Bairro',
                reply: `“A Dona Dulce acenou lá da esquina e vi o Seu Tião passando antes das 08h! Se precisar de água fresca ou um tempo do sol forte, a recepção está sempre com ar-condicionado ligado!”`
              },
              {
                text: 'Agradecer o cuidado com a unidade e seguir pela UBS.',
                tag: '🤝 Bom plantão!',
                reply: `“Tamo junto! Qualquer coisa na entrada, é só chamar o Oswaldo!”`
              }
            ]
          };

        case 'escriturario':
          return {
            greeting: `“Fala, ACS! Aqui na recepção o telefone não para! Estou atualizando os cadastros do Cartão SUS e organizando a agenda do Dia ${dayNum} (${dayData.title}). Já temos ${g.families.filter(f => f.knownSchedule).length}/15 horários das famílias anotados no sistema!”`,
            note: `Recepção & Acolhimento: O escriturário integra o agendamento da UBS com a busca ativa que o ACS faz no território.`,
            choices: [
              {
                text: 'Conferir no sistema da recepção quem ainda está com horário desconhecido na Microárea 04.',
                tag: unknownFams.length > 0 ? '🔍 Revela 1 Horário!' : '📋 Agenda Atualizada',
                onPick: () => {
                  if (unknownFams.length > 0) {
                    const pick = unknownFams[0];
                    pick.knownSchedule = true;
                    g.schedulesDiscoveredCount++;
                    g.unreadNotifs++;
                    global.sfx.bondUp();
                    g.toast(`📋 Renan encontrou o horário da ${pick.code} (${pick.name}) no fichário!`, 'success');
                    return `“Achei aqui na ficha de cadastro! Anota aí: ${pick.code} (${pick.name}) costuma estar em casa ${pick.scheduleText}. Já sincronizei no seu Tablet e-SUS!”`;
                  }
                  return `“Uau, você já mapeou todos os 15 horários da Microárea 04! A equipe toda elogiou a organização da sua microárea!”`;
                }
              },
              {
                text: 'Perguntar onde ficam os colegas ACS aqui dentro da UBS.',
                tag: '🚪 Direção da Sala ESF',
                reply: `“Os colegas ACS — Joana, Tiago e Rosana — estão reunidos lá na Sala ESF! É só seguir pelo corredor principal até a porta azul à direita, logo depois da Fisioterapia!”`
              }
            ]
          };

        case 'limpeza':
          return {
            greeting: `“Oi, meu bem! Cuidado que acabei de passar pano com desinfetante aqui no corredor! A UBS limpinha dá outra dignidade pro pessoal da Vila Esperança, né? E você, já bebeu água hoje?”`,
            note: `Higienização & Acolhimento: A equipe de limpeza é parte essencial da ambiência e prevenção de infecções na UBS.`,
            choices: [
              {
                text: 'Elogiar o capricho da unidade e conversar sobre o calor/chuva de hoje na rua.',
                tag: '💚 Reconhecimento • ⚡ +10 Energia',
                onPick: () => {
                  g.player.stamina = Math.min(100, g.player.stamina + 10);
                  global.sfx.bondUp();
                  return `“Obrigada pelo carinho! Pouca gente lembra de dar bom dia pra limpeza. Olha, deixei o bebedouro ali perto da recepção trincando de gelado, e a Rosana passou café fresquinho lá na Sala ESF!”`;
                }
              },
              {
                text: 'Combinar de não pisar no piso molhado e agradecer.',
                tag: '✨ Bom trabalho!',
                reply: `“Isso mesmo! Vai com Deus nas visitas e se cuida nesse sol!”`
              }
            ]
          };

        case 'medico': {
          const tiao = g.families.find(f => f.id === 'H04');
          const neide = g.families.find(f => f.id === 'H05');
          return {
            greeting: `“Olá, colega! Que bom te ver na UBS. Seu olhar no território vale ouro para o meu consultório! Como estão nossos casos de maior risco — especialmente o Seu Tião (${tiao ? tiao.bond : 22}% vínculo) e a Dona Neide (${neide ? neide.bond : 28}% vínculo)?”`,
            note: `Clínica Ampliada (MFC): O Médico de Família depende da visita domiciliar do ACS para adesão terapêutica e busca ativa de sintomáticos respiratórios.`,
            choices: [
              {
                text: 'Discutir estratégia para pacientes hipertensos/diabéticos resistentes e sintomáticos respiratórios.',
                tag: '🩺 Matriciamento Clínico',
                reply: `“Perfeito! Com o Seu Tião e a Dona Neide, nunca bata de frente: use escuta ativa e respeite a cultura alimentar deles. E lembre do Jorge (Casa 06): tosse há mais de 3 semanas pede coleta de escarro (BAAR) imediata!”`
              },
              {
                text: 'Alinhar visitas domiciliares conjuntas para acamados e saúde mental.',
                tag: '📋 Projeto Terapêutico',
                reply: `“Excelente! Anotei na minha agenda para fazermos visita compartilhada ao Vovô Joaquim (Casa 09) e acolhermos o Lucas (Casa 13) sem estigma. Conte comigo!”`
              }
            ]
          };
        }

        case 'enfermeira_marina':
          return {
            greeting: `“Olá, Agente! Semana ${g.weekNumber} (${dayData.name}): ${dayData.title}. Por aqui acompanhamos sua meta semanal (${g.weeklyVisits}/${g.weeklyGoal} visitas) e as prioridades da microárea. Lembre: a UBS fecha às 18h, mas você pode seguir livre pelo bairro à noite!”`,
            note: `Semana ${g.weekNumber}: ${g.weeklyVisits}/${g.weeklyGoal} visitas • Prioridades: ${g.getWeeklyPrioritiesCompletedCount()}/${g.weeklyPriorities.length}`,
            choices: [
              {
                text: 'Reabastecer mochila completa (Água, Protetor, Petiscos) e descansar 15 min no ar-condicionado.',
                intent: '🎒 Reabastecer mochila',
                tag: '💧 100% Água • ⚡ +35 Energia • 🎒 Mochila Cheia',
                directAction: () => {
                  g.player.hydration = 100;
                  g.player.stamina = Math.min(100, g.player.stamina + 35);
                  g.timeMinutes += 15;
                  g.inventory.forEach(i => { i.count = i.maxCount; });
                  g.setPlayerEmote('water', 2.4);
                  staff.emote = 'heart';
                  staff.emoteTimer = 3.0;
                  global.sfx.success();
                  g.toast('🏥 Mochila reabastecida e energias renovadas com a Enfª Marina!', 'success');
                  g.renderHotbar();
                  g.updateHUD();
                  g.navigation.resolveObjective();
                  g.navigation.updateTrackerUI();
                  g.saveProgress();
                  g.closeOverlays();
                }
              },
              {
                text: `Sincronizar produção da Semana ${g.weekNumber} no e-SUS (${g.weeklyVisits}/${g.weeklyGoal} visitas).`,
                intent: '💻 Sincronizar e-SUS',
                tag: g.weeklyVisits >= g.weeklyGoal ? '✅ Meta Semanal!' : '💾 Salvar Produção',
                directAction: () => {
                  g.weeklyReportSubmitted = g.weeklyVisits >= g.weeklyGoal || g.dayOfWeek === 4 || g.weeklyReportSubmitted;
                  global.sfx.success();
                  g.toast(
                    g.weeklyVisits >= g.weeklyGoal
                      ? `🎉 Enfª Marina validou sua Meta Semanal (${g.weeklyVisits}/${g.weeklyGoal})!`
                      : `💻 Produção sincronizada com a Enfª Marina (${g.weeklyVisits}/${g.weeklyGoal} na semana).`,
                    'success'
                  );
                  g.saveProgress();
                  g.updateHUD();
                  g.navigation.resolveObjective();
                  g.navigation.updateTrackerUI();
                  g.closeOverlays();
                }
              },
              {
                text: 'Conversar sobre a equipe e seguir pela UBS.',
                intent: '💬 Continuar na UBS',
                tag: '💬 Continuar na UBS',
                reply: `“Não deixe de passar na Sala ESF lá no final do corredor à direita para conversar com a Joana, o Tiago e a Rosana! Quando o dia terminar, descanse na sua casa na entrada da Vila!”`
              }
            ]
          };

        case 'enfermeiro_carlos':
          return {
            greeting: `“Opa, agente! Estou conferindo a temperatura da câmara fria (+4°C) aqui na Sala de Vacina e Curativos! Estamos com estoque completo de BCG, Gripe, Dupla Adulto (Antitetânica) e Teste do Pezinho.”`,
            note: `Sala de Vacinação & Curativos: Combater desinformação com acolhimento é a maior arma contra a queda na cobertura vacinal.`,
            choices: [
              {
                text: 'Verificar quais moradores da Microárea 04 estão com vacinas ou curativos pendentes.',
                tag: '💉 Busca Ativa Vacinal',
                reply: `“Anota aí: o Pedrinho (Casa 03) precisa do reforço dos 4 anos, o Rodrigo motoboy (Casa 11) está com antitetânica vencida há 12 anos, e o bebê Theo (Casa 15) precisa do Teste do Pezinho e BCG na 1ª semana!”`
              },
              {
                text: 'Pegar dicas para combater boatos de grupo de WhatsApp sobre vacinas.',
                tag: '🛡️ Educação em Saúde',
                reply: `“Nunca ridicularize o medo da mãe ou do idoso! Escute a dúvida, mostre a Caderneta com calma e explique que reação leve é sinal do corpo aprendendo a se defender. Funciona demais!”`
              }
            ]
          };

        case 'fisioterapeuta':
          return {
            greeting: `“Oi, colega! Bem-vindo(a) à Sala de Fisioterapia da equipe eMulti! Agente Comunitário caminha quilômetros por dia debaixo de sol — como estão sua coluna e seus joelhos hoje?”`,
            note: `Equipe Multiprofissional (eMulti): Prevenção de dor lombar, grupo de caminhada, reabilitação pós-AVC e ergonomia do trabalhador.`,
            choices: [
              {
                text: this.stretchUsedToday
                  ? 'Conversar sobre reabilitação domiciliar dos moradores da Microárea 04.'
                  : 'Fazer 5 minutos de alongamento guiado para coluna e pernas com a Dra. Patrícia!',
                tag: this.stretchUsedToday ? '🤸 Casos Clínicos' : '🧘 +30 Energia • Alongamento!',
                onPick: () => {
                  if (!this.stretchUsedToday) {
                    this.stretchUsedToday = true;
                    g.player.stamina = Math.min(100, g.player.stamina + 30);
                    g.timeMinutes += 5;
                    g.setPlayerEmote('heart', 2.6);
                    global.sfx.success();
                    g.toast('🧘 Alongamento com a Dra. Patrícia! (+30 Energia)', 'success');
                    return `“Isso! Respira fundo, solta os ombros e alonga a panturrilha! Você já está renovado(a) para a Estrada do Sol! E avise o Marcos (Casa 02) e o Seu Raimundo (Casa 07) que o grupo de coluna e caminhada está esperando por eles!”`;
                  }
                  return `“Lembre da Dona Helena e do Vovô Joaquim (Casa 09): a mudança de decúbito a cada 2h e exercícios passivos no leito evitam rigidez e feridas. Sempre que precisar, agendamos visita conjunta!”`;
                }
              },
              {
                text: 'Agradecer as orientações e continuar pela UBS.',
                tag: '👍 Valeu, Dra. Patrícia!',
                reply: `“Cuide dessa postura com a mochila bem ajustada nos dois ombros! Bom trabalho na microárea!”`
              }
            ]
          };

        case 'acs_joana':
          return {
            greeting: `“Chega mais na nossa Sala ESF, colega! Estava aqui olhando o mapa territorial das nossas microáreas. São 12 anos vestindo esse colete azul e posso te garantir: vínculo se constrói na escuta, não na pressa!”`,
            note: `Sala ESF • Microárea 01: A ACS Joana é referência da equipe e conhece os segredos de mapeamento territorial.`,
            choices: [
              {
                text: 'Trocar informações no Mapa Territorial sobre horários de famílias ainda desconhecidas.',
                tag: unknownFams.length > 0 ? '🗺️ Dica de Horário!' : '⭐ Território Mapeado',
                onPick: () => {
                  if (unknownFams.length > 0) {
                    const target = unknownFams[unknownFams.length - 1];
                    target.knownSchedule = true;
                    g.schedulesDiscoveredCount++;
                    g.unreadNotifs++;
                    global.sfx.bondUp();
                    g.toast(`🗺️ ACS Joana compartilhou o horário da ${target.code} no Mapa ESF!`, 'success');
                    return `“Olha aqui no mapa! Um parente da ${target.code} (${target.name}) mora na minha microárea e me contou: eles ficam em casa ${target.scheduleText}. Já marquei no seu Tablet!”`;
                  }
                  return `“Você já descobriu todos os 15 horários da Microárea 04! Orgulho da nossa equipe ESF! Agora é caprichar no vínculo com os moradores mais teimosos.”`;
                }
              },
              {
                text: 'Pedir um conselho de veterana para conquistar moradores desconfiados.',
                tag: '💛 Sabedoria ACS',
                reply: `“Quando alguém fecha a cara no portão, respire fundo e pergunte da vida, da horta, da família... Primeiro a gente entra no coração da pessoa, só depois o assunto saúde entra pela porta!”`
              }
            ]
          };

        case 'acs_tiago':
          return {
            greeting: `“E aí, parceiro(a) de microárea! Já sincronizei minhas fichas da Microárea 02 aqui no computador do e-SUS! Na sua área ainda tem ${pendingDengue} foco(s) de dengue para vistoriar e você está com ${g.dailyVisits}/${g.dailyGoal} visitas hoje.”`,
            note: `Sala ESF • Microárea 02: O ACS Tiago acompanha vigilância ambiental (Aedes aegypti) e produtividade no e-SUS.`,
            choices: [
              {
                text: 'Revisar o panorama de Dengue e o clima de hoje com o Tiago.',
                tag: '🦟 Vigilância & Clima',
                reply: pendingDengue > 0
                  ? `“Ainda restam ${pendingDengue} focos de Aedes aegypti nos quintais da Microárea 04! Fique de olho nos pontos amarelos do minimapa — cada foco eliminado ganha a confiança da vizinhança!”`
                  : `“Mandou bem demais!! Todos os 4 focos de dengue da Microárea 04 já foram eliminados! O pessoal da vigilância vai comemorar!”`
              },
              {
                text: 'Perguntar sobre o Armário de Insumos e o Terminal e-SUS aqui na sala.',
                tag: '🎒 Infraestrutura ESF',
                reply: `“Aqui na Sala ESF tem tudo na mão: no canto esquerdo você sincroniza o e-SUS e fecha o turno quando bater a meta; no armário azul à direita você reabastece água, protetor solar e petiscos caninos!”`
              }
            ]
          };

        case 'acs_rosana':
        default:
          return {
            greeting: `“Entra, colega! Acabei de passar um cafezinho fresco aqui na mesa da Sala ESF! Nossa profissão é linda, mas a gente também precisa cuidar de quem cuida, né?”`,
            note: `Sala ESF • Microárea 03: A ACS Rosana articula grupos comunitários, puericultura e acolhimento da própria equipe.`,
            choices: [
              {
                text: this.coffeeUsedToday
                  ? 'Conversar sobre as famílias prioritárias (gestante, bebê, acamado e saúde mental).'
                  : 'Tomar um café fresquinho com água na mesa da Sala ESF com a equipe!',
                tag: this.coffeeUsedToday ? '💜 Cuidado Prioritário' : '☕ +25 Energia • 💧 +20 Água',
                onPick: () => {
                  if (!this.coffeeUsedToday) {
                    this.coffeeUsedToday = true;
                    g.player.stamina = Math.min(100, g.player.stamina + 25);
                    g.player.hydration = Math.min(100, g.player.hydration + 20);
                    g.setPlayerEmote('heart', 2.4);
                    global.sfx.success();
                    g.toast('☕ Café fresquinho na Sala ESF com a ACS Rosana! (+25 Energia, +20% Água)', 'success');
                    return `“Toma quentinho com um copo d'água do lado! Conversar cinco minutos com os colegas aqui na Sala ESF recarrega a alma da gente, né?”`;
                  }
                  return `“Dá uma atenção especial pra Bia (Casa 08), pra Dona Helena que cuida do pai sozinha (Casa 09), pro Lucas (Casa 13) e pro recém-nascido Theo (Casa 15). O olhar do ACS transforma a vida deles!”`;
                }
              },
              {
                text: 'Despedir-se dos colegas e voltar ao trabalho.',
                tag: '🤝 Até já, equipe!',
                reply: `“Boa rota, colega! Qualquer dificuldade no território, a Sala ESF é o nosso porto seguro!”`
              }
            ]
          };
      }
    }

    openStaffDialogue(staff) {
      const g = this.game;
      this.talkedToday.add(staff.id);
      if (g.events) {
        g.events.emit('npc:talked', { npcId: staff.id, roleKey: staff.roleKey, scene: staff.room });
      }

      const graph = g.dialogueResolver
        ? g.dialogueResolver.resolveStaffGraph(staff, (s) => this.getStaffDialogueContent(s))
        : (g.dialogue ? g.dialogue.getPilotGraph(staff.id) : null) || g.dialogue.adaptLegacyDialogue(this.getStaffDialogueContent(staff));

      const bondPct = g.storyState ? g.storyState.getNpcBond(staff.id) : 100;
      const bondText = g.storyState
        ? `${bondPct}% (${g.storyState.getBondLabel(bondPct)})`
        : 'Equipe Multiprofissional';

      g.dialogue.startGraph({
        entityType: 'STAFF',
        entityData: staff,
        entityId: staff.id,
        tag: staff.sector,
        name: `${staff.name} • ${staff.role}`,
        badgesHtml: `<span class="badge ${staff.badgeClass}">${staff.role}</span><span class="badge">🏥 Equipe UBS</span>`,
        bondPct,
        bondText,
        graph,
        onFinish: (choice) => {
          if (choice.staminaDelta) {
            g.player.stamina = Math.min(100, g.player.stamina + choice.staminaDelta);
          }
          if (choice.flag) {
            if (g.narrative) g.narrative.flags[choice.flag] = true;
            if (g.storyState) g.storyState.setFlag(choice.flag, true);
          }
          let replyText = choice.reply;
          if (choice.revealOneUnknown) {
            const unknownFams = g.families.filter(f => !f.knownSchedule);
            if (unknownFams.length > 0) {
              const target = unknownFams[unknownFams.length - 1];
              target.knownSchedule = true;
              g.schedulesDiscoveredCount++;
              g.unreadNotifs++;
              global.sfx.bondUp();
              g.toast(`🗺️ ${staff.name} compartilhou o horário da ${target.code} (${target.name})!`, 'success');
              replyText = `“Anota aí: ${target.code} (${target.name}) costuma estar em casa ${target.scheduleText}. Já marquei no seu Tablet!”`;
            }
          }
          staff.emote = 'heart';
          staff.emoteTimer = 3.0;
          g.setDialogueText(replyText);
          g.renderHotbar();
          g.updateHUD();
          g.navigation.resolveObjective();
          g.navigation.updateTrackerUI();
          g.navigation.drawMinimap();
          g.saveProgress();

          const choicesEl = document.getElementById('dlg-choices');
          choicesEl.innerHTML = '';
          const btnClose = document.createElement('button');
          btnClose.className = 'choice-btn';
          btnClose.innerHTML = '<span>Agradecer e continuar na UBS.</span><span class="choice-tag">Prosseguir</span>';
          btnClose.addEventListener('click', () => g.closeOverlays());
          choicesEl.appendChild(btnClose);
        }
      });
    }

    // ========================================================================
    // 7. Y-SORTED INTERIOR RENDERING & INDOOR MINIMAP
    // ========================================================================
    draw(ctx) {
      const g = this.game;
      const loc = g.currentLocation;
      const room = this.rooms[loc];
      const roomCanvas = this.roomCanvases[loc];
      if (!room || !roomCanvas) return;

      // Cozy dark wood-ink backdrop outside the interior walls
      ctx.fillStyle = '#1f1610';
      ctx.fillRect(0, 0, g.canvas.width, g.canvas.height);

      const camX = Math.round(g.camera.x);
      const camY = Math.round(g.camera.y);

      ctx.save();
      ctx.translate(-camX, -camY);

      // 1. Pre-baked Room Floor, Walls, Doors & Posters
      ctx.drawImage(roomCanvas, 0, 0);

      // 2. Unified Y-Sorting Queue (Furniture + Staff + Player)
      const renderList = [];
      const pa = global.pixelArt;

      // Furniture props
      for (const f of (this.furniture[loc] || [])) {
        const spr = pa.interior[f.sprite];
        if (!spr) continue;
        renderList.push({
          sortY: f.y,
          draw: () => {
            ctx.drawImage(spr, Math.round(f.x - spr.width / 2), Math.round(f.y - spr.height + 10));
          }
        });
      }

      // Healthcare Professionals & ACS Colleagues
      for (const s of this.getStaffInRoom(loc)) {
        const frames = pa.getStaffSprite(s.id, s.appearance);
        renderList.push({
          sortY: s.y,
          draw: () => {
            const waveFrame = (global.ACSEngine.safeMod(g.elapsedTime * 1.4 + s.x, 5) === 0) ? 1 : 0;
            ctx.drawImage(frames[waveFrame], Math.round(s.x - 16), Math.round(s.y - 42));

            // Crisp floating role nameplate below/above staff so player immediately recognizes every professional!
            this.drawStaffTag(ctx, s);

            // Floating emote bubble
            const emoteKey = (s.emoteTimer > 0 && s.emote)
              ? s.emote
              : (this.talkedToday.has(s.id) ? 'check' : s.emoteDefault);
            if (emoteKey && pa.emotes[emoteKey]) {
              const floatY = Math.sin(g.elapsedTime * 3.5 + s.x) * 2.5;
              ctx.drawImage(pa.emotes[emoteKey], Math.round(s.x - 16), Math.round(s.y - 80 + floatY));
            }
          }
        });
      }

      // Dona Carla (Mon/Fri weekly visitor or story staging) & waiting room residents inside UBS_INTERIOR
      const carlaForced = g.storyEvents && g.storyEvents.isNpcForcedInScene('UBS_INTERIOR', 'npc_dona_carla');
      if (loc === 'UBS_INTERIOR' && g.communitySpaces && (g.communitySpaces.isDonaCarlaAtUBS() || carlaForced)) {
        const dc = g.communitySpaces.npcs.npc_dona_carla;
        const frames = pa.getStaffSprite(dc.id, dc.appearance);
        g.communitySpaces._pushNpcDraw(renderList, dc, frames);
      }
      if (loc === 'UBS_INTERIOR' && g.schedule) {
        for (const { fam, loc: floc } of g.schedule.getFamiliesInScene('UBS_INTERIOR')) {
          const frames = pa.npcSprites[fam.id];
          if (frames && g.communitySpaces) {
            g.communitySpaces._pushNpcDraw(renderList, {
              id: fam.id,
              name: fam.name.split(' ')[0],
              role: fam.code,
              x: floc.x,
              y: floc.y,
              emote: fam.emote,
              emoteTimer: fam.emoteTimer
            }, frames);
          }
        }
      }

      // ACS Player inside UBS / Sala ESF
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

          if (g.player.emoteTimer > 0 && g.player.emote && pa.emotes[g.player.emote]) {
            const fy = Math.sin(g.elapsedTime * 6) * 2;
            ctx.drawImage(pa.emotes[g.player.emote], px - 16, Math.round(py - 76 + fy));
          }
        }
      });

      renderList.sort((a, b) => a.sortY - b.sortY);
      for (const item of renderList) item.draw();

      // Dynamic UBS Mural state & Clue Markers [?] (Etapa H3)
      if (loc === 'UBS_INTERIOR' && g.worldState) {
        const muralState = g.worldState.getUBSMural();
        if (muralState !== 'default') {
          ctx.fillStyle = muralState === 'acolhimento' ? '#16a34a' : '#0284c7';
          ctx.fillRect(Math.round(10.6 * T), Math.round(13.2 * T), 42, 8);
        }
      }
      if (g.worldState) {
        g.worldState.drawWorldClueMarkers(ctx, loc);
      }

      // 3. Click-to-walk & Compass overlay
      g.navigation.drawWorldOverlay(ctx);

      // 4. Interaction prompt bubble
      if (g.nearTarget && !g.paused) {
        g.drawWorldPrompt(ctx, g.nearTarget.x, g.nearTarget.y, g.nearTarget.label);
      }

      ctx.restore();

      // 5. Soft warm indoor lighting gradient + edge vignette + smooth transition fade
      const W = g.canvas.width;
      const H = g.canvas.height;
      const indoorGrad = ctx.createLinearGradient(0, 0, W, H);
      if (loc === 'ESF_ROOM') {
        indoorGrad.addColorStop(0, 'rgba(255, 228, 168, 0.10)');
        indoorGrad.addColorStop(1, 'rgba(42, 26, 16, 0.06)');
      } else {
        indoorGrad.addColorStop(0, 'rgba(255, 248, 225, 0.06)');
        indoorGrad.addColorStop(1, 'rgba(30, 41, 59, 0.05)');
      }
      ctx.fillStyle = indoorGrad;
      ctx.fillRect(0, 0, W, H);

      const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.35, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
      vig.addColorStop(0, 'rgba(24, 16, 10, 0)');
      vig.addColorStop(1, 'rgba(24, 16, 10, 0.14)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      if (this.transitionAlpha > 0) {
        ctx.fillStyle = `rgba(20, 15, 10, ${this.transitionAlpha})`;
        ctx.fillRect(0, 0, g.canvas.width, g.canvas.height);
      }
    }

    drawStaffTag(ctx, staff) {
      const shortRole = staff.role.replace(/\s*\(.*?\)/g, '');
      const label = `${staff.name} • ${shortRole}`;
      ctx.font = 'bold 10px Trebuchet MS';
      const w = ctx.measureText(label).width + 12;
      const bx = Math.round(staff.x - w / 2);
      const by = Math.round(staff.y + 5);

      ctx.fillStyle = 'rgba(41, 29, 20, 0.85)';
      ctx.fillRect(bx - 1, by - 1, w + 2, 16);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(bx, by, w, 14);
      ctx.fillStyle = '#382213';
      ctx.fillText(label, bx + 6, by + 10);
    }

    drawInteriorMinimap(ctx, W, H) {
      const g = this.game;
      const loc = g.currentLocation;
      const room = this.rooms[loc];
      const roomCanvas = this.roomCanvases[loc];
      if (!room || !roomCanvas) return;

      ctx.fillStyle = '#1f1610';
      ctx.fillRect(0, 0, W, H);

      const scale = Math.min(W / room.width, H / room.height);
      const dw = Math.round(room.width * scale);
      const dh = Math.round(room.height * scale);
      const ox = Math.round((W - dw) / 2);
      const oy = Math.round((H - dh) / 2);

      ctx.drawImage(roomCanvas, ox, oy, dw, dh);

      // Draw doors on indoor minimap
      for (const d of (this.doors[loc] || [])) {
        ctx.fillStyle = d.id === 'door_esf' ? '#f59e0b' : '#38bdf8';
        ctx.fillRect(Math.round(ox + d.x * scale) - 4, Math.round(oy + d.y * scale) - 3, 8, 6);
      }

      // Draw staff dots
      for (const s of this.getStaffInRoom(loc)) {
        ctx.fillStyle = s.roleKey === 'acs' ? '#0284c7' : '#16a34a';
        ctx.fillRect(Math.round(ox + s.x * scale) - 2, Math.round(oy + s.y * scale) - 2, 5, 5);
      }

      // Player dot
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
        talkedToday: Array.from(this.talkedToday),
        stretchUsedToday: this.stretchUsedToday,
        coffeeUsedToday: this.coffeeUsedToday
      };
    }

    importState(data) {
      if (!data) return;
      this.talkedToday = new Set(Array.isArray(data.talkedToday) ? data.talkedToday : []);
      this.stretchUsedToday = !!data.stretchUsedToday;
      this.coffeeUsedToday = !!data.coffeeUsedToday;
    }
  }

  global.UBSInteriorSystem = UBSInteriorSystem;
})(window);

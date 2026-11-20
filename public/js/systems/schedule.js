// ============================================================================
// TERRITÓRIO VIVO — WEEKLY ROUTINES & DYNAMIC SCHEDULES (Phase 2)
// ============================================================================
// Resolves where each family/special NPC is located at any (dayOfWeek, hourFloat)
// across the expanded Vila Esperança (HOME, PRACA_FEIRA, PRACA_DOMINO,
// VENDINHA, UBS_ESPERA, ASSOCIACAO, AWAY) without duplicating sprites.

(function (global) {
  'use strict';

  const T = 32;

  // Deterministic spot positions per shared community location
  const SPOT_COORDS = {
    PRACA_FEIRA: {
      H14: { x: 39 * T, y: 46.5 * T, label: '🛍️ Na Feira (Pracinha)' },
      H05: { x: 44 * T, y: 46.5 * T, label: '🛍️ Na Feira (Pracinha)' },
      H01: { x: 41.5 * T, y: 48.2 * T, label: '🛍️ Na Feira (Pracinha)' },
      H03: { x: 46.5 * T, y: 48.2 * T, label: '🛍️ Na Feira (Pracinha)' }
    },
    PRACA_DOMINO: {
      H04: { x: 40.2 * T, y: 48.2 * T, label: '♟️ Jogando Dominó (Pracinha)' },
      H07: { x: 42.0 * T, y: 48.2 * T, label: '♟️ Na Roda da Pracinha' },
      H11: { x: 46.2 * T, y: 48.2 * T, label: '♟️ Na Pracinha dos Ipês' },
      H13: { x: 48.0 * T, y: 48.2 * T, label: '♟️ Na Pracinha dos Ipês' }
    },
    VENDINHA: {
      H02: { x: 5.5 * T, y: 8.5 * T, label: '🏪 Na Vendinha do Zé' },
      H06: { x: 12.5 * T, y: 7.4 * T, label: '🏪 Na Vendinha do Zé' },
      H11: { x: 5.5 * T, y: 8.5 * T, label: '🏪 Na Vendinha do Zé' },
      H10: { x: 12.5 * T, y: 7.4 * T, label: '🏪 Na Vendinha do Zé' }
    },
    UBS_ESPERA: {
      H12: { x: 24.5 * T, y: 17.0 * T, label: '🏥 Na Sala de Espera (UBS)' },
      H08: { x: 29.2 * T, y: 17.0 * T, label: '🏥 Na Sala de Espera (UBS)' }
    },
    ASSOCIACAO: {
      H07: { x: 6.2 * T, y: 7.6 * T, label: '🏛️ Na Reunião da Associação' },
      H01: { x: 11.8 * T, y: 7.6 * T, label: '🏛️ Na Reunião da Associação' }
    }
  };

  class ScheduleSystem {
    constructor(game) {
      this.game = game;
      this.informalTalkedToday = new Set();
    }

    resetDaily() {
      this.informalTalkedToday.clear();
    }

    // Returns { type, scene, x, y, label } for a family at current (dayOfWeek, hourFloat)
    getFamilyLocation(fam, dayOfWeek = null, hourFloat = null) {
      const g = this.game;
      const dow = dayOfWeek !== null ? dayOfWeek : g.dayOfWeek;
      const hr = hourFloat !== null ? hourFloat : (g.timeMinutes / 60);

      // 1. Tuesday Morning/Early Afternoon (dayOfWeek === 1, 07:30..14:00): Feira Livre na Pracinha
      if (dow === 1 && hr >= 7.5 && hr <= 14.0) {
        if (['H14', 'H05', 'H01', 'H03'].includes(fam.id)) {
          const spot = SPOT_COORDS.PRACA_FEIRA[fam.id];
          return { type: 'PRACA_FEIRA', scene: 'OVERWORLD', x: spot.x, y: spot.y, label: spot.label };
        }
      }

      // 2. Wednesday Afternoon (dayOfWeek === 2, 14:00..18:30): Reunião na Associação de Moradores
      if (dow === 2 && hr >= 14.0 && hr <= 18.5) {
        if (['H07', 'H01'].includes(fam.id)) {
          const spot = SPOT_COORDS.ASSOCIACAO[fam.id];
          return { type: 'ASSOCIACAO', scene: 'ASSOCIACAO', x: spot.x, y: spot.y, label: spot.label };
        }
      }

      // 3. Mon/Wed Morning (08:30..11:30): Sala de Espera da UBS
      if (dow === 0 && hr >= 8.5 && hr <= 11.5 && fam.id === 'H12') {
        const spot = SPOT_COORDS.UBS_ESPERA.H12;
        return { type: 'UBS_ESPERA', scene: 'UBS_INTERIOR', x: spot.x, y: spot.y, label: spot.label };
      }
      if (dow === 2 && hr >= 8.5 && hr <= 11.5 && fam.id === 'H08') {
        const spot = SPOT_COORDS.UBS_ESPERA.H08;
        return { type: 'UBS_ESPERA', scene: 'UBS_INTERIOR', x: spot.x, y: spot.y, label: spot.label };
      }

      // 4. Thursday (15:00..21:00) & Saturday (14:00..20:00): Roda de Dominó na Pracinha
      if ((dow === 3 && hr >= 15.0 && hr <= 21.0) || (dow === 5 && hr >= 14.0 && hr <= 20.0)) {
        if (['H04', 'H07', 'H11', 'H13'].includes(fam.id)) {
          const spot = SPOT_COORDS.PRACA_DOMINO[fam.id];
          return { type: 'PRACA_DOMINO', scene: 'OVERWORLD', x: spot.x, y: spot.y, label: spot.label };
        }
      }

      // 5. Early Evening Rotation at Vendinha do Zé (18:30..21:00)
      if (hr >= 18.5 && hr <= 21.0) {
        if ((dow === 0 || dow === 2) && fam.id === 'H02') {
          const spot = SPOT_COORDS.VENDINHA.H02;
          return { type: 'VENDINHA', scene: 'VENDINHA', x: spot.x, y: spot.y, label: spot.label };
        }
        if ((dow === 1 || dow === 3) && fam.id === 'H06') {
          const spot = SPOT_COORDS.VENDINHA.H06;
          return { type: 'VENDINHA', scene: 'VENDINHA', x: spot.x, y: spot.y, label: spot.label };
        }
        if ((dow === 4 || dow === 5) && fam.id === 'H11') {
          const spot = SPOT_COORDS.VENDINHA.H11;
          return { type: 'VENDINHA', scene: 'VENDINHA', x: spot.x, y: spot.y, label: spot.label };
        }
        if ((dow === 1 || dow === 4) && fam.id === 'H10') {
          const spot = SPOT_COORDS.VENDINHA.H10;
          return { type: 'VENDINHA', scene: 'VENDINHA', x: spot.x, y: spot.y, label: spot.label };
        }
      }

      // 6. Default: Check home schedule
      const inHomeSchedule = fam.schedule.some(([start, end]) => hr >= start && hr <= end);
      if (inHomeSchedule) {
        return { type: 'HOME', scene: 'OVERWORLD', x: fam.x, y: fam.y, label: '🟢 Em Casa' };
      }

      return { type: 'AWAY', scene: null, x: fam.x, y: fam.y, label: '🔴 Ausente' };
    }

    isFamilyAtHome(fam) {
      return this.getFamilyLocation(fam).type === 'HOME';
    }

    isFeiraActive() {
      const hr = this.game.timeMinutes / 60;
      return this.game.dayOfWeek === 1 && hr >= 7.5 && hr <= 14.0;
    }

    isDominoGatheringActive() {
      const hr = this.game.timeMinutes / 60;
      const dow = this.game.dayOfWeek;
      return (dow === 3 && hr >= 15.0 && hr <= 21.0) || (dow === 5 && hr >= 14.0 && hr <= 20.0);
    }

    // Returns families currently present inside a given scene ('OVERWORLD' | 'VENDINHA' | 'UBS_INTERIOR' | 'ASSOCIACAO')
    getFamiliesInScene(sceneId) {
      const list = [];
      for (const fam of this.game.families) {
        const loc = this.getFamilyLocation(fam);
        if (loc.scene === sceneId && loc.type !== 'HOME' && loc.type !== 'AWAY') {
          list.push({ fam, loc });
        }
      }
      return list;
    }

    getSocialDialogue(fam, loc) {
      const alreadyTalked = this.informalTalkedToday.has(fam.id);
      const contextMap = {
        PRACA_FEIRA: {
          greeting: `“Ô, agente! Que bom te encontrar aqui na Feira da Pracinha! Cheiro de tempero verde e fruta fresca dá outro ânimo pro bairro, né?”`,
          note: 'Encontro informal na Feira de Terça — conversa leve aproxima sem parecer cobrança clínica.',
          reply: alreadyTalked
            ? '“Aproveita a feira antes que o sol aperte! Depois passa lá em casa no meu horário.”'
            : '“Adoro quando o pessoal do postinho circula aqui com a gente fora do consultório! Até mais!”'
        },
        PRACA_DOMINO: {
          greeting: `“Chega mais na roda da Pracinha! Hoje o papo aqui é dominó, risada e notícia da Vila Esperança!”`,
          note: 'Convivência na Pracinha (Quinta/Sábado) — moradores costumam baixar a guarda.',
          reply: alreadyTalked
            ? '“Senta num banco aí pra descansar um pouco também!”'
            : '“Aqui na praça a gente conversa sem pressa! Obrigado por se importar com a gente.”'
        },
        VENDINHA: {
          greeting: `“E aí! Passei aqui na Vendinha do Seu Zé pegar um pão quente depois da correria do dia. Tudo tranquilo na microárea?”`,
          note: 'Encontro noturno na Vendinha — ótimo ponto para encontrar trabalhadores.',
          reply: alreadyTalked
            ? '“O pão do Seu Zé acabou de sair! Boa noite por aí!”'
            : '“Bom te ver circulando à noite também, agente! Se precisar me visitar em casa, já sabe meu horário.”'
        },
        UBS_ESPERA: {
          greeting: `“Oi! Vim cedo aqui na UBS acompanhar minha consulta e conversar com o pessoal na espera. Que bom ver você por aqui também!”`,
          note: 'Sala de espera da UBS — acolhimento fortalece a ponte entre comunidade e equipe.',
          reply: alreadyTalked
            ? '“Já já o médico ou a enfermeira me chama. Obrigada pela atenção!”'
            : '“Fico muito mais tranquila quando encontro alguém conhecido aqui dentro da UBS!”'
        },
        ASSOCIACAO: {
          greeting: `“Olha quem veio pra reunião na Associação! A Tia Bete tá organizando as pautas da Vila Esperança com todo mundo.”`,
          note: 'Reunião Comunitária de Quarta — participação social e escuta coletiva.',
          reply: alreadyTalked
            ? '“Vamos juntos fortalecer a nossa comunidade!”'
            : '“Quando a UBS e a Associação caminham juntas, o bairro inteiro ganha força!”'
        }
      };

      const tpl = contextMap[loc.type] || contextMap.PRACA_DOMINO;
      return {
        greeting: tpl.greeting,
        note: tpl.note,
        choices: [
          {
            text: alreadyTalked
              ? 'Dar um aceno amigo e continuar a caminhada.'
              : 'Conversar sobre a semana, ouvir novidades do bairro e fortalecer a amizade.',
            intent: '💬 Prosa comunitária',
            hintTag: alreadyTalked ? '💬 Conversa leve' : '🤝 Vínculo +5 (Social)',
            type: 'EMPATHY',
            bondDelta: alreadyTalked ? 0 : 5,
            reply: tpl.reply
          }
        ]
      };
    }

    openInformalEncounter(fam, loc) {
      const g = this.game;
      const graph = g.dialogueResolver
        ? g.dialogueResolver.resolveInformalEncounterGraph(fam, loc, (f, l) => this.getSocialDialogue(f, l))
        : g.dialogue.adaptLegacyDialogue(this.getSocialDialogue(fam, loc));
      const bondLabel = fam.bond >= 80 ? 'Vínculo Forte' : fam.bond >= 55 ? 'Confiante' : fam.bond >= 35 ? 'Em Construção' : 'Desconfiado';

      g.dialogue.startGraph({
        entityType: 'FAMILY',
        entityData: fam,
        entityId: fam.id,
        tag: `${fam.code} • ${loc.label}`,
        name: fam.name,
        badgesHtml: `<span class="badge amigo">💬 Encontro Social</span><span class="badge">${loc.label}</span>`,
        bondPct: fam.bond,
        bondText: `${fam.bond}% (${bondLabel})`,
        graph,
        onFinish: (choice) => {
          if (!this.informalTalkedToday.has(fam.id)) {
            this.informalTalkedToday.add(fam.id);
            fam.bond = Math.min(100, fam.bond + (choice.bondDelta || 5));
            fam.emote = 'heart';
            fam.emoteTimer = 2.6;
            global.sfx.bondUp();
          }
          if (!fam.knownSchedule) {
            fam.knownSchedule = true;
            g.schedulesDiscoveredCount++;
          }
          g.setDialogueText(choice.reply);
          g.updateHUD();
          g.navigation.resolveObjective();
          g.navigation.updateTrackerUI();
          g.saveProgress();

          const choicesEl = document.getElementById('dlg-choices');
          choicesEl.innerHTML = '';
          const btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.innerHTML = '<span>Despedir-se e seguir pelo bairro.</span><span class="choice-tag">Prosseguir</span>';
          btn.addEventListener('click', () => g.closeOverlays());
          choicesEl.appendChild(btn);
        }
      });
    }

    exportState() {
      return {
        informalTalkedToday: Array.from(this.informalTalkedToday)
      };
    }

    importState(data) {
      if (!data) return;
      this.informalTalkedToday = new Set(Array.isArray(data.informalTalkedToday) ? data.informalTalkedToday : []);
    }
  }

  global.ScheduleSystem = ScheduleSystem;
})(window);

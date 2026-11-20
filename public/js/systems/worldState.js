// ============================================================================
// TERRITÓRIO VIVO — WORLD STATE & ENVIRONMENTAL EXPLORATION SYSTEM (Etapa H3)
// ============================================================================
// Gerencia:
//   1. Estados visuais mutáveis do bairro (hortaStage 0..3, ubsMural, pracinhaStatus)
//   2. Hotspots investigáveis (WORLD_CLUES) no Overworld e Interiores
//   3. Eventos 'clue:inspected' e 'world:stateChanged' para QuestSystem/DialogueResolver

(function (global) {
  'use strict';

  const T = 32;

  const WORLD_CLUES = [
    {
      id: 'clue_mural_ubs',
      scene: 'UBS_INTERIOR',
      x: 11.2 * T,
      y: 13.8 * T,
      radius: 56,
      prompt: '[E] Ler Circular da Secretaria no Mural',
      title: 'Mural Interno da Recepção (UBS)',
      text: 'Entre escalas antigas e avisos de vacinação, há uma circular recente da Diretoria Regional: a Microárea 04 terá revisão de equipe se não comprovar busca ativa real e integração com a comunidade neste ciclo.',
      note: 'Pista Institucional • Explica a pressa de Dona Carla e a pressão sobre Dr. Henrique e Renan.',
      flag: 'clue_mural_ubs_lida',
      postureDelta: { burocracia: 1 }
    },
    {
      id: 'clue_baixada_entulho',
      scene: 'OVERWORLD',
      x: 62.5 * T,
      y: 43.2 * T,
      radius: 58,
      prompt: '[E] Investigar Acúmulo na Baixada',
      title: 'Esquina da Baixada (Próximo à Rua dos Ipês)',
      text: 'Sacos rasgados e restos de cano entupido acumulam água limpa da chuva bem onde termina o asfalto. Moradores da Rua dos Ipês já reclamaram duas vezes da coleta irregular nessa curva.',
      note: 'Pista Territorial • O problema não é só "descuido individual" — há um gargalo de drenagem e coleta.',
      flag: 'clue_baixada_entulho_lida',
      postureDelta: { articulacao: 1 }
    },
    {
      id: 'clue_horta_bomba',
      scene: 'OVERWORLD',
      x: 69.5 * T,
      y: 47.5 * T,
      radius: 66,
      prompt: '[E] Inspecionar Torneira e Canteiros da Horta',
      title: 'Terreno da Horta Comunitária',
      text: 'Os 10 canteiros estão marcados com estacas de madeira antiga e uma mangueira rachada perto da torneira comunitária. Falta apenas mão de obra coletiva e um conserto simples de registro para o espaço voltar a produzir.',
      note: 'Pista Comunitária • A Associação e o pessoal do Dominó podem reativar este terreno juntos.',
      flag: 'clue_horta_bomba_lida',
      postureDelta: { articulacao: 1 }
    },
    {
      id: 'clue_pracinha_banco',
      scene: 'OVERWORLD',
      x: 44.0 * T,
      y: 49.8 * T,
      radius: 62,
      prompt: '[E] Ler Cartaz Desbotado na Pracinha',
      title: 'Coreto & Bancos da Pracinha dos Ipês',
      text: 'Um cartaz desbotado anuncia "Mutirão Cultural — Sábado" com data do ano passado, ao lado de recados a giz deixados por jovens do bairro pedindo luz no poste e espaço para oficina e convivência.',
      note: 'Pista de Convivência • A praça é o coração onde idosos do dominó, feirantes e jovens se encontram.',
      flag: 'clue_pracinha_banco_lida',
      postureDelta: { acolhimento: 1 }
    },
    {
      id: 'clue_caderno_vendinha',
      scene: 'VENDINHA',
      x: 12.2 * T,
      y: 5.5 * T,
      radius: 58,
      prompt: '[E] Olhar Recados Pendurados na Vendinha',
      title: 'Prateleira & Recados da Vendinha do Zé',
      text: 'Vários papéis presos com elástico trazem horários de ônibus alterados e pedidos de vizinhos que voltam depois das 19h procurando saber como pegar receita contínua sem perder o dia na fábrica.',
      note: 'Pista Social • Trabalhadores noturnos da Microárea precisam de canal alternativo de acesso.',
      flag: 'clue_caderno_vendinha_lida',
      postureDelta: { acolhimento: 1 }
    }
  ];

  class WorldStateSystem {
    constructor(game) {
      this.game = game;
    }

    _getStates() {
      const story = this.game.storyState;
      if (!story) return { hortaStage: 0, ubsMural: 'default', pracinhaStatus: 'default', cluesFound: [] };
      if (!story.worldStates) {
        story.worldStates = { hortaStage: 0, ubsMural: 'default', pracinhaStatus: 'default', cluesFound: [] };
      }
      if (!Array.isArray(story.worldStates.cluesFound)) {
        story.worldStates.cluesFound = [];
      }
      return story.worldStates;
    }

    getHortaStage() {
      return Number(this._getStates().hortaStage) || 0;
    }

    setHortaStage(stage, reason = '') {
      const ws = this._getStates();
      const clamped = global.ACSEngine.clamp(Number(stage) || 0, 0, 3);
      if (clamped !== ws.hortaStage) {
        ws.hortaStage = clamped;
        if (this.game.events) {
          this.game.events.emit('world:stateChanged', { key: 'hortaStage', value: clamped, reason });
        }
      }
      return ws.hortaStage;
    }

    advanceHortaStage(minStage, reason = '') {
      const cur = this.getHortaStage();
      if (cur < minStage) {
        return this.setHortaStage(minStage, reason);
      }
      return cur;
    }

    getUBSMural() {
      return this._getStates().ubsMural || 'default';
    }

    setUBSMural(state) {
      const ws = this._getStates();
      ws.ubsMural = state || 'default';
      if (this.game.events) {
        this.game.events.emit('world:stateChanged', { key: 'ubsMural', value: ws.ubsMural });
      }
    }

    getPracinhaStatus() {
      return this._getStates().pracinhaStatus || 'default';
    }

    setPracinhaStatus(status) {
      const ws = this._getStates();
      ws.pracinhaStatus = status || 'default';
      if (this.game.events) {
        this.game.events.emit('world:stateChanged', { key: 'pracinhaStatus', value: ws.pracinhaStatus });
      }
    }

    getCluesFound() {
      return this._getStates().cluesFound;
    }

    hasClue(clueId) {
      return this.getCluesFound().includes(clueId);
    }

    getCluesInScene(sceneId) {
      return WORLD_CLUES.filter(c => c.scene === sceneId);
    }

    getNearbyClue(sceneId) {
      const g = this.game;
      for (const clue of WORLD_CLUES) {
        if (clue.scene !== sceneId) continue;
        if (Math.hypot(g.player.x - clue.x, g.player.y - clue.y) < clue.radius) {
          return clue;
        }
      }
      return null;
    }

    inspectClue(clueOrId) {
      const g = this.game;
      const clue = typeof clueOrId === 'string'
        ? WORLD_CLUES.find(c => c.id === clueOrId)
        : clueOrId;
      if (!clue) return false;

      const ws = this._getStates();
      const firstTime = !ws.cluesFound.includes(clue.id);
      if (firstTime) {
        ws.cluesFound.push(clue.id);
        if (g.storyState) {
          if (clue.flag) g.storyState.setFlag(clue.flag, true);
          if (clue.postureDelta) {
            for (const axis of Object.keys(clue.postureDelta)) {
              g.storyState.addPosture(axis, clue.postureDelta[axis]);
            }
          }
        }
        if (global.sfx && typeof global.sfx.item === 'function') global.sfx.item();
      }

      if (g.events) {
        g.events.emit('clue:inspected', {
          clueId: clue.id,
          firstTime,
          totalFound: ws.cluesFound.length
        });
      }

      if (g.dialogue && typeof g.dialogue.startGraph === 'function') {
        const joana = g.ubsInterior && g.ubsInterior.staff.find(s => s.id === 'acs_joana');
        const profile = g.dialogue.resolveSpeakerProfile('player');
        g.dialogue.startGraph({
          entityType: 'STAFF',
          entityData: profile ? profile.entityData : (joana || {}),
          entityId: 'player',
          tag: `Investigação do Território (${ws.cluesFound.length}/5 pistas)`,
          name: clue.title,
          badgesHtml: `<span class="badge prioritario">🔍 Pista de Campo</span><span class="badge amigo">${firstTime ? '✨ Nova Descoberta' : '📖 Revisada'}</span>`,
          bondPct: Math.min(100, ws.cluesFound.length * 20),
          bondText: `${ws.cluesFound.length}/5 pistas reunidas`,
          graph: {
            startNode: 'pista',
            nodes: {
              pista: {
                text: clue.text,
                note: clue.note,
                choices: [
                  {
                    text: firstTime
                      ? 'Anotar pista na prancheta e cruzar com a história da Vila Esperança.'
                      : 'Fechar anotação e continuar explorando.',
                    intent: '📓 Registrar descoberta',
                    reply: firstTime
                      ? `Pista "${clue.title}" registrada no seu Diário (${ws.cluesFound.length}/5)!`
                      : 'Pista já anotada no seu Diário.'
                  }
                ]
              }
            }
          },
          onFinish: (choice) => {
            g.setDialogueText(choice.reply);
            const choicesEl = document.getElementById('dlg-choices');
            choicesEl.innerHTML = '';
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = '<span>Seguir caminhada pela Vila Esperança.</span><span class="choice-tag">Prosseguir</span>';
            btn.addEventListener('click', () => g.closeOverlays());
            choicesEl.appendChild(btn);
          }
        });
      }

      if (g.quests) g.quests.evaluateAll({ silent: false });
      g.updateHUD();
      g.saveProgress();
      return true;
    }

    drawWorldClueMarkers(ctx, sceneId) {
      const g = this.game;
      const pa = global.pixelArt;
      for (const clue of this.getCluesInScene(sceneId)) {
        const found = this.hasClue(clue.id);
        const bob = Math.sin(g.elapsedTime * 4 + clue.x) * 2.5;
        if (!found) {
          if (pa && pa.emotes && pa.emotes.question) {
            ctx.drawImage(pa.emotes.question, Math.round(clue.x - 16), Math.round(clue.y - 44 + bob));
          } else {
            ctx.fillStyle = '#facc15';
            ctx.fillRect(Math.round(clue.x - 5), Math.round(clue.y - 26 + bob), 10, 10);
          }
        }
      }
    }
  }

  global.WorldStateSystem = WorldStateSystem;
  global.ACS_WORLD_CLUES = WORLD_CLUES;
})(window);

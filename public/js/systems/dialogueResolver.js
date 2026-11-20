// ============================================================================
// TERRITÓRIO VIVO — DIALOGUE RESOLVER SYSTEM (Etapa H1)
// ============================================================================
// Camada unificadora sobre DialogueSystem, StoryStateSystem e NarrativeSystem.
// Resolve interações na seguinte ordem estrita de prioridade:
//   1. Passo de Quest ativa (hook para QuestSystem em H2)
//   2. Reação imediata a escolhas/eventos recentes (StoryState.recentFlags/flags)
//   3. Variação por Capítulo + Faixa de Vínculo (Conhecido / Confiante / Aliado)
//   4. Contexto de espaço compartilhado (Feira, Dominó, Vendinha, Espera, Assoc.)
//   5. Fallback legado (PILOT_GRAPHS, DAILY_DIALOGUES, falas padrão UBS/Comunidade)

(function (global) {
  'use strict';

  class DialogueResolver {
    constructor(game) {
      this.game = game;
    }

    _getStory() {
      return this.game.storyState || null;
    }

    // ------------------------------------------------------------------------
    // 1. RESOLUÇÃO DE VISITA DOMICILIAR (FAMÍLIAS H01..H15)
    // ------------------------------------------------------------------------
    resolveFamilyVisitGraph(fam) {
      const g = this.game;
      const story = this._getStory();
      const dlg = g.dialogue;

      // Priority 1: Active Quest step (H2+)
      const questGraph = this.resolveActiveQuestGraph(fam.id, 'VISIT', fam);
      if (questGraph) return questGraph;

      // Preserve Week 1 Pilot Graphs on the first home visit for each pilot family
      const pilotFlag = `pilot_${fam.id.toLowerCase()}_seen`;
      if (g.weekNumber === 1 && !g.narrative.flags[pilotFlag]) {
        const pilot = dlg.getPilotGraph(fam.id);
        if (pilot) {
          g.narrative.flags[pilotFlag] = true;
          if (story) story.setFlag(pilotFlag, true);
          return pilot;
        }
      }

      // Priority 2: Reactive follow-up to prior events/choices
      const reactive = this.resolveFamilyReactionGraph(fam);
      if (reactive) return reactive;

      // Priority 3: Week 2+ or High-Bond Chapter progression variation
      const chapterBondGraph = this.resolveFamilyChapterBondGraph(fam);
      if (chapterBondGraph) return chapterBondGraph;

      // Priority 5: Legacy DAILY_DIALOGUES via safeMod(dayOfWeek, 5)
      return dlg.adaptLegacyDialogue(g.narrative.getDialogueForFamily(fam, g.dayOfWeek));
    }

    resolveFamilyReactionGraph(fam) {
      const story = this._getStory();
      if (!story) return null;

      // Capítulo 2: Mobilização de Feira/Dominó para a Horta Comunitária (H04, H05, H07, H14)
      if (['H04', 'H05', 'H07', 'H14'].includes(fam.id) && story.hasFlag('q2_bete_mutirao_plano') && !story.hasFlag('q2_moradores_mobilizados')) {
        return {
          startNode: 'convite_mutirao',
          nodes: {
            convite_mutirao: {
              text: `“Ô, Alex! A Tia Bete comentou que você passou lá na Associação com boas ideias pra destravar a Horta e cuidar do bairro. Se for pra somar de verdade sem politicagem, pode contar com a nossa turma!”`,
              note: 'Capítulo 2 • Articulação entre Associação, Feira e Roda de Dominó.',
              choices: [
                {
                  text: 'Confirmar o chamado pro mutirão da Horta e escutar sugestões práticas da família.',
                  intent: '🌱 Somar ao mutirão',
                  type: 'EMPATHY',
                  effects: {
                    bondDelta: 10,
                    postureDelta: { articulacao: 1 },
                    setFlags: { q2_moradores_mobilizados: true },
                    setRecentFlags: { moradores_fecharam_horta: true }
                  },
                  reply: '“Fechado! Já avisa a Tia Bete que sábado de manhã o pessoal do dominó e da feira encosta lá na Horta pra ajudar!”'
                }
              ]
            }
          }
        };
      }

      // Seu Tião (H04) reage após abaixar a guarda na conversa do dominó/pressão
      if (fam.id === 'H04' && story.hasFlag('pilot_h04_connected') && !story.hasFlag('h04_followup_med_done')) {
        return {
          startNode: 'retorno_tiao',
          nodes: {
            retorno_tiao: {
              text: '“Ó, não é que aquela história do cano com pressão ficou na minha cabeça? Tomei o remédio cedo esses dias e até o fôlego na ladeira melhorou um tico!”',
              note: 'Memória viva: Seu Tião lembrou da analogia que você usou na visita anterior.',
              choices: [
                {
                  text: 'Comemorar o avanço com humor e checar se falta comprimido até o fim da semana.',
                  intent: '🤝 Valorizar a constância',
                  type: 'EMPATHY',
                  effects: {
                    bondDelta: 10,
                    stubbornDelta: -10,
                    postureDelta: { acolhimento: 1 },
                    setFlags: { h04_followup_med_done: true },
                    setRecentFlags: { h04_aderiu_tratamento: true }
                  },
                  reply: '“Ainda tenho cartela pra duas semanas! E quinta na pracinha quero ver se você encara uma dupla no dominó!”'
                },
                {
                  text: 'Registrar a melhora na ficha e lembrar os horários certos de aferição na UBS.',
                  intent: '🩺 Consolidar rotina clínica',
                  type: 'EDUCATE',
                  effects: {
                    bondDelta: 8,
                    postureDelta: { burocracia: 1 },
                    setFlags: { h04_followup_med_done: true }
                  },
                  reply: '“Anota aí no seu aparelho bonito! Tô começando a achar que esse postinho presta mesmo.”'
                }
              ]
            }
          }
        };
      }

      // Lucas (H13) reage ao vínculo acolhido anteriormente
      if (fam.id === 'H13' && story.hasFlag('pilot_h13_video_talent') && !story.hasFlag('h13_followup_video_done')) {
        return {
          startNode: 'lucas_edicao',
          nodes: {
            lucas_edicao: {
              text: '“Ei, agente... Depois da nossa conversa eu voltei a mexer num vídeo curto sobre a pracinha do bairro. Dormi um pouco melhor ontem — lembrei que ninguém na UBS ia me julgar.”',
              note: 'Memória viva: Lucas lembrou do seu acolhimento na conversa anterior.',
              choices: [
                {
                  text: 'Incentivar a mostra comunitária e mencionar que a Tia Bete adora ideias de jovens na Associação.',
                  intent: '🤝 Conectar com a comunidade',
                  type: 'EMPATHY',
                  effects: {
                    bondDelta: 12,
                    postureDelta: { articulacao: 1 },
                    setFlags: { h13_followup_video_done: true },
                    setRecentFlags: { lucas_aberto_associacao: true }
                  },
                  reply: '“Sério? Se for sem pressão de falar em microfone no começo, qualquer dia eu passo lá com a Tia Bete!”'
                }
              ]
            }
          }
        };
      }

      return null;
    }

    resolveFamilyChapterBondGraph(fam) {
      const g = this.game;
      const story = this._getStory();
      if (!story || g.weekNumber < 2) return null;

      // Evita repetição na Semana 2+ quando já houve diálogo diário na Semana 1 e vínculo é alto
      const wFlag = `w${g.weekNumber}_${fam.id.toLowerCase()}_bond_checkin`;
      if (fam.bond >= 75 && !story.hasFlag(wFlag)) {
        return {
          startNode: 'vinculo_alto',
          nodes: {
            vinculo_alto: {
              text: `“Você já é praticamente de casa aqui na ${fam.code}, Alex! Na semana passada parecia visita de rotina, agora a gente conversa de igual pra igual sobre a vida no bairro.”`,
              note: `Semana ${g.weekNumber} • Vínculo Forte (${fam.bond}%) — abertura espontânea do morador.`,
              choices: [
                {
                  text: 'Ouvir como estão os ânimos da rua e reforçar o acompanhamento de saúde da família.',
                  intent: '💛 Escuta de confiança',
                  type: 'EMPATHY',
                  effects: {
                    bondDelta: 8,
                    staminaDelta: 10,
                    postureDelta: { acolhimento: 1 },
                    setFlags: { [wFlag]: true }
                  },
                  reply: '“Pode contar com a nossa casa sempre que precisar juntar o pessoal da rua!”'
                }
              ]
            }
          }
        };
      }
      return null;
    }

    // ------------------------------------------------------------------------
    // 2. RESOLUÇÃO DE ENCONTROS INFORMAIS (FEIRA, DOMINÓ, VENDINHA, UBS, ASSOC)
    // ------------------------------------------------------------------------
    resolveInformalEncounterGraph(fam, loc, fallbackLegacyFn) {
      const g = this.game;
      const story = this._getStory();

      const questGraph = this.resolveActiveQuestGraph(fam.id, loc.type, { fam, loc });
      if (questGraph) return questGraph;

      // Capítulo 2: Mobilização direta na Feira ou Dominó
      if (['H04', 'H05', 'H07', 'H14'].includes(fam.id) && story && story.hasFlag('q2_bete_mutirao_plano') && !story.hasFlag('q2_moradores_mobilizados')) {
        return {
          startNode: 'social_mutirao',
          nodes: {
            social_mutirao: {
              text: `“Olha o Alex aí na ${loc.type === 'PRACA_FEIRA' ? 'Feira' : 'Pracinha'}! A Tia Bete já soltou no grupo que você tá puxando a reforma da Horta junto com o posto!”`,
              note: 'Encontro comunitário • Mobilização do Capítulo 2.',
              choices: [
                {
                  text: 'Chamar o pessoal da roda para apoiar o mutirão da Horta e a saúde do bairro.',
                  intent: '🌱 Mobilizar a roda',
                  type: 'EMPATHY',
                  effects: {
                    bondDelta: 5,
                    postureDelta: { articulacao: 1 },
                    setFlags: { q2_moradores_mobilizados: true }
                  },
                  reply: '“Com certeza! Na quarta a gente aparece na Associação e sábado ajuda nos canteiros!”'
                }
              ]
            }
          }
        };
      }

      // Reação contextual na Roda de Dominó se Seu Tião já conectou com o ACS
      if (loc.type === 'PRACA_DOMINO' && fam.id === 'H04' && story && story.hasFlag('pilot_h04_connected') && !story.hasFlag('domino_tiao_reacao_h1')) {
        return {
          startNode: 'tiao_pracinha',
          nodes: {
            tiao_pracinha: {
              text: '“Ô parceiro(a)! Vem cá ver eu fechando a bucha de sena! Já contei pros colegas aqui da praça que você não é daqueles que só chegam passando sermão!”',
              note: 'Encontro informal na Roda de Dominó — reputação territorial em construção.',
              choices: [
                {
                  text: 'Entrar na brincadeira da mesa e aproveitar pra lembrar da água e do sol forte.',
                  intent: '♟️ Prosa de pracinha',
                  type: 'EMPATHY',
                  effects: {
                    bondDelta: 5,
                    postureDelta: { articulacao: 1 },
                    setFlags: { domino_tiao_reacao_h1: true }
                  },
                  reply: '“Hahaha! Água eu tomo, só não me faz perder a vez na pedra!”'
                }
              ]
            }
          }
        };
      }

      const legacy = typeof fallbackLegacyFn === 'function' ? fallbackLegacyFn(fam, loc) : null;
      return legacy ? g.dialogue.adaptLegacyDialogue(legacy) : null;
    }

    // ------------------------------------------------------------------------
    // 3. RESOLUÇÃO DE EQUIPE DA UBS (10 PROFISSIONAIS)
    // ------------------------------------------------------------------------
    resolveStaffGraph(staff, fallbackLegacyFn) {
      const g = this.game;
      const story = this._getStory();
      const dlg = g.dialogue;

      // Priority 1: Active Quest step
      const questGraph = this.resolveActiveQuestGraph(staff.id, 'UBS', staff);
      if (questGraph) return questGraph;

      // Priority 2: Reactive / Multi-speaker scene triggers
      if (story) {
        // Escriturário Renan reage quando Alex já conversou com Dona Carla sobre pressão da secretaria
        if (staff.id === 'escriturario' && (story.hasFlag('dona_carla_met') || story.hasFlag('dona_carla_pressure')) && !story.hasFlag('renan_reagiu_carla_h1')) {
          return {
            startNode: 'renan_guiche',
            nodes: {
              renan_guiche: {
                text: '“Ei, vi que você encarou a conversa com a Dona Carla... Aqui no guichê a gente leva bronca o dia todo, sabe? Às vezes acho que ela vem só pra apontar dedo pro meu balcão.”',
                note: 'Memória viva: tensão entre a recepção da UBS e a liderança comunitária.',
                choices: [
                  {
                    text: 'Validar o cansaço do Renan e explicar que a cobrança dela nasce do medo de perder equipe.',
                    intent: '🤝 Mediar com empatia',
                    next: 'renan_escuta',
                    effects: {
                      postureDelta: { acolhimento: 1, articulacao: 1 },
                      npcBondDelta: { escriturario: 8, npc_dona_carla: 4 },
                      setFlags: { renan_reagiu_carla_h1: true, renan_postura_mediada: true },
                      setRecentFlags: { ubs_clima_mediado: true }
                    }
                  },
                  {
                    text: 'Concordar que protocolo e fila organizada têm que vir em primeiro lugar.',
                    intent: '📋 Apoiar rigidez do guichê',
                    effects: {
                      postureDelta: { burocracia: 1, firmeza: 1 },
                      npcBondDelta: { escriturario: 6, npc_dona_carla: -4 },
                      setFlags: { renan_reagiu_carla_h1: true }
                    },
                    reply: '“Pois é, sem regra a recepção não aguenta. Obrigado por entender o nosso lado aqui atrás.”'
                  }
                ]
              },
              renan_escuta: {
                text: '“Verdade... ninguém quer ficar sem médico e sem enfermeira aqui no bairro. Na próxima segunda vou tentar segurar a onda e explicar o sistema com mais calma pra ela.”',
                note: 'Vínculo com Renan fortalecido • Ponte entre recepção e comunidade iniciada.',
                choices: [
                  {
                    text: 'Agradecer ao Renan e combinar de se apoiarem nos horários de pico.',
                    intent: '💬 Combinar apoio mútuo',
                    reply: '“Fechado, Alex! Qualquer recado do território, deixa aqui no balcão comigo.”'
                  }
                ]
              }
            }
          };
        }

        // Sala ESF Multi-Falante Piloto com Joana + Dr. Henrique
        if (staff.id === 'acs_joana' && story.hasFlag('joana_schedule_tip') && !story.hasFlag('h1_esf_alinhamento_visto')) {
          const multiGraph = dlg.getPilotGraph('esf_alinhamento_h1');
          if (multiGraph) return multiGraph;
        }

        // Reação pós-Clímax do Cap 1 na equipe da UBS
        if (staff.id === 'enfermeira_marina' && story.hasRecentFlag('ubs_debate_mediado') && !story.hasFlag('marina_comentou_cap1')) {
          return {
            startNode: 'marina_pos_cap1',
            nodes: {
              marina_pos_cap1: {
                speaker: 'enfermeira_marina',
                text: '“Aquela conversa na recepção deu fôlego pra equipe inteira, Alex. O Renan até reservou dois encaixes pro pessoal do último turno sem perder a organização.”',
                note: 'Repercussão da sua mediação no Capítulo 1.',
                choices: [
                  {
                    text: 'Seguir ajustando o fluxo entre ESF e recepção.',
                    intent: '🤝 Manter a ponte',
                    effects: { npcBondDelta: { enfermeira_marina: 4 }, setFlags: { marina_comentou_cap1: true } },
                    reply: '“Quando a gente escuta a rua antes da briga estourar, tudo funciona melhor.”'
                  }
                ]
              }
            }
          };
        }
      }

      // Priority 5: Pilot Graph -> Legacy UBS Staff content
      const pilot = dlg.getPilotGraph(staff.id);
      if (pilot && (!story || !story.hasFlag(`pilot_${staff.id}_done`))) {
        return pilot;
      }

      const legacy = typeof fallbackLegacyFn === 'function' ? fallbackLegacyFn(staff) : null;
      return legacy ? dlg.adaptLegacyDialogue(legacy) : null;
    }

    // ------------------------------------------------------------------------
    // 4. RESOLUÇÃO DE NPCS COMUNITÁRIOS (SEU ZÉ, TIA BETE, DONA CARLA)
    // ------------------------------------------------------------------------
    resolveCommunityNpcGraph(npc, fallbackLegacyFn) {
      const g = this.game;
      const story = this._getStory();
      const dlg = g.dialogue;

      const questGraph = this.resolveActiveQuestGraph(npc.id, g.currentLocation, npc);
      if (questGraph) return questGraph;

      // Reação viva do Seu Zé quando H04 ou H13 já criaram vínculo real com Alex
      if (npc.id === 'npc_seu_ze' && story && story.hasFlag('vendinha_coffee') && (story.hasFlag('pilot_h04_connected') || story.hasFlag('pilot_h13_video_talent')) && !story.hasFlag('ze_fofoca_boa_h1')) {
        return {
          startNode: 'ze_balcao_vivo',
          nodes: {
            ze_balcao_vivo: {
              text: '“Escuta essa, Alex: ontem à noite o pessoal comentou aqui no balcão que você não chega mandando — você senta pra ouvir. Faz tempo que a Vila Esperança não via agente assim.”',
              note: 'Reputação comunitária: suas escolhas nas casas já repercutem na Vendinha.',
              choices: [
                {
                  text: 'Agradecer e perguntar quem anda precisando de uma atenção discreta esta semana.',
                  intent: '🤝 Escutar o termômetro da rua',
                  effects: {
                    npcBondDelta: 6,
                    postureDelta: { acolhimento: 1 },
                    setFlags: { ze_fofoca_boa_h1: true },
                    setRecentFlags: { ze_elogiou_alex: true }
                  },
                  reply: '“Fica de olho em quem chega calado demais no fim do turno... O pão e o caderno da Vendinha entregam muita coisa antes do posto saber.”'
                }
              ]
            }
          }
        };
      }

      // Reação da Tia Bete após fechar aliança na Associação
      if (npc.id === 'npc_tia_bete' && story && story.hasFlag('tia_bete_ally') && !story.hasFlag('bete_seguimento_h1')) {
        return {
          startNode: 'bete_retorno',
          nodes: {
            bete_retorno: {
              text: '“Bom te ver de volta, Alex! Muita gente promete parceria em reunião e some na segunda-feira. Ver você circulando pela praça e pelas casas já mudou o olhar do pessoal aqui.”',
              note: 'Associação de Moradores • Confiança em construção.',
              choices: [
                {
                  text: 'Reafirmar o compromisso e perguntar qual o primeiro mutirão que precisa de braço.',
                  intent: '🛠️ Alinhar próximos passos',
                  effects: {
                    npcBondDelta: 8,
                    postureDelta: { articulacao: 1 },
                    setFlags: { bete_seguimento_h1: true }
                  },
                  reply: '“Aos poucos vamos destravar a Horta e chamar o pessoal do dominó pra somar com a gente!”'
                }
              ]
            }
          }
        };
      }

      // First encounter pilot graphs (preserved for Phase 2 compatibility)
      const pilot = dlg.getPilotGraph(npc.id);
      if (pilot) return pilot;

      const legacy = typeof fallbackLegacyFn === 'function' ? fallbackLegacyFn(npc) : null;
      return legacy ? dlg.adaptLegacyDialogue(legacy) : null;
    }

    // Hook pronto para QuestSystem na Etapa H2
    resolveActiveQuestGraph(entityId, contextType, payload) {
      const g = this.game;
      if (g.quests && typeof g.quests.getDialogueForTarget === 'function') {
        return g.quests.getDialogueForTarget(entityId, contextType, payload);
      }
      return null;
    }
  }

  global.DialogueResolver = DialogueResolver;
})(window);

// ============================================================================
// TERRITÓRIO VIVO — MULTI-TURN DIALOGUE ENGINE (Phase 1: RPG Narrative Core)
// ============================================================================
// Supports multi-turn graph conversations (`nodes`) with conditions, flags,
// EventBus hooks, a 100% backward-compatible legacy adapter for 1-turn
// dialogues, and spoiler-free choice intent labels (toggleable pedagogical
// hints in the Tablet).

(function (global) {
  'use strict';

  // 5 Pilot Multi-Turn Conversations (Human tone: everyday Brazilian warmth,
  // subtle humor, real community life + care without textbook spoilers!)
  const PILOT_GRAPHS = {
    H01: {
      startNode: 'abertura',
      nodes: {
        abertura: {
          text: '“Ô meu bem, que bom te ver de colete azul na nossa rua! Entra na sombra da varanda antes que esse sol derreta até o chinelo! Fiz um chá de cidreira fresquinho.”',
          note: 'Dona Dulce & Seu Geraldo — Vínculo antigo na Rua das Acácias.',
          choices: [
            {
              text: 'Aceitar o chá na sombra e perguntar como foi a semana do casal e da horta.',
              intent: '💬 Conversar com calma',
              hintTag: '🤝 Vínculo +12 • 💧 +35 • 🔍 2 Horários',
              type: 'EMPATHY',
              next: 'horta_vizinhos'
            },
            {
              text: 'Agradecer rapidinho e já conferir a pressão e a caixinha de losartana.',
              intent: '🩺 Ir direto ao cuidado',
              hintTag: '🌱 Técnica • Vínculo +10 • 💧 +25',
              type: 'EDUCATE',
              next: 'pressao_direta'
            }
          ]
        },
        horta_vizinhos: {
          text: '“O Geraldo tá teimando que o pé de manjericão dele cresceu mais que o meu, acredita? Haha! A nossa pressão tá 12 por 8 certinha. Mas me conta: você já conseguiu pegar o pessoal que trabalha fora?”',
          note: 'Dona Dulce conhece a rotina da rua inteira.',
          choices: [
            {
              text: 'Aferir a pressão dos dois e perguntar que horas os vizinhos costumam estar em casa.',
              intent: '🤝 Pedir ajuda sobre a rua',
              hintTag: '💧 +35 • ⚡ +20 • 🔍 Revela Casa 02 e 03',
              type: 'EMPATHY',
              effects: {
                bondDelta: 12,
                staminaDelta: 20,
                hydrationDelta: 35,
                revealNeighbors: ['H02', 'H03'],
                flag: 'pilot_h01_completed'
              },
              reply: '“Anota aí, meu anjo: o Marcos da Casa 02 chega do plantão cedo (até 09h45) ou no finzinho da tarde! E a Camila da Casa 03 volta do comércio depois das 16h — à noite ela costuma estar lá!”'
            },
            {
              text: 'Elogiar a horta e dar uma olhada nos pratinhos de planta para não juntar água.',
              intent: '🌿 Olhar o quintal juntos',
              hintTag: '💧 +25 • ⚡ +15 • Vínculo +10',
              type: 'EDUCATE',
              effects: {
                bondDelta: 10,
                staminaDelta: 15,
                hydrationDelta: 25,
                revealNeighbors: ['H02'],
                flag: 'pilot_h01_completed'
              },
              reply: '“Olha aí, areia até a borda! E aproveita esse copão d\'água gelada antes de voltar pra rua!”'
            }
          ]
        },
        pressao_direta: {
          text: '“Certinho, 120x80! O Geraldo não esquece um comprimido. Mas não sai correndo não, bebe um copo d\'água do filtro de barro que o sol hoje não perdoa!”',
          note: 'Adesão regular à losartana.',
          choices: [
            {
              text: 'Tomar a água fresca, agradecer o carinho e seguir a caminhada.',
              intent: '💧 Aceitar água e agradecer',
              hintTag: '💧 +25 • ⚡ +15 • Vínculo +10',
              type: 'EDUCATE',
              effects: {
                bondDelta: 10,
                staminaDelta: 15,
                hydrationDelta: 25,
                revealNeighbors: ['H02'],
                flag: 'pilot_h01_completed'
              },
              reply: '“Volta sempre, viu? A porta da Casa 01 tá sempre aberta pro pessoal do postinho!”'
            }
          ]
        }
      }
    },

    H04: {
      startNode: 'portao',
      nodes: {
        portao: {
          text: '“Lá vem o pessoal do postinho de novo... Olha aqui, eu tô ótimo! Só tomo comprimido de pressão quando a nuca dá aquela fisgada. E minha mãe viveu até os 90 comendo torresmo!”',
          note: 'Seu Tião (Casa 04) — Desconfiado com consultas, orgulhoso da própria autonomia.',
          choices: [
            {
              text: 'Rir de leve, perguntar do jogo de dominó dele e ouvir antes de falar de remédio.',
              intent: '💬 Quebrar o gelo',
              hintTag: '💚 Empatia • Abre conversa',
              type: 'EMPATHY',
              next: 'domino_abertura'
            },
            {
              text: 'Explicar logo que hipertensão sem sintoma pode causar um AVC grave.',
              intent: '➡️ Ser firme e direto',
              hintTag: '⚡ Confronto • Risco de fechar porta',
              type: 'AUTHORITARIAN',
              effects: { bondDelta: -12 },
              reply: '“Vira essa boca pra lá! Vaso ruim não quebra! Hoje não quero sermão no meu portão não!”'
            }
          ]
        },
        domino_abertura: {
          text: '“Aha! Alguém que entende que a vida não é só fila de posto! No dominó ninguém me ganha na Vila Esperança... Mas confesso que às vezes subo a ladeira e o peito dá uma cansada.”',
          note: 'Ele abaixou a guarda — oportunidade de construir confiança sem confronto.',
          choices: [
            {
              text: 'Usar a analogia do cano d\'água com pressão alta silenciosa e pedir para aferir a PA ali mesmo.',
              intent: '🤝 Explicar com analogia simples',
              hintTag: '💚 Vínculo +24 • Reduz teimosia',
              type: 'EMPATHY',
              effects: { bondDelta: 24, stubbornDelta: -35, flag: 'pilot_h04_connected' },
              reply: '“Cano estufando sem fazer barulho até estourar... Pior que faz sentido, rapaz. Nunca me explicaram assim sem brigar. Pode medir essa pressão aí então!”'
            },
            {
              text: 'Combinar de trocar metade do sal por alho e cheiro-verde sem tirar o sabor da comida dele.',
              intent: '🍲 Propor acordo realista',
              hintTag: '🩺 Vínculo +18 • Reduz teimosia',
              type: 'EDUCATE',
              effects: { bondDelta: 18, stubbornDelta: -25, flag: 'pilot_h04_connected' },
              reply: '“Com alho e pimenta até que desce bem! Se não for comida sem graça de hospital, eu topo tomar o comprimido cedo todo dia.”'
            }
          ]
        }
      }
    },

    H13: {
      startNode: 'porta_entreaberta',
      nodes: {
        porta_entreaberta: {
          text: '“Ah... oi. Desculpa a demora, achei que fosse cobrança. Tenho ficado mais no quarto esses dias... às vezes o coração dispara do nada e parece que todo mundo segue a vida menos eu.”',
          note: 'Lucas (22 anos) — Isolamento social e crises de ansiedade.',
          choices: [
            {
              text: 'Falar com calma que não há pressa nenhuma e perguntar como têm sido as noites dele.',
              intent: '💬 Escutar sem julgamento',
              hintTag: '💛 Vínculo alto',
              type: 'EMPATHY',
              next: 'escuta_lucas'
            },
            {
              text: 'Dizer que ele é novo e que arrumar qualquer serviço rápido resolve essa tristeza.',
              intent: '➡️ Dar conselho direto',
              hintTag: '❌ Invalidação • Vínculo -16',
              type: 'AUTHORITARIAN',
              effects: { bondDelta: -16 },
              reply: '“É o que todo mundo fala... Eu vou entrar agora, tá? Tchau.”'
            }
          ]
        },
        escuta_lucas: {
          text: '“De noite é pior, fico rolando o celular até tarde... Às vezes eu edito uns vídeos curtos pra distrair a cabeça, mas dá vergonha de ir no postinho e acharem que é frescura.”',
          note: 'Ele compartilhou algo pessoal — acolhimento fortalece o vínculo terapêutico.',
          choices: [
            {
              text: 'Validar o que ele sente, elogiar o interesse por vídeos e explicar o acolhimento tranquilo da UBS.',
              intent: '🤝 Acolher e convidar sem pressão',
              hintTag: '💛 Vínculo +24 • Reduz resistência',
              type: 'EMPATHY',
              effects: { bondDelta: 24, stubbornDelta: -25, flag: 'pilot_h13_video_talent' },
              reply: '“Sério que ninguém vai me julgar lá? Valeu por me ouvir de verdade... Qualquer dia eu passo na UBS no fim da tarde.”'
            },
            {
              text: 'Ensinar a respiração 4-7-8 na hora para usar quando o peito apertar à noite.',
              intent: '🌬️ Praticar técnica juntos',
              hintTag: '🩺 Vínculo +16',
              type: 'EDUCATE',
              effects: { bondDelta: 16, flag: 'pilot_h13_breathing' },
              reply: '“Puxa, fazer isso junto já diminuiu o aperto no peito. Vou tentar hoje antes de dormir.”'
            }
          ]
        }
      }
    },

    medico: {
      startNode: 'consultorio',
      nodes: {
        consultorio: {
          text: '“Entra, colega! Acabei de fechar um atendimento puxado. Entre nós: às vezes olho a fila lá fora e sinto que sem o olho do ACS na rua a gente só enxuga gelo.”',
          note: 'Dr. Henrique — Médico de Família e Comunidade (UBS Vila Esperança).',
          choices: [
            {
              text: 'Trocar ideia sobre os pacientes mais difíceis da microárea e como abordar sem afastá-los.',
              intent: '🩺 Discutir casos do bairro',
              next: 'casos_clinicos'
            },
            {
              text: 'Perguntar como anda a estrutura e o movimento da UBS nesta semana.',
              intent: '💬 Conversar sobre a unidade',
              next: 'bastidores_ubs'
            }
          ]
        },
        casos_clinicos: {
          text: '“O Seu Tião (Casa 04) e a Dona Neide (Casa 05) são os clássicos: têm medo de perder autonomia, não de remédio. Se você conquistar a confiança deles na conversa, metade do tratamento já está ganha.”',
          note: 'Matriciamento da ESF: vínculo territorial potencializa o cuidado clínico.',
          choices: [
            {
              text: 'Combinar de avisar se o Jorge (Casa 06) ou o Vovô Joaquim precisarem de visita conjunta.',
              intent: '🤝 Alinhar visita compartilhada',
              effects: { flag: 'talked_dr_henrique_cases' },
              reply: '“Fechado! Assim que você sinalizar na Sala ESF ou no e-SUS, eu reservo horário na agenda para irmos juntos.”'
            }
          ]
        },
        bastidores_ubs: {
          text: '“Olha, sendo bem sincero contigo: a secretaria anda cobrando números de cadastro atualizados da Microárea 04 porque ficamos meses sem ACS fixo. Quanto mais real ficar o nosso mapa semanal, mais força temos para defender a equipe.”',
          note: 'Bastidores da Gestão: manter cadastros e vínculos vivos fortalece a UBS.',
          choices: [
            {
              text: 'Garantir que vamos levantar a realidade de cada casa — inclusive de quem trabalha de dia.',
              intent: '🤝 Compromisso com o território',
              effects: { flag: 'heard_ubs_pressure_hint' },
              reply: '“É disso que a Vila Esperança precisa! Conta comigo pro que der e vier.”'
            }
          ]
        }
      }
    },

    acs_joana: {
      startNode: 'mapa_esf',
      nodes: {
        mapa_esf: {
          text: '“Chega mais na nossa Sala ESF! Olha esse mapa na parede: doze anos andando nesse sol com esse colete azul e ainda me surpreendo com a força desse bairro. Como tá sendo sua semana na Microárea 04?”',
          note: 'ACS Joana (Microárea 01) — Veterana da Estratégia Saúde da Família.',
          choices: [
            {
              text: 'Pedir uma dica no mapa sobre famílias cujo horário ainda não descobri.',
              intent: '🗺️ Trocar pistas do território',
              next: 'dica_mapa'
            },
            {
              text: 'Conversar sobre como equilibrar a cobrança de metas com o ritmo real das pessoas.',
              intent: '💬 Papo de colega',
              next: 'conselho_veterana'
            }
          ]
        },
        dica_mapa: {
          text: '“Deixa eu dar uma olhada nos alfinetes da tua microárea... A gente sempre conhece alguém que conhece o vizinho! E lembra: depois das 18h, quando a UBS fecha, muita gente que trabalha fora finalmente tá em casa.”',
          note: 'Dica de Campo: visitas no começo da noite ampliam o alcance da microárea.',
          choices: [
            {
              text: 'Anotar uma indicação de horário da Joana no meu Tablet e-SUS.',
              intent: '📋 Atualizar agenda',
              effects: { revealOneUnknown: true, flag: 'joana_schedule_tip' },
              reply: '“Prontinho! Quando precisar descansar ou fechar a semana, a Sala ESF é o nosso porto seguro!”'
            }
          ]
        },
        conselho_veterana: {
          text: '“Escuta uma coisa: não tenta resolver o mundo num dia só. Nossa meta agora é semanal justamente pra você respirar, tomar um café, conhecer as pessoas de verdade e voltar pra casa inteira(o) à noite.”',
          note: 'Saúde do Trabalhador da Saúde: constância vale mais que exaustão.',
          choices: [
            {
              text: 'Agradecer o acolhimento e seguir com a semana.',
              intent: '🤝 Valeu, Joana!',
              effects: { staminaDelta: 10 },
              reply: '“Tamo junto na ESF! Qualquer aperto lá fora, passa aqui que a gente divide o peso.”'
            }
          ]
        }
      }
    },

    npc_seu_ze: {
      startNode: 'balcao',
      nodes: {
        balcao: {
          text: '“Chega mais, agente! Aqui na Vendinha o pão sai cedo e às 18h tem fornada nova! Você que anda o bairro inteiro debaixo de sol, tá precisando de um cafezinho ou quer saber das novidades da rua?”',
          note: 'Seu Zé — Vendinha & Padaria (Seg–Sáb, 07h–21h30).',
          choices: [
            {
              text: 'Aceitar um cafezinho no balcão e perguntar quem costuma passar por aqui à noite.',
              intent: '☕ Tomar café e prosear',
              hintTag: '☕ +15 Energia (1x/dia)',
              type: 'EMPATHY',
              effects: { flag: 'vendinha_coffee' },
              reply: '“Toma quentinho! De tardezinha pro começo da noite sempre encostam aqui o Marcos, o Jorge, o Digão e até o Dr. Cláudio!”'
            },
            {
              text: 'Perguntar se ele sabe o horário em casa de alguma família que ainda não mapeei.',
              intent: '🔍 Pedir dica do bairro',
              hintTag: '🔍 Revela 1 Horário',
              type: 'EDUCATE',
              effects: { revealOneUnknown: true },
              reply: '“Se eu sei?! Aqui passa todo mundo pra comprar pão e recarga!”'
            }
          ]
        }
      }
    },

    npc_tia_bete: {
      startNode: 'roda',
      nodes: {
        roda: {
          text: '“Entra, colega! A Associação tá de portas abertas pra quem trabalha pelo bairro de verdade. Faz tempo que a gente cobra melhoria na ponte do córrego e na Pracinha dos Ipês, mas papel parado não muda rua.”',
          note: 'Tia Bete — Associação de Moradores & Conselho Local.',
          choices: [
            {
              text: 'Ouvir quais são as prioridades urgentes da comunidade na visão da Associação.',
              intent: '💬 Escutar a liderança',
              next: 'pautas_vila'
            },
            {
              text: 'Mostrar o quadro de projetos e propor parceria entre a UBS e a Associação.',
              intent: '🤝 Propor aliança',
              effects: { flag: 'tia_bete_ally' },
              reply: '“Gosto de gente prática! Toda quarta à tarde fazemos reunião aqui — e sábado de manhã tô sempre dando uma olhada lá no terreno da Horta Comunitária!”'
            }
          ]
        },
        pautas_vila: {
          text: '“A ponte de madeira escorrega toda vez que chove, tem morador sem cadastro atualizado e o pessoal precisa de espaço pra respirar — por isso estamos preparando a Horta Comunitária ali do lado e a Pracinha!”',
          note: 'Os projetos comunitários serão executados em mutirões nas próximas fases.',
          choices: [
            {
              text: 'Combinar de caminhar juntos com a equipe da ESF e os moradores.',
              intent: '🤝 Fechar parceria',
              effects: { flag: 'tia_bete_ally' },
              reply: '“Anota aí: quem respeita a Vila Esperança sempre tem a Associação do lado!”'
            }
          ]
        }
      }
    },

    // Grafo Multi-Falante Piloto (Etapa H1): alternância dinâmica entre Joana, Dr. Henrique e Alex na Sala ESF
    esf_alinhamento_h1: {
      startNode: 'joana_abre',
      nodes: {
        joana_abre: {
          speaker: 'acs_joana',
          text: '“Olha quem chegou na hora certa! O Dr. Henrique passou aqui na Sala ESF para alinhar os casos que você começou a levantar na rua.”',
          note: 'Sala ESF • Reunião rápida de equipe (múltiplos falantes).',
          choices: [
            {
              text: 'Ouvir a avaliação do Dr. Henrique e da Joana sobre a Microárea 04.',
              intent: '🩺 Ouvir a equipe',
              next: 'medico_responde',
              effects: {
                postureDelta: { articulacao: 1 },
                npcBondDelta: { acs_joana: 4 }
              }
            }
          ]
        },
        medico_responde: {
          speaker: 'medico',
          text: '“Se você está conseguindo abrir porta de morador arredio e entender o horário de quem trabalha fora, isso vale ouro na consulta. O que está pesando mais na rua?”',
          note: 'Dr. Henrique aguarda sua leitura do território.',
          choices: [
            {
              text: 'Explicar que muitas faltas vêm de medo, vergonha e choque com horário de trabalho.',
              intent: '💬 Trazer a voz da comunidade',
              next: 'joana_fecha',
              effects: {
                postureDelta: { acolhimento: 1 },
                npcBondDelta: { medico: 6 },
                setRecentFlags: { equipe_alinhou_territorio: true }
              }
            },
            {
              text: 'Focar nos números de busca ativa e confirmar as prioridades no e-SUS.',
              intent: '📋 Focar nas metas do sistema',
              next: 'joana_fecha',
              effects: {
                postureDelta: { burocracia: 1 },
                npcBondDelta: { medico: 4 },
                setRecentFlags: { equipe_focou_metas: true }
              }
            }
          ]
        },
        joana_fecha: {
          speaker: 'acs_joana',
          text: '“Combinado! Agora você já sabe: quando uma casa fecha a porta, a resposta quase sempre aparece cruzando conversa aqui na ESF com a rua.”',
          note: 'Alinhamento registrado na memória da equipe.',
          choices: [
            {
              text: 'Voltar para o campo com a prancheta em dia.',
              intent: '🤝 Seguir trabalho',
              effects: {
                staminaDelta: 10,
                flag: 'h1_esf_alinhamento_visto'
              },
              reply: '“Bora pra rua, colega! A Vila Esperança muda um portão por vez.”'
            }
          ]
        }
      }
    }
  };

  const PLAYER_SPEAKER_PROFILE = {
    entityType: 'STAFF',
    entityId: 'player',
    name: 'Alex (Você) • ACS',
    tag: 'Microárea 04 • Vila Esperança',
    badgesHtml: '<span class="badge amigo">🦺 Colete Azul SUS</span>',
    entityData: {
      id: 'player',
      name: 'Alex',
      portraitBg: '#dbeafe',
      appearance: {
        skin: '#c68c64',
        hair: '#2b1d14',
        hairStyle: 'short',
        shirt: '#f8fafc',
        acsVest: true,
        gender: 'm'
      }
    }
  };

  class DialogueSystem {
    constructor(game) {
      this.game = game;
      this.showHints = false; // Spoiler-free by default (toggleable in Tablet)
      this.activeSession = null;
    }

    getPilotGraph(entityId) {
      return PILOT_GRAPHS[entityId] || null;
    }

    // Converts a legacy 1-turn dialogue { greeting, note, choices: [{ text, tag, reply, ... }] }
    // into a standard graph compatible with renderNode().
    adaptLegacyDialogue(legacy) {
      return {
        startNode: 'start',
        nodes: {
          start: {
            text: legacy.greeting,
            note: legacy.note || '',
            choices: (legacy.choices || []).map(c => ({
              text: c.text,
              intent: this.deriveNeutralIntent(c),
              hintTag: c.tag || '',
              type: c.type || 'EMPATHY',
              reply: c.reply,
              onPick: c.onPick,
              directAction: c.directAction,
              conditions: c.conditions || null,
              condition: c.condition || null,
              effects: c.effects || {
                bondDelta: c.bondDelta,
                stubbornDelta: c.stubbornDelta,
                staminaDelta: c.staminaDelta,
                hydrationDelta: c.hydrationDelta,
                revealNeighbors: c.revealNeighbors,
                flag: c.flag
              }
            }))
          }
        }
      };
    }

    // Strips numeric/spoiler hints into natural human intent labels
    deriveNeutralIntent(choice) {
      if (choice.intent) return choice.intent;
      if (choice.type === 'EMPATHY') return '💬 Escuta e acolhimento';
      if (choice.type === 'EDUCATE') return '🩺 Orientação prática';
      if (choice.type === 'AUTHORITARIAN') return '➡️ Abordagem direta';
      // Strip "+20", "-12", "Vínculo", etc. from arbitrary staff tags if needed
      const raw = choice.tag || '💬 Responder';
      return raw.replace(/[+-]\d+%?/g, '').replace(/Vínculo/gi, '').replace(/\s*•\s*$/g, '').trim() || '💬 Responder';
    }

    formatChoiceBadge(choice) {
      if (this.showHints && choice.hintTag) {
        return choice.hintTag;
      }
      return choice.intent || this.deriveNeutralIntent(choice);
    }

    resolveSpeakerProfile(speakerRef) {
      const g = this.game;
      if (!speakerRef) return null;

      if (typeof speakerRef === 'object') {
        if (speakerRef.speakerId) {
          const base = this.resolveSpeakerProfile(speakerRef.speakerId);
          return base ? { ...base, ...speakerRef } : speakerRef;
        }
        return speakerRef;
      }

      if (speakerRef === 'player' || speakerRef === 'alex') {
        return { ...PLAYER_SPEAKER_PROFILE, bondPct: 100, bondText: 'Protagonista' };
      }

      const story = g.storyState;
      // 1. Families (H01..H15)
      const fam = (g.families || []).find(f => f.id === speakerRef);
      if (fam) {
        const badgeClass = fam.archetype.toLowerCase();
        const bondLabel = fam.bond >= 80 ? 'Vínculo Forte' : fam.bond >= 55 ? 'Confiante' : fam.bond >= 35 ? 'Em Construção' : 'Desconfiado';
        return {
          entityType: 'FAMILY',
          entityData: fam,
          entityId: fam.id,
          tag: `${fam.code} • ${fam.condition} • ${fam.risk}`,
          name: fam.name,
          badgesHtml: `<span class="badge ${badgeClass}">${fam.archetypeLabel}</span><span class="badge">⏰ ${fam.knownSchedule ? fam.scheduleText : 'Horário ???'}</span>`,
          bondPct: fam.bond,
          bondText: `${fam.bond}% (${bondLabel})`
        };
      }

      // 2. UBS Staff
      const staff = g.ubsInterior && (g.ubsInterior.staff || []).find(s => s.id === speakerRef);
      if (staff) {
        const bond = story ? story.getNpcBond(staff.id) : 100;
        const bondText = story ? `${bond}% (${story.getBondLabel(bond)})` : 'Equipe Multiprofissional';
        return {
          entityType: 'STAFF',
          entityData: staff,
          entityId: staff.id,
          tag: staff.sector,
          name: `${staff.name} • ${staff.role}`,
          badgesHtml: `<span class="badge ${staff.badgeClass}">${staff.role}</span><span class="badge">🏥 Equipe UBS</span>`,
          bondPct: bond,
          bondText
        };
      }

      // 3. Community NPCs (Seu Zé, Tia Bete, Dona Carla)
      const npc = g.communitySpaces && g.communitySpaces.npcs && g.communitySpaces.npcs[speakerRef];
      if (npc) {
        const bond = story ? story.getNpcBond(npc.id) : 80;
        const bondText = story ? `${bond}% (${story.getBondLabel(bond)})` : npc.role;
        return {
          entityType: 'STAFF',
          entityData: npc,
          entityId: npc.id,
          tag: npc.sector,
          name: `${npc.name} • ${npc.role}`,
          badgesHtml: `<span class="badge ${npc.badgeClass}">${npc.role}</span>`,
          bondPct: bond,
          bondText
        };
      }

      return null;
    }

    applySpeakerHeader(profile) {
      if (!profile) return;
      const g = this.game;
      const pCanvas = document.getElementById('dlg-portrait-canvas');
      if (pCanvas && global.pixelArt) {
        global.pixelArt.drawPortraitToCanvas(pCanvas, profile.entityType, profile.entityData);
      }
      if (profile.tag !== undefined) document.getElementById('dlg-tag').textContent = profile.tag;
      if (profile.name !== undefined) document.getElementById('dlg-name').textContent = profile.name;
      if (profile.badgesHtml !== undefined) document.getElementById('dlg-badges').innerHTML = profile.badgesHtml;
      if (typeof profile.bondPct === 'number') {
        document.getElementById('dlg-hearts').textContent = g.renderHearts(profile.bondPct);
      }
      if (profile.bondText !== undefined) {
        document.getElementById('dlg-bond-val').textContent = profile.bondText;
      }
    }

    evaluateConditions(cond, entityData, sessionEntityId) {
      if (!cond) return true;
      const g = this.game;
      const story = g.storyState;
      const nFlags = (g.narrative && g.narrative.flags) || {};

      if (typeof cond.minChapter === 'number' && (!story || story.chapter < cond.minChapter)) return false;
      if (typeof cond.maxChapter === 'number' && story && story.chapter > cond.maxChapter) return false;

      const bondTarget = cond.bondTarget || sessionEntityId;
      const currentBond = story ? story.getEntityBond(bondTarget) : (entityData && typeof entityData.bond === 'number' ? entityData.bond : 50);
      if (typeof cond.minBond === 'number' && currentBond < cond.minBond) return false;
      if (typeof cond.maxBond === 'number' && currentBond > cond.maxBond) return false;

      if (Array.isArray(cond.hasFlags)) {
        for (const f of cond.hasFlags) {
          const ok = story ? story.hasFlag(f) : !!nFlags[f];
          if (!ok) return false;
        }
      }

      if (Array.isArray(cond.notFlags)) {
        for (const f of cond.notFlags) {
          const ok = story ? story.hasFlag(f) : !!nFlags[f];
          if (ok) return false;
        }
      }

      if (cond.flagEquals && typeof cond.flagEquals === 'object') {
        for (const k of Object.keys(cond.flagEquals)) {
          const val = story ? story.getFlag(k) : nFlags[k];
          if (val !== cond.flagEquals[k]) return false;
        }
      }

      if (cond.recentFlag && (!story || !story.hasRecentFlag(cond.recentFlag))) return false;
      if (Array.isArray(cond.hasRecentFlags)) {
        for (const rf of cond.hasRecentFlags) {
          if (!story || !story.hasRecentFlag(rf)) return false;
        }
      }

      if (cond.minPosture && typeof cond.minPosture === 'object') {
        for (const axis of Object.keys(cond.minPosture)) {
          if (!story || story.getPosture(axis) < cond.minPosture[axis]) return false;
        }
      }

      return true;
    }

    // Applies narrative side-effects immediately (storyFlags, recentFlags, posture, npcBonds, phone).
    // Returns legacy-only deltas (bondDelta, staminaDelta, etc.) for intermediate-turn accumulation.
    applyNarrativeEffects(eff, session) {
      if (!eff || typeof eff !== 'object') return;
      const g = this.game;
      const story = g.storyState;

      if (eff.flag) {
        if (story) story.setFlag(eff.flag, true);
        if (g.narrative && g.narrative.flags) g.narrative.flags[eff.flag] = true;
      }

      if (eff.setFlags && typeof eff.setFlags === 'object') {
        for (const k of Object.keys(eff.setFlags)) {
          const val = eff.setFlags[k];
          if (story) story.setFlag(k, val);
          else if (g.narrative && g.narrative.flags) g.narrative.flags[k] = val;
        }
      }

      if (eff.setRecentFlags && typeof eff.setRecentFlags === 'object' && story) {
        for (const k of Object.keys(eff.setRecentFlags)) {
          const raw = eff.setRecentFlags[k];
          if (raw && typeof raw === 'object' && 'value' in raw) {
            story.setRecentFlag(k, raw.value, raw.ttlDays || 3);
          } else {
            story.setRecentFlag(k, raw, 3);
          }
        }
      }

      if (eff.postureDelta && typeof eff.postureDelta === 'object' && story) {
        for (const axis of Object.keys(eff.postureDelta)) {
          story.addPosture(axis, eff.postureDelta[axis]);
        }
      }

      if (eff.npcBondDelta !== undefined && story) {
        if (typeof eff.npcBondDelta === 'number' && session && story.hasNpcBondEntry(session.entityId)) {
          story.addNpcBond(session.entityId, eff.npcBondDelta);
        } else if (eff.npcBondDelta && typeof eff.npcBondDelta === 'object') {
          for (const targetId of Object.keys(eff.npcBondDelta)) {
            story.addNpcBond(targetId, eff.npcBondDelta[targetId]);
          }
        }
      }

      if (typeof eff.hortaStageMin === 'number' && g.worldState) {
        g.worldState.advanceHortaStage(eff.hortaStageMin, 'dialogue_effect');
      }

      if (eff.bondDelta && typeof eff.bondDelta === 'object') {
        for (const famId of Object.keys(eff.bondDelta)) {
          const fam = (g.families || []).find(f => f.id === famId);
          if (fam) {
            fam.bond = global.ACSEngine.clamp(fam.bond + Number(eff.bondDelta[famId] || 0), 5, 100);
          }
        }
      }

      if (eff.triggerPhoneMsg && g.phone && typeof g.phone.pushMessage === 'function') {
        const m = eff.triggerPhoneMsg;
        const d = g.getCurrentDayData ? g.getCurrentDayData() : { shortName: 'Dia' };
        const stamp = m.time || `Sem. ${g.weekNumber} • ${d.shortName} ${g.formatClock(g.timeMinutes)}`;
        g.phone.pushMessage(m.key, m.sender, stamp, m.text);
      }
    }

    startGraph({ entityType, entityData, entityId, tag, name, badgesHtml, bondPct, bondText, graph, onFinish, onClose }) {
      const g = this.game;
      const baseSpeaker = { entityType, entityData, entityId, tag, name, badgesHtml, bondPct, bondText };
      this.activeSession = {
        entityType,
        entityData,
        entityId,
        baseSpeaker,
        currentSpeakerId: entityId,
        graph,
        onFinish,
        onClose,
        appliedEffectNodes: new Set(),
        accumulatedEffects: {
          bondDelta: 0,
          stubbornDelta: 0,
          staminaDelta: 0,
          hydrationDelta: 0,
          revealNeighbors: [],
          revealOneUnknown: false,
          flag: null
        }
      };

      g.openDialogueShell(entityType, entityData, tag, name, badgesHtml, bondPct, bondText);
      this.renderNode(graph.startNode || 'start');
    }

    clearSession() {
      const session = this.activeSession;
      if (!session) return;
      this.activeSession = null;
      if (typeof session.onClose === 'function') {
        session.onClose();
      }
    }

    renderNode(nodeId) {
      const g = this.game;
      const session = this.activeSession;
      if (!session || !session.graph || !session.graph.nodes[nodeId]) {
        g.closeOverlays();
        return;
      }

      const node = session.graph.nodes[nodeId];

      // Multi-speaker header update: apply node.speaker or restore baseSpeaker when omitted
      if (node.speaker) {
        const profile = this.resolveSpeakerProfile(node.speaker);
        if (profile) {
          this.applySpeakerHeader(profile);
          session.currentSpeakerId = profile.entityId || session.entityId;
        }
      } else if (session.currentSpeakerId !== session.baseSpeaker.entityId) {
        this.applySpeakerHeader(session.baseSpeaker);
        session.currentSpeakerId = session.baseSpeaker.entityId;
      }

      // Apply one-time node-entry effects if declared
      if (node.effects && !session.appliedEffectNodes.has(nodeId)) {
        session.appliedEffectNodes.add(nodeId);
        this.applyNarrativeEffects(node.effects, session);
      }

      g.setDialogueText(node.text);

      const noteEl = document.getElementById('dlg-clinical-note');
      if (node.note) {
        noteEl.classList.remove('hidden');
        noteEl.textContent = node.note;
      } else {
        noteEl.classList.add('hidden');
      }

      const choicesEl = document.getElementById('dlg-choices');
      choicesEl.innerHTML = '';

      const availableChoices = (node.choices || []).filter(ch => {
        if (typeof ch.condition === 'function' && !ch.condition(g, session.entityData)) return false;
        if (ch.conditions && !this.evaluateConditions(ch.conditions, session.entityData, session.currentSpeakerId)) return false;
        return true;
      });

      availableChoices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        const badge = this.formatChoiceBadge(choice);
        btn.innerHTML = `<span>${choice.text}</span><span class="choice-tag">${badge}</span>`;
        btn.addEventListener('click', () => this.selectChoice(nodeId, choice, idx));
        choicesEl.appendChild(btn);
      });
    }

    selectChoice(nodeId, choice, idx) {
      const g = this.game;
      const session = this.activeSession;
      if (!session) return;

      const eff = choice.effects || {};
      this.applyNarrativeEffects(eff, session);

      if (g.events) {
        g.events.emit('dialogue:choice', {
          entityId: session.entityId,
          speakerId: session.currentSpeakerId || session.entityId,
          nodeId,
          choiceIndex: idx,
          intent: choice.intent || choice.type || 'NEUTRAL'
        });
      }

      if (choice.directAction) {
        choice.directAction();
        return;
      }

      const acc = session.accumulatedEffects;

      // Multi-turn transition to next node (accumulate any mechanical deltas for leaf resolution)
      if (choice.next && session.graph.nodes[choice.next]) {
        if (typeof eff.bondDelta === 'number') acc.bondDelta += eff.bondDelta;
        if (typeof eff.stubbornDelta === 'number') acc.stubbornDelta += eff.stubbornDelta;
        if (typeof eff.staminaDelta === 'number') acc.staminaDelta += eff.staminaDelta;
        if (typeof eff.hydrationDelta === 'number') acc.hydrationDelta += eff.hydrationDelta;
        if (Array.isArray(eff.revealNeighbors)) {
          eff.revealNeighbors.forEach(n => {
            if (!acc.revealNeighbors.includes(n)) acc.revealNeighbors.push(n);
          });
        }
        if (eff.revealOneUnknown) acc.revealOneUnknown = true;
        if (eff.flag) acc.flag = eff.flag;

        this.renderNode(choice.next);
        return;
      }

      // Leaf choice: merge accumulated intermediate effects with leaf effects
      const mergedNeighbors = [...acc.revealNeighbors];
      if (Array.isArray(eff.revealNeighbors)) {
        eff.revealNeighbors.forEach(n => {
          if (!mergedNeighbors.includes(n)) mergedNeighbors.push(n);
        });
      }

      const leafBond = typeof eff.bondDelta === 'number' ? eff.bondDelta : 0;
      const syntheticChoice = {
        type: choice.type || 'EMPATHY',
        bondDelta: acc.bondDelta + leafBond,
        stubbornDelta: acc.stubbornDelta + (eff.stubbornDelta || 0),
        staminaDelta: acc.staminaDelta + (eff.staminaDelta || 0),
        hydrationDelta: acc.hydrationDelta + (eff.hydrationDelta || 0),
        revealNeighbors: mergedNeighbors.length > 0 ? mergedNeighbors : null,
        revealOneUnknown: acc.revealOneUnknown || !!eff.revealOneUnknown,
        flag: eff.flag || acc.flag || null,
        reply: choice.onPick ? choice.onPick() : (choice.reply || '“Obrigado pela conversa!”')
      };

      // Refresh bond UI for NPC/Staff if npcBondDelta changed during conversation
      if (g.storyState && g.storyState.hasNpcBondEntry(session.entityId)) {
        const updatedBond = g.storyState.getNpcBond(session.entityId);
        document.getElementById('dlg-hearts').textContent = g.renderHearts(updatedBond);
        document.getElementById('dlg-bond-val').textContent = `${updatedBond}% (${g.storyState.getBondLabel(updatedBond)})`;
      }

      if (typeof session.onFinish === 'function') {
        session.onFinish(syntheticChoice);
      } else {
        g.setDialogueText(syntheticChoice.reply);
        const choicesEl = document.getElementById('dlg-choices');
        choicesEl.innerHTML = '';
        const btnDone = document.createElement('button');
        btnDone.className = 'choice-btn';
        btnDone.innerHTML = '<span>Prosseguir</span><span class="choice-tag">Continuar</span>';
        btnDone.addEventListener('click', () => g.closeOverlays());
        choicesEl.appendChild(btnDone);
      }
    }
  }

  global.DialogueSystem = DialogueSystem;
})(window);

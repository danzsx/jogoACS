// ============================================================================
// TERRITÓRIO VIVO — STORY & COMMUNITY QUEST SYSTEM (Etapas H2 & H3)
// ============================================================================
// Missões declarativas orientadas a eventos (EventBus):
//   - Prólogo (Cap 0): q0_primeira_prancheta ("Primeira Prancheta")
//   - Capítulo 1: q1_ecos_da_fila ("Portas Fechadas, Janelas Abertas")
//   - Capítulo 2: q2_alem_do_prontuario ("O Que Não Cabe no Prontuário")
//   - Capítulo 3: q3_sobrecarga_e_fratura ("Sobrecarga & Fratura")
//   - 4 Arcos Secundários Comunitários (qs_balanco_guiche, qs_sombra_baixada,
//     qs_canteiro_domino, qs_turno_noite)

(function (global) {
  'use strict';

  const CHAPTER_META = {
    0: { id: 0, kicker: 'PRÓLOGO', title: 'Primeira Prancheta', desc: 'Conhecer a Sala ESF, escutar a microárea e sentir o pulso da esquina.' },
    1: { id: 1, kicker: 'CAPÍTULO 1', title: 'Portas Fechadas, Janelas Abertas', desc: 'Entender por que a fila da UBS tensiona e mediar o primeiro impasse entre equipe e bairro.' },
    2: { id: 2, kicker: 'CAPÍTULO 2', title: 'O Que Não Cabe no Prontuário', desc: 'Conectar pistas da rua, a Associação da Tia Bete e a confiança das famílias.' },
    3: { id: 3, kicker: 'CAPÍTULO 3', title: 'Sobrecarga & Fratura', desc: 'Sustentar decisões difíceis diante da escassez, pressão da equipe e escolhas éticas.' },
    4: { id: 4, kicker: 'CAPÍTULO 4', title: 'Mesa Posta na Pracinha', desc: 'Mobilizar a Vila Esperança para a Assembleia Aberta e o desfecho coletivo.' },
    5: { id: 5, kicker: 'EPÍLOGO', title: 'Território Vivo', desc: 'Campanha concluída — vida contínua na comunidade.' }
  };

  const STORY_QUESTS = [
    // ========================================================================
    // PRÓLOGO (CAPÍTULO 0): PRIMEIRA PRANCHETA
    // ========================================================================
    {
      id: 'q0_primeira_prancheta',
      type: 'main',
      chapter: 0,
      title: 'Primeira Prancheta',
      summary: 'Apresente-se na Sala ESF, sinta a rotina da rua e faça sua primeira parada na Vendinha do Zé.',
      steps: [
        {
          id: 'q0_step_esf',
          label: 'Converse com a colega Joana na Sala ESF (UBS 08h–18h)',
          hint: 'Entre na UBS Vila Esperança e atravesse a porta da Sala ESF à direita.',
          targetNpcId: 'acs_joana',
          targetPin: { type: 'UBS', id: 'UBS' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q0_joana_acolheu'),
          dialogueGraph: {
            startNode: 'joana_chegada',
            nodes: {
              joana_chegada: {
                speaker: 'acs_joana',
                text: '“Ei, Alex! Que bom te ver de colete azul aqui na Sala ESF! Antes da correria da planilha, puxa uma cadeira: todo mundo acha que ser ACS é só anotar ficha, mas nossa função mesmo é ser a ponte entre essas paredes e o portão das casas.”',
                note: 'Prólogo • Primeiros passos na Equipe Saúde da Família.',
                choices: [
                  {
                    text: 'Dizer que quer aprender o jeito do bairro e não chegar impondo regra.',
                    intent: '💛 Escuta territorial',
                    next: 'joana_orienta',
                    effects: {
                      postureDelta: { acolhimento: 1 },
                      npcBondDelta: { acs_joana: 6 }
                    }
                  },
                  {
                    text: 'Perguntar como organizar rápido as prioridades para dar conta das 15 casas.',
                    intent: '📋 Focar no planejamento',
                    next: 'joana_orienta',
                    effects: {
                      postureDelta: { burocracia: 1 },
                      npcBondDelta: { acs_joana: 4 }
                    }
                  }
                ]
              },
              joana_orienta: {
                speaker: 'acs_joana',
                text: '“Já marquei os primeiros alfinetes pra você. Faz assim: dá um giro por pelo menos 2 casas da Microárea 04 hoje para sentir o clima da rua — e depois passa na Vendinha do Seu Zé tomar um fôlego.”',
                note: 'Objetivo atualizado: conheça o ritmo real das ruas antes de cobrar resultado.',
                choices: [
                  {
                    text: 'Pegar a prancheta, agradecer à Joana e partir para a microárea.',
                    intent: '🚶 Seguir para o bairro',
                    effects: {
                      staminaDelta: 10,
                      setFlags: { q0_joana_acolheu: true },
                      setRecentFlags: { q0_inicio_combinado: true }
                    },
                    reply: '“Boa caminhada, colega! Lembra: água na mochila e ouvido aberto!”'
                  }
                ]
              }
            }
          }
        },
        {
          id: 'q0_step_visitas',
          label: 'Realize pelo menos 2 visitas domiciliares na Microárea 04',
          hint: 'Ande pelas ruas das Acácias, Esperança e Ipês e converse com moradores.',
          targetPin: { type: 'HOUSE', id: 'H01' },
          isSatisfied: (g) => g.weeklyVisits >= 2 || (g.narrative && Object.keys(g.narrative.visitHistory || {}).length >= 2)
        },
        {
          id: 'q0_step_vendinha',
          label: 'Passe na Vendinha do Zé e converse com Seu Zé (07h–21h30)',
          hint: 'Na esquina da Av. da Saúde, a Vendinha concentra as histórias do fim do dia.',
          targetNpcId: 'npc_seu_ze',
          targetPin: { type: 'VENDINHA', id: 'VENDINHA' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q0_vendinha_conversa'),
          dialogueGraph: {
            startNode: 'ze_abertura',
            nodes: {
              ze_abertura: {
                speaker: 'npc_seu_ze',
                text: '“Opa, então você é o(a) agente novo(a) da Microárea 04! Aceita um café passado agora? O pessoal aqui da esquina anda comentando que o postinho anda apertado e cheio de boato de avaliação...”',
                note: 'Prólogo • Vendinha & Padaria do Seu Zé — termômetro informal do bairro.',
                choices: [
                  {
                    text: 'Aceitar o café e perguntar sem pressão o que o pessoal tem sentido no atendimento.',
                    intent: '☕ Ouvir a esquina',
                    next: 'ze_resposta',
                    effects: {
                      postureDelta: { acolhimento: 1, articulacao: 1 },
                      npcBondDelta: { npc_seu_ze: 8 },
                      setFlags: { vendinha_coffee: true }
                    }
                  },
                  {
                    text: 'Agradecer e explicar que a UBS precisa justamente mapear quem trabalha fora.',
                    intent: '🩺 Explicar o trabalho',
                    next: 'ze_resposta',
                    effects: {
                      postureDelta: { firmeza: 1 },
                      npcBondDelta: { npc_seu_ze: 5 }
                    }
                  }
                ]
              },
              ze_resposta: {
                speaker: 'npc_seu_ze',
                text: '“A gente vê de tudo desse lado do balcão: gente que volta do serviço depois das 18h sem conseguir receita, e gente no guichê da UBS segurando bomba sozinho. Fica atento aos corredores lá do posto!”',
                note: 'Prólogo concluído — os primeiros sinais do Capítulo 1 acabam de aparecer.',
                choices: [
                  {
                    text: 'Agradecer ao Seu Zé pela sinceridade e seguir atento aos sinais na UBS.',
                    intent: '🔍 Iniciar Capítulo 1',
                    effects: {
                      staminaDelta: 15,
                      setFlags: { q0_vendinha_conversa: true },
                      setRecentFlags: { prologo_concluido: true },
                      triggerPhoneMsg: {
                        key: 'h2_cap1_start_dete',
                        sender: 'Dona Sueli (UBS)',
                        text: 'Alex, quando puder passar aqui pela UBS Vila Esperança, dá uma chegadinha no corredor perto da recepção. Tem gente saindo chateada com horário de ficha hoje...'
                      }
                    },
                    reply: '“A porta da Vendinha tá sempre aberta pro pessoal que cuida do bairro com respeito!”'
                  }
                ]
              }
            }
          }
        }
      ],
      onComplete(g) {
        if (g.storyState && g.storyState.chapter < 1) {
          g.storyState.chapter = 1;
          if (typeof g.showChapterBanner === 'function') g.showChapterBanner(1);
        }
        if (g.quests) {
          g.quests.startQuest('q1_ecos_da_fila');
          g.quests.startQuest('qs_sombra_baixada', { silent: true });
        }
      }
    },

    // ========================================================================
    // CAPÍTULO 1: PORTAS FECHADAS, JANELAS ABERTAS
    // ========================================================================
    {
      id: 'q1_ecos_da_fila',
      type: 'main',
      chapter: 1,
      title: 'Portas Fechadas, Janelas Abertas',
      summary: 'Descubra por que moradores estão perdendo atendimentos na UBS e enfrente a primeira tensão pública na recepção.',
      steps: [
        {
          id: 'q1_step_sueli',
          label: 'Converse com Dona Sueli no corredor da UBS (08h–18h)',
          hint: 'Dona Sueli fica no corredor central da UBS e enxerga o que acontece após a negativa no guichê.',
          targetNpcId: 'limpeza',
          targetPin: { type: 'UBS', id: 'UBS' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q1_sueli_pista'),
          dialogueGraph: {
            startNode: 'sueli_corredor',
            nodes: {
              sueli_corredor: {
                speaker: 'limpeza',
                text: '“Que bom que veio, meu filho! Olha, não espalha que fui eu, mas de manhã vi moradora sair engolindo o choro perto do bebedouro... Perdeu o encaixe porque o ônibus atrasou e já levou falta no sistema.”',
                note: 'Dona Sueli percebe o impacto humano por trás das estatísticas de ausência.',
                choices: [
                  {
                    text: 'Ouvir com calma e perguntar quem costuma puxar a voz quando a fila aperta.',
                    intent: '💬 Investigar o corredor',
                    next: 'sueli_detalhe',
                    effects: {
                      postureDelta: { acolhimento: 1 },
                      npcBondDelta: { limpeza: 8 }
                    }
                  }
                ]
              },
              sueli_detalhe: {
                speaker: 'limpeza',
                text: '“O Renan ali no guichê já tá com a cabeça fervendo de tanta cobrança, e a Dona Carla tá reunindo queixas das famílias da sua microárea. Escuta o lado de quem tá lá na rua antes que isso estoure na recepção!”',
                note: 'Pista obtida: converse com moradores no bairro antes de voltar à UBS.',
                choices: [
                  {
                    text: 'Anotar a pista da Dona Sueli e ir escutar o território.',
                    intent: '🔍 Ouvir moradores',
                    effects: {
                      setFlags: { q1_sueli_pista: true },
                      setRecentFlags: { sueli_contou_fila: true }
                    },
                    reply: '“Vai lá com jeitinho, meu bem. Aqui todo mundo tá exausto, tanto quem atende quanto quem espera.”'
                  }
                ]
              }
            }
          }
        },
        {
          id: 'q1_step_territorio',
          label: 'Escute famílias sobre horários/fila (visitas até 4 ou conversa com H02/H04/H08/H12)',
          hint: 'Visite casas ou encontre moradores na Feira, Vendinha ou Sala de Espera.',
          targetPin: { type: 'VENDINHA', id: 'VENDINHA' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q1_territorio_ouvido'),
          checkProgress: (g) => {
            if (!g.storyState || !g.storyState.hasFlag('q1_sueli_pista')) return false;
            const vh = (g.narrative && g.narrative.visitHistory) || {};
            const heardSpecific = ['H02', 'H04', 'H06', 'H08', 'H10', 'H12'].some(id => !!vh[id]);
            return heardSpecific || g.weeklyVisits >= 4;
          },
          onSatisfied(g) {
            if (g.storyState) g.storyState.setFlag('q1_territorio_ouvido', true);
            if (g.phone) {
              const d = g.getCurrentDayData ? g.getCurrentDayData() : { shortName: 'Dia' };
              g.phone.pushMessage(
                'h2_cap1_urgente_marina',
                'Enfª Marina (UBS)',
                `Sem. ${g.weekNumber} • ${d.shortName} ${g.formatClock(g.timeMinutes)}`,
                'Alex, o clima esquentou aqui na recepção! A Dona Carla trouxe reclamações da fila bem na hora da troca de turno. Se puder passar na UBS hoje (08h–18h), precisamos de você!'
              );
            }
          }
        },
        {
          id: 'q1_step_climax_ubs',
          label: 'Vá até a UBS Vila Esperança (08h–18h) para enfrentar o impasse na recepção',
          hint: 'Entre na UBS Vila Esperança para presenciar a discussão entre Dona Carla, Renan e Enfª Marina.',
          targetPin: { type: 'UBS', id: 'UBS' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q1_climax_ubs_visto')
        }
      ],
      onComplete(g) {
        if (g.storyState && g.storyState.chapter < 2) {
          g.storyState.chapter = 2;
          if (typeof g.showChapterBanner === 'function') g.showChapterBanner(2);
        }
        if (g.worldState) {
          const cap1Posture = g.storyState && g.storyState.getFlag('cap1_ubs_postura');
          g.worldState.setUBSMural(cap1Posture === 'protocolo' ? 'protocolo' : 'acolhimento');
        }
        if (g.phone) {
          const d = g.getCurrentDayData ? g.getCurrentDayData() : { shortName: 'Dia' };
          g.phone.pushMessage(
            'h2_cap2_tease_bete',
            'Tia Bete (Associação)',
            `Sem. ${g.weekNumber} • ${d.shortName}`,
            'Soube da movimentação lá no posto, Alex! O que não cabe no prontuário a gente precisa resolver aqui fora com a comunidade. Passa aqui na Associação ou investiga os pontos do bairro!'
          );
        }
        if (g.quests) {
          g.quests.startQuest('q2_alem_do_prontuario');
          g.quests.startQuest('qs_balanco_guiche', { silent: true });
          g.quests.startQuest('qs_canteiro_domino', { silent: true });
          g.quests.startQuest('qs_turno_noite', { silent: true });
        }
      }
    },

    // ========================================================================
    // CAPÍTULO 2: O QUE NÃO CABE NO PRONTUÁRIO
    // ========================================================================
    {
      id: 'q2_alem_do_prontuario',
      type: 'main',
      chapter: 2,
      title: 'O Que Não Cabe no Prontuário',
      summary: 'Investigue pistas pelo bairro, alinhe com Dr. Henrique e reative a aliança da Associação com Tia Bete.',
      steps: [
        {
          id: 'q2_step_circular',
          label: 'Leia a Circular no mural da recepção da UBS ou converse com Dr. Henrique',
          hint: 'Há um ponto de investigação [?] no mural perto da recepção da UBS, ou fale no Consultório Médico.',
          targetNpcId: 'medico',
          targetPin: { type: 'UBS', id: 'UBS' },
          isSatisfied: (g) => {
            const hasClue = g.worldState && g.worldState.hasClue('clue_mural_ubs');
            const hasFlag = g.storyState && g.storyState.hasFlag('q2_medico_circular');
            return !!(hasClue || hasFlag);
          },
          dialogueGraph: {
            startNode: 'medico_cap2',
            nodes: {
              medico_cap2: {
                speaker: 'medico',
                text: '“Alex, entra aqui um minuto... Chegou circular nova cobrando comprovação de impacto territorial da Microárea 04 até o fim deste ciclo. Sem evidência do que acontece na rua, podem cortar horas da equipe.”',
                note: 'Capítulo 2 • Pressão institucional real sobre a UBS Vila Esperança.',
                choices: [
                  {
                    text: 'Propor cruzar os casos clínicos com o que a comunidade enfrenta na praça, na baixada e na vendinha.',
                    intent: '🔍 Mapear causas reais',
                    effects: {
                      npcBondDelta: { medico: 6 },
                      postureDelta: { articulacao: 1 },
                      setFlags: { q2_medico_circular: true },
                      setRecentFlags: { ubs_pressionada_circular: true }
                    },
                    reply: '“Exato! Traga fatos concretos do bairro — a Associação da Tia Bete conhece metade desse histórico.”'
                  }
                ]
              }
            }
          }
        },
        {
          id: 'q2_step_pistas',
          label: 'Investigue pelo menos 2 pontos do território (ícones [?] na UBS, Vendinha, Baixada, Horta ou Pracinha)',
          hint: 'Procure pontos com ponto de interrogação [?] e aperte [E] para investigar.',
          targetPin: { type: 'HORTA', id: 'HORTA' },
          isSatisfied: (g) => g.worldState && g.worldState.getCluesFound().length >= 2
        },
        {
          id: 'q2_step_tia_bete',
          label: 'Fale com Tia Bete na Associação de Moradores (09h–19h) ou Horta (Sáb manhã)',
          hint: 'Compartilhe o que você levantou no bairro para destravar o mutirão da Horta.',
          targetNpcId: 'npc_tia_bete',
          targetPin: { type: 'ASSOCIACAO', id: 'ASSOCIACAO' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q2_bete_mutirao_plano'),
          dialogueGraph: {
            startNode: 'bete_cap2_abre',
            nodes: {
              bete_cap2_abre: {
                speaker: 'npc_tia_bete',
                text: '“Olha só quem voltou trazendo leitura de rua debaixo do braço! Já vi tanta gente prometer mutirão pra tirar foto e depois sumir... Mas se você quer mesmo unir a UBS com a gente, vamos começar limpando os canteiros da Horta.”',
                note: 'Capítulo 2 • Tia Bete testa o compromisso real de Alex.',
                choices: [
                  {
                    text: 'Assumir o compromisso de chamar moradores do Dominó/Feira pra reerguer a Horta junto com a Associação.',
                    intent: '🌱 Puxar o mutirão',
                    next: 'bete_cap2_fecha',
                    effects: {
                      postureDelta: { articulacao: 2 },
                      npcBondDelta: { npc_tia_bete: 10 },
                      setFlags: { tia_bete_ally: true }
                    }
                  },
                  {
                    text: 'Combinar um cronograma objetivo entre reuniões da quarta e atendimentos da UBS.',
                    intent: '📋 Organizar cronograma',
                    next: 'bete_cap2_fecha',
                    effects: {
                      postureDelta: { burocracia: 1, articulacao: 1 },
                      npcBondDelta: { npc_tia_bete: 7 },
                      setFlags: { tia_bete_ally: true }
                    }
                  }
                ]
              },
              bete_cap2_fecha: {
                speaker: 'npc_tia_bete',
                text: '“Fechado! Já mandei passar o rastelo nos primeiros canteiros lá na Horta. Agora conversa com alguém da Feira ou da roda de Dominó (Seu Raimundo, Seu Tião, Dona Neide ou Seu Tonho) para trazê-los pro grupo!”',
                note: 'Estado do Mundo atualizado: a Horta Comunitária começou a ganhar vida (Estágio 1).',
                choices: [
                  {
                    text: 'Ir conversar com moradores da comunidade para somar ao mutirão.',
                    intent: '🤝 Mobilizar moradores',
                    effects: {
                      hortaStageMin: 1,
                      setFlags: { q2_bete_mutirao_plano: true },
                      setRecentFlags: { horta_mutirao_aberto: true }
                    },
                    reply: '“Bora! Quando a praça e a horta conversam, o bairro inteiro acorda.”'
                  }
                ]
              }
            }
          }
        },
        {
          id: 'q2_step_mobilizar',
          label: 'Converse com Seu Raimundo (H07), Seu Tião (H04), Dona Neide (H05) ou Seu Tonho (H14)',
          hint: 'Pode ser numa visita em casa, na Feira de Terça, Associação de Quarta ou Dominó na Pracinha.',
          targetPin: { type: 'PRACA', id: 'PRACINHA' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q2_moradores_mobilizados'),
          checkProgress: (g) => {
            if (!g.storyState || !g.storyState.hasFlag('q2_bete_mutirao_plano')) return false;
            return !!g.storyState.hasFlag('q2_moradores_mobilizados');
          }
        }
      ],
      onComplete(g) {
        if (g.worldState) {
          g.worldState.advanceHortaStage(2, 'cap2_complete');
        }
        if (g.storyState && g.storyState.chapter < 3) {
          g.storyState.chapter = 3;
          if (typeof g.showChapterBanner === 'function') g.showChapterBanner(3);
        }
        if (g.phone) {
          const d = g.getCurrentDayData ? g.getCurrentDayData() : { shortName: 'Dia' };
          g.phone.pushMessage(
            'h3_cap3_alerta_joana',
            'ACS Joana (ESF)',
            `Sem. ${g.weekNumber} • ${d.shortName}`,
            'Alex, passa na Sala ESF assim que puder... A chuva acumulou foco na baixada, o Tiago tá no limite com as metas e veio cobrança pesada pra fechar relatório hoje.'
          );
        }
        if (g.quests) {
          g.quests.startQuest('q3_sobrecarga_e_fratura');
        }
      }
    },

    // ========================================================================
    // CAPÍTULO 3: SOBRECARGA & FRATURA
    // ========================================================================
    {
      id: 'q3_sobrecarga_e_fratura',
      type: 'main',
      chapter: 3,
      title: 'Sobrecarga & Fratura',
      summary: 'Apoie a equipe sob pressão, cheque a realidade da Vendinha/rua e encare o dilema central na UBS.',
      steps: [
        {
          id: 'q3_step_tiago',
          label: 'Converse com Tiago na Sala ESF sobre o peso da semana (UBS 08h–18h)',
          hint: 'Entre na Sala ESF dentro da UBS e apoie seu colega de microárea.',
          targetNpcId: 'acs_tiago',
          targetPin: { type: 'UBS', id: 'UBS' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q3_tiago_ouvido'),
          dialogueGraph: {
            startNode: 'tiago_sobrecarga',
            nodes: {
              tiago_sobrecarga: {
                speaker: 'acs_tiago',
                text: '“Tô por um fio hoje, Alex... A supervisão quer planilha fechada até amanhã, duas famílias não abrem portão e ainda sobrou foco d\'água na baixada. Às vezes parece que só querem saber de número no e-SUS!”',
                note: 'Capítulo 3 • Desgaste emocional dentro da equipe ESF.',
                choices: [
                  {
                    text: 'Sentar com o Tiago e dividir estratégias de campo sem culpá-lo pelo gargalo.',
                    intent: '🤝 Dividir o peso com o colega',
                    next: 'tiago_respira',
                    effects: {
                      postureDelta: { acolhimento: 1, articulacao: 1 },
                      npcBondDelta: { acs_tiago: 10 },
                      setFlags: { q3_tiago_apoiado: true }
                    }
                  },
                  {
                    text: 'Lembrar que foco alto na área exige resposta firme e corrida contra o relógio.',
                    intent: '⚡ Cobrar ritmo de entrega',
                    next: 'tiago_respira',
                    effects: {
                      postureDelta: { firmeza: 1, burocracia: 1 },
                      npcBondDelta: { acs_tiago: -4 }
                    }
                  }
                ]
              },
              tiago_respira: {
                speaker: 'acs_tiago',
                text: '“Valeu pela real, Alex. Olha, antes de encarar a reunião com a gestão na UBS, dá um pulo na rua ou passa na Vendinha do Zé pra sentir quem tá mais apertado nessa virada de mês.”',
                note: 'Próximo passo: confira o campo e converse com Seu Zé.',
                choices: [
                  {
                    text: 'Seguir para o território para levantar o panorama real.',
                    intent: '🚶 Ir ao território',
                    effects: {
                      setFlags: { q3_tiago_ouvido: true }
                    },
                    reply: '“Tô tentando segurar as pontas aqui no e-SUS enquanto você fecha os dados de rua!”'
                  }
                ]
              }
            }
          }
        },
        {
          id: 'q3_step_ze_e_campo',
          label: 'Fale com Seu Zé na Vendinha e mantenha a ação em campo (visitas >= 6 ou foco eliminado)',
          hint: 'Converse com Seu Zé sobre o aperto das famílias no fim de mês e faça trabalho de rua.',
          targetNpcId: 'npc_seu_ze',
          targetPin: { type: 'VENDINHA', id: 'VENDINHA' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q3_ze_balanco'),
          dialogueGraph: {
            startNode: 'ze_cap3',
            nodes: {
              ze_cap3: {
                speaker: 'npc_seu_ze',
                text: '“A coisa apertou essa semana, Alex. Tem gente escolhendo entre pagar conta de água e comprar remédio que faltou na farmácia popular. Se o posto reduzir atendimento aqui, o bairro sente no dia seguinte.”',
                note: 'Capítulo 3 • Seu Zé mostra a urgência antes da reunião na UBS.',
                choices: [
                  {
                    text: 'Assumir o compromisso de levar a realidade inteira da microárea para dentro da UBS.',
                    intent: '✊ Defender a comunidade',
                    effects: {
                      npcBondDelta: { npc_seu_ze: 8 },
                      postureDelta: { articulacao: 1 },
                      setFlags: { q3_ze_balanco: true },
                      triggerPhoneMsg: {
                        key: 'h3_cap3_reuniao_ubs',
                        sender: 'Dr. Henrique (UBS)',
                        text: 'Alex, Dona Carla e Tia Bete acabaram de chegar na UBS junto com a Enfª Marina. Venha para a UBS agora definir qual relatório vamos enviar à Secretaria.'
                      }
                    },
                    reply: '“Vai firme lá no posto, Alex! A Vila Esperança inteira tá de olho no que vai sair dessa sala.”'
                  }
                ]
              }
            }
          }
        },
        {
          id: 'q3_step_campo_minimo',
          label: 'Garanta presença em campo (elimine 1+ foco de dengue ou some 6+ visitas na semana)',
          hint: 'Vistorie focos amarelos de dengue com [E] ou visite casas da Microárea 04.',
          targetPin: { type: 'HOUSE', id: 'H01' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q3_campo_ok'),
          checkProgress: (g) => {
            if (!g.storyState || !g.storyState.hasFlag('q3_ze_balanco')) return false;
            return g.dengueClearedCount >= 1 || g.weeklyVisits >= 6;
          },
          onSatisfied(g) {
            if (g.storyState) g.storyState.setFlag('q3_campo_ok', true);
          }
        },
        {
          id: 'q3_step_fratura_ubs',
          label: 'Entre na UBS Vila Esperança (08h–18h) para a reunião decisiva do Capítulo 3',
          hint: 'Enfrente o dilema entre proteger números imediatos ou convocar Assembleia Aberta na Pracinha.',
          targetPin: { type: 'UBS', id: 'UBS' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q3_fratura_resolvida')
        }
      ],
      onComplete(g) {
        if (g.storyState && g.storyState.chapter < 4) {
          g.storyState.chapter = 4;
          if (typeof g.showChapterBanner === 'function') g.showChapterBanner(4);
        }
        if (g.quests) {
          g.quests.startQuest('q4_mesa_posta_pracinha');
        }
      }
    },

    // ========================================================================
    // CAPÍTULO 4: MESA POSTA NA PRACINHA (CLÍMAX & EPÍLOGO)
    // ========================================================================
    {
      id: 'q4_mesa_posta_pracinha',
      type: 'main',
      chapter: 4,
      title: 'Mesa Posta na Pracinha',
      summary: 'Reúna a comunidade e a equipe da UBS para a grande Assembleia Aberta & Mutirão na Pracinha dos Ipês.',
      steps: [
        {
          id: 'q4_step_convites',
          label: 'Confirme a pauta da Assembleia com Tia Bete (Associação/Horta) ou Seu Zé (Vendinha)',
          hint: 'Visite a Associação de Moradores (09h–19h) ou a Vendinha do Zé para confirmar a mesa posta.',
          targetNpcId: 'npc_tia_bete',
          targetPin: { type: 'ASSOCIACAO', id: 'ASSOCIACAO' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q4_convites_ok'),
          dialogueGraph: {
            startNode: 'bete_cap4_convite',
            nodes: {
              bete_cap4_convite: {
                speaker: 'npc_tia_bete',
                text: '“Alex! As toalhas quadriculadas já estão separadas e Seu Zé prometeu duas garrafas térmicas de café fresco. Só falta você alinhar com a equipe da UBS o mapa das famílias pra gente abrir a Assembleia na Pracinha dos Ipês!”',
                note: 'Capítulo 4 • Preparação coletiva da Assembleia Aberta na Pracinha.',
                choices: [
                  {
                    text: 'Confirmar a participação dos moradores e ir alinhar os dados finais com a UBS.',
                    intent: '🤝 Fechar a pauta comunitária',
                    effects: {
                      npcBondDelta: { npc_tia_bete: 8 },
                      postureDelta: { articulacao: 1 },
                      setFlags: { q4_convites_ok: true }
                    },
                    reply: '“Bora! Passa na UBS pra chamar Joana, Marina e Dr. Henrique — depois nos encontramos direto na Pracinha dos Ipês!”'
                  }
                ]
              }
            }
          }
        },
        {
          id: 'q4_step_equipe',
          label: 'Alinhe a fala da equipe com Joana na Sala ESF (UBS 08h–18h)',
          hint: 'Entre na UBS Vila Esperança e converse com Joana na Sala ESF para levar os dados do território.',
          targetNpcId: 'acs_joana',
          targetPin: { type: 'UBS', id: 'UBS' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q4_equipe_ok'),
          dialogueGraph: {
            startNode: 'joana_cap4_prepara',
            nodes: {
              joana_cap4_prepara: {
                speaker: 'acs_joana',
                text: '“Tudo separado na pasta azul, Alex! Marina e Dr. Henrique já vestiram o jaleco e estão prontos pra caminhar até a Pracinha dos Ipês com você. Respira fundo: hoje a Microárea 04 fala em voz alta!”',
                note: 'Capítulo 4 • Equipe ESF pronta para a Assembleia na Pracinha.',
                choices: [
                  {
                    text: 'Seguir com a equipe para a Pracinha dos Ipês e abrir a Assembleia.',
                    intent: '🌳 Ir para a Pracinha dos Ipês',
                    effects: {
                      npcBondDelta: { acs_joana: 8, enfermeira_marina: 5, medico: 5 },
                      setFlags: { q4_equipe_ok: true },
                      triggerPhoneMsg: {
                        key: 'h4_pracinha_pronta',
                        sender: 'Tia Bete (Associação)',
                        text: 'A mesa já está posta debaixo dos ipês na Pracinha! Quando você chegar aqui na praça com a equipe, começamos a Assembleia Aberta!'
                      }
                    },
                    reply: '“Nos vemos lá debaixo dos ipês, colega! Hoje a Vila Esperança inteira vai se ouvir!”'
                  }
                ]
              }
            }
          }
        },
        {
          id: 'q4_step_assembleia',
          label: 'Vá até a Pracinha dos Ipês para a Assembleia Aberta (Cutscene Final)',
          hint: 'Caminhe até o centro da Pracinha dos Ipês no mapa para iniciar a cena coral do desfecho.',
          targetPin: { type: 'PRACA', id: 'PRACINHA' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('q4_assembleia_concluida')
        }
      ],
      onComplete(g) {
        if (g.storyState) {
          g.storyState.setFlag('campaign_completed', true);
          if (g.storyState.chapter < 5) {
            g.storyState.chapter = 5;
          }
        }
        if (g.worldState) {
          g.worldState.setPracinhaStatus('celebracao');
          g.worldState.advanceHortaStage(3, 'cap4_assembleia');
        }
        if (typeof g.showChapterBanner === 'function') {
          g.showChapterBanner(5);
        }
        if (typeof g.showCampaignEndingModal === 'function') {
          g.showCampaignEndingModal();
        }
      }
    },

    // ========================================================================
    // 4 ARCOS SECUNDÁRIOS INTERLIGADOS (COMUNIDADE & EQUIPE)
    // ========================================================================
    {
      id: 'qs_sombra_baixada',
      type: 'side',
      chapter: 1,
      title: 'Sombra na Baixada',
      summary: 'Conecte o acúmulo na baixada perto da Horta às vozes da Feira e da prevenção de dengue.',
      steps: [
        {
          id: 'qs_sombra_pista',
          label: 'Investigue o acúmulo de entulho na esquina da Baixada (perto da Rua dos Ipês)',
          hint: 'Procure o ponto [?] ao sul da Rua dos Ipês, perto da entrada da Horta.',
          targetPin: { type: 'HORTA', id: 'HORTA' },
          isSatisfied: (g) => g.worldState && g.worldState.hasClue('clue_baixada_entulho')
        },
        {
          id: 'qs_sombra_acao',
          label: 'Elimine pelo menos 2 focos de dengue ou converse na Feira com Dona Neide/Seu Tonho',
          hint: 'Limpe focos de dengue [E] pelo bairro e mostre que o cuidado é coletivo.',
          targetPin: { type: 'PRACA', id: 'PRACINHA' },
          isSatisfied: (g) => g.dengueClearedCount >= 2 || (g.storyState && g.storyState.hasFlag('qs_sombra_baixada_ok'))
        }
      ],
      onComplete(g) {
        if (g.storyState) {
          g.storyState.setFlag('qs_sombra_baixada_ok', true);
          g.storyState.addNpcBond('npc_tia_bete', 6);
        }
      }
    },
    {
      id: 'qs_balanco_guiche',
      type: 'side',
      chapter: 2,
      title: 'Balanço do Guichê',
      summary: 'Construa uma ponte prática entre Renan (Recepção), Dona Sueli e Dona Carla depois da tensão na UBS.',
      steps: [
        {
          id: 'qs_balanco_renan',
          label: 'Converse com Renan na Recepção da UBS sobre o ritmo da fila',
          hint: 'Fale com o escriturário Renan no balcão da entrada da UBS.',
          targetNpcId: 'escriturario',
          targetPin: { type: 'UBS', id: 'UBS' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('renan_reagiu_carla_h1')
        },
        {
          id: 'qs_balanco_carla',
          label: 'Alinhe o acompanhamento com Dona Carla (UBS Seg manhã / Sex tarde)',
          hint: 'Passe na UBS na segunda de manhã ou sexta à tarde e dialogue com Dona Carla.',
          targetNpcId: 'npc_dona_carla',
          targetPin: { type: 'UBS', id: 'UBS' },
          isSatisfied: (g) => g.storyState && (g.storyState.hasFlag('qs_balanco_carla_fechado') || g.storyState.getNpcBond('npc_dona_carla') >= 45)
        }
      ],
      onComplete(g) {
        if (g.storyState) {
          g.storyState.setFlag('qs_balanco_guiche_ok', true);
          if (g.worldState) g.worldState.setUBSMural('acolhimento');
        }
      }
    },
    {
      id: 'qs_canteiro_domino',
      type: 'side',
      chapter: 2,
      title: 'O Canteiro e a Torneira',
      summary: 'Una Dra. Patrícia (Fisioterapia), o pessoal do Dominó e a Horta Comunitária para fortalecer idosos e canteiros.',
      steps: [
        {
          id: 'qs_canteiro_patricia',
          label: 'Converse com Dra. Patrícia (Sala de Fisioterapia na UBS) sobre atividades na praça/horta',
          hint: 'Entre na UBS e fale com a fisioterapeuta Dra. Patrícia.',
          targetNpcId: 'fisioterapeuta',
          targetPin: { type: 'UBS', id: 'UBS' },
          isSatisfied: (g) => g.storyState && g.storyState.hasFlag('qs_canteiro_fisio_ok'),
          dialogueGraph: {
            startNode: 'patricia_horta',
            nodes: {
              patricia_horta: {
                speaker: 'fisioterapeuta',
                text: '“Adorei a ideia, Alex! Mexer na Horta Comunitária em canteiros elevados ajuda mais a coluna e o humor do Seu Raimundo e do Seu Tião do que dez folhetos de alongamento. Só precisamos consertar a torneira lá!”',
                note: 'Arco Secundário • Saúde + Convivência na Horta.',
                choices: [
                  {
                    text: 'Combinar de checar a torneira da Horta e convidar o pessoal do Dominó.',
                    intent: '🌱 Unir fisioterapia e Horta',
                    effects: {
                      npcBondDelta: { fisioterapeuta: 8 },
                      postureDelta: { articulacao: 1 },
                      setFlags: { qs_canteiro_fisio_ok: true }
                    },
                    reply: '“Me avisa quando os canteiros estiverem firmes que eu levo o grupo de caminhada até lá!”'
                  }
                ]
              }
            }
          }
        },
        {
          id: 'qs_canteiro_horta',
          label: 'Inspecione a torneira da Horta Comunitária [?] para destravar os canteiros',
          hint: 'Vá até o terreno da Horta ao lado da Associação e aperte [E] na área da bomba.',
          targetPin: { type: 'HORTA', id: 'HORTA' },
          isSatisfied: (g) => g.worldState && g.worldState.hasClue('clue_horta_bomba')
        }
      ],
      onComplete(g) {
        if (g.storyState) g.storyState.setFlag('qs_canteiro_domino_ok', true);
        if (g.worldState) g.worldState.advanceHortaStage(2, 'qs_canteiro_domino');
      }
    },
    {
      id: 'qs_turno_noite',
      type: 'side',
      chapter: 2,
      title: 'Turno da Madrugada',
      summary: 'Mapeie a rotina dos moradores noturnos através da Vendinha do Zé e dos recados do balcão.',
      steps: [
        {
          id: 'qs_turno_recados',
          label: 'Leia os recados de trabalhadores dentro da Vendinha do Zé [?]',
          hint: 'Entre na Vendinha e aperte [E] perto da prateleira lateral.',
          targetPin: { type: 'VENDINHA', id: 'VENDINHA' },
          isSatisfied: (g) => g.worldState && g.worldState.hasClue('clue_caderno_vendinha')
        },
        {
          id: 'qs_turno_visita',
          label: 'Visite ou encontre Marcos (H02), Jorge (H06) ou Dr. Cláudio (H10)',
          hint: 'À noite (18h30–21h) eles frequentam a Vendinha ou ficam em casa!',
          targetPin: { type: 'VENDINHA', id: 'VENDINHA' },
          isSatisfied: (g) => {
            const vh = (g.narrative && g.narrative.visitHistory) || {};
            const talkedSocial = g.schedule && g.schedule.informalTalkedToday;
            return ['H02', 'H06', 'H10'].some(id => !!vh[id] || (talkedSocial && talkedSocial.has(id)));
          }
        }
      ],
      onComplete(g) {
        if (g.storyState) {
          g.storyState.setFlag('qs_turno_noite_ok', true);
          g.storyState.addNpcBond('npc_seu_ze', 6);
        }
      }
    }
  ];

  class QuestSystem {
    constructor(game) {
      this.game = game;
      this._bindEvents();
      this.ensureInitialQuest();
    }

    _getStory() {
      return this.game.storyState || null;
    }

    getChapterMeta(chapterNum = null) {
      const ch = chapterNum !== null
        ? chapterNum
        : (this._getStory() ? this._getStory().chapter : 0);
      return CHAPTER_META[ch] || CHAPTER_META[0];
    }

    getDefinition(questId) {
      return STORY_QUESTS.find(q => q.id === questId) || null;
    }

    ensureInitialQuest() {
      const story = this._getStory();
      if (!story) return;
      const activeIds = Object.keys(story.quests.active || {});
      const completed = story.quests.completed || [];

      if (story.chapter === 0 && activeIds.length === 0 && !completed.includes('q0_primeira_prancheta')) {
        this.startQuest('q0_primeira_prancheta', { silent: true });
      } else if (story.chapter === 1 && !this.isActive('q1_ecos_da_fila') && !this.isCompleted('q1_ecos_da_fila')) {
        this.startQuest('q1_ecos_da_fila', { silent: true });
      } else if (story.chapter === 2 && !this.isActive('q2_alem_do_prontuario') && !this.isCompleted('q2_alem_do_prontuario')) {
        this.startQuest('q2_alem_do_prontuario', { silent: true });
      } else if (story.chapter === 3 && !this.isActive('q3_sobrecarga_e_fratura') && !this.isCompleted('q3_sobrecarga_e_fratura')) {
        this.startQuest('q3_sobrecarga_e_fratura', { silent: true });
      } else if (story.chapter === 4 && !this.isActive('q4_mesa_posta_pracinha') && !this.isCompleted('q4_mesa_posta_pracinha')) {
        this.startQuest('q4_mesa_posta_pracinha', { silent: true });
      }
    }

    startQuest(questId, { silent = false } = {}) {
      const story = this._getStory();
      const def = this.getDefinition(questId);
      if (!story || !def) return false;
      if (story.quests.active[questId] || story.quests.completed.includes(questId)) return false;

      story.quests.active[questId] = {
        stepIndex: 0,
        startedAtDay: story.getTotalDayIndex()
      };

      if (!silent && this.game.toast && !this.game.paused) {
        this.game.toast(`📖 Nova Missão: ${def.title}`, 'info');
      }
      if (this.game.events) {
        this.game.events.emit('quest:started', { questId, chapter: def.chapter });
      }
      this.evaluateAll({ silent });
      return true;
    }

    isActive(questId) {
      const story = this._getStory();
      return !!(story && story.quests.active && story.quests.active[questId]);
    }

    isCompleted(questId) {
      const story = this._getStory();
      return !!(story && Array.isArray(story.quests.completed) && story.quests.completed.includes(questId));
    }

    // Returns active quests ordered with 'main' first so activeList[0] is always the current main story objective
    getActiveQuestsList() {
      const story = this._getStory();
      if (!story || !story.quests || !story.quests.active) return [];
      const list = [];
      for (const qId of Object.keys(story.quests.active)) {
        const def = this.getDefinition(qId);
        const state = story.quests.active[qId];
        if (!def || !state) continue;
        const step = def.steps[state.stepIndex] || def.steps[def.steps.length - 1];
        list.push({
          def,
          state,
          stepIndex: state.stepIndex,
          totalSteps: def.steps.length,
          currentStep: step
        });
      }
      list.sort((a, b) => {
        if (a.def.type === b.def.type) return a.def.chapter - b.def.chapter;
        return a.def.type === 'main' ? -1 : 1;
      });
      return list;
    }

    getCompletedQuestsList() {
      const story = this._getStory();
      if (!story || !Array.isArray(story.quests.completed)) return [];
      return story.quests.completed
        .map(id => this.getDefinition(id))
        .filter(Boolean);
    }

    getPrimaryTrackedStep() {
      const active = this.getActiveQuestsList();
      if (active.length === 0) return null;
      return active[0];
    }

    // Called by DialogueResolver (Priority 1) to serve step-specific quest dialogue
    getDialogueForTarget(entityId, _contextType, _payload) {
      const activeList = this.getActiveQuestsList();
      for (const entry of activeList) {
        const step = entry.currentStep;
        if (step && step.targetNpcId === entityId && step.dialogueGraph) {
          return step.dialogueGraph;
        }
      }
      return null;
    }

    evaluateAll({ silent = false } = {}) {
      const g = this.game;
      const story = this._getStory();
      if (!story) return;

      let changed = true;
      let guard = 0;
      while (changed && guard < 12) {
        changed = false;
        guard++;
        for (const qId of Object.keys(story.quests.active || {})) {
          const def = this.getDefinition(qId);
          const qState = story.quests.active[qId];
          if (!def || !qState) continue;

          const step = def.steps[qState.stepIndex];
          if (!step) {
            this.completeQuest(qId, { silent });
            changed = true;
            break;
          }

          let done = false;
          if (typeof step.checkProgress === 'function' && step.checkProgress(g)) {
            done = true;
          } else if (typeof step.isSatisfied === 'function' && step.isSatisfied(g)) {
            done = true;
          }

          if (done) {
            if (typeof step.onSatisfied === 'function') {
              step.onSatisfied(g);
            }
            qState.stepIndex++;
            if (qState.stepIndex >= def.steps.length) {
              this.completeQuest(qId, { silent });
            } else {
              const nextStep = def.steps[qState.stepIndex];
              if (!silent && g.toast && !g.paused) {
                g.toast(`📌 Missão (${def.title}): ${nextStep.label}`, 'info');
              }
              if (g.events) {
                g.events.emit('quest:updated', { questId: qId, stepIndex: qState.stepIndex, stepId: nextStep.id });
              }
            }
            changed = true;
            break;
          }
        }
      }

      if (typeof g.updateStoryHudPill === 'function') {
        g.updateStoryHudPill();
      }
    }

    completeQuest(questId, { silent = false } = {}) {
      const g = this.game;
      const story = this._getStory();
      const def = this.getDefinition(questId);
      if (!story || !def) return;

      delete story.quests.active[questId];
      if (!story.quests.completed.includes(questId)) {
        story.quests.completed.push(questId);
      }

      if (!silent && g.toast && !g.paused) {
        g.toast(`🌟 Missão Concluída: ${def.title}!`, 'success');
      }
      if (g.events) {
        g.events.emit('quest:completed', { questId, title: def.title });
      }
      if (typeof def.onComplete === 'function') {
        def.onComplete(g);
      }
      if (typeof g.updateStoryHudPill === 'function') {
        g.updateStoryHudPill();
      }
    }

    _bindEvents() {
      const g = this.game;
      if (!g.events) return;

      const recheck = () => {
        this.ensureInitialQuest();
        this.evaluateAll({ silent: false });
      };

      g.events.on('dialogue:choice', recheck);
      g.events.on('visit:completed', recheck);
      g.events.on('npc:talked', recheck);
      g.events.on('scene:changed', recheck);
      g.events.on('story:eventCompleted', recheck);
      g.events.on('clue:inspected', recheck);
      g.events.on('dengue:cleared', recheck);
      g.events.on('day:started', () => {
        this.ensureInitialQuest();
        this.evaluateAll({ silent: true });
      });
    }
  }

  global.QuestSystem = QuestSystem;
  global.ACS_STORY_QUESTS = STORY_QUESTS;
  global.ACS_CHAPTER_META = CHAPTER_META;
})(window);

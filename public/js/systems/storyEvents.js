// ============================================================================
// TERRITÓRIO VIVO — STORY EVENTS & HEART EVENTS ENGINE (Etapas H2 & H3)
// ============================================================================
// Motor declarativo para aberturas, clímax de capítulos e Heart Events estilo
// Stardew Valley:
//   - evt_prologo_abertura (Disparo imediato ao iniciar Nova Jornada!)
//   - evt_cap1_climax_ubs (Clímax Cap 1 na recepção da UBS)
//   - evt_cap3_fratura_ubs (Clímax/Dilema Moral Cap 3 na UBS com cast staging)
//   - 7 Heart Events cobrindo equipe UBS, lideranças e moradores

(function (global) {
  'use strict';

  const T = 32;

  const STORY_EVENTS = [
    // ========================================================================
    // PRÓLOGO VISUAL DE ABERTURA (Ao começar Nova Jornada em PLAYER_HOME)
    // ========================================================================
    {
      id: 'evt_prologo_abertura',
      title: 'Prólogo • Primeira Manhã na Vila Esperança',
      scene: 'PLAYER_HOME',
      manualOnly: true, // Chamado ao iniciar Nova Jornada via showIntroModal()
      conditions: {
        maxChapter: 0
      },
      graph: {
        startNode: 'alex_acorda',
        nodes: {
          alex_acorda: {
            speaker: 'player',
            text: '07:00 da manhã. Colete azul dobrado em cima da mesa e o Tablet e-SUS carregando. Hoje é o seu primeiro turno oficial cobrindo a Microárea 04 da Vila Esperança — alguém bate de leve na janela da frente...',
            note: 'Prólogo — Primeira Prancheta • Vila Esperança.',
            choices: [
              {
                text: 'Abrir a janela e ver quem passou tão cedo.',
                intent: '☀️ Começar o dia',
                next: 'joana_janela'
              }
            ]
          },
          joana_janela: {
            speaker: 'acs_joana',
            text: '“Bom dia, Alex! Desculpa passar antes do café, tava indo abrir a UBS! A Microárea 04 ficou meses sem ACS fixo e a coordenação tá cobrando cobertura. Mas escuta uma coisa: número nenhum funciona se a gente não conhecer o povo pelo nome!”',
            note: 'ACS Joana (Colega da Sala ESF) — sua parceira de entrada no território.',
            choices: [
              {
                text: '“Combinado, Joana! Quero começar ouvindo as famílias sem pressa.”',
                intent: '💛 Focar no vínculo humano',
                next: 'joana_despede',
                effects: {
                  postureDelta: { acolhimento: 1 },
                  npcBondDelta: { acs_joana: 4 }
                }
              },
              {
                text: '“Pode deixar! Assim que a UBS abrir às 08h eu passo lá pra gente alinhar as metas.”',
                intent: '📋 Alinhar rotina cedo',
                next: 'joana_despede',
                effects: {
                  postureDelta: { articulacao: 1 },
                  npcBondDelta: { acs_joana: 4 }
                }
              }
            ]
          },
          joana_despede: {
            speaker: 'acs_joana',
            text: '“Isso! Toma um café aí no seu filtro, pega o rumo da rua e quando a UBS abrir às 08h entra na Sala ESF comigo. Ah — e dá uma olhada no celular comunitário [C], o bairro inteiro já acordou!”',
            note: 'Objetivo Ativo: Converse com Joana na Sala ESF (UBS 08h–18h).',
            choices: [
              {
                text: 'Pegar a prancheta e começar a jornada na Vila Esperança!',
                intent: '🦺 Vestir o colete azul',
                effects: {
                  setFlags: { prologo_abertura_vista: true }
                },
                reply: 'Você respirou fundo, vestiu o colete do SUS e deu o primeiro passo pela Vila Esperança.'
              }
            ]
          }
        }
      }
    },

    // ========================================================================
    // CENA CLIMÁTICA DO CAPÍTULO 1 — IMPASSE NA RECEPÇÃO DA UBS
    // ========================================================================
    {
      id: 'evt_cap1_climax_ubs',
      title: 'Capítulo 1 • Impasse na Recepção da UBS',
      scene: 'UBS_INTERIOR',
      timeRange: [8, 18],
      conditions: {
        minChapter: 1,
        maxChapter: 1,
        hasFlags: ['q1_territorio_ouvido'],
        notFlags: ['q1_climax_ubs_visto']
      },
      staging: [
        { type: 'staff', id: 'escriturario', x: 6.0 * T, y: 15.0 * T },
        { type: 'npc', id: 'npc_dona_carla', x: 7.4 * T, y: 17.5 * T, forceScene: 'UBS_INTERIOR' },
        { type: 'staff', id: 'enfermeira_marina', x: 9.2 * T, y: 16.9 * T }
      ],
      graph: {
        startNode: 'carla_cobra',
        nodes: {
          carla_cobra: {
            speaker: 'npc_dona_carla',
            text: '“Não é implicância pessoal, Renan! Mas se uma trabalhadora chega dez minutos depois porque o ônibus não subiu o morro e volta pra casa sem receita de pressão, esse número vira culpa da microárea no relatório!”',
            note: 'Capítulo 1 • Recepção da UBS Vila Esperança — Clímax da fila.',
            choices: [
              {
                text: 'Ouvir a resposta do Renan antes de intervir.',
                intent: '👂 Acompanhar a discussão',
                next: 'renan_responde'
              }
            ]
          },
          renan_responde: {
            speaker: 'escriturario',
            text: '“Dona Carla, eu não invento regra! Quando encaixo fora do horário sem autorização, o sistema trava e sobra pra mim e pra enfermagem segurar a sala lotada até mais tarde!”',
            note: 'Tensão real: pressão institucional sobre o guichê vs. barreiras reais dos moradores.',
            choices: [
              {
                text: 'Virar para a Enfª Marina e para os dois na recepção.',
                intent: '💬 Preparar mediação',
                next: 'marina_pergunta'
              }
            ]
          },
          marina_pergunta: {
            speaker: 'enfermeira_marina',
            text: '“Calma, gente. Alex acabou de chegar da rua e escutou o corredor e as famílias hoje. Antes de fecharmos o relatório dessa semana, qual é a sua leitura do que está acontecendo na Microárea 04?”',
            note: 'Decisão central do Capítulo 1 — sua postura moldará vínculos e o clima da UBS.',
            choices: [
              {
                text: 'Apoiar Dona Carla em público: defender flexibilização de encaixe para quem trabalha fora.',
                intent: '🛡️ Ficar ao lado da fila',
                next: 'fechamento_carla',
                effects: {
                  postureDelta: { acolhimento: 2 },
                  npcBondDelta: { npc_dona_carla: 12, escriturario: -6, enfermeira_marina: 2 },
                  setFlags: { cap1_ubs_postura: 'lado_comunidade' },
                  setRecentFlags: { ubs_debate_comunidade: true }
                }
              },
              {
                text: 'Propor pacto entre os dois lados: janela combinada via ESF + aviso prévio de atraso pelo guichê.',
                intent: '🤝 Construir mediação prática',
                next: 'fechamento_mediacao',
                effects: {
                  postureDelta: { articulacao: 2 },
                  npcBondDelta: { npc_dona_carla: 8, escriturario: 8, enfermeira_marina: 8 },
                  setFlags: { cap1_ubs_postura: 'mediacao' },
                  setRecentFlags: { ubs_debate_mediado: true }
                }
              },
              {
                text: 'Sustentar a regra rígida do guichê para proteger a organização clínica da equipe.',
                intent: '📋 Defender protocolo estrito',
                next: 'fechamento_protocolo',
                effects: {
                  postureDelta: { burocracia: 2, firmeza: 1 },
                  npcBondDelta: { escriturario: 12, enfermeira_marina: 4, npc_dona_carla: -10 },
                  setFlags: { cap1_ubs_postura: 'protocolo' },
                  setRecentFlags: { ubs_debate_protocolo: true }
                }
              }
            ]
          },
          fechamento_carla: {
            speaker: 'npc_dona_carla',
            text: '“Finalmente alguém de dentro falando a língua da rua! Se vocês segurarem uma brecha de acolhimento pros trabalhadores, eu mesma ajudo a avisar o pessoal pra não faltar à toa.”',
            note: 'Dona Carla se aproxima de Alex; Renan fica apreensivo com a sobrecarga no balcão.',
            choices: [
              {
                text: 'Encerrar a conversa e acompanhar os desdobramentos no bairro.',
                intent: '➡️ Concluir Capítulo 1',
                effects: { setFlags: { q1_climax_ubs_visto: true } },
                reply: '“Vamos testar isso na prática. Mas o buraco desse bairro é mais fundo que ficha no guichê — passa na Associação depois.”'
              }
            ]
          },
          fechamento_mediacao: {
            speaker: 'enfermeira_marina',
            text: '“Faz sentido. Se o ACS sinalizar quem trabalha em turno fechado antes das 10h, o Renan reserva duas brechas de encaixe sem virar bagunça na espera. Topa acompanhar isso de perto, Dona Carla?”',
            note: 'Mediação aprovada • Ponte aberta entre equipe ESF, guichê e liderança comunitária.',
            choices: [
              {
                text: 'Confirmar o combinado e encerrar o impasse na recepção.',
                intent: '🤝 Concluir Capítulo 1',
                effects: { setFlags: { q1_climax_ubs_visto: true } },
                reply: '“Combinado! Quando a gente para de procurar culpado e olha o mapa junto, aparece saída.”'
              }
            ]
          },
          fechamento_protocolo: {
            speaker: 'escriturario',
            text: '“Obrigado por segurar a linha com a equipe, Alex. Sem regra clara a unidade inteira trava — mesmo que nem todo mundo na espera goste de ouvir isso.”',
            note: 'Renan se sente amparado; Dona Carla sai insatisfeita cobrando resposta estrutural.',
            choices: [
              {
                text: 'Registrar o posicionamento e seguir o expediente.',
                intent: '📋 Concluir Capítulo 1',
                effects: { setFlags: { q1_climax_ubs_visto: true } },
                reply: '“A gente faz o possível dentro do horário. Mas esse assunto da microárea ainda vai voltar à mesa.”'
              }
            ]
          }
        }
      }
    },

    // ========================================================================
    // CENA CLIMÁTICA DO CAPÍTULO 3 — SOBRECARGA & DILEMA CENTRAL NA UBS
    // ========================================================================
    {
      id: 'evt_cap3_fratura_ubs',
      title: 'Capítulo 3 • Fratura & Dilema na UBS',
      scene: 'UBS_INTERIOR',
      timeRange: [8, 18],
      conditions: {
        minChapter: 3,
        maxChapter: 3,
        hasFlags: ['q3_campo_ok'],
        notFlags: ['q3_fratura_resolvida']
      },
      staging: [
        { type: 'staff', id: 'medico', x: 8.5 * T, y: 15.8 * T },
        { type: 'staff', id: 'enfermeira_marina', x: 10.6 * T, y: 15.8 * T },
        { type: 'npc', id: 'npc_dona_carla', x: 7.4 * T, y: 17.8 * T, forceScene: 'UBS_INTERIOR' },
        { type: 'npc', id: 'npc_tia_bete', x: 9.8 * T, y: 17.8 * T, forceScene: 'UBS_INTERIOR' }
      ],
      graph: {
        startNode: 'henrique_abertura',
        nodes: {
          henrique_abertura: {
            speaker: 'medico',
            text: '“Ainda bem que você chegou, Alex. A Diretoria pediu até o fim do dia o fechamento do dossiê da Microárea 04. Se mandarmos só a planilha fria com os números de atendimento, evitamos corte imediato nesta semana — mas os problemas da baixada, do horário noturno e da Horta ficam escondidos.”',
            note: 'Capítulo 3 • Reunião decisiva entre equipe da UBS e lideranças do bairro.',
            choices: [
              {
                text: 'Escutar a posição de Tia Bete e Dona Carla diante da proposta.',
                intent: '👂 Ouvir a comunidade',
                next: 'bete_cobra'
              }
            ]
          },
          bete_cobra: {
            speaker: 'npc_tia_bete',
            text: '“Se assinar esse papel bonito só pra engavetar a realidade da Vila Esperança, mês que vem cortam do mesmo jeito e a gente continua sem drenagem e sem acolhimento à noite. A gente precisa levar isso a público na Pracinha!”',
            note: 'Tia Bete e Dona Carla pedem transparência e Assembleia Aberta.',
            choices: [
              {
                text: 'Defender o dossiê real completo e convocar Assembleia Aberta na Pracinha dos Ipês com equipe + bairro.',
                intent: '✊ Assumir o risco pela Assembleia',
                next: 'desfecho_assembleia',
                effects: {
                  postureDelta: { articulacao: 2, acolhimento: 1 },
                  npcBondDelta: { npc_tia_bete: 12, npc_dona_carla: 10, medico: 6, enfermeira_marina: 4 },
                  setFlags: { cap3_decisao: 'assembleia_aberta', q3_fratura_resolvida: true },
                  setRecentFlags: { cap3_chamado_assembleia: true },
                  triggerPhoneMsg: {
                    key: 'h3_cap4_assembleia_convocada',
                    sender: 'Tia Bete (Associação)',
                    text: 'ATENÇÃO VILA ESPERANÇA! A equipe da UBS e a Associação fecharam juntas: vamos organizar a grande Assembleia Aberta na Pracinha dos Ipês!'
                  }
                }
              },
              {
                text: 'Assinar o relatório simplificado para proteger o contrato imediato da equipe antes de mobilizar a rua.',
                intent: '📋 Blindar números primeiro',
                next: 'desfecho_relatorio',
                effects: {
                  postureDelta: { burocracia: 2, firmeza: 1 },
                  npcBondDelta: { escriturario: 6, enfermeira_marina: 6, npc_tia_bete: -8, npc_dona_carla: -10 },
                  setFlags: { cap3_decisao: 'relatorio_rapido', q3_fratura_resolvida: true },
                  setRecentFlags: { cap3_relatorio_frio: true },
                  triggerPhoneMsg: {
                    key: 'h3_cap4_tensao_assoc',
                    sender: 'Dona Carla',
                    text: 'Fica registrado que a coordenação optou pelo relatório técnico rápido. Na Pracinha dos Ipês vamos cobrar respostas cara a cara mesmo assim!'
                  }
                }
              }
            ]
          },
          desfecho_assembleia: {
            speaker: 'npc_dona_carla',
            text: '“Isso tem coragem! Não vai ser fácil encarar a secretaria com tudo aberto na mesa, mas pela primeira vez a UBS e a Vila Esperança vão falar juntas na Pracinha dos Ipês!”',
            note: 'Mundo transformado: mural de acolhimento na UBS e Pracinha mobilizada para o Capítulo 4.',
            choices: [
              {
                text: 'Preparar a Mesa Posta na Pracinha dos Ipês (Capítulo 4).',
                intent: '🌅 Avançar ao Capítulo 4',
                reply: '“Nos vemos na Pracinha dos Ipês! Chegou a hora de juntar todo mundo que construiu essa história.”'
              }
            ]
          },
          desfecho_relatorio: {
            speaker: 'enfermeira_marina',
            text: '“Garantimos o fôlego administrativo desta semana... mas olha pra cara da Bete e da Carla saindo pela porta. A Assembleia na Pracinha ainda vai acontecer — e vamos ter que reconquistar a confiança delas lá.”',
            note: 'Custo relacional real registrado na memória da campanha — rumo ao Capítulo 4.',
            choices: [
              {
                text: 'Seguir para o desfecho na Pracinha dos Ipês (Capítulo 4).',
                intent: '➡️ Avançar ao Capítulo 4',
                reply: '“É hora de sair dos papéis e encarar a Pracinha de frente.”'
              }
            ]
          }
        }
      },
      onAfterFinish(g) {
        if (g.worldState) {
          const dec = g.storyState && g.storyState.getFlag('cap3_decisao');
          if (dec === 'assembleia_aberta') {
            g.worldState.setUBSMural('acolhimento');
            g.worldState.setPracinhaStatus('mobilizada');
            g.worldState.advanceHortaStage(3, 'cap3_assembleia');
          } else {
            g.worldState.setUBSMural('protocolo');
            g.worldState.setPracinhaStatus('tensa');
          }
        }
      }
    },

    // ========================================================================
    // CENA CLIMÁTICA DO CAPÍTULO 4 — ASSEMBLEIA ABERTA NA PRACINHA DOS IPÊS
    // ========================================================================
    {
      id: 'evt_cap4_assembleia_pracinha',
      title: 'Capítulo 4 • Mesa Posta na Pracinha dos Ipês',
      scene: 'OVERWORLD',
      customCheck: (g) => {
        const prac = g.pracinha;
        return !!(prac && Math.hypot(g.player.x - prac.x, g.player.y - prac.y) < 260);
      },
      conditions: {
        minChapter: 4,
        maxChapter: 4,
        hasFlags: ['q4_equipe_ok'],
        notFlags: ['q4_assembleia_concluida']
      },
      staging: [
        { type: 'npc', id: 'npc_tia_bete', x: 43.0 * T, y: 46.2 * T, forceScene: 'OVERWORLD' },
        { type: 'npc', id: 'npc_seu_ze', x: 45.6 * T, y: 46.4 * T, forceScene: 'OVERWORLD' },
        { type: 'npc', id: 'npc_dona_carla', x: 41.8 * T, y: 47.4 * T, forceScene: 'OVERWORLD' },
        { type: 'staff', id: 'acs_joana', x: 46.8 * T, y: 47.4 * T, forceScene: 'OVERWORLD' },
        { type: 'staff', id: 'enfermeira_marina', x: 42.6 * T, y: 48.6 * T, forceScene: 'OVERWORLD' },
        { type: 'staff', id: 'medico', x: 46.0 * T, y: 48.6 * T, forceScene: 'OVERWORLD' },
        { type: 'family', id: 'H04', x: 41.2 * T, y: 49.0 * T, forceScene: 'OVERWORLD' },
        { type: 'family', id: 'H07', x: 47.4 * T, y: 49.0 * T, forceScene: 'OVERWORLD' }
      ],
      graph: {
        startNode: 'assembleia_abertura',
        nodes: {
          assembleia_abertura: {
            speaker: 'npc_tia_bete',
            text: '“Gente querida da Vila Esperança, pode chegar mais perto das mesas! Hoje não tem palanque nem microfone quebrado: tem café do Seu Zé, cadeira pros mais velhos e espaço aberto pra UBS e bairro olharem o mapa juntos!”',
            note: 'Clímax do Capítulo 4 • Assembleia Aberta na Pracinha dos Ipês.',
            choices: [
              {
                text: 'Olhar ao redor da praça e ouvir a abertura de Seu Zé.',
                intent: '☕ Acompanhar a mesa posta',
                next: 'ze_testemunho'
              }
            ]
          },
          ze_testemunho: {
            speaker: 'npc_seu_ze',
            text: '“Eu que fico atrás do balcão até tarde posso garantir uma coisa: depois que o Alex começou a escutar de verdade quem volta do turno da noite e quem faz conta pra comprar remédio, o postinho deixou de parecer muro fechado!”',
            note: 'Voz da Esquina • Vendinha do Zé e trabalhadores da microárea.',
            choices: [
              {
                text: 'Ouvir a resposta da Dona Carla diante da comunidade.',
                intent: '🗣️ Escutar Dona Carla',
                next: 'carla_unida',
                conditions: { flagEquals: { cap3_decisao: 'assembleia_aberta' } }
              },
              {
                text: 'Encarar a fala direta de Dona Carla sobre o relatório do Capítulo 3.',
                intent: '🗣️ Escutar Dona Carla',
                next: 'carla_cobranca',
                conditions: { notFlags: ['cap3_chamado_assembleia'] }
              }
            ]
          },
          carla_unida: {
            speaker: 'npc_dona_carla',
            text: '“Quando a equipe teve coragem de trazer o dossiê real pra rua em vez de esconder debaixo do tapete, a gente entendeu que não estamos em lados opostos. Se a Secretaria mexer nessa ESF, vai ter que responder pra Vila Esperança inteira!”',
            note: 'Consequência do Capítulo 3 • Aliança pública entre liderança comunitária e UBS.',
            choices: [
              {
                text: 'Ouvir Seu Tião e Seu Raimundo pela roda dos moradores.',
                intent: '🏡 Ouvir as famílias',
                next: 'tiao_testemunho'
              }
            ]
          },
          carla_cobranca: {
            speaker: 'npc_dona_carla',
            text: '“Não vou fingir que esqueci o relatório técnico apressado da semana passada... Mas também respeito quem não fugiu da praça hoje. Se querem confiança inteira daqui pra frente, que os compromissos com a Baixada e a fila saiam do papel agora!”',
            note: 'Consequência do Capítulo 3 • Cobrança firme, mas diálogo mantido em praça aberta.',
            choices: [
              {
                text: 'Assentir com respeito e ouvir Seu Tião pela roda dos moradores.',
                intent: '🏡 Ouvir as famílias',
                next: 'tiao_testemunho'
              }
            ]
          },
          tiao_testemunho: {
            speaker: 'H04',
            text: '“Ó, eu fui o primeiro teimoso a bater porta na cara de agente! Mas quando a gente vê colega voltando pra perguntar se o remédio desceu bem, vê o pessoal mexendo na terra da Horta e limpando foco de dengue junto... aí até coração duro amolece!”',
            note: 'Voz das Famílias • H01–H15 representadas na Pracinha dos Ipês.',
            choices: [
              {
                text: 'Passar a palavra para a Enfª Marina e o Dr. Henrique.',
                intent: '🩺 Ouvir a equipe da UBS',
                next: 'marina_pacto'
              }
            ]
          },
          marina_pacto: {
            speaker: 'enfermeira_marina',
            text: '“Com os dados territoriais que o Alex e a Joana levantaram — das casas, da Vendinha, da Baixada e da Horta — montamos um plano vivo que nenhuma planilha fria consegue apagar. Alex, você foi o elo dessa ponte: quer deixar a palavra final da nossa equipe?”',
            note: 'Momento final • Escolha o tom do seu legado na Vila Esperança.',
            choices: [
              {
                text: '“Saúde se faz escutando gente pelo nome — nenhuma família da Microárea 04 vai caminhar sozinha!”',
                intent: '💛 Encerrar com Acolhimento',
                effects: {
                  postureDelta: { acolhimento: 2 },
                  npcBondDelta: { acs_joana: 8, npc_tia_bete: 8, npc_seu_ze: 6, enfermeira_marina: 6 },
                  setFlags: { q4_assembleia_concluida: true, cap4_tom_final: 'acolhimento' }
                },
                reply: 'A Pracinha dos Ipês irrompe em palmas calorosas enquanto copos de café circulam entre moradores e jalecos azuis.'
              },
              {
                text: '“Unimos UBS, Horta, Vendinha e Associação — essa rede comunitária agora é patrimônio de todo mundo aqui!”',
                intent: '🤝 Encerrar com Articulação',
                effects: {
                  postureDelta: { articulacao: 2 },
                  npcBondDelta: { npc_tia_bete: 10, npc_dona_carla: 8, medico: 6, npc_seu_ze: 6 },
                  setFlags: { q4_assembleia_concluida: true, cap4_tom_final: 'articulacao' }
                },
                reply: 'Tia Bete ergue o caderno de atas da Associação sob aplausos de toda a roda na Pracinha dos Ipês!'
              },
              {
                text: '“Temos registro, mapa e presença em campo todo dia — agora exigimos respeito e estrutura contínua para a Vila Esperança!”',
                intent: '🛡️ Encerrar com Firmeza',
                effects: {
                  postureDelta: { firmeza: 2 },
                  npcBondDelta: { npc_dona_carla: 10, escriturario: 6, medico: 8 },
                  setFlags: { q4_assembleia_concluida: true, cap4_tom_final: 'firmeza' }
                },
                reply: 'Dona Carla e Dr. Henrique assentem com respeito enquanto a praça inteira aplaude a firmeza do pacto.'
              }
            ]
          }
        }
      }
    },

    // ========================================================================
    // HEART EVENTS (H2 + H3)
    // ========================================================================
    {
      id: 'evt_heart_joana_esf',
      title: 'Heart Event: Colete Desbotado (Joana)',
      scene: 'ESF_ROOM',
      conditions: {
        minChapter: 1,
        minNpcBond: { acs_joana: 58 },
        hasFlags: ['q0_joana_acolheu']
      },
      staging: [
        { type: 'staff', id: 'acs_joana', x: 10.2 * T, y: 6.8 * T },
        { type: 'staff', id: 'acs_rosana', x: 12.2 * T, y: 7.0 * T }
      ],
      graph: {
        startNode: 'joana_cafe',
        nodes: {
          joana_cafe: {
            speaker: 'acs_joana',
            text: '“Peraí, fecha essa porta um segundo, Alex... Tá vendo esse bolsinho rasgado do meu colete azul? No meu primeiro ano na Vila Esperança eu quase entreguei o crachá achando que se eu não resolvesse tudo de todo mundo, eu tinha falhado.”',
            note: 'Heart Event (Joana) • Vínculo construído na Sala ESF.',
            choices: [
              {
                text: 'Perguntar o que fez a Joana continuar vestindo o colete até hoje.',
                intent: '💛 Ouvir a história dela',
                next: 'rosana_entra',
                effects: {
                  postureDelta: { acolhimento: 1 },
                  npcBondDelta: { acs_joana: 8, acs_rosana: 4 }
                }
              }
            ]
          },
          rosana_entra: {
            speaker: 'acs_rosana',
            text: '“Haha! Conta também que no dia que você chorou atrás do arquivo, eu trouxe bolo de fubá queimado e a gente riu até perder o ar! Cuida de você também, Alex — ninguém segura o bairro se adoecer junto.”',
            note: 'Companheirismo na Sala ESF • Joana & Rosana confiam em você.',
            choices: [
              {
                text: 'Tomar um café com as duas e agradecer pela sinceridade.',
                intent: '☕ Brindar com a equipe',
                effects: {
                  staminaDelta: 20,
                  setFlags: { heart_joana_1_visto: true }
                },
                reply: '“Agora sim! Colete alinhado, café tomado e cabeça no lugar. Tamo junto na ESF!”'
              }
            ]
          }
        }
      }
    },

    {
      id: 'evt_heart_ze_caderno',
      title: 'Heart Event: A Segunda Página do Caderno (Seu Zé)',
      scene: 'VENDINHA',
      timeRange: [18, 22],
      conditions: {
        minChapter: 1,
        minNpcBond: { npc_seu_ze: 48 },
        hasFlags: ['q0_vendinha_conversa']
      },
      staging: [
        { type: 'npc', id: 'npc_seu_ze', x: 6.0 * T, y: 5.0 * T }
      ],
      graph: {
        startNode: 'ze_caderno',
        nodes: {
          ze_caderno: {
            speaker: 'npc_seu_ze',
            text: '“Espera fechar a porta um tico... Tá vendo esse caderninho azul embaixo do balcão? Metade do fiado da última semana do mês não é cerveja nem luxo: é leite, arroz e gente escolhendo entre pagar gás ou pegar ônibus pro exame.”',
            note: 'Heart Event (Seu Zé) • Economia invisível da Vila Esperança.',
            choices: [
              {
                text: 'Garantir sigilo absoluto e perguntar como a UBS pode ajudar sem constranger ninguém.',
                intent: '🤝 Respeitar a confiança',
                next: 'ze_alianca',
                effects: {
                  postureDelta: { acolhimento: 1, articulacao: 1 },
                  npcBondDelta: { npc_seu_ze: 10 }
                }
              },
              {
                text: 'Agradecer pela informação útil para cruzar com as faltas do prontuário.',
                intent: '📋 Guardar como dado de campo',
                next: 'ze_alianca',
                effects: {
                  postureDelta: { burocracia: 1 },
                  npcBondDelta: { npc_seu_ze: 6 }
                }
              }
            ]
          },
          ze_alianca: {
            speaker: 'npc_seu_ze',
            text: '“Não é pra dar nome aos bois em relatório, hein? É só pra você lembrar por que às vezes um morador fecha a cara quando alguém cobra passagem ou dieta cara sem saber quanto sobrou no bolso.”',
            note: 'Confiança aprofundada com Seu Zé (Vendinha).',
            choices: [
              {
                text: 'Combinar de manter esse pacto de respeito e fechar a conversa.',
                intent: '☕ Levar o aprendizado',
                effects: {
                  setFlags: { ze_confiou_caderno: true },
                  setRecentFlags: { ze_abriu_caderno: true }
                },
                reply: '“Leva um pão quentinho pra casa, agente. Quem entende a esquina nunca caminha cego.”'
              }
            ]
          }
        }
      }
    },

    {
      id: 'evt_heart_tiao_domino',
      title: 'Heart Event: A Bucha de Sena e o Medo Silencioso (Seu Tião)',
      scene: 'OVERWORLD',
      customCheck: (g) => {
        if (!g.schedule || !g.schedule.isDominoGatheringActive()) return false;
        const prac = g.pracinha;
        return !prac || Math.hypot(g.player.x - prac.x, g.player.y - prac.y) < 380;
      },
      conditions: {
        minChapter: 1,
        minFamilyBond: { H04: 60 },
        hasFlags: ['pilot_h04_connected']
      },
      graph: {
        startNode: 'tiao_confessa',
        nodes: {
          tiao_confessa: {
            speaker: 'H04',
            text: '“Ó, não conta pro pessoal da mesa, não... Eu não tinha raiva de posto à toa, não. Meu irmão mais velho morreu esperando vaga num corredor lá em 2012. Toda vez que vejo jaleco branco, a cabeça trava um pouco.”',
            note: 'Heart Event (Casa 04 • Pracinha dos Ipês) — Por trás da teimosia existe história.',
            choices: [
              {
                text: 'Dizer que entende o peso dessa lembrança e que cuidar agora é justamente pra não repetir aquilo.',
                intent: '💛 Acolher sem julgar',
                next: 'raimundo_quebra_gelo',
                effects: {
                  bondDelta: { H04: 8 },
                  postureDelta: { acolhimento: 1 }
                }
              }
            ]
          },
          raimundo_quebra_gelo: {
            speaker: 'H07',
            text: '“Haha! Chega de segredo no ouvido do ACS, Tião! Joga essa pedra logo antes que o sol caia e eu te dê outra lavada no dominó!”',
            note: 'Humor de esquina aliviando o peso da confissão.',
            choices: [
              {
                text: 'Rir junto com os dois e seguir a noite na Vila Esperança.',
                intent: '♟️ Seguir com leveza',
                effects: {
                  bondDelta: { H07: 5 },
                  setFlags: { heart_tiao_domino_visto: true }
                },
                reply: '“Bora pra mesa! Hoje quem perder paga a água gelada da semana que vem!”'
              }
            ]
          }
        }
      }
    },

    // --- 4 NOVOS HEART EVENTS (Etapa H3) ---
    {
      id: 'evt_heart_tia_bete_horta',
      title: 'Heart Event: Terra Debaixo da Unha (Tia Bete)',
      scene: 'ASSOCIACAO',
      conditions: {
        minChapter: 2,
        minNpcBond: { npc_tia_bete: 48 },
        hasFlags: ['tia_bete_ally']
      },
      staging: [
        { type: 'npc', id: 'npc_tia_bete', x: 9.0 * T, y: 5.4 * T, forceScene: 'ASSOCIACAO' }
      ],
      graph: {
        startNode: 'bete_confidencia',
        nodes: {
          bete_confidencia: {
            speaker: 'npc_tia_bete',
            text: '“Sabe por que eu sou tão brava com promessa bonita, Alex? Há seis anos montamos essa Associação com vinte pessoas na sala. Quando faltou apoio técnico, todo mundo foi cansando até sobrar eu regando mudas sozinha.”',
            note: 'Heart Event (Tia Bete) • Raiz da desconfiança com projetos passageiros.',
            choices: [
              {
                text: 'Garantir que você quer construir protagonismo do próprio bairro — não depender de uma pessoa só.',
                intent: '🌱 Comprometer-se com continuidade',
                effects: {
                  npcBondDelta: { npc_tia_bete: 10 },
                  postureDelta: { articulacao: 1 },
                  setFlags: { heart_tia_bete_visto: true }
                },
                reply: '“É disso que eu precisava ouvir, meu bem! Quando a Horta der o primeiro pé de couve, essa mesa volta a encher.”'
              }
            ]
          }
        }
      }
    },

    {
      id: 'evt_heart_marina_sueli_ubs',
      title: 'Heart Event: Fim de Expediente na UBS (Marina & Sueli)',
      scene: 'UBS_INTERIOR',
      timeRange: [15.5, 18],
      conditions: {
        minChapter: 2,
        minNpcBond: { enfermeira_marina: 45 }
      },
      staging: [
        { type: 'staff', id: 'enfermeira_marina', x: 16.5 * T, y: 12.2 * T },
        { type: 'staff', id: 'limpeza', x: 18.2 * T, y: 12.2 * T }
      ],
      graph: {
        startNode: 'marina_exausta',
        nodes: {
          marina_exausta: {
            speaker: 'enfermeira_marina',
            text: '“Ninguém vê isso, Dona Sueli... Às vezes eu pareço dura na recepção com planilha e horário porque se eu não segurar as pontas de manhã, de noite eu choro pensando em quem ficou sem atendimento lá fora.”',
            note: 'Heart Event (Enfª Marina & Dona Sueli) • Vulnerabilidade no fim de turno.',
            choices: [
              {
                text: 'Entrar na conversa com leveza e lembrar que a ESF divide esse peso junta.',
                intent: '💛 Acolher a enfermeira',
                next: 'sueli_cafe',
                effects: {
                  npcBondDelta: { enfermeira_marina: 8, limpeza: 5 },
                  postureDelta: { acolhimento: 1 }
                }
              }
            ]
          },
          sueli_cafe: {
            speaker: 'limpeza',
            text: '“Escuta o agente, doutora! Cuidado não se faz carregando o posto sozinho nas costas. Amanhã tem mais — hoje vai pra casa descansar.”',
            note: 'Vínculo aprofundado com Enfª Marina e Dona Sueli.',
            choices: [
              {
                text: 'Acompanhar o fechamento tranquilo do corredor.',
                intent: '🏥 Seguir turno',
                effects: { setFlags: { heart_marina_sueli_visto: true } },
                reply: '“Obrigada por não terem medo de falar a verdade comigo, Alex e Dona Sueli.”'
              }
            ]
          }
        }
      }
    },

    {
      id: 'evt_heart_lucas_pracinha',
      title: 'Heart Event: Som da Praça (Lucas — Casa 13)',
      scene: 'OVERWORLD',
      customCheck: (g) => {
        const prac = g.pracinha;
        return !prac || Math.hypot(g.player.x - prac.x, g.player.y - prac.y) < 340;
      },
      conditions: {
        minChapter: 2,
        minFamilyBond: { H13: 60 },
        hasFlags: ['pilot_h13_video_talent']
      },
      graph: {
        startNode: 'lucas_camera',
        nodes: {
          lucas_camera: {
            speaker: 'H13',
            text: '“Ô, Alex! Vim gravar o som dos passarinhos nos ipês da pracinha antes do fim da tarde... Aquele dia você não me tratou como caso perdido. Tô até pensando em filmar o pessoal da Horta pra mostrar pro bairro!”',
            note: 'Heart Event (Lucas • Pracinha dos Ipês) — Saúde mental é pertencimento.',
            choices: [
              {
                text: 'Apoiar o projeto de vídeo comunitário do Lucas e apresentá-lo à Tia Bete.',
                intent: '🎥 Incentivar protagonismo jovem',
                effects: {
                  bondDelta: { H13: 10 },
                  postureDelta: { articulacao: 1, acolhimento: 1 },
                  setFlags: { heart_lucas_pracinha_visto: true, lucas_fotografo_assembleia: true }
                },
                reply: '“Fechado! Na Assembleia ou no mutirão da Horta eu levo o celular pra registrar tudo!”'
              }
            ]
          }
        }
      }
    },

    {
      id: 'evt_heart_tiago_esf',
      title: 'Heart Event: Riso Cansado na ESF (Tiago & Joana)',
      scene: 'ESF_ROOM',
      conditions: {
        minChapter: 2,
        minNpcBond: { acs_tiago: 50 }
      },
      staging: [
        { type: 'staff', id: 'acs_tiago', x: 8.5 * T, y: 8.0 * T },
        { type: 'staff', id: 'acs_joana', x: 10.6 * T, y: 8.0 * T }
      ],
      graph: {
        startNode: 'tiago_rindo',
        nodes: {
          tiago_rindo: {
            speaker: 'acs_tiago',
            text: '“Adivinha só: hoje um cachorro pinscher tentou roubar meu boné, uma vó me deu dois limões cravo e acabei descobrindo um cadastro que tava errado há 3 anos!”',
            note: 'Heart Event (Tiago & Joana) • Alívio cômico do cotidiano ACS.',
            choices: [
              {
                text: 'Rir junto com o Tiago e comparar quem já passou apuro maior com o Fumaça.',
                intent: '😄 Rir com os colegas',
                next: 'joana_brinca',
                effects: {
                  npcBondDelta: { acs_tiago: 8, acs_joana: 4 },
                  staminaDelta: 15
                }
              }
            ]
          },
          joana_brinca: {
            speaker: 'acs_joana',
            text: '“Hahaha! Se o Fumaça pegar teu boné mesmo, vira troféu da Microárea 02! Mas falando sério: que alívio ver você rindo de novo, Tiago.”',
            note: 'Equipe ESF fortalecida para os desafios finais.',
            choices: [
              {
                text: 'Voltar para a rua com o ânimo renovado.',
                intent: '✨ Seguir jornada',
                effects: { setFlags: { heart_tiago_esf_visto: true } },
                reply: '“Valeu, equipe! Sem humor a gente não dura uma semana na Estrada do Sol!”'
              }
            ]
          }
        }
      }
    }
  ];

  class StoryEventSystem {
    constructor(game) {
      this.game = game;
      this.activeEvent = null;
      this._stagingBackups = [];
      this._forcedSceneNpcs = {};
      this._bindEvents();
    }

    _bindEvents() {
      const g = this.game;
      if (!g.events) return;

      g.events.on('scene:changed', ({ to }) => {
        this.evaluateTriggers(to);
      });

      g.events.on('time:hourChanged', () => {
        this.evaluateTriggers(g.currentLocation);
      });
    }

    isNpcForcedInScene(sceneId, npcId) {
      return this._forcedSceneNpcs[npcId] === sceneId;
    }

    getStagedCastInScene(sceneId) {
      if (!this.activeEvent || this.activeEvent.scene !== sceneId) return [];
      return this._stagingBackups
        .filter(b => this._forcedSceneNpcs[b.id] === sceneId)
        .map(b => ({ type: b.type, id: b.id, ref: b.ref }));
    }

    triggerPrologueIntro() {
      const g = this.game;
      const ev = STORY_EVENTS.find(e => e.id === 'evt_prologo_abertura');
      if (!ev) return false;
      if (g.storyState && g.storyState.isEventCompleted(ev.id)) return false;
      if (typeof g.showChapterBanner === 'function') {
        g.showChapterBanner(0);
      }
      return this.triggerEvent(ev);
    }

    evaluateConditions(ev) {
      const g = this.game;
      const story = g.storyState;
      if (!story) return false;
      if (story.isEventCompleted(ev.id)) return false;

      if (Array.isArray(ev.timeRange)) {
        const hr = (g.timeMinutes || 0) / 60;
        if (hr < ev.timeRange[0] || hr > ev.timeRange[1]) return false;
      }

      if (typeof ev.customCheck === 'function' && !ev.customCheck(g)) {
        return false;
      }

      const cond = ev.conditions || {};
      if (typeof cond.minChapter === 'number' && story.chapter < cond.minChapter) return false;
      if (typeof cond.maxChapter === 'number' && story.chapter > cond.maxChapter) return false;

      if (cond.minNpcBond && typeof cond.minNpcBond === 'object') {
        for (const npcId of Object.keys(cond.minNpcBond)) {
          if (story.getNpcBond(npcId) < cond.minNpcBond[npcId]) return false;
        }
      }

      if (cond.minFamilyBond && typeof cond.minFamilyBond === 'object') {
        for (const famId of Object.keys(cond.minFamilyBond)) {
          const fam = (g.families || []).find(f => f.id === famId);
          if (!fam || fam.bond < cond.minFamilyBond[famId]) return false;
        }
      }

      if (Array.isArray(cond.hasFlags)) {
        for (const f of cond.hasFlags) {
          if (!story.hasFlag(f)) return false;
        }
      }

      if (Array.isArray(cond.notFlags)) {
        for (const f of cond.notFlags) {
          if (story.hasFlag(f)) return false;
        }
      }

      return true;
    }

    evaluateTriggers(sceneId = null, { force = false } = {}) {
      const g = this.game;
      const targetScene = sceneId || g.currentLocation;
      if (this.activeEvent && g.dialogue && !g.dialogue.activeSession) {
        this.restoreStaging();
        this.activeEvent = null;
      }
      if (this.activeEvent) return null;
      if (!force && g.dialogue && g.dialogue.activeSession) return null;
      if (!force && g.paused) return null;

      for (const ev of STORY_EVENTS) {
        if (ev.manualOnly && !force) continue;
        if (ev.scene !== targetScene) continue;
        if (!this.evaluateConditions(ev)) continue;
        this.triggerEvent(ev);
        return ev;
      }
      return null;
    }

    applyStaging(stagingList) {
      const g = this.game;
      this.restoreStaging();
      if (!Array.isArray(stagingList)) return;

      for (const st of stagingList) {
        let ref = null;
        if (st.type === 'staff' && g.ubsInterior) {
          ref = (g.ubsInterior.staff || []).find(s => s.id === st.id);
        } else if (st.type === 'npc' && g.communitySpaces && g.communitySpaces.npcs) {
          ref = g.communitySpaces.npcs[st.id];
        } else if (st.type === 'family') {
          ref = (g.families || []).find(f => f.id === st.id);
        }

        if (!ref) continue;
        this._stagingBackups.push({
          type: st.type,
          ref,
          id: st.id,
          oldX: ref.x,
          oldY: ref.y,
          oldInteractX: ref.interactX,
          oldInteractY: ref.interactY
        });

        if (typeof st.x === 'number') {
          ref.x = st.x;
          if ('interactX' in ref) ref.interactX = st.x;
        }
        if (typeof st.y === 'number') {
          ref.y = st.y;
          if ('interactY' in ref) ref.interactY = st.y;
        }
        if (st.forceScene) {
          this._forcedSceneNpcs[st.id] = st.forceScene;
        }
      }
    }

    restoreStaging() {
      for (const b of this._stagingBackups) {
        b.ref.x = b.oldX;
        b.ref.y = b.oldY;
        if ('interactX' in b.ref) b.ref.interactX = b.oldInteractX;
        if ('interactY' in b.ref) b.ref.interactY = b.oldInteractY;
      }
      this._stagingBackups = [];
      this._forcedSceneNpcs = {};
    }

    triggerEvent(ev) {
      const g = this.game;
      if (!ev || !g.dialogue) return false;

      this.activeEvent = ev;
      this.applyStaging(ev.staging);

      const startSpeakerId = (ev.graph && ev.graph.nodes && ev.graph.startNode && ev.graph.nodes[ev.graph.startNode].speaker) || 'acs_joana';
      const baseProfile = g.dialogue.resolveSpeakerProfile(startSpeakerId) || {
        entityType: 'STAFF',
        entityData: { id: 'event', portraitBg: '#dbeafe', appearance: { skin: '#c68c64', hair: '#2b1d14', hairStyle: 'short', shirt: '#f8fafc', acsVest: true, gender: 'f' } },
        entityId: startSpeakerId,
        tag: ev.title,
        name: ev.title,
        badgesHtml: '<span class="badge prioritario">🎬 Cena de História</span>',
        bondPct: 50,
        bondText: 'Momento da Comunidade'
      };

      let cleaned = false;
      const finalizeEvent = () => {
        if (cleaned) return;
        cleaned = true;
        this.restoreStaging();
        if (g.storyState) {
          g.storyState.markEventCompleted(ev.id);
        }
        if (typeof ev.onAfterFinish === 'function') {
          ev.onAfterFinish(g);
        }
        this.activeEvent = null;
        if (g.events) {
          g.events.emit('story:eventCompleted', { eventId: ev.id });
        }
        if (g.quests) g.quests.evaluateAll({ silent: false });
        g.updateHUD();
        if (g.navigation) {
          g.navigation.resolveObjective();
          g.navigation.updateTrackerUI();
          g.navigation.drawMinimap();
        }
        g.saveProgress();
      };

      g.dialogue.startGraph({
        entityType: baseProfile.entityType,
        entityData: baseProfile.entityData,
        entityId: baseProfile.entityId,
        tag: ev.title,
        name: baseProfile.name,
        badgesHtml: `${baseProfile.badgesHtml || ''} <span class="badge prioritario">🎬 Cena</span>`,
        bondPct: baseProfile.bondPct,
        bondText: baseProfile.bondText,
        graph: ev.graph,
        onClose: finalizeEvent,
        onFinish: (choice) => {
          if (choice.staminaDelta) {
            g.player.stamina = Math.min(100, g.player.stamina + choice.staminaDelta);
          }
          g.setDialogueText(choice.reply || 'Cena concluída.');
          const choicesEl = document.getElementById('dlg-choices');
          choicesEl.innerHTML = '';
          const btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.innerHTML = '<span>Prosseguir na Vila Esperança.</span><span class="choice-tag">Continuar</span>';
          btn.addEventListener('click', () => {
            g.closeOverlays();
            finalizeEvent();
          });
          choicesEl.appendChild(btn);
        }
      });

      return true;
    }
  }

  global.StoryEventSystem = StoryEventSystem;
  global.ACS_STORY_EVENTS = STORY_EVENTS;
})(window);

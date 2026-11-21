// ============================================================================
// TERRITÓRIO VIVO — INVESTIGATION SYSTEM ("FIO DA MEADA" — Etapa E2)
// ============================================================================
// Turns exploration, records, and conversations into multi-source deduction:
//   1. Partial information & secondary contextual clues
//   2. Contradictions between resident, neighbor/community & UBS records
//   3. Hypothesis synthesis inside the Field Notebook [J]
//   4. Multiple coherent resolution approaches with lasting consequences

(function (global) {
  'use strict';

  const INVESTIGATION_CASES = [
    // ========================================================================
    // CASO 1: A RECEITA QUE NÃO CHEGA
    // ========================================================================
    {
      id: 'caso_receita',
      title: 'Caso 1: A Receita que Não Chega',
      summary: 'Dona Neide (H05) e Marcos (H02) sumiram das renovações de receita na UBS e constam como "abandono" no relatório.',
      unlockCondition: () => true, // Disponível desde o início para dar agência investigativa imediata
      contradiction: {
        clueA: 'c1_ubs_registro',
        clueB: 'c1_vendinha_recados',
        title: 'Planilha de "abandono" × Pedidos noturnos na Vendinha',
        hypothesisText: 'Os moradores não abandonaram o tratamento por descuido: o fechamento da UBS às 18h choca com o turno de trabalho e com a vergonha de pedir ajuda quando falta dinheiro para a farmácia.'
      },
      clues: [
        {
          id: 'c1_neide_relato',
          sourceId: 'H05',
          sourceLabel: 'Dona Neide (Casa 05)',
          category: 'Morador',
          isKey: false,
          text: 'Dona Neide disse que não voltou ao posto porque "não adianta ir lá perder manhã de costura pra ouvir que o remédio tá em falta".'
        },
        {
          id: 'c1_marcos_turno',
          sourceId: 'H02',
          sourceLabel: 'Marcos (Casa 02)',
          category: 'Morador',
          isKey: false,
          text: 'Marcos explicou que sai do plantão às 08h exausto e, quando acorda à tarde, o guichê de renovação já encerrou.'
        },
        {
          id: 'c1_ubs_registro',
          sourceId: 'escriturario',
          sourceLabel: 'Renan (Recepção UBS)',
          category: 'UBS/Registro',
          isKey: true,
          text: 'No sistema da recepção, H02 e H05 aparecem marcados automaticamente como "abandono de acompanhamento por ausência sem justificativa".'
        },
        {
          id: 'c1_vendinha_recados',
          sourceId: 'npc_seu_ze',
          sourceLabel: 'Seu Zé (Vendinha)',
          category: 'Vizinho/Comunidade',
          isKey: true,
          text: 'Seu Zé revelou bilhetes deixados após as 19h no balcão: trabalhadores perguntando como renovar receita contínua sem faltar ao serviço.'
        }
      ],
      dialogueHooks: {
        H05: [
          {
            type: 'clue',
            clueId: 'c1_neide_relato',
            choiceText: 'Perguntar com calma por que ela deixou de buscar a receita na UBS este mês.',
            intent: '🔍 Investigar ausência',
            nodeText: '“Ah, agente... Fui lá uma vez e perdi a manhã inteira de costura pra ouvir que o comprimido tava em falta. Aí fui segurando no chá e na vergonha de voltar lá à toa.”',
            nodeNote: 'Pista (Dona Neide): barreira prática de tempo + frustração anterior com falta de insumo.',
            reply: 'Dona Neide agradeceu por você perguntar o motivo real em vez de dar bronca.'
          }
        ],
        H02: [
          {
            type: 'clue',
            clueId: 'c1_marcos_turno',
            choiceText: 'Perguntar em que horário ele consegue passar na UBS entre os plantões.',
            intent: '🔍 Checar choque de turno',
            nodeText: '“Eu largo o turno às 07h30 e chego morto em casa. Quando acordo às 16h30, até chegar no posto já fecharam a lista de encaixe. Não é má vontade, é relógio!”',
            nodeNote: 'Pista (Marcos): incompatibilidade entre turno noturno e horário padrão do guichê.',
            reply: 'Marcos anotou seu contato caso surja uma alternativa de horário.'
          }
        ],
        escriturario: [
          {
            type: 'clue',
            clueId: 'c1_ubs_registro',
            choiceText: 'Conferir na recepção como constam as faltas de H02 e H05 no sistema.',
            intent: '🔍 Checar registro UBS',
            nodeText: '“Aqui no e-SUS tá cravado como \'abandono de acompanhamento\', Alex. Se ninguém justifica até sexta, o sistema joga automático como desinteresse do paciente.”',
            nodeNote: 'Pista-Chave (UBS): o sistema registra "abandono", escondendo barreiras de acesso.',
            reply: 'Renan deixou o registro aberto caso você descubra o que houve na rua.'
          },
          {
            type: 'resolve',
            targetEntityId: 'escriturario',
            resolutionId: 'res_c1_ubs_janela',
            choiceText: '[💡 Hipótese] Propor janela de renovação pré-agendada no guichê para trabalhadores (H02/H05).',
            intent: '💡 Resolver via UBS',
            nodeText: '“Se você cruzar os horários de turno que levantou na rua comigo, eu reservo duas renovações rápidas logo às 08h05 e às 17h15. Vai apertar o balcão, mas ninguém perde o emprego nem o remédio!”',
            nodeNote: 'Abordagem Institucional: organiza fluxo na UBS; exige atenção ao guichê.',
            reply: 'Renan anotou a janela combinada para H02 e H05. Caso 1 resolvido pela UBS!',
            effects: {
              npcBondDelta: { escriturario: 8, enfermeira_marina: 6 },
              bondDelta: { H02: 12, H05: 10 },
              receptivityDelta: { H02: 15, H05: 12 },
              postureDelta: { burocracia: 1, articulacao: 1 },
              setFlags: { caso_receita_via: 'ubs_janela' }
            }
          }
        ],
        npc_seu_ze: [
          {
            type: 'clue',
            clueId: 'c1_vendinha_recados',
            choiceText: 'Perguntar se algum trabalhador comentou no balcão sobre dificuldade com receitas da UBS.',
            intent: '🔍 Sondar a Vendinha',
            nodeText: '“Ó, não fala que fui eu, mas depois das 19h já deixaram três recados aqui perguntando se dá pra deixar pedido de receita contínua sem perder dia de serviço. O pessoal tem vergonha de admitir aperto.”',
            nodeNote: 'Pista-Chave (Vendinha): demanda noturna real oculta dos relatórios oficiais.',
            reply: 'Seu Zé guardou os bilhetes caso você precise organizar uma ponte com o bairro.'
          },
          {
            type: 'resolve',
            targetEntityId: 'npc_seu_ze',
            resolutionId: 'res_c1_ponte_vendinha',
            choiceText: '[💡 Hipótese] Criar caixa discreta de recados na Vendinha para avisar dias de reposição e horários.',
            intent: '💡 Resolver via Comunidade',
            nodeText: '“Fechado! Sem expor nome de ninguém, eu deixo um quadro de avisos discreto com os dias que o remédio chegou e quando você passa na rua à noite. A esquina vira ponte!”',
            nodeNote: 'Abordagem Comunitária: fortalece vínculo na rua e alivia vergonha financeira.',
            reply: 'Seu Zé separou um cantinho do balcão para os avisos de saúde. Caso 1 resolvido pela comunidade!',
            effects: {
              npcBondDelta: { npc_seu_ze: 10 },
              bondDelta: { H02: 10, H05: 14 },
              receptivityDelta: { H02: 14, H05: 16 },
              postureDelta: { acolhimento: 1, articulacao: 1 },
              setFlags: { caso_receita_via: 'ponte_vendinha' }
            }
          }
        ],
        medico: [
          {
            type: 'resolve',
            targetEntityId: 'medico',
            resolutionId: 'res_c1_visita_conjunta',
            choiceText: '[💡 Hipótese] Alinhar receita estendida e visita compartilhada com Dr. Henrique para H02 e H05.',
            intent: '💡 Resolver via Clínica Ampliada',
            nodeText: '“Excelente levantamento, Alex. Para crônicos estáveis em turno fechado, podemos pactuar receita com validade estendida e fazer uma visita conjunta rápida na hora do almoço da Dona Neide.”',
            nodeNote: 'Abordagem Clínica: alta resolutividade médica com foco em adesão.',
            reply: 'Dr. Henrique registrou a pactuação de receita estendida no prontuário. Caso 1 resolvido!',
            effects: {
              npcBondDelta: { medico: 10 },
              bondDelta: { H02: 12, H05: 12 },
              receptivityDelta: { H02: 12, H05: 12 },
              postureDelta: { firmeza: 1, articulacao: 1 },
              setFlags: { caso_receita_via: 'clinica_ampliada' }
            }
          }
        ]
      }
    },

    // ========================================================================
    // CASO 2: O BOATO DA FEIRA
    // ========================================================================
    {
      id: 'caso_boato',
      title: 'Caso 2: O Boato da Feira',
      summary: 'Mães da Rua das Acácias ficaram receosas com a vacinação infantil após um áudio circular na comunidade.',
      unlockCondition: (g) => g.dayOfWeek >= 1 || g.weekNumber >= 2 || (g.storyState && g.storyState.chapter >= 1),
      contradiction: {
        clueA: 'c2_camila_audio',
        clueB: 'c2_carlos_camara',
        title: 'Áudio de "reação no lote atual" × Registro real da Sala de Vacina',
        hypothesisText: 'O áudio que assustou Camila é um boato reciclado de outro estado há dois anos; o lote atual da UBS está íntegro e sem nenhum evento adverso registrado.'
      },
      clues: [
        {
          id: 'c2_camila_audio',
          sourceId: 'H03',
          sourceLabel: 'Camila (Casa 03)',
          category: 'Morador',
          isKey: true,
          text: 'Camila recebeu um áudio no grupo escolar afirmando que "quatro crianças daqui tiveram febre grave com o lote desta semana".'
        },
        {
          id: 'c2_feira_conversa',
          sourceId: 'H01',
          sourceLabel: 'Dona Dulce (Casa 01)',
          category: 'Vizinho/Comunidade',
          isKey: false,
          text: 'Dona Dulce comentou que ouviu o mesmo áudio na barraca de frutas, mas nenhuma mãe da rua soube dizer quem eram as crianças.'
        },
        {
          id: 'c2_carlos_camara',
          sourceId: 'enfermeiro_carlos',
          sourceLabel: 'Enf. Carlos (Sala de Vacina)',
          category: 'UBS/Registro',
          isKey: true,
          text: 'Enf. Carlos mostrou o controle de temperatura (+4°C contínuo) e o registro de notificações: zero reações graves no município e lote novo lacrado.'
        }
      ],
      dialogueHooks: {
        H03: [
          {
            type: 'clue',
            clueId: 'c2_camila_audio',
            choiceText: 'Perguntar exatamente o que dizia o áudio que circulou sobre a vacina.',
            intent: '🔍 Investigar boato',
            nodeText: '“Era uma voz desesperada dizendo que o lote novo da UBS deu reação forte em quatro crianças essa semana... Fiquei com o coração na mão pelo Pedrinho.”',
            nodeNote: 'Pista-Chave (Camila): áudio atribui reação grave ao lote desta semana.',
            reply: 'Camila agradeceu por você não zombar do medo dela e prometeu ouvir o que você apurar.'
          },
          {
            type: 'resolve',
            targetEntityId: 'H03',
            resolutionId: 'res_c2_porta_a_porta',
            choiceText: '[💡 Hipótese] Mostrar os dados reais da câmara fria e explicar a origem do áudio antigo.',
            intent: '💡 Esclarecer com acolhimento',
            nodeText: '“Nossa... Então o áudio nem era daqui e a geladeira da vacina tá certinha? Que alívio! Amanhã mesmo levo o Pedrinho e aviso as mães da creche!”',
            nodeNote: 'Abordagem Individual: vínculo profundo com Camila e multiplicação na creche.',
            reply: 'Camila recuperou a confiança na Sala de Vacina. Caso 2 resolvido!',
            effects: {
              bondDelta: { H03: 18 },
              receptivityDelta: { H03: 18 },
              postureDelta: { acolhimento: 2 },
              setFlags: { caso_boato_via: 'acolhimento_camila' }
            }
          }
        ],
        H01: [
          {
            type: 'clue',
            clueId: 'c2_feira_conversa',
            choiceText: 'Perguntar se ela notou algum comentário estranho sobre vacinas na rua ou na Feira.',
            intent: '🔍 Checar origem na rua',
            nodeText: '“Ouvi sim, meu bem! Tinha gente repassando áudio na barraca, mas quando perguntei o nome de alguma criança daqui, ninguém sabia responder. Coisa de corrente velha!”',
            nodeNote: 'Pista (Dona Dulce): nenhum caso real identificado na vizinhança.',
            reply: 'Dona Dulce se colocou à disposição para ajudar a esclarecer as mães na praça.'
          }
        ],
        enfermeiro_carlos: [
          {
            type: 'clue',
            clueId: 'c2_carlos_camara',
            choiceText: 'Verificar o lote atual e o registro de reações adversas na Sala de Vacina.',
            intent: '🔍 Conferir câmara fria',
            nodeText: '“Olha o termômetro e o livro de registro, Alex: +4°C estáveis, lote dentro da validade e zero notificações de evento grave. Esse áudio circula reciclado todo ano em outros estados!”',
            nodeNote: 'Pista-Chave (Sala de Vacina): comprovação técnica desmonta o boato.',
            reply: 'Enf. Carlos separou um resumo simples para você levar à comunidade.'
          },
          {
            type: 'resolve',
            targetEntityId: 'enfermeiro_carlos',
            resolutionId: 'res_c2_roda_feira',
            choiceText: '[💡 Hipótese] Organizar roda aberta de tira-dúvidas com Enf. Carlos para as famílias.',
            intent: '💡 Ação coletiva na Feira',
            nodeText: '“Bora! Nada vence boato melhor do que transparência olho no olho. Vou levar a caixa térmica e mostrar tudo aberto pra quem quiser perguntar!”',
            nodeNote: 'Abordagem Coletiva: restaura confiança de múltiplas famílias ao mesmo tempo.',
            reply: 'A ação de esclarecimento com Enf. Carlos acalmou a rua. Caso 2 resolvido!',
            effects: {
              npcBondDelta: { enfermeiro_carlos: 10 },
              bondDelta: { H03: 12, H01: 6, H15: 10 },
              receptivityDelta: { H03: 15, H15: 12 },
              postureDelta: { articulacao: 2 },
              setFlags: { caso_boato_via: 'roda_esclarecimento' }
            }
          }
        ]
      }
    },

    // ========================================================================
    // CASO 3: O MURO E O CACHORRO
    // ========================================================================
    {
      id: 'caso_muro_brutus',
      title: 'Caso 3: O Muro e o Cachorro',
      summary: 'Um atrito entre Seu Tião (H04) e Dr. Cláudio (H10) trava a vigilância na quadra e deixa Brutus mais agitado.',
      unlockCondition: (g) => g.weekNumber >= 2 || (g.storyState && g.storyState.chapter >= 1),
      contradiction: {
        clueA: 'c3_tiao_versao',
        clueB: 'c3_claudio_versao',
        title: 'Acusação de água suja × Cano de drenagem rompido na curva',
        hypothesisText: 'Nenhum dos dois vizinhos está causando a umidade no muro de propósito: um cano de drenagem rachado na esquina da quadra está infiltrando água entre os dois quintais.'
      },
      clues: [
        {
          id: 'c3_tiao_versao',
          sourceId: 'H04',
          sourceLabel: 'Seu Tião (Casa 04)',
          category: 'Morador',
          isKey: true,
          text: 'Seu Tião jura que a água empoçada perto do muro vem de lavagem irregular do quintal do Dr. Cláudio.'
        },
        {
          id: 'c3_claudio_versao',
          sourceId: 'H10',
          sourceLabel: 'Dr. Cláudio (Casa 10)',
          category: 'Morador',
          isKey: true,
          text: 'Dr. Cláudio afirma que a tubulação interna dele está seca e suspeita de vazamento da caixa d\'água ou descuido do vizinho.'
        },
        {
          id: 'c3_baixada_drenagem',
          sourceId: 'vigia',
          sourceLabel: 'Seu Oswaldo (Portaria UBS)',
          category: 'Vizinho/Comunidade',
          isKey: false,
          text: 'Seu Oswaldo comentou que a galeria pluvial da esquina norte já entupiu no último verão e costuma minar água limpa no meio-fio.'
        }
      ],
      dialogueHooks: {
        H04: [
          {
            type: 'clue',
            clueId: 'c3_tiao_versao',
            choiceText: 'Perguntar por que ele anda tão irritado com a vizinhança e o Brutus agitado.',
            intent: '🔍 Ouvir lado do Seu Tião',
            nodeText: '“O doutor lá de trás fica jogando água que escorre pro meu muro e ainda reclama que o Brutus late! Se continuar assim não deixo ninguém entrar aqui!”',
            nodeNote: 'Pista-Chave (H04): Seu Tião atribui a umidade ao vizinho.',
            reply: 'Seu Tião bufou, mas apreciou você ouvir o lado dele.'
          }
        ],
        H10: [
          {
            type: 'clue',
            clueId: 'c3_claudio_versao',
            choiceText: 'Perguntar tecnicamente sobre a infiltração perto do muro da quadra.',
            intent: '🔍 Ouvir lado do Dr. Cláudio',
            nodeText: '“Sou engenheiro, agente: minha rede interna foi testada e não tem vazamento. Essa água só pode estar vindo do terreno ao lado ou da caixa d\'água destampada dele!”',
            nodeNote: 'Pista-Chave (H10): rede interna de Cláudio está seca — contradição com a suspeita de Tião.',
            reply: 'Dr. Cláudio ficou curioso caso você descubra a origem real da infiltração.'
          },
          {
            type: 'resolve',
            targetEntityId: 'H10',
            resolutionId: 'res_c3_laudo_tecnico',
            choiceText: '[💡 Hipótese] Mostrar que a origem é da galeria da esquina e pedir apoio técnico para a Associação.',
            intent: '💡 Resolver via Laudo Técnico',
            nodeText: '“Infiltração da galeria pluvial da esquina... Isso explica por que o muro dos dois umedeceu! Posso assinar um parecer técnico pra Tia Bete cobrar reparo sem brigar com o Seu Tião.”',
            nodeNote: 'Abordagem Técnica: transforma cético em aliado técnico da comunidade.',
            reply: 'Dr. Cláudio e Seu Tião baixaram a guarda. Caso 3 resolvido!',
            effects: {
              bondDelta: { H10: 18, H04: 10 },
              stubbornDelta: 0,
              receptivityDelta: { H10: 18, H04: 12 },
              postureDelta: { articulacao: 1, firmeza: 1 },
              setFlags: { caso_muro_via: 'laudo_claudio' }
            }
          }
        ],
        vigia: [
          {
            type: 'clue',
            clueId: 'c3_baixada_drenagem',
            choiceText: 'Perguntar se ele já viu problema de água minando perto das casas 04 e 10.',
            intent: '🔍 Consultar memória da rua',
            nodeText: '“Ih, aquilo lá é antigo! A galeria da esquina racha toda vez que chove forte e mina água no muro dos dois lados. Os vizinhos brigam achando que é culpa um do outro!”',
            nodeNote: 'Pista (Seu Oswaldo): histórico de galeria pluvial quebrada na esquina.',
            reply: 'Seu Oswaldo deu um sorriso de quem já viu essa história antes.'
          }
        ],
        H07: [
          {
            type: 'resolve',
            targetEntityId: 'H07',
            resolutionId: 'res_c3_mediacao_domino',
            choiceText: '[💡 Hipótese] Pedir ao Seu Raimundo para mediar o mal-entendido do muro na Roda de Dominó.',
            intent: '💡 Mediar pela convivência',
            nodeText: '“Deixa comigo, agente! Chamo o Tião pro dominó e explico que a culpa é do cano da rua. Ele confia em mim — amanhã mesmo os dois param de implicar!”',
            nodeNote: 'Abordagem Comunitária: reduz teimosia de Seu Tião e acalma o clima da rua.',
            reply: 'Seu Raimundo desarmou a rixa com leveza. Caso 3 resolvido!',
            effects: {
              bondDelta: { H07: 10, H04: 16, H10: 8 },
              receptivityDelta: { H04: 20, H10: 10 },
              postureDelta: { acolhimento: 1, articulacao: 1 },
              setFlags: { caso_muro_via: 'mediacao_raimundo' }
            }
          }
        ]
      }
    },

    // ========================================================================
    // CASO 4: O SILÊNCIO DOS IPÊS
    // ========================================================================
    {
      id: 'caso_silencio_ipes',
      title: 'Caso 4: O Silêncio dos Ipês',
      summary: 'Lucas (H13) voltou a evitar a UBS e Seu Tonho (H14) desconversa sobre tonturas na feira.',
      unlockCondition: (g) => g.weekNumber >= 2 || (g.storyState && g.storyState.chapter >= 2),
      contradiction: {
        clueA: 'c4_lourdes_observacao',
        clueB: 'c4_tonho_desculpa',
        title: '"Está tudo ótimo" × Desistência silenciosa na porta da UBS',
        hypothesisText: 'Nem Lucas nem Seu Tonho rejeitam o cuidado por falta de necessidade: Lucas travou diante da sala de espera lotada e Tonho teme que um diagnóstico tire sua autonomia na horta.'
      },
      clues: [
        {
          id: 'c4_lourdes_observacao',
          sourceId: 'H12',
          sourceLabel: 'Dona Lourdes (Casa 12)',
          category: 'Vizinho/Comunidade',
          isKey: true,
          text: 'Dona Lourdes viu Lucas dar meia-volta na calçada da UBS quando a recepção estava cheia, e notou Seu Tonho apoiando no carrinho de verduras por tontura.'
        },
        {
          id: 'c4_tonho_desculpa',
          sourceId: 'H14',
          sourceLabel: 'Seu Tonho (Casa 14)',
          category: 'Morador',
          isKey: true,
          text: 'Seu Tonho insistiu que "está forte feito touro" e só faltou ao grupo porque "tinha muita verdura pra colher".'
        },
        {
          id: 'c4_patricia_grupo',
          sourceId: 'fisioterapeuta',
          sourceLabel: 'Dra. Patrícia (eMulti)',
          category: 'UBS/Registro',
          isKey: false,
          text: 'Dra. Patrícia sugeriu atividades práticas ao ar livre (como na Horta ou Pracinha) onde ninguém se sinta exposto em fila de consultório.'
        }
      ],
      dialogueHooks: {
        H12: [
          {
            type: 'clue',
            clueId: 'c4_lourdes_observacao',
            choiceText: 'Perguntar se ela notou como têm passado Lucas (H13) e Seu Tonho (H14) na Rua dos Ipês.',
            intent: '🔍 Ouvir vizinha acolhedora',
            nodeText: '“Reparei sim, meu filho... O Lucas foi até a esquina do posto e voltou cabisbaixo quando viu a sala cheia. E o Tonho ontem parou o carrinho na sombra segurando a cabeça.”',
            nodeNote: 'Pista-Chave (Dona Lourdes): sinais silenciosos de barreira emocional e física.',
            reply: 'Dona Lourdes ficou feliz por você estar atento aos vizinhos da rua.'
          }
        ],
        H14: [
          {
            type: 'clue',
            clueId: 'c4_tonho_desculpa',
            choiceText: 'Perguntar sem pressionar se ele sentiu algum cansaço ou tontura puxando o carrinho.',
            intent: '🔍 Sondar saúde do homem',
            nodeText: '“Tontura nada, rapaz! Isso é só sol de meio-dia! Médico adora proibir a gente de trabalhar na roça — eu tô ótimo!”',
            nodeNote: 'Pista-Chave (H14): medo de perder autonomia no trabalho explica a recusa.',
            reply: 'Seu Tonho seguiu firme, mas agora você entende a raiz da resistência dele.'
          }
        ],
        fisioterapeuta: [
          {
            type: 'clue',
            clueId: 'c4_patricia_grupo',
            choiceText: 'Trocar ideia sobre como aproximar moradores arredios de fila de consultório.',
            intent: '🔍 Buscar alternativa eMulti',
            nodeText: '“Muita gente trava dentro de sala fechada, Alex. Se levarmos a atividade pra Horta ou pra sombra da Pracinha, quem tem medo de rótulo participa naturalmente!”',
            nodeNote: 'Pista (Dra. Patrícia): cuidado territorial fora das paredes da UBS.',
            reply: 'Dra. Patrícia deixou a agenda aberta para ações na praça e na horta.'
          },
          {
            type: 'resolve',
            targetEntityId: 'fisioterapeuta',
            resolutionId: 'res_c4_horta_ativa',
            choiceText: '[💡 Hipótese] Integrar Lucas e Seu Tonho em atividade prática na Horta com a equipe eMulti.',
            intent: '💡 Resolver via Território Vivo',
            nodeText: '“Perfeito! Seu Tonho ensina sobre os canteiros e Lucas registra o mutirão — sem cara de ambulatório, mas com cuidado real e checagem de pressão na sombra!”',
            nodeNote: 'Abordagem Territorial: une saúde mental, saúde do homem e Horta Comunitária.',
            reply: 'Dra. Patrícia organizou o encontro na Horta. Caso 4 resolvido!',
            effects: {
              npcBondDelta: { fisioterapeuta: 10 },
              bondDelta: { H13: 16, H14: 16, H12: 8 },
              receptivityDelta: { H13: 18, H14: 18 },
              postureDelta: { articulacao: 2, acolhimento: 1 },
              hortaStageMin: 1,
              setFlags: { caso_silencio_via: 'horta_emulti' }
            }
          }
        ],
        H13: [
          {
            type: 'resolve',
            targetEntityId: 'H13',
            resolutionId: 'res_c4_escuta_protegida',
            choiceText: '[💡 Hipótese] Combinar acolhimento no fim da tarde sem fila cheia e avisar Dona Lourdes como apoio.',
            intent: '💡 Resolver via Escuta Protegida',
            nodeText: '“Você percebeu que eu travei na porta por causa da fila... Se der pra ir num horário mais calmo sem todo mundo olhando, eu topo tentar sim.”',
            nodeNote: 'Abordagem Empática: respeita o tempo de Lucas e fortalece rede de apoio.',
            reply: 'Lucas respirou aliviado com o combinado. Caso 4 resolvido!',
            effects: {
              bondDelta: { H13: 20, H12: 10 },
              receptivityDelta: { H13: 22 },
              postureDelta: { acolhimento: 2 },
              setFlags: { caso_silencio_via: 'escuta_protegida' }
            }
          }
        ]
      }
    }
  ];

  class InvestigationSystem {
    constructor(game) {
      this.game = game;
      this.cases = {};
      this.reset();
      this._bindEvents();
    }

    reset() {
      this.cases = {};
      for (const def of INVESTIGATION_CASES) {
        const unlocked = typeof def.unlockCondition === 'function' ? !!def.unlockCondition(this.game) : false;
        this.cases[def.id] = {
          status: unlocked ? 'active' : 'locked',
          clues: [],
          hypothesisUnlocked: false,
          resolutionId: null
        };
      }
    }

    _bindEvents() {
      const g = this.game;
      if (!g.events) return;
      g.events.on('day:started', () => this.evaluateUnlocks({ silent: false }));
      g.events.on('story:eventCompleted', () => this.evaluateUnlocks({ silent: false }));
    }

    evaluateUnlocks({ silent = false } = {}) {
      for (const def of INVESTIGATION_CASES) {
        const st = this.cases[def.id];
        if (!st || st.status !== 'locked') continue;
        if (typeof def.unlockCondition === 'function' && def.unlockCondition(this.game)) {
          this.unlockCase(def.id, { silent });
        }
      }
    }

    unlockCase(caseId, { silent = false } = {}) {
      const st = this.cases[caseId];
      const def = this.getDefinition(caseId);
      if (!st || !def || st.status !== 'locked') return false;
      st.status = 'active';
      if (!silent && this.game.toast && !this.game.paused) {
        this.game.toast(`🔍 Novo Caso no Caderno [J]: ${def.title}`, 'info');
      }
      if (this.game.notebook) {
        this.game.notebook.addChronicleEntry(`🔍 Caso Aberto: ${def.title}`, def.summary);
      }
      return true;
    }

    getDefinition(caseId) {
      return INVESTIGATION_CASES.find(c => c.id === caseId) || null;
    }

    getCaseState(caseId) {
      return this.cases[caseId] || null;
    }

    getActiveCases() {
      return INVESTIGATION_CASES
        .filter(def => this.cases[def.id] && this.cases[def.id].status === 'active')
        .map(def => ({ def, state: this.cases[def.id] }));
    }

    getResolvedCases() {
      return INVESTIGATION_CASES
        .filter(def => this.cases[def.id] && this.cases[def.id].status === 'resolved')
        .map(def => ({ def, state: this.cases[def.id] }));
    }

    hasClue(caseId, clueId) {
      const st = this.cases[caseId];
      return !!(st && st.clues.includes(clueId));
    }

    discoverClue(caseId, clueId) {
      const st = this.cases[caseId];
      const def = this.getDefinition(caseId);
      if (!st || !def) return false;
      if (st.status === 'locked') st.status = 'active';
      if (st.clues.includes(clueId)) return false;

      st.clues.push(clueId);
      const clueDef = def.clues.find(c => c.id === clueId);
      if (this.game.notebook && clueDef) {
        this.game.notebook.addNote(clueDef.sourceId, clueDef.text);
        this.game.notebook.addChronicleEntry(`🧩 Pista (${def.title})`, `${clueDef.sourceLabel}: ${clueDef.text}`);
      }
      if (this.game.events) {
        this.game.events.emit('investigation:clueFound', { caseId, clueId });
      }
      if (this.game.toast && !this.game.paused) {
        this.game.toast(`🧩 Nova pista anotada no Caderno [J]!`, 'info');
      }
      return true;
    }

    canSynthesizeHypothesis(caseId) {
      const st = this.cases[caseId];
      const def = this.getDefinition(caseId);
      if (!st || !def || st.hypothesisUnlocked || st.status !== 'active') return false;
      return st.clues.includes(def.contradiction.clueA) && st.clues.includes(def.contradiction.clueB);
    }

    synthesizeHypothesis(caseId) {
      if (!this.canSynthesizeHypothesis(caseId)) return false;
      const st = this.cases[caseId];
      const def = this.getDefinition(caseId);
      st.hypothesisUnlocked = true;
      if (this.game.notebook) {
        this.game.notebook.addChronicleEntry(`💡 Contradição Descoberta: ${def.title}`, def.contradiction.hypothesisText);
      }
      if (this.game.events) {
        this.game.events.emit('investigation:hypothesisUnlocked', { caseId });
      }
      if (global.sfx && typeof global.sfx.bondUp === 'function') global.sfx.bondUp();
      if (this.game.toast) {
        this.game.toast(`💡 Hipótese sintetizada: ${def.title}! Novas opções desbloqueadas nos diálogos.`, 'success');
      }
      this.game.saveProgress();
      return true;
    }

    resolveCase(caseId, resolutionId) {
      const st = this.cases[caseId];
      const def = this.getDefinition(caseId);
      if (!st || !def || st.status === 'resolved') return false;
      st.status = 'resolved';
      st.resolutionId = resolutionId;
      if (this.game.notebook) {
        this.game.notebook.addChronicleEntry(`✅ Caso Resolvido: ${def.title}`, 'Você articulou uma solução concreta com a comunidade e a UBS.');
      }
      if (this.game.events) {
        this.game.events.emit('investigation:caseResolved', { caseId, resolutionId });
      }
      if (global.sfx && typeof global.sfx.success === 'function') global.sfx.success();
      if (this.game.toast) {
        this.game.toast(`✅ Caso Resolvido: ${def.title}!`, 'success');
      }
      return true;
    }

    // Non-destructively injects investigation clue/resolution choices into an entity's dialogue graph
    injectCaseOptions(entityId, baseGraph) {
      if (!baseGraph || !baseGraph.nodes) return baseGraph;
      const startKey = baseGraph.startNode || 'start';
      const startNode = baseGraph.nodes[startKey];
      if (!startNode || !Array.isArray(startNode.choices)) return baseGraph;

      const extraChoices = [];
      const extraNodes = {};

      for (const def of INVESTIGATION_CASES) {
        const st = this.cases[def.id];
        if (!st || st.status !== 'active') continue;
        const hooks = (def.dialogueHooks && def.dialogueHooks[entityId]) || [];

        for (const hook of hooks) {
          if (hook.type === 'clue' && !st.clues.includes(hook.clueId)) {
            const nodeId = `inv_clue_${def.id}_${hook.clueId}`;
            extraNodes[nodeId] = {
              text: hook.nodeText,
              note: hook.nodeNote,
              choices: [
                {
                  text: 'Anotar pista no Caderno de Campo e encerrar assunto.',
                  intent: '📓 Registrar pista',
                  type: 'EMPATHY',
                  effects: {
                    discoverCaseClue: { caseId: def.id, clueId: hook.clueId }
                  },
                  reply: hook.reply
                }
              ]
            };
            extraChoices.push({
              text: hook.choiceText,
              intent: hook.intent || '🔍 Investigar',
              next: nodeId
            });
          } else if (hook.type === 'resolve' && st.hypothesisUnlocked) {
            const nodeId = `inv_res_${def.id}_${hook.resolutionId}`;
            extraNodes[nodeId] = {
              text: hook.nodeText,
              note: hook.nodeNote,
              choices: [
                {
                  text: 'Confirmar esta abordagem e concluir o caso.',
                  intent: '✅ Pactuar solução',
                  type: 'EMPATHY',
                  effects: {
                    ...(hook.effects || {}),
                    resolveCase: { caseId: def.id, resolutionId: hook.resolutionId }
                  },
                  reply: hook.reply
                }
              ]
            };
            extraChoices.push({
              text: hook.choiceText,
              intent: hook.intent || '💡 Resolver Caso',
              next: nodeId
            });
          }
        }
      }

      if (extraChoices.length === 0) return baseGraph;

      const clonedNodes = { ...baseGraph.nodes, ...extraNodes };
      clonedNodes[startKey] = {
        ...startNode,
        choices: [...startNode.choices, ...extraChoices]
      };
      return {
        ...baseGraph,
        nodes: clonedNodes
      };
    }

    exportState() {
      return {
        cases: JSON.parse(JSON.stringify(this.cases))
      };
    }

    importState(data) {
      this.reset();
      if (!data || !data.cases || typeof data.cases !== 'object') return;
      for (const def of INVESTIGATION_CASES) {
        const src = data.cases[def.id];
        if (!src) continue;
        this.cases[def.id] = {
          status: ['locked', 'active', 'resolved'].includes(src.status) ? src.status : this.cases[def.id].status,
          clues: Array.isArray(src.clues) ? src.clues.slice() : [],
          hypothesisUnlocked: !!src.hypothesisUnlocked,
          resolutionId: src.resolutionId || null
        };
      }
    }
  }

  global.InvestigationSystem = InvestigationSystem;
  global.ACS_INVESTIGATION_CASES = INVESTIGATION_CASES;
})(window);

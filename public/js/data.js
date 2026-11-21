// ============================================================================
// TERRITÓRIO VIVO: CRÔNICAS DE UM ACS - WORLD DATA (32x32 TILE GRID)
// ============================================================================

window.ACS_DATA = {
  TILE_SIZE: 32,
  MAP_COLS: 120,
  MAP_ROWS: 56,

  // Casa do Protagonista (ACS mora na própria comunidade — leste da ponte, faceando Estrada do Sol)
  playerHome: {
    tx: 22,
    ty: 21,
    x: 22 * 32 + 16,
    y: 21 * 32 + 24,
    name: 'Casa do ACS'
  },

  // Novos Polos Comunitários (Fase 2)
  vendinha: {
    tx: 22,
    ty: 32,
    x: 22 * 32 + 16,
    y: 32 * 32 + 24,
    name: 'Vendinha & Padaria do Zé',
    openHour: 7,
    closeHour: 21.5
  },

  pracinha: {
    c1: 35,
    r1: 43,
    c2: 53,
    r2: 52,
    x: 44 * 32 + 16,
    y: 47 * 32 + 16,
    name: 'Pracinha dos Ipês'
  },

  associacao: {
    tx: 60,
    ty: 49,
    x: 60 * 32 + 16,
    y: 49 * 32 + 24,
    name: 'Associação de Moradores',
    openHour: 9,
    closeHour: 19
  },

  horta: {
    c1: 65,
    r1: 44,
    c2: 74,
    r2: 52,
    x: 69 * 32 + 16,
    y: 48 * 32 + 16,
    name: 'Terreno da Horta Comunitária'
  },

  // Bairro Vizinho (Vila Aurora — Leste da Microárea 04)
  campinho: {
    c1: 89,
    r1: 29,
    c2: 109,
    r2: 38,
    x: 99 * 32 + 16,
    y: 33.5 * 32,
    name: 'Campinho de Futebol da Vila Aurora'
  },

  mysteryHouse: {
    tx: 106,
    ty: 10,
    x: 106 * 32 + 16,
    y: 10 * 32 + 24,
    name: 'Casa Misteriosa (Casarão Nº 00)'
  },

  days: [
    {
      day: 1,
      dayOfWeek: 0,
      shortName: 'Seg.',
      name: 'Segunda-feira',
      weekTag: 'Alinhamento & Insumos (UBS)',
      title: 'Cadastramento e Busca Ativa de Hipertensos',
      weatherSchedule: {
        7: 'SUNNY', 8: 'SUNNY', 9: 'SUNNY', 10: 'SUNNY',
        11: 'HEATWAVE', 12: 'HEATWAVE', 13: 'HEATWAVE', 14: 'HEATWAVE',
        15: 'SUNNY', 16: 'SUNNY', 17: 'SUNNY', 18: 'SUNNY', 19: 'SUNNY', 20: 'SUNNY', 21: 'SUNNY', 22: 'SUNNY'
      },
      missionDesc: 'Acompanhe as prioridades da semana na Microárea 04. Descubra horários dos moradores trabalhadores (inclusive no começo da noite!) e construa vínculo sem pressa.',
      bonusGoal: 'Descobrir o horário de pelo menos 4 casas que estavam fechadas.'
    },
    {
      day: 2,
      dayOfWeek: 1,
      shortName: 'Ter.',
      name: 'Terça-feira',
      weekTag: 'Calor Forte & Vigilância',
      title: 'Sol Escaldante e Mutirão Contra a Dengue',
      weatherSchedule: {
        7: 'SUNNY', 8: 'SUNNY', 9: 'HEATWAVE', 10: 'HEATWAVE',
        11: 'HEATWAVE', 12: 'HEATWAVE', 13: 'HEATWAVE', 14: 'HEATWAVE',
        15: 'HEATWAVE', 16: 'SUNNY', 17: 'SUNNY', 18: 'SUNNY', 19: 'SUNNY', 20: 'SUNNY', 21: 'SUNNY', 22: 'SUNNY'
      },
      missionDesc: 'O calor está fortíssimo! Hidrate-se nas sombras das mangueiras, no filtro de casa ou na UBS, e vistorie os quintais com focos de Aedes aegypti.',
      bonusGoal: 'Eliminar 3 focos de mosquito da dengue nos quintais.'
    },
    {
      day: 3,
      dayOfWeek: 2,
      shortName: 'Qua.',
      name: 'Quarta-feira',
      weekTag: 'Grupos da UBS & Chuva',
      title: 'Temporal de Verão e Combate às Fake News de Vacina',
      weatherSchedule: {
        7: 'CLOUDY', 8: 'CLOUDY', 9: 'RAIN', 10: 'RAIN',
        11: 'RAIN', 12: 'CLOUDY', 13: 'RAIN', 14: 'RAIN',
        15: 'RAIN', 16: 'CLOUDY', 17: 'CLOUDY', 18: 'CLOUDY', 19: 'CLOUDY', 20: 'CLOUDY', 21: 'CLOUDY', 22: 'CLOUDY'
      },
      missionDesc: 'Chuva forte na Estrada do Sol! Abra o Guarda-Sol/Capa SUS, fortaleça a confiança nas vacinas e aproveite o entardecer para visitar quem volta do serviço.',
      bonusGoal: 'Orientar famílias resistentes sobre a segurança das vacinas do SUS.'
    },
    {
      day: 4,
      dayOfWeek: 3,
      shortName: 'Qui.',
      name: 'Quinta-feira',
      weekTag: 'Cuidado Continuado & Convivência',
      title: 'Pré-Natal, Saúde Mental e Cuidado Continuado',
      weatherSchedule: {
        7: 'SUNNY', 8: 'SUNNY', 9: 'SUNNY', 10: 'HEATWAVE',
        11: 'HEATWAVE', 12: 'HEATWAVE', 13: 'CLOUDY', 14: 'RAIN',
        15: 'RAIN', 16: 'SUNNY', 17: 'SUNNY', 18: 'SUNNY', 19: 'SUNNY', 20: 'SUNNY', 21: 'SUNNY', 22: 'SUNNY'
      },
      missionDesc: 'Clima instável: sol forte pela manhã e chuva à tarde. Acompanhe gestantes, puérperas e moradores em sofrimento emocional no seu ritmo.',
      bonusGoal: 'Alcançar Vínculo Familiar médio acima de 70% na microárea.'
    },
    {
      day: 5,
      dayOfWeek: 4,
      shortName: 'Sex.',
      name: 'Sexta-feira',
      weekTag: 'Fechamento Semanal e-SUS',
      title: 'Fechamento Semanal e Mobilização na Vila Esperança',
      weatherSchedule: {
        7: 'SUNNY', 8: 'SUNNY', 9: 'SUNNY', 10: 'SUNNY',
        11: 'HEATWAVE', 12: 'HEATWAVE', 13: 'HEATWAVE', 14: 'SUNNY',
        15: 'SUNNY', 16: 'SUNNY', 17: 'SUNNY', 18: 'SUNNY', 19: 'SUNNY', 20: 'SUNNY', 21: 'SUNNY', 22: 'SUNNY'
      },
      missionDesc: 'Dia de fechar o relatório semanal no e-SUS da UBS (antes das 18h)! Conclua as prioridades pendentes e fortaleça os laços da microárea.',
      bonusGoal: 'Concluir a meta semanal de 15 visitas e +70% de vínculo médio.'
    },
    {
      day: 6,
      dayOfWeek: 5,
      shortName: 'Sáb.',
      name: 'Sábado',
      weekTag: 'Dia Livre & Comunidade (UBS Fechada)',
      title: 'Sábado Livre na Vila Esperança',
      weatherSchedule: {
        7: 'SUNNY', 8: 'SUNNY', 9: 'SUNNY', 10: 'SUNNY',
        11: 'SUNNY', 12: 'HEATWAVE', 13: 'HEATWAVE', 14: 'SUNNY',
        15: 'SUNNY', 16: 'SUNNY', 17: 'SUNNY', 18: 'SUNNY', 19: 'SUNNY', 20: 'SUNNY', 21: 'SUNNY', 22: 'SUNNY'
      },
      missionDesc: 'A UBS não tem expediente aos sábados! Aproveite o dia livre para conversar sem pressa com os vizinhos, visitar quem trabalha na semana e descansar antes da virada de domingo.',
      bonusGoal: 'Explorar o bairro no sábado e descansar em casa para iniciar a próxima semana.'
    }
  ],

  items: [
    {
      id: 'water',
      key: '1',
      name: 'Garrafa d\'Água',
      shortName: 'Água',
      count: 4,
      maxCount: 5,
      desc: 'Recupera +42% de Hidratação e +16 de Energia. Reabasteça na UBS ou nas casas de moradores amigos.'
    },
    {
      id: 'sunscreen',
      key: '2',
      name: 'Protetor FPS 50',
      shortName: 'Protetor',
      count: 2,
      maxCount: 3,
      desc: 'Reduz o desgaste do Sol Escaldante em 65% durante 3 horas.'
    },
    {
      id: 'umbrella',
      key: '3',
      name: 'Guarda-Sol / Capa',
      shortName: 'Guarda-Sol',
      count: 1,
      maxCount: 1,
      isToggle: true,
      desc: 'Protege contra a Chuva (evita lentidão e fadiga) e cria sombra portátil no Sol Forte!'
    },
    {
      id: 'treats',
      key: '4',
      name: 'Biscoito Canino',
      shortName: 'Petisco',
      count: 3,
      maxCount: 5,
      desc: 'Acalma cachorros bravos instantaneamente por 2h30 sem perder energia.'
    }
  ],

  dogs: [
    {
      id: 'dog1',
      name: 'Trovão (Caramelo Raiz)',
      breed: 'caramelo',
      x: 36 * 32,
      y: 16 * 32,
      patrolRadius: 110,
      aggroRadius: 120,
      speed: 145,
      ownerHint: 'Guarda a esquina entre a Rua das Acácias e a Casa 02.'
    },
    {
      id: 'dog2',
      name: 'Brutus (Fila do Seu Tião)',
      breed: 'fila',
      x: 59 * 32,
      y: 15 * 32,
      patrolRadius: 115,
      aggroRadius: 128,
      speed: 150,
      ownerHint: 'Fica solto perto das Casas 04 e 05 no Norte.'
    },
    {
      id: 'dog3',
      name: 'Fumaça (Pinscher Furioso)',
      breed: 'pinscher',
      x: 49 * 32,
      y: 38 * 32,
      patrolRadius: 105,
      aggroRadius: 120,
      speed: 162,
      ownerHint: 'Corre atrás de agentes na Rua dos Ipês (Sul).'
    }
  ],

  cats: [
    {
      id: 'cat1',
      name: 'Mingau (Gatinho Branco)',
      shortName: 'Mingau',
      coat: 'branco',
      personality: 'fofinho',
      x: 29 * 32 + 12,
      y: 13 * 32 + 8,
      patrolRadius: 55,
      speed: 58,
      desc: 'Um gatinho branquinho super dócil que adora tirar soneca no sol perto da Casa 01 e ronrona alto com qualquer carinho.'
    },
    {
      id: 'cat2',
      name: 'Paçoca (Laranjinha Carinhoso)',
      shortName: 'Paçoca',
      coat: 'laranja',
      personality: 'fofinho',
      x: 42 * 32,
      y: 46 * 32,
      patrolRadius: 65,
      speed: 62,
      desc: 'O mascote laranjinha da Pracinha dos Ipês! Sempre vem se esfregar nas pernas de quem passa para ganhar cafuné.'
    },
    {
      id: 'cat3',
      name: 'Bolinha (Tricolor Fofinha)',
      shortName: 'Bolinha',
      coat: 'tricolor',
      personality: 'fofinho',
      x: 26 * 32 + 14,
      y: 33 * 32,
      patrolRadius: 52,
      speed: 56,
      desc: 'Gatinha tricolor redondinha que fica perto da Vendinha do Zé. Ama coçadinha atrás das orelhas!'
    },
    {
      id: 'cat4',
      name: 'Sombra (Gatinho Preto Medroso)',
      shortName: 'Sombra',
      coat: 'preto',
      personality: 'medroso',
      x: 52 * 32,
      y: 27 * 32 + 8,
      patrolRadius: 70,
      fleeRadius: 118,
      speed: 162,
      desc: 'Um gatinho preto muito arisco da Rua da Esperança. Leva susto fácil e sai correndo quando alguém chega perto!'
    },
    {
      id: 'cat5',
      name: 'Frajola (Frajolinha Arisco)',
      shortName: 'Frajola',
      coat: 'frajola',
      personality: 'medroso',
      x: 64 * 32,
      y: 41 * 32 + 10,
      patrolRadius: 75,
      fleeRadius: 122,
      speed: 168,
      desc: 'Gatinho frajola desconfiado que ronda perto da Horta Comunitária. Foge rapidinho se você se aproximar sem petisco.'
    }
  ],

  dengueSpots: [
    { id: 'dengue1', type: 'tire', x: 34 * 32 + 16, y: 10 * 32 + 18, houseId: 'H01', label: 'Pneu velho com água parada', cleared: false },
    { id: 'dengue2', type: 'tank', x: 64 * 32 + 16, y: 10 * 32 + 18, houseId: 'H04', label: 'Caixa d\'água destampada no quintal', cleared: false },
    { id: 'dengue3', type: 'pots', x: 44 * 32 + 16, y: 24 * 32 + 18, houseId: 'H07', label: 'Pratinhos de plantas com larvas', cleared: false },
    { id: 'dengue4', type: 'bottles', x: 64 * 32 + 16, y: 38 * 32 + 18, houseId: 'H14', label: 'Garrafas destampadas atrás do muro', cleared: false }
  ],

  // 15 Brazilian Neighborhood Houses aligned to 32x32 tiles!
  // Each house occupies roughly 5x4 tiles (160x128px) with door centered at (tx*32, ty*32).
  // Plenty of space behind roofs (4+ tiles) so the player can walk behind houses with Y-Sorting!
  families: [
    {
      id: 'H01',
      code: 'Casa 01',
      name: 'Dona Dulce & Seu Geraldo',
      archetype: 'AMIGO',
      archetypeLabel: 'Moradora Amiga & Acolhedora',
      condition: 'Hipertensão Controlada & Horta Medicinal',
      risk: 'Baixo Risco',
      tx: 30, ty: 10,
      houseStyle: { wall: '#f6ebd4', trim: '#8b5a2b', roof: 'terracotta', awning: '#3b8252', garden: true },
      appearance: { skin: '#d99e73', hair: '#e5e7eb', hairStyle: 'bun', shirt: '#3b8252', glasses: true, gender: 'f' },
      schedule: [[7, 21]],
      scheduleText: '07:00 às 21:00 (Aposentados - Sempre em casa)',
      neighborClue: 'Dona Dulce sabe a rotina de quase toda a Rua das Acácias!',
      knownSchedule: true,
      bond: 75,
      stubbornness: 0,
      dialogues: [
        {
          greeting: '“Que alegria ver você com esse colete azul, meu anjo! Entre, saia desse sol! Fiz um chá de cidreira e deixei água geladinha no filtro de barro. Como está a correria na UBS?”',
          note: 'Condição: Pressão 120x80 mmHg. Toma losartana certinho todos os dias às 08h.',
          choices: [
            {
              text: 'Aceitar a água fresca, aferir a pressão do casal e perguntar sobre o horário dos vizinhos que trabalham.',
              tag: '🤝 Vínculo +12 • 💧 +35 • 🔍 2 Horários',
              type: 'EMPATHY',
              bondDelta: 12,
              staminaDelta: 20,
              hydrationDelta: 35,
              revealNeighbors: ['H02', 'H03'],
              reply: '“A pressão está ótima! Olha, o Marcos da Casa 02 sai pro plantão às 09h45, pegue ele cedinho! Já a Camila da Casa 03 trabalha no comércio e só volta depois das 16h!”'
            },
            {
              text: 'Elogiar a horta medicinal de Dona Dulce e orientar sobre não acumular água nos pratinhos.',
              tag: '🌱 Técnica + Educação • Vínculo +10 • 💧 +25',
              type: 'EDUCATE',
              bondDelta: 10,
              staminaDelta: 15,
              hydrationDelta: 25,
              revealNeighbors: ['H02'],
              reply: '“Muito bem lembrado! Já coloquei areia até a borda de todos os vasos. Beba um copo d\'água antes de seguir pela rua!”'
            }
          ]
        }
      ]
    },
    {
      id: 'H02',
      code: 'Casa 02',
      name: 'Marcos Vinícius (Vigilante)',
      archetype: 'TRABALHADOR',
      archetypeLabel: 'Trabalhador em Turno',
      condition: 'Insônia, Pré-Hipertensão e Dor Lombar',
      risk: 'Médio Risco',
      tx: 40, ty: 10,
      houseStyle: { wall: '#dde6ee', trim: '#52657a', roof: 'clayDark', awning: '#4a6b8a', garden: false },
      appearance: { skin: '#9e6b47', hair: '#27201c', hairStyle: 'short', shirt: '#334e68', hat: '#1e293b', gender: 'm' },
      schedule: [[7.5, 9.75], [16.5, 20.5]],
      scheduleText: '07:30–09:45 e 16:30–20:30 (Turno Noturno)',
      neighborClue: 'Chega do plantão às 08h e dorme às 09h45; acorda novamente após 16h30.',
      knownSchedule: false,
      bond: 40,
      stubbornness: 25,
      dialogues: [
        {
          greeting: '“Bom dia, agente... Acabei de chegar do plantão da noite. Minhas costas estão moídas e tenho tomado muito energético pra não cochilar no serviço.”',
          note: 'Alerta Clínico: Excesso de cafeína/energéticos elevando a PA (138x88 mmHg) e prejudicando o sono diurno.',
          choices: [
            {
              text: 'Acolher o cansaço do turno noturno, combinar higiene do sono e reduzir o energético aos poucos.',
              tag: '💚 Empatia • Vínculo +18',
              type: 'EMPATHY',
              bondDelta: 18,
              reply: '“Ninguém nunca tinha parado pra pensar na minha rotina de vigia... Vou tentar cortar o energético depois das 2h da manhã e passar na UBS.”'
            },
            {
              text: 'Ensinar alongamentos rápidos para a lombar e agendar avaliação com a equipe multiprofissional (eMulti).',
              tag: '🏃 Técnica • Vínculo +14',
              type: 'EDUCATE',
              bondDelta: 14,
              reply: '“Show! Esses alongamentos já aliviaram um pouco. Obrigado por vir antes de eu dormir!”'
            },
            {
              text: 'Dizer apenas que energético faz mal e que ele precisa mudar de emprego.',
              tag: '⚠️ Autoritária • Vínculo -10',
              type: 'AUTHORITARIAN',
              bondDelta: -10,
              reply: '“Falar é fácil, né? Os boletos não esperam. Preciso descansar agora, tchau.”'
            }
          ]
        }
      ]
    },
    {
      id: 'H03',
      code: 'Casa 03',
      name: 'Camila & Pedrinho (4 anos)',
      archetype: 'TRABALHADOR',
      archetypeLabel: 'Mãe Trabalhadora',
      condition: 'Puericultura & Caderneta da Criança',
      risk: 'Médio Risco',
      tx: 50, ty: 10,
      houseStyle: { wall: '#f9e3d8', trim: '#9a5a42', roof: 'terracotta', awning: '#c86d51', garden: true },
      appearance: { skin: '#e8b896', hair: '#523422', hairStyle: 'long', shirt: '#d96b6b', gender: 'f' },
      schedule: [[7.5, 9.25], [16, 21]],
      scheduleText: '07:30–09:15 ou 16:00–21:00 (Comércio)',
      neighborClue: 'Deixa o Pedrinho na creche às 09h15 e volta do trabalho às 16h00.',
      knownSchedule: false,
      bond: 50,
      stubbornness: 20,
      dialogues: [
        {
          greeting: '“Oi! Que bom que me pegou em casa! Recebi um áudio no grupo da escola dizendo que a vacina da gripe dá febre forte nas crianças, fiquei com medo de levar o Pedrinho...”',
          note: 'Verificação: Caderneta de vacinação com reforço dos 4 anos pendente.',
          choices: [
            {
              text: 'Olhar a Caderneta com carinho, acolher a dúvida e explicar como a vacina protege com segurança.',
              tag: '💉 Empatia & Ciência • Vínculo +20 • 🔍 2 Horários',
              type: 'EMPATHY',
              bondDelta: 20,
              revealNeighbors: ['H04', 'H05'],
              reply: '“Que alívio conversar com quem não julga a gente! Amanhã levo o Pedrinho na sala de vacina. A propósito: o Seu Tião da Casa 04 fica a manhã toda, e a Dona Neide da 05 atende costura a partir das 10h!”'
            },
            {
              text: 'Fazer a brincadeira do "Super-Herói do Zé Gotinha" com o Pedrinho para vencer o medo da agulha.',
              tag: '🦸 Abordagem Lúdica • Vínculo +16',
              type: 'EDUCATE',
              bondDelta: 16,
              reply: '“Olha lá, o Pedrinho até sorriu! Muito obrigada pelo carinho com meu filho!”'
            },
            {
              text: 'Ameaçar acionar o Conselho Tutelar se não vacinar até amanhã.',
              tag: '❌ Punitiva • Vínculo -15',
              type: 'AUTHORITARIAN',
              bondDelta: -15,
              reply: '“Não precisava falar assim comigo! Eu só estava com dúvida!”'
            }
          ]
        }
      ]
    },
    {
      id: 'H04',
      code: 'Casa 04',
      name: 'Seu Sebastião ("Seu Tião")',
      archetype: 'TEIMOSO',
      archetypeLabel: 'Paciente Teimoso & Desconfiado',
      condition: 'Hipertensão Severa & Tabagismo',
      risk: 'Alto Risco',
      tx: 60, ty: 10,
      houseStyle: { wall: '#e8dec5', trim: '#6b4c35', roof: 'slateWarm', awning: '#9e4738', garden: false },
      appearance: { skin: '#b97e56', hair: '#d1d5db', hairStyle: 'bald', shirt: '#9e4738', mustache: true, hat: '#8b6f4e', gender: 'm' },
      schedule: [[8, 12.5], [14.5, 18]],
      scheduleText: '08:00–12:30 e 14:30–18:00 (Sai pro dominó após almoço)',
      neighborClue: 'Fica em casa o dia todo, menos entre 12h30 e 14h30 quando joga dominó.',
      knownSchedule: true,
      bond: 22,
      stubbornness: 85,
      dialogues: [
        {
          greeting: '“Já vem o pessoal do postinho querer mandar na minha comida! Eu só tomo remédio de pressão quando a nuca dói! Minha mãe viveu até os 90 comendo torresmo com sal!”',
          note: 'Resistência: Paciente acha que hipertensão sempre dá sintoma. Última PA: 165x100 mmHg.',
          choices: [
            {
              text: 'Ouvir as histórias dele primeiro e explicar a pressão silenciosa usando a analogia do cano d\'água.',
              tag: '💚 Empatia & Analogia • Vínculo +24 (Vence Teimosia)',
              type: 'EMPATHY',
              bondDelta: 24,
              stubbornDelta: -35,
              reply: '“Hmm... essa história do cano com pressão alta sem fazer barulho faz sentido. Ninguém nunca me explicou assim sem brigar comigo. Pode medir essa pressão então!”'
            },
            {
              text: 'Pactuar tempero natural (alho, cheiro-verde e pimenta) para reduzir metade do sal sem perder o sabor.',
              tag: '🍲 Técnica / Pactuação • Vínculo +18',
              type: 'EDUCATE',
              bondDelta: 18,
              stubbornDelta: -25,
              reply: '“Com alho e cheiro-verde até que desce bem! Se não tirar tudo de uma vez, eu topo tomar o comprimido todo dia cedo.”'
            },
            {
              text: 'Dar um sermão duro dizendo que ele terá um AVC se continuar teimoso.',
              tag: '⚡ Confronto • Vínculo -12 (Fecha a porta)',
              type: 'AUTHORITARIAN',
              bondDelta: -12,
              reply: '“Vira essa boca pra lá! Vaso ruim não quebra! Hoje não quero conversa não!”'
            }
          ]
        }
      ]
    },
    {
      id: 'H05',
      code: 'Casa 05',
      name: 'Dona Neide (Costureira)',
      archetype: 'TEIMOSO',
      archetypeLabel: 'Resistente à Medicação',
      condition: 'Diabetes Tipo 2 Descompensada',
      risk: 'Alto Risco',
      tx: 70, ty: 10,
      houseStyle: { wall: '#f5e4b8', trim: '#7c5230', roof: 'terracotta', awning: '#b85c38', garden: true },
      appearance: { skin: '#8d593a', hair: '#3b2820', hairStyle: 'bun', shirt: '#a84a68', glasses: true, gender: 'f' },
      schedule: [[10, 17.5]],
      scheduleText: '10:00 às 17:30 (Ateliê de costura em casa)',
      neighborClue: 'Entrega encomendas cedo e abre a costura em casa a partir das 10h00.',
      knownSchedule: false,
      bond: 28,
      stubbornness: 75,
      dialogues: [
        {
          greeting: '“Estou cheia de bainha de calça pra entregar! E já aviso: parei com a Metformina porque minha vizinha disse que Chá de Insulina Vegetal cura diabetes sozinho!”',
          note: 'Alerta Clínico: Glicemia capilar recente em 248 mg/dL e formigamento nos pés.',
          choices: [
            {
              text: 'Respeitar o saber tradicional do chá, explicar como unir chá + medicação da UBS e examinar os pés dela.',
              tag: '🦶 Empatia & Pé Diabético • Vínculo +22 • 🔍 1 Horário',
              type: 'EMPATHY',
              bondDelta: 22,
              stubbornDelta: -30,
              revealNeighbors: ['H06'],
              reply: '“Você olhou até a sola do meu pé? Tudo bem, não vou largar o comprimido da receita. Ah, o Jorge da Casa 06 só volta da obra às 15h30!”'
            },
            {
              text: 'Organizar uma caixinha divisora de remédios ao lado da máquina de costura para ela não esquecer.',
              tag: '📦 Técnica Prática • Vínculo +16',
              type: 'EDUCATE',
              bondDelta: 16,
              stubbornDelta: -20,
              reply: '“Do lado da minha máquina Singer não tem como esquecer mesmo! Gostei da ideia.”'
            },
            {
              text: 'Dizer que chá é crendice e mandar jogar as ervas fora.',
              tag: '❌ Desrespeito • Vínculo -14',
              type: 'AUTHORITARIAN',
              bondDelta: -14,
              reply: '“Crendice nada, minha avó me criou com ervas! Com licença que tenho costura pra terminar.”'
            }
          ]
        }
      ]
    },
    {
      id: 'H06',
      code: 'Casa 06',
      name: 'Jorge & Luciana (Pedreiro)',
      archetype: 'TRABALHADOR',
      archetypeLabel: 'Casal Trabalhador',
      condition: 'Tosse Crônica (+3 semanas) - Suspeita TB',
      risk: 'Alto Risco',
      tx: 30, ty: 24,
      houseStyle: { wall: '#e5d5c3', trim: '#6e4f3a', roof: 'clayDark', awning: '#8c6239', garden: false },
      appearance: { skin: '#a87049', hair: '#291f1a', hairStyle: 'short', shirt: '#c26e32', gender: 'm' },
      schedule: [[7.5, 9], [15.5, 21]],
      scheduleText: '07:30–09:00 ou 15:30–21:00 (Obra / Faxina)',
      neighborClue: 'Sai para a obra às 09h00 em ponto e retorna por volta das 15h30.',
      knownSchedule: false,
      bond: 45,
      stubbornness: 30,
      dialogues: [
        {
          greeting: '“Oi, agente! Desculpa a poeira, cheguei da obra agora. Essa tosse não me larga há quase um mês, acho que é alergia ao cimento e friagem...”',
          note: 'Vigilância: Sintomático Respiratório (tosse > 3 semanas + febre vespertina leve).',
          choices: [
            {
              text: 'Entregar o pote de coleta de escarro (BAAR), orientar a coleta ao acordar e tranquilizar que TB tem cura gratuita no SUS.',
              tag: '🔬 Busca Ativa TB • Vínculo +22 • 🔍 2 Horários',
              type: 'EMPATHY',
              bondDelta: 22,
              revealNeighbors: ['H07', 'H08'],
              reply: '“Rapaz, você já trouxe o potinho pra eu não perder dia de serviço! Amanhã cedo a Luciana deixa na UBS. Olha, o Seu Raimundo da 07 está na varanda, e a Bia da 08 fica das 10h30 às 16h!”'
            },
            {
              text: 'Orientar sobre manter janelas abertas para ventilação e entrada de luz solar nos cômodos.',
              tag: '☀️ Prevenção Técnica • Vínculo +15',
              type: 'EDUCATE',
              bondDelta: 15,
              reply: '“Boa dica! A gente deixava tudo fechado por causa da poeira da rua, vamos abrir a janela dos fundos.”'
            }
          ]
        }
      ]
    },
    {
      id: 'H07',
      code: 'Casa 07',
      name: 'Seu Raimundo (Ex-Ferroviário)',
      archetype: 'AMIGO',
      archetypeLabel: 'Liderança Comunitária & Amigo',
      condition: 'Artrose no Joelho & Memória do Bairro',
      risk: 'Baixo Risco',
      tx: 40, ty: 24,
      houseStyle: { wall: '#e4f0dc', trim: '#52734d', roof: 'terracotta', awning: '#3b8252', garden: true },
      appearance: { skin: '#7a4f34', hair: '#f3f4f6', hairStyle: 'short', shirt: '#4f7a56', hat: '#c29b61', mustache: true, gender: 'm' },
      schedule: [[7, 21]],
      scheduleText: '07:00 às 21:00 (Sempre na varanda sombreada)',
      neighborClue: 'Está sempre na varanda tomando café e observando o movimento da rua central.',
      knownSchedule: true,
      bond: 80,
      stubbornness: 0,
      dialogues: [
        {
          greeting: '“Ô meu agente favorito! Sente aqui na sombra da mangueira um minutinho! Tome uma água fresca do filtro que o sol da Vila Esperança não brinca em serviço!”',
          note: 'Acompanhamento: Participa do grupo de caminhada da UBS terças e quintas.',
          choices: [
            {
              text: 'Descansar na sombra, avaliar o joelho dele e perguntar quem está em casa na rua central e no sul.',
              tag: '🌳 Sombra • 💧 +30 • 🔍 Revela 3 Horários',
              type: 'EMPATHY',
              bondDelta: 12,
              staminaDelta: 22,
              hydrationDelta: 30,
              revealNeighbors: ['H08', 'H09', 'H11'],
              reply: '“Meu joelho melhorou 100%! Anote aí: a Beatriz da 08 fica das 10h30 às 16h; Dona Helena da 09 só sai das 09h30 às 11h30; e o Rodrigo motoboy da 11 para em casa das 11h15 às 14h45!”'
            },
            {
              text: 'Convidar Seu Raimundo para representar a microárea no Conselho Local de Saúde da UBS.',
              tag: '🏛️ Controle Social • Vínculo +15 • 💧 +25',
              type: 'EDUCATE',
              bondDelta: 15,
              staminaDelta: 15,
              hydrationDelta: 25,
              revealNeighbors: ['H09', 'H10'],
              reply: '“Com muito orgulho! A comunidade precisa defender nossa UBS. Pode contar comigo!”'
            }
          ]
        }
      ]
    },
    {
      id: 'H08',
      code: 'Casa 08',
      name: 'Beatriz ("Bia" - Gestante 32s)',
      archetype: 'PRIORITARIO',
      archetypeLabel: 'Gestante de Pré-Natal',
      condition: 'Gestação 3º Trimestre & Edema Leve',
      risk: 'Prioridade',
      tx: 50, ty: 24,
      houseStyle: { wall: '#f2e4f4', trim: '#7c5385', roof: 'terracotta', awning: '#8b5e96', garden: true },
      appearance: { skin: '#f0c4a8', hair: '#4a2e1b', hairStyle: 'long', shirt: '#9c6aad', gender: 'f' },
      schedule: [[10.5, 16]],
      scheduleText: '10:30 às 16:00 (Home-office e repouso)',
      neighborClue: 'Faz exames cedo e caminha no fim do dia; fica em casa entre 10h30 e 16h00.',
      knownSchedule: false,
      bond: 60,
      stubbornness: 15,
      dialogues: [
        {
          greeting: '“Oi! Que bom que você veio! Estou na 32ª semana da Sofia, mas meus pés incharam um pouco ontem e fiquei ansiosa com a hora do parto...”',
          note: 'Pré-Natal: Conferir Cartão da Gestante, sinais de alerta (cefaleia, PA), exames e plano de parto.',
          choices: [
            {
              text: 'Conferir o Cartão da Gestante, avaliar a pressão, orientar elevar as pernas e explicar os sinais de parto.',
              tag: '🤰 Pré-Natal Humanizado • Vínculo +20',
              type: 'EMPATHY',
              bondDelta: 20,
              reply: '“Ver que minha pressão está 110x70 me deixou tão tranquila! Vou elevar os pés no travesseiro e confirmar a consulta com a enfermeira.”'
            },
            {
              text: 'Orientar sobre aleitamento materno exclusivo e rede de apoio para as primeiras semanas do bebê.',
              tag: '🍼 Educação Perinatal • Vínculo +16',
              type: 'EDUCATE',
              bondDelta: 16,
              reply: '“Adorei as dicas da pega correta na amamentação! Você explica com tanta calma!”'
            }
          ]
        }
      ]
    },
    {
      id: 'H09',
      code: 'Casa 09',
      name: 'Dona Helena & Vovô Joaquim',
      archetype: 'PRIORITARIO',
      archetypeLabel: 'Acamado & Cuidadora Sobrecarregada',
      condition: 'Pós-AVC & Sobrecarga do Cuidador',
      risk: 'Alto Risco',
      tx: 60, ty: 24,
      houseStyle: { wall: '#e8eef5', trim: '#586a82', roof: 'slateWarm', awning: '#647996', garden: true },
      appearance: { skin: '#d8a684', hair: '#73655c', hairStyle: 'bun', shirt: '#5b7290', gender: 'f' },
      schedule: [[8, 9.5], [11.5, 18]],
      scheduleText: '08:00–09:30 e 11:30–18:00 (Sai 9h30 p/ farmácia)',
      neighborClue: 'Dona Helena só sai entre 09h30 e 11h30 quando a sobrinha fica com o Vovô.',
      knownSchedule: true,
      bond: 55,
      stubbornness: 10,
      dialogues: [
        {
          greeting: '“Entre, agente... Cuidar do meu pai acamado não é fácil, às vezes sinto que ninguém vê o meu cansaço. Só lembram de perguntar dele...”',
          note: 'Olhar Integral: Na Atenção Primária, cuidar de quem cuida é essencial para a saúde da família.',
          choices: [
            {
              text: 'Perguntar primeiro como ELA está se sentindo, acolher seu cansaço e depois revisar o cuidado do Seu Joaquim.',
              tag: '💜 Cuidando do Cuidador • Vínculo +22 • 🔍 1 Horário',
              type: 'EMPATHY',
              bondDelta: 22,
              revealNeighbors: ['H10'],
              reply: '“Meus olhos até encheram d\'água... Só de perguntar como eu estou já tirou um peso do meu peito! Ah, o Dr. Cláudio da 10 atende das 09h às 13h ou após 15h.”'
            },
            {
              text: 'Ensinar o relógio de mudança de decúbito a cada 2 horas para prevenir lesões por pressão.',
              tag: '🛏️ Técnica Preventiva • Vínculo +16',
              type: 'EDUCATE',
              bondDelta: 16,
              reply: '“Colar esse desenho do relógio na parede facilitou demais pra toda a família ajudar!”'
            }
          ]
        }
      ]
    },
    {
      id: 'H10',
      code: 'Casa 10',
      name: 'Dr. Cláudio (Engenheiro)',
      archetype: 'TEIMOSO',
      archetypeLabel: 'Morador Cético com o SUS',
      condition: 'Automedicação & Recusa de Cadastro',
      risk: 'Médio Risco',
      tx: 70, ty: 24,
      houseStyle: { wall: '#f0ece4', trim: '#545b66', roof: 'slateWarm', awning: '#4e5d6c', garden: false },
      appearance: { skin: '#e8c0a6', hair: '#9ca3af', hairStyle: 'short', shirt: '#475569', glasses: true, gender: 'm' },
      schedule: [[9, 13], [15, 17.5]],
      scheduleText: '09:00–13:00 e 15:00–17:30',
      neighborClue: 'Atende no portão entre 09h e 13h ou à tarde das 15h às 17h30.',
      knownSchedule: false,
      bond: 18,
      stubbornness: 90,
      dialogues: [
        {
          greeting: '“Olha, jovem, tenho plano de saúde privado, não preciso de cadastro no SUS. E quando tenho dor tomo meu anti-inflamatório por conta própria!”',
          note: 'Desafio Técnico: Explicar a universalidade do SUS, vigilância territorial e risco renal de AINEs.',
          choices: [
            {
              text: 'Explicar tecnicamente que o SUS faz vigilância ambiental/vacinas da rua dele e alertar sobre o risco renal dos anti-inflamatórios.',
              tag: '🎓 Técnica & Universalidade • Vínculo +25',
              type: 'EMPATHY',
              bondDelta: 25,
              stubbornDelta: -40,
              reply: '“Confesso que não sabia que a vigilância de zoonoses e vacinas do bairro dependiam desse mapeamento territorial. E você tem razão sobre o rim... Pode atualizar meu cadastro.”'
            },
            {
              text: 'Convidá-lo a conhecer a sala de vacinação da UBS para atualizar Influenza e Pneumocócica.',
              tag: '💉 Prevenção • Vínculo +16',
              type: 'EDUCATE',
              bondDelta: 16,
              stubbornDelta: -20,
              reply: '“No meu convênio essa vacina estava em falta. Vou passar na UBS conhecer o trabalho de vocês.”'
            },
            {
              text: 'Discutir rispidamente dizendo que plano privado não presta.',
              tag: '❌ Embate • Vínculo -15',
              type: 'AUTHORITARIAN',
              bondDelta: -15,
              reply: '“Passar bem! Não tenho tempo para discussões no portão.”'
            }
          ]
        }
      ]
    },
    {
      id: 'H11',
      code: 'Casa 11',
      name: 'Rodrigo ("Digão" - Motoboy)',
      archetype: 'TRABALHADOR',
      archetypeLabel: 'Trabalhador de Aplicativo',
      condition: 'Ferimento Leve & Antitetânica Atrasada',
      risk: 'Médio Risco',
      tx: 30, ty: 38,
      houseStyle: { wall: '#f2e0c9', trim: '#82522d', roof: 'clayDark', awning: '#c47b35', garden: false },
      appearance: { skin: '#b8825e', hair: '#1f1a17', hairStyle: 'short', shirt: '#d97706', hat: '#1f2937', gender: 'm' },
      schedule: [[11.25, 14.75], [17, 21]],
      scheduleText: '11:15–14:45 e 17:00–21:00 (Entre entregas)',
      neighborClue: 'A moto para na porta no almoço/tarde (11h15–14h45) e depois das 17h.',
      knownSchedule: false,
      bond: 48,
      stubbornness: 20,
      dialogues: [
        {
          greeting: '“Fala, chefia! Parei rapidinho entre o turno do almoço e o da noite. Escorreguei de moto na chuva, ralei o braço, passei só álcool e segui rodando!”',
          note: 'Atenção: Escoriação em asfalto + vacina Dupla Adulto (Tétano) vencida há 12 anos.',
          choices: [
            {
              text: 'Avaliar o braço, ensinar limpeza com água e sabão neutro e encaminhar para reforço da antitetânica.',
              tag: '🩹 Cuidado Técnico • Vínculo +20 • 🔍 2 Horários',
              type: 'EMPATHY',
              bondDelta: 20,
              revealNeighbors: ['H12', 'H13'],
              reply: '“Nem lembrava que tétano pegava em ralado de asfalto! Vou passar na UBS antes de ligar o app! Ó, Dona Lourdes da 12 está sempre lá, e o Lucas da 13 acorda depois das 10h!”'
            },
            {
              text: 'Orientar hidratação no trânsito, protetor solar nos braços e ajuste do capacete.',
              tag: '🛵 Saúde do Trabalhador • Vínculo +15',
              type: 'EDUCATE',
              bondDelta: 15,
              reply: '“Valeu mesmo! A gente que roda na rua esquece de cuidar da própria saúde.”'
            }
          ]
        }
      ]
    },
    {
      id: 'H12',
      code: 'Casa 12',
      name: 'Dona Lourdes (Aposentada)',
      archetype: 'AMIGO',
      archetypeLabel: 'Moradora Amiga do Sul',
      condition: 'Saúde em Dia & Apoio Comunitário',
      risk: 'Baixo Risco',
      tx: 40, ty: 38,
      houseStyle: { wall: '#f7efd6', trim: '#52734d', roof: 'terracotta', awning: '#4a8c5c', garden: true },
      appearance: { skin: '#8a583b', hair: '#e5e7eb', hairStyle: 'bun', shirt: '#d48b35', gender: 'f' },
      schedule: [[7, 21]],
      scheduleText: '07:00 às 21:00 (Sempre em casa)',
      neighborClue: 'A casa mais acolhedora da Rua dos Ipês (Sul).',
      knownSchedule: true,
      bond: 82,
      stubbornness: 0,
      dialogues: [
        {
          greeting: '“Entra, criatura de Deus! Você andou essa ladeira toda debaixo desse tempo! Tome um copo de suco de maracujá bem fresquinho que acabei de bater!”',
          note: 'Participa do grupo de Lian Gong e artesanato da UBS.',
          choices: [
            {
              text: 'Tomar o suco, revisar exames preventivos e perguntar os horários dos vizinhos da Rua dos Ipês.',
              tag: '🥤 💧 +35 • ⚡ +25 • 🔍 Revela 3 Horários',
              type: 'EMPATHY',
              bondDelta: 12,
              staminaDelta: 25,
              hydrationDelta: 35,
              revealNeighbors: ['H13', 'H14', 'H15'],
              reply: '“Meus exames estão um brinco! Anote aí: o Lucas da 13 fica das 10h às 18h; Seu Tonho da 14 só até 14h30; e a família do bebê na Casa 15 atende cedo (08h–10h) ou após 15h!”'
            },
            {
              text: 'Vistoriar o quintal juntos para garantir que não há garrafas acumulando água da chuva.',
              tag: '🦟 Vigilância • Vínculo +14 • 💧 +25',
              type: 'EDUCATE',
              bondDelta: 14,
              staminaDelta: 20,
              hydrationDelta: 25,
              revealNeighbors: ['H14', 'H15'],
              reply: '“Vamos olhar sim! Saúde começa no quintal da gente!”'
            }
          ]
        }
      ]
    },
    {
      id: 'H13',
      code: 'Casa 13',
      name: 'Lucas (22 anos - Saúde Mental)',
      archetype: 'PRIORITARIO',
      archetypeLabel: 'Saúde Mental & Juventude',
      condition: 'Ansiedade & Isolamento Social',
      risk: 'Médio Risco',
      tx: 50, ty: 38,
      houseStyle: { wall: '#e2e6f0', trim: '#596380', roof: 'slateWarm', awning: '#626f96', garden: false },
      appearance: { skin: '#e8be9e', hair: '#2b2420', hairStyle: 'messy', shirt: '#5b6ba3', gender: 'm' },
      schedule: [[10, 21.5]],
      scheduleText: '10:00 às 21:30 (Acorda após as 10h)',
      neighborClue: 'De manhã cedo nunca ouve a campainha; só atende a partir das 10h00.',
      knownSchedule: false,
      bond: 35,
      stubbornness: 45,
      dialogues: [
        {
          greeting: '“Ah... oi. Pensei que fosse cobrança. Não tenho saído muito do quarto ultimamente, o coração dispara do nada e parece que nada dá certo...”',
          note: 'Saúde Mental na APS: Escuta sem julgamento, fortalecimento de vínculo e articulação com a ESF.',
          choices: [
            {
              text: 'Praticar escuta empática, validar o sentimento e convidá-lo para um acolhimento tranquilo na UBS.',
              tag: '💛 Empatia • Vínculo +24',
              type: 'EMPATHY',
              bondDelta: 24,
              stubbornDelta: -25,
              reply: '“Sério que na UBS tem atendimento psicológico e roda de conversa sem precisar passar vergonha? Valeu por me ouvir sem dizer que é frescura...”'
            },
            {
              text: 'Ensinar técnica de respiração diafragmática (4-7-8) para momentos de crise de ansiedade.',
              tag: '🌬️ Técnica Manejo • Vínculo +16',
              type: 'EDUCATE',
              bondDelta: 16,
              reply: '“Puxa, respirei fundo junto com você e já diminuiu o aperto no peito. Vou lembrar disso.”'
            },
            {
              text: 'Dizer que ele é jovem e só precisa arrumar qualquer serviço para parar de pensar besteira.',
              tag: '❌ Invalidação • Vínculo -16',
              type: 'AUTHORITARIAN',
              bondDelta: -16,
              reply: '“É o que todo mundo fala... Preciso entrar agora, tchau.”'
            }
          ]
        }
      ]
    },
    {
      id: 'H14',
      code: 'Casa 14',
      name: 'Seu Antônio ("Tonho da Horta")',
      archetype: 'TEIMOSO',
      archetypeLabel: 'Resistente a Exames Preventivos',
      condition: 'Tabagismo & Recusa de Exames',
      risk: 'Alto Risco',
      tx: 60, ty: 38,
      houseStyle: { wall: '#efe2c6', trim: '#755330', roof: 'terracotta', awning: '#8c6b32', garden: true },
      appearance: { skin: '#b37a52', hair: '#b8b8b8', hairStyle: 'short', shirt: '#7d6c3b', hat: '#d4b26a', mustache: true, gender: 'm' },
      schedule: [[8, 14.5]],
      scheduleText: '08:00 às 14:30 (Sai vender verduras às 14h30)',
      neighborClue: 'Cuida da horta até 14h30; depois sai com o carrinho de verduras para a feira.',
      knownSchedule: false,
      bond: 25,
      stubbornness: 80,
      dialogues: [
        {
          greeting: '“Quem procura acha, meu filho! Faz 15 anos que não piso em médico e tô forte feito um touro! Se eu fizer exame lá na UBS vão inventar doença pra mim!”',
          note: 'Saúde do Homem: Barreira cultural masculina ao cuidado preventivo.',
          choices: [
            {
              text: 'Usar a metáfora da manutenção do carrinho de feira: revisar o eixo antes de quebrar mantém ele forte e independente.',
              tag: '🚜 Empatia Cultural • Vínculo +24',
              type: 'EMPATHY',
              bondDelta: 24,
              stubbornDelta: -35,
              reply: '“Haha! Aí você me pegou! Se não engraxar o eixo do carrinho, a roda trava na ladeira mesmo! Marca esse check-up do homem pra mim!”'
            },
            {
              text: 'Apresentar o Grupo de Tabagismo do SUS (com adesivo gratuito) sem pressionar.',
              tag: '🚭 Apoio Técnico • Vínculo +16',
              type: 'EDUCATE',
              bondDelta: 16,
              stubbornDelta: -20,
              reply: '“Não sabia que o SUS dava até o adesivo de graça pra ajudar a largar o fumo. Vou pensar com carinho!”'
            },
            {
              text: 'Dizer que ele é irresponsável por não fazer exames há 15 anos.',
              tag: '❌ Crítica Direta • Vínculo -12',
              type: 'AUTHORITARIAN',
              bondDelta: -12,
              reply: '“Cuido da minha vida há 65 anos, não preciso de bronca no meu portão!”'
            }
          ]
        }
      ]
    },
    {
      id: 'H15',
      code: 'Casa 15',
      name: 'Fernanda & Gabriel (Bebê Theo)',
      archetype: 'TRABALHADOR',
      archetypeLabel: 'Puerpério & Recém-Nascido',
      condition: '1ª Semana de Vida (Teste do Pezinho/BCG)',
      risk: 'Prioridade',
      tx: 70, ty: 38,
      houseStyle: { wall: '#f8ece4', trim: '#94614b', roof: 'terracotta', awning: '#d48c70', garden: true },
      appearance: { skin: '#d9a482', hair: '#3d281c', hairStyle: 'long', shirt: '#d98a7c', gender: 'f' },
      schedule: [[7.5, 10], [15, 21]],
      scheduleText: '07:30–10:00 e 15:00–21:00 (Rotina do bebê)',
      neighborClue: 'Melhores horários para visita ao recém-nascido: 08h–10h ou 15h–18h.',
      knownSchedule: true,
      bond: 62,
      stubbornness: 10,
      dialogues: [
        {
          greeting: '“Oi! Que bênção você vir! O Theo nasceu há 5 dias, estou com os pontos doloridos e tínhamos dúvida sobre o Teste do Pezinho e a BCG!”',
          note: 'Indicador Ouro APS: Visita domiciliar na 1ª semana de vida do recém-nascido.',
          choices: [
            {
              text: 'Avaliar a mamada, o coto umbilical (álcool 70%), a cicatriz e agendar Teste do Pezinho e BCG.',
              tag: '👶 Visita Puerperal Completa • Vínculo +22',
              type: 'EMPATHY',
              bondDelta: 22,
              reply: '“Você tirou todas as nossas dúvidas! Minha sogra queria pôr moeda no umbigo, ainda bem que você explicou! Vamos hoje fazer o Teste do Pezinho!”'
            },
            {
              text: 'Incentivar a paternidade ativa (banho, arrotar, fraldas) para a mãe descansar.',
              tag: '👨‍👩‍👦 Orientação Familiar • Vínculo +16',
              type: 'EDUCATE',
              bondDelta: 16,
              reply: '“Pode deixar, agente! Já sou o campeão oficial do arroto e do banho de balde aqui!”'
            }
          ]
        }
      ]
    }
  ],

  // Brazilian neighborhood trees (style: 'mango', 'ipe_gold', 'ipe_pink', 'olive')
  trees: [
    { x: 6 * 32, y: 12 * 32, style: 'ipe_gold', r: 58 },
    { x: 13 * 32, y: 15 * 32, style: 'mango', r: 62 },
    { x: 10 * 32, y: 31 * 32, style: 'ipe_pink', r: 58 },
    { x: 20 * 32, y: 14 * 32, style: 'olive', r: 54 },
    { x: 20 * 32, y: 38 * 32, style: 'ipe_gold', r: 56 },
    { x: 26 * 32, y: 8 * 32, style: 'mango', r: 64 },
    { x: 35 * 32, y: 7 * 32, style: 'ipe_gold', r: 56 },
    { x: 45 * 32, y: 7 * 32, style: 'olive', r: 54 },
    { x: 55 * 32, y: 7 * 32, style: 'ipe_pink', r: 58 },
    { x: 65 * 32, y: 7 * 32, style: 'mango', r: 60 },
    { x: 36 * 32, y: 22 * 32, style: 'mango', r: 66 }, // Seu Raimundo's famous Mangueira!
    { x: 45 * 32, y: 21 * 32, style: 'ipe_gold', r: 56 },
    { x: 55 * 32, y: 21 * 32, style: 'olive', r: 54 },
    { x: 65 * 32, y: 21 * 32, style: 'ipe_pink', r: 56 },
    { x: 35 * 32, y: 35 * 32, style: 'ipe_gold', r: 58 },
    { x: 45 * 32, y: 35 * 32, style: 'mango', r: 64 }, // Dona Lourdes's shaded yard!
    { x: 55 * 32, y: 35 * 32, style: 'ipe_pink', r: 58 },
    { x: 65 * 32, y: 35 * 32, style: 'olive', r: 56 },
    { x: 78 * 32, y: 20 * 32, style: 'ipe_gold', r: 60 },
    { x: 78 * 32, y: 33 * 32, style: 'mango', r: 60 },
    // Pracinha dos Ipês (4 ipês gerando sombra no polo comunitário sul)
    { x: 37 * 32, y: 45 * 32, style: 'ipe_gold', r: 56 },
    { x: 51 * 32, y: 45 * 32, style: 'ipe_pink', r: 56 },
    { x: 37 * 32, y: 50 * 32, style: 'ipe_pink', r: 56 },
    { x: 51 * 32, y: 50 * 32, style: 'ipe_gold', r: 56 },
    // Bairro Vizinho (Vila Aurora)
    { x: 88 * 32, y: 8 * 32, style: 'mango', r: 62 },
    { x: 96 * 32, y: 8 * 32, style: 'ipe_gold', r: 56 },
    { x: 102 * 32, y: 9 * 32, style: 'olive', r: 54 },
    { x: 111 * 32, y: 9 * 32, style: 'ipe_pink', r: 58 },
    { x: 92 * 32, y: 22 * 32, style: 'ipe_gold', r: 56 },
    { x: 104 * 32, y: 22 * 32, style: 'mango', r: 60 },
    { x: 88 * 32, y: 45 * 32, style: 'olive', r: 54 },
    { x: 102 * 32, y: 46 * 32, style: 'ipe_pink', r: 58 }
  ],

  // Decorative neighborhood props (benches, bushes, barrels, flower pots, rocks)
  props: [
    { type: 'signpost', x: 14 * 32 + 16, y: 21 * 32 + 8 },
    { type: 'bench', x: 12 * 32 + 16, y: 26 * 32 },
    { type: 'bench', x: 42 * 32 + 16, y: 25 * 32 },
    { type: 'bench', x: 32 * 32 + 16, y: 11 * 32 },
    { type: 'bench', x: 39 * 32, y: 46 * 32 },
    { type: 'bench', x: 49 * 32, y: 46 * 32 },
    { type: 'bench', x: 39 * 32, y: 50 * 32 },
    { type: 'bench', x: 49 * 32, y: 50 * 32 },
    { type: 'bench', x: 67 * 32, y: 46 * 32 },
    { type: 'bush', x: 8 * 32, y: 27 * 32 },
    { type: 'bush', x: 15 * 32, y: 26 * 32 },
    { type: 'bush', x: 25 * 32, y: 11 * 32 },
    { type: 'bush', x: 25 * 32, y: 25 * 32 },
    { type: 'bush', x: 25 * 32, y: 39 * 32 },
    { type: 'bush', x: 47 * 32, y: 11 * 32 },
    { type: 'bush', x: 57 * 32, y: 25 * 32 },
    { type: 'bush', x: 47 * 32, y: 39 * 32 },
    { type: 'crates', x: 5 * 32, y: 17 * 32 },
    { type: 'flowerpot', x: 32 * 32 + 16, y: 11 * 32 },
    { type: 'flowerpot', x: 42 * 32 + 16, y: 25 * 32 },
    { type: 'flowerpot', x: 42 * 32 + 16, y: 39 * 32 },
    { type: 'rock', x: 19 * 32, y: 15 * 32 },
    { type: 'rock', x: 19 * 32, y: 29 * 32 },
    { type: 'rock', x: 22 * 32, y: 35 * 32 },
    { type: 'rock', x: 78 * 32, y: 12 * 32 },
    // Bairro Vizinho: arquibancadas/bancos no Campinho e entorno
    { type: 'bench', x: 94 * 32, y: 28 * 32 + 12 },
    { type: 'bench', x: 104 * 32, y: 28 * 32 + 12 },
    { type: 'bush', x: 104 * 32, y: 10 * 32 + 12 },
    { type: 'bush', x: 108 * 32, y: 10 * 32 + 12 },
    { type: 'rock', x: 112 * 32, y: 34 * 32 }
  ]
};

// Precompute world pixel coordinates (x, y = front door / gate interaction point)
window.ACS_DATA.families.forEach(f => {
  f.x = f.tx * 32 + 16;
  f.y = f.ty * 32 + 24;
});

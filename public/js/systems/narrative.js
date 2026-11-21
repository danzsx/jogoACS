// ============================================================================
// TERRITÓRIO VIVO — LONGITUDINAL NARRATIVE SYSTEM (M2: Days 2–5)
// ============================================================================
// Provides day-specific epidemiological dialogues (Days 2–5) for all 15
// families, bond-reactive Day 5 payoffs, longitudinal visit history, and
// daily bonus goal evaluation.

(function (global) {
  'use strict';

  // Day-specific dialogues keyed by dayNumber (2..5) -> familyId ('H01'..'H15')
  // Day 1 continues using fam.dialogues[0] from data.js.
  const DAILY_DIALOGUES = {
    // ========================================================================
    // DIA 2 — SOL ESCALANTE & MUTIRÃO CONTRA A DENGUE
    // ========================================================================
    2: {
      H01: {
        greeting: '“Que calorão hoje, meu filho! Entre na sombra da varanda! Já enchi os pratinhos das plantas com areia grossa e deixei água gelada pra você.”',
        note: 'Mutirão Dengue (Dia 2): Dona Dulce é multiplicadora comunitária na Rua das Acácias.',
        choices: [
          {
            text: 'Conferir o quintal juntos, agradecer a água e pedir para ela alertar os vizinhos sobre pneus e calhas.',
            tag: '🦟 Mobilização • Vínculo +12 • 💧 +35',
            type: 'EMPATHY',
            bondDelta: 12,
            staminaDelta: 15,
            hydrationDelta: 35,
            reply: '“Pode deixar! Já avisei no grupo da igreja pra todo mundo virar as garrafas e tampar os baldes hoje!”'
          },
          {
            text: 'Explicar o ciclo de 7 dias do ovo do Aedes aegypti e a importância da escovação das bordas dos vasos.',
            tag: '🔬 Educação Vetorial • Vínculo +10 • 💧 +20',
            type: 'EDUCATE',
            bondDelta: 10,
            hydrationDelta: 20,
            reply: '“Ah, então não basta só jogar a água fora, tem que esfregar a borda por causa dos ovos! Vivendo e aprendendo!”'
          }
        ]
      },
      H02: {
        greeting: '“Acabei de acordar pro café antes de voltar pro plantão... Esse calor não deixa dormir direito. E vi umas larvas perto do ralo do quintal.”',
        note: 'Vigilância Ambiental: Ralos externos e bandejas de geladeira são criadouros comuns.',
        choices: [
          {
            text: 'Ajudar a colocar tela milimétrica no ralo externo e orientar hidratação leve no calor.',
            tag: '🛠️ Ação Prática • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            flag: 'dengue_screen_h02',
            reply: '“Valeu demais! Em 5 minutos resolvemos esse ralo. Vou levar duas garrafas d\'água pro plantão hoje.”'
          },
          {
            text: 'Orientar sinais de alarme da dengue (dor abdominal intensa, vômitos, tontura) para procurar a UBS.',
            tag: '🩺 Sinais de Alarme • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Bom saber a diferença entre dengue comum e os sinais de alarme. Obrigado!”'
          }
        ]
      },
      H03: {
        greeting: '“Oi, agente! O Pedrinho está suando bicas com esse sol de 37°C e encontrei um balde destampado atrás da lavanderia...”',
        note: 'Puericultura & Calor Extremo: Crianças desidratam rápido; evitar exposição entre 10h e 16h.',
        choices: [
          {
            text: 'Virar e lavar o balde com ela, e orientar soro caseiro/água fresca e roupas leves para o Pedrinho.',
            tag: '💧 Cuidado Infantil • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“Prontinho, balde seco e guardado de cabeça pra baixo! Vou dar bastante água e fruta pro Pedrinho!”'
          },
          {
            text: 'Fazer uma "caça ao mosquito" lúdica no quintal com o Pedrinho para ele aprender brincando.',
            tag: '🦸 Educação Lúdica • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Ele adorou ser o detetive da dengue! Agora vigia até o pote do passarinho!”'
          }
        ]
      },
      H04: {
        greeting: '“Tá quente que só o diabo! E já aviso que aquela caixa d\'água lá atrás sempre foi assim destampada e nunca deu nada!”',
        note: 'Resistência Ambiental: Caixa d\'água destampada é o principal macrocriadouro de Aedes.',
        choices: [
          {
            text: 'Explicar sem brigar que um único foco pode adoecer toda a rua — inclusive as crianças — e oferecer ajuda para vedar com tela/tampa.',
            tag: '🤝 Pactuação Comunitária • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            stubbornDelta: -25,
            flag: 'dengue_tank_h04',
            reply: '“Hmph... Se pode prejudicar a molecada da rua, aí é diferente. Me ajuda a amarrar essa lona bem esticada então.”'
          },
          {
            text: 'Dizer que se a vigilância sanitária passar ele vai levar uma multa pesada.',
            tag: '⚡ Ameaça • Vínculo -12',
            type: 'AUTHORITARIAN',
            bondDelta: -12,
            reply: '“Aqui dentro do meu quintal ninguém manda não! Pode ir andando!”'
          }
        ]
      },
      H05: {
        greeting: '“Esse mormaço na sala de costura dá até tontura... E comprei um spray inseticida caro pra afastar os pernilongos.”',
        note: 'Uso Racional: Inseticida mata apenas mosquito adulto e não elimina larvas na água parada.',
        choices: [
          {
            text: 'Avaliar se a tontura é do calor ou da glicemia, oferecer água e explicar que eliminar água parada é muito mais eficaz que veneno.',
            tag: '💛 Cuidado Integral • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            stubbornDelta: -20,
            reply: '“Nossa, economizo dinheiro com spray e ainda cuido melhor da minha diabetes bebendo mais água!”'
          },
          {
            text: 'Verificar as calhas e o reservatório atrás da geladeira dela juntos.',
            tag: '🔍 Vistoria Técnica • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Nem sabia que a bandeja da geladeira acumulava água! Já esvaziei!”'
          }
        ]
      },
      H06: {
        greeting: '“E aí, agente! Levei o pote do exame de escarro cedo na UBS. Hoje o calor na obra foi pesado, e vimos uns pneus na esquina.”',
        note: 'Acompanhamento TB + Vigilância: Valorizar a entrega do exame BAAR e mapear pontos de descarte.',
        choices: [
          {
            text: 'Parabenizar pela entrega do exame, checar sinais respiratórios e mapear os pontos de pneu na microárea.',
            tag: '🔬 Continuidade TB • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            flag: 'tb_sputum_collected',
            reply: '“Fico mais tranquilo sabendo que o resultado sai logo. E já recolhi dois pneus da calçada!”'
          },
          {
            text: 'Orientar pausas na sombra e hidratação com eletrólitos na obra durante a onda de calor.',
            tag: '☀️ Saúde do Trabalhador • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Boa! Vou combinar com o mestre de obras pra gente revezar na sombra às 13h.”'
          }
        ]
      },
      H07: {
        greeting: '“Ô meu amigo! Sente aqui debaixo da mangueira que o sol tá rachando mamona! Trouxe até uma garrafa de água fresca do filtro!”',
        note: 'Ponto de Apoio (Dia 2): Sombra e hidratação na Rua da Esperança.',
        choices: [
          {
            text: 'Descansar na sombra, beber água e trocar informações sobre quais quintais têm mais água parada na rua.',
            tag: '🌳 Sombra • 💧 +35 • ⚡ +20 • Vínculo +12',
            type: 'EMPATHY',
            bondDelta: 12,
            staminaDelta: 20,
            hydrationDelta: 35,
            reply: '“Vi uns pratinhos de planta ali na frente juntando água! Bom trabalho no mutirão, agente!”'
          },
          {
            text: 'Revisar os horários de caminhada dele para antes das 09h ou após as 17h nesta onda de calor.',
            tag: '🏃 Prevenção • Vínculo +12 • 💧 +20',
            type: 'EDUCATE',
            bondDelta: 12,
            hydrationDelta: 20,
            reply: '“Verdade, sair ao meio-dia com esse sol não dá! Vou caminhar bem cedinho.”'
          }
        ]
      },
      H08: {
        greeting: '“Oi! Com esse calor de 37°C minhas pernas incharam ainda mais, e tenho medo de pegar dengue grávida...”',
        note: 'Pré-Natal & Dengue: Gestantes têm maior risco de complicação; uso seguro de repelente liberado.',
        choices: [
          {
            text: 'Orientar repelente seguro na gestação (Icaridina/DEET), roupas claras e checar sua pressão arterial com calma.',
            tag: '🤰 Proteção Gestante • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Que alívio saber qual repelente posso usar sem fazer mal pra Sofia! Muito obrigada!”'
          },
          {
            text: 'Reforçar hidratação fracionada ao longo do dia e elevar os pés em repouso.',
            tag: '💧 Cuidado Perinatal • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Vou deixar uma garrafinha aqui na mesa pra não esquecer de beber água.”'
          }
        ]
      },
      H09: {
        greeting: '“Hoje o quarto do meu pai está um forno... Tenho dado banho morno nele e tentando refrescar, mas fico exausta.”',
        note: 'Cuidado Domiciliar no Calor: Idosos acamados não sentem sede com facilidade e correm risco de hipertermia.',
        choices: [
          {
            text: 'Oferecer apoio emocional, ensinar a oferecer água em pequenas colheres de hora em hora e ventilar o quarto com pano úmido.',
            tag: '💜 Cuidado Domiciliar • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Essa ideia da toalha úmida na janela já refrescou o quarto! Obrigada por lembrar de mim também.”'
          },
          {
            text: 'Conferir a pele do Seu Joaquim para evitar brotoejas e lesões por umidade no calor.',
            tag: '🩺 Prevenção Pele • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“Vou manter os lençóis sempre sequinhos e trocar com mais frequência hoje.”'
          }
        ]
      },
      H10: {
        greeting: '“Olha, eu até concordo que dengue é problema sério, mas no meu quintal eu pago jardineiro, não precisa vistoriar.”',
        note: 'Vigilância Universal: O mosquito não respeita muros; bromélias e calhas acumuladas passam despercebidas.',
        choices: [
          {
            text: 'Propor uma vistoria técnica rápida de 2 minutos apenas nas calhas e ralos, mostrando como a vigilância protege toda a quadra.',
            tag: '🎓 Parceria Técnica • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            stubbornDelta: -25,
            reply: '“Olha só, tinha mesmo água parada no ralo da churrasqueira que o jardineiro não viu... Boa observação.”'
          },
          {
            text: 'Exigir entrada imediata dizendo que a lei obriga.',
            tag: '❌ Imposição • Vínculo -12',
            type: 'AUTHORITARIAN',
            bondDelta: -12,
            reply: '“Com essa postura não vai entrar mesmo. Passar bem.”'
          }
        ]
      },
      H11: {
        greeting: '“Pô, chefia, rodar de moto nesse asfalto fervendo hoje tá osso! Quase desmaiei no semáforo sem beber água!”',
        note: 'Saúde do Trabalhador: Desidratação aguda e insolação no trânsito.',
        choices: [
          {
            text: 'Reforçar uso de manguito UV, protetor solar e garrafinha presa na mochila de entregas, além de checar o curativo do braço.',
            tag: '🛵 Proteção Solar • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“Firmeza! Já passei na UBS pra vacina do tétano e agora vou andar com garrafa d\'água no baú!”'
          },
          {
            text: 'Alertar para nunca tomar anti-inflamatório sem prescrição quando estiver desidratado.',
            tag: '💊 Orientação Clínica • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Putz, eu vivia tomando remédio pra dor de cabeça sem beber água. Vou parar com isso!”'
          }
        ]
      },
      H12: {
        greeting: '“Oi, meu bem! Nesse calorão fiz suco de caju bem geladinho! E olha que já varri a calçada toda pra não juntar lixo!”',
        note: 'Ponto de Apoio (Sul): Dona Lourdes ajuda a mobilizar a Rua dos Ipês contra a dengue.',
        choices: [
          {
            text: 'Aceitar o suco na sombra, agradecer o cuidado e revisar possíveis criadouros atrás do muro.',
            tag: '🥤 💧 +35 • ⚡ +20 • Vínculo +12',
            type: 'EMPATHY',
            bondDelta: 12,
            staminaDelta: 20,
            hydrationDelta: 35,
            reply: '“Você merece, anda o bairro todo debaixo desse sol! Vou ficar de olho nos vizinhos aqui!”'
          },
          {
            text: 'Ensinar a receita de armadilha educativa (mosquitérica) para o grupo de artesanato da UBS.',
            tag: '🎨 Educação Criativa • Vínculo +15 • 💧 +20',
            type: 'EDUCATE',
            bondDelta: 15,
            hydrationDelta: 20,
            reply: '“Que ideia ótima! Vamos conversar sobre dengue na oficina de sexta!”'
          }
        ]
      },
      H13: {
        greeting: '“Com esse calor eu fiquei ainda mais trancado no quarto escuro... Só abri a janela agora porque você bateu.”',
        note: 'Saúde Mental & Ambiente: Pequenos passos de ativação comportamental e ventilação do espaço.',
        choices: [
          {
            text: 'Convidá-lo para tomar um ar na varanda por 5 minutos e falar sobre como o calor também afeta o sono e a ansiedade.',
            tag: '💛 Escuta Acolhedora • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Só de sair do quarto abafado e conversar um pouco já deu uma aliviada na cabeça...”'
          },
          {
            text: 'Sugerir caminhadas curtas às 17h30 quando o sol baixar, junto com o grupo da UBS.',
            tag: '🚶 Ativação Leve • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“No fim da tarde, sem sol forte, acho que consigo tentar ir sim.”'
          }
        ]
      },
      H14: {
        greeting: '“Hoje reguei a horta cedo, mas deixei aquelas garrafas destampadas ali atrás do muro... Não dá nada não, né?”',
        note: 'Vigilância em Hortas: Garrafas e regadores abertos acumulam larvas rapidamente.',
        choices: [
          {
            text: 'Explicar com humor que o mesmo sol que faz a couve crescer choca o ovo do mosquito em dias, e guardar as garrafas de boca pra baixo.',
            tag: '🥬 Empatia Rural • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            stubbornDelta: -20,
            reply: '“Haha, essa foi boa! Garrafa de boca pra baixo não pega nem mosquito nem poeira!”'
          },
          {
            text: 'Sugerir cobrir o tonel de rega da horta com tela fina.',
            tag: '🛡️ Técnica Simples • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“Tenho um pedaço de sombrite aqui que resolve na hora!”'
          }
        ]
      },
      H15: {
        greeting: '“Oi! O Theo acordou agitado com o calor. Podemos dar água pro bebê de 6 dias ou só leite materno?”',
        note: 'Aleitamento Exclusivo: Até os 6 meses, o leite materno já hidrata totalmente, mesmo no calor extremo.',
        choices: [
          {
            text: 'Tranquilizar que o leite materno em livre demanda tem toda a água que o bebê precisa, sem dar chás ou água!',
            tag: '🤱 Aleitamento Ouro • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Ufa! Ainda bem que perguntei antes de dar chá de erva-doce! Vou mamar mais vezes e eu mesma beber muita água!”'
          },
          {
            text: 'Orientar instalar mosquiteiro de tule no berço para proteger o Theo da dengue sem usar repelente químico.',
            tag: '🦟 Proteção Neonatal • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“Verdade, bebê novinho não pode usar repelente! Já vou pôr o mosquiteiro hoje!”'
          }
        ]
      }
    },

    // ========================================================================
    // DIA 3 — TEMPORAL DE VERÃO & COMBATE ÀS FAKE NEWS DE VACINA
    // ========================================================================
    3: {
      H01: {
        greeting: '“Nossa, que chuvarada! Entre pra se enxugar um pouquinho! Recebi um vídeo no celular dizendo que a vacina da gripe causa paralisia... É mentira, né?”',
        note: 'Dia 3 — Fake News: Idosos são alvo frequente de desinformação vacinal em grupos de mensagens.',
        choices: [
          {
            text: 'Mostrar fontes seguras, explicar como as vacinas do SUS passam por controle rigoroso e tomar um chá quente.',
            tag: '💉 Ciência & Acolhimento • Vínculo +14 • 💧 +25',
            type: 'EMPATHY',
            bondDelta: 14,
            staminaDelta: 20,
            hydrationDelta: 25,
            flag: 'vaccine_myth_busted',
            reply: '“Vou desmentir esse vídeo lá no grupo da família agora mesmo! Obrigada pela paciência!”'
          },
          {
            text: 'Orientar cuidados para não escorregar no quintal molhado e prevenir quedas em idosos na chuva.',
            tag: '🩺 Prevenção Quedas • Vínculo +12 • ⚡ +15',
            type: 'EDUCATE',
            bondDelta: 12,
            staminaDelta: 15,
            reply: '“Bem lembrado! Já coloquei o tapete antiderrapante na porta da cozinha.”'
          }
        ]
      },
      H02: {
        greeting: '“Cheguei encharcado do ponto de ônibus... E um colega do serviço disse que quem toma vacina fica com chip ou adoece mais.”',
        note: 'Desmistificação: Reações leves (dor no braço, febrícula) mostram o sistema imune aprendendo a se defender.',
        choices: [
          {
            text: 'Explicar de forma direta a diferença entre reação imune leve e doença, e checar o cartão de vacina dele.',
            tag: '🛡️ Educação em Saúde • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            flag: 'vaccine_myth_busted',
            reply: '“Faz todo sentido! Segunda-feira de folga eu passo na sala de vacina atualizar a minha!”'
          },
          {
            text: 'Orientar trocar roupa e meias molhadas rápido para evitar friagem e piora das dores lombares.',
            tag: '🌧️ Cuidado na Chuva • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Vou tomar um banho morno já! Obrigado por se preocupar.”'
          }
        ]
      },
      H03: {
        greeting: '“Ainda bem que você veio de guarda-chuva! As mães da creche estão assustadas com um boato sobre a vacina tríplice viral...”',
        note: 'Puericultura & Imunização: Sarampo e caxumba podem voltar se a cobertura vacinal cair.',
        choices: [
          {
            text: 'Confirmar que o Pedrinho está protegido, explicar como a vacina salva vidas e convidar as mães para tirar dúvidas na UBS.',
            tag: '💉 Proteção Coletiva • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            flag: 'vaccine_myth_busted',
            reply: '“Vou contar pra todas as mães que você explicou tudo direitinho! Obrigada!”'
          },
          {
            text: 'Orientar cuidados com água de enchente/poças na rua para evitar leptospirose nas crianças.',
            tag: '🌧️ Vigilância Chuva • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Pode deixar, hoje o Pedrinho só anda de galochinha e longe de poça!”'
          }
        ]
      },
      H04: {
        greeting: '“Na minha época ninguém tomava esse monte de vacina e todo mundo vivia bem! Pra que eu vou tomar vacina de pneumonia agora?”',
        note: 'Imunização do Idoso: Pneumocócica e Influenza reduzem internações graves em idosos e hipertensos.',
        choices: [
          {
            text: 'Lembrar que antigamente muitas crianças e idosos morriam de doenças que hoje a vacina evita, e que ele merece viver forte.',
            tag: '❤️ Empatia & Memória • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            stubbornDelta: -25,
            flag: 'vaccine_myth_busted',
            reply: '“É... pensando bem meu tio sofreu muito de pneumonia... Se tem de graça na UBS, amanhã eu tomo!”'
          },
          {
            text: 'Dizer que se ele não tomar vacina depois não pode reclamar se ficar internado.',
            tag: '❌ Culpa • Vínculo -12',
            type: 'AUTHORITARIAN',
            bondDelta: -12,
            reply: '“Não preciso de sermão na chuva não! Até logo!”'
          }
        ]
      },
      H05: {
        greeting: '“Essa umidade toda deixa minhas juntas doendo... E li na internet que diabético não pode tomar vacina!”',
        note: 'Grupo Prioritário: Pessoas com diabetes têm indicação PRIORITÁRIA para vacinação anual.',
        choices: [
          {
            text: 'Esclarecer que justamente quem tem diabetes ganha prioridade na vacina porque a imunidade precisa de reforço extra.',
            tag: '💉 Informação Segura • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            stubbornDelta: -20,
            flag: 'vaccine_myth_busted',
            reply: '“Que bom saber! A internet confunde demais a cabeça da gente. Vou atualizar minha caderneta!”'
          },
          {
            text: 'Orientar manter os pés bem secos e enxutos entre os dedos nesta semana chuvosa.',
            tag: '🦶 Pé Diabético • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“Já separei uma toalha só pros pés! Obrigada!”'
          }
        ]
      },
      H06: {
        greeting: '“Com essa chuva a obra parou mais cedo. A propósito, a enfermeira ligou avisando do resultado do meu exame de escarro!”',
        note: 'Continuidade TB: Busca ativa concluída com acolhimento e sem estigma.',
        choices: [
          {
            text: 'Acolher com tranquilidade, reforçar adesão ao acompanhamento na UBS e lembrar da vacina BCG/calendário da família.',
            tag: '🤝 Acolhimento ESF • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Vocês da UBS cuidam da gente de verdade. Nunca fui tão bem atendido!”'
          },
          {
            text: 'Orientar evitar mofo nas paredes com a chuva e ventilar o quarto sempre que abrir um sol.',
            tag: '🌬️ Saúde Respiratória • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Boa! Vamos passar pano com água sanitária diluída onde deu umidade.”'
          }
        ]
      },
      H07: {
        greeting: '“Eita temporal bom pra molhar a horta! Entra aqui na varanda coberta, agente, senão você gripa! Toma um café passado na hora.”',
        note: 'Ponto de Apoio (Dia 3): Abrigo da chuva na varanda do Seu Raimundo.',
        choices: [
          {
            text: 'Secar o guarda-chuva, recuperar energia na varanda e combinar apoio dele para combater boatos de vacina no bairro.',
            tag: '☕ Abrigo • ⚡ +25 • 💧 +20 • Vínculo +14',
            type: 'EMPATHY',
            bondDelta: 14,
            staminaDelta: 25,
            hydrationDelta: 20,
            flag: 'vaccine_myth_busted',
            reply: '“Tomei todas as doses e nunca tive nada! Pode deixar que eu falo pro pessoal na fila do pão!”'
          },
          {
            text: 'Alertar sobre cuidados com poças e barro na Estrada do Sol após a chuva.',
            tag: '🌧️ Vigilância • Vínculo +12 • ⚡ +15',
            type: 'EDUCATE',
            bondDelta: 12,
            staminaDelta: 15,
            reply: '“Verdade, quando a água baixar precisamos checar se não acumulou lixo nos bueiros!”'
          }
        ]
      },
      H08: {
        greeting: '“Oi! A enfermeira pediu pra eu tomar a vacina dTpa da gestante, mas fiquei com receio de fazer mal pra Sofia...”',
        note: 'Pré-Natal Seguro: A vacina dTpa na gestação passa anticorpos pela placenta e protege o recém-nascido contra coqueluche.',
        choices: [
          {
            text: 'Explicar com carinho que a dTpa protege a bebê nos primeiros meses antes mesmo dela poder tomar as próprias vacinas.',
            tag: '🤱 Ciência & Amor • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            flag: 'vaccine_myth_busted',
            reply: '“Nossa, então é um presente de proteção que eu já passo pra ela na barriga! Vou tomar hoje mesmo!”'
          },
          {
            text: 'Orientar usar sapatos antiderrapantes ao caminhar na calçada molhada no 3º trimestre.',
            tag: '👟 Segurança Gestante • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Com esse barrigão o equilíbrio muda mesmo! Obrigada pelo cuidado!”'
          }
        ]
      },
      H09: {
        greeting: '“Na chuva a casa fica fechada e o peito do meu pai chia um pouco... E a equipe comentou de vacinação domiciliar.”',
        note: 'Vacinação Domiciliar: Pacientes acamados têm direito à visita da equipe para vacinação em casa.',
        choices: [
          {
            text: 'Agendar a visita da técnica de enfermagem para vacinar o Seu Joaquim em casa e checar sinais respiratórios.',
            tag: '🏠 Acesso Universal • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            flag: 'vaccine_myth_busted',
            reply: '“Não sabia que a UBS vinha vacinar acamado em casa! Isso tira um peso enorme das minhas costas!”'
          },
          {
            text: 'Orientar manter uma fresta de janela aberta para renovar o ar sem pegar chuva direta.',
            tag: '🌬️ Ventilação • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Boa ideia! Vou abrir a basculante da sala.”'
          }
        ]
      },
      H10: {
        greeting: '“Confesso que fiquei pensando no que você disse ontem... Mas sobre vacina nova, prefiro esperar pra ver nos outros primeiro.”',
        note: 'Hesitação Vacinal: Explicar farmacovigilância e ensaios clínicos sem hostilidade.',
        choices: [
          {
            text: 'Apresentar os dados de segurança, farmacovigilância do SUS e como a imunidade coletiva protege inclusive o bairro dele.',
            tag: '📊 Evidência Clara • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            stubbornDelta: -25,
            flag: 'vaccine_myth_busted',
            reply: '“Como engenheiro, respeito dados e controle de qualidade. Vou levar minha carteira na UBS.”'
          },
          {
            text: 'Dizer que quem não se vacina é egoísta e atrasado.',
            tag: '❌ Julgamento • Vínculo -14',
            type: 'AUTHORITARIAN',
            bondDelta: -14,
            reply: '“Não aceito rótulos no meu portão. Bom dia!”'
          }
        ]
      },
      H11: {
        greeting: '“Pista escorregadia hoje, chefia! Mas já tomei minha antitetânica ontem na UBS, olha o comprovante aqui no celular!”',
        note: 'Adesão Positiva: Motoboy atualizou a Dupla Adulto e agora usa o Meu SUS Digital.',
        choices: [
          {
            text: 'Comemorar a conquista, elogiar o cuidado dele e pedir que indique a sala de vacina pros colegas de entrega.',
            tag: '🎉 Vínculo Forte • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            flag: 'vaccine_myth_busted',
            reply: '“Tamo junto! Já mandei no grupo dos motoboys que na UBS é rápido e sem burocracia!”'
          },
          {
            text: 'Lembrar de lavar bem as botas e pés se pisar em enxurrada para evitar leptospirose.',
            tag: '🌧️ Prevenção • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Valeu! Hoje tô de bota impermeável!”'
          }
        ]
      },
      H12: {
        greeting: '“Entra, meu anjo, foge desse pé d\'água! Fiz um bolo de fubá e um chazinho de gengibre! E olha meu cartão de vacina em dia!”',
        note: 'Ponto de Apoio (Dia 3): Dona Lourdes é exemplo de adesão vacinal na Rua dos Ipês.',
        choices: [
          {
            text: 'Recuperar as forças na varanda, elogiar a caderneta completa e conversar sobre como combater boatos na vizinhança.',
            tag: '☕ Abrigo • ⚡ +25 • 💧 +25 • Vínculo +14',
            type: 'EMPATHY',
            bondDelta: 14,
            staminaDelta: 25,
            hydrationDelta: 25,
            reply: '“Aqui em casa fake news não se cria! Quando alguém vem com história torta eu já mando perguntar pro ACS!”'
          },
          {
            text: 'Revisar se a calha do quintal escoou bem toda a chuva sem entupir.',
            tag: '🦟 Prevenção Pós-Chuva • Vínculo +12 • ⚡ +15',
            type: 'EDUCATE',
            bondDelta: 12,
            staminaDelta: 15,
            reply: '“Limpei ontem mesmo! A água correu limpinha!”'
          }
        ]
      },
      H13: {
        greeting: '“Dia chuvoso me deixa mais pra baixo... Mas lembrei daquela respiração que você ensinou e consegui dormir melhor.”',
        note: 'Saúde Mental: Reconhecer pequenas vitórias fortalece a autoeficácia do paciente.',
        choices: [
          {
            text: 'Valorizar o avanço dele, acolher o peso dos dias cinzentos e confirmar o horário da roda de conversa na UBS.',
            tag: '💛 Vínculo Terapêutico • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            reply: '“Obrigado por não desistir de vir aqui mesmo debaixo de chuva... Sexta eu vou lá na UBS!”'
          },
          {
            text: 'Sugerir abrir as cortinas e ouvir uma música leve para quebrar o isolamento do quarto.',
            tag: '🎵 Manejo Diário • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Boa! Vou colocar um som enquanto tomo café.”'
          }
        ]
      },
      H14: {
        greeting: '“Com essa chuva não deu pra ir pra feira... E um compadre falou que vacina dá gripe forte. Acho que não vou tomar não!”',
        note: 'Mito Comum: A vacina da gripe é feita com vírus inativado (morto) e NÃO causa gripe.',
        choices: [
          {
            text: 'Explicar com clareza que a vacina usa vírus morto — igual semente cozida que não brota — e só treina a defesa do corpo.',
            tag: '🌱 Analogia da Semente • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            stubbornDelta: -25,
            flag: 'vaccine_myth_busted',
            reply: '“Semente cozida não brota mesmo! Haha, você sempre tem uma explicação que a gente entende!”'
          },
          {
            text: 'Dizer que ele acredita em qualquer bobagem de compadre.',
            tag: '❌ Desdém • Vínculo -12',
            type: 'AUTHORITARIAN',
            bondDelta: -12,
            reply: '“Cada um cuida da sua crença! Tchau!”'
          }
        ]
      },
      H15: {
        greeting: '“Oi! Mesmo com a chuva fomos ontem na UBS! O Theo fez o Teste do Pezinho e tomou a BCG sem chorar quase nada!”',
        note: 'Indicador Ouro Concluído: Vacina BCG e Triagem Neonatal realizadas na 1ª semana!',
        choices: [
          {
            text: 'Celebrar com a família, orientar não passar pomadas na marquinha da BCG e registrar no e-SUS.',
            tag: '👶 Puerpério Ouro • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            flag: 'baby_bcg_done',
            reply: '“Que bom saber que a feridinha da BCG é normal e não precisa passar nada! Obrigada por acompanhar tudo!”'
          },
          {
            text: 'Conferir a cicatrização dos pontos da Fernanda e perguntar como está o descanso dela.',
            tag: '💜 Saúde da Mulher • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“O Gabriel tem dividido tudo comigo, estou me sentindo muito apoiada!”'
          }
        ]
      }
    },

    // ========================================================================
    // DIA 4 — PRÉ-NATAL, SAÚDE MENTAL & CUIDADO CONTINUADO
    // ========================================================================
    4: {
      H01: {
        greeting: '“Bom dia, meu bem! Hoje o tempo tá virando de novo... Fiz uma lista dos vizinhos idosos que estão mais quietinhos em casa.”',
        note: 'Dia 4 — Cuidado Continuado: Vigilância solidária entre vizinhos fortalece a rede de apoio.',
        choices: [
          {
            text: 'Agradecer o olhar atento, checar a medicação do casal e convidar os dois para o mutirão comunitário de sexta.',
            tag: '🤝 Rede Comunitária • Vínculo +14 • 💧 +30',
            type: 'EMPATHY',
            bondDelta: 14,
            staminaDelta: 20,
            hydrationDelta: 30,
            reply: '“Sexta-feira estaremos lá na praça da UBS cedinho! Levo até bolo de milho!”'
          },
          {
            text: 'Revisar a validade dos remédios de uso contínuo na caixinha deles.',
            tag: '💊 Uso Seguro • Vínculo +12 • 💧 +20',
            type: 'EDUCATE',
            bondDelta: 12,
            hydrationDelta: 20,
            reply: '“Tudo certinho e dentro da validade! Obrigada pelo zelo!”'
          }
        ]
      },
      H02: {
        greeting: '“Olha, cortei o energético da madrugada e já dormi 2 horas a mais! Mas às vezes dá uma ansiedade antes do turno...”',
        note: 'Saúde Mental do Trabalhador: Reconhecer progressos e oferecer apoio psicossocial.',
        choices: [
          {
            text: 'Elogiar a redução do energético, ensinar pausa de descompressão antes de dormir e marcar retorno na UBS.',
            tag: '💚 Cuidado Continuado • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“Minha esposa até notou que tô menos irritado em casa. Valeu por acompanhar de perto!”'
          },
          {
            text: 'Revisar a pressão arterial hoje para celebrar a melhora.',
            tag: '🩺 Monitoramento PA • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“126x80! Baixou mesmo só mudando o hábito do sono!”'
          }
        ]
      },
      H03: {
        greeting: '“Oi! Consegui levar o Pedrinho pra vacinar ontem! Mas tenho me sentido tão sobrecarregada trabalhando fora e cuidando dele sozinha...”',
        note: 'Saúde Mental Materna: Sobrecarga de mães trabalhadoras precisa de escuta sem culpa.',
        choices: [
          {
            text: 'Validar o esforço dela sem julgamentos e apresentar os grupos de apoio e atendimento da eMulti na UBS.',
            tag: '💜 Escuta Empática • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Só de poder desabafar sem ser julgada já alivia tanto... Vou conhecer esse grupo na UBS!”'
          },
          {
            text: 'Orientar sinais de cansaço extremo e lembrar de reservar 15 minutos diários para si.',
            tag: '🌿 Autocuidado • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Vou tentar pedir pra minha irmã ficar com ele uma horinha no sábado.”'
          }
        ]
      },
      H04: {
        greeting: '“Olha aqui meu braço... Fui lá na UBS ontem, medi a pressão e até tomei a vacina! Mas não gosto de falar de tristeza não.”',
        note: 'Saúde Mental do Homem: Homens idosos frequentemente mascaram solidão e tristeza em irritabilidade.',
        choices: [
          {
            text: 'Celebrar o passo gigante dele na UBS e convidá-lo pro grupo de dominó e caminhada da UBS para fazer amizades.',
            tag: '♟️ Vínculo Social • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            stubbornDelta: -20,
            reply: '“Tem torneio de dominó dos aposentados na UBS? Aí você me convenceu, rapaz!”'
          },
          {
            text: 'Conferir a receita da medicação anti-hipertensiva e elogiar a adesão.',
            tag: '💊 Seguimento HAS • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“Tô tomando direitinho todo dia depois do café!”'
          }
        ]
      },
      H05: {
        greeting: '“Voltei a tomar a Metformina todo dia! Mas fico preocupada se o estresse das entregas atrasadas sobe o açúcar no sangue...”',
        note: 'Psiconeuroendocrinologia na APS: Estresse crônico libera cortisol e eleva a glicemia.',
        choices: [
          {
            text: 'Confirmar que estresse altera mesmo a glicemia, acolher a rotina puxada dela e convidar pra oficina de artesanato/Lian Gong.',
            tag: '💚 Cuidado Integral • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Ah, então não era impressão minha! Vou tentar ir no Lian Gong pra soltar os ombros!”'
          },
          {
            text: 'Checar a glicemia capilar e elogiar a caixinha organizadora ao lado da máquina.',
            tag: '📊 Controle Glicêmico • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“Baixou pra 135! Tô muito feliz com o resultado!”'
          }
        ]
      },
      H06: {
        greeting: '“Boas notícias, agente! O exame deu negativo pra tuberculose, era só uma bronquite alérgica do cimento mesmo! Tô aliviado demais!”',
        note: 'Desfecho Clínico: Exame descartou TB e encaminhou tratamento adequado da bronquite.',
        choices: [
          {
            text: 'Celebrar o resultado negativo e orientar uso de máscara PFF2 na obra ao lidar com cimento e poeira.',
            tag: '😷 Saúde Ocupacional • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Já comprei máscara boa pro serviço! Se você não tivesse insistido no exame eu ia continuar sofrendo!”'
          },
          {
            text: 'Reforçar a consulta de retorno com a médica da UBS para ajustar o inalador.',
            tag: '🩺 Seguimento ESF • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Consulta confirmada pra segunda-feira às 08h!”'
          }
        ]
      },
      H07: {
        greeting: '“Ô meu agente! Hoje o tempo tá doido — sol de manhã e chuva de tarde! Sente aqui pra tomar uma água e bater um papo.”',
        note: 'Ponto de Apoio (Dia 4): Rede de cuidado comunitário na Rua da Esperança.',
        choices: [
          {
            text: 'Descansar na sombra, conversar sobre os preparativos do evento de sexta e beber água.',
            tag: '🌳 Sombra • 💧 +35 • ⚡ +25 • Vínculo +14',
            type: 'EMPATHY',
            bondDelta: 14,
            staminaDelta: 25,
            hydrationDelta: 35,
            reply: '“A microárea inteira tá comentando do seu trabalho! Amanhã vai ser festa!”'
          },
          {
            text: 'Combinar com ele de convidar o Seu Tião e o Lucas para a caminhada comunitária.',
            tag: '🤝 Articulação • Vínculo +15 • 💧 +20',
            type: 'EDUCATE',
            bondDelta: 15,
            hydrationDelta: 20,
            reply: '“Pode deixar! Chamo os dois na maior simpatia!”'
          }
        ]
      },
      H08: {
        greeting: '“Oi! Fiz a consulta de pré-natal ontem, tomei a dTpa e meus exames estão ótimos! Agora falta pouco pra Sofia nascer!”',
        note: 'Pré-Natal 3º Trimestre: Revisão do plano de parto, acompanhante garantido por lei e vinculação à maternidade.',
        choices: [
          {
            text: 'Revisar o plano de parto, lembrar do direito ao acompanhante na maternidade e acolher as expectativas dela.',
            tag: '🤰 Protagonismo Gestante • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            reply: '“Meu marido vai poder ficar comigo o tempo todo! Você nos deu muita segurança nesse pré-natal!”'
          },
          {
            text: 'Conferir se a mala da maternidade e o Cartão da Gestante já estão separados.',
            tag: '📋 Checklist Parto • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“Tudo pronto na bolsa ao lado da porta!”'
          }
        ]
      },
      H09: {
        greeting: '“A técnica veio vacinar meu pai aqui em casa ontem! Hoje eu até consegui dormir sem aquela angústia toda...”',
        note: 'Cuidando do Cuidador: Alívio da sobrecarga melhora diretamente a saúde física e mental da cuidadora.',
        choices: [
          {
            text: 'Acolher a emoção dela e agendar uma consulta de check-up só para ELA na próxima semana.',
            tag: '💜 Cuidado Integral • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            reply: '“Faz dois anos que não faço um exame pra mim... Vou cuidar de mim também pra continuar cuidando dele!”'
          },
          {
            text: 'Orientar exercícios simples de alongamento para coluna durante as transferências do leito.',
            tag: '🦴 Ergonomia • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“Dobrar os joelhos em vez da coluna já evitou dor nas costas hoje!”'
          }
        ]
      },
      H10: {
        greeting: '“Passei na UBS ontem e me surpreendi com a organização da sala de vacina! Só fico preocupado com esse estresse do meu trabalho...”',
        note: 'Quebra de Barreiras: Até moradores céticos se vinculam quando experimentam um SUS resolutivo.',
        choices: [
          {
            text: 'Ouvir sobre a pressão no trabalho, validar sem pressa e mostrar que a UBS também acolhe saúde mental e prevenção.',
            tag: '🎓 Vínculo Consolidado • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            stubbornDelta: -25,
            reply: '“Confesso que mudei minha visão sobre a saúde pública. Parabéns pelo trabalho de vocês!”'
          },
          {
            text: 'Alertar sobre riscos cardiovasculares do estresse crônico e automedicação.',
            tag: '❤️ Prevenção Clínica • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“Parei de tomar anti-inflamatório por conta própria. Obrigado pelo alerta!”'
          }
        ]
      },
      H11: {
        greeting: '“Fala, chefia! O braço já cicatrizou 100%! Mas ontem quase perdi a cabeça no trânsito, muita pressão pra entregar rápido...”',
        note: 'Saúde Mental no Trabalho Informal: Pressão algorítmica e esgotamento.',
        choices: [
          {
            text: 'Escutar o desabafo sobre a correria dos aplicativos e lembrar que pausas curtas e respiração protegem a mente e evitam acidentes.',
            tag: '🛵 Escuta & Segurança • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“É isso, melhor perder 5 minutos respirando do que sofrer um acidente. Valeu mesmo!”'
          },
          {
            text: 'Informar os horários estendidos da UBS para trabalhadores que não conseguem ir em horário comercial.',
            tag: '⏰ Acesso Trabalhador • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Show! Saber que tem horário depois das 17h facilita demais!”'
          }
        ]
      },
      H12: {
        greeting: '“Entre, meu anjo! Amanhã é o grande dia da mobilização na comunidade! Já separei umas mudas de ervas pra distribuir!”',
        note: 'Ponto de Apoio (Dia 4): Preparação da grande mobilização comunitária da Sexta-feira.',
        choices: [
          {
            text: 'Agradecer o carinho, tomar uma água fresca e combinar a participação do grupo de Lian Gong na sexta.',
            tag: '🌿 Mobilização • 💧 +35 • ⚡ +25 • Vínculo +14',
            type: 'EMPATHY',
            bondDelta: 14,
            staminaDelta: 25,
            hydrationDelta: 35,
            reply: '“Amanhã a Vila Esperança inteira vai mostrar a força da comunidade!”'
          },
          {
            text: 'Elogiar a horta e revisar os cuidados com água limpa nos vasinhos das mudas.',
            tag: '🦟 Vigilância • Vínculo +12 • 💧 +20',
            type: 'EDUCATE',
            bondDelta: 12,
            hydrationDelta: 20,
            reply: '“Tudo com furinho no fundo e pratinho de areia!”'
          }
        ]
      },
      H13: {
        greeting: '“Oi! Hoje abri a porta sem medo! Fui na roda de conversa da UBS ontem e conheci gente passando pelas mesmas coisas que eu...”',
        note: 'Inclusão Social: Pertencimento comunitário reduz isolamento e ansiedade.',
        choices: [
          {
            text: 'Comemorar esse passo corajoso, reforçar que ele não está sozinho e convidá-lo para ajudar na mobilização de amanhã.',
            tag: '💛 Protagonismo Juvenil • Vínculo +22',
            type: 'EMPATHY',
            bondDelta: 22,
            reply: '“Sério que posso ajudar amanhã? Acho que vai me fazer muito bem participar!”'
          },
          {
            text: 'Reforçar a importância da regularidade nas sessões e no sono.',
            tag: '🧠 Continuidade • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“Tô anotando tudo num caderninho. Obrigado por acreditar em mim!”'
          }
        ]
      },
      H14: {
        greeting: '“Olha só, agente: fiz meus exames lá na UBS ontem! O médico disse que só o colesterol deu um tiquinho alto, nada grave!”',
        note: 'Saúde do Homem: Prevenção secundária bem-sucedida graças à abordagem sem julgamento.',
        choices: [
          {
            text: 'Elogiar a coragem dele de cuidar da saúde e combinar pequenas trocas na cozinha sem perder o sabor da roça.',
            tag: '🥗 Prevenção Positiva • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            stubbornDelta: -20,
            reply: '“Afinal, quem procura acha... solução! Haha! Obrigado por insistir com jeitinho!”'
          },
          {
            text: 'Conversar com carinho sobre o grupo de tabagismo quando ele se sentir pronto.',
            tag: '🚭 Apoio Sem Pressão • Vínculo +16',
            type: 'EDUCATE',
            bondDelta: 16,
            reply: '“Já diminuí pela metade essa semana! Logo entro nesse grupo!”'
          }
        ]
      },
      H15: {
        greeting: '“Oi! O Theo ganhou peso direitinho na consulta de puericultura! Só dormimos pouco à noite, mas estamos tão felizes!”',
        note: 'Puericultura & Rede de Apoio: Acolher o cansaço normal das primeiras semanas.',
        choices: [
          {
            text: 'Elogiar o desenvolvimento do Theo e orientar o casal a revezar pequenos cochilos durante o dia.',
            tag: '👶 Vínculo Familiar • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“O Gabriel tá ficando com ele de manhãzinha pra eu dormir 1h seguida. Faz toda diferença!”'
          },
          {
            text: 'Lembrar da próxima dose vacinal aos 2 meses e da consulta odontológica preventiva.',
            tag: '📅 Continuidade • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Já deixamos anotado no calendário da geladeira!”'
          }
        ]
      }
    },

    // ========================================================================
    // DIA 5 — GRANDE MOBILIZAÇÃO COMUNITÁRIA (DESFECHO LONGITUDINAL!)
    // ========================================================================
    5: {
      H01: {
        greeting: '“Hoje é dia de festa na Vila Esperança, meu anjo! A rua inteira tá falando bem da nossa UBS e do seu cuidado com cada casa!”',
        note: 'Dia 5 — Balanço Semanal: Dona Dulce foi peça-chave na rede de apoio da Rua das Acácias.',
        choices: [
          {
            text: 'Agradecer a parceria da semana inteira e encerrar o acompanhamento semanal com um abraço e água fresca.',
            tag: '🌟 Parceria Ouro • Vínculo +15 • 💧 +35',
            type: 'EMPATHY',
            bondDelta: 15,
            staminaDelta: 25,
            hydrationDelta: 35,
            reply: '“Semana que vem pode contar com a gente de novo! Você honra esse colete azul!”'
          },
          {
            text: 'Convidar para o Conselho Local de Saúde apresentar os avanços da microárea.',
            tag: '🏛️ Participação Social • Vínculo +12 • 💧 +20',
            type: 'EDUCATE',
            bondDelta: 12,
            hydrationDelta: 20,
            reply: '“Estarei lá na primeira fila defendendo nossa equipe!”'
          }
        ]
      },
      H02: {
        greeting: '“Fala, agente! Tô dormindo bem melhor e minha pressão estabilizou! Hoje até passei protetor antes de sair de casa!”',
        note: 'Desfecho Longitudinal (H02): Mudança real de hábitos de sono e autocuidado.',
        choices: [
          {
            text: 'Parabenizar pela conquista e registrar a evolução positiva no prontuário territorial do e-SUS.',
            tag: '📊 Evolução Positiva • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“Valeu por ter encaixado as visitas no meu horário de turno! Fez toda diferença!”'
          },
          {
            text: 'Reforçar a manutenção da rotina de hidratação e alongamentos.',
            tag: '🏃 Continuidade • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Já virou hábito aqui em casa!”'
          }
        ]
      },
      H03: {
        greeting: '“Olha o Pedrinho todo orgulhoso com o adesivo de Super-Herói da Vacina! E conversei com 3 mães da creche que estavam em dúvida!”',
        note: 'Desfecho Longitudinal (H03): A mãe se tornou multiplicadora de informação segura.',
        choices: [
          {
            text: 'Agradecer por multiplicar saúde na creche e confirmar o próximo retorno de puericultura.',
            tag: '🦸 Multiplicadora • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“Quando a gente entende o porquê, passa segurança pros outros também! Obrigada por tudo!”'
          },
          {
            text: 'Entregar o convite da feira de saúde comunitária na UBS hoje à tarde.',
            tag: '🌻 Mobilização • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Vamos sim, o Pedrinho não perde por nada!”'
          }
        ]
      },
      H04: {
        greetingLow: '“Olha, agente... Eu sei que sou duro na queda, mas admito que você tem paciência. Vou tentar ir lá na UBS na segunda...”',
        greetingHigh: '“Chega aí, meu amigo! Olha meu caderninho de pressão todo anotado: 125x80! E já lavei o tabuleiro de dominó pra levar pra UBS!”',
        note: 'Desfecho Longitudinal (H04): O vínculo construído ao longo da semana transforma resistência em parceria.',
        choices: [
          {
            text: 'Celebrar o progresso dele com respeito e confirmar a participação na roda comunitária da UBS.',
            tag: '🏆 Vínculo Conquistado • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Quem diria que o Seu Tião teimoso ia virar parceiro do postinho, né? Haha! Tamo junto!”'
          },
          {
            text: 'Reforçar a importância de nunca interromper a losartana por conta própria.',
            tag: '💊 Adesão Contínua • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Agora eu sei que pressão alta é silenciosa! Não paro mais!”'
          }
        ]
      },
      H05: {
        greetingLow: '“Tô tentando manter o remédio certinho do lado da máquina, mas ainda me confundo nos horários...”',
        greetingHigh: '“Olha que beleza: minha glicemia hoje acordou em 118! E fiz até uns saquinhos de pano pra doar pro mutirão da UBS!”',
        note: 'Desfecho Longitudinal (H05): Organização prática + respeito cultural venceram a descompensação.',
        choices: [
          {
            text: 'Comemorar os resultados, examinar os pés rapidamente e agradecer o carinho dos saquinhos de costura.',
            tag: '🌟 Cuidado & Arte • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“O SUS mudou minha saúde porque alguém parou pra me ouvir de verdade!”'
          },
          {
            text: 'Confirmar a consulta de revisão trimestral de hemoglobina glicada.',
            tag: '🩺 Seguimento DM2 • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Anotado no meu caderno!”'
          }
        ]
      },
      H06: {
        greeting: '“Tô respirando bem melhor com a máscara na obra e o tratamento da bronquite! A Luciana até fez cartaz pro evento da praça!”',
        note: 'Desfecho Longitudinal (H06): Busca ativa rápida garantiu diagnóstico preciso e prevenção.',
        choices: [
          {
            text: 'Agradecer o engajamento do casal e registrar o encerramento positivo da busca ativa no e-SUS.',
            tag: '🤝 Família Parceira • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“A gente que agradece! Qualquer tosse ou dúvida, já sabemos quem chamar!”'
          },
          {
            text: 'Lembrar de manter a casa ventilada e revisar a caderneta de vacinação no fim de semana.',
            tag: '☀️ Prevenção • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Tudo anotado, agente!”'
          }
        ]
      },
      H07: {
        greeting: '“Hoje a Vila Esperança tá radiante! Olha quanta gente você conectou com a UBS essa semana! Sente aqui pela última ronda da semana!”',
        note: 'Liderança Comunitária (Dia 5): Seu Raimundo ajuda a consolidar o relatório participativo do território.',
        choices: [
          {
            text: 'Tomar a última água fresca da semana na sombra e fechar juntos as prioridades do bairro pro mês.',
            tag: '🌳 Sombra • 💧 +35 • ⚡ +25 • Vínculo +15',
            type: 'EMPATHY',
            bondDelta: 15,
            staminaDelta: 25,
            hydrationDelta: 35,
            reply: '“Vai lá fechar o tablet na UBS que a comunidade toda assina embaixo do seu trabalho!”'
          },
          {
            text: 'Convidar Seu Raimundo para abrir a fala da comunidade na UBS hoje às 17h.',
            tag: '🏛️ Controle Social • Vínculo +14 • 💧 +20',
            type: 'EDUCATE',
            bondDelta: 14,
            hydrationDelta: 20,
            reply: '“Já passei até minha camisa social pra falar bonito lá!”'
          }
        ]
      },
      H08: {
        greeting: '“Oi! A Sofia tá mexendo bastante hoje e eu tô me sentindo super acolhida e preparada pro parto! Obrigada por essa semana!”',
        note: 'Desfecho Longitudinal (H08): Gestante vinculada à equipe e à maternidade de referência.',
        choices: [
          {
            text: 'Acolher com carinho, desejar uma boa hora e combinar que na volta da maternidade faremos a primeira visita do bebê!',
            tag: '🤱 Vínculo Perinatal • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“Vou mandar foto assim que ela nascer pra você ser a primeira visita aqui em casa!”'
          },
          {
            text: 'Reforçar os sinais de trabalho de parto ativo e telefones de referência.',
            tag: '📋 Segurança • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Tudo salvo nos favoritos do celular!”'
          }
        ]
      },
      H09: {
        greeting: '“Olha, agente: marquei meu check-up, meu pai está vacinado e hoje minha sobrinha ficou com ele pra eu ir na feira de saúde da UBS!”',
        note: 'Desfecho Longitudinal (H09): Cuidadora resgatou o autocuidado e a rede familiar.',
        choices: [
          {
            text: 'Celebrar esse respiro merecido e confirmar a visita mensal da equipe multiprofissional ao Seu Joaquim.',
            tag: '💜 Vitória do Cuidado • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“Você me devolveu o fôlego pra cuidar com amor sem me esquecer de mim!”'
          },
          {
            text: 'Revisar a lista de medicamentos e o estoque de fraldas/curativos via farmácia do SUS.',
            tag: '📦 Logística Cuidado • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Tudo garantido pro mês inteiro!”'
          }
        ]
      },
      H10: {
        greetingLow: '“Ainda tenho minhas ressalvas, mas reconheço que seu trabalho técnico nesta semana foi muito sério.”',
        greetingHigh: '“Agente, mudei completamente minha opinião! Atualizei meu cadastro no SUS, tomei minha vacina e vou apoiar o mutirão da rua!”',
        note: 'Desfecho Longitudinal (H10): A universalidade do SUS demonstrada na prática.',
        choices: [
          {
            text: 'Agradecer o reconhecimento e destacar que o SUS é patrimônio de todo cidadão brasileiro.',
            tag: '🎓 SUS Universal • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Com profissionais assim no território, dá orgulho defender o sistema público!”'
          },
          {
            text: 'Convidar para compartilhar a experiência dele no conselho de bairro.',
            tag: '🏛️ Participação • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Conte comigo para ajudar na organização!”'
          }
        ]
      },
      H11: {
        greeting: '“Fala, chefia! Semana fechada sem nenhum tombo, vacina em dia e garrafa d\'água na mochila! Trouxe dois colegas pra se cadastrar na UBS!”',
        note: 'Desfecho Longitudinal (H11): Trabalhador informal integrado à rede de atenção primária.',
        choices: [
          {
            text: 'Parabenizar pela atitude e acolher os colegas dele no território!',
            tag: '🛵 Rede Trabalhador • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“É nós, chefia! Obrigado por olhar por quem vive na correria da rua!”'
          },
          {
            text: 'Reforçar direção defensiva na chuva e pausas regulares.',
            tag: '🛡️ Segurança • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Sempre atento, valeu!”'
          }
        ]
      },
      H12: {
        greeting: '“Meu bem, a Rua dos Ipês toda tá limpa, vacinada e animada pro encontro na UBS! Toma um último copo de suco pra fechar a meta!”',
        note: 'Ponto de Apoio (Dia 5): Consolidação comunitária no Sul da microárea.',
        choices: [
          {
            text: 'Brindar a semana incrível com o suco fresco e seguir firme para fechar a meta semanal no e-SUS!',
            tag: '🥤 Energia Total • 💧 +35 • ⚡ +25 • Vínculo +15',
            type: 'EMPATHY',
            bondDelta: 15,
            staminaDelta: 25,
            hydrationDelta: 35,
            reply: '“Vai com Deus, meu anjo! Nos vemos já já na UBS!”'
          },
          {
            text: 'Registrar a participação do grupo de Lian Gong nos indicadores comunitários.',
            tag: '📊 Registro e-SUS • Vínculo +14 • 💧 +20',
            type: 'EDUCATE',
            bondDelta: 14,
            hydrationDelta: 20,
            reply: '“Anotado com louvor!”'
          }
        ]
      },
      H13: {
        greetingLow: '“Ainda é difícil sair de casa, mas saber que você passa aqui me dá um pouco de esperança...”',
        greetingHigh: '“Oi! Olha eu aqui no portão te esperando! Ajudei a organizar as cadeiras da roda de conversa na UBS e tô me sentindo útil de novo!”',
        note: 'Desfecho Longitudinal (H13): Escuta contínua transformou isolamento em participação social.',
        choices: [
          {
            text: 'Reconhecer o brilho no olhar dele e celebrar cada passo dado nessa semana!',
            tag: '💛 Superação • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Essa semana mudou minha vida, agente. Obrigado por ter tido paciência comigo lá no começo!”'
          },
          {
            text: 'Confirmar o acompanhamento semanal com a psicóloga da eMulti.',
            tag: '🧠 Cuidado Contínuo • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Não falto por nada!”'
          }
        ]
      },
      H14: {
        greetingLow: '“Tô tentando comer com menos sal e olhar as garrafas... Já é um começo, né?”',
        greetingHigh: '“Eita, agente! Trouxe até couve orgânica da horta pra você levar pra festa da UBS! E entrei no grupo pra largar o cigarro!”',
        note: 'Desfecho Longitudinal (H14): Saúde do Homem conquistada com respeito à cultura local.',
        choices: [
          {
            text: 'Agradecer o carinho da horta, comemorar a entrada no grupo de tabagismo e seguir para fechar a semana!',
            tag: '🥬 Vínculo Rural • Vínculo +20',
            type: 'EMPATHY',
            bondDelta: 20,
            reply: '“Você ganhou a confiança desse velho teimoso! Bom trabalho fechando o mapa hoje!”'
          },
          {
            text: 'Reforçar a hidratação e o uso do adesivo conforme orientação médica.',
            tag: '🚭 Apoio Técnico • Vínculo +15',
            type: 'EDUCATE',
            bondDelta: 15,
            reply: '“Tô seguindo à risca!”'
          }
        ]
      },
      H15: {
        greeting: '“Oi! O Theo já tá com a caderneta completa da 1ª semana, ganhando peso só no peito! Vamos passar na UBS mostrar ele pra equipe!”',
        note: 'Desfecho Longitudinal (H15): Ciclo puerperal completo com vínculo forte.',
        choices: [
          {
            text: 'Parabenizar os pais e convidá-los para a foto da mobilização comunitária na UBS!',
            tag: '👶 Família Ouro • Vínculo +18',
            type: 'EMPATHY',
            bondDelta: 18,
            reply: '“Vocês são anjos na vida da nossa família! Até já na UBS!”'
          },
          {
            text: 'Registrar o fechamento do acompanhamento neonatal da 1ª semana no e-SUS.',
            tag: '📊 Indicador 100% • Vínculo +14',
            type: 'EDUCATE',
            bondDelta: 14,
            reply: '“Tudo certinho no sistema!”'
          }
        ]
      }
    }
  };

  class NarrativeSystem {
    constructor(game) {
      this.game = game;
      this.visitHistory = {}; // { [famId]: { count, lastDay, lastType } }
      this.flags = {};        // { [flagName]: true }
    }

    reset() {
      this.visitHistory = {};
      this.flags = {};
    }

    exportState() {
      return {
        visitHistory: this.visitHistory,
        flags: this.flags
      };
    }

    importState(state) {
      if (!state) return;
      this.visitHistory = state.visitHistory || {};
      this.flags = state.flags || {};
    }

    getDialogueForFamily(fam, dayIndex) {
      // Wrap dayIndex across the 5 narrative day templates so Saturdays & Week 2+ always have rich content
      const dayNumber = (global.ACSEngine.safeMod(dayIndex, 5)) + 1;
      const dayMap = DAILY_DIALOGUES[dayNumber];
      if (!dayMap || !dayMap[fam.id]) {
        return fam.dialogues[0];
      }

      const entry = dayMap[fam.id];
      let greeting = entry.greeting;
      if (!greeting) {
        greeting = fam.bond >= 65 && entry.greetingHigh
          ? entry.greetingHigh
          : (entry.greetingLow || entry.greetingHigh);
      }

      return {
        greeting,
        note: entry.note,
        choices: entry.choices
      };
    }

    recordVisit(fam, choice, ok) {
      if (!this.visitHistory[fam.id]) {
        this.visitHistory[fam.id] = { count: 0, lastDay: 0, lastType: null };
      }
      if (ok) {
        this.visitHistory[fam.id].count += 1;
        this.visitHistory[fam.id].lastDay = this.game.dayIndex + 1;
      }
      this.visitHistory[fam.id].lastType = choice.type;

      if (ok && choice.flag) {
        this.flags[choice.flag] = true;
      }
    }

    evaluateBonusGoal(dayIndex) {
      const g = this.game;
      const dayNum = dayIndex + 1;
      const knownCount = g.families.filter(f => f.knownSchedule).length;
      const avgBond = g.getCommunityBondAverage();

      switch (dayNum) {
        case 1:
          return {
            met: knownCount >= 8, // Starts with 4 known -> discovering >= 4 new schedules
            progress: `${Math.max(0, knownCount - 4)}/4 novos horários descobertos`
          };
        case 2:
          return {
            met: g.dengueClearedCount >= 3,
            progress: `${g.dengueClearedCount}/3 focos de dengue eliminados`
          };
        case 3:
          return {
            met: !!this.flags.vaccine_myth_busted,
            progress: this.flags.vaccine_myth_busted
              ? 'Fake news combatida com orientação científica'
              : 'Converse sobre vacinas seguras em uma visita'
          };
        case 4:
          return {
            met: avgBond >= 70,
            progress: `Vínculo médio atual: ${avgBond}% (meta: 70%)`
          };
        case 5:
        default:
          return {
            met: g.dailyVisits >= g.dailyGoal && avgBond >= 75,
            progress: `${g.dailyVisits}/12 visitas e ${avgBond}% vínculo (meta: 75%)`
          };
      }
    }
  }

  global.NarrativeSystem = NarrativeSystem;
  global.ACS_DAILY_DIALOGUES = DAILY_DIALOGUES;
})(window);

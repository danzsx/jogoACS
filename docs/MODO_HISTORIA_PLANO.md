# Plano Diretor & Execução — Modo História Completo: *O Pulso da Vila Esperança*

> **Status:** Planejamento aprovado para revisão antes da implementação (nenhum arquivo de código foi alterado nesta etapa).  
> **Público-alvo deste documento:** Direção criativa, roteiro e agentes/desenvolvedores de implementação (Módulo `H1` em diante).

---

## 1. Visão Criativa e Identidade Definitiva do Modo História

### 1.1 Premissa do Modo História
Em *Território Vivo: Crônicas de um ACS*, o jogador assume o papel de **Alex**, Agente Comunitário de Saúde (ACS) da microárea **Vila Esperança**. No Modo História, a profissão de ACS **deixa de ser o teto da experiência** (um loop de visitas + registro em tablet) para se tornar a **chave de acesso humana** a uma comunidade brasileira viva.

Bater palmas no portão, esperar na fila da UBS com um usuário, tomar café na copa da ESF, passar na Vendinha do Zé no fim da tarde ou sentar perto da roda de dominó na Pracinha dos Ipês são os meios pelos quais Alex descobre afetos, ressentimentos antigos, humor de esquina, vergonhas silenciosas e problemas estruturais reais do território.

### 1.2 Síntese Original das Referências (Sem Fantasia, Sem Sobrenatural)
Todas as referências atuam sobre **realismo periférico brasileiro contemporâneo**, preservando a dignidade e a complexidade dos moradores:

| Referência | O que absorvemos na prática | Como traduzimos para a Vila Esperança |
| :--- | :--- | :--- |
| **Stardew Valley** | Laços progressivos, rotinas próprias e cenas desencadeadas por presença + afeto. | **Heart Events realistas** disparados ao entrar num local no horário em que o personagem está lá (`ScheduleSystem` + `SceneManager`), revelando quem a pessoa é fora do protocolo médico. |
| **Night in the Woods** | Vozes humanas, humor cotidiano ácido, diálogos naturais e bairro explorável com memória. | Falas com cadência real, ironia defensiva, fofoca de vizinhança e **objetos/cenários comentáveis** (mural da Associação, fila da recepção, bilhetes no balcão da Vendinha, rádio da Pracinha). |
| **Graveyard Keeper** | Espinha dorsal de objetivos curtos, médios e longos interligando rotina, recursos e história. | Visitas, tempo (`07:00–22:00`), energia e melhorias de espaços (Horta, Associação, acolhimento na UBS) servem de engrenagem concreta para destravar etapas da campanha. |
| **A Space for the Unbound** | Poesia e gravidade emocional nascendo de situações banais de bairro pequeno. | Um exame extraviado, um banco quebrado na praça, um latido no portão ou uma receita mal explicada funcionam como porta para traumas, reconciliações familiares e solidariedade. |
| **The Walking Dead (Telltale)** | Dilemas sem resposta "certa grátis", pressão de tempo/afeto e memória visível de atitudes. | Escolhas difíceis entre protocolo institucional, recurso limitado e proteção imediata de um morador ou colega — com personagens lembrando como Alex agiu diante de conflitos anteriores. |

### 1.3 Princípios Editoriais Inegociáveis
1. **Nada de fantasia ou alegoria sobrenatural:** os conflitos têm raízes materiais, relacionais e institucionais (escala de trabalho, acesso a transporte, falta de saneamento/drenagem pontual, desgaste emocional, vergonha, conflito entre gerações).
2. **Moradores são pessoas, não casos clínicos:** ninguém existe apenas para ilustrar uma doença ou vulnerabilidade; cada núcleo possui senso de humor, teimosia, orgulho, pequenos vícios, sonhos práticos e contradições.
3. **Alternância deliberada de tom:** momentos tensos (como uma discussão dura na recepção da UBS ou a ameaça de corte na equipe) são sempre seguidos ou balanceados por respiros humanos e cômicos (piadas no dominó, desentendimentos banais na Feira de Terça, a rotina dos cães `Trovão`, `Brutus` e `Fumaça`, trocas no grupo do celular).
4. **A profissão continua importando:** não descartamos a simulação da Fase 1 e 2; ela passa a gerar **descobertas, confiança, renda/tempo disponível e ganchos narrativos**.

---

## 2. Estrutura Narrativa Principal — Campanha *"O Pulso da Vila Esperança"*

### 2.1 Premissa Dramática Central
Há meses, a microárea da Vila Esperança aparece nos relatórios da rede municipal como território de **"baixa adesão e baixa resolutividade"**. Boatos nos bastidores da UBS indicam que, se os indicadores e a articulação comunitária não mostrarem resposta até o encerramento do ciclo atual, parte da equipe ESF pode ser remanejada — exatamente quando problemas ambientais silenciosos (focos recorrentes de água parada na baixada perto da Horta, acúmulo de entulho entre quadras e faltas em cascata a consultas e exames) começam a se somar.

A questão central da história é realista e humana: **os números frios do sistema não enxergam por que as pessoas faltam, desistem ou desconfiam do posto — e tentar carregar o bairro inteiro nas costas sozinho também adoece quem cuida.** Só reconstruindo pontes entre a UBS, a Associação, o comércio local e os vizinhos a Vila Esperança consegue responder por si mesma.

### 2.2 Arco de Desenvolvimento do Protagonista (Alex)
- **Ponto de Partida (Capítulos 0–1):** Alex ainda tenta equilibrar o desejo sincero de ajudar com o medo de errar na frente da equipe da Sala ESF e a preocupação prática com meta semanal e contas pessoais. Tende a ver cada casa como uma "missão isolada".
- **Crise e Desilusão (Capítulos 2–3):** Alex percebe que boa vontade individual esbarra em limites reais — um morador resiste mesmo após orientação correta, um colega sobrecarregado estoura, um dilema na UBS mostra que agradar gestão e morador ao mesmo tempo às vezes é impossível.
- **Virada (Final do Cap 3 → Cap 4):** Em vez de tentar resolver cada conflito na força bruta do próprio turno, Alex aprende a **articular rede**: conectar quem sabe da horta com quem conhece a rua, quem organiza fila com quem escuta no balcão, transformando trabalho solitário em presença coletiva.
- **Estado Final:** Um(a) ACS respeitado(a) não por "ter todas as respostas", mas por sustentar escuta, limites saudáveis e confiança mútua no território.

### 2.3 Estrutura em Prólogo + 4 Capítulos + Epílogo & Modo Livre
A campanha aproveita o calendário contínuo de **6 dias jogáveis (Seg–Sáb)** já existente em `data.js` e `game.js`, evitando pressões artificiais de prazo impossível (usando **portão brando / Soft Gating** detalhado na Seção 7).

| Etapa | Título | Duração Indicativa | Foco Dramático & Viradas |
| :--- | :--- | :--- | :--- |
| **Cap 0 (Prólogo)** | **Primeira Prancheta** | Dias 1–2 (Semana 1) | Chegada à Sala ESF, acolhimento prático com a colega **Joana**, primeiras visitas na microárea, introdução orgânica à **Vendinha do Zé** e primeiros recados no **Celular Pessoal**. Estabelece a rotina e apresenta o primeiro atrito leve entre "o que está no papel" e "o que acontece atrás do portão". |
| **Capítulo 1** | **Portas Fechadas, Janelas Abertas** | Semanas 1–2 | Acompanhamento das rotinas do bairro (Feira de Terça, Dominó de Quinta/Sábado, Fila da UBS). Boatos de auditoria na UBS começam a tensionar a equipe (**Renan**, **Enfª Marina**, **Dr. Henrique**). **Clímax do Cap 1:** confronto aberto na recepção da UBS envolvendo **Dona Carla** e usuários em espera; a postura de Alex no meio da cena define as primeiras alianças e tensões de confiança. |
| **Capítulo 2** | **O Que Não Cabe no Prontuário** | Semanas 2–3 | Pistas recolhidas em visitas (`H01`–`H15`), focos persistentes de dengue (`dengueSpots`) e conversas informais revelam conflitos cruzados no bairro: desentendimento entre vizinhos da Feira e da roda de Dominó, vergonha financeira escondida na Vendinha do Zé e paralisia na **Associação de Moradores**. **Tia Bete** desafia Alex a provar que a UBS não sumirá depois do mutirão da **Horta**. |
| **Capítulo 3** | **Sobrecarga & Fratura** | Semanas 3–4 | Ponto de maior pressão emocional e moral. Um agravamento localizado na microárea somado a um desfalque/sobrecarga na equipe da UBS expõe fraturas: **Tiago** beira o esgotamento tentando cobrir indicadores; **Seu Zé** guarda informação sensível para proteger fregueses no fiado; uma ordem rígida pressiona Alex a priorizar relatório rápido em vez de mediação comunitária. **Clímax do Cap 3:** escolha moral de alto custo relacional que pode rachar ou selar a cooperação entre UBS e liderança local. |
| **Capítulo 4** | **Mesa Posta na Pracinha** | Semanas 4–5 | Convergência dos arcos. Preparação coletiva da **Assembleia Aberta / Mutirão da Vila Esperança** na **Pracinha dos Ipês** e na **Associação**. Cada vínculo fortalecido (na UBS, na Vendinha, na Horta e entre as famílias `H01`–`H15`) contribui de forma visível — organizando testemunhos, mobilizando mutirão, reconciliando vizinhos ou defendendo a permanência da equipe ESF. **Clímax:** cena coral multi-personagem na Pracinha modulada pela `NarrativeMemory`. |
| **Epílogo & Modo Livre** | **Depois da Assembleia** | Pós-campanha contínuo | Balanço modular do futuro da Vila Esperança (UBS, Horta/Associação, núcleos familiares e legado de Alex). Em seguida, o jogo segue sem tela de "Game Over definitivo": o bairro permanece vivo com melhorias conquistadas, rotinas de trabalho, missões secundárias pendentes e Heart Events finais desbloqueáveis. |

---

## 3. Elenco, Papéis Narrativos e Teia de Relações

A força da história nasce do aproveitamento profundo do elenco **já existente no projeto**, evitando dezenas de personagens novos sem rotina. O elenco se organiza em **4 núcleos que se atravessam constantemente**:

### 3.1 Núcleo UBS & Sala ESF (10 profissionais já implementados em `ubsInterior.js`)
Cada profissional representa um ângulo real do serviço público e funciona como termômetro das escolhas de Alex:

- **Joana (ACS veterana):** mentora prática, conhece atalhos afetivos das ruas e desconfia de soluções mágicas; ensina que acolher não é fazer tudo pelo outro.
- **Tiago (ACS):** jovem pressionado por metas semanais; oscila entre humor defensivo e cansaço real — protagonista de um arco secundário importante no Capítulo 3 sobre *burnout* e solidariedade entre colegas.
- **Rosana (ACS):** memória viva das histórias de família do bairro; percebe nuances de parentesco e micro-conflitos que passam batido em fichas técnicas.
- **Dr. Henrique (Médico):** competente, mas sufocado por agenda apertada; inicialmente enxerga as demandas sociais como "ruído fora do consultório", podendo ganhar visão de território conforme Alex articula casos reais.
- **Enfª Marina (Enfermeira):** rigorosa com protocolo e imunização/pré-natal; entra em rota de colisão com Dona Carla no Cap 1 por proteger fluxo e equipe sob pressão, mas carrega cuidado genuíno.
- **Enf. Carlos (Enfermeiro):** ponte de escuta entre sala de procedimentos e visitas de rua; aliado chave para ações conjuntas na Associação.
- **Dra. Patrícia (Fisioterapeuta):** foco em mobilidade, dor crônica e autonomia de idosos e trabalhadores braçais; peça central para conectar cuidado domiciliar a encontros comunitários na Pracinha/Horta.
- **Renan (Escriturário):** linha de fogo do guichê da recepção; absorve xingamentos por falhas do sistema que não criou, gerando um dilema humano empático quando entra em atrito com moradores.
- **Seu Oswaldo (Vigia):** observa horários, tensões na calçada e quem anda rondando ou evitando o posto; fonte valiosa de pistas de rua e humor seco.
- **Dona Sueli (Limpeza):** figura de sabedoria silenciosa da UBS; vê quem chora no corredor depois de uma consulta frustrada e lembra Alex da humanidade por trás de cada uniforme.

### 3.2 Núcleo Comunitário & Espaços Compartilhados (`communitySpaces.js`)
- **Seu Zé (Vendinha do Zé):** comerciante há décadas na esquina; o caderno de fiado dele conta a economia invisível das famílias antes de qualquer triagem médica. Hesita entre "não se meter em assunto de vizinho" e abrir o espaço para recados e apoio do bairro.
- **Tia Bete (Associação de Moradores & Horta Comunitária):** liderança calejada, cansada de projetos que começam com entusiasmo e morrem sem manutenção; seu arco trata de passar o bastão e voltar a confiar em parcerias reais com a UBS.
- **Dona Carla (Liderança crítica na UBS — Seg/Sex):** combativa, vocal e impaciente com demora e formalismo; para o guichê é "a que faz escândalo", mas suas exigências nascem de casos concretos de vizinhas e idosos desassistidos.

### 3.3 Núcleo das Famílias da Microárea (`families` `H01`–`H15` em `data.js`)
Em vez de 15 ilhas isoladas, as famílias existentes no mapa conectam-se através dos **pontos de encontro já modelados no `ScheduleSystem` e no `DialogueSystem`**:

- **Roda da Feira de Terça (`H01`, `H03`, `H05`, `H14`):** circulação de notícias domésticas, trocas alimentares, pressões de orçamento da casa e conflitos sutis de vizinhança (`H01` já conta com grafo-piloto em `PILOT_GRAPHS`).
- **Roda do Dominó da Pracinha (`H04`, `H07`, `H11`, `H13`):** espaço de humor masculino, orgulho, negação de sintomas e cuidado postergado (`H04` e `H13` já possuem grafos-piloto; `H07` conecta o Dominó à Associação).
- **Turno da Noite na Vendinha (`H02`, `H06`, `H10`, `H11`):** moradores com jornadas estendidas, bicos e horários incompatíveis com o expediente padrão da UBS — núcleo essencial para o conflito "horário do posto vs. vida real de quem trabalha".
- **Fila & Acolhimento (`H08`, `H12` + `H01`, `H07`):** usuários que sentem primeiro o gargalo de agendamentos, renovações de receita e encaminhamentos.
- **Casas Mais Recolhidas (`H09`, `H15`):** núcleos de acesso gradual que exigem constância, paciência e apoio de vizinhos próximos para se abrir ao cuidado e à comunidade.

### 3.4 Presenças Ambientais de Bairro (`dogs` em `data.js`)
- **Trovão, Brutus e Fumaça:** os cães já presentes no mapa passam a ter micro-reações narrativas em cenas de rua e exploração (latidos que avisam movimentação atípica em uma casa, momentos cômicos de patrulha na calçada, reconhecimento progressivo do passo de Alex ao longo dos capítulos).

### 3.5 Teia de Tensões Cruzadas (Onde as Histórias Se Encontram)
1. **Guichê da UBS (Renan / Enfª Marina) ↔ Fila e Comunidade (Dona Carla / `H08`, `H12`):** o mesmo sistema que esmaga o atendente também empurra o morador para o limite.
2. **Roda de Dominó (`H04`, `H07`, `H11`, `H13`) ↔ Horta & Associação (Tia Bete):** homens resistentes a falar de saúde/sentimento fora da brincadeira são convencidos indiretamente quando entram para construir bancos, irrigação ou reparo na Horta.
3. **Caderno da Vendinha (Seu Zé) ↔ Casa e Feira (`H02`, `H06`, `H10` / `H01`, `H03`, `H05`, `H14`):** a dificuldade de comprar alimento fresco ou manter tratamento aparece no balcão do Zé disfarçada de piada ou "esquecimento".
4. **Sala ESF (Joana, Tiago, Rosana) ↔ Rua:** o que Alex ouve no corredor da UBS vira cuidado ou fofoca na microárea dependendo da ética de cada escolha.

---

## 4. Sistema de Missões, Subtramas e Heart Events

Para evitar tanto a "campanha linear sobre trilhos" quanto um "mural de recados desconectados", a narrativa opera em **4 camadas complementares**:

### Camada 1 — Missões Principais (Espinha Dorsal dos Capítulos)
- **Quantidade ideal (MVP v1):** 3 a 5 missões encadeadas por capítulo (cerca de 18–22 missões principais no total da campanha).
- **Característica:** sempre envolvem circulação entre **visita, escuta em espaço público e articulação na UBS/Associação**. Nunca são apenas "fale com X e volte" sem consequência situacional.
- *Exemplo estrutural (Cap 1–2):* Investigar por que faltas em cadeia aconteceram num mesmo quarteirão -> descobrir na Vendinha o choque de horário de trabalho (`H02`/`H06`) + desconfiança após episódio na fila -> negociar na ESF com Dr. Henrique / Enf. Carlos uma adaptação de encaixe ou busca ativa noturna -> lidar com a reação do Renan e de Dona Carla.

### Camada 2 — Subtramas Comunitárias (Arcos Secundários Multi-Etapas)
- **Quantidade ideal:** 6 a 8 arcos secundários opcionais que enriquecem o mundo e fortalecem diretamente a Assembleia final do Capítulo 4.
- **Regra de ouro:** toda subtrama cruza **pelo menos dois núcleos** (ex.: duas famílias + um espaço comum).
- **Exemplos concretos aproveitando o mapa atual:**
  1. ***O Canteiro e a Torneira* (Horta + Dominó + Tia Bete):** convencer participantes resistentes da roda de Dominó (`H07`, `H04`) a ajudar na recuperação estrutural da Horta sob o pretexto de melhorar a sombra/bancos da Pracinha, abrindo espaço para conversas honestas sobre envelhecimento e dor crônica (conectando Dra. Patrícia).
  2. ***Balanço do Guichê* (UBS Recepção + Dona Carla + Dona Sueli):** depois da tensão do Cap 1, Alex pode mediar um acordo silencioso de acolhimento entre Dona Carla, Renan e Dona Sueli — ou optar por protocolo estrito que deixa o clima funcional, porém frio.
  3. ***Turno da Madrugada* (Vendinha + `H02`/`H06`/`H10` + Seu Oswaldo):** descobrir que parte dos moradores "faltosos" passa pela rua da UBS apenas fora do horário comercial; gera uma proposta concreta de recados/orientação na Vendinha do Zé.
  4. ***Sombra na Baixada* (`dengueSpots` + Feira `H01`/`H03`/`H05`/`H14`):** conflito de vizinhança sobre descarte de lixo e água acumulada que começa como troca de acusações na Feira de Terça e revela sobrecarga familiar e falha de coleta pública.
  5. ***Prancheta do Tiago* (Sala ESF — Tiago, Joana, Rosana):** arco focado na equipe interna de ACS sobre pressão numérica vs. saúde mental de quem visita.

### Camada 3 — Heart Events Realistas (Inspiração *Stardew Valley*)
Disparados automaticamente quando o jogador entra numa cena compatível e atende aos requisitos (`bond >= patamar`, horário/dia ou etapa de capítulo), trazendo cenas de intimidade, humor ou virada dramática **sem exigir uso do tablet**:

- **Patamares sugeridos:** **30 (Aproximação)**, **60 (Confiança)** e **85 (Vínculo Profundo)** — válidos tanto para famílias (`fam.bond`, já existente em `data.js`) quanto para staff da UBS e NPCs comunitários (via `npcBonds`, a ser adicionado).
- **Regra anti-frustração:** Heart Events não somem permanentemente por um único minuto perdido; permanecem elegíveis sempre que as condições de cena/horário forem satisfeitas até serem vividos.
- **Exemplos práticos:**
  - *Enfª Marina + Dona Sueli na Copa/Recepção (UBS, fim de expediente):* revela o peso pessoal que Marina esconde por trás da cobrança rígida de metas.
  - *Seu Zé fechando a Vendinha (após 20:00):* diálogo honesto diante do caderno de fiado e do rádio velho sobre quem realmente sustenta o bairro quando o mês aperta.
  - *Tia Bete na Horta (Sábado manhã):* cena silenciosa mexendo na terra que explica por que a Associação esvaziou anos atrás e o que a faz resistir hoje.
  - *Núcleo `H04`/`H13` na Pracinha (noite de Dominó):* brincadeira que escorrega naturalmente para uma confissão inesperada sobre medo de diagnóstico ou solidão.

### Camada 4 — Histórias Ambientais, Celular & Diário Vivo
- **Exploração do mapa:** hotspots em paredes, balcões, canteiros da Horta, quadros da Associação e calçadas próximas às casas revelam micro-histórias, bilhetes, cartazes rasgados e pistas de investigação sem interromper o fluxo com menus longos.
- **Celular Comunitário (`PhoneSystem`):** além da agenda de trabalho já existente, a aba de grupo e contatos recebe reações naturais dos moradores, convites informais ("*Bete chamou pra um café na Associação antes das 18h*"), piadas pós-evento e alertas de mudança de humor no bairro.

---

## 5. Interação, Escolhas, Dilemas e Memória Narrativa

### 5.1 Tipologia de Escolhas (Sem Maniqueísmo "Santo vs. Vilão")
O jogo já acerta em `DialogueSystem.showHints = false` ao **não mostrar spoilers numéricos nos botões de escolha**. No Modo História, as decisões seguem três eixos realistas:

1. **Dilemas Profissionais & Éticos:** *Protocolo Estrito vs. Acomodação Protetora* (ex.: registrar formalmente uma irregularidade sanitária imediatamente vs. construir um prazo de 48h com ajuda de vizinhos e Associação; ceder tempo precioso do turno para acalmar uma crise em `H13` ou `H04` sabendo que a meta do dia ficará apertada).
2. **Dilemas Comunitários de Mediação:** *Tomar Lado Rápido vs. Sustentar Mediação Difícil* (ex.: defender publicamente a indignação de Dona Carla ou blindar o guichê de Renan diante da fila cheia; aceitar ajuda informal com contrapartida política/comercial ou priorizar autonomia lenta da Horta).
3. **Postura Relacional nos Diálogos:** *Escuta Empática*, *Humor/Leveza Cúmplice*, *Firmeza Objetiva* ou *Distanciamento Técnico* — moldando o jeito como os personagens falam com Alex nos dias seguintes.

### 5.2 Arquitetura de Consequências Sustentável (`NarrativeMemory`)
Em vez de prometer dezenas de ramificações que explodem o custo de escrita e testes, o projeto usa o modelo de **Funil com Memória Persistente**:

1. **Contadores leves de postura de Alex:** `posture: { acolhimento, firmeza, articulacao, burocracia }` — influenciam tons de resposta automática e reconhecimentos pontuais dos colegas da ESF.
2. **Flags nominais de decisão (`storyFlags`):** eventos marcantes gravam chaves legíveis (ex.: `cap1_ubs_mediacao: 'alianca_carla' | 'apoio_renan' | 'acordo_duplo'`, `cap2_lista_ze: 'compartilhou' | 'respeitou_sigilo'`, `cap3_ordem_gestao: 'cumpriu_relatorio' | 'resistiu_com_equipe'`).
3. **Impacto tangível em 4 planos:**
   - **Reativo (Curto prazo):** nos 2–3 dias seguintes, outros moradores comentam o ocorrido e o grupo do celular (`PhoneSystem`) reflete a repercussão.
   - **Relacional (Médio prazo):** alterações graduais em `fam.bond` e `npcBonds`, destravando ou adiando confiança para Heart Events.
   - **Espacial/Visual (Persistente):** evolução ou estagnação física da Horta, dos murais da Associação, da Pracinha e do mural de acolhimento da UBS (`WorldStateSystem`).
   - **Modular no Desfecho (Longo prazo):** a Assembleia do Cap 4 e o Epílogo combinam o resultado de 4 pilares independentes (**Equipe UBS**, **Associação & Horta**, **Coesão das Famílias**, **Postura de Alex**) em uma cena final coerente e personalizada sem gerar árvore exponencial impossível de manter.

---

## 6. Análise de Integração Crítica com o Código Existente

O projeto já possui uma base modular limpa em Vanilla JS (padrão IIFE em `window.*`, zero bundler, compatível com `file:///` e testado via `tests/verify_game.js` com **21/21 verificações aprovadas**). Abaixo está o diagnóstico técnico honesto do que aproveitar, adaptar e evitar duplicar.

### 6.1 O Que Já Temos e Deve Ser Aproveitado Diretamente
- **`ACSEngine.EventBus` (`public/js/core/engine.js`):** já emite `time:hourChanged`, `day:started`, `day:ended`, `week:ended`, `visit:completed`, `npc:talked`, `dialogue:choice` e `scene:changed`. Todo o motor de missões e eventos deve ser guiado por esses eventos sem acoplar `game.js` a lógica narrativa pesada.
- **`SceneManager` (`public/js/systems/sceneManager.js`):** já padroniza transições e spawns entre `OVERWORLD`, `PLAYER_HOME`, `UBS_INTERIOR`, `ESF_ROOM`, `VENDINHA` e `ASSOCIACAO` — perfeito para disparar Heart Events ao entrar em cenas.
- **`ScheduleSystem` (`public/js/systems/schedule.js`) e regras de `communitySpaces.js`:** garantem que moradores e NPCs estejam em locais verossímeis (`PRACA_FEIRA`, `PRACA_DOMINO`, `VENDINHA`, `UBS_ESPERA`, `ASSOCIACAO`, Horta, UBS Mon/Sex). O roteiro do Modo História deve **usar essas janelas**, evitando teletransportar personagens sem justificativa.
- **`PhoneSystem` (`public/js/systems/phone.js`):** a UI (`#phone-overlay`, abas `group`, `agenda`, `contacts`, atalho `C`) já escuta ciclo de dias/horas e está pronta para servir de caixa de mensagens narrativas e convites orgânicos.
- **`NavigationSystem` (`public/js/systems/navigation.js`):** o minimapa e os pins (`HOUSE`, `UBS`, `HOME`, `VENDINHA`, `ASSOCIACAO`, `PRACA`, `HORTA`) podem exibir discretamente o próximo ponto de interesse de uma missão marcada no Diário.
- **`SaveManager` (`public/js/core/engine.js`):** já possui versionamento (`schemaVersion = 2`) e função `migrateV1ToV2`, facilitando evolução segura para `schemaVersion = 3`.

### 6.2 Gaps Críticos no Código Atual que Precisam de Evolução
1. **`DialogueSystem` limitado a um único falante por sessão (`public/js/systems/dialogue.js`):**
   - *Observado no código:* `startGraph(config)` abre uma sessão com um único retrato/nome e `renderNode()` atualiza apenas texto, nota clínica e escolhas.
   - *Por que bloqueia o Modo História:* cenas entre 2 ou 3 pessoas (Heart Events, mediação entre Dona Carla e Renan, reuniões na Sala ESF, Assembleia da Pracinha) exigem troca dinâmica de falante e retrato no mesmo fluxo de diálogo, além de ações pós-escolha (`setFlags`, `advanceQuest`, `bondDelta`).
2. **Repetição cíclica de diálogos em `NarrativeSystem` (`public/js/systems/narrative.js`):**
   - *Observado no código:* `getDialogueForFamily()` usa `safeMod(dayIndex, 5) + 1`, fazendo a Semana 2 repetir falas da Semana 1 sem saber em qual capítulo Alex está, qual o vínculo atual (`fam.bond`) ou o que acabou de acontecer no bairro.
   - *Solução necessária:* manter `DAILY_DIALOGUES` como fallback seguro de base, mas envolver a seleção de fala numa camada **`DialogueResolver`** hierárquica (Quest Ativa > Reação Recente > Capítulo/Vínculo > Contexto de Local > Legado).
3. **Falta de pontuação de vínculo para Staff da UBS e NPCs Comunitários (`npcBonds`):**
   - *Observado no código:* apenas `families` (`H01`–`H15`) armazenam `fam.bond`; **Seu Zé**, **Tia Bete**, **Dona Carla** e os **10 profissionais da UBS** ainda não têm vínculo persistido no estado do jogador.
   - *Solução necessária:* criar `npcBonds` dentro de `StoryState` para que todo o elenco central tenha progressão estilo *Stardew Valley*.
4. **Ausência de orquestrador de cutscenes/gatilhos (`StoryEventSystem`):**
   - *Observado no código:* não existe sistema declarativo para verificar pré-requisitos ao entrar em cena (`scene:changed`), posicionar atores temporários (`staging`), rodar uma cena bloqueando disparo repetido (`completedEvents`) e devolver o controle suavemente ao jogador.
5. **Baixa mutabilidade visual e de investigação no mapa (`WorldStateSystem`):**
   - *Observado no código:* tirando `dengueSpots`, horários e estados simples da Horta/UBS, o mapa `80×56` e os interiores permanecem visualmente estáticos entre semanas. O Modo História pede transformações concretas (canteiros evoluindo, cartazes na Associação, objetos investigáveis que contam histórias).
6. **Restrição arquitetural obrigatória (`file:///` e IIFE):**
   - Qualquer novo arquivo JS deve seguir o padrão `window.<NomeSistema>` em IIFE, sem `import`/`export` nem `fetch()`, ser incluído na ordem correta em `public/index.html` e carregado igualmente pelo ambiente simulado em `tests/verify_game.js`.

### 6.3 O Que Não Fazer (Limites para Proteger o Escopo)
- **Não reescrever do zero** `game.js`, `pixelArt.js`, `ubsInterior.js` ou `schedule.js` — evoluir por composição e eventos no `EventBus`.
- **Não criar sistema de combate, inventário RPG pesado ou economia especulativa:** o foco são pessoas, tempo, escuta, mobilização comunitária e pequenas decisões de recurso.
- **Não duplicar UIs de diálogo:** evoluir `#dialogue-overlay` e reutilizar `#tablet-overlay` / `#phone-overlay` existentes em `public/index.html`.

---

## 7. Progressão, Ritmo e Equilíbrio Entre Simulação e História

### 7.1 Cadência do Dia e da Semana
O ciclo já calibrado de **`07:00–22:00`** em semana contínua de **6 dias (Seg–Sáb)** encaixa perfeitamente no ritmo narrativo em 3 faixas orgânicas:
- **Manhã (`07:00–12:00`):** visitas domiciliares (`H01`–`H15`), atendimento na UBS (Dona Carla às segundas manhã), Feira de Terça na Pracinha (`07:30–14:00`) e Sábado na Horta (`09:00–12:30`). Ideal para ações de trabalho e coleta de pistas.
- **Tarde (`12:00–18:00`):** acompanhamento clínico/ESF, Associação de Moradores (Quartas `14:00–18:30`), Dona Carla às sextas (`14:00–17:30`) e visitas prolongadas que pedem escuta calma.
- **Fim de Tarde & Noite (`18:00–22:00`):** Dominó na Pracinha (Quinta `15:00–21:00` / Sábado `14:00–20:00`), Vendinha do Zé (`18:30–21:00`), mensagens no celular comunitário e descanso/reflexão na `PLAYER_HOME`. É o horário nobre para **Heart Events afetivos e subtramas comunitárias**.

### 7.2 "Portão Brando" (*Soft Gating*) Entre Simulação e Campanha
O jogador **nunca** deve sentir que precisa "farmar visitas repetidas como obrigação mecânica" antes de ver história, nem sentir que a história acontece num vácuo onde o trabalho de ACS é irrelevante:
1. **Avanço de capítulo exige 3 sinais equilibrados:**
   - Vivência mínima de dias/semana no território (ritmo natural sem atropelar o relógio).
   - Participação orgânica na microárea (cobertura mínima razoável ou cumprimento de parte das prioridades semanais, alcançável sem grind).
   - Conclusão dos marcos narrativos principais do capítulo atual.
2. **A visita vira descoberta narrativa:** mesmo durante visitas de rotina do tablet, o `DialogueResolver` injeta falas ligadas ao capítulo vigente, pistas para missões secundárias e reações às últimas notícias da Vila Esperança.
3. **Domingo como respiro ou transição narrativa:** mantendo a estrutura de semana de 6 dias + resumo semanal (`week:ended`), a virada para a nova semana serve como marco natural de cartas/mensagens no celular e eventuais cenas-ponte de capítulo antes de abrir a segunda-feira.

---

## 8. Arquitetura Conceitual dos Novos Sistemas

Os sistemas abaixo formam uma camada narrativa desacoplada acima do motor atual (`engine.js`, `sceneManager.js`, `schedule.js`, `game.js`):

```
ACSEngine.EventBus (scene:changed, time:hourChanged, day:started, visit:completed, dialogue:choice)
   ├── StoryState & SaveManager v3   (chapter, storyFlags, posture, npcBonds, worldStates, quests)
   ├── QuestSystem                   (main/side/community steps, objetivos no Diário & NavigationSystem)
   ├── StoryEventSystem              (Heart Events & Cenas de Capítulo com staging de atores)
   ├── DialogueSystem v2             (multi-falante no mesmo grafo + efeitos/condições por nó)
   ├── DialogueResolver              (prioridade: Quest > Reação > Cap/Vínculo > Local > Legado)
   └── WorldStateSystem              (mutação visual do mapa/interiores + hotspots investigáveis)
```

### Contratos Conceituais por Módulo
1. **`StoryState` (Persistido via `SaveManager` v3):**
   - `chapter` (`0..4` + `5` para Epílogo/Modo Livre), `storyFlags` (mapa de decisões e eventos vistos), `recentFlags` (com expiração em dias para comentários quentes), `posture` (`acolhimento`, `firmeza`, `articulacao`, `burocracia`), `npcBonds` (mapa `0..100` para os 10 staff da UBS + Seu Zé, Tia Bete e Dona Carla), `completedEvents` (IDs de Heart Events e cutscenes já exibidos), `quests` (`active`, `completed`), `worldStates` (`hortaStage: 0..3`, `ubsMural`, `pracinhaStatus`, `cluesFound`).
   - Migração segura v2 → v3 preservando integralmente famílias, energia, dinheiro, semana e progresso de saves anteriores.

2. **`DialogueSystem v2` (evolução direta de `public/js/systems/dialogue.js`):**
   - Retrocompatível com `PILOT_GRAPHS` (`H01`, `H04`, `H13`, `medico`, `acs_joana`, `npc_seu_ze`, `npc_tia_bete`) e `adaptLegacyDialogue`.
   - Cada nó passa a aceitar opcionalmente `speaker` (referência a família, staff da UBS ou NPC comunitário), atualizando retrato, nome e papel durante a conversa para cenas com 2–4 personagens.
   - Nós e escolhas passam a aceitar `conditions` (`minBond`, `flagEquals`, `questStep`) e `effects` (`setFlags`, `postureDelta`, `bondDelta`, `npcBondDelta`, `advanceQuest`, `triggerPhoneMsg`, `setWorldState`).

3. **`DialogueResolver` (camada sobre `narrative.js` + `dialogue.js`):**
   - Centraliza "o que esse personagem diz agora?" nesta ordem estrita de prioridade:
     1. Passo de **Quest** ativa aguardando interação com aquele personagem;
     2. **Reação imediata** a uma escolha/evento recente do bairro (`recentFlags`);
     3. **Diálogo reativo de Capítulo + Faixa de Vínculo** (Conhecido / Confiança / Íntimo);
     4. **Fala contextual de espaço compartilhado** (`PRACA_FEIRA`, `PRACA_DOMINO`, `VENDINHA`, `UBS_ESPERA`, `ASSOCIACAO`, `HORTA`);
     5. **Fallback legado** (`DAILY_DIALOGUES` em `narrative.js` ou falas padrão de `ubsInterior.js` / `communitySpaces.js`).

4. **`QuestSystem` (`window.QuestSystem`):**
   - Gerencia definições declarativas de missões (`id`, `type: 'main' | 'side' | 'community'`, `chapter`, `steps[]`).
   - Escuta `EventBus` (`visit:completed`, `npc:talked`, `dialogue:choice`, `scene:changed`, `inspect:clue`) para avançar passos automaticamente sem exigir cliques manuais em checklists.
   - Exporta missão rastreada para a aba de **História/Missões** no Diário (`#btn-journal` / `#tablet-overlay`) e sugere pin discreto no `NavigationSystem`.

5. **`StoryEventSystem` (`window.StoryEventSystem`):**
   - Motor de **Heart Events** e **Cenas-Chave de Capítulo** (estilo *Stardew Valley*).
   - Avalia catálogo declarativo de eventos ao receber `scene:changed` ou `time:hourChanged`: checa cena atual, faixa horária/dia, `chapter`, `bond`/`npcBonds`, `storyFlags` e ausência em `completedEvents`.
   - Quando dispara: pausa movimento do jogador, executa posicionamento temporário de atores na cena (`castStaging`), roda o grafo multi-falante no `DialogueSystem v2` e, ao encerrar, restaura o estado normal do espaço e emite evento de conclusão.

6. **`WorldStateSystem` + Integração `PhoneSystem` / Diário:**
   - Registra **hotspots investigáveis** (mural da Associação, lousa da ESF, caixas/entulho na baixada, balcão da Vendinha) com interação única de `E`/toque e impacto visual progressivo no mapa (ex.: estágios da Horta `0..3`, cartazes da Assembleia na Pracinha, quadro de acolhimento na UBS).
   - Envia **mensagens reativas de grupo/privado** no `PhoneSystem` ligadas a eventos e escolhas (sem substituir encontros presenciais, funcionando como eco humano da comunidade).

---

## 9. Roadmap Priorizado e Realista (MVP v1 + Expansões)

A execução deve ser fatiada para entregar valor jogável e testável a cada etapa, evitando construir todo o conteúdo antes de validar os motores.

### Bloco A — MVP Executável do Modo História v1 (`H1` a `H4`)

#### Etapa H1 — Fundação Narrativa, `StoryState` & `DialogueSystem v2`
- **Objetivo:** estabelecer memória persistente, vínculos com todo o elenco central e conversas multi-falante sem regressão no jogo atual.
- **Sistemas incluídos:** `StoryState` + `SaveManager` v3 (migração v2 → v3), `npcBonds` (10 staff da UBS + Seu Zé, Tia Bete, Dona Carla), `DialogueSystem v2` (troca de `speaker` por nó, condições e efeitos) e primeira versão do `DialogueResolver`.
- **Experiência resultante para o jogador:** conversas com a equipe da UBS e lideranças acumulam vínculo real; diálogos conseguem alternar entre dois personagens na mesma cena e não ignoram escolhas recém-feitas.
- **Dependências:** nenhuma nova além dos módulos existentes em `Phase 2` (`EventBus`, `SaveManager`, `DialogueSystem`).
- **Critérios de conclusão:** saves v2 migram para v3 sem perda de progresso; grafo-teste multi-falante executa na UI e via teste automatizado; grafos-piloto e diálogos legados continuam funcionando 100%.

#### Etapa H2 — Motor de Missões, `StoryEventSystem`, Prólogo & Capítulo 1
- **Objetivo:** entregar o primeiro arco completo de gameplay narrativo do início ao clímax inicial na UBS.
- **Sistemas incluídos:** `QuestSystem`, `StoryEventSystem` (gatilhos por cena/hora + *cast staging* + registro em `completedEvents`), aba de Missões & Vínculos no Diário, ganchos narrativos no `PhoneSystem`, roteiro completo do **Prólogo (Cap 0)** + **Capítulo 1** + **2 primeiras Heart Events** (ex.: Joana na ESF e núcleo `H01`/`H04`).
- **Experiência resultante para o jogador:** o jogo começa como uma história clara e acolhedora na Vila Esperança; rotinas de visita alimentam investigações de bairro; Heart Events acontecem organicamente ao entrar nos lugares certos; o Cap 1 fecha com a cena de tensão na recepção da UBS.
- **Dependências:** Etapa `H1`.
- **Critérios de conclusão:** fluxo completo `Prólogo → Cap 1 → Cena da Recepção` jogável sem travamentos; Heart Events disparam uma única vez e respeitam pré-requisitos; `tests/verify_game.js` cobre ciclo completo de criação e conclusão de missão.

#### Etapa H3 — Meio de Campanha Vivo: Capítulos 2 e 3, Exploração & `WorldStateSystem`
- **Objetivo:** conectar descoberta no bairro, evolução física dos espaços comunitários e os dilemas morais centrais da campanha.
- **Sistemas incluídos:** `WorldStateSystem` (mudanças visuais em Horta/Associação/UBS/Pracinha + hotspots de pista), roteiro completo dos **Capítulos 2 e 3**, **4 arcos secundários interligados** (`Feira`, `Dominó`, `Vendinha`, `UBS Guichê/Limpeza`), **4+ Heart Events** de confiança média/alta e reações no grupo do celular.
- **Experiência resultante para o jogador:** explorar o bairro revela histórias ocultas; decisões éticas dividem ou aproximam moradores e equipe; a Horta e a UBS mudam de cara conforme o engajamento comunitário; a crise do Cap 3 coloca peso real nas escolhas.
- **Dependências:** Etapa `H2`.
- **Critérios de conclusão:** decisões-chave do Cap 2/3 gravam flags em `StoryState` que alteram concretamente falas subsequentes e `worldStates`; todos os hotspots são alcançáveis e persistidos; transição Cap 2 → Cap 3 validada por testes automatizados.

#### Etapa H4 — Clímax (Capítulo 4), Desfecho Modular & Modo Livre (Fechamento do MVP v1)
- **Objetivo:** concluir a campanha *"O Pulso da Vila Esperança"* com impacto emocional e liberar o pós-jogo contínuo.
- **Sistemas incluídos:** roteiro completo do **Capítulo 4** (preparação + cena coral da Assembleia/Mutirão na Pracinha dos Ipês), **`EndingAssembler` modular** (compõe o desfecho nos 4 pilares: UBS, Horta/Associação, Coesão das Famílias e Postura de Alex) e transição fluida para o **Modo Livre Pós-Campanha**.
- **Experiência resultante para o jogador:** cena final multi-personagem que espelha os vínculos e escolhas feitos durante semanas no bairro, seguida pela liberdade de continuar jogando no território transformado.
- **Dependências:** Etapa `H3`.
- **Critérios de conclusão:** campanha jogável do Cap 0 ao Epílogo; ao menos 2 combinações contrastantes de escolhas produzem variações verificadas no Epílogo; save pós-Epílogo entra em Modo Livre sem softlocks.

---

### Bloco B — Expansões Posteriores (`H5+`, Não Bloqueantes para o MVP v1)

#### Etapa H5 — Cobertura Total de Elenco & Memórias do Bairro
- **Objetivo:** aprofundar histórias pessoais de todas as casas e trabalhadores não protagonizados no arco principal do MVP v1.
- **Escopo:** Heart Events exclusivos para todas as 15 famílias (`H01`–`H15`) e todos os 10 profissionais da UBS (incluindo arcos próprios para Seu Oswaldo, Dona Sueli, Dra. Patrícia e Renan), além de pequenas lembranças/objetos afetivos guardáveis na `PLAYER_HOME`.

#### Etapa H6 — Eventos Sazonais, Festas Comunitárias & Crônicas Contínuas
- **Objetivo:** ampliar a rejogabilidade e a sensação de comunidade viva no pós-jogo.
- **Escopo:** eventos de calendário recorrentes na Pracinha dos Ipês (café comunitário, feira cultural/mutirão mensal), boletim da rádio comunitária comentando a semana vivida e pequenas variações climáticas/atmosféricas ligadas ao ritmo narrativo.

---

## 10. Riscos, Dependências e Critérios de Qualidade

### 10.1 Matriz de Riscos e Mitigações
| Risco | Impacto | Mitigação Concreta |
| :--- | :--- | :--- |
| **Explosão combinatória de roteiro/finais** | Atraso grave e pontas soltas sem teste | Usar estrutura de **Funil com Memória**: marcos convergentes por capítulo, reações locais por flag e Epílogo composto por pilares independentes. |
| **Simulação repetitiva atrasando a história** | Cansaço antes do Capítulo 2 | Aplicar *Soft Gating* (metas semanais atingíveis naturalmente), injetar contexto narrativo dentro das próprias visitas via `DialogueResolver` e garantir respiros cômicos à noite. |
| **Softlock por janela horária rígida** | Jogador fica preso sem achar NPC da missão | Janelas amplas em `ScheduleSystem`, fallback de agendamento/chamado pelo `PhoneSystem` e verificação automática de alcançabilidade nos testes. |
| **Regressão de compatibilidade `file://` ou Save v2** | Quebra ao abrir via `Jogar_ACS_RPG.bat` ou ao continuar jogo antigo | Manter 100% IIFEs globais (sem ES modules / `fetch`), migração testada `v2 → v3` no `SaveManager` e registro de scripts em `public/index.html` e `tests/verify_game.js`. |
| **Tom didático, panfletário ou miserabilista** | Perda de conexão humana e artificialidade | Revisão editorial por cena: garantir contradições reais, humor cotidiano, conflito entre pessoas bem-intencionadas e zero "lição de moral" nos diálogos. |

### 10.2 Critérios de Qualidade (Definition of Done do Modo História)
1. **Unidade Narrativa:** do Capítulo 0 ao 4, o jogador sempre sabe *o que está em jogo na Vila Esperança* mesmo enquanto escolhe livremente sua rotina do dia.
2. **Reatividade Verificável:** escolhas em dilemas centrais geram eco audível em falas subsequentes, mensagens no celular, estado físico de pelo menos um espaço comunitário e composição final do Epílogo.
3. **Zero Quebra da Base Existente:** todas as mecânicas da Fase 1 e Fase 2 (`PLAYER_HOME`, `UBS_INTERIOR`, `ESF_ROOM`, `VENDINHA`, `ASSOCIACAO`, `Horta`, `ScheduleSystem`, `PhoneSystem`, áudio, tablet/visitas) continuam operacionais e integradas.
4. **Confiabilidade Técnica:** `npm test` (`tests/verify_game.js`) ampliado progressivamente a cada etapa (`H1` → `H4`) mantendo **100% dos testes passando** após cada marco.

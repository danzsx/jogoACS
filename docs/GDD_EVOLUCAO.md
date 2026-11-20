# Game Design Document (GDD) — Evolução: *Território Vivo: Crônicas de um ACS*

> **Status:** Documento Vivo de Direção & Planejamento (Fonte de Verdade do Projeto)  
> **Gênero:** RPG 2D Narrativo / Cotidiano / Gestão Comunitária em Pixel Art  
> **Referência Estrutural:** *Graveyard Keeper* (arco longo com começo, meio e fim, teia de missões interdependentes, calendário semanal temático, dupla camada de recursos e transformação visível do território)  
> **Cenário & Tom:** Realismo humano, cotidiano brasileiro de comunidade periférica, calor humano, humor, dilemas reais do SUS e dignidade sem caricatura.

---

## 0. Diagnóstico da Base Atual

A leitura do projeto atual (`public/js/`, `tests/verify_game.js`, `FRAMEWORK.md`) mostra uma base técnica muito estável sobre a qual a evolução será construída — porém ainda estruturada como um **simulador de turno fechado de 5 dias**.

### Pontos Fortes a Preservar
- **Identidade visual e sensorial 16-bit:** Motor procedural em `public/js/pixelArt.js` com paleta quente, Y-sorting real, sombras, iluminação por horário/clima e retratos 48×48 expressivos.
- **Espaços jogáveis:** Overworld de 80×48 tiles (2560×1536 px) com a Vila Esperança, córrego, ponte de madeira e *Estrada do Sol* (`public/js/game.js`), além da **UBS Vila Esperança** (`UBS_INTERIOR`) e da **Sala ESF** (`ESF_ROOM`) visitáveis em `public/js/systems/ubsInterior.js`, com 10 profissionais e colegas ACS.
- **Elenco inicial consolidado:** 15 núcleos familiares em `public/js/data.js` e histórico longitudinal em `public/js/systems/narrative.js`, somados à equipe da UBS (vigia, escriturário, limpeza, médico, dois enfermeiros, fisioterapeuta e três colegas ACS).
- **Sistemas de campo funcionais:** Clima dinâmico (`SUNNY`, `HEATWAVE`, `RAIN`, `CLOUDY`), sombra das árvores, hidratação/energia, cachorros territoriais, focos de dengue, minimapa/GPS (`public/js/systems/navigation.js`) e paisagem sonora Web Audio (`public/js/audio.js`).
- **Engenharia disciplinada:** Namespaces globais compatíveis com `file://` (`Jogar_ACS_RPG.bat`) e `http://` (`server.js`), `EventBus`, `GameLoop` resiliente e `SaveManager` em `public/js/core/engine.js`, além de suíte automatizada (`npm test` via `tests/verify_game.js`, atualmente com 10 verificações).

### Limitações Atuais que Motivam Esta Evolução
1. **Campanha curta e cíclica (5 dias):** Meta fixa de `12/12` visitas diárias e reinício automático no Dia 5, sem conflito central nem conclusão dramática.
2. **Diálogos de turno único com spoilers:** As escolhas exibem tags que entregam a resposta óbvia (`Vínculo +20` vs `Vínculo -12`) e mantêm os moradores restritos a papéis clínicos.
3. **Ausência de progressão tangível:** Sem economia, melhorias de equipamento/casa, desbloqueios de habilidades ou transformação física do mapa.
4. **Pressão diária que inibe a exploração:** O corte obrigatório às `18:00` e a cota de 12 visitas por dia desestimulam explorar a UBS, conversar sem pressa ou viver o bairro à noite.
5. **Mapa estático e NPCs imóveis:** Moradores ficam parados diante das 15 casas (`3×5`) sem pontos de encontro comunitários (vendinha, pracinha, horta, associação) nem a própria casa do protagonista.
6. **Concentração de fluxo em `public/js/game.js`:** O orquestrador central (~2.500 linhas) acumula lógica de mundo, diálogos, modais e progressão de dia, exigindo modularização gradual.

---

## 1. Visão, Identidade e Diretrizes Inegociáveis

### Proposta Central
**Um RPG 2D narrativo de cotidiano, vínculos e reconstrução comunitária.**  
O protagonista não é um técnico externo batendo ponto: é um(a) **morador(a) da própria Vila Esperança** recém-efetivado(a) como Agente Comunitário de Saúde (ACS) na Microárea 04. O colete azul do SUS abre portas, expõe contradições entre necessidades reais e limites do serviço público e transforma o jogador em ponte viva entre pessoas que precisam umas das outras.

### O Diferencial no Gênero
- **Realismo sem fantasia:** Nada de magia, monstros ou sobrenatural. Os desafios são o calor de 37°C, o ônibus que não passa, o boato no grupo de mensagens do bairro, o vazamento no córrego, o remédio em falta na farmácia da UBS e a desconfiança acumulada por anos de promessas quebradas.
- **Estrutura *Graveyard Keeper* em solo brasileiro:** Metas grandes destravadas por cadeias de favores, alianças sociais, investigação, economia realista, rotina semanal temática e obras que modificam visualmente a Vila Esperança.
- **Simulação como alicerce, não como jaula:** A profissão de ACS ancora a rotina e a progressão, mas abre espaço para humor, vida noturna comunitária, conflitos de vizinhança e histórias humanas completas.

### Diretrizes Inegociáveis
1. **Zero fantasia ou sobrenatural.**
2. **Dignidade acima do drama gratuito:** A vulnerabilidade social aparece como contexto estrutural real, nunca como espetáculo da miséria; moradores têm personalidade, defeitos, sonhos, humor e agência.
3. **Sem simulador burocrático:** Procedimentos do SUS sustentam o significado das ações sem virar preenchimento tedioso de formulários.
4. **Profundidade > volume artificial:** Poucas atividades alternativas bem integradas que se alimentam mutuamente, em vez de tarefas repetitivas desconectadas.
5. **Compatibilidade técnica:** Manter funcionamento 100% em `file://` e `http://`, sem build step obrigatório, validado continuamente por `npm test`.

---

## 2. Estrutura Narrativa — *"O Futuro da Vila Esperança"*

### Premissa e Protagonista
- **Protagonista:** *Alex* (personalidade empática, trabalhadora, morador(a) da Vila Esperança que vivia de bicos até passar na seleção para ACS). A Microárea 04 passou **4 meses sem ACS fixo**, acumulando cadastros desatualizados, filas desordenadas e desconfiança com o postinho.
- **Moradia:** Uma casa simples perto da ponte de entrada da comunidade — onde acorda, prepara café, lê mensagens e descansa à noite.

### Conflito Central
Ao final da primeira semana, um ofício da gestão municipal chega à UBS: com base em cadastros defasados e no baixo acesso agravado pela ponte precária do córrego, a prefeitura estuda **reduzir a UBS Vila Esperança** a um posto avançado mínimo — retirando a equipe multiprofissional (eMulti, incluindo a fisioterapeuta Dra. Patrícia) e redirecionando parte do bairro para outra unidade distante 40 minutos de ônibus.

Não há um vilão caricato: o antagonismo nasce de **planilhas frias desconectadas da vida real**, falta de saneamento no córrego, desinformação circulando no grupo do bairro e desgaste mútuo entre comunidade e serviço público. Para defender e fortalecer a UBS até a **Vistoria e Audiência Pública**, o protagonista precisa atualizar o retrato real da comunidade, articular alianças inesperadas e tirar projetos coletivos do papel.

### Arco em 4 Atos (Campanha de ~4 a 6 semanas de jogo, sem prazo punitivo)

| Ato | Título | Semanas Tip. | Escopo Dramático e Viradas |
| :--- | :--- | :--- | :--- |
| **Ato I** | **Pé na Estrada de Terra** | Sem. 1 | Adaptação ao trabalho na UBS e Sala ESF; situações cotidianas e constrangedoras ao reencontrar vizinhos agora de colete do SUS. **Virada:** chegada do ofício ameaçando rebaixar a UBS e primeiros indícios de água turva/descarte no córrego. |
| **Ato II** | **A Teia da Vila** | Sem. 2–3 | Investigação e articulação em múltiplas frentes: mapear famílias "invisíveis" nos dados oficiais (inclusive à noite/no lazer), investigar o despejo irregular no córrego (uma pequena oficina sufocada pela falta de rede de esgoto), conter um boato viral no grupo do bairro e enfrentar o **dilema humano dos limites do SUS** (falta de medicamento/demora na regulação gera frustração e cobrança real de uma família que confiou no agente). |
| **Ato III** | **Mão na Massa e Mutirão** | Sem. 4–5 | Superado o choque de realidade com apoio da equipe ESF e dos vizinhos, a mobilização ganha corpo no mapa: laudo técnico da ponte com Dr. Cláudio e Jorge, revitalização da Pracinha dos Ipês, Horta Comunitária com Dona Dulce e Seu Tonho, e fortalecimento do Conselho Local de Saúde. Momentos leves e marcantes: nascimento da bebê Sofia (Bia), campeonato de dominó unindo Seu Tião e Lucas, bazar do coletivo de costura de Dona Neide. |
| **Ato IV** | **Audiência e Feira da Vila** | Sem. 6 | Dia da Vistoria e Audiência Pública no pátio da UBS. O resultado e o epílogo reagem às alianças construídas, vínculos e obras concluídas — moradores antes céticos defendem a UBS. **Desfecho & Pós-Jogo:** Festa comunitária jogável e abertura do **Modo Livre** para continuar cuidando do bairro. |

### Elenco Vivo (Pessoas Inteiras + Relações Cruzadas)
Os 15 núcleos familiares e os 10 profissionais da UBS/Sala ESF já existentes são aprofundados com vida própria, conflitos entre vizinhos e rotinas fora do trabalho:
- **Relações cruzadas entre moradores existentes:**
  - *Seu Tião (Casa 04)* e *Dr. Cláudio (Casa 10)* vivem em atrito por causa do cachorro Brutus e do muro; mediar essa rixa abre cenas cômicas e destrava o apoio técnico do engenheiro.
  - *Dona Neide (Casa 05)* articula um pequeno coletivo de costura com *Camila (Casa 03)* e *Dona Helena (Casa 09)* para gerar renda solidária.
  - *Lucas (Casa 13)* usa seu talento com edição de vídeo/imagem no celular para produzir informativos comunitários contra fake news e divulgar a audiência.
  - *Digão (Casa 11)* conhece atalhos, oficinas e peças usadas — ajuda o protagonista a restaurar uma bicicleta e fornece ferragens para os mutirões.
- **3 novos NPCs essenciais (em novos pontos comunitários da Fase 2):**
  1. **Seu Zé da Vendinha** (Mercearia & Padaria da esquina): comércio local, caderneta do bairro, café no balcão e termômetro das histórias da rua.
  2. **Tia Bete** (Associação de Moradores & Conselho Local): liderança comunitária pragmática, desconfiada de promessas vazias, decisiva na aprovação e organização de mutirões.
  3. **Dona Carla** (Coordenação Distrital — visitante em marcos da campanha): representa o olhar burocrático dos indicadores até ser confrontada pela mobilização concreta do território.

---

## 3. Loop Principal e Ritmo da Semana (Calibrado)

### A. Relógio e Blocos do Dia (`07:00` às `22:00`)
- **Velocidade do relógio:** **`1,6 min/s`** (cerca de 9 minutos reais por dia completo; sempre pausado em diálogos, minijogos e modais).
- **Três blocos complementares:**
  1. **Manhã (`07:00–12:00`):** Acordar na Casa do Protagonista, tomar café, ler o celular, passar na UBS (abre às `08:00`), visitar trabalhadores antes da saída e aproveitar a Feira na Terça.
  2. **Tarde (`12:00–18:00`):** Calor ou chuva de verão; visitas no bairro, grupos na UBS/Sala ESF, investigações e horta.
  3. **Fim de Tarde & Noite Comunitária (`18:00–22:00`):** A UBS encerra o expediente às `18:00`; o bairro ganha luzes quentes nas janelas e moradores trabalhadores retornam para casa ou circulam pela vendinha e pracinha.
- **Autonomia e descanso sem punição artificial:**
  - O jogador pode **dormir em sua casa a partir das `17:00`** (ou tirar um cochilo de 1h antes disso).
  - **Descansar em bancos do bairro (`bench`)** avança `1 hora` e recupera energia, permitindo esperar horários sem tédio.
  - Se ficar fora após **`22:30`**, o protagonista volta cansado para casa automaticamente (acorda no dia seguinte às `07:30` com energia reduzida — sem *Game Over*).

### B. Semana de 6 Dias Jogáveis + Virada de Domingo
Inspirada diretamente em *Graveyard Keeper*, cada dia da semana tem papel distinto no planejamento:

| Dia | Tema & Evento Semanal | Impacto no Gameplay |
| :--- | :--- | :--- |
| **Segunda** | **Alinhamento & Insumos (UBS / Sala ESF)** | Abre o quadro de prioridades semanais na Sala ESF; reposição (ou falta pontual) de insumos na farmácia da UBS. |
| **Terça** | **Feira Livre (Pracinha dos Ipês)** | Barracas de Seu Tonho e Dona Neide, ingredientes frescos mais baratos, conversas informais e notícias do bairro. |
| **Quarta** | **Grupos da UBS & Associação de Moradores** | Grupos da eMulti pela manhã; reunião com **Tia Bete** à tarde para aprovar projetos e mobilizações. |
| **Quinta** | **Roda de Dominó & Encontro na Praça** | Tarde/noite descontraída na Pracinha dos Ipês; moradores resistentes abaixam a guarda fora do contexto formal. |
| **Sexta** | **Fechamento e-SUS & Pagamento** | Sincronização semanal com Enfª Marina ou Terminal ESF libera o salário da semana; noite movimentada na Vendinha do Zé. |
| **Sábado** | **Dia Livre & Mutirão (Sem expediente na UBS)** | Dia inteiro dedicado a obras comunitárias, horta, cozinha, compras, reparos e missões pessoais. |
| **Domingo** | **Virada de Semana (Cena de Resumo)** | Cartão de balanço semanal (vínculos, visitas, despesas da casa, novidades do Grupo da Vila). *Nos clímax dos Atos III e IV, o Domingo torna-se jogável para a Audiência e a Festa.* |

### C. Meta Semanal Flexível da UBS
- Substitui a obrigação de `12/12 visitas/dia`.
- A UBS trabalha com **3 a 4 Prioridades Semanais** (no quadro da Sala ESF) + **Meta semanal confortável de ~15 visitas distribuídas entre Segunda e Sexta** (média de 3/dia, permitindo dias intensos de campo alternados com dias de investigação/lazer).
- Não atingir a meta na semana não gera *Game Over*: reduz apenas o bônus salarial de sexta, gera um diálogo realista de ajuste com a Enfª Marina e mantém o progresso narrativo aberto.

---

## 4. Economia em Duas Carteiras & Progressão

Para preservar a ética e o realismo da profissão (o ACS não paga obras públicas do próprio bolso), o sistema financeiro opera em **duas carteiras separadas**:

### Carteira 1 — Dinheiro Pessoal (`R$`)
*Foco: sustento, alimentação, equipamentos de campo e melhorias na própria casa.*
- **Fontes:**
  - **Salário Semanal (Sexta na UBS):** Base fixa de **R$ 350** + bônus de até **R$ 70** por prioridades cumpridas.
  - **Bicos opcionais de Sábado (limitados a 1x/semana):** Ajudar na organização da Vendinha do Zé ou na desmontagem da Feira (**R$ 40–60**), evitando *grind* infinito.
- **Custo de vida semanal (Domingo):** Despesa básica da casa (aluguel proporcional, luz, água) de **R$ 140/semana** — deixando **R$ 210 a R$ 280 livres** para escolhas reais de orçamento. Se faltar saldo no domingo, a conta fica pendente sem encerrar o jogo.
- **Onde gastar:**
  - *Alimentos e ingredientes* (`R$ 8–30` na Vendinha/Feira).
  - *Equipamentos de campo:* Garrafa Térmica Inox (`R$ 95`), Capa/Sombrinha Reforçada (`R$ 120`), Tênis de Caminhada (`R$ 180`), Mochila Ergonômica (`R$ 220`), Peças da Bicicleta Usada (`R$ 260` em etapas com Digão).
  - *Melhorias na casa:* Filtro de Barro (`R$ 110`), Fogão/Cafeteira (`R$ 190`), Ventilador & Colchão (`R$ 250`).
  - *Pequenos gestos de afeto* (`R$ 15–35`): café/bolo para a equipe ESF, rifas comunitárias, petiscos especiais.

### Carteira 2 — Fundo & Materiais do Mutirão (Coletivo)
*Foco: obras permanentes que transformam a Vila Esperança e a UBS.*
- **Fontes:** Alianças e mobilização (bazar da Dona Neide, doação técnica do Dr. Cláudio, apoio da Vendinha do Zé, cestas excedentes da Horta Comunitária, repasses articulados no Conselho Local).
- **Aplicação (via Associação de Moradores às Quartas / Execução aos Sábados):**
  - Reforma da **Ponte do Córrego** (passagem larga, sem lama, transitável de bicicleta).
  - Revitalização da **Pracinha dos Ipês** (sombras, bancos restauradores, espaço da Feira e Dominó).
  - Implantação da **Horta Comunitária** e **Sala de Grupos da UBS**.
  - Abertura de **atalhos seguros** no bairro após vacinação/cuidado dos cães.

### Árvore de Competências — *"Saberes do Território"*
Inspirada nos três tipos de pontos de *Graveyard Keeper*, sem abstrações fantasiosas:
- 💙 **Pontos de Vínculo** (escuta empática, mediações, dominó, eventos comunitários).
- 🩺 **Pontos de Campo** (visitas domiciliares, vigilância ambiental, articulação clínica na UBS).
- 🛠️ **Pontos de Mobilização** (mutirões, horta, reparos, reuniões na Associação).
Desbloqueiam habilidades passivas e novas abordagens (ex.: perceber pistas sutis em diálogos, menor gasto de energia sob calor, maior rendimento na cozinha/horta, destravar atalhos de negociação).

---

## 5. Atividades Alternativas Integradas (5 Pilares)

1. **Dominó na Pracinha (Minijogo Tático Rápido — 1 a 2 min):** Quintas à tarde/noite e Sábados. Tabuleiro pixel art com 5–6 pedras contra moradores; serve como ponte social para quebrar resistências, obter fofocas/pistas e recuperar energia.
2. **Cozinha Caseira & Preparo (8–10 receitas brasileiras):** Na Casa do Protagonista (café coado na garrafa, suco de maracujá/caju contra calor, chá de cidreira/gengibre contra fadiga na chuva, cuscuz/bolo de fubá como energia ou presente afetivo, biscoito canino caseiro).
3. **Horta Comunitária Compacta (8–12 canteiros):** Rápida (< 30s), regada automaticamente pela chuva, ciclo de 2–3 dias. Gera ingredientes, **Cestas Verdes** para famílias vulneráveis e reforço para o Fundo do Mutirão.
4. **Investigação Territorial (*"Fio da Meada"*):** Conectar 3 pistas observadas no mapa, relatos de moradores e mensagens no celular antes de decidir como abordar problemas complexos (vazamento, fake news, cadastros perdidos).
5. **Mutirões de Sábado & Pequenos Reparos:** Sequências curtas e cooperativas no local da obra com vizinhos trabalhando juntos para transformar o mapa de forma permanente.

---

## 6. Matriz de Evolução dos Sistemas

| Decisão | Sistemas |
| :--- | :--- |
| **Manter** | Movimentação 2D, Y-sorting, clique-para-andar, minimapa/GPS, paisagem sonora Web Audio, clima/sombra, UBS + Sala ESF visitáveis, `SaveManager` e suíte `npm test`. |
| **Reformular** | Diálogos para múltiplos turnos sem spoilers numéricos; meta diária rígida → meta semanal flexível; fim de turno às 18h → dia `07:00–22:00` com noite viva; rotinas estáticas → agendas por horário/dia. |
| **Expandir** | Mapa (Casa do ACS, Vendinha do Zé, Pracinha/Feira, Horta/Associação); separação entre **Tablet e-SUS** (trabalho) e **Celular Pessoal** (Grupo da Vila + Diário); UBS como hub de encaminhamentos e missões. |
| **Introduzir** | `SceneManager` genérico, `DialogueSystem` multi-turno, `QuestSystem` baseado em `EventBus`, Economia em duas carteiras (`R$` + Fundo do Mutirão), Saberes do Território, Bicicleta/Melhorias, Cozinha, Horta, Dominó e Projetos Comunitários. |

---

## 7. Roadmap de Implementação em 6 Fases

| Fase | Nome | Escopo Resumido | Dependências |
| :--- | :--- | :--- | :--- |
| **Fase 1** | **Fundação de RPG & Arquitetura** | `SceneManager` genérico, eventos de domínio no `EventBus`, **Casa do Protagonista** (`PLAYER_HOME`), semana contínua de 6 dias + Virada de Domingo, ciclo `07:00–22:00` (`1,6 min/s`) com noite iluminada, Meta Semanal + Prioridades, motor de diálogo multi-turno sem spoilers, `SaveManager` v2 + migração v1→v2. | Base atual |
| **Fase 2** | **Expansão Orgânica do Bairro & Rotinas** | Vendinha do Zé, Pracinha dos Ipês (Feira/Dominó), Área da Horta/Associação, 3 novos NPCs, agendas semanais de localização dos moradores, Celular Pessoal (Grupo da Vila + Diário). | Fase 1 |
| **Fase 3** | **Motor de Missões & Atos I–II** | `QuestSystem` declarativo no `EventBus`, arco completo dos Atos I e II (ofício da UBS, investigação do córrego, moradores invisíveis, boato, dilema do SUS) + 3 missões secundárias. | Fases 1 e 2 |
| **Fase 4** | **Economia, Competências & Progressão** | Carteira `R$` (salário, despesa de domingo, bicos limitados), loja na Vendinha/Feira, melhorias da casa, equipamentos do ACS, Saberes do Território e missão da Bicicleta. | Fases 1 e 2 |
| **Fase 5** | **Projetos Comunitários & Atividades** | Fundo/Materiais do Mutirão, obras que alteram visualmente o mapa (Ponte, Pracinha, Horta, Sala de Grupos), cozinha em casa, horta compacta e minijogo de Dominó. | Fases 2, 3 e 4 |
| **Fase 6** | **Atos III–IV, Clímax Reativo & Polimento** | Atos III e IV (Audiência Pública com finais reativos), Festa comunitária jogável, Modo Livre pós-campanha, balanceamento final de áudio, ritmo e testes. | Fases 3, 4 e 5 |

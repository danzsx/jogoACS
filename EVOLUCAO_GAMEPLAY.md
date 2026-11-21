# Diagnóstico e Plano de Evolução do Gameplay — *Território Vivo: Crônicas de um ACS*

> **Documento de Auditoria, Diagnóstico e Proposta de Evolução Sistêmica**  
> **Escopo:** Análise integral do código-base existente e plano incremental de evolução para um RPG 2D de exploração, investigação, planejamento e consequências sociais na comunidade brasileira de **Vila Esperança**.  
> **Restrição desta entrega:** Documento de diagnóstico e planejamento pré-implementação; **nenhum arquivo de código existente foi alterado nesta etapa**.

---

## 1. Mapeamento Arquitetural do Projeto Atual (Auditoria Técnica Real)

### 1.1 Identidade, Motor e Restrições de Execução
- **Título e Premissa:** *Território Vivo: Crônicas de um ACS* — RPG 2D top-down onde o protagonista (**Alex**) atua como Agente Comunitário de Saúde (ACS) na **Microárea 04 da Vila Esperança**.
- **Stack Técnica:** HTML5 Canvas + JavaScript Vanilla (ES6+, padrão IIFE expondo namespaces em `window.*`, sem bundler ou etapa de build).
- **Compatibilidade Dupla Obrigatória:**
  - Execução direta via protocolo `file:///` por meio de [Jogar_ACS_RPG.bat](file:///c:/Users/nathu/ACSRPG/Jogar_ACS_RPG.bat) (abre [public/index.html](file:///c:/Users/nathu/ACSRPG/public/index.html) em Edge/Chrome).
  - Servidor local Node.js em [server.js](file:///c:/Users/nathu/ACSRPG/server.js) (`npm start`, porta `3456`).
  - *Implicação arquitetural:* não utilizar `ES modules` (`import`/`export`) nem `fetch()` para dados locais; novos módulos devem seguir o padrão IIFE, ser declarados na ordem correta em [public/index.html](file:///c:/Users/nathu/ACSRPG/public/index.html) e incluídos no harness de [tests/verify_game.js](file:///c:/Users/nathu/ACSRPG/tests/verify_game.js).
- **Direção Visual e Sonora:** Pixel art 16-bit gerada proceduralmente em memória ([public/js/pixelArt.js](file:///c:/Users/nathu/ACSRPG/public/js/pixelArt.js)), Y-sorting unificado, ciclo de iluminação diurno/noturno (`07:00–22:30`), interface em madeira e pergaminho ([public/style.css](file:///c:/Users/nathu/ACSRPG/public/style.css)), síntese procedural Web Audio ([public/js/audio.js](file:///c:/Users/nathu/ACSRPG/public/js/audio.js)) e 5 composições `.ogg` gerenciadas por [public/js/systems/musicDirector.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/musicDirector.js).
- **Persistência:** `SaveManager` em [public/js/core/engine.js](file:///c:/Users/nathu/ACSRPG/public/js/core/engine.js) usando `localStorage` com `schemaVersion = 3` e migração automática `v1 → v2 → v3`.

### 1.2 Inventário Completo dos Sistemas Existentes

| Arquivo / Módulo | Responsabilidade Atual Observada | Estado & Limites Reais |
| :--- | :--- | :--- |
| [public/js/core/engine.js](file:///c:/Users/nathu/ACSRPG/public/js/core/engine.js) | `EventBus`, `GameLoop` resiliente, `InputManager`, `SaveManager` (`schemaVersion = 3`) e utilitários (`clamp`, `safeMod`). | Estável; `EventBus` já emite eventos de hora, dia, semana, visita, fala de NPC, escolha de diálogo, pista, dengue, cena e missão. |
| [public/js/data.js](file:///c:/Users/nathu/ACSRPG/public/js/data.js) | Mapa `80×56` tiles (`2560×1792` px na prática; comentário antigo cita `80×48`), 6 dias (`Seg.`–`Sáb.`) com `weatherSchedule` por hora, 15 famílias (`H01`–`H15`) em 4 arquétipos (`AMIGO`, `TRABALHADOR`, `TEIMOSO`, `PRIORITARIO`), 4 itens na mochila (`water`, `sunscreen`, `umbrella`, `treats`), 3 cães (`Trovão`, `Brutus`, `Fumaça`), 5 gatos (`Mingau`, `Paçoca`, `Bolinha`, `Sombra`, `Frajola`), 4 `dengueSpots`, árvores e props. | Dados ricos de perfil clínico e horários; `stubbornness` está definido por família, mas quase sem efeito sistêmico além de ser decrementado. |
| [public/js/game.js](file:///c:/Users/nathu/ACSRPG/public/js/game.js) | Orquestrador monolítico (~4.473 linhas / 176 KB): geração de tilemap, colisões, física, cães/gatos, visitas domiciliares, HUD, Tablet `[TAB]`, Mapa Tático `[M]`, Menu Principal, save/load, resumo semanal de domingo e renderização Y-sorted. | Alta concentração de responsabilidades; exige que novos sistemas fiquem em módulos desacoplados em `public/js/systems/`. |
| [public/js/systems/sceneManager.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/sceneManager.js) | Gerencia 6 cenas: `OVERWORLD`, `PLAYER_HOME`, `UBS_INTERIOR`, `ESF_ROOM`, `VENDINHA`, `ASSOCIACAO`. | Limpo e extensível; emite `scene:changed` para todo o jogo. |
| [public/js/systems/playerHome.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/playerHome.js) | Casa do ACS: despertar às `07:00`, cama (cochilo `1h` antes das `17:00`, dormir a partir das `17:00`), filtro de barro, café `1x/dia` (`+20` energia) e mesa `home_desk`. | `home_desk` hoje é apenas um atalho que abre a aba `mission` do Tablet e-SUS. |
| [public/js/systems/ubsInterior.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/ubsInterior.js) | UBS (`Seg–Sex`, `08:00–18:00`) e Sala ESF com 10 profissionais (`Seu Oswaldo`, `Renan`, `Dona Sueli`, `Dr. Henrique`, `Enfª Marina`, `Enf. Carlos`, `Dra. Patrícia`, `ACS Joana`, `ACS Tiago`, `ACS Rosana`), bebedouro, armário de insumos e terminal e-SUS. | Hub funcional de diálogos de equipe e reabastecimento gratuito; sem painel operacional de casos/campanhas. |
| [public/js/systems/communitySpaces.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/communitySpaces.js) | `VENDINHA` (`Seu Zé`, `07:00–21:30`), `ASSOCIACAO` (`Tia Bete`, `09:00–19:00`; Sáb manhã na Horta), `Dona Carla` na UBS (`Seg 08:30–12:00` e `Sex 14:00–17:30`), mural da Vendinha e Quadro de Projetos. | Espaços vivos prontos para receber eventos, investigação e cooperações; Quadro de Projetos ainda é informativo. |
| [public/js/systems/schedule.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/schedule.js) | Rotinas semanais fora de casa: Feira Livre (`Ter 07:30–14:00` — `H01`, `H03`, `H05`, `H14`), Associação (`Qua 14:00–18:30` — `H01`, `H07`), Espera UBS (`Seg/Qua 08:30–11:30` — `H12`, `H08`), Roda de Dominó (`Qui 15:00–21:00` e `Sáb 14:00–20:00` — `H04`, `H07`, `H11`, `H13`) e Vendinha (`18:30–21:00` — `H02`, `H06`, `H10`, `H11`). | Base excelente para encontros sociais, pistas cruzadas e planejamento de rota por janela de horário. |
| [public/js/systems/dialogue.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/dialogue.js) e [public/js/systems/dialogueResolver.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/dialogueResolver.js) | Engine multi-turno e multi-falante com `showHints = false` (sem spoilers por padrão), `evaluateConditions()`, `applyNarrativeEffects()`, 7 `PILOT_GRAPHS` (`H01`, `H04`, `H13`, `medico`, `acs_joana`, `npc_seu_ze`, `npc_tia_bete`, `esf_alinhamento_h1`) e adaptador legado. | `DialogueResolver` já resolve por prioridade (`Quest > Reação > Cap/Vínculo > Local > Legado`), facilitando injeção de investigações e eventos. |
| [public/js/systems/narrative.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/narrative.js) | `DAILY_DIALOGUES` para Dias 2–5 das 15 famílias (`safeMod(dayIndex, 5) + 1`), `visitHistory` e `flags`. | Textos bem escritos, porém estáticos após a Semana 1 e com estrutura de 1 turno (`EMPATHY` / `EDUCATE` / `AUTHORITARIAN`). |
| [public/js/systems/storyState.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/storyState.js) | Memória narrativa: `chapter` (`0..5`), `storyFlags`, `recentFlags` (TTL em dias), `posture` (`acolhimento`, `firmeza`, `articulacao`, `burocracia`), `npcBonds` (13 NPCs), `completedEvents`, `quests`, `worldStates`. | Infraestrutura sólida para estender com novos estados ou conviver com módulos irmãos persistidos no save `v4`. |
| [public/js/systems/quests.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/quests.js), [storyEvents.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/storyEvents.js) e [endingAssembler.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/endingAssembler.js) | Campanha principal (`q0_primeira_prancheta`, `q1_ecos_da_fila`, `q2_alem_do_prontuario`, `q3_sobrecarga_e_fratura`, `q4_mesa_posta_pracinha` + Epílogo Cap 5), 4 missões secundárias (`qs_sombra_baixada`, `qs_balanco_guiche`, `qs_canteiro_domino`, `qs_turno_noite`), abertura, 3 clímax, 7 Heart Events e compilador de final em 4 pilares. | Campanha completa e funcional, mas com passos lineares de contagem/ida-e-volta e sem categorias de investigação/planejamento/desafios. |
| [public/js/systems/worldState.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/worldState.js) | 5 pistas ambientais (`WORLD_CLUES`: `clue_mural_ubs`, `clue_baixada_entulho`, `clue_horta_bomba`, `clue_pracinha_banco`, `clue_caderno_vendinha`) e estados visuais (`hortaStage` `0..3`, `ubsMural`, `pracinhaStatus`). | Pistas entregam texto completo de imediato ao pressionar `[E]`, sem cruzamento de fontes nem contradições. |
| [public/js/systems/phone.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/phone.js) | Celular Pessoal `[C]` com abas `Grupo da Vila`, `Agenda da Semana` e `Contatos & Rotas` (pin de GPS). | Bom canal de alertas orgânicos do bairro; reage ao `EventBus`. |
| [public/js/systems/navigation.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/navigation.js) | Minimapa ao vivo, rastreador automático de objetivo, seta dourada no mundo, clique-para-andar e pin manual via Mapa Tático `[M]`. | O rastreador automático hoje pensa pelo jogador (sempre aponta a próxima casa aberta). |
| [public/js/systems/animations.js](file:///c:/Users/nathu/ACSRPG/public/js/systems/animations.js) | Efeitos cinemáticos de sono, cochilo, despertar e retorno noturno. | Integrado ao `game.js`; ainda não carregado pelo harness de testes. |
| [tests/verify_game.js](file:///c:/Users/nathu/ACSRPG/tests/verify_game.js) | Suíte automatizada de 33 testes de regressão e integridade via `vm` do Node.js. | Atualmente **falhando 33/33** devido a regressão no mock de DOM (detalhada na Seção 2.1). |

---

## 2. Diagnóstico Crítico: Problemas Técnicos e Limitações de Gameplay

### 2.1 Achados Técnicos e Regressões Reais Detectadas na Auditoria

Antes de adicionar novas mecânicas, a auditoria do código revelou inconsistências concretas que impactam a confiabilidade do projeto:

1. **Regressão na suíte automatizada (`npm test` falha 33/33 no estado atual):**  
   Ao executar `npm test` em [tests/verify_game.js](file:///c:/Users/nathu/ACSRPG/tests/verify_game.js), todos os 33 testes falham na criação do harness com `TypeError: Cannot read properties of undefined (reading 'classList')` em [public/js/game.js:3188](file:///c:/Users/nathu/ACSRPG/public/js/game.js#L3188) (`document.body.classList.add('main-menu-active')`), porque o DOM simulado em `createHarness()` não define `document.body` (além de não incluir `animations.js` na lista de scripts carregados e de `game.js` inicializar no Menu Principal com `inMainMenu = true` e `currentLocation = 'PLAYER_HOME'`, o que precisa estar alinhado com as asserções do Teste 1).
2. **Divergência de ID de Heart Event em `EndingAssembler`:**  
   Em [public/js/systems/endingAssembler.js:114](file:///c:/Users/nathu/ACSRPG/public/js/systems/endingAssembler.js#L114), o array `heartEventsDone` lista `'evt_heart_carla_escola'` (que não existe em `STORY_EVENTS`) e omite `'evt_heart_tiago_esf'`, implementado em [public/js/systems/storyEvents.js:762](file:///c:/Users/nathu/ACSRPG/public/js/systems/storyEvents.js#L762). Assim, o contador do epílogo nunca atinge `7/7`.
3. **Divergência de valor de estado em `MusicDirector`:**  
   Em [public/js/systems/musicDirector.js:57](file:///c:/Users/nathu/ACSRPG/public/js/systems/musicDirector.js#L57), o listener verifica `key === 'pracinhaStatus' && value === 'REVITALIZADA'`, enquanto [quests.js:652](file:///c:/Users/nathu/ACSRPG/public/js/systems/quests.js#L652) e [storyEvents.js:321](file:///c:/Users/nathu/ACSRPG/public/js/systems/storyEvents.js#L321) definem `'mobilizada'`, `'tensa'` e `'celebracao'`.
4. **Inconsistência de atalho documentado:**  
   [README.md:68](file:///c:/Users/nathu/ACSRPG/README.md#L68) documenta `P` para abrir/fechar o Celular, enquanto [public/index.html:23](file:///c:/Users/nathu/ACSRPG/public/index.html#L23) e [public/js/game.js:642](file:///c:/Users/nathu/ACSRPG/public/js/game.js#L642) utilizam `C`.
5. **Resquícios da estrutura antiga de meta diária:**  
   `openUBSModal()` legado em [public/js/game.js:2222](file:///c:/Users/nathu/ACSRPG/public/js/game.js#L2222) e textos em [narrative.js:1223](file:///c:/Users/nathu/ACSRPG/public/js/systems/narrative.js#L1223) / [ubsInterior.js:1400](file:///c:/Users/nathu/ACSRPG/public/js/systems/ubsInterior.js#L1400) ainda exibem `12 visitas` ou `dailyVisits/dailyGoal` em vez da meta semanal de `15` visitas.
6. **Atributos subutilizados no modelo de dados:**  
   - `stubbornness` está presente nas 15 famílias em [public/js/data.js](file:///c:/Users/nathu/ACSRPG/public/js/data.js) e é decrementado em `resolveVisitChoice()`, mas não bloqueia, filtra nem altera comportamentos de jogo.  
   - `storyState.posture` (`acolhimento`, `firmeza`, `articulacao`, `burocracia`) acumula pontos, mas hoje apenas muda um rótulo na aba História e um parágrafo do epílogo.
7. **Ausência de Caderno próprio:**  
   Na Casa do ACS ([public/js/systems/playerHome.js:294](file:///c:/Users/nathu/ACSRPG/public/js/systems/playerHome.js#L294)), a estação `[E] Caderno do ACS` abre diretamente a aba `mission` do Tablet e-SUS.

### 2.2 Diagnóstico de Game Design: Por que o Gameplay Atual Ainda Soa Passivo

Analisando a experiência real minuto a minuto do jogador, identificam-se **8 gargalos centrais**:

1. **Baixa agência nas visitas e conversas:**  
   Tirando os 3 grafos-piloto de famílias (`H01`, `H04`, `H13`), 12 famílias e os 60 diálogos de `DAILY_DIALOGUES` operam no esquema de **turno único com resposta previsível** (`EMPATHY` = melhor ganho, `EDUCATE` = médio, `AUTHORITARIAN` = punição). O jogador raramente precisa interpretar contexto, lembrar informações anteriores ou adaptar a abordagem à personalidade do interlocutor.
2. **Investigação sem dedução nem fontes conflitantes:**  
   As 5 pistas de `WorldStateSystem` têm marcadores `[?]` explícitos no mapa e entregam a conclusão pronta no texto (`note: Pista Territorial...`). Não existem casos com informação incompleta, versões contraditórias entre morador, vizinho e UBS, pistas secundárias de contexto nem escolha ativa de estratégia de resolução.
3. **Planejamento terceirizado ao GPS automático:**  
   `NavigationSystem.resolveObjective()` já calcula e aponta a casa prioritária/aberta mais próxima. O jogador quase não precisa decidir ordem de visitas, conciliar janelas curtas (como `H02` até `09h45` ou `H11` `11h15–14h45`), equilibrar distância/calor ou organizar a manhã de `07:00–08:00` antes da abertura da UBS.
4. **Tablet e Caderno sem papéis estratégicos distintos:**  
   O Tablet (`#tablet-overlay`) funciona como painel passivo de leitura e pins unitários; falta integração operacional com campanhas, demandas priorizadas, encaminhamentos com a equipe e plano do dia. E o Caderno de campo não existe como ferramenta de síntese e raciocínio.
5. **Relacionamento unidimensional (`bond` isolado):**  
   Personagens de personalidades opostas (ex.: *Dr. Cláudio `H10`*, *Seu Tião `H04`*, *Lucas `H13`*, *Tia Bete*) respondem à mesma lógica linear de "escolher empatia = +bond", e um vínculo alto não desbloqueia ações cooperativas tangíveis no território (intermediação com vizinhos, apoio logístico, alertas ou participação prática em ações).
6. **Comunidade estática fora das missões da história principal:**  
   Entre a conclusão de um passo narrativo e outro (ou após o Capítulo 4 no Modo Livre), o bairro repete rotinas fixas. Não há **eventos dinâmicos** independentes (como alagamento pós-chuva, falta temporária de insumo na UBS, boato no grupo da vila, mutirão espontâneo ou atraso de turno) exigindo priorização.
7. **Ausência de progressão mecânica do protagonista:**  
   Do Dia 1 à Semana 5, Alex caminha, visita, bebe água e aperta `[E]` com exatamente as mesmas capacidades. Faltam competências reais que transformem a maneira como o jogador investiga, planeja, medeia conflitos e conduz abordagens difíceis.
8. **Missões apoiadas em contadores e vaivém:**  
   Vários passos de `quests.js` dependem de limiares numéricos simples (`weeklyVisits >= 2`, `>= 4`, `>= 6`, `cluesFound.length >= 2`, `dengueClearedCount >= 2`) ou de falar com um personagem para receber o próximo marcador. Falta variedade estrutural entre missões narrativas, investigativas, de planejamento, secundárias e desafios opcionais.

---

## 3. Sistemas a Preservar Integralmente (Contratos Inegociáveis)

Para evoluir o jogo sem destruir sua identidade nem quebrar o que já funciona bem:

- **Identidade realista brasileira e tom humano:** zero fantasia, zero poderes sobrenaturais, zero caricatura; humor de esquina, dignidade comunitária e contradições reais do SUS e do território.
- **Estética e atmosfera 16-bit:** renderização em `pixelArt.js`, Y-sorting, paleta *Stardew-style* de madeira e pergaminho, iluminação por horário e direção musical em `MusicDirector`.
- **Todas as 6 cenas jogáveis e o mapa `80×56`:** `OVERWORLD`, `PLAYER_HOME`, `UBS_INTERIOR`, `ESF_ROOM`, `VENDINHA`, `ASSOCIACAO`, além de `Pracinha dos Ipês` e `Terreno da Horta`.
- **Elenco e fauna completos:** as 15 famílias (`H01`–`H15`), os 10 profissionais da UBS/ESF, `Seu Zé`, `Tia Bete`, `Dona Carla`, os 3 cães e os 5 gatos.
- **Liberdade de horário (`07:00–22:30`) e não-simulação burocrática:** o jogador continua livre para visitar moradores fora do expediente (inclusive à noite ou sábado), descansar em bancos/casa e jogar sem *Game Over* punitivo.
- **Diálogos sem spoilers por padrão (`showHints = false`):** preserva-se a leitura interpretativa das escolhas, mantendo a opção de dicas pedagógicas no Tablet para fins educativos.
- **Campanha Prólogo → Capítulos 1–4 → Epílogo/Modo Livre:** todo o conteúdo existente de `quests.js`, `storyEvents.js`, `narrative.js` e `endingAssembler.js` permanece funcional, com **migração segura de saves (`v3 → v4`)**.

---

## 4. Proposta de Evolução Sistêmica

A proposta organiza 7 sistemas interconectados + a reformulação das missões em torno de um princípio único: **toda atividade no território deve envolver leitura de contexto, decisão tática e consequência perceptível**.

```mermaid
flowchart TD
    DYN["Eventos Dinâmicos\n(Clima, UBS, Boato, Mutirão)"] -->|geram demandas e alteram rotinas| PLN["Planejamento & Tablet e-SUS\n(Rota do Dia, Urgências, Campanhas)"]
    DYN -->|abrem anomalias| INV["Sistema de Investigação\n(Casos, Contradições, Abordagens)"]
    REL["Relacionamento Multidimensional\n(Confiança, Receptividade, Estilo, Cooperação)"] <-->|modula acesso, fontes e ajuda| INV
    PLN -->|execução em campo e visitas preparadas| REL
    INV -->|pistas parciais e notas| CAD["Caderno de Campo\n(Casos, Moradores, Cruzamento de Pistas)"]
    CAD -->|destrava perguntas [Evidência]| INV
    CAD -->|revela preferências e vínculos| REL
    CMP["Competências do ACS\n(Comunicação, Investigação, Organização,\nMediação, Educação em Saúde)"] -->|desbloqueiam opções, slots e ações| PLN
    CMP -->|desbloqueiam abordagens e 3ª via| INV
    CMP -->|suavizam atritos e potencializam aliados| REL
    MIS["Missões Categorizadas (5 tipos)\n& Desafios Opcionais"] <-->|integram e recompensam| DYN
    MIS <--> PLN
    MIS <--> INV
    MIS <--> REL
```

### 4.1 Sistema de Planejamento (`PlannerSystem`)
- **Objetivo:** Dar propósito estratégico à preparação do dia (especialmente na janela matinal `07:00–08:00` antes da UBS abrir) e às escolhas de deslocamento, sem punir quem preferir explorar livremente.
- **Mecânica Principal — Fila de Demandas & Rota do Dia:**
  - Cada dia gera e atualiza uma lista de **Demandas Ativas** vindas da meta semanal, encaminhamentos da UBS, eventos dinâmicos e casos investigativos, classificadas em 3 faixas:
    1. **Urgente / Com Prazo** (ex.: foco pós-chuva, falta de insumo, retorno pós-alta ou evento com duração limitada);
    2. **Janela de Horário** (ex.: trabalhador com janela curta `07:30–09:45` ou `11:15–14:45`, Dona Carla Seg/Sex, Feira de Terça, Associação de Quarta);
    3. **Acompanhamento / Livre** (famílias flexíveis, investigações abertas, horta).
  - Na **Mesa de Casa** (`home_desk`, renovada como estação real de planejamento/caderno) ou na aba **Operações** do Tablet, o jogador pode montar sua **Rota do Dia** escolhendo até `3` paradas ordenadas (expansível até `5` com a competência *Organização*).
  - **Sinalização de Viabilidade (sem jogar pelo usuário):** ao montar a rota, o sistema mostra distância estimada entre paradas, previsão climática por faixa de horário (`weatherSchedule` já existe em `data.js`) e disponibilidade *conhecida* (ou `???` se ainda não descoberta).
  - **Recompensa sem punição:**
    - Cumprir uma parada dentro da Rota do Dia dá o estado **"Visita Preparada"** (economia de tempo de conversa/energia no deslocamento e maior ganho inicial de receptividade/clareza de contexto).
    - Desviar da rota para seguir uma pista inesperada ou evento na rua **não aplica penalidade**; o jogador apenas reordena prioridades quando quiser.
- **Valorização da janela `07:00–08:00`:**
  - Acordar em `PLAYER_HOME`, revisar mensagens da madrugada no Celular, cruzar pistas no Caderno, montar a rota do dia e já sair às `07:15` para pegar trabalhadores antes da saída (`H02` até `09h45`, `H06` até `09h00`, `H03` até `09h15`) ou conversar na Vendinha (`07h00`).

### 4.2 Evolução do Tablet e-SUS (`#tablet-overlay` + Mapa Tático `[M]`)
O Tablet deixa de ser um menu informativo e passa a operar como **Central Operacional de Território**:
- **5 Abas Integradas ao Visual Madeira/Pergaminho:**
  1. **`📋 Operações & Rota`:** montagem e acompanhamento da **Rota do Dia** (`1 → 2 → 3`), demandas classificadas por urgência, previsão climática das próximas horas e resumo rápido do expediente da UBS.
  2. **`📢 Campanhas & UBS`:** campanhas em curso na microárea (ex.: Vacinação Infantil, Saúde do Homem, Controle Vetorial, Acompanhamento de Crônicos), **Eventos Dinâmicos ativos** e **Canal de Encaminhamento com a UBS** (demandas solicitadas por Dr. Henrique, Enfª Marina, Enf. Carlos e Dra. Patrícia e retorno de campo).
  3. **`🎯 Missões & História`:** missões categorizadas (*Narrativas*, *Investigativas*, *Planejamento*, *Secundárias*, *Desafios Opcionais*), capítulo atual e postura predominante.
  4. **`🏠 Famílias & Horários`:** tabela já existente enriquecida com **botão `+ Rota`**, indicador de receptividade/pendência clínica e busca/filtro rápido (Pendentes hoje / Prioridades / Horário desconhecido).
  5. **`🌟 Competências & Guia`:** painel real de evolução das **5 Competências do ACS** (barra de prática, nível atual e próximo desbloqueio mecânico), além das preferências de acessibilidade (`showHints`).
- **Integração no Mapa Tático (`[M]`):** desenha a sequência numerada (`① → ② → ③`) da Rota do Dia sobre o mapa da Vila Esperança, destacando ícones de eventos dinâmicos e zonas de sombra/calor.

### 4.3 Evolução do Caderno de Campo (`NotebookSystem` — `#notebook-overlay`, tecla `[J]`)
Para separar claramente a ferramenta institucional (**Tablet e-SUS `[TAB]`**) da ferramenta pessoal de raciocínio do ACS (**Caderno de Campo `[J]`** — também acessível pela mesa de casa `home_desk`):
- **Design Anti-Burocracia:** não é um inventário de itens nem um bloco de notas livre que obrigue digitação. É um **fichário visual de conhecimento vivo** com 3 abas enxutas:
  1. **`🔍 Casos & Pistas`:** lista cada Caso Investigativo ativo, agrupando as pistas coletadas por origem (*Morador*, *Vizinho/Família*, *UBS/Registro*, *Observação de Campo*) e destacando **lacunas** e **contradições**. Inclui a ação **"Cruzar Pistas"** (combinar 2 evidências coerentes revela uma **Hipótese/Descoberta** que destrava diálogos especiais).
  2. **`👥 Perfis & Relações`:** dossiê humano das 15 famílias e contatos-chave — anotações reais descobertas em conversa, **Estilo de Comunicação Preferido/Avesso** (`???` até ser deduzido pela experiência ou competência), nível de **Receptividade**, **Vínculo** e **Cooperações** disponíveis.
  3. **`📓 Crônica da Vila`:** linha do tempo curta e legível dos acontecimentos, consequências de decisões e mutações do território.
- **Impacto Direto nos Diálogos:** toda evidência ou hipótese sintetizada no Caderno habilita novas escolhas de diálogo marcadas com `[📓 Evidência]` ou `[💡 Hipótese]` nas conversas relevantes — sem aparecerem se o jogador ainda não investigou.

### 4.4 Sistema de Investigação ("Fio da Meada" — `InvestigationSystem`)
Transforma o trabalho territorial em investigação social e sanitária crível, com **informações parciais, múltiplas fontes, ruído contextual e decisões de abordagem**:

- **Estrutura de um Caso Investigativo:**
  1. **Sinal Inicial (Anomalia):** um desencontro real (ex.: morador sumiu do acompanhamento, queda de vacinação na rua, conflito travando a vigilância, afastamento silencioso).
  2. **Coleta Multi-Fonte (Não-Linear):** o jogador pode buscar pistas em qualquer ordem entre:
     - O próprio morador (com respostas parciais ou defensivas dependendo da receptividade);
     - Vizinhos e espaços informais (Feira, Roda de Dominó, Vendinha, Associação);
     - Registros e equipe da UBS (Terminal e-SUS, recepção com Renan, Sala de Vacina com Carlos, consultório com Dr. Henrique);
     - Observação ambiental no mapa (`WorldStateSystem` ampliado e pontos contextuais).
  3. **Pistas Relevantes vs. Secundárias + Contradições:** nem toda pista resolve o caso; algumas apenas contextualizam o bairro (enriquecendo a narrativa), enquanto duas pistas específicas entram em **contradição visível** no Caderno (ex.: *"No sistema da UBS consta recusa voluntária"* × *"No caderno de recados da Vendinha o morador perguntou como pegar receita após as 19h"*).
  4. **Dedução no Caderno:** ao cruzar as pistas certas, o jogador desbloqueia a **Síntese do Caso** e novas opções de diálogo com os envolvidos.
  5. **Escolha de Abordagem (Múltiplas Soluções Coerentes):** sem "opção certa óbvia" e "errada caricata". Cada abordagem resolve o problema por um caminho distinto, mudando vínculos, tempo gasto e o estado futuro da comunidade.

- **4 Casos Investigativos Projetados para o Elenco Real:**

| Caso | Situação / Anomalia | Fontes Cruzadas | Contradição Central | Abordagens Possíveis e Consequências |
| :--- | :--- | :--- | :--- | :--- |
| **Caso 1: A Receita que Não Chega** | Dona Neide (`H05`) e Marcos (`H02`) somem da UBS e aparecem como "abandono" no relatório. | `H05`, `H02`, `Renan`/`Enfª Marina` (UBS), `Seu Zé` (Vendinha) + pista na prateleira. | UBS registra "falta sem justificativa", mas a Vendinha mostra pedido de horário pós-18h e dificuldade financeira com receita/insumo. | **A.** Articular reserva de encaixe/receita estendida na UBS (agradece equipe e trabalhadores, reduz folga do guichê). **B.** Criar ponto de recado/orientação na Vendinha com Seu Zé (fortalece esquina, exige acompanhamento de Marcos). **C.** Visita compartilhada com Dr. Henrique/eMulti em casa (alta eficácia clínica, consome janela da equipe). |
| **Caso 2: O Boato da Feira** | Procura por vacina cai na Rua das Acácias; mães demonstram receio repentino. | `Camila (H03)`, `Dona Dulce (H01)`/`Seu Tonho (H14)` na Feira, `Enf. Carlos` (Sala de Vacina), `Grupo da Vila` no celular. | Áudio viral diz que "lote da UBS deu reação grave em 4 crianças", mas o registro da câmara fria de Carlos e as famílias da rua não registram nenhum caso — o áudio veio de outro município há 2 anos. | **A.** Roda aberta de conversa na Feira de Terça com Enf. Carlos e Dona Dulce (restaura confiança coletiva). **B.** Vídeo curto explicativo gravado com `Lucas (H13)` para o Grupo da Vila (valoriza Lucas e alcança jovens/pais). **C.** Atendimento porta a porta individual (mais lento, porém constrói vínculo profundo em `H03`). |
| **Caso 3: O Muro e o Cachorro** | Rixa entre `Seu Tião (H04)` e `Dr. Cláudio (H10)` impede vistoria no quintal e deixa `Brutus` mais agitado. | `H04`, `H10`, `Dona Helena (H09)`, `Seu Oswaldo` (UBS) + pista na calçada/baixada. | Tião acusa Cláudio de jogar água suja perto do muro; Cláudio acusa o cão de Tião e o lixo da esquina — na verdade um cano/drenagem quebrado na curva da rua é que alaga o muro dos dois. | **A.** Mediação na Roda de Dominó/Pracinha unindo os dois em torno do problema comum. **B.** Envolver Dr. Cláudio com laudo técnico na Associação e acalmar Tião via Seu Raimundo (`H07`). **C.** Resolver cada casa separadamente (mantém a paz imediata sem gerar cooperação entre os dois). |
| **Caso 4: O Silêncio dos Ipês** | `Lucas (H13)` volta a se fechar no quarto e `Seu Tonho (H14)` evita até a feira após um mal-entendido de saúde. | `H13`, `H14`, `Dona Lourdes (H12)`, `Dra. Patrícia`/`Dr. Henrique` (UBS), pista na Pracinha. | Ambos afirmam "estar tudo bem, só ocupados", mas Lourdes viu Lucas desistir na porta da UBS por fila cheia e Tonho esconde tontura com medo de proibirem seu trabalho na horta. | **A.** Integrar ambos à atividade prática da Horta/Pracinha com Dra. Patrícia (sem cara de consulta formal). **B.** Pactuar escuta protegida no fim da tarde na UBS com acolhimento prévio. **C.** Construir rede de apoio com Dona Lourdes e Tia Bete (foco no suporte comunitário gradual). |

### 4.5 Sistema de Relacionamento Multidimensional (`RelationshipSystem`)
Evolui o `fam.bond` e o `storyState.npcBonds` de uma barra única para um sistema com **4 variáveis vivas que alteram o gameplay**:

1. **Confiança (`bond`, `0–100` — já existente):** memória de longo prazo da relação.
2. **Receptividade Atual (`receptivity`, `0–100`):** estado momentâneo da disposição do morador em abrir informações ou cooperar.
   - Influenciada diretamente por `stubbornness` (dando uso real ao atributo existente em `data.js`), horário/local (trabalhadores ficam mais receptivos na Vendinha/noite do que na saída apressada), eventos dinâmicos (boatos reduzem receptividade) e escolhas incompatíveis recentes.
3. **Preferência de Comunicação (`preferredStyle` / `averseStyle`):**  
   Cada personagem passa a ter afinidades reais entre 4 abordagens de diálogo (`escuta`, `pratica`, `tecnica`, `articulacao`):
   - *Seu Tião (`H04`)* e *Seu Tonho (`H14`)*: preferem `pratica` / humor cotidiano; perdem receptividade com discurso `tecnica` frio ou cobrança direta.
   - *Dr. Cláudio (`H10`)* e *Dona Carla*: preferem `tecnica` / fatos objetivos e transparência; reagem mal a conversa vaga.
   - *Lucas (`H13`)*, *Bia (`H08`)* e *Dona Helena (`H09`)*: preferem `escuta` sem pressa; fecham-se diante de pressa ou comparação.
   - *Dona Dulce (`H01`)*, *Seu Raimundo (`H07`)*, *Tia Bete* e *Seu Zé*: valorizam `articulacao` comunitária e reciprocidade.
4. **Cooperação Territorial (`cooperationPerks`):**  
   Alcançar Confiança + Receptividade desbloqueia **ações concretas no mapa e na estratégia**:
   - **Intermediação Social:** pedir a *Dona Dulce (`H01`)* ou *Seu Raimundo (`H07`)* para acompanhar ou mandar recado a um vizinho resistente reduz permanentemente `stubbornness` daquele núcleo.
   - **Informação de Campo:** *Digão (`H11`)* e *Seu Zé* revelam antecipadamente mudanças de rotina e demandas emergentes no Celular/Caderno.
   - **Produção Comunitária:** *Lucas (`H13`)* ajuda a conter boatos no Grupo da Vila; *Dona Neide (`H05`)* e *Tia Bete* mobilizam braços em mutirões e campanhas; *Dr. Cláudio (`H10`)* apoia diagnósticos de infraestrutura.

### 4.6 Sistema de Eventos Dinâmicos (`DynamicEventsSystem`)
Acontecimentos com duração (`1` a `3` dias ou janela horária), condições coerentes de ativação, presença física no mundo/Tablet/Celular e desfecho variável:

| Evento Dinâmico | Gatilho Coerente | Duração & Local | Gameplay Envolvido e Consequências |
| :--- | :--- | :--- | :--- |
| **1. Acúmulo Pós-Chuva na Baixada** | Dia seguinte a horário de `RAIN` (ex.: Qua → Qui). | `2 dias` • Rua dos Ipês / Baixada | Gera criadouros temporários extras e pedido de Dona Lourdes/Tia Bete; ignorar reduz receptividade da rua e aumenta pressão da vigilância; articular limpeza + drenagem melhora o bairro. |
| **2. Falta Pontual de Medicamento na UBS** | Início de semana (Seg ou Qua, a partir da Sem. 2). | `2 dias` • UBS + Casas Crônicas (`H01`, `H04`, `H05`, `H09`) | Aviso no mural/Enfª Marina; o jogador precisa identificar no Tablet quem depende daquele insumo e decidir como priorizar (remanejamento, receita alternativa com Dr. Henrique, apoio solidário ou orientação de intervalo). |
| **3. Onda de Boatos no Grupo da Vila** | Aleatório controlado após Semana 1 ou escolha tensa na UBS. | `2 dias` • Celular + Feira/Vendinha | Receptividade cai em famílias sensíveis; investigar a fonte no território + responder com evidência ou ajuda de aliados encerra o boato antes do fim do prazo. |
| **4. Mudança de Turno / Imprevisto de Ônibus** | Dias úteis aleatórios com condição de clima ou trânsito. | `1 dia` • Trabalhadores (`H02`, `H03`, `H06`, `H11`) | Altera temporariamente a janela de um morador e avisa por pista/celular, exigindo reajustar a Rota do Dia. |
| **5. Mutirão Comunitário Espontâneo** | Sábado ou Quarta (quando `tia_bete_ally` ou `hortaStage >= 1`). | Janela `09:00–13:00` • Horta / Pracinha | Oportunidade cooperativa de trabalho conjunto que fortalece múltiplos vínculos de uma vez, avança estado visual da Horta/Pracinha e gera pontos de *Mediação/Educação*. |
| **6. Tensão / Demanda na Pracinha** | A partir da Semana 2 se houver rixa não mediada ou cobrança distrital. | Janela `15:00–19:00` • Pracinha / UBS | Cena dinâmica ou encontro com múltiplos moradores onde escolher ignorar, aplicar regra rígida ou mediar produz impacto real na receptividade local. |

### 4.7 Progressão e Competências Reais (`CompetenciesSystem`)
Substitui a passividade de `storyState.posture` por **5 Competências Reais do ACS** (Níveis `1` a `5`, evoluindo por ações concretas via `EventBus` — visitas bem conduzidas, cruzamento de pistas, cumprimento de rotas planejadas, mediações e ações educativas — sem qualquer elemento fantástico):

1. **Comunicação & Escuta:**  
   - *Nv. 2:* Revela automaticamente após 1 conversa se o estilo escolhido agradou ou desagradou no Caderno.  
   - *Nv. 3:* Reduz em 35% a perda de receptividade ao errar abordagem.  
   - *Nv. 4:* Desbloqueia opção de diálogo **"Quebrar Gelo / Escuta Qualificada"** com moradores de `stubbornness >= 60`.
2. **Investigação Territorial:**  
   - *Nv. 2:* Sinaliza no Caderno quando duas pistas pertencem ao mesmo caso.  
   - *Nv. 3:* Destaca pistas ambientais sutis e desbloqueia pergunta de aprofundamento em vizinhos/staff.  
   - *Nv. 4:* Permite identificar automaticamente inconsistências em fichas da UBS no Terminal e-SUS.
3. **Planejamento & Organização:**  
   - *Nv. 2:* Aumenta a **Rota do Dia** de `3` para `4` paradas.  
   - *Nv. 3:* Visitas dentro da Rota consumem menos tempo (`15 min` em vez de `20 min`) e menos energia.  
   - *Nv. 4:* Aumenta a Rota para `5` paradas e exibe alerta antecipado de conflito de horário no Tablet.
4. **Mediação & Articulação:**  
   - *Nv. 2:* Libera solicitações de **Cooperação** a moradores aliados (`H01`, `H07`, `H11`, `H13`).  
   - *Nv. 3:* Desbloqueia opções de **"Mediação de Terceira Via"** em conflitos e eventos dinâmicos.  
   - *Nv. 4:* Amplia bônus de vínculo coletivo em reuniões da Associação e mutirões.
5. **Educação & Vigilância em Saúde:**  
   - *Nv. 2:* Vistorias de dengue e baixada levam metade do tempo e geram pista de prevenção.  
   - *Nv. 3:* Desbloqueia argumentos educativos contextualizados à cultura local nos diálogos (dobrando impacto contra boatos).  
   - *Nv. 4:* Campanhas da UBS alcançam mais moradores simultaneamente na Feira e na Pracinha.

---

## 5. Reformulação do Sistema de Missões, Dificuldade e Game Loop

### 5.1 Cinco Categorias Claras de Missões (`QuestSystem` Evoluído)
Toda missão passa a ser estruturada explicitamente com: **Categoria**, **Contexto Narrativo**, **Objetivo Claro**, **Obstáculos Reais**, **Decisão Relevante**, **Consequência** e **Recompensa Significativa** (habilidade, cooperação, mudança territorial ou acesso narrativo — nunca apenas placar vazio).

| Categoria | Papel no RPG | Exemplos Concretos no Projeto |
| :--- | :--- | :--- |
| **1. Missões Narrativas** | Conduzem Prólogo e Capítulos 1–4, transformam UBS/Horta/Pracinha e oferecem dilemas morais centrais. | `q0`–`q4` preservadas, enriquecidas para aceitar pistas do Caderno e abordagens ligadas às competências em vez de meros contadores de visita. |
| **2. Missões Investigativas** | Exigem circulação multi-fonte, cruzamento de evidências no Caderno e escolha de resolução entre alternativas coerentes. | *Caso 1: A Receita que Não Chega*; *Caso 2: O Boato da Feira*; *Caso 3: O Muro e o Cachorro*; *Caso 4: O Silêncio dos Ipês*. |
| **3. Missões de Planejamento** | Testam gestão de tempo, janelas de disponibilidade, clima e prioridade sob restrição realista. | *"Cobertura do Turno Estendido"* (visitar `H02`, `H06`, `H11` dentro de suas janelas em 1 dia usando a Rota); *"Ronda de Prioridades antes da Auditoria"* (conciliar famílias de alto risco + devolução na UBS antes das `18:00` sem exaustão). |
| **4. Missões Secundárias** | Exploram arcos individuais e conexões entre moradores/staff sem pressa de capítulo. | As 4 atuais (`qs_sombra_baixada`, `qs_balanco_guiche`, `qs_canteiro_domino`, `qs_turno_noite`) + novas centradas em famílias pouco exploradas (`H09` Dona Helena & Vovô Joaquim, `H08` Pré-natal da Bia, `H15` 1ª Semana do Theo). |
| **5. Desafios Opcionais** | Metas de maestria sistêmica para jogadores que dominam os sistemas (sem punir quem ignorar). | *"Semana Sem Faltas"* (fechar semana com 100% das prioridades + vínculo >= 65%); *"Detetive da Vila"* (resolver caso identificando contradição sem ajuda de dicas); *"Zero Desgaste"* (cumprir rota de 4 paradas em dia de `HEATWAVE` sem baixar hidratação abaixo de 40%). |

### 5.2 Curva de Dificuldade Orgânica (Complexidade Situacional > Repetição)
- **Semana 1 (Descoberta e Fundamentos):** território legível, foco em conhecer rotinas, aprender o Caderno e montar rotas curtas de 2–3 paradas; primeiros sinais de tensão na UBS.
- **Semana 2 (Concorrência de Demandas e Estilos):** entram os primeiros **Casos Investigativos** com pistas incompletas, preferências de comunicação passam a cobrar atenção real e surgem **Eventos Dinâmicos** pontuais (boato ou pós-chuva).
- **Semana 3+ (Articulação sob Escassez e Múltiplos Atores):** demandas simultâneas com prazos curtos (ex.: falta de insumo na UBS no mesmo dia de mudança de turno de trabalhador e atrito de vizinhança), exigindo usar **Cooperações** de aliados, **Competências** evoluídas e escolhas de priorização com trade-offs honestos.
- **Epílogo / Modo Livre (Pós-Cap. 4):** campanha contínua com eventos dinâmicos recorrentes, casos remanescentes e desafios opcionais.

### 5.3 Novo Game Loop Jogável (Referência Flexível, Não-Obrigatória)
1. **07:00 — Despertar & Briefing em Casa:** Ler notificações no Celular (`[C]`), consultar pistas/contradições no Caderno (`[J]`) e revisar demandas na Mesa/Tablet (`[TAB]`).
2. **Planejamento Estratégico:** Selecionar 3–5 paradas na **Rota do Dia** considerando janelas de horário, clima previsto e urgências (ou partir direto para explorar livremente).
3. **07:15–08:00 — Janela Pré-UBS:** Aproveitar a primeira hora para trabalhadores que saem cedo (`H02`, `H03`, `H06`), tomar café na Vendinha ou investigar pistas matinais.
4. **Abertura da UBS (08:00+):** Checar Mural/Terminal e-SUS, alinhar campanhas e encaminhamentos com a equipe (`Dr. Henrique`, `Enfª Marina`, `Enf. Carlos`, `Dra. Patrícia`) e coletar pistas clínicas de casos.
5. **Exploração, Investigação e Relacionamento em Campo:** Executar visitas adaptando a abordagem à personalidade e receptividade do morador; usar `[📓 Evidência]` no diálogo; acionar cooperação de aliados quando necessário.
6. **Imprevistos & Eventos Dinâmicos:** Lidar com acúmulo pós-chuva, boato, falta de insumo ou encontro informal na Feira (`Ter`), Associação (`Qua`) ou Dominó (`Qui/Sáb`), decidindo o que priorizar e o que reagendar.
7. **Síntese no Caderno:** Cruzar novas pistas descobertas, revelar contradições e registrar perfis de comunicação.
8. **Fechamento no Fim da Tarde / Noite (`18:00–22:00`):** Visitar trabalhadores noturnos (`Vendinha` / casas à noite), participar de encontros comunitários, revisar metas na UBS (se antes das 18h) ou descansar em casa para consolidar competências e avançar o território.

---

## 6. Análise de Conflitos Potenciais e Reaproveitamento de Código

| Risco / Conflito Técnico Identificado | Causa Raiz no Código Atual | Solução de Arquitetura Segura |
| :--- | :--- | :--- |
| **Colisão de prioridades em `DialogueResolver`** | Hoje `resolveActiveQuestGraph()` vem primeiro, seguido de reação, capítulo/vínculo e legado. Novos diálogos de **Investigação**, **Eventos Dinâmicos** e **Evidências do Caderno** podem competir pelo mesmo NPC. | Padronizar uma ordem determinística no `DialogueResolver`: **1. Evento Climático de História (`StoryEvents`) → 2. Passo de Quest/Evento Dinâmico Urgente → 3. Nó de Caso Investigativo aberto para aquele NPC → 4. Injeção de opções `[📓 Evidência]` / `[Cooperação]` sobre o grafo base da conversa** (permitindo investigar sem bloquear visitas normais). |
| **Conflito entre GPS automático e Rota Planejada (`NavigationSystem`)** | `resolveObjective()` assume automaticamente a casa mais próxima quando não há pin manual. | Inserir prioridade logo após cenas internas e alerta crítico de hidratação: **se houver Rota do Dia ativa com próxima parada pendente e sem pin manual, `NavigationSystem` guia para o próximo passo da Rota**, com botão rápido para alternar ou pausar rota. |
| **Crescimento excessivo de `game.js` (~4.473 linhas)** | Toda UI de Tablet, Mapa, HUD e lógica de visita reside em `game.js`. | Manter `game.js` como orquestrador fino. Criar módulos dedicados em `public/js/systems/`: `relationships.js`, `notebook.js`, `investigation.js`, `planner.js`, `competencies.js`, `dynamicEvents.js`, comunicando-se via `EventBus`. |
| **Quebra de saves existentes (`schemaVersion = 3`)** | Jogadores atuais possuem saves `v3` em `localStorage`. | Evoluir `SaveManager` em `engine.js` para `schemaVersion = 4` com `migrateV3ToV4(v3)` inicializando defaults limpos de Caderno, Relacionamentos, Investigações, Planejamento, Competências e Eventos Dinâmicos sem perder capítulo, famílias, inventário nem flags. |
| **Quebra do modo offline (`file:///`) ou dos testes `vm`** | Scripts carregados via `<script>` em `public/index.html` e lista hardcoded em `tests/verify_game.js`. | Manter IIFE pura sem módulos ES e atualizar sincronizadamente `index.html` e `tests/verify_game.js` em cada etapa incremental. |
| **Sobrecarga de atalhos e modais simultâneos** | `closeOverlays()` hoje fecha lista fixa de IDs. | Centralizar registro de overlays (`#notebook-overlay` incluído) em `closeOverlays()` e limpar `input.clear()` sempre que qualquer modal abrir. |

### Oportunidades Diretas de Reaproveitamento
- **`ACSEngine.EventBus`:** já possui os eventos centrais para alimentar Caderno, Competências, Planejamento e Eventos Dinâmicos sem acoplar módulos.
- **`DialogueSystem` (multi-falante + `evaluateConditions` + `applyNarrativeEffects`):** já suporta condições por flag/vínculo/capítulo e efeitos estruturados — basta estender `evaluateConditions` para ler `hasClue`, `hasHypothesis`, `minCompetency` e `minReceptivity`.
- **`WorldStateSystem` (`WORLD_CLUES`) e `ScheduleSystem`:** fornecem coordenadas, cenas e horários prontos para abrigar pistas de casos e eventos dinâmicos sem recriar mapa.
- **Identidade visual CSS (`.wood-panel`, `.tablet-frame`, `.tab-btn`, `.pin-btn`):** o Caderno de Campo e as novas abas do Tablet reutilizam integralmente os componentes visuais existentes em [public/style.css](file:///c:/Users/nathu/ACSRPG/public/style.css).

---

## 7. Plano de Implementação Incremental (Priorizado por Impacto × Custo)

Cada etapa é autocontida, preserva 100% da jogabilidade entre entregas e exige validação automatizada (`npm test`) + revisão sob a ótica do jogador antes de avançar à etapa seguinte.

| Etapa | Escopo Incremental | Impacto no Jogador | Risco / Custo | Arquivos Envolvidos (Previstos) |
| :--- | :--- | :--- | :--- | :--- |
| **E0 — Estabilização & Baseline** | Corrigir harness DOM (`document.body`, `animations.js`) em `tests/verify_game.js` até atingir `33/33 PASS`; corrigir `evt_heart_tiago_esf` em `endingAssembler.js`, `pracinhaStatus` em `musicDirector.js`, atalho `C` em `README.md`, resquícios de meta diária (`12` → `15`) e preparar `SaveManager` v4 (`migrateV3ToV4`). | Alto (confiança e base limpa) | Baixo | `tests/verify_game.js`, `endingAssembler.js`, `musicDirector.js`, `README.md`, `engine.js`, `game.js`, `narrative.js`, `ubsInterior.js` |
| **E1 — Caderno de Campo & Relacionamento Multidimensional** | Criar `NotebookSystem` (`[J]` + `home_desk`), UI `#notebook-overlay`, `RelationshipSystem` (Receptividade ligada a `stubbornness`, Estilos de Comunicação preferidos/avessos, `CooperationPerks`) e adaptação progressiva das 15 famílias e líderes. | Muito Alto (conversas ganham leitura humana e consequência) | Médio | `systems/relationships.js`, `systems/notebook.js`, `dialogue.js`, `dialogueResolver.js`, `index.html`, `style.css`, `playerHome.js`, `game.js` |
| **E2 — Sistema de Investigação ("Fio da Meada")** | Criar `InvestigationSystem`, cruzar pistas multi-fonte no Caderno (contradições + síntese de hipóteses), injetar opções `[📓 Evidência]` em diálogos e implementar os **4 Casos Investigativos** completos com múltiplas abordagens. | Máximo (transforma exploração e conversa em descoberta real) | Médio-Alto | `systems/investigation.js`, `notebook.js`, `worldState.js`, `dialogueResolver.js`, `ubsInterior.js`, `communitySpaces.js` |
| **E3 — Planejamento Estratégico & Evolução do Tablet e-SUS** | Criar `PlannerSystem` (Demandas por urgência, Rota do Dia `3–5` paradas, bônus de Visita Preparada sem punição), evoluir abas do Tablet (`Operações & Rota`, `Campanhas & UBS`), ligar `NavigationSystem` à rota e desenhar rota `①→②→③` no Mapa Tático. | Muito Alto (decisão tática e manhã `07h–08h` significativa) | Médio | `systems/planner.js`, `navigation.js`, `playerHome.js`, `game.js`, `index.html`, `style.css` |
| **E4 — Progressão & Competências Reais do ACS** | Criar `CompetenciesSystem` (5 competências ligadas a ações reais e `posture`), destravando slots de rota, pistas de contradição, abordagens diplomáticas com teimosos, mediação 3ª via e ações educativas ampliadas. | Alto (sensação tangível de evolução de RPG) | Baixo-Médio | `systems/competencies.js`, `storyState.js`, `dialogue.js`, `planner.js`, `relationships.js`, `game.js` |
| **E5 — Eventos Dinâmicos no Território** | Criar `DynamicEventsSystem` com os 6 arquétipos de eventos (pós-chuva, falta de insumo, boato, mudança de turno, mutirão relâmpago, tensão localizada), sinais no mapa/Celular/Tablet e resolução com impacto no mundo. | Alto (comunidade viva fora das quests principais) | Médio | `systems/dynamicEvents.js`, `phone.js`, `schedule.js`, `game.js` |
| **E6 — Missões Categorizadas (5 tipos), Desafios Opcionais & Balanceamento** | Classificar e expandir `QuestSystem` para as 5 categorias (*Narrativas*, *Investigativas*, *Planejamento*, *Secundárias*, *Desafios Opcionais*), adicionar missões de planejamento/secundárias para núcleos pouco usados (`H08`, `H09`, `H15`) e rodar revisão completa de ritmo/dificuldade. | Alto (coesão total do RPG do Prólogo ao Modo Livre) | Médio | `systems/quests.js`, `storyEvents.js`, `endingAssembler.js`, `tests/verify_game.js` |

---

## 8. Critérios de Qualidade e Validação (Ótica do Jogador + Gate Técnico)

### 8.1 Checklist de Design por Incremento
Nenhuma nova mecânica será considerada pronta apenas por funcionar tecnicamente; cada etapa deve passar pelas 6 perguntas de experiência do jogador:
1. **Diversão:** O que torna esta atividade gostosa de jogar (ex.: descobrir uma contradição ou encaixar 3 visitas numa manhã apertada) em vez de tarefa automática?
2. **Decisão:** Que escolha não-óbvia o jogador precisa fazer aqui (entre abordagens, prioridades, rotas ou uso de tempo)?
3. **Estratégia:** Existe ganho real ao ler o clima, o horário, o perfil do morador e os recursos disponíveis?
4. **Descoberta:** O jogador está conectando pistas e entendendo a comunidade, ou apenas seguindo um marcador amarelo?
5. **Profundidade vs. Complexidade:** A interface permanece leve, legível e livre de microgerenciamento burocrático?
6. **Consequência Perceptível:** O mundo, o Caderno, a receptividade dos moradores e as falas seguintes refletem de forma clara o caminho escolhido?

### 8.2 Gate Técnico Contínuo (`npm test`)
- **Etapa E0:** restaurar `33/33` testes aprovados na suíte atual.
- **Etapas E1–E6:** cada novo módulo (`NotebookSystem`, `RelationshipSystem`, `InvestigationSystem`, `PlannerSystem`, `CompetenciesSystem`, `DynamicEventsSystem`, `QuestSystem` categorizado) deve receber testes dedicados em [tests/verify_game.js](file:///c:/Users/nathu/ACSRPG/tests/verify_game.js) cobrindo fluxo completo de gameplay, injeção em diálogos, ausência de bloqueios impossíveis (*softlock*) e round-trip de persistência no `SaveManager` v4.

# Escopo Detalhado — Fase 1: Fundação de RPG & Arquitetura

> **Documento de Execução Futura** (referência complementar a [GDD_EVOLUCAO.md](GDD_EVOLUCAO.md))  
> **Objetivo da Fase 1:** Reestruturar a fundação arquitetônica e o ritmo temporal de *Território Vivo* para transformar o protótipo de turno fixo em um RPG 2D contínuo por semanas, com Casa do Protagonista, noite comunitária, meta semanal flexível e motor de diálogo multi-turno — **mantendo 100% da estabilidade atual e compatibilidade com `file://` e `http://`**.

---

## 1. Fronteira Clara de Escopo

### O que ENTRA na Fase 1
1. **Arquitetura de Cenas (`SceneManager`) + Eventos de Domínio no `EventBus`.**
2. **Casa do Protagonista (`PLAYER_HOME`)** no Overworld (exterior) e como novo ambiente visitável (interior).
3. **Calendário Contínuo (Semana de 6 dias jogáveis + Virada de Domingo), Relógio `07:00–22:00` (`1,6 min/s`) e Noite Comunitária.**
4. **Funcionamento realista da UBS (`08:00–18:00`, Segunda a Sexta)** + descanso em bancos do bairro + retorno cansado às `22:30` sem *Game Over*.
5. **Meta Semanal Flexível (`15` visitas/semana) + Quadro de Prioridades da Semana** (substituindo a meta rígida de 12 visitas/dia).
6. **Motor de Diálogo Multi-Turno (`DialogueSystem`)** sem spoilers numéricos nas escolhas, compatível com todos os diálogos existentes + conjunto piloto de 5 conversas multi-turno.
7. **Persistência `SaveManager` v2** com migração automática de saves `v1` e ampliação da suíte automatizada em `tests/verify_game.js`.

### O que NÃO entra na Fase 1 (Reservado às Fases 2–6)
- Novos prédios comunitários (Vendinha do Zé, Pracinha/Feira, Associação/Horta) e os 3 novos NPCs (**Fase 2**).
- Deslocamento automático de moradores por vários pontos do bairro e Celular Pessoal (**Fase 2**).
- `QuestSystem` completo e campanha dos Atos I–IV (**Fases 3 e 6**).
- Dinheiro (`R$`), lojas, melhorias compráveis, Saberes do Território e Bicicleta (**Fase 4**).
- Cozinha com receitas, Horta cultivável, Minijogo de Dominó e Mutirões de obra (**Fase 5**).

---

## 2. Entregáveis Detalhados (1.1 a 1.6)

### 1.1 Arquitetura de Cenas (`SceneManager`) & Eventos no `EventBus`

Atualmente `public/js/game.js` alterna entre `'OVERWORLD'` e os dois cômodos em `public/js/systems/ubsInterior.js` (`'UBS_INTERIOR'`, `'ESF_ROOM'`) com desvios condicionais diretos. Para comportar a Casa do Protagonista agora e os novos espaços da Fase 2 em diante, extraímos uma camada limpa:

- **Novo módulo `public/js/systems/sceneManager.js` (`window.SceneManager`):**
  - Mantém o registro uniforme de todas as cenas (`OVERWORLD`, `UBS_INTERIOR`, `ESF_ROOM`, `PLAYER_HOME`), sendo `UBSInteriorSystem` responsável pela definição/renderização das duas salas da UBS e um novo registro/definição para `PLAYER_HOME` (ou provedor de interiores compartilhado).
  - Centraliza a transição com fade suave, som de porta (`window.sfx.door()`), posicionamento do jogador no spawn, ajuste imediato da câmera e bloqueio automático do guarda-sol em ambientes fechados.
  - Delega de forma polimórfica para a cena ativa:
    - `collides(px, py)`
    - `checkNearbyInteractions()` e `triggerInteraction()`
    - `draw(ctx)` e `drawMinimap(ctx, W, H)`
    - `getBounds()` (limites de movimento e clique-para-andar)
- **Contratos de Eventos no `window.ACSEngine.EventBus`:**
  Padronizar a emissão dos seguintes eventos para que futuros sistemas (`QuestSystem`, conquistas, estatísticas) se conectem sem acoplar em `game.js`:
  - `scene:changed` `{ from, to }`
  - `time:hourChanged` `{ weekNumber, dayOfWeek, hour }`
  - `day:started` `{ weekNumber, dayOfWeek }`
  - `day:ended` `{ weekNumber, dayOfWeek, reason }` (`'SLEEP' | 'EXHAUSTION' | 'LATE_NIGHT'`)
  - `week:ended` `{ weekNumber, weeklyVisits, weeklyGoal, prioritiesCompleted, avgBond }`
  - `visit:completed` `{ familyId, choiceType, bond, ok }`
  - `npc:talked` `{ npcId, roleKey, scene }`
  - `dialogue:choice` `{ entityId, nodeId, choiceIndex, intent }`

---

### 1.2 A Casa do Protagonista (`PLAYER_HOME`)

Reforça desde o minuto 1 a premissa de que o ACS **mora dentro da comunidade que atende**.

- **Localização no Overworld (`80×48` tiles):**
  - Lote acolhedor logo após cruzar a ponte de madeira da *Estrada do Sol*, à entrada da Vila Esperança: **`tx: 22, ty: 21`** (porta voltada para o Sul em direção à Estrada do Sol, longe do córrego `cols 17..18` e longe da Av. da Saúde `cols 25..28`).
  - *Ajuste pontual de cenário:* A árvore oliveira atualmente em `(22 * 32, 18 * 32)` em `public/js/data.js` deve ser deslocada poucos tiles para o lado (ex.: quintal lateral ou margem oeste) para não sobrepor o telhado da casa.
  - Sprite exterior exclusivo em `public/js/pixelArt.js`: casa modesta de alvenaria clara, telhado de barro, pequena varanda com cadeira/vaso, placa discreta e janela que acende ao entardecer.
  - Entrada interativa na porta: `[E] Entrar em Casa` (sempre acessível a qualquer hora do dia/noite).
- **Interior `PLAYER_HOME` (`18×13` tiles):**
  - Layout acolhedor em pixel art com quarto/sala integrados, cozinha simples de canto, janela olhando para fora, tapete e mesa de trabalho.
  - **Estações interativas obrigatórias:**
    1. **Cama:**
       - Entre `07:00` e `16:59`: `[E] Cochilar 1h (+25 Energia)` (útil para passar tempo ou recuperar fôlego antes de visitas noturnas).
       - A partir de `17:00`: `[E] Dormir e Encerrar o Dia` (avança para o próximo dia às `07:00`, ou aciona a Virada de Domingo se for Sábado).
    2. **Filtro de Barro:** `[E] Beber água & encher garrafa` (hidrata 100% e completa a garrafa gratuitamente).
    3. **Mesa / Caderno do ACS:** `[E] Resumo Semanal & Prioridades` (mostra progresso da semana atual, prioridades e dicas de ritmo; ponto onde o Celular/Diário se integrará na Fase 2).
    4. **Cantinho do Café / Fogão:** `[E] Tomar café coado (1x/dia, +20 Energia)` — já cria o espaço físico e visual que abrigará a cozinha caseira da Fase 5.
    5. **Porta de Saída:** `[E] Sair para a Vila Esperança` (posiciona o jogador na porta exterior em `OVERWORLD`).

---

### 1.3 Calendário Contínuo, Ciclo `07:00–22:00` e Funcionamento Realista da UBS

- **Novo Modelo Temporal:**
  - `weekNumber`: inteiro começando em `1` (contínuo, sem reiniciar na Semana 1 ao fim dos 5 dias antigos).
  - `dayOfWeek`: `0` (Segunda) a `5` (Sábado) — 6 dias jogáveis por semana + cartão de **Virada de Domingo** após dormir no Sábado.
  - `timeMinutes`: inicia todo dia às `07:00` (`420`) dentro de `PLAYER_HOME`.
  - `timeSpeed`: ajustado de `2.4` para **`1.6` minutos de jogo por segundo real**.
  - Ciclo climático semanal: mapear os padrões climáticos já existentes em `ACS_DATA` para os 6 dias da semana com variação natural entre semanas (mantendo Sol Ameno, Sol 37°C, Nublado e Chuva).
- **Horário de Funcionamento da UBS (`08:00–18:00`, Segunda a Sexta):**
  - Ao tentar entrar na UBS antes das `08:00`, após as `18:00` ou durante o **Sábado**, a porta exibe uma mensagem contextual clara (`🏥 UBS fechada — funciona Seg a Sex, das 08h às 18h`).
  - Se o jogador estiver dentro da UBS (`UBS_INTERIOR` ou `ESF_ROOM`) quando o relógio bater `18:00`, Seu Oswaldo / Enfª Marina exibe um aviso cordial de encerramento do expediente e conduz o jogador para a saída externa sem perda de progresso.
- **Noite Comunitária (`17:30–22:30`) e Iluminação:**
  - Estender `drawTimeAndWeatherLighting` em `game.js` para transição suave após `17:30`: entardecer dourado → crepúsculo azul-índigo acolhedor entre `19:00` e `22:30` (preservando legibilidade total do mapa e personagens).
  - Casas continuam com janelas acesas quando há moradores ou após `16:30`.
  - `public/js/audio.js`: estender o som de grilos noturnos (`hourFloat >= 16.75`) para acompanhar todo o período noturno até `22:30`.
  - **Horários Noturnos de Moradores Trabalhadores:** Atualizar as janelas em `data.js` para que famílias trabalhadoras (ex.: Marcos, Camila, Jorge, Rodrigo, Fernanda) também possam ser encontradas no período `18:00–21:00`, dando utilidade prática imediata à noite livre já na Fase 1.
- **Controle de Tempo e Segurança Sem *Game Over*:**
  - **Descansar em Bancos (`bench`):** Interagir com `[E]` nos bancos do bairro avança `60 minutos` e recupera `+25 Energia` (nunca passa das `22:00`).
  - **Limite Noturno (`22:30`):** Ao atingir `22:30` fora de casa, aviso cordial de exaustão pelo horário e transição automática para `PLAYER_HOME`, encerrando o dia e acordando às `07:30` com `75%` de energia.
  - **Virada de Domingo (Sábado → Domingo → Segunda da Semana N+1):** Ao encerrar o Sábado, exibe o **Modal de Balanço Semanal** (visitas realizadas vs. meta semanal, prioridades atendidas, evolução do vínculo médio, horários mapeados e retrospectiva dos dias) com botão para iniciar a próxima Segunda-feira às `07:00`.

---

### 1.4 Meta Semanal Flexível & Quadro de Prioridades da Semana

- **Substituição da Meta Diária Rígida:**
  - `weeklyGoal = 15` visitas na semana (Segunda a Sábado), com `weeklyVisits` e `visitedThisWeek` para contabilizar quantas famílias diferentes foram acompanhadas na semana, mantendo `visitedToday` para evitar visitas clínicas duplicadas no mesmo dia.
  - O turno não é mais encerrado automaticamente por "bater 12 visitas": o jogador controla quando ir para casa dormir.
- **Prioridades da Semana (3 a 4 famílias):**
  - A cada início de semana (ou dia 1), o sistema seleciona **4 famílias prioritárias** (combinando perfis de risco/vínculo baixo, pendentes da semana anterior ou foco temático da semana).
  - Visíveis no **Tablet e-SUS** (aba Missão da Semana & tabela de famílias), no **Minimapa / Mapa Tático** (marcador destacado), no **Quadro da Sala ESF** e com etiqueta discreta acima da casa.
- **Novo Papel do e-SUS na UBS (Enfª Marina & Terminal ESF):**
  - Em qualquer dia útil (`Seg–Sex`), sincronizar o e-SUS registra e valida as visitas realizadas sem forçar o fim do dia.
  - Na **Sexta-feira** (ou após completar a meta semanal), sincronizar fecha oficialmente o relatório semanal da UBS com feedback da Enfª Marina e registro de conclusão de meta (preparando o terreno para o pagamento do salário na Fase 4).
- **Atualização do HUD & Navegação:**
  - Relógio no canto superior direito passa a exibir `Sem. 1 • Seg.` (ou `Sáb.`), status discreto da UBS (`UBS Aberta` / `UBS Fechada`), `Visitas Sem.: X/15` e `Vínculo: Y%`.
  - `NavigationSystem` atualizado para priorizar **Famílias Prioritárias em casa**, depois **outras famílias pendentes na semana** e **Casa do Protagonista** quando estiver tarde (`>= 20:30`) ou com energia muito baixa.

---

### 1.5 Motor de Diálogo Multi-Turno (`DialogueSystem`) e Remoção de Spoilers

Substitui o modelo rígido de "1 saudação + 1 escolha com delta explícito" por conversas humanas em múltiplos turnos.

- **Novo módulo `public/js/systems/dialogue.js` (`window.DialogueSystem`):**
  - Suporta estrutura em nós (`nodes`):
    ```
    {
      startNode: 'abertura',
      nodes: {
        abertura: { text, note, choices: [{ text, intent, next, condition, effects }] },
        seguimento: { text, note, choices: [...] },
        desfecho: { text, isEnd: true, effects }
      }
    }
    ```
  - **Adaptador Retroativo 100% Compatível:** Se um diálogo de `data.js`, `narrative.js` ou `ubsInterior.js` estiver no formato legado (`greeting` + `choices` + `reply`), o `DialogueSystem` o converte em tempo real para um fluxo de 2 nós (`abertura → resposta`), garantindo que todas as 15 famílias nos dias 1–5 e os 10 profissionais da UBS continuem funcionando sem quebrar nada.
- **Remoção de Spoilers Numéricos nas Escolhas:**
  - Por padrão (`showDialogueHints = false`), os botões de escolha **não revelam** `+20 Vínculo`, `-12` ou `❌ Punitiva`. Em vez disso, exibem tags neutras e naturais de postura/ação (ex.: `💬 Escutar com calma`, `🩺 Orientar cuidado`, `🤝 Fazer combinado`, `➡️ Ser direto`), estimulando leitura e empatia genuínas.
  - *Acessibilidade opcional:* Adicionar um toggle discreto no Tablet (`Modo Dicas Pedagógicas`) para quem preferir visualizar os indicadores de impacto durante testes ou uso didático.
- **Conjunto Piloto Multi-Turno (5 conversas reescritas na Fase 1):**
  Validar o novo tom humano (misturando cotidiano, humor, pequenos desconfortos e saúde sem tom de cartilha) em 5 personagens representativos:
  1. **Dona Dulce (H01)** — conversa viva sobre a vizinhança, a horta e dicas de horários.
  2. **Seu Tião (H04)** — diálogo de 3 turnos onde o humor e a paciência quebram a desconfiança inicial.
  3. **Lucas (H13)** — abordagem delicada em etapas sobre ansiedade e rotina noturna.
  4. **Dr. Henrique (UBS)** — troca realista sobre casos da semana e gargalos da unidade.
  5. **ACS Joana (Sala ESF)** — papo de bastidores entre colegas sobre os desafios da microárea.

---

### 1.6 Persistência (`SaveManager` Schema v2) & Quality Gate (`tests/verify_game.js`)

- **Atualização do `SaveManager` em `public/js/core/engine.js`:**
  - Elevar `schemaVersion` de `1` para **`2`**.
  - Implementar **migração automática `v1 → v2`** no método `load()`: caso exista um save antigo `v1` no `localStorage`, convertê-lo silenciosamente para `v2` (`weekNumber = 1`, `dayOfWeek = saved.dayIndex` limitado a `0..4`, `weeklyVisits = saved.dailyVisits`, preservando todos os vínculos, `knownSchedule`, `dengueSpots`, inventário e `narrative.flags`).
- **Critérios de Aceitação & Novos Testes em `tests/verify_game.js`:**
  - Todos os 10 testes existentes adaptados para refletir a nova regra de horário/meta semanal, mantendo a regressão de Frame 1, integridade espacial do mapa (incluindo a nova casa do protagonista!) e movimentação/colisões.
  - **Novos testes obrigatórios da Fase 1:**
    - `SceneManager` & `PLAYER_HOME`: entrar/sair de casa, testar Cama (cochilo antes das 17h vs. dormir após 17h), Filtro de Barro, Café e Caderno Semanal.
    - Calendário e Horário da UBS: `07:00` inicia em casa com UBS fechada; `08:00–17:59` Seg–Sex UBS aberta; `>= 18:00` ou Sábado (`dayOfWeek === 5`) UBS fechada; às `22:30` retorna automaticamente para casa sem Game Over.
    - Virada de Domingo: dormir no Sábado dispara resumo semanal e avança para `Semana 2, Segunda-feira`, mantendo vínculos e horários salvos.
    - Meta Semanal (`weeklyVisits / 15`) e Prioridades da Semana (`3–4` famílias).
    - `DialogueSystem`: travessia de diálogo multi-turno piloto + adaptador de diálogo legado + ocultação de spoilers numéricos por padrão.
    - Migração de save `v1 → v2` e round-trip completo do snapshot `v2`.

---

## 3. Mapa de Arquivos Previstos na Fase 1

| Arquivo | Ação | Responsabilidade na Fase 1 |
| :--- | :--- | :--- |
| `public/js/core/engine.js` | Modificar | `SaveManager` v2 com migrador `v1 → v2`; garantir suporte aos novos eventos no `EventBus`. |
| `public/js/systems/sceneManager.js` | **Criar** | Registro e transição unificada de cenas (`OVERWORLD`, `UBS_INTERIOR`, `ESF_ROOM`, `PLAYER_HOME`). |
| `public/js/systems/playerHome.js` *(ou em `interiors/`)* | **Criar** | Definição, colisores, estações (cama, filtro, café, mesa) e renderização do interior da Casa do ACS. |
| `public/js/systems/dialogue.js` | **Criar** | Motor de diálogo multi-turno em grafo + adaptador legado + controle de ocultação de spoilers. |
| `public/js/systems/ubsInterior.js` | Modificar | Acoplar ao `SceneManager`, adicionar fechamento cordial às `18:00`, quadro de prioridades na Sala ESF e sincronização e-SUS sem forçar fim do dia. |
| `public/js/systems/navigation.js` | Modificar | Atualizar `resolveObjective()` e minimapa para prioridades semanais, casa do protagonista e horários noturnos. |
| `public/js/systems/narrative.js` | Modificar | Adaptar avaliação semanal (`evaluateWeeklyPriorities`) e adicionar diálogos piloto multi-turno. |
| `public/js/data.js` | Modificar | Coordenadas da Casa do ACS (`tx: 22, ty: 21`), realocação da árvore próxima, horários noturnos (`18:00–21:00`) de trabalhadores e definição da semana de 6 dias. |
| `public/js/pixelArt.js` | Modificar | Sprite exterior da Casa do ACS + móveis/piso do interior `PLAYER_HOME` (cama, filtro de barro, fogão/café, escrivaninha). |
| `public/js/audio.js` | Modificar | Suporte a passos em casa, transição de sono/descanso e faixa estendida de grilos noturnos (`18:00–22:30`). |
| `public/js/game.js` | Modificar | Integrar `SceneManager` e `DialogueSystem`, ciclo `07:00–22:00` (`1,6 min/s`), descanso em bancos, iluminação noturna, semana contínua e HUD semanal. |
| `public/index.html` & `public/style.css` | Modificar | Inclusão dos novos scripts em ordem compatível com `file://` e ajustes no HUD (Semana/Dia, status da UBS, visitas semanais, toggle opcional de dicas). |
| `tests/verify_game.js` | Modificar | Atualizar testes de contrato modificados e adicionar cobertura completa dos entregáveis 1.1–1.6. |

---

## 4. Riscos Técnicos e Cuidados na Execução

1. **Compatibilidade estrita com `file://`:** Todo novo módulo (`sceneManager.js`, `dialogue.js`, `playerHome.js`) deve usar IIFE anexada a `window` e ser listado manualmente em `public/index.html` e no array de scripts de `tests/verify_game.js` (nunca usar `import`/`export` ES modules nem `fetch` de JSON local).
2. **Integridade do Mapa no Overworld:** Ao posicionar a Casa do Protagonista em `(tx: 22, ty: 21)`, validar via teste automatizado que ela não colide com o córrego (`cols 17..18`), ponte (`cols 16..19`), calçada da Av. da Saúde (`col 25`) ou *Estrada do Sol* (`rows 23..25`).
3. **Preservação dos Testes Existentes:** A mudança de `dailyGoal = 12` para `weeklyGoal = 15` e o fato de a UBS só aceitar entrada quando aberta (`08:00–18:00`, Seg–Sex) exigirão atualização consciente dos asserts dos testes 4, 8 e 9 em `tests/verify_game.js` — mantendo intocada a cobertura da regressão do Frame 1 e colisões.
4. **Refatoração Gradual sem Big Bang:** Não tentar reescrever todos os 75 diálogos de `narrative.js` de uma só vez na Fase 1; validar o motor multi-turno com o conjunto piloto de 5 conversas e o adaptador retroativo, deixando a escrita completa dos Atos I–II para a Fase 3.

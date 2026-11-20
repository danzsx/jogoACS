# Framework de Desenvolvimento — Território Vivo: Crônicas de um ACS

Este documento define o framework de engenharia e design adotado para evoluir **Território Vivo: Crônicas de um ACS** de forma estruturada, testável e iterativa.

---

## 1. Diagnóstico Inicial do Projeto

Durante a análise do código-base original (`data.js`, `pixelArt.js`, `audio.js`, `game.js`), foram identificados os seguintes problemas:

1. **Bug Crítico (Bloqueador — Personagem invisível e jogo travado ao abrir):**
   - No construtor de `ACSGame`, `this.lastTimestamp = performance.now()` era comparado ao primeiro `timestamp` do `requestAnimationFrame`. Em navegadores Chromium (Edge/Chrome), o `timestamp` do vsync do primeiro frame frequentemente é alguns milissegundos **anterior** ao `performance.now()` capturado no `DOMContentLoaded`.
   - Isso gerava `dt < 0` → `this.elapsedTime < 0` → `waterFrame = Math.floor(elapsedTime * 3.5) % 3 = -1`.
   - Na linha de renderização do córrego (`ctx.drawImage(tiles.water[-1], ...)`), `tiles.water[-1]` era `undefined`, disparando um `TypeError` imediatamente **após** desenhar o terreno estático e **antes** da fila de Y-Sorting (UBS, casas, árvores, NPCs, cães e o **personagem ACS**).
   - Como o próximo `requestAnimationFrame` só era agendado no final de `loop()`, o loop principal morria definitivamente no Frame 1.
2. **Sobreposições de Mapa:**
   - As casas `H05`, `H10` e `H15` (coluna `tx: 70`) invadiam a rua conectora Leste (`cols 71..72`), e `H05`/`H10` também invadiam as ruas Norte/Central.
   - Três focos de dengue e alguns bancos/arbustos estavam posicionados no meio do asfalto.
   - A cerca de madeira ao redor da UBS era desenhada no terreno mas não tinha colisão.
3. **Acoplamento Monolítico & UX de Navegação:**
   - Todo o loop, entrada, persistência, IA, renderização e UI residiam em um único arquivo (`game.js` com >2.000 linhas), sem testes automatizados, sem salvamento de progresso e sem bússola/minimapa em tempo real para orientar o jogador no mapa de 2560×1536 px.

---

## 2. Pilares do Framework de Desenvolvimento

O desenvolvimento passa a seguir 4 pilares obrigatórios em todo incremento:

### Pilar 1 — Arquitetura Modular Compatível com `file://` e `http://`
Como o jogo é aberto diretamente via `Jogar_ACS_RPG.bat` (`file:///...`) e também via `npm start` (`http://localhost:3456`), os módulos são organizados por responsabilidade em namespaces limpos sem quebrar CORS em `file://`:

- `public/js/core/engine.js` (`window.ACSEngine`) — `EventBus`, `GameLoop` resiliente, `InputManager`, `SaveManager`, `safeMod`/`clamp`.
- `public/js/systems/navigation.js` (`window.NavigationSystem`) — Rastreador inteligente de objetivo, marcação de rota (GPS), minimapa em tempo real e seta direcional no mundo.
- `public/js/systems/narrative.js` (`window.NarrativeSystem`) — Diálogos exclusivos dos Dias 2–5, histórico longitudinal das 15 famílias, falas reativas ao vínculo e avaliação de objetivos bônus.
- `public/js/data.js` (`window.ACS_DATA`) — Dados de território, famílias, jornadas, clima e itens.
- `public/js/pixelArt.js` (`window.pixelArt`) — Geração procedural de sprites e retratos 16-bit.
- `public/js/audio.js` (`window.sfx`) — Síntese de efeitos sonoros via Web Audio API.
- `public/js/game.js` (`ACSGame`) — Orquestração de estado, simulação e renderização.

### Pilar 2 — Resiliência de Loop e Entrada
- `dt` sempre garantido no intervalo `[0, 0.05]`, inicializando `lastTimestamp = null` no primeiro frame.
- Toda indexação cíclica de frames usa `safeMod(i, len)`.
- Teclas são limpas automaticamente ao perder foco da janela (`blur`) ou abrir modais, evitando movimento preso.

### Pilar 3 — Ciclo MDA (Mechanics → Dynamics → Aesthetics)
Cada melhoria deve fortalecer simultaneamente:
- **Mecânica:** regras claras e previsíveis (colisão fiel ao visual, horários, hidratação, rota).
- **Dinâmica:** decisões táticas reais durante o turno de 08:00 às 18:00 (planejamento de rota pelo minimapa/GPS).
- **Estética:** identidade visual aconchegante de madeira/pergaminho estilo *Stardew Valley* aplicada à Atenção Primária do SUS.

### Pilar 4 — Quality Gate Automatizado (`npm test`)
Nenhuma mudança é considerada concluída sem passar pela suíte `tests/verify_game.js`, que valida:
- Regressão do Frame 1 com `timestamp` negativo (garantindo que o personagem sempre renderiza).
- Integridade espacial do mapa (zero sobreposição casa×rua ou foco×asfalto).
- Movimentação, colisões, visitas, descoberta de horários, navegação e persistência (`SaveManager`).

---

## 3. Roadmap Iterativo por Milestones

| Milestone | Escopo | Status |
| :--- | :--- | :--- |
| **M0 — Estabilidade & Fundação** | Correção do crash no Frame 1, correção de sobreposições do mapa, extração do `core/engine.js`, suíte `npm test`. | Concluído |
| **M1 — Navegação Territorial, Visibilidade & Persistência** | Minimapa em tempo real, rastreador inteligente de objetivo + seta direcional (GPS), clique para caminhar, destaque visual/respiração do ACS, atalhos de teclado em diálogos e auto-save em `localStorage`. | Concluído |
| **M2 — Profundidade Narrativa (Dias 2–5)** | Diálogos exclusivos por dia/tema epidemiológico, eventos comunitários e acompanhamento longitudinal das famílias. | Concluído |
| **M3 — Áudio & Atmosfera** | Paisagem sonora ambiente (pássaros, chuva, passos), controle de volume/mudo no HUD. | Concluído |
| **M4 — Distribuição & Acessibilidade** | Suporte mobile/touch opcional, modo alto contraste e empacotamento desktop/PWA. | Planejado |

---

## 4. Documentação de Evolução (RPG Narrativo — Fases 1 a 6)

Os planos aprovados para transformar o jogo em um RPG 2D narrativo de longo prazo (inspirado na estrutura de *Graveyard Keeper*, com realismo periférico brasileiro) estão consolidados na pasta `docs/`:

- [`docs/GDD_EVOLUCAO.md`](docs/GDD_EVOLUCAO.md) — **Game Design Document (GDD) de Evolução:** diagnóstico atual, identidade, arco narrativo em 4 atos, calendário semanal (6 dias + Domingo), economia em duas carteiras (`R$` pessoal + Fundo do Mutirão), 5 atividades alternativas integradas e roadmap das 6 fases.
- [`docs/FASE_1_ESCOPO.md`](docs/FASE_1_ESCOPO.md) — **Escopo Detalhado da Fase 1 (Fundação de RPG & Arquitetura):** fronteira de escopo, entregáveis (`SceneManager`, `PLAYER_HOME`, ciclo `07:00–22:00`, semana contínua, Meta Semanal + Prioridades, `DialogueSystem` multi-turno sem spoilers, `SaveManager` v2 + migração), mapa de arquivos e critérios de aceitação. *(Concluída — 15/15 testes)*
- [`docs/FASE_2_ESCOPO.md`](docs/FASE_2_ESCOPO.md) — **Escopo Detalhado da Fase 2 (Expansão Orgânica do Bairro & Rotinas):** expansão do mapa para `80×56`, Vendinha do Zé, Pracinha dos Ipês (Feira de Terça e Dominó de Quinta/Sábado), Associação de Moradores + Terreno da Horta, 3 novos NPCs (Seu Zé, Tia Bete, Dona Carla), `ScheduleSystem` e `PhoneSystem` (Celular Pessoal). *(Concluída — 21/21 testes)*
- [`docs/MODO_HISTORIA_PLANO.md`](docs/MODO_HISTORIA_PLANO.md) — **Plano Diretor & Execução do Modo História (*O Pulso da Vila Esperança*):** visão narrativa realista (inspirada em *Stardew Valley*, *Night in the Woods*, *Graveyard Keeper*, *A Space for the Unbound* e *Telltale*), campanha do Prólogo aos Capítulos 1–4 + Epílogo/Modo Livre, teia de relações do elenco, missões & Heart Events, diagnóstico de integração com o código atual e roadmap `H1–H4` (MVP) + `H5+`. *(Etapas H1, H2 e H3 concluídas — 30/30 testes; próximo: Etapa H4)*

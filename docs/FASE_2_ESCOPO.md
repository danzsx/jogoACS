# Escopo Detalhado — Fase 2: Expansão Orgânica do Bairro & Rotinas

> **Documento de Execução Futura** (referência complementar a [GDD_EVOLUCAO.md](GDD_EVOLUCAO.md) e continuação de [FASE_1_ESCOPO.md](FASE_1_ESCOPO.md))  
> **Objetivo da Fase 2:** Dar vida orgânica à Vila Esperança expandindo o mapa com pontos de encontro comunitários, introduzindo os 3 novos NPCs-chave, colocando moradores em circulação por rotinas semanais (`ScheduleSystem`) e entregando o **Celular Pessoal do Protagonista** (`PhoneSystem`) — **mantendo compatibilidade total com `file://`, `http://`, saves da Fase 1 e a suíte `npm test`**.

---

## 1. Fronteira Clara de Escopo

### O que ENTRA na Fase 2
1. **Expansão Orgânica do Overworld (`80×48` → `80×56` tiles / `2560×1792 px`)** preservando 100% intactas as coordenadas atuais de UBS, Casa do ACS, 15 casas, ruas Norte/Central/Sul/Leste, rio, ponte, cães e focos de dengue.
2. **3 Novos Polos Comunitários:**
   - **Vendinha & Padaria do Zé (`VENDINHA`)** — exterior no bairro + interior visitável via `SceneManager`.
   - **Pracinha dos Ipês** — espaço aberto vivo no sul do bairro com **Feira Livre nas Terças** e **Roda de Dominó nas Quintas e Sábados**, bancos de descanso e iluminação noturna.
   - **Associação de Moradores (`ASSOCIACAO`)** — exterior + interior visitável com Quadro de Projetos do Bairro — somada ao **Terreno da Horta Comunitária** ao lado.
3. **3 Novos NPCs-Chave** (sprites pixel art, retratos 48×48 e diálogos multi-turno sem spoilers via `DialogueSystem`):
   - **Seu Zé** (Vendinha), **Tia Bete** (Associação / Horta) e **Dona Carla** (Coordenadora Distrital — visitante semanal às Segundas e Sextas na UBS).
4. **Sistema de Rotinas & Agendas Dinâmicas (`ScheduleSystem`):** Moradores existentes passam a circular entre Casa, Feira, Pracinha, Vendinha, Sala de Espera da UBS e Associação conforme dia e hora, com diálogos sociais fora de casa.
5. **Celular Pessoal do Protagonista (`PhoneSystem`, tecla `C` + botão no HUD):** Com 3 abas (*Grupo da Vila Esperança*, *Agenda & Diário da Semana*, *Contatos & Locais*) integrado ao `EventBus` e ao `NavigationSystem`.
6. **Navegação, Arte 16-bit, Áudio, Persistência & Testes:** Atualização do minimapa/mapa tático, sprites externos/internos, som `notify()` de mensagem, extensões compatíveis no `SaveManager` v2 e novos testes em `tests/verify_game.js`.

### O que NÃO entra na Fase 2 (Reservado às Fases 3–6)
- `QuestSystem` declarativo e arco completo dos Atos I–IV (**Fases 3 e 6**).
- Dinheiro pessoal (`R$`), compras na loja da Vendinha/Feira, melhorias compráveis da casa, árvore de *Saberes do Território* e Bicicleta (**Fase 4**).
- Cozinha com receitas, cultivo interativo nos canteiros da Horta, minijogo jogável de Dominó e execução dos Mutirões que reconstroem o mapa (**Fase 5**).

> **Nota de Arquitetura:** Os balcões/barracas da Vendinha e Feira, o Quadro de Projetos da Associação, os canteiros cercados da Horta, as Mesas de Dominó na Pracinha e a aba *Agenda & Diário* do Celular já nascem estruturalmente preparados na Fase 2 para acoplar as Fases 3, 4 e 5 sem retrabalho.

---

## 2. Entregáveis Detalhados (2.1 a 2.6)

### 2.1 Expansão do Mapa (`80×56`) & Novos Polos Comunitários

Ao expandir `MAP_ROWS` de `48` para `56` em `public/js/data.js`, toda a faixa sul (`rows 43..55`) abre espaço natural abaixo da Rua dos Ipês (`rows 40..42`) sem deslocar nenhum prédio, casa ou foco existente.

1. **Vendinha & Padaria do Zé (`VENDINHA`):**
   - **Overworld:** Posicionada em **`tx: 22, ty: 32`** (esquina da Av. da Saúde com a Rua da Esperança, ao sul da Casa do ACS), faceando a calçada da Av. da Saúde (`cols 25..28`).
     - *Ajuste pontual:* Realocar o ipê dourado atualmente em `(22 * 32, 30 * 32)` em `public/js/data.js` para `(20 * 32, 38 * 32)` (ou próximo ao canto sudoeste sem bloquear caminhos) para liberar a fachada e a entrada da Vendinha.
   - **Horário de funcionamento:** **Segunda a Sábado, `07:00–21:30`** (quando fechada tarde da noite, a porta exibe aviso cordial de horário).
   - **Interior visitável (`18×13` tiles registrado no `SceneManager`):**
     - Balcão de madeira com estufa de pães/salgados e cafeteira, prateleiras de mercearia, geladeira de bebidas, mural de recados do bairro, mesinha de canto e porta de saída.
     - *Estações interativas:* Balcão/Cafeteira do Seu Zé (prosa + cafezinho grátis `1x/dia` que recupera `+15 Energia`; vitrine preparada para a loja `R$` da Fase 4), Mural de Recados (avisos da semana) e Porta de saída.

2. **Pracinha dos Ipês (`OVERWORLD`, `cols 35..53, rows 43..52`):**
   - Conectada diretamente à calçada sul da Rua dos Ipês (`row 42`) por caminhos de pedra/calçada (`cols 39..40` e `48..49`).
   - **Layout fixo permanente:** Piso central de praça arborizada, **4 ipês (amarelo e rosa)** fornecendo sombra real contra onda de calor (`inShade`), **4 bancos de madeira** (com descanso de `1h` já funcional da Fase 1), **2 Mesas de Dominó** (ponto social/diálogo na Fase 2; minijogo na Fase 5) e **postes com halo luminoso quente à noite** (`>= 18:00`).
   - **Camadas dinâmicas por dia da semana:**
     - **Terça-feira (`dayOfWeek === 1`, `07:30–14:00`) — Feira Livre:** Barracas coloridas em pixel art montadas na praça: *Barraca de Verduras do Seu Tonho*, *Barraca de Costura da Dona Neide* e *Barraca de Frutas/Pastel*, com moradores circulando pelo pátio.
     - **Quinta-feira (`dayOfWeek === 3`, `15:00–21:00`) e Sábado (`dayOfWeek === 5`, `14:00–20:00`) — Roda de Dominó & Convivência:** Moradores reunidos ao redor das mesas de dominó e bancos da praça.

3. **Associação de Moradores (`ASSOCIACAO`) & Terreno da Horta Comunitária:**
   - **Associação no Overworld:** Posicionada em **`tx: 60, ty: 49`**, conectada à Rua dos Ipês / acesso leste da Pracinha por calçada dedicada (`cols 54..63, rows 42..51`).
   - **Horário de funcionamento:** **Segunda a Sábado, `09:00–19:00`** (com **Reunião Comunitária às Quartas, `14:00–19:00`**).
   - **Interior visitável (`18×13` tiles registrado no `SceneManager`):**
     - Mesa comprida de reuniões, cadeiras, armário de atas, mural comunitário e **Quadro de Projetos do Bairro** (estação interativa que já exibe os 4 projetos estruturais previstos no GDD — *Reforma da Ponte do Córrego*, *Revitalização da Pracinha*, *Horta Comunitária Ativa* e *Sala de Grupos da UBS* — como metas em discussão para as Fases 3–5).
   - **Terreno da Horta Comunitária (`cols 65..74, rows 44..52`):**
     - Área cercada com portão aberto ao lado direito da Associação, contendo **10 canteiros de terra preparada**, caixa d'água tampada, banco de apoio e placa educativa (`🌱 Terreno da Horta Comunitária — Em preparo pela Associação`). Na Fase 2 é um espaço explorável com inspeção contextual e ponto de presença da Tia Bete aos sábados; na Fase 5 recebe o cultivo jogável.

---

### 2.2 Os 3 Novos NPCs-Chave (Sprites, Retratos 48×48 e Diálogos Multi-Turno)

Todos integrados ao `DialogueSystem` (sem spoilers numéricos nas escolhas, emitindo `npc:talked` e compatíveis com o toggle de dicas pedagógicas):

| NPC | Local & Horário | Personalidade & Função na Fase 2 |
| :--- | :--- | :--- |
| **Seu Zé** (`npc_seu_ze`) | **Vendinha & Padaria do Zé** (`Seg–Sáb, 07:00–21:30`) | Comerciante acolhedor e bem-humorado, sabe tudo o que acontece no bairro. Reage ao dia da semana/clima, oferece um cafezinho (`1x/dia`, `+15 Energia`), revela horários de moradores trabalhadores que frequentam a vendinha e alimenta fofocas reais no *Grupo da Vila*. |
| **Tia Bete** (`npc_tia_bete`) | **Associação de Moradores** (`Seg–Sex 09:00–19:00` e `Sáb 13:00–19:00`; `Sáb 09:00–12:30` ao lado da **Horta Comunitária**) | Liderança comunitária experiente, direta e pragmática. Desconfia de promessas fáceis, apresenta os problemas reais da Vila (ponte precária, córrego, falta de lazer na praça) e valoriza ações concretas nas reuniões de Quarta-feira. |
| **Dona Carla** (`npc_dona_carla`) | **UBS Vila Esperança** — **Visitante Semanal** (`Segundas 08:30–12:00` e `Sextas 14:00–17:30`) | Coordenadora Distrital da Secretaria de Saúde. Não é uma vilã caricata: é técnica e pressionada por metas e planilhas. Avalia objetivamente os indicadores atuais (`weeklyVisits`, prioridades cumpridas, cadastros mapeados) e deixa no ar a cobrança por resultados da Microárea 04 que impulsionará o Ato I na Fase 3. |

---

### 2.3 Sistema de Rotinas & Agendas Dinâmicas (`ScheduleSystem`)

Novo módulo **`public/js/systems/schedule.js` (`window.ScheduleSystem`)** que calcula onde cada morador (ou NPC especial) se encontra a qualquer instante `(dayOfWeek, timeMinutes)` sem pathfinding custoso:

- **Locais possíveis (`locationType`):**
  - `'HOME'` — Na frente/varanda da própria casa (comportamento original preservado).
  - `'PRACA_FEIRA'` — Na **Pracinha dos Ipês** durante a Feira de Terça (`dayOfWeek === 1, 07:30–14:00`): *Seu Tonho (H14)* e *Dona Neide (H05)* nas barracas; *Dona Dulce (H01)* e *Camila (H03)* passeando entre as barracas.
  - `'PRACA_DOMINO'` — Na **Pracinha dos Ipês** às Quintas (`15:00–21:00`) e Sábados (`14:00–20:00`): *Seu Tião (H04)*, *Seu Raimundo (H07)*, *Digão (H11)* e *Lucas (H13)* próximos às mesas de dominó e bancos.
  - `'VENDINHA'` — Dentro da **Vendinha do Zé** no começo da noite (`18:30–21:00`) em rodízio por dia da semana: ex. *Marcos (H02)* (Seg/Qua), *Jorge (H06)* (Ter/Qui), *Digão (H11)* (Sex/Sáb) e *Dr. Cláudio (H10)* (Ter/Sex à noite).
  - `'UBS_ESPERA'` — Na sala de espera da **UBS Vila Esperança** em manhãs específicas (`08:30–11:30`): ex. *Dona Lourdes (H12)* às Segundas e *Beatriz (H08)* às Quartas (consulta de pré-natal!).
  - `'ASSOCIACAO'` — Na **Associação de Moradores** durante a reunião de Quarta (`14:00–18:30`): *Seu Raimundo (H07)* e *Dona Dulce (H01)* participando com *Tia Bete*.
  - `'AWAY'` — Ausente no trabalho/compromisso fora do bairro.

- **Regras de Coerência e UX:**
  1. **Nunca duplicar o NPC:** Quando um morador está em `'PRACA_FEIRA'`, `'VENDINHA'`, `'UBS_ESPERA'` ou `'ASSOCIACAO'`, seu sprite **não** aparece na porta da casa (`HOME`) nesse horário; ao bater na casa, o aviso informa que ele provavelmente está naquele ponto (ou "saiu" se o horário ainda for desconhecido).
  2. **Diálogo Social Fora de Casa:** Ao falar com um morador na Feira, Pracinha, Vendinha, UBS ou Associação, ele responde com fala **contextual do ambiente** (humor, rotina, vida no bairro, pistas de vizinhos) — fortalecendo o vínculo em **`+4` a `+6`** (limitado a `1x/dia` por morador em encontro social), sem consumir nem substituir a visita domiciliar clínica quando ele estiver em casa.
  3. **Integração no Tablet e-SUS (`[TAB]`):** A coluna *"Agora"* passa a exibir o local em tempo real sempre que o jogador conhecer a rotina da família (`🟢 Em Casa`, `🛍️ Na Feira`, `♟️ Na Pracinha`, `🏪 Na Vendinha`, `🏥 Na UBS`, `🏛️ Na Associação`, `🔴 Ausente`).

---

### 2.4 Celular Pessoal do Protagonista (`PhoneSystem`)

Novo módulo **`public/js/systems/phone.js` (`window.PhoneSystem`)**, separando a vida pessoal/comunitária do **Tablet e-SUS** (ferramenta técnica de trabalho):

- **Acesso:** Tecla **`C`**, novo botão compacto no HUD superior esquerdo ao lado do botão `e-SUS` (com badge numérico de mensagens não lidas) ou interagindo com a Mesa na Casa do ACS.
- **Interface Modal em Moldura de Celular/Pergaminho com 3 Abas:**
  1. **💬 Grupo da Vila Esperança:**
     - Feed cronológico de mensagens curtas, autênticas e com humor brasileiro disparadas por eventos do `EventBus` (`day:started`, `time:hourChanged`, `week:ended`) conforme dia da semana e progresso:
       - *Segunda manhã:* Enfª Marina desejando boa semana; Seu Zé anunciando pão quente.
       - *Terça manhã:* Seu Tonho chamando o bairro para a Feira na Pracinha dos Ipês; Dona Neide divulgando remendos/bazar.
       - *Quarta tarde:* Tia Bete lembrando da reunião na Associação.
       - *Quinta tarde:* Seu Raimundo provocando Seu Tião para a Roda de Dominó.
       - *Sexta manhã/tarde:* Avisos sobre fechamento semanal da UBS e chegada da Dona Carla.
       - *Sábado:* Mensagens leves de fim de semana e organização comunitária.
     - Abrir a aba marca as mensagens como lidas (`unreadCount = 0`) e silencia o badge do HUD.
  2. **📅 Agenda & Diário da Semana:**
     - Resumo visual dos 6 dias da semana (`Seg–Sáb`) destacando o evento fixo do dia e o dia atual.
     - Lista das prioridades semanais, metas de campo e espaço estrutural preparado para o `QuestSystem` da Fase 3.
  3. **👥 Contatos & Rotinas:**
     - Diretório unificado dos moradores e equipe/novos NPCs exibindo o local provável atual (quando conhecido) e botão **`📍 Rota`** que traça o GPS no `NavigationSystem` direto até o local certo (casa, praça, vendinha, associação ou UBS!).

---

### 2.5 Navegação, Arte 16-bit, Áudio & UI

- **`NavigationSystem` & Mapa Tático (`M`):**
  - Suporte ao novo tamanho de mundo (`80×56`) mantendo proporção correta no minimapa e no Mapa Tático.
  - Novos marcadores clicáveis para fixar rota GPS: **Vendinha do Zé** (`VENDINHA`), **Pracinha dos Ipês** (`PRACA`), **Associação de Moradores** (`ASSOCIACAO`) e **Horta Comunitária** (`HORTA`).
  - Se o jogador fixar rota para uma família que esteja na Feira/Pracinha/Vendinha/Associação no momento (e a rotina for conhecida), a seta dourada aponta para o local onde o morador realmente está!
- **`pixelArt.js`:**
  - Sprites exteriores da **Vendinha do Zé** (toldo listado quente, vitrine com pães, plaquinha) e da **Associação de Moradores** (fachada comunitária acolhedora com mural).
  - Novos props de mundo: barracas de feira (verduras, costura, frutas), mesas de dominó com banquinhos, postes de iluminação da praça, cerca de madeira e canteiros da Horta Comunitária.
  - Móveis interiores de `VENDINHA` (balcão com estufa de pães, prateleiras de mercearia, geladeira de bebidas, mural) e `ASSOCIACAO` (mesa de reunião, quadro de projetos do bairro, armário de atas).
  - Sprites e retratos 48×48 exclusivos para **Seu Zé**, **Tia Bete** e **Dona Carla**.
- **`audio.js`:**
  - Novo efeito sutil `notify()` para chegada de mensagem importante no *Grupo da Vila* e suporte aos pisos internos de Vendinha e Associação (`I` / `E`).

---

### 2.6 Persistência (`SaveManager` v2) & Critérios de Aceitação (`tests/verify_game.js`)

- **Compatibilidade de Save (v2 Estendido Sem Quebrar Saves da Fase 1):**
  - Manter `schemaVersion = 2` (ou adicionar campos opcionais com fallback seguro em `loadProgress()`), salvando:
    - `phone`: `{ messages, unreadCount, lastTriggeredKeys }`
    - `community`: `{ informalTalkedToday, vendinhaCoffeeUsedToday }`
    - `currentLocation`: aceitar `'VENDINHA'` e `'ASSOCIACAO'` além de `'OVERWORLD'`, `'PLAYER_HOME'`, `'UBS_INTERIOR'`, `'ESF_ROOM'`.
- **Critérios de Aceitação Obrigatórios em `tests/verify_game.js`:**
  1. **Integridade Espacial `80×56`:** Zero sobreposição das 15 casas, Casa do ACS, Vendinha, Pracinha, Associação e Horta com ruas/rio; todas as portas acessíveis e caminháveis.
  2. **Vendinha do Zé (`VENDINHA`):** Entrada permitida entre `07:00–21:30` (Seg–Sáb), bloqueio fora do horário, colisões internas válidas, presença e diálogo multi-turno do Seu Zé + cafezinho diário (`1x/dia`).
  3. **Associação (`ASSOCIACAO`) & Horta:** Entrada permitida no horário (`09:00–19:00`), presença e diálogo da Tia Bete, Quadro de Projetos do Bairro legível e terreno da Horta alcançável.
  4. **Dona Carla (Visitante Semanal):** Presente na `UBS_INTERIOR` apenas em Segunda (`08:30–12:00`) e Sexta (`14:00–17:30`), ausente nos demais dias/horários, com diálogo reativo aos indicadores semanais.
  5. **Rotinas Dinâmicas (`ScheduleSystem`):** Verificar que Terça `09:00` coloca Seu Tonho/Dona Neide na `PRACA_FEIRA` (e fora da porta de casa), Quinta `17:00` coloca Seu Tião/Lucas na `PRACA_DOMINO`, Quarta `15:00` coloca Seu Raimundo na `ASSOCIACAO`, e encontro social fora de casa dá bônus leve de vínculo sem contar como visita clínica duplicada.
  6. **Celular (`PhoneSystem`):** Abertura via tecla `C`, recebimento de mensagens no *Grupo da Vila*, marcação de leitura (`unreadCount` zera) e persistência no `SaveManager` v2 mantendo compatibilidade com snapshots da Fase 1.

---

## 3. Mapa de Arquivos Previstos na Fase 2

| Arquivo | Ação | Responsabilidade na Fase 2 |
| :--- | :--- | :--- |
| `public/js/systems/schedule.js` | **Criar** | Regras de agenda semanal/horária dos moradores e NPCs especiais (`ScheduleSystem`). |
| `public/js/systems/phone.js` | **Criar** | Celular Pessoal (`PhoneSystem`): Grupo da Vila, Agenda da Semana e Contatos/Rotinas. |
| `public/js/systems/communitySpaces.js` | **Criar** | Interiores `VENDINHA` e `ASSOCIACAO`, lógica de Seu Zé, Tia Bete, Dona Carla, Feira, Dominó e Horta. |
| `public/js/data.js` | Modificar | Expandir `MAP_ROWS` para `56`; adicionar coordenadas da Vendinha, Pracinha, Associação, Horta e realocar árvore; dados dos 3 NPCs e agendas. |
| `public/js/pixelArt.js` | Modificar | Sprites externos/internos dos novos prédios, barracas de feira, mesas de dominó, postes, horta e retratos/sprites de Seu Zé, Tia Bete e Dona Carla. |
| `public/js/systems/dialogue.js` | Modificar | Adicionar grafos multi-turno de Seu Zé, Tia Bete, Dona Carla e diálogos sociais fora de casa. |
| `public/js/systems/ubsInterior.js` | Modificar | Integrar presença condicional de Dona Carla (`Seg`/`Sex`) e moradores na sala de espera da UBS. |
| `public/js/systems/navigation.js` | Modificar | Suportar `80×56`, novos pins (Vendinha, Pracinha, Associação, Horta) e rota dinâmica para local atual do morador. |
| `public/js/audio.js` | Modificar | Adicionar efeito sonoro `notify()` para mensagens do celular. |
| `public/js/game.js` | Modificar | Gerar terreno `80×56` (Pracinha, calçadas sul, iluminação de postes), integrar `ScheduleSystem`, `PhoneSystem` e `CommunitySpaces`, atalho `C` e persistência. |
| `public/index.html` & `public/style.css` | Modificar | Botão do Celular no HUD com badge, modal do Celular (3 abas), legenda do Mapa Tático e ordem de scripts compatível com `file://`. |
| `tests/verify_game.js` | Modificar | Incluir novos scripts no harness e adicionar os testes de aceitação da Fase 2. |

---

## 4. Riscos Técnicos e Cuidados na Execução

1. **Compatibilidade `file://` e Ordem de Scripts:** Todo novo arquivo (`schedule.js`, `phone.js`, `communitySpaces.js`) deve usar IIFE anexada a `window` e ser registrado em `public/index.html` e no array `scripts` de `tests/verify_game.js` antes de `game.js`.
2. **Proporção do Mapa (`80×56`) no Minimapa e Mapa Tático:** Ajustar o canvas ou renderização proporcional (`196×137` ou letterbox limpo) para evitar distorção visual nos ícones ao passar de `48` para `56` linhas.
3. **Sem Duplicação de NPCs ou Bloqueio de Visitas Clínicas:** Quando um morador estiver em `PRACA_FEIRA`, `VENDINHA`, `UBS_ESPERA` ou `ASSOCIACAO`, garantir que seu sprite desapareça da porta de casa e que a interação social fora de casa seja claramente distinta da visita domiciliar clínica.
4. **Compatibilidade Retroativa de Saves da Fase 1:** Garantir que um save gerado na Fase 1 (com `currentLocation`, sem `phone` nem `community`) carregue perfeitamente na Fase 2 com estado inicial limpo do Celular e das rotinas.

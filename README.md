# 🌿 Território Vivo: Crônicas de um ACS
> **RPG 2D Top-Down de Simulação & Narrativa da Atenção Primária à Saúde (SUS)**  
> *Inspirado no aconchego de Stardew Valley, na profundidade sistêmica de Graveyard Keeper e na realidade pulsante da Saúde da Família brasileira.*

---

## 📖 Sobre o Jogo

**Território Vivo: Crônicas de um ACS** coloca você no papel de um Agente Comunitário de Saúde (ACS) recém-chegado à comunidade de **Vila Esperança** e ao bairro vizinho de **Vila Aurora**.

Sua missão vai muito além de preencher fichas burocráticas: você precisa construir vínculos genuínos com as famílias, planejar suas visitas de acordo com a rotina de cada morador, investigar situações de saúde complexas através do **Fio da Meada**, gerenciar sua energia e hidratação sob sol forte ou chuva, eliminar focos de dengue, lidar com a fauna do território e articular soluções coletivas com a equipe da UBS!

---

## ✨ Principais Funcionalidades

- 🗺️ **Território Expandido em Pixel Art (120×56 tiles / 3840×1792 px):**
  - **Vila Esperança (Microárea Central):** UBS completa (Recepção, Sala de Vacina, Consultório, Sala ESF), Casa do ACS com bancada de trabalho, Vendinha do Seu Zé, Associação de Moradores com Tia Bete, Horta Viva e Pracinha dos Ipês.
  - **Vila Aurora (Bairro Vizinho Expandido):** 
    - ⚽ **Campinho de Futebol de Terra Batida:** Traves de madeira, arquibancada improvisada, espaço comunitário de lazer e encontro de jovens e famílias.
    - 🏚️ **Casa Misteriosa:** Residência enigmática no extremo nordeste com cerca de arame, janelas fechadas e mistérios a serem desvendados nas visitas de campo.
- 📓 **Caderno de Campo Interativo (`[J]` ou HUD):**
  - Sistema de dossiê pessoal do ACS com 3 abas essenciais:
    - **Moradores & Vínculos:** Dossiê familiar, estilo de comunicação preferido, receptividade, teimosia, gatilhos de cooperação e pendências.
    - **Fio da Meada (Investigações):** Painel investigativo com pistas coletadas, contradições e deduções ativas.
    - **Crônica do Território:** Linha do tempo dos acontecimentos, conquistas e marcos históricos da comunidade.
- 🔍 **Sistema de Investigação Clínica & Social ("Fio da Meada"):**
  - Casos investigativos profundos inspirados no cotidiano real do SUS:
    - *O Enigma de Seu Agenor:* Não-adesão medicamentosa devido a efeitos colaterais e desinformação na vizinhança.
    - *A Angústia de Dona Lurdes:* Hipertensão refratária com causas psicossociais ligadas à sobrecarga de cuidadora.
    - *O Mistério de Carla:* Faltas no acompanhamento pré-natal desvendadas através do apoio da rede escolar e familiar.
    - *A Casa Misteriosa de Vila Aurora:* Rumores do território, isolamento social e necessidade de busca ativa humanizada.
  - Diálogos com deduções ativas, identificação de contradições e múltiplas abordagens de resolução.
- 🤝 **Sistema Multidimensional de Relacionamentos:**
  - Vínculos que vão além de barras genéricas: confiança, receptividade, teimosia e estilo de comunicação (`EMPATICA`, `TECNICA`, `PRATICA`, `DIRETA`).
  - **Cooperação de Moradores:** Vínculos altos desbloqueiam cafezinho revigorante com Dona Lurdes, alertas antecipados de focos com Seu Zé, e muito mais.
- 🐕🐱 **Fauna do Bairro (Cachorros & Gatinhos):**
  - **Cachorros Territoriais:** Cuidado ao passar por Trovão (Caramelo), Brutus (Fila) e Fumaça (Pinscher)! Use a prancheta com técnica ou ofereça um biscoito canino para acalmá-los.
  - **Gatinhos da Vila:**
    - *Fofinhos (Mingau, Paçoca e Bolinha):* Adoram receber carinho, amassar pãozinho e ronronar, restaurando a energia do ACS!
    - *Medrosos (Sombra e Frajola):* Fogem assustados de quem se aproxima, mas podem ser conquistados com paciência e petiscos.
- 📱 **Ferramentas de Campo & Sobrevivência:**
  - **Tablet do ACS (`TAB`):** Acompanhe fichas do e-SUS, missões prioritárias, rotas e indicadores.
  - **Caderno de Campo (`J`):** Investigação, dossiê dos moradores e crônica territorial.
  - **Celular (`C`):** Notificações e mensagens da equipe ESF.
  - **Mochila do SUS:** Garrafa d'água (`1`), protetor solar (`2`), guarda-sol (`3`) e petiscos (`4`).
- 🎶 **Trilha Sonora Original & Web Audio FX:**
  - Músicas temáticas dinâmicas para a UBS, exploração e momentos dramáticos, além de efeitos sonoros de passos e passos em diferentes terrenos.

---

## 🎮 Como Jogar

### Opção 1: Jogar Direto no Windows (Sem Instalação / Pendrive)
O jogo funciona de forma totalmente nativa usando qualquer navegador moderno (Edge ou Chrome), sem precisar instalar Node.js:
1. Baixe ou clone a pasta do jogo.
2. Dê **dois cliques** no arquivo executável:
   ```cmd
   Jogar_ACS_RPG.bat
   ```
3. O jogo abrirá automaticamente em modo aplicativo!

### Opção 2: Servidor Local (Node.js)
Caso queira rodar via servidor local:
```bash
# Iniciar o servidor
npm start
```
Depois abra seu navegador em: `http://localhost:3456`

---

## ⌨️ Controles

| Tecla / Ação | Função |
| :--- | :--- |
| **W, A, S, D** ou **Setas** | Movimentar o ACS pelo território |
| **Shift** *(Segurar)* | Correr / Apressar o passo |
| **E** ou **Espaço** | Interagir (visitar casas, conversar, acariciar gatos, examinar locais) |
| **M** | Abrir/Fechar Mapa Tático do Território |
| **TAB** | Abrir/Fechar Tablet e-SUS |
| **J** | Abrir/Fechar Caderno de Campo (Investigação & Dossiê) |
| **C** | Abrir/Fechar Celular da ESF |
| **1** | Beber Água da Garrafa *(Recupera Hidratação)* |
| **2** | Aplicar Protetor Solar *(Protege contra calor extremo)* |
| **3** | Abrir/Fechar Guarda-Sol *(Protege contra sol forte e chuva)* |
| **4** | Oferecer Petisco Canino/Felino *(Acalma cães bravos e atrai gatos)* |
| **Clique com Mouse** | Andar até o local clicado / Navegar nos botões da interface |

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Canvas & JavaScript Puro (Vanilla ES6+):** Renderização pixel-art com Y-Sorting, física de colisão, iluminação de ciclo circadiano e sistemas modulares desacoplados via `EventBus`.
- **Web Audio API:** Síntese de áudio procedural e orquestração de trilha sonora ambiente adaptativa.
- **SaveManager com Versionamento Automático:** Persistência em `localStorage` com migrações sem perda de progresso (Schema v1 → v4).
- **Suíte de Testes Automatizada:** 37 testes de regressão, integridade do território (120x56), sistemas de investigação, relacionamentos e diálogos via Node.js (`npm test`).

---

## 🧪 Rodando os Testes Automatizados

Para validar todas as 37 verificações de qualidade, integridade do mapa, diálogos, investigação e salvamento:
```bash
npm test
```

---

## 📄 Licença

Desenvolvido para fins educativos, culturais e de valorização do Sistema Único de Saúde (SUS) e da Estratégia Saúde da Família (ESF).

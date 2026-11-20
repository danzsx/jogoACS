# 🌿 Território Vivo: Crônicas de um ACS
> **RPG 2D Top-Down de Simulação & Narrativa da Atenção Primária à Saúde (SUS)**  
> *Inspirado no aconchego de Stardew Valley e na realidade pulsante da Saúde da Família brasileira.*

---

## 📖 Sobre o Jogo

**Território Vivo: Crônicas de um ACS** coloca você no papel de um Agente Comunitário de Saúde (ACS) recém-chegado à comunidade de **Vila Esperança**. 

Sua missão vai muito além de preencher fichas: você precisa construir vínculos genuínos com 15 famílias, planejar suas visitas de acordo com a rotina de cada morador, gerenciar sua energia e hidratação sob sol forte ou chuva, eliminar criadouros de dengue, lidar com os animais do bairro e articular soluções coletivas com a equipe da UBS!

---

## ✨ Principais Funcionalidades

- 🗺️ **Território 16-Bit Handcrafted (2560×1536 px):**
  - **Unidade Básica de Saúde (UBS):** Sala de Recepção, Bebedouro de Água Gelada, Sala de Vacina, Consultório Médico e Sala da ESF com armário de suprimentos.
  - **Casa do ACS:** Comece o dia na sua própria casa, tome um café quente ou água do filtro de barro e descanse na cama.
  - **Espaços Comunitários:** Vendinha do Seu Zé, Associação de Moradores com Tia Bete, Horta Comunitária Viva e Pracinha dos Ipês.
- 💬 **Narrativa Ramificada & Sistema de Vínculos:**
  - 15 famílias detalhadas com perfis clínicos reais (hipertensão, diabetes, gestação de risco, saúde mental, tabagismo).
  - Diálogos multi-turnos com dilemas éticos, árvore de escolhas e reações longitudinais ao longo dos dias e semanas.
- 🐕🐱 **Fauna do Bairro (Cachorros & Gatinhos):**
  - **Cachorros Territoriais:** Cuidado ao passar por Trovão (Caramelo), Brutus (Fila) e Fumaça (Pinscher)! Use a prancheta com técnica ou ofereça um biscoito canino para acalmá-los.
  - **Gatinhos da Vila:**
    - *Fofinhos (Mingau, Paçoca e Bolinha):* Adoram receber carinho, amassar pãozinho e ronronar, restaurando a energia do ACS!
    - *Medrosos (Sombra e Frajola):* Fogem assustados de quem se aproxima, mas podem ser conquistados com paciência e petiscos.
- 📱 **Ferramentas de Campo & Sobrevivência:**
  - **Tablet do ACS:** Acompanhe fichas do e-SUS, missões prioritárias da semana, mapa tático e registros de vínculos.
  - **Celular do ACS:** Notificações e mensagens do grupo da equipe ESF.
  - **Mochila do SUS:** Garrafa d'água, protetor solar, guarda-sol/capa de chuva e petiscos.
- 🎶 **Trilha Sonora Original & Web Audio FX:**
  - Músicas temáticas dinâmicas para a UBS, exploração e momentos dramáticos, além de efeitos sonoros de passos e passos em diferentes terrenos.

---

## 🎮 Como Jogar

### Opção 1: Jogar Direto no Windows (Sem Instalação / Pendrive)
O jogo funciona de forma totalmente nativa usando qualquer navegador moderno (Edge ou Chrome), sem precisar instalar Node.js:
1. Baixe ou copie a pasta do jogo.
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
| **E** ou **Espaço** | Interagir (visitar casas, acariciar gatos, falar com NPCs) |
| **M** | Abrir/Fechar Mapa Tático |
| **TAB** | Abrir/Fechar Tablet e-SUS |
| **P** | Abrir/Fechar Celular |
| **1** | Beber Água da Garrafa *(Recupera Hidratação)* |
| **2** | Aplicar Protetor Solar *(Protege contra calor extremo)* |
| **3** | Abrir/Fechar Guarda-Sol *(Protege contra sol forte e chuva)* |
| **4** | Oferecer Petisco Canino/Felino *(Acalma cães bravos e atrai gatos)* |
| **Clique com Mouse** | Andar até o local clicado / Navegar nos menus |

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Canvas & JavaScript Puro (Vanilla ES6+):** Renderização pixel-art com Y-Sorting, física de colisão e sistemas modulares.
- **Web Audio API:** Síntese de áudio procedural (miados, latidos, passos e sinos) e orquestração de trilha sonora ambiente.
- **Engine Framework Modular:** Barramento de eventos (`EventBus`), loop resiliente com delta-time, migração automática de saves no `localStorage`.
- **Suíte de Testes Automatizada:** 33 testes de regressão e integridade territorial via Node.js (`npm test`).

---

## 🧪 Rodando os Testes Automatizados

Para validar todas as 33 verificações de qualidade, integridade do mapa, diálogos e salvamento:
```bash
npm test
```

---

## 📄 Licença

Desenvolvido para fins educativos, culturais e de valorização do Sistema Único de Saúde (SUS) e da Estratégia Saúde da Família (ESF).

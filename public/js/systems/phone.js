// ============================================================================
// TERRITÓRIO VIVO — PERSONAL SMARTPHONE SYSTEM (Phase 2)
// ============================================================================
// Separates community/personal life from the professional Tablet e-SUS:
//   Tab 1: Grupo da Vila Esperança (EventBus-driven community chat messages)
//   Tab 2: Agenda & Diário da Semana (6-day weekly schedule + priorities)
//   Tab 3: Contatos & Rotinas (live location + one-click GPS route pinning)

(function (global) {
  'use strict';

  class PhoneSystem {
    constructor(game) {
      this.game = game;
      this.activeTab = 'group';
      this.unreadCount = 0;
      this.triggeredKeys = new Set();
      this.messages = [
        {
          id: 'welcome_1',
          sender: 'Enfª Marina (UBS)',
          time: 'Sem. 1 • 07:00',
          text: 'Bom dia, colega! Bem-vindo(a) à Microárea 04. Hoje abrimos às 08h — passe na Sala ESF quando puder!'
        },
        {
          id: 'welcome_2',
          sender: 'Seu Zé (Vendinha)',
          time: 'Sem. 1 • 07:05',
          text: 'Pão quentinho saindo na Vendinha! Quem passar pela esquina da Av. da Saúde tem cafezinho de boas-vindas!'
        }
      ];
      this.unreadCount = 2;

      this._bindEvents();
    }

    _bindEvents() {
      const g = this.game;
      if (!g.events) return;

      g.events.on('day:started', ({ weekNumber, dayOfWeek }) => {
        this.onDayEvent(weekNumber, dayOfWeek, 7);
      });

      g.events.on('time:hourChanged', ({ weekNumber, dayOfWeek, hour }) => {
        this.onDayEvent(weekNumber, dayOfWeek, hour);
      });

      g.events.on('week:ended', ({ weekNumber, weeklyVisits, weeklyGoal }) => {
        this.pushMessage(
          `week_end_${weekNumber}`,
          'Tia Bete (Associação)',
          `Sem. ${weekNumber} • Dom.`,
          weeklyVisits >= weeklyGoal
            ? `Parabéns pela semana na Vila Esperança (${weeklyVisits}/${weeklyGoal} visitas)! Na quarta tem reunião na Associação!`
            : `Semana ${weekNumber} fechada (${weeklyVisits}/${weeklyGoal}). Vamos seguir firmes na próxima semana — passe lá na Associação!`
        );
      });

      // Etapa H3: Reactive community group reactions to clues, quests & world changes
      g.events.on('clue:inspected', ({ totalFound }) => {
        if (totalFound === 2) {
          this.pushMessage(
            'h3_clues_2',
            'ACS Rosana',
            `Sem. ${g.weekNumber} • Rua`,
            'Alex, vi suas anotações sobre o bairro! Cruzando a esquina da baixada com os recados noturnos dá pra ver que o problema é coletivo — leva isso pra Tia Bete!'
          );
        }
      });

      g.events.on('world:stateChanged', ({ key, value }) => {
        if (key === 'hortaStage' && value === 2) {
          this.pushMessage(
            'h3_horta_viva',
            'Seu Raimundo (Casa 07)',
            `Sem. ${g.weekNumber} • Horta`,
            'Pessoal!! Fomos lá mexer nos canteiros da Horta Comunitária hoje! Já tem verde nascendo perto da Associação!'
          );
        }
      });

      g.events.on('quest:completed', ({ questId }) => {
        if (questId === 'qs_canteiro_domino') {
          this.pushMessage(
            'h3_side_canteiro',
            'Dra. Patrícia (UBS)',
            `Sem. ${g.weekNumber} • eMulti`,
            'A torneira da Horta foi destravada! Semana que vem levo o grupo de caminhada pra mexer nos canteiros elevados com o pessoal do Dominó!'
          );
        } else if (questId === 'qs_balanco_guiche') {
          this.pushMessage(
            'h3_side_guiche',
            'Renan (Recepção UBS)',
            `Sem. ${g.weekNumber} • Recepção`,
            'Valeu pela força aqui no balcão, Alex. Depois daquela conversa com você e Dona Carla, a fila de hoje andou com muito mais calma!'
          );
        }
      });
    }

    onDayEvent(weekNumber, dayOfWeek, hour) {
      const d = window.ACS_DATA.days[dayOfWeek] || window.ACS_DATA.days[0];
      const stamp = `Sem. ${weekNumber} • ${d.shortName} ${String(hour).padStart(2, '0')}h`;

      if (dayOfWeek === 0 && hour === 8) {
        this.pushMessage(
          `w${weekNumber}_mon_carla`,
          'Renan (Recepção UBS)',
          stamp,
          'Aviso: A Coordenadora Dona Carla está na UBS hoje pela manhã (08h30–12h) conferindo os indicadores da semana!'
        );
      } else if (dayOfWeek === 1 && hour === 7) {
        this.pushMessage(
          `w${weekNumber}_tue_feira`,
          'Seu Tonho da Horta',
          stamp,
          'Bom dia, vizinhança! Hoje tem Feira Livre na Pracinha dos Ipês até às 14h! Couve fresca e costura da Dona Neide!'
        );
      } else if (dayOfWeek === 2 && hour === 13) {
        this.pushMessage(
          `w${weekNumber}_wed_assoc`,
          'Tia Bete (Associação)',
          stamp,
          'Pessoal, hoje às 14h abrimos a roda na Associação de Moradores para discutir os projetos do bairro (Ponte, Pracinha e Horta)!'
        );
      } else if (dayOfWeek === 3 && hour === 15) {
        this.pushMessage(
          `w${weekNumber}_thu_domino`,
          'Seu Raimundo',
          stamp,
          'Cadê o pessoal do dominó?! Já arrumamos as mesas na sombra da Pracinha dos Ipês! Apareçam até as 21h!'
        );
      } else if (dayOfWeek === 4 && hour === 14) {
        this.pushMessage(
          `w${weekNumber}_fri_carla`,
          'Enfª Marina (UBS)',
          stamp,
          'Lembrete: hoje é sexta de fechamento semanal do e-SUS até 18h! A Dona Carla também passou na UBS para conferir a meta.'
        );
      } else if (dayOfWeek === 5 && hour === 9) {
        this.pushMessage(
          `w${weekNumber}_sat_livre`,
          'ACS Rosana',
          stamp,
          'Sabadão sem expediente na UBS! Bom dia pra visitar quem trabalha na semana, dar um pulo na Horta com a Tia Bete e descansar!'
        );
      } else if (hour === 18 && dayOfWeek < 5) {
        this.pushMessage(
          `w${weekNumber}_d${dayOfWeek}_bread`,
          'Seu Zé (Vendinha)',
          stamp,
          'Fornada das 18h saindo agora na Vendinha! O pessoal que voltou do trabalho já tá encostando pra bater papo!'
        );
      }
    }

    pushMessage(key, sender, time, text) {
      if (this.triggeredKeys.has(key)) return false;
      this.triggeredKeys.add(key);
      this.messages.unshift({ id: key, sender, time, text });
      if (this.messages.length > 30) this.messages.length = 30;
      this.unreadCount++;
      this.updateBadge();
      if (global.sfx && typeof global.sfx.notify === 'function' && !this.game.paused) {
        global.sfx.notify();
      }
      return true;
    }

    updateBadge() {
      const badge = document.getElementById('phone-notif-badge');
      if (!badge) return;
      badge.textContent = String(this.unreadCount);
      badge.classList.toggle('zero', this.unreadCount <= 0);
    }

    toggle(forceOpen = false) {
      const overlay = document.getElementById('phone-overlay');
      if (!overlay) return;
      const isHidden = overlay.classList.contains('hidden');
      this.game.closeOverlays();
      if (isHidden || forceOpen) {
        this.game.paused = true;
        this.game.input.clear();
        this.game.navigation.clearWalkTarget();
        overlay.classList.remove('hidden');
        if (this.activeTab === 'group') {
          this.unreadCount = 0;
          this.updateBadge();
        }
        this.render();
      }
    }

    render() {
      const content = document.getElementById('phone-content');
      if (!content) return;

      document.querySelectorAll('.phone-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.phoneTab === this.activeTab);
      });

      const g = this.game;

      if (this.activeTab === 'group') {
        this.unreadCount = 0;
        this.updateBadge();
        const itemsHtml = this.messages.map(m => `
          <div class="phone-msg-card">
            <div class="phone-msg-head">
              <strong>${m.sender}</strong>
              <span class="phone-msg-time">${m.time}</span>
            </div>
            <div class="phone-msg-body">${m.text}</div>
          </div>
        `).join('');
        content.innerHTML = `<div class="phone-chat-list">${itemsHtml || '<em>Sem mensagens ainda.</em>'}</div>`;
        return;
      }

      if (this.activeTab === 'agenda') {
        const weekDays = window.ACS_DATA.days.map((d, idx) => {
          const isToday = idx === g.dayOfWeek;
          return `
            <div class="phone-agenda-row ${isToday ? 'today' : ''}">
              <strong>${isToday ? '👉 ' : ''}${d.name}</strong>
              <span>${d.weekTag || d.title}</span>
            </div>
          `;
        }).join('');
        const prioHtml = g.weeklyPriorities.map(id => {
          const fam = g.families.find(f => f.id === id);
          if (!fam) return '';
          const done = g.visitedThisWeek.has(id);
          return `${done ? '✅' : '⭐'} <b>${fam.code}</b> — ${fam.name}`;
        }).filter(Boolean).join('<br>');

        const chapterMeta = g.quests ? g.quests.getChapterMeta() : null;
        const activeQuests = g.quests ? g.quests.getActiveQuestsList() : [];
        const storySummaryHtml = chapterMeta
          ? `
            <div class="feature-item" style="margin-bottom:10px">
              <strong>📖 ${chapterMeta.title}</strong>
              <div style="margin-top:4px;font-size:12.5px">
                ${activeQuests.map(q => `• <b>${q.def.title}:</b> ${q.currentStep ? q.currentStep.label : 'Em andamento'}`).join('<br>') || chapterMeta.desc}
              </div>
            </div>
          `
          : '';

        content.innerHTML = `
          ${storySummaryHtml}
          <div class="feature-item" style="margin-bottom:10px">
            <strong>📅 Semana ${g.weekNumber} — Ritmo da Vila Esperança</strong>
            <div style="margin-top:6px">${weekDays}</div>
          </div>
          <div class="feature-item">
            <strong>📓 Diário & Prioridades (${g.weeklyVisits}/${g.weeklyGoal} visitas na semana)</strong>
            <div style="margin-top:4px;font-size:13px">${prioHtml}</div>
          </div>
        `;
        return;
      }

      // Contacts & Dynamic Locations Tab
      const cards = [];

      // Community hubs & special NPCs
      cards.push({
        name: 'Seu Zé • Vendinha & Padaria',
        status: (g.dayOfWeek < 6 && g.timeMinutes >= 7 * 60 && g.timeMinutes < 21.5 * 60) ? '🟢 Aberto (07h–21h30)' : '🔴 Fechado',
        pin: { type: 'VENDINHA', id: 'VENDINHA' },
        pinLabel: 'Vendinha do Zé'
      });
      cards.push({
        name: 'Tia Bete • Associação & Horta',
        status: (g.dayOfWeek < 6 && g.timeMinutes >= 9 * 60 && g.timeMinutes < 19 * 60) ? '🟢 Aberto (09h–19h)' : '🔴 Fechado',
        pin: { type: 'ASSOCIACAO', id: 'ASSOCIACAO' },
        pinLabel: 'Associação de Moradores'
      });
      cards.push({
        name: 'Pracinha dos Ipês (Feira Ter / Dominó Qui-Sáb)',
        status: g.schedule && g.schedule.isFeiraActive()
          ? '🛍️ Feira Livre Agora!'
          : (g.schedule && g.schedule.isDominoGatheringActive() ? '♟️ Roda de Dominó Agora!' : '🌳 Aberta 24h'),
        pin: { type: 'PRACA', id: 'PRACINHA' },
        pinLabel: 'Pracinha dos Ipês'
      });
      cards.push({
        name: 'Dona Carla • Coordenação Distrital (UBS)',
        status: ((g.dayOfWeek === 0 && g.timeMinutes >= 8.5 * 60 && g.timeMinutes <= 12 * 60) ||
                 (g.dayOfWeek === 4 && g.timeMinutes >= 14 * 60 && g.timeMinutes <= 17.5 * 60))
          ? '🏥 Na UBS Agora!'
          : '📅 Seg (08h30–12h) e Sex (14h–17h30)',
        pin: { type: 'UBS', id: 'UBS' },
        pinLabel: 'UBS Vila Esperança'
      });

      g.families.forEach(fam => {
        const loc = g.schedule ? g.schedule.getFamilyLocation(fam) : { label: '❓' };
        cards.push({
          name: `${fam.code} • ${fam.name}`,
          status: fam.knownSchedule ? loc.label : '❓ Horário a descobrir',
          pin: { type: 'HOUSE', id: fam.id },
          pinLabel: `${fam.code} (${fam.name})`
        });
      });

      content.innerHTML = cards.map((c, idx) => `
        <div class="phone-contact-row">
          <div>
            <strong>${c.name}</strong><br>
            <small>${c.status}</small>
          </div>
          <button class="pin-btn" data-phone-pin="${idx}">📍 Rota</button>
        </div>
      `).join('');

      content.querySelectorAll('[data-phone-pin]').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = cards[Number(btn.dataset.phonePin)];
          if (!item) return;
          g.navigation.setPin(item.pin);
          g.toast(`📍 Rota marcada: ${item.pinLabel}!`, 'info');
          g.closeOverlays();
        });
      });
    }

    exportState() {
      return {
        messages: this.messages.slice(0, 30),
        unreadCount: this.unreadCount,
        triggeredKeys: Array.from(this.triggeredKeys)
      };
    }

    importState(data) {
      if (!data) return;
      if (Array.isArray(data.messages)) this.messages = data.messages.slice(0, 30);
      this.unreadCount = Number(data.unreadCount) || 0;
      this.triggeredKeys = new Set(Array.isArray(data.triggeredKeys) ? data.triggeredKeys : []);
      this.updateBadge();
    }
  }

  global.PhoneSystem = PhoneSystem;
})(window);

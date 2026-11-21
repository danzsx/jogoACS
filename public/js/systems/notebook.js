// ============================================================================
// TERRITÓRIO VIVO — FIELD NOTEBOOK SYSTEM (Etapa E1 — Tecla [J])
// ============================================================================
// Separates the ACS's personal knowledge & investigation notebook from the
// institutional Tablet e-SUS:
//   Tab 1: 🔍 Casos & Pistas (environmental clues + foundation for E2 cases)
//   Tab 2: 👥 Perfis & Relações (notes, comm styles, receptivity & cooperation perks)
//   Tab 3: 📓 Crônica da Vila (living timeline of discoveries & consequences)

(function (global) {
  'use strict';

  class NotebookSystem {
    constructor(game) {
      this.game = game;
      this.activeTab = 'profiles'; // 'cases' | 'profiles' | 'chronicle'
      this.profileFilter = 'all';  // 'all' | 'families' | 'staff'
      this.notes = {};             // { [entityId]: string[] }
      this.chronicle = [];         // [{ dayStamp, title, detail }]
      this._bindEvents();
    }

    reset() {
      this.notes = {};
      this.chronicle = [];
      this.addChronicleEntry('Início da Jornada', 'Você vestiu o colete azul na Microárea 04 da Vila Esperança.');
    }

    _getStamp() {
      const g = this.game;
      const d = g.getCurrentDayData ? g.getCurrentDayData() : { shortName: 'Seg.' };
      const clk = g.formatClock ? g.formatClock(g.timeMinutes || 420) : '07:00';
      return `Sem. ${g.weekNumber || 1} • ${d.shortName} ${clk}`;
    }

    addNote(entityId, text) {
      if (!entityId || !text) return;
      if (!this.notes[entityId]) this.notes[entityId] = [];
      if (!this.notes[entityId].includes(text)) {
        this.notes[entityId].unshift(text);
        if (this.notes[entityId].length > 8) this.notes[entityId].length = 8;
      }
    }

    addChronicleEntry(title, detail) {
      if (!title) return;
      const stamp = this._getStamp();
      const dup = this.chronicle.find(e => e.title === title && e.detail === detail);
      if (dup) return;
      this.chronicle.unshift({ dayStamp: stamp, title, detail: detail || '' });
      if (this.chronicle.length > 40) this.chronicle.length = 40;
    }

    _bindEvents() {
      const g = this.game;
      if (!g.events) return;

      g.events.on('clue:inspected', ({ clueId, firstTime } = {}) => {
        if (!firstTime) return;
        const clue = (global.ACS_WORLD_CLUES || []).find(c => c.id === clueId);
        if (clue) {
          this.addChronicleEntry(`🔍 Pista: ${clue.title}`, clue.note || clue.text);
        }
      });

      g.events.on('visit:completed', ({ familyId, choiceType, ok } = {}) => {
        const fam = (g.families || []).find(f => f.id === familyId);
        if (!fam) return;
        if (ok) {
          this.addNote(familyId, `${this._getStamp()}: Visita acolhida (${choiceType}).`);
        } else {
          this.addNote(familyId, `${this._getStamp()}: Abordagem gerou resistência.`);
        }
      });

      g.events.on('quest:completed', ({ title } = {}) => {
        if (title) {
          this.addChronicleEntry(`🌟 Missão Concluída: ${title}`, 'Marco registrado no território.');
        }
      });

      g.events.on('relationship:perkUsed', ({ msg } = {}) => {
        if (msg) {
          this.addChronicleEntry('🤝 Cooperação Comunitária', msg);
        }
      });
    }

    toggle(forceOpen = false, initialTab = null) {
      const overlay = document.getElementById('notebook-overlay');
      if (!overlay) return;
      if (initialTab) this.activeTab = initialTab;
      const isHidden = overlay.classList.contains('hidden');
      this.game.closeOverlays();
      if (isHidden || forceOpen) {
        this.game.paused = true;
        this.game.input.clear();
        if (this.game.navigation) this.game.navigation.clearWalkTarget();
        overlay.classList.remove('hidden');
        this.render();
      }
    }

    render() {
      const content = document.getElementById('notebook-content');
      if (!content) return;

      document.querySelectorAll('.notebook-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.notebookTab === this.activeTab);
      });

      if (this.activeTab === 'cases') {
        this._renderCasesTab(content);
      } else if (this.activeTab === 'profiles') {
        this._renderProfilesTab(content);
      } else {
        this._renderChronicleTab(content);
      }
    }

    _renderCasesTab(content) {
      const g = this.game;
      const inv = g.investigation;
      const activeCases = inv ? inv.getActiveCases() : [];
      const resolvedCases = inv ? inv.getResolvedCases() : [];
      const foundIds = g.worldState ? g.worldState.getCluesFound() : [];
      const worldClues = (global.ACS_WORLD_CLUES || []).filter(c => foundIds.includes(c.id));

      const casesHtml = activeCases.map(({ def, state }) => {
        const cluesCollected = def.clues.filter(c => state.clues.includes(c.id));
        const canSynth = inv.canSynthesizeHypothesis(def.id);

        const cluesListHtml = cluesCollected.length > 0
          ? cluesCollected.map(c => `
            <div style="padding:6px 8px;margin-top:5px;border-left:4px solid ${c.isKey ? '#d97706' : '#64748b'};background:#fffbeb;border-radius:4px;font-size:12.5px">
              <strong>${c.isKey ? '🔑 ' : '📌 '}${c.sourceLabel}</strong> <small>(${c.category})</small><br>
              ${c.text}
            </div>
          `).join('')
          : '<em style="font-size:12.5px">Nenhuma pista coletada ainda. Converse com moradores, vizinhos e equipe da UBS.</em>';

        let synthHtml = '';
        if (state.hypothesisUnlocked) {
          synthHtml = `
            <div style="margin-top:8px;padding:8px;background:#f0fdf4;border:1px solid #16a34a;border-radius:6px;font-size:12.5px">
              <strong>💡 Contradição & Hipótese: ${def.contradiction.title}</strong><br>
              ${def.contradiction.hypothesisText}<br>
              <small style="color:#166534">Opções [💡 Hipótese] desbloqueadas nos diálogos com os envolvidos!</small>
            </div>
          `;
        } else if (canSynth) {
          synthHtml = `
            <div style="margin-top:8px;padding:8px;background:#fef3c7;border:2px solid #d97706;border-radius:6px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
              <span style="font-size:12.5px"><strong>⚡ Contradição detectada:</strong> ${def.contradiction.title}</span>
              <button class="pin-btn" data-synth-case="${def.id}">💡 Cruzar Pistas</button>
            </div>
          `;
        }

        return `
          <div class="feature-item" style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
              <strong>🔍 ${def.title}</strong>
              <span class="badge prioritario">${cluesCollected.length}/${def.clues.length} pistas</span>
            </div>
            <p style="margin-top:4px;font-size:13px">${def.summary}</p>
            ${cluesListHtml}
            ${synthHtml}
          </div>
        `;
      }).join('');

      const resolvedHtml = resolvedCases.map(({ def }) => `
        <div class="feature-item" style="margin-bottom:6px;background:#f0fdf4">
          <strong>✅ ${def.title}</strong> — <small>Caso resolvido no território.</small>
        </div>
      `).join('');

      const worldCluesHtml = worldClues.length > 0
        ? worldClues.map(c => `
          <div class="feature-item" style="margin-bottom:6px">
            <strong>🗺️ ${c.title}</strong>
            <p style="margin-top:3px;font-size:12.5px">${c.text}</p>
          </div>
        `).join('')
        : '<em>Nenhuma pista ambiental [?] examinada ainda.</em>';

      content.innerHTML = `
        <div class="feature-item" style="margin-bottom:10px;background:#fefce8">
          <strong>🔍 Investigação Territorial ("Fio da Meada")</strong>
          <p style="margin-top:3px;font-size:12.5px">
            Reúna pistas de fontes diferentes, identifique contradições e cruze evidências para desbloquear abordagens de resolução.
          </p>
        </div>
        ${casesHtml || '<em>Nenhum caso investigativo aberto no momento.</em>'}
        ${resolvedHtml}
        <strong style="display:block;margin:10px 0 6px 0">🗺️ Pistas Ambientais do Bairro (${worldClues.length}/5)</strong>
        ${worldCluesHtml}
      `;

      content.querySelectorAll('[data-synth-case]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (inv && inv.synthesizeHypothesis(btn.dataset.synthCase)) {
            this.render();
          }
        });
      });
    }

    _renderProfilesTab(content) {
      const g = this.game;
      const rel = g.relationships;
      const perks = rel ? rel.getAvailablePerks() : [];

      const filterBar = `
        <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
          <button class="pin-btn ${this.profileFilter === 'all' ? 'active-filter' : ''}" data-nb-filter="all">Todos</button>
          <button class="pin-btn ${this.profileFilter === 'families' ? 'active-filter' : ''}" data-nb-filter="families">🏠 15 Famílias</button>
          <button class="pin-btn ${this.profileFilter === 'staff' ? 'active-filter' : ''}" data-nb-filter="staff">🏥 Equipe & Lideranças</button>
        </div>
      `;

      const perksHtml = perks.length > 0
        ? `
          <div class="feature-item" style="margin-bottom:12px">
            <strong>🤝 Cooperações Comunitárias Desbloqueáveis</strong>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px;margin-top:8px">
              ${perks.map(p => `
                <div style="padding:8px;border:1px solid #d6b98d;border-radius:6px;background:${p.unlocked ? '#f0fdf4' : '#f8fafc'}">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:6px">
                    <strong style="font-size:12.5px">${p.title}</strong>
                    ${p.unlocked
                      ? (p.usedToday
                        ? '<small style="color:#64748b">Usada hoje</small>'
                        : `<button class="pin-btn" data-use-perk="${p.id}">Acionar</button>`)
                      : `<small style="color:#92400e">🔒 ${p.minBond}% Vínc. / ${p.minReceptivity}% Rec.</small>`}
                  </div>
                  <p style="font-size:12px;margin-top:4px;color:#475569">${p.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `
        : '';

      const entries = [];
      if (this.profileFilter === 'all' || this.profileFilter === 'families') {
        (g.families || []).forEach(f => {
          entries.push({
            id: f.id,
            title: `${f.code} • ${f.name}`,
            sub: `${f.condition} • Teimosia: ${f.stubbornness || 0}`,
            bond: f.bond
          });
        });
      }
      if (this.profileFilter === 'all' || this.profileFilter === 'staff') {
        const npcs = [
          ...(g.communitySpaces ? Object.values(g.communitySpaces.npcs) : []),
          ...(g.ubsInterior ? g.ubsInterior.staff : [])
        ];
        npcs.forEach(n => {
          entries.push({
            id: n.id,
            title: `${n.name} • ${n.role}`,
            sub: n.sector,
            bond: g.storyState ? g.storyState.getNpcBond(n.id) : 50
          });
        });
      }

      const cardsHtml = entries.map(e => {
        const rec = rel ? rel.getContextualReceptivity(e.id) : 60;
        const recLabel = rel ? rel.getReceptivityLabel(rec) : 'Receptiva';
        const revealed = rel ? rel.isStyleRevealed(e.id) : false;
        const profile = rel ? rel.getProfile(e.id) : null;
        const styleLabel = revealed && profile && rel
          ? rel.getStyleMeta(profile.preferredStyle).label
          : '❓ A descobrir em conversa';
        const entityNotes = (this.notes[e.id] || []).slice(0, 2);

        return `
          <div class="feature-item" style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
              <strong>${e.title}</strong>
              <span style="font-size:12px">❤️ <b>${e.bond}%</b> • 💬 Receptividade: <b>${rec}%</b> (${recLabel})</span>
            </div>
            <div style="font-size:12px;color:#63432b;margin-top:3px">${e.sub}</div>
            <div style="font-size:12px;margin-top:4px">
              <strong>Abordagem que funciona melhor:</strong> ${styleLabel}
            </div>
            ${revealed && profile ? `<div style="font-size:12px;color:#035388;margin-top:3px">💡 ${profile.note}</div>` : ''}
            ${entityNotes.length > 0 ? `<div style="font-size:11.5px;color:#475569;margin-top:4px">📝 ${entityNotes.join(' | ')}</div>` : ''}
          </div>
        `;
      }).join('');

      content.innerHTML = `${filterBar}${perksHtml}${cardsHtml}`;

      content.querySelectorAll('[data-nb-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.profileFilter = btn.dataset.nbFilter;
          this.render();
        });
      });

      content.querySelectorAll('[data-use-perk]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (rel) {
            rel.usePerk(btn.dataset.usePerk);
            this.render();
          }
        });
      });
    }

    _renderChronicleTab(content) {
      const items = this.chronicle.map(item => `
        <div class="phone-msg-card" style="margin-bottom:8px">
          <div class="phone-msg-head">
            <strong>${item.title}</strong>
            <span class="phone-msg-time">${item.dayStamp}</span>
          </div>
          ${item.detail ? `<div class="phone-msg-body">${item.detail}</div>` : ''}
        </div>
      `).join('');

      content.innerHTML = items || '<em>Nenhum acontecimento registrado na crônica ainda.</em>';
    }

    exportState() {
      return {
        notes: JSON.parse(JSON.stringify(this.notes)),
        chronicle: this.chronicle.slice(0, 40)
      };
    }

    importState(data) {
      this.reset();
      if (!data || typeof data !== 'object') return;
      if (data.notes && typeof data.notes === 'object') {
        this.notes = JSON.parse(JSON.stringify(data.notes));
      }
      if (Array.isArray(data.chronicle) && data.chronicle.length > 0) {
        this.chronicle = data.chronicle.slice(0, 40);
      }
    }
  }

  global.NotebookSystem = NotebookSystem;
})(window);

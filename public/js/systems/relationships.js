// ============================================================================
// TERRITÓRIO VIVO — MULTIDIMENSIONAL RELATIONSHIP SYSTEM (Etapa E1)
// ============================================================================
// Evolves flat bond scores into a living social network:
//   1. Confiança (bond: fam.bond / storyState.npcBonds)
//   2. Receptividade atual (receptivity 0..100, driven by stubbornness, context & recent style)
//   3. Preferência de Comunicação (escuta, pratica, tecnica, articulacao)
//   4. Cooperações Territoriais (real gameplay actions unlocked by trust + receptivity)

(function (global) {
  'use strict';

  const COMMUNICATION_STYLES = {
    escuta: { id: 'escuta', label: '💛 Escuta Calma', short: 'Escuta' },
    pratica: { id: 'pratica', label: '🛠️ Abordagem Prática', short: 'Prática' },
    tecnica: { id: 'tecnica', label: '🎓 Clareza Técnica', short: 'Técnica' },
    articulacao: { id: 'articulacao', label: '🤝 Articulação Coletiva', short: 'Articulação' }
  };

  const CHARACTER_PROFILES = {
    // 15 Famílias (H01..H15)
    H01: { preferredStyle: 'articulacao', averseStyle: 'tecnica', note: 'Dona Dulce & Seu Geraldo valorizam prosa comunitária e troca sobre os vizinhos.' },
    H02: { preferredStyle: 'pratica', averseStyle: 'tecnica', note: 'Marcos trabalha em turno noturno; responde melhor a combinados realistas para o sono.' },
    H03: { preferredStyle: 'escuta', averseStyle: 'tecnica', note: 'Camila precisa de acolhimento sem julgamento antes de orientações técnicas.' },
    H04: { preferredStyle: 'pratica', averseStyle: 'tecnica', note: 'Seu Tião trava com sermão clínico; abre a guarda com humor, dominó e analogias simples.' },
    H05: { preferredStyle: 'escuta', averseStyle: 'tecnica', note: 'Dona Neide valoriza respeito aos saberes tradicionais antes de ajustes na medicação.' },
    H06: { preferredStyle: 'pratica', averseStyle: 'escuta', note: 'Jorge & Luciana são objetivos; preferem soluções práticas que não façam perder dia de obra.' },
    H07: { preferredStyle: 'articulacao', averseStyle: 'tecnica', note: 'Seu Raimundo é liderança nata; engaja-se quando convidado a fortalecer a comunidade.' },
    H08: { preferredStyle: 'escuta', averseStyle: 'pratica', note: 'Bia vive ansiedade do fim da gestação; precisa de escuta tranquila e segurança.' },
    H09: { preferredStyle: 'escuta', averseStyle: 'tecnica', note: 'Dona Helena carrega sobrecarga de cuidadora; valoriza quem olha primeiro para ela.' },
    H10: { preferredStyle: 'tecnica', averseStyle: 'pratica', note: 'Dr. Cláudio é cético com informalidade; respeita argumentos técnicos e vigilância territorial.' },
    H11: { preferredStyle: 'pratica', averseStyle: 'escuta', note: 'Digão vive na correria das entregas; responde bem a papo direto e soluções rápidas.' },
    H12: { preferredStyle: 'articulacao', averseStyle: 'tecnica', note: 'Dona Lourdes conecta a Rua dos Ipês inteira por meio de convivência e grupos.' },
    H13: { preferredStyle: 'escuta', averseStyle: 'pratica', note: 'Lucas evita pressão; só se abre com escuta paciente e sem cobrança.' },
    H14: { preferredStyle: 'pratica', averseStyle: 'tecnica', note: 'Seu Tonho reage mal a discurso médico formal; aceita cuidado via metáforas do trabalho.' },
    H15: { preferredStyle: 'escuta', averseStyle: 'pratica', note: 'Fernanda & Gabriel estão no puerpério; precisam de acolhimento gentil às dúvidas da família.' },

    // Equipe UBS & Lideranças Comunitárias
    npc_seu_ze: { preferredStyle: 'articulacao', averseStyle: 'tecnica', note: 'Seu Zé sente o pulso da esquina; valoriza respeito ao sigilo e prosa sem pressa.' },
    npc_tia_bete: { preferredStyle: 'articulacao', averseStyle: 'escuta', note: 'Tia Bete desconfia de promessa vazia; valoriza compromisso concreto e ação coletiva.' },
    npc_dona_carla: { preferredStyle: 'tecnica', averseStyle: 'pratica', note: 'Dona Carla cobra dados reais e transparência; rejeita desculpas burocráticas.' },
    medico: { preferredStyle: 'tecnica', averseStyle: 'pratica', note: 'Dr. Henrique valoriza leitura clínica articulada com o território.' },
    enfermeira_marina: { preferredStyle: 'tecnica', averseStyle: 'pratica', note: 'Enfª Marina equilibra protocolo e cuidado; responde bem a planejamento claro.' },
    escriturario: { preferredStyle: 'pratica', averseStyle: 'articulacao', note: 'Renan sofre pressão no guichê; valoriza combinados práticos que organizem a fila.' },
    acs_joana: { preferredStyle: 'escuta', averseStyle: 'tecnica', note: 'Joana preza vínculo humano e trabalho de equipe sem atropelo.' },
    acs_tiago: { preferredStyle: 'pratica', averseStyle: 'tecnica', note: 'Tiago lida com sobrecarga; responde bem a divisão prática de tarefas.' },
    acs_rosana: { preferredStyle: 'escuta', averseStyle: 'tecnica', note: 'Rosana guarda a memória afetiva das famílias e valoriza atenção aos detalhes.' },
    fisioterapeuta: { preferredStyle: 'articulacao', averseStyle: 'tecnica', note: 'Dra. Patrícia busca integrar reabilitação com espaços vivos do bairro.' },
    enfermeiro_carlos: { preferredStyle: 'tecnica', averseStyle: 'pratica', note: 'Enf. Carlos preza informação clara e acolhedora contra desinformação.' },
    limpeza: { preferredStyle: 'escuta', averseStyle: 'tecnica', note: 'Dona Sueli enxerga o corredor; valoriza reconhecimento e olhar humano.' },
    vigia: { preferredStyle: 'pratica', averseStyle: 'escuta', note: 'Seu Oswaldo observa a calçada; gosta de objetividade e atenção aos sinais da rua.' }
  };

  const COOPERATION_PERKS = [
    {
      id: 'perk_dulce_intercede',
      entityId: 'H01',
      title: 'Intermediação na Calçada (Dona Dulce)',
      desc: 'Dona Dulce conversa com um vizinho resistente antes da sua visita (-15 Teimosia, +15 Receptividade).',
      minBond: 75,
      minReceptivity: 60,
      execute(g, rel) {
        const resistant = g.families
          .filter(f => (f.stubbornness || 0) > 10 && f.id !== 'H01')
          .sort((a, b) => (b.stubbornness || 0) - (a.stubbornness || 0));
        const target = resistant[0];
        if (!target) {
          return { ok: false, msg: 'Nenhum morador resistente precisa de intermediação agora.' };
        }
        target.stubbornness = Math.max(0, (target.stubbornness || 0) - 15);
        rel.addReceptivity(target.id, 15, 'Intermediação de Dona Dulce');
        return {
          ok: true,
          msg: `💛 Dona Dulce conversou com ${target.name} (${target.code}): -15 Teimosia e +15% Receptividade!`
        };
      }
    },
    {
      id: 'perk_raimundo_ponte',
      entityId: 'H07',
      title: 'Ponte da Rua Central (Seu Raimundo)',
      desc: 'Seu Raimundo abre portas com vizinhos desconfiados ou revela um horário desconhecido.',
      minBond: 75,
      minReceptivity: 60,
      execute(g, rel) {
        const unknown = g.families.find(f => !f.knownSchedule);
        if (unknown) {
          unknown.knownSchedule = true;
          g.schedulesDiscoveredCount++;
          g.unreadNotifs++;
          return {
            ok: true,
            msg: `🗺️ Seu Raimundo descobriu o horário da ${unknown.code} (${unknown.name}): ${unknown.scheduleText}!`
          };
        }
        const target = g.families.find(f => f.id === 'H04') || g.families.find(f => f.id === 'H14');
        if (target) {
          rel.addReceptivity(target.id, 18, 'Convite de Seu Raimundo');
          return {
            ok: true,
            msg: `🤝 Seu Raimundo quebrou o gelo com ${target.name} (+18% Receptividade)!`
          };
        }
        return { ok: false, msg: 'Território já mapeado.' };
      }
    },
    {
      id: 'perk_digao_olheiro',
      entityId: 'H11',
      title: 'Olheiro das Ruas (Digão)',
      desc: 'Nas entregas de moto, Digão mapeia até 2 horários desconhecidos no território.',
      minBond: 55,
      minReceptivity: 50,
      execute(g) {
        const unknowns = g.families.filter(f => !f.knownSchedule).slice(0, 2);
        if (unknowns.length === 0) {
          return { ok: false, msg: 'Todos os 15 horários da microárea já estão mapeados!' };
        }
        unknowns.forEach(f => {
          f.knownSchedule = true;
          g.schedulesDiscoveredCount++;
          g.unreadNotifs++;
        });
        return {
          ok: true,
          msg: `🛵 Digão confirmou horários de ${unknowns.map(u => u.code).join(' e ')} no seu Tablet!`
        };
      }
    },
    {
      id: 'perk_ze_recados',
      entityId: 'npc_seu_ze',
      title: 'Recado no Balcão (Seu Zé)',
      desc: 'Seu Zé avisa trabalhadores noturnos (H02, H03, H06, H11) que você passou procurando com respeito (+12% Receptividade).',
      minBond: 55,
      minReceptivity: 55,
      execute(_g, rel) {
        ['H02', 'H03', 'H06', 'H11'].forEach(id => rel.addReceptivity(id, 12, 'Recado do Seu Zé'));
        return {
          ok: true,
          msg: '🏪 Seu Zé deixou recado amigo no balcão! Trabalhadores estão +12% receptivos.'
        };
      }
    },
    {
      id: 'perk_lucas_informativo',
      entityId: 'H13',
      title: 'Vídeo Curto da Vila (Lucas)',
      desc: 'Lucas edita um informativo acolhedor que aumenta a receptividade das famílias jovens (H03, H08, H15).',
      minBond: 60,
      minReceptivity: 55,
      execute(_g, rel) {
        ['H03', 'H08', 'H15'].forEach(id => rel.addReceptivity(id, 12, 'Informativo do Lucas'));
        return {
          ok: true,
          msg: '🎥 Vídeo curto do Lucas circulou bem! H03, H08 e H15 ganharam +12% de Receptividade.'
        };
      }
    },
    {
      id: 'perk_bete_mutirao',
      entityId: 'npc_tia_bete',
      title: 'Mobilização da Associação (Tia Bete)',
      desc: 'Tia Bete articula lideranças da Rua dos Ipês (+12% Receptividade em H05, H07, H12, H14).',
      minBond: 55,
      minReceptivity: 55,
      execute(g, rel) {
        ['H05', 'H07', 'H12', 'H14'].forEach(id => rel.addReceptivity(id, 12, 'Apoio da Associação'));
        if (g.storyState) g.storyState.addPosture('articulacao', 1);
        return {
          ok: true,
          msg: '🏛️ Tia Bete mobilizou a vizinhança! (+12% Receptividade em H05, H07, H12, H14)'
        };
      }
    }
  ];

  class RelationshipSystem {
    constructor(game) {
      this.game = game;
      this.entities = {};
      this.usedPerksToday = new Set();
      this.reset();
      this._bindEvents();
    }

    reset() {
      this.entities = {};
      this.usedPerksToday = new Set();

      const g = this.game;
      (g.families || []).forEach(fam => {
        const baseReceptivity = global.ACSEngine.clamp(100 - Math.round((fam.stubbornness || 0) * 0.65), 25, 95);
        this.entities[fam.id] = {
          receptivity: baseReceptivity,
          interactions: 0,
          lastStyle: null,
          styleRevealed: fam.archetype === 'AMIGO'
        };
      });

      Object.keys(CHARACTER_PROFILES).forEach(id => {
        if (!this.entities[id]) {
          this.entities[id] = {
            receptivity: 65,
            interactions: 0,
            lastStyle: null,
            styleRevealed: false
          };
        }
      });
    }

    _bindEvents() {
      const g = this.game;
      if (!g.events) return;
      g.events.on('day:started', () => {
        this.usedPerksToday.clear();
        // Gentle daily normalization of receptivity toward baseline
        for (const id of Object.keys(this.entities)) {
          const entry = this.entities[id];
          const fam = (g.families || []).find(f => f.id === id);
          const baseline = fam
            ? global.ACSEngine.clamp(100 - Math.round((fam.stubbornness || 0) * 0.65), 25, 95)
            : 65;
          if (entry.receptivity < baseline) {
            entry.receptivity = Math.min(baseline, entry.receptivity + 6);
          }
        }
      });
    }

    getProfile(entityId) {
      return CHARACTER_PROFILES[entityId] || {
        preferredStyle: 'escuta',
        averseStyle: 'tecnica',
        note: 'Morador da Vila Esperança.'
      };
    }

    getStyleMeta(styleId) {
      return COMMUNICATION_STYLES[styleId] || COMMUNICATION_STYLES.escuta;
    }

    _ensureEntity(entityId) {
      if (!entityId) return null;
      if (!this.entities[entityId]) {
        this.entities[entityId] = {
          receptivity: 60,
          interactions: 0,
          lastStyle: null,
          styleRevealed: false
        };
      }
      return this.entities[entityId];
    }

    getBaseReceptivity(entityId) {
      const ent = this._ensureEntity(entityId);
      return ent ? ent.receptivity : 60;
    }

    // Contextual receptivity considers informal spaces (Feira/Dominó/Vendinha) & evening hours
    getContextualReceptivity(entityId) {
      const g = this.game;
      let val = this.getBaseReceptivity(entityId);
      const fam = (g.families || []).find(f => f.id === entityId);
      if (fam) {
        if (g.schedule) {
          const loc = g.schedule.getFamilyLocation(fam);
          if (['PRACA_DOMINO', 'PRACA_FEIRA', 'VENDINHA', 'ASSOCIACAO'].includes(loc.type)) {
            val += 12;
          }
        }
        if (fam.archetype === 'TRABALHADOR' && g.timeMinutes >= 18 * 60) {
          val += 8;
        }
      }
      return global.ACSEngine.clamp(val, 5, 100);
    }

    getReceptivityLabel(score) {
      if (score >= 75) return 'Muito Aberta';
      if (score >= 50) return 'Receptiva';
      if (score >= 30) return 'Cautelosa';
      return 'Fechada';
    }

    addReceptivity(entityId, delta, _reason = '') {
      const ent = this._ensureEntity(entityId);
      if (!ent) return 60;
      ent.receptivity = global.ACSEngine.clamp(ent.receptivity + Number(delta || 0), 5, 100);
      return ent.receptivity;
    }

    isStyleRevealed(entityId) {
      const ent = this._ensureEntity(entityId);
      return !!(ent && ent.styleRevealed);
    }

    revealStyle(entityId) {
      const ent = this._ensureEntity(entityId);
      if (ent) ent.styleRevealed = true;
    }

    inferStyleFromChoice(choice) {
      if (!choice) return 'escuta';
      if (choice.style && COMMUNICATION_STYLES[choice.style]) return choice.style;
      const intent = String(choice.intent || '').toLowerCase();
      if (intent.includes('técnic') || intent.includes('protocolo') || intent.includes('meta') || intent.includes('dados')) {
        return 'tecnica';
      }
      if (intent.includes('articul') || intent.includes('mutirão') || intent.includes('comunid') || intent.includes('rede') || intent.includes('vizinh')) {
        return 'articulacao';
      }
      if (intent.includes('prátic') || intent.includes('acordo') || intent.includes('diret') || intent.includes('firme')) {
        return 'pratica';
      }
      if (choice.type === 'EDUCATE') return 'tecnica';
      if (choice.type === 'AUTHORITARIAN') return 'confronto';
      return 'escuta';
    }

    recordInteraction(entityId, choiceOrStyle, isPositive = true) {
      const ent = this._ensureEntity(entityId);
      if (!ent) return { deltaReceptivity: 0, bondBonus: 0, matchedPreferred: false, matchedAverse: false };

      const style = typeof choiceOrStyle === 'string'
        ? choiceOrStyle
        : this.inferStyleFromChoice(choiceOrStyle);
      const profile = this.getProfile(entityId);

      ent.interactions++;
      ent.lastStyle = style;

      let deltaReceptivity = isPositive ? 4 : -14;
      let bondBonus = 0;
      let matchedPreferred = false;
      let matchedAverse = false;

      if (style === 'confronto') {
        deltaReceptivity -= 10;
        matchedAverse = true;
      } else if (style === profile.preferredStyle) {
        deltaReceptivity += 8;
        bondBonus = 3;
        matchedPreferred = true;
        ent.styleRevealed = true;
      } else if (style === profile.averseStyle) {
        deltaReceptivity -= 6;
        bondBonus = -2;
        matchedAverse = true;
      }

      if (ent.interactions >= 2) {
        ent.styleRevealed = true;
      }

      ent.receptivity = global.ACSEngine.clamp(ent.receptivity + deltaReceptivity, 5, 100);

      return {
        style,
        deltaReceptivity,
        bondBonus,
        matchedPreferred,
        matchedAverse,
        receptivity: ent.receptivity
      };
    }

    getBondScore(entityId) {
      const g = this.game;
      if (g.storyState) return g.storyState.getEntityBond(entityId);
      const fam = (g.families || []).find(f => f.id === entityId);
      return fam ? fam.bond : 50;
    }

    getAvailablePerks() {
      return COOPERATION_PERKS.map(p => {
        const bond = this.getBondScore(p.entityId);
        const rec = this.getContextualReceptivity(p.entityId);
        const unlocked = bond >= p.minBond && rec >= p.minReceptivity;
        const usedToday = this.usedPerksToday.has(p.id);
        return {
          ...p,
          bond,
          receptivity: rec,
          unlocked,
          usedToday
        };
      });
    }

    usePerk(perkId) {
      const g = this.game;
      const perk = COOPERATION_PERKS.find(p => p.id === perkId);
      if (!perk) return { ok: false, msg: 'Cooperação não encontrada.' };
      if (this.usedPerksToday.has(perkId)) {
        return { ok: false, msg: 'Esta cooperação já foi acionada hoje.' };
      }
      const bond = this.getBondScore(perk.entityId);
      const rec = this.getContextualReceptivity(perk.entityId);
      if (bond < perk.minBond || rec < perk.minReceptivity) {
        return { ok: false, msg: `Requer Vínculo ≥ ${perk.minBond}% e Receptividade ≥ ${perk.minReceptivity}%.` };
      }
      const result = perk.execute(g, this);
      if (result.ok) {
        this.usedPerksToday.add(perkId);
        if (g.events) {
          g.events.emit('relationship:perkUsed', { perkId, entityId: perk.entityId, msg: result.msg });
        }
        if (g.toast) g.toast(result.msg, 'success');
        if (global.sfx && typeof global.sfx.bondUp === 'function') global.sfx.bondUp();
        g.updateHUD();
        g.saveProgress();
      } else if (g.toast) {
        g.toast(result.msg, 'info');
      }
      return result;
    }

    exportState() {
      return {
        entities: JSON.parse(JSON.stringify(this.entities)),
        usedPerksToday: Array.from(this.usedPerksToday)
      };
    }

    importState(data) {
      this.reset();
      if (!data || typeof data !== 'object') return;
      if (data.entities && typeof data.entities === 'object') {
        for (const id of Object.keys(data.entities)) {
          const src = data.entities[id];
          if (!src) continue;
          this.entities[id] = {
            receptivity: global.ACSEngine.clamp(Number(src.receptivity) || 60, 5, 100),
            interactions: Math.max(0, Number(src.interactions) || 0),
            lastStyle: src.lastStyle || null,
            styleRevealed: !!src.styleRevealed
          };
        }
      }
      this.usedPerksToday = new Set(Array.isArray(data.usedPerksToday) ? data.usedPerksToday : []);
    }
  }

  global.RelationshipSystem = RelationshipSystem;
  global.ACS_COMMUNICATION_STYLES = COMMUNICATION_STYLES;
  global.ACS_CHARACTER_PROFILES = CHARACTER_PROFILES;
  global.ACS_COOPERATION_PERKS = COOPERATION_PERKS;
})(window);

// ============================================================================
// TERRITÓRIO VIVO — MODULAR ENDING ASSEMBLER (Etapa H4)
// ============================================================================
// Compõe o desfecho da campanha nos 4 pilares da NarrativeMemory:
//   1. UBS Vila Esperança
//   2. Horta Comunitária & Associação
//   3. Coesão das Famílias & Microárea 04
//   4. Postura & Legado de Alex
// E prepara a transição fluida para o Modo Livre Pós-Campanha (Capítulo 5).

(function (global) {
  'use strict';

  class EndingAssembler {
    constructor(game) {
      this.game = game;
    }

    assemble() {
      const g = this.game;
      const story = g.storyState;
      const ws = g.worldState;
      const flags = (story && story.storyFlags) || {};
      const dom = story ? story.getDominantPosture() : { axis: 'acolhimento', value: 0 };

      // 1. Pilar UBS Vila Esperança
      const cap1 = flags.cap1_ubs_postura || 'mediacao';
      const cap3 = flags.cap3_decisao || 'assembleia_aberta';
      const ubsMural = ws ? ws.getUBSMural() : 'default';
      const guicheOk = !!flags.qs_balanco_guiche_ok;
      const ubsBondAvg = Math.round(
        (['medico', 'enfermeira_marina', 'escriturario', 'limpeza', 'acs_joana']
          .reduce((acc, id) => acc + (story ? story.getNpcBond(id) : 50), 0)) / 5
      );

      let ubsTier = 'resiliente';
      let ubsTitle = 'UBS em Reconstrução Pactuada';
      let ubsText = 'A equipe da UBS Vila Esperança segurou a pressão do dia a dia e abriu canais de diálogo com o guichê e a enfermagem, mesmo diante das limitações estruturais.';
      if (cap3 === 'assembleia_aberta' && (ubsMural === 'acolhimento' || guicheOk || ubsBondAvg >= 55)) {
        ubsTier = 'transformadora';
        ubsTitle = 'UBS Aberta e Territorializada';
        ubsText = 'Com coragem coletiva, o dossiê real da Microárea 04 foi defendido em praça pública. O mural de acolhimento, os encaixes pactuados no guichê e o entrosamento da Sala ESF blindaram a equipe com apoio do próprio bairro.';
      } else if (cap3 === 'relatorio_rapido' && cap1 === 'protocolo') {
        ubsTier = 'sobrecarregada';
        ubsTitle = 'UBS Blindada no Papel, Tensa na Porta';
        ubsText = 'Os protocolos formais e o relatório enxuto evitaram cortes imediatos na equipe, mas a distância entre o balcão e a espera exigirá paciência contínua para reconstruir confiança.';
      }

      // 2. Pilar Horta Comunitária & Associação
      const hortaStage = ws ? ws.getHortaStage() : 0;
      const beteAlly = !!flags.tia_bete_ally;
      const canteiroOk = !!flags.qs_canteiro_domino_ok;
      const baixadaOk = !!flags.qs_sombra_baixada_ok;
      const beteBond = story ? story.getNpcBond('npc_tia_bete') : 40;

      let hortaTier = 'em_construcao';
      let hortaTitle = 'Canteiros em Movimento';
      let hortaText = 'A parceria entre Associação de Moradores, Vendinha e UBS começou a tirar os projetos do papel na Rua dos Ipês.';
      if (hortaStage >= 3 || (hortaStage >= 2 && beteAlly && (canteiroOk || beteBond >= 60))) {
        hortaTier = 'florescendo';
        hortaTitle = 'Horta Viva & Associação Protagonista';
        hortaText = 'Os 10 canteiros voltaram a produzir com torneira consertada, mutirões aos sábados e idosos da fisioterapia trabalhando lado a lado com Tia Bete. A Associação consolidou-se como extensão viva do cuidado.';
      } else if (hortaStage <= 1 && !canteiroOk) {
        hortaTier = 'incipiente';
        hortaTitle = 'Semente Lançada na Associação';
        hortaText = 'Os primeiros passos da Horta e do diálogo comunitário ficaram plantados, mas ainda dependem de novos mutirões no Modo Livre para ganhar fôlego completo.';
      }

      // 3. Pilar Coesão das Famílias & Microárea 04
      const famAvg = g.getCommunityBondAverage ? g.getCommunityBondAverage() : 50;
      const alliedFamilies = (g.families || []).filter(f => f.bond >= 70).length;
      const cluesCount = ws ? ws.getCluesFound().length : 0;
      const dengueCleared = g.dengueClearedCount || 0;
      const turnoNoiteOk = !!flags.qs_turno_noite_ok;

      let famTier = 'confianca_crescente';
      let famTitle = 'Vínculos em Crescimento';
      let famText = `As 15 famílias da Microárea 04 (${famAvg}% de vínculo médio) passaram a reconhecer o colete azul como presença constante, com ${dengueCleared} focos de dengue eliminados.`;
      if (famAvg >= 60 || alliedFamilies >= 4 || (cluesCount >= 3 && turnoNoiteOk)) {
        famTier = 'rede_viva';
        famTitle = 'Rede Solidária da Microárea 04';
        famText = `Com ${famAvg}% de vínculo comunitário e ${alliedFamilies} famílias aliadas próximas, a Microárea 04 deixou de ser apenas uma lista de endereços: trabalhadores noturnos, idosos do dominó e mães da baixada passaram a caminhar juntos com a ESF.`;
      } else if (famAvg < 45) {
        famTier = 'cuidado_pontual';
        famTitle = 'Portas Ainda Cautelosas';
        famText = `A rotina pesada manteve parte das casas distante (${famAvg}% de vínculo médio), deixando espaço aberto para você aprofundar visitas e histórias no Modo Livre.`;
      }

      // 4. Pilar Postura & Legado de Alex
      const postureMap = {
        acolhimento: {
          title: 'O Elo da Escuta',
          text: 'Sua marca registrada foi escutar antes de prescrever. Famílias e colegas sabem que, com Alex, ninguém é reduzido a um número de prontuário.'
        },
        articulacao: {
          title: 'O Articulador de Pontes',
          text: 'Você transformou queixas isoladas em ação coletiva — conectando guichê, Vendinha, Associação, Horta e Pracinha em torno de soluções reais.'
        },
        firmeza: {
          title: 'O Guardião do Território',
          text: 'Com serenidade e firmeza ética, você sustentou posições difíceis para proteger o cuidado contínuo mesmo sob pressão.'
        },
        burocracia: {
          title: 'O Estrategista da Rede',
          text: 'Você organizou registros, metas e fluxos para provar com dados concretos a importância da Saúde da Família na Vila Esperança.'
        }
      };
      const alexInfo = postureMap[dom.axis] || postureMap.acolhimento;

      const heartEventsDone = [
        'evt_heart_joana_esf',
        'evt_heart_ze_caderno',
        'evt_heart_tiao_domino',
        'evt_heart_carla_escola',
        'evt_heart_lucas_pracinha',
        'evt_heart_tia_bete_horta',
        'evt_heart_marina_sueli_ubs'
      ].filter(id => story && story.isEventCompleted(id)).length;

      const scoreCount =
        (ubsTier === 'transformadora' ? 2 : ubsTier === 'resiliente' ? 1 : 0) +
        (hortaTier === 'florescendo' ? 2 : hortaTier === 'em_construcao' ? 1 : 0) +
        (famTier === 'rede_viva' ? 2 : famTier === 'confianca_crescente' ? 1 : 0);

      let overallTitle = 'Território em Movimento';
      let subtitle = 'A Vila Esperança descobriu que cuidar é um verbo coletivo.';
      if (scoreCount >= 5) {
        overallTitle = 'Vila Esperança: Território Vivo e Pactuado';
        subtitle = 'UBS, Horta, Vendinha, Associação e famílias teceram uma rede histórica de cuidado.';
      } else if (scoreCount <= 2) {
        overallTitle = 'Primeiros Alicerces na Vila Esperança';
        subtitle = 'A caminhada foi dura, mas as sementes da mudança ficaram abertas na comunidade.';
      }

      return {
        overallTitle,
        subtitle,
        scoreCount,
        pillars: [
          { id: 'ubs', icon: '🏥', label: 'UBS Vila Esperança', tier: ubsTier, title: ubsTitle, text: ubsText },
          { id: 'horta', icon: '🌱', label: 'Horta & Associação', tier: hortaTier, title: hortaTitle, text: hortaText },
          { id: 'familias', icon: '🏡', label: 'Famílias da Microárea 04', tier: famTier, title: famTitle, text: famText },
          { id: 'alex', icon: '🦺', label: 'Legado de Alex', tier: dom.axis, title: alexInfo.title, text: alexInfo.text }
        ],
        stats: {
          weekNumber: g.weekNumber || 1,
          famAvg,
          ubsBondAvg,
          hortaStage,
          cluesCount,
          dengueCleared,
          heartEventsDone,
          baixadaOk,
          guicheOk,
          canteiroOk,
          turnoNoiteOk,
          questsCompleted: story && Array.isArray(story.quests.completed) ? story.quests.completed.length : 0
        }
      };
    }

    renderEndingHtml() {
      const data = this.assemble();
      const pillarsHtml = data.pillars.map(p => `
        <div class="feature-item">
          <strong>${p.icon} ${p.label} — ${p.title}</strong>
          <p style="margin-top:4px;font-size:13px;line-height:1.45">${p.text}</p>
        </div>
      `).join('');

      return `
        <div style="text-align:center;margin-bottom:10px">
          <div style="display:inline-block;padding:4px 12px;border-radius:999px;background:#fef3c7;border:2px solid #d97706;color:#92400e;font-weight:800;font-size:12px;margin-bottom:6px">
            🌅 EPÍLOGO • MODO HISTÓRIA CONCLUÍDO
          </div>
          <h1 style="margin:2px 0">${data.overallTitle}</h1>
          <h2 style="margin:2px 0 8px 0;font-size:15px">${data.subtitle}</h2>
        </div>
        <div class="kpi-grid" style="margin-bottom:12px">
          <div class="kpi-card"><div class="kpi-num">${data.stats.famAvg}%</div><div class="kpi-label">Vínculo das Famílias</div></div>
          <div class="kpi-card"><div class="kpi-num">${data.stats.hortaStage}/3</div><div class="kpi-label">Estágio da Horta</div></div>
          <div class="kpi-card"><div class="kpi-num">${data.stats.cluesCount}/5</div><div class="kpi-label">Pistas do Bairro</div></div>
          <div class="kpi-card"><div class="kpi-num">${data.stats.heartEventsDone}/7</div><div class="kpi-label">Heart Events</div></div>
        </div>
        <div class="feature-grid">
          ${pillarsHtml}
        </div>
      `;
    }
  }

  global.EndingAssembler = EndingAssembler;
})(window);

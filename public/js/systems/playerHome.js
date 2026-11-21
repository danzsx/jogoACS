// ============================================================================
// TERRITÓRIO VIVO — PROTAGONIST'S HOME INTERIOR (PLAYER_HOME — Phase 1)
// ============================================================================
// Cozy Brazilian peripheral home inside Vila Esperança where the ACS wakes up,
// drinks filtered clay-pot water, brews morning coffee, reviews weekly notes,
// naps or sleeps to advance the day/week.

(function (global) {
  'use strict';

  const T = 32;

  class PlayerHomeSystem {
    constructor(game) {
      this.game = game;
      this.coffeeUsedToday = false;

      this.room = {
        id: 'PLAYER_HOME',
        title: '🏡 Casa do ACS',
        cols: 18,
        rows: 13,
        width: 18 * T,   // 576
        height: 13 * T,  // 416
        spawn: { x: 9 * T, y: 10.2 * T, dir: 'up' },
        wakeSpawn: { x: 4.8 * T, y: 6.4 * T, dir: 'down' }
      };

      this.furniture = [
        { sprite: 'homeBed', x: 3.1 * T, y: 5.5 * T },
        { sprite: 'homeDesk', x: 9.0 * T, y: 4.7 * T },
        { sprite: 'homeKitchen', x: 14.3 * T, y: 4.8 * T },
        { sprite: 'clayFilter', x: 15.8 * T, y: 7.4 * T },
        { sprite: 'pottedPlant', x: 2.2 * T, y: 10.8 * T },
        { sprite: 'pottedPlant', x: 15.8 * T, y: 10.8 * T }
      ];

      this.colliders = [
        [2.0 * T, 3.6 * T, 4.2 * T, 5.8 * T],   // Bed
        [7.7 * T, 3.7 * T, 10.3 * T, 5.0 * T],  // Desk
        [12.9 * T, 3.7 * T, 15.7 * T, 5.1 * T], // Kitchen counter & stove
        [15.2 * T, 6.5 * T, 16.4 * T, 7.6 * T], // Clay filter
        [1.7 * T, 10.1 * T, 2.7 * T, 11.0 * T], // Plant left
        [15.3 * T, 10.1 * T, 16.3 * T, 11.0 * T] // Plant right
      ];

      this.roomCanvas = this.bakeHomeRoom();
    }

    bakeHomeRoom() {
      const room = this.room;
      const c = document.createElement('canvas');
      c.width = room.width;
      c.height = room.height;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const pa = global.pixelArt;

      // 1. Warm honey-wood floor
      for (let r = 3; r < room.rows - 1; r++) {
        for (let col = 1; col < room.cols - 1; col++) {
          ctx.drawImage(pa.interior.esfFloor[(r + col) % 2], col * T, r * T);
        }
      }

      // Woven Brazilian rag rug in center of room with subtle fringe & woven pattern
      const rx = 6.5 * T;
      const ry = 6.8 * T;
      const rw = 5 * T;
      const rh = 2.8 * T;
      ctx.fillStyle = 'rgba(26, 15, 8, 0.25)';
      ctx.fillRect(rx - 2, ry + 3, rw + 4, rh);
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(rx - 2, ry - 2, rw + 4, rh + 4);
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(rx + 5, ry + 5, rw - 10, rh - 10);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(rx + 10, ry + 10, rw - 20, rh - 20);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(rx + 16, ry + 16, rw - 32, rh - 32);
      // Woven stripes & fringe tassels
      ctx.fillStyle = '#38bdf8';
      for (let sx = rx + 22; sx < rx + rw - 22; sx += 10) {
        ctx.fillRect(sx, ry + 18, 4, rh - 36);
      }
      ctx.fillStyle = '#e7dcc5';
      for (let fy = ry + 4; fy < ry + rh - 4; fy += 6) {
        ctx.fillRect(rx - 5, fy, 3, 3);
        ctx.fillRect(rx + rw + 2, fy, 3, 3);
      }

      // 2. Textured cream plaster walls + wood baseboard & perimeter timber
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(0, 0, room.width, 14);
      ctx.fillStyle = '#7a5238';
      ctx.fillRect(0, 14, room.width, 10);
      ctx.fillStyle = '#9c6b43';
      ctx.fillRect(0, 14, room.width, 2);
      ctx.fillStyle = '#f8efd8';
      ctx.fillRect(T, 24, room.width - 2 * T, 58);
      // Subtle plaster dappling
      for (let py = 28; py < 78; py += 6) {
        for (let px0 = T + 8; px0 < room.width - T - 8; px0 += 14) {
          if (pa.rand(px0 * 17 + py * 29) > 0.58) {
            ctx.fillStyle = '#ebe0c5';
            ctx.fillRect(px0, py, 4, 2);
          }
        }
      }
      ctx.fillStyle = '#b57b4a';
      ctx.fillRect(T, 82, room.width - 2 * T, 14);
      ctx.fillStyle = '#d4a373';
      ctx.fillRect(T, 82, room.width - 2 * T, 2);
      ctx.fillStyle = '#5c381c';
      ctx.fillRect(T, 94, room.width - 2 * T, 2);

      // Left, Right & Bottom Perimeter Walls with timber trim
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(0, 0, T, room.height);
      ctx.fillRect(room.width - T, 0, T, room.height);
      ctx.fillRect(0, room.height - T, room.width, T);
      ctx.fillStyle = '#8c5a32';
      ctx.fillRect(6, 14, T - 12, room.height - 20);
      ctx.fillRect(room.width - T + 6, 14, T - 12, room.height - 20);
      ctx.fillRect(6, room.height - T + 6, room.width - 12, T - 12);
      ctx.fillStyle = '#b57b4a';
      ctx.fillRect(6, 14, 2, room.height - 20);
      ctx.fillRect(room.width - T + 6, 14, 2, room.height - 20);
      ctx.fillRect(6, room.height - T + 6, room.width - 12, 2);

      // Wall-to-Floor Ambient Occlusion (soft depth along wall bases & corners)
      const aoTop = ctx.createLinearGradient(0, 3 * T, 0, 3 * T + 12);
      aoTop.addColorStop(0, 'rgba(32, 18, 10, 0.34)');
      aoTop.addColorStop(1, 'rgba(32, 18, 10, 0)');
      ctx.fillStyle = aoTop;
      ctx.fillRect(T, 3 * T, room.width - 2 * T, 12);

      ctx.fillStyle = 'rgba(32, 18, 10, 0.16)';
      ctx.fillRect(T, 3 * T, 6, room.height - 4 * T);
      ctx.fillRect(room.width - T - 6, 3 * T, 6, room.height - 4 * T);
      ctx.fillRect(T, room.height - T - 6, room.width - 2 * T, 6);

      // 3. Detailed Back Windows & Wall Decor
      [6 * T, 11.5 * T].forEach(wx => {
        ctx.fillStyle = '#2b1b12';
        ctx.fillRect(wx - 4, 26, 48, 40);
        ctx.fillStyle = '#8c5a32';
        ctx.fillRect(wx - 2, 28, 44, 36);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(wx, 30, 40, 32);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(wx + 4, 34, 10, 10);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(wx + 19, 30, 2, 32);
        ctx.fillRect(wx, 45, 40, 2);
        // Sill bevel & shadow
        ctx.fillStyle = '#cfa06b';
        ctx.fillRect(wx - 3, 62, 46, 3);
        ctx.fillStyle = 'rgba(32, 18, 10, 0.28)';
        ctx.fillRect(wx - 2, 66, 44, 3);
      });

      // Home plaque
      ctx.font = 'bold 11px Trebuchet MS';
      const label = '🏡 CASA DO ACS — VILA ESPERANÇA';
      const pw = ctx.measureText(label).width + 18;
      const bx = Math.round(room.width / 2 - pw / 2);
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(bx - 2, 2, pw + 4, 20);
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(bx, 4, pw, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, bx + 9, 16);

      // 4. Front Exit Doorway (Bottom Center, cols 8..10)
      ctx.fillStyle = '#6b3e1f';
      ctx.fillRect(8 * T - 2, room.height - T, 2 * T + 4, T);
      ctx.fillStyle = '#b57b4a';
      ctx.fillRect(8 * T + 2, room.height - T + 4, 2 * T - 4, T - 8);
      // Welcome mat
      ctx.fillStyle = '#2b1b12';
      ctx.fillRect(8 * T - 3, 11 * T + 3, 2 * T + 6, 26);
      ctx.fillStyle = '#035388';
      ctx.fillRect(8 * T - 2, 11 * T + 4, 2 * T + 4, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(8 * T + 2, 11 * T + 8, 2 * T - 4, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Trebuchet MS';
      ctx.fillText('SAIR', 8 * T + 18, 11 * T + 20);

      return c;
    }

    getBounds() {
      return {
        width: this.room.width,
        height: this.room.height,
        minX: T + 12,
        maxX: this.room.width - T - 12,
        minY: 3 * T + 12,
        maxY: this.room.height - T - 4
      };
    }

    getMinimapTitle() {
      return '🏡 Casa do ACS';
    }

    getFootstepTile() {
      return 'H';
    }

    enterHome(wakeUp = false) {
      const sp = wakeUp ? this.room.wakeSpawn : this.room.spawn;
      this.game.sceneManager.enter('PLAYER_HOME', {
        x: sp.x,
        y: sp.y,
        dir: sp.dir,
        silent: wakeUp,
        toast: wakeUp ? null : '🏡 Lar doce lar! Descanse, tome um café ou durma para encerrar o dia.'
      });
    }

    exitHome() {
      const home = window.ACS_DATA.playerHome;
      this.game.sceneManager.enter('OVERWORLD', {
        x: home.x,
        y: home.y + 22,
        dir: 'down',
        toast: '🌤️ Você saiu de casa para a Vila Esperança!'
      });
    }

    resetDaily() {
      this.coffeeUsedToday = false;
    }

    collides(_sceneId, px, py) {
      const b = this.getBounds();
      if (px < b.minX || px > b.maxX || py < b.minY || py > b.maxY) return true;
      for (const [x1, y1, x2, y2] of this.colliders) {
        if (px > x1 - 8 && px < x2 + 8 && py > y1 - 4 && py < y2 + 6) return true;
      }
      return false;
    }

    getStations() {
      const canSleep = this.game.timeMinutes >= 17 * 60;
      return [
        {
          id: 'home_exit',
          x: 9.0 * T,
          y: 11.4 * T,
          radius: 56,
          promptY: 10.5 * T,
          label: '[E] Sair para a Vila Esperança',
          action: () => this.exitHome()
        },
        {
          id: 'home_bed',
          x: 4.5 * T,
          y: 5.7 * T,
          radius: 62,
          promptY: 4.0 * T,
          label: canSleep ? '[E] Dormir e Encerrar o Dia' : '[E] Cochilar 1h (+25 Energia)',
          action: () => this.useBed()
        },
        {
          id: 'home_filter',
          x: 15.0 * T,
          y: 7.4 * T,
          radius: 56,
          promptY: 6.1 * T,
          label: '[E] Filtro de Barro (Água & Garrafa)',
          action: () => this.useClayFilter()
        },
        {
          id: 'home_coffee',
          x: 14.3 * T,
          y: 5.4 * T,
          radius: 56,
          promptY: 3.7 * T,
          label: this.coffeeUsedToday ? '[E] Cantinho do Café (Já tomou hoje)' : '[E] Tomar Café Coado (+20 Energia)',
          action: () => this.useCoffeeCorner()
        },
        {
          id: 'home_desk',
          x: 9.0 * T,
          y: 5.3 * T,
          radius: 56,
          promptY: 3.7 * T,
          label: '[E] Caderno de Campo (Pistas & Relações)',
          action: () => {
            if (this.game.notebook) {
              this.game.notebook.toggle(true);
            } else {
              this.game.activeTabletTab = 'mission';
              this.game.toggleTablet(true);
            }
          }
        }
      ];
    }

    checkNearbyInteractions() {
      const g = this.game;
      g.nearTarget = null;
      for (const st of this.getStations()) {
        if (Math.hypot(g.player.x - st.x, g.player.y - st.y) < st.radius) {
          g.nearTarget = {
            type: 'HOME_STATION',
            station: st,
            x: st.x,
            y: st.promptY,
            label: st.label
          };
          return;
        }
      }
    }

    triggerInteraction() {
      const t = this.game.nearTarget;
      if (!t || t.type !== 'HOME_STATION') return false;
      t.station.action();
      return true;
    }

    useBed() {
      const g = this.game;
      if (g.animations && g.animations.isPlaying('sleep')) return;

      if (g.timeMinutes >= 17 * 60) {
        g.sleepToNextDay('SLEEP');
        return;
      }

      // Nap 1 hour before 17:00 with cozy dim-down / ZzzZzz / brighten animation
      const applyNap = () => {
        g.timeMinutes = Math.min(17 * 60, g.timeMinutes + 60);
        g.player.stamina = Math.min(100, g.player.stamina + 25);
        g.updateHUD();
        g.navigation.resolveObjective();
        g.navigation.updateTrackerUI();
        g.saveProgress();
      };

      const finishNap = () => {
        g.setPlayerEmote('heart', 2.2);
        g.toast(`😴 Você tirou um cochilo de 1h (${g.formatClock(g.timeMinutes)}) e recuperou +25 Energia!`, 'success');
      };

      if (g.animations) {
        g.animations.playSleep({
          mode: 'NAP',
          onMidpoint: applyNap,
          onComplete: finishNap
        });
        return;
      }

      applyNap();
      if (global.sfx && typeof global.sfx.rest === 'function') global.sfx.rest();
      finishNap();
    }

    useClayFilter() {
      const g = this.game;
      g.player.hydration = 100;
      g.player.stamina = Math.min(100, g.player.stamina + 12);
      const water = g.inventory.find(i => i.id === 'water');
      if (water) water.count = water.maxCount;
      g.setPlayerEmote('water', 2.2);
      global.sfx.item();
      g.toast('🏺 Água fresquinha do filtro de barro! Hidratação 100% e garrafa cheia.', 'success');
      g.renderHotbar();
      g.updateHUD();
      g.saveProgress();
    }

    useCoffeeCorner() {
      const g = this.game;
      if (this.coffeeUsedToday) {
        g.toast('☕ Você já tomou seu café coado hoje! Na Fase 5 você poderá cozinhar receitas aqui.', 'info');
        return;
      }
      this.coffeeUsedToday = true;
      g.player.stamina = Math.min(100, g.player.stamina + 20);
      g.player.hydration = Math.min(100, g.player.hydration + 10);
      g.setPlayerEmote('heart', 2.2);
      global.sfx.success();
      g.toast('☕ Café coado na hora! (+20 Energia, +10% Hidratação)', 'success');
      g.updateHUD();
      g.saveProgress();
    }

    draw(ctx) {
      const g = this.game;
      ctx.fillStyle = '#1f1610';
      ctx.fillRect(0, 0, g.canvas.width, g.canvas.height);

      const camX = Math.round(g.camera.x);
      const camY = Math.round(g.camera.y);
      const pa = global.pixelArt;

      ctx.save();
      ctx.translate(-camX, -camY);

      ctx.drawImage(this.roomCanvas, 0, 0);

      // Warm afternoon window sunlight pools or evening window tint & desk lamp glow
      const hourFloat = g.timeMinutes / 60;
      if (hourFloat >= 18) {
        ctx.fillStyle = 'rgba(23, 37, 84, 0.72)';
        [6 * T, 11.5 * T].forEach(wx => ctx.fillRect(wx, 30, 40, 32));
        const lampGlow = ctx.createRadialGradient(9.7 * T, 4.1 * T, 6, 9.7 * T, 4.4 * T, 86);
        lampGlow.addColorStop(0, 'rgba(253, 224, 71, 0.24)');
        lampGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = lampGlow;
        ctx.beginPath();
        ctx.arc(Math.round(9.7 * T), Math.round(4.4 * T), 86, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const sunAlpha = hourFloat >= 15 ? 0.16 : 0.11;
        [6 * T + 20, 11.5 * T + 20].forEach(cx => {
          const sunBeam = ctx.createLinearGradient(cx, 3 * T, cx + 18, 5.4 * T);
          sunBeam.addColorStop(0, `rgba(255, 228, 148, ${sunAlpha})`);
          sunBeam.addColorStop(1, 'rgba(255, 228, 148, 0)');
          ctx.fillStyle = sunBeam;
          ctx.fillRect(cx - 18, 3 * T, 46, 2.4 * T);
        });
      }

      const renderList = [];
      for (const f of this.furniture) {
        const spr = pa.interior[f.sprite];
        if (!spr) continue;
        renderList.push({
          sortY: f.y,
          draw: () => ctx.drawImage(spr, Math.round(f.x - spr.width / 2), Math.round(f.y - spr.height + 10))
        });
      }

      // Player
      renderList.push({
        sortY: g.player.y,
        draw: () => {
          const px = Math.round(g.player.x);
          const py = Math.round(g.player.y);
          const ringPulse = 0.55 + 0.25 * Math.sin(g.elapsedTime * 4.5);
          ctx.save();
          ctx.strokeStyle = `rgba(56, 189, 248, ${ringPulse})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(px, py + 1, 14, 6, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          const frames = pa.playerFrames[g.player.dir] || pa.playerFrames.down;
          const safeFrame = global.ACSEngine.safeMod(g.player.animFrame, frames.length);
          const idleBob = g.player.isMoving ? 0 : Math.round(Math.sin(g.elapsedTime * 3.2) * 0.6);
          ctx.drawImage(frames[safeFrame], px - 16, py - 42 + idleBob);

          if (g.player.emoteTimer > 0 && g.player.emote && pa.emotes[g.player.emote]) {
            const fy = Math.sin(g.elapsedTime * 6) * 2;
            ctx.drawImage(pa.emotes[g.player.emote], px - 16, Math.round(py - 76 + fy));
          }
        }
      });

      renderList.sort((a, b) => a.sortY - b.sortY);
      for (const item of renderList) item.draw();

      g.navigation.drawWorldOverlay(ctx);

      if (g.nearTarget && !g.paused) {
        g.drawWorldPrompt(ctx, g.nearTarget.x, g.nearTarget.y, g.nearTarget.label);
      }

      ctx.restore();

      // Warm cozy home atmospheric lighting + soft vignette
      const W = g.canvas.width;
      const H = g.canvas.height;
      const grad = ctx.createLinearGradient(0, 0, W, H);
      if (hourFloat >= 18) {
        grad.addColorStop(0, 'rgba(255, 214, 130, 0.08)');
        grad.addColorStop(1, 'rgba(30, 22, 48, 0.14)');
      } else {
        grad.addColorStop(0, 'rgba(255, 240, 198, 0.08)');
        grad.addColorStop(1, 'rgba(42, 26, 16, 0.05)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.32, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
      vig.addColorStop(0, 'rgba(24, 16, 10, 0)');
      vig.addColorStop(1, 'rgba(24, 16, 10, 0.18)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    }

    drawMinimap(ctx, W, H) {
      const g = this.game;
      const room = this.room;
      ctx.fillStyle = '#1f1610';
      ctx.fillRect(0, 0, W, H);

      const scale = Math.min(W / room.width, H / room.height);
      const dw = Math.round(room.width * scale);
      const dh = Math.round(room.height * scale);
      const ox = Math.round((W - dw) / 2);
      const oy = Math.round((H - dh) / 2);

      ctx.drawImage(this.roomCanvas, ox, oy, dw, dh);

      // Bed & exit markers
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(Math.round(ox + 9 * T * scale) - 4, Math.round(oy + 11.4 * T * scale) - 3, 8, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(Math.round(ox + 3.1 * T * scale) - 3, Math.round(oy + 5.5 * T * scale) - 3, 6, 6);

      // Player dot
      const px = Math.round(ox + g.player.x * scale);
      const py = Math.round(oy + g.player.y * scale);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b200f';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    exportState() {
      return { coffeeUsedToday: this.coffeeUsedToday };
    }

    importState(data) {
      if (!data) return;
      this.coffeeUsedToday = !!data.coffeeUsedToday;
    }
  }

  global.PlayerHomeSystem = PlayerHomeSystem;
})(window);

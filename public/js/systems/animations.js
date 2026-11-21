// ============================================================================
// TERRITÓRIO VIVO — CINEMATIC & VISUAL ANIMATION SYSTEM
// ============================================================================
// Extensible animation framework for screen transitions, sleep/wake cycles,
// light dimming/brightening, and future world/UI visual effects.

(function (global) {
  'use strict';

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function easeInOutCubic(t) {
    const x = clamp01(t);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function easeOutCubic(t) {
    const x = clamp01(t);
    return 1 - Math.pow(1 - x, 3);
  }

  function easeInQuad(t) {
    const x = clamp01(t);
    return x * x;
  }

  class AnimationSystem {
    constructor(game) {
      this.game = game;
      this.overlayCanvas = document.getElementById('animation-canvas');
      this.overlayCtx = this.overlayCanvas ? this.overlayCanvas.getContext('2d') : null;
      this.active = null;     // Active blocking/cinematic animation (e.g. sleep)
      this.effects = [];      // Future non-blocking screen/world effects
      this._needsClear = false;
    }

    resize(width, height) {
      if (!this.overlayCanvas) return;
      this.overlayCanvas.width = width;
      this.overlayCanvas.height = height;
      if (this.overlayCtx) {
        this.overlayCtx.imageSmoothingEnabled = false;
      }
    }

    isBlocking() {
      return !!(this.active && this.active.blocking);
    }

    isPlaying(type = null) {
      if (!this.active) return false;
      return type ? this.active.type === type : true;
    }

    _setBlockingDOM(blocking) {
      if (!this.overlayCanvas) return;
      this.overlayCanvas.classList.toggle('blocking', !!blocking);
    }

    // ------------------------------------------------------------------------
    // SLEEP ANIMATION: Fade-out (luz abaixando) -> ZzzZzz -> Fade-in (luz clareando)
    // ------------------------------------------------------------------------
    playSleep(options = {}) {
      if (this.active && this.active.type === 'sleep') return false;

      const mode = options.mode || 'NIGHT'; // 'NIGHT' | 'NAP' | 'LATE_NIGHT' | 'WAKE_ONLY'
      const isNap = mode === 'NAP';
      const isWakeOnly = mode === 'WAKE_ONLY';
      const isNight = mode === 'NIGHT' || mode === 'LATE_NIGHT';
      const stopAtDark = !!options.stopAtDark;

      const g = this.game;
      if (g.input) g.input.clear();
      if (g.navigation) g.navigation.clearWalkTarget();

      // Pre-generate gentle pixel stars for night sleep
      const stars = [];
      if (isNight) {
        for (let i = 0; i < 32; i++) {
          stars.push({
            rx: 0.06 + Math.random() * 0.88,
            ry: 0.06 + Math.random() * 0.52,
            size: Math.random() > 0.65 ? 3 : 2,
            phase: Math.random() * Math.PI * 2,
            speed: 1.8 + Math.random() * 2.4
          });
        }
      }

      const durations = isNap
        ? { dimming: 0.78, sleeping: 1.25, brightening: 0.88 }
        : isWakeOnly
          ? { dimming: 0.01, sleeping: 0.01, brightening: 1.2 }
          : { dimming: 1.15, sleeping: 2.05, brightening: 1.38 };

      const subtitle = mode === 'LATE_NIGHT'
        ? 'Voltando para casa para descansar...'
        : isNap
          ? 'Tirando um cochilo revigorante...'
          : 'Dormindo... descansando para um novo dia';

      const wakeWhisper = isNap ? 'Revigorado!' : 'Bom dia, Vila Esperança!';

      this.active = {
        type: 'sleep',
        mode,
        isNap,
        isNight,
        isWakeOnly,
        stopAtDark,
        blocking: true,
        phase: isWakeOnly ? 'BRIGHTENING' : 'DIMMING',
        phaseTime: 0,
        totalTime: 0,
        durations,
        maxDarkness: isNap ? 0.86 : 0.96,
        subtitle,
        wakeWhisper,
        midpointCalled: isWakeOnly,
        onMidpoint: typeof options.onMidpoint === 'function' ? options.onMidpoint : null,
        onComplete: typeof options.onComplete === 'function' ? options.onComplete : null,
        stars,
        zzzParticles: [],
        zzzSpawnTimer: 0.12,
        zzzIndex: 0
      };

      this._setBlockingDOM(true);
      this._needsClear = true;

      if (isWakeOnly) {
        if (global.sfx && typeof global.sfx.wakeUp === 'function') {
          global.sfx.wakeUp();
        }
      } else if (global.sfx) {
        if (typeof global.sfx.sleepDown === 'function') {
          global.sfx.sleepDown();
        } else if (typeof global.sfx.rest === 'function') {
          global.sfx.rest();
        }
      }

      return true;
    }

    playWakeUp(options = {}) {
      return this.playSleep({ ...options, mode: 'WAKE_ONLY' });
    }

    _spawnZzzParticle(anim, W, H) {
      const letters = ['Z', 'z', 'z', 'Z', 'z', 'z'];
      const char = letters[anim.zzzIndex % letters.length];
      const isBig = char === 'Z';
      anim.zzzIndex++;

      const spreadX = (Math.random() - 0.5) * 68;
      anim.zzzParticles.push({
        char,
        isBig,
        x: W * 0.5 + spreadX,
        y: H * 0.52 + (Math.random() - 0.5) * 16,
        vy: -(34 + Math.random() * 18),
        amp: 14 + Math.random() * 14,
        freq: 2.0 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        age: 0,
        maxAge: 1.55 + Math.random() * 0.45,
        baseSize: isBig ? 34 : 23,
        rotAmp: (Math.random() > 0.5 ? 1 : -1) * (0.08 + Math.random() * 0.08)
      });
    }

    update(dt) {
      // Update any future non-blocking effects
      for (let i = this.effects.length - 1; i >= 0; i--) {
        const fx = this.effects[i];
        fx.age += dt;
        if (fx.update) fx.update(dt);
        if (fx.age >= fx.duration) {
          this.effects.splice(i, 1);
        }
      }

      if (!this.active) return;

      if (this.active.type === 'sleep') {
        this._updateSleep(dt, this.active);
      }
    }

    _updateSleep(dt, anim) {
      const W = this.overlayCanvas ? this.overlayCanvas.width : this.game.canvas.width;
      const H = this.overlayCanvas ? this.overlayCanvas.height : this.game.canvas.height;

      anim.phaseTime += dt;
      anim.totalTime += dt;

      // Update floating Zzz particles
      for (let i = anim.zzzParticles.length - 1; i >= 0; i--) {
        const p = anim.zzzParticles[i];
        p.age += dt;
        p.y += p.vy * dt;
        if (p.age >= p.maxAge) {
          anim.zzzParticles.splice(i, 1);
        }
      }

      if (anim.phase === 'DIMMING') {
        const prog = clamp01(anim.phaseTime / anim.durations.dimming);
        // Start floating Zzz as the lights dim down
        if (prog > 0.45) {
          anim.zzzSpawnTimer -= dt;
          if (anim.zzzSpawnTimer <= 0) {
            this._spawnZzzParticle(anim, W, H);
            anim.zzzSpawnTimer = 0.28;
          }
        }
        if (anim.phaseTime >= anim.durations.dimming) {
          anim.phase = 'SLEEPING';
          anim.phaseTime = 0;
        }
        return;
      }

      if (anim.phase === 'SLEEPING') {
        const prog = clamp01(anim.phaseTime / anim.durations.sleeping);

        // Steady rhythmic ZzzZzz spawns while asleep
        anim.zzzSpawnTimer -= dt;
        if (anim.zzzSpawnTimer <= 0) {
          this._spawnZzzParticle(anim, W, H);
          anim.zzzSpawnTimer = 0.24;
        }

        // Fire midpoint state transition (advance day / time / teleport) while fully dark!
        if (!anim.midpointCalled && prog >= 0.45) {
          anim.midpointCalled = true;
          if (anim.onMidpoint) {
            try {
              anim.onMidpoint();
            } catch (err) {
              console.error('[AnimationSystem] Sleep midpoint callback error:', err);
            }
          }
        }

        if (anim.phaseTime >= anim.durations.sleeping) {
          if (anim.stopAtDark) {
            const doneCb = anim.onComplete;
            this.active = null;
            this._setBlockingDOM(false);
            this._needsClear = true;
            if (doneCb) doneCb();
            return;
          }

          anim.phase = 'BRIGHTENING';
          anim.phaseTime = 0;
          if (global.sfx && typeof global.sfx.wakeUp === 'function') {
            global.sfx.wakeUp();
          }
        }
        return;
      }

      if (anim.phase === 'BRIGHTENING') {
        if (anim.phaseTime >= anim.durations.brightening) {
          const doneCb = anim.onComplete;
          this.active = null;
          this._setBlockingDOM(false);
          this._needsClear = true;
          if (doneCb) doneCb();
        }
      }
    }

    // Hook for future world-space animations (drawn inside game camera transform)
    drawWorld(ctx) {
      for (const fx of this.effects) {
        if (fx.space === 'world' && fx.draw) fx.draw(ctx);
      }
    }

    // Screen-space overlay draw (covers game canvas + HUD cleanly)
    drawOverlay() {
      const ctx = this.overlayCtx || this.game.ctx;
      const W = this.overlayCanvas ? this.overlayCanvas.width : this.game.canvas.width;
      const H = this.overlayCanvas ? this.overlayCanvas.height : this.game.canvas.height;

      if (this.overlayCtx) {
        if (!this.active && this.effects.length === 0) {
          if (this._needsClear) {
            ctx.clearRect(0, 0, W, H);
            this._needsClear = false;
          }
          return;
        }
        ctx.clearRect(0, 0, W, H);
      } else if (!this.active && this.effects.length === 0) {
        return;
      }

      if (this.active && this.active.type === 'sleep') {
        this._drawSleep(ctx, W, H, this.active);
      }

      for (const fx of this.effects) {
        if (fx.space !== 'world' && fx.draw) fx.draw(ctx, W, H);
      }
    }

    _drawSleep(ctx, W, H, anim) {
      let darkness = 0;
      let vignetteStrength = 0;
      let warmLampDim = 0;
      let morningGlow = 0;
      let sleepUiAlpha = 0;
      let wakeWhisperAlpha = 0;

      if (anim.phase === 'DIMMING') {
        const p = clamp01(anim.phaseTime / anim.durations.dimming);
        const eased = easeInOutCubic(p);
        darkness = eased * anim.maxDarkness;
        // Closing light iris as the bedroom lamp dims down
        vignetteStrength = Math.sin(p * Math.PI) * 0.55;
        // Soft warm amber light dimming into cool night
        warmLampDim = Math.sin(clamp01(p * 1.45) * Math.PI) * (anim.isNap ? 0.16 : 0.22);
        sleepUiAlpha = clamp01((p - 0.55) / 0.45);
      } else if (anim.phase === 'SLEEPING') {
        const p = clamp01(anim.phaseTime / anim.durations.sleeping);
        darkness = anim.maxDarkness;
        vignetteStrength = 0.2;
        sleepUiAlpha = 1;
        // Slight warm pre-dawn hint at very end of night sleep
        if (!anim.stopAtDark && p > 0.82) {
          morningGlow = ((p - 0.82) / 0.18) * 0.14;
        }
      } else if (anim.phase === 'BRIGHTENING') {
        const p = clamp01(anim.phaseTime / anim.durations.brightening);
        const lift = easeOutCubic(p);
        darkness = (1 - lift) * anim.maxDarkness;
        // Warm golden morning sunlight blooming as you wake up!
        morningGlow = Math.sin(p * Math.PI) * (anim.isNap ? 0.30 : 0.44);
        sleepUiAlpha = clamp01(1 - p * 3.2);
        // Gentle morning whisper peaks around p = 0.35 then fades cleanly
        if (p > 0.08 && p < 0.78) {
          wakeWhisperAlpha = Math.sin(((p - 0.08) / 0.70) * Math.PI);
        }
      }

      ctx.save();

      // 1. Base night/dimming veil (deep restful indigo-black for night, warm dusk for nap)
      if (darkness > 0.001) {
        ctx.fillStyle = anim.isNap
          ? `rgba(18, 16, 30, ${darkness.toFixed(3)})`
          : `rgba(7, 10, 24, ${darkness.toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }

      // 2. Warm lamp dimming tint during fade-out (luz abaixando)
      if (warmLampDim > 0.005) {
        const lampGrad = ctx.createRadialGradient(W * 0.5, H * 0.45, 20, W * 0.5, H * 0.5, Math.max(W, H) * 0.65);
        lampGrad.addColorStop(0, `rgba(251, 191, 36, ${(warmLampDim * 0.45).toFixed(3)})`);
        lampGrad.addColorStop(0.55, `rgba(180, 83, 9, ${(warmLampDim * 0.35).toFixed(3)})`);
        lampGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = lampGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // 3. Closing radial light vignette during dimming (focuses light down as you drift off)
      if (vignetteStrength > 0.005) {
        const innerR = Math.max(W, H) * (anim.phase === 'DIMMING'
          ? Math.max(0.06, 0.42 * (1 - easeInQuad(clamp01(anim.phaseTime / anim.durations.dimming))))
          : 0.16);
        const outerR = Math.max(W, H) * 0.72;
        const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, innerR, W * 0.5, H * 0.5, outerR);
        vig.addColorStop(0, 'rgba(5, 8, 20, 0)');
        vig.addColorStop(1, `rgba(4, 6, 16, ${vignetteStrength.toFixed(3)})`);
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);
      }

      // 4. Night sky details (twinkling pixel stars + cozy crescent moon)
      if (anim.isNight && sleepUiAlpha > 0.02) {
        this._drawNightSkyDecor(ctx, W, H, anim, sleepUiAlpha);
      }

      // 5. Morning light brightening bloom (luz clareando ao acordar!)
      if (morningGlow > 0.005) {
        const p = anim.phase === 'BRIGHTENING'
          ? clamp01(anim.phaseTime / anim.durations.brightening)
          : 0;
        const bloomRadius = Math.max(W, H) * (0.28 + easeOutCubic(p) * 0.65);
        const sunGrad = ctx.createRadialGradient(W * 0.5, H * 0.42, 12, W * 0.5, H * 0.46, bloomRadius);
        sunGrad.addColorStop(0, `rgba(255, 248, 205, ${(morningGlow * 0.95).toFixed(3)})`);
        sunGrad.addColorStop(0.4, `rgba(253, 214, 118, ${(morningGlow * 0.62).toFixed(3)})`);
        sunGrad.addColorStop(0.75, `rgba(251, 146, 60, ${(morningGlow * 0.25).toFixed(3)})`);
        sunGrad.addColorStop(1, 'rgba(255, 245, 210, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // 6. Floating Zzz particles (rise smoothly across dimming, sleeping & early brightening)
      for (const p of anim.zzzParticles) {
        const life = clamp01(p.age / p.maxAge);
        const fadeIn = clamp01(life / 0.22);
        const fadeOut = clamp01((1 - life) / 0.35);
        const globalFade = anim.phase === 'BRIGHTENING'
          ? clamp01(1 - (anim.phaseTime / anim.durations.brightening) * 2.2)
          : 1;
        const alpha = fadeIn * fadeOut * globalFade;
        if (alpha <= 0.01) continue;

        const px = p.x + Math.sin(p.age * p.freq + p.phase) * p.amp;
        const py = p.y;
        const scale = 0.82 + life * 0.32;
        const rot = Math.sin(p.age * 2.2 + p.phase) * p.rotAmp;

        ctx.save();
        ctx.translate(Math.round(px), Math.round(py));
        ctx.rotate(rot);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        ctx.font = `900 ${p.baseSize}px "Trebuchet MS", "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Soft moonlit glow
        ctx.shadowColor = p.isBig ? 'rgba(253, 224, 71, 0.55)' : 'rgba(186, 230, 253, 0.5)';
        ctx.shadowBlur = 10;

        // Crisp dark outline + warm fill
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#17203d';
        ctx.strokeText(p.char, 0, 0);
        ctx.fillStyle = p.isBig ? '#fef08a' : '#bae6fd';
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }

      // 7. Centered rhythmic "ZzzZzz" banner + cozy caption
      if (sleepUiAlpha > 0.02) {
        const text = 'ZzzZzz';
        const cx = W * 0.5;
        const cy = H * 0.5;
        const letterSpacing = 28;
        const startX = cx - ((text.length - 1) * letterSpacing) / 2;

        ctx.save();
        ctx.globalAlpha = sleepUiAlpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          const isBig = ch === 'Z';
          const wave = Math.sin(anim.totalTime * 3.4 - i * 0.65);
          const lx = startX + i * letterSpacing;
          const ly = cy - 8 + wave * 7;

          ctx.font = `900 ${isBig ? 46 : 34}px "Trebuchet MS", "Segoe UI", sans-serif`;
          ctx.shadowColor = isBig ? 'rgba(253, 224, 71, 0.5)' : 'rgba(125, 211, 252, 0.45)';
          ctx.shadowBlur = 14;
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#0f172a';
          ctx.strokeText(ch, Math.round(lx), Math.round(ly));
          ctx.fillStyle = isBig ? '#fef08a' : '#e0f2fe';
          ctx.fillText(ch, Math.round(lx), Math.round(ly));
        }

        // Cozy subtitle
        ctx.shadowBlur = 0;
        ctx.font = 'bold 15px "Trebuchet MS", "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
        ctx.fillText(anim.subtitle, Math.round(cx), Math.round(cy + 36));
        ctx.restore();
      }

      // 8. Gentle morning wake-up whisper while sunlight brightens
      if (wakeWhisperAlpha > 0.02) {
        const cx = W * 0.5;
        const cy = H * 0.46;
        ctx.save();
        ctx.globalAlpha = wakeWhisperAlpha * 0.92;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 26px "Trebuchet MS", "Segoe UI", sans-serif';
        ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(59, 32, 15, 0.88)';
        ctx.strokeText(`☀️ ${anim.wakeWhisper}`, Math.round(cx), Math.round(cy));
        ctx.fillStyle = '#fef9c3';
        ctx.fillText(`☀️ ${anim.wakeWhisper}`, Math.round(cx), Math.round(cy));
        ctx.restore();
      }

      ctx.restore();
    }

    _drawNightSkyDecor(ctx, W, H, anim, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha * 0.85;

      // Twinkling pixel stars
      for (const s of anim.stars) {
        const twinkle = 0.35 + 0.65 * ((Math.sin(anim.totalTime * s.speed + s.phase) + 1) * 0.5);
        ctx.fillStyle = `rgba(254, 249, 195, ${twinkle.toFixed(2)})`;
        ctx.fillRect(Math.round(s.rx * W), Math.round(s.ry * H), s.size, s.size);
      }

      // Cozy crescent moon above-right of ZzzZzz
      const mx = Math.round(W * 0.5 + 112);
      const my = Math.round(H * 0.5 - 78);
      const halo = ctx.createRadialGradient(mx, my, 4, mx, my, 42);
      halo.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
      halo.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(mx, my, 42, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(mx, my, 15, 0, Math.PI * 2);
      ctx.fill();

      // Carve crescent shadow matching night sky
      ctx.fillStyle = 'rgb(7, 10, 24)';
      ctx.beginPath();
      ctx.arc(mx + 6, my - 4, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  global.AnimationSystem = AnimationSystem;
})(window);

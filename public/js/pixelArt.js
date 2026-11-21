// ============================================================================
// TERRITÓRIO VIVO: HANDCRAFTED 16-BIT PIXEL ART ENGINE (GRAVEYARD KEEPER STYLE)
// ============================================================================
// Native-resolution pixel art authored cleanly on offscreen canvases with
// imageSmoothingEnabled = false, warm earthy palettes, hue-shifted shading,
// crisp dark-brown (#2b1b12) outlines, layered foliage, individual shingles,
// cobblestone courses, wood-grain texturing, and soft ground contact shadows.

class PixelArtBank {
  constructor() {
    this.cache = {};
    this.tiles = {};
    this.houses = {};
    this.trees = {};
    this.treeVariants = {};
    this.props = {};
    this.dengue = {};
    this.playerFrames = {};
    this.dogFrames = {};
    this.catFrames = {};
    this.npcSprites = {};
    this.staffSprites = {};
    this.interior = {};
    this.icons = {};
    this.emotes = {};
    this.ubsSprite = null;
    this.playerHomeSprite = null;
    this.vendinhaSprite = null;
    this.associacaoSprite = null;
    this.community = {};
    this.umbrellaSprite = null;
    this.built = false;

    this.OUTLINE = '#2b1b12';
    this.OUTLINE_SOFT = '#452c1d';
  }

  // Deterministic pseudo-random helper for organic pixel texturing
  rand(seed) {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  parseColor(col) {
    if (!col || typeof col !== 'string') return [128, 128, 128];
    const s = col.trim();
    if (s.startsWith('#')) {
      let hex = s.slice(1);
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      const num = parseInt(hex.slice(0, 6), 16);
      if (Number.isNaN(num)) return [128, 128, 128];
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }
    const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    if (m) {
      return [Math.round(Number(m[1])), Math.round(Number(m[2])), Math.round(Number(m[3]))];
    }
    return [128, 128, 128];
  }

  toHex(r, g, b) {
    const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${c(r)}${c(g)}${c(b)}`;
  }

  mixColor(colA, colB, t) {
    const a = this.parseColor(colA);
    const b = this.parseColor(colB);
    const k = Math.max(0, Math.min(1, t));
    return this.toHex(
      a[0] + (b[0] - a[0]) * k,
      a[1] + (b[1] - a[1]) * k,
      a[2] + (b[2] - a[2]) * k
    );
  }

  // Hue-shifted warm shading: negative shifts toward deep espresso-umber,
  // positive shifts toward golden late-afternoon cream.
  warmShade(col, amount) {
    if (amount < 0) {
      return this.mixColor(col, '#26160f', Math.min(1, -amount));
    }
    if (amount > 0) {
      return this.mixColor(col, '#fff0bf', Math.min(1, amount));
    }
    return col;
  }

  // Backward-compatible value shift with subtle warm hue bias (-255..255)
  shade(hex, delta) {
    const [r0, g0, b0] = this.parseColor(hex);
    if (delta < 0) {
      const r = r0 + delta * 0.86;
      const g = g0 + delta * 0.98;
      const b = b0 + delta * 1.12;
      return this.toHex(r, g, b);
    }
    const r = r0 + delta * 1.08;
    const g = g0 + delta * 1.02;
    const b = b0 + delta * 0.74;
    return this.toHex(r, g, b);
  }

  // Creates an offscreen pixel canvas (w x h in native art pixels) with rich helpers
  createArtCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const self = this;

    const px = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    };

    const rect = (x, y, rw, rh, color) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const iw = Math.floor(rw);
      const ih = Math.floor(rh);
      if (iw <= 0 || ih <= 0) return;
      ctx.fillStyle = color;
      ctx.fillRect(ix, iy, iw, ih);
    };

    const outlineRect = (x, y, rw, rh, fill, stroke) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const iw = Math.floor(rw);
      const ih = Math.floor(rh);
      if (iw <= 0 || ih <= 0) return;
      ctx.fillStyle = stroke;
      ctx.fillRect(ix, iy, iw, ih);
      if (iw > 2 && ih > 2) {
        ctx.fillStyle = fill;
        ctx.fillRect(ix + 1, iy + 1, iw - 2, ih - 2);
      }
    };

    const bevelRect = (x, y, rw, rh, fill, hi, sh, stroke = self.OUTLINE) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const iw = Math.floor(rw);
      const ih = Math.floor(rh);
      if (iw <= 2 || ih <= 2) {
        outlineRect(ix, iy, iw, ih, fill, stroke);
        return;
      }
      outlineRect(ix, iy, iw, ih, fill, stroke);
      if (hi && iw > 3 && ih > 3) {
        ctx.fillStyle = hi;
        ctx.fillRect(ix + 1, iy + 1, iw - 2, 1);
        ctx.fillRect(ix + 1, iy + 1, 1, ih - 2);
      }
      if (sh && iw > 3 && ih > 3) {
        ctx.fillStyle = sh;
        ctx.fillRect(ix + 1, iy + ih - 2, iw - 2, 1);
        ctx.fillRect(ix + iw - 2, iy + 2, 1, ih - 3);
      }
    };

    const ditherRect = (x, y, rw, rh, colA, colB, mode = 'checker') => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const iw = Math.floor(rw);
      const ih = Math.floor(rh);
      for (let dy = 0; dy < ih; dy++) {
        for (let dx = 0; dx < iw; dx++) {
          let useB = false;
          if (mode === 'checker') useB = ((dx + dy) & 1) === 1;
          else if (mode === 'sparse') useB = (dx % 2 === 0 && dy % 2 === 0);
          else if (mode === 'horiz') useB = (dy % 2 === 1);
          px(ix + dx, iy + dy, useB ? colB : colA);
        }
      }
    };

    const ellipse = (cx, cy, rx, ry, color) => {
      if (rx <= 0 || ry <= 0) return;
      ctx.fillStyle = color;
      const rxi = Math.ceil(rx);
      const ryi = Math.ceil(ry);
      for (let dy = -ryi; dy <= ryi; dy++) {
        for (let dx = -rxi; dx <= rxi; dx++) {
          if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
            ctx.fillRect(Math.floor(cx + dx), Math.floor(cy + dy), 1, 1);
          }
        }
      }
    };

    const softShadow = (cx, cy, rx, ry, maxAlpha = 0.34) => {
      ellipse(cx, cy, rx, ry, `rgba(32, 20, 12, ${(maxAlpha * 0.38).toFixed(2)})`);
      ellipse(cx, cy, rx * 0.78, ry * 0.76, `rgba(30, 18, 10, ${(maxAlpha * 0.52).toFixed(2)})`);
      ellipse(cx, cy, rx * 0.48, ry * 0.46, `rgba(26, 15, 8, ${(maxAlpha * 0.65).toFixed(2)})`);
    };

    const woodPlanks = (x, y, rw, rh, base, hi, sh, seam, horizontal = true, plankSize = 6, seed = 1) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const iw = Math.floor(rw);
      const ih = Math.floor(rh);
      if (iw <= 0 || ih <= 0) return;
      rect(ix, iy, iw, ih, base);
      if (horizontal) {
        let idx = 0;
        for (let py = iy; py < iy + ih; py += plankSize) {
          const ph = Math.min(plankSize, iy + ih - py);
          const tone = idx % 2 === 0 ? base : self.mixColor(base, sh, 0.16);
          rect(ix, py, iw, ph, tone);
          if (ph > 2) rect(ix, py, iw, 1, hi);
          // Wood grain streaks
          for (let gx = ix + 2; gx < ix + iw - 4; gx += 7) {
            if (self.rand(seed * 37 + gx * 13 + py * 29) > 0.45 && ph > 3) {
              rect(gx, py + 2, 4, 1, self.mixColor(tone, sh, 0.35));
            }
          }
          if (py + ph < iy + ih) rect(ix, py + ph - 1, iw, 1, seam);
          // Staggered plank butt joint
          const jx = ix + Math.floor(((idx * 17 + seed * 7) % Math.max(8, iw - 6))) + 3;
          if (jx < ix + iw - 1) rect(jx, py, 1, ph, seam);
          idx++;
        }
      } else {
        let idx = 0;
        for (let px0 = ix; px0 < ix + iw; px0 += plankSize) {
          const pw = Math.min(plankSize, ix + iw - px0);
          const tone = idx % 2 === 0 ? base : self.mixColor(base, sh, 0.16);
          rect(px0, iy, pw, ih, tone);
          if (pw > 2) rect(px0, iy, 1, ih, hi);
          for (let gy = iy + 2; gy < iy + ih - 4; gy += 7) {
            if (self.rand(seed * 41 + px0 * 17 + gy * 23) > 0.45 && pw > 3) {
              rect(px0 + 2, gy, 1, 4, self.mixColor(tone, sh, 0.35));
            }
          }
          if (px0 + pw < ix + iw) rect(px0 + pw - 1, iy, 1, ih, seam);
          idx++;
        }
      }
    };

    const stuccoWall = (x, y, rw, rh, base, mid, dark, hi, seed = 1) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const iw = Math.floor(rw);
      const ih = Math.floor(rh);
      rect(ix, iy, iw, ih, base);
      // Warm sunlit upper-left bevel wash
      rect(ix, iy, Math.max(2, Math.floor(iw * 0.25)), 2, hi);
      rect(ix, iy, 2, Math.max(2, Math.floor(ih * 0.5)), hi);
      // Lower-right architectural depth shading
      rect(ix + iw - Math.max(4, Math.floor(iw * 0.12)), iy, Math.max(4, Math.floor(iw * 0.12)), ih, mid);
      rect(ix + iw - 2, iy, 2, ih, dark);
      // Hand-crafted clustered plaster dappling
      for (let py = iy + 3; py < iy + ih - 4; py += 4) {
        for (let px0 = ix + 3; px0 < ix + iw - 6; px0 += 6) {
          const r = self.rand(seed * 73 + px0 * 19 + py * 37);
          if (r > 0.72) {
            rect(px0, py, 3, 1, mid);
            px(px0 + 1, py + 1, mid);
          } else if (r < 0.14) {
            rect(px0, py, 2, 1, hi);
          }
        }
      }
    };

    const cobbleStone = (x, y, w, h, base, hi, sh, mortar) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const iw = Math.floor(w);
      const ih = Math.floor(h);
      if (iw < 3 || ih < 3) {
        rect(ix, iy, iw, ih, base);
        return;
      }
      // Mortar background around stone + rounded pixel corners
      rect(ix, iy, iw, ih, base);
      px(ix, iy, mortar);
      px(ix + iw - 1, iy, mortar);
      px(ix, iy + ih - 1, mortar);
      px(ix + iw - 1, iy + ih - 1, mortar);
      // Sunlit upper-left bevel
      rect(ix + 1, iy, iw - 2, 1, hi);
      rect(ix, iy + 1, 1, ih - 2, hi);
      px(ix + 1, iy + 1, hi);
      // Shaded lower-right bevel
      rect(ix + 1, iy + ih - 1, iw - 2, 1, sh);
      rect(ix + iw - 1, iy + 1, 1, ih - 2, sh);
    };

    const roofShingles = (x1Fn, x2Fn, yStart, numRows, rowH, tileW, rpal, seed = 1) => {
      for (let r = 0; r < numRows; r++) {
        const ry = yStart + r * rowH;
        const t = r / Math.max(1, numRows - 1);
        const rowBase = t < 0.28 ? rpal.top : (t < 0.68 ? rpal.mid : rpal.dark);
        const rowHi = t < 0.4 ? rpal.ridge : rpal.top;

        // Horizontal roof course base & bottom drop shadow
        for (let dy = 0; dy < rowH; dy++) {
          const y = ry + dy;
          const lx = Math.floor(x1Fn(y));
          const rx = Math.ceil(x2Fn(y));
          if (rx <= lx) continue;
          const col = dy === rowH - 1 ? rpal.shadow : (dy === 0 ? rowHi : rowBase);
          rect(lx, y, rx - lx, 1, col);
        }

        // Individual staggered shingles along row
        const shift = (r % 2) * Math.floor(tileW * 0.5);
        const lxMid = Math.floor(x1Fn(ry + 1));
        const rxMid = Math.ceil(x2Fn(ry + 1));
        for (let sx = lxMid - tileW + shift; sx < rxMid; sx += tileW) {
          const xStart = Math.max(lxMid, sx);
          const xEnd = Math.min(rxMid, sx + tileW);
          const tw = xEnd - xStart;
          if (tw < 3) continue;

          const rv = self.rand(seed * 97 + r * 43 + sx * 19);
          const tileCol = rv < 0.25 ? self.mixColor(rowBase, rpal.dark, 0.35)
            : (rv > 0.78 ? self.mixColor(rowBase, rpal.top, 0.45) : rowBase);
          rect(xStart, ry + 1, tw - 1, Math.max(1, rowH - 2), tileCol);
          // Upper-left sunlit shingle highlight
          if (tw >= 4) {
            rect(xStart + 1, ry, Math.min(3, tw - 2), 1, rowHi);
            px(xStart, ry + 1, rowHi);
          }
          // Vertical shingle overlap seam & curved corner shadow cutout
          if (xEnd < rxMid) {
            rect(xEnd - 1, ry + 1, 1, rowH - 1, rpal.shadow);
          }
          px(xStart, ry + rowH - 2, rpal.dark);
          if (xEnd - 1 > xStart) px(xEnd - 1, ry + rowH - 2, rpal.shadow);
          // Occasional faint weathered moss or soot fleck
          if (rv > 0.91 && tw >= 5 && rowH >= 5) {
            px(xStart + 2, ry + 2, '#5c6b32');
          }
        }
      }
    };

    const foliageLobe = (cx, cy, rx, ry, color, seed = 1, jagged = 1.6) => {
      ctx.fillStyle = color;
      const rxi = Math.ceil(rx + jagged + 1);
      const ryi = Math.ceil(ry + jagged + 1);
      for (let dy = -ryi; dy <= ryi; dy++) {
        for (let dx = -rxi; dx <= rxi; dx++) {
          const ang = Math.atan2(dy, dx);
          const wobble = Math.sin(ang * 5 + seed * 1.7) * 0.11 +
            Math.cos(ang * 9 - seed * 2.3) * 0.06;
          const norm = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
          if (norm <= 1 + wobble * (jagged / 2.2)) {
            ctx.fillRect(Math.floor(cx + dx), Math.floor(cy + dy), 1, 1);
          }
        }
      }
    };

    return {
      canvas,
      ctx,
      px,
      rect,
      outlineRect,
      bevelRect,
      ditherRect,
      ellipse,
      softShadow,
      woodPlanks,
      stuccoWall,
      cobbleStone,
      roofShingles,
      foliageLobe
    };
  }

  // Bake an art canvas scaled cleanly by `scale` (1 returns native canvas directly)
  bake(artCanvas, scale = 2) {
    if (scale === 1) return artCanvas;
    const out = document.createElement('canvas');
    out.width = artCanvas.width * scale;
    out.height = artCanvas.height * scale;
    const octx = out.getContext('2d');
    octx.imageSmoothingEnabled = false;
    octx.drawImage(artCanvas, 0, 0, out.width, out.height);
    return out;
  }

  buildAll() {
    if (this.built) return;
    this.buildTiles();
    this.buildTrees();
    this.buildProps();
    this.buildDengueSprites();
    this.buildUBS();
    this.buildHouses();
    this.buildPlayerSprites();
    this.buildUmbrellaSprite();
    this.buildDogSprites();
    this.buildCatSprites();
    this.buildNPCSprites();
    this.buildInteriorAssets();
    this.buildIcons();
    this.buildEmotes();
    this.built = true;
  }

  // ==========================================================================
  // 1. NATIVE 32x32 TERRAIN TILES (Graveyard Keeper Earthy Palette)
  // ==========================================================================
  buildTiles() {
    // A. 12 Seamless Multi-Toned Grass Variants (32x32)
    this.tiles.grass = [];
    const gBase = '#7d933a';
    const gMid = '#6f8532';
    const gDark = '#566924';
    const gRoot = '#42521b';
    const gLight = '#92a845';
    const gSun = '#b5c458';

    for (let v = 0; v < 12; v++) {
      const a = this.createArtCanvas(32, 32);
      a.rect(0, 0, 32, 32, gBase);

      // Soft clustered organic moss patches (no noisy single-pixel confetti)
      for (let i = 0; i < 16; i++) {
        const cx = Math.floor(this.rand(v * 211 + i * 31) * 28) + 2;
        const cy = Math.floor(this.rand(v * 211 + i * 57) * 28) + 2;
        const r = this.rand(v * 97 + i * 19);
        const col = r < 0.48 ? gMid : (r < 0.72 ? gLight : (r < 0.9 ? gDark : gSun));
        a.rect(cx, cy, 3, 2, col);
        a.px(cx + 1, cy - 1, col);
        if (r > 0.6) a.px(cx + 2, cy + 2, col);
      }

      // Helper for layered handcrafted grass blade tufts
      const drawTuft = (tx, ty, tall = false) => {
        a.rect(tx - 1, ty + 1, 5, 1, gRoot);
        a.px(tx, ty, gDark);
        a.px(tx + 2, ty, gDark);
        a.px(tx + 3, ty, gMid);
        a.px(tx, ty - 1, gLight);
        a.px(tx + 2, ty - 1, gSun);
        if (tall) {
          a.px(tx - 1, ty - 2, gLight);
          a.px(tx + 2, ty - 2, gSun);
          a.px(tx + 3, ty - 1, gLight);
        }
      };

      // Quiet grass variants get subtle blades; rich flora variants get layered details
      if (v <= 2) {
        drawTuft(7 + v * 6, 12 + v * 5, false);
        drawTuft(20 - v * 4, 24 - v * 3, false);
      } else if (v === 3 || v === 4) {
        drawTuft(6 + (v * 3) % 8, 10, true);
        drawTuft(19, 21, true);
        drawTuft(11, 26, false);
      } else if (v === 5 || v === 6) {
        // White daisies with basal leaves & contact shadow
        const fx = v === 5 ? 9 : 21;
        const fy = v === 5 ? 18 : 10;
        a.rect(fx - 2, fy + 2, 5, 1, gRoot);
        a.px(fx - 2, fy + 1, gDark);
        a.px(fx + 2, fy + 1, gDark);
        a.px(fx, fy + 1, gMid);
        a.px(fx - 1, fy, '#f6f2e4');
        a.px(fx + 1, fy, '#f6f2e4');
        a.px(fx, fy - 1, '#fffdf5');
        a.px(fx, fy + 1, '#e3dcc5');
        a.px(fx, fy, '#eab308');
        drawTuft(v === 5 ? 21 : 7, v === 5 ? 9 : 23, false);
      } else if (v === 7) {
        // Golden buttercup flowers
        [[10, 20], [22, 9]].forEach(([fx, fy]) => {
          a.rect(fx - 1, fy + 2, 3, 1, gRoot);
          a.px(fx, fy + 1, gDark);
          a.px(fx, fy, '#f59e0b');
          a.px(fx - 1, fy - 1, '#fde047');
          a.px(fx + 1, fy - 1, '#facc15');
          a.px(fx, fy - 2, '#fef08a');
        });
        drawTuft(15, 25, false);
      } else if (v === 8) {
        // Dense clover clusters
        [[9, 11], [21, 22]].forEach(([cx, cy]) => {
          a.rect(cx - 1, cy + 2, 4, 1, gRoot);
          a.px(cx, cy, gDark); a.px(cx + 2, cy, gDark);
          a.px(cx - 1, cy + 1, gLight); a.px(cx + 1, cy - 1, gSun);
          a.px(cx + 3, cy + 1, gLight); a.px(cx + 1, cy + 1, gMid);
        });
      } else if (v === 9) {
        // Warm mossy pebble & dry golden grass sprig
        a.rect(11, 18, 4, 2, '#5c5044');
        a.rect(11, 17, 3, 2, '#8b7f70');
        a.px(11, 17, '#b5a898');
        a.rect(11, 19, 4, 1, gRoot);
        drawTuft(22, 13, true);
        a.px(23, 10, '#c8b45c');
      } else if (v === 10) {
        // Fallen golden & pink ipê petals on turf
        drawTuft(8, 22, false);
        a.px(14, 10, '#e8b838'); a.px(15, 11, '#f7d863');
        a.px(23, 18, '#e072a4'); a.px(24, 18, '#f4a2c5');
        a.px(11, 26, '#e8b838');
      } else {
        // Wild layered fern/herb sprig
        const fx = 16;
        const fy = 18;
        a.rect(fx - 3, fy + 2, 7, 1, gRoot);
        a.rect(fx - 2, fy + 1, 5, 1, gDark);
        a.rect(fx - 3, fy, 2, 1, gMid); a.rect(fx + 2, fy, 2, 1, gMid);
        a.rect(fx - 1, fy - 1, 3, 2, gLight);
        a.px(fx, fy - 2, gSun);
        drawTuft(6, 9, false);
      }

      this.tiles.grass.push(this.bake(a.canvas, 1));
    }

    // B. Organic Dirt Paths ("Estrada do Sol") — 6 warm ochre-sienna variants (32x32)
    this.tiles.dirt = [];
    const dBase = '#c8a468';
    const dMid = '#b38d53';
    const dDark = '#8c6938';
    const dLight = '#ddbe83';
    const dHi = '#edd6a4';
    const dPebble = '#6e4f28';

    for (let v = 0; v < 6; v++) {
      const a = this.createArtCanvas(32, 32);
      a.rect(0, 0, 32, 32, dBase);

      // Organic compacted earth bands & clustered mottling
      for (let i = 0; i < 18; i++) {
        const cx = Math.floor(this.rand(700 + v * 97 + i * 29) * 28) + 2;
        const cy = Math.floor(this.rand(700 + v * 97 + i * 53) * 28) + 2;
        const r = this.rand(v * 61 + i * 17);
        const col = r < 0.45 ? dMid : (r < 0.85 ? dLight : dDark);
        a.rect(cx, cy, 3, 2, col);
        a.px(cx + 1, cy - 1, col);
      }

      // Subtle worn trail streaks
      if (v % 2 === 0) {
        a.rect(4, 10 + (v * 3) % 10, 7, 1, dMid);
        a.rect(18, 20 - (v * 2) % 8, 8, 1, dLight);
      }

      // Embedded rounded pebbles with dark-umber contact underside & sunlit top
      const pebbleSpots = v === 1
        ? [[8, 19], [22, 11]]
        : (v === 3 ? [[15, 24], [6, 8]] : (v === 5 ? [[24, 21]] : []));
      pebbleSpots.forEach(([px0, py0]) => {
        a.rect(px0, py0 + 1, 3, 1, dPebble);
        a.rect(px0, py0, 3, 1, '#9c8360');
        a.px(px0, py0 - 1, dHi);
      });

      // Sparse dry grass flecks on edge variant 4
      if (v === 4) {
        a.px(11, 14, gDark);
        a.px(11, 13, gMid);
        a.px(12, 13, '#b8a256');
      }

      this.tiles.dirt.push(this.bake(a.canvas, 1));
    }

    // C. Muddy Dirt (during rain) — 3 variants + default mud (32x32)
    this.tiles.mudVariants = [];
    for (let v = 0; v < 3; v++) {
      const m = this.createArtCanvas(32, 32);
      m.rect(0, 0, 32, 32, '#825e37');
      for (let i = 0; i < 18; i++) {
        const cx = Math.floor(this.rand(999 + v * 73 + i * 31) * 28) + 2;
        const cy = Math.floor(this.rand(999 + v * 73 + i * 47) * 28) + 2;
        const r = this.rand(i * 13 + v * 29);
        const col = r < 0.45 ? '#694929' : (r < 0.82 ? '#997248' : '#573a1e');
        m.rect(cx, cy, 4, 2, col);
      }
      // Subtle wet sheen
      if (v === 0 || v === 2) {
        m.rect(7 + v * 5, 11, 5, 1, '#a88d6c');
        m.rect(8 + v * 5, 12, 3, 1, '#6f8ea1');
      }
      this.tiles.mudVariants.push(this.bake(m.canvas, 1));
    }
    this.tiles.mud = this.tiles.mudVariants[0];

    // D. Detailed Handcrafted Cobblestone Street Tiles — 4 variants (32x32)
    this.tiles.street = [];
    const cobblePalette = ['#8c7f72', '#7e7266', '#968a7b', '#74695d', '#8d7e6c'];
    const mortarDark = '#42372f';
    const mortarMid = '#52453b';

    for (let v = 0; v < 4; v++) {
      const a = this.createArtCanvas(32, 32);
      a.rect(0, 0, 32, 32, mortarDark);

      // Subtle mortar texture
      for (let y = 0; y < 32; y += 2) {
        for (let x = 0; x < 32; x += 3) {
          if (this.rand(v * 31 + x * 7 + y * 13) > 0.62) a.px(x, y, mortarMid);
        }
      }

      // 4 staggered horizontal courses of individual rounded beveled stones (8px tall rows)
      const rowHeights = [7, 7, 7, 7];
      const rowY = [0, 8, 16, 24];
      const rowWidths = [
        [8, 8, 8, 8],
        [4, 9, 7, 8, 4],
        [7, 9, 8, 8],
        [5, 8, 9, 6, 4]
      ];

      rowY.forEach((sy, rIdx) => {
        const sh = rowHeights[rIdx];
        let sx = 0;
        rowWidths[rIdx].forEach((sw, cIdx) => {
          const seed = v * 131 + rIdx * 37 + cIdx * 19;
          const colBase = cobblePalette[Math.floor(this.rand(seed) * cobblePalette.length)];
          const hi = this.warmShade(colBase, 0.28);
          const shCol = this.warmShade(colBase, -0.34);
          a.cobbleStone(sx, sy, sw - 1, sh, colBase, hi, shCol, mortarDark);

          // Fine stone crack or wear pit
          if (sw >= 7 && this.rand(seed + 5) > 0.62) {
            a.px(sx + 3, sy + 3, shCol);
            a.px(sx + 4, sy + 4, shCol);
          }
          // Tiny moss tuft tucked into mortar seam on variants 2 & 3
          if ((v === 2 || v === 3) && this.rand(seed + 11) > 0.72) {
            a.px(Math.max(0, sx - 1), sy + sh - 1, '#586e28');
            a.px(sx, sy + sh, '#6f8532');
          }
          sx += sw;
        });
      });

      this.tiles.street.push(this.bake(a.canvas, 1));
    }

    // E. Sidewalk / Calçada — 3 weathered flagstone variants (32x32)
    this.tiles.sidewalkVariants = [];
    for (let v = 0; v < 3; v++) {
      const sw = this.createArtCanvas(32, 32);
      sw.rect(0, 0, 32, 32, '#6e6355');
      const stoneCols = ['#c8bba6', '#bfb19c', '#cec1ad', '#b8aa95'];
      [
        [0, 0, 15, 15],
        [16, 0, 15, 15],
        [0, 16, 15, 15],
        [16, 16, 15, 15]
      ].forEach(([fx, fy, fw, fh], idx) => {
        const base = stoneCols[(idx + v) % stoneCols.length];
        sw.cobbleStone(fx, fy, fw, fh, base, '#e2d8c5', '#8f826f', '#6e6355');
        // Subtle stone speckle
        for (let i = 0; i < 4; i++) {
          const sx = fx + 2 + Math.floor(this.rand(v * 53 + idx * 19 + i * 7) * 10);
          const sy = fy + 2 + Math.floor(this.rand(v * 53 + idx * 23 + i * 11) * 10);
          sw.px(sx, sy, i % 2 === 0 ? '#a89b87' : '#d9cfbc');
        }
      });
      if (v === 2) {
        sw.px(15, 14, '#5e7329');
        sw.px(15, 15, '#768c37');
      }
      this.tiles.sidewalkVariants.push(this.bake(sw.canvas, 1));
    }
    this.tiles.sidewalk = this.tiles.sidewalkVariants[0];

    // F. UBS & Pracinha Patio Courtyard Pavers — 3 variants (32x32)
    this.tiles.patioVariants = [];
    for (let v = 0; v < 3; v++) {
      const pt = this.createArtCanvas(32, 32);
      pt.rect(0, 0, 32, 32, '#7d7263');
      [
        [0, 0, 15, 15],
        [16, 0, 15, 15],
        [0, 16, 15, 15],
        [16, 16, 15, 15]
      ].forEach(([px0, py0, pw, ph], idx) => {
        const tone = ((idx + v) % 2 === 0) ? '#d4c7b2' : '#c9bba5';
        pt.cobbleStone(px0, py0, pw, ph, tone, '#eae0ce', '#9c8f7b', '#7d7263');
        if (this.rand(v * 37 + idx * 17) > 0.55) {
          pt.rect(px0 + 4, py0 + 6, 3, 1, '#b8aa95');
        }
      });
      if (v === 1) {
        pt.px(15, 15, '#6b8032');
      }
      this.tiles.patioVariants.push(this.bake(pt.canvas, 1));
    }
    this.tiles.patio = this.tiles.patioVariants[0];

    // G. Animated Stream Water Tiles — 4 smooth frames (32x32)
    this.tiles.water = [];
    for (let f = 0; f < 4; f++) {
      const w = this.createArtCanvas(32, 32);
      w.rect(0, 0, 32, 32, '#2d6e87');
      // Subtle current bands
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
          const wave = Math.sin((x + f * 4) * 0.35 + y * 0.25);
          if (wave < -0.55) w.px(x, y, '#245a70');
          else if (wave > 0.65) w.px(x, y, '#3b829c');
        }
      }
      // Subtle dark riverbed stones beneath water
      [[7, 10], [22, 23]].forEach(([sx, sy]) => {
        w.rect(sx, sy, 3, 2, '#1f4a5c');
      });
      // Smoothly drifting afternoon specular ripples & warm golden sparkle
      const ry1 = (4 + f * 8) % 28;
      const ry2 = (18 + f * 8) % 28;
      w.rect(4, ry1, 7, 1, '#7fc2d4');
      w.rect(6, ry1 + 1, 4, 1, '#d6f0f5');
      w.px(7, ry1, '#fae5b4');
      w.rect(18, ry2, 8, 1, '#7fc2d4');
      w.rect(20, ry2 + 1, 4, 1, '#cbeaf2');
      this.tiles.water.push(this.bake(w.canvas, 1));
    }

    // H. Weathered Timber Bridge Tile (32x32)
    const br = this.createArtCanvas(32, 32);
    br.woodPlanks(0, 0, 32, 32, '#915e32', '#be8750', '#693f1d', this.OUTLINE, false, 8, 17);
    // Horizontal cross-grain weathering & recessed iron nails
    for (let x = 3; x < 32; x += 8) {
      br.rect(x, 4, 2, 2, '#3b2416');
      br.px(x, 4, '#73685e');
      br.rect(x, 26, 2, 2, '#3b2416');
      br.px(x, 26, '#73685e');
    }
    this.tiles.bridge = this.bake(br.canvas, 1);

    // I. Rain Puddle Sprite (48x24)
    const pud = this.createArtCanvas(48, 24);
    pud.ellipse(24, 12, 22, 10, 'rgba(58, 42, 24, 0.36)');
    pud.ellipse(24, 12, 19, 8.5, 'rgba(45, 110, 135, 0.62)');
    pud.ellipse(22, 11, 13, 5.5, 'rgba(127, 194, 212, 0.52)');
    pud.rect(14, 8, 9, 1, 'rgba(235, 248, 255, 0.72)');
    pud.rect(24, 14, 6, 1, 'rgba(210, 238, 248, 0.55)');
    this.tiles.puddle = this.bake(pud.canvas, 1);
  }

  // ==========================================================================
  // 2. LAYERED BRAZILIAN TREES — 4 STYLES x 3 VARIANTS (native 128x144)
  // ==========================================================================
  buildTrees() {
    const palettes = {
      mango: {
        ao: '#182b12',
        dark: '#243d1b',
        mid: '#3a5f26',
        light: '#588231',
        sun: '#7da63d',
        hi: '#b4c956',
        underLeaf: null,
        fruit: '#e88b1a'
      },
      ipe_gold: {
        ao: '#4a2b09',
        dark: '#6e4414',
        mid: '#a66d1b',
        light: '#d69b28',
        sun: '#f0c446',
        hi: '#fff09e',
        underLeaf: '#3b5422',
        fruit: null
      },
      ipe_pink: {
        ao: '#3d1426',
        dark: '#591f38',
        mid: '#8f335c',
        light: '#c45284',
        sun: '#e882ae',
        hi: '#ffd1e2',
        underLeaf: '#3b5422',
        fruit: null
      },
      olive: {
        ao: '#1f2e13',
        dark: '#2e421d',
        mid: '#4a6429',
        light: '#6d8738',
        sun: '#95ab4b',
        hi: '#c4cf72',
        underLeaf: null,
        fruit: null
      }
    };

    Object.entries(palettes).forEach(([key, pal]) => {
      this.treeVariants[key] = [0, 1, 2].map((variant) => {
        const a = this.createArtCanvas(128, 144);
        const out = this.OUTLINE;
        const seedBase = key.length * 41 + variant * 137;

        // 1. Soft layered ground contact shadow & root turf tufts
        a.softShadow(66, 127, 42, 13, 0.34);
        a.ellipse(64, 125, 22, 6, 'rgba(30, 18, 10, 0.25)');

        // 2. Gnarled bark-textured trunk & flared roots (x: 56..72, y: 80..124)
        a.rect(55, 82, 18, 42, out);
        a.rect(57, 82, 14, 41, '#6b442b');
        // Sunlit left bark & deep shaded right bark
        a.rect(57, 83, 5, 39, '#8c5b3b');
        a.rect(58, 84, 2, 36, '#a8724c');
        a.rect(67, 83, 4, 39, '#4c2e1c');
        // Bark furrow lines & knot
        for (let by = 86; by < 120; by += 6) {
          a.rect(60 + (by % 3), by, 1, 4, '#3d2415');
          a.rect(65, by + 2, 1, 4, '#3d2415');
        }
        a.outlineRect(61, 101 + variant * 3, 4, 5, '#4c2e1c', out);

        // Flared roots gripping earth
        a.rect(51, 118, 6, 6, out);
        a.rect(52, 119, 5, 4, '#7d4f32');
        a.rect(53, 119, 2, 2, '#a8724c');
        a.rect(71, 118, 6, 6, out);
        a.rect(71, 119, 5, 4, '#593722');
        // Root contact AO + grass tufts
        a.rect(50, 123, 28, 2, 'rgba(26, 15, 8, 0.45)');
        a.px(52, 123, '#566924'); a.px(53, 122, '#7da63d');
        a.px(75, 123, '#566924'); a.px(74, 122, '#7da63d');

        // Upper fork branches & dark canopy ambient occlusion on top of trunk
        a.rect(51, 74, 8, 12, out);
        a.rect(52, 75, 6, 11, '#5e3b24');
        a.rect(69, 75, 8, 11, out);
        a.rect(70, 76, 6, 10, '#4a2d1b');
        a.rect(57, 79, 14, 8, '#362013');

        // 3. Organic Scalloped Canopy Lobes (drawn back-to-front with inter-lobe AO)
        const dx = variant === 1 ? 2 : (variant === 2 ? -2 : 0);
        const dy = variant === 2 ? 1 : 0;
        const lobes = [
          [40 + dx, 68 + dy, 25, 21],
          [88 + dx, 68 + dy, 25, 21],
          [64,      76 + dy, 32, 21],
          [44 + dx, 46,      27, 23],
          [84 - dx, 48,      25, 22],
          [64,      56,      29, 22],
          [52,      33 + dy, 24, 20],
          [74,      34,      23, 19]
        ];

        // Crisp dark walnut-brown outer silhouette
        lobes.forEach(([cx, cy, rx, ry], i) => {
          a.foliageLobe(cx, cy, rx + 2, ry + 2, out, seedBase + i * 7, 1.8);
        });

        // Subtle dark green under-leaves peeking at bottom of flowering Ipês
        if (pal.underLeaf) {
          a.foliageLobe(46, 76, 18, 12, pal.underLeaf, seedBase + 99, 1.5);
          a.foliageLobe(82, 76, 18, 12, pal.underLeaf, seedBase + 101, 1.5);
        }

        // Deep canopy base shadow
        lobes.forEach(([cx, cy, rx, ry], i) => {
          a.foliageLobe(cx, cy, rx, ry, pal.dark, seedBase + i * 7, 1.7);
        });

        // Layered clusters with ambient occlusion underneath each upper lobe
        lobes.forEach(([cx, cy, rx, ry], i) => {
          if (i >= 3) {
            a.foliageLobe(cx + 1, cy + 4, rx * 0.92, ry * 0.85, pal.ao, seedBase + i * 11, 1.4);
          }
          a.foliageLobe(cx - 1, cy - 2, rx * 0.92, ry * 0.90, pal.mid, seedBase + i * 7, 1.6);
          a.foliageLobe(cx - 3, cy - 5, rx * 0.72, ry * 0.68, pal.light, seedBase + i * 7, 1.5);
          if (i >= 3) {
            a.foliageLobe(cx - 5, cy - 7, rx * 0.46, ry * 0.44, pal.sun, seedBase + i * 13, 1.3);
          }
        });

        // Hand-placed leaf clusters & warm golden late-afternoon rim highlights
        for (let y = 14; y < 94; y += 3) {
          for (let x = 18; x < 110; x += 3) {
            const dist = Math.hypot((x - 64) / 46, (y - 54) / 38);
            if (dist > 0.94) continue;
            const r = this.rand(seedBase + x * 29 + y * 61);
            if (r > 0.78 && y < 60 && x < 84) {
              // Sunlit 3-pixel leaf cluster
              a.rect(x, y, 2, 2, pal.hi);
              a.px(x + 2, y + 1, pal.sun);
            } else if (r < 0.14 && y > 48) {
              // Deep crevice leaf shadow
              a.rect(x, y, 2, 1, pal.ao);
              a.px(x, y + 1, pal.dark);
            } else if (pal.fruit && r > 0.93 && y > 34 && y < 74 && x > 32 && x < 96) {
              // Ripe golden-orange mangoes with outline & highlight
              a.outlineRect(x, y, 5, 6, pal.fruit, out);
              a.px(x + 1, y + 1, '#fef08a');
              a.px(x + 3, y + 3, '#c2410c');
            }
          }
        }

        // Extra blossom sparkles for Ipês
        if (pal.fruit === null && (key === 'ipe_gold' || key === 'ipe_pink')) {
          for (let i = 0; i < 22; i++) {
            const bx = 30 + Math.floor(this.rand(seedBase + i * 19) * 68);
            const by = 18 + Math.floor(this.rand(seedBase + i * 43) * 58);
            if (Math.hypot((bx - 64) / 40, (by - 50) / 34) < 0.88) {
              a.rect(bx, by, 2, 2, pal.hi);
              a.px(bx, by, '#fffdf0');
            }
          }
        }

        return this.bake(a.canvas, 1);
      });

      this.trees[key] = this.treeVariants[key][0];
    });
  }

  // ==========================================================================
  // 3. YARD PROPS & DENGUE SPOTS (native 1x, exact output sizes)
  // ==========================================================================
  buildProps() {
    const out = this.OUTLINE;

    // 1. Wooden Signpost ("Estrada do Sol") — 48x56
    const sp = this.createArtCanvas(48, 56);
    sp.softShadow(24, 50, 12, 4.5, 0.32);
    // Textured wooden post
    sp.outlineRect(20, 20, 8, 30, '#85532c', out);
    sp.rect(21, 21, 3, 28, '#a66d3f');
    sp.rect(25, 22, 2, 27, '#5c361a');
    sp.rect(19, 48, 10, 2, 'rgba(26, 15, 8, 0.45)');
    // Signboard with wood planks, arrow tip & cast shadow
    sp.outlineRect(4, 8, 38, 20, '#cfa06b', out);
    sp.woodPlanks(5, 9, 36, 18, '#c7965c', '#e3b882', '#9c6c39', '#6e4721', true, 6, 3);
    // Arrow head right
    sp.rect(38, 12, 6, 12, out);
    sp.rect(38, 13, 4, 10, '#cfa06b');
    sp.rect(42, 15, 3, 6, out);
    sp.rect(41, 16, 3, 4, '#e3b882');
    // Painted dark-brown lettering lines + iron nails
    sp.rect(9, 13, 24, 3, '#543218');
    sp.rect(9, 19, 19, 3, '#543218');
    sp.px(22, 11, '#3b2416');
    sp.px(25, 11, '#3b2416');
    sp.px(22, 24, '#3b2416');
    sp.px(25, 24, '#3b2416');
    this.props.signpost = this.bake(sp.canvas, 1);

    // 2. Cozy Wooden Bench — 64x40
    const bn = this.createArtCanvas(64, 40);
    bn.softShadow(32, 34, 26, 5, 0.30);
    // Backrest with plank wood grain
    bn.outlineRect(6, 7, 52, 12, '#b8824d', out);
    bn.woodPlanks(7, 8, 50, 10, '#b8824d', '#d9a875', '#87572d', '#5c381c', true, 5, 9);
    // Armrests & seat planks
    bn.outlineRect(4, 19, 56, 9, '#a6713f', out);
    bn.woodPlanks(5, 20, 54, 7, '#a6713f', '#cfa06b', '#7a4d26', '#543218', true, 4, 12);
    // Iron-rimmed wooden legs
    [8, 50].forEach(lx => {
      bn.outlineRect(lx, 27, 6, 9, '#5c381c', out);
      bn.rect(lx + 1, 28, 2, 7, '#87572d');
      bn.px(lx + 1, 22, '#3d2415');
      bn.px(lx + 4, 22, '#3d2415');
    });
    this.props.bench = this.bake(bn.canvas, 1);

    // 3. Layered Flowering Bush — 48x40
    const bs = this.createArtCanvas(48, 40);
    bs.softShadow(24, 32, 20, 6, 0.30);
    bs.foliageLobe(24, 22, 20, 14, out, 4, 1.7);
    bs.foliageLobe(24, 21, 18.5, 12.5, '#2b4017', 4, 1.6);
    bs.foliageLobe(22, 19, 16, 10.5, '#467028', 7, 1.5);
    bs.foliageLobe(19, 16, 11.5, 7.5, '#6d9938', 11, 1.4);
    bs.foliageLobe(16, 13, 6.5, 4.5, '#99ba4b', 15, 1.2);
    // Leaf clusters & colorful blooms with dark leaf base
    [[14, 15, '#fef08a', '#f59e0b'], [29, 13, '#fffdf5', '#fde047'], [32, 22, '#f472b6', '#be185d'], [18, 24, '#fde047', '#d97706']].forEach(([fx, fy, c1, c2]) => {
      bs.rect(fx - 1, fy - 1, 3, 3, c1);
      bs.px(fx, fy, c2);
    });
    this.props.bush = this.bake(bs.canvas, 1);

    // 4. Wooden Crates & Iron-Hooped Barrel — 56x48
    const cr = this.createArtCanvas(56, 48);
    cr.softShadow(28, 40, 22, 6, 0.30);
    // Left wooden crate with diagonal crossbrace
    cr.outlineRect(5, 16, 25, 24, '#b07b48', out);
    cr.woodPlanks(6, 17, 23, 22, '#b07b48', '#d4a373', '#825329', '#5c381c', true, 5, 21);
    cr.outlineRect(7, 18, 21, 20, 'rgba(0,0,0,0)', '#6e4521');
    for (let i = 0; i < 16; i++) {
      cr.rect(9 + i, 20 + i, 2, 2, '#7d4f27');
      cr.px(9 + i, 19 + i, '#d4a373');
    }
    // Right wooden barrel with iron bands
    cr.outlineRect(30, 12, 21, 28, '#8f5a2d', out);
    cr.woodPlanks(31, 13, 19, 26, '#8f5a2d', '#b87e49', '#613a19', '#452811', false, 4, 27);
    cr.rect(31, 18, 19, 3, '#474340');
    cr.rect(31, 18, 19, 1, '#78716c');
    cr.rect(31, 30, 19, 3, '#474340');
    cr.rect(31, 30, 19, 1, '#78716c');
    // Barrel top rim
    cr.ellipse(40, 13, 9, 3, out);
    cr.ellipse(40, 13, 8, 2, '#b87e49');
    this.props.crates = this.bake(cr.canvas, 1);

    // 5. Clay Flowerpot — 32x36
    const fp = this.createArtCanvas(32, 36);
    fp.softShadow(16, 30, 10, 4, 0.28);
    fp.outlineRect(8, 18, 16, 13, '#b85f39', out);
    fp.rect(9, 19, 5, 11, '#d6784d');
    fp.rect(18, 19, 5, 11, '#8c4122');
    // Pot lip & rim shadow
    fp.outlineRect(6, 15, 20, 5, '#d6784d', out);
    fp.rect(7, 16, 18, 1, '#eba075');
    fp.rect(9, 20, 14, 2, '#692d14');
    // Lush plant foliage & flowers
    fp.foliageLobe(16, 11, 10, 6.5, out, 8, 1.2);
    fp.foliageLobe(16, 11, 9, 5.5, '#3b6b25', 8, 1.2);
    fp.foliageLobe(14, 9, 6, 3.8, '#6fa13a', 11, 1.0);
    fp.rect(11, 8, 3, 3, '#f43f5e'); fp.px(12, 9, '#fecdd3');
    fp.rect(17, 6, 3, 3, '#facc15'); fp.px(18, 7, '#fef08a');
    fp.rect(20, 10, 3, 3, '#fb7185');
    this.props.flowerpot = this.bake(fp.canvas, 1);

    // 6. Mossy Field Rock — 40x32
    const rk = this.createArtCanvas(40, 32);
    rk.softShadow(20, 26, 16, 5.5, 0.30);
    rk.foliageLobe(20, 18, 16, 11, out, 33, 1.1);
    rk.foliageLobe(20, 17, 15, 10, '#69635b', 33, 1.1);
    rk.foliageLobe(18, 15, 12, 7.5, '#8c847a', 33, 1.0);
    rk.foliageLobe(15, 12, 7, 4, '#b3aa9e', 33, 0.8);
    // Facet crack
    rk.rect(22, 16, 2, 6, '#4a443e');
    rk.rect(24, 20, 3, 2, '#4a443e');
    // Layered moss cap
    rk.foliageLobe(23, 11, 6, 3.5, '#466b22', 41, 1.0);
    rk.foliageLobe(22, 10, 4, 2, '#7da339', 41, 0.8);
    this.props.rock = this.bake(rk.canvas, 1);
  }

  buildDengueSprites() {
    const out = this.OUTLINE;

    // 1. Old Tire with Stagnant Water — 44x36
    const tire = this.createArtCanvas(44, 36);
    tire.softShadow(22, 26, 18, 8, 0.34);
    tire.ellipse(22, 18, 18, 12, out);
    tire.ellipse(22, 16, 17, 11, '#2d333b');
    tire.ellipse(20, 14, 15, 9, '#3e4652');
    // Tire tread grooves
    for (let tx = 8; tx < 36; tx += 5) {
      tire.rect(tx, 23, 2, 3, '#1a1e24');
    }
    tire.ellipse(22, 16, 11, 6.5, '#191d24');
    tire.ellipse(22, 16, 10, 5.5, '#38bdf8');
    tire.ellipse(20, 15, 7, 3.5, '#7dd3fc');
    tire.rect(19, 13, 3, 2, '#0f172a');
    tire.rect(24, 17, 3, 2, '#0f172a');
    tire.rect(16, 14, 4, 1, '#e0f2fe');
    this.dengue.tire = this.bake(tire.canvas, 1);

    // 2. Uncovered Blue Water Tank — 48x48
    const tank = this.createArtCanvas(48, 48);
    tank.softShadow(24, 40, 18, 6.5, 0.32);
    tank.outlineRect(8, 14, 32, 26, '#2563eb', out);
    tank.rect(9, 15, 8, 24, '#3b82f6');
    tank.rect(11, 16, 3, 22, '#60a5fa');
    tank.rect(31, 15, 8, 24, '#1d4ed8');
    // Structural plastic ribs
    tank.rect(9, 22, 30, 3, '#1e40af');
    tank.rect(9, 22, 30, 1, '#93c5fd');
    tank.rect(9, 31, 30, 3, '#1e40af');
    tank.rect(9, 31, 30, 1, '#93c5fd');
    // Open water top
    tank.ellipse(24, 14, 16, 6, out);
    tank.ellipse(24, 14, 14.5, 5, '#1e3a8a');
    tank.ellipse(24, 14, 12.5, 4, '#38bdf8');
    tank.ellipse(21, 13, 7, 2, '#bae6fd');
    this.dengue.tank = this.bake(tank.canvas, 1);

    // 3. Plant Saucers Full of Water — 44x36
    const pots = this.createArtCanvas(44, 36);
    pots.softShadow(22, 28, 18, 6.5, 0.30);
    // Left saucer + clay pot
    pots.ellipse(14, 24, 10, 5, '#1e3a8a');
    pots.ellipse(14, 24, 9, 4, '#7dd3fc');
    pots.px(10, 23, '#e0f2fe');
    pots.outlineRect(8, 12, 12, 12, '#b85f39', out);
    pots.rect(9, 13, 4, 10, '#d6784d');
    pots.foliageLobe(14, 10, 7, 4.5, '#3b6b25', 5, 1.0);
    pots.foliageLobe(13, 9, 4.5, 3, '#6fa13a', 6, 0.8);
    // Right saucer + clay pot
    pots.ellipse(30, 26, 10, 5, '#1e3a8a');
    pots.ellipse(30, 26, 9, 4, '#7dd3fc');
    pots.outlineRect(24, 16, 12, 10, '#b85f39', out);
    pots.rect(25, 17, 4, 8, '#d6784d');
    this.dengue.pots = this.bake(pots.canvas, 1);

    // 4. Open Bottles — 44x36
    const bot = this.createArtCanvas(44, 36);
    bot.softShadow(22, 28, 16, 5.5, 0.30);
    [
      [10, 12, 8, 16, '#4ade80', '#86efac', '#14532d'],
      [20, 16, 8, 12, '#60a5fa', '#bae6fd', '#1e3a8a'],
      [30, 14, 8, 14, '#f59e0b', '#fde68a', '#78350f']
    ].forEach(([bx, by, bw, bh, body, glint, rim]) => {
      bot.outlineRect(bx + 2, by - 3, 4, 4, body, rim);
      bot.outlineRect(bx, by, bw, bh, body, out);
      bot.rect(bx + 1, by + 2, 2, bh - 4, glint);
      bot.rect(bx + 1, by + bh - 6, bw - 2, 4, '#38bdf8');
    });
    this.dengue.bottles = this.bake(bot.canvas, 1);
  }

  // ==========================================================================
  // 4. UBS VILA ESPERANÇA (native 256x224)
  // ==========================================================================
  buildUBS() {
    const a = this.createArtCanvas(256, 224);
    const out = this.OUTLINE;
    const rpal = { top: '#cf643c', mid: '#b54e2b', dark: '#8f391b', ridge: '#eba075', shadow: '#5c210d' };

    // 1. Soft ground cast shadow & ambient occlusion
    a.softShadow(128, 212, 114, 11, 0.36);

    // 2. Main Facade (Textured Warm Plaster + Stone Foundation)
    a.outlineRect(20, 84, 216, 124, '#f2ece0', out);
    a.stuccoWall(22, 86, 212, 98, '#f2ece0', '#e3dac8', '#cfc3ad', '#faf7f0', 42);

    // Architectural corner pilasters
    a.bevelRect(21, 86, 8, 100, '#e8e0d0', '#faf7f0', '#bfb49f', this.OUTLINE_SOFT);
    a.bevelRect(227, 86, 8, 100, '#dbd1be', '#ede6d8', '#b0a48e', this.OUTLINE_SOFT);

    // Stone Foundation (Rodapé) with individual beveled blocks
    a.rect(22, 185, 212, 21, '#6e6559');
    for (let sx = 22; sx < 232; sx += 12) {
      const sw = Math.min(11, 234 - sx);
      a.cobbleStone(sx, 186, sw, 9, '#b5aca0', '#d1c9bd', '#877e71', '#635a4f');
      a.cobbleStone(sx, 196, sw, 9, '#a69d90', '#c4bbb0', '#7a7266', '#635a4f');
    }
    // Ground contact AO line
    a.rect(20, 206, 216, 2, 'rgba(26, 15, 8, 0.45)');

    // SUS Royal Blue Architectural Trim Stripe
    a.rect(22, 90, 212, 14, '#0284c7');
    a.rect(22, 89, 212, 2, '#38bdf8');
    a.rect(22, 103, 212, 4, '#035388');
    // Stepped roof eave shadow onto facade
    a.rect(22, 90, 212, 5, 'rgba(28, 16, 10, 0.30)');
    a.rect(22, 95, 212, 2, 'rgba(28, 16, 10, 0.14)');

    // 3. Terracotta Colonial Roof with Individually Defined Overlapping Clay Shingles
    a.outlineRect(8, 20, 240, 72, rpal.mid, out);
    a.roofShingles(() => 10, () => 246, 26, 11, 6, 10, rpal, 101);
    // Roof eaves overhang trim & dark under-lip
    a.rect(9, 89, 238, 3, out);
    a.rect(10, 87, 236, 2, '#7a2f14');
    // Ridge Cap (Cumeeira)
    a.rect(8, 20, 240, 6, out);
    a.rect(10, 21, 236, 4, rpal.ridge);
    a.rect(10, 21, 236, 1, '#f7bfa0');
    for (let cx = 14; cx < 242; cx += 12) {
      a.rect(cx, 21, 1, 4, rpal.shadow);
    }

    // 4. Center Gable Signboard ("UBS • SUS")
    a.bevelRect(76, 44, 104, 44, '#0284c7', '#38bdf8', '#035388', out);
    a.outlineRect(78, 46, 100, 40, '#0284c7', '#ffffff');
    // Crisp White SUS Cross Emblem on Left of Sign
    a.rect(88, 62, 20, 8, '#ffffff');
    a.rect(94, 56, 8, 20, '#ffffff');
    a.rect(88, 69, 20, 1, '#bae6fd');
    // Pixel-art letters "UBS" with crisp subtle shadow
    const drawLetters = (ox, oy, col) => {
      // U
      a.rect(116 + ox, 56 + oy, 4, 20, col); a.rect(126 + ox, 56 + oy, 4, 20, col); a.rect(116 + ox, 72 + oy, 14, 4, col);
      // B
      a.rect(136 + ox, 56 + oy, 4, 20, col); a.rect(136 + ox, 56 + oy, 12, 4, col);
      a.rect(136 + ox, 64 + oy, 12, 4, col); a.rect(136 + ox, 72 + oy, 12, 4, col);
      a.rect(146 + ox, 58 + oy, 4, 6, col); a.rect(146 + ox, 66 + oy, 4, 8, col);
      // S
      a.rect(156 + ox, 56 + oy, 12, 4, col); a.rect(156 + ox, 56 + oy, 4, 10, col);
      a.rect(156 + ox, 64 + oy, 12, 4, col); a.rect(164 + ox, 64 + oy, 4, 10, col);
      a.rect(156 + ox, 72 + oy, 12, 4, col);
    };
    drawLetters(1, 1, '#035388');
    drawLetters(0, 0, '#ffffff');

    // 5. Sliding Glass Reception Doors (Center)
    a.outlineRect(104, 128, 48, 76, '#0369a1', out);
    a.rect(108, 132, 18, 68, '#9fd8f5');
    a.rect(130, 132, 18, 68, '#9fd8f5');
    // Warm sunlit glass reflection streaks & interior depth
    a.rect(110, 136, 5, 26, '#e0f2fe');
    a.rect(116, 138, 2, 18, '#f0f9ff');
    a.rect(132, 136, 5, 26, '#e0f2fe');
    a.rect(138, 138, 2, 18, '#f0f9ff');
    a.rect(108, 184, 18, 16, '#71b3d6');
    a.rect(130, 184, 18, 16, '#71b3d6');
    a.rect(126, 130, 4, 72, '#0c4a6e');
    // Accessibility Ramp & Steps
    a.bevelRect(92, 202, 72, 16, '#cbd5e1', '#f1f5f9', '#64748b', out);
    a.rect(94, 208, 68, 2, '#94a3b8');
    a.rect(94, 213, 68, 2, '#64748b');
    a.bevelRect(94, 200, 5, 16, '#0284c7', '#38bdf8', '#035388', out);
    a.bevelRect(157, 200, 5, 16, '#0284c7', '#38bdf8', '#035388', out);

    // 6. Left & Right Clinic Windows with Textured Flower Boxes
    [40, 176].forEach(wx => {
      a.outlineRect(wx, 124, 40, 36, '#475569', out);
      a.rect(wx + 2, 126, 36, 32, '#8cc8e8');
      a.rect(wx + 4, 128, 10, 12, '#e0f2fe');
      a.rect(wx + 22, 128, 8, 10, '#bae6fd');
      a.rect(wx + 18, 126, 4, 32, '#f8fafc');
      a.rect(wx + 2, 140, 36, 4, '#f8fafc');
      a.rect(wx + 2, 155, 36, 3, '#6199b8');
      // Wood-grained flower box
      a.bevelRect(wx - 2, 160, 44, 10, '#8c5a32', '#b8824d', '#5c381c', out);
      a.rect(wx + 2, 156, 36, 5, '#3d6b25');
      a.rect(wx + 4, 154, 32, 3, '#5d9132');
      [[wx + 8, 155, '#facc15'], [wx + 20, 153, '#f43f5e'], [wx + 30, 155, '#fef08a'], [wx + 14, 156, '#fb7185']].forEach(([fx, fy, fc]) => {
        a.rect(fx, fy, 3, 3, fc);
        a.px(fx + 1, fy + 1, '#fffdf5');
      });
    });

    // 7. Shaded Scalloped Awning over Entrance
    a.outlineRect(96, 114, 64, 14, '#0284c7', out);
    for (let x = 100; x < 156; x += 8) {
      a.rect(x, 116, 4, 10, '#e0f2fe');
      a.rect(x, 124, 4, 2, '#93c5fd');
    }
    a.rect(96, 128, 64, 4, 'rgba(26, 15, 8, 0.30)');

    // 8. Drinking Fountain & Flanking Potted Plants
    a.bevelRect(76, 172, 16, 28, '#e2e8f0', '#ffffff', '#94a3b8', out);
    a.outlineRect(80, 176, 8, 8, '#38bdf8', '#0369a1');
    [90, 158].forEach(px0 => {
      a.bevelRect(px0, 190, 10, 12, '#c26a42', '#e0895e', '#7d3a1e', out);
      a.foliageLobe(px0 + 5, 186, 6.5, 5, out, px0, 1.0);
      a.foliageLobe(px0 + 5, 186, 5.5, 4, '#3b6b25', px0, 1.0);
      a.foliageLobe(px0 + 4, 184, 3.5, 2.5, '#6fa13a', px0 + 2, 0.8);
    });

    this.ubsSprite = this.bake(a.canvas, 1);
  }

  // ==========================================================================
  // 5. BRAZILIAN HOUSES (native 160x160 — preserved styles & archetypes)
  // ==========================================================================
  buildHouses() {
    const roofPalettes = {
      terracotta: { top: '#d46a42', mid: '#b8502c', dark: '#8c371a', ridge: '#eda179', shadow: '#5c200d' },
      clayDark:   { top: '#b85d38', mid: '#944324', dark: '#6e2e16', ridge: '#d68963', shadow: '#4a1b0a' },
      slateWarm:  { top: '#8c7e70', mid: '#6e6257', dark: '#52483f', ridge: '#ada092', shadow: '#362e28' }
    };

    window.ACS_DATA.families.forEach(fam => {
      const style = fam.houseStyle;
      const rpal = roofPalettes[style.roof] || roofPalettes.terracotta;
      const wallLight = style.wall;
      const wallMid = this.shade(style.wall, -18);
      const wallDark = this.shade(style.wall, -38);

      this.houses[fam.id] = {
        lit: this.makeHouseSprite(style, rpal, wallLight, wallMid, wallDark, true, fam),
        unlit: this.makeHouseSprite(style, rpal, wallLight, wallMid, wallDark, false, fam)
      };
    });

    // Protagonist's Home (Casa do ACS)
    const homeStyle = { wall: '#f8efd8', trim: '#0369a1', roof: 'terracotta', awning: '#0284c7', garden: true };
    const homeFakeFam = { tx: 22, ty: 21, archetype: 'AMIGO' };
    this.playerHomeSprite = {
      lit: this.makeHouseSprite(homeStyle, roofPalettes.terracotta, homeStyle.wall, this.shade(homeStyle.wall, -18), this.shade(homeStyle.wall, -38), true, homeFakeFam),
      unlit: this.makeHouseSprite(homeStyle, roofPalettes.terracotta, homeStyle.wall, this.shade(homeStyle.wall, -18), this.shade(homeStyle.wall, -38), false, homeFakeFam)
    };

    // Vendinha & Padaria do Zé
    const vendStyle = { wall: '#faebd7', trim: '#9a3412', roof: 'clayDark', awning: '#d97706', garden: false };
    const vendFakeFam = { tx: 22, ty: 32, archetype: 'TRABALHADOR' };
    this.vendinhaSprite = {
      lit: this.makeHouseSprite(vendStyle, roofPalettes.clayDark, vendStyle.wall, this.shade(vendStyle.wall, -18), this.shade(vendStyle.wall, -38), true, vendFakeFam),
      unlit: this.makeHouseSprite(vendStyle, roofPalettes.clayDark, vendStyle.wall, this.shade(vendStyle.wall, -18), this.shade(vendStyle.wall, -38), false, vendFakeFam)
    };

    // Associação de Moradores
    const assocStyle = { wall: '#e4f2e7', trim: '#166534', roof: 'slateWarm', awning: '#15803d', garden: true };
    const assocFakeFam = { tx: 60, ty: 49, archetype: 'AMIGO' };
    this.associacaoSprite = {
      lit: this.makeHouseSprite(assocStyle, roofPalettes.slateWarm, assocStyle.wall, this.shade(assocStyle.wall, -18), this.shade(assocStyle.wall, -38), true, assocFakeFam),
      unlit: this.makeHouseSprite(assocStyle, roofPalettes.slateWarm, assocStyle.wall, this.shade(assocStyle.wall, -18), this.shade(assocStyle.wall, -38), false, assocFakeFam)
    };

    // Casa Misteriosa (Bairro Vizinho)
    const mysStyle = { wall: '#cbd5e1', trim: '#334155', roof: 'slateWarm', awning: '#475569', garden: false };
    const mysFakeFam = { tx: 106, ty: 10, archetype: 'TEIMOSO' };
    this.mysteryHouseSprite = {
      lit: this.makeHouseSprite(mysStyle, roofPalettes.slateWarm, mysStyle.wall, this.shade(mysStyle.wall, -22), this.shade(mysStyle.wall, -44), false, mysFakeFam),
      unlit: this.makeHouseSprite(mysStyle, roofPalettes.slateWarm, mysStyle.wall, this.shade(mysStyle.wall, -22), this.shade(mysStyle.wall, -44), false, mysFakeFam)
    };
  }

  makeHouseSprite(style, rpal, wallLight, wallMid, wallDark, isLit, fam) {
    const a = this.createArtCanvas(160, 160);
    const out = this.OUTLINE;
    const seed = fam.tx * 17 + fam.ty * 31;

    // 1. Soft Ground Contact Shadow beneath house & front yard wall
    a.softShadow(82, 143, 68, 9, 0.34);

    // 2. Facade Walls (y: 68..140) with Stucco Texture & Shaded Right Wall
    a.outlineRect(20, 68, 120, 72, wallLight, out);
    a.stuccoWall(22, 70, 116, 52, wallLight, wallMid, wallDark, this.shade(wallLight, 14), seed);

    // Stone / Brick Base Foundation (Rodapé)
    a.rect(22, 122, 116, 16, '#6e6457');
    for (let sx = 22; sx < 136; sx += 10) {
      const sw = Math.min(9, 138 - sx);
      a.cobbleStone(sx, 123, sw, 7, '#a89d8e', '#c7bdb0', '#7a7063', '#5c5247');
      a.cobbleStone(sx, 131, sw, 7, '#998e7f', '#b8aea0', '#6e6457', '#5c5247');
    }
    a.rect(20, 139, 120, 2, 'rgba(26, 15, 8, 0.45)');

    // Deep Stepped Eave Ambient Occlusion Cast onto Upper Facade
    a.rect(22, 70, 116, 5, 'rgba(32, 18, 10, 0.32)');
    a.rect(22, 75, 116, 3, 'rgba(32, 18, 10, 0.14)');

    // 3. Pitched Terracotta / Slate Roof with Individually Defined Overlapping Shingles
    for (let ry = 0; ry < 60; ry++) {
      const inset = Math.max(0, Math.floor((20 - ry) * 0.6));
      const x1 = 10 + inset;
      const x2 = 150 - inset;
      a.rect(x1 - 2, 12 + ry, x2 - x1 + 4, 1, out);
    }
    a.roofShingles(
      (y) => {
        const ry = y - 12;
        return 12 + Math.max(0, Math.floor((20 - ry) * 0.6));
      },
      (y) => {
        const ry = y - 12;
        return 148 - Math.max(0, Math.floor((20 - ry) * 0.6));
      },
      15, 9, 6, 9, rpal, seed
    );
    // Lower roof trim lip
    a.rect(10, 70, 140, 3, out);
    a.rect(12, 68, 136, 2, rpal.shadow);
    // Ridge Beam (Cumeeira) at roof crest
    a.rect(22, 12, 116, 5, out);
    a.rect(23, 13, 114, 3, rpal.ridge);
    a.rect(23, 13, 114, 1, this.warmShade(rpal.ridge, 0.35));
    for (let rx = 28; rx < 134; rx += 10) {
      a.rect(rx, 13, 1, 3, rpal.shadow);
    }

    // Brick-Textured Chimney
    a.bevelRect(108, 4, 16, 24, '#9e9182', '#c2b6a6', '#6e6357', out);
    for (let cy = 8; cy < 26; cy += 4) {
      a.rect(109, cy, 14, 1, '#5e5449');
      a.rect(114 + ((cy / 4) % 2) * 3, cy - 3, 1, 3, '#5e5449');
    }
    a.bevelRect(106, 4, 20, 4, '#6b6258', '#968b7e', '#453e37', out);

    // 4. Wood-Grained Paneled Front Door & Stone Doorstep
    a.outlineRect(68, 94, 24, 44, '#85532c', out);
    a.woodPlanks(70, 96, 20, 40, '#9e6436', '#c28652', '#6e401d', '#542f14', false, 5, seed + 5);
    a.outlineRect(73, 100, 14, 12, '#8c572d', '#542f14');
    a.outlineRect(73, 116, 14, 16, '#8c572d', '#542f14');
    a.rect(84, 114, 4, 4, '#eab308'); // Brass handle
    a.px(84, 114, '#fef08a');
    a.bevelRect(64, 136, 32, 6, '#c4baa8', '#e6ded0', '#7a7164', '#52493f');

    // 5. Striped Brazilian Porch Awning (Toldo) with Scalloped Trim & Shadow
    a.outlineRect(60, 82, 40, 12, style.awning, out);
    for (let ax = 63; ax < 97; ax += 8) {
      a.rect(ax, 84, 4, 8, '#f5efe1');
      a.rect(ax, 90, 4, 2, '#d6ceb8');
    }
    a.rect(61, 91, 38, 2, 'rgba(30, 18, 10, 0.25)');
    a.rect(60, 94, 40, 3, 'rgba(26, 15, 8, 0.28)');

    // 6. Left & Right Colonial Windows with Louvered Shutters & Flower Boxes
    const shutterHi = this.shade(style.trim, 20);
    const shutterSh = this.shade(style.trim, -24);
    [32, 104].forEach(wx => {
      // Louvered wooden shutters
      a.bevelRect(wx - 5, 88, 5, 24, style.trim, shutterHi, shutterSh, out);
      a.bevelRect(wx + 24, 88, 5, 24, style.trim, shutterHi, shutterSh, out);
      for (let sy = 91; sy < 110; sy += 3) {
        a.rect(wx - 4, sy, 3, 1, shutterSh);
        a.rect(wx + 25, sy, 3, 1, shutterSh);
      }
      // Window frame & glass
      const glass = isLit ? '#facc15' : '#4f6575';
      const glassHi = isLit ? '#fef9c3' : '#8da9bd';
      const glassDeep = isLit ? '#ea580c' : '#364854';
      a.outlineRect(wx, 88, 24, 24, glass, out);
      a.rect(wx + 2, 90, 20, 20, glass);
      a.rect(wx + 3, 103, 18, 6, glassDeep);
      a.rect(wx + 4, 92, 6, 6, glassHi);
      a.rect(wx + 14, 92, 5, 5, glassHi);
      // Window muntins
      a.rect(wx + 10, 90, 4, 20, '#f8fafc');
      a.rect(wx + 2, 98, 20, 4, '#f8fafc');
      // Wood-grained flower box under window
      a.bevelRect(wx - 2, 112, 28, 8, '#8c5a32', '#b8824d', '#5c381c', out);
      if (style.garden) {
        a.rect(wx + 2, 108, 20, 4, '#3d6b25');
        a.rect(wx + 4, 107, 16, 2, '#629434');
        a.rect(wx + 4, 107, 3, 3, '#f43f5e');
        a.rect(wx + 12, 105, 3, 3, '#facc15');
        a.rect(wx + 18, 107, 3, 3, '#fffdf5');
      }
    });

    // 7. Low Front Yard Wall with Individual Coping Tiles & Gate Posts
    a.outlineRect(8, 142, 52, 14, wallMid, out);
    a.stuccoWall(10, 145, 48, 9, wallMid, wallDark, this.shade(wallDark, -14), wallLight, seed + 9);
    a.rect(10, 142, 48, 4, rpal.mid);
    a.rect(10, 142, 48, 1, rpal.ridge);
    for (let cx = 16; cx < 58; cx += 8) a.rect(cx, 142, 1, 4, rpal.shadow);

    a.outlineRect(100, 142, 52, 14, wallMid, out);
    a.stuccoWall(102, 145, 48, 9, wallMid, wallDark, this.shade(wallDark, -14), wallLight, seed + 13);
    a.rect(102, 142, 48, 4, rpal.mid);
    a.rect(102, 142, 48, 1, rpal.ridge);
    for (let cx = 108; cx < 150; cx += 8) a.rect(cx, 142, 1, 4, rpal.shadow);

    // Gate Posts with stone caps
    a.bevelRect(58, 138, 8, 18, style.trim, shutterHi, shutterSh, out);
    a.bevelRect(57, 136, 10, 4, '#d4c7b2', '#f0e7d5', '#877a68', out);
    a.bevelRect(94, 138, 8, 18, style.trim, shutterHi, shutterSh, out);
    a.bevelRect(93, 136, 10, 4, '#d4c7b2', '#f0e7d5', '#877a68', out);

    // Friendly yard potted plant near gate
    if (fam.archetype === 'AMIGO') {
      a.bevelRect(44, 130, 10, 10, '#c26a42', '#e0895e', '#7d3a1e', out);
      a.foliageLobe(49, 126, 6, 4.5, '#3b6b25', seed, 1.0);
      a.foliageLobe(48, 124, 4, 3, '#6fa13a', seed + 1, 0.8);
      a.rect(48, 123, 2, 2, '#facc15');
    }

    // House Number Plaque next to door
    a.outlineRect(94, 96, 8, 6, '#0284c7', out);
    a.rect(96, 98, 4, 2, '#ffffff');

    return this.bake(a.canvas, 1);
  }

  // ==========================================================================
  // 6. ANIMATED 4-DIRECTION ACS PLAYER SPRITES (native 32x48)
  // ==========================================================================
  buildPlayerSprites() {
    const dirs = ['down', 'up', 'left', 'right'];
    dirs.forEach(dir => {
      this.playerFrames[dir] = [];
      for (let frame = 0; frame < 4; frame++) {
        this.playerFrames[dir].push(this.makeACSSprite(dir, frame));
      }
    });
  }

  makeACSSprite(dir, frame) {
    const a = this.createArtCanvas(32, 48);
    const out = this.OUTLINE;
    const skin = '#e6b18a';
    const skinHi = '#f5ccb0';
    const skinSh = '#c28761';
    const hair = '#3b2618';
    const hairHi = '#5c3c27';
    const capBlue = '#0369a1';
    const capDark = '#074266';
    const capHi = '#38bdf8';
    const vestBlue = '#0284c7';
    const vestHi = '#26a0e0';
    const vestDark = '#035388';
    const shirtW = '#f8fafc';
    const shirtSh = '#cbd5e1';
    const pants = '#52493e';
    const pantsSh = '#3b342b';
    const boots = '#452b17';
    const bootsHi = '#6e4728';
    const pack = '#8c5a32';
    const packHi = '#b57b4a';
    const packSh = '#5c381c';

    const stepL = frame === 1 ? -2 : (frame === 3 ? 2 : 0);
    const stepR = frame === 1 ? 2 : (frame === 3 ? -2 : 0);
    const bob = (frame === 1 || frame === 3) ? -2 : 0;

    // Ground soft contact shadow
    a.softShadow(16, 44, 11, 4, 0.36);

    // 1. Legs & Shaded Boots
    if (dir === 'down' || dir === 'up') {
      const ly = 32 + Math.min(0, stepL);
      const ry = 32 + Math.min(0, stepR);
      a.outlineRect(9, ly, 7, 9, pants, out);
      a.rect(10, ly + 1, 2, 6, '#665b4e');
      a.outlineRect(16, ry, 7, 9, pantsSh, out);
      a.rect(17, ry + 1, 2, 6, pants);
      a.bevelRect(9, ly + 7, 7, 6, boots, bootsHi, out, out);
      a.bevelRect(16, ry + 7, 7, 6, boots, '#54351d', out, out);
    } else {
      const fShift = frame === 1 ? -3 : (frame === 3 ? 3 : 0);
      a.outlineRect(12 - fShift, 32, 7, 9, pantsSh, out);
      a.outlineRect(12 + fShift, 32, 7, 9, pants, out);
      a.rect(13 + fShift, 33, 2, 6, '#665b4e');
      a.bevelRect(12 - fShift, 39, 7, 6, '#362111', boots, out, out);
      a.bevelRect(12 + fShift, 39, 7, 6, boots, bootsHi, out, out);
    }

    // 2. Torso — White shirt under Iconic SUS Blue Vest + Backpack
    const ty = 20 + bob;
    if (dir === 'down') {
      a.outlineRect(7, ty, 18, 14, vestBlue, out);
      a.rect(8, ty + 1, 16, 2, vestHi);
      a.rect(8, ty + 10, 16, 3, vestDark);
      // White shirt center placket + collar
      a.rect(14, ty + 1, 4, 12, shirtW);
      a.rect(14, ty + 10, 4, 3, shirtSh);
      // SUS cross & golden badge
      a.rect(10, ty + 4, 3, 1, '#ffffff');
      a.rect(11, ty + 3, 1, 3, '#ffffff');
      a.rect(20, ty + 4, 3, 3, '#facc15');
      a.px(20, ty + 4, '#fef08a');
      // Arms + Tablet e-SUS in right hand
      a.outlineRect(4, ty + 2 + stepR, 4, 10, skin, out);
      a.rect(5, ty + 2 + stepR, 2, 4, shirtW);
      a.outlineRect(24, ty + 2 + stepL, 4, 10, skin, out);
      a.rect(25, ty + 2 + stepL, 2, 4, shirtW);
      a.outlineRect(23, ty + 9 + stepL, 6, 6, '#334155', out);
      a.rect(24, ty + 10 + stepL, 4, 4, '#38bdf8');
      a.px(24, ty + 10 + stepL, '#bae6fd');
    } else if (dir === 'up') {
      a.outlineRect(7, ty, 18, 14, vestBlue, out);
      a.rect(8, ty + 11, 16, 2, vestDark);
      // Brown ACS Backpack prominently on back!
      a.bevelRect(8, ty + 2, 16, 13, pack, packHi, packSh, out);
      a.rect(9, ty + 7, 14, 2, packSh);
      a.rect(14, ty + 7, 4, 3, '#facc15');
      // Arms
      a.outlineRect(4, ty + 2 + stepL, 4, 9, shirtW, out);
      a.rect(5, ty + 7 + stepL, 2, 3, skinSh);
      a.outlineRect(24, ty + 2 + stepR, 4, 9, shirtW, out);
      a.rect(25, ty + 7 + stepR, 2, 3, skinSh);
    } else if (dir === 'right') {
      a.bevelRect(5, ty + 2, 8, 12, pack, packHi, packSh, out);
      a.outlineRect(10, ty, 14, 15, vestBlue, out);
      a.rect(11, ty + 1, 12, 2, vestHi);
      a.rect(11, ty + 11, 12, 3, vestDark);
      a.rect(17, ty + 4, 3, 3, '#ffffff');
      // Swinging arm + tablet
      a.outlineRect(13 + stepL, ty + 3, 6, 9, shirtW, out);
      a.rect(15 + stepL, ty + 9, 4, 3, skin);
      a.outlineRect(19 + stepL, ty + 8, 5, 6, '#38bdf8', out);
    } else {
      a.bevelRect(19, ty + 2, 8, 12, pack, packHi, packSh, out);
      a.outlineRect(8, ty, 14, 15, vestBlue, out);
      a.rect(9, ty + 1, 12, 2, vestHi);
      a.rect(9, ty + 11, 12, 3, vestDark);
      a.rect(12, ty + 4, 3, 3, '#ffffff');
      a.outlineRect(13 + stepL, ty + 3, 6, 9, shirtW, out);
      a.rect(13 + stepL, ty + 9, 4, 3, skin);
      a.outlineRect(8 + stepL, ty + 8, 5, 6, '#38bdf8', out);
    }

    // 3. Head & SUS Sun Cap (Boné)
    const hy = 4 + bob;
    a.outlineRect(8, hy + 4, 16, 14, skin, out);
    a.rect(9, hy + 5, 14, 2, skinHi);
    a.rect(9, hy + 14, 14, 3, skinSh);

    if (dir === 'down') {
      // Eyes & warm cheeks
      a.rect(11, hy + 10, 2, 3, '#1e1b18'); a.px(11, hy + 10, '#ffffff');
      a.rect(19, hy + 10, 2, 3, '#1e1b18'); a.px(19, hy + 10, '#ffffff');
      a.rect(10, hy + 13, 2, 1, '#e88b7b');
      a.rect(20, hy + 13, 2, 1, '#e88b7b');
      // Hair sideburns
      a.rect(9, hy + 7, 2, 6, hair);
      a.rect(21, hy + 7, 2, 6, hair);
      // Cap dome & visor
      a.bevelRect(6, hy, 20, 8, capBlue, capHi, capDark, out);
      a.rect(9, hy + 2, 14, 2, capHi);
      a.rect(8, hy + 6, 16, 2, capDark);
    } else if (dir === 'up') {
      a.rect(9, hy + 8, 14, 9, hair);
      a.rect(11, hy + 9, 10, 2, hairHi);
      a.bevelRect(6, hy, 20, 8, capBlue, capHi, capDark, out);
      a.rect(9, hy + 2, 14, 2, capHi);
    } else if (dir === 'right') {
      a.rect(9, hy + 6, 5, 8, hair);
      a.rect(10, hy + 7, 2, 4, hairHi);
      a.rect(19, hy + 10, 2, 3, '#1e1b18'); a.px(19, hy + 10, '#ffffff');
      a.bevelRect(8, hy, 16, 8, capBlue, capHi, capDark, out);
      a.outlineRect(19, hy + 4, 9, 4, capDark, out);
    } else {
      a.rect(18, hy + 6, 5, 8, hair);
      a.rect(20, hy + 7, 2, 4, hairHi);
      a.rect(11, hy + 10, 2, 3, '#1e1b18'); a.px(11, hy + 10, '#ffffff');
      a.bevelRect(8, hy, 16, 8, capBlue, capHi, capDark, out);
      a.outlineRect(4, hy + 4, 9, 4, capDark, out);
    }

    return this.bake(a.canvas, 1);
  }

  buildUmbrellaSprite() {
    const a = this.createArtCanvas(56, 36);
    const out = this.OUTLINE;
    a.ellipse(28, 20, 25, 14, out);
    a.ellipse(28, 19, 23.5, 12.5, '#035388');
    a.ellipse(28, 18, 22, 11, '#0284c7');
    a.ellipse(25, 15, 15, 7, '#38bdf8');
    // Curved ribbed stripes
    a.rect(26, 7, 4, 22, '#e0f2fe');
    a.rect(14, 10, 4, 17, '#0369a1');
    a.rect(38, 10, 4, 17, '#0369a1');
    // Highlighted ferrule tip
    a.outlineRect(26, 4, 4, 4, '#facc15', out);
    this.umbrellaSprite = this.bake(a.canvas, 1);
  }

  // ==========================================================================
  // 7. ANIMATED 4-DIRECTION DOGS (native 40x36)
  // ==========================================================================
  buildDogSprites() {
    const breeds = {
      caramelo: { body: '#d98a3c', dark: '#9e541b', light: '#f2b86d', collar: '#dc2626' },
      fila:     { body: '#7c4e2d', dark: '#4a2b14', light: '#a36e44', collar: '#1d4ed8' },
      pinscher: { body: '#272422', dark: '#12100f', light: '#c47431', collar: '#eab308' }
    };

    Object.entries(breeds).forEach(([breed, pal]) => {
      this.dogFrames[breed] = {};
      ['down', 'up', 'left', 'right'].forEach(dir => {
        this.dogFrames[breed][dir] = [0, 1, 2].map(f => this.makeDogFrame(pal, dir, f));
      });
    });
  }

  makeDogFrame(pal, dir, frame) {
    const a = this.createArtCanvas(40, 36);
    const out = this.OUTLINE;
    const wag = frame === 1 ? -2 : (frame === 2 ? 2 : 0);
    const run = frame === 1 ? -2 : (frame === 2 ? 2 : 0);

    a.softShadow(20, 31, 13, 4, 0.32);

    if (dir === 'right' || dir === 'left') {
      const flip = dir === 'left';
      const fx = (x, w = 1) => flip ? 40 - x - w : x;

      // Wagging tail
      a.outlineRect(fx(3, 7), 13 + wag, 7, 4, pal.dark, out);
      // Legs
      a.outlineRect(fx(10 + run, 5), 24, 5, 8, pal.dark, out);
      a.outlineRect(fx(23 - run, 5), 24, 5, 8, pal.body, out);
      // Body
      a.bevelRect(fx(8, 22), 14, 22, 12, pal.body, pal.light, pal.dark, out);
      a.rect(fx(12, 13), 16, 13, 3, pal.light);
      // Collar + brass tag
      a.rect(fx(24, 4), 15, 4, 10, pal.collar);
      a.rect(fx(27, 2), 23, 2, 2, '#fde047');
      // Head & snout
      a.bevelRect(fx(24, 14), 6, 14, 12, pal.body, pal.light, pal.dark, out);
      a.outlineRect(fx(34, 5), 11, 5, 5, pal.light, out);
      a.rect(fx(36, 2), 11, 2, 2, '#18181b');
      a.rect(fx(30, 2), 9, 2, 3, '#18181b');
      a.px(fx(30), 9, '#ffffff');
      // Floppy ear
      a.outlineRect(fx(24, 5), 7, 5, 7, pal.dark, out);
    } else if (dir === 'down') {
      a.outlineRect(12, 24 + run, 5, 8, pal.body, out);
      a.outlineRect(23, 24 - run, 5, 8, pal.body, out);
      a.bevelRect(12, 16, 16, 12, pal.body, pal.light, pal.dark, out);
      a.rect(13, 17, 14, 4, pal.collar);
      a.rect(19, 20, 2, 2, '#fde047');
      a.bevelRect(10, 4, 20, 14, pal.body, pal.light, pal.dark, out);
      a.outlineRect(8, 7, 4, 8, pal.dark, out);
      a.outlineRect(28, 7, 4, 8, pal.dark, out);
      a.rect(15, 9, 2, 3, '#18181b'); a.px(15, 9, '#ffffff');
      a.rect(23, 9, 2, 3, '#18181b'); a.px(23, 9, '#ffffff');
      a.rect(17, 12, 6, 4, pal.light);
      a.rect(18, 12, 4, 2, '#18181b');
    } else {
      a.outlineRect(12, 24 + run, 5, 8, pal.dark, out);
      a.outlineRect(23, 24 - run, 5, 8, pal.dark, out);
      a.bevelRect(12, 14, 16, 14, pal.body, pal.light, pal.dark, out);
      a.outlineRect(18 + wag, 9, 4, 7, pal.dark, out);
      a.outlineRect(12, 4, 16, 12, pal.dark, out);
    }

    return this.bake(a.canvas, 1);
  }

  // ==========================================================================
  // 7B. ANIMATED 4-DIRECTION CATS (native 32x30)
  // ==========================================================================
  buildCatSprites() {
    const coats = {
      branco:   { body: '#f8fafc', dark: '#cbd5e1', light: '#ffffff', accent: '#f1f5f9', ear: '#f9a8d4', eye: '#0284c7', collar: '#f43f5e' },
      laranja:  { body: '#ea8c38', dark: '#b55b1c', light: '#fbc478', accent: '#c96b23', ear: '#fda4af', eye: '#16a34a', collar: '#0284c7' },
      tricolor: { body: '#f8fafc', dark: '#cbd5e1', light: '#ffffff', accent: '#e07a2c', patch2: '#2d2825', ear: '#f9a8d4', eye: '#ca8a04', collar: '#a855f7' },
      preto:    { body: '#292524', dark: '#141211', light: '#44403c', accent: '#1c1917', ear: '#78716c', eye: '#facc15', collar: null },
      frajola:  { body: '#262423', dark: '#121010', light: '#44403c', accent: '#f8fafc', tuxedo: true, ear: '#f9a8d4', eye: '#22c55e', collar: null }
    };

    Object.entries(coats).forEach(([coat, pal]) => {
      this.catFrames[coat] = {};
      ['down', 'up', 'left', 'right'].forEach(dir => {
        this.catFrames[coat][dir] = [0, 1, 2].map(f => this.makeCatFrame(pal, dir, f));
      });
    });
  }

  makeCatFrame(pal, dir, frame) {
    const a = this.createArtCanvas(32, 30);
    const out = this.OUTLINE;
    const swish = frame === 1 ? -1 : (frame === 2 ? 1 : 0);
    const step = frame === 1 ? -1 : (frame === 2 ? 1 : 0);

    a.softShadow(16, 26, 10, 3, 0.28);

    if (dir === 'right' || dir === 'left') {
      const flip = dir === 'left';
      const fx = (x, w = 1) => flip ? 32 - x - w : x;

      // Curved upright cat tail
      a.outlineRect(fx(3, 4), 8 + swish, 4, 10, pal.dark, out);
      a.outlineRect(fx(2, 4), 6 + swish, 4, 4, pal.body, out);
      // Legs & paws
      a.outlineRect(fx(8 + step, 4), 20, 4, 6, pal.tuxedo ? '#f8fafc' : pal.dark, out);
      a.outlineRect(fx(18 - step, 4), 20, 4, 6, pal.tuxedo ? '#f8fafc' : pal.body, out);
      // Fluffy body
      a.bevelRect(fx(6, 17), 13, 17, 9, pal.body, pal.light, pal.dark, out);
      if (pal.patch2) {
        a.rect(fx(9, 5), 14, 5, 5, pal.accent);
        a.rect(fx(14, 4), 16, 4, 4, pal.patch2);
      } else if (pal.tuxedo) {
        a.rect(fx(16, 6), 17, 6, 4, '#f8fafc');
      } else {
        a.rect(fx(9, 9), 15, 9, 2, pal.light);
      }
      // Collar with tiny bell (for friendly cats)
      if (pal.collar) {
        a.rect(fx(19, 3), 14, 3, 7, pal.collar);
        a.rect(fx(21, 2), 19, 2, 2, '#fde047');
      }
      // Pointed ears
      a.outlineRect(fx(19, 4), 3, 4, 5, pal.body, out);
      a.px(fx(20), 5, pal.ear);
      a.outlineRect(fx(24, 4), 3, 4, 5, pal.body, out);
      a.px(fx(25), 5, pal.ear);
      // Head
      a.bevelRect(fx(18, 11), 6, 11, 10, pal.body, pal.light, pal.dark, out);
      if (pal.tuxedo) {
        a.rect(fx(24, 5), 11, 5, 4, '#f8fafc');
      }
      // Bright cat eye & pink nose
      a.rect(fx(24, 2), 9, 2, 3, pal.eye);
      a.px(fx(25), 10, '#18181b');
      a.px(fx(24), 9, '#ffffff');
      a.rect(fx(27, 2), 12, 2, 2, '#fb7185');
    } else if (dir === 'down') {
      // Paws
      a.outlineRect(10, 21 + step, 4, 5, pal.tuxedo ? '#f8fafc' : pal.body, out);
      a.outlineRect(18, 21 - step, 4, 5, pal.tuxedo ? '#f8fafc' : pal.body, out);
      // Body
      a.bevelRect(9, 14, 14, 9, pal.body, pal.light, pal.dark, out);
      if (pal.tuxedo) {
        a.rect(12, 16, 8, 6, '#f8fafc');
      } else if (pal.patch2) {
        a.rect(10, 15, 5, 5, pal.accent);
        a.rect(17, 17, 4, 4, pal.patch2);
      }
      if (pal.collar) {
        a.rect(10, 14, 12, 3, pal.collar);
        a.rect(15, 16, 2, 2, '#fde047');
      }
      // Pointed ears
      a.outlineRect(8, 2, 5, 6, pal.body, out);
      a.rect(10, 4, 2, 3, pal.ear);
      a.outlineRect(19, 2, 5, 6, pal.body, out);
      a.rect(20, 4, 2, 3, pal.ear);
      // Round cat face
      a.bevelRect(8, 5, 16, 11, pal.body, pal.light, pal.dark, out);
      if (pal.tuxedo) {
        a.rect(12, 11, 8, 4, '#f8fafc');
      } else if (pal.patch2) {
        a.rect(9, 6, 5, 4, pal.accent);
        a.rect(18, 6, 5, 4, pal.patch2);
      }
      // Expressive cat eyes
      a.rect(11, 8, 3, 3, pal.eye); a.px(12, 9, '#18181b'); a.px(11, 8, '#ffffff');
      a.rect(18, 8, 3, 3, pal.eye); a.px(19, 9, '#18181b'); a.px(18, 8, '#ffffff');
      // Tiny pink nose
      a.rect(15, 11, 2, 2, '#fb7185');
    } else {
      // Back view
      a.outlineRect(10, 21 + step, 4, 5, pal.dark, out);
      a.outlineRect(18, 21 - step, 4, 5, pal.dark, out);
      a.bevelRect(9, 13, 14, 10, pal.body, pal.light, pal.dark, out);
      if (pal.patch2) {
        a.rect(10, 15, 5, 5, pal.accent);
        a.rect(17, 15, 4, 5, pal.patch2);
      }
      // Upright tail
      a.outlineRect(14 + swish, 7, 4, 10, pal.dark, out);
      // Back of ears & head
      a.outlineRect(9, 2, 4, 5, pal.dark, out);
      a.outlineRect(19, 2, 4, 5, pal.dark, out);
      a.outlineRect(9, 5, 14, 10, pal.body, out);
    }

    return this.bake(a.canvas, 1);
  }

  // ==========================================================================
  // 8. NPC RESIDENT & UBS STAFF OVERWORLD SPRITES (native 32x48)
  // ==========================================================================
  buildNPCSprites() {
    window.ACS_DATA.families.forEach(fam => {
      this.npcSprites[fam.id] = [0, 1].map(frame => this.makeNPCSprite(fam.appearance, frame));
    });
  }

  getStaffSprite(staffId, appearance) {
    if (!this.staffSprites[staffId]) {
      this.staffSprites[staffId] = [0, 1].map(frame => this.makeNPCSprite(appearance, frame));
    }
    return this.staffSprites[staffId];
  }

  makeNPCSprite(app, frame) {
    const a = this.createArtCanvas(32, 48);
    const out = this.OUTLINE;
    const bob = frame === 1 ? -2 : 0;

    a.softShadow(16, 44, 10, 4, 0.34);

    // 1. Legs / Skirt / Uniform Pants
    const pantsCol = app.pants || (app.acsVest ? '#52493e' : '#475569');
    if (app.gender === 'f' && !app.acsVest && !app.labCoat && !app.uniformPants) {
      const skirtCol = this.shade(app.shirt, -26);
      a.bevelRect(8, 30, 16, 11, skirtCol, this.shade(skirtCol, 18), this.shade(skirtCol, -24), out);
      a.outlineRect(10, 40, 5, 5, '#452b17', out);
      a.outlineRect(17, 40, 5, 5, '#452b17', out);
    } else {
      a.outlineRect(10, 32, 6, 9, pantsCol, out);
      a.rect(11, 33, 2, 6, this.shade(pantsCol, 16));
      a.outlineRect(16, 32, 6, 9, this.shade(pantsCol, -18), out);
      a.bevelRect(10, 39, 6, 6, '#452b17', '#6e4728', out, out);
      a.bevelRect(16, 39, 6, 6, '#452b17', '#54351d', out, out);
    }

    // 2. Shirt / Lab Coat / ACS Vest Torso
    const ty = 20 + bob;
    if (app.labCoat) {
      a.bevelRect(6, ty, 20, 16, '#f8fafc', '#ffffff', '#cbd5e1', out);
      a.rect(12, ty + 2, 8, 12, app.shirt);
      if (app.stethoscope) {
        a.rect(10, ty + 2, 2, 5, '#334155');
        a.rect(20, ty + 2, 2, 5, '#334155');
        a.rect(11, ty + 6, 10, 2, '#334155');
        a.rect(18, ty + 8, 3, 3, '#94a3b8');
      }
      a.rect(8, ty + 6, 3, 2, '#0284c7');
    } else if (app.acsVest) {
      a.bevelRect(6, ty, 20, 14, '#0284c7', '#26a0e0', '#035388', out);
      a.rect(14, ty + 1, 4, 12, '#f8fafc');
      a.rect(9, ty + 4, 3, 3, '#ffffff');
      a.rect(20, ty + 4, 3, 3, '#fde047');
    } else {
      a.bevelRect(6, ty, 20, 14, app.shirt, this.shade(app.shirt, 22), this.shade(app.shirt, -26), out);
      if (app.apron) {
        a.bevelRect(10, ty + 3, 12, 11, app.apron, this.shade(app.apron, 14), this.shade(app.apron, -20), '#6e4a2e');
      }
      if (app.badge) {
        a.rect(20, ty + 4, 3, 3, '#fde047');
      }
    }

    // 3. Arms (right arm waves slightly on frame 1)
    const sleeve = app.labCoat ? '#f8fafc' : (app.acsVest ? '#f8fafc' : app.shirt);
    a.outlineRect(4, ty + 2, 4, 10, app.skin, out);
    a.rect(5, ty + 2, 2, 4, sleeve);
    a.outlineRect(24, ty + (frame === 1 ? -1 : 2), 4, 10, app.skin, out);
    a.rect(25, ty + (frame === 1 ? -1 : 2), 2, 4, sleeve);

    // 4. Head, Eyes, Glasses, Mustache & Hair/Hat
    const hy = 4 + bob;
    const skinHi = this.shade(app.skin, 18);
    const skinSh = this.shade(app.skin, -24);
    a.outlineRect(8, hy + 4, 16, 14, app.skin, out);
    a.rect(9, hy + 5, 14, 2, skinHi);
    a.rect(9, hy + 14, 14, 3, skinSh);

    a.rect(11, hy + 10, 2, 3, '#1c1917'); a.px(11, hy + 10, '#ffffff');
    a.rect(19, hy + 10, 2, 3, '#1c1917'); a.px(19, hy + 10, '#ffffff');

    if (app.glasses) {
      a.outlineRect(10, hy + 9, 5, 4, 'rgba(186,230,253,0.45)', '#334155');
      a.outlineRect(17, hy + 9, 5, 4, 'rgba(186,230,253,0.45)', '#334155');
      a.rect(15, hy + 10, 2, 1, '#334155');
      a.rect(11, hy + 10, 2, 2, '#1c1917');
      a.rect(18, hy + 10, 2, 2, '#1c1917');
    }
    if (app.mustache) {
      a.rect(12, hy + 14, 8, 2, app.hair);
    }

    const hairHi = this.shade(app.hair, 22);
    const hairSh = this.shade(app.hair, -22);
    if (app.hat) {
      a.bevelRect(6, hy, 20, 7, app.hat, this.shade(app.hat, 22), this.shade(app.hat, -22), out);
      a.outlineRect(4, hy + 5, 24, 4, this.shade(app.hat, -18), out);
    } else if (app.hairStyle === 'bun') {
      a.bevelRect(12, hy - 2, 8, 6, app.hair, hairHi, hairSh, out);
      a.bevelRect(8, hy + 2, 16, 6, app.hair, hairHi, hairSh, out);
      a.rect(8, hy + 6, 3, 6, app.hair);
      a.rect(21, hy + 6, 3, 6, app.hair);
    } else if (app.hairStyle === 'long') {
      a.bevelRect(8, hy + 2, 16, 6, app.hair, hairHi, hairSh, out);
      a.outlineRect(6, hy + 6, 4, 14, app.hair, out);
      a.outlineRect(22, hy + 6, 4, 14, app.hair, out);
    } else if (app.hairStyle === 'bald') {
      a.rect(8, hy + 6, 3, 5, app.hair);
      a.rect(21, hy + 6, 3, 5, app.hair);
      a.rect(12, hy + 5, 6, 2, skinHi);
    } else {
      a.bevelRect(8, hy + 2, 16, 6, app.hair, hairHi, hairSh, out);
      a.rect(8, hy + 6, 3, 5, app.hair);
      a.rect(21, hy + 6, 3, 5, app.hair);
    }

    return this.bake(a.canvas, 1);
  }

  // ==========================================================================
  // 8B. INTERIOR TILES, FURNITURE & COMMUNITY PROPS (native 1x)
  // ==========================================================================
  buildInteriorAssets() {
    const out = this.OUTLINE;

    // 1. Clinic Ceramic Floor Tile (2 subtle warm-stone variants -> 32x32)
    this.interior.clinicFloor = [0, 1].map(v => {
      const a = this.createArtCanvas(32, 32);
      const base = v === 0 ? '#eee8da' : '#e6dfd0';
      a.rect(0, 0, 32, 32, '#cfc6b4');
      a.cobbleStone(0, 0, 15, 15, base, '#faf7f0', '#dcd3c0', '#cfc6b4');
      a.cobbleStone(16, 0, 15, 15, base, '#faf7f0', '#dcd3c0', '#cfc6b4');
      a.cobbleStone(0, 16, 15, 15, base, '#faf7f0', '#dcd3c0', '#cfc6b4');
      a.cobbleStone(16, 16, 15, 15, base, '#faf7f0', '#dcd3c0', '#cfc6b4');
      a.px(5, 5, '#ffffff');
      a.px(21, 21, '#ffffff');
      return this.bake(a.canvas, 1);
    });

    // 2. Clinic Corridor Pale-Blue Ceramic Tile (32x32)
    const cor = this.createArtCanvas(32, 32);
    cor.rect(0, 0, 32, 32, '#b6d2e0');
    cor.cobbleStone(0, 0, 15, 15, '#dcebf2', '#f0f8fc', '#c4dce8', '#b6d2e0');
    cor.cobbleStone(16, 0, 15, 15, '#dcebf2', '#f0f8fc', '#c4dce8', '#b6d2e0');
    cor.cobbleStone(0, 16, 15, 15, '#dcebf2', '#f0f8fc', '#c4dce8', '#b6d2e0');
    cor.cobbleStone(16, 16, 15, 15, '#dcebf2', '#f0f8fc', '#c4dce8', '#b6d2e0');
    this.interior.corridorFloor = this.bake(cor.canvas, 1);

    // 3. Cozy Honey-Wood Parquet Floor (2 variants -> 32x32)
    this.interior.esfFloor = [0, 1].map(v => {
      const a = this.createArtCanvas(32, 32);
      a.woodPlanks(0, 0, 32, 32, v === 0 ? '#cf9e65' : '#c4935a', '#e3b882', '#9c6b3b', '#754b24', true, 8, 50 + v * 19);
      return this.bake(a.canvas, 1);
    });

    // 4. Reception Desk (192x72)
    const rd = this.createArtCanvas(192, 72);
    rd.rect(4, 60, 184, 10, 'rgba(26, 18, 12, 0.28)');
    rd.bevelRect(4, 20, 184, 44, '#f5efe2', '#ffffff', '#d6cbb8', out);
    rd.bevelRect(6, 36, 180, 24, '#0284c7', '#38bdf8', '#035388', '#035388');
    // SUS Cross on front of reception desk
    rd.rect(88, 42, 16, 12, '#ffffff');
    rd.rect(94, 44, 4, 8, '#0284c7');
    rd.rect(92, 46, 8, 4, '#0284c7');
    // Textured wooden counter top
    rd.outlineRect(0, 16, 192, 12, '#c89258', out);
    rd.woodPlanks(2, 17, 188, 10, '#c89258', '#e3b57e', '#9c6835', '#784d22', true, 5, 7);
    rd.rect(4, 28, 184, 3, 'rgba(30, 18, 10, 0.22)');
    // Monitor, folders, sanitizer
    rd.bevelRect(24, 2, 28, 18, '#334155', '#64748b', '#1e293b', out);
    rd.rect(28, 4, 20, 12, '#38bdf8');
    rd.rect(30, 6, 8, 3, '#bae6fd');
    rd.rect(34, 20, 8, 4, '#475569');
    rd.bevelRect(136, 8, 20, 12, '#fef08a', '#fef9c3', '#ca8a04', out);
    rd.bevelRect(140, 4, 20, 12, '#bae6fd', '#e0f2fe', '#0284c7', out);
    rd.bevelRect(68, 6, 24, 14, '#e0f2fe', '#ffffff', '#7dd3fc', '#0369a1');
    this.interior.receptionDesk = this.bake(rd.canvas, 1);

    // 5. Blue Clinic Waiting Chairs (96x48)
    const wb = this.createArtCanvas(96, 48);
    wb.softShadow(48, 42, 42, 5, 0.25);
    wb.rect(12, 34, 72, 4, '#475569');
    wb.outlineRect(16, 34, 6, 10, '#334155', out);
    wb.outlineRect(74, 34, 6, 10, '#334155', out);
    [8, 36, 64].forEach(cx => {
      wb.bevelRect(cx, 6, 24, 20, '#0284c7', '#38bdf8', '#035388', out);
      wb.bevelRect(cx, 22, 24, 14, '#0369a1', '#0ea5e9', '#0c4a6e', out);
    });
    this.interior.waitingBench = this.bake(wb.canvas, 1);

    // 6. Water Cooler / Bebedouro (40x68)
    const wc = this.createArtCanvas(40, 68);
    wc.softShadow(20, 62, 14, 5, 0.28);
    wc.bevelRect(8, 28, 24, 34, '#eef2f6', '#ffffff', '#cbd5e1', out);
    wc.rect(10, 30, 20, 8, '#cbd5e1');
    wc.bevelRect(12, 40, 16, 10, '#dbe2ea', '#f8fafc', '#94a3b8', '#64748b');
    wc.rect(14, 42, 3, 3, '#0284c7');
    wc.rect(23, 42, 3, 3, '#dc2626');
    // 20L Water Jug
    wc.bevelRect(10, 6, 20, 22, '#38bdf8', '#bae6fd', '#0284c7', '#0369a1');
    wc.rect(12, 9, 5, 15, '#e0f2fe');
    wc.outlineRect(14, 2, 12, 6, '#0284c7', out);
    this.interior.waterCooler = this.bake(wc.canvas, 1);

    // 7. Medical Exam Table / Maca (88x56)
    const et = this.createArtCanvas(88, 56);
    et.softShadow(44, 49, 38, 6, 0.26);
    et.outlineRect(12, 32, 6, 20, '#64748b', out);
    et.outlineRect(70, 32, 6, 20, '#64748b', out);
    et.bevelRect(6, 16, 76, 20, '#0284c7', '#38bdf8', '#035388', out);
    et.bevelRect(10, 18, 68, 12, '#f8fafc', '#ffffff', '#cbd5e1', '#94a3b8');
    et.bevelRect(10, 12, 18, 12, '#bae6fd', '#e0f2fe', '#0284c7', '#0369a1');
    et.bevelRect(32, 42, 24, 10, '#cbd5e1', '#f8fafc', '#64748b', '#475569');
    this.interior.examTable = this.bake(et.canvas, 1);

    // 8. Consultation Desk (80x52)
    const cd = this.createArtCanvas(80, 52);
    cd.softShadow(40, 46, 36, 5, 0.26);
    cd.outlineRect(4, 20, 72, 26, '#b8824d', out);
    cd.woodPlanks(5, 21, 70, 8, '#c89258', '#e3b57e', '#9c6234', '#6e4521', true, 4, 31);
    cd.bevelRect(8, 30, 20, 14, '#9c6234', '#b8824d', '#6e4221', '#5c381c');
    cd.bevelRect(52, 30, 20, 14, '#9c6234', '#b8824d', '#6e4221', '#5c381c');
    cd.bevelRect(14, 4, 24, 16, '#334155', '#64748b', '#1e293b', out);
    cd.rect(18, 6, 16, 10, '#7dd3fc');
    cd.bevelRect(46, 10, 20, 12, '#ffffff', '#ffffff', '#cbd5e1', '#64748b');
    cd.rect(50, 14, 12, 2, '#0284c7');
    this.interior.clinicDesk = this.bake(cd.canvas, 1);

    // 9. Vaccine Refrigerator / Câmara Fria (48x68)
    const vf = this.createArtCanvas(48, 68);
    vf.softShadow(24, 61, 18, 5, 0.28);
    vf.bevelRect(6, 6, 36, 56, '#f8fafc', '#ffffff', '#cbd5e1', out);
    vf.rect(8, 8, 32, 8, '#0284c7');
    vf.rect(12, 10, 10, 4, '#4ade80');
    vf.bevelRect(10, 20, 28, 28, '#bae6fd', '#e0f2fe', '#7dd3fc', '#0369a1');
    vf.rect(12, 28, 24, 2, '#0284c7');
    vf.rect(12, 38, 24, 2, '#0284c7');
    vf.rect(14, 22, 4, 6, '#f43f5e');
    vf.rect(20, 22, 4, 6, '#3b82f6');
    vf.rect(26, 22, 4, 6, '#eab308');
    this.interior.vaccineFridge = this.bake(vf.canvas, 1);

    // 10. Physiotherapy Mat & Exercise Ball (88x56)
    const pm = this.createArtCanvas(88, 56);
    pm.bevelRect(4, 24, 52, 26, '#14b8a6', '#5eead4', '#0f766e', '#115e59');
    pm.rect(30, 24, 2, 26, '#0f766e');
    pm.softShadow(70, 44, 12, 5, 0.28);
    pm.ellipse(70, 30, 14, 14, out);
    pm.ellipse(70, 29, 13, 13, '#6d28d9');
    pm.ellipse(69, 27, 11, 11, '#8b5cf6');
    pm.ellipse(65, 23, 5, 4, '#c4b5fd');
    this.interior.physioMat = this.bake(pm.canvas, 1);

    // 11. Mop Bucket & Wet Floor Cone (56x48)
    const mb = this.createArtCanvas(56, 48);
    mb.softShadow(16, 40, 12, 4, 0.25);
    mb.softShadow(40, 40, 10, 4, 0.25);
    mb.bevelRect(6, 22, 20, 18, '#0284c7', '#38bdf8', '#035388', out);
    mb.rect(8, 24, 16, 6, '#7dd3fc');
    mb.outlineRect(16, 2, 4, 24, '#b57b4a', out);
    mb.bevelRect(32, 18, 18, 22, '#facc15', '#fef08a', '#ca8a04', out);
    mb.rect(38, 22, 6, 10, '#1e1b18');
    mb.rect(40, 34, 2, 2, '#dc2626');
    this.interior.mopBucket = this.bake(mb.canvas, 1);

    // 12. Indoor Potted Plant (40x60)
    const pp = this.createArtCanvas(40, 60);
    pp.softShadow(20, 54, 12, 4, 0.26);
    pp.bevelRect(10, 34, 20, 20, '#c26a42', '#e0895e', '#7d3a1e', out);
    pp.bevelRect(8, 32, 24, 6, '#d97b50', '#eba075', '#8c4122', out);
    pp.foliageLobe(20, 22, 14, 12, out, 7, 1.3);
    pp.foliageLobe(20, 22, 13, 11, '#2d5724', 7, 1.3);
    pp.foliageLobe(18, 20, 11, 9, '#487d32', 9, 1.2);
    pp.foliageLobe(16, 16, 7, 6, '#70a33e', 11, 1.0);
    pp.rect(13, 13, 3, 2, '#9cc44d');
    this.interior.pottedPlant = this.bake(pp.canvas, 1);

    // 13. SUS Wall Poster (56x44)
    const wp = this.createArtCanvas(56, 44);
    wp.bevelRect(2, 2, 52, 40, '#fffdf5', '#ffffff', '#d6cbb8', '#3b200f');
    wp.rect(4, 4, 48, 10, '#0284c7');
    wp.rect(8, 6, 6, 6, '#ffffff');
    wp.rect(18, 6, 28, 4, '#bae6fd');
    wp.bevelRect(8, 18, 16, 16, '#fde047', '#fef9c3', '#ca8a04', '#78350f');
    wp.rect(28, 18, 20, 4, '#64748b');
    wp.rect(28, 26, 16, 4, '#94a3b8');
    wp.rect(28, 34, 20, 4, '#22c55e');
    this.interior.wallPosterSUS = this.bake(wp.canvas, 1);

    // 14. Giant Territorial Map on Wall of Sala ESF (136x72)
    const tm = this.createArtCanvas(136, 72);
    tm.bevelRect(2, 2, 132, 68, '#f8e6c2', '#fff8e1', '#c7ab70', '#4a2e19');
    tm.rect(6, 6, 124, 60, '#7d933a');
    tm.rect(32, 6, 8, 60, '#2d6e87');
    tm.rect(28, 32, 16, 8, '#b57d47');
    tm.rect(48, 18, 76, 6, '#7e7266');
    tm.rect(48, 36, 76, 6, '#7e7266');
    tm.rect(48, 54, 76, 6, '#7e7266');
    tm.rect(48, 18, 6, 42, '#7e7266');
    [[16, 34, '#0284c7'], [64, 14, '#22c55e'], [88, 14, '#ef4444'], [110, 14, '#facc15'],
     [72, 32, '#22c55e'], [96, 32, '#a855f7'], [116, 50, '#ef4444'], [80, 50, '#22c55e']
    ].forEach(([px0, py0, col]) => {
      tm.outlineRect(px0, py0, 6, 6, col, out);
      tm.rect(px0 + 2, py0 + 2, 2, 2, '#ffffff');
    });
    this.interior.territoryMapWall = this.bake(tm.canvas, 1);

    // 15. ESF Shared ACS Team Table (120x64)
    const tab = this.createArtCanvas(120, 64);
    tab.softShadow(60, 56, 54, 6, 0.28);
    tab.outlineRect(4, 12, 112, 40, '#b8824d', out);
    tab.woodPlanks(6, 14, 108, 30, '#c89258', '#e3b57e', '#9c6234', '#6e4521', true, 6, 44);
    tab.rect(6, 45, 108, 5, '#7a4d26');
    tab.outlineRect(10, 52, 8, 10, '#6b3e1f', out);
    tab.outlineRect(102, 52, 8, 10, '#6b3e1f', out);
    tab.bevelRect(16, 20, 20, 16, '#38bdf8', '#bae6fd', '#0284c7', '#1e293b');
    tab.bevelRect(48, 18, 24, 18, '#fef9c3', '#ffffff', '#e6d8a2', '#78350f');
    tab.rect(52, 22, 16, 2, '#64748b');
    tab.rect(52, 28, 12, 2, '#64748b');
    tab.bevelRect(88, 14, 12, 20, '#dc2626', '#f87171', '#991b1b', out);
    tab.rect(90, 10, 8, 6, '#1e1b18');
    tab.bevelRect(102, 26, 8, 8, '#ffffff', '#ffffff', '#cbd5e1', out);
    this.interior.esfTable = this.bake(tab.canvas, 1);

    // 16. ACS Supply Locker (60x76)
    const sl = this.createArtCanvas(60, 76);
    sl.softShadow(30, 69, 25, 5, 0.26);
    sl.bevelRect(4, 4, 52, 66, '#e2e8f0', '#ffffff', '#94a3b8', out);
    sl.bevelRect(6, 6, 48, 12, '#0284c7', '#38bdf8', '#035388', '#035388');
    sl.rect(26, 8, 8, 8, '#ffffff');
    sl.rect(29, 20, 2, 46, '#94a3b8');
    sl.rect(22, 36, 4, 10, '#334155');
    sl.rect(34, 36, 4, 10, '#334155');
    for (let vy = 24; vy < 34; vy += 4) {
      sl.rect(10, vy, 14, 2, '#64748b');
      sl.rect(36, vy, 14, 2, '#64748b');
    }
    this.interior.supplyLocker = this.bake(sl.canvas, 1);

    // 17. e-SUS Computer Desk Station (72x56)
    const ec = this.createArtCanvas(72, 56);
    ec.softShadow(36, 50, 32, 5, 0.26);
    ec.outlineRect(4, 24, 64, 26, '#9c6234', out);
    ec.woodPlanks(6, 25, 60, 8, '#c28b52', '#e3b57e', '#8c5a2b', '#6e4521', true, 4, 55);
    ec.bevelRect(18, 4, 36, 22, '#1e293b', '#475569', '#0f172a', out);
    ec.rect(22, 8, 28, 14, '#0284c7');
    ec.rect(32, 10, 8, 4, '#ffffff');
    ec.rect(34, 8, 4, 8, '#ffffff');
    ec.rect(30, 26, 12, 4, '#475569');
    ec.bevelRect(22, 32, 28, 6, '#cbd5e1', '#f8fafc', '#94a3b8', '#475569');
    this.interior.esusComputer = this.bake(ec.canvas, 1);

    // 18. Blue SUS Door to Sala ESF (72x88)
    const ed = this.createArtCanvas(72, 88);
    ed.bevelRect(4, 8, 64, 76, '#035388', '#0284c7', '#062c47', out);
    ed.bevelRect(10, 14, 52, 70, '#0284c7', '#38bdf8', '#035388', '#0c4a6e');
    ed.bevelRect(16, 20, 40, 28, '#bae6fd', '#e0f2fe', '#7dd3fc', '#035388');
    ed.rect(20, 24, 10, 18, '#f0f9ff');
    ed.bevelRect(52, 54, 6, 8, '#facc15', '#fef08a', '#b45309', out);
    ed.bevelRect(4, 82, 64, 6, '#94a3b8', '#cbd5e1', '#64748b', out);
    this.interior.esfDoor = this.bake(ed.canvas, 1);

    // 19. Player Home Bed (68x88)
    const bed = this.createArtCanvas(68, 88);
    bed.softShadow(34, 80, 28, 6, 0.28);
    bed.bevelRect(6, 8, 56, 20, '#8c5a32', '#b57b4a', '#5c381c', out);
    bed.woodPlanks(8, 10, 52, 16, '#9c6638', '#cfa06b', '#6e4521', '#543218', false, 8, 61);
    bed.bevelRect(6, 24, 56, 56, '#f8fafc', '#ffffff', '#cbd5e1', out);
    bed.bevelRect(12, 26, 44, 16, '#fef9c3', '#ffffff', '#e6d8a2', '#cbd5e1');
    bed.bevelRect(8, 44, 52, 34, '#0284c7', '#38bdf8', '#035388', '#035388');
    bed.rect(10, 44, 48, 8, '#38bdf8');
    bed.bevelRect(8, 74, 52, 6, '#7a5238', '#a6744c', '#4a2e19', out);
    this.interior.homeBed = this.bake(bed.canvas, 1);

    // 20. Brazilian Clay Water Filter (Filtro de Barro) (40x64)
    const cf = this.createArtCanvas(40, 64);
    cf.softShadow(20, 58, 14, 4.5, 0.28);
    cf.bevelRect(8, 36, 24, 22, '#9c6234', '#cfa06b', '#6b3e1f', out);
    cf.rect(12, 44, 16, 12, '#6b3e1f');
    cf.bevelRect(10, 20, 20, 18, '#c26a42', '#e8966b', '#8c4122', out);
    cf.bevelRect(10, 8, 20, 14, '#d97b50', '#f2aa83', '#9c4b28', out);
    cf.rect(12, 10, 5, 22, '#eba075');
    cf.bevelRect(12, 4, 16, 6, '#a85530', '#d97b50', '#6e2e16', out);
    cf.outlineRect(26, 30, 6, 4, '#f8fafc', out);
    this.interior.clayFilter = this.bake(cf.canvas, 1);

    // 21. Compact Home Kitchen Stove & Coffee Corner (88x60)
    const hk = this.createArtCanvas(88, 60);
    hk.softShadow(44, 53, 40, 6, 0.28);
    hk.outlineRect(4, 18, 44, 36, '#b8824d', out);
    hk.woodPlanks(6, 20, 40, 32, '#b8824d', '#e3b57e', '#87572d', '#5c381c', true, 6, 71);
    hk.bevelRect(48, 18, 36, 36, '#f1f5f9', '#ffffff', '#cbd5e1', out);
    hk.rect(52, 22, 28, 8, '#cbd5e1');
    hk.bevelRect(54, 34, 24, 14, '#334155', '#475569', '#1e293b', out);
    hk.bevelRect(12, 6, 12, 16, '#dc2626', '#f87171', '#991b1b', out);
    hk.rect(14, 2, 8, 6, '#1e1b18');
    hk.bevelRect(28, 12, 10, 10, '#fef08a', '#fef9c3', '#ca8a04', out);
    hk.bevelRect(58, 8, 16, 12, '#94a3b8', '#e2e8f0', '#475569', out);
    hk.rect(62, 4, 8, 4, '#334155');
    this.interior.homeKitchen = this.bake(hk.canvas, 1);

    // 22. Home Study / ACS Notebook Desk (80x56)
    const hd = this.createArtCanvas(80, 56);
    hd.softShadow(40, 50, 36, 5, 0.26);
    hd.outlineRect(4, 22, 72, 28, '#9c6234', out);
    hd.woodPlanks(6, 24, 68, 7, '#cfa06b', '#e8c492', '#8c5a2b', '#6b3e1f', true, 4, 79);
    hd.bevelRect(8, 32, 16, 16, '#6b3e1f', '#8c5a32', '#452811', out);
    hd.bevelRect(56, 32, 16, 16, '#6b3e1f', '#8c5a32', '#452811', out);
    hd.bevelRect(16, 10, 22, 16, '#fef9c3', '#ffffff', '#dfd49b', '#78350f');
    hd.rect(20, 14, 14, 2, '#0284c7');
    hd.rect(20, 20, 10, 2, '#64748b');
    hd.bevelRect(44, 14, 10, 10, '#1e293b', '#475569', '#0f172a', out);
    hd.rect(46, 16, 6, 6, '#38bdf8');
    hd.bevelRect(60, 6, 12, 16, '#facc15', '#fef08a', '#ca8a04', out);
    hd.rect(64, 18, 4, 6, '#475569');
    this.interior.homeDesk = this.bake(hd.canvas, 1);

    // 23. Community Exterior & Interior Assets
    const stallThemes = {
      veg:    { top1: '#16a34a', top2: '#fef9c3', goods: ['#22c55e', '#f97316', '#84cc16'] },
      sewing: { top1: '#be185d', top2: '#fce7f3', goods: ['#f472b6', '#38bdf8', '#facc15'] },
      fruit:  { top1: '#d97706', top2: '#fef3c7', goods: ['#ef4444', '#facc15', '#fb923c'] }
    };
    Object.entries(stallThemes).forEach(([key, th]) => {
      const ms = this.createArtCanvas(88, 76);
      ms.softShadow(44, 68, 38, 6, 0.30);
      ms.outlineRect(8, 20, 6, 50, '#6b3e1f', out);
      ms.outlineRect(74, 20, 6, 50, '#6b3e1f', out);
      ms.outlineRect(6, 44, 76, 24, '#b8824d', out);
      ms.woodPlanks(8, 46, 72, 20, '#b8824d', '#d4a373', '#87572d', '#5c381c', true, 5, 83);
      th.goods.forEach((col, gi) => {
        ms.bevelRect(12 + gi * 22, 36, 18, 12, col, this.shade(col, 24), this.shade(col, -28), out);
      });
      ms.outlineRect(4, 6, 80, 20, th.top1, out);
      for (let sx = 8; sx < 76; sx += 16) {
        ms.rect(sx, 8, 8, 16, th.top2);
        ms.rect(sx, 22, 8, 2, this.shade(th.top2, -24));
      }
      ms.rect(6, 26, 76, 3, 'rgba(26, 15, 8, 0.25)');
      this.community[`stall_${key}`] = this.bake(ms.canvas, 1);
    });

    // Domino Table with 2 stools (72x52)
    const dt = this.createArtCanvas(72, 52);
    dt.softShadow(36, 45, 28, 5, 0.26);
    dt.bevelRect(4, 24, 12, 16, '#8c5a32', '#b57b4a', '#5c381c', out);
    dt.bevelRect(56, 24, 12, 16, '#8c5a32', '#b57b4a', '#5c381c', out);
    dt.outlineRect(18, 14, 36, 26, '#b8824d', out);
    dt.woodPlanks(20, 16, 32, 18, '#c89258', '#e3b57e', '#9c6234', '#6b3e1f', true, 4, 91);
    dt.outlineRect(26, 34, 6, 14, '#6b3e1f', out);
    dt.outlineRect(40, 34, 6, 14, '#6b3e1f', out);
    dt.outlineRect(28, 22, 6, 4, '#f8fafc', '#334155');
    dt.outlineRect(36, 20, 4, 8, '#f8fafc', '#334155');
    dt.outlineRect(42, 24, 6, 4, '#f8fafc', '#334155');
    this.community.dominoTable = this.bake(dt.canvas, 1);

    // Plaza Street Lamp (28x76)
    const lamp = this.createArtCanvas(28, 76);
    lamp.softShadow(14, 70, 10, 4, 0.30);
    lamp.bevelRect(8, 64, 12, 6, '#334155', '#64748b', '#0f172a', out);
    lamp.outlineRect(12, 20, 4, 46, '#1e293b', out);
    lamp.rect(13, 22, 1, 42, '#475569');
    lamp.bevelRect(6, 6, 16, 16, '#fde047', '#fef9c3', '#ca8a04', '#1e293b');
    lamp.rect(10, 10, 8, 8, '#fffdf5');
    lamp.rect(5, 4, 18, 3, '#1e293b');
    this.community.streetLamp = this.bake(lamp.canvas, 1);

    // Horta Soil Bed (48x32)
    const hb = this.createArtCanvas(48, 32);
    hb.softShadow(24, 27, 22, 4, 0.24);
    hb.bevelRect(2, 4, 44, 24, '#784824', '#a66b3d', '#4f2c12', '#3b200f');
    hb.rect(6, 8, 36, 16, '#4f2c12');
    for (let sx = 8; sx < 40; sx += 6) {
      hb.rect(sx, 11, 3, 2, '#693d1c');
      hb.rect(sx + 2, 19, 3, 2, '#693d1c');
    }
    [10, 22, 34].forEach(gx => {
      hb.rect(gx, 10, 6, 6, '#3b6b25');
      hb.rect(gx + 2, 8, 2, 3, '#9cc44d');
      hb.rect(gx, 18, 6, 6, '#3b6b25');
      hb.rect(gx + 2, 16, 2, 3, '#70a33e');
    });
    this.community.hortaBed = this.bake(hb.canvas, 1);

    // Vendinha Counter (168x68)
    const vc = this.createArtCanvas(168, 68);
    vc.softShadow(84, 60, 78, 6, 0.28);
    vc.outlineRect(4, 20, 160, 40, '#9c6234', out);
    vc.woodPlanks(6, 22, 156, 36, '#b8824d', '#d4a373', '#87572d', '#5c381c', true, 6, 97);
    vc.bevelRect(16, 4, 48, 20, '#bae6fd', '#e0f2fe', '#7dd3fc', '#475569');
    vc.bevelRect(22, 12, 10, 6, '#d97706', '#fbbf24', '#92400e', '#78350f');
    vc.bevelRect(36, 12, 10, 6, '#f59e0b', '#fde68a', '#b45309', '#78350f');
    vc.bevelRect(48, 12, 10, 6, '#d97706', '#fbbf24', '#92400e', '#78350f');
    vc.bevelRect(84, 6, 14, 18, '#dc2626', '#f87171', '#991b1b', out);
    vc.bevelRect(108, 8, 16, 16, '#fef3c7', '#ffffff', '#fde68a', '#78350f');
    vc.rect(112, 12, 8, 8, '#b45309');
    this.interior.vendinhaCounter = this.bake(vc.canvas, 1);

    // Grocery Shelf (88x64)
    const gs = this.createArtCanvas(88, 64);
    gs.softShadow(44, 57, 40, 5, 0.25);
    gs.bevelRect(4, 4, 80, 54, '#8c5a32', '#b57b4a', '#5c381c', out);
    gs.rect(8, 18, 72, 4, '#5c381c');
    gs.rect(8, 36, 72, 4, '#5c381c');
    [[12, 8, '#dc2626'], [24, 8, '#16a34a'], [36, 8, '#eab308'], [52, 8, '#0284c7'], [66, 8, '#f97316'],
     [12, 26, '#f59e0b'], [26, 26, '#fef08a'], [42, 26, '#ef4444'], [58, 26, '#22c55e']].forEach(([x, y, col]) => {
      gs.bevelRect(x, y, 10, 10, col, this.shade(col, 24), this.shade(col, -26), out);
    });
    this.interior.groceryShelf = this.bake(gs.canvas, 1);

    // Drink Fridge (48x68)
    const df = this.createArtCanvas(48, 68);
    df.softShadow(24, 61, 18, 5, 0.26);
    df.bevelRect(6, 6, 36, 56, '#e2e8f0', '#ffffff', '#94a3b8', out);
    df.bevelRect(8, 8, 32, 8, '#dc2626', '#f87171', '#991b1b', '#7f1d1d');
    df.bevelRect(10, 20, 28, 30, '#bae6fd', '#e0f2fe', '#7dd3fc', '#334155');
    df.bevelRect(14, 24, 6, 8, '#22c55e', '#86efac', '#15803d', '#14532d');
    df.bevelRect(24, 24, 6, 8, '#f97316', '#fdba74', '#c2410c', '#7c2d12');
    df.bevelRect(14, 36, 6, 8, '#0284c7', '#7dd3fc', '#0369a1', '#0c4a6e');
    df.bevelRect(24, 36, 6, 8, '#eab308', '#fef08a', '#a16207', '#713f12');
    this.interior.drinkFridge = this.bake(df.canvas, 1);

    // Association Meeting Table (120x64)
    const mt = this.createArtCanvas(120, 64);
    mt.softShadow(60, 56, 54, 6, 0.26);
    mt.outlineRect(4, 12, 112, 40, '#8c5a32', out);
    mt.woodPlanks(6, 14, 108, 30, '#b8824d', '#d4a373', '#8c5a32', '#5c381c', true, 6, 103);
    mt.bevelRect(24, 20, 24, 16, '#fef9c3', '#ffffff', '#dfd49b', '#78350f');
    mt.bevelRect(68, 22, 20, 14, '#bae6fd', '#e0f2fe', '#7dd3fc', '#0369a1');
    this.interior.meetingTable = this.bake(mt.canvas, 1);

    // Community Projects Board (96x56)
    const pb = this.createArtCanvas(96, 56);
    pb.bevelRect(4, 4, 88, 48, '#d4a373', '#f0c796', '#8c5a32', out);
    pb.woodPlanks(8, 8, 80, 40, '#9c6234', '#b8824d', '#6b3e1f', '#543218', true, 8, 109);
    pb.bevelRect(14, 14, 30, 14, '#fef9c3', '#ffffff', '#dfd49b', '#78350f');
    pb.bevelRect(52, 14, 30, 14, '#dcfce7', '#ffffff', '#86efac', '#166534');
    pb.bevelRect(14, 32, 30, 14, '#bae6fd', '#ffffff', '#7dd3fc', '#0369a1');
    pb.bevelRect(52, 32, 30, 14, '#fde68a', '#ffffff', '#f59e0b', '#b45309');
    this.interior.projectsBoard = this.bake(pb.canvas, 1);
  }

  // ==========================================================================
  // 9. HANDCRAFTED PIXEL ART PORTRAITS (native 96x96)
  // ==========================================================================
  drawPortraitToCanvas(targetCanvas, entityType, data) {
    const a = this.createArtCanvas(96, 96);
    const out = this.OUTLINE;

    // Warm sunlit layered backdrop
    if (entityType === 'UBS' || entityType === 'STAFF') {
      const bg = (data && data.portraitBg) || '#bae6fd';
      const bgMid = this.warmShade(bg, -0.14);
      const bgBot = this.warmShade(bg, -0.32);
      a.rect(0, 0, 96, 96, bg);
      a.rect(0, 56, 96, 18, bgMid);
      a.rect(0, 68, 96, 28, bgBot);
      a.rect(0, 66, 96, 2, this.warmShade(bg, -0.45));
      // Framed SUS emblem on wall
      a.bevelRect(8, 8, 22, 22, '#ffffff', '#ffffff', '#cbd5e1', '#64748b');
      a.rect(16, 11, 6, 16, '#0284c7');
      a.rect(11, 16, 16, 6, '#0284c7');
    } else if (entityType === 'DOG') {
      a.rect(0, 0, 96, 96, '#d4e6a3');
      a.rect(0, 56, 96, 16, '#b8cf7a');
      a.rect(0, 68, 96, 28, '#8fa64b');
    } else if (entityType === 'CAT') {
      const isFriendly = data.personality === 'fofinho';
      a.rect(0, 0, 96, 96, isFriendly ? '#fce7f3' : '#ede9fe');
      a.rect(0, 56, 96, 16, isFriendly ? '#fbcfe8' : '#ddd6fe');
      a.rect(0, 68, 96, 28, isFriendly ? '#f9a8d4' : '#c4b5fd');
    } else {
      const bg = data.archetype === 'AMIGO' ? '#d9edb2'
        : data.archetype === 'TEIMOSO' ? '#f2d3c2'
        : data.archetype === 'PRIORITARIO' ? '#e5d4f2' : '#f2e3b8';
      a.rect(0, 0, 96, 96, bg);
      a.rect(0, 58, 96, 14, this.warmShade(bg, -0.12));
      a.rect(0, 70, 96, 26, this.warmShade(bg, -0.28));
      a.rect(0, 68, 96, 2, this.warmShade(bg, -0.42));
    }

    if (entityType === 'DOG') {
      const breedColors = {
        caramelo: { b: '#d98a3c', d: '#9c561c', l: '#f5c782', c: '#dc2626' },
        fila:     { b: '#7c4e2d', d: '#4a2b14', l: '#a8744c', c: '#1d4ed8' },
        pinscher: { b: '#2b2725', d: '#12100f', l: '#d47c37', c: '#eab308' }
      };
      const pal = breedColors[data.breed] || breedColors.caramelo;
      a.bevelRect(26, 66, 44, 30, pal.b, pal.l, pal.d, out);
      a.bevelRect(28, 68, 40, 8, pal.c, this.shade(pal.c, 22), this.shade(pal.c, -22), out);
      a.bevelRect(44, 74, 8, 8, '#fde047', '#fef9c3', '#ca8a04', out);
      a.bevelRect(16, 26, 16, 32, pal.d, pal.b, out, out);
      a.bevelRect(64, 26, 16, 32, pal.d, pal.b, out, out);
      a.bevelRect(24, 20, 48, 50, pal.b, pal.l, pal.d, out);
      a.rect(28, 24, 40, 12, pal.l);
      a.bevelRect(32, 44, 32, 22, pal.l, this.shade(pal.l, 16), pal.b, out);
      a.rect(42, 46, 12, 8, '#18181b');
      a.rect(44, 47, 4, 2, '#64748b');
      a.rect(46, 54, 4, 6, '#18181b');
      a.rect(42, 60, 12, 6, '#fb7185');
      a.rect(32, 34, 8, 8, '#18181b'); a.rect(34, 36, 3, 3, '#ffffff');
      a.rect(56, 34, 8, 8, '#18181b'); a.rect(58, 36, 3, 3, '#ffffff');
      a.rect(30, 30, 12, 4, pal.d);
      a.rect(54, 30, 12, 4, pal.d);
    } else if (entityType === 'CAT') {
      const coatColors = {
        branco:   { b: '#f8fafc', d: '#cbd5e1', l: '#ffffff', ear: '#f9a8d4', eye: '#0284c7', c: '#f43f5e' },
        laranja:  { b: '#ea8c38', d: '#b55b1c', l: '#fbc478', ear: '#fda4af', eye: '#16a34a', c: '#0284c7', stripes: true },
        tricolor: { b: '#f8fafc', d: '#cbd5e1', l: '#ffffff', ear: '#f9a8d4', eye: '#ca8a04', c: '#a855f7', calico: true },
        preto:    { b: '#292524', d: '#141211', l: '#44403c', ear: '#78716c', eye: '#facc15', c: null },
        frajola:  { b: '#262423', d: '#121010', l: '#44403c', ear: '#f9a8d4', eye: '#22c55e', c: null, tuxedo: true }
      };
      const pal = coatColors[data.coat] || coatColors.branco;
      // Shoulders / Chest
      a.bevelRect(28, 66, 40, 30, pal.b, pal.l, pal.d, out);
      if (pal.tuxedo) {
        a.rect(38, 68, 20, 26, '#f8fafc');
      }
      if (pal.c) {
        a.bevelRect(30, 68, 36, 7, pal.c, this.shade(pal.c, 22), this.shade(pal.c, -22), out);
        a.bevelRect(44, 73, 8, 8, '#fde047', '#fef9c3', '#ca8a04', out);
      }
      // Pointed Cat Ears
      a.bevelRect(20, 12, 16, 22, pal.b, pal.l, pal.d, out);
      a.rect(24, 18, 8, 12, pal.ear);
      a.bevelRect(60, 12, 16, 22, pal.b, pal.l, pal.d, out);
      a.rect(64, 18, 8, 12, pal.ear);
      // Cute Round Cat Head
      a.bevelRect(22, 24, 52, 46, pal.b, pal.l, pal.d, out);
      if (pal.stripes) {
        a.rect(42, 26, 4, 10, pal.d);
        a.rect(50, 26, 4, 10, pal.d);
        a.rect(24, 42, 8, 3, pal.d);
        a.rect(64, 42, 8, 3, pal.d);
      }
      if (pal.calico) {
        a.rect(24, 26, 18, 16, '#e07a2c');
        a.rect(54, 26, 18, 14, '#2d2825');
      }
      if (pal.tuxedo) {
        a.rect(34, 48, 28, 20, '#f8fafc');
      }
      // Big Expressive Eyes
      a.bevelRect(30, 38, 12, 12, pal.eye, this.shade(pal.eye, 30), this.shade(pal.eye, -20), out);
      a.rect(34, 40, 4, 8, '#18181b');
      a.rect(32, 40, 3, 3, '#ffffff');
      a.bevelRect(54, 38, 12, 12, pal.eye, this.shade(pal.eye, 30), this.shade(pal.eye, -20), out);
      a.rect(58, 40, 4, 8, '#18181b');
      a.rect(56, 40, 3, 3, '#ffffff');
      // Cute Pink Nose & ":3" Cat Mouth
      a.rect(44, 52, 8, 5, '#fb7185');
      a.rect(46, 57, 4, 3, '#2b1b12');
      a.rect(40, 59, 6, 2, '#2b1b12');
      a.rect(50, 59, 6, 2, '#2b1b12');
      // Whiskers
      a.rect(14, 50, 12, 2, '#64748b');
      a.rect(14, 56, 12, 2, '#64748b');
      a.rect(70, 50, 12, 2, '#64748b');
      a.rect(70, 56, 12, 2, '#64748b');
    } else {
      const app = entityType === 'UBS'
        ? { skin: '#d8a07c', hair: '#3b2416', hairStyle: 'bun', shirt: '#ffffff', trim: '#0284c7', glasses: true, gender: 'f' }
        : data.appearance;

      const skin = app.skin;
      const skinHi = this.shade(skin, 20);
      const skinSh = this.shade(skin, -24);
      const shirt = app.shirt;

      // Shoulders & Layered Clothes
      if (app.labCoat) {
        a.bevelRect(18, 68, 60, 30, '#ffffff', '#ffffff', '#cbd5e1', out);
        a.rect(38, 70, 20, 26, shirt);
        a.rect(40, 70, 16, 4, this.shade(shirt, -18));
        a.bevelRect(24, 78, 10, 6, '#0284c7', '#38bdf8', '#035388', '#035388');
        if (app.stethoscope) {
          a.rect(32, 68, 4, 16, '#334155');
          a.rect(60, 68, 4, 16, '#334155');
          a.rect(34, 82, 28, 4, '#334155');
          a.bevelRect(56, 84, 8, 6, '#94a3b8', '#e2e8f0', '#475569', '#1e293b');
        }
      } else if (app.acsVest) {
        a.bevelRect(18, 68, 60, 30, '#0284c7', '#38bdf8', '#035388', out);
        a.rect(40, 70, 16, 26, '#f8fafc');
        a.rect(24, 78, 10, 6, '#ffffff');
        a.bevelRect(62, 78, 10, 6, '#fde047', '#fef9c3', '#ca8a04', '#78350f');
      } else {
        a.bevelRect(18, 68, 60, 30, shirt, this.shade(shirt, 22), this.shade(shirt, -26), out);
        a.rect(24, 72, 48, 8, this.shade(shirt, 18));
        if (entityType === 'UBS') {
          a.rect(40, 70, 16, 26, '#0284c7');
          a.rect(26, 78, 10, 6, '#0284c7');
        } else if (app.badge) {
          a.bevelRect(60, 78, 10, 6, '#fde047', '#fef9c3', '#ca8a04', '#78350f');
        }
      }

      // Neck with soft chin cast shadow
      a.outlineRect(38, 58, 20, 16, skinSh, out);
      a.rect(40, 62, 16, 10, skin);
      a.rect(40, 59, 16, 4, skinSh);

      if (app.hairStyle === 'long') {
        a.bevelRect(20, 24, 56, 52, app.hair, this.shade(app.hair, 18), this.shade(app.hair, -22), out);
      }

      // Head oval with sunlit forehead & shaded jaw
      a.outlineRect(28, 22, 40, 42, skin, out);
      a.rect(30, 24, 24, 6, skinHi);
      a.rect(30, 56, 36, 6, skinSh);
      a.rect(24, 38, 4, 10, skinSh);
      a.rect(68, 38, 4, 10, skinSh);

      // Expressive Eyes with specular glint
      const moody = entityType === 'FAMILY' && data.archetype === 'TEIMOSO' && data.bond < 50;
      a.rect(34, 38, 7, 8, '#ffffff');
      a.rect(36, 40, 4, 6, '#1e1b18');
      a.rect(36, 40, 2, 2, '#ffffff');
      a.rect(55, 38, 7, 8, '#ffffff');
      a.rect(56, 40, 4, 6, '#1e1b18');
      a.rect(56, 40, 2, 2, '#ffffff');

      // Nose bridge shadow
      a.rect(47, 42, 3, 7, skinSh);

      // Eyebrows
      if (moody) {
        a.rect(32, 34, 10, 4, app.hair);
        a.rect(54, 34, 10, 4, app.hair);
        a.rect(40, 36, 3, 2, app.hair);
        a.rect(53, 36, 3, 2, app.hair);
      } else {
        a.rect(34, 34, 8, 2, app.hair);
        a.rect(54, 34, 8, 2, app.hair);
      }

      // Beveled Glasses
      if (app.glasses) {
        a.outlineRect(30, 36, 14, 12, 'rgba(186,230,253,0.35)', '#334155');
        a.outlineRect(52, 36, 14, 12, 'rgba(186,230,253,0.35)', '#334155');
        a.rect(44, 40, 8, 2, '#334155');
        a.px(32, 38, '#ffffff');
        a.px(54, 38, '#ffffff');
      }

      // Warm Cheeks & Mouth
      a.rect(30, 48, 6, 4, 'rgba(225, 112, 100, 0.45)');
      a.rect(60, 48, 6, 4, 'rgba(225, 112, 100, 0.45)');
      if (app.mustache) {
        a.rect(38, 50, 20, 6, app.hair);
        a.rect(40, 51, 16, 2, this.shade(app.hair, 18));
      } else if (moody) {
        a.rect(40, 54, 16, 4, '#7c3f36');
      } else {
        a.rect(40, 52, 16, 4, '#b85d52');
        a.rect(42, 52, 12, 2, '#ffffff');
      }

      // Hair / Hat with strand highlights
      const hHi = this.shade(app.hair, 24);
      const hSh = this.shade(app.hair, -20);
      if (app.hat) {
        a.bevelRect(20, 12, 56, 16, app.hat, this.shade(app.hat, 22), this.shade(app.hat, -22), out);
        a.bevelRect(14, 24, 68, 6, this.shade(app.hat, -18), app.hat, this.shade(app.hat, -32), out);
      } else if (app.hairStyle === 'bun') {
        a.bevelRect(38, 6, 20, 14, app.hair, hHi, hSh, out);
        a.bevelRect(26, 16, 44, 14, app.hair, hHi, hSh, out);
        a.rect(26, 28, 6, 14, app.hair);
        a.rect(64, 28, 6, 14, app.hair);
      } else if (app.hairStyle === 'bald') {
        a.rect(26, 28, 6, 12, app.hair);
        a.rect(64, 28, 6, 12, app.hair);
        a.rect(38, 25, 16, 4, skinHi);
      } else if (app.hairStyle === 'messy') {
        a.bevelRect(24, 14, 48, 16, app.hair, hHi, hSh, out);
        a.rect(28, 26, 8, 8, app.hair);
        a.rect(46, 26, 10, 6, app.hair);
        a.rect(62, 26, 8, 10, app.hair);
      } else {
        a.bevelRect(26, 16, 44, 14, app.hair, hHi, hSh, out);
        a.rect(26, 26, 6, 10, app.hair);
        a.rect(64, 26, 6, 10, app.hair);
      }
    }

    const tctx = targetCanvas.getContext('2d');
    tctx.imageSmoothingEnabled = false;
    tctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    tctx.drawImage(a.canvas, 0, 0, targetCanvas.width, targetCanvas.height);
  }

  // ==========================================================================
  // 10. HOTBAR & WEATHER PIXEL ICONS (native 32x32)
  // ==========================================================================
  buildIcons() {
    const out = this.OUTLINE;

    // Water Thermos
    const wat = this.createArtCanvas(32, 32);
    wat.bevelRect(10, 4, 12, 6, '#334155', '#64748b', '#1e293b', out);
    wat.bevelRect(8, 10, 16, 20, '#0284c7', '#38bdf8', '#035388', out);
    wat.rect(10, 12, 4, 16, '#7dd3fc');
    wat.rect(16, 16, 6, 8, '#e0f2fe');
    this.icons.water = this.bake(wat.canvas, 1).toDataURL();

    // Sunscreen FPS 50
    const sun = this.createArtCanvas(32, 32);
    sun.bevelRect(12, 2, 8, 6, '#f8fafc', '#ffffff', '#cbd5e1', out);
    sun.bevelRect(8, 8, 16, 22, '#f59e0b', '#fbbf24', '#b45309', out);
    sun.rect(10, 12, 12, 12, '#fef08a');
    sun.rect(14, 14, 4, 8, '#ea580c');
    this.icons.sunscreen = this.bake(sun.canvas, 1).toDataURL();

    // SUS Umbrella
    const umb = this.createArtCanvas(32, 32);
    umb.ellipse(16, 14, 14, 9, out);
    umb.ellipse(16, 13, 12, 7, '#0284c7');
    umb.ellipse(14, 11, 8, 4, '#38bdf8');
    umb.rect(14, 6, 4, 12, '#bae6fd');
    umb.outlineRect(14, 18, 4, 12, '#78350f', out);
    umb.outlineRect(10, 28, 6, 4, '#78350f', out);
    this.icons.umbrella = this.bake(umb.canvas, 1).toDataURL();

    // Dog Biscuit
    const trt = this.createArtCanvas(32, 32);
    trt.ellipse(8, 12, 5, 5, out); trt.ellipse(8, 20, 5, 5, out);
    trt.ellipse(24, 12, 5, 5, out); trt.ellipse(24, 20, 5, 5, out);
    trt.outlineRect(8, 12, 16, 8, '#d99e5b', out);
    trt.ellipse(8, 12, 3, 3, '#f0c284'); trt.ellipse(8, 20, 3, 3, '#d99e5b');
    trt.ellipse(24, 12, 3, 3, '#f0c284'); trt.ellipse(24, 20, 3, 3, '#d99e5b');
    trt.rect(10, 14, 12, 2, '#f0c284');
    this.icons.treats = this.bake(trt.canvas, 1).toDataURL();

    // Tablet e-SUS
    const tab = this.createArtCanvas(32, 32);
    tab.bevelRect(6, 2, 20, 28, '#334155', '#64748b', '#1e293b', out);
    tab.rect(8, 6, 16, 20, '#38bdf8');
    tab.rect(12, 10, 8, 4, '#ffffff');
    tab.rect(14, 8, 4, 8, '#ffffff');
    tab.rect(10, 18, 12, 2, '#e0f2fe');
    tab.rect(10, 22, 8, 2, '#e0f2fe');
    this.icons.tablet = this.bake(tab.canvas, 1).toDataURL();

    // Map Scroll
    const mp = this.createArtCanvas(32, 32);
    mp.bevelRect(4, 6, 24, 20, '#e8d5a7', '#fef3c7', '#c7ab70', out);
    mp.rect(8, 10, 6, 12, '#7d933a');
    mp.rect(14, 8, 4, 16, '#c8a468');
    mp.rect(18, 10, 8, 12, '#7d933a');
    mp.outlineRect(19, 13, 6, 6, '#dc2626', out);
    this.icons.map = this.bake(mp.canvas, 1).toDataURL();

    // Weather Icons
    const wSun = this.createArtCanvas(32, 32);
    wSun.ellipse(16, 16, 9, 9, '#f59e0b');
    wSun.ellipse(16, 16, 7, 7, '#fde047');
    wSun.ellipse(14, 14, 4, 4, '#fef9c3');
    [[15, 2], [15, 27], [2, 15], [27, 15], [6, 6], [24, 6], [6, 24], [24, 24]].forEach(([x, y]) => {
      wSun.rect(x, y, 3, 3, '#facc15');
    });
    this.icons.SUNNY = this.bake(wSun.canvas, 1).toDataURL();

    const wHeat = this.createArtCanvas(32, 32);
    wHeat.ellipse(16, 16, 11, 11, '#dc2626');
    wHeat.ellipse(16, 16, 8, 8, '#f97316');
    wHeat.ellipse(16, 16, 5, 5, '#fef08a');
    [[15, 0], [15, 28], [0, 15], [28, 15], [4, 4], [25, 4], [4, 25], [25, 25]].forEach(([x, y]) => {
      wHeat.rect(x, y, 3, 3, '#ef4444');
    });
    this.icons.HEATWAVE = this.bake(wHeat.canvas, 1).toDataURL();

    const wCloud = this.createArtCanvas(32, 32);
    wCloud.ellipse(12, 18, 8, 7, '#64748b');
    wCloud.ellipse(20, 16, 9, 8, '#94a3b8');
    wCloud.ellipse(18, 18, 10, 6, '#e2e8f0');
    this.icons.CLOUDY = this.bake(wCloud.canvas, 1).toDataURL();

    const wRain = this.createArtCanvas(32, 32);
    wRain.ellipse(12, 12, 8, 6, '#475569');
    wRain.ellipse(20, 12, 9, 7, '#64748b');
    wRain.rect(8, 22, 3, 6, '#38bdf8');
    wRain.rect(16, 24, 3, 6, '#38bdf8');
    wRain.rect(24, 22, 3, 6, '#38bdf8');
    this.icons.RAIN = this.bake(wRain.canvas, 1).toDataURL();
  }

  // ==========================================================================
  // 11. FLOATING PIXEL EMOTICON BUBBLES (native 32x32)
  // ==========================================================================
  buildEmotes() {
    const out = this.OUTLINE;
    const makeBubble = (drawFn) => {
      const a = this.createArtCanvas(32, 32);
      a.outlineRect(4, 2, 24, 22, '#fffbeb', out);
      a.rect(2, 4, 2, 18, out);
      a.rect(28, 4, 2, 18, out);
      a.rect(4, 4, 24, 18, '#fffbeb');
      a.rect(6, 4, 20, 2, '#ffffff');
      a.rect(6, 20, 20, 2, '#f5e1a4');
      // Pointer tail
      a.rect(12, 24, 8, 2, '#fffbeb');
      a.rect(10, 24, 2, 2, out); a.rect(20, 24, 2, 2, out);
      a.rect(14, 26, 4, 2, '#fffbeb');
      a.rect(12, 26, 2, 2, out); a.rect(18, 26, 2, 2, out);
      a.rect(14, 28, 4, 2, out);
      drawFn(a);
      return this.bake(a.canvas, 1);
    };

    this.emotes.heart = makeBubble(a => {
      a.rect(8, 8, 6, 6, '#ef4444'); a.rect(18, 8, 6, 6, '#ef4444');
      a.rect(10, 12, 12, 6, '#ef4444'); a.rect(14, 18, 4, 2, '#ef4444');
      a.rect(10, 10, 2, 2, '#fca5a5');
    });

    this.emotes.chat = makeBubble(a => {
      a.rect(8, 12, 4, 4, '#0284c7');
      a.rect(14, 12, 4, 4, '#0284c7');
      a.rect(20, 12, 4, 4, '#0284c7');
    });

    this.emotes.alert = makeBubble(a => {
      a.rect(14, 6, 4, 10, '#dc2626');
      a.rect(14, 18, 4, 4, '#dc2626');
    });

    this.emotes.anger = makeBubble(a => {
      a.rect(8, 8, 6, 2, '#dc2626'); a.rect(12, 8, 2, 6, '#dc2626');
      a.rect(18, 8, 6, 2, '#dc2626'); a.rect(18, 8, 2, 6, '#dc2626');
      a.rect(8, 18, 6, 2, '#dc2626'); a.rect(12, 14, 2, 6, '#dc2626');
      a.rect(18, 18, 6, 2, '#dc2626'); a.rect(18, 14, 2, 6, '#dc2626');
    });

    this.emotes.water = makeBubble(a => {
      a.rect(14, 6, 4, 4, '#0284c7');
      a.rect(12, 10, 8, 4, '#0284c7');
      a.rect(10, 14, 12, 6, '#0284c7');
      a.rect(12, 14, 2, 3, '#bae6fd');
    });

    this.emotes.check = makeBubble(a => {
      a.rect(8, 14, 4, 4, '#16a34a');
      a.rect(12, 16, 4, 4, '#16a34a');
      a.rect(16, 12, 4, 4, '#16a34a');
      a.rect(20, 8, 4, 4, '#16a34a');
    });

    this.emotes.question = makeBubble(a => {
      a.rect(12, 6, 8, 4, '#d97706');
      a.rect(18, 8, 4, 4, '#d97706');
      a.rect(14, 12, 4, 4, '#d97706');
      a.rect(14, 18, 4, 4, '#d97706');
    });

    this.emotes.bone = makeBubble(a => {
      a.rect(10, 12, 12, 4, '#b57b4a');
      a.rect(8, 10, 4, 8, '#d99e5b');
      a.rect(20, 10, 4, 8, '#d99e5b');
    });

    this.emotes.sweat = makeBubble(a => {
      a.rect(14, 6, 4, 6, '#38bdf8');
      a.rect(12, 12, 8, 6, '#38bdf8');
      a.rect(14, 14, 2, 2, '#ffffff');
    });
  }
}

window.pixelArt = new PixelArtBank();

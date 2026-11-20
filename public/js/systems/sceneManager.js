// ============================================================================
// TERRITÓRIO VIVO — UNIFIED SCENE MANAGER (Phase 1: RPG Architecture)
// ============================================================================
// Registers and orchestrates all playable scenes (OVERWORLD, UBS_INTERIOR,
// ESF_ROOM, PLAYER_HOME, and future Phase 2+ locations) with consistent
// transitions, camera snapping, collisions, interactions, and EventBus hooks.

(function (global) {
  'use strict';

  class SceneManager {
    constructor(game) {
      this.game = game;
      this.scenes = new Map();
      this.transitionAlpha = 0;
    }

    register(sceneId, handler) {
      this.scenes.set(sceneId, handler);
    }

    has(sceneId) {
      return this.scenes.has(sceneId);
    }

    get(sceneId) {
      return this.scenes.get(sceneId || this.game.currentLocation) || null;
    }

    isIndoor(sceneId = null) {
      const id = sceneId || this.game.currentLocation;
      return id !== 'OVERWORLD';
    }

    getBounds(sceneId = null) {
      const id = sceneId || this.game.currentLocation;
      const handler = this.scenes.get(id);
      if (handler && typeof handler.getBounds === 'function') {
        return handler.getBounds(id);
      }
      return {
        width: this.game.worldWidth,
        height: this.game.worldHeight,
        minX: 48,
        maxX: this.game.worldWidth - 48,
        minY: 64,
        maxY: this.game.worldHeight - 48
      };
    }

    snapCamera() {
      const g = this.game;
      const bounds = this.getBounds();
      if (this.isIndoor()) {
        g.camera.x = bounds.width <= g.canvas.width
          ? -(g.canvas.width - bounds.width) / 2
          : global.ACSEngine.clamp(g.player.x - g.canvas.width / 2, 0, bounds.width - g.canvas.width);
        g.camera.y = bounds.height <= g.canvas.height
          ? -(g.canvas.height - bounds.height) / 2
          : global.ACSEngine.clamp(g.player.y - g.canvas.height / 2, 0, bounds.height - g.canvas.height);
      } else {
        g.camera.x = global.ACSEngine.clamp(g.player.x - g.canvas.width / 2, 0, Math.max(0, g.worldWidth - g.canvas.width));
        g.camera.y = global.ACSEngine.clamp(g.player.y - g.canvas.height / 2, 0, Math.max(0, g.worldHeight - g.canvas.height));
      }
    }

    enter(targetSceneId, { x, y, dir, silent = false, skipSave = false, toast = null, toastType = 'info' } = {}) {
      const g = this.game;
      const from = g.currentLocation;
      g.currentLocation = targetSceneId;

      if (this.isIndoor(targetSceneId)) {
        g.player.umbrellaOpen = false;
      }

      if (typeof x === 'number') g.player.x = x;
      if (typeof y === 'number') g.player.y = y;
      if (dir) g.player.dir = dir;

      if (g.navigation) g.navigation.clearWalkTarget();
      this.transitionAlpha = silent ? 0 : 0.8;
      this.snapCamera();

      if (!silent && global.sfx && typeof global.sfx.door === 'function') {
        global.sfx.door();
      }
      if (toast) {
        g.toast(toast, toastType);
      }

      if (g.events) {
        g.events.emit('scene:changed', { from, to: targetSceneId });
      }

      g.renderHotbar();
      g.updateHUD();
      if (g.navigation) {
        g.navigation.resolveObjective();
        g.navigation.updateTrackerUI();
        g.navigation.drawMinimap();
      }
      if (!skipSave) {
        g.saveProgress();
      }
    }

    update(dt) {
      if (this.transitionAlpha > 0) {
        this.transitionAlpha = Math.max(0, this.transitionAlpha - dt * 2.6);
      }
      const handler = this.get();
      if (handler && typeof handler.update === 'function') {
        handler.update(dt, this.game.currentLocation);
      }
    }

    collides(px, py) {
      const handler = this.get();
      if (handler && typeof handler.collides === 'function') {
        return handler.collides(this.game.currentLocation, px, py);
      }
      return false;
    }

    checkNearbyInteractions() {
      const handler = this.get();
      if (handler && typeof handler.checkNearbyInteractions === 'function') {
        handler.checkNearbyInteractions(this.game.currentLocation);
      }
    }

    triggerInteraction() {
      const handler = this.get();
      if (handler && typeof handler.triggerInteraction === 'function') {
        return handler.triggerInteraction(this.game.currentLocation);
      }
      return false;
    }

    draw(ctx) {
      const handler = this.get();
      if (handler && typeof handler.draw === 'function') {
        handler.draw(ctx, this.game.currentLocation);
      }
      if (this.transitionAlpha > 0) {
        ctx.fillStyle = `rgba(20, 15, 10, ${this.transitionAlpha})`;
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
      }
    }

    drawMinimap(ctx, W, H) {
      const handler = this.get();
      if (handler && typeof handler.drawMinimap === 'function') {
        handler.drawMinimap(ctx, W, H, this.game.currentLocation);
        return true;
      }
      return false;
    }

    getMinimapTitle() {
      const handler = this.get();
      if (handler && typeof handler.getMinimapTitle === 'function') {
        return handler.getMinimapTitle(this.game.currentLocation);
      }
      return '🗺️ Microárea 04';
    }

    getFootstepTile() {
      const handler = this.get();
      if (handler && typeof handler.getFootstepTile === 'function') {
        return handler.getFootstepTile(this.game.currentLocation);
      }
      return 'I';
    }
  }

  global.SceneManager = SceneManager;
})(window);

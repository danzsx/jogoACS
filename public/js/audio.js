// ============================================================================
// Web Audio API Sound Effects, Ambient Soundscape & Seamless Music Mixer (M3+)
// ============================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.ambienceGain = null;
    this.musicGain = null;
    this.musicDuckGain = null;

    this.rainSource = null;
    this.rainGain = null;
    this.streamSource = null;
    this.streamGain = null;

    this.enabled = true;
    this.volume = 0.7;         // Master 0..1
    this.musicVolume = 0.55;   // Music bus 0..1
    this.sfxVolume = 0.8;      // SFX bus 0..1
    this.ambienceVolume = 0.6; // Ambience bus 0..1

    this._birdTimer = 1.8;
    this._cricketTimer = 1.0;

    // Music engine state
    this._musicBuffers = new Map();
    this._musicLoading = new Map();
    this._activeMusic = null;       // { id, source, gain, startedAt, offset, loop }
    this._fadingOutMusic = [];      // Array of fading out { source, gain, timer }
    this._activeHtmlAudio = null;   // { id, audio, fadeAlpha, fadeSpeed } for file:// fallback
    this._fadingOutHtmlAudio = [];  // Array of fading out HTMLAudioElement wrappers
    this._trackOffsets = new Map(); // Remember playback position per track for organic resume
    this._currentTrackId = null;
    this._targetTrackId = null;
    this._musicRequestToken = 0;
    this._duckFactor = 1.0;
    this._sfxDuckFactor = 1.0;
    this._sfxDuckTimer = 0;

    this._loadPrefs();
  }

  _getStorage() {
    try {
      if (window.localStorage) return window.localStorage;
    } catch (_) {}
    return null;
  }

  _loadPrefs() {
    const st = this._getStorage();
    if (!st) return;
    try {
      const raw = st.getItem('territorio_vivo_audio_prefs_v1');
      if (!raw) return;
      const prefs = JSON.parse(raw);
      if (typeof prefs.enabled === 'boolean') this.enabled = prefs.enabled;
      if (typeof prefs.volume === 'number' && !Number.isNaN(prefs.volume)) {
        this.volume = Math.max(0, Math.min(1, prefs.volume));
      }
      if (typeof prefs.musicVolume === 'number' && !Number.isNaN(prefs.musicVolume)) {
        this.musicVolume = Math.max(0, Math.min(1, prefs.musicVolume));
      }
      if (typeof prefs.sfxVolume === 'number' && !Number.isNaN(prefs.sfxVolume)) {
        this.sfxVolume = Math.max(0, Math.min(1, prefs.sfxVolume));
      }
      if (typeof prefs.ambienceVolume === 'number' && !Number.isNaN(prefs.ambienceVolume)) {
        this.ambienceVolume = Math.max(0, Math.min(1, prefs.ambienceVolume));
      }
    } catch (_) {}
  }

  _savePrefs() {
    const st = this._getStorage();
    if (!st) return;
    try {
      st.setItem('territorio_vivo_audio_prefs_v1', JSON.stringify({
        enabled: this.enabled,
        volume: this.volume,
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        ambienceVolume: this.ambienceVolume
      }));
    } catch (_) {}
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.gain.setValueAtTime(this.ambienceVolume * 0.65, this.ctx.currentTime);
        this.ambienceGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicDuckGain = this.ctx.createGain();
        this.musicDuckGain.gain.setValueAtTime(this._duckFactor, this.ctx.currentTime);
        this.musicGain.connect(this.musicDuckGain);
        this.musicDuckGain.connect(this.masterGain);

        this._initAmbientLoops();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  _createNoiseBuffer(seconds = 2) {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate || 44100;
    const length = Math.floor(sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      // Soft pink-ish smoothing
      data[i] = (lastOut + 0.08 * white) / 1.08;
      lastOut = data[i];
    }
    return buffer;
  }

  _initAmbientLoops() {
    if (!this.ctx || typeof this.ctx.createBufferSource !== 'function') return;
    const noiseBuffer = this._createNoiseBuffer(2);
    if (!noiseBuffer) return;

    // Continuous Rain Loop (Bandpass filtered noise)
    const rainSrc = this.ctx.createBufferSource();
    rainSrc.buffer = noiseBuffer;
    rainSrc.loop = true;
    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1100;
    rainFilter.Q.value = 0.6;
    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0;
    rainSrc.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.ambienceGain);
    rainSrc.start();
    this.rainSource = rainSrc;

    // Continuous Stream / Córrego Loop (Lowpass gentle water murmur)
    const streamSrc = this.ctx.createBufferSource();
    streamSrc.buffer = noiseBuffer;
    streamSrc.loop = true;
    const streamFilter = this.ctx.createBiquadFilter();
    streamFilter.type = 'lowpass';
    streamFilter.frequency.value = 480;
    this.streamGain = this.ctx.createGain();
    this.streamGain.gain.value = 0;
    streamSrc.connect(streamFilter);
    streamFilter.connect(this.streamGain);
    this.streamGain.connect(this.ambienceGain);
    streamSrc.start();
    this.streamSource = streamSrc;
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime, 0.04);
    }
    this._syncHtmlAudioVolumes();
    this._savePrefs();
  }

  toggleMute() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.volume > 0 && !this.enabled) {
      this.enabled = true;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime, 0.04);
    }
    this._syncHtmlAudioVolumes();
    this._savePrefs();
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
    this._syncHtmlAudioVolumes();
    this._savePrefs();
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.04);
    }
    this._savePrefs();
  }

  setAmbienceVolume(vol) {
    this.ambienceVolume = Math.max(0, Math.min(1, vol));
    if (this.ambienceGain && this.ctx) {
      this.ambienceGain.gain.setTargetAtTime(this.ambienceVolume * 0.65, this.ctx.currentTime, 0.06);
    }
    this._savePrefs();
  }

  setMusicDuck(factor = 1.0, fadeSeconds = 0.45) {
    this._duckFactor = Math.max(0.1, Math.min(1.0, factor));
    this._applyEffectiveDuck(fadeSeconds);
  }

  pulseSfxDuck(factor = 0.65, holdSeconds = 0.4) {
    this._sfxDuckFactor = Math.max(0.2, Math.min(1.0, factor));
    this._sfxDuckTimer = Math.max(this._sfxDuckTimer, holdSeconds);
    this._applyEffectiveDuck(0.08);
  }

  _getEffectiveDuckFactor() {
    const sfxDuck = this._sfxDuckTimer > 0 ? (this._sfxDuckFactor || 0.65) : 1.0;
    return Math.min(this._duckFactor, sfxDuck);
  }

  _applyEffectiveDuck(fadeSeconds = 0.35) {
    if (this.musicDuckGain && this.ctx) {
      const effective = this._getEffectiveDuckFactor();
      const tau = Math.max(0.03, fadeSeconds / 3);
      this.musicDuckGain.gain.setTargetAtTime(effective, this.ctx.currentTime, tau);
    }
    this._syncHtmlAudioVolumes();
  }

  _getMusicBusScalar() {
    if (!this.enabled) return 0;
    return Math.max(0, Math.min(1, this.volume * this.musicVolume * this._getEffectiveDuckFactor()));
  }

  _syncHtmlAudioVolumes() {
    const bus = this._getMusicBusScalar();
    if (this._activeHtmlAudio && this._activeHtmlAudio.audio) {
      this._activeHtmlAudio.audio.volume = Math.max(0, Math.min(1, bus * this._activeHtmlAudio.fadeAlpha));
    }
    for (const item of this._fadingOutHtmlAudio) {
      if (item.audio) {
        item.audio.volume = Math.max(0, Math.min(1, bus * item.fadeAlpha));
      }
    }
  }

  _stopActiveHtmlAudioWithFade(fadeSeconds = 2.0) {
    if (!this._activeHtmlAudio) return;
    const active = this._activeHtmlAudio;
    this._activeHtmlAudio = null;
    const speed = 1 / Math.max(0.1, fadeSeconds);
    this._fadingOutHtmlAudio.push({
      id: active.id,
      audio: active.audio,
      fadeAlpha: active.fadeAlpha,
      fadeSpeed: speed
    });
  }

  _playMusicHtmlAudio(trackId, { fadeSeconds = 2.2, loop = true, resume = true } = {}) {
    if (typeof window === 'undefined' || typeof window.Audio !== 'function') {
      this._currentTrackId = trackId || null;
      return;
    }

    if (!trackId) {
      this._currentTrackId = null;
      this._stopActiveHtmlAudioWithFade(fadeSeconds);
      return;
    }

    if (this._activeHtmlAudio && this._activeHtmlAudio.id === trackId) {
      return;
    }

    if (this._activeHtmlAudio) {
      this._stopActiveHtmlAudioWithFade(fadeSeconds);
    }

    const audio = new window.Audio(`audio/${trackId}.ogg`);
    audio.loop = !!loop;
    audio.volume = 0;

    const savedOffset = resume ? (this._trackOffsets.get(trackId) || 0) : 0;
    if (savedOffset > 0) {
      audio.addEventListener('loadedmetadata', () => {
        try {
          if (audio.duration && Number.isFinite(audio.duration)) {
            audio.currentTime = savedOffset % audio.duration;
          }
        } catch (_) {}
      }, { once: true });
    }

    const entry = {
      id: trackId,
      audio,
      fadeAlpha: 0.001,
      fadeSpeed: 1 / Math.max(0.1, fadeSeconds)
    };
    this._activeHtmlAudio = entry;
    this._currentTrackId = trackId;

    audio.play().catch(() => {
      // Retry on next user gesture if autoplay was blocked
      const unlock = () => {
        if (this._activeHtmlAudio === entry) {
          audio.play().catch(() => {});
        }
      };
      if (typeof document !== 'undefined') {
        document.addEventListener('pointerdown', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });
      }
    });
  }

  // ==========================================================================
  // Seamless Web Audio Music Engine (OGG Buffer Looping & Crossfades)
  // ==========================================================================
  async _loadMusicBuffer(trackId) {
    if (this._musicBuffers.has(trackId)) {
      return this._musicBuffers.get(trackId);
    }
    if (this._musicLoading.has(trackId)) {
      return this._musicLoading.get(trackId);
    }
    if (!this.ctx || typeof fetch !== 'function') return null;

    const promise = (async () => {
      try {
        const res = await fetch(`audio/${trackId}.ogg`);
        if (!res.ok) return null;
        const arrBuf = await res.arrayBuffer();
        if (!this.ctx) return null;
        const decoded = await this.ctx.decodeAudioData(arrBuf);
        this._musicBuffers.set(trackId, decoded);
        return decoded;
      } catch (_) {
        return null;
      } finally {
        this._musicLoading.delete(trackId);
      }
    })();

    this._musicLoading.set(trackId, promise);
    return promise;
  }

  preloadTracks(trackIds = []) {
    if (!this.ctx || typeof fetch !== 'function') return;
    for (const id of trackIds) {
      if (id && !this._musicBuffers.has(id) && !this._musicLoading.has(id)) {
        this._loadMusicBuffer(id);
      }
    }
  }

  _stopActiveTrackWithFade(fadeSeconds = 2.0) {
    if (!this._activeMusic || !this.ctx) {
      this._activeMusic = null;
      return;
    }
    const active = this._activeMusic;
    this._activeMusic = null;

    // Save current offset for organic resume later
    if (active.buffer && active.buffer.duration > 0) {
      const elapsed = Math.max(0, this.ctx.currentTime - active.startedAt);
      const pos = (active.offset + elapsed) % active.buffer.duration;
      this._trackOffsets.set(active.id, pos);
    }

    const now = this.ctx.currentTime;
    const dur = Math.max(0.05, fadeSeconds);
    try {
      active.gain.gain.cancelScheduledValues(now);
      active.gain.gain.setValueAtTime(active.gain.gain.value, now);
      active.gain.gain.linearRampToValueAtTime(0.0001, now + dur);
    } catch (_) {}

    this._fadingOutMusic.push({
      source: active.source,
      gain: active.gain,
      timer: dur + 0.15
    });
  }

  async playMusic(trackId, { fadeSeconds = 2.2, loop = true, resume = true } = {}) {
    this._targetTrackId = trackId || null;
    if (trackId === this._currentTrackId && (this._activeMusic || this._activeHtmlAudio || !trackId)) {
      return;
    }

    const token = ++this._musicRequestToken;

    if (!trackId) {
      this._currentTrackId = null;
      this._stopActiveTrackWithFade(fadeSeconds);
      this._stopActiveHtmlAudioWithFade(fadeSeconds);
      return;
    }

    // file:// protocol cannot use fetch(); use dual-deck HTMLAudioElement seamlessly
    const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
    if (isFileProtocol) {
      this._playMusicHtmlAudio(trackId, { fadeSeconds, loop, resume });
      return;
    }

    // In headless/test environments without AudioContext, still update logical state
    if (!this.ctx || typeof this.ctx.createBufferSource !== 'function') {
      this._currentTrackId = trackId;
      return;
    }

    const buffer = await this._loadMusicBuffer(trackId);
    if (token !== this._musicRequestToken) return; // Superseded by newer request
    if (!buffer || !this.ctx || !this.musicGain) {
      // Fallback to HTMLAudioElement if fetch/decode failed
      this._playMusicHtmlAudio(trackId, { fadeSeconds, loop, resume });
      return;
    }

    // Fade out previous track cleanly (no abrupt cut, no prolonged overlap)
    if (this._activeMusic && this._activeMusic.id !== trackId) {
      this._stopActiveTrackWithFade(fadeSeconds);
    } else if (this._activeMusic && this._activeMusic.id === trackId) {
      return;
    }

    const now = this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = !!loop;

    const trackGain = this.ctx.createGain();
    const fadeDur = Math.max(0.05, fadeSeconds);
    trackGain.gain.setValueAtTime(0.0001, now);
    trackGain.gain.linearRampToValueAtTime(1.0, now + fadeDur);

    source.connect(trackGain);
    trackGain.connect(this.musicGain);

    const savedOffset = resume ? (this._trackOffsets.get(trackId) || 0) : 0;
    const safeOffset = buffer.duration > 0 ? (savedOffset % buffer.duration) : 0;

    source.start(now, safeOffset);
    this._currentTrackId = trackId;
    this._activeMusic = {
      id: trackId,
      source,
      gain: trackGain,
      buffer,
      startedAt: now,
      offset: safeOffset,
      loop: !!loop
    };

    source.onended = () => {
      if (this._activeMusic && this._activeMusic.source === source) {
        this._activeMusic = null;
        this._currentTrackId = null;
      }
      try {
        source.disconnect();
        trackGain.disconnect();
      } catch (_) {}
    };
  }

  getCurrentTrack() {
    return this._currentTrackId;
  }

  getTargetTrack() {
    return this._targetTrackId;
  }

  updateMusicMixer(dt) {
    if (this._sfxDuckTimer > 0) {
      this._sfxDuckTimer = Math.max(0, this._sfxDuckTimer - dt);
      if (this._sfxDuckTimer === 0) {
        this._applyEffectiveDuck(0.45);
      }
    }

    for (let i = this._fadingOutMusic.length - 1; i >= 0; i--) {
      const item = this._fadingOutMusic[i];
      item.timer -= dt;
      if (item.timer <= 0) {
        try {
          item.source.stop();
          item.source.disconnect();
          item.gain.disconnect();
        } catch (_) {}
        this._fadingOutMusic.splice(i, 1);
      }
    }

    // HTMLAudioElement dual-deck crossfade mixer (used on file:// or fetch fallback)
    if (this._activeHtmlAudio) {
      const a = this._activeHtmlAudio;
      if (a.fadeAlpha < 1.0) {
        a.fadeAlpha = Math.min(1.0, a.fadeAlpha + dt * a.fadeSpeed);
      }
    }
    for (let i = this._fadingOutHtmlAudio.length - 1; i >= 0; i--) {
      const item = this._fadingOutHtmlAudio[i];
      item.fadeAlpha = Math.max(0, item.fadeAlpha - dt * item.fadeSpeed);
      if (item.fadeAlpha <= 0.001) {
        try {
          if (item.audio.duration && Number.isFinite(item.audio.duration)) {
            this._trackOffsets.set(item.id, item.audio.currentTime % item.audio.duration);
          }
          item.audio.pause();
          item.audio.src = '';
        } catch (_) {}
        this._fadingOutHtmlAudio.splice(i, 1);
      }
    }
    if (this._activeHtmlAudio || this._fadingOutHtmlAudio.length > 0) {
      this._syncHtmlAudioVolumes();
    }
  }

  tone(freq, type = 'sine', duration = 0.12, vol = 0.12, delay = 0, targetNode = null) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(targetNode || this.sfxGain || this.masterGain || this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Terrain-aware subtle footstep sound
  footstep(tileType = 'G') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    let freq = 115;
    let type = 'triangle';
    let vol = 0.045;
    if (tileType === 'B') {
      freq = 165; // Hollow wooden bridge plank
      vol = 0.065;
    } else if (tileType === 'E' || tileType === 'H') {
      freq = 152; // Cozy wooden floor inside ESF room / Player Home
      type = 'triangle';
      vol = 0.042;
    } else if (tileType === 'I') {
      freq = 195; // Clean ceramic clinic tile inside UBS
      type = 'sine';
      vol = 0.036;
    } else if (tileType === 'S' || tileType === 'W' || tileType === 'P') {
      freq = 145; // Crisp paved sidewalk/patio
      type = 'sine';
      vol = 0.04;
    } else if (tileType === 'D') {
      freq = 95;  // Soft sandy dirt
      vol = 0.05;
    }
    const jitter = (Math.random() - 0.5) * 18;
    this.tone(freq + jitter, type, 0.055, vol, 0);
  }

  door() {
    this.tone(330, 'triangle', 0.07, 0.11, 0);
    this.tone(494, 'sine', 0.12, 0.10, 0.06);
  }

  rest() {
    this.tone(392, 'sine', 0.16, 0.10, 0);
    this.tone(493.88, 'sine', 0.18, 0.10, 0.12);
    this.tone(587.33, 'sine', 0.28, 0.11, 0.24);
  }

  // Gentle descending lullaby chime when lights dim for sleep
  sleepDown() {
    this.tone(392.0, 'sine', 0.24, 0.08, 0);
    this.tone(329.63, 'sine', 0.26, 0.08, 0.16);
    this.tone(293.66, 'sine', 0.30, 0.075, 0.34);
    this.tone(246.94, 'sine', 0.42, 0.07, 0.54);
  }

  // Warm ascending morning chime when lights brighten upon waking
  wakeUp() {
    this.tone(293.66, 'sine', 0.20, 0.075, 0);
    this.tone(369.99, 'triangle', 0.22, 0.075, 0.13);
    this.tone(440.0, 'sine', 0.24, 0.085, 0.26);
    this.tone(587.33, 'sine', 0.36, 0.095, 0.40);
    setTimeout(() => this._playBirdChirp(), 420);
  }

  // Cheerful Brazilian neighborhood bird chirp
  _playBirdChirp() {
    if (!this.enabled || !this.ctx || !this.ambienceGain) return;
    const base = 1750 + Math.random() * 650;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.28, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(base * 0.92, now + 0.13);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ambienceGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Gentle dusk cricket pulse
  _playCricket() {
    if (!this.enabled || !this.ctx || !this.ambienceGain) return;
    for (let i = 0; i < 3; i++) {
      this.tone(3600, 'sine', 0.035, 0.014, i * 0.055, this.ambienceGain);
    }
  }

  // Called every frame from game.update(dt)
  updateAmbience(dt, { weather = 'SUNNY', hourFloat = 8, nearStream = false, umbrellaOpen = false, paused = false, indoor = false } = {}) {
    if (!this.ctx || !this.enabled) {
      if (this.rainGain && this.ctx) this.rainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      if (this.streamGain && this.ctx) this.streamGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      return;
    }

    const now = this.ctx.currentTime;
    const rainTarget = weather === 'RAIN'
      ? (indoor ? 0.035 : (umbrellaOpen ? 0.09 : 0.16))
      : 0;
    if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(rainTarget, now, 0.25);
    }

    const streamTarget = (!indoor && nearStream) ? 0.14 : 0;
    if (this.streamGain) {
      this.streamGain.gain.setTargetAtTime(streamTarget, now, 0.2);
    }

    if (paused || indoor) return;

    // Daytime birds (not during heavy rain)
    if (weather !== 'RAIN' && hourFloat < 17.2) {
      this._birdTimer -= dt;
      if (this._birdTimer <= 0) {
        this._birdTimer = 3.2 + Math.random() * 4.5;
        this._playBirdChirp();
      }
    }

    // Dusk crickets after 16:45
    if (hourFloat >= 16.75 && weather !== 'RAIN') {
      this._cricketTimer -= dt;
      if (this._cricketTimer <= 0) {
        this._cricketTimer = 2.0 + Math.random() * 2.5;
        this._playCricket();
      }
    }
  }

  knock() {
    this.tone(140, 'triangle', 0.07, 0.2, 0);
    this.tone(150, 'triangle', 0.07, 0.22, 0.12);
    this.tone(145, 'triangle', 0.08, 0.25, 0.24);
  }

  success() {
    this.pulseSfxDuck(0.65, 0.45);
    this.tone(523.25, 'sine', 0.12, 0.15, 0);
    this.tone(659.25, 'sine', 0.12, 0.15, 0.1);
    this.tone(783.99, 'sine', 0.22, 0.18, 0.2);
  }

  bondUp() {
    this.pulseSfxDuck(0.65, 0.45);
    this.tone(440, 'triangle', 0.14, 0.15, 0);
    this.tone(554.37, 'triangle', 0.14, 0.15, 0.12);
    this.tone(659.25, 'triangle', 0.24, 0.18, 0.24);
  }

  warn() {
    this.pulseSfxDuck(0.62, 0.45);
    this.tone(240, 'sawtooth', 0.15, 0.12, 0);
    this.tone(190, 'sawtooth', 0.22, 0.12, 0.15);
  }

  bark() {
    this.tone(210, 'sawtooth', 0.09, 0.22, 0);
    this.tone(140, 'square', 0.11, 0.2, 0.05);
    this.tone(220, 'sawtooth', 0.09, 0.22, 0.18);
  }

  meow(scared = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = scared ? 'triangle' : 'sine';
    if (scared) {
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(1020, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.22);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.11);
      osc.frequency.exponentialRampToValueAtTime(490, now + 0.28);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    }
  }

  purr() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const start = now + i * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(92 + (i % 2) * 10, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.095);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.1);
    }
  }

  item() {
    this.tone(600, 'sine', 0.08, 0.12, 0);
    this.tone(880, 'sine', 0.15, 0.14, 0.08);
  }

  notify() {
    this.pulseSfxDuck(0.7, 0.35);
    this.tone(740, 'sine', 0.06, 0.09, 0);
    this.tone(988, 'sine', 0.11, 0.09, 0.06);
  }
}

window.sfx = new SoundFX();

/**
 * Dots & Boxes Pro — Web Audio Synthesizer & Haptics
 * High-performance, latency-free procedural game sounds
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;
  private hapticsEnabled: boolean = true;

  constructor() {
    try {
      if (typeof window !== 'undefined') {
        const savedMuted = localStorage.getItem('dots_sound_muted');
        const savedVol = localStorage.getItem('dots_sound_volume');
        const savedHaptics = localStorage.getItem('dots_haptics_enabled');

        if (savedMuted !== null) this.isMuted = savedMuted === 'true';
        if (savedVol !== null) this.volume = parseFloat(savedVol);
        if (savedHaptics !== null) this.hapticsEnabled = savedHaptics === 'true';
      }
    } catch {
      // Ignore storage errors
    }
  }

  private initCtx(): boolean {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return !!this.ctx;
    } catch {
      return false;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('dots_sound_muted', String(muted));
    } catch {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('dots_sound_volume', String(this.volume));
    } catch {}
  }

  public getVolume(): number {
    return this.volume;
  }

  public setHaptics(enabled: boolean) {
    this.hapticsEnabled = enabled;
    try {
      localStorage.setItem('dots_haptics_enabled', String(enabled));
    } catch {}
  }

  public getHaptics(): boolean {
    return this.hapticsEnabled;
  }

  public triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light') {
    if (!this.hapticsEnabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      if (type === 'light') navigator.vibrate(12);
      else if (type === 'medium') navigator.vibrate(25);
      else if (type === 'heavy') navigator.vibrate(40);
      else if (type === 'success') navigator.vibrate([15, 30, 25]);
      else if (type === 'warning') navigator.vibrate([30, 40, 30]);
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }

  /**
   * Sound: Drawing a line / edge
   */
  public playEdgeDraw() {
    if (this.isMuted) return;
    this.triggerHaptic('light');

    try {
      if (!this.initCtx() || !this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.06);

      const peakVol = Math.max(0.001, 0.2 * this.volume);
      gain.gain.setValueAtTime(peakVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio safety: never throw
    }
  }

  /**
   * Sound: Completing a box
   */
  public playBoxComplete() {
    if (this.isMuted) return;
    this.triggerHaptic('medium');

    try {
      if (!this.initCtx() || !this.ctx) return;

      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const peakVol = Math.max(0.001, 0.18 * this.volume);

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        // Web Audio rule: NEVER set to 0 before exponential ramp!
        gain.gain.setValueAtTime(0.0001, now + idx * 0.03);
        gain.gain.linearRampToValueAtTime(peakVol, now + idx * 0.03 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.36);
      });
    } catch {
      // Audio safety
    }
  }

  /**
   * Sound: Chaining / Combo streak of multiple boxes
   */
  public playCombo(streak: number = 2) {
    if (this.isMuted) return;
    this.triggerHaptic('success');

    try {
      if (!this.initCtx() || !this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreq = Math.min(880, 440 + streak * 80);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

      const peakVol = Math.max(0.001, 0.25 * this.volume);
      gain.gain.setValueAtTime(peakVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio safety
    }
  }

  /**
   * Sound: Victory fanfare
   */
  public playVictory() {
    if (this.isMuted) return;
    this.triggerHaptic('success');

    try {
      if (!this.initCtx() || !this.ctx) return;

      const notes = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.12 }, // G5
        { f: 1046.5, d: 0.4 }, // C6
      ];

      let time = this.ctx.currentTime;
      const peakVol = Math.max(0.001, 0.25 * this.volume);

      notes.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, time);

        gain.gain.setValueAtTime(peakVol, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + n.d);

        time += n.d * 0.8;
      });
    } catch {
      // Audio safety
    }
  }

  /**
   * Sound: Defeat / Game Over
   */
  public playDefeat() {
    if (this.isMuted) return;
    this.triggerHaptic('warning');

    try {
      if (!this.initCtx() || !this.ctx) return;

      const notes = [
        { f: 440, d: 0.2 },
        { f: 415.3, d: 0.2 },
        { f: 392.0, d: 0.35 },
      ];

      let time = this.ctx.currentTime;
      const peakVol = Math.max(0.001, 0.2 * this.volume);

      notes.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, time);

        gain.gain.setValueAtTime(peakVol, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + n.d);

        time += n.d * 0.9;
      });
    } catch {
      // Audio safety
    }
  }

  /**
   * Sound: Collecting Coins & Winning Pots (High chime gold coin harmonics)
   */
  public playCoinCollect() {
    if (this.isMuted) return;
    this.triggerHaptic('success');

    try {
      if (!this.initCtx() || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chimes = [987.77, 1318.51, 1567.98]; // B5, E6, G6

      chimes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        const peak = Math.max(0.001, 0.24 * this.volume);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(peak, now + idx * 0.07 + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.26);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.28);
      });
    } catch {
      // Audio safety
    }
  }

  /**
   * Sound: Spending Coins / Match Entry Fee
   */
  public playCoinSpend() {
    if (this.isMuted) return;
    this.triggerHaptic('light');

    try {
      if (!this.initCtx() || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

      const peak = Math.max(0.001, 0.18 * this.volume);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio safety
    }
  }

  /**
   * Sound: UI Click
   */
  public playButtonClick() {
    if (this.isMuted) return;
    this.triggerHaptic('light');

    try {
      if (!this.initCtx() || !this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

      const peakVol = Math.max(0.001, 0.12 * this.volume);
      gain.gain.setValueAtTime(peakVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // Audio safety
    }
  }

  /**
   * Sound: Invalid move or error
   */
  public playError() {
    if (this.isMuted) return;
    this.triggerHaptic('warning');

    try {
      if (!this.initCtx() || !this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);

      const peakVol = Math.max(0.001, 0.15 * this.volume);
      gain.gain.setValueAtTime(peakVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio safety
    }
  }
}

export const sounds = new SoundEngine();

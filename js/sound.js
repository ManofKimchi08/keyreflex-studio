/**
 * Web Audio API 기반 타건음 및 효과음 합성기
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.profile = 'thock'; // 'thock' (무접점/도각), 'clicky' (청축), 'soft' (소프트)
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playKey(isCorrect = true) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (!isCorrect) {
      // 오타 사운드 (낮고 둔탁한 버저음)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
      return;
    }

    // 정타 타건음
    if (this.profile === 'thock') {
      // 도각거리는 조약돌/무접점 타건음
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const pitchShift = (Math.random() - 0.5) * 25;
      osc.frequency.setValueAtTime(240 + pitchShift, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.055);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (this.profile === 'tactile') {
      // 갈축(Brown) 쫀득한 2단 택타일 타건음
      const pitchShift = (Math.random() - 0.5) * 35;
      const bumpOsc = this.ctx.createOscillator();
      const bumpGain = this.ctx.createGain();
      bumpOsc.type = 'triangle';
      bumpOsc.frequency.setValueAtTime(1750 + pitchShift, now);
      bumpOsc.frequency.exponentialRampToValueAtTime(680, now + 0.013);
      bumpGain.gain.setValueAtTime(0.14, now);
      bumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      bumpOsc.connect(bumpGain);
      bumpGain.connect(this.ctx.destination);
      bumpOsc.start(now);
      bumpOsc.stop(now + 0.016);

      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(220 + pitchShift * 0.4, now + 0.008);
      bodyOsc.frequency.exponentialRampToValueAtTime(78, now + 0.048);
      bodyGain.gain.setValueAtTime(0.001, now);
      bodyGain.gain.setValueAtTime(0.23, now + 0.008);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.052);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(this.ctx.destination);
      bodyOsc.start(now + 0.008);
      bodyOsc.stop(now + 0.055);
    } else if (this.profile === 'linear') {
      // 적축(Red) 정숙하고 부드러운 리니어 타건음
      const pitchShift = (Math.random() - 0.5) * 18;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160 + pitchShift, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.044);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(720, now);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.054);
    } else if (this.profile === 'clicky') {
      // 경쾌한 청축 클릭음
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400 + (Math.random() - 0.5) * 120, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  }

  playSignal() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.07);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playComplete() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    });
  }
}

window.soundEngine = new SoundEngine();

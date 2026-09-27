/**
 * Morse Studio Engine 2.0 - Ultra High-Fidelity Audio Synthesizer,
 * Real-Time Oscilloscope Canvas Visualizer & Optical Torch Controller
 * Muhammad Irsyad Sirojul Khoeir - irsyads.com
 */

(function(window) {
  'use strict';

  // Standard International Morse Code Table
  const MORSE_MAP = {
    'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',
    'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
    'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',
    'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
    'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',
    'Z': '--..',  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
    '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
    ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-',
    '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
  };

  const REVERSE_MAP = {};
  Object.keys(MORSE_MAP).forEach(k => {
    if (k !== ' ') REVERSE_MAP[MORSE_MAP[k]] = k;
  });
  REVERSE_MAP['/'] = ' ';

  class MorseStudioEngine {
    constructor() {
      this.audioCtx = null;
      this.gainNode = null;
      this.oscillator = null;
      this.analyser = null;

      // Audio Parameters
      this.frequency = 700; // Hz
      this.wpm = 18;        // Words Per Minute (Standard Paris)
      this.volume = 0.8;    // 0 to 1
      this.soundEnabled = true;

      // Optical & Flash Parameters
      this.flashScreenEnabled = true;
      this.torchCameraEnabled = false;
      this.torchStream = null;
      this.torchTrack = null;
      this.hasTorchCapability = false;

      // Playback State
      this.isPlaying = false;
      this.isPaused = false;
      this.playbackTimeline = [];
      this.currentIndex = 0;
      this.timerId = null;

      // Oscilloscope Canvas Visualizer
      this.scopeCanvas = null;
      this.scopeCtx = null;
      this.scopeAnimId = null;
      this.isSignalActive = false;
      this.phase = 0;

      // Callbacks
      this.onSignalChange = null;   // (isSignalOn) => {}
      this.onProgress = null;       // (tokenIndex, tokenChar, isSignal) => {}
      this.onComplete = null;       // () => {}
      this.onStatusChange = null;   // (state) => {}

      // Manual Telegraph Key State
      this.keyPressStartTime = 0;
      this.keySilenceTimer = null;
      this.currentSymbolBuffer = '';
      this.onManualDecode = null;
    }

    /* ---------------------------------------------------------
     * Audio Context & Oscillator Engine
     * --------------------------------------------------------- */
    initAudio() {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
          this.analyser = this.audioCtx.createAnalyser();
          this.analyser.fftSize = 256;
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return !!this.audioCtx;
    }

    getUnitTimeMs() {
      // Standard Paris standard: 1200 / WPM ms
      return Math.round(1200 / Math.max(5, Math.min(50, this.wpm)));
    }

    /* Play authentic tactile mechanical relay click on key press */
    playMechanicalClick(isDown) {
      if (!this.soundEnabled || !this.initAudio()) return;
      try {
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = isDown ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(isDown ? 120 : 180, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.015);

        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.025);
      } catch (e) {}
    }

    startTone() {
      if (!this.soundEnabled || !this.initAudio()) return;
      this.stopTone();

      try {
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.frequency, now);

        // Anti-pop smooth attack (5ms)
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume, now + 0.005);

        osc.connect(gain);
        gain.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);

        osc.start(now);
        this.oscillator = osc;
        this.gainNode = gain;
      } catch (e) {
        console.warn('Audio startTone error:', e);
      }
    }

    stopTone() {
      if (this.gainNode && this.audioCtx) {
        try {
          const now = this.audioCtx.currentTime;
          this.gainNode.gain.cancelScheduledValues(now);
          this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
          this.gainNode.gain.linearRampToValueAtTime(0, now + 0.005);

          const osc = this.oscillator;
          setTimeout(() => {
            try { osc && osc.stop(); } catch (e) {}
          }, 10);
        } catch (e) {}
      }
      this.oscillator = null;
      this.gainNode = null;
    }

    emitSignal(state) {
      this.isSignalActive = !!state;

      if (state) {
        this.startTone();
        if (this.flashScreenEnabled && this.onSignalChange) {
          this.onSignalChange(true);
        }
        this.setHardwareTorch(true);
      } else {
        this.stopTone();
        if (this.onSignalChange) {
          this.onSignalChange(false);
        }
        this.setHardwareTorch(false);
      }
    }

    /* ---------------------------------------------------------
     * Camera Torch (Hardware Flashlight) API
     * --------------------------------------------------------- */
    async enableTorch() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera MediaDevices API tidak didukung pada browser ini.');
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }
        });
        const track = stream.getVideoTracks()[0];
        if (!track) throw new Error('Tidak menemukan modul kamera belakang.');

        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if (!capabilities.torch) {
          track.stop();
          throw new Error('Kamera perangkat ini tidak memiliki fitur Torch (Flashlight). Menggunakan kedip layar sebagai alternatif.');
        }

        this.torchStream = stream;
        this.torchTrack = track;
        this.hasTorchCapability = true;
        this.torchCameraEnabled = true;
        return true;
      } catch (err) {
        this.torchCameraEnabled = false;
        this.hasTorchCapability = false;
        throw err;
      }
    }

    async disableTorch() {
      this.torchCameraEnabled = false;
      if (this.torchTrack) {
        try {
          await this.torchTrack.applyConstraints({ advanced: [{ torch: false }] });
        } catch (e) {}
        this.torchTrack.stop();
        this.torchTrack = null;
      }
      if (this.torchStream) {
        this.torchStream.getTracks().forEach(t => t.stop());
        this.torchStream = null;
      }
    }

    async setHardwareTorch(state) {
      if (this.torchCameraEnabled && this.torchTrack) {
        try {
          await this.torchTrack.applyConstraints({
            advanced: [{ torch: !!state }]
          });
        } catch (e) {}
      }
    }

    /* ---------------------------------------------------------
     * Oscilloscope Canvas Visualizer (Dynamic Waveform)
     * --------------------------------------------------------- */
    attachOscilloscope(canvasEl) {
      if (!canvasEl) return;
      this.scopeCanvas = canvasEl;
      this.scopeCtx = canvasEl.getContext('2d');
      this._startScopeLoop();
    }

    _startScopeLoop() {
      if (this.scopeAnimId) cancelAnimationFrame(this.scopeAnimId);

      const render = () => {
        if (this.scopeCanvas && this.scopeCtx) {
          this._drawScopeFrame();
        }
        this.scopeAnimId = requestAnimationFrame(render);
      };
      this.scopeAnimId = requestAnimationFrame(render);
    }

    _drawScopeFrame() {
      const ctx = this.scopeCtx;
      const canvas = this.scopeCanvas;
      const w = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;

      // High-tech dark radar grid background
      ctx.fillStyle = 'rgba(12, 14, 24, 0.35)';
      ctx.fillRect(0, 0, w, h);

      // Subtle CRT grid lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 183, 3, 0.06)';
      ctx.beginPath();
      for (let x = 0; x < w; x += 30) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 20) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Center baseline
      ctx.strokeStyle = 'rgba(255, 183, 3, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(w, centerY);
      ctx.stroke();

      // Draw Waveform
      this.phase += 0.15;
      const isSignal = this.isSignalActive;

      ctx.lineWidth = isSignal ? 3 : 1.5;
      ctx.strokeStyle = isSignal ? '#ffb703' : 'rgba(255, 183, 3, 0.4)';
      ctx.shadowColor = isSignal ? '#ffb703' : 'transparent';
      ctx.shadowBlur = isSignal ? 14 : 0;

      ctx.beginPath();
      const numPoints = 120;
      const step = w / numPoints;

      for (let i = 0; i <= numPoints; i++) {
        const x = i * step;
        let y = centerY;

        if (isSignal) {
          // Dynamic sine audio wave with subtle harmonics
          const amp = (h * 0.34);
          const freqMultiplier = (this.frequency / 350);
          y = centerY + Math.sin(i * 0.35 * freqMultiplier + this.phase) * amp;
          // Add subtle pulse modulation
          y += Math.sin(i * 0.1 - this.phase * 0.5) * (amp * 0.15);
        } else {
          // Idle gentle electronic scanline noise
          y = centerY + Math.sin(i * 0.08 + this.phase * 0.4) * 2;
        }

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    /* ---------------------------------------------------------
     * Translation & Timeline Engine
     * --------------------------------------------------------- */
    encodeText(text) {
      if (!text) return '';
      const clean = text.toUpperCase().trim();
      const tokens = [];
      for (let i = 0; i < clean.length; i++) {
        const ch = clean[i];
        if (ch === ' ' || ch === '\n') {
          tokens.push('/');
        } else if (MORSE_MAP[ch]) {
          tokens.push(MORSE_MAP[ch]);
        }
      }
      return tokens.join(' ');
    }

    decodeMorse(morse) {
      if (!morse) return '';
      const tokens = morse.trim().split(/\s+/);
      return tokens.map(t => {
        if (t === '/') return ' ';
        return REVERSE_MAP[t] || '?';
      }).join('');
    }

    getTelemetryData(text, morse) {
      const cleanMorse = morse || this.encodeText(text);
      const dots = (cleanMorse.match(/\./g) || []).length;
      const dashes = (cleanMorse.match(/-/g) || []).length;
      const words = (cleanMorse.match(/\//g) || []).length + 1;
      const unitMs = this.getUnitTimeMs();
      const totalUnits = (dots * 1) + (dashes * 3) + ((dots + dashes) * 1);
      const estimatedDurationSec = ((totalUnits * unitMs) / 1000).toFixed(1);

      const ditRatio = dashes ? (dots / dashes).toFixed(2) : (dots ? '1.00' : '3.00');

      return {
        wpm: this.wpm,
        freq: this.frequency,
        unitMs: unitMs,
        dots: dots,
        dits: dots,
        dashes: dashes,
        dahs: dashes,
        words: words,
        ditRatio: ditRatio,
        durationSec: estimatedDurationSec,
        estimatedDurationSec: estimatedDurationSec
      };
    }

    buildPlaybackTimeline(morseString) {
      const u = this.getUnitTimeMs();
      const timeline = [];
      const tokens = morseString.trim().split(/\s+/);

      tokens.forEach((token, tokenIdx) => {
        if (token === '/') {
          timeline.push({ type: 'gap', duration: u * 4, tokenIdx, char: ' ' });
          return;
        }

        for (let i = 0; i < token.length; i++) {
          const sym = token[i];
          const isDot = sym === '.';
          const toneDuration = isDot ? u * 1 : u * 3;

          timeline.push({
            type: 'signal',
            duration: toneDuration,
            tokenIdx,
            sym,
            isDot
          });

          // Gap between dots/dashes in same character: 1 unit
          if (i < token.length - 1) {
            timeline.push({ type: 'intra_gap', duration: u * 1, tokenIdx });
          }
        }

        // Gap between letters: 3 units
        if (tokenIdx < tokens.length - 1) {
          timeline.push({ type: 'char_gap', duration: u * 3, tokenIdx });
        }
      });

      return timeline;
    }

    /* ---------------------------------------------------------
     * Playback Controls
     * --------------------------------------------------------- */
    play(morseString) {
      this.initAudio();
      this.stop();

      const clean = morseString ? morseString.trim() : '';
      if (!clean) return;

      this.playbackTimeline = this.buildPlaybackTimeline(clean);
      if (this.playbackTimeline.length === 0) return;

      this.isPlaying = true;
      this.isPaused = false;
      this.currentIndex = 0;
      if (this.onStatusChange) this.onStatusChange('playing');

      this._runNextStep();
    }

    _runNextStep() {
      if (!this.isPlaying || this.isPaused) return;

      if (this.currentIndex >= this.playbackTimeline.length) {
        this.stop();
        if (this.onComplete) this.onComplete();
        return;
      }

      const step = this.playbackTimeline[this.currentIndex];
      const isSignal = step.type === 'signal';

      this.emitSignal(isSignal);

      if (this.onProgress) {
        this.onProgress(step.tokenIdx, step.sym || '', isSignal);
      }

      this.timerId = setTimeout(() => {
        this.currentIndex++;
        this._runNextStep();
      }, step.duration);
    }

    pause() {
      if (!this.isPlaying || this.isPaused) return;
      this.isPaused = true;
      clearTimeout(this.timerId);
      this.emitSignal(false);
      if (this.onStatusChange) this.onStatusChange('paused');
    }

    resume() {
      if (!this.isPlaying || !this.isPaused) return;
      this.isPaused = false;
      if (this.onStatusChange) this.onStatusChange('playing');
      this._runNextStep();
    }

    stop() {
      this.isPlaying = false;
      this.isPaused = false;
      clearTimeout(this.timerId);
      this.timerId = null;
      this.currentIndex = 0;
      this.emitSignal(false);
      if (this.onStatusChange) this.onStatusChange('stopped');
    }

    playSingleChar(char) {
      const code = MORSE_MAP[char.toUpperCase()];
      if (!code) return;
      this.play(code);
    }

    /* ---------------------------------------------------------
     * Tactile Telegraph Key (Tap Mode with Spring Physics)
     * --------------------------------------------------------- */
    manualKeyDown() {
      if (this.keyPressStartTime > 0) return;
      this.initAudio();
      this.playMechanicalClick(true);
      this.keyPressStartTime = Date.now();
      clearTimeout(this.keySilenceTimer);

      this.emitSignal(true);
    }

    manualKeyUp(onCharDecoded) {
      if (this.keyPressStartTime === 0) return;
      this.playMechanicalClick(false);
      const duration = Date.now() - this.keyPressStartTime;
      this.keyPressStartTime = 0;
      this.emitSignal(false);

      const u = this.getUnitTimeMs();
      const symbol = duration < u * 2.2 ? '.' : '-';
      this.currentSymbolBuffer += symbol;

      // Silence timeout to finalize letter (3.5 units)
      this.keySilenceTimer = setTimeout(() => {
        if (this.currentSymbolBuffer) {
          const letter = REVERSE_MAP[this.currentSymbolBuffer] || '?';
          if (onCharDecoded) {
            onCharDecoded(letter, this.currentSymbolBuffer);
          }
          this.currentSymbolBuffer = '';
        }
      }, u * 3.5);
    }
  }

  // Export safely for browser and Node
  const instance = new MorseStudioEngine();
  window.MorseStudio = instance;
  window.MORSE_MAP = MORSE_MAP;
  window.MORSE_REVERSE_MAP = REVERSE_MAP;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = instance;
    module.exports.MorseStudio = instance;
    module.exports.MORSE_MAP = MORSE_MAP;
    module.exports.MORSE_REVERSE_MAP = REVERSE_MAP;
  }

})(typeof window !== 'undefined' ? window : globalThis);

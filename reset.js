/**
 * Re — Premium Monochrome Relaxation Chrome Extension
 * Complete Visual Canvas Engine, Evolving Web Audio API Synthesizer & Session Controller
 */

(function () {
  'use strict';

  /* ==========================================================================
   * 1. BREATHING CYCLE & POSITIVE COMPLETION MESSAGES CONFIGURATION
   * ========================================================================== */

  const SESSION_DURATION_SECONDS = 300; // 5 minutes (300 seconds)

  // 14-second comfortable guided breathing cycle: 4s Inhale, 2s Hold, 6s Exhale, 2s Rest
  const BREATH_PHASES = [
    {
      key: 'inhale',
      duration: 4,
      title: 'Breathe in',
      subtitle: 'Let the air fill your lungs gently'
    },
    {
      key: 'hold',
      duration: 2,
      title: 'Hold',
      subtitle: 'Rest softly in the stillness'
    },
    {
      key: 'exhale',
      duration: 6,
      title: 'Breathe out',
      subtitle: 'Release every trace of tension'
    },
    {
      key: 'rest',
      duration: 2,
      title: 'Rest',
      subtitle: 'Remain calm and effortless'
    }
  ];

  const TOTAL_CYCLE_SECONDS = BREATH_PHASES.reduce((acc, p) => acc + p.duration, 0); // 14s

  const COMPLETION_MESSAGES = [
    'You made space for a pause.',
    'A fresh moment. A fresh start.',
    "You don't have to do everything at once.",
    'One thing at a time is enough.',
    'Stillness is always within reach.',
    'Your mind is clearer when given room to breathe.'
  ];

  /* ==========================================================================
   * 2. EVOLVING GENERATIVE WEB AUDIO API SOUND ENGINE
   * ========================================================================== */

  class ReAmbientSoundEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.reverbNode = null;
      this.dryBus = null;
      this.wetBus = null;

      this.isRunning = false;
      this.isMuted = false;
      this.volume = 0.75; // Moderately loud, comfortable default

      // Continuous background nodes
      this.ambienceSource = null;
      this.ambienceGain = null;
      this.lfoNodes = [];

      // Scheduling timers
      this.schedulerTimer = null;
      this.patternRotationTimer = null;
      this.activeNodes = new Set();

      // 4 Distinct Evolving Musical Patterns (rotates every 28-40 seconds)
      this.patterns = [
        {
          name: 'Atmosphere I \u00B7 Silver Nocturne',
          // D Lydian / Dmaj9 warm voicings
          padChords: [
            [146.83, 220.00, 277.18, 329.63], // D3, A3, C#4, E4
            [196.00, 246.94, 293.66, 369.99], // G3, B3, D4, F#4
            [164.81, 220.00, 277.18, 329.63]  // E3, A3, C#4, E4
          ],
          pianoNotes: [293.66, 329.63, 369.99, 440.00, 493.88, 554.37, 587.33, 659.25],
          bellNotes: [587.33, 739.99, 880.00, 1108.73],
          subRoots: [73.42, 98.00, 82.41],
          sparkleNotes: [1174.66, 1318.51, 1479.98, 1760.00],
          weights: { piano: 0.72, bell: 0.35, pad: 0.85, sub: 0.75, sparkle: 0.35 },
          noteIntervalRange: [2600, 4400]
        },
        {
          name: 'Atmosphere II \u00B7 Floating Glass',
          // A Aeolian / Add9 ethereal chimes & deep resonance
          padChords: [
            [110.00, 164.81, 220.00, 246.94], // A2, E3, A3, B3
            [130.81, 196.00, 246.94, 293.66], // C3, G3, B3, D4
            [146.83, 220.00, 261.63, 329.63]  // D3, A3, C4, E4
          ],
          pianoNotes: [220.00, 246.94, 261.63, 329.63, 392.00, 440.00, 493.88, 523.25],
          bellNotes: [523.25, 659.25, 783.99, 880.00, 987.77, 1046.50],
          subRoots: [55.00, 65.41, 73.42],
          sparkleNotes: [1046.50, 1318.51, 1567.98, 1760.00],
          weights: { piano: 0.42, bell: 0.78, pad: 0.75, sub: 0.85, sparkle: 0.62 },
          noteIntervalRange: [2900, 4800]
        },
        {
          name: 'Atmosphere III \u00B7 Horizon Drift',
          // F Major Pentatonic / Fmaj7#11 warm expansive pads
          padChords: [
            [174.61, 261.63, 329.63, 392.00], // F3, C4, E4, G4
            [130.81, 196.00, 246.94, 329.63], // C3, G3, B3, E4
            [146.83, 220.00, 261.63, 349.23]  // D3, A3, C4, F4
          ],
          pianoNotes: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
          bellNotes: [523.25, 659.25, 783.99, 1046.50],
          subRoots: [87.31, 65.41, 73.42],
          sparkleNotes: [1046.50, 1174.66, 1318.51, 1567.98],
          weights: { piano: 0.58, bell: 0.45, pad: 0.95, sub: 0.90, sparkle: 0.40 },
          noteIntervalRange: [3100, 5100]
        },
        {
          name: 'Atmosphere IV \u00B7 Still Water',
          // C Maj9 meditative equilibrium
          padChords: [
            [130.81, 196.00, 246.94, 293.66], // C3, G3, B3, D4
            [164.81, 246.94, 293.66, 392.00], // E3, B3, D4, G4
            [174.61, 220.00, 261.63, 329.63]  // F3, A3, C4, E4
          ],
          pianoNotes: [261.63, 293.66, 329.63, 392.00, 493.88, 523.25, 587.33, 783.99],
          bellNotes: [587.33, 659.25, 783.99, 987.77],
          subRoots: [65.41, 82.41, 87.31],
          sparkleNotes: [1174.66, 1318.51, 1567.98, 1975.53],
          weights: { piano: 0.68, bell: 0.62, pad: 0.82, sub: 0.80, sparkle: 0.52 },
          noteIntervalRange: [2700, 4500]
        }
      ];

      this.currentPatternIndex = 0;
      this.chordStepIndex = 0;
      this.onPatternChange = null;
    }

    initContext() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain with gentle limiter compressor
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      compressor.knee.setValueAtTime(24, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.05, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.4, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

      // Dry and lush Reverb buses
      this.dryBus = this.ctx.createGain();
      this.dryBus.gain.setValueAtTime(0.55, this.ctx.currentTime);

      this.wetBus = this.ctx.createGain();
      this.wetBus.gain.setValueAtTime(0.68, this.ctx.currentTime);

      this.reverbNode = this.createLushReverbImpulse(3.8, 2.4);

      this.dryBus.connect(compressor);
      this.wetBus.connect(this.reverbNode);
      this.reverbNode.connect(compressor);
      compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    // Procedurally generate a warm stereo convolution reverb impulse
    createLushReverbImpulse(durationSeconds, decayRate) {
      const convolver = this.ctx.createConvolver();
      const sampleRate = this.ctx.sampleRate;
      const length = Math.floor(sampleRate * durationSeconds);
      const impulse = this.ctx.createBuffer(2, length, sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        let prev = 0;
        for (let i = 0; i < length; i++) {
          const progress = i / length;
          const envelope = Math.pow(1 - progress, decayRate) * Math.sin(Math.min(1, i / (sampleRate * 0.04)) * (Math.PI / 2));
          // One-pole lowpass damping on reverb tail for warm, non-harsh acoustics
          const white = Math.random() * 2 - 1;
          prev = prev * 0.72 + white * 0.28;
          channelData[i] = prev * envelope * 0.65;
        }
      }

      convolver.buffer = impulse;
      return convolver;
    }

    start() {
      this.initContext();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (this.isRunning) return;
      this.isRunning = true;

      // Smooth fade-in of master volume
      const targetGain = this.isMuted ? 0.0001 : Math.max(0.0001, this.volume * 0.9);
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 2.5);

      // 1. Start atmospheric pink-noise air / distant rain layer
      this.startAtmosphericAmbience();

      // 2. Trigger initial warm pad chord & deep sub root immediately
      this.currentPatternIndex = 0;
      this.notifyPatternChange();
      this.triggerWarmPadChord();
      this.triggerDeepSubTone();

      // 3. Schedule evolving musical notes
      this.scheduleNextMusicalEvent(900);

      // 4. Schedule musical pattern transitions every 28–40 seconds
      this.scheduleNextPatternTransition();
    }

    stop() {
      this.isRunning = false;

      if (this.schedulerTimer) {
        clearTimeout(this.schedulerTimer);
        this.schedulerTimer = null;
      }
      if (this.patternRotationTimer) {
        clearTimeout(this.patternRotationTimer);
        this.patternRotationTimer = null;
      }

      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      if (this.masterGain) {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setTargetAtTime(0.0001, now, 0.45);
      }

      setTimeout(() => {
        if (this.ambienceSource) {
          try { this.ambienceSource.stop(); } catch (_) {}
          try { this.ambienceSource.disconnect(); } catch (_) {}
          this.ambienceSource = null;
        }
        this.lfoNodes.forEach((node) => {
          try { node.stop(); } catch (_) {}
          try { node.disconnect(); } catch (_) {}
        });
        this.lfoNodes = [];

        this.activeNodes.forEach((node) => {
          try { node.stop(); } catch (_) {}
          try { node.disconnect(); } catch (_) {}
        });
        this.activeNodes.clear();
      }, 1200);
    }

    setVolume(normalizedValue) {
      this.volume = Math.max(0, Math.min(1, normalizedValue));
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const effectiveGain = this.isMuted ? 0.0001 : Math.max(0.0001, this.volume * 0.9);
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(effectiveGain, now, 0.12);
    }

    setMuted(muted) {
      this.isMuted = Boolean(muted);
      this.setVolume(this.volume);
    }

    // Layer 0: Distant Rainfall & Gentle Flowing Air (Filtered Pink/Brown Noise + Dual LFO)
    startAtmosphericAmbience() {
      const bufferDuration = 8;
      const bufferSize = this.ctx.sampleRate * bufferDuration;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

      // Paul Kellet's pink-noise filter approximation for natural organic texture
      for (let ch = 0; ch < 2; ch++) {
        const output = noiseBuffer.getChannelData(ch);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.025;
          b6 = white * 0.115926;
        }
      }

      const source = this.ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      // Warm bandpass + lowpass sculpting to remove any harsh high static
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(360, this.ctx.currentTime);
      bandpass.Q.setValueAtTime(0.7, this.ctx.currentTime);

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(680, this.ctx.currentTime);

      // Slow LFO modulating filter cutoff to mimic gentle breathing breeze / distant rain swell
      const breezeLfo = this.ctx.createOscillator();
      breezeLfo.type = 'sine';
      breezeLfo.frequency.setValueAtTime(0.07, this.ctx.currentTime); // 14-second cycle

      const breezeLfoGain = this.ctx.createGain();
      breezeLfoGain.gain.setValueAtTime(140, this.ctx.currentTime);

      breezeLfo.connect(breezeLfoGain);
      breezeLfoGain.connect(bandpass.frequency);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

      source.connect(bandpass);
      bandpass.connect(lowpass);
      lowpass.connect(this.ambienceGain);
      this.ambienceGain.connect(this.dryBus);
      this.ambienceGain.connect(this.wetBus);

      source.start();
      breezeLfo.start();

      this.ambienceSource = source;
      this.lfoNodes.push(breezeLfo);
    }

    // Layer 1: Soft Felt Piano-Like Tone
    triggerSoftPianoNote(freq) {
      if (!this.isRunning || !this.ctx) return;
      const now = this.ctx.currentTime;
      const duration = 5.2;

      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime((Math.random() - 0.5) * 0.65, now);

      const voiceGain = this.ctx.createGain();
      voiceGain.gain.setValueAtTime(0.0001, now);
      voiceGain.gain.linearRampToValueAtTime(0.14, now + 0.045);
      voiceGain.gain.exponentialRampToValueAtTime(0.045, now + 1.1);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Warm felt hammer filter envelope
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.6, now);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 1.8);

      // Fundamental + soft 2nd & 3rd harmonics
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);
      osc2.detune.setValueAtTime(3.5, now);

      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.16, now);
      osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);

      filter.connect(voiceGain);
      voiceGain.connect(panner);
      panner.connect(this.dryBus);
      panner.connect(this.wetBus);

      this.trackNode(osc1, duration);
      this.trackNode(osc2, duration);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    }

    // Layer 2: Gentle Bell-Like Chime (FM Glassy Harmonic)
    triggerBellChime(freq) {
      if (!this.isRunning || !this.ctx) return;
      const now = this.ctx.currentTime;
      const duration = 6.0;

      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime((Math.random() - 0.5) * 0.8, now);

      const carrier = this.ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, now);

      const modulator = this.ctx.createOscillator();
      modulator.type = 'sine';
      // 2.0 ratio creates a pure, harmonious bell overtone
      modulator.frequency.setValueAtTime(freq * 2.0, now);

      const modGain = this.ctx.createGain();
      modGain.gain.setValueAtTime(freq * 0.45, now);
      modGain.gain.exponentialRampToValueAtTime(0.01, now + 2.2);

      const amp = this.ctx.createGain();
      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.linearRampToValueAtTime(0.075, now + 0.03);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(amp);
      amp.connect(panner);
      panner.connect(this.wetBus);
      panner.connect(this.dryBus);

      this.trackNode(carrier, duration);
      this.trackNode(modulator, duration);

      carrier.start(now);
      modulator.start(now);
      carrier.stop(now + duration);
      modulator.stop(now + duration);
    }

    // Layer 3: Warm Ambient Pad Swell
    triggerWarmPadChord() {
      if (!this.isRunning || !this.ctx) return;
      const pattern = this.patterns[this.currentPatternIndex];
      const chord = pattern.padChords[this.chordStepIndex % pattern.padChords.length];
      this.chordStepIndex++;

      const now = this.ctx.currentTime;
      const attack = 3.6;
      const sustain = 4.2;
      const release = 4.8;
      const totalDuration = attack + sustain + release;

      const padFilter = this.ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(520, now);
      padFilter.frequency.linearRampToValueAtTime(920, now + attack + 1.0);
      padFilter.frequency.linearRampToValueAtTime(480, now + totalDuration);

      const padBus = this.ctx.createGain();
      padBus.gain.setValueAtTime(0.0001, now);
      padBus.gain.linearRampToValueAtTime(0.055, now + attack);
      padBus.gain.setValueAtTime(0.055, now + attack + sustain);
      padBus.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);

      padFilter.connect(padBus);
      padBus.connect(this.wetBus);
      padBus.connect(this.dryBus);

      chord.forEach((noteFreq, idx) => {
        const oscA = this.ctx.createOscillator();
        const oscB = this.ctx.createOscillator();
        oscA.type = 'sine';
        oscB.type = 'triangle';

        oscA.frequency.setValueAtTime(noteFreq, now);
        oscB.frequency.setValueAtTime(noteFreq, now);
        oscA.detune.setValueAtTime(-5 + idx * 2, now);
        oscB.detune.setValueAtTime(5 - idx * 2, now);

        const mixGain = this.ctx.createGain();
        mixGain.gain.setValueAtTime(0.5, now);

        oscA.connect(mixGain);
        oscB.connect(mixGain);
        mixGain.connect(padFilter);

        this.trackNode(oscA, totalDuration);
        this.trackNode(oscB, totalDuration);

        oscA.start(now);
        oscB.start(now);
        oscA.stop(now + totalDuration);
        oscB.stop(now + totalDuration);
      });
    }

    // Layer 4: Deep, Soft Atmospheric Sub-Bass Tone
    triggerDeepSubTone() {
      if (!this.isRunning || !this.ctx) return;
      const pattern = this.patterns[this.currentPatternIndex];
      const rootFreq = pattern.subRoots[Math.floor(Math.random() * pattern.subRoots.length)];

      const now = this.ctx.currentTime;
      const duration = 9.5;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(rootFreq, now);

      const subFilter = this.ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(160, now);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.linearRampToValueAtTime(0.14, now + 2.8);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(this.dryBus);
      subGain.connect(this.wetBus);

      this.trackNode(osc, duration);
      osc.start(now);
      osc.stop(now + duration);
    }

    // Layer 5: Subtle High-Frequency Crystalline Sparkle Note
    triggerHighSparkleNote(freq) {
      if (!this.isRunning || !this.ctx) return;
      const now = this.ctx.currentTime;
      const duration = 4.2;

      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime((Math.random() - 0.5) * 0.9, now);

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.032, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.wetBus);

      this.trackNode(osc, duration);
      osc.start(now);
      osc.stop(now + duration);
    }

    trackNode(oscNode, durationSeconds) {
      this.activeNodes.add(oscNode);
      setTimeout(() => {
        this.activeNodes.delete(oscNode);
      }, (durationSeconds + 0.25) * 1000);
    }

    scheduleNextMusicalEvent(customDelayMs) {
      if (!this.isRunning) return;
      const pattern = this.patterns[this.currentPatternIndex];
      const [minMs, maxMs] = pattern.noteIntervalRange;
      const delay = customDelayMs !== undefined
        ? customDelayMs
        : Math.floor(minMs + Math.random() * (maxMs - minMs));

      this.schedulerTimer = setTimeout(() => {
        if (!this.isRunning) return;
        const currentPattern = this.patterns[this.currentPatternIndex];
        const w = currentPattern.weights;

        // Harmonious probabilistic triggering across the 5 layers
        if (Math.random() < w.piano) {
          const note = currentPattern.pianoNotes[Math.floor(Math.random() * currentPattern.pianoNotes.length)];
          this.triggerSoftPianoNote(note);

          // Occasional gentle fifth/third companion interval
          if (Math.random() < 0.38) {
            const companion = currentPattern.pianoNotes[Math.floor(Math.random() * currentPattern.pianoNotes.length)];
            setTimeout(() => this.triggerSoftPianoNote(companion), 380 + Math.random() * 420);
          }
        }

        if (Math.random() < w.bell) {
          const bellNote = currentPattern.bellNotes[Math.floor(Math.random() * currentPattern.bellNotes.length)];
          setTimeout(() => this.triggerBellChime(bellNote), 180 + Math.random() * 600);
        }

        if (Math.random() < w.sparkle) {
          const sparkle = currentPattern.sparkleNotes[Math.floor(Math.random() * currentPattern.sparkleNotes.length)];
          setTimeout(() => this.triggerHighSparkleNote(sparkle), 450 + Math.random() * 700);
        }

        if (Math.random() < w.pad * 0.45) {
          this.triggerWarmPadChord();
        }

        if (Math.random() < w.sub * 0.42) {
          this.triggerDeepSubTone();
        }

        this.scheduleNextMusicalEvent();
      }, delay);
    }

    // Rotate musical pattern every 28 to 40 seconds
    scheduleNextPatternTransition() {
      if (!this.isRunning) return;
      const nextSwitchMs = Math.floor((28 + Math.random() * 12) * 1000);

      this.patternRotationTimer = setTimeout(() => {
        if (!this.isRunning) return;
        this.currentPatternIndex = (this.currentPatternIndex + 1) % this.patterns.length;
        this.notifyPatternChange();

        // Anchor the new section with a warm pad swell and deep bass root
        this.triggerWarmPadChord();
        this.triggerDeepSubTone();

        this.scheduleNextPatternTransition();
      }, nextSwitchMs);
    }

    notifyPatternChange() {
      if (typeof this.onPatternChange === 'function') {
        this.onPatternChange(this.patterns[this.currentPatternIndex].name);
      }
    }
  }

  /* ==========================================================================
   * 3. PURE MONOCHROME CANVAS VISUAL ENGINE (WAVES, 3D PARTICLES, CENTRAL SPHERE)
   * ========================================================================== */

  class ReVisualEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Normalized breath expansion factor: 0.0 (calm base) -> 1.0 (full inhale)
      this.breathFactor = 0.15;
      this.targetBreathFactor = 0.15;
      this.isSessionActive = false;

      // 6 Multi-Layered Flowing Wave Configurations
      this.waveLayers = [
        {
          yRatio: 0.56,
          amplitude: 34,
          secondaryAmp: 14,
          wavelength: 0.0022,
          speed: 0.42,
          phase: 0.0,
          strokeAlpha: 0.14,
          fillTopAlpha: 0.035,
          lineWidth: 1.2
        },
        {
          yRatio: 0.62,
          amplitude: 42,
          secondaryAmp: 18,
          wavelength: 0.0018,
          speed: -0.31,
          phase: 1.7,
          strokeAlpha: 0.19,
          fillTopAlpha: 0.045,
          lineWidth: 1.4
        },
        {
          yRatio: 0.68,
          amplitude: 29,
          secondaryAmp: 12,
          wavelength: 0.0027,
          speed: 0.54,
          phase: 3.1,
          strokeAlpha: 0.25,
          fillTopAlpha: 0.055,
          lineWidth: 1.5
        },
        {
          yRatio: 0.74,
          amplitude: 38,
          secondaryAmp: 16,
          wavelength: 0.0020,
          speed: 0.37,
          phase: 4.4,
          strokeAlpha: 0.32,
          fillTopAlpha: 0.065,
          lineWidth: 1.6
        },
        {
          yRatio: 0.81,
          amplitude: 26,
          secondaryAmp: 11,
          wavelength: 0.0031,
          speed: -0.48,
          phase: 2.3,
          strokeAlpha: 0.40,
          fillTopAlpha: 0.08,
          lineWidth: 1.8
        },
        {
          yRatio: 0.88,
          amplitude: 22,
          secondaryAmp: 9,
          wavelength: 0.0025,
          speed: 0.62,
          phase: 5.2,
          strokeAlpha: 0.52,
          fillTopAlpha: 0.10,
          lineWidth: 2.0
        }
      ];

      // Floating 3D Spherical Particles
      this.particles = [];
      this.particleCount = 82;

      this.animFrameId = null;
      this.lastTimestamp = performance.now();
      this.elapsedTime = 0;

      this.handleResize = this.resize.bind(this);
      window.addEventListener('resize', this.handleResize);
      this.resize();
      this.initParticles();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    initParticles() {
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push(this.createParticle(true));
      }
      // Depth-sort particles so distant bokeh spheres render behind foreground spheres
      this.particles.sort((a, b) => a.depth - b.depth);
    }

    createParticle(randomInitialY = false) {
      // depth: 0.2 (far background) to 1.0 (foreground)
      const depth = 0.2 + Math.pow(Math.random(), 1.35) * 0.8;
      const baseRadius = 1.6 + depth * 8.5;

      return {
        x: Math.random() * this.width,
        y: randomInitialY
          ? Math.random() * (this.height + 80)
          : this.height + baseRadius * 2 + Math.random() * 60,
        depth,
        radius: baseRadius,
        vy: 12 + depth * 28 + Math.random() * 10, // Upward speed in px/sec
        swayAmp: 12 + depth * 26,
        swayFreq: 0.25 + Math.random() * 0.45,
        swayPhase: Math.random() * Math.PI * 2,
        maxAlpha: 0.12 + depth * 0.52,
        life: randomInitialY ? Math.random() * 0.85 : 0,
        fadeOutPoint: 0.55 + Math.random() * 0.40, // Some particles fade away mid-screen
        lifeSpeed: 0.032 + Math.random() * 0.045
      };
    }

    setBreathProgress(factor, isSessionActive) {
      this.targetBreathFactor = Math.max(0, Math.min(1, factor));
      this.isSessionActive = Boolean(isSessionActive);
    }

    start() {
      if (this.animFrameId) return;
      this.lastTimestamp = performance.now();
      const loop = (now) => {
        const dt = Math.min(0.05, (now - this.lastTimestamp) / 1000);
        this.lastTimestamp = now;
        this.elapsedTime += dt;
        this.render(dt);
        this.animFrameId = requestAnimationFrame(loop);
      };
      this.animFrameId = requestAnimationFrame(loop);
    }

    stop() {
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    }

    render(dt) {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // 1. Pure #000000 black background clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Smooth interpolation of breath factor
      if (!this.isSessionActive) {
        // Gentle idle breathing motion on start/completion screens
        this.targetBreathFactor = 0.25 + 0.18 * Math.sin(this.elapsedTime * 0.85);
      }
      this.breathFactor += (this.targetBreathFactor - this.breathFactor) * Math.min(1, dt * 8);

      // 2. Render background particles (depth <= 0.55)
      this.updateAndDrawParticles(ctx, dt, 0, 0.55);

      // 3. Render multi-layered flowing monochrome waves
      this.drawFlowingWaves(ctx, w, h);

      // 4. Render foreground 3D floating spherical particles (depth > 0.55)
      this.updateAndDrawParticles(ctx, dt, 0.55, 1.01);

      // 5. Render central 3D breathing sphere
      this.drawCentralBreathingSphere(ctx, w, h);
    }

    drawFlowingWaves(ctx, w, h) {
      const t = this.elapsedTime;
      const breathBoost = 1 + this.breathFactor * 0.14;
      const stepX = Math.max(8, Math.floor(w / 140));

      for (let i = 0; i < this.waveLayers.length; i++) {
        const layer = this.waveLayers[i];
        const baseY = h * layer.yRatio;
        const amp1 = layer.amplitude * breathBoost;
        const amp2 = layer.secondaryAmp * breathBoost;

        ctx.beginPath();

        for (let x = 0; x <= w + stepX; x += stepX) {
          // Compound sine harmonics for organic, non-mechanical wave undulation
          const angle1 = x * layer.wavelength + t * layer.speed + layer.phase;
          const angle2 = x * (layer.wavelength * 1.65) - t * (layer.speed * 0.62) + layer.phase * 1.3;
          const angle3 = x * (layer.wavelength * 0.48) + t * (layer.speed * 0.28);

          const y =
            baseY +
            Math.sin(angle1) * amp1 +
            Math.cos(angle2) * amp2 +
            Math.sin(angle3) * (amp2 * 0.45);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Complete fill path down to bottom of screen
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const fillGrad = ctx.createLinearGradient(0, baseY - amp1, 0, h);
        fillGrad.addColorStop(0, `rgba(255, 255, 255, ${layer.fillTopAlpha})`);
        fillGrad.addColorStop(0.55, `rgba(180, 180, 180, ${layer.fillTopAlpha * 0.35})`);
        fillGrad.addColorStop(1, 'rgba(0, 0, 0, 0.92)');
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // Re-trace crest line for luminous silver wave ridge
        ctx.beginPath();
        for (let x = 0; x <= w + stepX; x += stepX) {
          const angle1 = x * layer.wavelength + t * layer.speed + layer.phase;
          const angle2 = x * (layer.wavelength * 1.65) - t * (layer.speed * 0.62) + layer.phase * 1.3;
          const angle3 = x * (layer.wavelength * 0.48) + t * (layer.speed * 0.28);

          const y =
            baseY +
            Math.sin(angle1) * amp1 +
            Math.cos(angle2) * amp2 +
            Math.sin(angle3) * (amp2 * 0.45);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${layer.strokeAlpha})`;
        ctx.lineWidth = layer.lineWidth;
        ctx.stroke();
      }
    }

    updateAndDrawParticles(ctx, dt, minDepth, maxDepth) {
      const t = this.elapsedTime;

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        if (p.depth <= minDepth || p.depth > maxDepth) continue;

        // Advance vertical rise and natural horizontal drift
        p.y -= p.vy * dt;
        p.life += p.lifeSpeed * dt;

        const currentX =
          p.x +
          Math.sin(t * p.swayFreq + p.swayPhase) * p.swayAmp +
          Math.cos(t * (p.swayFreq * 0.53) + p.swayPhase) * (p.swayAmp * 0.35);

        // Smooth fade-in at bottom and fade-out as particle reaches its lifespan or top
        let alphaFactor = 1;
        if (p.life < 0.18) {
          alphaFactor = p.life / 0.18;
        } else if (p.life > p.fadeOutPoint) {
          alphaFactor = Math.max(0, 1 - (p.life - p.fadeOutPoint) / 0.32);
        }

        const screenHeightRatio = p.y / this.height;
        if (screenHeightRatio < 0.12) {
          alphaFactor *= Math.max(0, screenHeightRatio / 0.12);
        }

        const alpha = p.maxAlpha * alphaFactor;

        if (p.y < -30 || alpha <= 0.005 || p.life >= p.fadeOutPoint + 0.32) {
          this.particles[i] = this.createParticle(false);
          continue;
        }

        // Draw 3D spherical bubble particle with off-center highlight & soft glowing edge
        const glowRadius = p.radius * 2.25;
        const grad = ctx.createRadialGradient(
          currentX - p.radius * 0.28,
          p.y - p.radius * 0.28,
          p.radius * 0.08,
          currentX,
          p.y,
          glowRadius
        );

        grad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, alpha * 1.35)})`);
        grad.addColorStop(0.32, `rgba(225, 225, 225, ${alpha * 0.85})`);
        grad.addColorStop(0.62, `rgba(165, 165, 165, ${alpha * 0.28})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(currentX, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawCentralBreathingSphere(ctx, w, h) {
      const centerX = w * 0.5;
      const centerY = h * 0.46;

      const minDim = Math.min(w, h);
      const baseRadius = Math.max(76, minDim * 0.125);
      const maxExpandRadius = Math.max(134, minDim * 0.225);

      // Subtle living micro-shimmer during Hold/Rest
      const shimmer = Math.sin(this.elapsedTime * 2.1) * 1.4;
      const radius = baseRadius + (maxExpandRadius - baseRadius) * this.breathFactor + shimmer;

      // 1. Outer Atmospheric Halo Glow
      const outerHaloRadius = radius * (1.85 + this.breathFactor * 0.35);
      const haloGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.65,
        centerX,
        centerY,
        outerHaloRadius
      );
      const haloIntensity = 0.16 + this.breathFactor * 0.18;
      haloGrad.addColorStop(0, `rgba(255, 255, 255, ${haloIntensity})`);
      haloGrad.addColorStop(0.45, `rgba(210, 210, 210, ${haloIntensity * 0.42})`);
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerHaloRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric Harmonic Resonance Rings
      for (let r = 1; r <= 2; r++) {
        const ringRadius = radius * (1.12 + r * 0.14 + this.breathFactor * 0.08);
        const ringAlpha = (0.18 - r * 0.06) * (0.5 + this.breathFactor * 0.5);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Main 3D Lit Silver/White Sphere Body
      const lightOffsetX = centerX - radius * 0.32;
      const lightOffsetY = centerY - radius * 0.34;

      const sphereGrad = ctx.createRadialGradient(
        lightOffsetX,
        lightOffsetY,
        radius * 0.06,
        centerX,
        centerY,
        radius
      );

      sphereGrad.addColorStop(0, '#ffffff');
      sphereGrad.addColorStop(0.26, '#f2f2f2');
      sphereGrad.addColorStop(0.58, '#b8b8b8');
      sphereGrad.addColorStop(0.84, '#525252');
      sphereGrad.addColorStop(1, '#1c1c1c');

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // 4. Rim Light (Fresnel Backlight Effect on Bottom-Right Edge)
      const rimGrad = ctx.createRadialGradient(
        centerX - radius * 0.08,
        centerY - radius * 0.08,
        radius * 0.72,
        centerX,
        centerY,
        radius
      );
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      rimGrad.addColorStop(0.82, 'rgba(255, 255, 255, 0.06)');
      rimGrad.addColorStop(1, `rgba(255, 255, 255, ${0.42 + this.breathFactor * 0.25})`);

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // 5. Soft Specular Highlight
      const specX = centerX - radius * 0.30;
      const specY = centerY - radius * 0.32;
      const specRadius = radius * 0.42;
      const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specRadius);
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(specX, specY, specRadius, 0, Math.PI * 2);
      ctx.fill();

      // 6. Subtle Center Contrast Scrim During Active Session for Crisp Text Legibility
      if (this.isSessionActive) {
        const textScrim = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          radius * 0.78
        );
        textScrim.addColorStop(0, 'rgba(0, 0, 0, 0.38)');
        textScrim.addColorStop(0.7, 'rgba(0, 0, 0, 0.16)');
        textScrim.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = textScrim;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.78, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /* ==========================================================================
   * 4. APPLICATION & SYNCHRONIZED BREATHING SESSION CONTROLLER
   * ========================================================================== */

  class ReSessionController {
    constructor() {
      // Screens
      this.startScreen = document.getElementById('startScreen');
      this.sessionScreen = document.getElementById('sessionScreen');
      this.completionScreen = document.getElementById('completionScreen');

      // Start Screen Controls
      this.startSoundToggleBtn = document.getElementById('startSoundToggleBtn');
      this.startSoundIconOn = document.getElementById('startSoundIconOn');
      this.startSoundIconOff = document.getElementById('startSoundIconOff');
      this.startSoundStatusText = document.getElementById('startSoundStatusText');
      this.startVolumeSlider = document.getElementById('startVolumeSlider');
      this.startVolumeLabel = document.getElementById('startVolumeLabel');
      this.startRelaxingBtn = document.getElementById('startRelaxingBtn');

      // Active Session Controls & Readouts
      this.sessionCountdownEl = document.getElementById('sessionCountdown');
      this.sessionProgressBar = document.getElementById('sessionProgressBar');
      this.soundscapePatternLabel = document.getElementById('soundscapePatternLabel');
      this.phaseInstructionEl = document.getElementById('phaseInstruction');
      this.phaseSupportTextEl = document.getElementById('phaseSupportText');
      this.phaseCountdownEl = document.getElementById('phaseCountdown');
      this.phasePills = Array.from(document.querySelectorAll('.phase-step-pill'));

      this.hudSoundToggleBtn = document.getElementById('hudSoundToggleBtn');
      this.hudSoundIconOn = document.getElementById('hudSoundIconOn');
      this.hudSoundIconOff = document.getElementById('hudSoundIconOff');
      this.hudVolumeSlider = document.getElementById('hudVolumeSlider');
      this.fullscreenBtn = document.getElementById('fullscreenBtn');
      this.fullscreenIconEnter = document.getElementById('fullscreenIconEnter');
      this.fullscreenIconExit = document.getElementById('fullscreenIconExit');
      this.exitSessionBtn = document.getElementById('exitSessionBtn');

      // Completion Screen Controls
      this.completionStatusBadge = document.getElementById('completionStatusBadge');
      this.completionTitle = document.getElementById('completionTitle');
      this.completionSubtext = document.getElementById('completionSubtext');
      this.restartSessionBtn = document.getElementById('restartSessionBtn');
      this.closeTabBtn = document.getElementById('closeTabBtn');

      // Engines
      const canvas = document.getElementById('reCanvas');
      this.visualEngine = new ReVisualEngine(canvas);
      this.soundEngine = new ReAmbientSoundEngine();

      this.soundEngine.onPatternChange = (patternName) => {
        if (this.soundscapePatternLabel) {
          this.soundscapePatternLabel.style.opacity = '0';
          setTimeout(() => {
            this.soundscapePatternLabel.textContent = patternName;
            this.soundscapePatternLabel.style.opacity = '1';
          }, 320);
        }
      };

      // Session Timing State
      this.isSessionRunning = false;
      this.sessionStartTimestamp = 0;
      this.sessionLoopId = null;
      this.lastRenderedPhaseKey = null;

      this.bindEvents();
      this.visualEngine.start();
    }

    bindEvents() {
      // Start Screen Sound Toggle & Volume
      this.startSoundToggleBtn.addEventListener('click', () => {
        this.toggleMuteState();
      });

      this.startVolumeSlider.addEventListener('input', (e) => {
        this.updateVolumeState(Number(e.target.value));
      });

      // Start Session Button
      this.startRelaxingBtn.addEventListener('click', () => {
        this.startSession();
      });

      // HUD Sound Toggle & Volume
      this.hudSoundToggleBtn.addEventListener('click', () => {
        this.toggleMuteState();
      });

      this.hudVolumeSlider.addEventListener('input', (e) => {
        this.updateVolumeState(Number(e.target.value));
      });

      // Fullscreen Toggle
      this.fullscreenBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });

      document.addEventListener('fullscreenchange', () => {
        const isFs = Boolean(document.fullscreenElement);
        this.fullscreenIconEnter.classList.toggle('hidden', isFs);
        this.fullscreenIconExit.classList.toggle('hidden', !isFs);
      });

      // Gentle Exit Button
      this.exitSessionBtn.addEventListener('click', () => {
        this.completeSession(false);
      });

      // Completion Screen Buttons
      this.restartSessionBtn.addEventListener('click', () => {
        this.startSession();
      });

      this.closeTabBtn.addEventListener('click', () => {
        this.cleanupAll();
        if (window.chrome && chrome.tabs && chrome.tabs.getCurrent) {
          chrome.tabs.getCurrent((tab) => {
            if (tab && tab.id) {
              chrome.tabs.remove(tab.id);
            } else {
              window.close();
            }
          });
        } else {
          window.close();
        }
      });

      // Keyboard Shortcuts (M = Mute, F = Fullscreen)
      window.addEventListener('keydown', (e) => {
        if (!this.isSessionRunning) return;
        if (e.key === 'm' || e.key === 'M') {
          this.toggleMuteState();
        } else if (e.key === 'f' || e.key === 'F') {
          this.toggleFullscreen();
        }
      });

      // Clean up resources on tab unload
      window.addEventListener('beforeunload', () => {
        this.cleanupAll();
      });
    }

    toggleMuteState() {
      const nextMuted = !this.soundEngine.isMuted;
      this.soundEngine.setMuted(nextMuted);

      // Update both Start and HUD sound buttons
      this.startSoundToggleBtn.setAttribute('aria-pressed', String(!nextMuted));
      this.startSoundIconOn.classList.toggle('hidden', nextMuted);
      this.startSoundIconOff.classList.toggle('hidden', !nextMuted);
      this.startSoundStatusText.textContent = nextMuted ? 'Ambient Sound: Off' : 'Ambient Sound: On';

      this.hudSoundIconOn.classList.toggle('hidden', nextMuted);
      this.hudSoundIconOff.classList.toggle('hidden', !nextMuted);
    }

    updateVolumeState(percentValue) {
      const clamped = Math.max(0, Math.min(100, percentValue));
      this.startVolumeSlider.value = String(clamped);
      this.hudVolumeSlider.value = String(clamped);
      this.startVolumeLabel.textContent = `${clamped}%`;

      if (clamped === 0 && !this.soundEngine.isMuted) {
        this.toggleMuteState();
      } else if (clamped > 0 && this.soundEngine.isMuted) {
        this.toggleMuteState();
      }

      this.soundEngine.setVolume(clamped / 100);
    }

    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }

    showScreen(targetScreen) {
      [this.startScreen, this.sessionScreen, this.completionScreen].forEach((sc) => {
        sc.classList.toggle('active', sc === targetScreen);
      });
    }

    startSession() {
      if (this.sessionLoopId) {
        cancelAnimationFrame(this.sessionLoopId);
        this.sessionLoopId = null;
      }

      this.isSessionRunning = true;
      this.lastRenderedPhaseKey = null;
      this.sessionStartTimestamp = performance.now();

      this.showScreen(this.sessionScreen);
      this.soundEngine.start();

      const updateTick = (now) => {
        if (!this.isSessionRunning) return;

        const elapsedSeconds = (now - this.sessionStartTimestamp) / 1000;
        const remainingSeconds = Math.max(0, SESSION_DURATION_SECONDS - elapsedSeconds);

        // 1. Update 5-Minute Countdown Timer & Progress Bar
        this.updateTimerDisplay(remainingSeconds, elapsedSeconds);

        // 2. Synchronize Guided Breathing Phase & Central Sphere Expansion
        this.updateBreathingCycle(elapsedSeconds);

        if (remainingSeconds <= 0) {
          this.completeSession(true);
          return;
        }

        this.sessionLoopId = requestAnimationFrame(updateTick);
      };

      this.sessionLoopId = requestAnimationFrame(updateTick);
    }

    updateTimerDisplay(remainingSeconds, elapsedSeconds) {
      const totalCeil = Math.ceil(remainingSeconds);
      const mins = Math.floor(totalCeil / 60);
      const secs = totalCeil % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      if (this.sessionCountdownEl.textContent !== formatted) {
        this.sessionCountdownEl.textContent = formatted;
      }

      const progressPct = Math.min(100, (elapsedSeconds / SESSION_DURATION_SECONDS) * 100);
      this.sessionProgressBar.style.width = `${progressPct.toFixed(2)}%`;
    }

    // Smooth cosine ease-in-out helper for organic breathing sphere expansion/contraction
    easeInOutSine(t) {
      return -(Math.cos(Math.PI * Math.max(0, Math.min(1, t))) - 1) / 2;
    }

    updateBreathingCycle(elapsedSeconds) {
      const cyclePos = elapsedSeconds % TOTAL_CYCLE_SECONDS; // 0 to 14s

      let accumulated = 0;
      let activePhase = BREATH_PHASES[0];
      let phaseElapsed = 0;

      for (let i = 0; i < BREATH_PHASES.length; i++) {
        const phase = BREATH_PHASES[i];
        if (cyclePos < accumulated + phase.duration) {
          activePhase = phase;
          phaseElapsed = cyclePos - accumulated;
          break;
        }
        accumulated += phase.duration;
      }

      const phaseProgress = Math.max(0, Math.min(1, phaseElapsed / activePhase.duration));
      const phaseRemainingSeconds = Math.max(1, Math.ceil(activePhase.duration - phaseElapsed));

      // Compute exact sphere expansion factor synchronized with phase
      let sphereExpansion = 0;
      if (activePhase.key === 'inhale') {
        // 4s smooth expansion from 0.0 -> 1.0
        sphereExpansion = this.easeInOutSine(phaseProgress);
      } else if (activePhase.key === 'hold') {
        // 2s stillness at full expansion
        sphereExpansion = 1.0;
      } else if (activePhase.key === 'exhale') {
        // 6s smooth contraction from 1.0 -> 0.0
        sphereExpansion = 1.0 - this.easeInOutSine(phaseProgress);
      } else {
        // 2s calm rest at base scale
        sphereExpansion = 0.0;
      }

      this.visualEngine.setBreathProgress(sphereExpansion, true);

      // Update phase countdown pill
      const countdownText = `${phaseRemainingSeconds}s`;
      if (this.phaseCountdownEl.textContent !== countdownText) {
        this.phaseCountdownEl.textContent = countdownText;
      }

      // Update instruction text and phase step pills only when phase transitions
      if (this.lastRenderedPhaseKey !== activePhase.key) {
        this.lastRenderedPhaseKey = activePhase.key;
        this.phaseInstructionEl.textContent = activePhase.title;
        this.phaseSupportTextEl.textContent = activePhase.subtitle;

        this.phasePills.forEach((pill) => {
          pill.classList.toggle('active', pill.dataset.phase === activePhase.key);
        });
      }
    }

    completeSession(finishedFullDuration) {
      this.isSessionRunning = false;
      if (this.sessionLoopId) {
        cancelAnimationFrame(this.sessionLoopId);
        this.sessionLoopId = null;
      }

      this.visualEngine.setBreathProgress(0.2, false);
      this.soundEngine.stop();

      // Select a random positive completion quote
      const randomMessage =
        COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
      this.completionTitle.textContent = `\u201C${randomMessage}\u201D`;

      if (finishedFullDuration) {
        this.completionStatusBadge.textContent = '5-Minute Session Complete';
        this.completionSubtext.textContent =
          'Carry this calm rhythm with you as you return to your day.';
      } else {
        // Gentle, guilt-free message when exiting early
        this.completionStatusBadge.textContent = 'Moment Paused';
        this.completionSubtext.textContent =
          'Even a brief pause makes a difference. Return whenever you need space.';
      }

      this.showScreen(this.completionScreen);
    }

    cleanupAll() {
      this.isSessionRunning = false;
      if (this.sessionLoopId) {
        cancelAnimationFrame(this.sessionLoopId);
        this.sessionLoopId = null;
      }
      this.soundEngine.stop();
      this.visualEngine.stop();
    }
  }

  // Boot the Re Experience once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ReSessionController());
  } else {
    new ReSessionController();
  }
})();
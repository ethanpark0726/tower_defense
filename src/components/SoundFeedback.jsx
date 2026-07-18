import { useEffect } from 'react';
import { useGameStore } from '../gameStore';

let audioContext = null;
let musicEngine = null;
const MUSIC_MASTER_VOLUME = 0.52;

const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  return audioContext;
};

const playTone = (context, frequency, duration, volume, delay = 0, type = 'sine') => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startAt = context.currentTime + delay;
  const endAt = startAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.02);
};

const scheduleMusicTone = (
  context,
  output,
  frequency,
  startAt,
  duration,
  volume,
  type = 'sine'
) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const endAt = startAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
  oscillator.connect(gain);
  gain.connect(output);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.03);
};

const createMusicEngine = (context) => {
  const masterGain = context.createGain();
  masterGain.gain.setValueAtTime(0.0001, context.currentTime);
  masterGain.connect(context.destination);

  const melody = [523.25, 659.25, 783.99, 659.25, 698.46, 783.99, 880, 783.99];
  const bass = [130.81, 146.83, 174.61, 196];
  const sparkle = [1046.5, 1174.66, 1318.51, 1567.98];
  let timer = null;
  let active = false;
  let nextBeatAt = 0;
  let step = 0;
  let wave = 0;
  let waveActive = false;

  const getTempo = () => (waveActive ? 132 : 108);
  const getThemeLift = () => [1, 9 / 8, 5 / 4][Math.max(0, wave - 1) % 3];

  const scheduleBeat = (beatAt) => {
    const beatDuration = 60 / getTempo();
    const themeLift = getThemeLift();
    const melodyNote = melody[step % melody.length] * themeLift;
    const bassNote = bass[Math.floor(step / 2) % bass.length];

    if (step % 2 === 0) {
      scheduleMusicTone(context, masterGain, melodyNote, beatAt, beatDuration * 0.52, 0.034, 'triangle');
    }

    if (step % 4 === 0) {
      scheduleMusicTone(context, masterGain, bassNote, beatAt, beatDuration * 1.55, 0.022, 'sine');
      scheduleMusicTone(context, masterGain, bassNote * 2, beatAt + beatDuration * 0.04, beatDuration * 1.1, 0.012, 'triangle');
    }

    if (waveActive || step % 4 === 2) {
      const sparkleNote = sparkle[step % sparkle.length] * themeLift;
      scheduleMusicTone(context, masterGain, sparkleNote, beatAt + beatDuration * 0.5, beatDuration * 0.16, 0.016, 'sine');
    }

    step += 1;
  };

  const tick = () => {
    if (!active) return;
    const beatDuration = 60 / getTempo();
    const scheduleAhead = context.currentTime + 0.45;

    while (nextBeatAt < scheduleAhead) {
      scheduleBeat(nextBeatAt);
      nextBeatAt += beatDuration;
    }
  };

  const startTimer = () => {
    if (timer) return;
    timer = window.setInterval(tick, 90);
  };

  return {
    start: (options) => {
      wave = options.wave;
      waveActive = options.waveActive;
      active = true;
      nextBeatAt = Math.max(nextBeatAt, context.currentTime + 0.05);
      masterGain.gain.cancelScheduledValues(context.currentTime);
      masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), context.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(MUSIC_MASTER_VOLUME, context.currentTime + 0.45);
      startTimer();
      tick();
    },
    update: (options) => {
      wave = options.wave;
      waveActive = options.waveActive;
    },
    stop: () => {
      active = false;
      masterGain.gain.cancelScheduledValues(context.currentTime);
      masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), context.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.25);
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      nextBeatAt = context.currentTime + 0.05;
      step = 0;
    },
    getState: () => ({
      active,
      tempo: getTempo(),
      wave,
      waveActive
    })
  };
};

const getMusicEngine = (context) => {
  if (!musicEngine) musicEngine = createMusicEngine(context);
  return musicEngine;
};

const playFeedback = (type) => {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === 'suspended') context.resume();

  const sounds = {
    startGame: [[440, 0.12, 0.06], [660, 0.18, 0.05, 0.1]],
    placeTower: [[520, 0.08, 0.045, 0, 'triangle'], [720, 0.12, 0.04, 0.06]],
    upgradeTower: [[520, 0.1, 0.05], [680, 0.1, 0.05, 0.08], [860, 0.16, 0.05, 0.16]],
    sellTower: [[540, 0.08, 0.035], [420, 0.12, 0.03, 0.07]],
    startWave: [[300, 0.12, 0.05, 0, 'triangle'], [390, 0.16, 0.05, 0.1, 'triangle']],
    enemyDefeated: [[760, 0.07, 0.025, 0, 'square']],
    toothHit: [[170, 0.16, 0.045, 0, 'sawtooth']],
    soundOn: [[620, 0.08, 0.035], [830, 0.12, 0.035, 0.06]],
    brushEmpty: [[300, 0.08, 0.025, 0, 'triangle']],
    brushBlast: [[460, 0.1, 0.045, 0, 'triangle'], [690, 0.14, 0.05, 0.08], [920, 0.2, 0.055, 0.16]],
    waveComplete: [[520, 0.12, 0.055], [660, 0.12, 0.055, 0.1], [820, 0.24, 0.06, 0.2]],
    victory: [[520, 0.16, 0.06], [660, 0.16, 0.06, 0.12], [820, 0.16, 0.06, 0.24], [1040, 0.3, 0.065, 0.36]],
    gameOver: [[280, 0.2, 0.045, 0, 'triangle'], [210, 0.32, 0.04, 0.18, 'triangle']]
  };

  sounds[type]?.forEach(([frequency, duration, volume, delay, oscillatorType]) => {
    playTone(context, frequency, duration, volume, delay, oscillatorType);
  });
};

export default function SoundFeedback() {
  const feedbackEvent = useGameStore((state) => state.feedbackEvent);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const wave = useGameStore((state) => state.wave);
  const waveActive = useGameStore((state) => state.waveActive);

  useEffect(() => {
    if (!soundEnabled || !feedbackEvent) return;
    playFeedback(feedbackEvent.type);
  }, [feedbackEvent, soundEnabled]);

  useEffect(() => {
    if (!soundEnabled || gameStatus !== 'playing') {
      musicEngine?.stop();
      return undefined;
    }

    const context = getAudioContext();
    if (!context) return undefined;
    if (context.state === 'suspended') context.resume();

    const engine = getMusicEngine(context);
    engine.start({ wave, waveActive });
    engine.update({ wave, waveActive });

    return undefined;
  }, [gameStatus, soundEnabled, wave, waveActive]);

  useEffect(() => () => {
    musicEngine?.stop();
  }, []);

  return null;
}

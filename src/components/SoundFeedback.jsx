import { useEffect } from 'react';
import { useGameStore } from '../gameStore';

let audioContext = null;

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

  useEffect(() => {
    if (!soundEnabled || !feedbackEvent) return;
    playFeedback(feedbackEvent.type);
  }, [feedbackEvent, soundEnabled]);

  return null;
}

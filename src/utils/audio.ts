// Web Audio API emergency siren synthesizer
let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let sirenInterval: any = null;

export function playEmergencySiren() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (oscillator) {
      stopEmergencySiren();
    }

    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(450, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();

    // Modulate frequency between 450Hz and 850Hz to mimic disaster warning siren
    let high = false;
    sirenInterval = setInterval(() => {
      if (!oscillator || !audioCtx) return;
      const targetFreq = high ? 450 : 850;
      oscillator.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.5);
      high = !high;
    }, 600);
  } catch (err) {
    console.warn('AudioContext not allowed or supported yet:', err);
  }
}

export function stopEmergencySiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (oscillator) {
    try {
      oscillator.stop();
      oscillator.disconnect();
    } catch (e) {
      // ignore
    }
    oscillator = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
}

export const emergencySirenPlayer = {
  start: playEmergencySiren,
  stop: stopEmergencySiren,
};


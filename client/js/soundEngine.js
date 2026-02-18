class SoundEngine {
  constructor() {
    this.audioContext = null;
    this.masterVolume = 0.5;
    this.enabled = true;
    this.sounds = {};
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Play a simple tone
  playTone(frequency, duration, volume = 0.3, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Menu sounds
  playClick() {
    this.playTone(800, 0.1, 0.2, 'square');
  }

  playHover() {
    this.playTone(600, 0.05, 0.1, 'sine');
  }

  playSelect() {
    this.playTone(1000, 0.15, 0.25, 'triangle');
    setTimeout(() => this.playTone(1200, 0.1, 0.2, 'triangle'), 50);
  }

  // Countdown sounds
  playCountdown(count) {
    if (count === 3 || count === 2 || count === 1) {
      this.playTone(440, 0.2, 0.3, 'square');
    } else if (count === 0) {
      // GO sound - higher pitch
      this.playTone(880, 0.3, 0.4, 'square');
      setTimeout(() => this.playTone(1100, 0.2, 0.3, 'square'), 100);
    }
  }

  // Move selection
  playMoveSelect(move) {
    const frequencies = {
      rock: 300,
      paper: 500,
      scissors: 700
    };
    this.playTone(frequencies[move] || 500, 0.15, 0.25, 'triangle');
  }

  // Reveal sound
  playReveal() {
    this.playTone(400, 0.1, 0.3, 'sawtooth');
    setTimeout(() => this.playTone(600, 0.1, 0.3, 'sawtooth'), 100);
    setTimeout(() => this.playTone(800, 0.2, 0.3, 'sawtooth'), 200);
  }

  // Win sound
  playWin() {
    const notes = [523, 659, 784, 1047]; // C, E, G, C
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, 0.3, 'sine'), i * 100);
    });
  }

  // Lose sound
  playLose() {
    this.playTone(400, 0.3, 0.3, 'sawtooth');
    setTimeout(() => this.playTone(300, 0.3, 0.3, 'sawtooth'), 150);
    setTimeout(() => this.playTone(200, 0.4, 0.3, 'sawtooth'), 300);
  }

  // Tie sound
  playTie() {
    this.playTone(440, 0.2, 0.25, 'triangle');
    setTimeout(() => this.playTone(440, 0.2, 0.25, 'triangle'), 250);
  }

  // Special interaction sounds
  playCut() {
    // Scissors cutting paper
    this.playTone(1200, 0.05, 0.2, 'square');
    setTimeout(() => this.playTone(1000, 0.05, 0.2, 'square'), 50);
    setTimeout(() => this.playTone(800, 0.1, 0.2, 'square'), 100);
  }

  playCrush() {
    // Rock crushing scissors
    this.playTone(200, 0.15, 0.35, 'sawtooth');
    setTimeout(() => this.playTone(150, 0.2, 0.35, 'sawtooth'), 100);
  }

  playWrap() {
    // Paper wrapping rock
    this.playTone(600, 0.1, 0.2, 'sine');
    setTimeout(() => this.playTone(550, 0.1, 0.2, 'sine'), 80);
    setTimeout(() => this.playTone(500, 0.1, 0.2, 'sine'), 160);
    setTimeout(() => this.playTone(450, 0.15, 0.2, 'sine'), 240);
  }

  // Tournament sounds
  playMatchStart() {
    this.playTone(659, 0.15, 0.3, 'square');
    setTimeout(() => this.playTone(784, 0.15, 0.3, 'square'), 150);
  }

  playTournamentStart() {
    const fanfare = [523, 659, 784, 1047, 1319];
    fanfare.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, 0.3, 'triangle'), i * 120);
    });
  }

  playChampion() {
    // Victory fanfare
    const melody = [523, 659, 784, 1047, 1319, 1568, 2093];
    melody.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.25, 0.35, 'sine'), i * 100);
    });
  }

  // Chat notification
  playChatNotification() {
    this.playTone(800, 0.08, 0.15, 'sine');
    setTimeout(() => this.playTone(1000, 0.08, 0.15, 'sine'), 80);
  }

  // Error sound
  playError() {
    this.playTone(200, 0.3, 0.3, 'sawtooth');
  }

  // Set master volume (0-1)
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Enable/disable sound
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

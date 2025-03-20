// Sound manager for DOOM of Teyvat

export class SoundManager {
    constructor() {
      this.sounds = {};
      this.music = {};
      this.currentMusic = null;
      this.muted = false;
      this.volume = 1.0;
      this.musicVolume = 0.5;
      this.soundVolume = 0.8;
    }
    
    initialize() {
      console.log('Initializing sound manager...');
      
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Load sound effects (using base64 encoded sounds for simplicity in this example)
      this.loadBaseSounds();
      
      console.log('Sound manager initialized');
    }
    
    loadBaseSounds() {
      // Generate some simple sounds for testing
      this.generateTestSounds();
      
      // In a real implementation, you would load sounds from files like this:
      /*
      this.loadSound('blockBreak', 'assets/sounds/block_break.wav');
      this.loadSound('blockPlace', 'assets/sounds/block_place.wav');
      this.loadSound('jump', 'assets/sounds/jump.wav');
      */
    }
    
    generateTestSounds() {
      // Simple function to generate test sounds procedurally
      // This wouldn't be used in a real game but helps for the prototype
      
      // Block break sound
      this.sounds.blockBreak = this.generateTone(220, 0.1, 'square');
      
      // Block place sound
      this.sounds.blockPlace = this.generateTone(440, 0.1, 'square');
      
      // Jump sound
      this.sounds.jump = this.generateTone(330, 0.2, 'sine');
      
      // Vision switch sound
      this.sounds.visionSwitch = this.generateTone(660, 0.1, 'sine');
      
      // Element weapon sounds
      this.sounds.firePyro = this.generateTone(150, 0.3, 'sawtooth');
      this.sounds.fireHydro = this.generateTone(200, 0.3, 'sine');
      this.sounds.fireElectro = this.generateTone(250, 0.3, 'square');
      this.sounds.fireAnemo = this.generateTone(300, 0.3, 'sine');
      this.sounds.fireGeo = this.generateTone(350, 0.3, 'square');
      this.sounds.fireCryo = this.generateTone(400, 0.3, 'sine');
      this.sounds.fireDendro = this.generateTone(450, 0.3, 'triangle');
      
      // Element skill sounds
      this.sounds.skillPyro = this.generateTone(200, 0.5, 'sawtooth');
      this.sounds.skillHydro = this.generateTone(250, 0.5, 'sine');
      this.sounds.skillElectro = this.generateTone(300, 0.5, 'square');
      this.sounds.skillAnemo = this.generateTone(350, 0.5, 'sine');
      this.sounds.skillGeo = this.generateTone(400, 0.5, 'square');
      this.sounds.skillCryo = this.generateTone(450, 0.5, 'sine');
      this.sounds.skillDendro = this.generateTone(500, 0.5, 'triangle');
      
      // Element burst sounds
      this.sounds.burstPyro = this.generateTone(300, 0.8, 'sawtooth');
      this.sounds.burstHydro = this.generateTone(350, 0.8, 'sine');
      this.sounds.burstElectro = this.generateTone(400, 0.8, 'square');
      this.sounds.burstAnemo = this.generateTone(450, 0.8, 'sine');
      this.sounds.burstGeo = this.generateTone(500, 0.8, 'square');
      this.sounds.burstCryo = this.generateTone(550, 0.8, 'sine');
      this.sounds.burstDendro = this.generateTone(600, 0.8, 'triangle');
      
      // UI sounds
      this.sounds.menuClick = this.generateTone(880, 0.05, 'sine');
      this.sounds.menuHover = this.generateTone(660, 0.05, 'sine');
      
      // Generate some simple background music
      this.music.main = this.generateMusic();
    }
    
    generateTone(frequency, duration, type = 'sine') {
      const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
      const channelData = audioBuffer.getChannelData(0);
      
      const omega = 2 * Math.PI * frequency;
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / this.audioContext.sampleRate;
        
        // Apply different waveforms based on type
        let sample = 0;
        switch (type) {
          case 'sine':
            sample = Math.sin(omega * t);
            break;
          case 'square':
            sample = Math.sin(omega * t) > 0 ? 0.5 : -0.5;
            break;
          case 'sawtooth':
            sample = 2 * ((t * frequency) % 1) - 1;
            break;
          case 'triangle':
            sample = 2 * Math.abs(2 * ((t * frequency) % 1) - 1) - 1;
            break;
          default:
            sample = Math.sin(omega * t);
        }
        
        // Apply simple envelope
        const attack = 0.1 * duration;
        const release = 0.3 * duration;
        let envelope = 1;
        
        if (t < attack) {
          envelope = t / attack; // Attack phase
        } else if (t > duration - release) {
          envelope = (duration - t) / release; // Release phase
        }
        
        channelData[i] = sample * envelope * 0.5; // Reduce volume a bit
      }
      
      return audioBuffer;
    }
    
    generateMusic() {
      // This is a very simple procedural music generator for testing
      // In a real game, you would load actual music files
      const duration = 10; // 10 seconds loop
      const audioBuffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
      
      const leftChannel = audioBuffer.getChannelData(0);
      const rightChannel = audioBuffer.getChannelData(1);
      
      // Simple chord progression (C, G, Am, F)
      const chords = [
        [261.63, 329.63, 392.00], // C major
        [392.00, 493.88, 587.33], // G major
        [220.00, 277.18, 329.63], // A minor
        [349.23, 440.00, 523.25]  // F major
      ];
      
      // Duration of each chord in seconds
      const chordDuration = 2.5;
      
      for (let i = 0; i < leftChannel.length; i++) {
        const t = i / this.audioContext.sampleRate;
        const chordIndex = Math.floor((t % (chordDuration * chords.length)) / chordDuration);
        const chord = chords[chordIndex];
        
        // Simple melody on top of chords
        const melodyNote = chord[Math.floor(t * 2) % chord.length] * 2;
        
        // Left channel: chords
        leftChannel[i] = (
          0.1 * Math.sin(2 * Math.PI * chord[0] * t) +
          0.1 * Math.sin(2 * Math.PI * chord[1] * t) +
          0.1 * Math.sin(2 * Math.PI * chord[2] * t)
        );
        
        // Right channel: melody
        rightChannel[i] = 0.15 * Math.sin(2 * Math.PI * melodyNote * t);
        
        // Add a simple beat
        if (t % 0.5 < 0.05) {
          leftChannel[i] += 0.2;
          rightChannel[i] += 0.2;
        }
        
        // Apply some basic dynamics
        const envelope = 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.1 * t);
        leftChannel[i] *= envelope;
        rightChannel[i] *= envelope;
      }
      
      return audioBuffer;
    }
    
    loadSound(name, url) {
      // This would load a sound from a file in a real implementation
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          this.sounds[name] = audioBuffer;
        })
        .catch(error => console.error(`Error loading sound ${name}:`, error));
    }
    
    playSound(name) {
      if (this.muted) return;
      
      const sound = this.sounds[name];
      if (!sound) {
        console.warn(`Sound "${name}" not found`);
        return;
      }
      
      const source = this.audioContext.createBufferSource();
      source.buffer = sound;
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.soundVolume * this.volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    }
    
    playMusic(name) {
      if (this.currentMusic) {
        this.currentMusic.stop();
        this.currentMusic = null;
      }
      
      const music = this.music[name];
      if (!music) {
        console.warn(`Music "${name}" not found`);
        return;
      }
      
      const source = this.audioContext.createBufferSource();
      source.buffer = music;
      source.loop = true;
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.musicVolume * this.volume * (this.muted ? 0 : 1);
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
      this.currentMusic = source;
    }
    
    stopMusic() {
      if (this.currentMusic) {
        this.currentMusic.stop();
        this.currentMusic = null;
      }
    }
    
    setVolume(volume) {
      this.volume = Math.max(0, Math.min(1, volume));
    }
    
    setMusicVolume(volume) {
      this.musicVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSoundVolume(volume) {
      this.soundVolume = Math.max(0, Math.min(1, volume));
    }
    
    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }
    
    isMuted() {
      return this.muted;
    }
  }
// Web Audio API-based alarm audio player with custom tone support

export class AlarmAudioPlayer {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private loopTimeout: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  async playAlarmSound(
    audioSource: string | null,
    volume: number = 80,
    vibrate: boolean = true
  ): Promise<void> {
    if (!this.audioContext || !this.gainNode) {
      console.error('Audio context not available');
      return;
    }

    try {
      // Stop any currently playing sound
      await this.stopAlarmSound();

      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Set volume (0-100 to 0-1)
      this.gainNode.gain.value = volume / 100;

      // Trigger vibration if supported and enabled
      if (vibrate && 'vibrate' in navigator) {
        navigator.vibrate([500, 250, 500, 250, 500]);
      }

      // Play the alarm sound
      // audioSource can be a data URL (base64 encoded audio) or null for default
      if (audioSource && audioSource.startsWith('data:')) {
        await this.playCustomAudio(audioSource);
      } else {
        await this.playDefaultAlarmSound();
      }

      this.isPlaying = true;
    } catch (error) {
      console.error('Failed to play alarm sound:', error);
      // Fallback to default sound if custom audio fails
      try {
        await this.playDefaultAlarmSound();
        this.isPlaying = true;
      } catch (fallbackError) {
        console.error('Fallback to default sound also failed:', fallbackError);
      }
    }
  }

  private async playCustomAudio(dataUrl: string): Promise<void> {
    if (!this.audioContext || !this.gainNode) return;

    try {
      // Convert data URL to ArrayBuffer
      const response = await fetch(dataUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.playBuffer(audioBuffer);
    } catch (error) {
      console.error('Failed to play custom audio:', error);
      // Fallback to default sound
      await this.playDefaultAlarmSound();
    }
  }

  private async playDefaultAlarmSound(): Promise<void> {
    if (!this.audioContext || !this.gainNode) return;

    // Generate a pleasant bell-like alarm sound using Web Audio API
    const audioBuffer = this.generateBellSound();
    this.playBuffer(audioBuffer);
  }

  private generateBellSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not available');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 2; // 2 seconds
    const audioBuffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    // Generate a pleasant bell sound with multiple harmonics
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      
      // Multiple frequency components for rich sound
      const fundamental = Math.sin(2 * Math.PI * 523.25 * t); // C5
      const harmonic1 = Math.sin(2 * Math.PI * 659.25 * t) * 0.5; // E5
      const harmonic2 = Math.sin(2 * Math.PI * 783.99 * t) * 0.3; // G5
      
      // Exponential decay envelope for bell-like quality
      const envelope = Math.exp(-t * 2.5);
      
      channelData[i] = (fundamental + harmonic1 + harmonic2) * envelope * 0.3;
    }

    return audioBuffer;
  }

  private playBuffer(buffer: AudioBuffer): void {
    if (!this.audioContext || !this.gainNode) return;

    const playOnce = () => {
      this.currentSource = this.audioContext!.createBufferSource();
      this.currentSource.buffer = buffer;
      this.currentSource.connect(this.gainNode!);
      this.currentSource.start();

      // Loop the sound every few seconds
      this.loopTimeout = window.setTimeout(() => {
        if (this.isPlaying) {
          playOnce();
        }
      }, (buffer.duration + 0.5) * 1000); // Add 0.5s gap between loops
    };

    playOnce();
  }

  async stopAlarmSound(): Promise<void> {
    this.isPlaying = false;

    // Stop vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }

    // Clear loop timeout
    if (this.loopTimeout !== null) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }

    // Stop current audio source
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Source might already be stopped
      }
      this.currentSource.disconnect();
      this.currentSource = null;
    }
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(100, volume)) / 100;
    }
  }

  async testSound(audioSource: string | null, volume: number = 80): Promise<void> {
    await this.playAlarmSound(audioSource, volume, false);
    
    // Auto-stop after 3 seconds for testing
    setTimeout(() => {
      this.stopAlarmSound();
    }, 3000);
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async cleanup(): Promise<void> {
    await this.stopAlarmSound();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
    }
  }
}

export const alarmAudioPlayer = new AlarmAudioPlayer();

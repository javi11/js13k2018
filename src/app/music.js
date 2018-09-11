import TinyMusic from 'tinymusic';
import musicList from './music-list.json';

export default class Music {
  constructor(level = 'level1') {
    this.on = false;
    const { lead, bass, harmony } = musicList[level];
    const ac = typeof AudioContext !== 'undefined' ? new AudioContext() : new webkitAudioContext();

    this.tempo = 120;
    this.when = ac.currentTime;
    this.sequence1 = new TinyMusic.Sequence(ac, this.tempo, lead);
    this.sequence2 = new TinyMusic.Sequence(ac, this.tempo, harmony);
    this.sequence3 = new TinyMusic.Sequence(ac, this.tempo, bass);
    // set staccato and smoothing values for maximum coolness
    this.sequence1.staccato = 0.55;
    this.sequence2.staccato = 0.55;
    this.sequence3.staccato = 0.05;
    this.sequence3.smoothing = 0.4;

    // adjust the levels so the bass and harmony aren't too loud
    this.sequence1.gain.gain.value = 1.0 / 2;
    this.sequence2.gain.gain.value = 0.8 / 2;
    this.sequence3.gain.gain.value = 0.65 / 2;

    // apply EQ settings
    this.sequence1.mid.frequency.value = 800;
    this.sequence1.mid.gain.value = 3;
    this.sequence2.mid.frequency.value = 1200;
    this.sequence3.mid.gain.value = 3;
    this.sequence3.bass.gain.value = 6;
    this.sequence3.bass.frequency.value = 80;
    this.sequence3.mid.gain.value = -6;
    this.sequence3.mid.frequency.value = 500;
    this.sequence3.treble.gain.value = -2;
    this.sequence3.treble.frequency.value = 1400;
  }

  start() {
    this.sequence1.play(this.when);
    this.sequence2.play(this.when + 10 / this.tempo * 16);
    this.sequence3.play(this.when);
    this.on = true;
  }

  isOn() {
    return this.on;
  }

  stop() {
    this.sequence1.stop();
    this.sequence2.stop();
    this.sequence3.stop();
    this.on = false;
  }
}

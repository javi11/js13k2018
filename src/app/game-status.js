export default class GameStatus {
  constructor(torch, torchDecreaseRate, life) {
    this.initialTorchVal = torch;
    this.torch = torch;
    this.torchDecreaseRate = torchDecreaseRate;
    this.life = life;

    const torchImg = document.getElementById('torchImg');
    torchImg.src = require('../assets/sprites/fire.png');
    this.torchVal = document.getElementById('torchValue');

    const counterImg = document.getElementById('counterImg');
    counterImg.src = require('../assets/sprites/clock.png');
    this.counterVal = document.getElementById('counterVal');

    const runImg = document.getElementById('runImg');
    runImg.src = require('../assets/sprites/run.png');
    this.runVal = document.getElementById('runVal');
    this.runDiv = document.getElementById('run');
  }

  update(hero) {
    if (this.torch > 100) {
      this.torch = this.torch - this.torchDecreaseRate;
      this.torchVal.innerHTML = `${Math.round(this.torch / this.initialTorchVal * 100)}%`;
    }
    const speedUp = hero.conditions.find(cond => cond.name === 'speedUp');
    if (speedUp) {
      const now = Date.now();
      this.runDiv.style.display = 'flex';
      this.runVal.innerHTML = Math.round(Math.abs(now - speedUp.startedAt - speedUp.duration) / 60);
    } else {
      this.runDiv.style.display = 'none';
    }
  }
}

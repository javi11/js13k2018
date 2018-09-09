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
    counterImg.src = require('../assets/sprites/fornite.jpg');
    this.counterVal = document.getElementById('counterVal');
  }

  update(hero) {
    if (this.torch > 60) {
      this.torch = this.torch - this.torchDecreaseRate;
      this.torchVal.innerHTML = `${Math.round(this.torch / this.initialTorchVal * 100)}%`;
    }
  }
}

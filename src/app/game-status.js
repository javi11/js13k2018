export default class GameStatus {
  constructor(torch, torchDecreaseRate, life) {
    this.initialTorchVal = torch;
    this.torch = torch;
    this.torchDecreaseRate = torchDecreaseRate;
    this.life = life;
    this.torchVal = document.getElementById('tv');
    this.counterVal = document.getElementById('cv');
    this.runVal = document.getElementById('rv');
    this.runDiv = document.getElementById('r');
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

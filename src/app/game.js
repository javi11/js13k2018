import Level from './level';

export default class Game {
  constructor(gameDiv, canvas, display, maxLv = 3) {
    this.levelIndex = 1;
    this.canvas = canvas;
    this.display = display;
    this.gameDiv = gameDiv;
    this.maxLv = maxLv;
  }

  startTimmer(duration, display) {
    this.timer = duration;
    let minutes;
    let seconds;

    const intervalId = setInterval(() => {
      minutes = parseInt(this.timer / 60, 10);
      seconds = parseInt(this.timer % 60, 10);

      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      display.textContent = minutes + ':' + seconds;

      if (--this.timer < 0) {
        clearInterval(intervalId);
        this.gameOver();
      }
    }, 1000);
  }

  onEndLevel(gameOver) {
    if (gameOver) {
      this.onGameOver();
    } else {
      if (this.levelIndex < this.maxLv) {
        this.levelIndex += 1;
        this.level = new Level(
          9 * this.levelIndex,
          this.canvas,
          'dungeon',
          6 + this.levelIndex + 1,
          this.levelIndex === this.maxLv
        );
        this.level.startLevel(this.onEndLevel.bind(this));
      } else {
        this.onWin(this.timer, this.duration);
      }
    }
  }

  gameOver() {
    this.level.endLevel(true);
  }

  startGame(onWin, onGameOver) {
    this.duration = 15 * 60;
    this.gameDiv.style.display = 'block';
    this.level = new Level(10, this.canvas, 'dungeon', 3);
    this.startTimmer(this.duration, this.display);
    this.level.startLevel(this.onEndLevel.bind(this));
    this.onWin = onWin;
    this.onGameOver = onGameOver;
  }
}

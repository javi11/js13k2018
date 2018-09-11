import Key from './keyboard';

export default class Hero {
  constructor(sprites, initX, initY, speed, width = 32, height = 32) {
    this.posX = initX;
    this.posY = initY;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.speed = speed;
    this.sprites = sprites;
    this.actualSprite = this.sprites.idle;
    this.initialSpeed = speed;
    this.conditions = [];
  }

  activateCondition(name, fn, onConditionEnd, duration) {
    const sameConditionActivated = this.conditions.some(condition => condition.name = name);
    if (!sameConditionActivated) {
      this.conditions.push({
        name,
        duration,
        startedAt: Date.now()
      });

      fn(this);

      setTimeout(() => {
        onConditionEnd(this);
        const index = this.conditions.findIndex(cond => cond.name === name);
        this.conditions.splice(index, 1);
      }, duration);
    }
  }

  update() {
    if (Key.isDown(Key.UP)) this.moveUp();
    if (Key.isDown(Key.LEFT)) this.moveLeft();
    if (Key.isDown(Key.DOWN)) this.moveDown();
    if (Key.isDown(Key.RIGHT)) this.moveRight();

    if (
      !Key.isDown(Key.UP) &&
      !Key.isDown(Key.LEFT) &&
      !Key.isDown(Key.DOWN) &&
      !Key.isDown(Key.RIGHT)
    ) {
      this.setIdle();
    }
  }

  setIdle() {
    this.speedY = 0;
    this.speedX = 0;
    this.actualSprite = this.sprites.idle;
  }

  moveUp() {
    this.speedX = 0;
    this.speedY = +this.speed;
    this.actualSprite = this.sprites.up;
  }

  moveLeft() {
    this.speedY = 0;
    this.speedX = +this.speed;
    this.actualSprite = this.sprites.left;
  }

  moveDown() {
    this.speedX = 0;
    this.speedY = -this.speed;
    this.actualSprite = this.sprites.down;
  }

  moveRight() {
    this.speedY = 0;
    this.speedX = -this.speed;
    this.actualSprite = this.sprites.right;
  }
}

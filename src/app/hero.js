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
    this.actualSprite = new Image();
    this.actualSprite.src = sprites.idle;
    this.status = {
      torch: 200,
      life: 100
    };
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
    this.actualSprite.src = this.sprites.idle;
  }

  moveUp() {
    this.speedX = 0;
    this.speedY = +this.speed;
    this.actualSprite.src = this.sprites.walkingUp;
  }

  moveLeft() {
    this.speedY = 0;
    this.speedX = +this.speed;
    this.actualSprite.src = this.sprites.walkingLeft;
  }

  moveDown() {
    this.speedX = 0;
    this.speedY = -this.speed;
    this.actualSprite.src = this.sprites.walkingDown;
  }

  moveRight() {
    this.speedY = 0;
    this.speedX = -this.speed;
    this.actualSprite.src = this.sprites.walkingRight;
  }
}

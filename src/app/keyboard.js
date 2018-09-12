class Keyboard {
  constructor() {
    this.pressed = {};
    this.LEFT = 37;
    this.UP = 38;
    this.RIGHT = 39;
    this.DOWN = 40;
  }

  isDown(keyCode) {
    return this.pressed[keyCode];
  }

  onKeydown(event) {
    this.pressed[event.keyCode] = true;
  }

  onKeyup(event) {
    delete this.pressed[event.keyCode];
  }
}

export default new Keyboard();

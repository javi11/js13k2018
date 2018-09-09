import Hero from './hero';
import Key from './keyboard';
import Labyrinth from './labyrinth';
import GameStatus from './game-status';

export default class Level {
  constructor(mapSize = 25, canvas, environment, difficulty = 1) {
    const sprites = {
      idle: require('../assets/sprites/idle.png'),
      walkingUp: require('../assets/sprites/up.png'),
      walkingDown: require('../assets/sprites/down.png'),
      walkingLeft: require('../assets/sprites/left.png'),
      walkingRight: require('../assets/sprites/right.png')
    };
    const levelStatus = this.getStatusByDificulty(difficulty);
    const hero = new Hero(sprites, -60, -40, 10);
    const { pathSprite, wallSprite } = this.getEnvironment(environment);

    this.labyrinth = new Labyrinth(
      hero,
      canvas,
      { '#': pathSprite, '##': wallSprite },
      levelStatus
    );
    const objects = this.getLevelObjects(difficulty);
    objects.forEach(obj => this.labyrinth.addObject(obj));
    this.labyrinth.generateMap(mapSize, mapSize);
  }

  getStatusByDificulty(difficulty) {
    const life = 100 - difficulty * 3;
    const torch = 400 - difficulty * 10;
    const torchDecreaseRate = 0.01 * difficulty;
    return new GameStatus(torch, torchDecreaseRate, life);
  }

  getLevelObjects(difficulty) {
    const sprite = new Image();
    sprite.src = require('../assets/sprites/fire.png');
    return [
      {
        symbol: 'L',
        available: 100,
        sprite,
        action(hero, level) {
          level.torch += 1;
        }
      }
    ];
  }

  getEnvironment(env) {
    const environment = {
      wallSprite: new Image(),
      pathSprite: new Image()
    };

    switch (env) {
      default:
        environment.wallSprite.src = require('../assets/sprites/wall.png');
        environment.pathSprite.src = require('../assets/sprites/ground.png');
        break;
    }

    return environment;
  }

  startLevel() {
    window.addEventListener('keyup', event => Key.onKeyup(event), false);
    window.addEventListener('keydown', event => Key.onKeydown(event), false);
    const animationId = requestAnimationFrame(this.labyrinth.gameLoop.bind(this.labyrinth));
  }
}

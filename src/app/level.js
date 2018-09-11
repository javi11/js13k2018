import Hero from './hero';
import Key from './keyboard';
import Labyrinth from './labyrinth';
import GameStatus from './game-status';
import Music from './music';
import heroSpriteMap from './hero-sprite-map.json';

function onKeyup(event) {
  return Key.onKeyup(event);
}

function onKeydown(event) {
  return Key.onKeydown(event);
}

export default class Level {
  constructor(mapSize = 25, canvas, environment, difficulty = 1, isFinalLv = false) {
    const levelStatus = this.getStatusByDificulty(difficulty);
    const img = new Image();
    img.src = require('../assets/sprites/sprite-sheet.png');
    const hero = new Hero({ ...heroSpriteMap, img }, -60, -40, 5);
    const { pathSprite, wallSprite } = this.getEnvironment(environment);

    this.labyrinth = new Labyrinth(
      hero,
      canvas,
      { '#': pathSprite, '##': wallSprite },
      levelStatus,
      isFinalLv
    );
    const objects = this.getLevelObjects(difficulty, img);
    objects.forEach(obj => this.labyrinth.addObject(obj));
    this.labyrinth.generateMap(mapSize, mapSize);

    this.levelMusic = new Music();
  }

  getStatusByDificulty(difficulty) {
    const life = 100 - difficulty * 3;
    const torch = 250 - difficulty * 10;
    const torchDecreaseRate = 0.01 * difficulty;
    return new GameStatus(torch, torchDecreaseRate, life);
  }

  getLevelObjects(difficulty, img) {
    const self = this;
    return [
      {
        symbol: 'O',
        available: 0,
        sprite: {
          img,
          animation: [15]
        },
        rate: 0,
        action(hero) {
          self.endLevel.bind(self)();
        }
      },
      {
        move: false,
        symbol: 'W',
        available: 0,
        sprite: {
          img,
          animation: [14]
        },
        rate: 0,
        action(hero) {
          self.endLevel.bind(self)();
        }
      },
      {
        symbol: 'R',
        available: 30,
        sprite: {
          img,
          animation: [12]
        },
        rate: 0.3,
        action(hero) {
          hero.activateCondition(
            'speedUp',
            newHero => {
              newHero.speed = newHero.speed + 10;
            },
            newHero => {
              hero.speed = hero.speed - 10;
            },
            6000
          );
        }
      },
      {
        move: false,
        symbol: 'S',
        available: 40,
        sprite: {
          img,
          animation: [13]
        },
        rate: 0.3,
        forever: true,
        action(hero) {
          const hasSpeedUp = hero.conditions.some(cond => cond.name === 'speedUp');
          if (!hasSpeedUp) {
            hero.speed = Math.abs(hero.speed - 2);
          }
        }
      },
      {
        move: false,
        symbol: 'E',
        available: 0,
        sprite: {
          img,
          animation: [14]
        },
        forever: true,
        rate: 0,
        action(hero) {}
      },
      {
        symbol: 'T',
        available: 100,
        sprite: {
          img,
          animation: [10, 11]
        },
        rate: 0.3,
        action(hero, levelStatus) {
          levelStatus.torch += 14 * difficulty;
        }
      }
    ];
  }

  getEnvironment(env) {
    const environment = {
      wallSprite: {},
      pathSprite: {}
    };
    let sprite;

    switch (env) {
      default:
        sprite = new Image();
        sprite.src = require('../assets/sprites/dungeon.png');
        environment.wallSprite = {
          sprite,
          srcX: 0,
          srcY: 0
        };
        environment.pathSprite = {
          sprite,
          srcX: 64,
          srcY: 0
        };
        break;
    }

    return environment;
  }

  startLevel(onEndLevel) {
    window.addEventListener('keyup', onKeyup, false);
    window.addEventListener('keydown', onKeydown, false);
    this.animationId = requestAnimationFrame(this.labyrinth.gameLoop.bind(this.labyrinth));
    this.levelMusic.start();
    const muteBtn = document.getElementById('mute');
    muteBtn.onclick = () => {
      if (this.levelMusic.isOn()) {
        this.levelMusic.stop();
        muteBtn.innerHTML = 'UNMUTE';
      } else {
        this.levelMusic.start();
        muteBtn.innerHTML = 'MUTE';
      }
    };
    this.onEndLevel = onEndLevel;
  }

  endLevel(gameOver) {
    cancelAnimationFrame(this.animationId);
    cancelAnimationFrame(this.labyrinth.animationFrame);
    window.removeEventListener('keyup', onKeyup);
    window.removeEventListener('keydown', onKeydown);
    this.levelMusic.stop();
    this.onEndLevel(gameOver, this.levelStatus);
  }
}

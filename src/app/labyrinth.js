const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  window.mozRequestAnimationFrame;
const WALL = '##';
const PATH = '#';

function randomGen(seed) {
  if (seed === undefined) var seed = performance.now();
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function getRandomObject(random, objects) {
  const object = objects[Math.round(random() * objects.length)];
  const d = random() * 1;

  if (object && object.available > 0 && d < object.rate) {
    object.available -= 1;

    return object;
  }

  return null;
}

function generateLabyrinth(map, route, random, objects, exitSet = false, isFinalLv) {
  const x = route[route.length - 1][0] | 0;
  const y = route[route.length - 1][1] | 0;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]], alternatives = [];

  for (let i = 0; i < directions.length; i++) {
    if (
      map[(directions[i][1] + y) * 2] != undefined &&
      map[(directions[i][1] + y) * 2][(directions[i][0] + x) * 2] === WALL
    ) {
      alternatives.push(directions[i]);
    }
  }

  if (alternatives.length === 0) {
    route.pop();
    if (route.length > 0) {
      return generateLabyrinth(map, route, random, objects, exitSet, isFinalLv);
    }
    return map;
  }
  const direction = alternatives[(random() * alternatives.length) | 0];
  route.push([direction[0] + x, direction[1] + y]);

  if (!exitSet && x + y > map.length / 2) {
    // Exit symbol
    exitSet = true;
    map[(direction[1] + y) * 2][(direction[0] + x) * 2] = isFinalLv ? 'O' : 'W';
    map[direction[1] + y * 2][direction[0] + x * 2] = PATH;
  } else if (objects.length > 0) {
    let randomObject = getRandomObject(random, objects);
    if (randomObject) {
      map[(direction[1] + y) * 2][(direction[0] + x) * 2] = randomObject.symbol;
      map[direction[1] + y * 2][direction[0] + x * 2] = PATH;
    } else {
      map[(direction[1] + y) * 2][(direction[0] + x) * 2] = PATH;
      map[direction[1] + y * 2][direction[0] + x * 2] = PATH;
    }
  } else {
    map[(direction[1] + y) * 2][(direction[0] + x) * 2] = PATH;
    map[direction[1] + y * 2][direction[0] + x * 2] = PATH;
  }

  return generateLabyrinth(map, route, random, objects, exitSet, isFinalLv);
}

function addLimits(map, cols) {
  map.unshift(Array(cols).fill(WALL));
  map.push(Array(cols).fill(WALL));
  map.map(row => {
    row.unshift(WALL);
    row.push(WALL);
  });

  map[1][1] = 'E';
}

export default class Labyrinth {
  constructor(hero, canvas, sprites, levelStatus, isFinalLv, { fps = 50 } = {}) {
    this.hero = hero;
    this.objects = [];
    this.canvas = canvas;
    this.map = {
      cells: []
    };
    this.sprites = sprites;
    this.camera = {
      x: 0,
      y: 0,
      width: 200,
      height: 200
    };
    this.isFinalLv = isFinalLv;
    this.config = { fps };
    this.lastTimestamp = 0;
    this.levelStatus = levelStatus;
    this.animationTimer = 20;
    this.animationIndex = 0;
    this.animationFrame;

    return this;
  }

  generateMap(width = 10, height = 10, seed = (Math.random() * 100000) | 0, tileSize = 64) {
    this.map.x = (height / 2) | 0;
    this.map.y = (width / 2) | 0;
    this.map.width = width * tileSize * 2 - tileSize / 2;
    this.map.height = height * tileSize * 2 - tileSize / 2;
    this.map.tileSize = tileSize;
    const route = [[this.map.x, this.map.y]];

    for (let i = 0; i < height * 2; i++) {
      this.map.cells[i] = [];
      for (let j = 0; j < width * 2; j++) {
        this.map.cells[i][j] = WALL;
      }
    }
    this.map.cells[this.map.y * 2][this.map.x * 2] = PATH;
    generateLabyrinth(this.map.cells, route, randomGen(seed), this.objects, false, this.isFinalLv);
    addLimits(this.map.cells, width * 2);

    return this.map;
  }

  addObject(
    {
      symbol,
      sprite,
      rate = 0.7,
      available = 1,
      size = 32,
      action,
      activationKey,
      forever,
      move = true
    } = {}
  ) {
    const obj = {
      symbol,
      sprite,
      rate,
      available,
      action,
      activationKey,
      size,
      forever,
      move
    };

    this.objects.push(obj);
  }

  drawVisibleSpace(ctx) {
    const posX = -this.hero.posX + this.hero.width * 1.5;
    const posY = -this.hero.posY + this.hero.height * 1.5;
    const torch = this.levelStatus.torch || 100;
    const grd = ctx.createRadialGradient(posX, posY, torch, posX, posY, 0);
    grd.addColorStop(0, 'black');

    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(-this.camera.x, -this.camera.y, this.canvas.width, this.canvas.height);
  }

  drawHero(ctx, animationIndex) {
    ctx.drawImage(
      this.hero.sprites.img,
      this.hero.actualSprite[animationIndex] * this.hero.width,
      0,
      this.hero.width,
      this.hero.height,
      -Math.floor(this.hero.posX - this.hero.width),
      -Math.floor(this.hero.posY - this.hero.height),
      this.hero.width,
      this.hero.height
    );
  }

  draw() {
    const ctx = this.canvas.getContext('2d');
    const tileSize = this.map.tileSize;
    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.save();
    ctx.translate(this.camera.x, this.camera.y);

    ctx.fillRect(-this.camera.x, -this.camera.y, this.canvas.width, this.canvas.height);

    for (let ix = 0; ix < this.map.cells.length; ix++) {
      for (let iy = 0; iy < this.map.cells[ix].length; iy++) {
        ctx.clearRect(ix * tileSize, iy * tileSize, tileSize, tileSize);
        ctx.fillStyle = 'rgba(0,0,0,0)';
        let sprite;
        if (this.map.cells[iy][ix] === WALL) {
          sprite = this.sprites[WALL];
        } else {
          sprite = this.sprites[PATH];
        }
        ctx.drawImage(
          sprite.sprite,
          sprite.srcX,
          sprite.srcY,
          tileSize,
          tileSize,
          ix * tileSize,
          iy * tileSize,
          tileSize,
          tileSize
        );
        if (this.map.cells[iy][ix] !== WALL && this.map.cells[iy][ix] !== PATH) {
          const object = this.objects.find(obj => obj.symbol === this.map.cells[iy][ix]);
          if (object) {
            let moviment = 0;
            if (object.move) {
              if (this.animationIndex > 0) {
                moviment = 2;
              } else {
                moviment = -2;
              }
            }
            const animation =
              object.sprite.animation[this.animationIndex] || object.sprite.animation[0];
            ctx.drawImage(
              object.sprite.img,
              animation * object.size + 1.2,
              0,
              object.size,
              object.size,
              ix * tileSize + object.size / 2,
              iy * tileSize + object.size / 2 + moviment,
              object.size,
              object.size
            );
          }
        }
      }
    }

    this.drawHero(ctx, this.animationIndex);

    // Create a circular clipping path
    this.drawVisibleSpace(ctx);

    ctx.restore();

    if (this.animationTimer === 0) {
      if (this.animationIndex === 1) {
        this.animationIndex = 0;
      } else {
        this.animationIndex += 1;
      }
      this.animationTimer = 20;
    } else {
      this.animationTimer -= 1;
    }
  }

  triggerObjectAction(symbol, posX, posY) {
    if (symbol !== WALL && symbol !== PATH) {
      const object = this.objects.find(obj => obj.symbol === symbol);
      if (object && typeof object.action === 'function') {
        if (!object.forever) {
          this.map.cells[posX][posY] = PATH;
        }
        object.action(this.hero, this.levelStatus, this.map.cells, posX, posY);
      }
    }
  }

  checkCollisions(posX, posY) {
    const x1 = Math.abs(Math.floor(posX / this.map.tileSize));
    const y1 = Math.abs(Math.floor(posY / this.map.tileSize));
    const x2 = Math.abs(Math.floor((posX + this.hero.width - 3) / this.map.tileSize));
    const y2 = Math.abs(Math.floor((posY + this.hero.height - 5) / this.map.tileSize));

    this.triggerObjectAction(this.map.cells[y1][x1], y1, x1);
    this.triggerObjectAction(this.map.cells[y2][x1], y2, x1);
    this.triggerObjectAction(this.map.cells[y1][x2], y1, x2);
    this.triggerObjectAction(this.map.cells[y2][x2], y2, x2);

    if (
      this.map.cells[y1][x1] === WALL ||
      this.map.cells[y2][x1] === WALL ||
      this.map.cells[y1][x2] === WALL ||
      this.map.cells[y2][x2] === WALL
    ) {
      return true;
    }

    return false;
  }

  gameLoop() {
    const timestamp = Date.now();
    const delta = timestamp - this.lastTimestamp;
    this.animationFrame = requestAnimationFrame(this.gameLoop.bind(this));

    if (delta > 1000 / this.config.fps) {
      this.hero.update();
      this.levelStatus.update(this.hero);

      if (this.hero.speedX !== 0 || this.hero.speedY !== 0) {
        this.lastTimestamp = timestamp - delta % (1000 / this.config.fps);

        let newPosX = 0;
        let newPosY = 0;

        if (this.hero.posX > 0) {
          newPosX = 0;
        } else if (this.hero.posX < -this.map.width) {
          newPosX = -this.map.width;
        } else {
          newPosX = this.hero.posX + this.hero.speedX;
        }

        if (this.hero.posY > 0) {
          newPosY = 0;
        } else if (this.hero.posY < -this.map.height) {
          newPosY = -this.map.height;
        } else {
          newPosY = this.hero.posY + this.hero.speedY;
        }
        if (this.hero.speed < this.hero.initialSpeed) {
          this.hero.speed = this.hero.initialSpeed;
        }
        const collide = this.checkCollisions(newPosX, newPosY);
        if (!collide) {
          this.hero.posX = newPosX;
          this.hero.posY = newPosY;
        }
      }

      this.camera.x = this.hero.posX + this.camera.width * 1.5;
      this.camera.y = this.hero.posY + this.camera.height;
      this.draw();
    }
  }
}

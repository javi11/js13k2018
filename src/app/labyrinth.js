import Key from './keyboard';

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

function generateLabyrinth(map, route, random) {
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
      return generateLabyrinth(map, route, random);
    }
    return map;
  }
  const direction = alternatives[(random() * alternatives.length) | 0];
  route.push([direction[0] + x, direction[1] + y]);

  map[(direction[1] + y) * 2][(direction[0] + x) * 2] = PATH;
  map[direction[1] + y * 2][direction[0] + x * 2] = PATH;

  return generateLabyrinth(map, route, random);
}

function addLimits(map, cols) {
  map.unshift(Array(cols).fill(WALL));
  map.push(Array(cols).fill(WALL));
  map.map(row => {
    row.unshift(WALL);
    row.push(WALL);
  });
}

export default class Labyrinth {
  constructor(hero, canvas, sprites, { fps = 60 } = {}) {
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
    this.config = { fps };
    this.lastTimestamp = 0;
  }

  startGame() {
    window.addEventListener('keyup', event => Key.onKeyup(event), false);
    window.addEventListener('keydown', event => Key.onKeydown(event), false);
    requestAnimationFrame(this.gameLoop.bind(this));
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
    generateLabyrinth(this.map.cells, route, randomGen(seed));
    addLimits(this.map.cells, width * 2);

    return this.map;
  }

  addObject(symbol, sprite, rate, action, activationKey) {
    const obj = {
      symbol,
      sprite,
      rate,
      action,
      activationKey
    };

    this.objects.push(obj);
  }

  drawVisibleSpace(ctx) {
    ctx.beginPath();
    ctx.arc(
      -this.hero.posX + this.hero.width * 1.5,
      -this.hero.posY + this.hero.height * 1.5,
      this.hero.status.torch,
      0,
      Math.PI * 2,
      true
    );
    ctx.clip();
    // draw background
    var lingrad = ctx.createLinearGradient(0, -this.hero.status.torch, 0, this.hero.status.torch);
    lingrad.addColorStop(0, '#000000');
    lingrad.addColorStop(1, '#000000');
    ctx.fillStyle = lingrad;
  }

  draw() {
    const ctx = this.canvas.getContext('2d');
    const tileSize = this.map.tileSize;
    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.save();
    ctx.translate(this.camera.x, this.camera.y);

    // Create a circular clipping path
    this.drawVisibleSpace(ctx);

    ctx.fillRect(-this.camera.x, -this.camera.y, this.canvas.width, this.canvas.height);

    for (let ix = 0; ix < this.map.cells.length; ix++) {
      for (let iy = 0; iy < this.map.cells[ix].length; iy++) {
        ctx.clearRect(ix * tileSize, iy * tileSize, tileSize, tileSize);
        ctx.fillStyle = 'rgba(0,0,0,0)';
        if (this.map.cells[iy][ix] === WALL) {
          ctx.drawImage(this.sprites[WALL], ix * tileSize, iy * tileSize);
        } else if (this.map.cells[iy][ix] === PATH) {
          ctx.drawImage(this.sprites[PATH], ix * tileSize, iy * tileSize);
        }
      }
    }
    ctx.drawImage(
      this.hero.actualSprite,
      -Math.floor(this.hero.posX - this.hero.width),
      -Math.floor(this.hero.posY - this.hero.height)
    );

    ctx.restore();
  }

  checkCollisions(posX, posY) {
    const x1 = Math.abs(Math.floor(posX / this.map.tileSize));
    const y1 = Math.abs(Math.floor(posY / this.map.tileSize));
    const x2 = Math.abs(Math.floor((posX + this.hero.width - 3) / this.map.tileSize));
    const y2 = Math.abs(Math.floor((posY + this.hero.height - 5) / this.map.tileSize));

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
    requestAnimationFrame(this.gameLoop.bind(this));

    if (delta > 1000 / this.config.fps) {
      this.hero.update();

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

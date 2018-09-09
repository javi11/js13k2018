import './styles/main.css';
import Hero from './app/hero';
import Labyrinth from './app/labyrinth';

const sprites = {
  idle: require('./assets/sprites/idle.png'),
  walkingUp: require('./assets/sprites/up.png'),
  walkingDown: require('./assets/sprites/down.png'),
  walkingLeft: require('./assets/sprites/left.png'),
  walkingRight: require('./assets/sprites/right.png')
};
const hero = new Hero(sprites, -60, -40, 10);
const canvas = document.getElementById('ca');
const wallSprite = new Image();
wallSprite.src = require('./assets/sprites/wall.png');
const pathSprite = new Image();
pathSprite.src = require('./assets/sprites/ground.png');
const labyrinth = new Labyrinth(hero, canvas, { '#': pathSprite, '##': wallSprite });
labyrinth.generateMap(25, 25);
labyrinth.startGame();

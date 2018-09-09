import './styles/main.css';
import Level from './app/level';

function startTimmer(duration, display, onGameOver) {
  let timer = duration;
  let minutes;
  let seconds;

  const intervalId = setInterval(function() {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    display.textContent = minutes + ':' + seconds;

    if (--timer < 0) {
      clearInterval(intervalId);
    }
  }, 1000);
}

const display = document.querySelector('#counterVal');
const canvas = document.getElementsByTagName('canvas')[0];
const levels = [
  new Level(15, canvas, 'dungeon', 1),
  new Level(25, canvas, 'dungeon', 6),
  new Level(30, canvas, 'dungeon', 10)
];
const levelIndex = 0;

function onGameOver() {}
function onEndLevel() {
  if (levelIndex < 2) {
    levels[levelIndex++].startLevel(onEndLevel);
  } else {
    console.log('Game ended');
  }
}

startTimmer(20 * 60, display, onGameOver);
levels[levelIndex].startLevel(onEndLevel);

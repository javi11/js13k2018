import './styles/main.css';
import Game from './app/game';
import Conversation from './app/conversation';
import introScript from './assets/intro.json';
import gameOverScript from './assets/game-over.json';
import winScript from './assets/win.json';
import winButNoScript from './assets/win-but-no.json';

const display = document.querySelector('#counterVal');
const restart = document.querySelector('#restart');
const gameDiv = document.querySelector('#game');
const canvas = document.getElementsByTagName('canvas')[0];
const conversationDiv = document.querySelector('.text');

function startGame() {
  conversationDiv.style.display = 'none';
  restart.style.display = 'none';
  const game = new Game(gameDiv, canvas, display);
  game.startGame(onWin, onGameOver);
}

function onGameOver() {
  gameDiv.style.display = 'none';
  const conversation = new Conversation(2000);
  conversationDiv.style.display = 'block';
  conversation.startConversation(gameOverScript, conversationDiv, () => {
    restart.style.display = 'block';
    restart.onclick = startGame;
  });
}

function onWin(timer, duration) {
  gameDiv.style.display = 'none';
  const conversation = new Conversation(2000);
  const showRestart = false;
  conversationDiv.style.display = 'block';
  let script = winScript;
  if (timer > duration - 25) {
    script = winButNoScript;
    showRestart = true;
  }
  conversation.startConversation(script, conversationDiv, () => {
    if (showRestart) {
      restart.style.display = 'block';
      restart.onclick = startGame;
    }
  });
}

conversationDiv.style.display = 'block';
const conversation = new Conversation(2000);
conversation.startConversation(introScript, conversationDiv, () => {
  startGame();
});

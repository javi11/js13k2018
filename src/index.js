import './styles/main.css';
import Game from './app/game';
import Conversation from './app/conversation';
import introScript from './assets/intro.json';
import gameOverScript from './assets/game-over.json';
import winScript from './assets/win.json';

const display = document.querySelector('#cv');
const restart = document.querySelector('#restart');
const gameDiv = document.querySelector('#g');
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
  conversationDiv.style.display = 'block';
  conversation.startConversation(winScript, conversationDiv, () => {});
}

conversationDiv.style.display = 'block';
const conversation = new Conversation(2000);
conversation.startConversation(introScript, conversationDiv, () => {
  startGame();
});

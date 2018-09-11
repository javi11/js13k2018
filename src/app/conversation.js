import { init } from 'ityped';

function createLine(talker, color) {
  const line = document.createElement('div');
  line.className = 'line';
  line.style.color = color;
  const txtSpan = document.createElement('span');
  txtSpan.className = 'text';
  const talkerSpan = document.createElement('span');
  talkerSpan.className = 'talker';
  talkerSpan.innerHTML = `${talker}:  `;
  line.appendChild(talkerSpan);
  line.appendChild(txtSpan);

  return { line, txtSpan };
}

export default class Conversation {
  constructor(conversationDelay = 2000) {
    this.conversationDelay = conversationDelay;
  }

  writeLine(scriptLine, container, onFinish) {
    const { line, txtSpan } = createLine(scriptLine.talker, scriptLine.color);
    container.appendChild(line);
    init(txtSpan, {
      showCursor: true,
      disableBackTyping: true,
      showCursor: false,
      typeSpeed: 50,
      strings: [scriptLine.text],
      startDelay: this.conversationDelay,
      onFinished: () => {
        this.index += 1;
        if (this.index < this.script.length) {
          this.writeLine(this.script[this.index], container, onFinish);
        } else {
          setTimeout(() => {
            onFinish();
          }, 4000);
        }
      }
    });
  }

  startConversation(script, container, onFinish) {
    container.innerHTML = '';
    this.script = script;
    this.index = 0;
    this.writeLine(this.script[this.index], container, onFinish);
  }
}

const ws = new WebSocket('ws://localhost:8080');
console.log('Client started on port 8080');

const messagesDiv = document.getElementById('messages');
const sendButton = document.getElementById('sendButton');
const textArea = document.getElementById("htmlTextArea")

var htmlText;
sendButton.addEventListener('click', sendHTMLText);

function sendHTMLText() {
  htmlText = htmlTextArea.value;
  console.log("htmlText : " + htmlText);
  ws.send(JSON.stringify(JSON.parse(htmlText)));
} 

ws.onerror = console.error;

ws.onopen = function () {
};

ws.onmessage = function (event) {
  console.log('ON RECOIT DU SERVUR: %s', event.data);
  const p = document.createElement('p');
  p.textContent = event.data;
  messagesDiv.appendChild(p);
};


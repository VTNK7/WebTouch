const ws = new WebSocket('ws://localhost:8080');
console.log('Client started on port 8080');


const messagesDiv = document.getElementById('messages');
const screen = document.getElementById('screen');
const sendButton = document.getElementById('sendButton');
const textArea = document.getElementById("textArea")
const addMessageBtn = document.getElementById("add-message-btn");
const messageList = document.getElementById("message-list");
const screenShow = document.getElementById("screenShow");

var htmlText;
sendButton.addEventListener('click', sendHTMLText);
textArea.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Empêche la création d'une nouvelle ligne
    sendHTMLText(); // Appelle la fonction qui envoie le texte
  }
})

ws.onmessage = function (event) {
  console.log('received from dofus : %s', event.data);
  const newMessage = document.createElement("li");
  newMessage.classList.add("message");
  dataJson = JSON.parse(event.data);
  newMessage.textContent = dataJson._messageType;

  messageList.insertBefore(newMessage, messageList.firstChild);
  newMessage.addEventListener("click", () => {
    // Changement du texte du div en fonction du contenu du message
    const highlightedJSON = Prism.highlight(event.data, Prism.languages.json, 'json');
    screenShow.innerHTML = (highlightedJSON);
  });
  
};


ws.onerror = console.error;

ws.onopen = function () {
};

function sendHTMLText() {
  htmlText = textArea.value;
  console.log("send to dofus : " + htmlText);
  ws.send(JSON.stringify(htmlText));
} 


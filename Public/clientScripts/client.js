//client side runs this script

var socket = io();

var messages = document.getElementById("messages");
var form = document.getElementById("form");
var input = document.getElementById("input");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    socket.emit("login", socket.id);
    input.value = "";
  }
});

socket.on("user joined", function (username) {
  if (username) {
    var item = document.createElement("li");
    item.textContent = "Welcome " + username + " to the chat!";
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  }
});



socket.on("chat message", function (msg) {
  var item = document.createElement("li");
  item.textContent = msg.username+": "+ msg.message;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

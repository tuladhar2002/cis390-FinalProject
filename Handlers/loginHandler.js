const generateRoomId = require("../utils/roomIdGenerator");

// render login page
function renderLogin(req, res) {
  res.render(__dirname + "/../views/login.ejs");
}

//handle client login
async function handleLogin(req, res, roomIds, currentRoomId) {
  const username = req.body.username;

// check user passed in roomId validity
  if (req.body.roomId) {
    const requestRoomId = req.body.roomId;
    if (roomIds.includes(requestRoomId)) {
      currentRoomId = requestRoomId;
      req.session.username = username;
      res.render(__dirname + "/../views/chatBody.ejs", {
        roomId: currentRoomId,
      });
    } else { // render error -> non valid room ID
      res.render(__dirname + "/../views/login.ejs", {
        failure: "The provided room Id does not exists. Try a valid one!",
      });
    }
  } else { 
    // Generate ID and enter room
    currentRoomId = generateRoomId();
    console.log(currentRoomId);
    roomIds.push(currentRoomId);
    req.session.username = username;

    res.render(__dirname + "/../views/chatBody.ejs", {
      roomId: currentRoomId,
    });
  }
  //return updated current room 
  return currentRoomId;
}

module.exports = {
  renderLogin,
  handleLogin,
};

// Array to store generated room IDs
let generatedRoomIds = [];

// Function to generate a random room ID
function generateRoomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Letters to choose from
  const length = 5; // Length 
  
  let roomId = '';

  // Generate room ID until a unique one is found
  do {
    roomId = ''; // Reset roomId
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      roomId += characters[randomIndex];
    }
  } while (generatedRoomIds.includes(roomId)); // Check if roomId is already generated

  // Add generated room ID to the list
  generatedRoomIds.push(roomId);

  return roomId;
}

// Export the generateRoomId function
module.exports = generateRoomId;

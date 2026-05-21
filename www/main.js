// --- 1. GAME DATA ---
// A list of 60 possible icons we can use for the cards
const allAvailableIcons = [
  "amazon", "android", "apple", "artstation", "behance", "bluesky", "bluetooth",
  "chrome", "discord", "dribbble", "edge", "facebook", "facebook-messenger",
  "firefox-browser", "github", "google", "google-play", "instagram", "linkedin",
  "opera", "pinterest", "reddit-alien", "skype", "spotify", "snapchat", "steam",
  "telegram", "tiktok", "threads", "whatsapp", "windows", "twitter", "xbox",
  "youtube", "airbnb", "app-store-ios", "angular", "bitcoin", "brave-reverse",
  "css3-alt", "css", "duolingo", "edge-legacy", "docker", "evernote", "flipboard",
  "freebsd", "git-alt", "google-drive", "internet-explorer", "js", "nfc-symbol",
  "mendeley", "node-js", "odnoklassniki", "paypal", "playstation", "python",
  "quora", "ubuntu"
];

// --- 2. GETTING HTML ELEMENTS ---
// We "grab" the parts of the webpage we need to change using JavaScript
const overlayScreen = document.querySelector(".overlay-screen");
const gameBoard = document.querySelector(".game-board");
const wrongAttemptsDisplay = document.querySelector(".wrong-attempts span");
const timeDisplay = document.querySelector(".time-left-display");
const playerNameDisplay = document.querySelector(".player-name span");
const mainMessageText = document.querySelector(".game-over-text");
const difficultyButtons = document.querySelectorAll(".level-button");
const startGameButton = document.querySelector(".start-game-button");
const leaderboardTableBody = document.getElementById("leaderboard-data");

// Getting our sound effects
const successSound = document.getElementById("success-sound");
const failSound = document.getElementById("fail-sound");
const backgroundMusic = document.getElementById("background-music");


// --- 3. GAME SETTINGS (Variables that change) ---
let totalCardsToPlay = 40;       // Default is normal mode (40 cards)
let startingTime = 240;          // Default is normal mode (240 seconds / 4 mins)
let currentTimeLeft = 240;       // The actual timer that counts down
let countdownTimerInterval;      // This will hold our ticking clock
let wrongAttemptsCounter = 0;    // How many mistakes the player made
let allCardsArray = [];          // Will hold the HTML elements of the cards we create


// --- 4. SETTING UP THE GAME ---
// This code runs as soon as the page loads
function initializeApp() {
  
  // Show the leaderboard right away
  updateLeaderboard(); 
  
  // Add clicking logic to the difficulty buttons
  difficultyButtons.forEach(button => {
    button.addEventListener("click", function(event) {
      
      // Remove the highlight from all buttons
      difficultyButtons.forEach(btn => btn.classList.remove("active"));
      
      // Add the highlight to the button we just clicked
      event.target.classList.add("active");
      
      // Update our game settings based on what button was clicked
      // We read the "data-cards" and "data-time" attributes from the HTML button
      totalCardsToPlay = parseInt(event.target.dataset.cards);
      startingTime = parseInt(event.target.dataset.time);
    });
  });

  // When the big "Start Game" button is clicked, run the startGame function
  startGameButton.addEventListener("click", startGame);

  // Instead of adding a click event to 60 different cards, we add ONE event to the game board.
  // This is a cleaner, faster coding technique called "Event Delegation".
  gameBoard.addEventListener("click", function(event) {
    // Check if the thing we clicked was inside a "card"
    const clickedCard = event.target.closest('.card');
    
    // If we clicked a card, run the flip function
    if (clickedCard) {
      flipCard(clickedCard);
    }
  });
}


// --- 5. STARTING THE GAME ---
function startGame() {
  // Ask the player for their name
  const enteredName = prompt("What Is Your Name?");
  
  // If they cancel or leave it blank, call them "Unknown"
  if (enteredName === null || enteredName.trim() === "") {
    playerNameDisplay.textContent = "Unknown";
  } else {
    playerNameDisplay.textContent = enteredName;
  }

  // Reset timers, scores, and prepare the screen
  resetGameBoard();
  
  // Build the cards and put them on the screen
  createCards();
  
  // Play the background music softly
  backgroundMusic.volume = 0.1;
  backgroundMusic.currentTime = 0; // Start song from the beginning
  backgroundMusic.play();

  // Start the ticking clock (Runs the countdownFunction once every 1000 milliseconds / 1 second)
  countdownTimerInterval = setInterval(countdownFunction, 1000);
}


// --- 6. PREPARING THE BOARD ---
function resetGameBoard() {
  // Stop any old timers that might be running
  clearInterval(countdownTimerInterval);
  
  // Reset variables back to their starting points
  currentTimeLeft = startingTime;
  wrongAttemptsCounter = 0;
  
  // Update the HTML text on the screen
  wrongAttemptsDisplay.textContent = "0";
  timeDisplay.textContent = formatTime(currentTimeLeft); // e.g., turns 120 into "2:00"
  
  // Hide the big blue overlay screen so we can see the game
  overlayScreen.style.display = "none";
  mainMessageText.style.display = "none";
  
  // Unlock the board so we can click
  gameBoard.classList.remove("disable-clicks");
}


// --- 7. CREATING AND SHUFFLING THE CARDS ---
function createCards() {
  // Empty out any old cards from the HTML
  gameBoard.innerHTML = '';
  
  // Set the CSS grid layout based on difficulty (e.g., 'grid-20', 'grid-40')
  gameBoard.className = `game-board grid-${totalCardsToPlay}`;
  
  // Calculate how many unique pairs we need. (e.g., 40 cards means 20 unique icons)
  const numberOfPairs = totalCardsToPlay / 2;
  
  // 1. Shuffle the ENTIRE master list of icons first
  const shuffledMasterList = [...allAvailableIcons].sort(() => 0.5 - Math.random());
  
  // 2. Now take the required amount of icons from the newly SHUFFLED list
  const selectedIcons = shuffledMasterList.slice(0, numberOfPairs);
  
  // Duplicate the list so we have exactly two of each icon to make matching pairs
  const pairedIconsList = [...selectedIcons, ...selectedIcons]; 
  
  // Shuffle the list randomly
  pairedIconsList.sort(() => 0.5 - Math.random()); 

  // We use a DocumentFragment to build all the HTML in memory first.
  // This is much faster than adding them to the page one by one.
  const memoryContainer = document.createDocumentFragment();

  // Loop through our shuffled list and create HTML for each card
  pairedIconsList.forEach(iconName => {
    
    // Create the main card container div
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    
    // Save the name of the icon in the HTML so we can check it later
    cardElement.dataset.brand = iconName;
    
    // Generate a unique color for the icon. 
    // We use math on the letters of the icon's name so that matching pairs always get the exact same color.
    const uniqueColorNumber = (iconName.charCodeAt(0) * 15 + iconName.length * 20) % 360;
    const iconColor = `hsl(${uniqueColorNumber}, 80%, 65%)`;

    // Put the Front and Back faces inside the card
    cardElement.innerHTML = `
      <div class="card-face front-side"></div>
      <div class="card-face back-side">
        <i class="fa-brands fa-${iconName}" style="color: ${iconColor}"></i>
      </div>
    `;
    
    // Add this finished card to our memory container
    memoryContainer.appendChild(cardElement);
  });

  // Finally, put all the built cards onto the actual webpage
  gameBoard.appendChild(memoryContainer);
  
  // Save a list of all these card elements into our array so we can search them later
  allCardsArray = Array.from(gameBoard.children);
}


// --- 8. GAMEPLAY: FLIPPING CARDS ---
function flipCard(selectedCard) {
  // RULE: If the card is already flipped over, or already matched, do nothing.
  if (selectedCard.classList.contains("is-flipped") || selectedCard.classList.contains("is-matched")) {
    return;
  }

  // Flip the card over by adding the CSS class
  selectedCard.classList.add("is-flipped");

  // Look through all cards on the board and find ones that are currently flipped
  const currentlyFlippedCards = allCardsArray.filter(card => card.classList.contains("is-flipped"));

  // If two cards are currently flipped, it's time to check if they match
  if (currentlyFlippedCards.length === 2) {
    
    // Immediately stop the user from clicking a 3rd card
    temporarilyLockBoard();
    
    // Check if the two cards are a match
    checkIfCardsMatch(currentlyFlippedCards[0], currentlyFlippedCards[1]);
  }
}

function temporarilyLockBoard() {
  // Add a CSS class that disables mouse clicks
  gameBoard.classList.add("disable-clicks");
  
  // Wait 1 second (1000 milliseconds), then allow clicks again
  setTimeout(() => {
    gameBoard.classList.remove("disable-clicks");
  }, 1000);
}


// --- 9. GAMEPLAY: CHECKING MATCHES ---
function checkIfCardsMatch(firstCard, secondCard) {
  
  // Check the data attribute we set earlier. Are the icon names the same?
  if (firstCard.dataset.brand === secondCard.dataset.brand) {
    
    // IT'S A MATCH!
    
    // Change their class from "is-flipped" to "is-matched" so they stay face up permanently
    firstCard.classList.replace("is-flipped", "is-matched");
    secondCard.classList.replace("is-flipped", "is-matched");

    // Play the happy sound
    playSound(successSound);
    
    // Check if the player has uncovered every single card
    checkWinCondition();
    
  } else {
    
    // NOT A MATCH!
    
    // Add a mistake to the counter and update the screen
    wrongAttemptsCounter++;
    wrongAttemptsDisplay.textContent = wrongAttemptsCounter;

    // Wait 1 second so the player can see they got it wrong, then flip them back face down
    setTimeout(() => {
      firstCard.classList.remove("is-flipped");
      secondCard.classList.remove("is-flipped");
      
      // Play the error sound
      playSound(failSound);
    }, 1000);
  }
}


// --- 10. ENDING THE GAME ---
function checkWinCondition() {
  // Count how many cards have the "is-matched" class
  const matchedCards = allCardsArray.filter(card => card.classList.contains("is-matched"));
  
  // If the number of matched cards equals the total number of cards on the board, they won!
  if (matchedCards.length === allCardsArray.length) {
    finishGame("You Win!");
    saveScoreToLeaderboard();
  }
}

function countdownFunction() {
  // Decrease time by 1
  currentTimeLeft--;
  
  // Update the screen clock
  timeDisplay.textContent = formatTime(currentTimeLeft);

  // If time runs out, game over
  if (currentTimeLeft <= 0) {
    finishGame("Game Over");
  }
}

function finishGame(messageToDisplay) {
  // Stop the ticking clock
  clearInterval(countdownTimerInterval);
  
  // Show the big blue overlay screen again
  overlayScreen.style.display = "flex";
  
  // Change the text to either "You Win!" or "Game Over" and make it visible
  mainMessageText.textContent = messageToDisplay;
  mainMessageText.style.display = "block";
  
  // Lock the game board so no more cards can be clicked
  gameBoard.classList.add("disable-clicks");
  
  // Stop the background music
  backgroundMusic.pause();
}


// --- 11. HELPER FUNCTIONS ---

// This turns raw seconds (e.g., 90) into a nice clock format (e.g., "1:30")
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  
  // If seconds is less than 10, add a "0" in front of it so it looks like "1:05" not "1:5"
  if (remainingSeconds < 10) {
    return minutes + ":0" + remainingSeconds;
  } else {
    return minutes + ":" + remainingSeconds;
  }
}

// A simple function to play an audio element from the start
function playSound(audioElement) {
  audioElement.currentTime = 0;
  audioElement.play();
}


// --- 12. LEADERBOARD SYSTEM ---
function saveScoreToLeaderboard() {
  
  // Calculate how long it took the player to win
  const timeTakenInSeconds = startingTime - currentTimeLeft;
  
  // Create an object to hold this game's result
  const playerResult = {
    name: playerNameDisplay.textContent,
    time: formatTime(timeTakenInSeconds), 
    tries: wrongAttemptsCounter,
  };

  // Get the old leaderboard from the browser's local storage. 
  // If it doesn't exist yet, start an empty array [].
  const savedHistory = JSON.parse(localStorage.getItem("memoryGameLeaderboard")) || [];
  
  // Add our new result to the list
  savedHistory.push(playerResult);
  
  // Save the newly updated list back into the browser's local storage so it's there next time
  localStorage.setItem("memoryGameLeaderboard", JSON.stringify(savedHistory));
  
  // Refresh the table on the screen
  updateLeaderboard();
}

function updateLeaderboard() {
  // Get the data from local storage
  const savedHistory = JSON.parse(localStorage.getItem("memoryGameLeaderboard")) || [];
  
  // Sort the list so the person with the LOWEST amount of wrong tries is at the top
  savedHistory.sort((a, b) => a.tries - b.tries); 

  // Empty the current table body
  leaderboardTableBody.innerHTML = "";

  // Loop through the top 5 scores (slice gets the first 5 items)
  const topFiveScores = savedHistory.slice(0, 5);
  
  topFiveScores.forEach((scoreData, index) => {
    
    // Create a new HTML table row
    const rowElement = document.createElement("tr");
    
    // Fill the row with data (Index + 1 is the Rank number)
    rowElement.innerHTML = `
      <td>${index + 1}</td>
      <td>${scoreData.name}</td>
      <td>${scoreData.time}</td>
      <td>${scoreData.tries}</td>
    `;
    
    // Add the row to the table
    leaderboardTableBody.appendChild(rowElement);
  });
}

// --- RUN THE APP ---
// Finally, call our setup function to make everything start working!
initializeApp();
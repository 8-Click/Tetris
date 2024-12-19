const pixelSize = 30;
let fieldStartWidth;
let fieldStartHeight;
let fallSpeed = 1; // Speed in grid cells per second
let lastFallTime = 0; // Last time a tetrimino fell down
let dasDelay = 16; // Delay for initial move
let dasSpeed = 6; // Speed for regular moves after DAS delay

const pieces = { // Shapes for all tetriminoes
  T: [
    [1, 1, 1],
    [0, 1, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  I: [
    [1, 1, 1, 1]
  ],
  L: [
    [1, 1, 1],
    [1, 0, 0]
  ],
  J: [
    [1, 1, 1],
    [0, 0, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ]
};

let piecesOnBoard = []; // Array for all pieces on the board
let currentPiece = null; // Current piece being controlled
let dasTimer = 0; // Timer for DAS delay
let direction = 0; // Direction to move (1 for right, -1 for left)

function setup() {
  createCanvas(displayWidth, displayHeight);
  fieldStartWidth = displayWidth / 3;
  fieldStartHeight = displayHeight / 10;
  spawnPiece(); // Spawn a random piece when the page loads
  lastFallTime = millis(); // Calculate the last fall time
}

function draw() {
  background(0);
  drawField();
  drawAllPieces();
  handleGravity();
  handleDAS();
} // test

function drawField() {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 20; j++) {
      stroke(255);
      noFill();
      rect(fieldStartWidth + pixelSize * i, fieldStartHeight + pixelSize * j, pixelSize, pixelSize);
    }
  }
}

function drawPiece(piece, xOffset, yOffset) {
  for (let row = 0; row < piece.length; row++) {
    for (let col = 0; col < piece[row].length; col++) {
      if (piece[row][col] === 1) {
        fill(0, 255, 0);
        stroke(255);
        rect(fieldStartWidth + (xOffset + col) * pixelSize, fieldStartHeight + (yOffset + row) * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

function drawAllPieces() {
  for (let i = 0; i < piecesOnBoard.length; i++) {
    const p = piecesOnBoard[i];
    drawPiece(p.piece, p.x, p.y);
  }
}

function spawnPiece() {
  const pieceNames = Object.keys(pieces); // Pull all pieces
  const randomIndex = Math.floor(Math.random() * pieceNames.length); // Randomizer
  const pieceName = pieceNames[randomIndex]; // Chooses a random tetrimino
  const newPiece = {
    piece: pieces[pieceName],
    x: 4, // Spawn point of the new piece
    y: 0  // Spawn point of the new piece
  };

  if (pieceName === "I") {
    newPiece.x -= 1; // Because the line piece is 4 long, it needs to be moved one column to the right
  }

  currentPiece = newPiece; // Keeps track of the current piece
  piecesOnBoard.push(newPiece); // Adds the piece to the board
}

function handleGravity() {
  const currentTime = millis();
  const timeDelta = (currentTime - lastFallTime) / 1000;

  if (timeDelta >= 1 / fallSpeed) {
    movePieceDown();
    lastFallTime = currentTime; // Update the last fall time
  }
}

function movePieceDown() {
  if (currentPiece) {
    currentPiece.y++; // Let the tetrimino fall down

    // Checks for collisions or if it hits the bottom
    if (checkCollision(currentPiece)) {
      currentPiece.y--; // Stops it at the bottom if it hits
      currentPiece = null; // Stops tracking the piece
      spawnPiece(); // Spawns a new piece
    }
  }
}

function checkCollision(piece) {
  const { x, y } = piece;
  for (let row = 0; row < piece.piece.length; row++) {
    for (let col = 0; col < piece.piece[row].length; col++) {
      if (piece.piece[row][col] === 1) {
        const newY = y + row;
        const newX = x + col;

        // Check bounds
        if (newY >= 20 || newX < 0 || newX >= 10) {
          return true;
        }

        // Check other pieces
        for (let i = 0; i < piecesOnBoard.length; i++) {
          const p = piecesOnBoard[i];
          if (p !== piece) {
            for (let pr = 0; pr < p.piece.length; pr++) {
              for (let pc = 0; pc < p.piece[pr].length; pc++) {
                if (
                  p.piece[pr][pc] === 1 &&
                  p.x + pc === newX &&
                  p.y + pr === newY
                ) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
  }
  return false;
}

function handleDAS() {
  if (keyIsDown(65)) { // 'A' for left movement
    dasTimer++;
    if (dasTimer < dasDelay) {
      direction = -1; // Move left immediately
    } else {
      direction = -1;
    }
  } else if (keyIsDown(68)) { // 'D' for right movement
    dasTimer++;
    if (dasTimer < dasDelay) {
      direction = 1; // Move right immediately
    } else {
      direction = 1;
    }
  } else {
    dasTimer = 0; // Reset DAS timer if no key is held down
    direction = 0;
  }

  if (currentPiece && direction !== 0) {
    currentPiece.x += direction; // Move piece left or right
    if (checkCollision(currentPiece)) {
      currentPiece.x -= direction; // Undo the move if there's a collision
    }
  }
}

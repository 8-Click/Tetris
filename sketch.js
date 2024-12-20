const pixelSize = 30;
let fieldStartWidth;
let fieldStartHeight;
let fallSpeed = 1; // Speed in grid cells per second
let lastFallTime = 0; // Last time a tetrimino fell down
let dasDelay = 16; // Delay for initial move
let dasSpeed = 6; // Speed for regular moves after DAS delay
let wiggleRoom = 6; // Frames before transitioning to the next piece
let wiggleTimer = 0; // Timer for wiggle room

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
let dasRepeatTimer = 0; // Timer for DAS repeat speed
let direction = 0; // Direction to move (1 for right, -1 for left)
let softDropTimer = 0; // Timer for soft drop speed
let softDropActive = false; // Flag for active soft drop

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
  handleSoftDrop();
}

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
  softDropActive = false; // Reset soft drop flag
  wiggleTimer = 0; // Reset wiggle timer
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

      // Allow wiggle room before locking the piece
      if (wiggleTimer >= wiggleRoom) {
        currentPiece = null; // Stops tracking the piece
        spawnPiece(); // Spawns a new piece
      } else {
        wiggleTimer++; // Increment wiggle timer
      }
    } else {
      wiggleTimer = 0; // Reset wiggle timer if the piece moves
    }
  }
}

function checkCollision(piece) {
  if (!piece || !piece.piece) return true; // If the piece is invalid, assume collision
  const { x, y } = piece;
  for (let row = 0; row < piece.piece.length; row++) {
    const rowArray = piece.piece[row];
    if (!rowArray) continue; // Skip undefined rows
    for (let col = 0; col < rowArray.length; col++) {
      if (rowArray[col] === 1) {
        const newY = y + row;
        const newX = x + col;

        // Check bounds
        if (newY >= 20 || newX < 0 || newX >= 10) {
          return true;
        }

        // Check other pieces
        for (let i = 0; i < piecesOnBoard.length; i++) {
          const p = piecesOnBoard[i];
          if (p !== piece && p.piece) {
            for (let pr = 0; pr < p.piece.length; pr++) {
              const pieceRow = p.piece[pr];
              if (!pieceRow) continue; // Skip undefined rows
              for (let pc = 0; pc < pieceRow.length; pc++) {
                if (
                  pieceRow[pc] === 1 &&
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
    if (dasTimer === 0) {
      // Initial move
      moveCurrentPiece(-1);
      dasTimer++;
    } else if (dasTimer >= dasDelay) {
      dasRepeatTimer++;
      if (dasRepeatTimer >= dasSpeed) {
        moveCurrentPiece(-1);
        dasRepeatTimer = 0; // Reset DAS repeat timer
      }
    } else {
      dasTimer++;
    }
  } else if (keyIsDown(68)) { // 'D' for right movement
    if (dasTimer === 0) {
      // Initial move
      moveCurrentPiece(1);
      dasTimer++;
    } else if (dasTimer >= dasDelay) {
      dasRepeatTimer++;
      if (dasRepeatTimer >= dasSpeed) {
        moveCurrentPiece(1);
        dasRepeatTimer = 0; // Reset DAS repeat timer
      }
    } else {
      dasTimer++;
    }
  } else {
    dasTimer = 0; // Reset DAS timer if no key is held down
    dasRepeatTimer = 0; // Reset repeat timer as well
    direction = 0;
  }
}

function handleSoftDrop() {
  if (keyIsDown(83)) { // 'S' for soft drop
    softDropTimer++;
    softDropActive = true; // Activate soft drop
    if (softDropTimer >= 2) { // Drop every 2 frames
      movePieceDown();
      softDropTimer = 0;
    }
  } else {
    softDropTimer = 0; // Reset soft drop timer if key is released
    softDropActive = false; // Deactivate soft drop
  }
}

function moveCurrentPiece(dx) {
  if (currentPiece) {
    currentPiece.x += dx;
    if (checkCollision(currentPiece)) {
      currentPiece.x -= dx; // Undo the move if there's a collision
    }
  }
}

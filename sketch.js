const pixelSize = 30;
let fieldStartWidth, fieldStartHeight;

// Speed control
let frameCount = 0;
let dasDelay = 16;
let dasSpeed = 6;
let canRotate = true;  // Limit rotation to once per keypress

// Tetriminos
const pieces = {
  T: [
    [
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
  O: [
    [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
  I: [
    [
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0]
    ]
  ],
  L: [
    [
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
  J: [
    [
      [1, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0]
    ],
    [
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  ],
  S: [
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0]
    ]
  ],
  Z: [
    [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0]
    ],
    [
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0]
    ]
  ]
};

let piecesOnBoard = [];
let currentPiece = null;
let currentPieceName = null;
let dasTimer = 0;
let dasRepeatTimer = 0;
let softDropTimer = 0;
let lockDelay = 3;
let lockTimer = 0;

function setup() {
  createCanvas(displayWidth, displayHeight);
  fieldStartWidth = displayWidth / 3;
  fieldStartHeight = displayHeight / 10;
  spawnPiece();
}

function draw() {
  background(0);
  drawField();
  drawAllPieces();
  handleGravity();
  handleDAS();
  handleSoftDrop();
  handleRotation();
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

function spawnPiece() {
  const pieceNames = Object.keys(pieces);
  const pieceName = pieceNames[Math.floor(Math.random() * pieceNames.length)];
  currentPiece = {
    piece: pieces[pieceName][0],
    x: pieceName === "I" ? 3 : 4,
    y: 0
  };
  currentPieceName = pieceName;
  lockTimer = 0;
}

function lockPiece() {
  piecesOnBoard.push({ ...currentPiece });
  currentPiece = null;
  currentPieceName = null;
  spawnPiece();
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
  for (const p of piecesOnBoard) {
    drawPiece(p.piece, p.x, p.y);
  }
  if (currentPiece) {
    drawPiece(currentPiece.piece, currentPiece.x, currentPiece.y);
  }
}

function handleGravity() {
  frameCount++;
  if (frameCount >= 20) {
    movePieceDown();
    frameCount = 0;
  }
}

function movePieceDown() {
  if (currentPiece) {
    currentPiece.y++;
    if (checkCollision(currentPiece)) {
      currentPiece.y--;
      lockTimer++;
      if (lockTimer >= lockDelay) {
        lockPiece();
      }
    } else {
      lockTimer = 0;
    }
  }
}

function checkCollision(piece) {
  const { x, y } = piece;
  for (let row = 0; row < piece.piece.length; row++) {
    for (let col = 0; col < piece.piece[row].length; col++) {
      if (piece.piece[row][col] === 1) {
        const newX = x + col;
        const newY = y + row;
        if (newY >= 20 || newX < 0 || newX >= 10 || piecesOnBoard.some(p => overlaps(p, newX, newY))) {
          return true;
        }
      }
    }
  }
  return false;
}

function overlaps(p, x, y) {
  return p.piece.some((row, pr) => row.some((cell, pc) => cell && p.x + pc === x && p.y + pr === y));
}

function handleDAS() {
  if (currentPiece) {
    if (keyIsDown(65)) moveWithDAS(-1);
    else if (keyIsDown(68)) moveWithDAS(1);
    else resetDAS();
  }
}

function moveWithDAS(dx) {
  if (dasTimer === 0) moveCurrentPiece(dx);
  else if (dasTimer >= dasDelay && dasRepeatTimer >= dasSpeed) {
    moveCurrentPiece(dx);
    dasRepeatTimer = 0;
  }
  dasTimer++;
  dasRepeatTimer++;
}

function resetDAS() {
  dasTimer = 0;
  dasRepeatTimer = 0;
}

function handleSoftDrop() {
  if (keyIsDown(83)) {
    softDropTimer++;
    if (softDropTimer >= 2) {
      movePieceDown();
      softDropTimer = 0;
    }
  } else {
    softDropTimer = 0;
  }
}

function handleRotation() {
  if (canRotate && (keyIsDown(79) || keyIsDown(73))) {
    rotatePiece(keyIsDown(79) ? 1 : -1);
    canRotate = false;
  } else if (!keyIsDown(73) && !keyIsDown(79)) {
    canRotate = true;
  }
}

function moveCurrentPiece(dx) {
  currentPiece.x += dx;
  if (checkCollision(currentPiece)) {
    currentPiece.x -= dx;
  }
}

function rotatePiece(direction) {
  if (!currentPiece || !currentPieceName) return;

  const rotations = pieces[currentPieceName];
  const currentIndex = rotations.findIndex(rot => JSON.stringify(rot) === JSON.stringify(currentPiece.piece));
  const newIndex = (currentIndex + direction + rotations.length) % rotations.length;
  const newPiece = { piece: rotations[newIndex], x: currentPiece.x, y: currentPiece.y };

  if (!checkCollision(newPiece)) {
    currentPiece.piece = newPiece.piece;
    currentPiece.x = newPiece.x;
    currentPiece.y = newPiece.y;
  } else {
    // If collision happens, try adjusting the position towards the right side of the screen
    if (direction === 1) {  // Clockwise rotation
      newPiece.x = Math.min(newPiece.x + 1, 10 - newPiece.piece[0].length);  // Move right if possible
    } else {  // Counter-clockwise rotation
      newPiece.x = Math.max(newPiece.x - 1, 0);  // Move left if possible
    }

    // Try the new position after adjustment
    if (!checkCollision(newPiece)) {
      currentPiece.piece = newPiece.piece;
      currentPiece.x = newPiece.x;
      currentPiece.y = newPiece.y;
    }
  }
}

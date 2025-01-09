const pixelSize = 30;
let fieldStartWidth;
let fieldStartHeight;
let frameCount = 0;
let dasDelay = 16;
let dasSpeed = 6;

const pieces = {
  T: [
    [[0, 1, 0],
     [1, 1, 1]],
    [[1, 0],
     [1, 1],
     [1, 0]],
    [[1, 1, 1],
     [0, 1, 0]],
    [[0, 1],
     [1, 1],
     [0, 1]]
  ],
  O: [
    [[1, 1],
     [1, 1]]
  ],
  I: [
    [[1, 1, 1, 1]],
    [[1],
     [1],
     [1],
     [1]]
  ],
  L: [
    [[1, 0, 0],
     [1, 1, 1]],
    [[1, 1],
     [1, 0],
     [1, 0]],
    [[1, 1, 1],
     [0, 0, 1]],
    [[0, 1],
     [0, 1],
     [1, 1]]
  ],
  J: [
    [[0, 0, 1],
     [1, 1, 1]],
    [[1, 0],
     [1, 0],
     [1, 1]],
    [[1, 1, 1],
     [1, 0, 0]],
    [[1, 1],
     [0, 1],
     [0, 1]]
  ],
  S: [
    [[0, 1, 1],
     [1, 1, 0]],
    [[1, 0],
     [1, 1],
     [0, 1]]
  ],
  Z: [
    [[1, 1, 0],
     [0, 1, 1]],
    [[0, 1],
     [1, 1],
     [1, 0]]
  ]
};

let piecesOnBoard = [];
let currentPiece = null;
let dasTimer = 0;
let dasRepeatTimer = 0;
let softDropTimer = 0;
let softDropActive = false;
let lockDelay = 3;
let lockTimer = 0;
let direction = 0;

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
  if (currentPiece) {
    drawPiece(currentPiece.piece, currentPiece.x, currentPiece.y);
  }
}

function spawnPiece() {
  const pieceNames = Object.keys(pieces);
  const randomIndex = Math.floor(Math.random() * pieceNames.length);
  const pieceName = pieceNames[randomIndex];
  const newPiece = {
    piece: pieces[pieceName][0],
    x: 4,
    y: 0
  };
  if (pieceName === "I") {
    newPiece.x -= 1;
  }
  currentPiece = newPiece;
  softDropActive = false;
  lockTimer = 0;
}

function handleGravity() {
  frameCount++;
  if (frameCount >= 3) {
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

function lockPiece() {
  piecesOnBoard.push({ ...currentPiece });
  currentPiece = null;
  spawnPiece();
}

function checkCollision(piece) {
  if (!piece || !piece.piece) return true;
  const { x, y } = piece;
  for (let row = 0; row < piece.piece.length; row++) {
    const rowArray = piece.piece[row];
    if (!rowArray) continue;
    for (let col = 0; col < rowArray.length; col++) {
      if (rowArray[col] === 1) {
        const newY = y + row;
        const newX = x + col;
        if (newY >= 20 || newX < 0 || newX >= 10) {
          return true;
        }
        for (let i = 0; i < piecesOnBoard.length; i++) {
          const p = piecesOnBoard[i];
          if (p !== piece && p.piece) {
            for (let pr = 0; pr < p.piece.length; pr++) {
              const pieceRow = p.piece[pr];
              if (!pieceRow) continue;
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
  if (currentPiece) {
    if (keyIsDown(65)) {
      if (dasTimer === 0) {
        moveCurrentPiece(-1);
        dasTimer++;
      } else if (dasTimer >= dasDelay) {
        dasRepeatTimer++;
        if (dasRepeatTimer >= dasSpeed) {
          moveCurrentPiece(-1);
          dasRepeatTimer = 0;
        }
      } else {
        dasTimer++;
      }
    } else if (keyIsDown(68)) {
      if (dasTimer === 0) {
        moveCurrentPiece(1);
        dasTimer++;
      } else if (dasTimer >= dasDelay) {
        dasRepeatTimer++;
        if (dasRepeatTimer >= dasSpeed) {
          moveCurrentPiece(1);
          dasRepeatTimer = 0;
        }
      } else {
        dasTimer++;
      }
    } else {
      dasTimer = 0;
      dasRepeatTimer = 0;
    }
  }
}

function handleSoftDrop() {
  if (currentPiece) {
    if (keyIsDown(83)) {
      softDropTimer++;
      softDropActive = true;
      if (softDropTimer >= 2) {
        movePieceDown();
        softDropTimer = 0;
      }
    } else {
      softDropTimer = 0;
      softDropActive = false;
    }
  }
}

function handleRotation() {
  if (keyIsDown(37)) {
    rotatePiece(-1);
  } else if (keyIsDown(39)) {
    rotatePiece(1);
  }
}

function moveCurrentPiece(dx) {
  if (currentPiece) {
    currentPiece.x += dx;
    if (checkCollision(currentPiece)) {
      currentPiece.x -= dx;
    }
  }
}

function rotatePiece(direction) {
  if (currentPiece) {
    const newPiece = {
      piece: rotate(currentPiece.piece, direction),
      x: currentPiece.x,
      y: currentPiece.y
    };
    if (!checkCollision(newPiece)) {
      currentPiece.piece = newPiece.piece;
    }
  }
}

function rotate(piece, direction) {
  const rotations = pieces[getPieceName(piece)];
  const currentRotation = rotations.findIndex(rotation => JSON.stringify(rotation) === JSON.stringify(piece));
  const newRotation = (currentRotation + direction + rotations.length) % rotations.length;
  return rotations[newRotation];
}

function getPieceName(piece) {
  return Object.keys(pieces).find(key => pieces[key].some(rot => JSON.stringify(rot) === JSON.stringify(piece)));
}

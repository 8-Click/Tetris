const pixelSize = 30;
let fieldStartWidth, fieldStartHeight;
let frameCount = 0;
let dasDelay = 16;
let dasSpeed = 6;
let canRotate = true;
const pieces = {
  T: [
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
    ],
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

const pieceColors = {
  T: [255, 255, 255],
  O: [255, 255, 255],
  I: [255, 255, 255],
  L: [128, 128, 64],
  J: [255, 0, 0],
  S: [255, 0, 0],
  Z: [128, 128, 64]
};

let nextPieceName = null; 
let score = 0;
let lineCounter = 0;
let highScore = 0;
let levelCounter = 1;
let gameOver = false;
let restartButton;
let bgImage;

function preload() {
  bgImage = loadImage('https://t3.ftcdn.net/jpg/10/16/22/36/360_F_1016223626_pvT5bslZ454vp5MThbBkPucGZSVkemVy.jpg');
}

function setup() {
  createCanvas(displayWidth, displayHeight);
  fieldStartWidth = displayWidth / 3;
  fieldStartHeight = displayHeight / 10;
  nextPieceName = getRandomPieceName();
  spawnPiece();
  restartButton = createButton('Try Again');
  restartButton.position(fieldStartWidth + pixelSize * 4, fieldStartHeight + pixelSize * 8);
  restartButton.mousePressed(restartGame);
  restartButton.hide();
}

function draw() {
  background(0);

  image(bgImage, 0, 0, width, height);

  if (gameOver) {
    drawGameOverScreen();
    return;
  }

  drawField();
  drawNextBox();
  drawAllPieces();
  drawScoreBoard();
  drawLineCount();
  drawLevelCounter();
  handleGravity();
  handleDAS();
  handleSoftDrop();
  handleRotation();
}

function drawGameOverScreen() {
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("GAME OVER", displayWidth / 2, displayHeight / 3);
  restartButton.show();
}



function drawField() {
  for (let i = 0; i < 10; i++) for (let j = 0; j < 20; j++) {
    stroke(255); fill(0); rect(fieldStartWidth + pixelSize * i, fieldStartHeight + pixelSize * j, pixelSize, pixelSize);
  }
}

function drawNextBox() {
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    stroke(255); fill(0); rect(fieldStartWidth + pixelSize * 13 + pixelSize * i, fieldStartHeight + pixelSize * 7 + pixelSize * j, pixelSize, pixelSize);
  }
  if (nextPieceName) {
    const nextPiece = pieces[nextPieceName][0], color = pieceColors[nextPieceName] || [255, 255, 255];
    for (let row = 0; row < nextPiece.length; row++) for (let col = 0; col < nextPiece[row].length; col++) {
      if (nextPiece[row][col] === 1) {
        fill(color[0], color[1], color[2]); stroke(255);
        rect(fieldStartWidth + pixelSize * 13 + pixelSize * col, fieldStartHeight + pixelSize * 7 + pixelSize * row, pixelSize, pixelSize);
      }
    }
  }
}

function drawLineCount() {
  fill(0); stroke(255); rect(fieldStartWidth, fieldStartHeight - pixelSize * 2, pixelSize * 10, pixelSize * 2);
  fill(255); textSize(30); textAlign(CENTER, CENTER); text(`LINES: ${lineCounter}`, fieldStartWidth + pixelSize * 5, fieldStartHeight - pixelSize);
}

function drawScoreBoard() {
  fill(0); stroke(255); rect(fieldStartWidth + pixelSize * 12, fieldStartHeight, pixelSize * 6, pixelSize * 4);
  fill(255); textSize(20); textAlign(CENTER, CENTER);
  text(`TOP: ${highScore}`, fieldStartWidth + pixelSize * 15, fieldStartHeight + pixelSize);
  text(`SCORE: ${score}`, fieldStartWidth + pixelSize * 15, fieldStartHeight + pixelSize * 3);
}

function drawLevelCounter() {
  fill(0); stroke(255); rect(fieldStartWidth + pixelSize * 12, fieldStartHeight + pixelSize * 12, pixelSize * 6, pixelSize * 2);
  fill(255); textSize(25); textAlign(CENTER, CENTER); text(`LEVEL: ${levelCounter}`, fieldStartWidth + pixelSize * 15, fieldStartHeight + pixelSize * 13);
}

function spawnPiece() {
  currentPiece = { piece: pieces[nextPieceName][0].map(row => row.slice()), x: nextPieceName === "I" ? 3 : 4, y: 0 };
  currentPiece.type = nextPieceName;
  currentPieceName = nextPieceName;
  nextPieceName = getRandomPieceName();
  lockTimer = 0;
  softDropTimer = 0;
}


function getRandomPieceName() {
  const pieceNames = Object.keys(pieces);
  return pieceNames[Math.floor(Math.random() * pieceNames.length)];
}

function clonePiece(pieceObject) {
  return {
    piece: pieceObject.piece.map(row => row.slice()),
    x: pieceObject.x,
    y: pieceObject.y
  };
}

function lockPiece() {
  piecesOnBoard.push({ ...clonePiece(currentPiece), color: pieceColors[currentPiece.type] || [255, 255, 255] });
  clearFullLines();
  currentPiece = null;
  currentPieceName = null;
  spawnPiece();
  lockDelay = Math.max(2, 3 - Math.floor(levelCounter / 5));
}


function drawPiece(piece, xOffset, yOffset, pieceType, color) {
  const isWhite = color[0] === 255 && color[1] === 255 && color[2] === 255;
  for (let row = 0; row < piece.length; row++) {
    for (let col = 0; col < piece[row].length; col++) {
      if (piece[row][col] === 1) {
        fill(color[0], color[1], color[2]);
        stroke(isWhite ? 'black' : 'white');
        rect(fieldStartWidth + (xOffset + col) * pixelSize, fieldStartHeight + (yOffset + row) * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}



function drawAllPieces() {
  for (const p of piecesOnBoard) drawPiece(p.piece, p.x, p.y, p.type, p.color);
  if (currentPiece) drawPiece(currentPiece.piece, currentPiece.x, currentPiece.y, currentPieceName, pieceColors[currentPieceName]);
}


function handleGravity() {
  if (gameOver) return;
  frameCount++;
  const fallSpeed = getFallSpeed(levelCounter);
  if (frameCount >= fallSpeed) { movePieceDown(); frameCount = 0; }
}


function movePieceDown() {
  if (currentPiece) {
    currentPiece.y++;
    if (checkCollision(currentPiece)) {
      currentPiece.y--;
      lockPiece();
    }
  }
  if (currentPiece && currentPiece.y === 0 && checkCollision(currentPiece)) gameOver = true;
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
    if (keyIsDown(65) || keyIsDown(37)) moveWithDAS(-1);
    else if (keyIsDown(68) || keyIsDown(39)) moveWithDAS(1);
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
  if (keyIsDown(83) || keyIsDown(40)) {
    softDropTimer++;
    if (softDropTimer >= 2) {
      movePieceDown();
      softDropTimer = 0;
    }
  } else {
    softDropTimer = 0;
  }
}

function getFallSpeed(level) {
  const baseSpeed = 60;
  const speedDecreasePerLevel = 4;
  const newSpeed = Math.max(3, baseSpeed - (level - 1) * speedDecreasePerLevel);
  return newSpeed;
}



function handleRotation() {
  if (canRotate) {
    if (keyIsDown(79) || keyIsDown(38)) {
      rotatePiece(1);
      canRotate = false;
    } else if (keyIsDown(73)) {
      rotatePiece(-1);
      canRotate = false;
    }
  } else if (!keyIsDown(73) && !keyIsDown(79) && !keyIsDown(38)) {
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
  const newPiece = { piece: rotations[newIndex].map(row => row.slice()), x: currentPiece.x, y: currentPiece.y };
  if (!checkCollision(newPiece)) {
    currentPiece.piece = newPiece.piece;
    currentPiece.x = newPiece.x;
    currentPiece.y = newPiece.y;
  } else {
    if (direction === 1) newPiece.x = Math.min(newPiece.x + 1, 10 - newPiece.piece[0].length);
    else newPiece.x = Math.max(newPiece.x - 1, 0);
    if (!checkCollision(newPiece)) {
      currentPiece.piece = newPiece.piece;
      currentPiece.x = newPiece.x;
      currentPiece.y = newPiece.y;
    }
  }
}

function clearFullLines() {
  let linesCleared = 0;

  for (let y = 19; y >= 0; y--) {
    if (isLineFull(y)) {
      clearLine(y);
      linesCleared++;
      y++;
    }
  }

  lineCounter += linesCleared;

  if (linesCleared > 0) {
    score += calculateScore(linesCleared);
    if (score > highScore) {
      highScore = score; 
    }
  }

  levelCounter = Math.floor(lineCounter / 10) + 1;
}

function calculateScore(linesCleared) {
  switch (linesCleared) {
    case 1:
      return 40 * (levelCounter + 1);
    case 2:
      return 100 * (levelCounter + 1);
    case 3:
      return 300 * (levelCounter + 1);
    case 4:
      return 1200 * (levelCounter + 1);
    default:
      return 0;
  }
}

function isLineFull(y) {
  for (let x = 0; x < 10; x++) {
    if (!piecesOnBoard.some(p => isCellOccupied(p, x, y))) {
      return false;
    }
  }
  return true;
}

function isCellOccupied(p, x, y) {
  return p.piece.some((row, pr) => row.some((cell, pc) => cell && p.x + pc === x && p.y + pr === y));
}

function clearLine(y) {
  piecesOnBoard.forEach(piece => {
    const rowsToClear = [];
    for (let pr = 0; pr < piece.piece.length; pr++) {
      const globalRow = piece.y + pr;
      if (globalRow === y) {
        piece.piece[pr] = [0, 0, 0, 0];
        rowsToClear.push(pr);
      }
    }
    rowsToClear.sort((a, b) => b - a);
    rowsToClear.forEach(pr => {
      for (let i = pr; i > 0; i--) {
        piece.piece[i] = [...piece.piece[i - 1]];
      }
      piece.piece[0] = [0, 0, 0, 0];
    });
  });
  piecesOnBoard.forEach(piece => {
    if (piece.y + piece.piece.length - 1 < y) {
      piece.y++;
    }
  });
  piecesOnBoard = piecesOnBoard.filter(piece => piece.piece.some(row => row.some(cell => cell !== 0)));
}

function restartGame() {
  gameOver = false;
  piecesOnBoard = [];
  score = 0;
  lineCounter = 0;
  levelCounter = 1;
  spawnPiece();
  nextPieceName = getRandomPieceName();
  restartButton.hide();
}
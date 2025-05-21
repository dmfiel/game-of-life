'use strict';
let cellsSave = [];
let cellsNew = [];
let cellsCRC = [];
let maxCRC = 8;
let stable = false;
let startTime, generations;
let speed = 10;
let gridSize = 50;
let resetPending = false;
let crcTable;

const startButton = document.getElementById('start');
const clearButton = document.getElementById('clear');
const randomButton = document.getElementById('random');
const setupButton = document.getElementById('setup');
const speedInput = document.getElementById('speed');
const gridSizeInput = document.getElementById('gridSize');
const optionBlock = document.querySelector('.optionblock');

const getWrap = () => document.getElementById('wrap').checked;
const getAuto = () => document.getElementById('auto').checked;

const isAlive = (cell, neighbors) =>
  neighbors === 3 || (Boolean(cell) && neighbors === 2) ? 1 : 0;

const generate = () => {
  cellsSave = new Array(gridSize * gridSize).fill(0);
};

const regenerate = () => {
  cellsNew = cellsSave.map((cell, i) =>
    isAlive(cell, countNeighbors(cellsSave, i))
  );
  updateLive();
  cellsSave = cellsNew;

  let newCRC = crc32(cellsNew);
  stable = cellsCRC.indexOf(newCRC) > -1;
  if (cellsCRC.push(newCRC) > maxCRC) cellsCRC.shift();

  if (!resetPending && getAuto()) {
    if (stable) {
      resetPending = true;
      setTimeout(() => {
        random();
      }, 500);
    }
  }
  generations++;
  // console.log((Date.now() - startTime) / generations);
};

const makeCRCTable = function () {
  let c;
  let crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
};

const crc32 = function (cells) {
  let crc = 0 ^ -1;

  for (let i = 0; i < cells.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ cells[i]) & 0xff];
  }

  return (crc ^ -1) >>> 0;
};

// const cellsEqual = (cells1, cells2) =>
//   cells1.length === cells2.length &&
//   cells1.every((val, index) => val === cells2[index]);

const countNeighbors = (cells, cell) =>
  getWrap()
    ? countNeighborsWrap(cells, cell)
    : countNeighborsNoWrap(cells, cell);

const countCellWrap = (cells, gridSize, row, col) => {
  row = (row + gridSize) % gridSize;
  col = (col + gridSize) % gridSize;
  return cells[row * gridSize + col];
};

const countNeighborsWrap = (cells, cell) => {
  let count = 0;
  const row = Math.floor(cell / gridSize);
  const col = cell % gridSize;

  count += countCellWrap(cells, gridSize, row - 1, col - 1);
  count += countCellWrap(cells, gridSize, row - 1, col);
  count += countCellWrap(cells, gridSize, row - 1, col + 1);
  count += countCellWrap(cells, gridSize, row, col - 1);
  count += countCellWrap(cells, gridSize, row, col + 1);
  count += countCellWrap(cells, gridSize, row + 1, col - 1);
  count += countCellWrap(cells, gridSize, row + 1, col);
  count += countCellWrap(cells, gridSize, row + 1, col + 1);

  return count;
};

const countNeighborsNoWrap = (cells, cell) => {
  let count = 0;
  // count cells when not on left edge
  if (cell % gridSize > 0) {
    // count top left cell when not on top edge
    if (cell >= gridSize) count += cells[cell - 1 - gridSize];
    //count the left cell
    count += cells[cell - 1];
    // count bottom left cell when not on bottom edge
    if (cell < gridSize * (gridSize - 1)) count += cells[cell - 1 + gridSize];
  }

  // count the middle cells
  // count top cell when not on top edge
  if (cell >= gridSize) count += cells[cell - gridSize];
  // count bottom cell when not on bottom edge
  if (cell < gridSize * (gridSize - 1)) count += cells[cell + gridSize];

  // count cells when not on right edge
  if (cell % gridSize < gridSize - 1) {
    // count top right cell when not on top edge
    if (cell >= gridSize) count += cells[cell + 1 - gridSize];
    // count the right cell
    count += cells[cell + 1];
    // count bottom right cell when not on bottom edge
    if (cell < gridSize * (gridSize - 1)) count += cells[cell + 1 + gridSize];
  }
  // console.log(cells, cell, count);
  return count;
};

const createElement = className => {
  const el = document.createElement('div');
  el.className = className;
  return el;
};

const drawGrid = () => {
  const grid = document.getElementById('grid');
  const container = createElement('container');
  let row;
  cellsSave.forEach((cell, i) => {
    if (i % gridSize === 0) {
      row = createElement('row');
      container.appendChild(row);
    }
    const cellEl = createElement(`cell ${cell === 1 ? 'live' : ''}`);
    cellEl.id = new String(i);
    row.appendChild(cellEl);
  });

  grid.innerHTML = '';
  grid.appendChild(container);
};

const updateLive = () => {
  cellsNew.forEach((newCell, i) => {
    if (newCell !== cellsSave[i]) {
      document.getElementById(i).classList.toggle('live');
    }
  });
};

const attachGridEventHandler = () => {
  document.getElementById('grid').addEventListener('click', event => {
    event.target.classList.toggle('live');
    const cell = +event.target.id;
    cellsSave[cell] = 1 - cellsSave[cell];
    // console.log(cellsSave);
  });
};

let timer;

const start = () => {
  if (startButton.textContent === 'Start') {
    startTime = Date.now();
    generations = 0;
    timer = setInterval(() => {
      regenerate();
    }, speed);
    startButton.textContent = 'Stop';
  } else {
    clearInterval(timer);
    startButton.textContent = 'Start';
  }
};

const clear = () => {
  console.log('clear');
  clearInterval(timer);
  startButton.textContent = 'Start';
  generate(70);
  drawGrid();
};

const random = () => {
  resetPending = false;
  //fill grid with 20% live cells
  cellsSave = cellsSave.map(x => (Math.random() < 0.2 ? 1 : 0));
  drawGrid();
};

const getSpeed = () => {
  console.log('getSpeed');
  let rawSpeed = speedInput.value;
  if (!rawSpeed) rawSpeed = 10;
  rawSpeed = Math.floor(Math.abs(rawSpeed));
  if (rawSpeed < 1) rawSpeed = 1;
  if (rawSpeed > 1000) rawSpeed = 1000;
  if (rawSpeed !== speed) {
    speed = rawSpeed;
    start();
    start();
  }
  if (speedInput.value != speed) {
    speedInput.value = speed;
  }
  return speed;
};

const getGridSize = () => {
  console.log('getGridSize');
  let rawSize = gridSizeInput.value;
  if (!rawSize) return;
  rawSize = Math.floor(Math.abs(rawSize));
  if (rawSize < 10) return;
  if (rawSize > 200) rawSize = 200;
  if (rawSize !== gridSize) {
    gridSize = rawSize;
    clear();
    generate();
    drawGrid();
  }
  if (gridSizeInput.value != gridSize) {
    gridSizeInput.value = gridSize;
  }
  return gridSize;
};

const attachStartEventHandler = () => {
  startButton.addEventListener('click', start);
};

const attachClearEventHandler = () => {
  clearButton.addEventListener('click', clear);
};

const attachRandomEventHandler = () => {
  randomButton.addEventListener('click', random);
};

const attachSetupEventHandler = () => {
  setupButton.addEventListener('click', () =>
    optionBlock.classList.toggle('hidden')
  );
};

const attachSpeedEventHandler = () => {
  speedInput.addEventListener('change', getSpeed);
  speedInput.addEventListener('onchange', getSpeed);
  speedInput.addEventListener('input', getSpeed);
  speedInput.addEventListener('onkeydown', getSpeed);
  speedInput.addEventListener('onpaste', getSpeed);
};

const attachSizeEventHandler = () => {
  gridSizeInput.addEventListener('change', getGridSize);
  gridSizeInput.addEventListener('onchange', getGridSize);
  gridSizeInput.addEventListener('input', getGridSize);
  gridSizeInput.addEventListener('onkeydown', getGridSize);
  gridSizeInput.addEventListener('onpaste', getGridSize);
};

const init = () => {
  crcTable = makeCRCTable();
  generate(70);
  drawGrid();
  attachGridEventHandler();
  attachStartEventHandler();
  attachClearEventHandler();
  attachRandomEventHandler();
  attachSetupEventHandler();
  attachSpeedEventHandler();
  attachSizeEventHandler();
};
init();

window.game = {
  isAlive,
  generate,
  regenerate,
  countNeighbors,
  drawGrid,
  attachGridEventHandler,
  start
};

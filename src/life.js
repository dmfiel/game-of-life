'use strict';
const maxSize = 200; // maximum grid size
let gridSize = 50; // grid is square
let cellsSave = new Int8Array(maxSize ** 2); // cell array for the current grid
let cellsNew = new Int8Array(maxSize ** 2); // cell array to show the new state
let cellsCRC = []; // hold CRCs for previous states to check for static patterns
let maxCRC = 8; // how many past generations to watch for repetition
let stable = false; // pattern is stable (or flipping between a few states)
let startTime, generations; // used to compute refresh time
let speed = 10; // pause time in ms between generations
let resetPending = false; // when an automatic reset is triggered, the system continues for a second, so that the refresh isn't as abrupt
let crcTable; // holds some pre-computed data for the CRC32 generation

const buttonStart = document.getElementById('start');
const buttonClear = document.getElementById('clear');
const buttonRandom = document.getElementById('random');
const buttonSetup = document.getElementById('setup');
const inputSpeed = document.getElementById('speed');
const inputGridSize = document.getElementById('gridSize');
const optionBlock = document.querySelector('.optionblock');
const optionWrap = document.getElementById('wrap');
const optionAuto = document.getElementById('auto');

const getWrap = () => optionWrap.checked;
const getAuto = () => optionAuto.checked;

// clear out the whole grid
const generate = () => {
  cellsSave.fill(0);
};

// a cell is created if it has three neighbors, a cell lives if it has two or three neighbors
const isAlive = (cell, neighbors) =>
  neighbors === 3 || (Boolean(cell) && neighbors === 2) ? 1 : 0;

// calculate and display the next generation of cells
const regenerate = () => {
  if (getWrap()) {
    for (let i = 0; i < gridSize ** 2; i++)
      cellsNew[i] = isAlive(cellsSave[i], countNeighborsWrap(cellsSave, i));
  } else {
    for (let i = 0; i < gridSize ** 2; i++)
      cellsNew[i] = isAlive(cellsSave[i], countNeighborsNoWrap(cellsSave, i));
  }

  updateLive();
  cellsSave = cellsNew.slice(); // copy the cells

  // check to see if we have a stable, repeating pattern
  let newCRC = crc32(cellsNew);
  stable = cellsCRC.indexOf(newCRC) > -1;
  if (cellsCRC.push(newCRC) > maxCRC) cellsCRC.shift();

  if (!resetPending && getAuto()) {
    if (stable) {
      resetPending = true; // resetPending keeps us from setting multiple reset timeouts
      setTimeout(() => {
        random();
      }, 500); // keep running for 500ms when we have reached a stable state
    }
  }
  generations++;
  // console.log((Date.now() - startTime) / generations);
};

// setup the pre-work for our CRC32 checksums
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

// calculate a CRC32 checksum on our cells to see if we have a repeating pattern
const crc32 = function (cells) {
  let crc = 0 ^ -1;

  for (let i = 0; i < gridSize ** 2; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ cells[i]) & 0xff];
  }

  return (crc ^ -1) >>> 0;
};

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
  return count;
};

const createElement = className => {
  const el = document.createElement('div');
  el.className = className;
  return el;
};

const drawGrid = () => {
  const container = createElement('container');
  let row, cell;
  for (let i = 0; i < gridSize ** 2; i++) {
    cell = cellsSave[i];
    // cellsSave.forEach((cell, i) => {
    if (i % gridSize === 0) {
      row = createElement('row');
      container.appendChild(row);
    }
    const cellEl = createElement(`cell ${cell === 1 ? 'live' : ''}`);
    cellEl.id = new String(i);
    row.appendChild(cellEl);
  }

  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  grid.appendChild(container);
};

// update the live status of any changed cells
const updateLive = () => {
  for (let i = 0; i < gridSize ** 2; i++) {
    if (cellsNew[i] !== cellsSave[i]) {
      document.getElementById(i).classList.toggle('live');
    }
  }
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
  if (buttonStart.textContent === 'Start') {
    startTime = Date.now();
    generations = 0;
    timer = setInterval(() => {
      regenerate();
    }, speed);
    buttonStart.textContent = 'Stop';
  } else {
    clearInterval(timer);
    buttonStart.textContent = 'Start';
  }
};

const clear = () => {
  console.log('clear');
  clearInterval(timer);
  buttonStart.textContent = 'Start';
  generate();
  drawGrid();
  startTime = Date.now();
  generations = 0;
};

const random = () => {
  resetPending = false;
  //fill grid with 20% live cells
  cellsSave = cellsSave.map(x => (Math.random() < 0.2 ? 1 : 0));
  drawGrid();
};

const getSpeed = () => {
  let rawSpeed = inputSpeed.value;
  if (!rawSpeed) rawSpeed = 10;
  rawSpeed = Math.floor(Math.abs(rawSpeed));
  if (rawSpeed < 1) rawSpeed = 1;
  if (rawSpeed > 1000) rawSpeed = 1000;
  if (rawSpeed !== speed) {
    speed = rawSpeed;
  }
  if (inputSpeed.value != speed) {
    inputSpeed.value = speed;
  }
  return speed;
};

const getGridSize = () => {
  let rawSize = inputGridSize.value;
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
  if (inputGridSize.value != gridSize) {
    inputGridSize.value = gridSize;
  }
  return gridSize;
};

const attachStartEventHandler = () => {
  buttonStart.addEventListener('click', start);
};

const attachClearEventHandler = () => {
  buttonClear.addEventListener('click', clear);
};

const attachRandomEventHandler = () => {
  buttonRandom.addEventListener('click', random);
};

const attachSetupEventHandler = () => {
  buttonSetup.addEventListener('click', () =>
    optionBlock.classList.toggle('hidden')
  );
};

const attachSpeedEventHandler = () => {
  inputSpeed.addEventListener('change', getSpeed);
  inputSpeed.addEventListener('onchange', getSpeed);
  inputSpeed.addEventListener('input', getSpeed);
  inputSpeed.addEventListener('onkeydown', getSpeed);
  inputSpeed.addEventListener('onpaste', getSpeed);
};

const attachSizeEventHandler = () => {
  inputGridSize.addEventListener('change', getGridSize);
  inputGridSize.addEventListener('onchange', getGridSize);
  inputGridSize.addEventListener('input', getGridSize);
  inputGridSize.addEventListener('onkeydown', getGridSize);
  inputGridSize.addEventListener('onpaste', getGridSize);
};

const init = () => {
  crcTable = makeCRCTable();
  generate();
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

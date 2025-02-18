'use strict';
let cellSave = [];
let oldCells = [];
let stable = false;
let startTime, generations;
let speed = 10;
let gridSize = 50;
let resetPending = false;

const startButton = document.getElementById('start');
const clearButton = document.getElementById('clear');
const randomButton = document.getElementById('random');
const speedInput = document.getElementById('speed');
const gridSizeInput = document.getElementById('gridSize');

const getWrap = () => document.getElementById('wrap').checked;
const getAuto = () => document.getElementById('auto').checked;

const isAlive = (cell, neighbors) =>
  neighbors === 3 || (Boolean(cell) && neighbors === 2) ? 1 : 0;

const generate = () => {
  cellSave = new Array(gridSize * gridSize).fill(0);
  oldCells = new Array(gridSize * gridSize).fill(0);
};

const regenerate = () => {
  const newCells = cellSave.map((cell, i) =>
    isAlive(cell, countNeighbors(cellSave, i))
  );
  if (!resetPending && getAuto()) {
    stable = cellsEqual(newCells, oldCells);
    oldCells = cellSave;
    cellSave = newCells;
    if (stable) {
      resetPending = true;
      setTimeout(() => {
        random();
      }, 500);
    }
  }
  updateLive();
  generations++;
  // console.log((Date.now() - startTime) / generations);
};

const cellsEqual = (cells1, cells2) =>
  cells1.length === cells2.length &&
  cells1.every((val, index) => val === cells2[index]);

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
  cellSave.forEach((cell, i) => {
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
  cellSave.forEach((newCell, i) => {
    if (newCell !== oldCells[i]) {
      document.getElementById(i).classList.toggle('live');
    }
  });
};

const attachGridEventHandler = () => {
  document.getElementById('grid').addEventListener('click', event => {
    event.target.classList.toggle('live');
    const cell = +event.target.id;
    cellSave[cell] = 1 - cellSave[cell];
    // console.log(cellSave);
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
  cellSave = cellSave.map(x => (Math.random() < 0.2 ? 1 : 0));
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
  generate(70);
  drawGrid();
  attachGridEventHandler();
  attachStartEventHandler();
  attachClearEventHandler();
  attachRandomEventHandler();
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

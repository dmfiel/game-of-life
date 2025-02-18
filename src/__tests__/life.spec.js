require('../life');
const {
  isAlive,
  generate,
  regenerate,
  countNeighbors,
  drawGrid,
  attachGridEventHandler,
  getCells,
  start,
  stop
} = window.game;

describe('game of life', () => {
  describe('isAlive algorithm', () => {
    test('dead cell with no neighbors -> 0', () => {
      expect(isAlive(0, 0)).toEqual(0);
    });
    test('live cell with no neighbors -> 0', () => {
      expect(isAlive(1, 0)).toEqual(0);
    });
    test('dead cell with 3 neighbors -> 1', () => {
      expect(isAlive(0, 3)).toEqual(1);
    });
    test('live cell with 2 neighbors -> 1', () => {
      expect(isAlive(1, 2)).toEqual(1);
    });
  });
  describe('generate function', () => {
    test('should create an array of x*x ', () => {
      expect(generate(1)).toEqual([0]);
      expect(generate(2)).toEqual([0, 0, 0, 0]);
    });
  });
  describe('countNeighbors', () => {
    test('should count 0 for array of one', () => {
      expect(countNeighbors([1], 0)).toEqual(0);
    });
    test('should count 2 for array of two', () => {
      expect(countNeighbors([1, 1, 1, 0], 0)).toEqual(2);
    });
  });
  describe('regenerate function', () => {
    test('should not update dead cells', () => {
      const cells = generate(1);
      expect(regenerate(cells)).toEqual(cells);
    });
    test('should return all dead cells', () => {
      const initialCells = generate(2);
      const cells = generate(2);
      cells[0] = 1;
      expect(regenerate(cells)).toEqual(initialCells);
    });
    test('should return all live cells', () => {
      expect(regenerate([1, 1, 1, 0])).toEqual([1, 1, 1, 1]);
    });
    test('should return all live cells', () => {
      expect(regenerate([1, 1, 1, 1])).toEqual([1, 1, 1, 1]);
    });
    test('should return flipper', () => {
      expect(regenerate([0, 0, 0, 1, 1, 1, 0, 0, 0])).toEqual([
        0, 1, 0, 0, 1, 0, 0, 1, 0
      ]);
    });
  });
  describe('browser grid', () => {
    test('should display grid', () => {
      drawGrid([0]);
      expect(document.querySelectorAll('.container').length).toEqual(1);
      expect(document.querySelectorAll('.cell').length).toEqual(1);
      expect(document.querySelectorAll('.dead').length).toEqual(1);
      expect(document.querySelectorAll('.live').length).toEqual(0);
    });
    test('should display grid', () => {
      drawGrid([1]);
      expect(document.querySelectorAll('.container').length).toEqual(1);
      expect(document.querySelectorAll('.cell').length).toEqual(1);
      expect(document.querySelectorAll('.dead').length).toEqual(0);
      expect(document.querySelectorAll('.live').length).toEqual(1);
    });
    test('should display grid of living and dead cells', () => {
      document.body.innerHTML = '<div id="grid"></div>';
      drawGrid([1, 0, 0, 1]);
      expect(document.querySelectorAll('.row').length).toEqual(2);
      expect(document.querySelectorAll('.cell').length).toEqual(4);
      expect(document.querySelectorAll('.dead').length).toEqual(2);
      expect(document.querySelectorAll('.live').length).toEqual(2);
      drawGrid([1, 1, 1, 1]);
      expect(document.querySelectorAll('.row').length).toEqual(2);
      expect(document.querySelectorAll('.cell').length).toEqual(4);
      expect(document.querySelectorAll('.dead').length).toEqual(0);
      expect(document.querySelectorAll('.live').length).toEqual(4);
    });
  });
  describe('event handler for grid', () => {
    test('click on cell should toggle live/dead', () => {
      document.body.innerHTML = '<div id="grid"></div>';
      drawGrid([0]);
      attachGridEventHandler();
      expect(document.querySelectorAll('.cell').length).toEqual(1);
      expect(document.querySelectorAll('.dead').length).toEqual(1);
      expect(document.querySelectorAll('.live').length).toEqual(0);
      const cell = document.querySelectorAll('.dead')[0];
      cell.click();
      expect(document.querySelectorAll('.dead').length).toEqual(0);
      expect(document.querySelectorAll('.live').length).toEqual(1);
      cell.click();
      expect(document.querySelectorAll('.dead').length).toEqual(1);
      expect(document.querySelectorAll('.live').length).toEqual(0);
    });
  });
  describe('get cells from grid', () => {
    test('should get current state of cells', () => {
      document.body.innerHTML = '<div id="grid"></div>';

      const cells = [1, 0, 0, 1];
      drawGrid(cells);
      expect(getCells()).toEqual(cells);
      attachGridEventHandler();
      const cell = document.querySelectorAll('.dead')[0];
      cell.click();
      expect(getCells()).toEqual([1, 1, 0, 1]);
    });
  });

  jest.useFakeTimers();
  describe('start function', () => {
    const getCellsSpy = jest.spyOn(game, 'getCells');
    const regenerateSpy = jest.spyOn(game, 'regenerate');
    const drawGridSpy = jest.spyOn(game, 'drawGrid');
    game.start();
    jest.runOnlyPendingTimers();
    // expect(setInterval).toHaveBeenCalled();
    expect(getCellsSpy).toHaveBeenCalled();
    expect(regenerateSpy).toHaveBeenCalled();
    expect(drawGridSpy).toHaveBeenCalled();
  });

  describe('stop function', () => {
    test('stop should clear the interval timer', () => {
      // expect(clearInterval).toHaveBeenCalled();
    });
  });
});

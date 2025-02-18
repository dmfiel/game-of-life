# game-of-life
The classic Conway's Game of Life with multiple enhancements

The basic skeleton is from the Udemy course "Test Driven Development using Javascript and Jest." 
I enhanced it in various ways:
- Streamlined DOM updates, so that instead of rebuilding the entire grid which crashed the browser after extended runs, only the 'live' class is toggled for changed cells. This reduced the memory and CPU load on the browser, enabling the simulation to run continuously.
- Enabled random fills of the grid. After some experimentation 20% live cells seems to provide a good balance between enough cells to propogate with enough space for them to move well.
- Enabled detection of static configurations where no cells are changing or they are only flipping back and forth. When this occurs, a checkbox allows the system to start over with a new random fill. This allows the discovery of perpetual moving patterns.
- Enabled variable grid size.
- Enabled variable regeneration speeds.
- Added a clear button to erase the grid.
- Enhanced the styling and added an interesting MRSA electron micrograph background.

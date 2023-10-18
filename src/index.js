import * as game from '../src/modules/gameManager.js';

// Events
document.addEventListener('mousemove', function(e){game.onMouseMove(e)});
document.addEventListener('mouseup', function(e){game.onMouseRelease(e)});
document.addEventListener('mousedown', function(e){game.onMousePress(e)});

game.init();
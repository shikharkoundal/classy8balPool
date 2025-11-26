import Game from './script/Game.js';
import { loadAssets } from './script/Assets.js';

(async function main() {
  try {
    await loadAssets(); // loads sprites & sounds into Assets exports
    const game = new Game();
    // size matches original game coordinate system
    await game.start('gameArea', 'screen', 1500, 825);
    // attach to window for debugging if you want:
    window.__GAME = game;
    console.log('Game started');
  } catch (err) {
    console.error('Bootstrap error:', err);
  }
})();

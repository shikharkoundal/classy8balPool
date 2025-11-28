const SPRITES = {
  mainMenuBackground: "main_menu_background.png",
  background: "spr_background4.png",

  controls: "controls.png",

  spr_ball: "spr_ball2.png",
  spr_red: "spr_redBall2.png",
  spr_yellow: "spr_yellowBall2.png",
  spr_black: "spr_blackBall2.png",
  spr_stick: "spr_stick.png",

  // --- MAIN MENU BUTTONS (CORRECT NAMES) ---
  onePlayersButton: "1_player_button.png",
  onePlayersButtonHover: "1_player_button_hover.png",


twoPlayersButton: "2_players_button.png",          // <-- S added
twoPlayersButtonHover: "2_players_button_hover.png" // <-- S added

};



const SOUNDS = {
  side: "Side.wav",
  ballsCollide: "BallsCollide.wav",
  strike: "Strike.wav",
  hole: "Hole.wav",
  jazzTune: "Bossa Antigua.mp3"
};

export const sprites = {};
export const sounds = {};

function loadImage(path) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = `assets/sprites/${path}`;
  });
}
function loadSound(path) {
  return new Promise((res, rej) => {
    const a = new Audio(`assets/sounds/${path}`);
    a.oncanplaythrough = () => res(a);
    a.onerror = rej;
  });
}
export async function loadAssets() {
    const entries = Object.entries(SPRITES);

    console.log("Loading sprites:", entries);

    await Promise.all(entries.map(async ([key, file]) => {
        try {
            const img = await loadImage(file);

            console.log(`Loaded sprite: ${key}`, img.width, img.height);

            sprites[key] = img;
        } catch (e) {
            console.error(`❌ FAILED to load sprite: ${key} → ${file}`, e);
        }
    }));

    // Load sounds
    const snd = Object.entries(SOUNDS);
    await Promise.all(snd.map(async ([key, file]) => {
        try {
            const audio = await loadSound(file);
            sounds[key] = audio;
        } catch (e) {
            console.error(`❌ FAILED sound: ${key} → ${file}`, e);
        }
    }));

    // LEGACY NAMES
    sprites.ball = sprites.spr_ball;
    sprites.redBall = sprites.spr_red;
    sprites.yellowBall = sprites.spr_yellow;
    sprites.blackBall = sprites.spr_black;
    sprites.stick = sprites.spr_stick;
    sprites.background = sprites.background;

    return true;
}


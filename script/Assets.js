// script/Assets.js
// import { loadSprites } from "./core/ResourceLoader.js";
import { loadSprites } from "core/ResourceLoader.js";

// These paths MUST match your actual folder names
const SPRITE_PATH = "assets/sprites/";
const SOUND_PATH  = "assets/sounds/";

export const sprites = {};
export const sounds  = {};

export async function loadAssets() {
    // Load sprites
    Object.assign(
        sprites,
        await loadSprites({
            // balls
            spr_ball:      SPRITE_PATH + "spr_ball2.png",
            spr_red:       SPRITE_PATH + "spr_redBall2.png",
            spr_yellow:    SPRITE_PATH + "spr_yellowBall2.png",
            spr_black:     SPRITE_PATH + "spr_blackBall2.png",

            // cue stick
            spr_stick:     SPRITE_PATH + "spr_stick.png",

            // table
            background:    SPRITE_PATH + "spr_background5.png",

            // menu buttons (optional)
            onePlayersButton:        SPRITE_PATH + "1_player_button.png",
            onePlayersButtonHover:   SPRITE_PATH + "1_player_button_hover.png",
            twoPlayersButton:        SPRITE_PATH + "2_players_button.png",
            twoPlayersButtonHover:   SPRITE_PATH + "2_players_button_hover.png",
            mainMenuBackground:      SPRITE_PATH + "main_menu_background.png"
        })
    );

    // Load sounds (keep simple HTML5 Audio)
    const soundFiles = {
        ballsCollide: "BallsCollide.wav",
        hole:         "Hole.wav",
        strike:       "Strike.wav",
        side:         "Side.wav"
    };

    for (const k in soundFiles) {
        const a = new Audio();
        a.src = SOUND_PATH + soundFiles[k];
        sounds[k] = a;
    }

    return true;
}

let config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 800,
    pixelArt: true, 
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    physics: {
        default: "arcade",
        arcade: { 
            debug: false,
        },
    },
    scene: [loadingScene, titleScene, pauseScene, level1IntroScene, level1BossIntroScene, level1BossOutroScene, level1BossScene, level1FightScene],
}

//keys and setup
let key_left, key_right, key_up, key_down, key_next, key_prev, key_space, key_esc;
let game_settings;
let current_scene, pause_scene;
let current_map;
let bg_music;
let pointer;
let game_script;

let game = new Phaser.Game(config);
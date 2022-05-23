let config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 800,
    pixelArt: true, 
    physics: {
        default: "arcade",
        arcade: { 
            //fps: 60,
            //debug: true,
         },
    },
    scene: [loadingScene, titleScene, level1IntroScene, level1BossScene, level1FightScene],
}

//keys and setup
let key_left, key_right, key_up, key_down, key_next, key_prev, key_space, key_esc;
let game_settings;
let current_scene;
let pointer;
let game_script;

let game = new Phaser.Game(config);
let config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 700,
    physics: {
        default: "arcade",
        arcade: { fps: 60,
            //debug: true,
         },
    },
    scene: [level1FightScene],
}

//keys and setup
let key_left, key_right, key_up, key_down, key_next, key_prev, key_space, key_esc;
let game_settings;
let current_scene;

let game = new Phaser.Game(config);
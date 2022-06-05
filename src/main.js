/*
HELLVETICA
    - made by: Andrew Wei, Aidan Barcia-Bacon, Manoj Sara
    - music: Sophia Eisenbach

GRADING:
    batter:
        1.) no critical error/crashes; game sometimes run really slow on chrome but that's 100% a phaser problem
        2.) have a restart, title, and ending
        3.) have tutorials on the ground
        4.) with moderate skill game can be completed. Have a level select for grades and debug keys for going to levels/scenes with keys 1-7 on title screen
        5.) have comments and well structured code
        6.) we have a ton of pulls/pushes on github
    bake:
        1.) have a lot of work put into artistic cohesion
        2.) game revolves around core mechanic

    icing:
        1.) our game has a ton of effort and polish put into it for a good experience
*/

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
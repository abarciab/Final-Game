class level1FightScene extends Phaser.Scene {
    constructor() {
        super("level1FightScene");
    }

    create(){
        //intialize game_settings, current_scene, and setup keys
        //if (bg_music)
        if (bg_music.key != 'level') {
            console.log("play");
            bg_music = this.sound.add('level', {volume: 0.1});
            bg_music.setLoop(true).play();
        }
        else {
            console.log('level !=', bg_music.key);
        }


        initializeLevel(this);

        sweepTransition("left", false);
        game_settings.next_scene = `level1BossScene`;
    }
    /*
    update: updates scene every frame
        @ time: total time that the game has been running
        @ delta: number of milliseconds since update was last called
    */
    update(time, delta){
        updateLevel(time, delta);
    }
}
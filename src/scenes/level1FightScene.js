class level1FightScene extends Phaser.Scene {
    constructor() {
        super("level1FightScene");
    }

    create(){
        
        //intialize game_settings, current_scene, and setup keys
        //if (bg_music)
        if (bg_music.key != 'level') {
            bg_music = this.sound.add('level', {volume: 0.5 * game_settings.music_vol});
            bg_music.setLoop(true).play();
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
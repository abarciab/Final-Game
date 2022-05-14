class level1IntroScene extends Phaser.Scene {
    constructor() {
        super("level1IntroScene");
    }

    preload(){

    }

    create(){
        current_scene = this;
        pointer = current_scene.input.activePointer;

        this.cameras.main.setBackgroundColor('#303030');        

        game_script.readNextPart(this);
    }

    update(timer, delta){
        if (game_script.reading_script) {
            game_script.updateScript(delta);
        }
        else {
            this.scene.start("level1FightScene");
        }
    }
}
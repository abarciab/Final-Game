class level1IntroScene extends Phaser.Scene {
    constructor() {
        super("level1IntroScene");
    }

    preload(){

    }

    create(){
        current_scene = this;
        pointer = current_scene.input.activePointer;

        let UI_scale = 4.86;

        this.add.image(game.config.width/2, game.config.height/2, 'office background').setScale(UI_scale).setOrigin(0.5);

        this.cameras.main.setBackgroundColor('#303030');        

        game_script.readNextPart(this);
        //this.time.delayedCall(2000, game_script.readNextPart);

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
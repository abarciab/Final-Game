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
        /*this.start_button = this.add.rectangle(game.config.width/2, game.config.height/2, 900, 110, 0x331111).setInteractive();
        this.start_button.on('pointerdown', function(){
            this.scene.scene.start("level1FightScene");
        })*/

        game_script.readNextPart(this);

        //this.start_text = this.add.text(game.config.width/2, this.start_button.y, 'B  E  G  I  N', {color: '#FFFFFF', fontSize: '40px'}).setOrigin(0.5);
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
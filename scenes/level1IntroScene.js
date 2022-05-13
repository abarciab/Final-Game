class level1IntroScene extends Phaser.Scene {
    constructor() {
        super("level1IntroScene");
    }

    preload(){

    }

    create(){
        this.cameras.main.setBackgroundColor('#303030');

        this.title_text = this.add.text(game.config.width/2, 200, 'person1: help, I lost my keys!\n\nfran: you called the right person\n\nperson1: oh, thank you so much!!!', {color: '#FFFFFF', fontSize: '40px'}).setOrigin(0.5);
        
        this.start_button = this.add.rectangle(game.config.width/2, game.config.height/2, 900, 110, 0x331111).setInteractive();
        this.start_button.on('pointerdown', function(){
            this.scene.scene.start("level1FightScene");
        })
        this.start_text = this.add.text(game.config.width/2, this.start_button.y, 'B  E  G  I  N', {color: '#FFFFFF', fontSize: '40px'}).setOrigin(0.5);
    }

    update(){

    }
}
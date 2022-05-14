class titleScene extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    preload(){
        this.load.json('scriptData', './scripts/gameScript.json');
    }

    create(){
        const data = this.cache.json.get('scriptData');
        game_script = new ScriptReader(this, data);

        console.log(game_script.script_data);

        this.cameras.main.setBackgroundColor('#FF6666');

        this.title_text = this.add.text(game.config.width/2, 200, 'OMGGG, I have to go find something in hell... AGAIN???', {color: '#000000', fontSize: '40px', stroke: '#FFFFFF', strokeThickness: 5}).setOrigin(0.5);
        
        this.start_button = this.add.rectangle(game.config.width/2, game.config.height/2, 900, 110, 0x331111).setInteractive();
        this.start_button.on('pointerdown', function(){
            this.scene.scene.start("level1IntroScene");
        })
        this.start_text = this.add.text(game.config.width/2, this.start_button.y, 'S  T  A  R  T', {color: '#FFFFFF', fontSize: '40px'}).setOrigin(0.5);
    }

    update(){
        
    }
}
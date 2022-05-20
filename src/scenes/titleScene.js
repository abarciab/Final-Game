class titleScene extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    preload(){
        this.load.audio('male blip', './assets/sounds/sfx/sfx-blipmale.wav');
        this.load.audio('female blip', './assets/sounds/sfx/sfx-blipfemale.wav');
        this.load.audio('player hit', './assets/sounds/sfx/player_hit.wav');
        this.load.audio('player dash', './assets/sounds/sfx/player_dash2.wav');
        this.load.audio('player super dash', './assets/sounds/sfx/player_super_dash.wav');
        this.load.audio('footstep', './assets/sounds/sfx/netherack_step_sfx.wav');
        this.load.audio('dash charge', './assets/sounds/sfx/dash_charge.wav');
        this.load.audio('finish charge', './assets/sounds/sfx/finished_charging.wav');
        this.load.audio('enemy hit', './assets/sounds/sfx/enemy_hit.wav');
        this.load.image('textbox', './assets/textbox.png');
        this.load.json('scriptData', './scripts/gameScript.json');
    }

    create(){
        const data = this.cache.json.get('scriptData');
        game_script = new ScriptReader(this, data);

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
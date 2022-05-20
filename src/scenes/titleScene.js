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
        this.load.audio('footstep', './assets/sounds/sfx/footstep.wav');
        this.load.audio('dash charge', './assets/sounds/sfx/dash_charge.wav');
        this.load.audio('finish charge', './assets/sounds/sfx/finished_charging.wav');
        this.load.audio('enemy hit', './assets/sounds/sfx/enemy_hit.wav');
        this.load.audio('enemy dead', './assets/sounds/sfx/enemy_dead.wav');
        this.load.image('textbox', './assets/textbox.png');
        this.load.json('scriptData', './scripts/gameScript.json');

        this.load.image('title background', './assets/UI/title background.png');
        this.load.image('start button', './assets/UI/start button.png');
        this.load.image('level select button', './assets/UI/level select button.png');
        this.load.image('options button', './assets/UI/options button.png');
        this.load.image('credits button', './assets/UI/credits button.png');
        this.load.image('title', './assets/UI/title.png');
    }

    create(){
        current_scene = this;

        let UI_scale = 4.86;

        this.add.image(game.config.width/2, game.config.height/2, 'title background').setScale(UI_scale).setOrigin(0.5);


        const data = this.cache.json.get('scriptData');
        game_script = new ScriptReader(this, data);

        this.cameras.main.setBackgroundColor('#FF6666');

        //this.title_text = this.add.text(500, 180, 'H E L L V E T I C A', {color: '#000000', fontSize: '70px', stroke: '#FFFFFF', strokeThickness: 8}).setScale(0.9, 1).setOrigin(0.5);
        this.title = this.add.sprite(420, 1000, 'title').setScale(4).setInteractive().setOrigin(0.5);
        this.tweens.add({
            duration: 1000,
            targets: current_scene.title,
            y: 140,
            easing: 'Back',
        })
        this.tweens.add({
            duration: 2000,
            targets: current_scene.title,
            delay: 1000,
            y: 145,
            yoyo: true,
            easing: 'Elastic',
            repeat: -1
        })
        
        this.start_button = this.add.sprite(1800, 340, 'start button').setScale(3).setInteractive().setOrigin(0.5);
        this.tweens.add({
            duration: 1000,
            targets: current_scene.start_button,
            delay: 800,
            x: 920,
            easing: 'Sine.easeInOut',
        })
        this.tweens.add({
            duration: 800,
            targets: current_scene.start_button,
            y: 345,
            yoyo: true,
            easing: 'Elastic',
            repeat: -1
        })

        this.level_button = this.add.sprite(1800, 440, 'level select button').setScale(3).setInteractive().setOrigin(0.5);
        this.tweens.add({
            duration: 1000,
            targets: current_scene.level_button,
            delay: 1000,
            x: 920,
            easing: 'Sine.easeInOut',
        })
        this.tweens.add({
            duration: 800,
            targets: current_scene.level_button,
            y: 445,
            delay: 200,
            yoyo: true,
            easing: 'Elastic',
            repeat: -1
        })

        this.options_button = this.add.sprite(1800, 540, 'options button').setScale(3).setInteractive().setOrigin(0.5);
        this.tweens.add({
            duration: 1000,
            targets: current_scene.options_button,
            delay: 1200,
            x: 920,
            easing: 'Sine.easeInOut',
        })
        this.tweens.add({
            duration: 800,
            targets: current_scene.options_button,
            delay: 300,
            y: 545,
            yoyo: true,
            easing: 'Elastic',
            repeat: -1
        })

        this.credits_button = this.add.sprite(1800, 640, 'credits button').setScale(3).setInteractive().setOrigin(0.5);
        this.tweens.add({
            duration: 1000,
            targets: current_scene.credits_button,
            delay: 1400,
            x: 920,
            easing: 'Sine.easeInOut',
        })
        this.tweens.add({
            duration: 800,
            targets: current_scene.credits_button,
            y: 645,
            yoyo: true,
            delay: 80,
            easing: 'Elastic',
            repeat: -1
        })

        
        this.credits_button.on('pointerover', function(){
            this.scene.credits_button.setTint(0xcccccc);
        })
        this.credits_button.on('pointerout', function(){
            this.scene.credits_button.clearTint();
        })

        this.options_button.on('pointerover', function(){
            this.scene.options_button.setTint(0xcccccc);
        })
        this.options_button.on('pointerout', function(){
            this.scene.options_button.clearTint();
        })

        this.level_button.on('pointerover', function(){
            this.scene.level_button.setTint(0xcccccc);
        })
        this.level_button.on('pointerout', function(){
            this.scene.level_button.clearTint();
        })

        this.start_button.on('pointerover', function(){
            this.scene.start_button.setTint(0xcccccc);
        })
        this.start_button.on('pointerout', function(){
            this.scene.start_button.clearTint();
        })
        this.start_button.on('pointerdown', function(){
            this.scene.scene.start("level1IntroScene");
        })
        //this.start_text = this.add.text(game.config.width/2, this.start_button.y, 'S  T  A  R  T', {color: '#FFFFFF', fontSize: '40px'}).setOrigin(0.5);
    }

    update(){
        
    }
}
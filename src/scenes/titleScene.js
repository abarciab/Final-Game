class titleScene extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    create(){
        current_scene = this;
        initialize(this);

        let UI_scale = 4.86;

        this.add.image(game.config.width/2, game.config.height/2, 'title background').setScale(UI_scale).setOrigin(0.5);
        this.bg_music = this.sound.add('title', {volume: 0.1});
        this.bg_music.setLoop(true).play()

        const data = this.cache.json.get('scriptData');
        game_script = new ScriptReader(this, data);

        this.cameras.main.setBackgroundColor('#FF6666');

        this.credits = this.add.sprite(game.config.width/2, game.config.height+ 350, 'credits menu').setScale(3.6).setInteractive().setOrigin(0.5).setDepth(1).setVisible(true);
        this.credits.on('pointerdown', function(){
            this.scene.button_click_sfx.play({volume: click_vol});
            current_scene.tweens.add({
                duration: 100,
                targets: current_scene.grayRect,
                alpha: 0,
            });
            current_scene.tweens.add({
                duration: 500,
                targets: current_scene.credits,
                y: game.config.height+ 350,
            });
        })

        this.options = this.add.sprite(game.config.width/2, game.config.height+ 350, 'options').setScale(3.6).setInteractive().setOrigin(0.5).setDepth(1).setVisible(true);
        this.options.on('pointerdown', function(){
            this.scene.button_click_sfx.play({volume: click_vol});
            current_scene.tweens.add({
                duration: 100,
                targets: current_scene.grayRect,
                alpha: 0,
            });
            current_scene.tweens.add({
                duration: 500,
                targets: current_scene.options,
                y: game.config.height+ 350,
            });
        })



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

        this.blackRect = this.add.rectangle(0, 0, game.config.width, game.config.height, 0x000000).setOrigin(0, 1).setScale(20);
        this.button_hover_sfx = this.sound.add('button hover 2'); 
        this.button_click_sfx = this.sound.add('button click'); 
        let click_vol = 0.3;
        let hover_vol = 0.3;
        
        this.credits_button.on('pointerover', function(){
            this.scene.button_hover_sfx.play({volume: hover_vol});
            this.scene.credits_button.setTint(0xcccccc);

        })
        this.credits_button.on('pointerout', function(){
            this.scene.credits_button.clearTint();
        })
        this.credits_button.on('pointerdown', function(){
            this.scene.button_click_sfx.play({volume: click_vol});
            current_scene.tweens.add({
                duration: 100,
                targets: current_scene.grayRect,
                alpha: 0.4,
            });
            current_scene.tweens.add({
                duration: 500,
                targets: current_scene.credits,
                y: 410,
            });
        })

        this.options_button.on('pointerover', function(){
            this.scene.button_hover_sfx.play({volume: hover_vol});
            this.scene.options_button.setTint(0xcccccc);
        })
        this.options_button.on('pointerout', function(){
            this.scene.options_button.clearTint();
        })
        this.options_button.on('pointerdown', function(){
            this.scene.button_click_sfx.play({volume: click_vol});
            current_scene.tweens.add({
                duration: 100,
                targets: current_scene.grayRect,
                alpha: 0.4,
            });
            current_scene.tweens.add({
                duration: 500,
                targets: current_scene.options,
                y: 410,
            });
        })

        this.level_button.on('pointerover', function(){
            this.scene.button_hover_sfx.play({volume: hover_vol});
            this.scene.level_button.setTint(0xcccccc);
        })
        this.level_button.on('pointerout', function(){
            this.scene.level_button.clearTint();
        })

        this.start_button.on('pointerover', function(){
            this.scene.button_hover_sfx.play({volume: hover_vol});
            this.scene.start_button.setTint(0xcccccc);
        })
        this.start_button.on('pointerout', function(){
            this.scene.start_button.clearTint();
        })
        this.start_button.on('pointerdown', function(){
            this.scene.button_click_sfx.play({volume: click_vol});
            current_scene.tweens.add({
                duration: 500,
                targets: current_scene.blackRect,
                y: game.config.height,
                onComplete: function() {
                    current_scene.bg_music.stop();
                    current_scene.scene.start("level1IntroScene");
                },
            });
            //this.scene.scene.start("level1IntroScene");
        })
        //this.start_text = this.add.text(game.config.width/2, this.start_button.y, 'S  T  A  R  T', {color: '#FFFFFF', fontSize: '40px'}).setOrigin(0.5);

        setupKeys(this);
    }

    update(){
        if (Phaser.Input.Keyboard.JustDown(key_1)){
            this.bg_music.stop();
            this.scene.start("level1FightScene");
        }
        if (Phaser.Input.Keyboard.JustDown(key_2)){
            this.bg_music.stop();
            this.scene.start("level1BossScene");
        }

    }
}
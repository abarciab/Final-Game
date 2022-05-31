class titleScene extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    create(){
        current_scene = this;

        let UI_scale = 4.86;

        this.background = this.add.image(game.config.width/2, game.config.height/2, 'title background').setScale(UI_scale).setOrigin(0.5);
        bg_music = this.sound.add('title', {volume: 0.1});
        bg_music.setLoop(true).play()

        const data = this.cache.json.get('scriptData');
        game_script = new ScriptReader(this, data);

        this.cameras.main.setBackgroundColor('#000000');

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
            sweepTransition("right", true, function() {
                bg_music.stop();
                current_scene.scene.start("level1IntroScene");
            })
        })
        //this.start_text = this.add.text(game.config.width/2, this.start_button.y, 'S  T  A  R  T', {color: '#FFFFFF', fontSize: '40px'}).setOrigin(0.5);

        setupKeys(this);
        this.initGameSettings();
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(key_1)){
            bg_music.stop();
            current_map = 'level 1.0 map';
            this.scene.start("level1FightScene");
        }
        if (Phaser.Input.Keyboard.JustDown(key_2)){
            bg_music.stop();
            current_map = 'level 1.1 map';
            this.scene.start("level1FightScene");
        }
        if (Phaser.Input.Keyboard.JustDown(key_3)){
            bg_music.stop();
            this.scene.start("level1BossIntroScene");
        }
    }
    initGameSettings() {
        game_settings = {
            // player stats
            dash_damage: 50,
            player_walk_speed: 350,
            player_dash_speed: 1000,
            player_max_charge_progress: 800,
            player_dash_cooldown: 0.2,
            player_max_health: 5,
            player_curr_health: 5,
            player_walk_drag: 0.0001,
            player_dash_drag: 0.1,
            player_stun_time: 100,
            player_mass: 0.8,
            player_bounce_mod: 0.7,
            player_invincible_time: 1,
            player_perfect_dash_window: 0.3,
    
            //misc game vars
            tilemap_scale: 1,
            camera_zoom: 1,
            next_scene: `level1BossScene`,
    
            // charger stats
            charger_speed: 75,
            charger_health: 100,
            charger_bounce_mod: 1,
            charger_bounce_drag: 0.01,

            // dasher stats
            dasher_speed: 75,
            dasher_dash_speed: 1000,
            dasher_dash_drag: 0.1,
            dasher_health: 100,
            dasher_bounce_mod: 1,
            dasher_bounce_drag: 0.01,
    
            // golem stats
            golem_speed: 30,
            golem_health: 150,
            golem_agro_range: 280,
            golem_attack_range: 100,
            golem_shockwave_start_frame: 5,
            golem_shockwave_end_frame: 12,
            golem_shockwave_size: 3,
            golem_shockwave_duration: 300,
            golem_shockwave_power: 350,
            golem_reload_time: 3000,
            
            golem_bounce_mod: 1,
            golem_bounce_drag: 0.0001,
    
            // shooter stats
            shooter_speed: 50,
            shooter_health: 115,
            shooter_shooting_speed: 1,
            shooter_ammo_spacing: 500,
            shooter_reload_time: 2000,
            shooter_min_dist: 2,  //the minimum distance between a shooter enemy and the player before the shooter will fire
            shooter_bounce_mod: 1,
            shooter_bounce_drag: 0.01,
            shooter_ammo: 1,
    
            enemy_mass: 1,
            enemy_stun_threshold: 10, // speed to where enemy is no longer stunned
            enemy_stun_time: 0.75,
            enemy_spawn_timer: 8000,
            //these enemy_name variables are for determining which enemy is spawned when an 'enemy1, enemy2, enemy3', etc tile is found in the tilemap.
            enemy1_name: "CHARGER",
            enemy2_name: "GOLEM",
            enemy3_name: "SHOOTER",
    
            //hank
            hank_health: 8,
            hank_speed: 100,
    
            //dog
            dog_speed: 250
        }
    }
}
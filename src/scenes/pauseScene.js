class pauseScene extends Phaser.Scene {
    constructor() {
        super("pauseScene");
    }
    create() {
        this.pause_menu = {};
        pause_scene = this;
        this.createPauseMenu();
        this.esc_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.scene.moveAbove(current_scene);
    }
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.esc_key)) {
            current_scene.paused = false;
            this.scene.resume(current_scene);
            this.scene.stop();
        }
        this.updatePause();
    }
    updatePause() {
        current_scene.cameras.main.setScroll(current_scene.cam_pos_x, current_scene.cam_pos_y);
    }
    createPauseMenu(){
        game_settings.sfx_vol = 1;
        this.pause_menu.button_hover_sfx = this.sound.add('button hover 2'); 
        
        this.pause_menu.background = this.add.rectangle(0, 0, game.config.width*20, game.config.height*20, 0x000000).setAlpha(0.5);
        this.pause_menu.title = this.add.sprite(game.config.width/2, 140, 'pause title').setScale(4);
        this.pause_menu.music_vol = this.add.sprite(game.config.width/2, 370, 'music button').setScale(3).setDepth(100).setInteractive();
        this.pause_menu.music_vol_icon = this.add.sprite(game.config.width/2 + this.pause_menu.music_vol.displayWidth/3, 370, 'vol icon low').setScale(2).setDepth(100);

        // music volume
        this.pause_menu.music_vol.on('pointerover', function(){
            pause_scene.pause_menu.button_hover_sfx.play({volume: 0.3});
            pause_scene.pause_menu.music_vol.setTint(0xcccccc);
        })
        this.pause_menu.music_vol.on('pointerout', function(){
            pause_scene.pause_menu.music_vol.clearTint();
        })
        this.pause_menu.music_vol.on('pointerdown', function(){
            game_settings.music_vol += 0.33;
            if (game_settings.music_vol > 1){
                game_settings.music_vol = 0;
                pause_scene.pause_menu.music_vol_icon.setTexture('vol icon mute');
            }
    
            if (game_settings.music_vol > 0.66){
                pause_scene.pause_menu.music_vol_icon.setTexture('vol icon high');
            }
            else if (game_settings.music_vol > 0.33){
                pause_scene.pause_menu.music_vol_icon.setTexture('vol icon med');
            }
            else if (game_settings.music_vol > 0){
                pause_scene.pause_menu.music_vol_icon.setTexture('vol icon low');
            }
            bg_music.setVolume(0.3 * game_settings.music_vol);
        })
        
        // sfx volume
        this.pause_menu.sfx_vol = this.add.sprite(game.config.width/2, 470, 'sounds button').setScale(3).setDepth(100).setInteractive();
        this.pause_menu.sfx_vol_icon = this.add.sprite(game.config.width/2 + this.pause_menu.music_vol.displayWidth/3, 470, 'vol icon med').setScale(2).setDepth(100);
        this.pause_menu.sfx_vol.on('pointerover', function(){
            pause_scene.pause_menu.button_hover_sfx.play({volume: 0.3});
            pause_scene.pause_menu.sfx_vol.setTint(0xcccccc);
        })
        
        this.pause_menu.sfx_vol.on('pointerout', function(){
            pause_scene.pause_menu.sfx_vol.clearTint();
        })
        this.pause_menu.sfx_vol.on('pointerdown', function(){
            game_settings.sfx_vol += 0.33;
            if (game_settings.sfx_vol > 1){
                game_settings.sfx_vol = 0;
                pause_scene.pause_menu.sfx_vol_icon.setTexture('vol icon mute');
            }
            if (game_settings.sfx_vol > 0.66){
                pause_scene.pause_menu.sfx_vol_icon.setTexture('vol icon high');
            }
            else if (game_settings.sfx_vol > 0.33){
                pause_scene.pause_menu.sfx_vol_icon.setTexture('vol icon med');
            }
            else if (game_settings.sfx_vol > 0){
                pause_scene.pause_menu.sfx_vol_icon.setTexture('vol icon low');
            }
            
        })
    
        // resume key
        this.pause_menu.resume = this.add.sprite(game.config.width/2, 570, 'resume button').setScale(3).setDepth(100).setInteractive();
        this.pause_menu.resume.on('pointerover', function(){
            pause_scene.pause_menu.button_hover_sfx.play({volume: 0.3});
            pause_scene.pause_menu.resume.setTint(0xcccccc);
        })
        this.pause_menu.resume.on('pointerout', function(){
            pause_scene.pause_menu.resume.clearTint();
        })
        this.pause_menu.resume.on('pointerdown', function(){
            //resume();
            pointer.isDown = false;
            pause_scene.scene.resume(current_scene);
            pause_scene.scene.stop();
        })
    
        // title key
        this.pause_menu.exit = this.add.sprite(game.config.width/2, 670, 'title screen button').setScale(3).setDepth(100).setInteractive();
        this.pause_menu.exit.on('pointerover', function(){
            pause_scene.pause_menu.button_hover_sfx.play({volume: 0.3});
            pause_scene.pause_menu.exit.setTint(0xcccccc);
        })
        this. pause_menu.exit.on('pointerout', function(){
            pause_scene.pause_menu.exit.clearTint();
        })
        this.pause_menu.exit.on('pointerdown', function(){
            bg_music.stop();
            current_scene.sound.stopAll();
            pause_scene.scene.stop();
            current_scene.scene.start("titleScene");
        })
    }
}
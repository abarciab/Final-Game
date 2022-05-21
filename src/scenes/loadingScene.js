class loadingScene extends Phaser.Scene {
    constructor() {
        super("loadingScene");
    }

    preload(){
        current_scene = this;
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(game.config.width/2-310, game.config.height/2 - 30, 620, 50);
        
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                //font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);
        this.blackRect = this.add.rectangle(0, 0, game.config.width, game.config.height, 0x000000).setOrigin(0, 1).setScale(20);
        
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(game.config.width/2-300, game.config.height/2 - 20, 600 * value, 30);
        });
        
        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });
        this.load.on('complete', function () {
            current_scene.tweens.add({
                duration: 1000,
                targets: current_scene.blackRect,
                y: game.config.height,
                onComplete: function() {current_scene.scene.start("titleScene");},
            });
            
        });
        

        //ASSETS

        //UI 
        this.load.image('textbox', './assets/textbox.png');
        this.load.image('title background', './assets/UI/title background.png');
        this.load.image('start button', './assets/UI/start button.png');
        this.load.image('level select button', './assets/UI/level select button.png');
        this.load.image('options button', './assets/UI/options button.png');
        this.load.image('credits button', './assets/UI/credits button.png');
        this.load.image('title', './assets/UI/title.png');
        this.load.image('player heart', './assets/player/player_heart.png');
        this.load.image('player half heart', './assets/player/player_heart_half.png');
        this.load.image('player empty heart', './assets/player/player_heart_empty.png');
        this.load.image('boss health box', './assets/UI/boss health bar.png');

        //dialogue
        this.load.json('scriptData', './scripts/gameScript.json');
        this.load.json('scriptData', './scripts/gameScript.json');

        //fran
        this.load.image('dash pointer', './assets/player/dash_pointer.png');
        this.load.spritesheet('dash pointer charged', './assets/player/dash_pointer_charged.png', {frameWidth: 64, frameHeight: 64, start: 0, end: 3});
        this.load.spritesheet('fran idle left', './assets/player/fran_idle_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran idle right', './assets/player/fran_idle_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran run left', './assets/player/fran_run_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran run right', './assets/player/fran_run_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran dash right', './assets/player/fran_dash_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran dash left', './assets/player/fran_dash_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran damage right', './assets/player/fran_damage_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 0});
        this.load.spritesheet('fran damage left', './assets/player/fran_damage_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 0});

        //enemies
        this.load.image('shockwave', './assets/shockwave.png');
        this.load.image('white arrow', './assets/white arrow.png');
        this.load.image('charger', './assets/enemies/charger.png');
        this.load.spritesheet('charger move left', './assets/enemies/charger_move_left.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 5});
        this.load.spritesheet('charger move right', './assets/enemies/charger_move_right.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 5});
        this.load.spritesheet('charger damage left', './assets/enemies/charger_damage_left.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 0});
        this.load.spritesheet('charger damage right', './assets/enemies/charger_damage_right.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 0});
        this.load.spritesheet('golem move left', './assets/enemies/golem_move_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('golem move right', './assets/enemies/golem_move_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.image('shooter', './assets/enemies/shooter.png');
        this.load.spritesheet('shooter move left', './assets/enemies/shooter.png', {frameWidth: 50, frameHeight: 50, start: 0, end: 0});
        this.load.spritesheet('shooter move right', './assets/enemies/shooter.png', {frameWidth: 50, frameHeight: 50, start: 0, end: 0});

        //doggo
        this.load.spritesheet('dog idle left', './assets/enemies/dog_idle_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 3});
        this.load.spritesheet('dog idle right', './assets/enemies/dog_idle_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 3});
        this.load.spritesheet('dog move left', './assets/enemies/dog_run_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 2});
        this.load.spritesheet('dog move right', './assets/enemies/dog_run_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 2});

        //tilemaps
        this.load.tilemapTiledJSON('demo_map', './assets/tilemaps/demoMap.json');
        this.load.tilemapTiledJSON('bossMap','./assets/tilemaps/level1BossRoom.json');
        this.load.tilemapTiledJSON('level_1_map','./assets/tilemaps/level1Map.json');

        //sfx
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

        //music

        //misc
        this.load.image('white square', './assets/player/white square.png');
        this.load.image('white hexagon', './assets/player/white hexagon.png');
        this.load.image('vase', './assets/objects/vase.png');
        this.load.image('door', './assets/objects/door.png');
        this.load.image('button', './assets/objects/button.png');
        this.load.image('tiles', './assets/tilemaps/tiles.png');     
    }

    create(){

    }

    update(){

    }

    loadEverything(){

    }

}
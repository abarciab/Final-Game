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
        this.load.image('office background', './assets/UI/intro background.png');
        this.load.image('start button', './assets/UI/start button.png');
        this.load.image('level select button', './assets/UI/level select button.png');
        this.load.image('options button', './assets/UI/options button.png');
        this.load.image('options', './assets/UI/options.png');
        this.load.image('credits button', './assets/UI/credits button.png');
        this.load.image('pause title', './assets/UI/pause title.png');
        this.load.image('vol icon high', './assets/UI/vol icon high.png');
        this.load.image('vol icon med', './assets/UI/vol icon med.png');
        this.load.image('vol icon low', './assets/UI/vol icon low.png');
        this.load.image('vol icon mute', './assets/UI/vol icon mute.png');
        this.load.image('music button', './assets/UI/music button.png');
        this.load.image('title screen button', './assets/UI/title screen button.png');
        this.load.image('sounds button', './assets/UI/sounds button.png');
        this.load.image('resume button', './assets/UI/resume button.png');
        this.load.image('credits menu', './assets/UI/credits menu.png');
        this.load.image('title', './assets/UI/title.png');
        this.load.image('player heart', './assets/player/player_heart.png');
        this.load.image('player half heart', './assets/player/player_heart_half.png');
        this.load.image('player empty heart', './assets/player/player_heart_empty.png');
        this.load.image('boss health box', './assets/UI/boss health bar.png');
        this.load.image('vignette', './assets/UI/vignette.png');

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
        this.load.spritesheet('dust cloud', './assets/player/dust_cloud.png', {frameWidth: 16, frameHeight: 16, start: 0, end: 2});

        //enemies
        this.load.image('shockwave', './assets/shockwave.png');
        this.load.image('white arrow', './assets/white arrow.png');
        this.load.image('charger', './assets/enemies/charger.png');
        this.load.spritesheet('charger move left', './assets/enemies/charger_move_left.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 5});
        this.load.spritesheet('charger move right', './assets/enemies/charger_move_right.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 5});
        this.load.spritesheet('charger damage left', './assets/enemies/charger_damage_left.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 0});
        this.load.spritesheet('charger damage right', './assets/enemies/charger_damage_right.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 0});
        //dasher
        this.load.spritesheet('dasher move left', './assets/enemies/dasher_move_left.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 5});
        this.load.spritesheet('dasher move right', './assets/enemies/dasher_move_right.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 5});
        this.load.spritesheet('dasher damage left', './assets/enemies/dasher_damage_left.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 0});
        this.load.spritesheet('dasher damage right', './assets/enemies/dasher_damage_right.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 0});
        this.load.spritesheet('dasher charge left', './assets/enemies/dasher_charging_left.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 3});
        this.load.spritesheet('dasher charge right', './assets/enemies/dasher_charging_right.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 3});
        //golem
        this.load.spritesheet('golem move left', './assets/enemies/golem_move_left.png', {frameWidth: 64, frameHeight: 64, start: 0, end: 5});
        this.load.spritesheet('golem move right', './assets/enemies/golem_move_right.png', {frameWidth: 64, frameHeight: 64, start: 0, end: 5});
        this.load.spritesheet('golem attack left', './assets/enemies/golem_attack_left.png', {frameWidth: 64, frameHeight: 64, start: 0, end: 12});
        this.load.spritesheet('golem attack right', './assets/enemies/golem_attack_right.png', {frameWidth: 64, frameHeight: 64, start: 0, end: 12});
        this.load.spritesheet('golem damage left', './assets/enemies/golem_damage_left.png', {frameWidth: 64, frameHeight: 64, start: 0, end: 0});
        this.load.spritesheet('golem damage right', './assets/enemies/golem_damage_right.png', {frameWidth: 64, frameHeight: 64, start: 0, end: 0});
        //shooter
        this.load.spritesheet('shooter move left', './assets/enemies/shooter_move_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('shooter move right', './assets/enemies/shooter_move_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('shooter damage left', './assets/enemies/shooter_damage_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 0});
        this.load.spritesheet('shooter damage right', './assets/enemies/shooter_damage_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 0});
        this.load.spritesheet('shooter bullet', './assets/enemies/shooter_bullet.png', {frameWidth: 16, frameHeight: 8, start: 0, end: 1});

        // hank
        this.load.spritesheet('hank idle left', './assets/enemies/hank_idle_left.png', {frameWidth: 64, frameHeight: 64, start: 0, end: 5});
        this.load.spritesheet('hank idle right', './assets/enemies/hank_idle_right.png', {frameWidth: 64, frameHeight: 64, start: 0, end: 5});
        this.load.spritesheet('hank move left', './assets/enemies/hank_move_left.png', {frameWidth: 64, frameHeight: 64, start: 0, end: 5});
        this.load.spritesheet('hank move right', './assets/enemies/hank_move_right.png', {frameWidth: 64, frameHeight: 64, start: 0, end: 5});

        //doggo
        this.load.spritesheet('dog idle left', './assets/enemies/dog_idle_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 3});
        this.load.spritesheet('dog idle right', './assets/enemies/dog_idle_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 3});
        this.load.spritesheet('dog move left', './assets/enemies/dog_run_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 2});
        this.load.spritesheet('dog move right', './assets/enemies/dog_run_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 2});

        //tilemaps
        this.load.tilemapTiledJSON('demo_map', './assets/tilemaps/demoMap.json');
        this.load.tilemapTiledJSON('bossMap','./assets/tilemaps/level1BossRoom.json');
        this.load.tilemapTiledJSON('level_1_map','./assets/tilemaps/level1map.json');
        this.load.tilemapTiledJSON('level 1.0 map','./assets/tilemaps/level 1-0.json');
        this.load.tilemapTiledJSON('level 1.1 map','./assets/tilemaps/level 1-1.json');
        this.load.tilemapTiledJSON('level 1.2 map','./assets/tilemaps/level 1-2.json');
        this.load.tilemapTiledJSON('level 1.3 map', './assets/tilemaps/level 1-3.json');
        this.load.image('light', './assets/tilemaps/light.png');

        //cutscene sfx
        this.load.audio('door jingle', './assets/sounds/sfx/door_jingle.wav'); //from https://www.youtube.com/watch?v=QQ2lbJzdWLg
        this.load.audio('bam', './assets/sounds/sfx/bam.wav');

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
        this.load.audio('button hover', './assets/sounds/sfx/buttonHover.wav');
        this.load.audio('button hover 2', './assets/sounds/sfx/buttonHover2.wav');
        this.load.audio('button click', './assets/sounds/sfx/button click.wav');
        this.load.audio('vase break', './assets/sounds/sfx/vase breaking.mp3');
        this.load.audio('pressure plate', './assets/sounds/sfx/pressure plate.mp3');
        this.load.audio('health pickup', './assets/sounds/sfx/health pickup.wav');
        this.load.audio('shoot sfx', './assets/sounds/sfx/shoot_sfx.wav');
        this.load.audio('enemy slam', './assets/sounds/sfx/enemy_slam.wav');
        this.load.audio('sizzle', './assets/sounds/sfx/sizzle.wav');
        this.load.audio('woof', './assets/sounds/sfx/woof.wav');
        this.load.audio('dog step', './assets/sounds/sfx/dog_step.wav');
        this.load.audio('enemy dash', './assets/sounds/sfx/enemy_dash.wav');
        this.load.audio('enemy charge dash', './assets/sounds/sfx/charge_dash.wav');

        //music
        this.load.audio('title', './assets/sounds/music/title.mp3');
        this.load.audio('cutscene', './assets/sounds/music/cutscene.mp3');
        this.load.audio('level', './assets/sounds/music/level1.mp3');
        this.load.audio('boss', './assets/sounds/music/boss.mp3');

        //misc
        this.load.image('white square', './assets/player/white square.png');
        this.load.image('white hexagon', './assets/player/white hexagon.png');
        this.load.image('vase', './assets/objects/vase.png');
        this.load.image('target', './assets/objects/target.png');
        this.load.image('door', './assets/objects/door.png');
        this.load.image('door down', './assets/objects/door down.png');
        this.load.image('hori door', './assets/objects/hori door.png');
        this.load.image('hori door down', './assets/objects/hori door down.png');
        this.load.image('button', './assets/objects/button.png');
        this.load.image('button down', './assets/objects/button down.png');
        this.load.image('tiles', './assets/tilemaps/tiles.png');     
    }

    create(){
        this.createAnimations();
    }
    
    createAnimations() {
        current_scene.anims.create({
            key: "fran idle left",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("fran idle left", {start: 0, end: 5}),
            repeat: -1
        });
        current_scene.anims.create({
            key: "fran idle right",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("fran idle right", {start: 0, end: 5}),
            repeat: -1  
        });
        current_scene.anims.create({
            key: "fran run left",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("fran run left", {start: 0, end: 5}),
            repeat: -1
        });
        current_scene.anims.create({
            key: "fran run right",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("fran run right", {start: 0, end: 5}),
            repeat: -1
        });
        current_scene.anims.create({
            key: "fran dash left",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("fran dash left", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "fran dash right",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("fran dash right", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "fran damage left",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("fran damage left", {start: 0, end: 0}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "fran damage right",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("fran damage right", {start: 0, end: 0}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "dash pointer charged",
            frames: current_scene.anims.generateFrameNumbers("dash pointer charged", {start: 0, end: 3}),
            frameRate: 4 * (1/0.3),//game_settings.player_perfect_dash_window),
            repeat: 0
        })
        current_scene.anims.create({
            key: "dust cloud",
            frames: current_scene.anims.generateFrameNumbers("dust cloud", {start: 0, end: 2}),
            frameRate: 6,
            repeat: 0
        })

        // charger animations
        current_scene.anims.create({
            key: "charger move left",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("charger move left", {start: 0, end: 5}),
            repeat: -1  
        })
        current_scene.anims.create({
            key: "charger move right",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("charger move right", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "charger damage left",
            frameRate: 1,
            frames: current_scene.anims.generateFrameNumbers("charger damage left", {start: 0, end: 0}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "charger damage right",
            frameRate: 1,
            frames: current_scene.anims.generateFrameNumbers("charger damage right", {start: 0, end: 0}),
            repeat: -1
        })

        // dasher animations
        current_scene.anims.create({
            key: "dasher move left",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("dasher move left", {start: 0, end: 5}),
            repeat: -1  
        })
        current_scene.anims.create({
            key: "dasher move right",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("dasher move right", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "dasher damage left",
            frameRate: 1,
            frames: current_scene.anims.generateFrameNumbers("dasher damage left", {start: 0, end: 0}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "dasher damage right",
            frameRate: 1,
            frames: current_scene.anims.generateFrameNumbers("dasher damage right", {start: 0, end: 0}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "dasher charge left",
            frameRate: 8,
            frames: current_scene.anims.generateFrameNumbers("dasher charge left", {start: 0, end: 3}),
            repeat: -1  
        })
        current_scene.anims.create({
            key: "dasher charge right",
            frameRate: 8,
            frames: current_scene.anims.generateFrameNumbers("dasher charge right", {start: 0, end: 3}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "dasher dash left",
            frameRate: 36,
            frames: current_scene.anims.generateFrameNumbers("dasher move left", {start: 0, end: 5}),
            repeat: -1  
        })
        current_scene.anims.create({
            key: "dasher dash right",
            frameRate: 36,
            frames: current_scene.anims.generateFrameNumbers("dasher move right", {start: 0, end: 5}),
            repeat: -1
        })

        // golem animation
        current_scene.anims.create({
            key: "golem move right",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("golem move right", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "golem move left",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("golem move left", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "golem attack right",
            frameRate: 13,
            frames: current_scene.anims.generateFrameNumbers("golem attack right", {start: 0, end: 12}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "golem attack left",
            frameRate: 13,
            frames: current_scene.anims.generateFrameNumbers("golem attack left", {start: 0, end: 12}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "golem damage right",
            frameRate: 16,
            frames: current_scene.anims.generateFrameNumbers("golem damage right", {start: 0, end: 0}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "golem damage left",
            frameRate: 16,
            frames: current_scene.anims.generateFrameNumbers("golem damage left", {start: 0, end: 0}),
            repeat: -1
        })
        
        // shooter animation
        current_scene.anims.create({
            key: "shooter move right",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("shooter move right", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "shooter move left",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("shooter move left", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "shooter damage right",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("shooter damage right", {start: 0, end: 0}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "shooter damage left",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("shooter damage left", {start: 0, end: 0}),
            repeat: -1
        })
        
        current_scene.anims.create({
            key: "dog idle left",
            frameRate: 8,
            frames: current_scene.anims.generateFrameNumbers("dog idle left", {start: 0, end: 3}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "dog idle right",
            frameRate: 8,
            frames: current_scene.anims.generateFrameNumbers("dog idle right", {start: 0, end: 3}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "dog move left",
            frameRate: 6,
            frames: current_scene.anims.generateFrameNumbers("dog move left", {start: 0, end: 2}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "dog move right",
            frameRate: 6,
            frames: current_scene.anims.generateFrameNumbers("dog move right", {start: 0, end: 2}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "hank idle left",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("hank idle left", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "hank idle right",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("hank idle right", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "hank move left",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("hank move left", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "hank move right",
            frameRate: 12,
            frames: current_scene.anims.generateFrameNumbers("hank move right", {start: 0, end: 5}),
            repeat: -1
        })
        current_scene.anims.create({
            key: "shooter bullet",
            frameRate: 8,
            frames: current_scene.anims.generateFrameNumbers("shooter bullet", {start: 0, end: 1}),
            repeat: -1
        })
    }
}
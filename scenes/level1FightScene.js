class level1FightScene extends Phaser.Scene {
    constructor() {
        super("level1FightScene");
    }

    preload(){
        this.load.image('white square', './assets/player/white square.png');
        this.load.image('white hexagon', './assets/player/white hexagon.png');
        this.load.image('white arrow', './assets/white arrow.png');
        this.load.image('dash pointer', './assets/player/dash_pointer.png');
        this.load.image('fran shadow', './assets/player/fran_shadow.png');

        this.load.spritesheet('fran idle left', './assets/player/fran_idle_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran idle right', './assets/player/fran_idle_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran run left', './assets/player/fran_run_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran run right', './assets/player/fran_run_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran dash right', './assets/player/fran_dash_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran dash left', './assets/player/fran_dash_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 5});
        this.load.spritesheet('fran damage right', './assets/player/fran_damage_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 0});
        this.load.spritesheet('fran damage left', './assets/player/fran_damage_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 0});

        this.load.image('charger', './assets/enemies/charger.png');
        this.load.spritesheet('charger move left', './assets/enemies/charger_move_left.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 5});
        this.load.spritesheet('charger move right', './assets/enemies/charger_move_right.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 5});
        this.load.spritesheet('charger damage left', './assets/enemies/charger_damage_left.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 0});
        this.load.spritesheet('charger damage right', './assets/enemies/charger_damage_right.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 0});

        this.load.spritesheet('golem move left', './assets/enemies/golem.png', {frameWidth: 50, frameHeight: 50, start: 0, end: 0});
        this.load.spritesheet('golem move right', './assets/enemies/golem.png', {frameWidth: 50, frameHeight: 50, start: 0, end: 0});

        this.load.image('shooter', './assets/enemies/shooter.png');

        //tilemap
        this.load.image('tiles', './assets/tilemaps/tiles.png');
        this.load.tilemapTiledJSON('map','./assets/tilemaps/map1.json');
    }

    create(){
        //intialize game_settings, current_scene, and setup keys
        initialize(this);

        //player
        this.player = new Player(game.config.width/3, game.config.height/2, 'fran idle right');
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        //enemies
        this.enemies = [];
        this.enemy_projectiles = new ProjectileGroup('white arrow');
        //spawnEnemy("CHARGER");
        //spawnEnemy("GOLEM");
        //spawnEnemy("SHOOTER");
        this.text_sfx;
        

        //tilemap
        const map = this.make.tilemap({key: 'map', tileWidth: 64, tileHeight: 64});
        this.tileset = map.addTilesetImage('tiles 1', 'tiles');
        const layer0 = map.createLayer('0', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer1 = map.createLayer('1', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer2 = map.createLayer('2', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const marker_layer = map.createLayer('markers', this.tileset, 0, 0).setScale(game_settings.tilemap_scale).setAlpha(0);
        this.collision_rects = [];
        this.lava_rects = [];
        this.destructibles = [];
        this.doors = [];
        this.buttons = [];

        /*let new_door = this.add.sprite(game.config.width/2, game.config.height/2, 'white square').setScale(1, 20).setTint(0x0000FF);
        new_door.body = new Phaser.Physics.Arcade.StaticBody(current_scene.physics.world, new_door);
        this.doors.push(new_door);
        let new_button= this.physics.add.sprite(game.config.width/2-120, game.config.height/2, 'white square').setScale(.8).setTint(0x0000aa);
        this.buttons.push(new_button);
        this.physics.add.overlap(this.player, this.buttons, function() {current_scene.doors[0].destroy()});*/

        setupTilemapCollisions(layer0);
        setupTilemapCollisions(layer1);
        setupTilemapCollisions(layer2);
        setupTilemapCollisions(marker_layer);

        //collisions
        this.physics.add.collider(this.player, this.collision_rects, playerWallCollision.bind(this));
        this.physics.add.collider(this.player, this.doors);
        this.physics.add.overlap(this.player, this.lava_rects, playerLavaCollision.bind(this));
        this.physics.add.collider(this.enemies, this.lava_rects, enemyLavaCollision.bind(this));
        this.physics.add.overlap(this.player, this.destructibles, playerDestructibleCollision.bind(this));
        this.physics.add.collider(this.enemies, this.enemies, enemyOnEnemyCollision.bind(this));
        
        //enemy collisions
        this.enemyCollider = this.physics.add.collider(this.player, this.enemies, playerEnemyCollision.bind(this));
        this.physics.add.overlap(this.player, this.enemy_projectiles, playerProjectileCollision.bind(this));
        this.physics.add.overlap(this.enemy_projectiles, this.enemies, projectileEnemyCollision.bind(this));

        //UI
        this.score_text = this.add.text(20, 20, "SCORE: 0");
        this.health_text = this.add.text(150, 20, "LIVES: 0");
        this.pauseLayer = this.add.sprite(game.config.width/2, game.config.height/2, 'white square').setTint(0x010101).setAlpha(0.3).setScale(20,20).setOrigin(0.5).setDepth(5).setVisible(false);
        this.paused = false;
        updateUI();

        this.anims.create({
            key: "fran idle left",
            frameRate: 12,
            frames: this.anims.generateFrameNumbers("fran idle left", {start: 0, end: 5}),
            repeat: -1
        });
        this.anims.create({
            key: "fran idle right",
            frameRate: 12,
            frames: this.anims.generateFrameNumbers("fran idle right", {start: 0, end: 5}),
            repeat: -1  
        });
        this.anims.create({
            key: "fran run left",
            frameRate: 12,
            frames: this.anims.generateFrameNumbers("fran run left", {start: 0, end: 5}),
            repeat: -1
        });
        this.anims.create({
            key: "fran run right",
            frameRate: 12,
            frames: this.anims.generateFrameNumbers("fran run right", {start: 0, end: 5}),
            repeat: -1
        });
        this.anims.create({
            key: "fran dash left",
            frameRate: 12,
            frames: this.anims.generateFrameNumbers("fran dash left", {start: 0, end: 5}),
            repeat: -1
        })
        this.anims.create({
            key: "fran dash right",
            frameRate: 12,
            frames: this.anims.generateFrameNumbers("fran dash right", {start: 0, end: 5}),
            repeat: -1
        })
        this.anims.create({
            key: "fran damage left",
            frameRate: 12,
            frames: this.anims.generateFrameNumbers("fran damage left", {start: 0, end: 0}),
            repeat: -1
        })
        this.anims.create({
            key: "fran damage right",
            frameRate: 12,
            frames: this.anims.generateFrameNumbers("fran damage right", {start: 0, end: 0}),
            repeat: -1
        })

        // charger animations
        this.anims.create({
            key: "charger move left",
            frameRate: 12,
            frames: this.anims.generateFrameNumbers("charger move left", {start: 0, end: 5}),
            repeat: -1
        })
        this.anims.create({
            key: "charger move right",
            frameRate: 12,
            frames: this.anims.generateFrameNumbers("charger move right", {start: 0, end: 5}),
            repeat: -1
        })
        this.anims.create({
            key: "charger damage left",
            frameRate: 1,
            frames: this.anims.generateFrameNumbers("charger damage left", {start: 0, end: 0}),
            repeat: -1
        })
        this.anims.create({
            key: "charger damage right",
            frameRate: 1,
            frames: this.anims.generateFrameNumbers("charger damage right", {start: 0, end: 0}),
            repeat: -1
        })

        // golem animation
        this.anims.create({
            key: "golem move right",
            frameRate: 1,
            frames: this.anims.generateFrameNumbers("golem move right", {start: 0, end: 0}),
            repeat: -1
        })
        this.anims.create({
            key: "golem move left",
            frameRate: 1,
            frames: this.anims.generateFrameNumbers("golem move left", {start: 0, end: 0}),
            repeat: -1
        })
        game_script.readNextPart(this);
    }

    /*
    update: updates scene every frame
        @ time: total time that the game has been running
        @ delta: number of milliseconds since update was last called
    */
    update(time, delta){
        if (game_script.reading_script) {
            game_script.updateScript(delta);
            return;
        }
        //pause the game
        if (Phaser.Input.Keyboard.JustDown(key_esc)){
            this.paused = !this.paused;
        }
        if (this.paused){
            pause();
            return;
        } else {
            resume();
        }

        //update player 
        this.player.update(time, delta);

        //update enemies
        updateEnemies(time, delta);

        //update UI
        updateUI();

        //testing
    }
}
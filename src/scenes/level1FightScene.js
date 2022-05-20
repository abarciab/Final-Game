class level1FightScene extends Phaser.Scene {
    constructor() {
        super("level1FightScene");
    }

    preload(){
        this.load.image('white square', './assets/player/white square.png');
        this.load.image('white hexagon', './assets/player/white hexagon.png');
        this.load.image('white arrow', './assets/white arrow.png');
        this.load.image('player heart', './assets/player/player_heart.png');
        this.load.image('player half heart', './assets/player/player_heart_half.png');
        this.load.image('player empty heart', './assets/player/player_heart_empty.png');
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

        this.load.image('charger', './assets/enemies/charger.png');
        this.load.spritesheet('charger move left', './assets/enemies/charger_move_left.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 5});
        this.load.spritesheet('charger move right', './assets/enemies/charger_move_right.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 5});
        this.load.spritesheet('charger damage left', './assets/enemies/charger_damage_left.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 0});
        this.load.spritesheet('charger damage right', './assets/enemies/charger_damage_right.png', {frameWidth: 32, frameHeight: 32, start: 0, end: 0});

        this.load.spritesheet('golem move left', './assets/enemies/golem.png', {frameWidth: 50, frameHeight: 50, start: 0, end: 0});
        this.load.spritesheet('golem move right', './assets/enemies/golem.png', {frameWidth: 50, frameHeight: 50, start: 0, end: 0});

        this.load.spritesheet('dog idle left', './assets/enemies/dog_idle_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 3});
        this.load.spritesheet('dog idle right', './assets/enemies/dog_idle_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 3});
        this.load.spritesheet('dog move left', './assets/enemies/dog_run_left.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 2});
        this.load.spritesheet('dog move right', './assets/enemies/dog_run_right.png', {frameWidth: 48, frameHeight: 48, start: 0, end: 2});

        this.load.image('shooter', './assets/enemies/shooter.png');
        this.load.spritesheet('shooter move left', './assets/enemies/shooter.png', {frameWidth: 50, frameHeight: 50, start: 0, end: 0});
        this.load.spritesheet('shooter move right', './assets/enemies/shooter.png', {frameWidth: 50, frameHeight: 50, start: 0, end: 0});


        this.load.image('textbox', './assets/textbox.png');
        //tilemap and environment sprites
        this.load.image('door', './assets/objects/door.png');
        this.load.image('button', './assets/objects/button.png');
        this.load.image('tiles', './assets/tilemaps/tiles.png');
        this.load.tilemapTiledJSON('level_1_map','./assets/tilemaps/demoMap.json');
        //this.load.tilemapTiledJSON('map','./assets/tilemaps/bounceDemo.json');

        //script
        this.load.json('scriptData', './scripts/gameScript.json');
    }

    create(){
        //intialize game_settings, current_scene, and setup keys
        initialize(this);

        //player
        this.player = new Player(game.config.width/2, game.config.height/2, 'fran idle right');
        this.camera = this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        //enemies
        this.enemies = [];
        this.enemy_projectiles = new ProjectileGroup('white arrow');
        this.enemy_shockwaves = new ShockwaveGroup('white arrow');
        this.text_sfx;
        
        //tilemap
        const map = this.make.tilemap({key: 'level_1_map', tileWidth: 64, tileHeight: 64});
        this.tileset = map.addTilesetImage('tiles 1', 'tiles');
        const layer0 = map.createLayer('0', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer1 = map.createLayer('1', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer2 = map.createLayer('2', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const marker_layer = map.createLayer('markers', this.tileset, 0, 0).setScale(game_settings.tilemap_scale).setAlpha(0);
        setupDoorsAndButtons(map);
        this.collision_rects = [];
        this.lava_rects = [];
        this.destructibles = [];
        setupTilemapCollisions(layer0);
        setupTilemapCollisions(layer1);
        setupTilemapCollisions(layer2);
        setupTilemapCollisions(marker_layer);

        //enemy collisions
        this.addColliders();
        createAnimations();

        //UI
        this.pauseLayer = this.add.sprite(game.config.width/2, game.config.height/2, 'white square').setTint(0x010101).setAlpha(0.3).setScale(20,20).setOrigin(0.5).setDepth(5).setVisible(false);
        this.paused = false;

        //updateUI();
        this.game_UI = new GameUI();
        this.game_UI.setPlayerUI();

        game_settings.next_scene = `level1BossScene`;
        game_script.readNextPart(this);
    }

    addColliders() {

        //player
        this.physics.add.collider(this.player, this.collision_rects, playerWallCollision.bind(this));
        this.physics.add.collider(this.player, this.doors);
        this.physics.add.overlap(this.player, this.lava_rects, playerLavaCollision.bind(this));

        //enimies
        this.enemyCollider = this.physics.add.collider(this.player, this.enemies, playerEnemyCollision.bind(this));
        this.physics.add.overlap(this.enemies, this.lava_rects, enemyLavaCollision.bind(this));
        this.physics.add.overlap(this.player, this.destructibles, playerDestructibleCollision.bind(this));
        this.physics.add.collider(this.enemies, this.enemies, enemyOnEnemyCollision.bind(this));
        this.physics.add.overlap(this.player, this.enemy_shockwaves, playerShockwaveCollision.bind(this));

        //projectiles
        this.physics.add.collider(this.enemy_projectiles.getChildren(), this.collision_rects, function(projectile, wall) {
            //console.log(projectile);
            projectile.reset();
        });
        this.physics.add.overlap(this.player, this.enemy_projectiles, playerProjectileCollision.bind(this));
        this.physics.add.overlap(this.enemy_projectiles, this.enemies, projectileEnemyCollision.bind(this));
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
        checkPlayerLavaCollision();

        //update enemies
        updateEnemies(time, delta);

        //update UI
        this.game_UI.update();
    }
}
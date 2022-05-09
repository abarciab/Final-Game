class level1FightScene extends Phaser.Scene {
    constructor() {
        super("level1FightScene");
    }

    preload(){
        this.load.image('white square', './assets/white square.png');
        this.load.image('white hexagon', './assets/white hexagon.png');
        this.load.image('white arrow', './assets/white arrow.png');

        this.load.image('charger', './assets/charger.png');
        this.load.image('golem', './assets/golem.png');
        this.load.image('shooter', './assets/shooter.png');

        //tilemap
        this.load.image('tiles', './assets/tilemaps/tiles.png');
        this.load.tilemapTiledJSON('map','./assets/tilemaps/map1.json');
        
    }

    create(){
        //intialize game_settings, current_scene, and setup keys
        initialize(this);

        //player
        this.player = new Player(game.config.width/3, game.config.height/2, 'white square').setDepth(1);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        //enemies
        this.enemies = [];
        this.enemy_projectiles = new ProjectileGroup('white arrow');
        //spawnEnemy("CHARGER");
        //spawnEnemy("GOLEM");
        //spawnEnemy("SHOOTER");

        //tilemap
        const map = this.make.tilemap({key: 'map', tileWidth: 64, tileHeight: 64});
        this.tileset = map.addTilesetImage('tiles 1', 'tiles');
        const layer0 = map.createLayer('0', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer1 = map.createLayer('1', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer2 = map.createLayer('2', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const marker_layer = map.createLayer('markers', this.tileset, 0, 0).setScale(game_settings.tilemap_scale).setAlpha(0);
        this.collision_rects = [];
        this.lava_rects = [];

        setupTilemapCollisions(layer0);
        setupTilemapCollisions(layer1);
        setupTilemapCollisions(layer2);
        setupTilemapCollisions(marker_layer);

        //collisions
        this.physics.add.collider(this.player, this.collision_rects);
        this.physics.add.overlap(this.player, this.lava_rects, playerLavaCollision.bind(this));

        

        //enemy collisions
        this.physics.add.overlap(this.player, this.enemies, playerEnemyCollision.bind(this));
        this.physics.add.overlap(this.player, this.enemy_projectiles, playerProjectileCollision.bind(this));
        this.physics.add.overlap(this.enemy_projectiles, this.enemies, projectileEnemyCollision.bind(this));

        //UI
        this.score_text = this.add.text(20, 20, "SCORE: 0");
        this.health_text = this.add.text(150, 20, "LIVES: 0");
        this.pauseLayer = this.add.sprite(game.config.width/2, game.config.height/2, 'white square').setTint(0x010101).setAlpha(0.3).setScale(20,20).setOrigin(0.5).setDepth(5).setVisible(false);
        this.paused = false;
        updateUI();
    }

    /*
    update: updates scene every frame
        @ time: total time that the game has been running
        @ delta: number of milliseconds since update was last called
    */
    update(time, delta){
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

class level1BossScene extends Phaser.Scene {
    constructor() {
        super("level1BossScene");
    }

    preload(){
        this.load.tilemapTiledJSON('map','./assets/tilemaps/level1BossRoom.json');
    }

    create(){
        //intialize game_settings, current_scene, and setup keys
        initialize(this);
        initBoss1();

        //player
        this.player = new Player(game.config.width/3, game.config.height/2, 'fran idle right');
        this.camera = this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        //enemies
        this.enemies = [];
        this.enemy_projectiles = new ProjectileGroup('white arrow');
        this.text_sfx;
        
        //tilemap
        const map = this.make.tilemap({key: 'map', tileWidth: 64, tileHeight: 64});
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
        
        //UI
        this.pauseLayer = this.add.sprite(game.config.width/2, game.config.height/2, 'white square').setTint(0x010101).setAlpha(0.3).setScale(20,20).setOrigin(0.5).setDepth(5).setVisible(false);
        this.paused = false;

        //updateUI();
        this.game_UI = new GameUI();
        this.game_UI.setPlayerUI();

        //doggo
        this.ball = this.physics.add.sprite(game.config.width/2, game.config.height/2, 'white hexagon').setScale(0.5);
        this.ball.body.bounce.set(0.5);
        this.ball.body.setMass(0.1);
        this.ball.setDrag(0.9);
        this.ball.setDamping(true);
        this.ball.deflected = false;
        this.doggo = new Dog(200, 200, 'dog idle right');

        //hank
        this.hank = new Hank1(800, 350, 'white hexagon').setTint(0xa0a0a0).setScale(1.5);

        //enemy collisions
        this.addColliders();

        game_script.readNextPart(this);
    }

    addColliders() {
        //player
        this.physics.add.collider(this.player, this.collision_rects, playerWallCollision.bind(this));
        this.physics.add.collider(this.player, this.doors);
        this.physics.add.overlap(this.player, this.lava_rects, playerLavaCollision.bind(this));
        this.physics.add.overlap(this.player, this.destructibles, playerDestructibleCollision.bind(this));

        //enemy
        this.enemyCollider = this.physics.add.collider(this.player, this.enemies, playerEnemyCollision.bind(this));
        this.physics.add.overlap(this.player, this.enemy_projectiles, playerProjectileCollision.bind(this));
        this.physics.add.overlap(this.enemy_projectiles, this.enemies, projectileEnemyCollision.bind(this));
        this.physics.add.overlap(this.enemies, this.lava_rects, enemyLavaCollision.bind(this));
        this.physics.add.collider(this.enemies, this.enemies, enemyOnEnemyCollision.bind(this));

        //ball and (player/walls)
        this.physics.add.collider(this.ball, this.collision_rects, function() {current_scene.ball.deflected = false})
        this.physics.add.overlap(this.player, this.ball, playerProjectileCollision.bind(this));
        this.physics.add.overlap(this.player, this.ball, function() {if (current_scene.player.dashing == true){current_scene.ball.deflected = true} });
        
        //player and dog
        this.physics.add.overlap(this.player, this.doggo, function () {
            if (current_scene.hank.health <= 0){
                return;
            }
            if (current_scene.player.dashing){
                current_scene.doggo.setVelocity(0, 0);
                current_scene.doggo.speed = 0;
                current_scene.time.delayedCall(1000, function(){current_scene.doggo.speed = game_settings.dog_speed})
                current_scene.player.doneDashing();
                current_scene.player.body.setVelocity(0,0);
            } else if (current_scene.doggo.speed > 0 && !current_scene.doggo.has_ball) {
                current_scene.player.damage(current_scene.doggo);
            }
        });

        //ball and dog
        this.physics.add.overlap(this.doggo, this.ball, function() {
            if (current_scene.ball.deflected == true && current_scene.ball.current_speed > 10){
                return;
            }
            if (current_scene.ball.active == true && current_scene.doggo.speed > 0){
                current_scene.ball.deflected = false;
                current_scene.doggo.has_ball = true; 
                current_scene.ball.setActive(false).setVisible(false);
            }
        });
        
        //ball and hank
        this.physics.add.overlap(this.ball, this.hank, function() {
            if (current_scene.ball.deflected == true){
                current_scene.hank.has_ball = true;
                current_scene.ball.setActive(false);
                current_scene.ball.setVisible(false);
            }
        });

        //doggo and hank
        this.physics.add.overlap(this.doggo, this.hank, function() {
            if (current_scene.hank.health <= 0) { return;}
            if (current_scene.doggo.has_ball == true){
                current_scene.throwBall();
            } else if (current_scene.hank.has_ball){
                console.log("Hank was tackled by the doggo!!! (1 damage) ");
                current_scene.hank.damage();
                current_scene.throwBall();
            }
        })
    }

    throwBall(){
        current_scene.doggo.has_ball = false;
        current_scene.hank.has_ball = false;
        current_scene.doggo.setVelocity(0, 0);
        current_scene.doggo.speed = 0;
        current_scene.time.delayedCall(1000, function(){current_scene.doggo.speed = game_settings.dog_speed})

        //console.log("ball returned to hank");
        current_scene.ball.x = current_scene.hank.x;
        current_scene.ball.y = current_scene.hank.y;
        current_scene.ball.speed = 400;
        moveTo(current_scene.ball, current_scene.player);
        //current_scene.ball.body.setVelocity(-100, 600);

        current_scene.ball.setVisible(true);
        current_scene.ball.setActive(true);
    }

    /*
    update: updates scene every frame
        @ time: total time that the game has been running
        @ delta: number of milliseconds since update was last called
    */
    update(time, delta){
        this.ball.current_speed = Math.sqrt(Math.pow(this.ball.body.velocity.y, 2) + Math.pow(this.ball.body.velocity.x, 2));

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
        this.doggo.update();
        updateEnemies(time, delta);

        //update UI
        //updateUI();
        this.game_UI.update();

        if (this.physics.overlap(this.player, this.lava_rects)) {
            this.player.on_lava = true;
            //console.log("on lava");
        }
        else {
            this.player.on_lava = false;
            //console.log("not on lava");
        }
    }
}
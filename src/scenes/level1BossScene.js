class level1BossScene extends Phaser.Scene {
    constructor() {
        super("level1BossScene");
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
        this.enemy_shockwaves = new ShockwaveGroup('shockwave');
        this.text_sfx;
        
        //tilemap
        const map = this.make.tilemap({key: 'bossMap', tileWidth: 64, tileHeight: 64});
        this.tileset = map.addTilesetImage('tiles 1', 'tiles');
        const layer0 = map.createLayer('0', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer1 = map.createLayer('1', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer2 = map.createLayer('2', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const marker_layer = map.createLayer('markers', this.tileset, 0, 0).setScale(game_settings.tilemap_scale).setAlpha(0);
        setupInteractables(map);
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
        //this.hank.health = 0;

        //enemy collisions
        this.addColliders();

        //UI
        this.boss_box = this.add.sprite(0, 0, 'boss health box').setScale(6, 1.5).setDepth(0.1);
        this.boss_bar = this.add.rectangle(0, 0, this.boss_box.displayWidth, this.boss_box.displayHeight, 0xFF0000).setOrigin(0, 0.5);
        this.endRect = this.add.rectangle(0, 0, game.config.width, game.config.height, 0xFFFFFF).setScale(50).setAlpha(0);
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
                current_scene.stunDog(1500);
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
                current_scene.hankCatchBall();
            }
        });

        //doggo and hank
        this.physics.add.overlap(this.doggo, this.hank, function() {
            if (current_scene.hank.health <= 0 || current_scene.doggo.stun_time > 0) { return;}
            
            if (current_scene.doggo.has_ball == true){
                if (current_scene.hank.stun_time <= 0){
                    current_scene.hank.stun_time = 800;
                    current_scene.stunDog(2000);
                    current_scene.time.delayedCall(700, function(){current_scene.throwBall();})
                } 
            } 
            else if (current_scene.hank.has_ball){
                console.log("dog damaged hank");
                current_scene.ball.deflected = false;
                current_scene.boss_bar.displayWidth -= 144.75;
                current_scene.stunDog(2000);
                current_scene.hank.damage();
                current_scene.hank.has_ball = false;
                current_scene.hank.stun_time = 800;
                current_scene.time.delayedCall(700, function(){current_scene.throwBall();})
            }
        })

        //hank and wall and lava
        this.physics.add.collider(this.hank, this.collision_rects, function(){current_scene.hank.pickNewDestination()});
        this.physics.add.collider(this.hank, this.lava_rects, function(){current_scene.hank.pickNewDestination()});
    }

    hankCatchBall(){
        current_scene.hank.has_ball = true;
        current_scene.ball.setActive(false);
        current_scene.ball.setVisible(false);
    }

    throwBall(){
        current_scene.doggo.has_ball = false;
        current_scene.hank.has_ball = false;
        current_scene.stunDog(500);

        //console.log("ball returned to hank");
        current_scene.ball.x = current_scene.hank.x;
        current_scene.ball.y = current_scene.hank.y;
        current_scene.ball.speed = 400;
        moveTo(current_scene.ball, current_scene.player);
        //current_scene.ball.body.setVelocity(-100, 600);

        current_scene.ball.setVisible(true);
        current_scene.ball.setActive(true);
    }

    stunDog(time){
        current_scene.doggo.setVelocity(0, 0);
        current_scene.doggo.speed = 0;
        current_scene.time.delayedCall(time, function(){current_scene.doggo.speed = game_settings.dog_speed})
    }

    /*
    update: updates scene every frame
        @ time: total time that the game has been running
        @ delta: number of milliseconds since update was last called
    */
    update(time, delta){
        //update player 
        this.player.update(time, delta);

        //update enemies
        this.doggo.update(time, delta);

        //update ball
        this.ball.current_speed = Math.sqrt(Math.pow(this.ball.body.velocity.y, 2) + Math.pow(this.ball.body.velocity.x, 2));

        if (this.hank.health <= 0 && !this.done ){
            this.done = true;
            this.enemies.forEach(enemy => {
                if (enemy.active || enemy.visible){
                    this.done = false;
                }
            });

            if (this.done){
                this.endScene();
                return;
            }            
        }

        if (this.done){
            return;
        }

        

        let bos_box_pos = getCameraCoords(current_scene.camera, game.config.width/2, game.config.height - 50);
        this.boss_box.setPosition(bos_box_pos.x, bos_box_pos.y);
        //let bos_bar_pos = getCameraCoords(current_scene.camera, game.config.width/2, game.config.height - 50);
        this.boss_bar.setPosition(bos_box_pos.x-this.boss_box.displayWidth/2, bos_box_pos.y);

        /*if (game_script.reading_script) {
            game_script.updateScript(delta);
            return;
        }*/
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

        
        updateEnemies(time, delta);
        this.hank.update(time, delta);

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

    endScene(){
        this.doggo.setDepth(this.player.depth - 0.1);
        this.boss_bar.setVisible(false);
        this.boss_box.setVisible(false);
        this.tweens.add({
            duration: 3000,
            targets: this.endRect,
            alpha: 1,
            onComplete: function() {console.log("GAME COMPLETE")},
        })
    }
}
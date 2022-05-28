class level1FightScene extends Phaser.Scene {
    constructor() {
        super("level1FightScene");
    }

    
    preload(){
        
    }

    create(){
        //intialize game_settings, current_scene, and setup keys
        initialize(this);

        //player
        this.player = new Player(game.config.width/2, game.config.height/2, 'fran idle right');
        this.bg_music = this.sound.add('level', {volume: 0.5});
        this.bg_music.setLoop(true).play();
        //health pickups
        this.pickups = [];
        this.pickup_sfx = this.sound.add('health pickup'); 
        this.physics.add.overlap(this.player, this.pickups, function(player, pickup) {
            if (pickup.visible == false){
                return;
            }
            if (player.health < game_settings.player_max_health){
                pickup.setVisible(false); player.health += 0.5;
                current_scene.pickup_sfx.play({volume: 0.4});
            }
        
        });

        //enemies
        this.enemies = [];
        this.enemy_projectiles = new ProjectileGroup('white arrow');
        this.enemy_shockwaves = new ShockwaveGroup('shockwave');
        
        //tilemap
        const map = this.make.tilemap({key: 'level_1_map', tileWidth: 64, tileHeight: 64});

        this.tileset = map.addTilesetImage('tiles 1', 'tiles');
        const layer0 = map.createLayer('0', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer1 = map.createLayer('1', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer2 = map.createLayer('2', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const marker_layer = map.createLayer('markers', this.tileset, 0, 0).setScale(game_settings.tilemap_scale).setAlpha(0);
        const lights_objects = map.createFromObjects('lights', {name: '', key: 'light'});
        lights_objects.forEach(light => {
            light.setAlpha(0.45);
        });
        setupInteractables(map);
        setupEnemies(map);
        this.collision_rects = [];
        this.lava_rects = [];
        this.destructibles = [];
        setupTilemapCollisions(layer0);
        setupTilemapCollisions(layer1);
        setupTilemapCollisions(layer2);
        setupTilemapCollisions(marker_layer);
        this.camera = this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        //enemy collisions
        this.addColliders();

        //UI
        this.pauseLayer = this.add.sprite(game.config.width/2, game.config.height/2, 'white square').setTint(0x010101).setAlpha(0.3).setScale(20,20).setOrigin(0.5).setDepth(5).setVisible(false);
        this.paused = false;
        this.vignette = this.add.sprite(0, 0, 'vignette').setDepth(4).setOrigin(0).setAlpha(0.7).setTint(0x000000);

        //updateUI();
        this.game_UI = new GameUI();
        this.game_UI.setPlayerUI();

        game_settings.next_scene = `level1BossScene`;
        game_script.readScript(this, 1, 2);
        
    }

    addColliders() {
        //player
        this.physics.add.collider(this.player, this.collision_rects, playerWallCollision.bind(this));
        this.physics.add.collider(this.player, this.doors);
        this.physics.add.overlap(this.player, this.lava_rects, playerLavaCollision.bind(this));
        this.physics.add.collider(this.pickups, this.collision_rects);

        //enemies
        this.enemyCollider = this.physics.add.collider(this.player, this.enemies, playerEnemyCollision.bind(this));
        this.physics.add.collider(this.enemies, this.collision_rects, (enemy, collision_rect) => {
            if (collision_rect.deadly == true){
                enemy.die();
            }
        });
        this.physics.add.collider(this.enemies, this.doors);
        
        this.physics.add.collider(this.enemies, this.lava_rects, enemyLavaCollision.bind(this));
        this.physics.add.overlap(this.player, this.destructibles, playerDestructibleCollision.bind(this));
        this.physics.add.collider(this.enemies, this.enemies, enemyOnEnemyCollision.bind(this));
        this.physics.add.collider(this.player, this.enemy_shockwaves, playerShockwaveCollision.bind(this));

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
        let vignettePos = getCameraCoords(null, 0, 0);
        this.vignette.setPosition(vignettePos.x, vignettePos.y);
    }
}
function initializeScene(scene) {
    current_scene = scene;
    pointer = current_scene.input.activePointer; 
    
    scene.cameras.main.setZoom(game_settings.camera_zoom);
    scene.cameras.main.setBackgroundColor('#000000');
    scene.cam_pos_x = getCameraCoords(null, 0, 0).x;
    scene.cam_pos_y = getCameraCoords(null, 0, 0).y;
    scene.physics.world.setBounds(0, 0, game.config.width, game.config.height);
    setupKeys(scene);
}

function initializeLevel(scene) {
    // stuff
    initializeScene(scene);

    //player
    scene.player = new Player(game.config.width/2, game.config.height/2, 'fran idle right');
    scene.level_finished = false;
    
    //health pickups
    scene.pickups = [];
    scene.pickup_sfx = scene.sound.add('health pickup'); 

    //enemies
    scene.enemies = [];
    scene.enemy_projectiles = new ProjectileGroup('shooter bullet');
    scene.enemy_shockwaves = new ShockwaveGroup('shockwave');
    
    initMap()
    scene.camera = scene.cameras.main.startFollow(scene.player, true, 0.05, 0.05);

    //enemy collisions
    addColliders(scene);

    //UI
    scene.pauseLayer = scene.add.sprite(game.config.width/2, game.config.height/2, 'white square').setTint(0x010101).setAlpha(0.3).setScale(20,20).setOrigin(0.5).setDepth(5).setVisible(false);
    scene.paused = false;
    scene.vignette = scene.add.sprite(0, 0, 'vignette').setDepth(6).setOrigin(0).setAlpha(0.7).setTint(0x000000).setScale(1.1);

    //updateUI();
    scene.game_UI = new GameUI();
    scene.game_UI.setPlayerUI();
    //createPauseMenu();
}

function initMap() {
    console.log("init map");
    //tilemap
    const map = current_scene.make.tilemap({key: current_map, tileWidth: 64, tileHeight: 64});

    current_scene.tileset = map.addTilesetImage('tiles 1', 'tiles');
    const layer0 = map.createLayer('0', current_scene.tileset, 0, 0).setScale(game_settings.tilemap_scale);
    const layer1 = map.createLayer('1', current_scene.tileset, 0, 0).setScale(game_settings.tilemap_scale);
    const layer2 = map.createLayer('2', current_scene.tileset, 0, 0).setScale(game_settings.tilemap_scale);
    const marker_layer = map.createLayer('markers', current_scene.tileset, 0, 0).setScale(game_settings.tilemap_scale).setAlpha(0);
    const lights_objects = map.createFromObjects('lights', {name: '', key: 'light'});
    lights_objects.forEach(light => {
        light.setAlpha(0.45);
    });
    setupInteractables(map);
    if (current_scene.enemies != undefined) 
        setupEnemies(map);
    current_scene.collision_rects = [];
    current_scene.lava_rects = [];
    current_scene.destructibles = [];
    setupTilemapCollisions(layer0);
    setupTilemapCollisions(layer1);
    setupTilemapCollisions(layer2);
    setupTilemapCollisions(marker_layer);
}

function createPauseMenu(){
    let pause_menu = {};

    game_settings.sfx_vol = 1;
    pause_menu.button_hover_sfx = current_scene.sound.add('button hover 2'); 
    pause_menu.background = current_scene.add.rectangle(0, 0, game.config.width*20, game.config.height*20, 0x000000).setAlpha(0.5);
    pause_menu.title = current_scene.add.sprite(game.config.width/2, 140, 'pause title').setScale(4);
    
    pause_menu.music_vol = current_scene.add.sprite(game.config.width/2, 370, 'music button').setScale(3).setDepth(100).setInteractive();
    pause_menu.music_vol_icon = current_scene.add.sprite(game.config.width/2 + pause_menu.music_vol.displayWidth/3, 370, 'vol icon low').setScale(2).setDepth(100);
    pause_menu.music_vol.on('pointerover', function(){
        pause_menu.button_hover_sfx.play({volume: 0.3});
        pause_menu.music_vol.setTint(0xcccccc);
    })
    pause_menu.music_vol.on('pointerout', function(){
        pause_menu.music_vol.clearTint();
    })
    pause_menu.music_vol.on('pointerdown', function(){
        game_settings.music_vol += 0.33;
        if (game_settings.music_vol > 1){
            game_settings.music_vol = 0;
            pause_menu.music_vol_icon.setTexture('vol icon mute');
        }

        if (game_settings.music_vol > 0.66){
            pause_menu.music_vol_icon.setTexture('vol icon high');
        }
        else if (game_settings.music_vol > 0.33){
            pause_menu.music_vol_icon.setTexture('vol icon med');
        }
        else if (game_settings.music_vol > 0){
            pause_menu.music_vol_icon.setTexture('vol icon low');
        }
        bg_music.setVolume(0.3 * game_settings.music_vol);
    })
    

    pause_menu.sfx_vol = current_scene.add.sprite(game.config.width/2, 470, 'sounds button').setScale(3).setDepth(100).setInteractive();
    pause_menu.sfx_vol_icon = current_scene.add.sprite(game.config.width/2 + pause_menu.music_vol.displayWidth/3, 470, 'vol icon med').setScale(2).setDepth(100);
    pause_menu.sfx_vol.on('pointerover', function(){
        pause_menu.button_hover_sfx.play({volume: 0.3});
        pause_menu.sfx_vol.setTint(0xcccccc);
    })
    pause_menu.sfx_vol.on('pointerout', function(){
        pause_menu.sfx_vol.clearTint();
    })
    pause_menu.sfx_vol.on('pointerdown', function(){
        game_settings.sfx_vol += 0.33;
        if (game_settings.sfx_vol > 1){
            game_settings.sfx_vol = 0;
            pause_menu.sfx_vol_icon.setTexture('vol icon mute');
        }
        if (game_settings.sfx_vol > 0.66){
            pause_menu.sfx_vol_icon.setTexture('vol icon high');
        }
        else if (game_settings.sfx_vol > 0.33){
            pause_menu.sfx_vol_icon.setTexture('vol icon med');
        }
        else if (game_settings.sfx_vol > 0){
            pause_menu.sfx_vol_icon.setTexture('vol icon low');
        }
        
    })

    pause_menu.resume = current_scene.add.sprite(game.config.width/2, 570, 'resume button').setScale(3).setDepth(100).setInteractive();
    pause_menu.resume.on('pointerover', function(){
        pause_menu.button_hover_sfx.play({volume: 0.3});
        pause_menu.resume.setTint(0xcccccc);
    })
    pause_menu.resume.on('pointerout', function(){
        pause_menu.resume.clearTint();
    })
    pause_menu.resume.on('pointerdown', function(){
        resume();
        current_scene.paused = false;
    })

    pause_menu.exit = current_scene.add.sprite(game.config.width/2, 670, 'title screen button').setScale(3).setDepth(100).setInteractive();
    pause_menu.exit.on('pointerover', function(){
        pause_menu.button_hover_sfx.play({volume: 0.3});
        pause_menu.exit.setTint(0xcccccc);
    })
    pause_menu.exit.on('pointerout', function(){
        pause_menu.exit.clearTint();
    })
    pause_menu.exit.on('pointerdown', function(){
        bg_music.stop();
        current_scene.sound.stopAll();
        current_scene.scene.start("titleScene");
    })
    
    current_scene.pause_menu = pause_menu;
}

function createLevelSelect(){
    let level_select = current_scene.level_select = {};
    level_select.background = current_scene.add.rectangle(0, 0, game.config.width*20, game.config.height*20, 0x000000).setAlpha(0.5);
    let top = 100;
    level_select.level1 = current_scene.add.sprite(game.config.width/2, top, 'level 1 label').setInteractive().setScale(3);
        level_select.level1.on('pointerover', () => {
            level_select.level1.setTint(0xcccccc);
        })
        level_select.level1.on('pointerout', () => {
            level_select.level1.clearTint();
        })
        level_select.level1.on('pointerdown', () => {
            bg_music.stop();
            current_map = 'level 1.0 map';
            current_scene.scene.start("level1FightScene");
        })

    level_select.level2 = current_scene.add.sprite(game.config.width/2, top + 100, 'level 2 label').setInteractive().setScale(3);
        level_select.level2.on('pointerover', () => {
            level_select.level2.setTint(0xcccccc);
        })
        level_select.level2.on('pointerout', () => {
            level_select.level2.clearTint();
        })
        level_select.level2.on('pointerdown', () => {
            bg_music.stop();
            current_map = 'level 1.1 map';
            current_scene.scene.start("level1FightScene");
        })
    level_select.level3 = current_scene.add.sprite(game.config.width/2, top + 200, 'level 3 label').setInteractive().setScale(3);
        level_select.level3.on('pointerover', () => {
            level_select.level3.setTint(0xcccccc);
        })
        level_select.level3.on('pointerout', () => {
            level_select.level3.clearTint();
        })
        level_select.level3.on('pointerdown', () => {
            bg_music.stop();
            current_map = 'level 1.2 map';
            current_scene.scene.start("level1FightScene");
        })
    level_select.level4 = current_scene.add.sprite(game.config.width/2, top + 300, 'level 4 label').setInteractive().setScale(3);
        level_select.level4.on('pointerover', () => {
            level_select.level4.setTint(0xcccccc);
        })
        level_select.level4.on('pointerout', () => {
            level_select.level4.clearTint();
        })
        level_select.level4.on('pointerdown', () => {
            bg_music.stop();
            current_map = 'level 1.3 map';
            current_scene.scene.start("level1FightScene");
        })
    level_select.level5 = current_scene.add.sprite(game.config.width/2, top + 400, 'level 5 label').setInteractive().setScale(3);
        level_select.level5.on('pointerover', () => {
            level_select.level5.setTint(0xcccccc);
        })
        level_select.level5.on('pointerout', () => {
            level_select.level5.clearTint();
        })
        level_select.level5.on('pointerdown', () => {
            bg_music.stop();
            current_map = 'level 1.4 map';
            current_scene.scene.start("level1FightScene");
        })
    level_select.bossFight = current_scene.add.sprite(game.config.width/2, top + 500, 'boss fight label').setInteractive().setScale(3);
        level_select.bossFight.on('pointerover', () => {
            level_select.bossFight.setTint(0xcccccc);
        })
        level_select.bossFight.on('pointerout', () => {
            level_select.bossFight.clearTint();
        })
        level_select.bossFight.on('pointerdown', () => {
            bg_music.stop();
            current_scene.scene.start("level1BossScene");
        })

    level_select.back = current_scene.add.sprite(game.config.width/2, top + 620, 'back button').setInteractive().setScale(3);
        level_select.back.on('pointerover', () => {
            level_select.back.setTint(0xcccccc);
        })
        level_select.back.on('pointerout', () => {
            level_select.back.clearTint();
        })
        level_select.back.on('pointerdown', () => {
            closeLevelSelect();
        })
}

function openLevelSelect(){
    let ls = current_scene.level_select;
    ls.background.setVisible(true);
    ls.level1.setVisible(true);
    ls.level2.setVisible(true);
    ls.level3.setVisible(true);
    ls.level4.setVisible(true);
    ls.level5.setVisible(true);
    ls.bossFight.setVisible(true);
    ls.back.setVisible(true);
}

function closeLevelSelect(){
    let ls = current_scene.level_select;
    ls.background.setVisible(false);
    ls.level1.setVisible(false);
    ls.level2.setVisible(false);
    ls.level3.setVisible(false);
    ls.level4.setVisible(false);
    ls.level5.setVisible(false);
    ls.bossFight.setVisible(false);
    ls.back.setVisible(false);
}



function updateLevel(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(key_r)){
        game_settings.player_curr_health = game_settings.player_max_health;
        current_scene.player.health = 5;
        current_scene.scene.restart();
    }
    //update UI
    current_scene.game_UI.update();
    current_scene.cam_pos_x = getCameraCoords(null, 0, 0).x;
    current_scene.cam_pos_y = getCameraCoords(null, 0, 0).y;
    //pause the game
    if (Phaser.Input.Keyboard.JustDown(key_esc)){
        //current_scene.paused = !current_scene.paused;
        current_scene.scene.launch('pauseScene');
        current_scene.scene.pause();
    }
    /*if (current_scene.paused){
        //pause();
        return false;
    } else {
        //resume();
    }*/
    if (!current_scene.level_finished) {
        //update player 
        current_scene.player.update(time, delta);
        //update enemies
        updateEnemies(time, delta);
    }
    else {
        current_scene.player.move("RIGHT");
    }
    let vignettePos = getCameraCoords(null, 0, 0);
    current_scene.vignette.setPosition(vignettePos.x, vignettePos.y);

    return true;
}

function initBossLevel1(scene) {
    //scene.gate_positions = [];
    //scene.cameras.main.stopFollow();
    scene.camera = scene.cameras.main.startFollow(game_settings.cam_target, true, 0.05, 0.05);
    //game_settings.camera_zoom -= 0.1;
    //scene.camera.setZoom(game_settings.camera_zoom);
    //scene.cameras.main.setPosition(game_settings.cam_center.x, game_settings.cam_center.y).setOrigin(0.5);
    scene.ball = scene.physics.add.sprite(game.config.width/2, game.config.height/2, 'ball').setScale(2);
    const hitbox_radius = 20;
    scene.ball.setCircle(hitbox_radius, scene.ball.width/2-hitbox_radius, scene.ball.height/2-hitbox_radius);
    scene.ball.body.bounce.set(0.5);
    scene.ball.body.setMass(0.6);
    scene.ball.setDrag(0.9);
    scene.ball.setDamping(true);
    scene.ball.deflected = false;
    //this.hank.health = 0;

    //enemy collisions
    //this.addColliders();
    
    //UI
    scene.boss_box = scene.add.sprite(0, 0, 'boss health box').setScale(6, 1.5).setDepth(0.1);
    scene.boss_bar = scene.add.rectangle(0, 0, scene.boss_box.displayWidth, scene.boss_box.displayHeight, 0xFF0000).setOrigin(0, 0.5);
    scene.endRect = scene.add.rectangle(0, 0, game.config.width, game.config.height, 0xFFFFFF).setScale(50).setAlpha(0).setDepth(current_scene.player.depth-0.01);
}

function addColliders(scene) {
    //player
    scene.player_wall_collider = scene.physics.add.collider(scene.player, scene.collision_rects, playerWallCollision.bind(scene));
    scene.physics.add.overlap(scene.player, scene.collision_rects, checkInWall.bind(scene));
    scene.physics.add.collider(scene.player, scene.doors);
    scene.physics.add.overlap(scene.player, scene.lava_rects, playerLavaCollision.bind(scene));
    scene.physics.add.collider(scene.pickups, scene.collision_rects);
    scene.physics.add.overlap(scene.player, scene.pickups, playerHealthCollision.bind(scene));
    scene.physics.add.overlap(scene.player, scene.destructibles, playerDestructibleCollision.bind(scene));
    scene.physics.add.collider(scene.player, scene.enemy_shockwaves, playerShockwaveCollision.bind(scene));

    //enemies
    scene.enemyCollider = scene.physics.add.collider(scene.player, scene.enemies, playerEnemyCollision.bind(scene));
    scene.physics.add.collider(scene.enemies, scene.collision_rects, (enemy, collision_rect) => {
        if (collision_rect.deadly == true){
            enemy.die();
        }
    });
    scene.physics.add.collider(scene.enemies, scene.doors);
    scene.physics.add.collider(scene.enemies, scene.lava_rects, enemyLavaCollision.bind(scene));
    scene.physics.add.collider(scene.enemies, scene.enemies, enemyOnEnemyCollision.bind(scene));
    //scene.physics.add.collider(scene.enemies, scene.enemy_shockwaves, enemyShockwaveCollision.bind(scene));

    //projectiles
    scene.physics.add.collider(scene.enemy_projectiles.getChildren(), scene.collision_rects, function(projectile, wall) {
        projectile.reset();
    });
    /*this.physics.add.collider(this.enemy_projectiles.getChildren(), this.lava_rects, function(projectile, wall) {
        projectile.reset();
    });*/
    scene.physics.add.collider(scene.enemy_projectiles.getChildren(), scene.targets, function(projectile, target) {
        activateButton(target);
        projectile.reset();
    });

    scene.physics.add.overlap(scene.player, scene.enemy_projectiles, playerProjectileCollision.bind(scene));
    scene.physics.add.overlap(scene.enemy_projectiles, scene.enemies, projectileEnemyCollision.bind(scene));
}

function setupKeys(scene){
    key_left = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    key_right = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    key_up = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    key_down = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    key_space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    key_esc = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    key_prev = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    key_next = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT); 

    key_1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE); 
    key_2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO); 
    key_3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    key_4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    key_5 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);
    key_6 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX);
    key_7 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN);

    key_r = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
}

function setupInteractables(map){

    const door_sprites = map.createFromObjects('interact', {name: 'door', key: 'door'});
    const button_sprites = map.createFromObjects('interact', {name: 'button', key:'button'});
    const vase_sprites = map.createFromObjects('interact', {name: 'vase', key: 'vase'});
    const target_sprites = map.createFromObjects('interact', {name: 'target', key: 'target'});
    const instruction_sprites = map.createFromObjects('interact', {name: 'instructions', key: 'target'});
    current_scene.vases = [];
    current_scene.doors = [];
    current_scene.buttons = [];
    current_scene.targets = [];

    for (let i = 0; i < instruction_sprites.length; i++) {
        current_scene.add.sprite(instruction_sprites[i].x, instruction_sprites[i].y, instruction_sprites[i].data.list.label).setDepth(current_scene.player.depth-4).setScale(1.8);
        instruction_sprites[i].destroy();
    }

    for (let i = 0; i < target_sprites.length; i++) {
        let new_target = current_scene.add.rectangle(target_sprites[i].x, target_sprites[i].y, target_sprites[i].displayWidth, target_sprites[i].displayHeight, 0xFFFFFF).setOrigin(0.5).setAlpha(0);
        new_target.body = new Phaser.Physics.Arcade.StaticBody(current_scene.physics.world, new_target);
        current_scene.physics.add.existing(new_target);
        new_target.circuit = target_sprites[i].data.list.circuit;
        current_scene.targets.push(new_target);
    }

    for (let i = 0; i < vase_sprites.length; i++) {
        let new_vase = current_scene.add.rectangle(vase_sprites[i].x, vase_sprites[i].y, vase_sprites[i].displayWidth, vase_sprites[i].displayHeight, 0xFFFFFF).setOrigin(0.5).setAlpha(0);
        new_vase.body = new Phaser.Physics.Arcade.StaticBody(current_scene.physics.world, new_vase);
        current_scene.physics.add.existing(new_vase);
        new_vase.data_sprite = vase_sprites[i];
        new_vase.data_sprite.setScale(1);
        current_scene.vases.push(new_vase);
    }

    for(let i = 0; i < door_sprites.length; i++ ){
        //let new_door = current_scene.physics.add.sprite()
        let new_door = current_scene.add.rectangle(door_sprites[i].x, door_sprites[i].y, door_sprites[i].displayWidth, door_sprites[i].displayHeight, 0xFFFFFF).setOrigin(0.5).setAlpha(0);
        new_door.body = new Phaser.Physics.Arcade.StaticBody(current_scene.physics.world, new_door);
        current_scene.physics.add.existing(new_door);
        new_door.data_sprite = door_sprites[i];
        if (new_door.displayHeight < new_door.displayWidth){
            new_door.horizontal = true;
            new_door.data_sprite.setTexture('hori door');
            new_door.data_sprite.setScale(1);
            //new_door.data_sprite.setDepth(current_scene.player.depth + 1);
            new_door.data_sprite.setOrigin(0.5, 0);
        }
        current_scene.doors.push(new_door);
    }
    
    for(let i = 0; i < button_sprites.length; i++){
        let new_button = current_scene.add.rectangle(button_sprites[i].x, button_sprites[i].y, button_sprites[i].displayWidth, button_sprites[i].displayHeight, 0xFFFFFF).setOrigin(0.5).setAlpha(0);
        new_button.body = new Phaser.Physics.Arcade.StaticBody(current_scene.physics.world, new_button);
        current_scene.physics.add.existing(new_button);
        new_button.data_sprite = button_sprites[i];
        if (button_sprites[i].data.list.silent == true){
            new_button.silent = true;
        }
        if (new_button.data_sprite.data.list.close_door == true || new_button.data_sprite.data.list.invisible == true){
            new_button.data_sprite.setVisible(false);
        }
        current_scene.buttons.push(new_button);
    }

    current_scene.physics.add.collider(current_scene.player, current_scene.doors);
    current_scene.physics.add.overlap(current_scene.player, current_scene.buttons, function(player, button) {
        if (button.done != true){
            if (button.silent != true && button.data_sprite.visible){
                current_scene.sound.play('pressure plate', {volume: 0.8});
            }
            activateButton(button);
        }
        button.done = true;
        button.setActive(false);      
    })
    current_scene.physics.add.overlap(current_scene.player, current_scene.vases, function(player, vase){
        if (player.dashing){
            if (Phaser.Math.Between(1 ,3) == 2){
                spawnHealthPickup(vase.data_sprite.x, vase.data_sprite.y);
            }
            current_scene.sound.play('vase break', {volume: 0.8});
            vase.data_sprite.setVisible(false);
            vase.destroy();
        }
    })
}

function setupEnemies(map){

    const enemy1Sprites = map.createFromObjects('enemies', {name: 'enemy_1', key: 'button'});
    const enemy2Sprites = map.createFromObjects('enemies', {name: 'enemy_2', key:'button'});
    const enemy3Sprites = map.createFromObjects('enemies', {name: 'enemy_3', key: 'button'});
    const dasherSprites = map.createFromObjects('enemies', {name: 'dasher', key: 'button'});

    for (let i = 0; i < enemy1Sprites.length; i++) {
        let new_enemy = spawnEnemy(game_settings.enemy1_name, enemy1Sprites[i].x, enemy1Sprites[i].y, true);

        new_enemy.room = enemy1Sprites[i].data.list.room;
        
        if (enemy1Sprites[i].data.list.circuit){
            new_enemy.circuit = enemy1Sprites[i].data.list.circuit;
        }
        new_enemy.asleep = true;
    
        if (enemy1Sprites[i].data != null){
            if (enemy1Sprites[i].data.list.invisible){
                new_enemy.setVisible(false);
            }
        }
        
        enemy1Sprites[i].destroy();
        current_scene.enemies.push(new_enemy);
    }

    for (let i = 0; i < enemy2Sprites.length; i++) {
        let new_enemy = spawnEnemy(game_settings.enemy2_name, enemy2Sprites[i].x, enemy2Sprites[i].y, true);
        if (enemy2Sprites[i].data != null){
            if (enemy2Sprites[i].data.list.room != null){
                new_enemy.room = enemy2Sprites[i].data.list.room;
                new_enemy.asleep = true;
            }
            if (enemy2Sprites[i].data.list.circuit != null){
                new_enemy.circuit = enemy2Sprites[i].data.list.circuit;
            }
            if (enemy2Sprites[i].data.list.invisible == true){
                new_enemy.setVisible(false);
            }
        } else{
            console.log(enemy2Sprites[i].data.list);
        }
       

        enemy2Sprites[i].destroy();
        current_scene.enemies.push(new_enemy);
    }

    for (let i = 0; i < enemy3Sprites.length; i++) {
        let new_enemy = spawnEnemy(game_settings.enemy3_name, enemy3Sprites[i].x, enemy3Sprites[i].y, true);
        if (enemy3Sprites[i].data != null){
            if (enemy3Sprites[i].data.list.room != null){
                new_enemy.room = enemy3Sprites[i].data.list.room;
                new_enemy.asleep = true;
            }
            if (enemy3Sprites[i].data.list.circuit != null){
                new_enemy.circuit = enemy3Sprites[i].data.list.circuit;
            } 
            if (enemy3Sprites[i].data.list.invisible == true){
                new_enemy.setVisible(false);
            }
        }
        

        enemy3Sprites[i].destroy();
        current_scene.enemies.push(new_enemy);
    }

    for (let i = 0; i < dasherSprites.length; i++) {
        let new_enemy = spawnEnemy("DASHER", dasherSprites[i].x, dasherSprites[i].y, true);
        if (dasherSprites[i].data != null){
            if (dasherSprites[i].data.list.room != null){
                new_enemy.room = dasherSprites[i].data.list.room;
                new_enemy.asleep = true;
            }
            if (dasherSprites[i].data.list.circuit != null){
                new_enemy.circuit = dasherSprites[i].data.list.circuit;
            } 
            if (dasherSprites[i].data.list.invisible == true){
                new_enemy.setVisible(false);
            }
        }
        

        dasherSprites[i].destroy();
        current_scene.enemies.push(new_enemy);
    }
}

function onEnemyDead(dead_enemy){
    if (Phaser.Math.Between(1, 7) == 1){
        spawnHealthPickup(dead_enemy.x, dead_enemy.y);
    }


    let circuit = dead_enemy.circuit;
    if (!circuit && isNaN(circuit)) {return; }

    let last = true;
    current_scene.enemies.forEach(enemy => {
        if (enemy != dead_enemy && enemy.visible == true && enemy.active == true && enemy.circuit == circuit){
            last = false;
            return;
        }
    });
    if (!last){
        return;
    }

    

    openDoors(circuit);
    //awakenEnemies(circuit)
}

function openDoors(circuit){
    for(let i = 0; i < current_scene.doors.length; i++ ){
        if ((current_scene.doors[i].data_sprite.data && current_scene.doors[i].data_sprite.data && circuit == current_scene.doors[i].data_sprite.data.list.circuit) || (current_scene.doors[i].locked == true) ){
            if (circuit != current_scene.doors[i].data_sprite.data.list.circuit && current_scene.doors[i].data_sprite.data.list.stay_closed != null){
                continue;
            }
            current_scene.tweens.add({
                targets: current_scene.doors[i].data_sprite,
                //alpha: 0,
                duration: 800,
                repeat: 0,
                callbackScope: this,
                onComplete: function() {
                    current_scene.doors[i].body.enable = false; 
                    current_scene.sound.add('door open', {volume: 1}).play();
                    current_scene.cameras.main.shake(150, 0.003);
                    if (current_scene.doors[i].horizontal != true){
                        current_scene.doors[i].data_sprite.setTexture('door down');
                    } else{
                        current_scene.doors[i].data_sprite.setTexture('hori door down');
                    }
                    

                }
            });
        }
    }  
}

function closeDoors(circuit){
    for(let i = 0; i < current_scene.doors.length; i++ ){
        if (current_scene.doors[i].data_sprite.data && circuit == current_scene.doors[i].data_sprite.data.list.circuit){

            current_scene.tweens.add({
                targets: current_scene.doors[i].data_sprite,
                alpha: 1,
                duration: 200,
                repeat: 0,
                callbackScope: this,
                onComplete: function() {
                    current_scene.doors[i].body.enable = true; 
                    //current_scene.doors[i].setVisible(true);
                    current_scene.sound.add('door close', {volume: 1}).play();
                    current_scene.cameras.main.shake(150, 0.003);
                    if (current_scene.doors[i].horizontal != true){
                        current_scene.doors[i].data_sprite.setTexture('door');
                    } else{
                        current_scene.doors[i].data_sprite.setTexture('hori door');
                    }
                    
                    current_scene.doors[i].data_sprite.setVisible(true);
                }
            });
            current_scene.doors[i].locked = true;
        }
    }  
}

function awakenEnemies(circuit){
    for (let i = 0; i < current_scene.enemies.length; i++) {
        if (current_scene.enemies[i].room == circuit){
            current_scene.enemies[i].asleep = false;
        }
    }
}

function activateButton(button) {
    if ( (!button.data_sprite || button.data_sprite.data.list.circuit == -1) && button.circuit == null){
        console.log(`invalid button. null: ${button.circuit == null}`);
        return;
    } else if (button.circuit == -1){
        return;
    }

    if (button.circuit == null && button.data_sprite.data.list.boss){
        current_scene.level_finished = true;
        current_scene.player.can_move = false;
        current_scene.player.setVelocity(0, 0);
        current_scene.player_wall_collider.active = false;
        sweepTransition("right", true, function() {
            bg_music.stop();
            current_scene.scene.start("level1BossIntroScene");
        })
        return;
    }

    if (button.circuit == null && button.data_sprite.data.list.next_level){
        current_scene.level_finished = true;
        current_scene.player.can_move = false;
        current_scene.player.setVelocity(0, 0);
        //disableCollision(current_scene.player.body);
        current_scene.player_wall_collider.active = false;
        //current_scene.
        sweepTransition("right", true, function() {
            if (current_scene.enemies != undefined) {
                current_scene.enemies.forEach(enemy => {
                    if (enemy.enemy_sfx["passive"] != undefined && enemy.enemy_sfx["passive"].isPlaying) 
                        enemy.enemy_sfx["passive"].stop();
                })
            }
            current_map = button.data_sprite.data.list.next_level;
            current_scene.scene.restart();
        })
        return;
    }

    let circuit;
    if (button.circuit == null){
        circuit = button.data_sprite.data.list.circuit;
    } else{
        circuit = button.circuit;
    }

    
    if (button.circuit == null && button.data_sprite.data.list.close_door == true){
        closeDoors(circuit);
        if (current_scene.enemies != undefined) {
            awakenEnemies(circuit);
        }
    } else{
        openDoors(circuit);
    }

    if (button.circuit == null){
        button.data_sprite.setTexture('button down');
        button.data_sprite.data.list.circuit = -1;
    } else{
        button.circuit = -1;
    }
}

function setupTilemapCollisions(layer){
    layer.forEachTile(function (tile){
        var tileWorldPos = layer.tileToWorldXY(tile.x, tile.y);
        var collisionGroup = current_scene.tileset.getTileCollisionGroup(tile.index);
        if (tile.properties.enemy_1){
            spawnEnemy(game_settings.enemy1_name, tileWorldPos.x, tileWorldPos.y);
        } else if (tile.properties.enemy_2){
            spawnEnemy(game_settings.enemy2_name, tileWorldPos.x, tileWorldPos.y);
        } else if (tile.properties.enemy_3){
            spawnEnemy(game_settings.enemy3_name, tileWorldPos.x, tileWorldPos.y);
        } else if (tile.properties.player_spawn){
            current_scene.player.setPosition(tileWorldPos.x, tileWorldPos.y);
        } else if (tile.properties.dog){
            if (current_scene.dog != undefined) {
                current_scene.dog.setPosition(tileWorldPos.x, tileWorldPos.y);
            }
        } else if (tile.properties.cam_center){
            game_settings.cam_target = current_scene.add.rectangle(tileWorldPos.x, tileWorldPos.y, 20, 20 ,0xFFFFFF).setAlpha(0);
        } else if (tile.properties.gate){
            if (current_scene.gate_positions)
                current_scene.gate_positions.push({x: tileWorldPos.x, y: tileWorldPos.y});
        }

        if (!collisionGroup || collisionGroup.objects.length === 0) { return; }

        var objects = collisionGroup.objects;
        for (var i = 0; i < objects.length; i++){
            var object = objects[i];
            var objectX = tileWorldPos.x + object.x;
            var objectY = tileWorldPos.y + object.y;

            if (object.rectangle){
                let new_rect = current_scene.add.rectangle(objectX, objectY, object.width, object.height, 0xFFFFFF).setOrigin(0).setAlpha(0);
                new_rect.body = new Phaser.Physics.Arcade.StaticBody(current_scene.physics.world, new_rect);
                current_scene.physics.add.existing(new_rect);
                if (tile.properties.lava){
                    new_rect.setFillStyle(0xFF0000);
                    current_scene.lava_rects.push(new_rect);
                } else{
                    if (tile.properties.deadly){
                        new_rect.deadly = true;
                    }
                    current_scene.collision_rects.push(new_rect);
                }                
            }
        }
    });
}

//update functions:
function updateEnemies(time, delta){
    current_scene.enemies.forEach(enemy => {
        if (enemy.active){
            enemy.update(time, delta);
        }
    });
}

function pause(){
    if (current_scene.player){
        current_scene.player.setVisible(false);
        current_scene.player.dash_pointer.setVisible(false);
        current_scene.vignette.setVisible(false);
        current_scene.player.body.stop();
        current_scene.enemies.forEach(enemy => {
            enemy.body.stop();
        });
        current_scene.enemy_projectiles.getChildren().forEach(projectile => {
            //projectile.body.stop();
        });
    
        disableCollision(current_scene.player.body);
    }
    
    let pause_menu = current_scene.pause_menu;
    //current_scene.pauseLayer.setVisible(true);

    let camPos = getCameraCoords(null, 0, 0);
    let center = camPos.x + game.config.width/2;
    let top = camPos.y;

    pause_menu.title.setPosition(center, top + 140).setVisible(true);
    pause_menu.background.setPosition(center, top).setVisible(true);
    pause_menu.music_vol.setPosition(center, top + 370).setVisible(true);
    pause_menu.music_vol_icon.setPosition(center + pause_menu.music_vol.displayWidth/3, top + 370).setVisible(true);
    pause_menu.sfx_vol.setPosition(center, top + 470).setVisible(true);
    pause_menu.sfx_vol_icon.setPosition(center + pause_menu.music_vol.displayWidth/3, top + 470).setVisible(true);
    pause_menu.resume.setPosition(center, top + 570).setVisible(true);
    pause_menu.exit.setPosition(center, top + 670).setVisible(true);
}

function resume(){
    if (current_scene.player){
        current_scene.player.setVisible(true);
        current_scene.vignette.setVisible(true);
        current_scene.player.dash_pointer.setVisible(true);
        enableCollision(current_scene.player.body);
    }
    
    let pause_menu = current_scene.pause_menu;

    pause_menu.background.setVisible(false);
    pause_menu.music_vol.setVisible(false);
    pause_menu.music_vol_icon.setVisible(false);
    pause_menu.sfx_vol.setVisible(false);
    pause_menu.sfx_vol_icon.setVisible(false);
    pause_menu.resume.setVisible(false);
    pause_menu.exit.setVisible(false);
    pause_menu.title.setVisible(false);

    
}

//COLLISION FUNCTIONS

function playerWallCollision(player, rects) {
    const wall_bounce_mod = 0.4;
    if (rects.deadly) {
        player.in_wall = true;
        player.setPosition(player.safe_pos.x, player.safe_pos.y);
    }
    player.hit_wall = true;
    if (player.dashing || player.stunned)
        player.body.setVelocity(player.body.velocity.x*wall_bounce_mod, player.body.velocity.y*wall_bounce_mod);
}

function checkPlayerLavaCollision() {
    if (current_scene.physics.overlap(current_scene.player, current_scene.lava_rects)) {
        current_scene.player.on_lava = true;
    }
    else {
        current_scene.player.on_lava = false;
    }
}

function checkInWall(player, rects) {
    if (rects.deadly) {
        player.in_wall = true;
        player.setPosition(player.safe_pos.x, player.safe_pos.y);
    }
    else {
        player.in_wall = false;
    }
}

function playerLavaCollision(player, lava_tile){
    player.on_lava = true;
    if (!player.dashing){
        player.setPosition(player.safe_pos.x, player.safe_pos.y);
        player.body.setVelocity(0, 0);
        player.damage(lava_tile, false);
    }
}

function enemyLavaCollision(enemy, lava_tile) {
    if (enemy.stunned && !enemy.hit_lava && !enemy.is_dead) {
        enemy.damage(enemy.bounce_damage);
        enemy.hit_lava = true;
    }
}

function projectileEnemyCollision(enemy, projectile){
    if (!enemy.active || !projectile.active){
        return;
    }

    if (projectile.deflected){
        projectile.reset();
        enemy.damage(100);
        moveAway(projectile, enemy);
    }
}

function playerProjectileCollision(player, projectile){
    if (!projectile.active || !player.active || player.startInvulnerable || player.invulnerable){
        return;
    }
    if (projectile.deflected == true){
        current_scene.player.doneDashing();
    }

    if (player.dashing){
        projectile.deflected = true;
        projectile.body.setVelocity(projectile.body.velocity.x + player.body.velocity.x, projectile.body.velocity.y + player.body.velocity.y);
        //playerObj.body.setVelocity(playerObj.body.velocity.x * 0.9, playerObj.body.velocity.y * 0.9);
        player.body.setVelocity(0,0)
    } else if (!projectile.deflected && projectile.reset){
        projectile.reset();
        player.damage();
    }
}

function playerHealthCollision(player, pickup) {
    if (pickup.visible == false){
        return;
    }
    if (player.health < game_settings.player_max_health){
        pickup.setVisible(false); 
        player.health += 1;
        if (player.health >= game_settings.player_max_health) {
            player.health = game_settings.player_max_health
        }
        current_scene.pickup_sfx.play({volume: 0.4});
    }
    else {
        pickup.setVelocity(player.body.velocity.x * 0.5, player.body.velocity.y * 0.5);
    }
}

function disableCollision(body){
    body.checkCollision.none = true;
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
    body.checkCollision.up = false;
}

function enableCollision(body){
    body.checkCollision.none = false;
    body.checkCollision.down = true;
    body.checkCollision.left = true;
    body.checkCollision.right = true;
    body.checkCollision.up = true;
}

// called after collision
function playerEnemyCollision(player, enemy){
    if (enemy.charging == true){
        enemy.charging = false;
        enemy.clearTint();
    }


    if (enemy.stunned) return;
    if (current_scene.player.dashing){
        player.bouncing = true;
        player.dash_cooldown_timer = player.dash_cooldown_duration;
        if (enemy.type == "DASHER" && enemy.dashing) {
            return;
        }
        current_scene.cameras.main.shake(200, 0.002);
        enemy.damage(current_scene.player.dash_damage);
    } else {
        current_scene.player.damage(enemy, true);
    }
}

function playerShockwaveCollision(player, shockwave){
    if (!player.startInvulnerable || !player.invulnerable) {
        current_scene.player.damage(shockwave, true, true);
    }
}

function enemyShockwaveCollision(enemy, shockwave){
    if (enemy.type != "GOLEM") {
        let redirect_multiplier = game_settings.golem_shockwave_power * 2;
        const angle = -Math.atan2(shockwave.owner.x-enemy.x, shockwave.owner.y-enemy.y);
        const vel_x = redirect_multiplier * Math.sin(angle);
        const vel_y = redirect_multiplier * -Math.cos(angle);
        enemy.setVelocity(vel_x, vel_y);

        enemy.damage(game_settings.golem_shockwave_damage, true);
    }
}

// enemy damages other enemy when it bounces into it
function enemyOnEnemyCollision(enemy1, enemy2) {
    if (enemy1.stunned && !enemy2.stunned) {
        enemy2.damage(enemy1.bounce_damage);
    }
    if (enemy2.stunned && !enemy1.stunned) {
        enemy1.damage(enemy2.bounce_damage);
    }
}

function ballOnEnemyCollision(ball, enemy) {
    enemy.damage(50);
}

function playerDestructibleCollision(player, destructible){
    if (player.dashing){
        destructible.setAlpha(0);
    }
}

//utility functions:
function spawnHealthPickup(x, y){
    let healthPickup = current_scene.physics.add.sprite(x, y, 'player heart').setDepth(3);
    //healthPickup.body.setMass(0.3);
    healthPickup.setCircle(healthPickup.displayWidth/2);
    healthPickup.body.setVelocity(Phaser.Math.Between(-800, 800), Phaser.Math.Between(-800, 800));
    healthPickup.setDrag(0.001);
    healthPickup.setDamping(true);
    current_scene.pickups.push(healthPickup);
}

function setRandomPositionOutside(obj){
    let max = 150;
    switch (Phaser.Math.Between(1, 4)){
        case 1:
            obj.setPosition(Phaser.Math.Between(game.config.width+50, game.config.width+max), Phaser.Math.Between(-50, game.config.height+50));
            break;
        case 2:
            obj.setPosition(Phaser.Math.Between(-50, -max), Phaser.Math.Between(-50, game.config.height+50));
            break;
        case 3:
            obj.setPosition(Phaser.Math.Between(-50, game.config.width+50), Phaser.Math.Between(-50, -max));
            break;
        case 4:
            obj.setPosition(Phaser.Math.Between(-50, game.config.width+50), Phaser.Math.Between(game.config.height + 50, game.config.height + max));
            break;
    }
    
}

function setRandomPositionInside(obj){
    obj.setPosition(Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height));
}

function spawnRandomEnemy(){
    switch(Phaser.Math.Between(1, 3)){
        case 1: 
            spawnEnemy("CHARGER");
            break;
        case 2: 
            spawnEnemy("GOLEM");
            break;
        case 3:
            spawnEnemy("SHOOTER");
            break;
    }
}

function spawnEnemy(type, x, y, _return){
    let new_enemy = null;

    switch(type){
        case "CHARGER":
            current_scene.enemies.forEach(enemy => {
                if (enemy.type == type && enemy.active == false){
                    new_enemy = enemy;
                    enemy.reset();
                }
            }) 
            if (new_enemy == null){
                new_enemy = new ChargerEnemy(x, y, 'charger move right');
            }
            break;
        case "DASHER":
            current_scene.enemies.forEach(enemy => {
                if (enemy.type == type && enemy.active == false){
                    new_enemy = enemy;
                    enemy.reset();
                }
            })
            if (new_enemy == null){
                new_enemy = new DasherEnemy(x, y, 'dasher move right');
            }
            break;
        case "GOLEM":
            current_scene.enemies.forEach(enemy => {
                if (enemy.type == type && enemy.active == false){
                    new_enemy = enemy;
                    enemy.reset();
                }
            }) 
            if (new_enemy == null){
                new_enemy = new GolemEnemy(x, y, 'golem move right');
            }
            break;
        case "SHOOTER":
            current_scene.enemies.forEach(enemy => {
                if (enemy.type == type && enemy.active == false){
                    new_enemy = enemy;
                    enemy.reset();
                }
            }) 
            if (new_enemy == null){
                new_enemy = new ShooterEnemy(x, y, 'shooter move right');
            }
            break;
        default: 
            console.log(`invalid enemy type requested: ${type}`);
            return; // to not run final statement
    }
    
    if (_return){
        return new_enemy;
    }

    current_scene.enemies.push(new_enemy);
}

function spawnObject(type, x, y){
    switch(type){
        case "VASE": 
            new_obj = current_scene.physics.add.sprite(x, y, 'white square').setTint(0x5fc746).setDepth(1.5);
            current_scene.destructibles.push(new_obj);
            break;
    }
}

function damageDisplay(enemy, index) {
    enemy.damage_text_array[index].setVisible(true);
    enemy.damage_text_array[index].alpha = 1;
    enemy.damage_text_array[index].x = enemy.getTopRight().x;
    enemy.damage_text_array[index].y = enemy.getTopRight().y;
    current_scene.tweens.add({
        targets: enemy.damage_text_array[index],
        alpha: 0,
        x: enemy.damage_text_array[index].x + 20,
        y: enemy.damage_text_array[index].y - 20,
        duration: 500,
        onComplete: () => { 
            if (index == 0) {
                enemy.damage_text_array[index].setVisible(false);
            }
        }
    });
}

function moveTo(source, target){
    const angle = -Math.atan2(source.x-target.x, source.y-target.y);
    const vel_x = source.speed * Math.sin(angle);
    const vel_y = source.speed * -Math.cos(angle);
    source.setVelocity(vel_x, vel_y);
}

function moveAway(source, target){
    if (!target || !source){
        return;
    }
    let redirect_multiplier = 100;
    if (source.speed) {
        redirect_multiplier = source.speed;
    }
    let angle = -Math.atan2(source.x-target.x, source.y-target.y);
    if (source.move_angle) {
        angle = source.move_angle;
        redirect_multiplier = 300;
        const vel_x = redirect_multiplier * Math.sin(angle);
        const vel_y = redirect_multiplier * -Math.cos(angle);
        target.setVelocity(-vel_x, -vel_y);
    }
    else {
        const vel_x = redirect_multiplier * Math.sin(angle);
        const vel_y = redirect_multiplier * -Math.cos(angle);
        source.setVelocity(-vel_x, -vel_y);
    }
    
}

function getMouseCoords() {
    // Takes a Camera and updates this Pointer's worldX and worldY values so they are the result of a translation through the given Camera.
    current_scene.game.input.activePointer.updateWorldPoint(current_scene.cameras.main);
    
    return {
      x: pointer.worldX,
      y: pointer.worldY,
    }
}

function getCameraCoords(camera, offset_x, offset_y) {
    if (!camera){
        camera = current_scene.cameras.main;
    }
    // world view is the coord of top right
    return {
        x: camera.worldView.x + offset_x,
        y: camera.worldView.y + offset_y
    }
}

function panTo(camera, object) {
    camera.pan(object.x, 
        object.y, 
        2000, 
        'Sine.easeInOut', 
        true, 
        (camera, progress) => { 
            camera.panEffect.destination.x = object.x;
            camera.panEffect.destination.y = object.y;
            if (progress == 1) {
                //current_scene.pan_finished = true;
                if (game_script.reading_script) {
                    game_script.hide_display = false;
                }
                camera.startFollow(object, true, 0.05, 0.05);
            }
        }
    );
}

function sweepTransition(dir, change_scene=false, func=function() {}) {
    let target = game.config.width;
    let rect = current_scene.add.rectangle(0, 0, game.config.width, game.config.height+100, 0x000000).setOrigin(1, 0).setScale(20).setDepth(15);
    if (dir.toLowerCase() == "left") {
        target = current_scene.cameras.main.worldView.x;
        rect.x = game.config.width+current_scene.cameras.main.worldView.x;
    }
    else {
        target = game.config.width+current_scene.cameras.main.worldView.x;
        rect.x = current_scene.cameras.main.worldView.x;    
    }
    current_scene.tweens.add({
        duration: 700,
        targets: rect,
        x: target,
        onComplete: function() {
            func();
            if (!change_scene) {
                rect.setVisible(false);
                rect.destroy();
            }
        }
    });
}
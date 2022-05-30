function initializeScene(scene) {
    current_scene = scene;
    pointer = current_scene.input.activePointer; 
    
    scene.cameras.main.setZoom(game_settings.camera_zoom);
    scene.cameras.main.setBackgroundColor('#000000');
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

    // //doggo
    // scene.doggo = new Dog(200, 200, 'dog idle right');
    // scene.doggo.asleep = true;
    // scene.doggo.setVisible(false);
    // console.log("added doggo to scene");
    
    initMap()
    scene.camera = scene.cameras.main.startFollow(scene.player, true, 0.05, 0.05);

    //enemy collisions
    addColliders(scene);

    //UI
    scene.pauseLayer = scene.add.sprite(game.config.width/2, game.config.height/2, 'white square').setTint(0x010101).setAlpha(0.3).setScale(20,20).setOrigin(0.5).setDepth(5).setVisible(false);
    scene.paused = false;
    scene.vignette = scene.add.sprite(0, 0, 'vignette').setDepth(4).setOrigin(0).setAlpha(0.7).setTint(0x000000);

    //updateUI();
    scene.game_UI = new GameUI();
    scene.game_UI.setPlayerUI();

    
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

function updateLevel(time, delta) {
    //pause the game
    if (Phaser.Input.Keyboard.JustDown(key_esc)){
        current_scene.paused = !current_scene.paused;
    }
    if (current_scene.paused){
        pause();
        return;
    } else {
        resume();
    }
    if (!current_scene.level_finished) {
        //update player 
        current_scene.player.update(time, delta);
        //update enemies
        updateEnemies(time, delta);
    }
    //update UI
    current_scene.game_UI.update();
    let vignettePos = getCameraCoords(null, 0, 0);
    current_scene.vignette.setPosition(vignettePos.x, vignettePos.y);
}

function initBossLevel1(scene) {
    scene.ball = scene.physics.add.sprite(game.config.width/2, game.config.height/2, 'white hexagon').setScale(0.5);
    scene.ball.body.bounce.set(0.5);
    scene.ball.body.setMass(0.1);
    scene.ball.setDrag(0.9);
    scene.ball.setDamping(true);
    scene.ball.deflected = false;
    scene.doggo = new Dog(200, 200, 'dog idle right');
    scene.doggo.boss_scene = true;

    //hank
    scene.hank = new Hank1(800, 350, 'hank idle right');
    //this.hank.health = 0;

    //enemy collisions
    //this.addColliders();
    
    //UI
    scene.boss_box = scene.add.sprite(0, 0, 'boss health box').setScale(6, 1.5).setDepth(0.1);
    scene.boss_bar = scene.add.rectangle(0, 0, scene.boss_box.displayWidth, scene.boss_box.displayHeight, 0xFF0000).setOrigin(0, 0.5);
    scene.endRect = scene.add.rectangle(0, 0, game.config.width, game.config.height, 0xFFFFFF).setScale(50).setAlpha(0);
}

function addColliders(scene) {
    //player
    scene.physics.add.collider(scene.player, scene.collision_rects, playerWallCollision.bind(scene));
    scene.physics.add.collider(scene.player, scene.doors);
    scene.physics.add.overlap(scene.player, scene.lava_rects, playerLavaCollision.bind(scene));
    scene.physics.add.collider(scene.pickups, scene.collision_rects);
    scene.physics.add.overlap(scene.player, scene.pickups, playerHealthCollision.bind(this));

    //enemies
    scene.enemyCollider = scene.physics.add.collider(scene.player, scene.enemies, playerEnemyCollision.bind(scene));
    scene.physics.add.collider(scene.enemies, scene.collision_rects, (enemy, collision_rect) => {
        if (collision_rect.deadly == true){
            enemy.die();
        }
    });
    scene.physics.add.collider(scene.enemies, scene.doors);
    
    scene.physics.add.collider(scene.enemies, scene.lava_rects, enemyLavaCollision.bind(scene));
    scene.physics.add.overlap(scene.player, scene.destructibles, playerDestructibleCollision.bind(scene));
    scene.physics.add.collider(scene.enemies, scene.enemies, enemyOnEnemyCollision.bind(scene));
    scene.physics.add.collider(scene.player, scene.enemy_shockwaves, playerShockwaveCollision.bind(scene));

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
}

function setupInteractables(map){

    const door_sprites = map.createFromObjects('interact', {name: 'door', key: 'door'});
    const button_sprites = map.createFromObjects('interact', {name: 'button', key:'button'});
    const vase_sprites = map.createFromObjects('interact', {name: 'vase', key: 'vase'});
    const target_sprites = map.createFromObjects('interact', {name: 'target', key: 'target'});
    current_scene.vases = [];
    current_scene.doors = [];
    current_scene.buttons = [];
    current_scene.targets = [];

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
            if (button.silent != true){
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

    for (let i = 0; i < enemy1Sprites.length; i++) {
        let new_enemy = spawnEnemy(game_settings.enemy1_name, enemy1Sprites[i].x, enemy1Sprites[i].y, true);

        new_enemy.room = enemy1Sprites[i].data.list.room;
        
        if (enemy1Sprites[i].data.list.circuit){
            new_enemy.circuit = enemy1Sprites[i].data.list.circuit;
        }
        new_enemy.asleep = true;
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
        }

        enemy3Sprites[i].destroy();
        current_scene.enemies.push(new_enemy);
    }
}

function onEnemyDead(dead_enemy){
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

    if (Phaser.Math.Between(1, 6) == 1){
        spawnHealthPickup(dead_enemy.x, dead_enemy.y);
    }


    openDoors(circuit);
    awakenEnemies(circuit)
}

function openDoors(circuit){
    //console.log(`opening door #${circuit}`);
    for(let i = 0; i < current_scene.doors.length; i++ ){
        if ((current_scene.doors[i].data_sprite.data && circuit == current_scene.doors[i].data_sprite.data.list.circuit) || (current_scene.doors[i].locked == true) ){

            current_scene.tweens.add({
                targets: current_scene.doors[i].data_sprite,
                //alpha: 0,
                duration: 800,
                repeat: 0,
                callbackScope: this,
                onComplete: function() {
                    current_scene.doors[i].body.enable = false; 
                    
                    //current_scene.doors[i].data_sprite.setVisible(false);
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
            //console.log(`awkening ${current_scene.enemies[i].type}`);
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

    if (button.circuit == null && button.data_sprite.data.list.next_level){
        current_scene.level_finished = true;
        sweepTransition("right", true, function() {
            console.log(`starting level: ${button.data_sprite.data.list.next_level}`);
            current_map = button.data_sprite.data.list.next_level;
            current_scene.scene.restart();
        })
        return;
    }

    let circuit
    if (button.circuit == null){
        circuit = button.data_sprite.data.list.circuit;
    } else{
        circuit = button.circuit;
    }

    
    if (button.circuit == null && button.data_sprite.data.list.close_door == true){
        closeDoors(circuit);
    } else{
        openDoors(circuit);
        awakenEnemies(circuit);
    }

    if (button.circuit == null){
        //console.log("hi");
        //button.setAlpha(0.5);
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
        } else if (tile.properties.vase){
            spawnObject("VASE", tileWorldPos.x, tileWorldPos.y);
        } else if (tile.properties.dog){
            console.log("HERE IS WHERE THE DOGGO POSITION IS");
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
    current_scene.pauseLayer.setVisible(true);
    current_scene.player.body.stop();
    current_scene.enemies.forEach(enemy => {
        enemy.body.stop();
    });
    current_scene.enemy_projectiles.getChildren().forEach(projectile => {
        //console.log(`projectiles don't stop correctly on game pause`);
        //projectile.body.stop();
    });
}

function resume(){
    current_scene.pauseLayer.setVisible(false);
}

//COLLISION FUNCTIONS

function playerWallCollision(player, rects) {
    const wall_bounce_mod = 0.4;
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
        enemy.damage(game_settings.charger_health - 10);
    }
}

function playerProjectileCollision(player, projectile){
    if (!projectile.active || !player.active || player.startInvulnerable || player.invulnerable){
        return;
    }
    if (current_scene.player.dashing){
        projectile.deflected = true;
        projectile.body.setVelocity(player.body.velocity.x * 1.5, player.body.velocity.y * 1.5);
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
        game_settings.player_current_health = player.health;
        current_scene.pickup_sfx.play({volume: 0.4});
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
    if (enemy.stunned) return;
    if (current_scene.player.dashing){
        current_scene.cameras.main.shake(200, 0.002);
        player.bouncing = true;
        player.dash_cooldown_timer = player.dash_cooldown_duration;
        enemy.damage(current_scene.player.dash_damage);
    } else {
        current_scene.player.damage(enemy, true);
    }
}

function playerShockwaveCollision(player, shockwave){
    //console.log(shockwave);
    if (!player.startInvulnerable || !player.invulnerable) {
        current_scene.player.damage(shockwave, true, true);
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

function playerDestructibleCollision(player, destructible){
    if (player.dashing){
        destructible.setAlpha(0);
    }
}

//utility functions:
function spawnHealthPickup(x, y){
    let healthPickup = current_scene.physics.add.sprite(x, y, 'player heart').setDepth(3);
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

    //current_scene.physics.add.collider(new_enemy, current_scene.collision_rects);
    //current_scene.physics.add.collider(new_enemy, current_scene.lava_rects);
    
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
    const angle = -Math.atan2(source.x-target.x, source.y-target.y);
    const vel_x = source.speed * Math.sin(angle);
    const vel_y = source.speed * -Math.cos(angle);
    source.setVelocity(-vel_x, -vel_y);
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
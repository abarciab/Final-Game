let current_map = 'level 1.0 map';
//setup functions:
function initialize(scene){
    current_scene = scene;
    pointer = current_scene.input.activePointer; 
    
    game_settings = {
        // player stats
        dash_damage: 50,
        player_walk_speed: 350,
        player_dash_speed: 1000,
        player_max_charge_progress: 800,
        player_dash_cooldown: 0.2,
        player_max_health: 5,
        player_walk_drag: 0.0001,
        player_dash_drag: 0.1,
        player_stun_time: 100,
        player_mass: 0.8,
        player_bounce_mod: 0.7,
        player_invincible_time: 1,
        player_perfect_dash_window: 0.3,

        //misc game vars
        tilemap_scale: 1,
        camera_zoom: 1,
        next_scene: `level1BossScene`,

        // charger stats
        charger_speed: 75,
        charger_health: 100,
        charger_bounce_mod: 1,
        charger_bounce_drag: 0.01,

        // golem stats
        golem_speed: 30,
        golem_health: 150,
        golem_agro_range: 280,
        golem_attack_range: 100,
        golem_shockwave_start_frame: 5,
        golem_shockwave_end_frame: 12,
        golem_shockwave_size: 3,
        golem_shockwave_duration: 300,
        golem_shockwave_power: 350,
        golem_reload_time: 3000,
        
        golem_bounce_mod: 1,
        golem_bounce_drag: 0.0001,

        // shooter stats
        shooter_speed: 50,
        shooter_health: 115,
        shooter_shooting_speed: 1,
        shooter_ammo_spacing: 500,
        shooter_reload_time: 2000,
        shooter_min_dist: 2,  //the minimum distance between a shooter enemy and the player before the shooter will fire
        shooter_bounce_mod: 1,
        shooter_bounce_drag: 0.01,
        shooter_ammo: 1,

        enemy_mass: 1,
        enemy_stun_threshold: 10, // speed to where enemy is no longer stunned
        enemy_stun_time: 0.75,
        enemy_spawn_timer: 8000,
        //these enemy_name variables are for determining which enemy is spawned when an 'enemy1, enemy2, enemy3', etc tile is found in the tilemap.
        enemy1_name: "CHARGER",
        enemy2_name: "GOLEM",
        enemy3_name: "SHOOTER",

        //hank
        hank_health: 8,
        hank_speed: 100,
    }

    scene.cameras.main.setZoom(game_settings.camera_zoom);
    scene.cameras.main.setBackgroundColor('#000000');
    scene.physics.world.setBounds(0, 0, game.config.width, game.config.height);
    setupKeys(scene);
}

function initBoss1(){
    game_settings.dog_speed = 250;
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
        current_scene.doors.push(new_door);
    }
    
    for(let i = 0; i < button_sprites.length; i++){
        let new_button = current_scene.add.rectangle(button_sprites[i].x, button_sprites[i].y, button_sprites[i].displayWidth, button_sprites[i].displayHeight, 0xFFFFFF).setOrigin(0.5).setAlpha(0);
        new_button.body = new Phaser.Physics.Arcade.StaticBody(current_scene.physics.world, new_button);
        current_scene.physics.add.existing(new_button);
        new_button.data_sprite = button_sprites[i];
        if (new_button.data_sprite.data.list.close_door == true || new_button.data_sprite.data.list.invisible == true){
            new_button.data_sprite.setVisible(false);
        }
        current_scene.buttons.push(new_button);
    }

    current_scene.physics.add.collider(current_scene.player, current_scene.doors);
    current_scene.physics.add.overlap(current_scene.player, current_scene.buttons, function(player, button) {
        if (button.done != true){
            current_scene.sound.play('pressure plate', {volume: 0.8});
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
            if (enemy2Sprites[i].data.list.room){
                new_enemy.room = enemy2Sprites[i].data.list.room;
                new_enemy.asleep = true;
            }

            if (enemy2Sprites[i].data.list.circuit){
                new_enemy.circuit = enemy2Sprites[i].data.list.circuit;
            }
        }
        enemy2Sprites[i].destroy();
        current_scene.enemies.push(new_enemy);
    }

    for (let i = 0; i < enemy3Sprites.length; i++) {
        let new_enemy = spawnEnemy(game_settings.enemy3_name, enemy3Sprites[i].x, enemy3Sprites[i].y, true);
        new_enemy.room = enemy3Sprites[i].data.list.room;
        if (enemy3Sprites[i].data.list.circuit){
            new_enemy.circuit = enemy3Sprites[i].data.list.circuit;
        }
        new_enemy.asleep = true;
        enemy3Sprites[i].destroy();
        current_scene.enemies.push(new_enemy);
    }
}

function onEnemyDead(dead_enemy){
    let circuit = dead_enemy.circuit;
    if (!circuit) {return;}

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
    awakenEnemies(circuit)
}

function openDoors(circuit){
    //console.log(`opening door #${circuit}`);
    for(let i = 0; i < current_scene.doors.length; i++ ){
        if ((current_scene.doors[i].data_sprite.data && circuit == current_scene.doors[i].data_sprite.data.list.circuit) || (current_scene.doors[i].locked == true) ){

            current_scene.tweens.add({
                targets: current_scene.doors[i].data_sprite,
                alpha: 0,
                duration: 800,
                repeat: 0,
                callbackScope: this,
                onComplete: function() {
                    current_scene.doors[i].body.enable = false; 
                    current_scene.doors[i].setVisible(false);
                    current_scene.doors[i].data_sprite.setVisible(false);
                }
            });
        }
    }  
}

function closeDoors(circuit){
    console.log(`closing door #${circuit}`);
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
                    current_scene.doors[i].setVisible(true);
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
    if (!button.data_sprite || button.data_sprite.data.list.circuit == -1){
        return;
    }

    if (button.data_sprite.data.list.next_level){
        console.log(`starting level: ${button.data_sprite.data.list.next_level}`);
        current_map = button.data_sprite.data.list.next_level;
        current_scene.scene.restart();
        return;
    }

    let circuit = button.data_sprite.data.list.circuit;

    
    if (button.data_sprite.data.list.close_door == true){
        closeDoors(circuit);
    } else{
        openDoors(circuit);
        awakenEnemies(circuit);
    }


    button.data_sprite.data.list.circuit = -1;
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

function playerProjectileCollision(playerObj, projectile){
    if (!projectile.active || !playerObj.active || playerObj.startInvulnerable || playerObj.invulnerable){
        return;
    }
    if (current_scene.player.dashing){
        projectile.deflected = true;
        projectile.body.setVelocity(playerObj.body.velocity.x * 1.5, playerObj.body.velocity.y * 1.5);
        //playerObj.body.setVelocity(playerObj.body.velocity.x * 0.9, playerObj.body.velocity.y * 0.9);
        playerObj.body.setVelocity(0,0)
    } else if (!projectile.deflected && projectile.reset){
        projectile.reset();
        playerObj.damage();
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
                new_enemy = new ShooterEnemy(x, y, 'shooter');
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

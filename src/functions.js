
//setup functions:
function initialize(scene){
    current_scene = scene;
    pointer = current_scene.input.activePointer;
    
    game_settings = {
        // player stats
        dash_damage: 50,
        player_walk_speed: 350,
        player_dash_speed: 1000,
        player_max_charge_progress: 1000,
        player_dash_cooldown: 0.2,
        player_max_health: 50,
        player_walk_drag: 0.0001,
        player_dash_drag: 0.1,
        player_stun_time: 100,
        player_mass: 0.7,
        player_bounce_mod: 1,
        player_invincible_time: 1,

        tilemap_scale: 1,
        camera_zoom: 1,

        // charger stats
        charger_speed: 75,
        charger_health: 300,
        charger_bounce_mod: 1,
        charger_bounce_drag: 0.01,

        // golem stats
        golem_speed: 30,
        golem_health: 500,
        golem_agro_range: 280,
        golem_bounce_mod: 1,
        golem_bounce_drag: 0.0001,

        // shooter stats
        shooter_speed: 50,
        shooter_health: 200,
        shooter_shooting_speed: 1,
        shooter_reload_time: 6000,
        shooter_min_dist: 10,  //the minimum distance between a shooter enemy and the player before the shooter will fire
        shooter_bounce_mod: 1,
        shooter_bounce_drag: 0.01,

        enemy_mass: 1,
        enemy_stun_threshold: 10, // speed to where enemy is no longer stunned
        enemy_stun_time: 0.75,
        enemy_spawn_timer: 8000,
        //these enemy_name variables are for determining which enemy is spawned when an 'enemy1, enemy2, enemy3', etc tile is found in the tilemap.
        enemy1_name: "CHARGER",
        enemy2_name: "GOLEM",
        enemy3_name: "SHOOTER",
    }

    scene.cameras.main.setZoom(game_settings.camera_zoom);
    scene.cameras.main.setBackgroundColor('#303030');
    scene.physics.world.setBounds(0, 0, game.config.width, game.config.height);
    setupKeys(scene);
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
}

function setupDoorsAndButtons(map){

    const door_sprites = map.createFromObjects('interact', {name: 'door', key: 'door'});
    const button_sprites = map.createFromObjects('interact', {name: 'button', key:'button'});
    current_scene.doors = [];
    current_scene.buttons = [];

    for(let i = 0; i < door_sprites.length; i++ ){
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
        current_scene.buttons.push(new_button);
    }

    current_scene.physics.add.collider(current_scene.player, current_scene.doors);
    current_scene.physics.add.overlap(current_scene.player, current_scene.buttons, function(player, button) {
        for(let i = 0; i < current_scene.doors.length; i++ ){
            if (button.data_sprite.data.list.circuit - current_scene.doors[i].data_sprite.data.list.circuit == 0){
                current_scene.doors[i].data_sprite.setVisible(false);
                current_scene.doors[i].destroy();
            }
        }  
        button.setActive(false);      
    })
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

function updateUI(){
    current_scene.score_text.text =  `SCORE: ${current_scene.player.score}`;
    current_scene.health_text.text = `LIVES: ${current_scene.player.health}`;
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

/*
COLLISION FUNCTIONS
*/

function playerWallCollision(player, rects) {
    const wall_bounce_mod = 0.8;
    player.body.setVelocity(player.body.velocity.x*wall_bounce_mod, player.body.velocity.y*wall_bounce_mod);
}

function playerLavaCollision(player, lava_tile){
    current_scene.on_lava = true;
    if (!player.dashing){
        player.setPosition(player.safe_pos.x, player.safe_pos.y);
        player.body.setVelocity(0, 0);
        player.damage(lava_tile, false);
    }
}

function enemyLavaCollision(enemy, lava_tile) {
    console.log("enemy hit lava");
    if (enemy.stunned) {
        enemy.damage(enemy.bounce_damage-1);
    }
}

function projectileEnemyCollision(enemy, projectile){
    if (!enemy.active || !projectile.active){
        return;
    }

    if (projectile.deflected){
        projectile.reset();
        enemy.damage(10);
    }
}

function playerProjectileCollision(playerObj, projectile){
    if (!projectile.active || !playerObj.active || playerObj.startInvulnerable || playerObj.invulnerable){
        return;
    }
    if (current_scene.player.dashing){
        projectile.deflected = true;
        projectile.body.setVelocity(projectile.body.velocity.x + playerObj.body.velocity.x/2, projectile.body.velocity.y + playerObj.body.velocity.y/2);
        playerObj.body.setVelocity(0,0);
    } else if (!projectile.deflected){
        projectile.reset();
        playerObj.damage();
    }
}

// called after collision
function playerEnemyCollision(player, enemy){
    if (enemy.stunned) return;
    if (current_scene.player.dashing){
        player.bouncing = true;
        player.dash_cooldown_timer = player.dash_cooldown_duration;
        enemy.damage(current_scene.player.dash_damage);
    } else {
        current_scene.player.damage(enemy, true);
    }

    updateUI();
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

function spawnEnemy(type, x, y){
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
    current_scene.physics.add.collider(new_enemy, current_scene.collision_rects);
    current_scene.physics.add.collider(new_enemy, current_scene.lava_rects);
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
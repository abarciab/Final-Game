
//setup functions:
function initialize(scene){
    current_scene = scene;

    current_scene = scene;
    game_settings = {
        player_walk_speed: 140,
        player_dash_speed: 1000,
        player_max_charge_progress: 1000,
        player_max_health: 50,

        tilemap_scale: 1,

        charger_speed: 50,
            charger_health: 1,
        golem_speed: 10,
            golem_health: 4,
            golem_agro_range: 280,
        shooter_speed: 15,
            shooter_health: 2,
            shooter_shooting_speed: 1,
            shooter_reload_time: 6000,
            shooter_min_dist: 10,  //the minimum distance between a shooter enemy and the player before the shooter will fire
        enemy_spawn_timer: 8000,
        //these enemy_name variables are for determining which enemy is spawned when an 'enemy1, enemy2, enemy3', etc tile is found in the tilemap.
        enemy1_name: "CHARGER",
        enemy2_name: "GOLEM",
        enemy3_name: "SHOOTER",
    }

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

//collison functions:
function playerLavaCollision(player, lava_tile){
    if (!current_scene.player.dashing){
        current_scene.player.damage(lava_tile, true);
    }
}

function projectileEnemyCollision(enemy, projectile){
    if (!enemy.active || !projectile.active){
        return;
    }

    if (projectile.deflected){
        projectile.reset();
        enemy.damage();
    }
}

function playerProjectileCollision(playerObj, projectile){
    if (!projectile.active || !playerObj.active){
        console.log("")
        return;
    }
    if (current_scene.player.dashing){
        console.log(`dashing`);
        projectile.deflected = true;
        projectile.body.setVelocity(projectile.body.velocity.x + playerObj.body.velocity.x/2, projectile.body.velocity.y + playerObj.body.velocity.y/2);
        playerObj.body.setVelocity(0,0);
    } else if (!projectile.deflected){
        projectile.reset();
        playerObj.damage();
    }
}

function playerEnemyCollision(playerObj, enemy){
    if (!enemy.active || !playerObj.active){
        return;
    }
    playerObj.body.setVelocity(playerObj.body.velocity.x*-1, playerObj.body.velocity.y*-1);

    if (current_scene.player.dashing){
        enemy.damage();
    } else {
        current_scene.player.damage(enemy);
    }


    //playerObj.dashing = false;
    playerObj.clearTint();
    updateUI();
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
                new_enemy = new ChargerEnemy(x, y, 'charger').setTint(0xFF0000);
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
                new_enemy = new GolemEnemy(x, y, 'golem').setTint(0xaaFF00).setScale(1.5);
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
                new_enemy = new ShooterEnemy(x, y, 'shooter').setTint(0xaaaa00);
            }
            break;
        default: 
            console.log(`invalid enemy type requested: ${type}`);
            return; // to not run final statement
    }
    current_scene.physics.add.collider(new_enemy, current_scene.collision_rects);
    current_scene.enemies.push(new_enemy);
}

function moveTo(source, target){
    let buffer = 2;
    if (target.x > source.x+buffer){
        source.setVelocityX(source.speed);
    }
    if (target.x < source.x-buffer){
        source.setVelocityX(-source.speed);
    }
    if (target.y > source.y+buffer){
        source.setVelocityY(source.speed);
    }
    if (target.y < source.y-buffer){
        source.setVelocityY(-source.speed);
    }
}

function moveAway(source, target){
    let buffer = 2;
    if (target.x > source.x+buffer){
        source.setVelocityX(-source.speed);
    }
    if (target.x < source.x-buffer){
        source.setVelocityX(source.speed);
    }
    if (target.y > source.y+buffer){
        source.setVelocityY(-source.speed);
    }
    if (target.y < source.y-buffer){
        source.setVelocityY(source.speed);
    }
}

function getMouseCoords() {
    // Takes a Camera and updates this Pointer's worldX and worldY values so they are the result of a translation through the given Camera.
    current_scene.game.input.activePointer.updateWorldPoint(current_scene.cameras.main);
    const pointer = current_scene.input.activePointer;
    return {
      x: pointer.worldX,
      y: pointer.worldY,
    }
  }
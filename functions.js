
//setup functions:
function initialize(scene){
    current_scene = scene;

    current_scene = scene;
    game_settings = {
        player_walk_speed: 140,
        player_dash_speed: 1000,
        player_max_charge_progress: 1000,
        player_max_health: 5,

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
    console.log(`player projectile colission`);
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


    playerObj.dashing = false;
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

function spawnEnemy(type){
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
                new_enemy = new ChargerEnemy(100, 100, 'charger').setTint(0xFF0000);
            }
            setRandomPositionOutside(new_enemy);
            break;
        case "GOLEM":
            current_scene.enemies.forEach(enemy => {
                if (enemy.type == type && enemy.active == false){
                    new_enemy = enemy;
                    enemy.reset();
                }
            }) 
            if (new_enemy == null){
                new_enemy = new GolemEnemy(game.config.width*0.9, 140, 'golem').setTint(0xaaFF00).setScale(1.5);
            }
            setRandomPositionInside(new_enemy);
            break;
        case "SHOOTER":
            current_scene.enemies.forEach(enemy => {
                if (enemy.type == type && enemy.active == false){
                    new_enemy = enemy;
                    enemy.reset();
                }
            }) 
            if (new_enemy == null){
                new_enemy = new ShooterEnemy(game.config.width/3, 140, 'shooter').setTint(0xaaaa00);
            }
            setRandomPositionInside(new_enemy);
            break;
        default: 
            console.log(`invalid enemy type requested: ${type}`);
    }
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
        source.setVelocityY-(source.speed);
    }
    if (target.y < source.y-buffer){
        source.setVelocityY(source.speed);
    }
}

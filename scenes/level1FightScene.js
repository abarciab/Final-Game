function initDash2(scene){
    console.log('initializing');

    game_settings = {
        player_walk_speed: 140,
        player_dash_speed: 1000,
        player_max_charge_progress: 1000,
        player_max_health: 5,

        charger_speed: 30,
            charger_health: 1,
        golem_speed: 10,
            golem_health: 4,
            golem_agro_range: 280,
        shooter_speed: 15,
            shooter_health: 2,
            shooter_shooting_speed: 1,
            shooter_reload_time: 6000,
            shooter_min_dist: 500,  //the minimum distance between a shooter enemy and the player before the shooter will fire
        enemy_spawn_timer: 8000,
    }

    scene.cameras.main.setBackgroundColor('#303030');
    scene.physics.world.setBounds(0, 0, game.config.width, game.config.height);
    scene.SetupKeys(scene);
}

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
    }

    create(){
        initDash2(this);

        

        //player
        this.player = {
            obj: this.physics.add.sprite(game.config.width/2, game.config.height/2, 'white square').setAlpha(0.3).setScale(0.6),
            charge_progress: 0,
            dashing: false,
            health: game_settings.player_max_health,
        }
        this.player.obj.setDrag(0.05);
        this.player.obj.setDamping(true);

        //enemies
        this.enemies = [];
        this.enemy_projectiles = new ProjectileGroup(this, 'white arrow');
        this.spawnEnemy("CHARGER");    
        this.spawnEnemy("GOLEM"); 
        this.spawnEnemy("SHOOTER");   
        this.time.addEvent({
            delay: game_settings.enemy_spawn_timer,
            callback: this.spawnRandomEnemy,
            callbackScope: this,
            loop: true,
        })      

        //enemy collisions
        this.physics.add.overlap(this.player.obj, this.enemies, this.playerEnemyCollision.bind(this));
        this.physics.add.overlap(this.player.obj, this.enemy_projectiles, this.playerProjectileCollision.bind(this));
        this.physics.add.overlap(this.enemy_projectiles, this.enemies, this.projectileEnemyCollision.bind(this));

        //score and lives
        this.timePlayed = 0; 
        this.score = 0;
        this.score_text = this.add.text(20, 20, "SCORE: 0");
        this.health_text = this.add.text(150, 20, "LIVES: 0");
        this.updateUI();
        this.paused = false;

        //UI
        this.pauseLayer = this.add.sprite(game.config.width/2, game.config.height/2, 'white square').setTint(0x010101).setAlpha(0.3).setScale(20,20).setOrigin(0.5).setDepth(5).setVisible(false);
    }

    update(time, delta){
        //pause the game
        if (Phaser.Input.Keyboard.JustDown(key_esc)){
            this.paused = !this.paused;
        }

        //pause
        if (this.paused){
            this.pause();
            return;
        } else {
            this.pauseLayer.setVisible(false);
        }

        //player dash
        if (Math.abs(this.player.obj.body.velocity.x) <= game_settings.player_walk_speed && Math.abs(this.player.obj.body.velocity.y) <= game_settings.player_walk_speed){
            this.player.dashing = false;
            this.player.obj.clearTint();
        }
        if (key_space.isDown && !this.player.dashing && this.player.charge_progress < game_settings.player_max_charge_progress){
            this.player.charge_progress += delta;
            this.player.obj.setAlpha(this.player.charge_progress/game_settings.player_max_charge_progress + 0.1);
        }
        if (Phaser.Input.Keyboard.JustUp(key_space)){
            if (this.player.charge_progress > 0){
                this.dash();
            }
            this.player.charge_progress = 0;
            this.player.obj.setAlpha(0.3);
        }
        
        //player movement
        if (key_left.isDown){
            this.movePlayer("LEFT");
        }
        if (key_right.isDown){
            this.movePlayer("RIGHT");
        }
        if (key_up.isDown){
            this.movePlayer("UP");
        }
        if (key_down.isDown){
            this.movePlayer("DOWN");
        }

        this.updateEnemies(time, delta);
        
    }

    spawnRandomEnemy(){
        console.log("Spawning random enemy");
        switch(Phaser.Math.Between(1, 3)){
            case 1: 
                this.spawnEnemy("CHARGER");
                break;
            case 2: 
                this.spawnEnemy("GOLEM");
                break;
            case 3:
                this.spawnEnemy("SHOOTER");
        }
    }

    projectileEnemyCollision(enemy, projectile){
        if (projectile.deflected){
            projectile.reset();
            this.damageEnemy(enemy);
        }
    }

    playerProjectileCollision(playerObj, projectile){
        if (!projectile.active){
            return;
        }
        if (this.player.dashing){
            projectile.deflected = true;
            projectile.body.setVelocity(projectile.body.velocity.x + this.player.obj.body.velocity.x/2, projectile.body.velocity.y + this.player.obj.body.velocity.y/2);
            playerObj.body.setVelocity(0,0);
        } else if (!projectile.deflected){
            projectile.reset();
            this.damagePlayer();
        }
    }

    dash(){
        let speed = (this.player.charge_progress/game_settings.player_max_charge_progress)*game_settings.player_dash_speed;
        this.physics.moveToObject(this.player.obj, this.game.input.mousePointer, speed);
        this.player.dashing = true;
        this.player.obj.setTint(0xFF0000);
    }

    updateUI(){
        this.score_text.text =  `SCORE: ${this.score}`;
        this.health_text.text = `LIVES: ${this.player.health}`;
    }

    spawnEnemy(type){
        let new_enemy = null;

        switch(type){
            case "CHARGER":
                this.enemies.forEach(enemy => {
                    if (enemy.type == type && enemy.active == false){
                        new_enemy = enemy;
                        enemy.reset();
                    }
                }) 
                if (new_enemy == null){
                    new_enemy = new ChargerEnemy(this, 200, 900, 'charger').setTint(0xFF0000);
                }
                this.setRandomPositionOutside(new_enemy);
                break;
            case "GOLEM":
                this.enemies.forEach(enemy => {
                    if (enemy.type == type && enemy.active == false){
                        new_enemy = enemy;
                        enemy.reset();
                    }
                }) 
                if (new_enemy == null){
                    new_enemy = new GolemEnemy(this, game.config.width*0.9, 140, 'golem').setTint(0xaaFF00).setScale(1.5);
                }
                this.setRandomPositionInside(new_enemy);
                break;
            case "SHOOTER":
                this.enemies.forEach(enemy => {
                    if (enemy.type == type && enemy.active == false){
                        new_enemy = enemy;
                        enemy.reset();
                    }
                }) 
                if (new_enemy == null){
                    new_enemy = new ShooterEnemy(this, game.config.width/3, 140, 'shooter').setTint(0xaaaa00);
                }
                this.setRandomPositionInside(new_enemy);
                break;
            default: 
                console.log(`invalid enemy type requested: ${type}`);
        }
        this.enemies.push(new_enemy);
    }

    updateEnemies(time, delta){
        this.enemies.forEach(enemy => {
            enemy.update(this, time, delta);
        });
    }

    pause(){
        this.pauseLayer.setVisible(true);
        this.player.obj.body.stop();
        this.enemies.forEach(enemy => {
            enemy.body.stop();
        });
        this.enemy_projectiles.getChildren().forEach(projectile => {
            //console.log(`projectiles don't stop correctly on game pause`);
            //projectile.body.stop();
        });
    }

    setRandomPositionOutside(obj){
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

    setRandomPositionInside(obj){
        obj.setPosition(Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height));
    }

    playerEnemyCollision(playerObj, enemy){
        if (this.player.dashing){
            this.damageEnemy(enemy)
        } else {
            this.damagePlayer();
        }

        playerObj.body.setVelocity(playerObj.body.velocity.x*-1, playerObj.body.velocity.y*-1);
        this.updateUI();
    }

    damageEnemy(enemy){
        enemy.health -= 1;
            if (enemy.health == 0){
                enemy.health = 1;
                enemy.setAlpha(1);
                this.setRandomPositionOutside(enemy);
            } else {
                enemy.setAlpha(enemy.alpha/2);
                this.score += 10;
            }
    }

    damagePlayer(){
        this.player.health-= 1;
            if (this.player.health == 0){
                this.scene.restart();
            }
            this.cameras.main.shake(150, 0.003);
            this.player.obj.setPosition(game.config.width/2, game.config.height/2);
    }

    movePlayer(dir){
        let speed = game_settings.player_walk_speed;

        switch(dir){
            case "LEFT":
                if (this.player.obj.body.velocity.x > -speed){
                    this.player.obj.setVelocityX(-speed);
                    if (speed == game_settings.player_walk_speed){
                        this.player.dashing = false;
                        this.player.obj.clearTint();
                    }
                }
                break;
            case "RIGHT":
                if (this.player.obj.body.velocity.x < speed){
                    this.player.obj.setVelocityX(speed);
                    if (speed == game_settings.player_walk_speed){
                        this.player.dashing = false;
                        this.player.obj.clearTint();
                    }
                }
                break;
            case "UP":
                if (this.player.obj.body.velocity.y > -speed){
                    this.player.obj.setVelocityY(-speed);
                    if (speed == game_settings.player_walk_speed){
                        this.player.dashing = false;
                        this.player.obj.clearTint();
                    }
                }
                break;
            case "DOWN":
                if (this.player.obj.body.velocity.y < speed){
                    this.player.obj.setVelocityY(speed);
                    if (speed == game_settings.player_walk_speed){
                        this.player.dashing = false;
                        this.player.obj.clearTint();
                    }
                }
                break;
        }
    }

    SetupKeys(scene){
        key_left = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        key_right = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        key_up = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        key_down = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        key_space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        key_esc = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        key_prev = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        key_next = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT); 
    }
}

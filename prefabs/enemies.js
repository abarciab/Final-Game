class ProjectileGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene, texture){
        super(scene.physics.world, scene);

        this.add(new Projectile(scene, 0, 0, texture));

        this.projectileTexture = texture;
        this.runChildUpdate = true;
        //the number of projectiles that aren't being used by a different object
        this.num_free = this.getLength();

    }

    borrow(new_owner){
        if (this.num_free == 0){
            this.add(new Projectile(this.scene, 0, 0, this.projectileTexture));
            this.num_free += 1;
        }

        let project;
        this.getChildren().forEach(projectile => {
            if (projectile.owner == null){
                project = projectile;
                return;
            }
        });

        project.owner = new_owner;
        this.num_free -= 1;
        return project;
    }

    return(projectile){
        projectile.owner = null;
        this.num_free += 1;
    }
}

class Projectile extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, texture){
        super(scene, x, y, texture);
        scene.physics.world.enableBody(this);
        scene.add.existing(this);

        this.owner = null;
        this.setActive(false);
        this.setVisible(false);
        this.deflected = false;
    }

    reset(){
        this.setActive(false);
        this.deflected = false;
        this.body.stop();
        this.setVisible(false);
        this.setPosition(0,0);
    }

    update(){
        let targetPoint = new Phaser.Math.Vector2(this.x + this.body.velocity.x, this.y + this.body.velocity.y)
        let pos = new Phaser.Math.Vector2(this.x, this.y);
        this.rotation = Phaser.Math.Angle.BetweenPoints(pos, targetPoint);


        if (this.active && (this.x < -50 || this.x > game.config.width + 50 || this.y < 0 || this.y > game.config.height)){
            this.reset();
        }
    }
}

class ChargerEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture){
        super(scene, x, y, texture)
        scene.physics.world.enableBody(this);
        scene.add.existing(this);

        this.type = "CHARGER";
        this.speed = game_settings.charger_speed;
        this.health = game_settings.charger_health;
    }

    //this enemy will just always move toward the player
    update(scene, time, delta){
        let buffer = 2;
        if (scene.player.obj.x > this.x+buffer){
            this.setVelocityX(this.speed);
        }
        if (scene.player.obj.x < this.x-buffer){
            this.setVelocityX(-this.speed);
        }
        if (scene.player.obj.y > this.y+buffer){
            this.setVelocityY(this.speed);
        }
        if (scene.player.obj.y < this.y-buffer){
            this.setVelocityY(-this.speed);
        }
    }
}

class GolemEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture){
        super(scene, x, y, texture)
        scene.physics.world.enableBody(this);
        scene.add.existing(this);

        this.type = "GOLEM";
        this.speed = game_settings.golem_speed;
        this.health = game_settings.golem_health;
        this.setDrag(0.05);
        this.setDamping(true);
    }

    //this enemy will only move toward the player if they're close. Otherwise, they'll just stand still
    update(scene, time, delta){
        let dist = Phaser.Math.Distance.Between(this.x, this.y, scene.player.obj.x, scene.player.obj.y);

        if (dist <= game_settings.golem_agro_range){
            moveTo(this, scene.player.obj);
        } else {
            this.angle += 0.1;
        }
    }
}

function moveTo(source, target, moveAway = false){
    let buffer = 2;
    if (target.x > source.x+buffer){
        source.setVelocityX(source.speed);
        if (moveAway){ source.setVelocityX(-source.speed);}
    }
    if (target.x < source.x-buffer){
        source.setVelocityX(-source.speed);
        if (moveAway){ source.setVelocityX(source.speed);}
    }
    if (target.y > source.y+buffer){
        source.setVelocityY(source.speed);
        if (moveAway){ source.setVelocityY(-source.speed);}
    }
    if (target.y < source.y-buffer){
        source.setVelocityY(-source.speed);
        if (moveAway){ source.setVelocityY(source.speed);}
    }
}

class ShooterEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture){
        super(scene, x, y, texture)
        scene.physics.world.enableBody(this);
        scene.add.existing(this);

        this.type = "SHOOTER";
        this.speed = game_settings.shooter_speed;
        this.shooting_speed = game_settings.shooter_shooting_speed;
        this.health = game_settings.shooter_health;

        this.projectiles = [];
        this.projectiles.push(scene.enemy_projectiles.borrow(this));
        this.loaded = true;
    }

    //this enemy will try to put space between themselves and the player, then shoot
    update(scene, time, delta){
        let dist = Phaser.Math.Distance.Between(this.x, this.y, scene.player.obj.x, scene.player.obj.y);
        
        if (dist >= game_settings.shooter_min_dist){

        }


        if (this.loaded){    
            this.loaded = false;
            this.fire(scene.player.obj);

            scene.time.delayedCall(game_settings.shooter_reload_time, function () {
                this.loaded = true;
            }, null, this)

        }
        this.projectiles.forEach(projectile => {
            projectile.update();
        });
    }

    fire(target){
        let projectile = null;
        for(let i = 0; i < this.projectiles.length; i++){
            if (this.projectiles[i].visible == false){
                projectile = this.projectiles[i];
                break;
            }
        }
        if (projectile == null){
            this.projectiles.unshift(this.scene.enemy_projectiles.borrow(this));
            projectile = this.projectiles[0]
        }
        

        projectile.reset();
        projectile.setActive(true).setVisible(true).setDepth(20);
        projectile.setPosition(this.x, this.y);
        this.scene.physics.moveToObject(projectile, target, 100);
    }
}
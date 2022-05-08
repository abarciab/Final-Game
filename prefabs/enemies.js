class ProjectileGroup extends Phaser.Physics.Arcade.Group {
    constructor(texture){
        super(current_scene.physics.world, current_scene);

        this.add(new Projectile(0, 0, texture));

        this.projectile_texture = texture;
        this.runChildUpdate = true;
        //the number of projectiles that aren't being used by a different object
        this.num_free = this.getLength();

    }

    Borrow(new_owner){
        if (this.num_free == 0){
            this.add(new Projectile(0, 0, this.projectile_texture));
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

    Return(projectile){
        projectile.owner = null;
        this.num_free += 1;
    }
}

class Projectile extends Phaser.Physics.Arcade.Sprite{
    constructor(x, y, texture){
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.owner = null;
        this.setActive(false);
        this.setVisible(false);
        this.deflected = false;
    }

    Reset(){
        this.setActive(false);
        this.deflected = false;
        this.body.stop();
        this.setVisible(false);
        this.setPosition(0,0);
        if (this.owner == null){
            this.scene.enemy_projectiles.Return(this);
        }
    }

    Update(){
        let targetPoint = new Phaser.Math.Vector2(this.x + this.body.velocity.x, this.y + this.body.velocity.y)
        let pos = new Phaser.Math.Vector2(this.x, this.y);
        this.rotation = Phaser.Math.Angle.BetweenPoints(pos, targetPoint);


        if (this.active && (this.x < -50 || this.x > game.config.width + 50 || this.y < 0 || this.y > game.config.height)){
            this.Reset();
        }
    }
}

class ChargerEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture){
        super(current_scene, x, y, texture)
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.type = "CHARGER";
        this.speed = game_settings.charger_speed;
        this.health = game_settings.charger_health;
    }

    Reset(){
        this.setActive(true);
        this.setVisible(true);
        this.body.setVelocity(0,0);
        this.health = game_settings.charger_health;
        this.setAlpha(1);
    }

    Damage(){
        this.health -= 1;
        if (this.health <= 0){
            this.Die();
            return;
        }
        
        this.setAlpha(this.alpha/2);
    }

    Die(){
        this.setAlpha(1);
        this.setActive(false);
        this.setVisible(false);
        this.health = game_settings.charger_health;
    }

    //this enemy will just always move toward the player
    Update(time, delta){
        moveTo(this, current_scene.player);
    }
}

class GolemEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture){
        super(current_scene, x, y, texture)
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.type = "GOLEM";
        this.speed = game_settings.golem_speed;
        this.health = game_settings.golem_health;
        this.setDrag(0.05);
        this.setDamping(true);
    }

    Reset(){
        this.setActive(true);
        this.setVisible(true);
        this.body.setVelocity(0,0);
        this.health = game_settings.golem_health;
        this.setAlpha(1);
    }

    Damage(){
        console.log(`golem damaged. health: ${this.health}`);
        this.health -= 1;
        if (this.health <= 0){
            this.Die();
            return;
        }
        this.setAlpha(this.alpha/2);
    }

    Die(){
        this.setAlpha(1);
        this.health = game_settings.golem_health;
        this.setActive(false);
        this.setVisible(false);
    }

    //this enemy will only move toward the player if they're close. Otherwise, they'll just stand still
    Update(time, delta){
        let dist = Phaser.Math.Distance.Between(this.x, this.y, current_scene.player.x, current_scene.player.y);

        if (dist <= game_settings.golem_agro_range){
            MoveTo(this, current_scene.player);
        } else {
            this.angle += 0.1;
        }
    }
}



class ShooterEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture){
        super(current_scene, x, y, texture)
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.type = "SHOOTER";
        this.speed = game_settings.shooter_speed;
        this.shooting_speed = game_settings.shooter_shooting_speed;
        this.health = game_settings.shooter_health;

        this.projectiles = [];
        this.projectiles.push(current_scene.enemy_projectiles.Borrow(this));
        this.loaded = true;
    }

    Reset(){
        this.setActive(true);
        this.setVisible(true);
        this.body.setVelocity(0,0);
        this.health = game_settings.shooter_health;
        this.setAlpha(1);
    }

    Damage(){
        this.health -= 1;
        if (this.health <= 0){
            this.Die();
            return
        }
        this.setAlpha(this.alpha/2);
    }

    Die(){
        this.projectiles.forEach(projectile => {
            projectile.owner = null;
            if (projectile.active == false){
                this.scene.enemy_projectiles.Return(projectile);
            }
        });  
        this.setAlpha(1);
        this.setActive(false);
        this.setVisible(false); 
        this.health = game_settings.shooter_health;
    }

    //this enemy will try to put space between themselves and the player, then shoot
    Update(time, delta){
        let dist = Phaser.Math.Distance.Between(this.x, this.y, current_scene.player.x, current_scene.player.y);
        
        if (dist >= game_settings.shooter_min_dist){
            if (this.loaded){    
                this.loaded = false;
                this.Fire(current_scene.player);
                current_scene.time.delayedCall(game_settings.shooter_reload_time, function () {
                    this.loaded = true;
                }, null, this)
            }
        }

        this.projectiles.forEach(projectile => {
            projectile.Update();
        });
    }

    Fire(target){
        let projectile = null;
        for(let i = 0; i < this.projectiles.length; i++){
            if (this.projectiles[i].visible == false){
                projectile = this.projectiles[i];
                break;
            }
        }
        if (projectile == null){
            this.projectiles.unshift(this.scene.enemy_projectiles.Borrow(this));
            projectile = this.projectiles[0]
        }
        

        projectile.Reset();
        projectile.setActive(true).setVisible(true).setDepth(20);
        projectile.setPosition(this.x, this.y);
        this.scene.physics.moveToObject(projectile, target, 100);
    }
}
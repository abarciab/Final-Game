class ProjectileGroup extends Phaser.Physics.Arcade.Group {
    constructor(texture){
        super(current_scene.physics.world, current_scene);

        this.add(new Projectile(0, 0, texture));

        this.projectile_texture = texture;
        this.runChildUpdate = true;
        //the number of projectiles that aren't being used by a different object
        this.num_free = this.getLength();

    }

    borrow(new_owner){
        if (this.num_free <= 0){
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

    return(projectile){
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

    reset(){
        this.setActive(false);
        this.deflected = false;
        this.body.stop();
        this.setVisible(false);
        this.setPosition(0,0);
        if (this.owner == null){
            this.scene.enemy_projectiles.return(this);
        }
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

class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture, type) {
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);
        this.setDrag(0.05);
        this.setDamping(true);
        this.type = type;
        switch(this.type) {
            case "CHARGER":
                this.speed = game_settings.charger_speed;
                this.base_health = game_settings.charger_health;
                this.health = this.base_health;
                this.bounce_mod = game_settings.charger_bounce_mod;
                break;
            case "GOLEM":
                this.speed = game_settings.golem_speed;
                this.base_health = game_settings.golem_health;
                this.health = this.base_health;
                this.bounce_mod = game_settings.golem_bounce_mod;
                break;
            case "SHOOTER":
                this.speed = game_settings.shooter_speed;
                this.base_health = game_settings.shooter_health;
                this.health = this.base_health;
                this.bounce_mod = game_settings.shooter_bounce_mod
                break;
            default:
                console.log("CONSTRUCTOR ERROR: INVALID ENEMY TYPE");
                break;
        }
        this.stun_time = 0;
    }

    reset() {
        this.setActive(true);
        this.setVisible(true);
        this.body.setVelocity(0,0);
        this.setAlpha(1);
        this.health = this.base_health;
    }

    damage() {
        //bounces the player out of the enemy if they're stuck
        if (current_scene.player.invulnerable){
            current_scene.player.damage(this);
            return;
        }

        this.setVelocity(this.body.velocity.x - (current_scene.player.body.velocity.x * (this.bounce_mod)), this.body.velocity.y - (current_scene.player.body.velocity.y* (this.bounce_mod)));

        this.health -= 1;
        if (this.health <= 0){
            this.die();
            return;
        }
        this.setAlpha(this.alpha/2);
        this.stun_time = game_settings.player_stun_time;
    }

    die() {
        this.setAlpha(1);
        this.setActive(false);
        this.setVisible(false);
        this.health = this.base_health;
    }

}

class ChargerEnemy extends BaseEnemy {
    constructor(x, y, texture){
        super(x, y, texture, "CHARGER");
    }

    reset(){
        super.reset();
    }

    damage(){
        super.damage();
    }

    die(){
        super.die();
    }

    //this enemy will just always move toward the player
    update(time, delta){
        this.stun_time -= delta;
        if (this.stun_time > 0){
            return;
        }
        moveTo(this, current_scene.player);
    }
}

class GolemEnemy extends BaseEnemy {
    constructor(x, y, texture){
        super(x, y, texture, "GOLEM");
        
    }

    reset(){
        super.reset();
    }

    damage(){
        super.damage();
    }

    die(){
        super.die();
    }

    //this enemy will only move toward the player if they're close. Otherwise, they'll just stand still
    update(time, delta){
        this.stun_time -= delta;
        if (this.stun_time > 0){
            return;
        }

        let dist = Phaser.Math.Distance.Between(this.x, this.y, current_scene.player.x, current_scene.player.y);

        if (dist <= game_settings.golem_agro_range){
            moveTo(this, current_scene.player);
        } else {
            this.angle += 0.1;
        }
    }
}



class ShooterEnemy extends BaseEnemy {
    constructor(x, y, texture){
        super(x, y, texture, "SHOOTER");
        this.shooting_speed = game_settings.shooter_shooting_speed;

        this.projectiles = [];
        this.projectiles.push(current_scene.enemy_projectiles.borrow(this));
        this.loaded = true;
    }

    reset(){
        super.reset();
    }

    damage(){
        super.damage();
    }

    die(){
        this.projectiles.forEach(projectile => {
            projectile.owner = null;
            if (projectile.active == false){
                this.scene.enemy_projectiles.return(projectile);
            }
        });
        super.die();
    }

    //this enemy will try to put space between themselves and the player, then shoot
    update(time, delta){
        this.stun_time -= delta;
        if (this.stun_time > 0){
            return;
        }
        let dist = Phaser.Math.Distance.Between(this.x, this.y, current_scene.player.x, current_scene.player.y);
        
        if (dist >= game_settings.shooter_min_dist){
            if (this.loaded){    
                this.loaded = false;
                this.fire(current_scene.player);
                current_scene.time.delayedCall(game_settings.shooter_reload_time, function () {
                    this.loaded = true;
                }, null, this)
            }
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
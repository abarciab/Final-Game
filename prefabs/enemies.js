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
        //this.rotation = Phaser.Math.Angle.BetweenPoints(pos, targetPoint);

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
        this.setCircle(this.width/2);
        this.last_direction_moved = "right";
        this.type = type;
        this.stunned = false;
        switch(this.type) {
            case "CHARGER":
                this.speed = game_settings.charger_speed;
                this.base_health = game_settings.charger_health;
                this.bounce_mod = game_settings.charger_bounce_mod;
                break;
            case "GOLEM":
                this.speed = game_settings.golem_speed;
                this.base_health = game_settings.golem_health;
                this.bounce_mod = game_settings.golem_bounce_mod;
                break;
            case "SHOOTER":
                this.speed = game_settings.shooter_speed;
                this.base_health = game_settings.shooter_health;
                this.bounce_mod = game_settings.shooter_bounce_mod;
                break;
            default:
                console.log("CONSTRUCTOR ERROR: INVALID ENEMY TYPE");
                break;
        }
        this.curr_speed = this.speed;
        this.bounce_damage = 0;
        this.health = this.base_health;
        this.body.bounce.set(this.bounce_mod);
        this.stun_time = 0;
        this.setMass(game_settings.enemy_mass);
    }

    reset() {
        this.setActive(true);
        this.setVisible(true);
        this.body.setVelocity(0,0);
        this.setAlpha(1);
        this.health = this.base_health;
    }

    damage(damage_value) {
        this.body.bounce.set(this.bounce_mod);
        //bounces the player out of the enemy if they're stuck
        if (current_scene.player.invulnerable){
            current_scene.player.damage(this);
            return;
        }
        this.health -= damage_value;
        this.stunned = true;
        console.log("deal damage:",damage_value);
        if (this.health <= 0){
            this.die();
            return;
        }
        this.stun_time = game_settings.enemy_stun_time;
        console.log("stunned for", this.stun_time);
    }

    /*updateGetHit() {
        if (this.stunned && this.curr_speed <= game_settings.enemy_stun_threshold) {
            this.stunned = false;
        }
    }*/

    die() {
        this.x = -100;
        this.y = -100;
        this.setAlpha(1);
        this.setActive(false);
        this.setVisible(false);
        this.health = this.base_health;
    }

    update(timer, delta) {
        this.curr_speed =  Math.sqrt(Math.pow(this.body.velocity.y, 2) + Math.pow(this.body.velocity.x, 2));
        this.bounce_damage = Math.ceil((this.curr_speed/game_settings.player_dash_speed)*game_settings.dash_damage);
        // this.updateGetHit();
        if (this.stunned) {
            this.stun_time -= delta/1000;
            if (this.stun_time < 0){
                console.log("no longer stunned");
                this.stunned = false;
            }
        }
        if (this.body.velocity.x >= 0) {
            this.last_direction_moved = "right";
        }
        else {
            this.last_direction_moved = "left";
        }
        if (!this.stunned) {
            this.anims.play(`${this.type.toLowerCase()} move ${this.last_direction_moved.toLowerCase()}`, true);
        }
    }

}

class ChargerEnemy extends BaseEnemy {
    constructor(x, y, texture){
        super(x, y, texture, "CHARGER");
        this.setScale(3);
        const hitbox_radius = 6;
        this.setCircle(hitbox_radius, this.width/2-hitbox_radius, this.height/2-hitbox_radius);

    }

    reset(){
        super.reset();
    }

    damage(damage_value){
        super.damage(damage_value);
    }

    die(){
        super.die();
    }

    //this enemy will just always move toward the player
    update(time, delta){
        super.update(time, delta);
        if (this.stunned) return;

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

    damage(damage_value){
        super.damage(damage_value);
    }

    die(){
        super.die();
    }

    //this enemy will only move toward the player if they're close. Otherwise, they'll just stand still
    update(time, delta){
        super.update(time, delta);
        if (this.stunned) return;

        let dist = Phaser.Math.Distance.Between(this.x, this.y, current_scene.player.x, current_scene.player.y);
        if (dist <= game_settings.golem_agro_range){
            moveTo(this, current_scene.player);
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

    damage(damage_value){
        super.damage(damage_value);
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
        super.update(time, delta);
        if (this.stunned) return;

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
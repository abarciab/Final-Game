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

// For shockwave, use animation with sprite to change at the same rate so that hitbox stays accurate
// probably use tween

class ShockwaveGroup extends Phaser.Physics.Arcade.Group {
    constructor(texture){
        super(current_scene.physics.world, current_scene);

        this.add(new Shockwave(0, 0, texture));

        this.shockwave_texture = texture;
        this.runChildUpdate = true;
        //the number of shockwaves that aren't being used by a different object
        this.num_free = this.getLength();

    }

    borrow(new_owner){
        if (this.num_free <= 0){
            this.add(new Shockwave(0, 0, this.shockwave_texture));
            this.num_free += 1;
        }

        let wave;
        this.getChildren().forEach(shockwave => {
            if (shockwave.owner == null){
                wave = shockwave;
                return;
            }
        });

        wave.owner = new_owner;
        this.num_free -= 1;
        return wave;
    }

    return(shockwave){
        shockwave.owner = null;
        this.num_free += 1;
    }
}

class Shockwave extends Phaser.Physics.Arcade.Sprite{
    constructor(x, y, texture) {
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.owner = null;
        this.expanding_width = this.displayWidth*2;
        this.setActive(false);
        this.setVisible(false);
    }

    reset(){
        this.setActive(false);
        this.body.stop();
        this.setVisible(false);
        this.setPosition(0,0);
        this.expanding_width = this.displayWidth;
        this.setCircle(this.expanding_width);
        if (this.owner == null){
            this.scene.enemy_shockwaves.return(this);
        }
    }

    update(){
        let targetPoint = new Phaser.Math.Vector2(this.x + this.body.velocity.x, this.y + this.body.velocity.y)
        let pos = new Phaser.Math.Vector2(this.x, this.y);
        this.expanding_width++;
        this.setCircle(this.expanding_width, this.displayWidth/2-this.expanding_width, this.displayHeight/2-this.expanding_width);

        if (this.expanding_width > 100){
            this.reset();
        }
    }
}

class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture, type) {
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.base_drag = 0.05;
        this.setDrag(this.base_drag);
        this.setDamping(true);
        this.setCircle(this.width/2);
        this.enemy_hit = current_scene.sound.add('enemy hit');
        this.last_direction_moved = "right";
        this.type = type;
        this.stunned = false;
        this.current_frame = 0;
        switch(this.type) {
            case "CHARGER":
                this.speed = game_settings.charger_speed;
                this.base_health = game_settings.charger_health;
                this.bounce_mod = game_settings.charger_bounce_mod;
                this.bounce_drag = game_settings.charger_bounce_drag;
                break;
            case "GOLEM":
                this.speed = game_settings.golem_speed;
                this.base_health = game_settings.golem_health;
                this.bounce_mod = game_settings.golem_bounce_mod;
                this.bounce_drag = game_settings.golem_bounce_drag;
                break;
            case "SHOOTER":
                this.speed = game_settings.shooter_speed;
                this.base_health = game_settings.shooter_health;
                this.bounce_mod = game_settings.shooter_bounce_mod;
                this.bounce_drag = game_settings.shooter_bounce_drag;
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
        
        this.damage_text_array = [
            current_scene.add.text(0, 0, 0)
            .setVisible(false)
            .setFontSize(26)
            .setColor(`#FFFFFF`)
            .setStroke(`#000000`, 4)
        ];
    }

    reset() {
        this.setActive(true);
        this.setVisible(true);
        this.body.setVelocity(0,0);
        this.setAlpha(1);
        this.health = this.base_health;
    }

    damage(damage_value) {
        if (damage_value <= 0) return;
        //bounces the player out of the enemy if they're stuck
        if (current_scene.player.invulnerable){
            current_scene.player.damage(this);
            if (current_scene.player.invincible) {
                damage_value = 0;
            }
            //return;
        }
        this.enemy_hit.play();
        this.health -= damage_value;
        this.stunned = true;
        if (damage_value) {
            this.updateDamageText(damage_value);
            //console.log("deal damage:",damage_value);
        }
        
        this.stun_time = game_settings.enemy_stun_time;
    }

    updateDamageText(damage_value) {
        for (let i = 0; i < this.damage_text_array.length; i++) {
            if ((this.damage_text_array[i].visible == true) && (i+1 >= this.damage_text_array.length)) {
                this.damage_text_array.push(current_scene.add.text(0, 0, damage_value));
                this.damage_text_array[i+1].setFontSize(26);
                if (damage_value > game_settings.dash_damage) {
                    this.damage_text_array[i+1].setColor('#FF7F7F');
                }
                else {
                    this.damage_text_array[i+1].setColor('#FFFFFF');
                }
                this.damage_text_array[i+1].setStroke('#000000', 4);
                damageDisplay(this, i+1);
                this.damage_text_array.splice(i+1, 1);
                break;
            } else if (this.damage_text_array[i].visible == false) {
                this.damage_text_array[i].setText(damage_value);
                if (damage_value > game_settings.dash_damage) {
                    this.damage_text_array[i].setColor('#FF7F7F');
                }
                else {
                    this.damage_text_array[i].setColor('#FFFFFF');
                }
                damageDisplay(this, i);
                //this.damage_text_array[i].setVisible(false);
                break;
            }
        }
    }

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
        this.bounce_damage = Math.floor((this.curr_speed/game_settings.player_dash_speed)*game_settings.dash_damage);

        // this.updateGetHit();
        if (this.stunned) {
            this.stun_time -= delta/1000;
            this.setDrag(this.bounce_drag);
            if (this.stun_time < 0){
                this.setDrag(this.base_drag);
                this.stunned = false;
                if (this.health <= 0){
                    this.die();
                    return;
                }
            }
        }
        if (this.anims.isPlaying)
            this.current_frame = this.anims.currentFrame.index-1;
        if (!this.stunned) {
            this.anims.play({key: `${this.type.toLowerCase()} move ${this.last_direction_moved.toLowerCase()}`, startFrame: this.current_frame}, true);
        }
        else if (this.stunned) {
            this.anims.play(`${this.type.toLowerCase()} damage ${this.last_direction_moved.toLowerCase()}`, true);
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

        const angle = -Math.atan2(this.x-current_scene.player.x, this.y-current_scene.player.y);
        if (Math.sin(angle) >= 0) 
            this.last_direction_moved = "right";
        else 
            this.last_direction_moved = "left";
            
        moveTo(this, current_scene.player);
    }
}

class GolemEnemy extends BaseEnemy {
    constructor(x, y, texture){
        super(x, y, texture, "GOLEM");
        
        this.shockwaves = [];
        //this.shockwaves.push(current_scene.enemy_shockwaves.borrow(this));
        this.loaded = true;
    }

    reset(){
        super.reset();
    }

    damage(damage_value){
        super.damage(damage_value);
    }

    die(){
        this.shockwaves.forEach(shockwave => {
            shockwave.owner = null;
            if (shockwave.active == false){
                this.scene.enemy_shockwaves.return(shockwave);
            }
        });
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

        if (dist <= game_settings.golem_agro_range/2){
            if (this.loaded){
                this.loaded = false;
                this.fire(current_scene.player);
                this.speed = 0;
                current_scene.time.delayedCall(game_settings.golem_reload_time, function () {
                    this.speed = game_settings.golem_speed;
                    this.loaded = true;
                }, null, this);
            }
        }

        this.shockwaves.forEach(shockwave => {
            shockwave.update();
        });
    }

    fire(target){
        let shockwave = null;
        for(let i = 0; i < this.shockwaves.length; i++){
            if (this.shockwaves[i].visible == false){
                shockwave = this.shockwaves[i];
                break;
            }
        }
        if (shockwave == null){
            this.shockwaves.unshift(this.scene.enemy_shockwaves.borrow(this));
            shockwave = this.shockwaves[0];
        }
        

        shockwave.reset();
        shockwave.setActive(true).setVisible(true).setDepth(20);
        shockwave.setPosition(this.x, this.y);
    }
}



class ShooterEnemy extends BaseEnemy {
    constructor(x, y, texture){
        super(x, y, texture, "SHOOTER");
        this.shooting_speed = game_settings.shooter_shooting_speed;

        this.projectiles = [];
        this.projectiles.push(current_scene.enemy_projectiles.borrow(this));
        this.loaded = true;
        this.ammo = 3;
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
                this.fireAmmo(current_scene.player);
                current_scene.time.delayedCall(game_settings.shooter_reload_time, function () {
                    this.loaded = true;
                    this.ammo = 3;
                }, null, this);
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
            projectile = this.projectiles[0];
        }
        
        projectile.reset();
        projectile.setActive(true).setVisible(true).setDepth(20);
        projectile.setPosition(this.x, this.y);
        this.scene.physics.moveToObject(projectile, target, 100);
    }

    fireAmmo(target){
        current_scene.time.delayedCall(game_settings.shooter_ammo_spacing, function () {
            this.fire(current_scene.player);
            this.ammo--;
            if (this.ammo) {
                this.fireAmmo(target);
            }
        }, null, this);
    }
}
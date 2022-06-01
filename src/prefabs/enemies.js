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

        let project = null;

        let loopnum = 0;
        while (project == null){
            loopnum +=  1;
            if (this.num_free <= 0 || loopnum == 5){
                //console.log(`adding new projectile. loopnum: ${loopnum}`);
                this.add(new Projectile(0, 0, this.projectile_texture));
                this.num_free += 1;
            }
    
            this.getChildren().forEach(projectile => {
                if (projectile.owner == null){
                    project = projectile;
                    this.num_free -= 1;
                    return;
                }
            });
        }

        project.owner = new_owner;
        return project;
    }

    return(projectile){
        disableCollision(projectile.body);
        projectile.owner = null;
        this.num_free += 1;
    }
}

class Projectile extends Phaser.Physics.Arcade.Sprite{
    constructor(x, y, texture){
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);
        disableCollision(this.body);
        this.setScale(2);
        this.setMass(0.2);

        this.speed = 0;
        this.owner = null;
        this.setActive(false);
        this.setVisible(false);
        this.deflected = false;
    }

    reset(){
        //console.log(`reseting projectile`);
        this.setActive(false);
        this.deflected = false;
        this.body.stop();
        this.setVisible(false);
        this.setPosition(10,0);
        if (this.owner == null){
            this.scene.enemy_projectiles.return(this);
        }
        disableCollision(this.body);
    }

    update(){
        if (this.x > current_scene.player.x + game.config.width || this.x < current_scene.player.x - game.config.width || this.y > current_scene.player.y + game.config.height || this.y < current_scene.player.y - game.config.height){
            this.reset();
        }
        if (this.owner == null || this.owner.visible == false){
            this.reset();
        }
        if (!this.active){
            return;
        } else{
            enableCollision(this.body);
            this.speed = Math.sqrt(Math.pow(this.body.velocity.y, 2) + Math.pow(this.body.velocity.x, 2));
            if (this.speed < 1){
                this.reset();
            }
            this.anims.play('shooter bullet', true);
        }
        let targetPoint = new Phaser.Math.Vector2(this.x + this.body.velocity.x, this.y + this.body.velocity.y);
        let pos = new Phaser.Math.Vector2(this.x, this.y);
        this.move_angle = -Math.atan2(targetPoint.x-this.x, targetPoint.y-this.y);
        //console.log(this.move_angle);
        this.rotation = Phaser.Math.Angle.BetweenPoints(pos, targetPoint);
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
        
        let wave = null;

        let loopnum = 0;
        while (wave == null){
            loopnum +=  1;
            if (this.num_free <= 0 || loopnum == 5){
                this.add(new Shockwave(0, 0, this.shockwave_texture));
                this.num_free += 1;
            }
    
            this.getChildren().forEach(shockwave => {
                if (shockwave.owner == null){
                    wave = shockwave;
                    this.num_free -= 1;
                    return;
                }
            });
        }

        wave.owner = new_owner;
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
        //disableCollision(this.body);

        this.owner = null;
        //this.expanding_width = this.displayWidth*2;
        this.setActive(false);
        this.setVisible(false);
        this.setCircle(this.displayWidth/2);
    }

    reset(){
        //console.log(`reseting shockwave. owner: ${this.owner}`);
        this.setActive(false);
        this.body.stop();
        this.setVisible(false);
        this.setPosition(0,0);
        this.scaleX = 1;
        this.scaleY = 1;
        //this.expanding_width = this.displayWidth;
        this.setCircle(this.displayWidth/2);
        if (this.owner == null){
            this.scene.enemy_shockwaves.return(this);
        }
    }
}

class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture, type) {
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);
        
        disableCollision(this.body);

        this.base_drag = 0.05;
        this.setDrag(this.base_drag);
        this.setDamping(true);
        this.setCircle(this.width/2);

        this.setDepth(4);

        this.enemy_sfx = {
            "hit": current_scene.sound.add('enemy hit'),
            "dead":  current_scene.sound.add('enemy dead'),
            "passive": undefined
        }
        this.passive_volume;
        this.passive_timer;
        this.passive_interval;

        this.last_direction_moved = "right";
        this.type = type;
        this.stunned = false;
        this.attacked = false;
        this.player_dist = 0;
        this.current_frame = 0;
        switch(this.type) {
            case "CHARGER":
                this.speed = game_settings.charger_speed;
                this.base_health = game_settings.charger_health;
                this.bounce_mod = game_settings.charger_bounce_mod;
                this.bounce_drag = game_settings.charger_bounce_drag;
                //this.enemy_sfx["passive"] = current_scene.sound.add('sizzle').setLoop(true);
                this.passive_volume = 0.3;
                this.passive_timer;
                this.passive_interval;
                break;
            case "DASHER":
                this.speed = game_settings.dasher_speed;
                this.base_health = game_settings.dasher_health;
                this.bounce_mod = game_settings.dasher_bounce_mod;
                this.bounce_drag = game_settings.dasher_bounce_drag;
                //this.enemy_sfx["passive"] = current_scene.sound.add('sizzle').setLoop(true);
                this.passive_volume = 0.3;
                this.passive_timer;
                this.passive_interval;
                break;
            case "GOLEM":
                this.speed = game_settings.golem_speed;
                this.base_health = game_settings.golem_health;
                this.bounce_mod = game_settings.golem_bounce_mod;
                this.bounce_drag = game_settings.golem_bounce_drag;
                this.enemy_sfx["passive"] = current_scene.sound.add('wing beat').setLoop(true);
                this.passive_volume = 0.5;
                this.passive_interval = 0.05;
                this.passive_timer = this.passive_interval;
                break;
            case "SHOOTER":
                this.speed = game_settings.shooter_speed;
                this.base_health = game_settings.shooter_health;
                this.bounce_mod = game_settings.shooter_bounce_mod;
                this.bounce_drag = game_settings.shooter_bounce_drag;
                this.enemy_sfx["passive"] = current_scene.sound.add('sizzle').setLoop(true);
                this.passive_volume = 0.3;
                this.passive_interval = 0;
                this.passive_timer = this.passive_interval;
                break;
            default:
                console.log("CONSTRUCTOR ERROR: INVALID ENEMY TYPE");
                break;
        }
        this.is_dead = false;
        this.hit_lava = false;
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
            .setDepth(25)
        ];


    }

    reset() {
        disableCollision(this.body);
        //console.log(`reseting: ${type}`)
        this.setActive(true);
        this.setVisible(true);
        this.body.setVelocity(0,0);
        this.setAlpha(1);
        if (this.health != null && this.base_health != null){
            this.health = this.base_health;
        }
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
        this.enemy_sfx["hit"].play();
        this.health -= damage_value;
        this.stunned = true;
        if (this.health <= 0 && !this.is_dead) {
            this.enemy_sfx["dead"].play();
            this.is_dead = true;
        }
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
                this.damage_text_array[i+1].setFontSize(26).setDepth(25);
                if (damage_value > game_settings.dash_damage) {
                    this.damage_text_array[i+1].setFontSize(34);
                    this.damage_text_array[i+1].setColor('#FF0000');
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
                    this.damage_text_array[i].setFontSize(34);
                    this.damage_text_array[i].setColor('#FF0000');
                }
                else {
                    this.damage_text_array[i].setFontSize(26);
                    this.damage_text_array[i].setColor('#FFFFFF');
                }
                damageDisplay(this, i);
                //this.damage_text_array[i].setVisible(false);
                break;
            }
        }
    }

    die() {
        disableCollision(this.body);
        onEnemyDead(this);
        if (this.enemy_sfx["passive"] != undefined)
            this.enemy_sfx["passive"].stop();
        this.x = -100;
        this.y = -100;
        this.setAlpha(1);
        this.setActive(false);
        this.setVisible(false);
        this.health = this.base_health;
    }

    update(timer, delta) {
        if (this.asleep){
            return;
        } else if (this.visible == false){
            this.setVisible(true);
        }
        if (!this.asleep && this.body.checkCollision.none){
            enableCollision(this.body);
        }

        this.player_dist = Phaser.Math.Distance.Between(this.x, this.y, current_scene.player.x, current_scene.player.y);
        this.updateStep(delta);

        this.curr_speed =  Math.sqrt(Math.pow(this.body.velocity.y, 2) + Math.pow(this.body.velocity.x, 2));
        this.bounce_damage = Math.floor((this.curr_speed/game_settings.player_dash_speed)*game_settings.dash_damage);

        // this.updateGetHit();
        if (this.stunned) {
            this.stun_time -= delta/1000;
            this.setDrag(this.bounce_drag);
            if (this.stun_time < 0){
                this.setDrag(this.base_drag);
                this.stunned = false;
                this.hit_lava = false;
                if (this.is_dead){
                    this.die();
                    return;
                }
            }
        }
        
        if (this.anims.isPlaying) {
            if (this.anims.currentAnim.key != `${this.type.toLowerCase()} attack left`
            && this.anims.currentAnim.key != `${this.type.toLowerCase()} attack right`) {
                this.current_frame = this.anims.currentFrame.index-1;
            } else {
                this.attack_frame = this.anims.currentFrame.index-1;
            }
        }

        if (!this.stunned && !this.attacked) {
            const angle = -Math.atan2(this.x-current_scene.player.x, this.y-current_scene.player.y);
            if (Math.sin(angle) >= 0) 
                this.last_direction_moved = "right";
            else 
                this.last_direction_moved = "left";

            if (this.type == "DASHER" && this.charging_dash) {
                this.anims.play(`${this.type.toLowerCase()} charge ${this.last_direction_moved.toLowerCase()}`, true);
            }
            else if (this.type == "DASHER" && this.dashing) {
                this.anims.play(`${this.type.toLowerCase()} dash ${this.last_direction_moved.toLowerCase()}`, true);
            }
            else {
                if (this.enemy_sfx["passive"] != undefined && this.type != "SHOOTER" && this.enemy_sfx["passive"].isPaused) this.enemy_sfx["passive"].play();
                this.anims.play({key: `${this.type.toLowerCase()} move ${this.last_direction_moved.toLowerCase()}`, startFrame: this.current_frame}, true);
            }
        }
        else if (this.stunned) {
            if (this.type == "GOLEM") this.enemy_sfx["passive"].pause();
            this.anims.play(`${this.type.toLowerCase()} damage ${this.last_direction_moved.toLowerCase()}`, true);
        }
        else if (this.attacked) {
            this.enemy_sfx["passive"].pause();
            this.anims.play({key: `${this.type.toLowerCase()} attack ${this.last_direction_moved.toLowerCase()}`, startFrame: 0}, true);
        }
    }

    updateStep(delta) {
        if (this.enemy_sfx["passive"] != undefined && !this.enemy_sfx["passive"].isPaused) {
            this.passive_timer -= delta/1000;
            if (this.passive_timer <= 0) {
                this.passive_timer = this.passive_interval;
                if (this.active && !this.enemy_sfx["passive"].isPlaying) {
                    this.enemy_sfx["passive"].play();
                }

                if (this.enemy_sfx["passive"].isPlaying) {
                    let vol = ((config.width/2)/this.player_dist)/10;
                    if (vol > this.passive_volume) vol = this.passive_volume;
                    this.enemy_sfx["passive"].setVolume(vol);
                }
            }
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
        if (this.asleep){this.setAlpha(0.5)} else {this.setAlpha(1)}
        if (this.stunned || this.asleep) return;
   
        moveTo(this, current_scene.player);
    }
}

class DasherEnemy extends BaseEnemy {
    constructor(x, y, texture){
        super(x, y, texture, "DASHER");

        // variables
        this.dash_interval = 2;
        this.dash_timer = 0;
        this.charging_dash = false;
        this.dashing = false;
        this.dash_pos = 0;

        this.charge_dash_interval = 1;
        this.charge_dash_timer = 0;
        this.enemy_sfx["charge dash"] = current_scene.sound.add('enemy charge dash');
        this.enemy_sfx["dash"] = current_scene.sound.add('enemy dash');

        this.aggro_range = 500;

        this.end_dash_speed = 50;

        this.setScale(3);
        this.hitbox_radius = 6;
        this.dash_radius = 10;
        this.setCircle(this.hitbox_radius, this.width/2-this.hitbox_radius, this.height/2-this.hitbox_radius);
    }
    reset(){
        super.reset();
    }
    damage(damage_value){
        super.damage(damage_value);
        if (this.charging_dash) {
            this.charging_dash = false;
            this.charge_dash_timer = 0;
            this.speed = game_settings.dasher_speed;
        }
    }

    die(){
        super.die();
    }

    chargeDash(delta) {
        this.speed = 0;
        this.charge_dash_timer += delta/1000;
        if (this.charge_dash_timer >= this.charge_dash_interval) {
            this.setCircle(this.dash_radius, this.width/2-this.dash_radius, this.height/2-this.dash_radius);
            this.charge_dash_timer = 0;
            this.enemy_sfx["dash"].play();
            //this.setDrag(game_settings.dasher_dash_drag);
            this.charging_dash = false;
            this.dashing = true;

            const dash_angle = -Math.atan2(this.x-current_scene.player.x, this.y-current_scene.player.y);
            //console.log(dash_angle);
            const vel_x = game_settings.dasher_dash_speed * Math.sin(dash_angle);
            const vel_y = game_settings.dasher_dash_speed * -Math.cos(dash_angle);
            this.setVelocity(vel_x, vel_y);
        }
    }

    updateDash() {
        if (this.curr_speed <= this.end_dash_speed) {
            this.setCircle(this.hitbox_radius, this.width/2-this.hitbox_radius, this.height/2-this.hitbox_radius);
            this.dashing = false;
            this.speed = game_settings.dasher_speed;
            this.setDrag(this.base_drag);
        }
    }
    //this enemy will dash towards the player on a cooldown
    update(time, delta){
        super.update(time, delta);
        if (this.asleep){this.setAlpha(0.5)} else {this.setAlpha(1)}
        if (this.stunned || this.asleep) return;
   
        if (!this.charging_dash && !this.dashing) {
            this.dash_timer += delta/1000;
            if (this.dash_timer >= this.dash_interval && this.player_dist <= this.aggro_range) {
                this.enemy_sfx["charge dash"].play();
                this.dash_timer = 0;
                this.charging_dash = true;
            }
            else {
                moveTo(this, current_scene.player);
            }
        }
        else if (this.charging_dash) {
            this.chargeDash(delta);
        }
        else if (this.dashing) {
            this.updateDash(delta);
        }
    }
}

class GolemEnemy extends BaseEnemy {
    constructor(x, y, texture){
        super(x, y, texture, "GOLEM");
        this.setScale(2);
        this.shockwaves = [];
        this.shockwaves.push(current_scene.enemy_shockwaves.borrow(this));
        //this.loaded = true;
        const hitbox_radius = 16;
        this.setCircle(hitbox_radius, this.width/2-hitbox_radius, this.height/2-hitbox_radius);
        this.loaded = true;
        this.fired = false;
        this.golem_shockwave_start_frame = 5;
        this.golem_shockwave_end_frame = 12;
        this.slam_sfx = current_scene.sound.add('enemy slam');
    }

    reset(){
        super.reset();
    }

    damage(damage_value){
        this.attacked = false;
        this.anims.stop();
        super.damage(damage_value);
        this.speed = 0;
        this.loaded = false;
        this.attacked = true;
        this.fired = false;
    }

    die(){
        this.shockwaves.forEach(shockwave => {
            shockwave.owner = null;
            if (shockwave.active == false){
                //this.scene.enemy_shockwaves.return(shockwave);
                current_scene.enemy_shockwaves.return(shockwave);
            }
        });
        super.die();
    }

    //this enemy will only move toward the player if they're close. Otherwise, they'll just stand still
    update(time, delta){
        super.update(time, delta);
        if (this.asleep){this.setAlpha(0.5)} else {this.setAlpha(1)};
        if (this.stunned|| this.asleep) return;
        if (this.attacked && (this.attack_frame == game_settings.golem_shockwave_end_frame)) {
            this.attack_frame = 0;
            this.anims.stop();
            if (this.enemy_sfx["passive"].isPaused) this.enemy_sfx["passive"].play();
            this.attacked = false;
            this.speed = game_settings.golem_speed;
            current_scene.time.delayedCall(game_settings.golem_reload_time, function () {
                this.fired = false;
                this.loaded = true;
            }, null, this);
        }
        if (this.attacked && !this.fired && (this.attack_frame == game_settings.golem_shockwave_start_frame)) {
            this.fire();
            this.fired = true;
        }
        //if (this.attacked && (this.current))
        if (this.player_dist <= game_settings.golem_agro_range){
            moveTo(this, current_scene.player);
        }

        if (this.player_dist <= game_settings.golem_attack_range){
            if (this.loaded){
                //console.log("TRIED TO ATTACK");
                this.attacked = true;
                this.loaded = false;
                //this.fire();
                this.speed = 0;
            }
        }

        this.shockwaves.forEach(shockwave => {
            shockwave.update();
        });
    }

    fire(){
        //console.log("FIRE!");
        this.slam_sfx.play();
        current_scene.cameras.main.shake(100, 0.003);
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
        //shockwave.reset();
        shockwave.setActive(true).setVisible(true).setDepth(20).setPosition(this.x, this.y);
        //shockwave.setPosition(this.x, this.y);
        current_scene.tweens.add({
            targets: shockwave,
            scaleX: game_settings.golem_shockwave_size,
            scaleY: game_settings.golem_shockwave_size,
            ease: 'Linear',
            duration: game_settings.golem_shockwave_duration,
            onComplete: function() {
                shockwave.reset();
            }
        });
    }
}



class ShooterEnemy extends BaseEnemy {
    constructor(x, y, texture){
        super(x, y, texture, "SHOOTER");
        this.setScale(2);
        const hitbox_radius = 10;
        this.setCircle(hitbox_radius, this.width/2-hitbox_radius, this.height/2-hitbox_radius);
        this.shooting_speed = game_settings.shooter_shooting_speed;

        this.projectiles = [];
        this.projectiles.push(current_scene.enemy_projectiles.borrow(this));
        this.loaded = true;
        this.ammo = game_settings.shooter_ammo;
        this.fire_sfx = current_scene.sound.add('shoot sfx');
    }

    reset(){
        super.reset();
    }

    damage(damage_value){
        super.damage(damage_value);
    }

    die(){
        /*this.projectiles.forEach(projectile => {
            projectile.owner = null;
            if (projectile.active == false){
                this.scene.enemy_projectiles.return(projectile);
            }
        });*/
        super.die();
    }

    //this enemy will try to put space between themselves and the player, then shoot
    update(time, delta){
        super.update(time, delta);
        if (this.asleep){this.setAlpha(0.5)} else {this.setAlpha(1)}
        if (this.stunned|| this.asleep || !this.active){
            /*if (this.room == 2){
                console.log(`asleep: ${this.asleep}, room: ${this.room}`);
            }*/
            return;
        }

        /*if (this.active && !this.sizzle_sfx.isPlaying) {
            this.sizzle_sfx.play();
        }
        if (this.sizzle_sfx.isPlaying) {
            let vol = ((config.width/2)/this.player_dist)/10;
            if (vol > 0.3) vol = 0.3;
            this.sizzle_sfx.setVolume(vol);
        }*/
        if (this.player_dist >= game_settings.shooter_min_dist){
            if (this.loaded){    
                this.loaded = false;
                this.fireAmmo(current_scene.player);
                current_scene.time.delayedCall(game_settings.shooter_reload_time, function () {
                    this.loaded = true;
                    this.ammo = game_settings.shooter_ammo;
                }, null, this);
            }
        }

        this.projectiles.forEach(projectile => {
            projectile.update();
        });
    }

    fire(target){
        //console.log("shooter firing");
        this.fire_sfx.play();
        let projectile = null;
        for(let i = 0; i < this.projectiles.length; i++){
            if (this.projectiles[i].visible == false){
                //console.log("reusing an invisible projectile");
                projectile = this.projectiles[i];
                break;
            }
        }
        if (projectile == null){
            //console.log("there are no projectiles that I can use");
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
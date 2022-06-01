class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(x, y, texture){
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.dash_pointer = current_scene.add.sprite(x, y, "dash pointer").setScale(3).setDepth(2).setAlpha(0.3);
        this.setDepth(5);

        this.charge_progress = 0;
        this.dashing = false;
        this.health = game_settings.player_curr_health;
        this.setDrag(game_settings.player_walk_drag);
        this.setDamping(true);
        this.score = 0;
        this.on_lava = false;

        this.can_move = true;

        this.player_sfx = {
            "dash": current_scene.sound.add('player dash'),
            "super dash": current_scene.sound.add('player super dash'),
            "hit": current_scene.sound.add('player hit'),
            "step": current_scene.sound.add('footstep', {volume: 0.1}),
            "charge": current_scene.sound.add('dash charge', {volume: 0.3}),
            "finish charge": current_scene.sound.add('finish charge', {volume: 0.9})
        }
        this.step_sfx = current_scene.sound.add('footstep');
        this.footstep_interval = 0.3;
        this.footstep_timer = this.footstep_interval;
        this.charge_finished = false;
        // states of invincibility
        this.stunned = false;
        this.invincible = false;
        this.invulnerable = false;
        this.stun_duration = 0.5;
        this.invincible_duration = game_settings.player_invincible_time;

        this.safe_pos = new Phaser.Math.Vector2(this.x, this.y);
        this.bouncing = false;  //this is to let the player cancel their bounce after they hit an enemy
        this.min_dash_speed = game_settings.player_walk_speed*2;
        this.min_bounce = game_settings.player_dash_speed/2;
        this.dash_cancel_timer = 0;
        this.dash_cancel_buffer = 0.1;  // seconds needed to cancel a dash

        this.dash_cooldown_timer = 0;
        this.dash_cooldown_duration = game_settings.player_dash_cooldown;
        this.dash_on_cooldown = false;

        this.perfect_dash_buffer = game_settings.player_perfect_dash_window;
        this.perfect_dash_timer = 0;
        this.perfect_dash = false;

        this.last_direction_moved = "right";
        this.mouse_direction;
        this.moving = false;
        this.speed = 0;
        this.dash_damage = 0;

        this.body.bounce.set(0);
        this.setMass(game_settings.player_mass);
        
        // hitbox is circle
        const hitboxRadius = 6;
        this.setCircle(hitboxRadius, this.width/2-hitboxRadius, this.height/2-hitboxRadius);

        this.current_frame =  0;
        this.scaleX = 3;
        this.scaleY = 3;

        this.dust_clouds = [];

        /*this.particles = current_scene.add.particles('dust cloud');
        // create particle emitter
        this.emitter = this.particles.createEmitter({
            lifespan: 300,
            scaleX: 2,
            scaleY: 2
        });
        this.particles.setDepth(4);
        this.emitter.startFollow(this);*/

        this.particles;
        this.dash_emitter;
    }

    update(time, delta){
        if (!this.stunned && !this.on_lava){
            this.safe_pos.x = this.x;
            this.safe_pos.y = this.y;
        }
        game_settings.player_curr_health = this.health;
        if (this.dashing && this.speed <= game_settings.player_walk_speed){
            this.doneDashing();
        }
        this.movePlayer(delta);
        this.updateDustClouds();
        checkPlayerLavaCollision();

        if (this.can_move) {
            this.updateDashCooldown(delta);
            this.chargeDash(delta);
            this.updateDashPointer();
        }
        else this.dash_pointer.setVisible(false);

        // dash damage is speed/dash_speed * dash_damage;
        // given: velocity of player and the angles the two objects are going.
        this.speed = Math.sqrt(Math.pow(this.body.velocity.y, 2) + Math.pow(this.body.velocity.x, 2));
        this.dash_damage = Math.floor((this.speed/game_settings.player_dash_speed)*game_settings.dash_damage);

        // update the animation frame
        if (this.anims.isPlaying) {
            this.current_frame = this.anims.currentFrame.index-1;
        }
    }

    updateDustClouds() {
        for (let i = 0; i < this.dust_clouds.length; i++) {
            if (!this.dust_clouds[i].anims.isPlaying) {
                this.dust_clouds[i].setVisible(false);
                this.dust_clouds[i].destroy();
                this.dust_clouds.splice(i, 1);
                i--;
            }
        }
    }

    updateDashPointer() {
        // set position and angle of dash pointer
        this.dash_pointer.rotation = Phaser.Math.Angle.BetweenPoints(new Phaser.Math.Vector2(this.x, this.y), getMouseCoords());
        this.dash_pointer.x = this.x;
        this.dash_pointer.y = this.y;
    }

    doneDashing() {
        this.dash_on_cooldown = true;
        this.body.bounce.set(0);
        this.footstep_timer = this.footstep_interval;
        this.dash_cancel_timer = 0;
        this.perfect_dash_timer = 0;
        this.emitter.stop();

        this.perfect_dash = false;
        this.dashing = false;
        this.bouncing = false;
        this.setDrag(game_settings.player_walk_drag);

        
        
    }

    updateDashCooldown(delta) {
        if (this.dash_on_cooldown) {
            this.dash_cooldown_timer += delta/1000;
            if (this.dash_cooldown_timer >= this.dash_cooldown_duration) {
                this.dash_on_cooldown = false;
                this.dash_cooldown_timer = 0;
            }
        }
    }

    chargeDash(delta) { 
        if (this.dash_on_cooldown || this.stunned)
            return;
        if ((pointer.isDown || key_space.isDown) && !this.dashing){
            if (getMouseCoords().x < this.x) {
                this.last_direction_moved = "LEFT";
            }
            else {
                this.last_direction_moved = "RIGHT";
            }
            if (this.charge_progress < game_settings.player_max_charge_progress) {
                if (!this.player_sfx["charge"].isPlaying) {
                    this.player_sfx["charge"].play();
                }
                this.charge_progress += delta;
                this.dash_pointer.setAlpha(this.charge_progress/game_settings.player_max_charge_progress + 0.1);
            }
            else {
                this.player_sfx["charge"].stop();
                if (!this.charge_finished) {
                    this.player_sfx["finish charge"].play();
                }
                this.charge_finished = true;
                if (this.perfect_dash_timer < this.perfect_dash_buffer) {
                    this.perfect_dash = true;
                    this.dash_pointer.anims.play("dash pointer charged", true);
                }
                else {
                    this.perfect_dash = false;
                    this.dash_pointer.setTexture("dash pointer");
                }
                this.perfect_dash_timer += delta/1000;
            }
        }
        
        // if pointer isn't down and key space is released, dash with space
        if (this.charge_progress > 0 && !key_space.isDown && !pointer.isDown) {
            this.dash();
            this.charge_progress = 0;
            this.player_sfx["charge"].stop();
            this.charge_finished = false;
            this.dash_pointer.setAlpha(0.3);
        }
    }

    movePlayer(delta) {
        //player movement
        if (this.bouncing)
            this.dash_cancel_timer += delta/1000;
        else
            this.dash_cancel_timer = 0;
        const can_cancel_dash = (this.dash_cancel_timer >= this.dash_cancel_buffer);
        if (!this.dashing || can_cancel_dash) {
            // if player is capable of using events
            if (this.can_move) {
                this.moving = false;
                if (key_left.isDown && key_right.isDown) {
                    this.setVelocityX(0);
                }
                else if (key_left.isDown){
                    this.move("LEFT", delta);
                }
                else if (key_right.isDown){
                    this.move("RIGHT", delta);
                }

                if (key_up.isDown && key_down.isDown) {
                    this.setVelocityY(0);
                }
                else if (key_up.isDown){
                    this.move("UP", delta);
                }
                else if (key_down.isDown){
                    this.move("DOWN", delta);
                }
            }
            if (!this.moving && !this.dashing && !this.stunned) {
                this.anims.play({key: `fran idle ${this.last_direction_moved.toLowerCase()}`, startFrame: this.current_frame}, true);
                this.footstep_timer = this.footstep_interval;
            }
            else if (this.stunned) {
                this.anims.play(`fran damage ${this.last_direction_moved.toLowerCase()}`, true);
            }
            else {
                this.updateFootstep(delta);
            }
        }
    }

    updateFootstep(delta) {
        this.footstep_timer += delta/1000;
        if (this.footstep_timer >= this.footstep_interval) {
            this.footstep_timer = 0;                    
            current_scene.sound.add("footstep").play();
            this.dust_clouds.push(
                current_scene.add.sprite(this.x, this.y+(this.displayHeight*0.2), 'dust cloud').setDepth(4).setScale(2).setAlpha(0.7)
            );
            this.dust_clouds[this.dust_clouds.length-1].anims.play('dust cloud', true);
        }
    }

    dash(){
        if (this.stunned) {
            return;
        }
        this.charge_finished = false;
        if (this.perfect_dash) {
            this.player_sfx["super dash"].play();
        }
        else {
            this.player_sfx["dash"].play();
        }
        this.body.bounce.set(game_settings.player_bounce_mod);
        this.anims.play(`fran dash ${this.last_direction_moved.toLowerCase()}`, true);
        // create the afterimage emitter
        this.particles = current_scene.add.particles(`fran dash ${this.last_direction_moved.toLowerCase()}`);
        this.emitter = this.particles.createEmitter({
            lifespan: 300,
            alpha: {
                start: 0.3,
                end: 0
            },
            frequency: 30,
            scaleX: 3,
            scaleY: 3
        });
        this.particles.setDepth(4);
        this.emitter.startFollow(this);

        let speed = (this.charge_progress/game_settings.player_max_charge_progress)*game_settings.player_dash_speed;
        if (this.perfect_dash) {
            speed *= 1.5;
        }
        if (speed < this.min_dash_speed) speed = this.min_dash_speed;
        current_scene.physics.moveToObject(this, getMouseCoords(), speed);
        this.dashing = true;
        this.setDrag(game_settings.player_dash_drag);

        if (this.has_ball == true){
            console.log("threw ball!");
            this.has_ball = false;
            let camPos = getCameraCoords(null, this.dash_pointer.x-50, this.dash_pointer.y-50);
            current_scene.ball.setPosition(camPos.x, camPos.y);
            current_scene.ball.setActive(true).setVisible(true);
            current_scene.ball.setVelocity(current_scene.player.body.velocity.x, current_scene.player.body.velocity.y);       
            current_scene.ball.deflected = true;
        }
    }

    //damages the player. source and redirect are optional
    //source: what damaged the player
    //redirect: how the player responds to the damage. if false, or not passed, player moves away from damage at a fixed speed. if true, player reverses their own direciton
    damage(source, redirect, shockwave){
        // if player is invulnerable, cannot take damage
        if (this.invulnerable){
            return;
        }
        current_scene.cameras.main.shake(150, 0.003);
        this.health-= 0.5;
        //console.log(this.health);
        if (this.health <= 0){
            game_settings.player_curr_health = game_settings.player_max_health;
            this.health = 5;
            // bg_music.stop();
            current_scene.scene.restart();
            this.setPosition(game.config.width/2, game.config.height/2);
            return;
        }

        current_scene.enemyCollider.active = false;
        this.stunned = true;
        this.invulnerable = true;
        this.body.bounce.set(game_settings.player_bounce_mod);
        this.player_sfx["charge"].stop();
        
        this.charge_progress = 0;
        this.charge_finished = false;
        this.perfect_dash_timer = 0;

        this.dash_pointer.setAlpha(0.3);
        const stun_duration = this.stun_duration * 1000;
        this.player_sfx["hit"].play();
        // when stun is over
        current_scene.time.delayedCall(stun_duration, () => {
            this.footstep_timer = this.footstep_interval;
            this.setAlpha(0.6); 
            this.body.bounce.set(0);
            this.stunned = false;
            this.invincible = true;

            const invincible_duration = this.invincible_duration * 1000;
            // when invincibility is over
            current_scene.time.delayedCall(invincible_duration, () => {
                this.setAlpha(1);
                current_scene.enemyCollider.active = true;
                this.invincible = false;
                this.invulnerable = false;
            }, null, this);
        }, null, this);

        if (shockwave){
            if (this.dashing) {
                this.doneDashing();
            }
            source = source.owner;
            let redirect_multiplier = game_settings.golem_shockwave_power * 10;
            const angle = -Math.atan2(source.x-this.x, source.y-this.y);
            const vel_x = redirect_multiplier * Math.sin(angle);
            const vel_y = redirect_multiplier * -Math.cos(angle);
            this.setVelocity(vel_x, vel_y);
        }
        else if (redirect && source){
            let redirect_multiplier = game_settings.player_walk_speed*4;
            if (source.speed > redirect_multiplier) {
                redirect_multiplier = source.speed;
            }
            //console.log(source.body.angle);
            const vel_x = redirect_multiplier*(Math.cos(source.body.angle));
            const vel_y = redirect_multiplier*(Math.sin(source.body.angle));
            this.setVelocity(vel_x, vel_y);
        } else {
            if (source){
                moveAway(this, source);
            }
        }
        // if moving right or left
        if (this.body.velocity.x < 0) {
            this.last_direction_moved = "LEFT";
        }
        else {
            this.last_direction_moved = "RIGHT";
        }
    }

    move(dir, delta){
        if (this.stunned){
            return;
        }
        let speed = game_settings.player_walk_speed;
        this.moving = true;
        switch(dir){
            case "LEFT":
                if (!pointer.isDown && !key_space.isDown || this.invulnerable)
                    this.last_direction_moved = dir;
                if (this.body.velocity.x > -speed){
                    this.setVelocityX(-speed);
                    if (speed <= game_settings.player_walk_speed && this.dashing){
                        this.doneDashing();
                    }
                }
                break;
            case "RIGHT":
                if (!pointer.isDown && !key_space.isDown || this.invulnerable)
                    this.last_direction_moved = dir;
                if (this.body.velocity.x < speed){
                    this.setVelocityX(speed);
                    if (speed <= game_settings.player_walk_speed && this.dashing){
                        this.doneDashing();
                    }
                }
                break;
            case "UP":
                if (this.body.velocity.y > -speed){
                    this.setVelocityY(-speed);
                    if (speed <= game_settings.player_walk_speed && this.dashing){
                        this.doneDashing();
                    }
                }
                break;
            case "DOWN":
                if (this.body.velocity.y < speed){
                    this.setVelocityY(speed);
                    if (speed <= game_settings.player_walk_speed && this.dashing){
                        this.doneDashing();
                    }
                }
                break;
        }
        this.play({key: `fran run ${this.last_direction_moved.toLowerCase()}`, startFrame: this.current_frame}, true);
    }
}
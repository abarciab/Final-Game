class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(x, y, texture){
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.dash_pointer = current_scene.add.image(x, y, "dash pointer").setScale(3).setDepth(2).setAlpha(0.3);
        this.setDepth(5);

        this.charge_progress = 0;
        this.dashing = false;
        this.health = game_settings.player_max_health;
        this.setDrag(game_settings.player_walk_drag);
        this.setDamping(true);
        this.score = 0;
        this.on_lava = false;
        
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

        this.last_direction_moved = "right";
        this.mouse_direction;
        this.moving = false;
        this.speed = 0;
        this.dash_damage = 0;

        this.body.bounce.set(0);
        this.setMass(game_settings.player_mass);
        
        // hitbox is circle
        const hitboxRadius = 8;
        this.setCircle(hitboxRadius, this.width/2-hitboxRadius, this.height/2-hitboxRadius);

        this.current_frame =  0;
        this.scaleX = 3;
        this.scaleY = 3;
    }

    update(time, delta){
        if (!this.stunned && !this.dashing && !this.on_lava){
            this.safe_pos.x = this.x;
            this.safe_pos.y = this.y;
        }
        if (this.dashing && this.speed <= game_settings.player_walk_speed){
            this.doneDashing();
        }
        this.updateDashCooldown(delta);
        this.chargeDash(delta);
        this.movePlayer(delta);
        this.updateDashPointer();

        // dash damage is speed/dash_speed * dash_damage;
        // given: velocity of player and the angles the two objects are going.
        this.speed = Math.sqrt(Math.pow(this.body.velocity.y, 2) + Math.pow(this.body.velocity.x, 2));
        this.dash_damage = Math.ceil((this.speed/game_settings.player_dash_speed)*game_settings.dash_damage);

        // update the animation frame
        if (this.anims.isPlaying) {
            this.current_frame = this.anims.currentFrame.index-1;
        }
    }

    updateDashPointer() {
        // set position and angle of dash pointer
        this.dash_pointer.rotation = Phaser.Math.Angle.BetweenPoints(new Phaser.Math.Vector2(this.x, this.y), getMouseCoords());
        this.dash_pointer.x = this.x;
        this.dash_pointer.y = this.y;
    }

    doneDashing() {
        if (this.invincible) {
            current_scene.enemyCollider.active = false;
            this.body.bounce.set(0);
        }
        this.dash_on_cooldown = true;
        this.body.bounce.set(0);
        this.dash_cancel_timer = 0;
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
                this.charge_progress += delta;
                this.dash_pointer.setAlpha(this.charge_progress/game_settings.player_max_charge_progress + 0.1);
            }
        }
        
        // if pointer isn't down and key space is released, dash with space
        if (this.charge_progress > 0 && !key_space.isDown && !pointer.isDown) {
            this.dash();
            this.charge_progress = 0;
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
            this.moving = false;
            if (key_left.isDown && key_right.isDown) {
                this.setVelocityX(0);
            }
            else if (key_left.isDown){
                this.move("LEFT");
            }
            else if (key_right.isDown){
                this.move("RIGHT");
            }
            if (key_up.isDown && key_down.isDown) {
                this.setVelocityY(0);
            }
            else if (key_up.isDown){
                this.move("UP");
            }
            else if (key_down.isDown){
                this.move("DOWN");
            }
            if (!this.moving && !this.dashing && !this.stunned) {
                this.anims.play({key: `fran idle ${this.last_direction_moved.toLowerCase()}`, startFrame: this.current_frame}, true);
            }
            else if (this.stunned) {
                this.anims.play(`fran damage ${this.last_direction_moved.toLowerCase()}`, true);
            }
        }
    }

    dash(){
        if (this.stunned) {
            return;
        }
        if (this.invincible) {
            current_scene.enemyCollider.active = true;
        }

        this.body.bounce.set(game_settings.player_bounce_mod);
        this.anims.play(`fran dash ${this.last_direction_moved.toLowerCase()}`, true);
        let speed = (this.charge_progress/game_settings.player_max_charge_progress)*game_settings.player_dash_speed;
        if (speed < this.min_dash_speed) speed = this.min_dash_speed;
        current_scene.physics.moveToObject(this, getMouseCoords(), speed);
        this.dashing = true;
        this.setDrag(game_settings.player_dash_drag);
    }

    //damages the player. source and redirect are optional
    //source: what damaged the player
    //redirect: how the player responds to the damage. if false, or not passed, player moves away from damage at a fixed speed. if true, player reverses their own direciton
    damage(source, redirect){
        // if player is invulnerable, cannot take damage
        if (this.invulnerable){
            return;
        }
        current_scene.cameras.main.shake(150, 0.003);
        this.health-= 1;
        if (this.health == 0){
            current_scene.scene.restart();
            this.setPosition(game.config.width/2, game.config.height/2);
            return;
        }
        //this.speed = game_settings.player_dash_speed/4;

        current_scene.enemyCollider.active = false;
        this.stunned = true;
        this.invulnerable = true;
        this.body.bounce.set(game_settings.player_bounce_mod);
        this.charge_progress = 0;
        this.dash_pointer.setAlpha(0.3);
        const stun_duration = this.stun_duration * 1000;
        // when stun is over
        current_scene.time.delayedCall(stun_duration, () => {
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

        if (redirect){
            let redirect_multiplier = game_settings.player_walk_speed*4;
            if (source.speed > redirect_multiplier) {
                redirect_multiplier = source.speed;
            }
            const vel_x = redirect_multiplier*(Math.cos(source.body.angle));
            const vel_y = redirect_multiplier*(Math.sin(source.body.angle));
            this.setVelocity(vel_x, vel_y);
        } else {
            moveAway(this, source);
        }
        // if moving right or left
        if (this.body.velocity.x < 0) {
            this.last_direction_moved = "LEFT";
        }
        else {
            this.last_direction_moved = "RIGHT";
        }
    }

    move(dir){
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
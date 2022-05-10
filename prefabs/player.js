class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(x, y, texture){
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.dash_pointer = current_scene.add.image(x, y, "dash pointer").setScale(3).setDepth(2).setAlpha(0.3);

        this.charge_progress = 0;
        this.dashing = false;
        this.health = game_settings.player_max_health;
        this.setDrag(game_settings.player_walk_drag);
        this.setDamping(true);
        this.score = 0;
        this.invulnerable = false;
        this.safe_pos = {x: this.x, y: this.y};
        this.bouncing = false;  //this is to let the player cancel their bounce after they hit an enemy
        this.last_direction_moved = "right";
        this.mouse_direction;
        this.moving = false;
        this.body.setSize(8, 12);
        //this.body.setOffset(0, 2);
        this.current_frame =  0;
        this.scaleX = 3;
        this.scaleY = 3;
    }

    update(time, delta){
        if (!this.invulnerable && !this.dashing){
            this.safe_pos = {x: this.x, y: this.y};
        }

        this.dash_pointer.rotation = Phaser.Math.Angle.BetweenPoints(new Phaser.Math.Vector2(this.x, this.y), getMouseCoords());
        this.dash_pointer.x = this.x;
        this.dash_pointer.y = this.y;

        if (Math.abs(this.body.velocity.x) <= game_settings.player_walk_speed && Math.abs(this.body.velocity.y) <= game_settings.player_walk_speed){
            this.dashing = false;
            this.bouncing = false;
            this.setDrag(game_settings.player_walk_drag);
            this.clearTint();
        } 
        if (pointer.isDown && !this.dashing && this.charge_progress < game_settings.player_max_charge_progress){
            this.charge_progress += delta;
            this.dash_pointer.setAlpha(this.charge_progress/game_settings.player_max_charge_progress + 0.1);
        }
        // if pointer is down, set animation relative to player position
        if (pointer.isDown) {
            if (getMouseCoords().x < this.x) {
                this.last_direction_moved = "LEFT";
            }
            else {
                this.last_direction_moved = "RIGHT";
            }
        }

        current_scene.input.on('pointerup', function (pointer) {
            if (this.charge_progress > 0){
                this.dash();
            }
            this.charge_progress = 0;
            this.dash_pointer.setAlpha(0.3);
        }, this);
        
        //player movement
        if (!this.dashing || (this.dashing && this.bouncing)){
            this.moving = false;
            if (key_left.isDown && key_right.isDown) {
                this.setVelocityX(0);
            }
            else if (key_left.isDown){
                this.movePlayer("LEFT");
            }
            else if (key_right.isDown){
                this.movePlayer("RIGHT");
            }
            if (key_up.isDown && key_down.isDown) {
                this.setVelocityY(0);
            }
            else if (key_up.isDown){
                this.movePlayer("UP");
            }
            else if (key_down.isDown){
                this.movePlayer("DOWN");
            }
            
            if (!this.moving) {
                this.anims.play({key: `fran idle ${this.last_direction_moved.toLowerCase()}`, startFrame: this.current_frame}, true);
            }
        }

        if (this.anims.isPlaying) {
            this.current_frame = this.anims.currentFrame.index-1;
        }
    }

    dash(){
        let speed = (this.charge_progress/game_settings.player_max_charge_progress)*game_settings.player_dash_speed;
        current_scene.physics.moveToObject(this, getMouseCoords(), speed);
        this.dashing = true;
        this.setDrag(game_settings.player_dash_drag);
        this.setTint(0xFF0000);
    }

    //damages the player. source and redirect are optional
    //source: what damaged the player
    //redirect: how the player responds to the damage. if false, or not passed, player moves away from damage at a fixed speed. if true, player reverses their own direciton
    damage(source, redirect){
        if (this.invulnerable){
            return;
        }

    current_scene.cameras.main.shake(150, 0.003);
        this.health-= 1;
        if (this.health == 0){
            current_scene.scene.restart();
            this.setPosition(game.config.width/2, game.config.height/2);
        } else {
            this.speed = game_settings.player_dash_speed/4;

            if (source){
                this.invulnerable = true;
                current_scene.time.delayedCall(100, function() {this.invulnerable = false}, null, this);
                if (redirect){
                    this.body.setVelocity(this.body.velocity.x*-1, this.body.velocity.y*-1);
                } else{
                    moveAway(this, source);
                }
                
            }   
        }
    }

    movePlayer(dir){
        if (this.invulnerable){
            return;
        }
        let speed = game_settings.player_walk_speed;
        this.moving = true;
        switch(dir){
            case "LEFT":
                if (!pointer.isDown)
                    this.last_direction_moved = dir;
                if (this.body.velocity.x > -speed){
                    this.setVelocityX(-speed);
                    //this.dash_pointer.setVelocityX(-speed);
                    if (speed == game_settings.player_walk_speed){
                        this.dashing = false;
                        this.clearTint();
                    }
                }
                break;
            case "RIGHT":
                if (!pointer.isDown)
                    this.last_direction_moved = dir;
                if (this.body.velocity.x < speed){
                    this.setVelocityX(speed);
                    //this.dash_pointer.setVelocityX(speed);
                    if (speed == game_settings.player_walk_speed){
                        this.dashing = false;
                        this.clearTint();
                    }
                }
                break;
            case "UP":
                if (this.body.velocity.y > -speed){
                    this.setVelocityY(-speed);
                    //this.dash_pointer.setVelocityY(-speed);
                    if (speed == game_settings.player_walk_speed){
                        this.dashing = false;
                        this.clearTint();
                    }
                }
                break;
            case "DOWN":
                if (this.body.velocity.y < speed){
                    this.setVelocityY(speed);
                    //this.dash_pointer.setVelocityY(speed);
                    if (speed == game_settings.player_walk_speed){
                        this.dashing = false;
                        this.clearTint();
                    }
                }
                break;
        }
        this.play({key: `fran run ${this.last_direction_moved.toLowerCase()}`, startFrame: this.current_frame}, true);
    }
}
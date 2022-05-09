class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(x, y, texture){
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.charge_progress = 0;
        this.dashing = false;
        this.health = game_settings.player_max_health;
        this.setDrag(0.05);
        this.setDamping(true);
        this.score = 0;
        this.invulnerable = false;
    }

    update(time, delta){
        //console.log(this);
        if (Math.abs(this.body.velocity.x) <= game_settings.player_walk_speed && Math.abs(this.body.velocity.y) <= game_settings.player_walk_speed){
            this.dashing = false;
            this.clearTint();
        }
        if (key_space.isDown && !this.dashing && this.charge_progress < game_settings.player_max_charge_progress){
            this.charge_progress += delta;
            this.setAlpha(this.charge_progress/game_settings.player_max_charge_progress + 0.1);
        }
        if (Phaser.Input.Keyboard.JustUp(key_space)){
            if (this.charge_progress > 0){
                this.dash();
            }
            this.charge_progress = 0;
            this.setAlpha(0.3);
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
    }

    dash(){
        let speed = (this.charge_progress/game_settings.player_max_charge_progress)*game_settings.player_dash_speed;
        current_scene.physics.moveToObject(this, getMouseCoords(), speed);
        this.dashing = true;
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

        switch(dir){
            case "LEFT":
                if (this.body.velocity.x > -speed){
                    this.setVelocityX(-speed);
                    if (speed == game_settings.player_walk_speed){
                        this.dashing = false;
                        this.clearTint();
                    }
                }
                break;
            case "RIGHT":
                if (this.body.velocity.x < speed){
                    this.setVelocityX(speed);
                    if (speed == game_settings.player_walk_speed){
                        this.dashing = false;
                        this.clearTint();
                    }
                }
                break;
            case "UP":
                if (this.body.velocity.y > -speed){
                    this.setVelocityY(-speed);
                    if (speed == game_settings.player_walk_speed){
                        this.dashing = false;
                        this.clearTint();
                    }
                }
                break;
            case "DOWN":
                if (this.body.velocity.y < speed){
                    this.setVelocityY(speed);
                    if (speed == game_settings.player_walk_speed){
                        this.dashing = false;
                        this.clearTint();
                    }
                }
                break;
        }
    }
}
class Hank1 extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture) {
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.base_drag = 0.05;
        this.setDrag(this.base_drag);
        this.setDamping(true);
        this.setScale(3);
        const hitboxRadius = 16;
        this.setCircle(hitboxRadius, this.width/2-hitboxRadius, this.height/2-hitboxRadius);
        this.type = "hank";
        this.last_direction_moved = "right";
        this.stunned = false;
        this.current_frame = 0;

        this.speed = game_settings.hank_speed;
        this.bounce_mod = 0.05;
        this.bounce_drag = 0.001;
        this.health = game_settings.hank_health;
        this.boss_scene = false;
        
        this.curr_speed = this.speed;
        this.bounce_damage = 0;
        this.body.bounce.set(this.bounce_mod);
        this.stun_time = 0;
        this.setMass(1.2);
        this.setDepth(9);

        this.has_ball = false;
        this.charging = false;
        this.dashing = false;
        this.throwing = false;
        this.took_damage = false;
        this.throw = false;
        this.throwing_frame = 0
        this.throw_frame = 2;

        this.charge_cooldown = game_settings.hank_charge_cooldown;
        this.charges_left = game_settings.hank_num_charges;
        this.throws_left = game_settings.hank_num_throws;       //the number of times hank will throw the ball when mad before charging charges_left times at the player
        

        this.pickNewDestination();
    }

    updateThrow() {
        if (this.throw) {
            this.stunned = true;
            if (!this.anims.isPlaying) {
                this.throw = false;
                this.stunned = false;
            }
        }
    }

    updateStun(delta) {
        if (this.stunned) {
            if (this.stun_time > 0) {
                this.stun_time -= delta;
                if (this.stun_time <= 0){
                    this.stunned = false;
                } 
                return false;
            }
            return true;
        }
        return false;
    }

    update(timer, delta) {
        this.curr_speed =  Math.sqrt(Math.pow(this.body.velocity.y, 2) + Math.pow(this.body.velocity.x, 2));
        if (this.dashing){
            if (this.curr_speed <= 50){
                this.dashing = false;
            } else{
                return;
            }
        }
        if (this.health <= Math.floor(game_settings.hank_health/2)){
            this.mad = true;
        }
        if (this.throwing) {
            this.anims.play(`${this.type.toLowerCase()} charge throw ${this.last_direction_moved.toLowerCase()}`, true);
        }
        
        if (this.stun_time > 0) {
            this.stun_time -= delta;
            if (this.stun_time <= 0){
                this.stunned = false;
            } 
            return;
        }

        this.updateThrow();

        if (this.boss_scene) {
            if (this.dashing){ 
                return;
            }
            if (this.health <= Math.floor(game_settings.hank_health/2)){
                this.mad = true;
            }
            if (this.throwing) {
                this.anims.play(`${this.type.toLowerCase()} charge throw ${this.last_direction_moved.toLowerCase()}`, true);
            }
            
            if (this.stun_time > 0) {
                this.stun_time -= delta;
                if (this.stun_time <= 0){
                    this.stunned = false;
                } 
                return;
            }

            this.updateThrow();

            if (this.throws_left > 0){
                if (this.has_ball != true && !this.throwing && !this.throw && !this.took_damage){
                    moveTo(this, this.destination);
                }
                if (Phaser.Math.Distance.BetweenPoints(this, this.destination) < 10){
                    this.pickNewDestination();
                }
            }
            else{
                this.charging = true;
                this.charge_cooldown -= delta;
                this.anims.play(`${this.type.toLowerCase()} charge dash ${this.last_direction_moved.toLowerCase()}`, true);
                if (this.charge_cooldown <= 0){
                    this.charging = false;
                    this.dashing = true;
                    this.anims.play(`${this.type.toLowerCase()} dash ${this.last_direction_moved.toLowerCase()}`, true);
                    this.charges_left -= 1;
                    this.charge_cooldown = game_settings.hank_charge_cooldown;
                    //this.setTint(0xcc0000);
                    current_scene.physics.moveToObject(this, current_scene.player, game_settings.hank_charge_speed);
                    this.setDrag(0);
                }
                if (this.charges_left <= 0){
                    //console.log('hank is all out of charges, resetting throws');
                    this.throws_left = game_settings.hank_num_throws;
                }
            }

            if (this.mad == true && this.throws_left <= 0 && this.charges_left <= 0){
                //console.log(`hank is out of throws, reseting charges`);
                this.throws_left = 0;
                this.charges_left = game_settings.hank_num_charges;
            }
        }

        const angle = -Math.atan2(this.x-current_scene.player.x, this.y-current_scene.player.y);
        if (Math.sin(angle) >= 0) 
            this.last_direction_moved = "right";
        else 
            this.last_direction_moved = "left";

        if ((!this.charging && !this.dashing && !this.throw) && !this.took_damage && !this.stunned) {
            this.updateMoveAnim();
        }
        else if (this.took_damage) {
            this.anims.play(`${this.type.toLowerCase()} damage ${this.last_direction_moved.toLowerCase()}`, true);
        }
    }

    updateMoveAnim() {
        // if (this.anims.isPlaying)
        //     this.current_frame = this.anims.currentFrame.index-1;
        if (this.curr_speed <= 50) {
            this.anims.play({key: `${this.type.toLowerCase()} idle ${this.last_direction_moved.toLowerCase()}`, startFrame: this.current_frame}, true);
        }
        else
            this.anims.play({key: `${this.type.toLowerCase()} move ${this.last_direction_moved.toLowerCase()}`, startFrame: this.current_frame}, true);
    }

    moveBossFight() {
        if (this.has_ball != true && !this.throwing && !this.throw && !this.took_damage){
            moveTo(this, this.destination);
        }
        if (Phaser.Math.Distance.BetweenPoints(this, this.destination) < 10){
            this.pickNewDestination();
        }
    }

    damage(){
        if (this.has_ball == false){
            return;
        }
        this.has_ball = false;
        this.health -= 1;

        this.anims.play(`hank damage ${this.last_direction_moved}`, true);
        //this.took_damage = true;
        current_scene.time.delayedCall(1500, function(){current_scene.hank.took_damage = false})

        if (this.health > 5){
            this.scene.spawnEnemiesAtGate("CHARGER");
        }
        else if (this.health > 2){
            this.scene.spawnEnemiesAtGate("DASHER");
        }
        else{
            this.scene.spawnEnemiesAtGate("SHOOTER");
        }
        if (this.health <= 0){
            current_scene.ball.setActive(false);
            current_scene.ball.setVisible(false);
            console.log("HANK HAS BEEN DEFEATED!");
        }
    }

    pickNewDestination(){
        this.destination = new Phaser.Math.Vector2(Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height));
    }

}
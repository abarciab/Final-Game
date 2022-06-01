class Dog extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture) {
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.base_drag = 0.05;
        this.setDrag(this.base_drag);
        this.setDamping(true);
        const hitboxRadius = 8;
        this.setCircle(hitboxRadius, this.width/2-hitboxRadius, this.height/2-hitboxRadius);
        this.type = "DOG";
        this.last_direction_moved = "right";
        this.stunned = false;

        this.speed = game_settings.dog_speed;
        this.bounce_mod = 0.05;
        this.bounce_drag = 0.001;
        
        this.curr_speed = this.speed;
        this.bounce_damage = 0;
        this.body.bounce.set(this.bounce_mod);

        this.footstep_interval = 0.5;
        this.footstep_timer = this.footstep_interval;
        this.step_sfx = current_scene.sound.add('dog step', {volume: 0.7});
        this.dust_clouds = [];

        this.stun_time = 0;
        this.setMass(1.2);
        this.setScale(3);
        this.woof_sfx = current_scene.sound.add('woof', {volume: 0.7});
        this.setDepth(10);
        this.boss_scene = false;
        this.moving = false;
        this.move_dir = "";

        this.bark = true;

        this.has_ball = false;
    }

    update(timer, delta) {
        if (this.asleep == true){
            return;
        }
        
        this.curr_speed =  Math.sqrt(Math.pow(this.body.velocity.y, 2) + Math.pow(this.body.velocity.x, 2));
        if (this.stun_time > 0) {
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
        if (this.boss_scene) {
            this.moveDogFight();
            if (this.bark) {
                this.dogBark();
            }
        }
        else {
            this.moveDir(this.move_dir);
        }

        if (!this.stunned) {
            if (this.curr_speed >= 10) {
                this.moving = true;
                if (this.has_ball)
                    this.anims.play(`${this.type.toLowerCase()} ball move ${this.last_direction_moved.toLowerCase()}`, true);
                else 
                    this.anims.play(`${this.type.toLowerCase()} move ${this.last_direction_moved.toLowerCase()}`, true);
                this.updateFootstep(delta);
            }
            else {
                this.moving = false;
                if (this.has_ball)
                    this.anims.play(`${this.type.toLowerCase()} ball idle ${this.last_direction_moved.toLowerCase()}`, true);
                else
                    this.anims.play(`${this.type.toLowerCase()} idle ${this.last_direction_moved.toLowerCase()}`, true);
                this.footstep_timer = this.footstep_interval;
            }
        }
    }

    dogBark() {
        this.bark = false;
        const bark_interval = Math.ceil(Math.random() * (3000-1000))+1000;
        current_scene.sound.add('woof', {volume: 0.7}).play();
        current_scene.time.delayedCall(bark_interval, function(){ 
            current_scene.dog.bark = true;
        })
    }

    moveDogFight() {
        if (current_scene.player.has_ball == true){
            moveTo(this, current_scene.player);
            return;
        }

        if (current_scene.hank.health <= 0 ){
            if (Phaser.Math.Distance.BetweenPoints(current_scene.player, this) > 100){
                moveTo(this, current_scene.player);
            } else {
                this.setVelocity(this.body.velocity.x * 0.9, this.body.velocity.y * 0.75);
            }
        }
        else if (!this.has_ball && current_scene.hank.has_ball != true){
            moveTo(this, current_scene.ball);
        } else if (this.has_ball || current_scene.hank.has_ball == true){
            moveTo(this, current_scene.hank);
        }

        let move_to_obj = current_scene.ball;
        if (this.has_ball) {
            move_to_obj = current_scene.hank;
        }

        const angle = -Math.atan2(this.x-move_to_obj.x, this.y-move_to_obj.y);
        if (Math.sin(angle) >= 0)
            this.last_direction_moved = "right";
        else 
            this.last_direction_moved = "left";
    }

    moveDir(dir) {
        this.move_dir = dir.toLowerCase();
        switch (dir.toLowerCase()) {
            case "up":
                this.setVelocityY(-this.speed);
                break;
            case "down":
                this.setVelocityY(this.speed);
                break;
            case "left":
                this.setVelocityX(-this.speed);
                this.last_direction_moved = "left";
                break;
            case "right":
                this.setVelocityX(this.speed);
                this.last_direction_moved = "right";
                break;
            default:
                this.move_dir = "";
                this.setVelocity(0, 0);
                break;
        }
    }

    updateFootstep(delta) {
        this.footstep_timer += delta/1000;
        if (this.footstep_timer >= this.footstep_interval) {
            this.footstep_timer = 0;                    
            current_scene.sound.add("dog step").play();
            let dust_x = this.x-(this.displayWidth*0.3);
            if (this.last_direction_moved == "left") dust_x = this.x+(this.displayWidth*0.3);
            this.dust_clouds.push(
                current_scene.add.sprite(dust_x, this.y+(this.displayHeight*0.1), 'dust cloud').setDepth(4).setScale(2).setAlpha(0.7)
            );
            this.dust_clouds[this.dust_clouds.length-1].anims.play('dust cloud', true);
        }
    }
}
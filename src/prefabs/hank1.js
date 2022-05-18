class Hank1 extends Phaser.Physics.Arcade.Sprite {
    constructor(x, y, texture) {
        super(current_scene, x, y, texture);
        current_scene.physics.world.enableBody(this);
        current_scene.add.existing(this);

        this.base_drag = 0.05;
        this.setDrag(this.base_drag);
        this.setDamping(true);
        this.setCircle(this.width/2);
        this.type = "HANK1";
        this.last_direction_moved = "right";
        this.stunned = false;
        this.current_frame = 0;

        this.speed = game_settings.dog_speed;
        this.bounce_mod = 0.05;
        this.bounce_drag = 0.001;
        
        this.curr_speed = this.speed;
        this.bounce_damage = 0;
        this.body.bounce.set(this.bounce_mod);
        this.stun_time = 0;
        this.setMass(1.2);

        this.has_ball = false;
    }

    update(timer, delta) {
        this.curr_speed =  Math.sqrt(Math.pow(this.body.velocity.y, 2) + Math.pow(this.body.velocity.x, 2));
        
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

        const angle = -Math.atan2(this.x-current_scene.player.x, this.y-current_scene.player.y);
        if (Math.sin(angle) >= 0) 
            this.last_direction_moved = "right";
        else 
            this.last_direction_moved = "left";

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
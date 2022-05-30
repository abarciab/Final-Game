class level1BossScene extends Phaser.Scene {
    constructor() {
        super("level1BossScene");
    }

    create(){
        //intialize game_settings, current_scene, and setup keys
        current_map = 'bossMap';
        if (bg_music.key != 'boss') {
            this.bg_music = this.sound.add('boss', {volume: 0.5});
            this.bg_music.setLoop(true).play();
        }
        initializeLevel(this);
        //initBoss1();
        initBossLevel1(this);
        //enemy collisions
        this.addColliders();
    }

    addColliders() {
        //ball and (player/walls)
        this.physics.add.collider(this.ball, this.collision_rects, function() {current_scene.ball.deflected = false})
        this.physics.add.overlap(this.player, this.ball, playerProjectileCollision.bind(this));
        this.physics.add.overlap(this.player, this.ball, function() {if (current_scene.player.dashing == true){current_scene.ball.deflected = true} });
        
        //player and dog
        this.physics.add.overlap(this.player, this.doggo, function () {
            if (current_scene.hank.health <= 0){
                return;
            }
            if (current_scene.player.dashing){
                current_scene.stunDog(1500);
                current_scene.player.doneDashing();
                current_scene.player.body.setVelocity(0,0);
            } else if (current_scene.doggo.speed > 0 && !current_scene.doggo.has_ball) {
                current_scene.player.damage(current_scene.doggo);
            }
        });

        //ball and dog
        this.physics.add.overlap(this.doggo, this.ball, function() {
            if (current_scene.ball.deflected == true && current_scene.ball.current_speed > 10){
                return;
            }
            if (current_scene.ball.active == true && current_scene.doggo.speed > 0){
                current_scene.ball.deflected = false;
                current_scene.doggo.has_ball = true; 
                current_scene.ball.setActive(false).setVisible(false);
            }
        });
        
        //ball and hank
        this.physics.add.overlap(this.ball, this.hank, function() {
            if (current_scene.ball.deflected == true){
                current_scene.hankCatchBall();
            }
        });

        //doggo and hank
        this.physics.add.overlap(this.doggo, this.hank, function() {
            if (current_scene.hank.health <= 0 || current_scene.doggo.stun_time > 0) { return;}
            
            if (current_scene.doggo.has_ball == true){
                if (current_scene.hank.stun_time <= 0){
                    current_scene.hank.stun_time = 800;
                    current_scene.stunDog(2000);
                    current_scene.time.delayedCall(700, function(){current_scene.throwBall();})
                } 
            } 
            else if (current_scene.hank.has_ball){
                console.log("dog damaged hank");
                current_scene.ball.deflected = false;
                current_scene.boss_bar.displayWidth -= 144.75;
                current_scene.stunDog(2000);
                current_scene.hank.damage();
                current_scene.hank.has_ball = false;
                current_scene.hank.stun_time = 800;
                current_scene.time.delayedCall(700, function(){current_scene.throwBall();})
            }
        })

        //hank and wall and lava
        this.physics.add.collider(this.hank, this.collision_rects, function(){current_scene.hank.pickNewDestination()});
        this.physics.add.collider(this.hank, this.lava_rects, function(){current_scene.hank.pickNewDestination()});
    }

    hankCatchBall(){
        current_scene.hank.has_ball = true;
        current_scene.ball.setActive(false);
        current_scene.ball.setVisible(false);
    }

    throwBall(){
        current_scene.doggo.has_ball = false;
        current_scene.hank.has_ball = false;
        current_scene.stunDog(500);

        //console.log("ball returned to hank");
        current_scene.ball.x = current_scene.hank.x;
        current_scene.ball.y = current_scene.hank.y;
        current_scene.ball.speed = 400;
        moveTo(current_scene.ball, current_scene.player);
        //current_scene.ball.body.setVelocity(-100, 600);

        current_scene.ball.setVisible(true);
        current_scene.ball.setActive(true);
    }

    stunDog(time){
        current_scene.doggo.setVelocity(0, 0);
        current_scene.doggo.speed = 0;
        current_scene.time.delayedCall(time, function(){current_scene.doggo.speed = game_settings.dog_speed})
    }

    /*
    update: updates scene every frame
        @ time: total time that the game has been running
        @ delta: number of milliseconds since update was last called
    */
    update(time, delta){
        updateLevel(time, delta);
        //update enemies
        this.doggo.update(time, delta);

        //update ball
        this.ball.current_speed = Math.sqrt(Math.pow(this.ball.body.velocity.y, 2) + Math.pow(this.ball.body.velocity.x, 2));

        if (this.hank.health <= 0 && !this.done ){
            this.done = true;
            this.enemies.forEach(enemy => {
                if (enemy.active || enemy.visible){
                    this.done = false;
                }
            });

            if (this.done){
                this.endScene();
                return;
            }            
        }

        if (this.done){
            return;
        }

        let bos_box_pos = getCameraCoords(current_scene.camera, game.config.width/2, game.config.height - 50);
        this.boss_box.setPosition(bos_box_pos.x, bos_box_pos.y);
        //let bos_bar_pos = getCameraCoords(current_scene.camera, game.config.width/2, game.config.height - 50);
        this.boss_bar.setPosition(bos_box_pos.x-this.boss_box.displayWidth/2, bos_box_pos.y);
        this.hank.update(time, delta);
    }

    endScene(){
        this.doggo.setDepth(this.player.depth - 0.1);
        this.boss_bar.setVisible(false);
        this.boss_box.setVisible(false);
        this.tweens.add({
            duration: 3000,
            targets: this.endRect,
            alpha: 1,
            onComplete: function() {console.log("GAME COMPLETE")},
        })
    }
}
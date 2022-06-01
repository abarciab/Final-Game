class level1BossScene extends Phaser.Scene {
    constructor() {
        super("level1BossScene");
    }

    create(){
        //intialize game_settings, current_scene, and setup keys
        current_map = 'bossMap';
        if (bg_music.key != 'boss') {
            bg_music = this.sound.add('boss', {volume: 0.3 * game_settings.music_vol});
            bg_music.setLoop(true).play();
        }

        this.gate_positions = [];

        initializeLevel(this);
        initBossLevel1(this);


        this.dog = new Dog(200, 200, 'dog idle left');
        this.dog.boss_scene = true;

        //hank
        this.hank = new Hank1(800, 350, 'hank idle right');
        this.hank.boss_scene = true;
        

        //enemy collisions
        this.addColliders();

    }

    addColliders() {
        //ball and walls
        this.physics.add.collider(this.ball, this.collision_rects, function() {current_scene.ball.deflected = false})

        //player and ball
        this.physics.add.overlap(this.player, this.ball, playerProjectileCollision.bind(this));
        this.physics.add.overlap(this.player, this.ball, function() {
            if (current_scene.ball.deflected || current_scene.dog.has_ball){
                return;
            }
            if (current_scene.player.dashing == true){
                current_scene.ball.deflected = true
                current_scene.ball.dashed = true;
            } else{
                current_scene.player.has_ball = true;
                current_scene.ball.setActive(false);
                current_scene.ball.setVisible(false);
            }
        });

        //player and hank
        this.physics.add.collider(this.player, this.hank, playerEnemyCollision.bind(this));
        
        //player and dog
        this.physics.add.overlap(this.player, this.dog, function () {
            if (current_scene.hank.health <= 0){
                return;
            }
            if (current_scene.player.dashing){
                current_scene.stunDog(1500);
                current_scene.player.doneDashing();
                current_scene.player.body.setVelocity(0,0);
            } else if (current_scene.dog.speed > 0 && !current_scene.dog.has_ball) {
                current_scene.player.damage(current_scene.dog);
                if (current_scene.player.has_ball == true){
                    current_scene.dog.has_ball = true;
                    current_scene.player.has_ball = false;
                }
            }
        });

        //ball and dog
        this.physics.add.overlap(this.dog, this.ball, function() {
            if (current_scene.ball.deflected == true && current_scene.ball.current_speed > 10 && current_scene.ball.dashed != true){
                return;
            }
            if (current_scene.ball.active == true && current_scene.dog.speed > 0){
                current_scene.ball.deflected = false;
                current_scene.dog.has_ball = true; 
                current_scene.ball.setActive(false).setVisible(false);
            }
        });
        
        //ball and hank
        this.physics.add.overlap(this.ball, this.hank, function() {
            if (current_scene.hank.charging || current_scene.hank.dashing){
                return;
            }
            if (current_scene.ball.deflected == true){
                current_scene.ball.dashed = false;
                current_scene.hankCatchBall();
            }
        });

        //dog and hank
        this.physics.add.overlap(this.dog, this.hank, function() {
            if (current_scene.hank.health <= 0 || current_scene.dog.stun_time > 0) { return;}
            
            if (current_scene.dog.has_ball == true){
                if (current_scene.hank.stun_time <= 0){
                    current_scene.hank.stun_time = 800;
                    current_scene.stunDog(2000);
                    current_scene.hank.throwing = true;
                    current_scene.time.delayedCall(700, function(){current_scene.throwBall();})
                } 
            } 
            else if (current_scene.hank.has_ball){
                if (current_scene.hank.throws_left <= 0){
                    return;
                }
                //console.log("dog damaged hank");
                current_scene.ball.deflected = false;
                current_scene.boss_bar.displayWidth -= 144.75;
                current_scene.stunDog(3000);
                current_scene.hank.damage();
                current_scene.hank.stun_time = 1000;
                current_scene.time.delayedCall(700, function(){
                    current_scene.hank.throwing = true;
                    current_scene.hank.has_ball = false;
                });
                current_scene.time.delayedCall(800, function(){current_scene.throwBall();});
                if (current_scene.hank.mad == true){
                    current_scene.hank.throws_left = 0;
                    current_scene.hank.charges_left = game_settings.hank_num_charges;
                }
            }
        })

        //hank and wall and lava
        this.physics.add.collider(this.hank, this.collision_rects, function(){
            if (current_scene.hank.dashing == true){
                current_scene.hank.dashing = false;
                current_scene.hank.clearTint();
                current_scene.hank.setDrag(current_scene.hank.base_drag);
            } else{
                current_scene.hank.pickNewDestination()
            }
        });
        this.physics.add.collider(this.hank, this.lava_rects, function(){current_scene.hank.pickNewDestination()});
    }

    hankCatchBall(){
        current_scene.hank.has_ball = true;
        current_scene.ball.setActive(false);
        current_scene.ball.setVisible(false);
    }

    throwBall(){
        console.log("throw ball!");
        current_scene.hank.throwing = false;
        current_scene.hank.throw = true;
        current_scene.dog.has_ball = false;
        current_scene.stunDog(500);
        
        current_scene.hank.has_ball = false;

        current_scene.hank.anims.play(`${current_scene.hank.type.toLowerCase()} throw ${current_scene.hank.last_direction_moved.toLowerCase()}`, true);
        //console.log("ball returned to hank");
        current_scene.ball.x = current_scene.hank.x;
        current_scene.ball.y = current_scene.hank.y;
        current_scene.ball.speed = 400;

        let spread = 400;
        let ball_target = {x: this.player.x + Phaser.Math.Between(-spread, spread), y: this.player.y + Phaser.Math.Between(-spread, spread)};
        moveTo(current_scene.ball, ball_target);

        current_scene.ball.setVisible(true);
        current_scene.ball.setActive(true);

        if (current_scene.hank.mad == true){
            current_scene.hank.throws_left -= 1;
            if (current_scene.hank.throws_left <= 0){
                current_scene.hank.charges_left = game_settings.hank_num_charges;
            }
        }
    }

    stunDog(time){
        current_scene.dog.setVelocity(0, 0);
        current_scene.dog.speed = 0;
        current_scene.time.delayedCall(time, function(){current_scene.dog.speed = game_settings.dog_speed})
    }

    spawnEnemiesAtGate(type){
        this.gate_positions.forEach(gatePosition => {
            spawnEnemy(type, gatePosition.x, gatePosition.y);
        });
    }

    /*
    update: updates scene every frame
        @ time: total time that the game has been running
        @ delta: number of milliseconds since update was last called
    */
    update(time, delta){
        //1600 1000
        if (this.ball.x < -200 || this.ball.x > 1600 || this.ball.y < -200 || this.ball.y > 1000){
            this.ball.setPosition(game_settings.cam_target.x, game_settings.cam_target.y);
            this.ball.setVelocity(0,0);
        }

        updateLevel(time, delta);
        //update enemies
        this.dog.update(time, delta);

        //update ball
        this.ball.current_speed = Math.sqrt(Math.pow(this.ball.body.velocity.y, 2) + Math.pow(this.ball.body.velocity.x, 2));

        if (this.hank.health <= 0 && !this.done ){
            this.hank.setVisible(false);
            this.ball.setVisible(false);
            
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

        this.boss_bar.setPosition(bos_box_pos.x-this.boss_box.displayWidth/2, bos_box_pos.y).setDepth(current_scene.player.depth + 2);
        this.boss_box.setPosition(bos_box_pos.x, bos_box_pos.y).setDepth(current_scene.player.depth + 2.1);
        this.hank.update(time, delta);
    }

    endScene(){
        this.vignette.setVisible(false);
        
        this.dog.setDepth(this.player.depth - 0.1);
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
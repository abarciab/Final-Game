class level1IntroScene extends Phaser.Scene {
    constructor() {
        super("level1IntroScene");
    }
    create(){
        initializeScene(this);
        bg_music = this.sound.add('cutscene', {volume: 0.5});
        bg_music.setLoop(true).play();
        let UI_scale = 4.86;

        this.cameras.main.setBackgroundColor('#303030');        

        game_script.readScript(this, 1, 1);
        game_script.hide_display = true;
        sweepTransition("left", false, function() {
            game_script.hide_display = false;
        })

        this.player;
        this.dog;
        this.player_move_right = false;
        this.move_dog = false;
        this.start_part_2 = false;
        this.start_part_3 = false;
        this.start_level = false;
    }

    update(timer, delta){
        if (game_script.reading_script) {
            game_script.updateScript(delta);
        }
        else if (game_script.part == 1 && !this.start_part_2) {
            this.start_part_2 = true;
            sweepTransition("right", false, function() {
                game_script.readScript(current_scene, 1, 2);
                game_script.hide_display = true;
                sweepTransition("left", false, function() {
                    game_script.hide_display = false;
                });
            });
        }
        else if (game_script.part == 2 && !this.start_part_3) {
            this.start_part_3 = true;
            sweepTransition("right", false, function() {
                bg_music.stop();
                current_scene.startPart3();
            });
        }
        else if (game_script.part == 3 && !game_script.reading_script) {
            this.start_level = true;
        }
        if (this.start_level) {
            sweepTransition("right", true, function() {
                current_scene.scene.start("level1FightScene");
            });
        }

        if (this.player_move_right) {
            this.player.move("RIGHT", delta);
            this.player.body.velocity.x /= 2;
        }
        if (this.player != undefined) {
            this.player.update(timer, delta);
        }
        if (this.dog != undefined) {
            this.dog.update(timer, delta);
            if (this.dog.move_dir != "" && !this.move_dog) {
                this.move_dog = true;
                current_scene.time.delayedCall(5000, function () {
                    current_scene.dog.move_dir = "";
                }, null, this);
            }
        }
    }

    startPart3() {
        //this.background.setVisible(false);
        current_map = 'level 1.0 map';
        this.cameras.main.setBackgroundColor('#000000');

        this.player = new Player(game.config.width/2, game.config.height/2, 'fran idle right');
        this.player.can_move = false;
        //this.dog = new Dog(game.config.width*1.7, game.config.height*1.7, 'dog idle left');
        this.dog = new Dog(0, 0, 'dog idle left');

        initMap();
        sweepTransition("left", false);

        //this.dog.y = this.player.y+100;
        this.player.x -= 300;
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.player_move_right = true;
        current_scene.player.moving = true;
        current_scene.time.delayedCall(2000, function () {
            current_scene.player_move_right = false;
            current_scene.player.moving = false;
            // fade in the script
            game_script.readScript(current_scene, 1, 3);
        }, null, this);
    }
}
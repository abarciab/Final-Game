class level1BossOutroScene extends Phaser.Scene {
    constructor() {
        super("level1BossOutroScene");
    }

    create() {
        initializeScene(this);
        this.player = new Player(0, 0, 'fran idle right');
        this.player.can_move = false;
        disableCollision(this.player.body);

        this.dog = new Dog(0, 0, 'dog idle right');
        //hank
        this.hank = new Hank1(1000, 350, 'hank idle right');
        this.hank.took_damage = true;
        
        //tilemap
        current_map = 'bossMap';
        initMap();
        this.doors;
        this.sound.stopAll();
        this.hank.y = this.dog.y;
        this.hank.x = this.dog.x;
        this.dog.x = this.player.x + 250;
        this.player_move_left = false;
        this.dog_move_left = false;
        this.sweep = false;

        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        game_script.readScript(this, 1, 5);
    }
    update(timer, delta) {
        if (game_script.reading_script) {
            game_script.updateScript(delta);
        }
        else if (game_script.part == 5 && !game_script.reading_script && !this.sweep) {
            this.sweep = true;
            sweepTransition("right", false, function() {
                game_script.readScript(current_scene, 1, 6);
                current_scene.sweep = false;
                game_script.hide_display = true;
                current_scene.hank.setVisible(false);
                current_scene.dog.setVisible(false);
                current_scene.player.setVisible(false);
                current_scene.sound.stopAll();
                current_scene.player_move_left = false;
                current_scene.dog_move_left = false;
                current_scene.player.moving = false;
                current_scene.dog.moveDir("");
                bg_music = current_scene.sound.add('cutscene', {volume: 0.5});
                bg_music.setLoop(true).play();
                sweepTransition("left", false, function() {
                    game_script.hide_display = false;
                });
            });
        }
        else if (game_script.part == 6 && !game_script.reading_script && !this.sweep) {
            this.sweep = true;
            sweepTransition("right", false, function() {
                bg_music.stop();
                initMap();
                game_script.readScript(current_scene, 1, 7);
                current_scene.sweep = false;
                game_script.hide_display = true;
                current_scene.hank.x = current_scene.dog.x;
                current_scene.hank.y = current_scene.dog.y;
                current_scene.hank.took_damage = false;
                current_scene.hank.setVisible(true);
                current_scene.dog.setVisible(false);
                current_scene.player.setVisible(false);
                current_scene.sound.stopAll();

                sweepTransition("left", false, function() {
                    game_script.hide_display = false;
                });
            });
        }
        else if (game_script.part == 7 && !game_script.reading_script && !this.sweep) {
            this.sweep = true;
            sweepTransition("right", false, function() {
                current_scene.sound.stopAll();
                current_scene.scene.start("titleScene");
            });
        }

        if (this.player_move_left) {
            this.player.move("LEFT", delta);
        }
        if (this.player != undefined) {
            this.player.update(timer, delta);
        }
        if (this.dog != undefined) {
            this.dog.update(timer, delta);
            if (this.dog_move_left)
                this.dog.last_direction_moved = "LEFT";
        }
        if (this.hank != undefined) {
            this.hank.update(timer, delta);
        }
    }
}
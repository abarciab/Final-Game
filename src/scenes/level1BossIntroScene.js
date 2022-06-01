class level1BossIntroScene extends Phaser.Scene {
    constructor() {
        super("level1BossIntroScene");
    }

    create() {
        initializeScene(this);
        this.player = new Player(0, 0, 'fran idle right');
        this.player.can_move = false;

        this.dog = new Dog(0, 0, 'dog idle right');
        //hank
        this.hank = new Hank1(1000, 350, 'hank idle right');
        
        //tilemap
        current_map = 'bossMap';
        initMap();
        this.hank.y = this.dog.y;
        this.hank.x = this.dog.x+300;

        this.player.x -= 300;
        this.player.moving = true;
        this.player_move_right = true;
        this.move_dog = false;
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        current_scene.time.delayedCall(2000, function () {
            current_scene.player_move_right = false;
            current_scene.player.moving = false;
            // fade in the script
            game_script.readScript(this, 1, 4);
        }, null, this);

        console.log("read script");
        this.start_level = false;
        this.player_move = false;
        this.open_door = true;
    }
    update(timer, delta) {
        if (game_script.reading_script) {
            game_script.updateScript(delta);
        }
        else if (game_script.part == 4 && !game_script.reading_script) {
            this.start_level = true;
        }
        if (this.start_level) {
            sweepTransition("right", true, function() {
                current_scene.scene.start("level1BossScene");
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
            this.dog.last_direction_moved = "LEFT";
        }
        if (this.hank != undefined) {
            this.hank.update(timer, delta);
        }
    }
}
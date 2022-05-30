class level1IntroScene extends Phaser.Scene {
    constructor() {
        super("level1IntroScene");
    }

    preload(){

    }

    create(){
        current_scene = this;
        setupKeys(this);
        pointer = current_scene.input.activePointer;
        this.bg_music = this.sound.add('cutscene', {volume: 0.5});
        this.bg_music.setLoop(true).play();
        let UI_scale = 4.86;
        //this.background = this.add.image(game.config.width/2, game.config.height/2, 'office background').setScale(UI_scale).setOrigin(0.5);

        this.camera = this.cameras.main.setBackgroundColor('#303030');        

        game_script.readScript(this, 1, 1);
        game_script.hide_display = true;
        sweepTransition("left", function() {
            game_script.hide_display = false;
        })

        this.player;
        this.player_move_right = false;
        this.start_part_2 = false;
        this.start_part_3 = false;
        this.start_level = false;
        this.pan_finished = true;
    }

    update(timer, delta){
        if (game_script.reading_script) {
            game_script.updateScript(delta);
        }
        else if (game_script.part == 1 && !this.start_part_2) {
            this.start_part_2 = true;
            sweepTransition("right", function() {
                game_script.readScript(current_scene, 1, 2);
                game_script.hide_display = true;
                sweepTransition("left", function() {
                    game_script.hide_display = false;
                });
            });
        }
        else if (game_script.part == 2 && !this.start_part_3) {
            this.start_part_3 = true;
            sweepTransition("right", function() {
                current_scene.bg_music.stop();
                current_scene.startPart3();
            });
        }
        else if (game_script.part == 3 && !game_script.reading_script) {
            this.start_level = true;
        }
        if (this.start_level) {
            this.scene.start("level1FightScene");
        }

        if (this.player_move_right) {
            this.player.move("RIGHT", delta);
            this.player.body.velocity.x /= 2;
        }
        if (this.player != undefined) {
            this.player.update(timer, delta);
        }
    }

    startPart3() {
        //this.background.setVisible(false);
        const map = this.make.tilemap({key: current_map, tileWidth: 64, tileHeight: 64});

        this.player = new Player(game.config.width/2, game.config.height/2, 'fran idle right');
        this.player.can_move = false;
        this.dog = new Dog(game.config.width, game.config.height, 'dog idle left');
        this.player.dash_pointer.setVisible(false);

        current_scene.cameras.main.setBackgroundColor('#000000');
        this.tileset = map.addTilesetImage('tiles 1', 'tiles');
        const layer0 = map.createLayer('0', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer1 = map.createLayer('1', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const layer2 = map.createLayer('2', this.tileset, 0, 0).setScale(game_settings.tilemap_scale);
        const marker_layer = map.createLayer('markers', this.tileset, 0, 0).setScale(game_settings.tilemap_scale).setAlpha(0);
        const lights_objects = map.createFromObjects('lights', {name: '', key: 'light'});        
        lights_objects.forEach(light => {
            light.setAlpha(0.45);
        });
        

        setupInteractables(map);
        setupTilemapCollisions(marker_layer);
        sweepTransition("left");

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
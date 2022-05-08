class level1FightScene extends Phaser.Scene {
    constructor() {
        super("level1FightScene");
    }

    preload(){
        this.load.image('white square', './assets/white square.png');
        this.load.image('white hexagon', './assets/white hexagon.png');
        this.load.image('white arrow', './assets/white arrow.png');

        this.load.image('charger', './assets/charger.png');
        this.load.image('golem', './assets/golem.png');
        this.load.image('shooter', './assets/shooter.png');
    }

    create(){
        //intialize game_settings, current_scene, and setup keys
        initialize(this);

        //player
        this.player = new Player(game.config.width/2, game.config.height/2, 'white square');

        //enemies
        this.enemies = [];
        this.enemy_projectiles = new ProjectileGroup('white arrow');
        spawnEnemy("CHARGER");
        spawnEnemy("GOLEM");
        spawnEnemy("SHOOTER");
        //infinite enemy spawning:  
        this.time.addEvent({
            delay: game_settings.enemy_spawn_timer,
            callback: spawnRandomEnemy,
            callbackScope: this,
            loop: true,
        })  

        //enemy collisions
        this.physics.add.overlap(this.player, this.enemies, playerEnemyCollision.bind(this));
        this.physics.add.overlap(this.player, this.enemy_projectiles, playerProjectileCollision.bind(this));
        this.physics.add.overlap(this.enemy_projectiles, this.enemies, projectileEnemyCollision.bind(this));

        //UI
        this.score_text = this.add.text(20, 20, "SCORE: 0");
        this.health_text = this.add.text(150, 20, "LIVES: 0");
        this.pauseLayer = this.add.sprite(game.config.width/2, game.config.height/2, 'white square').setTint(0x010101).setAlpha(0.3).setScale(20,20).setOrigin(0.5).setDepth(5).setVisible(false);
        this.paused = false;
        updateUI();
    }

    /*
    update: updates scene every frame
        @ time: timer from when the function was called
        @ delta: number of milliseconds per frame
    */
    update(time, delta){
        //pause the game
        if (Phaser.Input.Keyboard.JustDown(key_esc)){
            this.paused = !this.paused;
        }
        if (this.paused){
            pause();
            return;
        } else {
            resume();
        }

        //update player 
        this.player.update(time, delta);

        //update enemies
        updateEnemies(time, delta);

        //update UI
        updateUI();
    }
}

/*
UI for all the scenes should be in here
*/
class GameUI {
    constructor() {
        /*this.portrait_x = 0;
        this.portrait_y = 0;
        this.portrait_box = current_scene.add.image(0, 0, "").setDepth(9).setVisible(false);
        this.player_portrait = current_scene.add.sprite(0, 0, "").setDepth(10).setVisible(false);
        this.player_healthbar;*/
        this.score_x = config.width * 0.05;
        this.score_y = config.height * 0.05;
        this.health_x = this.score_x;
        this.health_dist = 50;
        this.health_y = config.height * 0.1;
        this.num_hearts = 5;
        this.hearts = [];

        this.score_text = current_scene.add.text(this.score_x, this.score_y, `SCORE: ${current_scene.player.score}`).setVisible(false);
        this.health_text = current_scene.add.text(this.health_x, this.health_y, `LIVES: ${current_scene.player.health}`).setVisible(false);
    }
    setPlayerUI() {
        //this.portrait_box = current_scene.add.image(0, 0, "");
        //this.player_portrait = current_scene.add.sprite(0, 0, "");
        this.score_text = current_scene.add.text(this.score_x, this.score_y, `SCORE: ${current_scene.player.score}`).setVisible(true);
        for (let i = 0; i < this.num_hearts; i++) {
            if (i == 0) {
                this.hearts.push(
                    current_scene.add.image(
                        this.health_x, this.health_y, "player heart"
                    )
                );
            }
            else {
                this.hearts.push(
                    current_scene.add.image(
                        this.hearts[i-1].x + this.health_dist, this.hearts[i-1].y, "player heart"
                    )
                );
            }
        }
    }
    update() {
        for (let i = 0; i < this.hearts.length; i++) {
            let heart = this.hearts[i]
            let health_pos = getCameraCoords(current_scene.camera, heart);
            heart.setPosition(health_pos.x, health_pos.y);
            console.log(heart.x, heart.y);
            if (current_scene.player.health < i+1 && heart.texture != "player empty heart") {
                heart.texture = "player empty heart";
            }
            else if (heart.texture != "player heart") {
                heart.texture = "player heart";
            }
        }
        this.score_text.setText(`SCORE: ${current_scene.player.score}`);
        // this.health_text.setText(`LIVES: ${current_scene.player.health}`);

        let score_pos = getCameraCoords(current_scene.camera, this.score_x, this.score_y);
        //let health_pos = getCameraCoords(current_scene.camera, this.health_x, this.health_y);
        this.score_text.setPosition(0, 0);
        //this.health_text.setPosition(health_pos.x, health_pos.y);
    }
}
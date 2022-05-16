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
        this.score_text_x = config.width * 0.05;
        this.score_text_y = config.height * 0.05;
        this.health_text_x = this.score_text_x;
        this.health_text_y = config.height * 0.1;

        this.score_text = current_scene.add.text(this.score_text_x, this.score_text_y, `SCORE: ${current_scene.player.score}`).setVisible(false);
        this.health_text = current_scene.add.text(this.health_text_x, this.health_text_y, `LIVES: ${current_scene.player.health}`).setVisible(false);
    }
    setPlayerUI() {
        this.portrait_box = current_scene.add.image(0, 0, "");
        this.player_portrait = current_scene.add.sprite(0, 0, "");
        this.player_healthbar;
    }   
    update() {
        if (!this.score_text.visible && !this.health_text.visible) {
            this.score_text.setVisible(true);
            this.health_text.setVisible(true);
        }
        this.score_text.setText(`SCORE: ${current_scene.player.score}`);
        this.health_text.setText(`LIVES: ${current_scene.player.health}`);

        let score_pos = getCameraCoords(current_scene.camera, this.score_text_x, this.score_text_y);
        let health_pos = getCameraCoords(current_scene.camera, this.health_text_x, this.health_text_y);
        this.score_text.setPosition(score_pos.x, score_pos.y);
        this.health_text.setPosition(health_pos.x, health_pos.y);
    }
}
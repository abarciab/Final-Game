/*
UI for all the scenes should be in here
*/
class GameUI {
    constructor() {
        this.health_x = config.width * 0.05;
        this.health_y = config.height * 0.1;
        this.max_hearts = current_scene.player.health;
        this.hearts = [];

        this.health_text = current_scene.add.text(this.health_x, this.health_y, `LIVES: ${current_scene.player.health}`).setVisible(false);
    }
    setPlayerUI() {
        for (let i = 0; i < this.max_hearts; i++) {
            this.hearts.push(
                current_scene.add.image(
                    this.heart_x * (i+1), this.heart_y, "player heart"
                ).setScale(2).setDepth(6)
            );
        }
    }
    update() {
        for (let i = 0; i < this.hearts.length; i++) {
            let heart = this.hearts[i]
            let health_pos = getCameraCoords(current_scene.camera, this.health_x*(i+1), this.health_y);
            heart.setPosition(health_pos.x, health_pos.y);
            if (current_scene.player.health < i+1 && current_scene.player.health > i && heart.texture != "player half heart") {
                heart.setTexture("player half heart");
            }
            else if (current_scene.player.health < i+1 && heart.texture != "player empty heart") {
                heart.setTexture("player empty heart");
            }
            else if (current_scene.player.health >= i+1 && heart.texture != "player heart") {
                heart.setTexture("player heart");
            }
        }
    }
}
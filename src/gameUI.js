/*
UI for all the scenes should be in here
*/
class gameUI {
    constructor() {
        this.portrait_x = 0;
        this.portrait_y = 0;
        this.portrait_box = current_scene.add.image(0, 0, "").setDepth(9).setVisible(false);
        this.player_portrait = current_scene.add.sprite(0, 0, "").setDepth(10).setVisible(false);
        this.player_healthbar;
    }
    setPlayerUI() {
        this.portrait_box = current_scene.add.image(0, 0, "");
        this.player_portrait = current_scene.add.sprite(0, 0, "");
        this.player_healthbar;
    }
}
/*
script reader: in scene before game starts
update the text at a speed of n text/second
place the location of when the scene get's read up until the part is empty, then move onto the next part

first get the script for the level, then start reading a part, then read the body array person by person until it's done
*/

class ScriptReader {
    constructor(scene, script_data) {
        this.current_scene = scene;

        this.script_data = script_data;
        this.script_sections = this.script_data.Script;
        this.character_variables = this.script_data.CharacterVariables;
        this.speaker_sfx;
        this.speaker_color;

        this.char_update_rate = this.script_data.defaultTextSpeed;
        this.char_update_timer = 0;

        this.reading_script = false;
        this.line_finished = false;
        this.script_done = false;
        this.line_paused = false;

        this.level = script_data.InitialLevel;
        this.part = script_data.InitialPart;

        this.display_line = "";

        this.curr_line_index = 0;
        this.curr_char_index = 0;

        this.current_location = this.script_sections[`level${this.level}`][`part${this.part}`].location;
        this.curr_script = [...this.script_sections[`level${this.level}`][`part${this.part}`].body];

        this.curr_speaker = this.curr_script.speaker;
        this.curr_line = this.curr_script[this.curr_line_index].text;
        this.textbox_max_height = (config.height * 0.25);
        this.font_size = 34;
        this.speaker_font_size = 40;

        this.speaker_textbox;
        this.display_textbox = scene.add.text(this.text_margins, this.textbox_y, "this is a text box").setFontSize(this.font_size).setDepth(10).setVisible(false);
        this.bg_textbox = scene.add.image(0, 0, 'textbox').setDepth(9).setScale(10).setOrigin(0, 0).setVisible(false);
        this.bg_textbox_x = (config.width-this.bg_textbox.displayWidth)/2;
        this.bg_textbox_y = config.height-this.bg_textbox.displayHeight;

        this.text_margins = this.bg_textbox_x * 1.4;
        this.textbox_y = this.bg_textbox_y * 1.6;
        this.speaker_y = this.bg_textbox_y * 1.4;
        this.textbox_max_height = this.bg_textbox.displayHeight * 0.5;

        this.text_width = this.display_textbox.displayWidth / this.display_textbox.text.length;
        this.display_textbox.setText("this is a text box\ntest");
        this.text_height = this.display_textbox.displayHeight / this.display_textbox.text.split('\n').length;

        this.mouse_held = false;
    }

    readNextPart() {
        let scene = current_scene;
        if (!this.script_done) {
            this.readScript(scene, this.level, this.part);
        }
        else {
            console.log("no more script to read");
        }
    }

    readScript(scene, level, part) {
        this.current_scene = scene;
        this.reading_script = true;
        this.line_paused = false;
        this.mouse_held = true;

        this.level = level;
        this.part = part;

        this.curr_line_index = 0;
        this.curr_char_index = 0;

        this.current_location = this.script_sections[`level${this.level}`][`part${this.part}`].location;
        this.curr_script = [...this.script_sections[`level${this.level}`][`part${this.part}`].body];

        this.display_line = "";
        this.curr_line = this.curr_script[this.curr_line_index].text;

        if (scene.camera != undefined) {
            console.log("is camera:", scene.camera.worldView.x, scene.camera.worldView.y);
            this.bg_textbox_x =  (config.width-this.bg_textbox.displayWidth)/2 + scene.camera.worldView.x;
            this.bg_textbox_y = config.height-this.bg_textbox.displayHeight + scene.camera.worldView.y;
        }
        else {
            console.log("no camera");
            this.bg_textbox_x = (config.width-this.bg_textbox.displayWidth)/2;
            this.bg_textbox_y = config.height-this.bg_textbox.displayHeight;
        }
        this.text_margins = this.bg_textbox_x * 1.4;
        this.textbox_y = this.bg_textbox_y * 1.6;
        this.speaker_y = this.bg_textbox_y * 1.4;

        this.speaker_textbox = scene.add.text(this.text_margins, this.speaker_y, "")
        .setFontSize(this.speaker_font_size).setDepth(10);

        this.display_textbox = scene.add.text(this.text_margins, this.textbox_y, "")
        .setFontSize(this.font_size).setDepth(10).setOrigin(0, 0);

        this.bg_textbox = scene.add.image(this.bg_textbox_x, this.bg_textbox_y, 'textbox')
        .setDepth(9).setScale(10).setOrigin(0, 0);

        this.setText();
    }

    // returns true if still reading, false if done reading for now
    nextLine() {
        this.line_finished = false;
        this.curr_char_index = 0;
        this.curr_line_index++;
        this.display_line = "";
        this.char_update_rate = this.script_data.defaultTextSpeed;
        // if the part is done, finish reading for the part and update part/levels and return false
        if (this.curr_line_index >= this.curr_script.length) {
            this.part++; 
            this.curr_line_index = 0;
            this.reading_script = false;
            // if done with parts, move to next level
            if (!(`part${this.part}` in this.script_sections[`level${this.level}`])) {
                this.part = 1;
                this.level++;
                // if no more levels, finish reading script
                if (!(`level${this.level}` in this.script_sections)) {
                    console.log("script done/level not in script");
                    this.script_done = true;
                }
            }
            this.display_textbox.setVisible(false);
            this.speaker_textbox.setVisible(false);
            this.bg_textbox.setVisible(false);
            return false;
        }
        this.setText();
        this.curr_line = this.curr_script[this.curr_line_index].text;

        return true;
    }

    setText() {
        // if the part is not done, return true to indicate still reading
        this.curr_speaker = this.curr_script[this.curr_line_index].speaker;
        if (this.curr_speaker in this.character_variables) {
            this.speaker_sfx = current_scene.sound.add(this.character_variables[this.curr_speaker.toLowerCase()].voice, {volume: 0.5});
            this.speaker_color = this.character_variables[this.curr_speaker.toLowerCase()].color;
        }
        else {
            this.speaker_sfx = current_scene.sound.add("male blip", {volume: 0.5});
            this.speaker_color = "#FFFFFF";
        }


        this.speaker_textbox.setText(this.curr_speaker);
        this.speaker_textbox.setColor(this.speaker_color);
        this.display_textbox.setColor(this.speaker_color);
    }

    updateScript(delta) {
        if (!this.reading_script) return;

        if (!this.mouse_held && pointer.isDown) {
            this.mouse_held = true;
            if (!this.line_finished && !this.line_paused) {
                // run a loop to do everything in here.
                while (!this.line_finished && !this.line_paused) {
                    this.updateLine();
                }
            }
            else if (this.line_paused) {
                this.line_paused = false;
                this.display_line = "";
            }
            else if (this.line_finished) {
                if (!this.nextLine()) return;
            }
        }
        else if (!pointer.isDown) {
            this.mouse_held = false;
        }

        // if line isn't finished or paused, update the line
        if (!this.line_finished && !this.line_paused) {
            this.char_update_timer += delta/1000;
            // update line at the rate
            if (this.char_update_timer >= this.char_update_rate) {
                this.char_update_timer = 0;
                this.updateLine();
            }
        }

        this.display_textbox.setText(this.display_line);
    }

    updateLine() {
        if (this.line_paused) return;
        this.checkForCommand();
        this.display_line += this.curr_line[this.curr_char_index];
        this.speaker_sfx.play();
        this.checkToAddNewline();
        this.curr_char_index++;

        // if the current line is finished being read
        if (this.curr_char_index >= this.curr_line.length) {
            this.line_finished = true;
        }
    }

    checkToAddNewline() {
        // if char is a white space, check for next word
        if (/\s/.test(this.curr_line[this.curr_char_index])) {
            const str_copy = this.curr_line.slice(this.curr_char_index);
            const next_word = this.curr_line[this.curr_char_index] + str_copy.replace(/\{(.*?)\}/g, '').split(/\s/)[1];
            const recent_line = this.display_line.split('\n')[this.display_line.split('\n').length-1];
            const recent_line_length = recent_line.length * this.text_width;
            const textbox_height = this.text_height * this.display_line.split('\n').length;

            // if the new word width extends beyond the margin, add new line
            if (next_word.length*this.text_width+recent_line_length >= config.width-(this.text_margins*2)) {
                // pause current line until click if the new height is over the max height 
                if ((textbox_height + this.text_height) >= (this.textbox_max_height)) {
                    this.line_paused = true;
                }
                else
                    this.display_line+='\n';
            }
        }
    }

    checkForCommand() {
        // if the next character is a curly brace, check for the contents of it
        if (this.curr_char_index < this.curr_line.length && this.curr_line[this.curr_char_index] == '{') {
            let get_command = true;
            let command = "";
            let command_content = "";
            const prev_index = this.curr_char_index;
            this.curr_char_index++;

            // loop until end of braces is found or reached end of line to find command
            while (this.curr_line[this.curr_char_index] != '}' || this.curr_char_index >= this.curr_line.length-1) {
                if (get_command)
                    command += this.curr_line[this.curr_char_index];
                else 
                    command_content += this.curr_line[this.curr_char_index];
                this.curr_char_index++;
                if (this.curr_line[this.curr_char_index] == ':') {
                    get_command = false;
                    this.curr_char_index++;
                }
            }
            // if end of braces was never found, do not try to run any commmand
            if (this.curr_char_index >= this.curr_line.length-1) {
                this.curr_char_index = prev_index;
            }
            else {
                this.curr_char_index++;
                switch (command.trim()) {
                    case "rate":
                        this.char_update_rate = parseFloat(command_content.trim());
                        break;
                    default:
                        console.log(command,"does not exist");
                        this.curr_char_index = prev_index;
                        break;
                }
            }
        }
    }
}
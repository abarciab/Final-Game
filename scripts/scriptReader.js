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

        this.text_margins = config.width * 0.3;
        this.textbox_max_height = (config.height * 0.25);

        this.text_box_y = config.height * 0.6;

        this.display_textbox = new Phaser.GameObjects.Text(scene, this.text_margins, this.text_box_y, "this is a text box\ntest").setFontSize(26).setDepth(10).setVisible(false);
        this.text_width = this.display_textbox.displayWidth / this.display_textbox.text.length;
        this.text_height = this.display_textbox.displayHeight / this.display_textbox.text.split('\n').length;

        this.mouse_held = false;
    }

    readNextPart(scene) {
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

        this.level = level;
        this.part = part;

        this.curr_line_index = 0;
        this.curr_char_index = 0;

        this.current_location = this.script_sections[`level${this.level}`][`part${this.part}`].location;
        this.curr_script = [...this.script_sections[`level${this.level}`][`part${this.part}`].body];

        this.display_line = "";
        this.curr_speaker = this.curr_script[this.curr_line_index].speaker;
        this.curr_line = this.curr_script[this.curr_line_index].text;

        this.display_textbox.setVisible(true);
        scene.add.text(this.display_textbox);
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
            console.log("finished reading part");
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
            return false;
        }

        // if the part is not done, return true to indicate still reading
        this.curr_speaker = this.curr_script[this.curr_line_index].speaker;
        this.curr_line = this.curr_script[this.curr_line_index].text;

        return true;
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

        console.log(this.curr_speaker, ':', this.display_line);
        this.display_textbox.setText(this.display_line);
    }

    updateLine() {
        if (this.line_paused) return;
        this.checkForCommand();
        this.display_line += this.curr_line[this.curr_char_index];
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
            const recent_line_length = this.display_line.split('\n')[this.display_line.split('\n').length-1].length * this.text_width;
            const textbox_height = this.text_height * this.display_line.split('\n').length;

            // if the new word width extends beyond the margin, add new line
            if (next_word.length*this.text_width+recent_line_length >= config.width-this.text_margins*2) {
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
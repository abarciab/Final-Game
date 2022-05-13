/*
script reader: in scene before game starts
update the text at a speed of n text/second
place the location of when the scene get's read up until the part is empty, then move onto the next part

first get the script for the level, then start reading a part, then read the body array person by person until it's done
*/

/*async function getData(url) {
    const response = await fetch(url);

    return response.json();
}

const data = await getData("./scripts/gameScript.json");

console.log({data});
*/
class ScriptReader {
    constructor() {
        //let scriptData;
        /*fetch('./scripts/gameScript.json')
        .then(response => {
            return response.json();
        })
        .then(scriptData => console.log(scriptData));
        console.log(scriptData);*/
        
        /*let data;
        fetch("./scripts/gameScript.json").then(
            function(response) { return response.json(); }
        ).then(
            function(json) {
                data = json;
                console.log(data);
            }
        );
        console.log(data);*/
        console.log("read script");
    }
}
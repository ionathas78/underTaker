const fs = require("fs");

function readDB() {
    let fileName = "./db/db.json";

    fs.readFile(fileName, function(err, data) {
        if (err) {
            console.log(err);

        } else {
            let jsonData = JSON.parse(data);

            // jsonData = jsonData.filter(item => item.id != noteId);

            console.log(jsonData);
        };
    });
};

function writeDB() {
    let fileName = "./db/db.json";

    fs.readFile(fileName, function(err, data) {
        if (err) {
            console.log(err);

        } else {
            let jsonData = JSON.parse(data);

            let newItem = {
                id: 2,
                title: "New Item",
                text: "New text",
                tags: [ "tag0", "tagX", "tagY" ],
                importance: 1
            };

            jsonData.push(newItem);
            
            // jsonData = jsonData.filter(item => item.id != noteId);

            fs.writeFile(fileName, JSON.stringify(jsonData, null, 2), () => {
                console.log(jsonData);
            });
        };
    });
};

function writeDB2() {
    let fileName = "./db/db.json";
    let newNote = {
        id: 0,
        title: "test",
        text: "test text",
        importance: 0,
        tags: [
            "test tag"
        ]
    }

    fs.readFile(fileName, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            let jsonData = JSON.parse(data);
            // let jsonData = data;
            // console.log(jsonData);

            if (jsonData.find(item => item.id == newNote.id)) {
                let itemID = -1;
                jsonData.forEach(item => {
                    if (item.id > itemID) {
                        itemID = item.id;
                    };
                })
                newNote.id = itemID + 1;
            };

            jsonData.push(newNote);
            let jsonToString = JSON.stringify(jsonData, null, 2);

            fs.writeFile(fileName, jsonToString, () => {
                console.log(jsonToString);
            });
        };
    });
};

// 
// readDB();
// writeDB();
writeDB2();

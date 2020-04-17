var fs = require("fs");
var express = require("express");

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var PORT = 9733;


// * The application frontend has already been created, it's your job to build the backend and connect the two.

const NoteImportance = {
    NORMAL: 0,
    LOW: 1,
    HIGH: 2
};
Object.freeze(NoteImportance);

class Note {
    constructor (title, text, id = -1, tags = [], importance = NoteImportance.NORMAL) {
        this.id = id;
        this.title = title;
        this.text = text;
        this.tags = [];
        if (tags) {
            this.tags = tags;
        };
        this.importance = importance;
    };

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            text: this.text,
            importance: this.importance,
            tags: this.tags
        };
    };
};

class NoteBook {
    constructor() {
        this.currentId = -1;
        this.notes = [];
    };

    addNote(title, text, id = -1, tags = [], importance = NoteImportance.NORMAL) {
        if (id < 0 || this.notes.find(item => item.id == id)) {
            id = this.currentId + 1;
            this.currentId++;
        } else if (id > this.currentId) {
            this.currentId = id;
        };

        let newNote = new Note(title, text, id, tags, importance);
        this.notes.push(newNote);
        return newNote;
    };

    removeNote(idToRemove) {
        let returnValue = false;
        if (this.notes.find(item => item.id == idToRemove)) {
            this.notes = this.notes.filter(item => item.id != idToRemove);
            returnValue = true;
        };
        return returnValue;
    };

    reviseNote(idToRevise, title = "", text = "", tags = [], importance = -1) {
        let returnValue = null;
        let noteToRevise = this.notes.find(item => item.id == idToRevise);
        if (noteToRevise) {
            if (title && title != "") {
                noteToRevise.title = title;
            };
            if (text && text != "") {
                noteToRevise.text = text;
            };
            if (tags) {
                noteToRevise.tags = tags;
            };
            if (importance > -1) {
                noteToRevise.importance = importance;
            };            
            returnValue = noteToRevise;
        };
        return returnValue;
    };
};

// Routes
// ===========================================================

// * The following HTML routes should be created:

//   * GET `/notes` - Should return the `notes.html` file.

app.get("/notes", function(req, res) {
    renderNotesPage(req, res);
});
  
// * The application should have a `db.json` file on the backend that will be used to store and retrieve notes using the `fs` module.

// * The following API routes should be created:

//   * GET `/api/notes` - Should read the `db.json` file and return all saved notes as JSON.

app.get("/api/notes", function(req, res) {
    renderNotesDB(req, res);
});

app.get("/assets/js/index.js", function(req, res) {
    let fileName = "./public/assets/js/index.js";

    fs.readFile(fileName, function(err, data) {
        if (err) {
            console.log("Couldn't find 'index.js!");
            res.end();
        };
        res.end(data);
    });
});



app.get("/assets/css/styles.css", function(req, res) {
    let fileName = "./public/assets/css/styles.css";

    fs.readFile(fileName, function(err, data) {
        if (err) {
            console.log("Couldn't find 'styles.css!");
            res.end();
        };
        res.end(data);
    });
});


//   * GET `*` - Should return the `index.html` file

app.get("*", function(req, res) {
    renderWelcomePage(req, res);
});
  

//   * POST `/api/notes` - Should receive a new note to save on the request body, add it to the `db.json` file, and then return the new note to the client.

app.post("/api/notes", function(req, res) {
    const { title, text, id, tags, importance } = req.body;

    const newNote = new Note(title, text, id, tags, importance);
    const fileName = __dirname + "/db/db.json";

    fs.readFile(fileName, function(err, data) {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end("<html><head><title>Oops</title></head><body><h1>Oops, there was an error</h1></html>");
        } else {
            let jsonData = JSON.parse(data);

            let newId = -1;
            if (jsonData[0]) {
                for (let i = 0; i < jsonData.length; i++) {
                    let thisId = jsonData[i].id;
                    if (thisId) {
                        newId = Math.max(newId, parseInt(thisId));
                    };
                };
            };
            newNote.id = newId + 1;
            
            jsonData.push(newNote.toJSON());
            let jsonToString = JSON.stringify(jsonData, null, 2);

            fs.writeFile(fileName, jsonToString, () => {
                res.writeHead(200, { "Content-Type": "text/JSON" });
                res.end(jsonToString);
            });
        };
    });
});

//   * DELETE `/api/notes/:id` - Should receive a query parameter containing the id of a note to delete. This means you'll need to find a way to give each note a unique `id` when it's saved. In order to delete a note, you'll need to read all notes from the `db.json` file, remove the note with the given `id` property, and then rewrite the notes to the `db.json` file.

app.delete("/api/notes/:id", function(req, res) {
    let noteId = req.params.id;
    const fileName = __dirname + "/db/db.json";

    fs.readFile(fileName, function(err, data) {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end("<html><head><title>Oops</title></head><body><h1>Oops, there was an error</h1></html>");
        } else {
            let jsonData = JSON.parse(data);

            jsonData = jsonData.filter(item => item.id != noteId);
            let jsonToString = JSON.stringify(jsonData, null, 2);

            fs.writeFile(fileName, jsonToString, () => {
                res.writeHead(200, { "Content-Type": "text/JSON" });
                res.end(jsonToString);
            });
        };
    });
});


//  **  Functions

function renderWelcomePage(req, res) {
    fs.readFile(__dirname + "/public/index.html", function(err, data) {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end("<html><head><title>Oops</title></head><body><h1>Oops, there was an error</h1></html>");
        } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        };
    });
}
    
function renderNotesPage(req, res) {
    fs.readFile(__dirname + "/public/notes.html", function(err, data) {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end("<html><head><title>Oops</title></head><body><h1>Oops, there was an error</h1></html>");
        } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        };
    });
};

function renderNotesDB(req, res) {
    fs.readFile(__dirname + "/db/db.json", function(err, data) {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end("<html><head><title>Oops</title></head><body><h1>Oops, there was an error</h1></html>");
        } else {
            res.writeHead(200, { "Content-Type": "text/JSON" });
            res.end(data);
        };
    });
}



  // Listener
  // ===========================================================
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
  

//   const sampleNote = 
//   [{ "id": 0, "title": "test note", "text": "test text", "tags": [ "tag1", "tag2"], "importance": 0 }]
var corePrograms = corePrograms || [];

corePrograms.push({
    name: "info",
    alias: [],
    man: "This command gives you info about the system.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        stdout.end("UNIJS 0.1");
        _return();
    }
});

corePrograms.push({
    name: "echo",
    alias: [],
    man: "This command behaves like a parrot.\nExecute with no arguments to pipe the input to the output.\nExecute with arguments to print them in the output.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length > 1) {
            for (var i = 1; i < argv.length; i++) {
                stdout.write(argv[i]);
            }
            _return();
        } else {
            stdin.on("data", function (data) { stdout.write(data) });
            stdin.on("end", function () { _return() });
            async();
        }
    }
});

corePrograms.push({
    name: "js",
    alias: [],
    man: "Executes JavaScript code.\nExecute with no arguments to get a JS command line.\nYou can also execute js followed by the code.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length > 1) {
            argv.shift();
            stdout.write(eval(argv.join(" ")));
            _return();
        } else {
            stdin.on("data", function (data) { stdout.write(eval(data)) });
            stdin.on("end", function () { _return() });
            async();
        }
    }
});

corePrograms.push({
    name: "cat",
    alias: [],
    man: "Shows the content of a file.\n Execute 'cat <filename>'",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length == 2) {
            var file = fs.readFile(argv[1]);
            if (file === false) {
                stdout.write("File " + argv[1] + " does not exist.");
                _return();
                return;
            }
            if (file === "Locked") {
                stdout.write("This file is locked by another program.");
                _return();
                return;
            }
            file.on("data", function (data) { stdout.write(data) });
            file.on("end", function () { _return() });
            async();
        } else {
            stdout.write("Incorrect number of arguments.");
            _return();
        }
    }
});

corePrograms.push({
    name: "caesar",
    alias: [],
    man: "Vini, vidi, encodi.\n Must be executed with one argument, 'caesar <n>' \n It will add n to the unicode code of each character in the input and print it to output.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length != 2) {
            _return();
        } else {
            var n = parseInt(argv[1]);
            stdin.on("data", function (data) { stdout.write(data.split("").map(function (x) { return String.fromCharCode(x.charCodeAt(0) + n) }).join("")) });
            stdin.on("end", function () { _return() });
            async();
        }
    }
});

corePrograms.push({
    name: "cd",
    alias: [],
    man: "Executed with no arguments, prints the current path.\nExecuted with one argument, navigates to that relative path.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length == 1) {
            stdout.write(fs.getCurrentPath());
        } else if (argv.length == 2) {
            var folders = argv[1].split("/").filter(function (x) { return x != ""; });
            for (var i = 0; i < folders.length; i++) {
                if (folders[i] != "..") {
                    if (fs.navigateChild(folders[i])) {

                    } else {
                        stdout.write("Folder " + folders[i] + " is not a child of " + fs.getCurrentFolder());
                        break;
                    }
                } else {
                    if (fs.navigateUp()) {

                    } else {
                        stdout.write("You are already in the root folder");
                        break;
                    }
                }
            }
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "mkdir",
    alias: [],
    man: "Creates a folder in the current folder, the name must be specified in the first parameter.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length == 2) {
            if (fs.createFolder(argv[1])) {

            } else {
                stdout.write("That folder already exists");
            }
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "ls",
    alias: ["dir"],
    man: "Shows the content of the current folder.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length == 1) {
            fs.getChilds().map(function (x) { return x.name; }).forEach(stdout.write);
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "tree",
    alias: [],
    man: "Prints the structure of the current folder as a tree.",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        function printTree(level, levelsfinished) {
            var tabs = "", i = 0;
            level = level || 0;
            levelsfinished = levelsfinished || 0;
            while (i++ < level - levelsfinished) {
                tabs += "│";
            }
            i = 0;
            while (i++ < levelsfinished) {
                tabs += " ";
            }
            var childs = fs.getChilds();
            for (i = 0; i < childs.length; i++) {
                if (i != childs.length - 1) {
                    stdout.write(tabs + "├── " + childs[i].name);
                } else {
                    levelsfinished += 1;
                    stdout.write(tabs + "└── " + childs[i].name);
                }
                if (childs[i].type == "folder") {
                    fs.navigateChild(childs[i].name);
                    printTree(level + 1, levelsfinished);
                    fs.navigateUp();
                }
            }
        }
        if (argv.length == 1) {
            stdout.write(fs.getCurrentFolder());
            printTree();
        } else {
            stdout.write("Wrong number of parameters");
        }
        _return();
    }
});

corePrograms.push({
    name: "wget",
    alias: [],
    man: "Retrieves content from the web.\n Execute 'curl <url>'",
    entryPoint: function (argv, stdin, stdout, fs, _return, async) {
        if (argv.length == 2) {
            var xhr = XMLHttpRequest();
            xhr.onload = function () {
                if (this.status == 200) {
                    stdout.write(this.responseText);
                    _return();
                } else {
                    stdout.write("Error " + this.status);
                    stdout.write(this.responseText);
                    _return();
                }
            }
            xhr.open("GET", argv[1]);
            xhr.send();
            async();
        } else {
            stdout.write("Wrong number of parameters");
            _return();
        }
    }
});
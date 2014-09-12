var vpgen;
(function (vpgen) {
    function onTextChange(e) {
        var textArea = document.getElementById("inp");
        var textAreaOut = document.getElementById("outp");

        var txt = textArea.value;

        var parser = new Parser();
        var laps = parser.parse(txt);

        var errorString = "";
        for (var lapIndex in laps) {
            var lap = laps[lapIndex];
            if (lap.error != undefined) {
                errorString += "line " + lap.lineNr + ": the string '" + lap.original + "' failed with '" + lap.error + "'\n";
            }
        }

        if (errorString.length > 0) {
            textAreaOut.value = errorString;
        } else {
            var gen = new CodeGenerator();
            textAreaOut.value = gen.generate(laps);
        }
        //console.log(laps);
    }
    vpgen.onTextChange = onTextChange;

    var CodeGenerator = (function () {
        function CodeGenerator() {
        }
        CodeGenerator.prototype.generate = function (laps) {
            var code = "dur = SUUNTO_DURATION;\n\n";
            var prevTime = -1;
            var prevDist = 0;

            for (var lapIndex in laps) {
                var lap = laps[lapIndex];
                var lapDistance = lap.distance - prevDist;
                var lapTime = lap.time - prevTime;
                var lapSpeed = lapDistance / lapTime;

                code += "// lap: " + lapIndex + "\n";
                code += "if (dur > " + prevTime + " && dur <= " + lap.time + ") {\n" + "    // accumulated distance: " + prevDist + "m\n" + "    // distance this lap: " + lapDistance + "m\n" + "    // time this lap: " + lapTime + "s\n" + "    // speed this lap: " + lapSpeed + " m/s\n" + "}\n\n";

                prevTime = lap.time;
                prevDist = lap.distance;
            }

            return code;
        };
        return CodeGenerator;
    })();

    var Lap = (function () {
        function Lap(lineNr, original, distance, time, err) {
            this.lineNr = lineNr;
            this.error = err;
            this.original = original;
            this.distance = distance;
            this.time = time;
        }
        return Lap;
    })();

    var Parser = (function () {
        function Parser() {
            this.lineRegexp = /^(\d\d):(\d\d):(\d\d)\s+(\d+)\s*(km|k|m)?$/;
        }
        Parser.prototype.parse = function (str) {
            var laps = [];

            var lineNr = 0;
            var lines = str.split("\n");
            for (var lineIndex in lines) {
                lineNr++;

                var line = lines[lineIndex];

                if (line.length == 0 || (/^\s+$/).exec(line) != undefined) {
                    continue;
                }

                var match = this.lineRegexp.exec(line);

                if (match == undefined) {
                    var lap = new Lap(lineNr, line, 0, 0, "Not in the format '00:00:00 0 (km|k|m)'");
                } else {
                    var hours = +match[1];
                    var minutes = +match[2];
                    var seconds = +match[3];
                    var distance = +match[4];
                    var unit = match[5];

                    var time = hours * 60 * 60 + minutes * 60 + seconds;
                    if (unit === "k" || unit === "km") {
                        distance = distance * 1000;
                    }

                    var lap = new Lap(lineNr, line, distance, time, null);
                }

                laps.push(lap);

                console.log("" + lap);
            }

            return laps;
        };
        return Parser;
    })();
})(vpgen || (vpgen = {}));

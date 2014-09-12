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

        textAreaOut.value = errorString;

        console.log(laps);
    }
    vpgen.onTextChange = onTextChange;

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

var vpgen;
(function (vpgen) {
    function onGenerate(e) {
        var textArea = document.getElementById("inp");
        var textAreaOut = document.getElementById("outp");

        var txt = textArea.value;

        var parser = new Parser();
        var laps = parser.parse(txt);

        var errorString = "";
        for (var lapIndex in laps) {
            var lap = laps[lapIndex];

            if (lap.isError()) {
                var sourceRef = lap.sourceRef;
                errorString += "line " + sourceRef.lineNr + ": the string '" + sourceRef.originalLine + "' failed with '" + sourceRef.errorMessage + "'\n";
            }
        }

        if (errorString.length > 0) {
            textAreaOut.value = errorString;
        } else {
            var gen = new CodeGenerator();
            textAreaOut.value = gen.generate(laps);
        }
    }
    vpgen.onGenerate = onGenerate;

    var CodeGenerator = (function () {
        function CodeGenerator() {
        }
        CodeGenerator.prototype.generate = function (laps) {
            var code = "/* GENERATED CODE BY VPGEN */ \n\n";
            var prevTime = -1;

            for (var lapIndex in laps) {
                var lap = laps[lapIndex];

                code += "/* lap: " + lapIndex + " from line: " + lap.sourceRef.lineNr + " */\n";
                code += "if (SUUNTO_DURATION > " + lap.accumulatedTime + " && SUUNTO_DURATION <= " + lap.endTime + ") {\n" + "    /*\n" + "      accumulated distance: " + lap.accumulatedDistance + "m\n" + "      distance this lap: " + lap.lapDistance + "m\n" + "      time this lap: " + lap.lapTime + "s\n" + "      speed this lap: " + lap.lapSpeed + " m/s\n" + "     */\n\n" + "     RESULT = (SUUNTO_DISTANCE * 1000) - (((SUUNTO_DURATION - " + lap.accumulatedTime + ") * " + lap.lapSpeed + ") + " + lap.accumulatedDistance + ");\n" + "}\n\n";
            }

            code += "\n\n" + "RESULT = (RESULT / 1000);\n" + "if (RESULT < 0) {\n" + "   RESULT = Math.abs(RESULT);\n" + "   prefix = \"behind\";\n" + "} else {\n" + "   prefix = \"ahead\";\n" + "}\n";

            return code;
        };
        return CodeGenerator;
    })();

    var SourceReference = (function () {
        function SourceReference(lineNr, originalLine, errorMessage) {
            this.originalLine = originalLine;
            this.lineNr = lineNr;
            this.errorMessage = errorMessage;
        }
        return SourceReference;
    })();

    var Lap = (function () {
        function Lap(accumulatedDistance, accumulatedTime, distance, endTime, lapDistance, sourceRef) {
            this.accumulatedDistance = accumulatedDistance;
            this.accumulatedTime = accumulatedTime;
            this.distance = distance;
            this.endTime = endTime;
            this.sourceRef = sourceRef;
            this.lapDistance = lapDistance;
            this.lapTime = endTime - accumulatedTime;
            this.lapSpeed = lapDistance / this.lapTime;
        }
        Lap.prototype.isError = function () {
            return this.sourceRef.errorMessage != undefined;
        };
        return Lap;
    })();

    var Parser = (function () {
        function Parser() {
            this.lineRegexp = /^(\d\d):(\d\d):(\d\d)\s+(\d+)\s*(km|k|m)?$/;
        }
        Parser.prototype.parse = function (str) {
            var laps = [];

            var accumulatedTime = 0;
            var accumulatedDistance = 0;
            var lineNr = 0;
            var lines = str.split("\n");
            for (var lineIndex in lines) {
                lineNr++;

                var line = lines[lineIndex];

                if (line.length == 0 || (/^\s+$/).exec(line) != undefined) {
                    continue;
                }

                var sourceRef = new SourceReference(lineNr, line, undefined);

                var match = this.lineRegexp.exec(line);

                if (match == undefined) {
                    sourceRef.errorMessage = "Not in the format '00:00:00 0 (km|k|m)'";
                    var lap = new Lap(0, 0, 0, 0, 0, sourceRef);
                } else {
                    var hours = +match[1];
                    var minutes = +match[2];
                    var seconds = +match[3];
                    var distance = +match[4];
                    var unit = match[5];

                    var endTime = hours * 60 * 60 + minutes * 60 + seconds;
                    if (unit === "k" || unit === "km") {
                        distance = distance * 1000;
                    }

                    var lapDistance = distance - accumulatedDistance;

                    var lap = new Lap(accumulatedDistance, accumulatedTime, distance, endTime, lapDistance, sourceRef);

                    accumulatedDistance = distance;
                    accumulatedTime = endTime;
                }

                laps.push(lap);

                console.log("" + lap);
            }

            return laps;
        };
        return Parser;
    })();
})(vpgen || (vpgen = {}));

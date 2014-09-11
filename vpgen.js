var vpgen;
(function (vpgen) {
    function onTextChange(e) {
        var textArea = document.getElementById("inp");
        var txt = textArea.value;

        var parser = new Parser();
        parser.parse(txt);
    }
    vpgen.onTextChange = onTextChange;

    var Parser = (function () {
        function Parser() {
        }
        Parser.prototype.parse = function (str) {
            alert("xx:" + str);
        };
        return Parser;
    })();
})(vpgen || (vpgen = {}));

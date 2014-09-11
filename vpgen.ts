

module vpgen {
	
	export function onTextChange(e) {
		
		var textArea = document.getElementById("inp");
		var txt:string = textArea.value;

		var parser:Parser = new Parser();
		parser.parse(txt);
	}

	class Parser {

		parse(str:string) {
			alert("xx:" + str);
		}

	}

}
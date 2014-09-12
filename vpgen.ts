

module vpgen {
	
	export function onTextChange(e) {
		
		var textArea = <HTMLInputElement>document.getElementById("inp");
		var textAreaOut = <HTMLInputElement>document.getElementById("outp");

		var txt:string = textArea.value;

		var parser:Parser = new Parser();
		var laps = parser.parse(txt);
		
		var errorString:string = ""; 
		for (var lapIndex in laps) {
			var lap = laps[lapIndex];
			if (lap.error != undefined) {
				errorString += "line " + lap.lineNr + ": the string '" + lap.original + 
							   "' failed with '" + lap.error + "'\n"; 
			}
		}
		
		if (errorString.length > 0) {
			textAreaOut.value = errorString;
		} else {
			var gen:CodeGenerator = new CodeGenerator();
			textAreaOut.value = gen.generate(laps);
		}
		//console.log(laps);
	}

	class CodeGenerator {


		generate(laps:Lap[]) : string {
			var code:string = "dur = SUUNTO_DURATION;\n\n";
			var prevTime:number = -1;
			var prevDist:number = 0;

			for (var lapIndex in laps) {
				var lap:Lap = laps[lapIndex];
				var lapDistance = lap.distance - prevDist;
				var lapTime = lap.time - prevTime;
				var lapSpeed = lapDistance / lapTime;

				code += "// lap: " + lapIndex  + "\n";
				code += "if (dur > " + prevTime + " && dur <= " + lap.time + ") {\n" +

				"    // accumulated distance: " + prevDist + "m\n" +
				"    // distance this lap: " + lapDistance + "m\n" +
				"    // time this lap: " + lapTime + "s\n" +
				"    // speed this lap: " + lapSpeed + " m/s\n" +


				"}\n\n";

				prevTime = lap.time;
				prevDist = lap.distance;
			}


			return code;
		}

	}


	class Lap {
	
		distance:number
		time:number
		original:string
		lineNr:number
		error:string
		
		constructor(lineNr:number, original:string, distance:number,
					time:number, err:string) {
					
			this.lineNr = lineNr
			this.error = err;
			this.original = original;
			this.distance = distance;
			this.time = time;
		}
		
	}

	class Parser {

		lineRegexp:RegExp = /^(\d\d):(\d\d):(\d\d)\s+(\d+)\s*(km|k|m)?$/; 

		parse(str:string) : Lap[] {

			var laps:Lap[] = [];

			var lineNr:number = 0;
			var lines = str.split("\n");
			for (var lineIndex in lines) {
				lineNr++;
								
				var line:string = lines[lineIndex];
				
				if (line.length == 0 || (/^\s+$/).exec(line) != undefined) {
					continue;
				}
				
				
				var match = this.lineRegexp.exec(line);
				
				if (match == undefined) {
					var lap:Lap = new Lap(lineNr, line, 0, 0,
										  "Not in the format '00:00:00 0 (km|k|m)'");
				} else {
				
					var hours:number = +match[1];
					var minutes:number = +match[2];
					var seconds:number = +match[3];
					var distance:number = +match[4];
					var unit:string = match[5]

					var time:number = hours*60*60 + minutes*60 + seconds;
					if (unit === "k" || unit === "km") {
						distance = distance*1000;
					} 
				
					var lap:Lap = new Lap(lineNr, line, distance, time, null);
				}
				
				laps.push(lap);
				
				console.log("" + lap);
				
			}

			return laps;
		}

	}

}
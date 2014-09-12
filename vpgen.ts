

module vpgen {
	
	export function onGenerate(e) {
		
		var textArea = <HTMLInputElement>document.getElementById("inp");
		var textAreaOut = <HTMLInputElement>document.getElementById("outp");

		var txt:string = textArea.value;

		var parser:Parser = new Parser();
		var laps = parser.parse(txt);
		
		var errorString:string = ""; 
		for (var lapIndex in laps) {
			
			var lap = laps[lapIndex];
			
			if (lap.isError()) {

				var sourceRef:SourceReference = lap.sourceRef;
				errorString += "line " + sourceRef.lineNr + ": the string '" + sourceRef.originalLine + 
							   "' failed with '" + sourceRef.errorMessage + "'\n"; 
			
			}
		}
		
		if (errorString.length > 0) {
			
			textAreaOut.value = errorString;

		} else {
			
			var gen:CodeGenerator = new CodeGenerator();
			textAreaOut.value = gen.generate(laps);
		
		}

	}

	class CodeGenerator {


		generate(laps:Lap[]) : string {
			var code:string = "/* GENERATED CODE BY VPGEN */ \n\n";
			var prevTime:number = -1;

			for (var lapIndex in laps) {
				var lap:Lap = laps[lapIndex];

				code += "/* lap: " + lapIndex  + " from line: " + lap.sourceRef.lineNr + " */\n";
				code += "if (SUUNTO_DURATION > " + lap.accumulatedTime + " && SUUNTO_DURATION <= " + lap.endTime + ") {\n" +

				"    /*\n" +
				"      accumulated distance: " + lap.accumulatedDistance + "m\n" +
				"      distance this lap: " + lap.lapDistance + "m\n" +
				"      time this lap: " + lap.lapTime + "s\n" +
				"      speed this lap: " + lap.lapSpeed + " m/s\n" +
				"     */\n\n" +

				"     RESULT = (SUUNTO_DISTANCE * 1000) - (((SUUNTO_DURATION - " + lap.accumulatedTime + ") * " + 
							   lap.lapSpeed + ") + " + lap.accumulatedDistance + ");\n" +

				"}\n\n";
			}

			code += "\n\n" +
			"RESULT = (RESULT / 1000);\n" +
			"if (RESULT < 0) {\n" +
		  	"   RESULT = Math.abs(RESULT);\n" +
			"   prefix = \"behind\";\n" +
			"} else {\n" +
			"   prefix = \"ahead\";\n" +
			"}\n";


			return code;
		}

	}

	class SourceReference {

		originalLine:string;
		lineNr:number;
		errorMessage:string;

		constructor(lineNr:number, originalLine:string, errorMessage:string) {
			this.originalLine = originalLine;
			this.lineNr = lineNr;
			this.errorMessage = errorMessage;
		}
	}

	class Lap {
	
		accumulatedDistance:number
		accumulatedTime:number
		distance:number
		endTime:number
		lapDistance:number
		lapSpeed:number;
		lapTime:number;

		sourceRef:SourceReference
		
		constructor(accumulatedDistance:number, accumulatedTime:number, 
					distance:number, endTime:number, lapDistance:number, sourceRef:SourceReference) {

			this.accumulatedDistance = accumulatedDistance;
			this.accumulatedTime = accumulatedTime;					
			this.distance = distance;
			this.endTime = endTime;
			this.sourceRef = sourceRef;
			this.lapDistance = lapDistance;
			this.lapTime = endTime - accumulatedTime;
			this.lapSpeed = lapDistance / this.lapTime;

		}
		
		isError() : boolean {
			return this.sourceRef.errorMessage != undefined;
		}

	}

	class Parser {

		lineRegexp:RegExp = /^(\d\d):(\d\d):(\d\d)\s+(\d+)\s*(km|k|m)?$/; 

		parse(str:string) : Lap[] {

			var laps:Lap[] = [];

			var accumulatedTime:number = 0;
			var accumulatedDistance:number = 0;
			var lineNr:number = 0;
			var lines = str.split("\n");
			for (var lineIndex in lines) {
				lineNr++;
								
				var line:string = lines[lineIndex];
				
				if (line.length == 0 || (/^\s+$/).exec(line) != undefined) {
					continue;
				}
				
				var sourceRef:SourceReference = new SourceReference(lineNr, line, undefined);


				var match = this.lineRegexp.exec(line);
				
				if (match == undefined) {
					
					sourceRef.errorMessage = "Not in the format '00:00:00 0 (km|k|m)'";
					var lap:Lap = new Lap(0, 0, 0, 0, 0, sourceRef);

				} else {
				
					var hours:number = +match[1];
					var minutes:number = +match[2];
					var seconds:number = +match[3];
					var distance:number = +match[4];
					var unit:string = match[5]

					var endTime:number = hours*60*60 + minutes*60 + seconds;
					if (unit === "k" || unit === "km") {
						distance = distance*1000;
					} 
				
					var lapDistance:number = distance - accumulatedDistance;

					var lap:Lap = new Lap(accumulatedDistance, accumulatedTime, 
										  distance, endTime, lapDistance, sourceRef);
					
					accumulatedDistance = distance;
					accumulatedTime = endTime;

				}
				
				laps.push(lap);
				
				console.log("" + lap);
				
			}

			return laps;
		}

	}

}
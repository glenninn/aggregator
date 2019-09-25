var authorizer = require("./auth.js");
var fs = require("fs");
const { exec } = require('child_process');

var auth = authorizer();
var useEditor = false;
var useStage  = false;

//
// Set the shell command to invoke your favorite JSON/text editor
//
var editorCommand = "npp";



function doHelp() {
	console.log("Usage: node aggregator.js {Numeric Id}  {-e | -a}");
	console.log("  Retrieve and display the aggregated BlueJeans Meeting Information for the specified meeting");
	console.log("Options:");
	console.log("  -e : open file in editor instead of browser");
	console.log("  -a : Send to BlueJeans Stage");
	process.exit();
}


function jss(obj){
	return JSON.stringify(obj,null,2);
}



if(process.argv.length < 3) doHelp;

var mtgId = process.argv[2];
if(!mtgId || (mtgId == '?')) doHelp();

for(var o= 3; o< process.argv.length; o++){
	var opt = process.argv[o];
	switch (opt) {
		case "-e" : useEditor = true;
		break;
		case "-a" :
		case "-s" : useStage = true;
		break;
		default :
		   console.log("?Unrecognized option: " + opt);
		   break;
	}
}


/*
https://bluejeans.com/seamapi/v1/services/aggregator/meeting?pairing=none&allowGeoLocation=true&user_access_token=d0...a909e6f

*/
var apiHost = (useStage ?  "api.a.bluejeans.com" : "api.bluejeans.com");
var url = "/v1/services/aggregator/meeting?pairing=none&allowGeoLocation=true";
var arec = {
   attributes: [],
   meetingNumericId : mtgId,
   meetingPasscode : ""
};

console.log("Sending 'aggregator' API to: " + apiHost);


auth.post(apiHost,url,arec).then(
	(ok)=>{
		var snippet = jss(ok);
		console.log("Aggregate Meeting Data:\n" + snippet.slice(0,80) + "...");
		var tfolder = process.env.TEMP;
		var tfn  = Date.now().toString() + ".json";
		var fn = tfolder + "\\" + tfn;
		fs.writeFile(fn, snippet,
			(err)=>{
				if(err){
					console.log("Error writing file: " + fn);
				} else {
					console.log("Saved! -- " + fn);
					var execCmd = fn;
					if(useEditor)
						execCmd = "npp " + execCmd;
						
					exec(execCmd, (err, stdout, stderr) => {
					  if (err) {
						// node couldn't execute the command
						console.log("Couldn't execute the 'cmd' app");
					  }
					});					
				}
			});		
	},
	(error)=>{
		console.log("Aggregator Error: " + error);
	});
	
	


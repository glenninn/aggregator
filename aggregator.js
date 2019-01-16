var authorizer = require("./auth.js");
var fs = require("fs");
const { exec } = require('child_process');

var auth = authorizer();
var useEditor = false;

function doHelp() {
	console.log("Usage: node aggregator.js {Numeric Id}  {-e}");
	console.log("  Retrieve and display the aggregated BlueJeans Meeting Information for the specified meeting");
	console.log("Options:");
	console.log("  -e : open file in editor instead of browser");
	process.exit();
}

if(process.argv.length < 3) doHelp;

var mtgId = process.argv[2];
var opt   = process.argv[3];

if(mtgId == '?') doHelp();
if(opt == "-e" ) useEditor = true;

/*
https://bluejeans.com/seamapi/v1/services/aggregator/meeting?pairing=none&allowGeoLocation=true&user_access_token=d0f1262b636543958176933f5a909e6f

*/
var apiHost = "api.bluejeans.com";
var url = "/v1/services/aggregator/meeting?pairing=none&allowGeoLocation=true";
var arec = {
   attributes: [],
   meetingNumericId : mtgId,
   meetingPasscode : ""
};

auth.post(apiHost,url,arec).then(
	(ok)=>{
		console.log("Aggregate Meeting Data:\n" + JSON.stringify(ok,null,2));
		var tfolder = process.env.TEMP;
		var tfn  = Date.now().toString() + ".json";
		var fn = tfolder + "\\" + tfn;
		fs.writeFile(fn, JSON.stringify(ok,null,2),
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
						console.log("Couldn't execute thje 'cmd' app");
					  }
					});					
				}
			});		
	},
	(error)=>{
		console.log("Aggregator Error: " + error);
	});
	
	


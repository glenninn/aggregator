//------------------------------------
// POST javascript module
//  3/9/2017, g1
//    encapsulate an asynchronous HTTP post function for making API calls
//

var http = require("http");
var https = require("https");
class authorizeClass {
	constructor(){
		this.authToken = "";
		this.tokenQueryName = "access_token";
	}
	

	put(host,path,body){
		return this._postPut(host,path,body,"PUT");
	}

	post(host,path,body){
		return this._postPut(host,path,body,"POST");
	}

	_postPut (host,path,body,method){
		var self=this;
		var postPromise = new Promise(function(resolve,reject){
			var postContent = JSON.stringify(body);
			if( (self.authToken != "") && (self.tokenQueryName != "") ){
				path += (path.indexOf("?")>0) ? "&" : "?";
				path += self.tokenQueryName + "=" + self.authToken;
			}
			
			var opt = {
				hostname : host,
				port : 443,
				path : path,
				method: method,
				headers : {
					'content-type' : 'application/json; charset=utf-8',
					'content-length' : Buffer.byteLength(postContent)
				}
			};
			if(self.tokenQueryName == "")
				opt.headers['Authorization'] = 'Bearer ' + self.authToken;
			
			var req = https.request(opt, function (res) {
				var respBody = "";
				res.setEncoding('utf8');
				res.on('data',function(chunk){
					respBody += chunk;
				});
				res.on('end',function(){
					if((res.statusCode==200) || (res.statusCode==201)) {
						resolve(JSON.parse(respBody));
					} else {
						console.log(method + " error [" + host + ", " + path + "]: " + res.statusCode);
						reject(respBody);
					}
				});
			});

			req.on('error', function(e){
				reject(e.message);
			});
			req.write(postContent);
			req.end();
		});
		return postPromise;	
	}

	
	postUrlFormEncoded (host,path,body){
		var self=this;
		
		var postPromise = new Promise(function(resolve,reject){
			var postContent = body;
			if( (self.authToken != "") ){
				path += (path.indexOf("?")>0) ? "&" : "?";
				path += self.tokenQueryName + "=" + self.authToken;
			}
			
			var opt = {
				hostname : host,
				port : 443,
				path : path,
				method: "POST",
				headers : {
					'content-type' : 'application/x-www-form-urlencoded',
					'content-length' : Buffer.byteLength(postContent)
					}
				};
			var req = https.request(opt, function (res) {
				var respBody = "";
				res.setEncoding('utf8');
				res.on('data',function(chunk){
					respBody += chunk;
				});
				res.on('end',function(){
					if((res.statusCode==200) || (res.statusCode==201)) {
						resolve(JSON.parse(respBody));
					} else {
						console.log("POST error: " + res.statusCode);
						reject(respBody);
					}
				});
			});

			req.on('error', function(e){
				reject(e.message);
			});
			req.write(postContent);
			req.end();
		});
		return postPromise;	
	}


	get (host,path){
		var self=this;
		var getPromise = new Promise(function(resolve,reject){
			if( (self.authToken != "") ){
				path += (path.indexOf("?")>0) ? "&" : "?";
				path += self.tokenQueryName + "=" + self.authToken;
			}
			var opt = {
				hostname : host,
				port : 443,
				path : path,
				method: "GET",
				};
				
			var req = https.request(opt, function (res) {
				var respBody = "";
				res.setEncoding('utf8');
				res.on('data',function(chunk){
					respBody += chunk;
				});
				res.on('end',function(){
					if((res.statusCode==200) || (res.statusCode==201)) {
						resolve(JSON.parse(respBody));
					} else {
						reject(respBody);
					}
				});
			});

			req.on('error', function(e){
				reject(e.message);
			});
			req.end();
		});
		return getPromise;	
	}

	authorize (token){
		this.authToken = token;
	}
	
	setTokenQueryName(name){
		this.tokenQueryName = name;
	}
}

var authorizer = function(){
	return new authorizeClass();
}

module.exports = authorizer;


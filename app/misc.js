const g3n1us_helpers = require('g3n1us_helpers');
const Handlebars = require('handlebars');
	
	
var exported = {};
	
/*
function makeDisabled($jq){
	setTimeout(function(){
		$jq.attr('disabled', 'disabled');
	}, 500);
}

exported.makeDisabled = makeDisabled;
*/

function basename(path){
	return path.split('/').slice(-1)[0];
}

exported.basename = basename;


function getDefaultProjectFiles(proj, asObj){
// 		var proj = app.currentroute.request('project');
	var data = {model: {name: proj}}
	data.user_path = app.user_path;
	
	var files = [
		//{ filename: 'config.json', href: '#/'+proj+'/config.json', contents: JSON.stringify({})},
	];
	if(asObj){
		var ret = {}
		files.forEach(function(f){
			ret[f.filename] = f;
		});
		return ret;
	}
	else return files;
}

exported.getDefaultProjectFiles = getDefaultProjectFiles;

function uintToString(uintArray) {
    var encodedString = String.fromCharCode.apply(null, uintArray),
        decodedString = decodeURIComponent(escape(encodedString));
    return decodedString;
}

exported.uintToString = uintToString;

function popupwindow(url, title, w, h) {
	if(!title) var title = "Window";
	if(!w) var w = 1000;
	if(!h) var h = 600;
	var left = (screen.width/2)-(w/2);
	var top = (screen.height/2)-(h/2);
	if(typeof window.g3n1us_popup_windows === "undefined")
		window.g3n1us_popup_windows = {};
	if(typeof window.g3n1us_popup_windows_hrefs === "undefined")
		window.g3n1us_popup_windows_hrefs = {};
	if(typeof window.g3n1us_popup_windows[title] !== "undefined" && !window.g3n1us_popup_windows[title].closed){
		if(window.g3n1us_popup_windows_hrefs[title] == url){
			window.g3n1us_popup_windows[title].focus();
			return;
		}
		else
			window.g3n1us_popup_windows[title].close();
	}
	
	window.g3n1us_popup_windows_hrefs[title] = url;
	window.g3n1us_popup_windows[title] = window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
	
}	

exported.popupwindow = popupwindow;

function is_url(t){
	var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	var regex = new RegExp(expression);
	return t.match(regex);	
}

exported.is_url = is_url;

function parse_url(url){
	var parser = document.createElement('a');
	parser.href = url;
	return {
		protocol: parser.protocol,
		hostname: parser.hostname,
		port:     parser.port,   
		pathname: parser.pathname,
		search:   parser.search,
		hash:     parser.hash, 
		host:     parser.host,   	
	};
}

exported.parse_url = parse_url;

function parseQuery(query){
	var query = query[0] === '?' ? query.substr(1) : query;
	if(!query) return {};
	var segments = decodeURIComponent(query.replace(/#(.*?)$/g, '')).split('&');
	var return_object = {};
	segments.forEach(function(v){
		var parts = v.split('=');
		var k = parts[0];
		v = parts[1] || '';
		if(g3n1us_helpers.str_contains(k, '[]')){
			return_object[k.replace(/\[\]/, '')] = return_object[k.replace(/\[\]/, '')] || [];
			return_object[k.replace(/\[\]/, '')].push(v);
		}
		else if(g3n1us_helpers.str_contains(k, '[')){
			var parent = k.match(/^(.*?)\[.*?\]/, '')[1];	
			var key = k.match(/\[(.*?)\]/)[1];
			return_object[parent] = return_object[parent] || [];
			return_object[parent][key] = v;
		}
		else{
			return_object[k] = v;
		}
	});
	return return_object;
}

/*
function parseQuery(query){
	var query = query[0] === '?' ? query.substr(1) : query;
	if(!query) return {};
	
	var asJson = '{"' + query.replace(/&/g, '","').replace(/=/g,'":"') + '"}';
	asJson = decodeURIComponent(asJson);
	var ind = 0;
	while(g3n1us_helpers.str_contains(asJson, '[]')){
		asJson = asJson.replace(/\[\]/, ind);
		ind++;
	}
	console.log(asJson);
	var parsed = JSON.parse(asJson, function(key, value) { 
		console.log(this)
		var testkey = decodeURIComponent(key);
		if(g3n1us_helpers.str_contains(testkey, '[]') ){
			var arraykey = testkey.replace('[]', '');
			key = arraykey;
			value = this[key] || [value];
		}
		return key === "" ? value : value; 
	});
	console.log(parsed);
	for(var i in parsed)
		parsed[i] = parsed[i].replace(/#(.*?)$/g, '');
	return parsed;
}
*/

exported.parseQuery = parseQuery;

Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

    var operators, result;

    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }

    operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    };

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

module.exports = exported;

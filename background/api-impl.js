/* Site type

site : The domain (or domain pattern) of the site
status : One of 'secure', 'potential', 'blacklist'

*/

var API = {
	'site.all': function() {
		var rv = [];
		jsonStorage.each(function(site, data) {
			if (site[0] == '$') return;
			data.site = site;
			rv.push(data);
		});
		return rv;
	},
	'site.get': function(args) {
		var site = jsonStorage.get(args.site);
		if (site) {
			site.site = args.site;
		}
		return site;
	},
	'site.add': function(args) {
		console.assert(args.site[0] != '$');
		console.assert(args.status);
		if (jsonStorage.has(args.site)) return false;
		jsonStorage.set(args.site, args);
		RaiseEvent('site', 'add', args);
		return true;
	},
	'site.set': function(args) {
		console.assert(args.site[0] != '$');
		console.assert(args.status);
		var data = jsonStorage.get(args.site);
		if (!data) return false;
		var changed = false
		for (k in args) {
			if (k[0] == '$') continue;
			if (data[k] != args[k]) {
				data[k] = args[k];
				changed = true;
			}
		}
		if (changed) {
			jsonStorage.set(args.site, data);
			RaiseEvent('site', 'set', data);
		}
		return true;
	},
	/// Does either an add or a set, depending on what's needed.
	'site.makeItSo': function(args) {
		console.assert(args.site[0] != '$');
		console.assert(args.status);
		var data = jsonStorage.get(args.site);
		var added = false;
		if (!data) {
			data = {};
			added = true;
		}
		var changed = false
		for (k in args) {
			if (k[0] == '$') continue;
			if (data[k] != args[k]) {
				data[k] = args[k];
				changed = true;
			}
		}
		if (changed) {
			jsonStorage.set(args.site, data);
			if (added) {
				RaiseEvent('site', 'add', data);
			} else {
				RaiseEvent('site', 'set', data);
			}
		}
		return true;
	},
	'site.del': function(args) {
		var had = jsonStorage.has(args.site);
		jsonStorage.del(args.site);
		if (had) {
			RaiseEvent('site', 'del', {site:args.site});
		}
	},
	'site.match': function(args) {
		var site = args.site;
		var rv = jsonStorage.get(site);
		if (!rv) {
			rv = jsonStorage.get("*."+site);
		}
		while (!rv) {
			var i = site.indexOf('.');
			if (i == -1) return;
			site = site.substr(i+1);
			rv = jsonStorage.get("*."+site);
		}
		return rv;
	},
	'setting.get': function(args) {
		return jsonStorage.get('$'+args.name);
	},
	'setting.set': function(args) {
		var sname = '$'+args.name;
		var old = jsonStorage.get(sname);
		jsonStorage.set('$'+args.name, args.value)
		if (old != args.value) {
			RaiseEvent('setting', 'set', {name:args.name, value:args.value});
			return true;
		} else {
			return false;
		}
	},
	'setting.del': function(args) {
		var sname = '$'+args.name;
		var had = jsonStorage.has(sname);
		jsonStorage.del(sname)
		if (had) {
			RaiseEvent('setting', 'del', {name:args.name});
		}
	},
	'setting.has': function(args) {
		return jsonStorage.has('$'+args.name);
	},
	'haspotential': function(args, response) {
		testUrlForHttps(args.site, function(hasit) {
			response(hasit);
		});
		return {$async: true};
	},
};

function onRequest(request, sender, sendResponse) {
	console.log("Request: ", request);
	var func = request.$name;
	if (func[0] == '$' || !API[func]) {
		sendResponse({$error: new ReferenceError(func + " is not a valid API method")});
		return;
	}
	var rv = API[func](request, sendResponse);
	if (typeof rv == 'object' && rv.$async) {
		// The function will handle calling the response when it's ready.
	} else {
		sendResponse(rv);
	}
}
chrome.extension.onRequest.addListener(onRequest);
chrome.extension.onRequestExternal.addListener(onRequest);

var events = {
	'*': [],
	'site': [],
	'site.add': [],
	'site.set': [],
	'site.del': [],
	'setting': [],
	'setting.set': [],
	'setting.del': [],
};

function onConnect(port) {
	var name = '*';
	if (port.name) {
		name = port.name;
	}
	events[name].push(port);
	port.onDisconnect.addListener(function() {
		var i = events[name].indexOf(port);
		delete events[name][i];
	});
}
chrome.extension.onConnect.addListener(onConnect);
chrome.extension.onConnectExternal.addListener(onConnect);

function localConnect(name, func) {
	events[name].push(func);
}

function RaiseEvent(obj, event, args) {
	args.$object = obj;
	args.$event = event;
	args.$name = obj+'.'+event;
	
	function callit(port, i, e) {
		if (port.postMessage) {
			port.postMessage(args);
		} else {
			port(args);
		}
	}
	events['*'].forEach(callit);
	events[args.$object].forEach(callit);
	events[args.$name].forEach(callit);
}


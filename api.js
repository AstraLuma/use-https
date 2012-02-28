/**
 * Wraps up the remote calling API.
 */

// Private variables
var $_connection = null;
var $_listeners = {};

function $_handleevent(msg) {
	function callit(listener) {
		listener(msg);
	}
	if ($_listeners['*']) $_listeners['*'].forEach(callit);
	if ($_listeners[msg.$obj]) $_listeners[msg.$obj].forEach(callit);
	if ($_listeners[msg.$name]) $_listeners[msg.$name].forEach(callit);
}

function $_addlistener(obj, evt, cb) {
	if ($_connection == null) {
		$_connection = chrome.extension.connect();
		$_connection.onMessage.addListener($_handleevent);
	}
	var en = obj;
	if (evt && evt != '*') {
		en += '.'+evt;
	}
	if (!$_listeners[en]) {
		$_listeners[en] = []
	}
	$_listeners[en].push(cb);
}

const UseHttps = {
	site: {
		all: function(cb) {
			chrome.extension.sendRequest({$name: 'site.all'}, cb);
		},
		get: function(site, cb) {
			chrome.extension.sendRequest({$name: 'site.get', site:site}, cb);
		},
		add: function(site, data, cb) {
			var msg = {$name: 'site.add', site: site, status: data.status};
			if (cb) {
				chrome.extension.sendRequest(msg, cb);
			} else {
				chrome.extension.sendRequest(msg);
			}
		},
		set: function(site, data, cb) {
			var msg = {$name: 'site.set', site: site, status: data.status};
			if (cb) {
				chrome.extension.sendRequest(msg, cb);
			} else {
				chrome.extension.sendRequest(msg);
			}
		},
		makeItSo: function(site, data, cb) {
			var msg = {$name: 'site.set', site: site, status: data.status};
			if (cb) {
				chrome.extension.sendRequest(msg, cb);
			} else {
				chrome.extension.sendRequest(msg);
			}
		},
		del: function(site, cb) {
			var msg = {$name: 'site.del', site: site};
			if (cb) {
				chrome.extension.sendRequest(msg, cb);
			} else {
				chrome.extension.sendRequest(msg);
			}
		},
		match: function(site, cb) {
			chrome.extension.sendRequest({$name: 'site.match', site:site}, cb);
		},
		connect: function(evt, cb) {
			$_addlistener('site', evt, cb);
		}
	},
	setting: {
		get: function(name, cb) {
			chrome.extension.sendRequest({$name: 'setting.get', name:name}, cb);
		},
		has: function(name, cb) {
			chrome.extension.sendRequest({$name: 'setting.has', name:name}, cb);
		},
		set: function(name, value, cb) {
			var msg = {$name: 'setting.set', name: name, value: value};
			if (cb) {
				chrome.extension.sendRequest(msg, cb);
			} else {
				chrome.extension.sendRequest(msg);
			}
		},
		del: function(name, cb) {
			var msg = {$name: 'setting.del', name:name};
			if (cb) {
				chrome.extension.sendRequest(msg, cb);
			} else {
				chrome.extension.sendRequest(msg);
			}
		},
		connect: function(evt, cb) {
			$_addlistener('setting', evt, cb);
		}
	},
	haspotential: function(site, cb) {
		var msg = {$name: 'haspotential', site:site};
		if (cb) {
			chrome.extension.sendRequest(msg, cb);
		} else {
			chrome.extension.sendRequest(msg);
		}
	},
};
Object.freeze(UseHttps);


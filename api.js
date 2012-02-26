/**
 * Wraps up the remote calling API.
 */
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

function $ListApi(obj) {
	this.$obj = obj;
	Object.freeze(this);
}

$ListApi.prototype = {
	get: function(cb) {
		var msg = {$name: this.$obj};
		if (cb) {
			chrome.extension.sendRequest(msg, cb);
		} else {
			chrome.extension.sendRequest(msg);
		}
	},
	each: function(cb) {
		chrome.extension.sendRequest({$name: this.$obj}, function(items) {
			for (i in items.sort()) {
				cb(items[i], i);
			}
		});
	},
	add: function(site, cb) {
		var msg = {$name: this.$obj+'.add', site:site};
		if (cb) {
			chrome.extension.sendRequest(msg, cb);
		} else {
			chrome.extension.sendRequest(msg);
		}
	},
	del: function(site, cb) {
		var msg = {$name: this.$obj+'.del', site:site};
		if (cb) {
			chrome.extension.sendRequest(msg, cb);
		} else {
			chrome.extension.sendRequest(msg);
		}
	},
	match: function(site, cb) {
		var msg = {$name: this.$obj+'.match', site:site};
		if (cb) {
			chrome.extension.sendRequest(msg, cb);
		} else {
			chrome.extension.sendRequest(msg);
		}
	},
	clear: function() {
		chrome.extension.sendRequest({$name: this.$obj+'.clear'});
	},
	connect: function(evt, cb) {
		$_addlistener(this.$obj, evt, cb);
	}
};

const UseHttps = {
	sitelist: new $ListApi('sitelist'),
	potentials: new $ListApi('potentials'),
	blacklist: new $ListApi('blacklist'),
	clearAll: function() {
		chrome.extension.sendRequest({$name: 'clearAll'});
	},
	enabled: {
		get: function(cb) {
			var msg = {$name: 'enabled'};
			if (cb) {
				chrome.extension.sendRequest(msg, cb);
			} else {
				chrome.extension.sendRequest(msg);
			}
		},
		set: function(value, cb) {
			var msg = {$name: 'enabled.set', value: value};
			if (cb) {
				chrome.extension.sendRequest(msg, cb);
			} else {
				chrome.extension.sendRequest(msg);
			}
		},
		connect: function(evt, cb) {
			$_addlistener('enabled', evt, cb);
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


// Doesn't belong here, but convenient
$(function() {
	$('body').append(
		$("<a style='text-align: center; display: block;' href='https://github.com/astronouth7303/use-https/issues'>File a Bug</a>")
		.click(function(evt) {
			chrome.tabs.create({url: this.href});
			evt.preventDefault();
		})
	);
});

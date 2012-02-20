function _JsonStorage() {
}

_JsonStorage.prototype = {
	get: function(key) {
		var value = localStorage.getItem(key);
		try {
			return value && JSON.parse(value);
		} catch(err) {
			console.log(err);
		}
	},
	set: function(key, value) {
		this[key] = value;
		localStorage.setItem(key, JSON.stringify(value));
	},
	del: function(key) {
		localStorage.removeItem(key);
		this[key] = null;
	},
	setDefault: function(key, value) {
		if (localStorage[key] == null) {
			this.set(key, value);
		}
		return this.get(key);
	},
	each: function(callback) {
		for (k in localStorage) {
			callback(k, this.get(k));
		}
	},
	clear: function() {
		localStorage.clear();
	},
	key: function(i) {
		return localStorage.key(i);
	},
	get length() {
		return localStorage.length;
	}
}

jsonStorage = new _JsonStorage();


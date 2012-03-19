/**
 * Extracts the protocol and the origin from the given URL.
 */
function ProtoOrigin(url) {
	var p = /^([^:]+):/.exec(url),
		o = /^[^:]+:\/{0,2}([^\/]+)\/?/.exec(url);
	this.p = p[1];
	this.o = o[1];
	this.url = url;
	Object.freeze(this);
}
ProtoOrigin.prototype = {
	/**
	 * Does the given protocol have a secure version?
	 */
	hasSecure: function() {
		return this.p == 'http';
	},
	
	/**
	 * Is the given URL secure?
	 */
	isSecure: function() {
		return this.p == 'https' && this.o.indexOf(':') == -1;
	},
	
	makeSecure: function() {
		return this.url.replace("http://", "https://");
	},
	
	toString: function() {
		return "[ProtoOrigin "+this.p+" "+this.o+"]";
	}
};

function SitePile(value) {
	this._sites = {};
	if (value) {
		this.append(value);
	}
}

SitePile.prototype = {
	get length() {
		return this._sites.length;
	},
	add: function(site) {
		if (site instanceof ProtoOrigin) {
			site = site.o;
		}
		var rv = typeof this._sites[site] == "undefined";
		this._sites[site] = true;
		return rv;
	},
	append: function(pile) {
		var sites;
		if (pile instanceof Array) {
			sites = pile;
		} else if (pile instanceof SitePile) {
			sites = Object.keys(pile._sites);
		} else {
			sites = Object.keys(pile);
		}
		var rv = 0;
		for (var i in sites) {
			rv += this.add(sites[i])?1:0;
		}
		
		return rv;
	},
	del: function(site) {
		if (site instanceof ProtoOrigin) {
			site = site.o;
		}
		var rv = typeof this._sites[site] != 'undefined';
		delete this._sites[site];
		return rv;
	},
	clear: function() {
		this._sites = {};
	},
	match: function(site) {
		if (site instanceof ProtoOrigin) {
			site = site.o;
		}
		return typeof this._sites[site] != "undefined";
	},
	each: function(cb) {
		for (var site in this._sites) {
			if (cb(site)) return;
		}
	},
	saveLocal: function(name) {
		if (!name) {
			name = this._storename;
		}
		jsonStorage.set(name, Object.keys(this._sites));
	}
};

SitePile.getLocal = function(name) {
	var rv = new SitePile(jsonStorage.get(name));
	rv._storename = name;
	return rv;
};

SitePile.sites = function() {
	return SitePile.getLocal('sites');
};


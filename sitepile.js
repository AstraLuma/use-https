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
		return this.p == 'https';
	},
	
	makeSecure: function() {
		return this.url.replace("http://", "https://");
	},
	
	inSitesList: function(sites) {
		if (sites == null) {
			sites = SitePile.getLocal('sites');
		}
		return sites.match(this);
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
		this._sites[site] = true;
		return this;
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
		for (var i in sites) {
			this.add(sites[i]);
		}
		
		return this;
	},
	del: function(site) {
		if (site instanceof ProtoOrigin) {
			site = site.o;
		}
		delete this._sites[site];
		return this;
	},
	clear: function() {
		this._sites = {};
		return this;
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
		jsonStorage.set(name, Object.keys(this._sites));
		return this;
	}
};

SitePile.getLocal = function(name) {
	return new SitePile(jsonStorage.get(name));
};


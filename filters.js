function Filter(txt) {
	this.text = txt;
	var plains = txt.match(/[^\\.*+?|\[\]\^$\(\)]+/g);
	var fk = "";
	if (plains) {
		plains.forEach(function(p) {
			if (fk.length < p.length) {
				fk = p;
			}
		});
	}
	this.fastkey = fk;
	this._re = new RegExp(txt);
	Object.freeze(this);
}

Filter.prototype = {
	match: function(txt) {
		return this._re.test(txt);
	},
	toString: function() {
		return "[Filter "+this.fastkey+" => "+this.text+" ]";
	}
};

/**
 * Efficiently stores a collection of Filters for matching.
 */
function FilterPile() {
	this.clear();
}

FilterPile.prototype = {
	/// Internal function to traverse the tree to find the storage node
	_mknode: function(key) {
		var n = {};
		n[0] = [];
		n[1] = key;
		return n;
	},
	_getnode: function(key) {
		var node = this._f,
			i = 0;
		if (!key) 
			return this._f;
		for (i = 0; i < key.length; i++) {
			var c = key[i];
			if (!node[c]) {
				node[c] = this._mknode(key.substring(0, i+1));
			}
			node = node[c];
		}
		return node;
	},
	/**
	 * Add the given Filter to the pile.
	 */
	add : function(filter) {
		var node = this._getnode(filter.fastkey);
		node[0].push(filter);
		this._size += 1;
	},
	/**
	 * Remove the given Filter from the pile.
	 */
	del: function(filter) {
		var node = this._getnode(filter.fastkey);
		var i = node[0].indexOf(filter);
		if (i != -1) {
			delete node[0][i];
			this._size -= 1;
		}
	},
	/**
	 * Removes all filters
	 */
	clear: function() {
		this._f = this._mknode("");
		this._size = 0;
	},
	/**
	 * The number of Filters in the pile.
	 */
	get length() {
		return this._size;
	},
	/**
	 * Internal recursor for each().
	 */
	_each: function(node, cb) {
		var i;
		for (i in node[0]) {
			if (cb(node[0][i])) return true;
		}
		for (i in node) {
			if (i == 0 || i == 1) continue;
			if (this._each(node[i], cb)) return true;
		}
		return false;
	},
	/**
	 * Call cb with every Filter in the pile.
	 * If cb returns true, stop iteration.
	 */
	each: function(cb) {
		this._each(this._f, cb);
	},
	/**
	 * Traverses the tree, calling cb with every filter that could match.
	 */
	_walk_child: function(subject, idx, node, cb) {
		var i, child;
		if (subject.length > idx) {
			child = node[subject[idx]];
		}
		
		if (typeof child != "undefined") {
			if (child instanceof Array) {
				for (i in child) {
					if (cb(child[i])) return true;
				}
			} else {
				if (this._walk_child(subject, idx+1, child, cb)) return true;
			}
		}
		child = node[0];
		for (i in child) {
			if (cb(child[i])) return true;
		}
		return false;
	},
	_walk: function(subject, cb) {
		var c, i, node;
		var data = this._f;
		for (i = 0; i < subject.length; i++) {
			c = subject[i];
			node = data[c];
			if (node) {
				if (this._walk_child(subject, i+1, node, cb)) return;
			}
		}
		node = data[0];
		for (i in node) {
			if (cb(node[i])) return;
		}
	},
	match: function(subject) {
		var rv = false;
		this._walk(subject, function(filter) {
			if (filter.match(subject)) {
				console.log("Matched "+subject+" against "+filter);
				rv = true;
				return true;
			}
		});
		return rv;
	},
};
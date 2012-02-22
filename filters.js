//TODO: Write a filter.
function Filter(txt) {
	this.text = txt;
	this.fastkey = null;
	this.match = (new RegExp(txt)).test;
	this._size = 0;
}

Filter.prototype = {};

/**
 * Efficiently stores a collection of Filters for matching.
 */
function FilterPile() {
	this._f = { 0: [], 1: "" };
}

FilterPile.prototype = {
	/// Internal function to traverse the tree to find the storage node
	_getnode: function(key) {
		var node = this._f,
			i = 0;
		if (!key) 
			return this._f;
		for (i = 0; i < key.length; i++) {
			var c = key[i];
			if (!node[c]) {
				node[c] = {0: [], 1: key.substring(0, i+1)};
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
	remove: function(filter) {
		var node = this._getnode(filter.fastkey);
		var i = node[0].indexOf(filter);
		if (i != -1) {
			delete node[0][i];
			this._size -= 1;
		}
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
			if (i === 0) continue;
			if (this._walk(node[i], cb)) return true;
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
	_walk: function(txt, i, cb, node) {
		if (!node)
			node = this._f;
		
		if (!key) 
			return this._f;
		for (i = 0; i < key.length; i++) {
			var c = key[i];
			if (!node[c]) {
				node[c] = {0: [], 1: key.substring(0, i+1)};
			}
			node = node[c];
		}
		return node;
	},
};
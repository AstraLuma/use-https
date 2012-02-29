Filter
======
Responsible for compiling a single filter and producing its fastkey. This is immutable.

f.fastkey
---------
If this is set, any string that matches this filter will contain this value. Used for indexing and fast tests.

By extension, any substring of fastkey also has this property.

f.match(str)
------------
Returns true if the argument matches this filter.

f.text
------
The string that produced this filter.

FilterPile
==========
Given a pile of Filter instances, organize them for efficient matching.

fp.add(f)
---------
Add a filter.

fp.remove(f)
------------
Remove a filter.

fp.replace(old, new)
--------------------
Removes filter old and inserts filter new as an atomic operation. For editing.

fp.length
---------
The number of filters currently stored here.

fp.clear()
----------
Removes all filters.

fp.matches(txt)
---------------
Returns true if at least one filter matches the argument, false otherwise.

fp.each(cb)
-----------
Execute a function for each filter in this list. If cb returns true, stop.

This is useful for iterating over the filters.

fp._walk(txt, cb)
-----------------
Internal. Call cb for each filter whose fastkey matches txt. If cb returns true, stop.

FilterPile structure
--------------------
Store filters in a trie by their fastkey. That is, fastkey of 'foo' gets stored to ['f']['o']['o'].

```javascript
fl._filters = {
    0: [/*Filters that have no fastkey*/],
    'f': {
        0: [/*Filters of fastkey = 'f'*/],
        'o': {
            0: [/*Filters of fastkey = 'fo'*/],
            ...
        },
        ...
    },
    ...
}
```

* Some heuristics should be applied; if there's only eg 5 filters, just us an array.

```javascript
/// Basic idea for how to iterate.
function _walk_child(subject, idx, node, cb) {
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
	return false;
}

/// Top level walking
function _walk(subject, cb) {
	var c, i, node;
	var data = this._f;
	for (i = 0; i < subject.length; i++) {
		c = subject[i];
		node = data[c];
		if (node) {
			if (this._walk_child(subject, i+1, node, cb)) return;
		}
	}
}
```

* I estimate that this performas at O(m*l*h^2), where m is the length of the subject, l is the length of the fastkey, and h is the Big-O of each node.
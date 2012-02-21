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
Store as a tree, where each character in the fastkey is an identifier. That is, fastkey of 'foo' gets stored to ['f']['o']['o'].

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
function _walk_child(txt, idx, node, cb) {
    var i, child;
    if (txt.length == idx) {
        child = node[0]; // Reached the end of the string
    } else {
        child = node[txt[idx]];
    }
    switch (typeof child) {
        case "undefined":
            child = node[0];
            // Fall through
        case "array":
            for (i in child) {
                if (cb(child[i])) return true;
            }
            break;
        
        case "object":
            return this._walk_child(txt, idx+1, child, cb);
    }
    return false;
}

/// Top level walking
function _walk(txt, cb) {
    var c, i, node;
    var data = this._data
    for (c in data) {
        if (c === 0) continue;
        i = txt.indexOf(c);
        if (i != -1) {
            if (this._walk_child(txt, i+1, data[c], cb)) return;
        }
    }
    node = data[0];
    for (c in node) {
        if (cb(child[i])) return;
    }
}
```

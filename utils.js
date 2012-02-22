function addMethod(obj, name, func) {
    if (!obj.prototype[name]) {
        obj.prototype[name] = func;
    }
}
addMethod(String, 'startsWith', function(str) {
	return !this.indexOf(str);
});

addMethod(String, 'contains', function(it) { 
	return this.indexOf(it) != -1;
});

addMethod(Array, 'uniquify', function() { 
	this.sort();
	for (var i = 1; i < this.length; i++) {
		if (this[i-1] == this[i]) {
			delete this[i--];
		}
	}
    return this;
});

addMethod(Array, 'contains', function(item) {
    return this.indexOf(item) != -1;
});

addMethod(Array, 'removeByValue', function(arr, val) {
	for(var i=0; i<arr.length; i++) {
		if(arr[i] == val) {
			arr.splice(i, 1);
			break;
		}
	}
});
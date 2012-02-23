function addMethod(obj, func) {
	if (!obj.__proto__[func.name]) {
		obj.__proto__[func.name] = func;
	}
}

addMethod(String, function startsWith(str) {
	return !this.indexOf(str);
});

addMethod(String, function contains(it) { 
	return this.indexOf(it) != -1;
});

/*addMethod(Array, function uniquify() { 
	this.sort();
	for (var i = 1; i < this.length; i++) {
		if (this[i-1] == this[i]) {
			delete this[i--];
		}
	}
	return this;
});

addMethod(Array, function contains(item) {
	return this.indexOf(item) != -1;
});

addMethod(Array, function removeByValue(arr, val) {
	for(var i=0; i<arr.length; i++) {
		if(arr[i] == val) {
			arr.splice(i, 1);
			break;
		}
	}
});*/

function doPotentialSite(po) {
	testUrlForHttps(po.o, function(hasHttps) {
		if (hasHttps) {
			console.log("Potential site: "+po.o);
			API['site.add']({site:po.o, status:'potential'});
		}
	});
}

var requests = {};

function onBeforeRequest(request) {
	if (!request) return {}; // on handlerBehaviorChanged() 
	
	var enabled = API['setting.get']({name:'enabled'});
	if (!enabled) return {};
	const rId = request.requestId;
	console.group("Request:", rId, request.url);
	console.log(request);
	if (!requests[rId]) {
		requests[rId] = {};
	} else if (requests[rId][request.url]) {
		console.group("Loop detected");
		console.log(request.url);
		console.log(requests[rId]);
		console.groupEnd();
		console.groupEnd();
		return {};
	}
	requests[rId][request.url] = true;
	
	var po = new ProtoOrigin(request.url);
	if (!po.hasSecure()) {
		console.log("No secure version:", po.p);
		console.groupEnd();
		return {};
	}
	
	var site = API['site.match']({site:po.o});
	
	if (!site) {
		console.log("No site found");
		if (request.tabId != -1) {
			chrome.tabs.get(request.tabId, function(tab) {
				console.log("Incognito:", tab.incognito);
				console.groupEnd();
				if (!tab.incognito) {
					doPotentialSite(po);
				}
			});
		} else {
			console.log("Not a tabbed request");
			console.groupEnd();
			window.setTimeout(function() {
				doPotentialSite(po);
			}, 0);
		}
	} else if (po.hasSecure()) {
		if (site.status == 'secure') {
			var surl = po.makeSecure();
			console.log("Secure:", surl);
			if (requests[rId][surl]) {
				console.log("Loop detected");
				console.groupEnd();
				return {};
			}
			requests[rId][surl] = true;
			console.log("Redirecting "+request.url+" to "+surl);
			console.groupEnd();
			return {redirectUrl: surl}
		} else if (site.status == 'blacklist') {
			console.log("Blacklist "+request.url);
			console.groupEnd();
		} else {
			console.log("Status:", site.status);
			console.groupEnd();
		}
	}
	return {};
}
chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, {urls: ['<all_urls>'], /*types: ['main_frame']*/}, ["blocking"]);

/*function onBeforeRedirect(details) {
	if (!details) return; // on handlerBehaviorChanged() 
	if (requests[details.requestId]) {
		requests[details.requestId][details.url] = true;
	}
}
chrome.webRequest.onBeforeRedirect.addListener(onBeforeRedirect, {urls: ['<all_urls>']});*/

function onCompleted(details) {
	if (!details) return; // on handlerBehaviorChanged() 
	delete requests[details.requestId];
}
chrome.webRequest.onCompleted.addListener(onCompleted, {urls: ['<all_urls>']});
chrome.webRequest.onErrorOccurred.addListener(onCompleted, {urls: ['<all_urls>']});

/// Call this whenever our data changes
function redirectChanged() {
	chrome.webRequest.handlerBehaviorChanged(onBeforeRequest);
}
localConnect('*', redirectChanged);

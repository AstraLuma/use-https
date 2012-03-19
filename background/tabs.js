function UpdateAllTabs(site) {
	var qi;
	if (site && site.site) { // If it's an API event
		site = site.site;
	}
	if (typeof site == 'string') {
		qi = {url: '*://'+site+'/*'};
	} else {
		qi = {};
	}
	chrome.tabs.query(qi, function(tabs) {
		tabs.forEach(function(tab) {
			UpdateTab(tab.id, tab.url);
		});
	});
}
localConnect('*', UpdateAllTabs);

function UpdateTab(tabId, url) {
	var po = new ProtoOrigin(url);
	var enabled = API['setting.get']({name:'enabled'});
	var site = API['site.match']({site:po.o});
	
	console.groupCollapsed("UpdateTab", tabId, url);
	console.log("Enabled:", enabled);
	console.log(site);
	
	if (!site) {
		console.groupEnd();
		return;
	}
	
	// Blacklist: Show with pa_blacklist.html
	// Secure, https: Show with pa_secured.html
	// Secure, http: Show with pa_broken.html
	// Potential: Show with pa_potential.html
	// Default: hide
	// All cases: Gray if disabled
	
	 // For the future: Different states have different icons
//	var icon = 'chrome://extension-icon/'+chrome.i18n.getMessage('@@extension_id')+'/16/2';
	var icon = 'lock';
	const q = '?site='+po.o+'&tabid='+tabId;
	if (site.status == 'blacklist') {
		console.log("Blacklist tab", po);
		chrome.pageAction.setPopup({tabId: tabId, popup: 'pa_blacklisted.html'+q});
		chrome.pageAction.setTitle({tabId: tabId, title: "Blacklisted"});
		chrome.pageAction.show(tabId);
		icon = 'blacklist';
	} else if (site.status == 'secure' && po.isSecure()) {
		console.log("Secured tab", po);
		chrome.pageAction.setPopup({tabId: tabId, popup: 'pa_secured.html'+q});
		chrome.pageAction.setTitle({tabId: tabId, title: "Secured"});
		chrome.pageAction.show(tabId);
		icon = 'secure';
	} else if (site.status == 'secure' && !po.isSecure()) {
		console.log("Broken tab", po);
		chrome.pageAction.setPopup({tabId: tabId, popup: 'pa_broken.html'+q});
		chrome.pageAction.setTitle({tabId: tabId, title: "Security Broken"});
		chrome.pageAction.show(tabId);
	} else if (site.status == 'potential') {
		console.log("Potential tab", po);
		chrome.pageAction.setPopup({tabId: tabId, popup: 'pa_potential.html'+q});
		chrome.pageAction.setTitle({tabId: tabId, title: "Potential"});
		chrome.pageAction.show(tabId);
		icon = 'potential';
	} else {
		chrome.pageAction.hide(tabId);
	}
	if (!enabled) {
		icon = 'gray';
	}
	chrome.pageAction.setIcon({tabId: tabId, path: chrome.extension.getURL(icon+'-128.png')});
	console.groupEnd();
}

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
	if (info.url || info.status == "loading") {
		UpdateTab(tabId, tab.url);
	}
});


function contains(items, item) {
	
	for (i in items) {

		if (items[i] == item) {

			return true;
		}
	}
	return false;
}

function removeByValue(arr, val) {
	
	for(var i=0; i<arr.length; i++) {

		if(arr[i] == val) {

			arr.splice(i, 1);
			break;
		}
	}
}

function clearUl() {
	
	var div = document.getElementById('sites');
	var ul = div.getElementsByTagName('ul')[0];
	var li = ul.getElementsByTagName('li');
	var len = li.length;

	while (len--) {

		ul.removeChild(li[len]);
	}
}

function viewSites() {
	
	clearUl();
	
	var sites = JSON.parse(localStorage.getItem('sites'));
	var dnr = chrome.extension.getBackgroundPage().doNotRedirect;
	for(var i in sites.sort()) {
		
		var container = document.getElementById('sitesList');
		var new_element = document.createElement('li');
		new_element.innerHTML = " <input type='checkbox' name='" + sites[i] + "' value='" + sites[i] + "' />&nbsp;" + sites[i];
		if (dnr.indexOf(sites[i]) != -1) {
			new_element.className = "blacklisted";
		}
		container.insertBefore(new_element, container.firstChild);
	}
}

function saveSite() {

	// Get sites from localStorage
	var sites = JSON.parse(localStorage.getItem('sites'));
	
	// Get entered url
	var site = document.getElementById("siteName").value;
	document.getElementById("siteName").value = "";
	
	if(null == site || site.length == 0) {

		return;
	}
	
	// Check if we already have the new site
	if(!contains(sites, site)) {
		
		// Add the site and save it back to localStorage
		sites[sites.length] =  site;
		localStorage.removeItem('sites');
		localStorage['sites'] = JSON.stringify(sites);
		redirectChanged();
		document.getElementById('message').innerHTML = "Added " + site + " successfully";
	}
	else {

		document.getElementById('message').innerHTML = site + " is already protected";
	}
	
	viewSites();
}

function deleteSites() {
	
	var storedSites = JSON.parse(localStorage.getItem('sites'));
	var removedSites = [];
	var sites = document.getElementById('sitesList');

	for(var i in sites.childNodes) {

		var site = sites.childNodes[i];

		if("LI" == site.nodeName) {

			if(site.childNodes[1].checked) {

				var siteName = site.childNodes[1].name;
				console.log(siteName);
				removeByValue(storedSites, siteName);
				console.log(storedSites);
				removedSites[removedSites.length] = siteName;
			}
		}
	}
	
	localStorage.removeItem('sites');
	localStorage['sites'] = JSON.stringify(storedSites);
	redirectChanged();
	
	if(removedSites.length > 0 ) {

		document.getElementById('message').innerHTML = "Removed the following site(s): " + removedSites;
	}
	
	viewSites();
}

function init() {
	
	viewSites();
	
	// Initialize sites enabled flag
	var isDisabled = localStorage.getItem('is-disabled');
	
	if(null == isDisabled || "false" == isDisabled) {
		
		localStorage['is-disabled'] = "false";
		document.getElementById('is-disabled-input').checked = false;
	}
	else {
	
		document.getElementById('is-disabled-input').checked = true;
	}
	document.getElementById('potsites').innerHTML = chrome.extension.getBackgroundPage().potentialSites.sort().join(", ");
	document.getElementById('dnr').innerHTML = chrome.extension.getBackgroundPage().doNotRedirect.sort().join(", ");
}

function isDisabledHandler() {
	
	var isDisabled = document.getElementById('is-disabled-input').checked;
	
	if(true == isDisabled) {
		
		localStorage['is-disabled'] = "true";
		document.getElementById('message').innerHTML = "Disabled 'Use HTTPS' for all site(s)";
	}
	else {
		
		localStorage['is-disabled'] = "false";
		document.getElementById('message').innerHTML = "Enabled 'Use HTTPS' for all site(s)";
	}
	redirectChanged();
}

function enablePageActionHander() {
	
	var enablePageAction = document.getElementById('enable-page-action-input').checked;
	
	if(true == enablePageAction) {
		
		localStorage['enable-page-action'] = "true";
		document.getElementById('message').innerHTML = "Enabled show 'Use HTTPS' icon in address bar";
	}
	else {
		
		localStorage['enable-page-action'] = "false";
		document.getElementById('message').innerHTML = "Disabled show 'Use HTTPS' icon in address bar";
	}
}

function testUrlForHttps() {
	
	var url = document.getElementById("siteName").value;
	
	if(null == url || url.length == 0) {

		return;
	}
	
	document.getElementById('message').innerHTML = "Testing if [ https://" + url +" ] supports HTTPS: ";
	
	chrome.extension.getBackgroundPage().testUrlForHttps(url, function(hasHttps) {
		if (hasHttps) {
			document.getElementById('message').innerHTML += "YES";
		}
		else {
			document.getElementById('message').innerHTML += "NO";
		}
	});
}

function redirectChanged() {
	chrome.extension.getBackgroundPage().redirectChanged();
}



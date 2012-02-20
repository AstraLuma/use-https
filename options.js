function contains(items, item) {
	return items.indexOf(item) != -1;
}

function removeByValue(arr, val) {
	
	for(var i=0; i<arr.length; i++) {

		if(arr[i] == val) {

			arr.splice(i, 1);
			break;
		}
	}
}

function redirectChanged() {
	chrome.extension.getBackgroundPage().redirectChanged();
}

function showMessage(msg) {
	$('#message').text(msg);
}

function appendMessage(msg) {
	$('#message').text($('#message').text() + msg);
}

function viewSites() {
	
	var sul = $('#sites');
	sul.empty();
	
	var sites = jsonStorage.get('sites');
	var dnr = chrome.extension.getBackgroundPage().doNotRedirect;
	for(var i in sites.sort()) {
		//XXX: Use a templating thing?
		var new_element = $("<li><input type='checkbox' name='" + sites[i] + "' value='" + sites[i] + "' />&nbsp;" + sites[i]+"</li>");;
		if (dnr.indexOf(sites[i]) != -1) {
			new_element.addClass("blacklisted");
		}
		sul.append(new_element);
	}
	
	$('#potsites').empty();
	var potentialSites = chrome.extension.getBackgroundPage().potentialSites;
	for (i in potentialSites) {
		var site = potentialSites[i];
		$('#potsites').append($('<span></span>').text(site).click(function() {
			$('#siteName').val($(this).text());
			$('#save-site').click();
		}));
		$('#potsites').append(' ');
	}
	
	$('#dnr').text(chrome.extension.getBackgroundPage().doNotRedirect.sort().join(", "));
}

function init() {
	
	viewSites();
	
	// Initialize sites enabled flag
	$('#is-disabled-input').val(jsonStorage.get('is-disabled'));
}
$(init);

$(function() {
$('#save-site').click(function() {

	// Get sites from localStorage
	var sites = jsonStorage.get('sites');
	
	// Get entered url
	var site = $("#siteName").val();
	$("#siteName").val("");
	
	if(null == site || site.length == 0) {
		return;
	}
	
	// Check if we already have the new site
	if(!contains(sites, site)) {
		// Add the site and save it back to localStorage
		sites.push(site);
		jsonStorage.set('sites', sites);
		redirectChanged();
		showMessage("Added " + site + " successfully");
	}
	else {
		showMessage(site + " is already protected");
	}
	
	removeByValue(chrome.extension.getBackgroundPage().potentialSites, site);
	
	viewSites();
});

$('#delete-sites').click(function() {
	
	var storedSites = jsonStorage.get('sites');
	var removedSites = [];
	
	$('#sites input').each(function(i) {
		if(this.checked) {
			var siteName = this.name;
			console.log(siteName);
			removeByValue(storedSites, siteName);
			console.log(storedSites);
			removedSites.push(siteName);
		}
	});
	
	jsonStorage.set('sites', storedSites);
	redirectChanged();
	
	if(removedSites.length > 0 ) {
		showMessage("Removed the following site(s): " + removedSites);
	}
	
	viewSites();
});

$('#is-disabled-input').click(function() {
	
	var isDisabled = $('#is-disabled-input').val();
	
	if(isDisabled) {
		
		jsonStorage.set('is-disabled', true);
		showMessage("Disabled 'Use HTTPS' for all site(s)");
	} else {
		jsonStorage.set('is-disabled', false);
		showMessage("Enabled 'Use HTTPS' for all site(s)");
	}
	redirectChanged();
});

$('#enable-page-action-input').click(function() {
	
	var enablePageAction = $('#enable-page-action-input').val();
	
	if(enablePageAction) {
		
		jsonStorage.set('enable-page-action', true);
		showMessage("Enabled show 'Use HTTPS' icon in address bar");
	}
	else {
		
		jsonStorage.set('enable-page-action', false);
		showMessage("Disabled show 'Use HTTPS' icon in address bar");
	}
});

$('#clear-lists').click(function() {
	chrome.extension.getBackgroundPage().doNotRedirect = [];
	chrome.extension.getBackgroundPage().potentialSites = [];
	init();
});

$('#test-url-for-https').click(function() {
	
	var url = $("#siteName").val();
	
	if(null == url || url.length == 0) {
		return;
	}
	
	showMessage("Testing if [ https://" + url +" ] supports HTTPS: ");
	
	chrome.extension.getBackgroundPage().testUrlForHttps(url, function(hasHttps) {
		if (hasHttps) {
			appendMessage("YES");
		}
		else {
			appendMessage("NO");
		}
	});
});
});

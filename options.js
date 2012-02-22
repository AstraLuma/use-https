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
	
	var sites = SitePile.getLocal('sites');
	var dnr = chrome.extension.getBackgroundPage().doNotRedirect;
	sites.each(function(site) {
		//XXX: Use a templating thing?
		var new_element = $("<li><input type='checkbox' name='" + site + "' value='" + site + "' />&nbsp;" + site+"</li>");
		if (dnr.match(site)) {
			new_element.addClass("blacklisted");
		}
		sul.append(new_element);
	});
	
	$('#potsites').empty();
	var potentialSites = chrome.extension.getBackgroundPage().potentialSites;
	potentialSites.each(function(site) {
		$('#potsites').append($('<span title="Add"></span>').text(site).click(function() {
			$('#siteName').val($(this).text());
			$('#save-site').click();
		}));
		$('#potsites').append(' ');
	});
	
	$('#dnr').empty();
	var doNotRedirect = chrome.extension.getBackgroundPage().doNotRedirect;
	doNotRedirect.each(function(site) {
		$('#dnr').append($('<span title="Remove"></span>').text(site).click(function() {
			chrome.extension.getBackgroundPage().doNotRedirect.del($(this).text());
			this.parentNode.removeChild(this);
			viewSites();
		}));
		$('#dnr').append(' ');
	});
}

function init() {
	
	viewSites();
	
	// Initialize sites enabled flag
	if (jsonStorage.get('is-disabled'))
		$('#is-disabled-input').attr('checked', true);
	if (jsonStorage.get('enable-page-action'))
		$('#enable-page-action-input').attr('checked', true);
}
$(init);

$(function() {
$('#save-site').click(function() {

	// Get sites from localStorage
	var sites = SitePile.getLocal('sites');
	
	// Get entered url
	var site = $("#siteName").val();
	$("#siteName").val("");
	
	if(null == site || site.length == 0) {
		return;
	}
	
	// Check if we already have the new site
	if(!sites.match(site)) {
		// Add the site and save it back to localStorage
		sites.add(site);
		sites.saveLocal('sites');
		redirectChanged();
		showMessage("Added " + site + " successfully");
	} else {
		showMessage(site + " is already protected");
	}
	
	chrome.extension.getBackgroundPage().potentialSites.del(site);
	
	viewSites();
});

$('#delete-sites').click(function() {
	
	var storedSites = SitePile.getLocal('sites');
	var removedSites = [];
	
	$('#sites input').each(function(i) {
		if(this.checked) {
			var siteName = this.name;
			console.log(siteName);
			storedSites.del(siteName);
			console.log(storedSites);
			removedSites.push(siteName);
		}
	});
	
	storedSites.saveLocal('sites');
	redirectChanged();
	
	if(removedSites.length > 0 ) {
		showMessage("Removed the following site(s): " + removedSites);
	}
	
	viewSites();
});

$('#is-disabled-input').click(function() {
	
	var isDisabled = $('#is-disabled-input').is(':checked');
	
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
	
	var enablePageAction = $('#enable-page-action-input').is(':checked');
	
	if(enablePageAction) {
		jsonStorage.set('enable-page-action', true);
		showMessage("Enabled show 'Use HTTPS' icon in address bar");
	} else {
		jsonStorage.set('enable-page-action', false);
		showMessage("Disabled show 'Use HTTPS' icon in address bar");
	}
});

$('#clear-lists').click(function() {
	chrome.extension.getBackgroundPage().doNotRedirect.clear();
	chrome.extension.getBackgroundPage().potentialSites.clear();
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

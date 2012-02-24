function redirectChanged() {
	chrome.extension.getBackgroundPage().redirectChanged();
}

function showMessage(msg) {
	$('#message').text(msg);
}

function appendMessage(msg) {
	$('#message').text($('#message').text() + msg);
}

function mkSiteItem(site) {
		//XXX: Use a templating thing?
	var new_element = $("<li><input type='checkbox' name='" + site + "' value='" + site + "' />&nbsp;" + site+"</li>");
	UseHttps.blacklist.match(site, (function(yup) {
		if (yup)
			this.addClass("blacklisted");
	}).bind(new_element));
	return new_element;
}

UseHttps.sitelist.connect('add', function(args) {
	$('#sites').append(mkSiteItem(args.site));
});

UseHttps.sitelist.connect('del', function(args) {
	$('#sites li input').filter(function(i) {
		return $(this).attr('name') == args.site;
	}).parent().remove();
});

UseHttps.sitelist.connect('clear', function(args) {
	$('#sites').empty();
});


function addPotentialItem(site) {
	$('#potsites').append($('<span title="Add"></span>').text(site).click(function() {
		$('#siteName').val($(this).text());
		$('#save-site').click();
	}));
	$('#potsites').append(' ');
}

UseHttps.potentials.connect('add', function(args) {
	addPotentialItem(args.site);
});

UseHttps.potentials.connect('del', function(args) {
	$('#potsites span').filter(function() { 
		return $(this).text() == args.site;
	}).remove();
});

UseHttps.potentials.connect('clear', function(args) {
	$('#potsites').empty();
});

function addDnrItem(site) {
	$('#dnr').append($('<span title="Remove"></span>').text(site).click(function() {
		chrome.extension.getBackgroundPage().doNotRedirect.del($(this).text());
		this.parentNode.removeChild(this);
		viewSites();
	}));
	$('#dnr').append(' ');
}

UseHttps.blacklist.connect('add', function(args) {
	addDnrItem(args.site);
});

UseHttps.blacklist.connect('del', function(args) {
	$('#dnr span').filter(function() { 
		return $(this).text() == args.site;
	}).remove();
});

UseHttps.blacklist.connect('clear', function(args) {
	$('#dnr').empty();
});

function viewSites() {
	var sul = $('#sites');
	sul.empty();
	
	UseHttps.sitelist.each(function(site) {
		sul.append(mkSiteItem(site));
	});
	
	$('#potsites').empty();
	UseHttps.potentials.each(addPotentialItem);
	
	$('#dnr').empty();
	UseHttps.blacklist.each(addDnrItem);
}

UseHttps.enabled.connect('set', function(args) {
	$('#is-disabled-input').attr('checked', !args.value);
});

function init() {
	
	viewSites();
	
	// Initialize sites enabled flag
	UseHttps.enabled.get(function(yup) {
		$('#is-disabled-input').attr('checked', !yup);
	});
}
$(init);

$(function() {
$('#save-site').click(function() {
	// Get entered url
	var site = $("#siteName").val();
	$("#siteName").val("");
	
	if(null == site || site.length == 0) {
		return;
	}
	
	// Check if we already have the new site
	UseHttps.sitelist.add(site, function(added) {
		if (added) {
			showMessage("Added " + site + " successfully");
		} else {
			showMessage(site + " is already protected");
		}
	});
	
	UseHttps.potentials.del(site);
});

$('#delete-sites').click(function() {
	
	var removedSites = [];
	
	$('#sites input:checked').each(function(i) {
		var siteName = this.name;
		UseHttps.sitelist.del(siteName);
		removedSites.push(siteName);
	});
	
	if(removedSites.length > 0 ) {
		showMessage("Removed the following site(s): " + removedSites);
	}
});

$('#is-disabled-input').click(function() {
	
	var isDisabled = $('#is-disabled-input').is(':checked');
	
	UseHttps.enabled.set(!isDisabled);
	if(isDisabled) {
		showMessage("Disabled 'Use HTTPS' for all site(s)");
	} else {
		showMessage("Enabled 'Use HTTPS' for all site(s)");
	}
});

$('#clear-lists').click(function() {
	UseHttps.clearAll();
});

$('#test-url-for-https').click(function() {
	
	var url = $("#siteName").val();
	
	if(null == url || url.length == 0) {
		return;
	}
	
	showMessage("Testing if [ " + url +" ] supports HTTPS: ");
	
	UseHttps.haspotential(url, function(hasHttps) {
		if (hasHttps) {
			appendMessage("YES");
		}
		else {
			appendMessage("NO");
		}
	});
});
});

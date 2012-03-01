//TODO: Add some indicator of working, based on a semaphore of tasks in progress
function showMessage(msg) {
	$('#message').text(msg);
}

function appendMessage(msg) {
	$('#message').text($('#message').text() + msg);
}

function mkSiteItem(site) {
	//XXX: Use a templating thing?
	var row = $("<tr></tr>").attr('data-site', site.site).attr('data-status', site.status)
		.append($("<th><input type='checkbox'></th>"))
		.append($("<th></th>").text(site.site))
		.append($("<td class='secure' title='Secured'><img src='icon-secure.png'></td>"))
		.append($("<td class='potential' title='Potential'><img src='icon-potential.png'></td>"))
		.append($("<td class='blacklist' title='Blacklisted'><img src='icon-blacklist.png'></td>"))
		.append($("<td class='delete' title='Delete Site'><img src='icon-delete.png'></td>"))
		;
	$('td', row).click(function(evt) {
		var site = this.parentNode.attributes['data-site'].nodeValue;
		if (this.className == 'delete') {
			UseHttps.site.del(site);
		} else if (this.className) {
			UseHttps.site.set(site, {status: this.className});
		}
	});
	return row;
}

UseHttps.site.connect('add', function(args) {
	//TODO: Sorting
	$('#sites tbody').append(mkSiteItem(args));
});

UseHttps.site.connect('set', function(args) {
	$('#sites tbody tr').filter(function(i) {
		return $(this).attr('data-site') == args.site;
	}).attr('data-status', args.status);
});

UseHttps.site.connect('del', function(args) {
	$('#sites tbody tr').filter(function(i) {
		return $(this).attr('data-site') == args.site;
	}).remove();
});

function viewSites() {
	var sul = $('#sites tbody');
	
	UseHttps.site.each(function(site) {
		sul.append(mkSiteItem(site));
	});
}

UseHttps.setting.connect('set', function(args) {
	if (args.name == 'enabled') {
		$('#is-disabled-input').attr('checked', !args.value);
	}
});

$(function() {
	viewSites();
	
	// Initialize sites enabled flag
	UseHttps.setting.get('enabled', function(yup) {
		$('#is-disabled-input').attr('checked', !yup);
	});
});

$(function() {
$('#save-site').click(function() {
	// Get entered url
	var site = $("#siteName").val();
	$("#siteName").val("");
	
	if(null == site || site.length == 0) {
		return;
	}
	
	// Check if we already have the new site
	UseHttps.site.add(site, {status:'secure'}, function(added) {
		if (added) {
			showMessage("Added " + site + " successfully");
		} else {
			showMessage(site + " is already protected");
		}
	});
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

$('#is-disabled-input').click(function() {
	var isDisabled = $('#is-disabled-input').is(':checked');
	UseHttps.setting.set('enabled', !isDisabled);
	if(isDisabled) {
		showMessage("Disabled 'Use HTTPS' for all site(s)");
	} else {
		showMessage("Enabled 'Use HTTPS' for all site(s)");
	}
});
});

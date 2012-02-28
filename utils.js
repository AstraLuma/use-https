function isSubDomain(sub, dom) {
	if (sub == dom) return true;
	if (dom != sub.substr(-dom.length)) return false;
	return sub[dom.length] == '.';
}
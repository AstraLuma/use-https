var oGetVars = new (function (sSearch) {  
  var rNull = /^\s*$/, rBool = /^(true|false)$/i;  
  function buildValue(sValue) {  
    if (rNull.test(sValue)) { return null; }  
    if (rBool.test(sValue)) { return sValue.toLowerCase() === "true"; }  
    if (isFinite(sValue)) { return parseFloat(sValue); }  
    if (isFinite(Date.parse(sValue))) { return new Date(sValue); }  
    return sValue;  
  }  
  if (sSearch.length > 1) {  
    for (var aItKey, nKeyId = 0, aCouples = sSearch.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {  
      aItKey = aCouples[nKeyId].split("=");  
      this[unescape(aItKey[0])] = aItKey.length > 1 ? buildValue(unescape(aItKey[1])) : null;  
    }  
  }  
})(window.location.search); 

const SITE = oGetVars.site;
const TABID = oGetVars.tabid;

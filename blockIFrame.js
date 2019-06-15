var DEBUG = 0;

var LOG = true;

var _whitelistIFrames = {};
var _blocklistIFrames = {};//["facebook.com","hotjar.com","spolecznosci.net", "onesignal.com", "gemius.pl"];
var urls = [];
var filter = {"urls": urls, "types": ["sub_frame"]};


var table_blocklist_name = "blocklist";
var table_whitelist_name = "whitelist";

//This function is being called each time webpage is loaded
var beforeSendHeader = function (info) {
	
	var _mainFrame = info.initiator;
	
	var _url = info.url;
	
	var _mainFrameHostname = new URL(_mainFrame).hostname;
	var _iFrameHostname = new URL(_url).hostname;
	
    if (DEBUG>=7) alert(info.frameId + " url: " + _iFrameHostname);
	//Matchowac regexem
	for (var site in _blocklistIFrames)
	{
		let re1 = new RegExp(".*"+_blocklistIFrames[site]+".*");
		if (_iFrameHostname.match(re1))
		{
			if(DEBUG>=4) alert("This iFrame: "+_iFrameHostname+" will be blocked!");
			if(DEBUG>=3)
			{
				var stringlist = [];
				var debug_list = {};
				chrome.storage.local.get(null, function (items) {
					debug_list = (table_blocklist_name in items) ? items[table_blocklist_name] : {}; 
		
					for (var domain in debug_list) { if(domain != null && domain != "") stringlist.push( domain ); }
				
					alert("List of iframes to block: "+stringlist);
				});
			}
			return {"cancel" : true};
		}
	}
	for (var site in _whitelistIFrames)
	{
		let re1 = new RegExp(".*"+_whitelistIFrames[site]+".*");
		if (_iFrameHostname.match(re1))
		{
			if(DEBUG>=6) alert("This iFrame: "+_iFrameHostname+" will be shown!");
			return;
		}
	}
	_iFrameHostname = _iFrameHostname.replace(/www./i,"");
	
	//Its completely new: POPUP asking?
	if(window.confirm("Add this iframe:\n" + _iFrameHostname +"\nto blocklist <OK> or whitelist <Cancel>?")){
		_blocklistIFrames[_iFrameHostname] =_iFrameHostname;
		chrome.storage.local.set({[table_blocklist_name]: _blocklistIFrames}, function () { });
		return {"cancel" : true};
	} else {
		_whitelistIFrames[_iFrameHostname] = _iFrameHostname;
		chrome.storage.local.set({[table_whitelist_name]: _whitelistIFrames}, function () { });
	}
	
	if(DEBUG>=4)
	{
		var stringlist = [];
		for (var domain in _blocklistIFrames) { if(domain != null && domain != "") stringlist.push( domain ); }
	
		alert("Blocked iframes: "+stringlist);
	}
	
};

//TODO: Strona gdzie mozna dodawac ramki do blokowania
chrome.webRequest.onBeforeSendHeaders.addListener(beforeSendHeader, filter, ["blocking"]);

//TODO: Saving to the memory
//This function will be called when saving to the memory
var updateListener = function (callback) {
	//Updated arrays with frames
	chrome.storage.local.get(null, function (items) {
		_blocklistIFrames = (table_blocklist_name in items) ? items[table_blocklist_name] : {};
		_whitelistIFrameslistIFrames = (table_whitelist_name in items) ? items[table_whitelist_name] : {};
    
		if(DEBUG>=5)
		{
			var stringlist = [];
			for (var domain in _blocklistIFrames) { if(domain != null && domain != "") stringlist.push( domain ); }
		
			alert("Blocked iframes: "+stringlist);
		}
		/* I am not sure if these urls are necessary here - its global now */
		var urls = [];
		for (var domain in _blocklistIFrames) { if(domain != null && domain != "") urls.push( domain ); }
		urls = [];
		for (var domain in _whitelistIFrames) { if(domain != null && domain != "") urls.push( domain ); }
		
		//Removing all listeners and creating new one with global var filter
		chrome.webRequest.onBeforeSendHeaders.removeListener(beforeSendHeader);
		/*if (urls.length)*/ 
		chrome.webRequest.onBeforeSendHeaders.addListener(beforeSendHeader, filter, ["blocking"]);
		callback(true);
  });
};

//ANd its called here when new listener is added
updateListener(function () {});
chrome.storage.onChanged.addListener(function () {updateListener(function () {})});
  
//var anotherContextMenuId = chrome.contextMenus.create({
//	"contexts": ["all"], "type":"normal",
//	"title": "Block all iframes :)",
//	"onclick": function(tab)
//		{
//			var listOfFrames = document.getElementsByTagName("iframe");
//
//			while (listOfFrames /*exists*/ && (listOfFrames.length > 0) ) 
//			{
//			  try 
//			  {
//				for (var iterator in listOfFrames) 
//				{
//				  listOfFrames[iterator]                  // get the next frame
//				  .parentNode                             // find the parent 
//				  .removeChild( listOfFrames[iterator] ); // remove the frame from the parent
//				}
//			  }catch(e){                                  // we found a frame that no longer exists
//				console.error(e);
//			  }
//			  var listOfFrames = 
//				 document.getElementsByTagName("iframe"); // update the list regardless of errors in case we missed one
//		}                                             // loop again unless the condition is satisfied
//		}  
//	});

//Variables connected with html form
var blocklistName = "blocklist";
var whitelistName = "whitelist";
var inputField = "domainBlockInput";
var inputFieldWhite = "domainWhiteInput";

var pageAddress = "iframe_address";
var blockpage_address_accept_function = "addDomainBlock";
var whitepage_address_accept_function = "addDomainWhite";

var checkboxBlockAll = "nopopupAutomaticAdd";
var checkboxIgnoreAll = "nopopupDonotAdd";

//Creates object which contains page and iframes that will be blocked
function DomainiFrameList( ) {
    this.webpage = "";
    this.iframeList = [];
}

/*
2 lists:

when webpage request check iframe and then 
local (more specific) rule beats general rule 
ex. f.com is in block all iframes but for g.com it is in white list 
then it will be allowed 
  
*/

var _blocklist = {};
var _whitelist = {};

//This is main object containing other empty objects
var lists = { [blocklistName] : _blocklist, [whitelistName]: _whitelist };

var saveOptions = function (o) {chrome.storage.local.set(o, function () {})};

chrome.storage.onChanged.addListener(function (e) {
	if (blocklistName in e) fill_blocked();
	else if (whitelistName in e) fill_white(); });

var add_to_block = function(element){
	//_blocklist[element] = element;
	lists[blocklistName][element] = element;
	chrome.storage.local.set({[blocklistName]: lists[blocklistName] }, function () {});
};

var add_to_white = function(element){
	//_whitelist[element] = element;
	lists[whitelistName][element] = element;
	chrome.storage.local.set( {[whitelistName]: lists[whitelistName]} );
}; 

var addDomain = function (input, addFunction ) {
  var domain = document.getElementById(input).value;
  domain = domain.split(" ");
  domain.forEach(adding);
  function adding(domain){
	  if (domain) {
		domain = domain.replace("https://", '').replace("http://", '').replace("ftp://", '');
		var pageUrl = "https://" + domain;
		var hostname = new URL(pageUrl).hostname;
		//This function adds to correct list
		addFunction(hostname);
	  }
  }
};

var addDomainBlock = function () {
	addDomain(inputField, add_to_block);
};

var addDomainWhite = function () {
	addDomain(inputFieldWhite, add_to_white);
};

var fill = function (listName, input) {
	
	chrome.storage.local.get(null, function (storage) {
    var count = 1;
    document.getElementById(input).focus();
    document.getElementById(input).value = '';
    var tbody = document.getElementById(listName);
    lists[listName] = (listName in storage) ? storage[listName] : {};
    tbody.textContent = '';
    /*  */
    for (var domain in lists[listName]) {
      var item = document.createElement('tr');
      var close = document.createElement('td');
      var number = document.createElement('td');
      var webpage = document.createElement('td');
      var blocked = document.createElement('td');
      /*  */
      close.setAttribute('type', 'close');
      number.setAttribute('type', 'number');
      blocked.setAttribute('type', pageAddress);
      webpage.setAttribute('type', pageAddress);
      /*  */
      number.textContent = count;
      blocked.textContent = "*://" + domain + "/*";
      /*  */
      close.setAttribute(pageAddress, domain);
      close.addEventListener("click", function (e) {
        var _blocked = e.target.getAttribute(pageAddress);
        delete lists[listName][_blocked];
        saveOptions({[listName]: lists[listName]});
      });
      /*  */
      item.appendChild(number);
      item.appendChild(webpage);
      item.appendChild(blocked);
      item.appendChild(close);
      tbody.appendChild(item);
      count++;
    }
  });
};

//Fills values in the options html for block list
var fill_blocked = function () {
	fill( blocklistName, inputField );
	//_blocked = lists[blocklistName];
};

//Fills values in the options html for white list
var fill_white = function () {
	fill( whitelistName, inputFieldWhite);
	//_whitelist = lists[whitelistName];
};

var fill_both = function () {
	fill_white();
	fill_blocked();
};

var load = function () {
  fill_both();
  document.getElementById(blockpage_address_accept_function).addEventListener("click", addDomainBlock);
  document.getElementById(whitepage_address_accept_function).addEventListener("click", addDomainWhite);
  document.getElementById(inputField).addEventListener("keypress", function (e) {if ((e.which || e.keyCode) === 13) addDomainBlock()});
  document.getElementById(inputFieldWhite).addEventListener("keypress", function (e) {if ((e.which || e.keyCode) === 13) addDomainWhite()});
  
  document.getElementById("reload").addEventListener("click", function () {document.location.reload()});
  document.getElementById(checkboxBlockAll).addEventListener("click", function (e) {saveOptions({[checkboxBlockAll]: e.target.checked})});
  document.getElementById(checkboxIgnoreAll).addEventListener("click", function (e) {saveOptions({[checkboxIgnoreAll]: e.target.checked})});
  /*  */
  chrome.storage.local.get(null, function (storage) {
    var support = (checkboxBlockAll in storage) ? storage[checkboxBlockAll] : true;
    var notifications = (checkboxIgnoreAll in storage) ? storage[checkboxIgnoreAll] : true;
    document.getElementById(checkboxBlockAll).checked = support;
    document.getElementById(checkboxIgnoreAll).checked = notifications;
  });
  /*  */
  window.removeEventListener('load', load, false);
};

window.addEventListener('load', load, false);


//KOSZ:
//
//
//var fill_old = function () {
//  chrome.storage.local.get(null, function (storage) {
//    var count = 1;
//    document.getElementById(inputField).focus();
//    document.getElementById(inputField).value = '';
//    var tbody = document.getElementById(blocklistName);
//    _blocklist = (blocklistName in storage) ? storage[blocklistName] : {};
//    tbody.textContent = '';
//    /*  */
//    for (var domain in _blocklist) {
//      var item = document.createElement('tr');
//      var close = document.createElement('td');
//      var number = document.createElement('td');
//      var blocked = document.createElement('td');
//      /*  */
//      close.setAttribute('type', 'close');
//      number.setAttribute('type', 'number');
//      blocked.setAttribute('type', blockedPageAddress);
//      /*  */
//      number.textContent = count;
//      blocked.textContent = "*://" + domain + "/*";
//      /*  */
//      close.setAttribute(blockedPageAddress, domain);
//      close.addEventListener("click", function (e) {
//        var _blocked = e.target.getAttribute(blockedPageAddress);
//        delete _blocklist[_blocked];
//        saveOptions({[blocklistName]: _blocklist});
//      });
//      /*  */
//      item.appendChild(number);
//      item.appendChild(blocked);
//      item.appendChild(close);
//      tbody.appendChild(item);
//      count++;
//    }
//  });
//};

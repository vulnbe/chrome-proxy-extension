var storageProxyEnabled = 'ProxyEnabled';
var storageProxyIP = 'ProxyIP';
var storageProxyPort = 'ProxyPort';
var proxyEnabled = false;
var checkbox;
var proxyip;
var proxyport;

var proxyConfig = {
  mode: "fixed_servers",
  rules: {
    singleProxy: {
      host: null,
      port: null
    },
    bypassList: []
  }
};
function changeProxyState() {
  saveProxyState();
  
  if(proxyEnabled){
    chrome.proxy.settings.set({
      value: proxyConfig, scope: 'incognito_session_only'
    },
    function() {});
  }
  else{
    chrome.proxy.settings.set({
      value: {mode: 'direct'}, scope: 'incognito_session_only'
    },
    function() {});
  }
}
function getProxyState(callback) {
  if(chrome.extension.inIncognitoContext){
    chrome.storage.sync.get([storageProxyEnabled, storageProxyIP, storageProxyPort], (items) => {
      callback(chrome.runtime.lastError ? null : items[storageProxyEnabled], items[storageProxyIP], items[storageProxyPort]);
    });
  }
}
function saveProxyState() {
  if(chrome.extension.inIncognitoContext){
    var items = {};
    items[storageProxyEnabled] = proxyEnabled;
    items[storageProxyIP] = proxyConfig.rules.singleProxy.host;
    items[storageProxyPort] = proxyConfig.rules.singleProxy.port;
    chrome.storage.sync.set(items);
  }
}
function processFormEvent() {
  if(chrome.extension.inIncognitoContext){
    proxyEnabled = checkbox.checked;
    proxyConfig.rules.singleProxy.host = proxyip.value;
    proxyConfig.rules.singleProxy.port = parseInt(proxyport.value);
    changeProxyState();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkbox = document.getElementById('useproxy');
  proxyip = document.getElementById('proxyip');
  proxyport = document.getElementById('proxyport');
  
  getProxyState((savedState, ip, port) => {
    if (ip) {
      proxyip.value = ip;
      proxyConfig.rules.singleProxy.host = ip;
    }
    if (port) {
      proxyport.value = port;
      proxyConfig.rules.singleProxy.port = port;
    }
    if (savedState) {
      proxyEnabled = savedState;
      checkbox.checked = savedState;
    }
    changeProxyState();
  });
  window.addEventListener('focus', () => {
    if(!chrome.extension.inIncognitoContext){
      document.getElementById('message').setAttribute('class','');
      document.getElementById('container').setAttribute('class','hidden');
    }
    else{
      document.getElementById('container').setAttribute('class','container');
      document.getElementById('message').setAttribute('class','hidden');
    }
  });
  var inputs=document.getElementsByTagName('input'),i=0;
    do{
        switch(inputs[i].type){
            case 'checkbox':
              inputs[i].onchange=function(){
                processFormEvent();
              }
              break;
            case 'text':
              inputs[i].onkeyup=function(){
                processFormEvent();
              }
              break;
        }
    }
    while(inputs[++i])
});

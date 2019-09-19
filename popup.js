var proxyEnabled = false;
var proxyEnabledCheckbox;
var proxyIP;
var proxyPort;
var proxyScheme;

var proxyConfig = {
  mode: "fixed_servers",
  rules: {
    singleProxy: {
      scheme: 'http',
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
    chrome.storage.sync.get(['proxyEnabled', 'proxyIP', 'proxyPort', 'proxyScheme'], (items) => {
      callback(chrome.runtime.lastError ? null : items['proxyEnabled'], items['proxyIP'], items['proxyPort'], items['proxyScheme']);
    });
  }
}
function saveProxyState() {
  if(chrome.extension.inIncognitoContext){
    var items = {};
    items['proxyEnabled'] = proxyEnabled;
    items['proxyScheme'] = proxyConfig.rules.singleProxy.scheme;
    items['proxyIP'] = proxyConfig.rules.singleProxy.host;
    items['proxyPort'] = proxyConfig.rules.singleProxy.port;
    chrome.storage.sync.set(items);
  }
}
function processFormEvent() {
  if(chrome.extension.inIncognitoContext){
    proxyEnabled = proxyEnabledCheckbox.checked;
    proxyConfig.rules.singleProxy.scheme = proxyScheme.value;
    proxyConfig.rules.singleProxy.host = proxyIP.value;
    proxyConfig.rules.singleProxy.port = parseInt(proxyPort.value);
    changeProxyState();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  proxyScheme = document.getElementById('proxyScheme');
  proxyEnabledCheckbox = document.getElementById('proxyEnabled');
  proxyIP = document.getElementById('proxyIP');
  proxyPort = document.getElementById('proxyPort');
  
  getProxyState((savedState, ip, port, scheme) => {
    if (ip) {
      proxyIP.value = ip;
      proxyConfig.rules.singleProxy.host = ip;
    }
    if (port) {
      proxyPort.value = port;
      proxyConfig.rules.singleProxy.port = port;
    }
    if (savedState) {
      proxyEnabled = savedState;
      proxyEnabledCheckbox.checked = savedState;
    }
    if (scheme) {
      proxyScheme.value = scheme;
      proxyConfig.rules.singleProxy.scheme = scheme;
    }
    changeProxyState();
  });
  window.addEventListener('focus', () => {
    if(!chrome.extension.inIncognitoContext){
      document.getElementById('message').setAttribute('class', '');
      document.getElementById('container').setAttribute('class', 'hidden');
    }
    else{
      document.getElementById('container').setAttribute('class', 'container');
      document.getElementById('message').setAttribute('class', 'hidden');
    }
  });

  proxyScheme.onchange = processFormEvent;
  proxyEnabledCheckbox.onchange = processFormEvent;
  proxyIP.onkeyup = processFormEvent;
  proxyPort.onkeyup = processFormEvent;
});

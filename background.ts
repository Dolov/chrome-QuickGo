

chrome.action.onClicked.addListener(activeTab => {
  // const newURL = "https://baidu.com";
  // chrome.tabs.create({ url: newURL });
  chrome.runtime.openOptionsPage();
});
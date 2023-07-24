

chrome.action.onClicked.addListener(activeTab => {
  chrome.runtime.openOptionsPage();
});


chrome.contextMenus.create({
  id: "req&issues",
  title: "提需求或问题",
  contexts: ["action"]
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "req&issues") {
    window.open("https://txc.qq.com/products/600968")
  }
})
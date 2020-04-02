console.log("we go here");

chrome.tabs.query({ active: true }, function(tabs) {
    console.log(tabs[0].url)
});
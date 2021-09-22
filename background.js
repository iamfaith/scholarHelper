var id = "elnddomflaohijhcdmhclgapejblehnc";
function reloadExtension(id) {
    chrome.management.setEnabled(id, false, function() {
        chrome.management.setEnabled(id, true);
    });
}
chrome.browserAction.onClicked.addListener(function(tab) {
    // reloadExtension(id);
    chrome.runtime.reload();
});


chrome.commands.onCommand.addListener((shortcut) => {
    console.log('lets reload');
    console.log(shortcut);
    if(shortcut.includes("+b")) {
        chrome.runtime.reload();
    }
})
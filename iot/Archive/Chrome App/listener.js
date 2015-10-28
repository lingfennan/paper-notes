chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    console.log("Request", request);
    send_bluetooth(socketId, request); // From bluetooth.js
    setTimeout(function() {
      response = read_latest_message();
      console.log("Response",response);
      sendResponse(response);
    }, 1000);
    return true;
});
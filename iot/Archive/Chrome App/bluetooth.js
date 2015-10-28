var address = ''; // Bluetooth address
var uuid = 'fa87c0d0-afac-11de-8a39-0800200c9a66'; // Bluetooth UUID (must match other app's uuid)
var socketId = null;
var latest_message_received = null;


// Read the latest message and clear
function read_latest_message() {
  var message = latest_message_received;
  latest_message_received = null;
  return message;
}

/*
  Send a message to a socket
*/
function send_bluetooth(socketId, message) {
  // Convert message to array buffer
  var buf = new ArrayBuffer(message.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, messageLen=message.length; i < messageLen; i++) {
    bufView[i] = message.charCodeAt(i);
  }

  chrome.bluetoothSocket.send(socketId, buf, function(bytes_sent) {
    if (chrome.runtime.lastError) {
      console.log("Send failed: " + chrome.runtime.lastError.message);
    } else {
      console.log("Sent " + bytes_sent + " bytes to " + socketId);
    }
  });
}

/* 
  Called with app receives a message on its socket
*/
function receive_bluetooth(message) {
  latest_message_received = message;
  document.getElementById("status").innerHTML = "Received: " + message;
}

// Create bluetooth socket and attempt to connect to device
function createSocket() {
  chrome.bluetoothSocket.create(function(createInfo) {
    console.log("Attempting to connect");
    chrome.bluetoothSocket.connect(createInfo.socketId,
      address, uuid, function() {
        if (chrome.runtime.lastError) {
          console.log("Connection failed: " + chrome.runtime.lastError.message);
          socketId = null;
        } else {
          socketId = createInfo.socketId;
          document.getElementById("status").innerHTML = "Connected to device";
          console.log("Connected to device");
        }
      });
  });
}

// List devices on window
chrome.bluetooth.getDevices(function(devices) {
  for (var i = 0; i < devices.length; i++) {
    document.getElementById("devices").innerHTML += devices[i].name + " <input type='text' value='" + devices[i].address + "' /><br />";
  }
});

// Try to connect to device until connected
setInterval(function() {
  address = document.getElementById('address').value;
  if (socketId == null && address.length > 1) {
    createSocket();
  }
}, 3000);

// Receive listener
chrome.bluetoothSocket.onReceive.addListener(function(receiveInfo) {
  if (receiveInfo.socketId != socketId)
    return;
  var message = String.fromCharCode.apply(null, new Uint8Array(receiveInfo.data));

  // Remove non-printable characters
  var messageArray = message.split('');
  messageArray = messageArray.filter(function (letter) { return /\w/.test(letter); });
  message = messageArray.join('');

  receive_bluetooth(message);
});
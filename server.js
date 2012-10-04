function string2ArrayBuffer(string, callback) {
  var blob = new Blob([string]);
  var f = new FileReader();
  f.onload = function(e) {
    callback(e.target.result);
  };
  f.readAsArrayBuffer(blob);
}

function arrayBuffer2String(buf, callback) {
  var blob = new Blob([new Uint8Array(buf)]);
  var f = new FileReader();
  f.onload = function(e) {
    callback(e.target.result);
  };
  f.readAsText(blob);
}

const socket = chrome.socket;
socket.create('tcp', {}, function onServerSocketCreate(socketInfo) {
  var socketId = socketInfo.socketId
  , address = '127.0.0.1'
  , port = 3000;

  socket.listen(socketId, address, port, function onListen(result) {
    console.assert(0 === result); // listen failed
    socket.getInfo(socketId, function(info) {
      console.log('server listening on http://localhost:' + info.localPort);
      // accept only one time
      socket.accept(socketId, function onServerSocketAccept(acceptInfo) {
        console.assert(0 === acceptInfo.resultCode);
        var acceptedSocketId = acceptInfo.socketId;
        console.log('acceptedSocketID', acceptedSocketId);

        socket.read(acceptedSocketId, function onRead(readInfo) {
          arrayBuffer2String(readInfo.data, function(str) {
            console.log('readInfo.data', str);
            var header = parser(str);
            console.log(header);

            string2ArrayBuffer(header, function(buf) {
              // write to socket
              socket.write(acceptedSocketId, buf, function() {
                socket.read(acceptedSocketId, function onRead(readInfo) {
                  // ArrayBuffer
                  var receivedData = readInfo.data;
                  console.log('readInfo.data', receivedData);

                  var u8a = new Uint8Array(receivedData);
                  console.log('8', u8a);
                  var firstByte = u8a[0];

                  var fin = (firstByte & 0x80) >>> 7;
                  console.log('fin', fin);

                  var opcode = firstByte & 0x0f;
                  console.log('opcode', opcode);

                  var secondByte = u8a[1];
                  var mask = (secondByte & 0x80) >>> 7;
                  console.log('mask', mask);
                  if (mask === 0) {
                    console.assert('browse should always mask the payload data');
                  }

                  var payloadLength = (secondByte & 0x7f);
                  console.log('payload length', payloadLength);
                  if (payloadLength === 0x7e) {
                    console.assert('next 16bit is length but not supported');
                  }
                  if (payloadLength === 0x7f) {
                    console.assert('next 64bit is length but not supported');
                  }

                  var dv = new DataView(receivedData);
                  var maskingkey = dv.getUint32(2)
                  console.log('masking key', maskingkey);

                  var payload = dv.getUint32(6);
                  console.log('payload', payload);

                  var unmasked = payload ^ maskingkey;
                  console.log(unmasked);

                  var temp = new ArrayBuffer(32);
                  var dv = new DataView(temp);
                  dv.setInt32(0, unmasked);

                  /**
                   * var ws = new WebSocket("ws://localhost:3000");
                   * ws.send('hoge');
                   */
                  for(var i=0; i<4; i++) {
                    // h o g e
                    console.log(String.fromCharCode(dv.getUint8(i)));
                  }
                });
              });
            });
          });
        });
      });
    });
  });
});

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
                  var receivedData = readInfo.data
                  console.log('readInfo.data', receivedData);
                  //debugger;
                });
              });
            });
          });
        });
      });
    });
  });
});

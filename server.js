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

var responce = function(msg) {
  var sep = '\r\n';

  var body = [
    '<!DOCTYPE html>',
    '<html>',
    ' <head>',
    '   <title>Chrome Socket API Server</title>',
    ' </head>',
    '<body>',
    ' <h1>' + msg + '</h1>',
    '</body>',
    '</html>'
  ].join(sep);

  var header = [
    'HTTP/1.1 200 OK',
    'Server: chrome24',
    'Content-Length: ' + body.length,
    'Connection: Close',
    'Content-Type: text/html'
  ].join(sep);

  return header + sep + sep + body;
};

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
          });

          var responce_str = responce('hello');
          console.log(responce_str);

          string2ArrayBuffer(responce_str, function(buf) {
            // write to socket
            socket.write(acceptedSocketId, buf, function() {
              // dosen't work
              // socket.destroy(acceptedSocketId);
            });
          });
        });
      });
    });
  });
});

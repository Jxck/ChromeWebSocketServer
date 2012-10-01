if (typeof module !== 'undefined') {
  base64encode = require('./base64').base64encode;
  sha1 = require('./sha1.js').sha1;
}
this.parser = function(header_str) {
  var header_arr = header_str.trim().replace(/ /g, '').split('\n');
  var method = header_arr .shift();

  var header_obj = {};
  header_arr.forEach(function(line) {
    var arr = line.trim().split(':');
    header_obj[arr.shift()] = arr.join('');
  });

  // websocket handshake
  if (header_obj['Connection'] === 'Upgrade' &&
    header_obj['Upgrade'] === 'websocket') {

    // not supported
    if (parseInt(header_obj['Sec-WebSocket-Version']) < 13) {
      console.assert(false, 'not supported');
    }
    if (header_obj['sec-websocket-origin']) {
      console.assert(false, 'old Header');
    }

    // key
    var key = header_obj['Sec-WebSocket-Key'];
    console.log(JSON.stringify(key));
    var sha1bin = sha1.bin(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
    var base64 = base64encode(sha1bin);

    var headers = [
      // The first line is an HTTP Status-Line
      // code 101, Switching Protocols
      'HTTP/1.1 101 Switching Protocols'
      // Upgrade, Connection fields complete the Upgrade
      , 'Upgrade: websocket'
      , 'Connection: Upgrade'
      // Accept will checked by client which is expected
      , 'Sec-WebSocket-Accept: ' + base64
    ].concat('', '').join('\r\n');
    console.log(JSON.stringify(headers));
    return headers;
  } else {
    console.assert(false, 'something wrong :(');
  }
};

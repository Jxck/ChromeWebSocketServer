function parser(header_str) {
  var header_arr = header_str.replace(/ /g, '').split('\n');
  var method = header_arr .shift();

  var header_obj = {};
  header_arr.forEach(function(line) {
    var arr = line.split(':');
    header_obj[arr.shift()] = arr.join('');
  });

  log(header_obj);

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
    var sha1 = sha1bin(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
    var base64 = base64encode(sha1);

    var headers = [
      // The first line is an HTTP Status-Line
      // code 101, Switching Protocols
      'HTTP/1.1 101 Switching Protocols'
      // Upgrade, Connection fields complete the Upgrade
      , 'Upgrade: websocket'
      , 'Connection: Upgrade'
      // Accept will checked by client which is expected
      , 'Sec-WebSocket-Accept: ' + key
      // option fields can be included
      // main is subprotocol that indicates server has selected
      , 'Sec-WebSocket-Protocol: ' + protocol
    ].concat('', '').join('\r\n');
    return headers;
  } else {
    console.assert(false, 'something wrong :(');
  }
}

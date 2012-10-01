var parser = require('../parser').parser;
var fixture = ''
+ 'GET / HTTP/1.1'
+'\n'+ 'Upgrade: websocket'
+'\n'+ 'Connection: Upgrade'
+'\n'+ 'Host: localhost:3000'
+'\n'+ 'Origin: chrome://chrome'
+'\n'+ 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ=='
+'\n'+ 'Sec-WebSocket-Version: 13'
+'\n'+ 'Sec-WebSocket-Extensions: x-webkit-deflate-frame'
;

var actual = parser(fixture);

var expected = ''
+ 'HTTP/1.1 101 Switching Protocols'
+ '\r\n' + 'Upgrade: websocket'
+ '\r\n' + 'Connection: Upgrade'
+ '\r\n' + 'Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo='
+ '\r\n\r\n';

console.assert(actual === expected);

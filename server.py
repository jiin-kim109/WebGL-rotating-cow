import http.server
import socketserver

ADDR = ""
PORT = 8000

handler = http.server.SimpleHTTPRequestHandler
handler.extensions_map={
    '.manifest': 'text/cache-manifest',
	'.html': 'text/html',
    '.png': 'image/png',
	'.jpg': 'image/jpg',
	'.svg':	'image/svg+xml',
	'.css':	'text/css',
	'.js':	'application/x-javascript',
	'': 'application/octet-stream'
}

server = socketserver.TCPServer((ADDR, PORT), handler)
addr_name = ADDR if ADDR else "localhost"
print("Starting server at http://{}:{}".format(addr_name, PORT))
server.serve_forever()


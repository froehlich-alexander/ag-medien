from http.server import HTTPServer, SimpleHTTPRequestHandler

httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)
httpd.serve_forever()

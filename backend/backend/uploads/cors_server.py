import http.server
import socketserver

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # This is the magic line that allows React to read the file
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    port = 8000
    with socketserver.TCPServer(("", port), CORSRequestHandler) as httpd:
        print(f"Serving files with CORS on port {port}")
        httpd.serve_forever()
"""Abre Marco Editor en un servidor local de solo lectura."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json, sys, threading, webbrowser
import tkinter as tk
from tkinter import ttk
ROOT=Path(getattr(sys,'_MEIPASS',Path(__file__).resolve().parents[1]))
class Handler(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
    def list_directory(self,path):self.send_error(403)
    def end_headers(self):
        self.send_header('X-Content-Type-Options','nosniff')
        super().end_headers()
def main():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT/'dist/web')))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    url=f'http://127.0.0.1:{server.server_port}/'
    try:
        if '--serve-test' in sys.argv:
            Path(sys.argv[sys.argv.index('--serve-test')+1]).write_text(json.dumps({'url':url}),encoding='utf-8')
            threading.Event().wait(60);return
        window=tk.Tk();window.title('Marco Editor · Web portable');window.geometry('480x170')
        ttk.Label(window,text='Mantén esta ventana abierta mientras editas.').pack(pady=20)
        ttk.Button(window,text='Abrir editor',command=lambda:webbrowser.open(url)).pack(pady=8)
        ttk.Button(window,text='Cerrar',command=window.destroy).pack(pady=8)
        window.after(400,lambda:webbrowser.open(url));window.mainloop()
    finally:server.shutdown();server.server_close()
if __name__=='__main__':main()

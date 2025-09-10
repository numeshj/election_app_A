import { createServer } from "http";
import { WebSocketServer } from "ws";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { type } from "os";

const PORT = process.env.PORT || 4000;

let district = [];

try {
  districts = JSON.parse(
    fs.readFileSync(path.join(process.swd(), "src", "districts.json"), "utf-8")
  );
} catch {
  districts = [];
}

const results = [];

const server = createServer((__req, res) => {
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("Websocket server. Use ws:// connection.");
});

const wss = new WebSocketServer({ server });

function broadcast(message) {
    const data = JSON.stringify(message);
    wss.clients.forEach(c => { if (c.readyState === 1) c.send(data); })
}
function snapshot(ws) {
    ws.send(JSON.stringify({ type: 'districts:all', data: districts }));
    ws.send(JSON.stringify({ type: 'results:all', data: results }));
}4
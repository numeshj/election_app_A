import { createServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const PORT = process.env.PORT || 4001;

let districts = [];

try {
  districts = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "src", "districts.json"), "utf-8")
  );
} catch {
  districts = [];
}

const results = [];

// Create a simple HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Election Server Running\n");
});

const wss = new WebSocketServer({ server });

// Create a websocket connection
wss.on("connection", (ws) => {
  console.log("New Client Connected");

  ws.on("message", (data) => {
    console.log("Received a New Result from admin: " + data);
    const message = JSON.parse(data.toString());
    if (message.type === "result") {
      results.push(message.data);
      broadcast({ type: "result:new", data: message.data });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  // Send initial data
  snapshot(ws);
});

function broadcast(message) {
  const data = JSON.stringify(message);
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(data);
  });
}

function snapshot(ws) {
  ws.send(JSON.stringify({ type: "districts:all", data: districts }));
  ws.send(JSON.stringify({ type: "results:all", data: results }));
}

wss.on("connection", (ws) => {
  // Send current data right away
  snapshot(ws);

  // When we receive a message from this client
  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    if (msg.type === "request:all") {
      snapshot(ws);
      return;
    }

    if (msg.type !== "submit") return;

    const data = msg.payload || {};
    if (!data.summary || !Array.isArray(data.by_party)) return;

    // Find existing result
    const keyPd = data.pd_code || data.pdCode;
    const keySeq = data.sequence_number || data.sequenceNumber;
    const idx = results.findIndex(
      (r) =>
        (keyPd && r.pd_code === keyPd) ||
        (!keyPd && keySeq && r.sequence_number === keySeq)
    );

    // Update existing OR add new
    if (idx >= 0) {
      const updated = {
        ...results[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      results[idx] = updated;
      broadcast({ type: "result:updated", data: updated });
    } else {
      const created = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...data,
      };
      results.push(created);
      broadcast({ type: "result:new", data: created });
    }

    // Always send the full list after a change
    broadcast({ type: "results:all", data: results });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

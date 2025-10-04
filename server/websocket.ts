import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

export interface StreamMessage {
  type: "draft" | "critique" | "synthesis" | "error" | "complete";
  agent?: string;
  data?: any;
  phase?: string;
  message?: string;
}

const clients = new Map<string, WebSocket>();
const messageBuffers = new Map<string, StreamMessage[]>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    let queryId: string | null = null;

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "register" && data.queryId) {
          queryId = data.queryId;
          clients.set(queryId, ws);
          console.log(`[WebSocket] Client registered for query ${queryId.slice(0, 8)}`);
          
          const bufferedMessages = messageBuffers.get(queryId);
          if (bufferedMessages && bufferedMessages.length > 0) {
            console.log(`[WebSocket] Sending ${bufferedMessages.length} buffered messages for ${queryId.slice(0, 8)}`);
            bufferedMessages.forEach(msg => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(msg));
              }
            });
            messageBuffers.delete(queryId);
          }
        }
      } catch (error) {
        console.error("[WebSocket] Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      if (queryId !== null) {
        clients.delete(queryId);
        console.log(`[WebSocket] Client disconnected for query ${queryId.slice(0, 8)}`);
      }
    });

    ws.on("error", (error) => {
      console.error("[WebSocket] Error:", error);
    });
  });

  return wss;
}

export function sendStreamMessage(queryId: string, message: StreamMessage) {
  const client = clients.get(queryId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  } else {
    if (!messageBuffers.has(queryId)) {
      messageBuffers.set(queryId, []);
    }
    messageBuffers.get(queryId)!.push(message);
    console.log(`[WebSocket] Buffered message for ${queryId.slice(0, 8)} (type: ${message.type})`);
  }
}

export function closeStream(queryId: string) {
  const client = clients.get(queryId);
  if (client) {
    clients.delete(queryId);
    if (client.readyState === WebSocket.OPEN) {
      client.close();
    }
  }
  messageBuffers.delete(queryId);
}

export function sendError(queryId: string, error: Error) {
  sendStreamMessage(queryId, {
    type: "error",
    message: error.message || "An unknown error occurred",
    phase: "Error",
  });
  
  setTimeout(() => {
    sendStreamMessage(queryId, {
      type: "complete",
      data: null,
    });
    closeStream(queryId);
  }, 100);
}

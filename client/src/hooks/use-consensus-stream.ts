import { useState, useEffect, useCallback, useRef } from "react";
import type { AskResponse, DraftResponse, Synthesis } from "@shared/schema";

interface StreamState {
  phase: string;
  drafts: DraftResponse[];
  synthesis: Synthesis | null;
  complete: boolean;
  result: AskResponse | null;
}

export function useConsensusStream() {
  const [streamState, setStreamState] = useState<StreamState>({
    phase: "",
    drafts: [],
    synthesis: null,
    complete: false,
    result: null,
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const startStream = useCallback(async (question: string) => {
    setIsStreaming(true);
    setStreamState({
      phase: "Initiating consensus...",
      drafts: [],
      synthesis: null,
      complete: false,
      result: null,
    });

    try {
      const response = await fetch("/api/ask?stream=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const { query_id } = await response.json();

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "register", queryId: query_id }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "draft" && message.data) {
          setStreamState(prev => ({
            ...prev,
            phase: message.phase || prev.phase,
            drafts: [...prev.drafts, message.data],
          }));
        } else if (message.type === "critique") {
          setStreamState(prev => ({
            ...prev,
            phase: message.phase || prev.phase,
          }));
        } else if (message.type === "synthesis" && message.data) {
          setStreamState(prev => ({
            ...prev,
            phase: message.phase || prev.phase,
            synthesis: message.data,
          }));
        } else if (message.type === "complete" && message.data) {
          setStreamState(prev => ({
            ...prev,
            phase: "Complete",
            complete: true,
            result: message.data,
          }));
          setIsStreaming(false);
          ws.close();
        } else if (message.type === "error") {
          console.error("Stream error:", message.message);
          setStreamState(prev => ({
            ...prev,
            phase: `Error: ${message.message}`,
          }));
        } else if (message.phase) {
          setStreamState(prev => ({
            ...prev,
            phase: message.phase,
          }));
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsStreaming(false);
      };

      ws.onclose = () => {
        setIsStreaming(false);
      };
    } catch (error) {
      console.error("Failed to start stream:", error);
      setIsStreaming(false);
    }
  }, []);

  const stopStream = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    streamState,
    isStreaming,
    startStream,
    stopStream,
  };
}

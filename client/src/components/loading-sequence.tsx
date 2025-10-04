import { useEffect, useState } from "react";
import { ModelAvatar } from "./model-avatar";
import { type AIModel } from "@shared/schema";

const phases = [
  { id: "draft", label: "Querying AI models", models: ["gpt5", "claude", "gemini", "perplexity"] as AIModel[] },
  { id: "critique", label: "Cross-critique in progress", models: [] },
  { id: "synthesis", label: "Synthesizing consensus", models: [] },
];

export function LoadingSequence() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [activeModel, setActiveModel] = useState(0);

  useEffect(() => {
    if (currentPhase === 0) {
      const modelTimer = setInterval(() => {
        setActiveModel((prev) => (prev + 1) % 4);
      }, 800);
      
      const phaseTimer = setTimeout(() => {
        setCurrentPhase(1);
      }, 3200);

      return () => {
        clearInterval(modelTimer);
        clearTimeout(phaseTimer);
      };
    } else if (currentPhase === 1) {
      const timer = setTimeout(() => {
        setCurrentPhase(2);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPhase]);

  const currentPh = phases[currentPhase];

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8" data-testid="loading-sequence">
      <div className="flex items-center gap-4">
        {phases[0].models.map((model, idx) => (
          <div
            key={model}
            className={`transition-all duration-300 ${
              currentPhase === 0 && idx === activeModel ? "scale-110" : "scale-100"
            }`}
          >
            <ModelAvatar
              model={model}
              size="lg"
              active={currentPhase === 0 ? idx === activeModel : currentPhase > 0}
            />
          </div>
        ))}
      </div>

      <div className="text-center space-y-2">
        <div className="flex items-center gap-2 justify-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-lg font-medium text-foreground" data-testid="text-loading-phase">
            {currentPh.label}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {currentPhase === 0 && "Collecting diverse perspectives..."}
          {currentPhase === 1 && "Models reviewing each other's responses..."}
          {currentPhase === 2 && "Creating unified answer..."}
        </p>
      </div>

      <div className="flex gap-2">
        {phases.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 w-12 rounded-full transition-all ${
              idx <= currentPhase ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

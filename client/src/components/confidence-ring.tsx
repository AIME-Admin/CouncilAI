import { useEffect, useState } from "react";

interface ConfidenceRingProps {
  confidence: number;
  size?: "sm" | "lg";
}

export function ConfidenceRing({ confidence, size = "lg" }: ConfidenceRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.round(confidence * 100);
  
  const dimensions = size === "lg" ? { size: 120, stroke: 10 } : { size: 80, stroke: 8 };
  const { size: circleSize, stroke } = dimensions;
  const radius = (circleSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getColor = () => {
    if (confidence >= 0.8) return "hsl(var(--chart-2))";
    if (confidence >= 0.5) return "hsl(var(--chart-3))";
    return "hsl(var(--destructive))";
  };

  const getGlow = () => {
    if (confidence >= 0.8) return "0 0 20px hsl(var(--chart-2) / 0.3)";
    if (confidence >= 0.5) return "0 0 20px hsl(var(--chart-3) / 0.3)";
    return "0 0 20px hsl(var(--destructive) / 0.3)";
  };

  return (
    <div className="relative" style={{ width: circleSize, height: circleSize }}>
      <svg
        width={circleSize}
        height={circleSize}
        className="transform -rotate-90"
        style={{ filter: getGlow() }}
      >
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.8s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold tabular-nums"
          style={{ color: getColor() }}
          data-testid="text-confidence-percentage"
        >
          {percentage}%
        </span>
        <span className="text-xs text-muted-foreground mt-1">confidence</span>
      </div>
    </div>
  );
}

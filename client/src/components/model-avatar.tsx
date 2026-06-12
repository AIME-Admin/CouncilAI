import { type AIModel } from "@shared/schema";

interface ModelAvatarProps {
  model: AIModel;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

export function ModelAvatar({ model, size = "md", active = false }: ModelAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  const modelConfig = {
    gpt5: {
      name: "GPT-5",
      color: "hsl(180, 75%, 48%)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className={iconSizeClasses[size]}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
    },
    claude: {
      name: "Claude",
      color: "hsl(38, 92%, 50%)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className={iconSizeClasses[size]}>
          <path
            d="M12 2L4 20h16L12 2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="16" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    gemini: {
      name: "Gemini",
      color: "hsl(220, 90%, 56%)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className={iconSizeClasses[size]}>
          <path
            d="M12 2L16 8L22 12L16 16L12 22L8 16L2 12L8 8L12 2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    perplexity: {
      name: "Perplexity",
      color: "hsl(280, 65%, 60%)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className={iconSizeClasses[size]}>
          <path
            d="M12 2L20 7V17L12 22L4 17V7L12 2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    grok: {
      name: "Grok",
      color: "hsl(0, 0%, 85%)",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className={iconSizeClasses[size]}>
          <path
            d="M4 4l16 16M4 20L20 4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
  };

  const config = modelConfig[model];

  return (
    <div
      className={`${sizeClasses[size]} rounded-md flex items-center justify-center transition-all ${
        active ? "ring-2 ring-offset-2 ring-offset-background" : "opacity-60"
      }`}
      style={{
        backgroundColor: active ? `${config.color}20` : "transparent",
        color: config.color,
        ringColor: active ? config.color : undefined,
      }}
      title={config.name}
      data-testid={`avatar-${model}`}
    >
      {config.icon}
    </div>
  );
}

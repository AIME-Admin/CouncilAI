import { useEffect } from "react";

interface PageHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
}

export function PageHead({ 
  title = "AI-ME Council - Four Minds, One Verifiable Answer",
  description = "AI-ME Council uses four leading AI models (GPT-5, Claude, Gemini, Perplexity) to deliver consensus-based answers with cross-critique validation and confidence scoring.",
  ogImage = "/og-image.png"
}: PageHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Standard meta tags
    updateMeta('description', description);
    
    // Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', 'website', true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:url', window.location.href, true);
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);
  }, [title, description, ogImage]);

  return null;
}

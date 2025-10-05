// Council Home Page - Fixed synthesis optional chaining
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, ExternalLink, Check, X, AlertTriangle, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ConfidenceRing } from "@/components/confidence-ring";
import { ModelAvatar } from "@/components/model-avatar";
import { LoadingSequence } from "@/components/loading-sequence";
import { askRequestSchema, type AskRequest, type AskResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [result, setResult] = useState<AskResponse | null>(null);

  const form = useForm<AskRequest>({
    resolver: zodResolver(askRequestSchema),
    defaultValues: {
      question: "",
    },
  });

  const askMutation = useMutation({
    mutationFn: async (data: AskRequest) => {
      const response = await apiRequest("POST", "/api/ask", data);
      return response as unknown as AskResponse;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: AskRequest) => {
    setResult(null);
    askMutation.mutate(data);
  };

  const resetForm = () => {
    form.reset();
    setResult(null);
    askMutation.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-12">
        <header className="text-center mb-12 space-y-6">
          <div className="flex items-center justify-center">
            <img 
              src="/aime-council-logo.png" 
              alt="AI-ME COUNCIL" 
              className="w-48 h-auto"
              data-testid="logo-aime-council"
            />
          </div>
          <div className="space-y-3">
            <p className="text-xl md:text-2xl font-semibold text-foreground max-w-3xl mx-auto">
              Get consensus answers from 4 leading AI models
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Transparent decision-making powered by GPT-5, Claude, Gemini, and Perplexity
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant="default"
              onClick={() => window.location.href = "/upgrade"}
              data-testid="button-view-pricing"
            >
              View Pricing
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const textarea = document.querySelector('[data-testid="input-question"]') as HTMLTextAreaElement;
                textarea?.scrollIntoView({ behavior: "smooth" });
                textarea?.focus();
              }}
              data-testid="button-try-now"
            >
              Try Now
            </Button>
          </div>
        </header>

        {!result && !askMutation.isPending && (
          <div className="max-w-3xl mx-auto">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <Textarea
                  {...form.register("question")}
                  placeholder="Ask a question to get consensus from GPT-5, Claude, Gemini, and Perplexity..."
                  className="min-h-32 text-base resize-none border-2 focus:border-primary transition-all"
                  data-testid="input-question"
                />
                {form.formState.errors.question && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.question.message}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {form.watch("question").length} characters
                </span>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-primary to-chart-1"
                  data-testid="button-ask"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ask Council
                </Button>
              </div>
            </form>
          </div>
        )}

        {askMutation.isPending && (
          <Card className="border-2">
            <CardContent className="p-8">
              <LoadingSequence />
            </CardContent>
          </Card>
        )}

        {askMutation.isError && (
          <Card className="border-2 border-destructive">
            <CardContent className="p-8 text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <p className="text-lg font-medium text-foreground">Something went wrong</p>
              <p className="text-muted-foreground">
                {askMutation.error instanceof Error
                  ? askMutation.error.message
                  : "Failed to get consensus. Please try again."}
              </p>
              <Button onClick={resetForm} data-testid="button-try-again">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <Tabs defaultValue="answer" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="answer"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  data-testid="tab-answer"
                >
                  Answer
                </TabsTrigger>
                <TabsTrigger
                  value="receipts"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  data-testid="tab-receipts"
                >
                  Receipts
                </TabsTrigger>
                <TabsTrigger
                  value="dissent"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  data-testid="tab-dissent"
                >
                  Dissent
                  {(result.synthesis?.dissent?.length ?? 0) > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {result.synthesis?.dissent?.length ?? 0}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="answer" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-6 flex-wrap">
                      <div className="flex-1 space-y-2">
                        <CardTitle className="text-2xl">Consensus Answer</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          {(result.drafts ?? []).map((draft) => (
                            <ModelAvatar key={draft.agent} model={draft.agent} size="sm" active />
                          ))}
                          <span className="text-sm text-muted-foreground ml-2">
                            {(result.drafts ?? []).length} models in agreement
                          </span>
                        </div>
                      </div>
                      <ConfidenceRing confidence={result.synthesis?.confidence ?? 0} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-base leading-relaxed text-foreground" data-testid="text-synthesis-summary">
                        {result.synthesis?.summary ?? "No summary available"}
                      </p>
                    </div>

                    {(result.synthesis?.citations?.length ?? 0) > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Citations</h3>
                        <div className="flex flex-wrap gap-2">
                          {(result.synthesis?.citations ?? []).map((citation, idx) => (
                            <a
                              key={idx}
                              href={citation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-mono"
                              data-testid={`link-citation-${idx}`}
                            >
                              [{idx + 1}]
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {(() => {
                  const refusedModels = (result.drafts ?? []).filter(draft => 
                    draft.claims.some(claim => 
                      claim.text.includes("declined to answer") || 
                      claim.text.includes("refused") ||
                      claim.text.includes("cannot provide")
                    )
                  );
                  
                  if (refusedModels.length === 0) return null;
                  
                  return (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="space-y-2 flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {refusedModels.length} {refusedModels.length === 1 ? 'model' : 'models'} declined to answer
                            </p>
                            <div className="space-y-2">
                              {refusedModels.map(draft => {
                                const refusalClaim = draft.claims.find(c => 
                                  c.text.includes("declined to answer") || 
                                  c.text.includes("refused") ||
                                  c.text.includes("cannot provide")
                                );
                                if (!refusalClaim) return null;
                                
                                return (
                                  <div key={draft.agent} className="flex items-start gap-2 text-sm" data-testid={`refusal-${draft.agent}`}>
                                    <ModelAvatar model={draft.agent} size="sm" />
                                    <p className="text-muted-foreground flex-1">
                                      {refusalClaim.text}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </TabsContent>

              <TabsContent value="receipts" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Decision Log</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Transparent record of how we reached consensus
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(result.synthesis?.decision_log ?? []).map((decision, idx) => {
                      const isKept = decision.toLowerCase().includes("kept") || decision.toLowerCase().includes("included") || decision.toLowerCase().includes("agreed");
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 rounded-md bg-muted/50"
                          data-testid={`decision-${idx}`}
                        >
                          {isKept ? (
                            <Check className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          )}
                          <p className="text-sm text-foreground flex-1">{decision}</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {(result.synthesis?.citations?.length ?? 0) > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>All Citations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(result.synthesis?.citations ?? []).map((citation, idx) => (
                        <a
                          key={idx}
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-md bg-muted/50 hover-elevate group"
                          data-testid={`citation-card-${idx}`}
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                          <span className="text-sm font-mono text-foreground truncate flex-1">
                            {citation}
                          </span>
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="dissent" className="mt-6 space-y-6">
                {(result.synthesis?.dissent?.length ?? 0) === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center space-y-4">
                      <Check className="w-16 h-16 text-chart-2 mx-auto" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">Full Consensus</h3>
                        <p className="text-muted-foreground">
                          All AI models are in agreement on this answer.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card className="border-chart-4 bg-chart-4/5">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-chart-4 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              Disagreement Detected
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Some models had different perspectives on certain points.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {(result.synthesis?.dissent ?? []).map((dissent, idx) => (
                      <Card key={idx} className="border-chart-4/30" data-testid={`dissent-${idx}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <CardTitle className="text-lg">Dissenting View {idx + 1}</CardTitle>
                            <div className="flex items-center gap-2">
                              {dissent.who.map((model) => (
                                <ModelAvatar key={model} model={model} size="sm" active />
                              ))}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-foreground leading-relaxed">{dissent.point}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </TabsContent>
            </Tabs>

            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4 flex-wrap text-sm">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{result.processing_time_ms ?? 0}ms</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Hash className="w-4 h-4" />
                      <span className="font-mono">{result.query_id?.slice(0, 8) ?? "N/A"}</span>
                    </div>
                    <span className="text-muted-foreground">{result.timestamp ?? ""}</span>
                  </div>
                  <Button onClick={resetForm} variant="outline" data-testid="button-new-query">
                    New Query
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

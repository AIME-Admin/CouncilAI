import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8" data-testid="heading-terms">Terms of Service</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Last Updated: {new Date().toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 text-sm">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using AI-ME Council ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                <p className="text-muted-foreground mb-2">
                  AI-ME Council is an AI consensus engine that queries multiple AI models (GPT-5, Claude, Gemini, and Perplexity) to provide synthesized, consensus-based answers to user questions.
                </p>
                <p className="text-muted-foreground">
                  The Service provides:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                  <li>Multi-model AI consensus queries</li>
                  <li>Cross-critique analysis between models</li>
                  <li>Query history and analytics</li>
                  <li>Export functionality for results</li>
                  <li>Model customization options (for Pro and Team plans)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <p className="text-muted-foreground mb-2">
                  To use the Service, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Subscription Plans and Billing</h2>
                <p className="text-muted-foreground mb-2">
                  AI-ME Council offers multiple subscription tiers:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1 mb-3">
                  <li><strong>Free:</strong> 3 consensus queries per month</li>
                  <li><strong>Basic:</strong> 100 consensus queries per month at €19/month</li>
                  <li><strong>Pro:</strong> 500 consensus queries per month at €49/month</li>
                  <li><strong>Team:</strong> 2,000 consensus queries per month at €99/month</li>
                </ul>
                <p className="text-muted-foreground mb-2">
                  By subscribing to a paid plan, you agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Pay all fees associated with your selected plan</li>
                  <li>Provide current, complete, and accurate billing information</li>
                  <li>Accept automatic monthly billing until cancellation</li>
                  <li>Understand that unused queries do not roll over to the next billing cycle</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Cancellation and Refunds</h2>
                <p className="text-muted-foreground mb-2">
                  You may cancel your subscription at any time. Upon cancellation:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Your subscription will remain active until the end of the current billing period</li>
                  <li>You will not be charged for subsequent billing periods</li>
                  <li>Your account will revert to the Free plan</li>
                  <li>Refunds are not provided for partial months of service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Acceptable Use</h2>
                <p className="text-muted-foreground mb-2">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful, offensive, or inappropriate content</li>
                  <li>Attempt to gain unauthorized access to the Service or related systems</li>
                  <li>Use automated systems to access the Service without permission</li>
                  <li>Share your account credentials with others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Content and Intellectual Property</h2>
                <p className="text-muted-foreground mb-2">
                  The Service and its original content, features, and functionality are owned by AI-ME Council and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-muted-foreground">
                  You retain ownership of any questions you submit and results you receive. You grant us a license to use your questions to improve the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. AI-Generated Content Disclaimer</h2>
                <p className="text-muted-foreground mb-2">
                  The Service uses AI models to generate responses. You acknowledge that:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>AI-generated content may contain errors, inaccuracies, or biases</li>
                  <li>Responses should not be considered professional advice</li>
                  <li>You are responsible for verifying information before acting on it</li>
                  <li>We do not guarantee the accuracy, completeness, or reliability of responses</li>
                  <li>Confidence scores are estimates and do not guarantee correctness</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, AI-ME Council shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Service Modifications</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify, suspend, or discontinue the Service at any time without notice. We may also modify these terms at any time, and continued use of the Service constitutes acceptance of modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Privacy</h2>
                <p className="text-muted-foreground">
                  Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Termination</h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms shall be governed by and construed in accordance with the laws of the European Union, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">14. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms, please contact us through our Contact page or support channels.
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

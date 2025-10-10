import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8" data-testid="heading-privacy">Privacy Policy</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Last Updated: {new Date().toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 text-sm">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground">
                  AI-ME Council ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI consensus engine service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                
                <h3 className="text-lg font-medium mb-2 mt-4">2.1 Account Information</h3>
                <p className="text-muted-foreground mb-2">
                  When you create an account, we collect:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Username</li>
                  <li>Email address</li>
                  <li>Password (encrypted)</li>
                  <li>Optional: First and last name</li>
                  <li>Profile information (if using Replit Authentication)</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">2.2 Usage Information</h3>
                <p className="text-muted-foreground mb-2">
                  We collect information about your use of the Service:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Questions you submit to the AI models</li>
                  <li>AI responses and consensus results</li>
                  <li>Query history and timestamps</li>
                  <li>Model preferences and customization settings</li>
                  <li>Usage statistics and analytics</li>
                </ul>

                <h3 className="text-lg font-medium mb-2 mt-4">2.3 Payment Information</h3>
                <p className="text-muted-foreground mb-2">
                  Payment processing is handled by Stripe. We store:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Stripe customer ID</li>
                  <li>Subscription plan and status</li>
                  <li>Billing cycle information</li>
                  <li>Payment history metadata</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  We do not store your credit card details. All payment information is securely processed and stored by Stripe.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-4">2.4 Technical Information</h3>
                <p className="text-muted-foreground mb-2">
                  We automatically collect:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Session data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-2">
                  We use your information to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Provide and maintain the Service</li>
                  <li>Process your AI consensus queries</li>
                  <li>Manage your account and subscription</li>
                  <li>Send you service-related notifications</li>
                  <li>Provide customer support</li>
                  <li>Improve and optimize the Service</li>
                  <li>Analyze usage patterns and trends</li>
                  <li>Detect and prevent fraud or abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Sharing Your Information</h2>
                
                <h3 className="text-lg font-medium mb-2 mt-4">4.1 Third-Party AI Providers</h3>
                <p className="text-muted-foreground mb-2">
                  Your questions are sent to the following AI providers to generate responses:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>OpenAI (GPT-5)</li>
                  <li>Anthropic (Claude)</li>
                  <li>Google (Gemini)</li>
                  <li>Perplexity AI</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  Each provider has their own privacy policies and data handling practices. We recommend reviewing their policies.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-4">4.2 Payment Processors</h3>
                <p className="text-muted-foreground">
                  Payment information is processed by Stripe. Please review Stripe's privacy policy for information on how they handle your data.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-4">4.3 Legal Requirements</h3>
                <p className="text-muted-foreground">
                  We may disclose your information if required by law or in response to valid requests by public authorities.
                </p>

                <h3 className="text-lg font-medium mb-2 mt-4">4.4 Business Transfers</h3>
                <p className="text-muted-foreground">
                  If we are involved in a merger, acquisition, or sale of assets, your information may be transferred. We will provide notice before your information becomes subject to a different privacy policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
                <p className="text-muted-foreground mb-2">
                  We retain your information for as long as necessary to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Provide the Service to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes</li>
                  <li>Enforce our agreements</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  Query history is retained while your account is active. You can delete individual queries or request account deletion at any time.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
                <p className="text-muted-foreground mb-2">
                  We implement appropriate technical and organizational measures to protect your information:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Encryption in transit (HTTPS/TLS)</li>
                  <li>Password hashing using industry-standard algorithms</li>
                  <li>Secure session management</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
                <p className="text-muted-foreground mb-2">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                  <li><strong>Objection:</strong> Object to processing of your data</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  To exercise these rights, please contact us through the contact page or your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h2>
                <p className="text-muted-foreground mb-2">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Maintain your session and keep you logged in</li>
                  <li>Remember your preferences</li>
                  <li>Analyze usage patterns</li>
                  <li>Improve Service performance</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  You can control cookies through your browser settings. Disabling cookies may affect Service functionality.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our Service is not intended for children under 13 years of age. We do not knowingly collect information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using the Service, you consent to such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Continued use of the Service after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
                <p className="text-muted-foreground mb-2">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Through our Contact page</li>
                  <li>Via your account support channels</li>
                  <li>By email at the address provided in your account settings</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. GDPR Compliance (EU Users)</h2>
                <p className="text-muted-foreground mb-2">
                  If you are in the European Union, we process your data based on the following legal grounds:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Performance of contract (providing the Service)</li>
                  <li>Legitimate interests (improving the Service, fraud prevention)</li>
                  <li>Legal obligation (compliance with laws)</li>
                  <li>Consent (where explicitly provided)</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  You have the right to lodge a complaint with a supervisory authority if you believe we have violated your data protection rights.
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

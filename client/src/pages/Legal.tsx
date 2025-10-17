import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, Lock } from "lucide-react";

export default function Legal() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-serif text-foreground">Terms & Privacy</h1>
        <p className="text-xl text-muted-foreground">
          Legal information and privacy policies
        </p>
      </div>

      <Tabs defaultValue="terms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="terms" data-testid="tab-terms">
            <FileText className="h-4 w-4 mr-2" />
            Terms of Service
          </TabsTrigger>
          <TabsTrigger value="privacy" data-testid="tab-privacy">
            <Lock className="h-4 w-4 mr-2" />
            Privacy Policy
          </TabsTrigger>
          <TabsTrigger value="copyright" data-testid="tab-copyright">
            <Shield className="h-4 w-4 mr-2" />
            Copyright
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terms">
          <Card className="p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-foreground">Terms of Service</h2>
              <p className="text-sm text-muted-foreground">Last updated: October 17, 2025</p>

              <h3 className="text-foreground mt-6">1. Acceptance of Terms</h3>
              <p className="text-foreground dark:text-foreground">
                By accessing and using the Trisandhya Sadhana App, you accept and agree to be bound by 
                the terms and provision of this agreement.
              </p>

              <h3 className="text-foreground mt-6">2. Use License</h3>
              <p className="text-foreground dark:text-foreground">
                Permission is granted to use this application for personal, non-commercial spiritual 
                practice and study. This license shall automatically terminate if you violate any of 
                these restrictions.
              </p>

              <h3 className="text-foreground mt-6">3. User Conduct</h3>
              <p className="text-foreground dark:text-foreground">You agree to:</p>
              <ul className="text-foreground dark:text-foreground">
                <li>Use the app respectfully and for its intended spiritual purposes</li>
                <li>Not misuse or abuse any features or content provided</li>
                <li>Respect the sacred nature of the content and teachings</li>
                <li>Not attempt to reverse engineer or compromise the app's security</li>
              </ul>

              <h3 className="text-foreground mt-6">4. Content and Services</h3>
              <p className="text-foreground dark:text-foreground">
                We strive to provide accurate and authentic spiritual content. However, we do not 
                guarantee that all information will be error-free. Content is provided "as is" for 
                educational and spiritual purposes.
              </p>

              <h3 className="text-foreground mt-6">5. Modifications</h3>
              <p className="text-foreground dark:text-foreground">
                We reserve the right to modify these terms at any time. Continued use of the app after 
                changes constitutes acceptance of the modified terms.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-foreground">Privacy Policy</h2>
              <p className="text-sm text-muted-foreground">Last updated: October 17, 2025</p>

              <h3 className="text-foreground mt-6">1. Information We Collect</h3>
              <p className="text-foreground dark:text-foreground">We collect information that you provide directly to us:</p>
              <ul className="text-foreground dark:text-foreground">
                <li>Account information (email, name)</li>
                <li>Usage data (progress tracking, preferences)</li>
                <li>Device information (for notifications and alarms)</li>
              </ul>

              <h3 className="text-foreground mt-6">2. How We Use Your Information</h3>
              <p className="text-foreground dark:text-foreground">Your information is used to:</p>
              <ul className="text-foreground dark:text-foreground">
                <li>Provide and improve our services</li>
                <li>Send notifications and reminders</li>
                <li>Track your spiritual progress</li>
                <li>Customize your experience</li>
              </ul>

              <h3 className="text-foreground mt-6">3. Data Storage and Security</h3>
              <p className="text-foreground dark:text-foreground">
                We implement appropriate security measures to protect your personal information. 
                Your data is stored securely and is only accessible to authorized personnel.
              </p>

              <h3 className="text-foreground mt-6">4. Third-Party Services</h3>
              <p className="text-foreground dark:text-foreground">
                We may use third-party services for analytics and cloud storage. These services 
                have their own privacy policies and we encourage you to review them.
              </p>

              <h3 className="text-foreground mt-6">5. Your Rights</h3>
              <p className="text-foreground dark:text-foreground">You have the right to:</p>
              <ul className="text-foreground dark:text-foreground">
                <li>Access your personal data</li>
                <li>Request data correction or deletion</li>
                <li>Opt-out of notifications</li>
                <li>Export your data</li>
              </ul>

              <h3 className="text-foreground mt-6">6. Contact Us</h3>
              <p className="text-foreground dark:text-foreground">
                If you have questions about this privacy policy, please contact us at 
                support@kalkiavatar.org
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="copyright">
          <Card className="p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-foreground">Copyright & Content Attribution</h2>
              <p className="text-sm text-muted-foreground">Last updated: October 17, 2025</p>

              <h3 className="text-foreground mt-6">1. App Copyright</h3>
              <p className="text-foreground dark:text-foreground">
                © 2024-2025 Trisandhya Sadhana App. All rights reserved.
              </p>
              <p className="text-foreground dark:text-foreground">
                The design, structure, and arrangement of this application are protected by 
                copyright law. Unauthorized reproduction or distribution is prohibited.
              </p>

              <h3 className="text-foreground mt-6">2. Content Sources</h3>
              <p className="text-foreground dark:text-foreground">
                Spiritual content, teachings, and scriptures are sourced from:
              </p>
              <ul className="text-foreground dark:text-foreground">
                <li>
                  <strong>Bhavishya Malika:</strong> Authentic spiritual teachings and content 
                  from{" "}
                  <a 
                    href="https://bhavishyamalika.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    bhavishyamalika.com
                  </a>
                </li>
                <li><strong>Sacred Scriptures:</strong> Ancient texts and religious literature</li>
                <li><strong>Audio/Video Content:</strong> Devotional media and teachings</li>
              </ul>

              <h3 className="text-foreground mt-6">3. Respect for Sacred Content</h3>
              <p className="text-foreground dark:text-foreground">
                All spiritual content should be treated with reverence and respect. It is provided 
                for personal spiritual development and study only.
              </p>

              <h3 className="text-foreground mt-6">4. User-Generated Content</h3>
              <p className="text-foreground dark:text-foreground">
                Any content you create or upload retains your copyright, but you grant us a 
                license to use it within the app for providing our services.
              </p>

              <h3 className="text-foreground mt-6">5. Fair Use</h3>
              <p className="text-foreground dark:text-foreground">
                Content is provided for educational and spiritual purposes under fair use 
                principles. Commercial use or redistribution is strictly prohibited.
              </p>

              <h3 className="text-foreground mt-6">6. DMCA Compliance</h3>
              <p className="text-foreground dark:text-foreground">
                If you believe your copyright has been infringed, please contact us at 
                support@kalkiavatar.org with detailed information.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

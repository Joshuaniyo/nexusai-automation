import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = { title: 'Privacy Policy', description: 'How NexusAI Automation collects, uses, protects, and deletes account, content, integration, and Google Search Console data.' };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" lastUpdated="July 19, 2026">
    <p>This Privacy Policy explains how NexusAI Automation (&quot;NexusAI,&quot; &quot;we,&quot; &quot;us&quot;) handles information when you visit our website, create an account, connect a service, generate content, or use our publishing and analytics features.</p>

    <h2>1. Information We Collect</h2>
    <ul><li><strong>Account data:</strong> name, email address, profile identifier, authentication events, plan tier, and account preferences.</li><li><strong>User content:</strong> prompts, generated articles, social copy, schemas, media URLs, connected asset domains, webhook configuration, schedules, and generation history.</li><li><strong>Integration data:</strong> platform account names, connection status, destination identifiers, OAuth access tokens, and Telegram bot credentials supplied by you.</li><li><strong>Google Search Console data:</strong> authorized property identifiers, permission levels, clicks, impressions, click-through rate, average position, and date-grouped performance rows.</li><li><strong>Technical data:</strong> security logs, browser/device information, IP-derived diagnostics, cookie preferences, and service error telemetry.</li><li><strong>Billing data:</strong> subscription and transaction status received from Lemon Squeezy. Full payment-card details are handled by the payment provider and are not stored by NexusAI.</li></ul>

    <h2>2. How We Use Information</h2>
    <p>We use information to authenticate users, generate requested content, save workspaces, display analytics, deliver approved content, administer subscriptions, prevent fraud and abuse, troubleshoot the service, answer support requests, and meet legal obligations. We do not sell, rent, trade, or broker user content, connected asset data, integration credentials, or Google user data.</p>

    <h2>3. Google Search Console and Limited Use</h2>
    <p>NexusAI requests the <code>webmasters.readonly</code> scope only after you choose to connect Google Search Console. This permission lets us list properties you can access and display read-only Search Analytics metrics inside your Site Analytics dashboard. NexusAI cannot edit a Search Console property, submit removals, change indexing settings, or publish content through this scope.</p>
    <p>Information received from Google APIs is used only to provide or improve the user-facing analytics features you request. We do not use Google user data for advertising, retargeting, credit decisions, sale to data brokers, or training generalized artificial-intelligence models. We do not transfer it except to service providers acting for us, when needed for security, with your direction and consent, or when legally required. Our use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including its Limited Use requirements.</p>

    <h2>4. Storage and Security</h2>
    <p>Account, content, and integration records are stored in Supabase-backed infrastructure with row-level ownership controls. Social access tokens and bot credentials are encrypted by NexusAI using authenticated AES-256-GCM encryption before storage. Encryption keys and secret API credentials are restricted to server environments. We use HTTPS in transit, authenticated server routes, least-privilege access, signature verification, and platform ownership checks. No security program can guarantee absolute protection, and users must protect their own account and integration credentials.</p>

    <h2>5. Service Providers and Disclosures</h2>
    <p>We use service providers for hosting and deployment, authentication and database services, AI text and image processing, payment administration, email/support, and user-authorized platform integrations. These providers process information only as needed to deliver their contracted services and under their applicable terms. We may also disclose information to comply with law, protect users or the service, investigate abuse, or complete a corporate transaction subject to appropriate notice and safeguards.</p>

    <h2>6. Retention, Deletion, and Token Removal</h2>
    <p>Generated packages remain until you delete them or your account is deleted, subject to limited backups and legal retention. Disconnecting LinkedIn or Telegram deletes the corresponding stored connection record and encrypted credential. You may revoke Google access through your Google Account permissions; after revocation, NexusAI can no longer retrieve fresh Search Console data. To request account deletion, export assistance, or removal of stored personal data, contact <a href="mailto:privacy@nexusai-automation.com">privacy@nexusai-automation.com</a>. We verify requests before acting.</p>

    <h2>7. Cookies and Analytics</h2>
    <p>Essential browser storage supports authentication, security, and saved consent choices. Optional public-site analytics load only after you accept analytics cookies through the consent banner. You can clear browser storage to reset your choice.</p>

    <h2>8. Your Choices and Rights</h2>
    <p>Depending on your location, you may have rights to access, correct, delete, restrict, object to, or receive a portable copy of personal data, and to withdraw consent. You may manage generated content and integrations in the dashboard or submit a verified request to our privacy contact. You may also complain to your local data-protection authority.</p>

    <h2>9. International Processing, Children, and Changes</h2>
    <p>Our providers may process information in countries other than yours using applicable safeguards. NexusAI is not directed to children under 16, and we do not knowingly collect their personal information. Material changes to this policy will be posted here with a revised date and, where required, additional notice or consent.</p>

    <h2>10. Contact</h2><p>Privacy questions and data requests: <a href="mailto:privacy@nexusai-automation.com">privacy@nexusai-automation.com</a>.</p>
  </LegalPage>;
}

import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = { title: 'Terms of Service', description: 'Terms governing use of the NexusAI Automation content generation, analytics, and publishing platform.' };

export default function TermsPage() {
  return <LegalPage title="Terms of Service" lastUpdated="July 19, 2026">
    <p>These Terms form an agreement between you and NexusAI Automation governing the website, dashboard, APIs, integrations, content-generation tools, analytics, and publishing services. By creating an account or using the service, you agree to these Terms and our Privacy Policy.</p>

    <h2>1. Eligibility and Accounts</h2><p>You must have legal capacity to enter this agreement and be at least 16 years old. You must provide accurate account information, protect credentials, maintain control of connected websites and social accounts, and promptly report unauthorized use. You are responsible for activity performed through your account.</p>

    <h2>2. Service and Plans</h2><p>NexusAI provides AI-assisted content generation, structured data, image prompts and media, connected assets, Search Console reporting, and scheduled delivery features. The Free Tier remains available without a time limit. Paid features, allowances, models, and limits may change prospectively with reasonable notice.</p>

    <h2>3. Acceptable Use</h2><p>You may not use NexusAI to create, store, or distribute:</p><ul><li>illegal content, credible threats, exploitation, harassment, or instructions facilitating serious wrongdoing;</li><li>fraud, phishing, impersonation, deceptive reviews, fabricated endorsements, or materially misleading claims;</li><li>spam, unauthorized bulk messaging, malware, credential theft, or attempts to bypass platform safeguards;</li><li>content that infringes privacy, publicity, copyright, trademark, or other rights;</li><li>sensitive personal-data profiling or automated decisions producing unlawful or high-impact discrimination;</li><li>content or automation that violates the rules of Google, LinkedIn, Telegram, a connected website, or another third-party service.</li></ul>

    <h2>4. AI Output and User Review</h2><p>AI-generated output may be inaccurate, incomplete, outdated, similar to other material, or unsuitable for your purpose. You must review facts, citations, claims, rights, disclosures, accessibility, and platform compliance before publication. NexusAI does not provide legal, medical, financial, or other professional advice. Automated publishing does not remove your editorial responsibility.</p>

    <h2>5. Search Performance and Third-Party Platforms</h2><p>Search indexing, rankings, impressions, clicks, citation by answer engines, and social reach are controlled by third parties and can fluctuate. NexusAI does not guarantee indexing, ranking position, traffic, revenue, engagement, uptime of third-party APIs, or continued access to any external platform. Analytics may be delayed, sampled, incomplete, or subject to provider limits.</p>

    <h2>6. Integrations and Tokens</h2><p>You authorize NexusAI to use connected credentials only to perform features you select. You represent that you may connect each account, website, bot, webhook, and property. You may disconnect social integrations in the dashboard and revoke Google access through your Google Account. We may remove or disable tokens when they expire, appear compromised, violate policy, or are no longer needed.</p>

    <h2>7. User Content and Intellectual Property</h2><p>You retain rights you hold in prompts and content. You grant NexusAI a limited license to host, process, reproduce, and transmit that material solely to operate, secure, and improve the requested service. You must have all rights needed for submitted material and publication. NexusAI software, branding, interface, and documentation remain protected by applicable intellectual-property laws.</p>

    <h2>8. Billing, Cancellation, and Refunds</h2><p>Paid subscriptions are processed by Lemon Squeezy as Merchant of Record and renew for the selected billing period until cancelled. Cancellation stops future renewal and ordinarily leaves paid access active through the current period. Refund eligibility is governed by our Refund Policy and applicable law.</p>

    <h2>9. Suspension and Termination</h2><p>You may stop using the service at any time. We may restrict or terminate access for material breach, unlawful conduct, security risk, nonpayment, abuse of providers, or conduct that threatens users or infrastructure. Where practicable, we will provide notice and an opportunity to export user-controlled content, unless prohibited or unsafe.</p>

    <h2>10. Disclaimers and Liability</h2><p>To the extent permitted by law, the service is provided &quot;as is&quot; and &quot;as available&quot; without implied warranties of merchantability, fitness, non-infringement, accuracy, or uninterrupted operation. NexusAI is not responsible for publication decisions, third-party platform actions, lost rankings, indexing changes, lost profits, lost opportunities, or indirect, incidental, special, consequential, or punitive damages. To the extent liability cannot be excluded, our aggregate liability arising from the service will not exceed the amount you paid NexusAI for the service during the six months before the event giving rise to the claim. Nothing excludes liability that applicable law does not permit us to exclude.</p>

    <h2>11. Indemnity and General Terms</h2><p>You will defend and indemnify NexusAI against third-party claims arising from your content, connected destinations, violation of law, or breach of these Terms, to the extent permitted by law. If a provision is unenforceable, the remainder remains effective. Failure to enforce a provision is not a waiver. These Terms may be updated prospectively; material changes will be communicated where required.</p>

    <h2>12. Contact</h2><p>Terms and legal questions: <a href="mailto:legal@nexusai-automation.com">legal@nexusai-automation.com</a>.</p>
  </LegalPage>;
}

import { LegalPage } from '@/components/legal/legal-page';

export default function PrivacyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .prose-invert h2 { font-size: 1.25rem; font-weight: 600; color: hsl(210,20%,95%); margin-top: 2rem; margin-bottom: 0.75rem; }
        .prose-invert h3 { font-size: 1.1rem; font-weight: 600; color: hsl(210,20%,95%); margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .prose-invert p { font-size: 0.95rem; color: hsl(215,16%,65%); line-height: 1.7; margin-bottom: 1rem; }
        .prose-invert ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose-invert li { font-size: 0.95rem; color: hsl(215,16%,65%); margin-bottom: 0.5rem; }
        .prose-invert strong { color: hsl(210,20%,95%); font-weight: 500; }
        .prose-invert a { color: hsl(199,89%,48%); text-decoration: underline; }
      ` }} />
      <LegalPage title="Privacy Policy" lastUpdated="July 8, 2026">
        <p>
          NexusAI Automation (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information
          when you use our AI content automation platform.
        </p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, including:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
          <li><strong>Payment Information:</strong> Billing details processed securely through Lemon Squeezy, our Merchant of Record.</li>
          <li><strong>Content Data:</strong> Keywords, generated content, and assets you create using our platform.</li>
          <li><strong>Usage Data:</strong> Information about how you interact with our services, including feature usage and performance metrics.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our AI content generation services</li>
          <li>Process payments and manage subscriptions through Lemon Squeezy</li>
          <li>Send you technical notices, updates, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Monitor and analyze trends, usage, and activities</li>
          <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
        </ul>

        <h2>3. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information
          against unauthorized access, alteration, disclosure, or destruction. Your payment information
          is processed securely by Lemon Squeezy, which maintains PCI DSS compliance.
        </p>

        <h2>4. Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to collect and track information about your browsing activities.
          You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
        </p>

        <h2>5. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Lemon Squeezy:</strong> Payment processing and subscription management</li>
          <li><strong>Supabase:</strong> Database and authentication services</li>
          <li><strong>Google Gemini AI:</strong> AI content generation</li>
        </ul>

        <h2>6. GDPR Compliance (EU Users)</h2>
        <p>
          If you are located in the European Union, you have certain data protection rights under GDPR.
          You may request access to, correction of, or deletion of your personal data.
          To exercise these rights, please contact us at privacy@nexusai-automation.com.
        </p>

        <h2>7. CCPA Compliance (California Users)</h2>
        <p>
          California residents have the right to know what personal information we collect,
          request deletion of their information, and opt out of the sale of personal information.
          We do not sell personal information.
        </p>

        <h2>8. Data Retention</h2>
        <p>
          We retain your personal information for as long as your account is active or as needed to provide services.
          Content data is stored securely and may be retained for service improvement and analytics purposes.
        </p>

        <h2>9. Children&apos;s Privacy</h2>
        <p>
          Our services are not directed to individuals under 16 years of age.
          We do not knowingly collect personal information from children.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
          <br />
          Email: privacy@nexusai-automation.com
          <br />
          Address: NexusAI Automation, Support Team
        </p>
      </LegalPage>
    </>
  );
}

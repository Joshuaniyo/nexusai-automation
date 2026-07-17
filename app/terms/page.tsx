import { LegalPage } from '@/components/legal/legal-page';

export default function TermsPage() {
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
      <LegalPage title="Terms of Service" lastUpdated="July 8, 2026">
        <p>
          Welcome to NexusAI Automation. By accessing or using our AI content automation platform,
          you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read them carefully.
        </p>

        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms constitute a legally binding agreement between you and NexusAI Automation
          regarding your use of our services, APIs, and platform.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          NexusAI Automation provides an AI-powered content generation platform that enables users
          to create SEO-optimized blog posts, JSON-LD schemas, and social media content.
          Services include:
        </p>
        <ul>
          <li>AI content generation powered by Google Gemini</li>
          <li>Multi-tenant asset management</li>
          <li>JSON-LD structured data automation</li>
          <li>Multi-platform content distribution</li>
        </ul>

        <h2>3. User Accounts and Responsibilities</h2>
        <p>
          To access certain features, you must create an account. You are responsible for:
        </p>
        <ul>
          <li>Providing accurate and complete registration information</li>
          <li>Maintaining the security of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of unauthorized use</li>
        </ul>

        <h2>4. Acceptable Use Policy</h2>
        <p>You agree not to use our services to:</p>
        <ul>
          <li>Generate harmful, illegal, or misleading content</li>
          <li>Infringe upon intellectual property rights of others</li>
          <li>Distribute spam or unsolicited communications</li>
          <li>Attempt to circumvent security measures</li>
          <li>Interfere with or disrupt service operations</li>
          <li>Use the service for any unlawful purpose</li>
        </ul>

        <h2>5. Subscription and Payments</h2>
        <p>
          Payment processing is handled by Lemon Squeezy, our Merchant of Record. By subscribing,
          you agree to:
        </p>
        <ul>
          <li>Pay applicable subscription fees</li>
          <li>Provide accurate billing information</li>
          <li>Authorize recurring charges until cancellation</li>
        </ul>
        <p>
          Subscription fees are billed monthly. You may cancel at any time through your account
          or by contacting support.
        </p>

        <h2>6. Service Availability</h2>
        <p>
          We strive for 99.9% uptime but do not guarantee uninterrupted service.
          Scheduled maintenance will be communicated in advance when possible.
          We may suspend or terminate service for violations of these Terms.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          Content generated using our platform remains your property. You grant us a limited
          license to process content through our AI systems. Our platform, including software,
          design, and documentation, is protected by intellectual property rights.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          NexusAI Automation is provided &quot;as is&quot; without warranties of any kind.
          We are not liable for indirect, incidental, or consequential damages arising
          from use of our services.
        </p>

        <h2>9. Indemnification</h2>
        <p>
          You agree to indemnify NexusAI Automation against claims arising from your
          use of services, violation of these Terms, or infringement of any third-party rights.
        </p>

        <h2>10. Termination</h2>
        <p>
          We may terminate or suspend your account at any time for violations of these Terms.
          Upon termination, your right to use services ceases immediately.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the jurisdiction in which NexusAI Automation
          is established, without regard to conflict of law principles.
        </p>

        <h2>12. Contact Information</h2>
        <p>
          For questions about these Terms, please contact us at:
          <br />
          Email: legal@nexusai-automation.com
        </p>
      </LegalPage>
    </>
  );
}

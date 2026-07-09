import { LegalPage } from '@/components/legal/legal-page';

export default function RefundPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .prose-invert h2 { font-size: 1.25rem; font-weight: 600; color: hsl(210,20%,95%); margin-top: 2rem; margin-bottom: 0.75rem; }
        .prose-invert h3 { font-size: 1.1rem; font-weight: 600; color: hsl(210,20%,95%); margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .prose-invert p { font-size: 0.95rem; color: hsl(215,16%,65%); line-height: 1.7; margin-bottom: 1rem; }
        .prose-invert ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose-invert li { font-size: 0.95rem; color: hsl(215,16%,65%); margin-bottom: 0.5rem; }
        .prose-invert strong { color: hsl(210,20%,95%); font-weight: 500; }
      ` }} />
      <LegalPage title="Refund & Cancellation Policy" lastUpdated="July 8, 2026">
        <p>
          This Refund and Cancellation Policy outlines the terms for subscription cancellations
          and refund requests for NexusAI Automation services processed through Dodo Payments.
        </p>

        <h2>1. Subscription Cancellation</h2>
        <p>
          You may cancel your subscription at any time. Upon cancellation:
        </p>
        <ul>
          <li>Your subscription will remain active until the end of the current billing period</li>
          <li>You will not be charged for subsequent billing cycles</li>
          <li>You will retain access to premium features until the subscription period ends</li>
          <li>Your generated content and assets will remain accessible</li>
        </ul>

        <h2>2. 14-Day Refund Policy</h2>
        <p>
          We offer a 14-day money-back guarantee for new subscriptions. If you are not satisfied
          with our service, you may request a full refund within 14 days of your initial purchase.
        </p>
        <p>
          To request a refund:
        </p>
        <ul>
          <li>Contact our support team at refunds@nexusai-automation.com</li>
          <li>Provide your account email and order ID</li>
          <li>Refunds are processed within 5-10 business days</li>
        </ul>

        <h2>3. Non-Refundable Scenarios</h2>
        <p>The following situations are not eligible for refunds:</p>
        <ul>
          <li>Requests made after the 14-day refund window</li>
          <li>Subscriptions that have been renewed (auto-renewals)</li>
          <li>Violations of our Terms of Service resulting in account termination</li>
          <li>Partial months or unused subscription time</li>
          <li>Downgrade requests from Premium to Free tier</li>
        </ul>

        <h2>4. Chargeback Policy</h2>
        <p>
          If you believe a charge was unauthorized, please contact us first before initiating
          a chargeback with your bank. We are committed to resolving disputes fairly and promptly.
        </p>
        <p>
          Initiating a chargeback without contacting us may result in:
        </p>
        <ul>
          <li>Immediate suspension of your account</li>
          <li>Loss of access to generated content and assets</li>
          <li>Inability to create new accounts in the future</li>
        </ul>

        <h2>5. Refund Processing</h2>
        <p>
          Approved refunds are processed through Dodo Payments, our Merchant of Record.
          Refunds will be credited to your original payment method within:
        </p>
        <ul>
          <li>Credit/Debit Cards: 5-10 business days</li>
          <li>Digital Wallets: 3-5 business days</li>
        </ul>

        <h2>6. Subscription Renewals</h2>
        <p>
          Subscriptions automatically renew at the end of each billing period unless cancelled.
          You will receive an email reminder 7 days before each renewal.
        </p>

        <h2>7. Plan Changes</h2>
        <p>
          When changing plans:
        </p>
        <ul>
          <li>Upgrades take effect immediately</li>
          <li>Downgrades take effect at the end of the current billing period</li>
          <li>No prorated refunds for downgrades</li>
        </ul>

        <h2>8. Contact for Refunds</h2>
        <p>
          For all refund and cancellation requests, contact:
          <br />
          Email: refunds@nexusai-automation.com
          <br />
          Response time: 24-48 hours
        </p>

        <h2>9. Dispute Resolution</h2>
        <p>
          If you have any issues with charges or refunds, please contact our support team.
          We are committed to resolving all disputes fairly and will work with you to find
          a satisfactory solution.
        </p>
      </LegalPage>
    </>
  );
}

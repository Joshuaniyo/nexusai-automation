import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';

export const metadata: Metadata = { title: 'Refund and Cancellation Policy', description: 'Subscription cancellation, billing-cycle, refund, and digital service credit terms for NexusAI Automation.' };

export default function RefundPage() {
  return <LegalPage title="Refund & Cancellation Policy" lastUpdated="July 19, 2026">
    <p>This policy applies to paid NexusAI Automation subscriptions and prepaid digital service credits. Lemon Squeezy acts as our Merchant of Record and may administer billing, taxes, invoices, cancellations, and approved refunds.</p>

    <h2>1. Permanent Free Tier</h2><p>The Free Tier is not a timed trial and does not require cancellation. Feature and usage limits shown on the Pricing page apply.</p>

    <h2>2. Subscription Cancellation</h2><p>You may cancel a paid subscription at any time through the available billing-management flow or by contacting <a href="mailto:refunds@nexusai-automation.com">refunds@nexusai-automation.com</a>. Cancellation prevents the next renewal. Unless law requires otherwise, Premium access remains available through the end of the already-paid billing period, and unused time is not automatically prorated or credited.</p>

    <h2>3. Refund Eligibility</h2><p>Refund requests must be submitted within 14 calendar days of the initial Premium purchase. We may approve a full or partial refund when:</p><ul><li>the purchase was duplicated;</li><li>a verified unauthorized purchase is reported promptly;</li><li>a material technical defect prevented meaningful use and support could not restore access within a reasonable period; or</li><li>applicable consumer law requires a refund.</li></ul><p>Submitting a request does not guarantee approval. We may consider account usage, generated output, consumed provider costs, prior refunds, abuse, and evidence supplied with the request.</p>

    <h2>4. Renewals, Partial Periods, and Plan Changes</h2><p>Renewal charges are generally non-refundable once a new billing period begins, except where required by law or where a duplicate or verified billing error occurred. We do not ordinarily refund partial months, partial years, unused scheduled time, downgrades, or failure to cancel before renewal. Upgrades and downgrades follow the timing and proration displayed by the checkout or billing portal.</p>

    <h2>5. Digital Service Credits</h2><p>Purchased or promotional generation credits are digital service units, not stored monetary value. Credits already consumed for AI, image, delivery, or other provider operations are non-refundable. Unused purchased credits may be considered only when included in an otherwise eligible refund request. Promotional, bonus, expired, or complimentary credits have no cash value and are not refundable or transferable.</p>

    <h2>6. Exclusions</h2><p>Refunds may be denied for requests outside the eligibility window, dissatisfaction with generated style after substantial use, search-ranking or traffic fluctuations, third-party platform restrictions, account suspension for policy violations, misuse, or costs caused by inaccurate integration configuration. These exclusions do not limit non-waivable statutory rights.</p>

    <h2>7. Request and Processing</h2><p>Email <a href="mailto:refunds@nexusai-automation.com">refunds@nexusai-automation.com</a> with the account email, Lemon Squeezy order or invoice identifier, purchase date, reason, and relevant troubleshooting details. Approved refunds are returned through the original payment method by the Merchant of Record. Bank and payment-network processing time varies and is outside NexusAI&apos;s control.</p>

    <h2>8. Charge Disputes</h2><p>Please contact us promptly about an unrecognized or incorrect charge so we can investigate. Nothing in this policy prevents you from exercising rights available through your bank, payment provider, or applicable law.</p>

    <h2>9. Contact</h2><p>Cancellation and refund requests: <a href="mailto:refunds@nexusai-automation.com">refunds@nexusai-automation.com</a>.</p>
  </LegalPage>;
}

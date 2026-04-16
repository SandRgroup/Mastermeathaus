import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Policies.css';

const MembershipTerms = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page">
      <div className="policy-container">
        <Button onClick={() => navigate('/')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <h1>Membership Terms & Conditions</h1>
        <p className="policy-intro">These Membership Terms apply to all MasterMeatBox subscription plans, including Pit Pass, Prime Select, Master Cut, and Black Label.</p>
        <p className="policy-intro">By purchasing a membership, you agree to these terms.</p>

        <section>
          <h2>🔁 Billing & Recurring Payments</h2>
          <p>All memberships are billed on a recurring basis (monthly or yearly). By subscribing, you authorize MasterMeatBox to automatically charge your selected payment method at each billing cycle.</p>
          <p>Charges will continue until the membership is canceled.</p>
        </section>

        <section>
          <h2>💰 Yearly Membership Discount</h2>
          <p>Yearly memberships receive a 30% discount off the total annual price (calculated as monthly price × 12, then discounted by 30%).</p>
          <p>Example: If monthly = $99/mo, yearly = ($99 × 12) - 30% = $831.60/year</p>
        </section>

        <section>
          <h2>🧾 Renewal</h2>
          <p>Your membership automatically renews at the end of each billing period unless canceled before the next billing date. The renewal will be charged at the then-current membership rate.</p>
        </section>

        <section>
          <h2>❌ Cancellation Policy</h2>
          <p>You may cancel your membership at any time through your account or by contacting support.</p>
          <ul>
            <li>Cancellation takes effect at the end of the current billing period</li>
            <li>You will not be charged again after cancellation</li>
            <li>No partial refunds are issued for unused time within a billing cycle</li>
          </ul>
        </section>

        <section>
          <h2>📦 Membership Benefits</h2>
          <p>Active memberships include access to discounts, exclusive products, and member-only offers.</p>
          <p>Benefits are only available while your membership is active and will end once the subscription expires or is canceled.</p>
        </section>

        <section>
          <h2>⚠️ No Refund Policy for Membership Fees</h2>
          <p>All membership fees are non-refundable once charged. This includes situations where the membership is not used or benefits are not accessed.</p>
        </section>

        <section>
          <h2>💳 Price Changes</h2>
          <p>MasterMeatBox reserves the right to update membership pricing. If pricing changes, customers will be notified in advance before the new rate takes effect on the next billing cycle.</p>
        </section>

        <section>
          <h2>📍 Free Tier (Pit Pass)</h2>
          <p>The Pit Pass membership is free and does not include recurring charges unless upgraded to a paid plan.</p>
          <p>Free users may receive promotional access, but no paid billing occurs unless they upgrade.</p>
        </section>

        <section>
          <h2>⚖️ Account Responsibility</h2>
          <p>Customers are responsible for maintaining their account information and ensuring payment methods are valid to avoid service interruption.</p>
        </section>

        <section className="contact-section">
          <h3>Contact Information</h3>
          <p>📧 Email: <a href="mailto:hello@mastersmeathaus.com">hello@mastersmeathaus.com</a></p>
          <p>📱 Phone: <a href="tel:8178072489">817-807-2489</a></p>
          <p>🕒 Support Hours: Monday – Friday, 9 AM – 5 PM (CST)</p>
          <p className="contact-note">For questions about your membership, please include your account email and membership type.</p>
        </section>
      </div>
    </div>
  );
};

export default MembershipTerms;

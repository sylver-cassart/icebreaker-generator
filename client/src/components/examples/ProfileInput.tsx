import { useState } from 'react';
import ProfileInput from '../ProfileInput';

export default function ProfileInputExample() {
  const [value, setValue] = useState(
    "Head of Growth at CartPilot. We help Shopify stores lift AOV via post-purchase bundles. Scaled from 0→$2.3m ARR in 18 months. Talks: LTV, retention, onboarding. Stack: GA4, Klaviyo, Customer.io, Mixpanel. Latest post: cohort analysis template for D2C. Based in Brisbane."
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ProfileInput value={value} onChange={setValue} />
    </div>
  );
}
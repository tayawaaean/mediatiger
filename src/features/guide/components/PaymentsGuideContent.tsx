import React from 'react';

const PaymentsGuideContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
        <p className="text-slate-400">
          Welcome to the payment setup guide. Learn how to set up your payment information and manage your earnings.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">What is Tipalti?</h3>
        <p className="text-slate-400">
          Tipalti is our trusted payment processing partner that enables us to securely and efficiently process commission payments to our creators. Through Tipalti's platform, you can easily set up your payment preferences, manage your tax information, and track your payment history - all while ensuring your financial data remains secure and compliant with global regulations. Tipalti is trusted by 5,000+ businesses, including companies like Spotify, Twitch, GoDaddy, and more.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3">Setting up your Tipalti Account</h3>
        <p className="text-slate-400 mb-4">
          When your first commission payment is ready to be processed, you'll receive an email invitation with a secure link to set up your Tipalti account. You'll need to provide your ACH and tax information to enable payments. Please note that you will only receive a Tipalti invitation if you have a commission payment scheduled for processing. Additionally, if you do not set up your Tipalti account at all, then you will not receive any commission payments.
        </p>
        <div className="mt-4">
          <p className="text-slate-400 font-medium mb-2">Example screenshot of email invite below:</p>
          <img 
            src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images/tipalti-invite-example.png"
            alt="Tipalti Email Invitation Example"
            className="rounded-lg border border-border"
          />
        </div>
      </section>
    </div>
  );
};

export default PaymentsGuideContent;
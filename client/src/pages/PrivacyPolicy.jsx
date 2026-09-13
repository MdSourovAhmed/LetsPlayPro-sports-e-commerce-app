import { LegalPage } from "../components/ui/LegalPage";

export default function PrivacyPolicy() {
  return (
    <LegalPage eyebrow="Your Data" title="Privacy Policy" updatedAt="July 2026">
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">What we collect</h2>
        <p>
          When you create an account, place an order, or contact support, we collect the
          information you provide directly - name, email, shipping address, and phone number.
          We also collect basic usage data (pages viewed, products browsed) to improve the site.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">How we use it</h2>
        <p>
          Your information is used to process orders, provide customer support, and - if you've
          opted in - send you updates about new arrivals and promotions. We never sell your
          personal information to third parties.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">Payment information</h2>
        <p>
          Card payments are processed directly by Stripe. We never see or store your full card
          number - only a payment confirmation is passed back to us.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">Your rights</h2>
        <p>
          You can request a copy of your data, ask us to correct it, or request deletion of your
          account at any time by contacting support.
        </p>
      </section>
    </LegalPage>
  );
}

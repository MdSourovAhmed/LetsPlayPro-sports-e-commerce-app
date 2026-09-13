import { LegalPage } from "../components/ui/LegalPage";

export default function Terms() {
  return (
    <LegalPage eyebrow="Please Read" title="Terms &amp; Conditions" updatedAt="July 2026">
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">Using our site</h2>
        <p>
          By placing an order with LetsPlayPro, you confirm that the information you provide is
          accurate and that you're authorized to use the payment method selected at checkout.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">Pricing &amp; availability</h2>
        <p>
          Prices and stock levels are updated regularly but aren't guaranteed until your order is
          confirmed. If an item becomes unavailable after you order it, we'll contact you with
          options before charging your payment method.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">Order cancellations</h2>
        <p>
          Orders can be cancelled while in "pending" or "confirmed" status from your Account. Once
          an order has shipped, it can no longer be cancelled - please use our returns process
          instead.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">Limitation of liability</h2>
        <p>
          LetsPlayPro is not liable for indirect or incidental damages arising from the use of
          products purchased through the site, beyond the value of the order itself.
        </p>
      </section>
    </LegalPage>
  );
}

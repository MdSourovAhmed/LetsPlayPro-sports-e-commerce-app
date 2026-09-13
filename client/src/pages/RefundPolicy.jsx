import { LegalPage } from "../components/ui/LegalPage";

export default function RefundPolicy() {
  return (
    <LegalPage eyebrow="Returns &amp; Refunds" title="Refund Policy" updatedAt="July 2026">
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">7-day return window</h2>
        <p>
          You can return unused items in their original packaging within 7 days of delivery for a
          full refund. Start a return from Account &rarr; Orders &rarr; select the order.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">Refund timing</h2>
        <p>
          Once we receive and inspect your return, refunds are issued to your original payment
          method within 5-7 business days. Cash on Delivery orders are refunded via bank transfer
          or store credit.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">Non-returnable items</h2>
        <p>
          For hygiene reasons, items like mouthguards and compression wear can't be returned once
          the packaging is opened, unless defective.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-base font-medium text-ink">Damaged or wrong items</h2>
        <p>
          If your order arrives damaged or incorrect, contact support within 48 hours with photos
          and we'll arrange a free replacement or refund - no return shipping required.
        </p>
      </section>
    </LegalPage>
  );
}

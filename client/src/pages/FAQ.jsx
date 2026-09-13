import { SectionHeading } from "../components/ui/SectionHeading";
import { FaqItem } from "../components/ui/FaqItem";

const FAQS = [
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 3-5 business days within the country. You'll get a tracking link by email as soon as your order ships.",
  },
  {
    question: "What's your return policy?",
    answer:
      "We offer a 7-day free return window on unused items in their original packaging. Start a return from your Order Details page or contact support.",
  },
  {
    question: "Do you offer cash on delivery?",
    answer: "Yes - Cash on Delivery, bKash, Nagad, and card payments (via Stripe) are all supported at checkout.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Go to Account, then Orders, and select the order you want to track. You'll see its current status and a full timeline.",
  },
  {
    question: "Are the products authentic?",
    answer: "Yes, every product is sourced directly from the brand or an authorized distributor.",
  },
  {
    question: "Can I change or cancel my order after placing it?",
    answer:
      "Orders can be cancelled from Account, then Orders, while they're still pending or confirmed. Once an order ships, it can no longer be modified.",
  },
];

export default function FAQ() {
  return (
    <div className="container-page py-20">
      <SectionHeading eyebrow="Need Help?" title="Frequently Asked Questions" />
      <div className="mx-auto mt-10 max-w-2xl">
        {FAQS.map((faq) => (
          <FaqItem key={faq.question} {...faq} />
        ))}
      </div>
    </div>
  );
}

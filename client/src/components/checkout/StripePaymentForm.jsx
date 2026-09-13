import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";

/**
 * @param {{onPaymentSuccess: (paymentIntentId: string) => void, isPlacingOrder: boolean}} props
 */
export function StripePaymentForm({ onPaymentSuccess, isPlacingOrder }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "Payment failed. Please check your card details.");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onPaymentSuccess(paymentIntent.id);
    } else {
      setErrorMessage("Payment could not be completed. Please try again.");
    }
    setIsProcessing(false);
  }

  const busy = isProcessing || isPlacingOrder;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
      <button type="submit" disabled={!stripe || busy} className="btn-primary">
        <Lock className="h-3.5 w-3.5" />
        {busy ? "Processing…" : "Pay & Place Order"}
      </button>
    </form>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Elements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { deliveryInfoSchema } from "../utils/validationSchemas";
import { useCartStore, selectCartSubtotal } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { orderApi } from "../api/orderApi";
import { paymentApi } from "../api/paymentApi";
import { getStripe } from "../lib/stripe";
import { CheckoutSummary } from "../components/checkout/CheckoutSummary";
import { PaymentMethodSelector } from "../components/checkout/PaymentMethodSelector";
import { StripePaymentForm } from "../components/checkout/StripePaymentForm";
import { SectionHeading } from "../components/ui/SectionHeading";
import { EmptyState } from "../components/ui/EmptyState";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();
  const rawItems = useCartStore((s) => s.items);
  const items = useMemo(() => rawItems.filter((i) => !i.savedForLater), [rawItems]);
  // const items = useCartStore((s) => s.items.filter((i) => !i.savedForLater));
  const subtotal = useCartStore(selectCartSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState("delivery"); // 'delivery' | 'payment'
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [clientSecret, setClientSecret] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [stripeError, setStripeError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(deliveryInfoSchema),
    defaultValues: {
      firstName: user?.name?.split(" ")[0] ?? "",
      lastName: user?.name?.split(" ").slice(1).join(" ") ?? "",
      email: user?.email ?? "",
    },
  });

  function onDeliverySubmit(values) {
    setDeliveryInfo(values);
    setStep("payment");
  }

  // Create the Stripe PaymentIntent as soon as the card method is selected in the payment step.
  // Sends cart items, not a total — the backend computes the authoritative charge amount
  // itself from product-service's live prices. See paymentApi.js for why.
  useEffect(() => {
    if (step !== "payment" || paymentMethod !== "card" || clientSecret) return;

    let cancelled = false;
    const intentItems = items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      size: i.size ?? undefined,
    }));

    paymentApi
      .createStripeIntent(intentItems)
      .then((res) => {
        if (!cancelled) setClientSecret(res.clientSecret);
      })
      .catch((err) => {
        if (cancelled) return;
        // 409 means specific items failed pricing/stock validation — surface which ones
        // rather than a generic error, so the person knows what to fix in their cart.
        const issues = err.details?.issues;
        if (issues?.length) {
          setStripeError(`Some items in your cart changed: ${issues.map((i) => i.reason).join("; ")}`);
        } else {
          setStripeError(err.message || "Couldn't initialize card payment.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [step, paymentMethod, clientSecret, items]);

  const orderPayload = useMemo(
    () => ({
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        size: i.size ?? undefined,
        priceAtPurchase: i.discountPrice ?? i.price,
      })),
      deliveryInfo,
      paymentMethod,
      totalAmount: subtotal,
    }),
    [items, deliveryInfo, paymentMethod,subtotal]
  );

  async function placeOrder(extra = {}) {
    setIsPlacingOrder(true);
    try {
      const res = await orderApi.placeOrder({ ...orderPayload, ...extra });
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/order-success", { state: { order: res.data } });
    } catch (err) {
      toast.error(err.message || "Couldn't place your order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  function handleNonCardSubmit(e) {
    e.preventDefault();
    placeOrder();
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-10">
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10" strokeWidth={1.25} />}
          title="Your cart is empty"
          description="Add something to your cart before checking out."
          action={
            <Link to="/shop" className="btn-primary mt-2">
              Continue Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <SectionHeading eyebrow="Almost There" title="Checkout" align="left" />

      <div className="mt-10 flex flex-col gap-10 lg:flex-row">
        <div className="flex-1">
          <div className="mb-8 flex gap-6 text-sm">
            <span className={step === "delivery" ? "font-medium text-ink" : "text-ink-soft"}>
              1. Delivery
            </span>
            <span className={step === "payment" ? "font-medium text-ink" : "text-ink-soft"}>
              2. Payment
            </span>
          </div>

          {step === "delivery" && (
            <form onSubmit={handleSubmit(onDeliverySubmit)} noValidate className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input placeholder="First Name" {...register("firstName")} className="input-field" />
                  {errors.firstName && <p className="mt-1 text-xs text-danger">{errors.firstName.message}</p>}
                </div>
                <div>
                  <input placeholder="Last Name" {...register("lastName")} className="input-field" />
                  {errors.lastName && <p className="mt-1 text-xs text-danger">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <input type="email" placeholder="Email" {...register("email")} className="input-field" />
                {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
              </div>

              <div>
                <input placeholder="Street Address" {...register("street")} className="input-field" />
                {errors.street && <p className="mt-1 text-xs text-danger">{errors.street.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input placeholder="City" {...register("city")} className="input-field" />
                  {errors.city && <p className="mt-1 text-xs text-danger">{errors.city.message}</p>}
                </div>
                <div>
                  <input placeholder="ZIP / Postal Code" {...register("zip")} className="input-field" />
                  {errors.zip && <p className="mt-1 text-xs text-danger">{errors.zip.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input placeholder="Country" {...register("country")} className="input-field" />
                  {errors.country && <p className="mt-1 text-xs text-danger">{errors.country.message}</p>}
                </div>
                <div>
                  <input placeholder="Phone" {...register("phone")} className="input-field" />
                  {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
                </div>
              </div>

              <textarea
                placeholder="Order notes (optional)"
                rows={3}
                {...register("orderNotes")}
                className="input-field resize-none"
              />

              <button type="submit" className="btn-primary mt-2">
                Continue to Payment
              </button>
            </form>
          )}

          {step === "payment" && (
            <div className="flex flex-col gap-6">
              <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

              {paymentMethod === "card" ? (
                stripeError ? (
                  <p className="text-sm text-danger">{stripeError}</p>
                ) : clientSecret ? (
                  <Elements stripe={getStripe()} options={{ clientSecret }}>
                    <StripePaymentForm
                      isPlacingOrder={isPlacingOrder}
                      onPaymentSuccess={(paymentIntentId) => placeOrder({ paymentIntentId })}
                    />
                  </Elements>
                ) : (
                  <p className="text-sm text-ink-soft">Preparing secure payment…</p>
                )
              ) : (
                <form onSubmit={handleNonCardSubmit}>
                  <button type="submit" disabled={isPlacingOrder} className="btn-primary">
                    {isPlacingOrder ? "Placing order…" : "Place Order"}
                  </button>
                </form>
              )}

              <button
                onClick={() => setStep("delivery")}
                className="text-left text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
              >
                ← Back to delivery info
              </button>
            </div>
          )}
        </div>

        <div className="w-full lg:w-96 lg:shrink-0">
          <CheckoutSummary subtotal={subtotal} items={items} />
        </div>
      </div>
    </div>
  );
}

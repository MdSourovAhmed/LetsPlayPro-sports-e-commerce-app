import { CreditCard, Smartphone, Wallet, Truck } from "lucide-react";
import { cn } from "../../utils/cn";

const METHODS = [
  { value: "cod", label: "Cash on Delivery", icon: Truck },
  { value: "card", label: "Credit / Debit Card (Stripe)", icon: CreditCard },
  { value: "bkash", label: "bKash", icon: Smartphone },
  { value: "nagad", label: "Nagad", icon: Wallet },
];

/**
 * @param {{value: string, onChange: (v: string) => void}} props
 */
export function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      {METHODS.map(({ value: methodValue, label, icon: Icon }) => (
        <label
          key={methodValue}
          className={cn(
            "flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition-colors",
            value === methodValue ? "border-ink" : "border-line hover:border-ink-soft"
          )}
        >
          <input
            type="radio"
            name="paymentMethod"
            value={methodValue}
            checked={value === methodValue}
            onChange={() => onChange(methodValue)}
            className="accent-ink"
          />
          <Icon className="h-4 w-4 text-ink-soft" strokeWidth={1.5} />
          {label}
        </label>
      ))}
    </div>
  );
}

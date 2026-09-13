import { Plus, Trash2 } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const emptyVariant = { name: '', value: '', skuSuffix: '', priceModifier: 0, stock: 0 };

/**
 * @param {{variants: Array, onChange: (next: Array) => void}} props
 */
export function VariantsEditor({ variants, onChange }) {
  function addVariant() {
    onChange([...variants, { ...emptyVariant }]);
  }

  function updateVariant(index, field, value) {
    onChange(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  function removeVariant(index) {
    onChange(variants.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {variants.length === 0 && (
        <p className="text-sm text-muted dark:text-muted-dark">
          No variants yet. Use these for options that change price or have their own stock —
          e.g. "Color: Red" or "Size: XL". For sizes that don't affect price/stock, use the
          Specifications section's Size field instead.
        </p>
      )}

      {variants.map((variant, i) => (
        <div key={i} className="grid grid-cols-12 items-end gap-2 rounded-lg border border-border dark:border-border-dark p-3">
          <div className="col-span-3">
            <Input
              label="Name"
              placeholder="Color"
              value={variant.name}
              onChange={(e) => updateVariant(i, 'name', e.target.value)}
            />
          </div>
          <div className="col-span-3">
            <Input
              label="Value"
              placeholder="Red"
              value={variant.value}
              onChange={(e) => updateVariant(i, 'value', e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Price +/-"
              type="number"
              step="0.01"
              value={variant.priceModifier}
              onChange={(e) => updateVariant(i, 'priceModifier', Number(e.target.value))}
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Stock"
              type="number"
              min="0"
              value={variant.stock}
              onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))}
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <Button type="button" variant="ghost" size="sm" icon={Trash2} onClick={() => removeVariant(i)}>
              Remove
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addVariant} className="self-start">
        Add variant
      </Button>
    </div>
  );
}

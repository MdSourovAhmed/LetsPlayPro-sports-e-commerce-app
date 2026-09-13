import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { productApi } from '@/api/productApi';
import { productSchema } from '@/utils/validationSchemas';
import { SPORTS, PRODUCT_TYPES, PRODUCT_STATUSES } from '@/utils/constants';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';
import { ImageUploader } from '@/components/products/ImageUploader';
import { VariantsEditor } from '@/components/products/VariantsEditor';

const emptyDefaults = {
  name: '',
  sku: '',
  description: '',
  shortDescription: '',
  price: '',
  discountPrice: '',
  stock: 0,
  sport: '',
  type: '',
  brand: '',
  status: 'active',
  featured: false,
  bestSell: false,
  tags: '',
  specifications: { size: '', color: '', material: '', weight: '', pack: '', capacity: '' },
};

function Section({ title, description, children }) {
  return (
    <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5">
      <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted dark:text-muted-dark">{description}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Select({ label, error, className, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-ink dark:text-ink-dark">{label}</label>}
      <select
        className={`h-10 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark focus:border-brand-500 ${className || ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  );
}

export default function ProductFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(productSchema), defaultValues: emptyDefaults });

  useEffect(() => {
    if (!isEditMode) return;

    productApi
      .getById(id)
      .then(({ data }) => {
        const product = data.product;
        reset({
          name: product.name,
          sku: product.sku || '',
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          price: product.price,
          discountPrice: product.discountPrice ?? '',
          stock: product.stock,
          sport: product.sport || '',
          type: product.type || '',
          brand: product.brand || '',
          status: product.status,
          featured: product.featured,
          bestSell: product.bestSell,
          tags: (product.tags || []).join(', '),
          specifications: {
            size: (product.specifications?.size || []).join(', '),
            color: product.specifications?.color || '',
            material: product.specifications?.material || '',
            weight: product.specifications?.weight || '',
            pack: product.specifications?.pack || '',
            capacity: product.specifications?.capacity || '',
          },
        });
        setImages(product.images || []);
        setVariants(product.variants || []);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoadingProduct(false));
  }, [id, isEditMode, reset]);

  async function onSubmit(values) {
    const payload = {
      ...values,
      discountPrice: values.discountPrice === '' ? null : Number(values.discountPrice),
      tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      specifications: {
        ...values.specifications,
        size: values.specifications.size
          ? values.specifications.size.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      },
      images,
      variants,
    };

    try {
      if (isEditMode) {
        await productApi.update(id, payload);
        toast.success('Product updated');
      } else {
        await productApi.create(payload);
        toast.success('Product created');
      }
      navigate('/products');
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (isLoadingProduct) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Link to="/products" className="text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
          {isEditMode ? 'Edit Product' : 'New Product'}
        </h1>
      </div>

      <Section title="Basic Information">
        <Input label="Product Name" error={errors.name?.message} {...register('name')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="SKU (optional — auto-generated if left blank)" {...register('sku')} />
          <Input label="Brand" error={errors.brand?.message} {...register('brand')} />
        </div>
        <Input label="Short Description" hint="Shown on product cards and search results" error={errors.shortDescription?.message} {...register('shortDescription')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink dark:text-ink-dark">Full Description</label>
          <textarea
            rows={5}
            className="rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 py-2 text-sm text-ink dark:text-ink-dark focus:border-brand-500"
            {...register('description')}
          />
        </div>
      </Section>

      <Section title="Pricing & Stock">
        <div className="grid grid-cols-3 gap-4">
          <Input label="Price" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
          <Input label="Discount Price (optional)" type="number" step="0.01" error={errors.discountPrice?.message} {...register('discountPrice')} />
          <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} />
        </div>
      </Section>

      <Section title="Categorization" description="Sport and Type match the storefront's filter checkboxes — pick from the list so this product is actually discoverable.">
        <div className="grid grid-cols-3 gap-4">
          <Select label="Sport" error={errors.sport?.message} {...register('sport')}>
            <option value="">Select sport…</option>
            {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select label="Type" error={errors.type?.message} {...register('type')}>
            <option value="">Select type…</option>
            {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Status" {...register('status')}>
            {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </Select>
        </div>
        <Input label="Tags (comma-separated)" hint="e.g. summer, clearance, new-arrival" {...register('tags')} />
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-ink dark:text-ink-dark">
            <input type="checkbox" className="h-4 w-4 rounded accent-brand-500" {...register('featured')} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-ink dark:text-ink-dark">
            <input type="checkbox" className="h-4 w-4 rounded accent-brand-500" {...register('bestSell')} />
            Best Seller
          </label>
        </div>
      </Section>

      <Section title="Images">
        <ImageUploader images={images} onChange={setImages} />
      </Section>

      <Section title="Specifications" description="All optional — fill in whatever's relevant for this product.">
        <div className="grid grid-cols-3 gap-4">
          <Input label="Sizes (comma-separated)" hint="e.g. S, M, L, XL" {...register('specifications.size')} />
          <Input label="Color" {...register('specifications.color')} />
          <Input label="Material" {...register('specifications.material')} />
          <Input label="Weight" {...register('specifications.weight')} />
          <Input label="Pack" {...register('specifications.pack')} />
          <Input label="Capacity" {...register('specifications.capacity')} />
        </div>
      </Section>

      <Section title="Variants" description="Options that change price or track their own stock (e.g. Color: Red at +$5).">
        <VariantsEditor variants={variants} onChange={setVariants} />
      </Section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
          Cancel
        </Button>
        <Button type="submit" icon={Save} isLoading={isSubmitting}>
          {isEditMode ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}

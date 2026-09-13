import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_IMAGES = 4;
const MAX_FILE_SIZE_MB = 5;

/**
 * @param {{images: string[], onChange: (next: string[]) => void}} props
 * `images` holds a mix of existing Cloudinary URLs (editing a product) and freshly-picked
 * base64 data URIs (new uploads) — the backend's uploadImages() accepts either form directly,
 * so no client-side distinction is needed before submit.
 */
export function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const files = Array.from(fileList);
    const remainingSlots = MAX_IMAGES - images.length;

    if (files.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'} (max ${MAX_IMAGES})`);
    }

    const toProcess = files.slice(0, remainingSlots);

    toProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} isn't an image`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} is over ${MAX_FILE_SIZE_MB}MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => onChange([...images, reader.result]);
      reader.onerror = () => toast.error(`Couldn't read ${file.name}`);
      reader.readAsDataURL(file);
    });
  }

  function removeAt(index) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-3">
        {images.map((src, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border dark:border-border-dark">
            <img src={src} alt={`Product image ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                Primary
              </span>
            )}
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border dark:border-border-dark text-muted dark:text-muted-dark transition-colors hover:border-brand-500 hover:text-brand-500"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs">Add image</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = ''; // allow re-selecting the same file later
        }}
      />

      <p className="text-xs text-muted dark:text-muted-dark">
        Up to {MAX_IMAGES} images, {MAX_FILE_SIZE_MB}MB each. The first image is used as the primary thumbnail everywhere in the storefront.
      </p>
    </div>
  );
}

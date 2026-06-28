import type { Category } from '@/lib/types';
import { CATEGORY_LABEL } from '@/lib/types';

export default function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-black/70">
      <span className={category === 'hair' ? 'dot-hair' : 'dot-skin'} />
      {CATEGORY_LABEL[category]}
    </span>
  );
}

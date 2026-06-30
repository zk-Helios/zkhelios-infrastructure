import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 font-mono text-caption text-paper-faint">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-amber-300">
              {item.label}
            </Link>
          ) : (
            <span className="text-paper">{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight className="size-3.5 text-ink-300" />}
        </span>
      ))}
    </nav>
  );
}

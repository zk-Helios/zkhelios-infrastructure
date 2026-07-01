import Link from "next/link";
import { Github, Twitter } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Logo } from "@/components/ui/logo";
import { SunRayDivider } from "@/components/ui/sun-ray-divider";
import { FOOTER_COLUMNS } from "@/lib/constants";

const SOCIALS = [
  { label: "X", href: "https://x.com/zk_Helios", Icon: Twitter },
  { label: "GitHub", href: "https://github.com/zk-Helios/zk-Helios", Icon: Github },
];

export function Footer() {
  return (
    <Section as="footer" flush className="border-t border-ink-400 bg-ink-900 py-16">
      <SunRayDivider className="mb-14" />

      <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <Logo size={28} />
          <p className="mt-4 text-body text-paper-muted">
            Privacy-preserving verification on Solana. Prove what matters, reveal only what you
            choose.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-status-online/30 bg-status-online/10 px-3 py-1.5">
            <span className="size-2 animate-pulse rounded-full bg-status-online" />
            <span className="font-mono text-caption text-status-online">Built on Solana</span>
          </div>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4 className="font-mono text-caption uppercase tracking-[0.16em] text-paper-faint">
              {col.heading}
            </h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-body text-paper-muted transition-colors duration-200 hover:text-amber-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-ink-400 pt-8 md:flex-row">
        <p className="font-mono text-caption text-paper-faint">
          © {new Date().getFullYear()} zkHelios Labs. All rights reserved.
        </p>
        <div className="flex items-center gap-6 font-mono text-caption text-paper-faint">
          <span>Slot 287,442,901</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">~3,200 TPS</span>
        </div>
        <div className="flex items-center gap-2">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-9 place-items-center rounded-md border border-ink-400 text-paper-muted transition-colors duration-200 hover:border-amber-500/40 hover:text-amber-300"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}

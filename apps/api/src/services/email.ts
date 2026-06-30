import type { Env } from "../config/env";

/**
 * Email sender (Resend HTTP API, no SDK dep). No-ops with a log when
 * RESEND_API_KEY is unset, so notifications degrade gracefully in dev.
 */
export async function sendEmail(
  env: Env,
  opts: { to: string; subject: string; html: string },
): Promise<{ sent: boolean }> {
  if (!env.RESEND_API_KEY) {
    // eslint-disable-next-line no-console
    console.log(`[email] (disabled) would send "${opts.subject}" → ${opts.to}`);
    return { sent: false };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    return { sent: res.ok };
  } catch {
    return { sent: false };
  }
}

/** Brand-consistent HTML shell (amber on black). */
function shell(title: string, body: string, unsubscribeUrl?: string): string {
  return `<!doctype html><html><body style="margin:0;background:#000;color:#FAFAFA;font-family:Inter,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="font-size:22px;font-weight:700">zk<span style="color:#F5A524">Helios</span></div>
    <h1 style="font-size:24px;margin:28px 0 12px">${title}</h1>
    <div style="color:#A1A1AA;font-size:15px;line-height:1.6">${body}</div>
    ${unsubscribeUrl ? `<p style="margin-top:32px;color:#71717A;font-size:12px"><a style="color:#71717A" href="${unsubscribeUrl}">Unsubscribe</a></p>` : ""}
  </div></body></html>`;
}

export const templates = {
  emailVerify: (code: string) =>
    shell("Verify your email", `Your zkHelios verification code is:<div style="font-size:32px;font-weight:700;color:#F5A524;letter-spacing:6px;margin:16px 0">${code}</div>It expires in 10 minutes.`),
  proofVerified: (proofAccount: string, url: string) =>
    shell("Proof verified ✓", `Your proof <code>${proofAccount.slice(0, 8)}…</code> was verified on-chain. <a style="color:#F5A524" href="${url}">View it</a>.`, url),
  watchedActivity: (pubkey: string, url: string) =>
    shell("Watched address activity", `New activity from <code>${pubkey.slice(0, 8)}…</code>. <a style="color:#F5A524" href="${url}">View</a>.`, url),
  announcement: (title: string, body: string) => shell(title, body),
};

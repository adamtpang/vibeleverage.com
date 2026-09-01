import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What vibeleverage.com collects, what stays in your browser, and what leaves it.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
        vibeleverage.com
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Plain English, because it is short enough not to need anything else.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            What stays in your browser
          </h2>
          <p>
            Your evidence answers, lever scores, comparable audit receipts,
            completed plays, and any API key you paste into the chat live in
            your browser&rsquo;s localStorage. They are not sent to our servers,
            and we cannot see them. Clearing your browser storage deletes them.
            A one-time domain migration can transfer this evidence, but never
            your API key, from archimedes.life to vibeleverage.com.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            What leaves your browser
          </h2>
          <p>
            If you join the list, your email address is delivered to our inbox
            via FormSubmit. If you use the chat, your messages and current
            scores are sent to Anthropic&rsquo;s API to generate the reply; we
            do not store them. If you paste your own API key, it is used only
            to relay your own messages and is never stored or logged
            server-side.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            Analytics
          </h2>
          <p>
            We use Vercel Analytics: anonymous, cookie-free page counts. No
            advertising trackers, no fingerprinting, no data sales, ever.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            Questions
          </h2>
          <p>
            Email adamtpang@gmail.com and a human answers. Last updated August
            2026.
          </p>
        </section>
      </div>

      <Link
        href="/"
        className="mt-12 inline-block font-mono text-xs uppercase tracking-[0.2em] text-lever underline-offset-4 hover:underline"
      >
        Back to the clinic
      </Link>
    </main>
  );
}

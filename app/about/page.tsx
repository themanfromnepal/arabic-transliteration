import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Arabic Transliteration',
  description:
    'Learn how Arabic Transliteration helps English speakers connect the sounds of Quranic Arabic to the written Uthmani script.',
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <nav className="mb-8">
        <Link
          href="/"
          className="text-sm text-[#2f6f5c] underline underline-offset-2 hover:text-[#a7863a]"
        >
          ← Home
        </Link>
      </nav>

      <h1 className="mb-6 text-3xl font-bold text-[#18352f]">About</h1>

      <p className="mb-6 text-base leading-7 text-[#18352f]">
        Arabic Transliteration is a free tool that helps English speakers bridge the sound of
        Quranic Arabic they already know and the written Uthmani script.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-[#2f6f5c]">How it works</h2>
      <p className="mb-4 text-base leading-7 text-[#18352f]">
        Type the way a word sounds to you in English — for example, <em>rahman</em>,{' '}
        <em>bismillah</em>, or <em>alhamdulillah</em> — and the tool finds the exact Quranic word.
        Each result shows:
      </p>
      <ul className="mb-6 list-disc space-y-2 pl-6 text-base leading-7 text-[#18352f]">
        <li>The Arabic word in full Uthmani script with all diacritics</li>
        <li>A scholarly transliteration using standard notation</li>
        <li>The English meaning at the word level</li>
        <li>The root letters the word is built from</li>
        <li>Every verse in the Quran where the word appears (sura:ayah)</li>
        <li>Audio pronunciation from a recitation of the Quran</li>
      </ul>
      <p className="mb-6 text-base leading-7 text-[#18352f]">
        Arabic script is also accepted directly as input.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-[#2f6f5c]">Who it is for</h2>
      <ul className="mb-6 list-disc space-y-3 pl-6 text-base leading-7 text-[#18352f]">
        <li>
          A new Muslim who has memorized short suras by sound and wants to begin reading them from
          the written page.
        </li>
        <li>
          A learner who grew up hearing Quranic recitation at home but never built fluent reading
          ability and now wants to study independently.
        </li>
        <li>
          A student or researcher who encounters a Quranic term and wants a fast, accurate lookup
          with full context.
        </li>
      </ul>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-[#2f6f5c]">Coverage</h2>
      <p className="mb-6 text-base leading-7 text-[#18352f]">
        Version 1 covers approximately 3,500 Quranic lemmas — the core vocabulary of the Quran. Each
        entry is drawn from authoritative, cited sources.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-[#2f6f5c]">Privacy and offline use</h2>
      <p className="mb-6 text-base leading-7 text-[#18352f]">
        No server, no accounts, no tracking. Everything runs in your browser. After your first
        visit, the site works without an internet connection. Your theme and font size preferences
        are saved locally on your device only.
      </p>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-[#2f6f5c]">Open source</h2>
      <p className="mb-6 text-base leading-7 text-[#18352f]">
        MIT-licensed. Project code is MIT; data sources are used under their respective licenses —
        see the{' '}
        <Link
          href="/credits"
          className="text-[#a7863a] underline underline-offset-2 hover:text-[#2f6f5c]"
        >
          Credits page
        </Link>
        .
      </p>
    </main>
  );
}

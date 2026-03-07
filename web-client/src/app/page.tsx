import Link from "next/link";
import { Zap, FileText, CheckCircle, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-black">
            <Zap size={22} className="fill-black text-black" />
            GigMarket
          </Link>
          {/* Actions */}
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 transition hover:text-black"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative w-full bg-black overflow-hidden px-6 pt-20 pb-32 md:pt-28 md:pb-40">
        {/* Subtle grid background effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-center text-center">
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Get local tasks done <span className="text-zinc-500">instantly.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-zinc-400 md:text-xl leading-relaxed">
            Connect with vetted, skilled providers in your neighborhood in real-time. Whether you need an extra pair of hands or a specialized expert, we&apos;ve got you covered.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="group flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
            >
              Get Started <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/docs"
              className="flex h-14 w-full sm:w-auto items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 px-8 text-base font-medium text-white transition hover:bg-zinc-800 hover:border-zinc-700"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-zinc-100 bg-zinc-50 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-zinc-500 text-lg">
              Three simple steps to checking off your to-do list.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 text-black">
                <FileText size={28} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-black">1. Post a Job</h3>
              <p className="max-w-xs text-zinc-500 leading-relaxed">
                Describe what you need done, set your price, and pinpoint your location.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 text-black">
                <Zap size={28} className="fill-black text-black" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-black">2. Get Matched</h3>
              <p className="max-w-xs text-zinc-500 leading-relaxed">
                Local providers are notified instantly and can claim your gig in seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 text-black">
                <CheckCircle size={28} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-black">3. Job Completed</h3>
              <p className="max-w-xs text-zinc-500 leading-relaxed">
                Sit back while the provider gets the job done. Payment is seamless and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="px-6 py-24 md:py-32 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
          Ready to get started?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-zinc-500 text-lg">
          Join thousands of users who trust GigMarket to get things done quickly and reliably.
        </p>
        <Link
          href="/register"
          className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-black px-10 text-base font-medium text-white transition hover:bg-zinc-800 active:scale-95"
        >
          Create an Account
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-black">
            <Zap size={18} className="fill-black text-black" />
            GigMarket
          </Link>
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} GigMarket Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-8 inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
          Browser game prototype
        </div>
        <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
          Stay Caffeinated
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-300">
          Survive the workday by keeping your caffeine in the green zone while meetings, reviews, and bugs try to knock your rhythm loose.
        </p>

        <Link
          href="/play"
          className="mt-10 rounded-lg bg-green-500 px-8 py-4 text-lg font-bold text-gray-950 shadow-lg shadow-green-500/20 transition hover:bg-green-400 focus:outline-none focus:ring-4 focus:ring-green-300/40"
        >
          Start Shift
        </Link>

        <div className="mt-10 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-green-300">Stay balanced</p>
            <p className="mt-1 text-sm text-gray-400">Score faster in the optimal caffeine zone.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-amber-300">Pick drinks</p>
            <p className="mt-1 text-sm text-gray-400">Each drink has its own boost and cooldown.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-sky-300">Watch events</p>
            <p className="mt-1 text-sm text-gray-400">Code Review can lock drinks at the worst moment.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

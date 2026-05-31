import StartMatchingForm from "@/components/StartMatchingForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">RoomieScout</h1>
          <p className="text-sm text-slate-500">
            Start a new roommate compatibility test by talking to our AI.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <StartMatchingForm />
        </section>
      </div>
    </main>
  );
}

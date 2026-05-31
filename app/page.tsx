import SubmitForm from "@/components/SubmitForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">RoomieScout</h1>
          <p className="text-sm text-slate-500">
            Enter some text and submit to call the backend.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SubmitForm />
        </section>
      </div>
    </main>
  );
}

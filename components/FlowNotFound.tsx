import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function FlowNotFound({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper bg-grid px-5">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-line bg-paper text-2xl">
          🔍
        </div>
        <h1 className="mt-5 font-display text-xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{message}</p>
        <Link href="/" className="mt-6 inline-block">
          <Button variant="accent">Start a new test</Button>
        </Link>
      </Card>
    </main>
  );
}

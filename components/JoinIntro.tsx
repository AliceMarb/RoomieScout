"use client";

import { useState } from "react";
import JoinForm from "@/components/JoinForm";
import type { Persona } from "@/lib/business-logic";

function firstName(email?: string): string {
  if (!email) return "Your potential roommate";
  const local = email.split("@")[0];
  const name = local.split(/[._\-+]/)[0];
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export default function JoinIntro({
  flowId,
  initiatorPersona,
  initiatorEmail,
}: {
  flowId: string;
  initiatorPersona: Persona;
  initiatorEmail?: string;
}) {
  const [open, setOpen] = useState(true);
  const senderName = firstName(initiatorEmail);

  return (
    <>
      {/* Page content always rendered underneath */}
      <JoinForm flowId={flowId} />

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>

            {/* Sender badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm text-slate-600">
              <span className="text-lg">{initiatorPersona.emoji}</span>
              <span>
                <span className="font-semibold text-slate-900">{senderName}</span>
                {" "}sent you a roommate test
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
              Are you two roommate material?
            </h1>

            {/* Description */}
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Answer a few questions about how you like to live. Takes about a minute —
              you&apos;ll both see a compatibility score and breakdown when you&apos;re done.
            </p>

            {/* What to expect */}
            <div className="mt-5 space-y-2 text-left">
              {[
                ["🎙", "Speak or type your answers"],
                ["🔒", "Only shared with your potential roommate"],
                ["📊", "You both see the results"],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="shrink-0">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setOpen(false)}
              className="mt-7 w-full rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-slate-700 transition-colors"
            >
              Get started →
            </button>

            <p className="mt-2.5 text-xs text-slate-400">No account needed</p>
          </div>
        </div>
      )}
    </>
  );
}

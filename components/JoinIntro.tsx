"use client";

import Image from "next/image";
import { useState } from "react";
import JoinForm from "@/components/JoinForm";
import type { Persona } from "@/concepts/personas";
import { getAvatarPublicPath } from "@/concepts/personas";

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
  const avatarSrc = getAvatarPublicPath(initiatorPersona.code);

  return (
    <>
      <JoinForm flowId={flowId} />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl text-center">
            <div className="flex flex-col items-center gap-2">
              <Image
                src={avatarSrc}
                alt={initiatorPersona.title}
                width={72}
                height={72}
                className="rounded-full object-cover ring-2 ring-slate-200"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">{senderName}</span>
                {" · "}{initiatorPersona.title}
              </div>
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
              Are you two roommate material?
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              12 quick tap-to-answer questions about how you like to live.
              Takes about 2 minutes — you&apos;ll both see your Housemate Types and a compatibility score.
            </p>

            <div className="mt-5 space-y-2 text-left">
              {[
                ["✦", "Tap to answer — no typing required"],
                ["🔒", "Only shared with your potential roommate"],
                ["📊", "You both see the results"],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="shrink-0">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
            >
              Take the quiz →
            </button>

            <p className="mt-2.5 text-xs text-slate-400">No account needed</p>
          </div>
        </div>
      )}
    </>
  );
}

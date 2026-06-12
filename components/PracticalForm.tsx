"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, Wordmark, Card, Button, RuleLabel, cn } from "@/components/ui";
import type { PracticalProfile, ApartmentSetup } from "@/concepts/pairing/practical-profile";

function OptionGroup<T extends string>({
  options, value, onChange, multi, maxSelect,
}: {
  options: { value: T; label: string }[];
  value: T | T[] | null;
  onChange: (v: T | T[]) => void;
  multi?: boolean;
  maxSelect?: number;
}) {
  function toggle(v: T) {
    if (!multi) { onChange(v); return; }
    const arr = (value as T[]) ?? [];
    if (arr.includes(v)) { onChange(arr.filter((x) => x !== v)); return; }
    if (maxSelect && arr.length >= maxSelect) return;
    onChange([...arr, v]);
  }
  function isSelected(v: T) {
    return multi ? ((value as T[]) ?? []).includes(v) : value === v;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => toggle(o.value)}
          className={cn("rounded-md border px-4 py-2.5 text-sm font-medium transition-all",
            isSelected(o.value) ? "border-accent bg-accent/10 text-ink" : "border-line bg-surface text-ink hover:border-accent/40 hover:bg-accent/5")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <RuleLabel>{label}</RuleLabel>
      {children}
    </div>
  );
}

const STEPS = ["Setup","Bathroom","Spaces","Sharing","Costs","Sleep","Cleanliness","Utilities","Money","Guests","Conflict","Dealbreakers"] as const;
type Step = (typeof STEPS)[number];
type SetupDraft = Partial<ApartmentSetup>;
type ProfileDraft = Omit<Partial<PracticalProfile>, "setup"> & { setup?: SetupDraft };

function isSetupComplete(s: SetupDraft): s is ApartmentSetup {
  return !!(s.bathrooms && s.bedrooms && s.walls && s.commonSpace && s.laundry && s.furnished && s.daytimeOccupancy);
}

export default function PracticalForm({ flowId, role }: { flowId: string; role: "initiator" | "roommate" }) {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState<ProfileDraft>({ setup: {}, dealbreakers: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step: Step = STEPS[stepIdx];
  const progress = Math.round((stepIdx / (STEPS.length - 1)) * 100);

  function set<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function setSetup<K extends keyof ApartmentSetup>(key: K, value: ApartmentSetup[K]) {
    setDraft((d) => ({ ...d, setup: { ...d.setup, [key]: value } }));
  }

  function canAdvance(): boolean {
    switch (step) {
      case "Setup": return isSetupComplete(draft.setup ?? {});
      case "Bathroom": return !!(draft.bathroomTime && draft.routineLength);
      case "Spaces": return !!(draft.livingRoomUse && draft.callsFromHome && draft.homeDuringDay);
      case "Sharing": return !!(draft.foodSharing && draft.cleaningSupplies && draft.dishesAndCookware);
      case "Costs": return !!draft.costSplit;
      case "Sleep": return !!(draft.sleepSchedule && draft.sleepType && draft.nightNoise);
      case "Cleanliness": return !!(draft.dishTolerance && draft.choreSystem);
      case "Utilities": return !!(draft.tempPreference && draft.utilitySplit);
      case "Money": return !!draft.rentReliability;
      case "Guests": return !!(draft.guestFrequency && draft.livingInPartner);
      case "Conflict": return !!(draft.conflictApproach && draft.conflictReceiving);
      case "Dealbreakers": return true;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/practical/${flowId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: draft, role }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { redirectTo } = await res.json();
      router.push(redirectTo);
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
      setSubmitting(false);
    }
  }

  function advance() {
    if (stepIdx < STEPS.length - 1) setStepIdx((i) => i + 1);
    else handleSubmit();
  }

  function stepContent() {
    switch (step) {
      case "Setup": return (
        <div className="space-y-6">
          <Field label="How many bathrooms?"><OptionGroup options={[{value:"one",label:"One"},{value:"two_plus",label:"Two or more"}]} value={draft.setup?.bathrooms??null} onChange={(v)=>setSetup("bathrooms",v as ApartmentSetup["bathrooms"])} /></Field>
          <Field label="Bedrooms separate?"><OptionGroup options={[{value:"separate",label:"Yes — private rooms"},{value:"shared",label:"Sharing a bedroom"}]} value={draft.setup?.bedrooms??null} onChange={(v)=>setSetup("bedrooms",v as ApartmentSetup["bedrooms"])} /></Field>
          <Field label="Walls and noise?"><OptionGroup options={[{value:"solid",label:"Solid walls"},{value:"thin",label:"Thin walls / adjacent"},{value:"unknown",label:"Not sure yet"}]} value={draft.setup?.walls??null} onChange={(v)=>setSetup("walls",v as ApartmentSetup["walls"])} /></Field>
          <Field label="Living room layout?"><OptionGroup options={[{value:"separate_living_room",label:"Separate living room"},{value:"open_plan",label:"Open-plan"}]} value={draft.setup?.commonSpace??null} onChange={(v)=>setSetup("commonSpace",v as ApartmentSetup["commonSpace"])} /></Field>
          <Field label="Laundry?"><OptionGroup options={[{value:"in_unit",label:"In-unit"},{value:"shared_laundromat",label:"Shared / laundromat"}]} value={draft.setup?.laundry??null} onChange={(v)=>setSetup("laundry",v as ApartmentSetup["laundry"])} /></Field>
          <Field label="Furnished?"><OptionGroup options={[{value:"fully",label:"Fully furnished"},{value:"partially",label:"Partially"},{value:"unfurnished",label:"Unfurnished"}]} value={draft.setup?.furnished??null} onChange={(v)=>setSetup("furnished",v as ApartmentSetup["furnished"])} /></Field>
          <Field label="Who's home during the day?"><OptionGroup options={[{value:"both_wfh",label:"Both WFH"},{value:"i_wfh",label:"I'm home"},{value:"i_out",label:"I'm out"},{value:"both_out",label:"Both out"},{value:"mixed",label:"Mix"}]} value={draft.setup?.daytimeOccupancy??null} onChange={(v)=>setSetup("daytimeOccupancy",v as ApartmentSetup["daytimeOccupancy"])} /></Field>
        </div>
      );
      case "Bathroom": return (
        <div className="space-y-6">
          <Field label="Bathroom time on workdays?"><OptionGroup options={[{value:"before_7am",label:"Before 7am"},{value:"7_to_9am",label:"7–9am"},{value:"9_to_11am",label:"9–11am"},{value:"no_fixed_time",label:"No fixed time"}]} value={draft.bathroomTime??null} onChange={(v)=>set("bathroomTime",v as PracticalProfile["bathroomTime"])} /></Field>
          <Field label="Morning routine length?"><OptionGroup options={[{value:"under_15min",label:"Under 15 min"},{value:"15_to_30min",label:"15–30 min"},{value:"30_to_45min",label:"30–45 min"},{value:"45min_plus",label:"45+ min"}]} value={draft.routineLength??null} onChange={(v)=>set("routineLength",v as PracticalProfile["routineLength"])} /></Field>
        </div>
      );
      case "Spaces": return (
        <div className="space-y-6">
          <Field label="Living room use?"><OptionGroup options={[{value:"stay_in_room",label:"Mostly my room"},{value:"share_sometimes",label:"Share sometimes"},{value:"main_hangout",label:"My main hang"}]} value={draft.livingRoomUse??null} onChange={(v)=>set("livingRoomUse",v as PracticalProfile["livingRoomUse"])} /></Field>
          <Field label="Video calls out loud?"><OptionGroup options={[{value:"yes_regularly",label:"Yes, regularly"},{value:"occasionally",label:"Occasionally"},{value:"no_headphones",label:"No — headphones always"}]} value={draft.callsFromHome??null} onChange={(v)=>set("callsFromHome",v as PracticalProfile["callsFromHome"])} /></Field>
          <Field label="Home during the day?"><OptionGroup options={[{value:"most_days",label:"Most days"},{value:"some_days",label:"Some days"},{value:"rarely",label:"Rarely"}]} value={draft.homeDuringDay??null} onChange={(v)=>set("homeDuringDay",v as PracticalProfile["homeDuringDay"])} /></Field>
        </div>
      );
      case "Sharing": return (
        <div className="space-y-6">
          <Field label="Food and groceries?"><OptionGroup options={[{value:"communal",label:"Communal"},{value:"separate",label:"Own shelf"},{value:"mix",label:"Mix"}]} value={draft.foodSharing??null} onChange={(v)=>set("foodSharing",v as PracticalProfile["foodSharing"])} /></Field>
          <Field label="Cleaning supplies?"><OptionGroup options={[{value:"communal",label:"Pool together"},{value:"separate",label:"Each buys their own"},{value:"mix",label:"Mix"}]} value={draft.cleaningSupplies??null} onChange={(v)=>set("cleaningSupplies",v as PracticalProfile["cleaningSupplies"])} /></Field>
          <Field label="Dishes and cookware?"><OptionGroup options={[{value:"communal",label:"Combine sets"},{value:"separate",label:"Keep mine mine"},{value:"mix",label:"Mix"}]} value={draft.dishesAndCookware??null} onChange={(v)=>set("dishesAndCookware",v as PracticalProfile["dishesAndCookware"])} /></Field>
        </div>
      );
      case "Costs": return (
        <div className="space-y-6">
          <Field label="Shared costs — how to split?"><OptionGroup options={[{value:"kitty",label:"Shared kitty"},{value:"split_each",label:"Split each purchase"},{value:"splitwise",label:"Splitwise / app"},{value:"figure_it_out",label:"Figure it out"}]} value={draft.costSplit??null} onChange={(v)=>set("costSplit",v as PracticalProfile["costSplit"])} /></Field>
        </div>
      );
      case "Sleep": return (
        <div className="space-y-6">
          <Field label="Sleep schedule?"><OptionGroup options={[{value:"early_bird",label:"Early bird (before 10:30pm)"},{value:"in_between",label:"In between"},{value:"night_owl",label:"Night owl (past midnight)"}]} value={draft.sleepSchedule??null} onChange={(v)=>set("sleepSchedule",v as PracticalProfile["sleepSchedule"])} /></Field>
          <Field label="Sleep type?"><OptionGroup options={[{value:"light_sleeper",label:"Light sleeper"},{value:"heavy_sleeper",label:"Heavy sleeper"}]} value={draft.sleepType??null} onChange={(v)=>set("sleepType",v as PracticalProfile["sleepType"])} /></Field>
          <Field label="Noise at night?"><OptionGroup options={[{value:"headphones_always",label:"Headphones always"},{value:"quiet_audio_ok",label:"Quiet audio fine"},{value:"full_volume_fine",label:"Full volume fine"}]} value={draft.nightNoise??null} onChange={(v)=>set("nightNoise",v as PracticalProfile["nightNoise"])} /></Field>
        </div>
      );
      case "Cleanliness": return (
        <div className="space-y-6">
          <Field label="Dishes in the sink?"><OptionGroup options={[{value:"same_night",label:"Done same night"},{value:"next_day",label:"Fine by next day"},{value:"few_days",label:"A few days ok"},{value:"no_preference",label:"No preference"}]} value={draft.dishTolerance??null} onChange={(v)=>set("dishTolerance",v as PracticalProfile["dishTolerance"])} /></Field>
          <Field label="Chore system?"><OptionGroup options={[{value:"rota",label:"Clear rota"},{value:"whoever_notices",label:"Whoever notices"},{value:"cleaner",label:"Hire a cleaner"},{value:"figure_it_out",label:"Figure it out"}]} value={draft.choreSystem??null} onChange={(v)=>set("choreSystem",v as PracticalProfile["choreSystem"])} /></Field>
        </div>
      );
      case "Utilities": return (
        <div className="space-y-6">
          <Field label="Temperature preference?"><OptionGroup options={[{value:"cool",label:"Cool (below 20°C)"},{value:"comfortable",label:"Comfortable (20–22°C)"},{value:"warm",label:"Warm (above 22°C)"}]} value={draft.tempPreference??null} onChange={(v)=>set("tempPreference",v as PracticalProfile["tempPreference"])} /></Field>
          <Field label="Utility bills?"><OptionGroup options={[{value:"split_evenly",label:"Split evenly"},{value:"usage_based",label:"By usage"},{value:"landlord_included",label:"Landlord-included"}]} value={draft.utilitySplit??null} onChange={(v)=>set("utilitySplit",v as PracticalProfile["utilitySplit"])} /></Field>
        </div>
      );
      case "Money": return (
        <div className="space-y-6">
          <Field label="Rent reliability?"><OptionGroup options={[{value:"always_on_time",label:"Always on time"},{value:"usually_on_time",label:"Usually — occasionally a day late"},{value:"varies",label:"It varies"}]} value={draft.rentReliability??null} onChange={(v)=>set("rentReliability",v as PracticalProfile["rentReliability"])} /></Field>
        </div>
      );
      case "Guests": return (
        <div className="space-y-6">
          <Field label="Overnight guests?"><OptionGroup options={[{value:"rarely",label:"Rarely (monthly or less)"},{value:"sometimes",label:"Sometimes (a few/month)"},{value:"often",label:"Often (weekly+)"}]} value={draft.guestFrequency??null} onChange={(v)=>set("guestFrequency",v as PracticalProfile["guestFrequency"])} /></Field>
          <Field label="Partner basically moving in?"><OptionGroup options={[{value:"need_to_discuss",label:"Would need to discuss"},{value:"fine_with_notice",label:"Fine with notice"},{value:"dealbreaker",label:"Dealbreaker"}]} value={draft.livingInPartner??null} onChange={(v)=>set("livingInPartner",v as PracticalProfile["livingInPartner"])} /></Field>
        </div>
      );
      case "Conflict": return (
        <div className="space-y-6">
          <Field label="When something's bothering you…"><OptionGroup options={[{value:"direct",label:"Address it directly"},{value:"hint_mention",label:"Mention it casually"},{value:"avoid",label:"Let it go and hope it resolves"}]} value={draft.conflictApproach??null} onChange={(v)=>set("conflictApproach",v as PracticalProfile["conflictApproach"])} /></Field>
          <Field label="Prefer to be approached…"><OptionGroup options={[{value:"direct_convo",label:"Direct face-to-face"},{value:"text_note",label:"Text or note"},{value:"just_tell_me",label:"Just tell me, any way"},{value:"figure_it_out",label:"No preference"}]} value={draft.conflictReceiving??null} onChange={(v)=>set("conflictReceiving",v as PracticalProfile["conflictReceiving"])} /></Field>
        </div>
      );
      case "Dealbreakers": return (
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">Select up to 3 true non-negotiables.</p>
          <OptionGroup
            options={[{value:"smoking",label:"Smoking indoors"},{value:"pets",label:"Pets"},{value:"cleanliness_standard",label:"Cleanliness standard"},{value:"sleep_schedule",label:"Sleep schedule"},{value:"noise_level",label:"Noise level"},{value:"guests_parties",label:"Frequent guests / parties"},{value:"sharing_food",label:"Sharing food"},{value:"religious_observance",label:"Religious observance"},{value:"other",label:"Other"}]}
            value={(draft.dealbreakers??[]) as PracticalProfile["dealbreakers"]}
            onChange={(v)=>set("dealbreakers",v as PracticalProfile["dealbreakers"])}
            multi maxSelect={3}
          />
        </div>
      );
    }
  }

  if (submitting) {
    return (
      <PageShell>
        <Wordmark />
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="mt-4 text-sm text-ink-soft">Saving your profile…</p>
        </div>
      </PageShell>
    );
  }

  const isLast = stepIdx === STEPS.length - 1;
  return (
    <PageShell>
      <Wordmark />
      <div className="mt-8">
        <p className="eyebrow text-accent">Practical assessment · Step {stepIdx + 1} of {STEPS.length}</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">{step}</h1>
      </div>
      <div className="mt-4 h-px w-full bg-line">
        <div className="h-px bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <Card className="mt-8 p-6">{stepContent()}</Card>
      <div className="mt-6 flex items-center justify-between">
        {stepIdx > 0 ? (
          <button onClick={() => setStepIdx((i) => i - 1)} className="text-xs text-ink-faint hover:text-ink-soft">← Back</button>
        ) : <span />}
        <Button variant="accent" disabled={!canAdvance()} onClick={advance} className="px-6 py-3">
          {isLast ? "Submit →" : "Continue →"}
        </Button>
      </div>
      {error && <p className="mt-3 text-sm text-accent-ink">{error}</p>}
    </PageShell>
  );
}

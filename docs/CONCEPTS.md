# RoomieScout — Concept Design

This document describes RoomieScout using Daniel Jackson's **concept design** framework. For what concepts are, the rubric, and the state notation used below (Simple State Form), see [CONCEPT-GUIDANCE.md](./CONCEPT-GUIDANCE.md).

## Non-concepts in this codebase

Things deliberately *not* modeled as concepts (see the tests in the guidance doc):

- **"Flow"** (`lib/store.ts`, `flowId`) — the implementation name for a Pairing record. The word "flow" never appears at the concept level.
- **Conversation archive** — durable storage of finished Interview transcripts; how Interview state is persisted, not a concept.
- **Avatars** — presentation of Persona types.
- **AI summary + dealbreakers table** — part of Pairing's compatibility result; that it arrives later via a background model call is implementation.
- **Turn caps, per-topic question limits, and the specific topic list** — tuning and configuration inside Interview, not structure.

## Participants are anonymous

There are no accounts. A "participant" is an opaque handle for one person taking the test once — they exist only through their interview session. Concepts are parameterized on `[Participant]`; a participant has exactly one interview and at most one persona.

---

## Concepts

---

**concept** Interview [Participant]

**purpose** conduct a structured conversation and produce a transcript

**principle**
after starting an interview and answering Scout's questions until Scout has heard enough,
the full conversation — Scout's questions and the participant's answers — is available as a transcript

**state**

```
a set of Sessions with
  a subject Participant
  a transcript seq of Messages
  a set of TopicAreas
  a status of ACTIVE or COMPLETE

a set of Messages with
  a speaker of SCOUT or PARTICIPANT
  a text String

a set of TopicAreas with
  a name String
  a status of PENDING or SATISFIED
```

**actions**

start (p: Participant): (s: Session)
**effects** create a new active session for p; Scout greets and asks the first question

respond (s: Session, answer: String): (reply: String)
**requires** s is active
**effects** record the answer; Scout replies with a follow-up or a new topic's question; when Scout has heard enough, the session becomes complete

getTranscript (s: Session): (messages: seq Message)
**effects** return all messages in s in order

---

**concept** Persona [Participant]

**purpose** assign each participant a housemate type based on their conversation

**principle**
after classifying a participant's transcript, their persona — a type and four behavioral axes — is available

**state**

```
a set of Participants with
  an optional Persona

a set of Personas with
  a code String
  a set of Axes

a set of Axes with
  a name String
  a pole of FIRST or SECOND
```

**actions**

classify (p: Participant, transcript: seq Message)
**requires** p has no persona yet
**effects** assign p a persona derived from the transcript

getPersona (p: Participant): (persona: Persona)
**requires** p has a persona
**effects** return p's persona

---

**concept** Pairing [Participant]

**purpose** connect two participants and produce their compatibility result

**principle**
after one participant creates a pairing and a second joins, once both have personas
their compatibility result is computed and available to both

**state**

```
a set of Pairings with
  an initiator Participant
  an optional joiner Participant
  an optional initiatorEmail String
  an optional result CompatibilityResult

a set of CompatibilityResults with
  a score Number
  a set of CategoryScores
  an optional summary String
  a set of DealbreakerComparisons
```

**actions**

create (p: Participant): (pr: Pairing)
**requires** p has a complete interview
**effects** create a new pairing with p as initiator

saveEmail (pr: Pairing, email: String)
**effects** record the initiator's email on pr

join (pr: Pairing, p: Participant)
**requires** pr has not been joined; p is not the initiator
**effects** record p as joiner; pr can no longer be joined

compute (pr: Pairing, persona1, transcript1, persona2, transcript2)
**requires** pr has both an initiator and a joiner
**effects** compute the compatibility result from both personas and transcripts; record it on pr

getResult (pr: Pairing): (result: CompatibilityResult)
**requires** pr has a computed result
**effects** return pr's result

---

**concept** Rendezvous [Participant]

**purpose** let two people who can't share a link find each other by naming each other

**principle**
each person independently submits their own and the other's email; whoever arrives
second is matched with whoever arrived first

**state**

```
a set of Registrations with
  a key String
  a first Participant
```

*(the key is the unordered pair of the two emails — lowercased and sorted, so both people produce the same key)*

**actions**

register (p: Participant, selfEmail, otherEmail: String): (match: Participant or waiting)
**requires** selfEmail ≠ otherEmail
**effects** if no registration exists for this email pair, record p and return waiting; otherwise return the registered participant as the match

---

**concept** Notification

**purpose** alert a person by email with a link

**state** none (fire and forget)

**actions**

send (email: String, url: String)
**effects** send an email containing a link to url

---

## Syncs

```
// When an interview finishes, classify the participant.
sync classifyOnCompletion (p: Participant, s: Session)
  when Interview.respond completes s
  Persona.classify (p, Interview.getTranscript (s))

// An initiator's finished interview creates a pairing.
sync createPairing (p: Participant): (pr: Pairing)
  when Persona.classify (p) and p arrived without a pairing
  Pairing.create (p, pr)

// The initiator saves their email so they can be notified.
sync saveEmail (pr: Pairing, email: String)
  Pairing.saveEmail (pr, email)

// The joiner follows the link: join the pairing and start their interview.
sync joinAndStart (pr: Pairing, p: Participant): (s: Session)
  Pairing.join (pr, p)
  Interview.start (p, s)

// When the joiner's persona is ready, compute and notify the initiator.
sync computeWhenReady (pr: Pairing)
  when both participants of pr have personas
  Pairing.compute (pr, …)
  Notification.send (Pairing.email (pr), resultsUrl (pr))

// Rendezvous path: when the second person registers, pair them,
// compute, and notify both.
sync matchByEmail (p1, p2: Participant)
  when Rendezvous.register returns a match
  Pairing.create / join / compute for p1 and p2
  Notification.send to both emails

// A person asks to keep their results link.
sync saveLink (pr: Pairing, email: String)
  Notification.send (email, resultsUrl (pr))
```

> **Branch note:** the sync status and TODOs below were written against the
> email-sharing/main line of the code. On older branches (e.g. ones predating the
> interview→flow handoff) classifyOnCompletion, computeWhenReady, matchByEmail and
> saveLink may not be wired yet.

---

## Code TODOs

Gaps between the concepts above and the code:

1. **Enforce `Pairing.join`'s "p is not the initiator".** The link path never collects the joiner's email, so nothing stops one person (including the initiator) from taking both interviews. Only the Rendezvous path checks the two emails differ.
2. **Enforce or drop saveEmail-before-share.** A pairing can be joined and completed with no initiator email saved, in which case the results-ready notification is silently skipped.
3. **Handle pairing expiry.** Pairings live 24h (KV TTL); a joiner following an expired link hits a dead end with no explanation.
4. **Remove or gate the legacy text path.** `app/api/flows/[flowId]/respond` accepts free text and builds a hash-based persona (`computePersona`), bypassing Interview and Persona entirely.
5. **Align code naming with concepts.** The code calls a Pairing a "flow" (`MatchingFlow`, `flowId`); consider renaming, or at minimum never let "flow" leak into user-facing copy or docs.
6. **Dead code.** `lib/assessCompatibility.ts` (unwired scorer), `lib/scoutPrompt.ts`, unused `resend` dependency.

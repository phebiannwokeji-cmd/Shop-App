# PROJECT JOURNAL

# Shop App
A running record of what was worked on, decisions made, challenges hit, and how they were handled.

# Entry 1 — Idea Refinement (Pre-Development)
Phase: Before any code. Multiple sessions, worked with AI over time.
The project didn't start as a build prompt — it started as a fuller idea for a shop record app, but one that was missing clear structure and role definitions (who does what, staff vs. owner). Rather than handing that straight to a coding tool, the idea was refined first, across multiple rounds with AI, before any development began.

# What was worked on
•	Took the raw idea and worked through it in several sessions rather than a single pass, checking it for gaps each round.
•	Identified missing rules and constraints that the original idea hadn't accounted for (e.g. what should and shouldn't be allowed to happen automatically, what needed to be traceable).
•	Clarified role boundaries — what staff should be able to do versus what should stay owner-only — since the original idea hadn't drawn that line clearly.
•	Cut scope that didn't belong in a first version, to stop the idea from growing past what was actually needed.

# Decisions made
Treat prompt refinement as its own stage of the project, separate from development — the goal was to arrive at a clean, constrained, unambiguous build prompt before writing or generating any code, rather than refining requirements mid-build.

# Outcome
A finalized build prompt covering roles, data model, features, explicit rules, and explicit out-of-scope items — used as the starting instruction for development in Antigravity.

# Entry 2 — Development in Antigravity
Phase: Single build session. One prompt, full build.
With the refined prompt ready, the actual build was handed to Antigravity as one large prompt, and the tool built the application in full rather than being fed feature-by-feature with review checkpoints in between.
Because the build happened this way, the work here wasn't a sequence of separate feature-by-feature decisions and debugging sessions in the usual sense — the meaningful decisions had already been made during the refinement stage (Entry 1), and Antigravity carried them out across the whole app in one pass. What follows is what actually got produced, mapped to the areas the prompt specified:

# What was produced
•	Login / roles — staff and owner logins, with role-based views.
•	Product list / inventory — fixed pricing, stock counts, low-stock flagging.
•	Sales entry — pick product + quantity, stock reduces automatically, overselling blocked.
•	Expense tracking — description, amount, payment method.
•	Customer debts — name, phone, amount owed, mark-as-paid.
•	Audit trail — edits/deletes preserved as history instead of overwritten.
•	Owner dashboard — totals by period, payment breakdown, low-stock and debt lists, recent activity.
•	Background event logging — low stock, aging debts, large expenses logged quietly, no alerts.

# Decisions made
Let Antigravity build the full application from the single refined prompt rather than interrupting it mid-build to review each piece — treating the quality of the upfront prompt as the main lever for build quality, rather than iterative correction during generation.

# Challenges
None significant during the build itself — the one-shot approach meant there wasn't a back-and-forth debugging process at this stage. A closer look at what shipped came afterward, as a separate review pass (see Entry 3).

# Confirming this from the repo
The repository backs this up: a single commit ("Initial commit: Shop Record Book web application"), all 28 files and roughly 5,280 lines added at once, one author, one timestamp. No incremental history, no branches — consistent with the whole app being generated in one pass rather than built up feature by feature.

# Entry 3 — Reviewing What Shipped
Phase: After the build, reading through the actual code the one-shot generation produced.
With the build complete, the next step was reading through the real source — DataContext.jsx, AuthContext.jsx, supabase.js, and the SQL schema — rather than just checking that each screen worked on the surface. A few things stood out as areas a second pass should revisit before this runs as a real multi-user system for staff and an owner in different locations.

# What a closer read turned up
•	Persistence: the app currently saves to browser localStorage by default. A full Supabase schema already exists in the repo for this, it just isn't wired up to the app's data layer yet — so right now, staff and owner on different devices wouldn't see the same data.
•	Role assignment: staff vs. owner is currently worked out by checking whether the login email contains the word "owner," as a stand-in for a proper role field set at account creation.
•	Database permissions: the read-only restriction for the owner role is enforced in the interface, but the underlying Supabase row-level security policies don't yet mirror that at the database level.

# Why this is coming up now rather than earlier
With a one-shot build, there wasn't a natural checkpoint between features where this kind of thing would surface — it's the sort of detail that shows up once someone traces how data actually flows through the app, rather than confirming each screen looks right.

# Next steps (not yet done)
•	Connect DataContext.jsx to the existing Supabase schema instead of localStorage.
•	Replace email-based role detection with a proper role field set at account creation.
•	Align the RLS policies with the role split so it's enforced at the database level, not just the UI.

import { useState } from "react";

const TABS = {
	recruiter: {
		key: "recruiter",
		label: "Recruiters",
		eyebrow: "For recruiters",
		anchor: "for-recruiters",
		headline: "Hire faster without skimming hundreds of CVs.",
		body: "HireFlow does the first pass so your team only spends time on candidates worth a conversation — with the reasoning, not a black box.",
		accentText: "text-blue-800",
		accentRing: "ring-blue-200",
		accentDot: "bg-blue-800",
		features: [
			{
				title: "Ranked shortlist with reasoning",
				body: "Every candidate comes with a match score, matched/unmatched skills, and an AI narrative — review the why, not just a number.",
			},
			{
				title: "Structured scoresheets",
				body: "Define criteria once; the team scores against the same rubric across rounds. Less gut-feel, more comparable signal.",
			},
			{
				title: "Funnel analytics & time-to-hire",
				body: "Track stage conversion, drop-off, and time-in-stage live — spot bottlenecks before they cost you a hire.",
			},
			{
				title: "Interview scheduling built in",
				body: "Send Meet links, log feedback, and move stages from one screen. No tab-juggling, no copy-pasted invites.",
			},
		],
		visual: <RecruiterVisual />,
	},
	candidate: {
		key: "candidate",
		label: "Candidates",
		eyebrow: "For candidates",
		anchor: "for-candidates",
		headline: "Always know where you stand. No more silence.",
		body: "Apply once, see every stage as it happens, and get a real reason if it's a no. HireFlow was designed to end the CV black hole.",
		accentText: "text-cyan-700",
		accentRing: "ring-cyan-200",
		accentDot: "bg-cyan-500",
		features: [
			{
				title: "Real-time stage tracker",
				body: "Watch your application move from Applied → Screened → Interview → Decision. Notified the moment anything changes.",
			},
			{
				title: "Transparent rejection reasons",
				body: "If it's a no, you get the specific reason — not a templated 'we went with another candidate'. Learn for next time.",
			},
			{
				title: "One profile, many applications",
				body: "Build your resume profile once. Apply to roles in two clicks. Skills, projects, and answers reused intelligently.",
			},
			{
				title: "Salary and match clarity upfront",
				body: "See the salary band and how well your skills fit before you apply. No more guessing whether to bother.",
			},
		],
		visual: <CandidateVisual />,
	},
};

function RecruiterVisual() {
	const rows = [
		{ name: "Jane D.", role: "Sr. Frontend", score: 92, tone: "bg-emerald-500" },
		{ name: "Marcus K.", role: "Frontend", score: 84, tone: "bg-blue-800" },
		{ name: "Priya S.", role: "Fullstack", score: 76, tone: "bg-cyan-500" },
		{ name: "Liam O.", role: "Frontend", score: 61, tone: "bg-slate-400" },
	];
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
					Shortlist
				</p>
				<span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-800 ring-1 ring-blue-200">
					4 of 247
				</span>
			</div>
			<ul className="space-y-2">
				{rows.map((row) => (
					<li
						key={row.name}
						className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5"
					>
						<div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
							{row.name[0]}
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-semibold text-slate-950">
								{row.name}
							</p>
							<p className="text-xs text-slate-500">{row.role}</p>
							<div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
								<div
									className={`h-full ${row.tone}`}
									style={{ width: `${row.score}%` }}
								/>
							</div>
						</div>
						<span className="text-sm font-semibold tabular-nums text-slate-700">
							{row.score}
						</span>
					</li>
				))}
			</ul>
			<div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
				<span>Avg. time-to-shortlist</span>
				<span className="font-semibold text-slate-900">1.8 days</span>
			</div>
		</div>
	);
}

function CandidateVisual() {
	const events = [
		{ stage: "Applied", when: "May 12, 09:14", tone: "bg-slate-900" },
		{
			stage: "Screening passed",
			when: "May 14, 16:02",
			tone: "bg-blue-800",
		},
		{
			stage: "Interview scheduled",
			when: "May 18, 10:00 · Meet link sent",
			tone: "bg-cyan-500",
			active: true,
		},
		{ stage: "Decision", when: "Expected by May 22", tone: "bg-slate-300" },
	];
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
					Your application
				</p>
				<span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700 ring-1 ring-cyan-200">
					Interview
				</span>
			</div>
			<div className="rounded-lg border border-slate-200 bg-white p-3">
				<p className="text-sm font-semibold text-slate-950">
					Senior Frontend Engineer
				</p>
				<p className="text-xs text-slate-500">Linear · Remote</p>
			</div>
			<ol className="relative space-y-3 pl-5">
				<span
					aria-hidden
					className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-slate-200"
				/>
				{events.map((event) => (
					<li
						key={event.stage}
						className="relative flex items-start gap-2"
					>
						<span
							className={`absolute -left-5 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${event.tone} ${
								event.active ? "ring-2 ring-cyan-200" : ""
							}`}
						/>
						<div>
							<p className="text-sm font-semibold text-slate-950">
								{event.stage}
							</p>
							<p className="text-xs text-slate-500">{event.when}</p>
						</div>
					</li>
				))}
			</ol>
		</div>
	);
}

function FeatureRow({ idx, title, body, accentText }) {
	return (
		<li className="flex gap-4">
			<span
				className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-50 text-xs font-semibold ring-1 ring-inset ring-slate-200 ${accentText}`}
			>
				{String(idx + 1).padStart(2, "0")}
			</span>
			<div>
				<p className="text-base font-semibold text-slate-950">{title}</p>
				<p className="mt-1 text-sm text-slate-600">{body}</p>
			</div>
		</li>
	);
}

function LandingPersonas() {
	const [active, setActive] = useState("recruiter");
	const tab = TABS[active];

	return (
		<section
			id={tab.anchor}
			className="relative overflow-hidden bg-white"
		>
			<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
				<div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
					<div className="max-w-2xl">
						<p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
							Built for both sides of the hire
						</p>
						<h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
							Same platform. Different jobs to be done.
						</h2>
					</div>

					<div
						role="tablist"
						aria-label="Choose audience"
						className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1"
					>
						{Object.values(TABS).map((t) => {
							const isActive = t.key === active;
							return (
								<button
									key={t.key}
									role="tab"
									aria-selected={isActive}
									type="button"
									onClick={() => setActive(t.key)}
									className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${
										isActive
											? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
											: "text-slate-500 hover:text-slate-800"
									}`}
								>
									<span className="inline-flex items-center gap-2">
										<span
											className={`h-1.5 w-1.5 rounded-full ${t.accentDot}`}
										/>
										{t.label}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				<div
					key={active}
					className="mt-12 grid gap-10 animate-rotate-in lg:grid-cols-[1.1fr_0.9fr] lg:gap-14"
				>
					<div>
						<p
							className={`text-xs font-semibold uppercase tracking-wide ${tab.accentText}`}
						>
							{tab.eyebrow}
						</p>
						<h3 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
							{tab.headline}
						</h3>
						<p className="mt-3 max-w-xl text-base text-slate-600">
							{tab.body}
						</p>
						<ul className="mt-8 space-y-6">
							{tab.features.map((feat, i) => (
								<FeatureRow
									key={feat.title}
									idx={i}
									title={feat.title}
									body={feat.body}
									accentText={tab.accentText}
								/>
							))}
						</ul>
					</div>

					<div className="lg:pl-4">
						<div
							className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(15,23,42,0.18)] ring-1 ring-inset ${tab.accentRing}`}
						>
							{tab.visual}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default LandingPersonas;

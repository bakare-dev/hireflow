const STEPS = [
	{
		n: "01",
		title: "Post a role in minutes",
		body: "Write the brief once. Required skills, employment type, salary band, screening questions — all in a single guided form.",
		accent: "text-blue-800",
		ring: "ring-blue-200",
		visual: (
			<div className="space-y-2">
				<div className="rounded-md border border-slate-200 p-2.5">
					<p className="text-[10px] font-medium text-slate-500">
						Title
					</p>
					<p className="text-[11px] font-semibold text-slate-950">
						Senior Frontend Engineer
					</p>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<div className="rounded-md border border-slate-200 p-2.5">
						<p className="text-[10px] font-medium text-slate-500">
							Type
						</p>
						<p className="text-[11px] font-semibold text-slate-950">
							Full-time
						</p>
					</div>
					<div className="rounded-md border border-slate-200 p-2.5">
						<p className="text-[10px] font-medium text-slate-500">
							Salary
						</p>
						<p className="text-[11px] font-semibold text-slate-950">
							$120k–$160k
						</p>
					</div>
				</div>
				<div className="flex flex-wrap gap-1">
					{["React", "TypeScript", "Tailwind", "Node"].map((s) => (
						<span
							key={s}
							className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
						>
							{s}
						</span>
					))}
				</div>
			</div>
		),
	},
	{
		n: "02",
		title: "AI screens and ranks every applicant",
		body: "Resume matching, structured scoring, and inconsistency review run automatically — recruiters get a ranked shortlist with the reasoning, not a black box.",
		accent: "text-cyan-600",
		ring: "ring-cyan-200",
		visual: (
			<div className="space-y-2">
				{[
					{ name: "Jane D.", score: 92, tone: "bg-emerald-500" },
					{ name: "Marcus K.", score: 81, tone: "bg-blue-800" },
					{ name: "Priya S.", score: 74, tone: "bg-cyan-500" },
					{ name: "Liam O.", score: 58, tone: "bg-slate-400" },
				].map((row) => (
					<div
						key={row.name}
						className="flex items-center gap-2 rounded-md border border-slate-200 p-2"
					>
						<div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
							{row.name[0]}
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-[11px] font-medium text-slate-950">
								{row.name}
							</p>
							<div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
								<div
									className={`h-full ${row.tone}`}
									style={{ width: `${row.score}%` }}
								/>
							</div>
						</div>
						<span className="text-[10px] font-semibold tabular-nums text-slate-700">
							{row.score}
						</span>
					</div>
				))}
			</div>
		),
	},
	{
		n: "03",
		title: "Candidates always know the stage",
		body: "Every status change — screening, interview, offer, rejection — fires a notification with the reason and what comes next. No CV black holes.",
		accent: "text-emerald-600",
		ring: "ring-emerald-200",
		visual: (
			<ol className="relative space-y-3 pl-4">
				<span
					aria-hidden
					className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-slate-200"
				/>
				{[
					{
						stage: "Applied",
						when: "May 12",
						tone: "bg-slate-900",
						done: true,
					},
					{
						stage: "Screening passed",
						when: "May 14",
						tone: "bg-blue-800",
						done: true,
					},
					{
						stage: "Interview scheduled",
						when: "May 18 · 10:00",
						tone: "bg-cyan-500",
						done: true,
						active: true,
					},
					{
						stage: "Decision",
						when: "Pending",
						tone: "bg-slate-300",
						done: false,
					},
				].map((event) => (
					<li
						key={event.stage}
						className="relative flex items-start gap-2"
					>
						<span
							className={`absolute -left-4 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${event.tone} ${
								event.active ? "ring-2 ring-cyan-200" : ""
							}`}
						/>
						<div className="flex-1">
							<p className="text-[11px] font-semibold text-slate-950">
								{event.stage}
							</p>
							<p className="text-[10px] text-slate-500">
								{event.when}
							</p>
						</div>
					</li>
				))}
			</ol>
		),
	},
];

function LandingHowItWorks() {
	return (
		<section id="how-it-works" className="bg-white">
			<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
						How it works
					</p>
					<h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
						Three steps. No CV black holes.
					</h2>
					<p className="mt-3 text-base text-slate-600">
						HireFlow connects what recruiters need to decide with what
						candidates need to know — at every stage.
					</p>
				</div>

				<ol className="mt-12 grid gap-6 md:grid-cols-3">
					{STEPS.map((step, idx) => (
						<li
							key={step.n}
							className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm"
						>
							<div className="flex items-center gap-3">
								<span
									className={`grid h-9 w-9 place-items-center rounded-full bg-white text-sm font-bold ring-1 ring-inset ${step.ring} ${step.accent}`}
								>
									{step.n}
								</span>
								{idx < STEPS.length - 1 ? (
									<span
										aria-hidden
										className="hidden h-px flex-1 bg-slate-200 md:block"
									/>
								) : null}
							</div>

							<h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">
								{step.title}
							</h3>
							<p className="mt-2 text-sm text-slate-600">{step.body}</p>

							<div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/40 p-3">
								{step.visual}
							</div>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}

export default LandingHowItWorks;

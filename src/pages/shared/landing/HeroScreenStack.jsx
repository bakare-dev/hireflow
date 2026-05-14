import { useState } from "react";

const JOBS = [
	{
		title: "Senior Frontend Engineer",
		company: "Linear",
		location: "Remote · Full-time",
		match: 92,
	},
	{
		title: "Product Designer",
		company: "Notion",
		location: "Lagos · Hybrid",
		match: 81,
	},
	{
		title: "Backend Engineer",
		company: "Paystack",
		location: "Remote · Contract",
		match: 74,
	},
];

const SKILLS = ["React", "TypeScript", "Tailwind", "Node.js", "REST", "GraphQL"];

const SCREEN_TABS = [
	{ n: 1, title: "Resume Matching" },
	{ n: 2, title: "Resume Analysis" },
	{ n: 3, title: "Project Consistency" },
	{ n: 4, title: "Inconsistency Review" },
];

function JobDiscoveryMock() {
	return (
		<div className="flex h-full flex-col gap-3 p-4">
			<div className="rounded-lg border border-slate-200 bg-white p-3">
				<p className="text-[10px] font-medium text-slate-500">
					Find Jobs
				</p>
				<p className="mt-0.5 text-sm font-semibold tracking-tight text-slate-950">
					Find work that feels right.
				</p>
				<div className="mt-2.5 grid grid-cols-[1fr_90px] gap-2">
					<div className="h-7 rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] leading-7 text-slate-400">
						Search title
					</div>
					<div className="h-7 rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] leading-7 text-slate-400">
						Any type
					</div>
				</div>
			</div>

			<div className="grid min-h-0 flex-1 grid-cols-[0.9fr_1.1fr] gap-2.5">
				<ul className="space-y-2 overflow-hidden">
					{JOBS.map((job, idx) => (
						<li
							key={job.title}
							className={`rounded-lg border bg-white p-2.5 ${
								idx === 0
									? "border-blue-800/30 ring-1 ring-blue-800/10"
									: "border-slate-200"
							}`}
						>
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<p className="truncate text-[11px] font-semibold text-slate-950">
										{job.title}
									</p>
									<p className="truncate text-[10px] text-slate-500">
										{job.company} · {job.location}
									</p>
								</div>
								<span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
									{job.match}%
								</span>
							</div>
							<div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
								<div
									className="h-full rounded-full bg-emerald-500"
									style={{ width: `${job.match}%` }}
								/>
							</div>
						</li>
					))}
				</ul>

				<div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-3">
					<p className="text-[10px] text-slate-500">Linear</p>
					<p className="text-[13px] font-semibold leading-tight text-slate-950">
						Senior Frontend Engineer
					</p>
					<p className="mt-0.5 text-[10px] text-slate-500">
						Remote · Full-time
					</p>

					<div className="mt-2.5 grid grid-cols-2 gap-1.5">
						<div className="rounded-md bg-slate-50 p-1.5">
							<p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500">
								Salary
							</p>
							<p className="text-[10px] font-semibold text-slate-950">
								$120k–$160k
							</p>
						</div>
						<div className="rounded-md bg-emerald-50 p-1.5">
							<p className="text-[8px] font-semibold uppercase tracking-wide text-emerald-700">
								Job match
							</p>
							<div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-emerald-100">
								<div className="h-full w-[92%] rounded-full bg-emerald-500" />
							</div>
						</div>
					</div>

					<p className="mt-2.5 text-[10px] font-semibold text-slate-950">
						Skills in this role
					</p>
					<div className="mt-1 flex flex-wrap gap-1">
						{SKILLS.map((s) => (
							<span
								key={s}
								className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-700"
							>
								{s}
							</span>
						))}
					</div>

					<div className="mt-2.5 flex gap-1.5">
						<span className="rounded-md bg-slate-950 px-2 py-1 text-[10px] font-medium text-white">
							Easy apply
						</span>
						<span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700">
							View details
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function ApplicationDetailMock() {
	return (
		<div className="flex h-full flex-col gap-3 p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
						Linear
					</p>
					<p className="truncate text-sm font-semibold text-slate-950">
						Jane Doe
					</p>
					<p className="truncate text-[10px] text-slate-500">
						jane@example.com · Applied for Senior Frontend Engineer
					</p>
				</div>
				<div className="flex shrink-0 gap-1.5">
					<span className="rounded-md px-2 py-1 text-[10px] font-medium text-slate-600">
						← Back
					</span>
					<span className="rounded-md bg-slate-950 px-2 py-1 text-[10px] font-medium text-white">
						Update stage
					</span>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-white p-2.5">
				<div>
					<p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500">
						Current stage
					</p>
					<span className="mt-1 inline-block rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800 ring-1 ring-blue-200">
						Interview
					</span>
				</div>
				<div>
					<p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500">
						Submitted
					</p>
					<p className="mt-0.5 text-[10px] font-semibold text-slate-950">
						May 12, 09:14
					</p>
				</div>
				<div>
					<p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500">
						Match
					</p>
					<p className="mt-0.5 text-[10px] font-semibold text-slate-950">
						87%
					</p>
				</div>
			</div>

			<div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5">
				<span className="mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full bg-amber-400 text-center text-[9px] font-bold leading-3 text-amber-900">
					!
				</span>
				<p className="text-[9px] leading-tight text-amber-900">
					<span className="font-semibold">
						AI screening is a signal, not a verdict.
					</span>{" "}
					Always read the resume before deciding.
				</p>
			</div>

			<div className="grid min-h-0 flex-1 grid-cols-[110px_1fr] overflow-hidden rounded-lg border border-slate-200 bg-white">
				<ul className="border-r border-slate-200 bg-slate-50/60 p-1.5">
					{SCREEN_TABS.map((tab, idx) => (
						<li key={tab.n} className="mb-0.5">
							<div
								className={`rounded-md px-1.5 py-1.5 ${
									idx === 0
										? "bg-slate-950 text-white"
										: "text-slate-700"
								}`}
							>
								<p
									className={`text-[8px] font-semibold uppercase ${
										idx === 0
											? "text-white/70"
											: "text-slate-500"
									}`}
								>
									Stage {tab.n}
								</p>
								<p className="text-[10px] font-medium leading-tight">
									{tab.title}
								</p>
							</div>
						</li>
					))}
				</ul>

				<div className="space-y-2 p-2.5">
					<div>
						<p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500">
							Match percentage
						</p>
						<p className="text-base font-semibold text-slate-950">
							87%
						</p>
					</div>
					<div>
						<p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500">
							Matched skills
						</p>
						<div className="mt-1 flex flex-wrap gap-1">
							{["React", "TypeScript", "Node"].map((s) => (
								<span
									key={s}
									className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 ring-1 ring-emerald-200"
								>
									{s}
								</span>
							))}
						</div>
					</div>
					<div>
						<p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500">
							Unmatched skills
						</p>
						<div className="mt-1 flex flex-wrap gap-1">
							{["GraphQL", "k8s"].map((s) => (
								<span
									key={s}
									className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-medium text-rose-700 ring-1 ring-rose-200"
								>
									{s}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function HeroScreenStack() {
	const [front, setFront] = useState("applicant");

	const cards = [
		{
			id: "applicant",
			label: "Applicant · Find Jobs",
			dot: "bg-cyan-500",
			content: <JobDiscoveryMock />,
		},
		{
			id: "recruiter",
			label: "Recruiter · Application",
			dot: "bg-blue-800",
			content: <ApplicationDetailMock />,
		},
	];

	return (
		<div className="relative mx-auto w-full max-w-md pr-12 sm:pr-16 lg:max-w-none">
			<div className="relative h-[440px] sm:h-[480px]">
				{cards.map((card) => {
					const isFront = card.id === front;
					return (
						<button
							type="button"
							key={card.id}
							onClick={() => setFront(card.id)}
							aria-label={`Bring ${card.label} forward`}
							className={`absolute inset-0 cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-all duration-500 ease-out ${
								isFront
									? "z-20 translate-x-0 translate-y-0 rotate-0 scale-100 shadow-[0_1px_0_rgba(15,23,42,0.04),0_28px_56px_-24px_rgba(15,23,42,0.22)]"
									: "z-10 translate-x-16 translate-y-5 rotate-[3deg] scale-[0.95] shadow-md hover:translate-x-[4.5rem] hover:translate-y-3 hover:rotate-[2deg] sm:translate-x-20"
							}`}
						>
							<div className="flex h-7 items-center justify-between border-b border-slate-200 bg-slate-50/80 px-3">
								<div className="flex items-center gap-2">
									<div className="flex gap-1">
										<span className="h-2 w-2 rounded-full bg-rose-300" />
										<span className="h-2 w-2 rounded-full bg-amber-300" />
										<span className="h-2 w-2 rounded-full bg-emerald-300" />
									</div>
									<span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
										<span
											className={`h-1.5 w-1.5 rounded-full ${card.dot}`}
										/>
										{card.label}
									</span>
								</div>
								{!isFront ? (
									<span className="text-[9px] font-medium text-slate-400">
										click to view
									</span>
								) : null}
							</div>
							<div className="h-[calc(100%-28px)]">
								{card.content}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}

export default HeroScreenStack;

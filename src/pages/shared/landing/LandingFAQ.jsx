const FAQ = [
	{
		q: "Is HireFlow free to use?",
		a: "Yes — the current build is a prototype and free for both candidates and hiring teams. Paid plans for recruiters will land alongside the production release; candidates will stay free.",
	},
	{
		q: "How does the AI scoring actually work?",
		a: "Each application runs through four stages: resume matching against required skills, structured resume analysis, project consistency check, and an inconsistency review. Recruiters see the score and the full reasoning — never just a number.",
	},
	{
		q: "Will the AI make the final decision?",
		a: "No. The AI produces signals — match score, narrative summary, inconsistency flags — and a banner reminds recruiters that these can be wrong. Every advance, reject, or interview decision is made by a human.",
	},
	{
		q: "What happens if I'm rejected?",
		a: "You get a notification with the actual reason at the stage where it happened — not a templated 'we went with another candidate'. The reason is captured on the application's stage history.",
	},
	{
		q: "Do I need to upload a new resume for every role?",
		a: "No. You build a resume profile once (skills, experience, education, projects). HireFlow reuses it for every application and asks only the role-specific screening questions.",
	},
	{
		q: "Is my data shared with other companies?",
		a: "Only the companies whose roles you apply to can see your application and resume profile. You can revoke access by withdrawing the application — the company keeps no copy outside HireFlow.",
	},
];

function ChevronIcon() {
	return (
		<svg
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180 group-open:text-slate-700"
		>
			<path d="M6 8l4 4 4-4" />
		</svg>
	);
}

function LandingFAQ() {
	return (
		<section id="faq" className="bg-white">
			<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
				<div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
					<div className="lg:sticky lg:top-24 lg:self-start">
						<p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
							Questions
						</p>
						<h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
							Things worth being clear about.
						</h2>
						<p className="mt-3 text-base text-slate-600">
							HireFlow is a prototype today. We'd rather tell you that
							upfront than dress it up.
						</p>
						<a
							href="mailto:hello@hireflow.app"
							className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-950 underline-offset-4 hover:underline"
						>
							Still curious? hello@hireflow.app
							<span aria-hidden>→</span>
						</a>
					</div>

					<ul className="divide-y divide-slate-200 border-y border-slate-200">
						{FAQ.map((item, i) => (
							<li key={item.q}>
								<details name="hireflow-faq" className="group">
									<summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left">
										<span className="flex items-baseline gap-3">
											<span className="text-xs font-semibold tabular-nums text-slate-400">
												{String(i + 1).padStart(2, "0")}
											</span>
											<span className="text-base font-semibold text-slate-950 sm:text-lg">
												{item.q}
											</span>
										</span>
										<ChevronIcon />
									</summary>
									<div className="pb-5 pl-9 pr-8 text-sm leading-relaxed text-slate-600">
										{item.a}
									</div>
								</details>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}

export default LandingFAQ;

const HIGHLIGHTS = [
	{
		title: "Know where you stand",
		body: "Applicants see their match score, current stage, and next step on every application — no silent rejections.",
	},
	{
		title: "Apply with one profile",
		body: "Build your resume profile once and reuse it across every role; AI screening kicks in the moment you apply.",
	},
	{
		title: "Fairer reviews for everyone",
		body: "Structured five-criterion scoresheets give recruiters comparable signal and candidates consistent feedback.",
	},
];

function AuthLeftSide() {
	return (
		<aside
			className="relative hidden h-full overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10"
			style={{ background: "var(--gradient-brand)" }}
		>
			<span
				aria-hidden
				className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"
			/>
			<span
				aria-hidden
				className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl"
			/>

			<div className="relative z-10 flex items-center gap-3">
				<img
					src="/hireflow-light.png"
					alt="HireFlow"
					className="h-10 w-14 object-contain"
				/>
				<span className="text-3xl font-semibold tracking-tight">
					<span className="text-white">Hire</span>
					<span className="text-cyan-300">Flow</span>
				</span>
			</div>
			<div className="relative z-10 max-w-md space-y-8">
				<div className="space-y-3">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
						Recruitment, transparently
					</p>
					<h2 className="text-3xl font-semibold leading-tight tracking-tight">
						Hire faster, without losing the human in the loop.
					</h2>
					<p className="text-sm text-white/80">
						HireFlow combines AI-assisted screening with structured
						human decisions — and tells every candidate where they
						stand at every step.
					</p>
				</div>

				<ul className="space-y-4">
					{HIGHLIGHTS.map((h) => (
						<li key={h.title} className="flex gap-3">
							<span
								aria-hidden
								className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-300"
							/>
							<div>
								<p className="text-sm font-semibold">
									{h.title}
								</p>
								<p className="text-sm text-white/75">
									{h.body}
								</p>
							</div>
						</li>
					))}
				</ul>
			</div>

			<div className="relative z-10 flex items-center justify-between text-xs text-white/60">
				<span>HireFlow</span>
				<span>5 stages · 5 criteria · 0 mystery</span>
			</div>
		</aside>
	);
}

export default AuthLeftSide;

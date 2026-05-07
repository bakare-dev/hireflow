const OPTIONS = [
	{
		key: "APPLICANT",
		title: "I'm looking for a role",
		description:
			"Create a candidate profile, apply to roles, and follow your applications stage by stage.",
	},
	{
		key: "RECRUITER",
		title: "I'm hiring for my company",
		description:
			"Onboard your company and become its admin. You'll be able to invite hiring managers and post roles.",
	},
];

function SignUpRoleChoice({ onPick }) {
	return (
		<div className="space-y-3">
			{OPTIONS.map((opt) => (
				<button
					key={opt.key}
					type="button"
					onClick={() => onPick(opt.key)}
					className="group flex w-full items-start gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-900 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
				>
					<div className="flex-1">
						<p className="font-semibold text-slate-950">{opt.title}</p>
						<p className="mt-1 text-sm text-slate-600">
							{opt.description}
						</p>
					</div>
					<span
						aria-hidden
						className="mt-1 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-900"
					>
						→
					</span>
				</button>
			))}
		</div>
	);
}

export default SignUpRoleChoice;

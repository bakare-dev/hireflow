import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ROUTES } from "../../constants/routes";

const PERSONAS = {
	recruiter: {
		label: "For hiring teams",
		eyebrow: "For hiring teams",
		headline: "Hire faster without skimming every CV.",
		body: "A ranked shortlist with the reasoning, structured scoresheets, and stage-by-stage updates — so your team only spends time on candidates worth a conversation.",
		highlights: [
			{
				title: "Ranked shortlist with reasoning",
				body: "Match score, matched skills, and an AI narrative for every applicant — review the why, not just a number.",
			},
			{
				title: "Structured scoresheets",
				body: "Score every candidate on the same rubric across rounds. Less gut-feel, more comparable signal.",
			},
			{
				title: "Funnel analytics & time-to-hire",
				body: "Watch stage conversion, drop-off, and time-in-stage live — fix bottlenecks before they cost you a hire.",
			},
		],
		footer: "Ranked shortlist · structured scoring · zero mystery",
	},
	applicant: {
		label: "For job hunters",
		eyebrow: "For job hunters",
		headline: "Apply once. Always know where you stand.",
		body: "HireFlow notifies you at every stage — Applied, Screened, Interview, Decision — with the actual reason, not a templated rejection.",
		highlights: [
			{
				title: "Real-time stage tracker",
				body: "Watch your application move stage by stage; notified the moment anything changes.",
			},
			{
				title: "One profile, many applications",
				body: "Build your resume profile once, apply in two clicks. Skills and answers reused intelligently.",
			},
			{
				title: "Transparent rejection reasons",
				body: "If it's a no, you get the specific reason at the stage where it happened — never radio silence.",
			},
		],
		footer: "Stage tracker · one profile · real reasons",
	},
};

const SLIDES = ["recruiter", "applicant"];
const AUTOPLAY_MS = 6500;

function resolvePersona(value) {
	if (value === "recruiter" || value === "hiring") return "recruiter";
	if (value === "applicant" || value === "candidate") return "applicant";
	return null;
}

function AuthLeftSide() {
	const [params] = useSearchParams();
	const presetKey = resolvePersona(params.get("as"));

	const [idx, setIdx] = useState(() =>
		presetKey ? SLIDES.indexOf(presetKey) : 0,
	);
	const [paused, setPaused] = useState(false);

	const isSliding = !presetKey;
	const activeKey = isSliding ? SLIDES[idx] : presetKey;
	const persona = PERSONAS[activeKey];

	useEffect(() => {
		if (!isSliding || paused) return;
		const t = setInterval(() => {
			setIdx((i) => (i + 1) % SLIDES.length);
		}, AUTOPLAY_MS);
		return () => clearInterval(t);
	}, [isSliding, paused]);

	return (
		<aside
			className="relative hidden h-full overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10"
			style={{ background: "var(--gradient-brand)" }}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			<span
				aria-hidden
				className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"
			/>
			<span
				aria-hidden
				className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl"
			/>

			<Link
				to={ROUTES.LANDING}
				className="relative z-10 flex items-center gap-3 transition hover:opacity-90"
			>
				<img
					src="/hireflow-light.png"
					alt="HireFlow"
					className="h-10 w-14 object-contain"
				/>
				<span className="text-3xl font-semibold tracking-tight">
					<span className="text-white">Hire</span>
					<span className="text-cyan-300">Flow</span>
				</span>
			</Link>

			<div className="relative z-10 max-w-md">
				<div
					key={activeKey}
					className="animate-rotate-in space-y-8"
				>
					<div className="space-y-3">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
							{persona.eyebrow}
						</p>
						<h2 className="text-3xl font-semibold leading-tight tracking-tight">
							{persona.headline}
						</h2>
						<p className="text-sm text-white/80">{persona.body}</p>
					</div>

					<ul className="space-y-4">
						{persona.highlights.map((h) => (
							<li key={h.title} className="flex gap-3">
								<span
									aria-hidden
									className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-300"
								/>
								<div>
									<p className="text-sm font-semibold">{h.title}</p>
									<p className="text-sm text-white/75">{h.body}</p>
								</div>
							</li>
						))}
					</ul>
				</div>

				{isSliding ? (
					<div className="mt-10 flex items-center gap-3">
						{SLIDES.map((key, i) => {
							const isActive = i === idx;
							return (
								<button
									key={key}
									type="button"
									aria-label={`Show ${PERSONAS[key].label}`}
									aria-current={isActive}
									onClick={() => setIdx(i)}
									className="group flex items-center gap-2"
								>
									<span
										className={`relative block h-1 overflow-hidden rounded-full transition-all duration-300 ${
											isActive
												? "w-10 bg-white/25"
												: "w-6 bg-white/15 group-hover:bg-white/25"
										}`}
									>
										{isActive && !paused ? (
											<span
												key={`${key}-${idx}`}
												className="absolute inset-y-0 left-0 bg-cyan-300"
												style={{
													animation: `slide-progress ${AUTOPLAY_MS}ms linear forwards`,
												}}
											/>
										) : isActive ? (
											<span className="absolute inset-y-0 left-0 w-full bg-cyan-300" />
										) : null}
									</span>
									<span
										className={`text-[11px] font-medium uppercase tracking-wide transition ${
											isActive
												? "text-white"
												: "text-white/50 group-hover:text-white/80"
										}`}
									>
										{PERSONAS[key].label}
									</span>
								</button>
							);
						})}
					</div>
				) : null}
			</div>

			<div className="relative z-10 flex items-center justify-between text-xs text-white/60">
				<span>HireFlow</span>
				<span>{persona.footer}</span>
			</div>

			<style>{`
				@keyframes slide-progress {
					from { width: 0%; }
					to { width: 100%; }
				}
			`}</style>
		</aside>
	);
}

export default AuthLeftSide;

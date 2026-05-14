import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ROUTES } from "../../../constants/routes";
import Button from "../../../components/common/Button";
import HeroScreenStack from "./HeroScreenStack";

const ROTATING = [
	"recruiters drowning in CVs.",
	"candidates stuck in silence.",
	"hiring teams that move fast.",
	"the next role you'll love.",
];

function LandingHero() {
	const [phraseIdx, setPhraseIdx] = useState(0);
	const [text, setText] = useState("");
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		const current = ROTATING[phraseIdx];

		if (!deleting && text === current) {
			const t = setTimeout(() => setDeleting(true), 1500);
			return () => clearTimeout(t);
		}

		if (deleting && text === "") {
			const t = setTimeout(() => {
				setDeleting(false);
				setPhraseIdx((p) => (p + 1) % ROTATING.length);
			}, 250);
			return () => clearTimeout(t);
		}

		const t = setTimeout(
			() => {
				setText(
					deleting
						? current.slice(0, text.length - 1)
						: current.slice(0, text.length + 1),
				);
			},
			deleting ? 28 : 55,
		);
		return () => clearTimeout(t);
	}, [text, deleting, phraseIdx]);

	return (
		<section className="relative overflow-hidden bg-white">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgb(226_232_240)_1px,transparent_0)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_75%)]"
			/>

			<div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
				<div className="text-center lg:text-left">
					<p className="flex flex-wrap items-baseline justify-center gap-x-2 text-sm font-medium text-slate-500 sm:text-base lg:justify-start">
						<span>We're here for</span>
						<span className="inline-flex items-baseline font-semibold text-blue-800">
							<span aria-live="polite">{text}</span>
							<span
								aria-hidden
								className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-caret-blink bg-cyan-500"
							/>
						</span>
					</p>

					<h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
						Recruitment that{" "}
						<span className="relative inline-block whitespace-nowrap text-blue-800">
							respects
							<svg
								aria-hidden
								viewBox="0 0 200 12"
								className="absolute -bottom-1 left-0 h-2 w-full text-cyan-300"
								preserveAspectRatio="none"
							>
								<path
									d="M2 8 Q 50 2, 100 6 T 198 5"
									fill="none"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
								/>
							</svg>
						</span>{" "}
						everyone's time.
					</h1>

					<p className="mx-auto mt-5 max-w-xl text-pretty text-base text-slate-600 sm:text-lg lg:mx-0">
						AI-assisted screening, structured scoresheets, and
						stage-by-stage updates — so candidates always know where
						they stand and recruiters move faster.
					</p>

					<div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
						<Link to={`${ROUTES.SIGN_UP}?as=recruiter`}>
							<Button size="lg">I'm hiring →</Button>
						</Link>
						<Link to={`${ROUTES.SIGN_UP}?as=applicant`}>
							<Button variant="secondary" size="lg">
								I'm job hunting
							</Button>
						</Link>
					</div>

					<ul className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-600 lg:justify-start">
						{[
							{ dot: "bg-blue-800", label: "Transparent stages" },
							{ dot: "bg-cyan-500", label: "Structured scoring" },
							{
								dot: "bg-emerald-500",
								label: "AI-assisted shortlist",
							},
							{
								dot: "bg-slate-900",
								label: "Bias-aware criteria",
							},
						].map((chip) => (
							<li
								key={chip.label}
								className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5"
							>
								<span
									className={`h-1.5 w-1.5 rounded-full ${chip.dot}`}
								/>
								{chip.label}
							</li>
						))}
					</ul>
				</div>

				<HeroScreenStack />
			</div>
		</section>
	);
}

export default LandingHero;

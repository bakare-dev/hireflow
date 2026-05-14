import { Link } from "react-router";
import { ROUTES } from "../../../constants/routes";
import Button from "../../../components/common/Button";

function LandingCTA() {
	return (
		<section className="bg-white">
			<div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
				<div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 px-8 py-14 sm:px-14 sm:py-20">
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]"
					/>
					<div
						aria-hidden
						className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 animate-pulse-glow rounded-full bg-cyan-500/25 blur-3xl"
					/>
					<div
						aria-hidden
						className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 animate-pulse-glow rounded-full bg-blue-700/30 blur-3xl [animation-delay:-2s]"
					/>

					<div
						aria-hidden
						className="pointer-events-none absolute right-0 top-1/2 hidden h-[28rem] w-[28rem] -translate-y-1/2 translate-x-1/4 lg:block"
					>
						<svg
							viewBox="0 0 200 200"
							className="absolute inset-0 h-full w-full animate-spin-slow text-cyan-300/40"
						>
							<circle
								cx="100"
								cy="100"
								r="92"
								fill="none"
								stroke="currentColor"
								strokeWidth="0.5"
								strokeDasharray="2 5"
							/>
							<circle
								cx="100"
								cy="8"
								r="3"
								fill="rgb(103 232 249)"
							/>
							<circle
								cx="100"
								cy="8"
								r="6"
								fill="rgb(103 232 249)"
								opacity="0.35"
							/>
						</svg>

						<svg
							viewBox="0 0 200 200"
							className="absolute inset-12 h-[calc(100%-6rem)] w-[calc(100%-6rem)] animate-spin-reverse text-blue-400/40"
						>
							<circle
								cx="100"
								cy="100"
								r="84"
								fill="none"
								stroke="currentColor"
								strokeWidth="0.5"
							/>
							<circle
								cx="100"
								cy="184"
								r="2.5"
								fill="rgb(96 165 250)"
							/>
						</svg>

						<svg
							viewBox="0 0 200 200"
							className="absolute inset-24 h-[calc(100%-12rem)] w-[calc(100%-12rem)] animate-spin-slow text-emerald-300/40 [animation-duration:14s]"
						>
							<circle
								cx="100"
								cy="100"
								r="70"
								fill="none"
								stroke="currentColor"
								strokeWidth="0.4"
								strokeDasharray="1 4"
							/>
							<circle
								cx="170"
								cy="100"
								r="2"
								fill="rgb(110 231 183)"
							/>
						</svg>

						<div className="absolute inset-0 grid place-items-center">
							<span className="h-3 w-3 animate-pulse-glow rounded-full bg-cyan-300 shadow-[0_0_24px_4px_rgba(34,211,238,0.6)]" />
						</div>
					</div>

					<span
						aria-hidden
						className="pointer-events-none absolute right-16 top-12 hidden h-16 w-16 animate-float rounded-full bg-cyan-400/20 blur-2xl lg:block"
					/>
					<span
						aria-hidden
						className="pointer-events-none absolute right-40 bottom-16 hidden h-20 w-20 animate-float-slow rounded-full bg-blue-500/25 blur-2xl lg:block"
					/>

					<div className="relative max-w-2xl">
						<p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
							Ready when you are
						</p>
						<h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
							Stop losing candidates to silence.
						</h2>
						<p className="mt-4 max-w-xl text-pretty text-base text-slate-300 sm:text-lg">
							Whether you're hiring or hunting, HireFlow keeps
							every stage visible to the people who need to see
							it.
						</p>

						<div className="mt-8 flex flex-wrap items-center gap-3">
							<Link to={ROUTES.SIGN_UP}>
								<Button size="lg" variant="secondary">
									Get started — it's free →
								</Button>
							</Link>
							<a
								href="#how-it-works"
								className="inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-base font-medium text-white/90 ring-1 ring-inset ring-white/20 transition hover:bg-white/10 hover:text-white hover:ring-white/40"
							>
								See how it works
							</a>
						</div>

						<p className="mt-6 text-xs text-slate-400">
							Prototype build · No credit card
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

export default LandingCTA;

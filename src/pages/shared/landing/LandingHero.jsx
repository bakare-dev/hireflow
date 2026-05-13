import { Link } from "react-router";
import { ROUTES } from "../../../constants/routes";
import Button from "../../../components/common/Button";

function LandingHero() {
	return (
		<section className="border-b border-slate-200 bg-white">
			<div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-28">
				<span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
					AI-augmented recruitment · v3.0 prototype
				</span>

				<h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
					Recruitment that respects everyone's time.
				</h1>

				<p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
					AI-assisted screening, structured scoresheets, and notifications
					that always tell candidates what stage they're at — and what
					comes next.
				</p>

				<div className="mt-9 flex flex-wrap items-center justify-center gap-3">
					<Link to={ROUTES.SIGN_UP}>
						<Button size="lg">I'm hiring</Button>
					</Link>
					<Link to={ROUTES.SIGN_UP}>
						<Button variant="secondary" size="lg">
							I'm job hunting
						</Button>
					</Link>
				</div>

				<dl className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
					<div className="flex items-center gap-2">
						<span className="h-1 w-1 rounded-full bg-slate-300" />
						No CV black holes
					</div>
					<div className="flex items-center gap-2">
						<span className="h-1 w-1 rounded-full bg-slate-300" />
						Stage-by-stage updates
					</div>
					<div className="flex items-center gap-2">
						<span className="h-1 w-1 rounded-full bg-slate-300" />
						Structured, bias-aware scoring
					</div>
				</dl>
			</div>
		</section>
	);
}

export default LandingHero;

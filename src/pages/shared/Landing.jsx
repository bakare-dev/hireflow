import { Link } from "react-router";
import { ROUTES } from "../../constants/routes";
import Button from "../../components/common/Button";

function Landing() {
	return (
		<div className="mx-auto max-w-4xl px-4 py-20 text-center">
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				HireFlow · v3.0 prototype
			</p>
			<h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
				Recruitment that respects everyone's time.
			</h1>
			<p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
				AI-assisted screening, structured scoresheets, and notifications
				that always tell candidates what stage they are at — and what
				comes next.
			</p>
			<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
				<Link to={ROUTES.SIGN_UP}>
					<Button>Create an account</Button>
				</Link>
				<Link to={ROUTES.SIGN_IN}>
					<Button variant="secondary">Sign in</Button>
				</Link>
				<Link
					to={ROUTES.DEV_ROLE_SWITCH}
					className="text-sm text-slate-600 hover:text-slate-900"
				>
					Or jump in as a seeded user →
				</Link>
			</div>
			<p className="mt-12 text-xs text-slate-400">
				Visualisation only — all data is dummy and resets on reload.
			</p>
		</div>
	);
}

export default Landing;

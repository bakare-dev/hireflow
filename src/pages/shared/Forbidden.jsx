import { Link } from "react-router";
import { ROUTES } from "../../constants/routes";
import Button from "../../components/common/Button";

function Forbidden() {
	return (
		<div className="mx-auto max-w-md px-4 py-24 text-center">
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				403
			</p>
			<h1 className="mt-2 text-2xl font-semibold text-slate-950">
				Wrong account for this screen
			</h1>
			<p className="mt-2 text-sm text-slate-600">
				Your current role does not have access here. Switch to a
				different seeded user to continue.
			</p>
			<Link to={ROUTES.DEV_ROLE_SWITCH} className="mt-6 inline-block">
				<Button>Switch role</Button>
			</Link>
		</div>
	);
}

export default Forbidden;

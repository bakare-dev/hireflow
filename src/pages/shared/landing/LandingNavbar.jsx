import { Link } from "react-router";
import { ROUTES } from "../../../constants/routes";
import Button from "../../../components/common/Button";

const NAV_LINKS = [
	{ href: "#how-it-works", label: "How it works" },
	{ href: "#for-recruiters", label: "For recruiters" },
	{ href: "#for-candidates", label: "For candidates" },
	{ href: "#faq", label: "FAQ" },
];

function LandingNavbar() {
	return (
		<header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
				<Link to={ROUTES.LANDING} className="flex items-center gap-2">
					<span className="grid h-7 w-7 place-items-center rounded-md bg-slate-950 text-xs font-bold text-white">
						H
					</span>
					<span className="text-sm font-semibold tracking-tight text-slate-950">
						HireFlow
					</span>
				</Link>

				<nav className="hidden items-center gap-7 md:flex">
					{NAV_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="text-sm text-slate-600 transition hover:text-slate-950"
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="flex items-center gap-2">
					<Link to={ROUTES.SIGN_IN} className="hidden sm:inline-flex">
						<Button variant="ghost" size="sm">
							Sign in
						</Button>
					</Link>
					<Link to={ROUTES.SIGN_UP}>
						<Button size="sm">Get started</Button>
					</Link>
				</div>
			</div>
		</header>
	);
}

export default LandingNavbar;

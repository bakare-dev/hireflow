import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ROUTES } from "../../../constants/routes";
import Button from "../../../components/common/Button";

const NAV_LINKS = [
	{ href: "#how-it-works", label: "How it works" },
	{ href: "#for-recruiters", label: "For recruiters" },
	{ href: "#for-candidates", label: "For candidates" },
	{ href: "#faq", label: "FAQ" },
];

const PERSONA_OPTIONS = [
	{
		as: "recruiter",
		title: "I'm hiring",
		body: "Post roles, screen with AI, run structured interviews.",
		dot: "bg-blue-800",
	},
	{
		as: "applicant",
		title: "I'm job hunting",
		body: "Apply once, track every stage, get real reasons.",
		dot: "bg-cyan-500",
	},
];

function GetStartedMenu() {
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef(null);

	useEffect(() => {
		if (!open) return;
		function onDoc(e) {
			if (!wrapperRef.current?.contains(e.target)) setOpen(false);
		}
		function onKey(e) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("mousedown", onDoc);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDoc);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<div ref={wrapperRef} className="relative">
			<Button
				size="sm"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => setOpen((o) => !o)}
			>
				Get started
				<svg
					viewBox="0 0 20 20"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className={`h-3.5 w-3.5 transition-transform duration-200 ${
						open ? "rotate-180" : ""
					}`}
				>
					<path d="M6 8l4 4 4-4" />
				</svg>
			</Button>

			{open ? (
				<div
					role="menu"
					className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right animate-rotate-in rounded-xl border border-slate-200 bg-white p-2 shadow-[0_1px_0_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(15,23,42,0.22)]"
				>
					<p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
						Who's signing up?
					</p>
					{PERSONA_OPTIONS.map((opt) => (
						<Link
							key={opt.as}
							role="menuitem"
							to={`${ROUTES.SIGN_UP}?as=${opt.as}`}
							onClick={() => setOpen(false)}
							className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
						>
							<span
								className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${opt.dot}`}
							/>
							<div>
								<p className="text-sm font-semibold text-slate-950">
									{opt.title}
								</p>
								<p className="text-xs text-slate-500">{opt.body}</p>
							</div>
						</Link>
					))}
				</div>
			) : null}
		</div>
	);
}

function LandingNavbar() {
	return (
		<header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
				<Link to={ROUTES.LANDING} className="flex items-center gap-2">
					<img
						src="/hireflow.png"
						alt="HireFlow"
						className="h-10 w-14 object-contain"
					/>
					<span className="text-3xl font-semibold tracking-tight">
						<span className="text-blue-800">Hire</span>
						<span className="text-cyan-300">Flow</span>
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
					<GetStartedMenu />
				</div>
			</div>
		</header>
	);
}

export default LandingNavbar;

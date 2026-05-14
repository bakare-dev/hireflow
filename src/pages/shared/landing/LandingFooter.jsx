import { Link } from "react-router";
import { ROUTES } from "../../../constants/routes";

const COLUMNS = [
	{
		heading: "Product",
		links: [
			{ label: "How it works", href: "#how-it-works" },
			{ label: "For recruiters", href: "#for-recruiters" },
			{ label: "For candidates", href: "#for-candidates" },
			{ label: "FAQ", href: "#faq" },
		],
	},
	{
		heading: "Company",
		links: [
			{ label: "About", href: "#" },
			{ label: "Roadmap", href: "#" },
			{ label: "Changelog", href: "#" },
			{ label: "Contact", href: "mailto:hello@hireflow.app" },
		],
	},
	{
		heading: "Legal",
		links: [
			{ label: "Privacy", href: "#" },
			{ label: "Terms", href: "#" },
			{ label: "Data processing", href: "#" },
			{ label: "Security", href: "#" },
		],
	},
];

const SOCIALS = [
	{
		label: "GitHub",
		href: "#",
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden
				className="h-4 w-4"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M12 2C6.477 2 2 6.486 2 12.02c0 4.428 2.865 8.184 6.839 9.508.5.092.682-.218.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.622.069-.61.069-.61 1.004.071 1.532 1.034 1.532 1.034.892 1.532 2.341 1.089 2.91.833.092-.648.35-1.089.636-1.34-2.221-.255-4.555-1.114-4.555-4.957 0-1.095.39-1.99 1.03-2.692-.103-.255-.447-1.275.098-2.658 0 0 .84-.27 2.75 1.028A9.56 9.56 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.91-1.298 2.748-1.028 2.748-1.028.546 1.383.202 2.403.1 2.658.64.702 1.028 1.597 1.028 2.692 0 3.852-2.337 4.7-4.566 4.95.359.31.678.92.678 1.855 0 1.34-.012 2.42-.012 2.75 0 .267.18.58.688.482A10.02 10.02 0 0 0 22 12.02C22 6.486 17.522 2 12 2Z"
				/>
			</svg>
		),
	},
	{
		label: "X / Twitter",
		href: "#",
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden
				className="h-4 w-4"
			>
				<path d="M18.244 2H21.5l-7.5 8.575L22.75 22h-6.84l-5.355-7.01L4.4 22H1.142l8.02-9.169L1.25 2h6.99l4.84 6.4L18.244 2Zm-1.2 18h1.8L7.04 4H5.14l11.904 16Z" />
			</svg>
		),
	},
	{
		label: "LinkedIn",
		href: "#",
		icon: (
			<svg
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden
				className="h-4 w-4"
			>
				<path d="M20.452 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.355V9h3.414v1.561h.048c.476-.9 1.637-1.852 3.37-1.852 3.602 0 4.267 2.37 4.267 5.455v6.288ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.554V9H7.12v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
			</svg>
		),
	},
];

function LandingFooter() {
	return (
		<footer className="border-t border-slate-200 bg-white">
			<div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
				<div className="grid gap-10 lg:grid-cols-[1.3fr_2fr_1fr] lg:gap-16">
					<div>
						<Link
							to={ROUTES.LANDING}
							className="flex items-center gap-2"
						>
							<img
								src="/hireflow.png"
								alt="HireFlow"
								className="h-9 w-12 object-contain"
							/>
							<span className="text-2xl font-semibold tracking-tight">
								<span className="text-blue-800">Hire</span>
								<span className="text-cyan-400">Flow</span>
							</span>
						</Link>
						<p className="mt-4 max-w-sm text-sm text-slate-600">
							Recruitment that respects everyone's time —
							transparent stages, structured scoring, real reasons.
						</p>
					</div>

					<div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
						{COLUMNS.map((col) => (
							<div key={col.heading}>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									{col.heading}
								</p>
								<ul className="mt-4 space-y-2.5">
									{col.links.map((link) => (
										<li key={link.label}>
											<a
												href={link.href}
												className="text-sm text-slate-700 transition hover:text-slate-950"
											>
												{link.label}
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Find us
						</p>
						<ul className="mt-4 flex gap-2">
							{SOCIALS.map((s) => (
								<li key={s.label}>
									<a
										href={s.href}
										aria-label={s.label}
										className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
									>
										{s.icon}
									</a>
								</li>
							))}
						</ul>
						<p className="mt-6 text-xs text-slate-500">
							For the people who hire — and the people getting hired.
						</p>
					</div>
				</div>

				<div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
					<p>© {new Date().getFullYear()} HireFlow</p>
					<p className="flex items-center gap-1.5">
						<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
						All systems nominal
					</p>
				</div>
			</div>
		</footer>
	);
}

export default LandingFooter;

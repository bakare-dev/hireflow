import { NavLink, Outlet } from "react-router";
import { useSelector } from "react-redux";
import { ROUTES } from "../constants/routes";
import { selectAuthUser } from "../store/slices/authSlice";
import Topbar from "./Topbar";
import { cn } from "../utils/classnames";

const NAV_ITEMS = [
	{ label: "Find Jobs", to: ROUTES.APPLICANT_JOBS },
	{ label: "My Applications", to: ROUTES.APPLICANT_APPLICATIONS },
	// { label: "Messages", to: ROUTES.APPLICANT_MESSAGES },
	{ label: "Interviews", to: ROUTES.APPLICANT_INTERVIEWS },
	{ label: "Profile", to: ROUTES.APPLICANT_PROFILE },
	// { label: "Company Reviews", to: ROUTES.APPLICANT_COMPANY_REVIEWS },
];

function ApplicantLayout() {
	const user = useSelector(selectAuthUser);

	return (
		<div className="min-h-screen bg-slate-50">
			<Topbar
				title={`Hi${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
			/>
			<nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
				<div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto py-3">
					{NAV_ITEMS.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) =>
								cn(
									"whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
									isActive
										? "bg-slate-950 text-white"
										: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
								)
							}
						>
							{item.label}
						</NavLink>
					))}
				</div>
			</nav>
			<main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				<Outlet />
			</main>
		</div>
	);
}

export default ApplicantLayout;

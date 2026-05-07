import { NavLink, Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { cn } from "../utils/classnames";

function AppLayout({ navItems, title }) {
	return (
		<div className="flex min-h-screen bg-slate-50">
			<Sidebar items={navItems} />
			<div className="flex min-w-0 flex-1 flex-col">
				<Topbar title={title} />
				<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
					<Outlet />
				</main>
			</div>
			<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
				<div className="flex gap-2 overflow-x-auto">
					{navItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.end}
							className={({ isActive }) =>
								cn(
									"whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium",
									isActive
										? "bg-slate-900 text-white"
										: "bg-slate-100 text-slate-700",
								)
							}
						>
							{item.label}
						</NavLink>
					))}
				</div>
			</nav>
		</div>
	);
}

export default AppLayout;

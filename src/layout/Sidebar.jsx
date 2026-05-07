import { NavLink } from "react-router";
import { cn } from "../utils/classnames";

function Sidebar({ items, brand }) {
	return (
		<aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white px-3 py-5 lg:block">
			<div className="px-2 pb-4 text-base font-semibold text-slate-950">
				{brand}
			</div>
			<nav className="space-y-1">
				{items.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						end={item.end}
						className={({ isActive }) =>
							cn(
								"block rounded-md px-3 py-2 text-sm font-medium transition",
								isActive
									? "bg-slate-950 text-white"
									: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
							)
						}
					>
						{item.label}
					</NavLink>
				))}
			</nav>
		</aside>
	);
}

export default Sidebar;

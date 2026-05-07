import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import { selectAuthUser } from "../store/slices/authSlice";
import { ROLE_LABELS } from "../constants/roles";
import { cn } from "../utils/classnames";

function initialsOf(name) {
	if (!name) return "?";
	const parts = name.trim().split(/\s+/).slice(0, 2);
	return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function Sidebar({ items }) {
	const user = useSelector(selectAuthUser);

	return (
		<aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-brand-900 text-slate-300 lg:flex">
			<div className="flex items-center gap-2 px-5 pt-6 pb-7">
				<img
					src="/hireflow-light.png"
					alt="HireFlow"
					className="h-10 w-14 object-contain"
				/>
				<span className="text-3xl font-semibold tracking-tight">
					<span className="text-white">Hire</span>
					<span className="text-cyan-300">Flow</span>
				</span>
			</div>

			<nav className="flex-1 overflow-y-auto px-3 pb-4">
				{user ? (
					<p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
						{ROLE_LABELS[user.role] ?? "Workspace"}
					</p>
				) : null}

				<ul className="space-y-0.5">
					{items.map((item) => (
						<li key={item.to}>
							<NavLink
								to={item.to}
								end={item.end}
								className={({ isActive }) =>
									cn(
										"group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
										isActive
											? "bg-white/10 text-white"
											: "text-slate-300 hover:bg-white/5 hover:text-white",
									)
								}
							>
								{({ isActive }) => (
									<>
										<span
											aria-hidden
											className={cn(
												"absolute inset-y-1.5 left-0 w-0.5 rounded-r-full transition",
												isActive
													? "bg-cyan-300"
													: "bg-transparent",
											)}
										/>
										<span className="truncate">
											{item.label}
										</span>
									</>
								)}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			{user ? (
				<div className="border-t border-white/5 px-3 py-4">
					<div className="flex items-center gap-3 rounded-md px-2 py-1.5">
						<span
							aria-hidden
							className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-sm font-semibold text-cyan-200 ring-1 ring-inset ring-cyan-300/20"
						>
							{initialsOf(user.name)}
						</span>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-white">
								{user.name}
							</p>
							<p className="truncate text-xs text-slate-400">
								{user.email}
							</p>
						</div>
					</div>
				</div>
			) : null}
		</aside>
	);
}

export default Sidebar;

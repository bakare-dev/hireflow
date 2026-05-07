import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppLayout({ brand, navItems, title }) {
	return (
		<div className="flex min-h-screen bg-slate-50">
			<Sidebar brand={brand} items={navItems} />
			<div className="flex min-w-0 flex-1 flex-col">
				<Topbar title={title} />
				<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
					<Outlet />
				</main>
			</div>
		</div>
	);
}

export default AppLayout;

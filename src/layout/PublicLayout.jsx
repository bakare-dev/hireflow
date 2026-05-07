import { Outlet } from "react-router";

function PublicLayout() {
	return (
		<div className="min-h-screen bg-slate-50">
			<main>
				<Outlet />
			</main>
		</div>
	);
}

export default PublicLayout;

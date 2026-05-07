import { Outlet } from "react-router";
import AuthLeftSide from "./AuthLeftSide";

function Auth() {
	return (
		<div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
			<AuthLeftSide />
			<main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 sm:px-6">
				<div className="w-full max-w-md">
					<Outlet />
				</div>
			</main>
		</div>
	);
}

export default Auth;

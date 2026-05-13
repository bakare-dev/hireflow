import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { logout, selectAuthUser } from "../store/slices/authSlice";
import { ROLE_LABELS } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import Button from "../components/common/Button";

function Topbar({ title, onMenuClick }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector(selectAuthUser);

	async function handleLogout() {
		await dispatch(logout()).unwrap();
		navigate(ROUTES.LANDING);
	}

	return (
		<header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onMenuClick}
					className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
					aria-label="Open navigation"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<line x1="3" y1="6" x2="21" y2="6" />
						<line x1="3" y1="12" x2="21" y2="12" />
						<line x1="3" y1="18" x2="21" y2="18" />
					</svg>
				</button>
				<h1 className="truncate text-sm font-semibold text-slate-700">
					{title}
				</h1>
			</div>
			<div className="flex items-center gap-3">
				{user ? (
					<div className="hidden text-right text-xs leading-tight sm:block">
						<div className="font-medium text-slate-950">
							{user.name}
						</div>
						<div className="text-slate-500">
							{ROLE_LABELS[user.role]}
						</div>
					</div>
				) : null}

				{user ? (
					<Button
						variant="secondary"
						size="sm"
						onClick={handleLogout}
					>
						Sign out
					</Button>
				) : null}
			</div>
		</header>
	);
}

export default Topbar;

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { logout, selectAuthUser } from "../store/slices/authSlice";
import { ROLE_LABELS } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import Button from "../components/common/Button";

function Topbar({ title }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector(selectAuthUser);

	async function handleLogout() {
		await dispatch(logout()).unwrap();
		navigate(ROUTES.LANDING);
	}

	return (
		<header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
			<h1 className="truncate text-sm font-semibold text-slate-700">
				{title}
			</h1>
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
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate(ROUTES.DEV_ROLE_SWITCH)}
				>
					Switch role
				</Button>
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

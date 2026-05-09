import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { logout, loginAs, selectAuthUser } from "../store/slices/authSlice";
import { authService } from "../services";
import { ROLE_HOME_PATHS, ROLE_LABELS, USER_ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import {
	PRIMARY_ADMIN_ID,
	PRIMARY_APPLICANT_ID,
	PRIMARY_HM_ID,
} from "../data/users";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import { cn } from "../utils/classnames";

const PRIMARY_USER_IDS = {
	[USER_ROLES.APPLICANT]: PRIMARY_APPLICANT_ID,
	[USER_ROLES.HIRING_MANAGER]: PRIMARY_HM_ID,
	[USER_ROLES.ADMIN]: PRIMARY_ADMIN_ID,
};

function RoleSwitchDropdown() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const currentUser = useSelector(selectAuthUser);

	const [open, setOpen] = useState(false);
	const [users, setUsers] = useState(null);
	const [switching, setSwitching] = useState(null);
	const wrapperRef = useRef(null);

	useEffect(() => {
		if (!open) return undefined;
		function onPointerDown(e) {
			if (!wrapperRef.current?.contains(e.target)) setOpen(false);
		}
		function onKey(e) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("mousedown", onPointerDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onPointerDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	useEffect(() => {
		if (!open || users) return;
		let cancelled = false;
		authService.listUsers().then((all) => {
			if (cancelled) return;
			const byRole = {};
			for (const role of Object.values(USER_ROLES)) {
				byRole[role] =
					all.find((u) => u.id === PRIMARY_USER_IDS[role]) ?? null;
			}
			setUsers(byRole);
		});
		return () => {
			cancelled = true;
		};
	}, [open, users]);

	const ROLES_IN_ORDER = useMemo(
		() => [
			USER_ROLES.APPLICANT,
			USER_ROLES.HIRING_MANAGER,
			USER_ROLES.ADMIN,
		],
		[],
	);

	async function pick(role) {
		const target = users?.[role];
		if (!target || target.id === currentUser?.id) return;
		setSwitching(target.id);
		try {
			const action = await dispatch(loginAs(target.id));
			if (loginAs.fulfilled.match(action)) {
				const next =
					ROLE_HOME_PATHS[action.payload.role] ?? ROUTES.LANDING;
				setOpen(false);
				navigate(next);
			}
		} finally {
			setSwitching(null);
		}
	}

	return (
		<div ref={wrapperRef} className="relative">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setOpen((v) => !v)}
				aria-haspopup="menu"
				aria-expanded={open}
			>
				Switch role
				<span aria-hidden className="ml-1 text-slate-500">
					▾
				</span>
			</Button>

			{open ? (
				<div
					role="menu"
					className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5"
				>
					<div className="border-b border-slate-100 px-4 py-3">
						<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
							Sign in as
						</p>
						<p className="mt-0.5 text-xs text-slate-500">
							Dev convenience — switch between seeded accounts.
						</p>
					</div>

					{!users ? (
						<div className="flex items-center justify-center py-6">
							<Spinner />
						</div>
					) : (
						<ul className="py-1">
							{ROLES_IN_ORDER.map((role) => {
								const u = users[role];
								const isCurrent = u?.id === currentUser?.id;
								const isBusy = switching === u?.id;
								return (
									<li key={role}>
										<button
											type="button"
											role="menuitem"
											disabled={
												!u || isCurrent || !!switching
											}
											onClick={() => pick(role)}
											className={cn(
												"flex w-full items-center gap-3 px-4 py-2.5 text-left transition",
												isCurrent
													? "cursor-default bg-slate-50"
													: "hover:bg-slate-50 focus-visible:bg-slate-50",
												!u && "opacity-60",
											)}
										>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium text-slate-950">
													{u?.name ?? "—"}
												</p>
												<p className="truncate text-xs text-slate-500">
													{ROLE_LABELS[role]}
												</p>
											</div>
											{isCurrent ? (
												<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-inset ring-emerald-200">
													Current
												</span>
											) : isBusy ? (
												<Spinner />
											) : (
												<span
													aria-hidden
													className="text-slate-400"
												>
													→
												</span>
											)}
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			) : null}
		</div>
	);
}

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
				<RoleSwitchDropdown />
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

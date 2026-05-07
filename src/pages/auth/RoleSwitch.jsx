import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { loginAs, selectAuthUser } from "../../store/slices/authSlice";
import { authService } from "../../services";
import {
	ROLE_HOME_PATHS,
	ROLE_LABELS,
	USER_ROLES,
} from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";
import {
	PRIMARY_ADMIN_ID,
	PRIMARY_APPLICANT_ID,
	PRIMARY_HM_ID,
} from "../../data/users";
import Spinner from "../../components/common/Spinner";

const PRIMARY_USER_IDS = {
	[USER_ROLES.APPLICANT]: PRIMARY_APPLICANT_ID,
	[USER_ROLES.HIRING_MANAGER]: PRIMARY_HM_ID,
	[USER_ROLES.ADMIN]: PRIMARY_ADMIN_ID,
};

function RoleSwitch() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const currentUser = useSelector(selectAuthUser);
	const [users, setUsers] = useState(null);

	useEffect(() => {
		let cancelled = false;
		authService.listUsers().then((u) => {
			if (!cancelled) setUsers(u);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const grouped = useMemo(() => {
		if (!users) return null;
		const out = {
			[USER_ROLES.APPLICANT]: [],
			[USER_ROLES.HIRING_MANAGER]: [],
			[USER_ROLES.ADMIN]: [],
		};
		for (const u of users) out[u.role]?.push(u);
		return out;
	}, [users]);

	async function pick(userId) {
		const user = await dispatch(loginAs(userId)).unwrap();
		navigate(ROLE_HOME_PATHS[user.role] ?? ROUTES.LANDING);
	}

	return (
		<div className="mx-auto max-w-3xl px-4 py-12">
			<div className="mb-6 text-center">
				<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
					Dev role-switch
				</p>
				<h1 className="mt-1 text-2xl font-semibold text-slate-950">
					Sign in as a seeded user
				</h1>
				<p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
					We are prototyping with dummy data. Pick a seeded account to
					explore the corresponding actor's screens.
				</p>
				{currentUser ? (
					<p className="mt-3 text-xs text-slate-500">
						Currently signed in as{" "}
						<span className="font-medium">{currentUser.name}</span>{" "}
						({ROLE_LABELS[currentUser.role]}).
					</p>
				) : null}
			</div>

			{!grouped ? (
				<div className="flex justify-center py-12">
					<Spinner />
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-3">
					{Object.values(USER_ROLES).map((role) => {
						const primaryId = PRIMARY_USER_IDS[role];
						const primary = grouped[role].find(
							(u) => u.id === primaryId,
						);
						return (
							<Card key={role}>
								<CardHeader>
									<div>
										<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
											{ROLE_LABELS[role]}
										</p>
										<h2 className="mt-1 text-base font-semibold text-slate-950">
											{primary?.name ?? "—"}
										</h2>
									</div>
								</CardHeader>
								<CardBody>
									<p className="text-sm text-slate-600">
										{primary?.email}
									</p>
									<Button
										className="mt-4 w-full"
										onClick={() =>
											primary && pick(primary.id)
										}
										disabled={!primary}
									>
										Continue as {ROLE_LABELS[role]}
									</Button>
								</CardBody>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default RoleSwitch;

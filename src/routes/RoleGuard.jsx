import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
	selectAuthRole,
	selectAuthStatus,
	selectAuthUser,
} from "../store/slices/authSlice";
import { ROUTES } from "../constants/routes";
import Spinner from "../components/common/Spinner";
import NotFound from "../pages/shared/NotFound";

function RoleGuard({ allow, children }) {
	const status = useSelector(selectAuthStatus);
	const role = useSelector(selectAuthRole);
	const user = useSelector(selectAuthUser);
	const location = useLocation();

	if (status === "idle" || status === "loading") {
		return (
			<div className="flex min-h-[40vh] items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!user) {
		return (
			<Navigate
				to={ROUTES.SIGN_IN}
				state={{ from: location.pathname }}
				replace
			/>
		);
	}

	const allowed = Array.isArray(allow) ? allow : [allow];
	if (!allowed.includes(role)) {
		// No role switching anymore — a disallowed role just sees the
		// not-found screen, same as any unknown URL.
		return <NotFound />;
	}

	return children;
}

export default RoleGuard;

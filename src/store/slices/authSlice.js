import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setAuthToken } from "../../services/api";
import { baseApi } from "../../api/baseApi";

const STORAGE_KEY = "hireflow.session";

function sanitizeSessionUser(user) {
	if (!user) return null;
	const sessionUser = { ...user };
	delete sessionUser.token;
	return sessionUser;
}

function loadInitialSession() {
	if (typeof window === "undefined") return null;
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (!stored) return null;
		try {
			const parsed = JSON.parse(stored);
			if (parsed?.user) return parsed;
		} catch {
			return null;
		}
		return null;
	} catch {
		return null;
	}
}

function persistSessionUser(user) {
	if (typeof window === "undefined") return;
	try {
		const sessionUser = sanitizeSessionUser(user);
		if (sessionUser) {
			window.localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ user: sessionUser }),
			);
		} else {
			window.localStorage.removeItem(STORAGE_KEY);
		}
	} catch {
		return;
	}
}

export const restoreSession = createAsyncThunk(
	"auth/restoreSession",
	async (_arg, { rejectWithValue }) => {
		const session = loadInitialSession();
		if (!session?.user?.role) return rejectWithValue("NO_SESSION");
		return session.user;
	},
);

export const logout = createAsyncThunk(
	"auth/logout",
	async (_arg, { dispatch }) => {
		setAuthToken(null);
		persistSessionUser(null);
		if (typeof window !== "undefined") {
			try {
				for (const key of Object.keys(window.localStorage)) {
					if (key.startsWith("hireflow.")) {
						window.localStorage.removeItem(key);
					}
				}
				for (const key of Object.keys(window.sessionStorage)) {
					if (key.startsWith("hireflow.")) {
						window.sessionStorage.removeItem(key);
					}
				}
			} catch {
				/* storage disabled — ignore */
			}
		}

		dispatch(baseApi.util.resetApiState());
	},
);

const authSlice = createSlice({
	name: "auth",
	initialState: {
		user: null,
		status: "idle",
		error: null,
	},
	reducers: {
		setAuthenticatedUser(state, action) {
			persistSessionUser(action.payload);
			state.user = sanitizeSessionUser(action.payload);
			state.status = "authenticated";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(restoreSession.pending, (state) => {
				state.status = "loading";
			})
			.addCase(restoreSession.fulfilled, (state, action) => {
				state.user = action.payload;
				state.status = "authenticated";
			})
			.addCase(restoreSession.rejected, (state) => {
				state.user = null;
				state.status = "unauthenticated";
			})
			.addCase(logout.fulfilled, (state) => {
				state.user = null;
				state.status = "unauthenticated";
			});
	},
});

export const { setAuthenticatedUser } = authSlice.actions;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthRole = (state) => state.auth.user?.role ?? null;

export default authSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services";
import { setAuthToken } from "../../services/api";

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
			return { userId: stored };
		}
		return { userId: stored };
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

export const loginAs = createAsyncThunk("auth/loginAs", async (userId) => {
	const user = await authService.loginAs(userId);
	persistSessionUser(user);
	return user;
});

export const signInWithEmail = createAsyncThunk(
	"auth/signInWithEmail",
	async (input, { rejectWithValue }) => {
		try {
			const user = await authService.signInWithEmail(input);
			persistSessionUser(user);
			return user;
		} catch (err) {
			return rejectWithValue({ message: err.message, code: err.code });
		}
	},
);

export const signUpApplicant = createAsyncThunk(
	"auth/signUpApplicant",
	async (input, { rejectWithValue }) => {
		try {
			const user = await authService.signUpApplicant(input);
			persistSessionUser(user);
			return user;
		} catch (err) {
			return rejectWithValue({ message: err.message, code: err.code });
		}
	},
);

export const signUpRecruiter = createAsyncThunk(
	"auth/signUpRecruiter",
	async (input, { rejectWithValue }) => {
		try {
			const user = await authService.signUpRecruiter(input);
			persistSessionUser(user);
			return user;
		} catch (err) {
			return rejectWithValue({ message: err.message, code: err.code });
		}
	},
);

export const restoreSession = createAsyncThunk(
	"auth/restoreSession",
	async (_arg, { rejectWithValue }) => {
		const session = loadInitialSession();
		if (!session) return rejectWithValue("NO_SESSION");
		if (session.user?.role) return session.user;
		try {
			return await authService.getUserById(session.userId);
		} catch {
			persistSessionUser(null);
			setAuthToken(null);
			return rejectWithValue("USER_NOT_FOUND");
		}
	},
);

export const logout = createAsyncThunk("auth/logout", async () => {
	persistSessionUser(null);
	setAuthToken(null);
});

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
			.addCase(loginAs.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(loginAs.fulfilled, (state, action) => {
				state.user = action.payload;
				state.status = "authenticated";
			})
			.addCase(loginAs.rejected, (state, action) => {
				state.status = "unauthenticated";
				state.error = action.error?.message ?? "Login failed";
			})
			.addCase(signInWithEmail.fulfilled, (state, action) => {
				state.user = action.payload;
				state.status = "authenticated";
				state.error = null;
			})
			.addCase(signInWithEmail.rejected, (state, action) => {
				state.error =
					action.payload?.message ??
					action.error?.message ??
					"Sign in failed";
			})
			.addCase(signUpApplicant.fulfilled, (state, action) => {
				state.user = action.payload;
				state.status = "authenticated";
				state.error = null;
			})
			.addCase(signUpRecruiter.fulfilled, (state, action) => {
				state.user = action.payload;
				state.status = "authenticated";
				state.error = null;
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

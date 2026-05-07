import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services";

const STORAGE_KEY = "hireflow.session";

function loadInitialUserId() {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage.getItem(STORAGE_KEY) || null;
	} catch {
		return null;
	}
}

function persistUserId(userId) {
	if (typeof window === "undefined") return;
		try {
			if (userId) window.localStorage.setItem(STORAGE_KEY, userId);
			else window.localStorage.removeItem(STORAGE_KEY);
		} catch {
			return;
		}
}

export const loginAs = createAsyncThunk("auth/loginAs", async (userId) => {
	const user = await authService.loginAs(userId);
	persistUserId(user.id);
	return user;
});

export const signInWithEmail = createAsyncThunk(
	"auth/signInWithEmail",
	async (input, { rejectWithValue }) => {
		try {
			const user = await authService.signInWithEmail(input);
			persistUserId(user.id);
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
			persistUserId(user.id);
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
			persistUserId(user.id);
			return user;
		} catch (err) {
			return rejectWithValue({ message: err.message, code: err.code });
		}
	},
);

export const restoreSession = createAsyncThunk(
	"auth/restoreSession",
	async (_arg, { rejectWithValue }) => {
		const userId = loadInitialUserId();
		if (!userId) return rejectWithValue("NO_SESSION");
		try {
			return await authService.getUserById(userId);
		} catch {
			persistUserId(null);
			return rejectWithValue("USER_NOT_FOUND");
		}
	},
);

export const logout = createAsyncThunk("auth/logout", async () => {
	persistUserId(null);
});

const authSlice = createSlice({
	name: "auth",
	initialState: {
		user: null,
		status: "idle",
		error: null,
	},
	reducers: {},
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

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthRole = (state) => state.auth.user?.role ?? null;

export default authSlice.reducer;

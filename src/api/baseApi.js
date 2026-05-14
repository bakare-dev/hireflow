import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
	reducerPath: "api",
	baseQuery: fakeBaseQuery(),
	tagTypes: [
		"Auth",
		"Jobs",
		"Applications",
		"Interviews",
		"Notifications",
		"Companies",
		"Staff",
		"ScorecardTemplates",
		"Scorecards",
	],
	endpoints: () => ({}),
});

const WEIGHTS = Object.freeze({
	skill: 0.4,
	semantic: 0.35,
	experience: 0.15,
	seniority: 0.1,
});

const STOPWORDS = new Set([
	"a", "an", "the", "and", "or", "but", "if", "of", "in", "on", "at", "to",
	"for", "with", "by", "from", "as", "is", "are", "was", "were", "be", "been",
	"being", "this", "that", "these", "those", "it", "its", "we", "you", "they",
	"i", "me", "my", "our", "us", "your", "their", "them", "he", "she", "his",
	"her", "him", "will", "would", "should", "can", "could", "may", "might",
	"have", "has", "had", "do", "does", "did", "not", "no", "so", "than", "then",
	"there", "here", "about", "into", "over", "under", "within", "across",
	"job", "role", "position", "work", "team", "company", "experience",
	"experienced", "responsible", "responsibilities", "qualifications",
	"required", "preferred", "preferred", "ability", "able", "must", "good",
	"strong", "etc", "eg", "ie", "via", "across",
]);

const SENIORITY_LEVELS = Object.freeze({
	INTERN: 0,
	JUNIOR: 1,
	MID: 2,
	SENIOR: 3,
	LEAD: 4,
	STAFF: 5,
	PRINCIPAL: 6,
});

const SENIORITY_KEYWORDS = [
	{ level: SENIORITY_LEVELS.PRINCIPAL, patterns: ["principal", "distinguished"] },
	{ level: SENIORITY_LEVELS.STAFF, patterns: ["staff"] },
	{ level: SENIORITY_LEVELS.LEAD, patterns: ["lead", "head of", "manager", "director"] },
	{ level: SENIORITY_LEVELS.SENIOR, patterns: ["senior", "sr.", "sr "] },
	{ level: SENIORITY_LEVELS.JUNIOR, patterns: ["junior", "jr.", "jr ", "entry", "entry-level", "associate"] },
	{ level: SENIORITY_LEVELS.INTERN, patterns: ["intern", "internship", "trainee", "graduate"] },
];

export function computeJobMatch(job, profile) {
	if (!job) return zeroMatch();
	const safeProfile = profile ?? {};

	const skill = computeSkillScore(job, safeProfile);
	const semantic = computeSemanticScore(job, safeProfile);
	const experience = computeExperienceScore(job, safeProfile);
	const seniority = computeSeniorityScore(job, safeProfile);

	const final =
		skill.score * WEIGHTS.skill +
		semantic.score * WEIGHTS.semantic +
		experience.score * WEIGHTS.experience +
		seniority.score * WEIGHTS.seniority;

	return {
		score: Math.round(clamp01(final) * 100),
		breakdown: {
			skillScore: round2(skill.score),
			semanticScore: round2(semantic.score),
			experienceScore: round2(experience.score),
			seniorityScore: round2(seniority.score),
		},
		details: {
			matchedSkills: skill.matched,
			missingSkills: skill.missing,
			profileYears: experience.profileYears,
			requiredYears: experience.requiredYears,
			jobLevel: seniority.jobLevel,
			profileLevel: seniority.profileLevel,
		},
	};
}

export function matchedSkillsFor(job, profile) {
	return computeSkillScore(job, profile ?? {});
}

function computeSkillScore(job, profile) {
	const jobSkills = normalizeSkillList(job?.skills);
	const profileSkills = normalizeSkillList(profile?.skills);

	if (!jobSkills.length) {
		return { score: profileSkills.length ? 0.5 : 0, matched: [], missing: [] };
	}

	const profileSet = new Set(profileSkills);
	const matched = [];
	const missing = [];

	for (const skill of jobSkills) {
		if (profileSet.has(skill) || hasTokenOverlap(skill, profileSet)) {
			matched.push(skill);
		} else {
			missing.push(skill);
		}
	}

	const score = matched.length / jobSkills.length;
	return { score: clamp01(score), matched, missing };
}

function computeSemanticScore(job, profile) {
	const jobDoc = buildJobDocument(job);
	const profileDoc = buildProfileDocument(profile);
	if (!jobDoc.length || !profileDoc.length) return { score: 0 };

	const jobVec = termFrequency(jobDoc);
	const profileVec = termFrequency(profileDoc);
	return { score: cosineSimilarity(jobVec, profileVec) };
}

function computeExperienceScore(job, profile) {
	const profileYears = totalYearsOfExperience(profile?.workExperiences);
	const requiredYears = parseRequiredYears(
		[job?.requiredQualifications, job?.preferredQualifications].join(" "),
	);

	if (requiredYears == null) {
		const neutral = profileYears > 0 ? 0.7 : 0.3;
		return { score: neutral, profileYears, requiredYears: null };
	}

	const ratio = requiredYears > 0 ? profileYears / requiredYears : 1;
	const score = ratio >= 1 ? 1 : Math.max(0, ratio);
	return { score: clamp01(score), profileYears, requiredYears };
}

function computeSeniorityScore(job, profile) {
	const jobLevel = inferLevelFromTitle(job?.title);
	const latestTitle = latestJobTitle(profile?.workExperiences);
	const profileYears = totalYearsOfExperience(profile?.workExperiences);
	const profileLevel = inferLevelFromProfile(latestTitle, profileYears);

	if (jobLevel == null) {
		return { score: 0.7, jobLevel: null, profileLevel };
	}

	const gap = Math.abs(jobLevel - profileLevel);
	const score = Math.max(0, 1 - gap * 0.25);
	return { score, jobLevel, profileLevel };
}

function buildJobDocument(job) {
	if (!job) return [];
	const parts = [
		job.title,
		job.summary,
		job.responsibilities,
		job.requiredQualifications,
		job.preferredQualifications,
		(job.skills ?? []).map((s) => s.name).join(" "),
	];
	return tokenize(parts.join(" "));
}

function buildProfileDocument(profile) {
	if (!profile) return [];
	const skills = (profile.skills ?? []).map((s) => s.name ?? s).join(" ");
	const work = (profile.workExperiences ?? [])
		.map((w) => [w.jobTitle, w.companyName, w.experience].filter(Boolean).join(" "))
		.join(" ");
	const education = (profile.educations ?? [])
		.map((e) => [e.degree, e.institutionName].filter(Boolean).join(" "))
		.join(" ");
	const parts = [profile.summary, skills, work, education];
	return tokenize(parts.join(" "));
}

function tokenize(input) {
	if (!input) return [];
	const stripped = String(input)
		.replace(/<[^>]+>/g, " ")
		.replace(/&[a-z]+;/gi, " ")
		.toLowerCase();
	const tokens = stripped.match(/[a-z0-9][a-z0-9+.#-]*/g) ?? [];
	return tokens.filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function termFrequency(tokens) {
	const counts = new Map();
	for (const token of tokens) {
		counts.set(token, (counts.get(token) ?? 0) + 1);
	}
	return counts;
}

function cosineSimilarity(a, b) {
	if (!a.size || !b.size) return 0;
	const [shorter, longer] = a.size <= b.size ? [a, b] : [b, a];
	let dot = 0;
	for (const [token, value] of shorter) {
		const other = longer.get(token);
		if (other) dot += value * other;
	}
	const magA = vectorMagnitude(a);
	const magB = vectorMagnitude(b);
	if (!magA || !magB) return 0;
	return dot / (magA * magB);
}

function vectorMagnitude(vec) {
	let sum = 0;
	for (const value of vec.values()) sum += value * value;
	return Math.sqrt(sum);
}

function normalizeSkillList(skills) {
	if (!Array.isArray(skills)) return [];
	return skills
		.map((skill) => (typeof skill === "string" ? skill : skill?.name))
		.filter(Boolean)
		.map((name) => name.toLowerCase().trim());
}

function hasTokenOverlap(skill, profileSet) {
	const tokens = skill.split(/[\s/.-]+/).filter((t) => t.length > 1);
	if (tokens.length < 2) return false;
	for (const token of tokens) {
		if (profileSet.has(token)) return true;
	}
	for (const candidate of profileSet) {
		if (candidate.includes(skill) || skill.includes(candidate)) return true;
	}
	return false;
}

function totalYearsOfExperience(workExperiences) {
	if (!Array.isArray(workExperiences) || !workExperiences.length) return 0;
	const ranges = workExperiences
		.map((exp) => {
			const start = parseDate(exp.startDate);
			const end = parseDate(exp.endDate) ?? new Date();
			if (!start || end < start) return null;
			return [start.getTime(), end.getTime()];
		})
		.filter(Boolean)
		.sort((a, b) => a[0] - b[0]);

	if (!ranges.length) return 0;

	let totalMs = 0;
	let [curStart, curEnd] = ranges[0];
	for (let i = 1; i < ranges.length; i += 1) {
		const [nextStart, nextEnd] = ranges[i];
		if (nextStart <= curEnd) {
			curEnd = Math.max(curEnd, nextEnd);
		} else {
			totalMs += curEnd - curStart;
			[curStart, curEnd] = [nextStart, nextEnd];
		}
	}
	totalMs += curEnd - curStart;

	return totalMs / (365.25 * 24 * 60 * 60 * 1000);
}

function parseDate(value) {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function parseRequiredYears(text) {
	if (!text) return null;
	const stripped = String(text).replace(/<[^>]+>/g, " ").toLowerCase();
	const patterns = [
		/(\d+)\s*\+?\s*(?:to|-)\s*\d+\s*years?/,
		/(\d+)\s*\+\s*years?/,
		/at least\s*(\d+)\s*years?/,
		/minimum (?:of )?(\d+)\s*years?/,
		/(\d+)\s*years?\s+of\s+(?:experience|relevant)/,
		/(\d+)\s*years?/,
	];
	for (const pattern of patterns) {
		const match = stripped.match(pattern);
		if (match) {
			const value = Number(match[1]);
			if (Number.isFinite(value)) return value;
		}
	}
	return null;
}

function latestJobTitle(workExperiences) {
	if (!Array.isArray(workExperiences) || !workExperiences.length) return null;
	const sorted = [...workExperiences].sort((a, b) => {
		const aEnd = parseDate(a.endDate)?.getTime() ?? Date.now();
		const bEnd = parseDate(b.endDate)?.getTime() ?? Date.now();
		return bEnd - aEnd;
	});
	return sorted[0]?.jobTitle ?? null;
}

function inferLevelFromTitle(title) {
	if (!title) return null;
	const lower = title.toLowerCase();
	for (const entry of SENIORITY_KEYWORDS) {
		if (entry.patterns.some((pattern) => lower.includes(pattern))) {
			return entry.level;
		}
	}
	return SENIORITY_LEVELS.MID;
}

function inferLevelFromProfile(jobTitle, years) {
	const fromTitle = inferLevelFromTitle(jobTitle);
	if (fromTitle != null && fromTitle !== SENIORITY_LEVELS.MID) return fromTitle;
	if (years >= 12) return SENIORITY_LEVELS.PRINCIPAL;
	if (years >= 9) return SENIORITY_LEVELS.STAFF;
	if (years >= 7) return SENIORITY_LEVELS.LEAD;
	if (years >= 4) return SENIORITY_LEVELS.SENIOR;
	if (years >= 2) return SENIORITY_LEVELS.MID;
	if (years >= 1) return SENIORITY_LEVELS.JUNIOR;
	return SENIORITY_LEVELS.INTERN;
}

function clamp01(value) {
	if (!Number.isFinite(value)) return 0;
	if (value < 0) return 0;
	if (value > 1) return 1;
	return value;
}

function round2(value) {
	return Math.round(value * 100) / 100;
}

function zeroMatch() {
	return {
		score: 0,
		breakdown: {
			skillScore: 0,
			semanticScore: 0,
			experienceScore: 0,
			seniorityScore: 0,
		},
		details: {
			matchedSkills: [],
			missingSkills: [],
			profileYears: 0,
			requiredYears: null,
			jobLevel: null,
			profileLevel: null,
		},
	};
}

export const __testing__ = {
	tokenize,
	cosineSimilarity,
	termFrequency,
	parseRequiredYears,
	totalYearsOfExperience,
	inferLevelFromTitle,
};

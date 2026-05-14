import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

GlobalWorkerOptions.workerPort = new PdfWorker();

const SECTION_RE = {
	summary:
		/^(summary|professional summary|career summary|profile|objective|about me|about)\s*:?\s*$/i,
	skills: /^(skills|technical skills|core competencies|technologies|key skills|areas of expertise|tools|tech stack|competencies)\s*:?\s*$/i,
	experience:
		/^(experience|work experience|employment|professional experience|work history|career history|employment history)\s*:?\s*$/i,
	education:
		/^(education|academic|qualifications|academic background|academic qualifications)\s*:?\s*$/i,
};

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const PHONE_RE =
	/(?:\+?\d{1,3}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,5}[\s\-.]?\d{3,5}/;
const LINKEDIN_RE = /linkedin\.com\/in\/[a-zA-Z0-9%_\-]+/i;

const MONTH =
	"(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?";
const DATE_PART = `(?:${MONTH}\\s+\\d{4}|\\d{4})`;
const DATE_RANGE_LINE_RE = new RegExp(
	`${DATE_PART}\\s*[-–—]\\s*(?:${DATE_PART}|present|current|till date|ongoing)`,
	"i",
);

const SKILL_KEYWORDS = [
	"JavaScript",
	"TypeScript",
	"Python",
	"Java",
	"C++",
	"C#",
	"Go",
	"Golang",
	"Rust",
	"PHP",
	"Ruby",
	"Swift",
	"Kotlin",
	"Dart",
	"Scala",
	"R",
	"Bash",
	"Shell",
	"PowerShell",
	"Solidity",
	"Elixir",
	"Haskell",
	"Perl",
	"React",
	"Vue",
	"Vue.js",
	"Angular",
	"Next.js",
	"Nuxt.js",
	"Svelte",
	"HTML",
	"CSS",
	"Tailwind",
	"Tailwind CSS",
	"Bootstrap",
	"SASS",
	"SCSS",
	"Redux",
	"Zustand",
	"MobX",
	"GraphQL",
	"REST",
	"Webpack",
	"Vite",
	"Babel",
	"React Query",
	"Tanstack",
	"Framer Motion",
	"Node.js",
	"Express",
	"Express.js",
	"NestJS",
	"Django",
	"Flask",
	"FastAPI",
	"Spring",
	"Spring Boot",
	"Laravel",
	"Rails",
	"Ruby on Rails",
	"ASP.NET",
	".NET",
	"gRPC",
	"tRPC",
	"Hapi",
	"Koa",
	"MySQL",
	"PostgreSQL",
	"MongoDB",
	"Redis",
	"SQLite",
	"Oracle",
	"SQL Server",
	"MSSQL",
	"DynamoDB",
	"Cassandra",
	"Elasticsearch",
	"Firebase",
	"Supabase",
	"SQL",
	"NoSQL",
	"Prisma",
	"Sequelize",
	"TypeORM",
	"Mongoose",
	"AWS",
	"GCP",
	"Azure",
	"Docker",
	"Kubernetes",
	"K8s",
	"Terraform",
	"Ansible",
	"Jenkins",
	"GitHub Actions",
	"GitLab CI",
	"CircleCI",
	"CI/CD",
	"Linux",
	"Nginx",
	"Apache",
	"Vercel",
	"Netlify",
	"Heroku",
	"DigitalOcean",
	"React Native",
	"Flutter",
	"Android",
	"iOS",
	"Expo",
	"Git",
	"GitHub",
	"GitLab",
	"Bitbucket",
	"Jira",
	"Confluence",
	"Figma",
	"Postman",
	"Jest",
	"Cypress",
	"Playwright",
	"Selenium",
	"Vitest",
	"Mocha",
	"Chai",
	"Storybook",
	"Agile",
	"Scrum",
	"Kanban",
	"TDD",
	"BDD",
	"Microservices",
	"Serverless",
	"Machine Learning",
	"ML",
	"AI",
	"Deep Learning",
	"NLP",
	"Data Science",
	"Data Analysis",
	"ETL",
	"System Design",
	"OOP",
	"Functional Programming",
	"Web3",
	"Blockchain",
	"Leadership",
	"Communication",
	"Problem Solving",
	"Teamwork",
	"Project Management",
	"Mentoring",
	"Code Review",
	"Technical Writing",
];

function normalizeLinkedIn(raw) {
	const redirectMatch = raw.match(/[?&]url=([^&]+)/);
	if (redirectMatch) {
		raw = decodeURIComponent(redirectMatch[1]);
	}
	if (!/^https?:\/\//i.test(raw)) return `https://${raw}`;
	return raw;
}

async function extractFromPdf(file) {
	const buffer = await file.arrayBuffer();
	const pdf = await getDocument({ data: buffer }).promise;
	const allLines = [];
	let linkedInUrl = "";

	for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
		const page = await pdf.getPage(pageNum);
		const [{ items }, annotations] = await Promise.all([
			page.getTextContent(),
			page.getAnnotations(),
		]);

		const lineMap = new Map();
		for (const item of items) {
			const y = Math.round(item.transform[5] / 2) * 2;
			if (!lineMap.has(y)) lineMap.set(y, []);
			lineMap.get(y).push(item);
		}

		const sortedLines = [...lineMap.entries()]
			.sort(([a], [b]) => b - a)
			.map(([, lineItems]) => {
				const sorted = lineItems.sort(
					(a, b) => a.transform[4] - b.transform[4],
				);
				return sorted
					.map((item, i) => {
						const next = sorted[i + 1];
						const gap = next
							? next.transform[4] -
								(item.transform[4] + item.width)
							: 0;
						return item.str + (gap > 2 ? " " : "");
					})
					.join("")
					.trim();
			})
			.filter(Boolean);

		allLines.push(...sortedLines);

		if (!linkedInUrl) {
			for (const ann of annotations) {
				if (ann.subtype !== "Link") continue;
				const href = ann.url ?? ann.unsafeUrl ?? "";
				if (/linkedin\.com\/in\//i.test(href)) {
					linkedInUrl = normalizeLinkedIn(href);
					break;
				}
			}
		}
	}

	return { text: allLines.join("\n"), linkedInUrl };
}

function extractSections(text) {
	const sections = {
		header: [],
		summary: [],
		skills: [],
		experience: [],
		education: [],
	};
	let current = "header";

	for (const raw of text.split("\n")) {
		const line = raw.trim();
		if (!line) continue;

		let hit = false;
		for (const [name, pattern] of Object.entries(SECTION_RE)) {
			if (pattern.test(line)) {
				current = name;
				hit = true;
				break;
			}
		}
		if (!hit) sections[current].push(line);
	}

	return sections;
}

function parseContact(fullText, linkedInUrl = "") {
	const emailMatch = fullText.match(EMAIL_RE);
	const phoneMatch = fullText.match(PHONE_RE);
	const textLinkedIn = fullText.match(LINKEDIN_RE);
	return {
		email: emailMatch?.[0] ?? "",
		phoneNumber: phoneMatch?.[0] ?? "",
		linkedIn:
			linkedInUrl || (textLinkedIn ? `https://${textLinkedIn[0]}` : ""),
	};
}

function parseSkills(skillLines, fullText) {
	if (skillLines.length > 0) {
		const raw = skillLines.join(" ");
		const parsed = raw
			.split(/[,•|\n\/·]/)
			.map((s) => s.trim())
			.filter((s) => s.length >= 2 && s.length <= 50);
		if (parsed.length >= 2) return parsed;
	}

	const lower = fullText.toLowerCase();
	return SKILL_KEYWORDS.filter((sk) => {
		const lk = sk.toLowerCase();
		const idx = lower.indexOf(lk);
		if (idx === -1) return false;
		const pre = lower[idx - 1] ?? " ";
		const post = lower[idx + lk.length] ?? " ";
		return !/[a-z0-9]/.test(pre) && !/[a-z0-9]/.test(post);
	});
}

const MONTH_MAP = {
	jan: "01",
	feb: "02",
	mar: "03",
	apr: "04",
	may: "05",
	jun: "06",
	jul: "07",
	aug: "08",
	sep: "09",
	oct: "10",
	nov: "11",
	dec: "12",
};

function parseMonthYear(raw) {
	const s = raw.trim().toLowerCase().replace(/\./, "");
	if (/present|current|now|ongoing|till date/.test(s)) return "Present";

	const mMatch = s.match(
		/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/,
	);
	if (mMatch) return `${mMatch[2]}-${MONTH_MAP[mMatch[1].slice(0, 3)]}`;

	const yMatch = s.match(/(\d{4})/);
	if (yMatch) return yMatch[1];

	return raw.trim();
}

function splitDateRange(text) {
	const m = text.match(/^(.+?)\s*[-–—]\s*(.+)$/);
	if (!m) return { startDate: "", endDate: "" };
	return { startDate: parseMonthYear(m[1]), endDate: parseMonthYear(m[2]) };
}

function parseEntryHeader(line, dateMatch) {
	const pipeIdx = line.lastIndexOf("|", dateMatch.index);
	const boundary = pipeIdx !== -1 ? pipeIdx : dateMatch.index;

	const beforeDate = line
		.slice(0, boundary)
		.replace(/[|\s,]+$/, "")
		.trim();

	const dashMatch = beforeDate.match(/^(.+?)\s*[–—]\s*(.+)$/);
	if (dashMatch) {
		return {
			jobTitle: dashMatch[1].trim(),
			companyName: dashMatch[2].trim(),
		};
	}

	return { jobTitle: "", companyName: beforeDate };
}

function parseExperience(expLines) {
	if (!expLines.length) return [];

	const entries = [];
	let current = null;

	for (const line of expLines) {
		const dateMatch = line.match(DATE_RANGE_LINE_RE);
		if (dateMatch) {
			if (current) entries.push(current);
			const { jobTitle, companyName } = parseEntryHeader(line, dateMatch);
			const { startDate, endDate } = splitDateRange(dateMatch[0]);
			current = {
				id: crypto.randomUUID(),
				companyName,
				jobTitle,
				startDate,
				endDate,
				descLines: [],
			};
		} else if (current) {
			current.descLines.push(line);
		}
	}

	if (current) entries.push(current);

	if (!entries.length) {
		return [
			{
				id: crypto.randomUUID(),
				companyName: "",
				jobTitle: "",
				startDate: "",
				endDate: "",
				experience: wrapHtml(expLines.join("\n")),
			},
		];
	}

	return entries.map(({ descLines, ...rest }) => ({
		...rest,
		experience: wrapHtml(descLines.join("\n")),
	}));
}

const DEGREE_RE =
	/\b(bachelor|master|phd|ph\.d|doctorate|doctor|associate|diploma|certificate|b\.sc|m\.sc|b\.eng|m\.eng|mba|b\.a|m\.a|b\.s|m\.s|hnd|ond|bsc|msc|b\.tech|m\.tech)\b/i;

function parseEducation(eduLines) {
	if (!eduLines.length) return [];

	const groups = [];
	let pending = [];

	for (const line of eduLines) {
		const dateMatch = line.match(DATE_RANGE_LINE_RE);
		if (dateMatch) {
			const { startDate, endDate } = splitDateRange(dateMatch[0]);
			const beforeDate = line
				.slice(0, dateMatch.index)
				.replace(/[|\s,–—-]+$/, "")
				.trim();
			if (beforeDate) pending.push(beforeDate);
			groups.push({ lines: pending, startDate, endDate });
			pending = [];
		} else {
			pending.push(line);
		}
	}

	if (pending.length) {
		groups.push({ lines: pending, startDate: "", endDate: "" });
	}

	return groups
		.filter((g) => g.lines.length > 0)
		.map(({ lines, startDate, endDate }) => {
			let degree = "";
			let institutionName = "";

			if (lines.length === 1) {
				const [line] = lines;
				const sep = line.match(/^(.+?)\s*[|–—]\s*(.+)$/);
				if (sep) {
					if (DEGREE_RE.test(sep[1])) {
						degree = sep[1].trim();
						institutionName = sep[2].trim();
					} else {
						institutionName = sep[1].trim();
						degree = sep[2].trim();
					}
				} else if (DEGREE_RE.test(line)) {
					degree = line;
				} else {
					institutionName = line;
				}
			} else {
				const degreeIdx = lines.findIndex((l) => DEGREE_RE.test(l));
				if (degreeIdx !== -1) {
					degree = lines[degreeIdx];
					institutionName =
						lines.find((_, i) => i !== degreeIdx) || "";
				} else {
					institutionName = lines[0];
					degree = lines.slice(1).join(", ");
				}
			}

			return {
				id: crypto.randomUUID(),
				institutionName,
				degree,
				startDate,
				endDate,
			};
		});
}

function wrapHtml(text) {
	const lines = text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);
	if (!lines.length) return "<p></p>";
	return lines.map((l) => `<p>${l}</p>`).join("");
}

export async function parseResume(file) {
	const { text, linkedInUrl } = await extractFromPdf(file);
	const sections = extractSections(text);

	return {
		...parseContact(text, linkedInUrl),
		summary: sections.summary.join(" ").trim(),
		skills: parseSkills(sections.skills, text),
		jobExperience: parseExperience(sections.experience),
		educations: parseEducation(sections.education),
	};
}

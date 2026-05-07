import { USER_ROLES } from "../constants/roles";

const COMPANY_ID = "co_acme";

const PRIMARY_USERS = [
	{
		id: "user_admin",
		name: "Aria Admin",
		email: "aria@acme.test",
		role: USER_ROLES.ADMIN,
		companyId: COMPANY_ID,
		avatarUrl: null,
		createdAt: "2026-01-05T09:00:00.000Z",
	},
	{
		id: "user_hm",
		name: "Harvey Hiring",
		email: "harvey@acme.test",
		role: USER_ROLES.HIRING_MANAGER,
		companyId: COMPANY_ID,
		avatarUrl: null,
		createdAt: "2026-01-08T09:00:00.000Z",
	},
	{
		id: "user_applicant_lead",
		name: "Priya Patel",
		email: "priya@example.com",
		role: USER_ROLES.APPLICANT,
		companyId: COMPANY_ID,
		avatarUrl: null,
		resumeUrl: "mock://resumes/priya.pdf",
		skills: ["React", "TypeScript", "Redux", "Jest", "Tailwind", "Node.js"],
		createdAt: "2026-03-01T09:00:00.000Z",
	},
];

const OTHER_APPLICANTS = [
	{
		id: "user_applicant_2",
		name: "Tomás García",
		email: "tomas@example.com",
		skills: ["React", "Next.js", "GraphQL", "TypeScript", "CSS"],
	},
	{
		id: "user_applicant_3",
		name: "Mei Chen",
		email: "mei@example.com",
		skills: ["Python", "Django", "PostgreSQL", "Docker", "AWS"],
	},
	{
		id: "user_applicant_4",
		name: "Olu Adebayo",
		email: "olu@example.com",
		skills: ["Java", "Spring", "Kafka", "Microservices"],
	},
	{
		id: "user_applicant_5",
		name: "Lena Schmidt",
		email: "lena@example.com",
		skills: ["Figma", "UX Research", "Design Systems", "Prototyping"],
	},
	{
		id: "user_applicant_6",
		name: "Rahul Kapoor",
		email: "rahul@example.com",
		skills: ["React", "JavaScript", "HTML", "CSS"],
	},
	{
		id: "user_applicant_7",
		name: "Fatima Khan",
		email: "fatima@example.com",
		skills: ["Product Strategy", "Roadmapping", "Analytics", "SQL"],
	},
	{
		id: "user_applicant_8",
		name: "Jordan Reyes",
		email: "jordan@example.com",
		skills: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Linux"],
	},
].map((u) => ({
	...u,
	role: USER_ROLES.APPLICANT,
	companyId: COMPANY_ID,
	avatarUrl: null,
	resumeUrl: `mock://resumes/${u.id}.pdf`,
	createdAt: "2026-03-10T09:00:00.000Z",
}));

export const SEED_USERS = [...PRIMARY_USERS, ...OTHER_APPLICANTS];

export const PRIMARY_APPLICANT_ID = "user_applicant_lead";
export const PRIMARY_HM_ID = "user_hm";
export const PRIMARY_ADMIN_ID = "user_admin";

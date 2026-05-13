import { Link } from "react-router";
import { ROUTES } from "../../constants/routes";
import Button from "../../components/common/Button";

function NotFound() {
	return (
		<div
			className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16 text-white"
			style={{ background: "var(--gradient-brand)" }}
		>
			<span
				aria-hidden
				className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
			/>
			<span
				aria-hidden
				className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-400/20 blur-3xl"
			/>

			<div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center text-center">
				<div className="flex items-center gap-3">
					<img
						src="/hireflow-light.png"
						alt="HireFlow"
						className="h-10 w-14 object-contain"
					/>
					<span className="text-3xl font-semibold tracking-tight">
						<span className="text-white">Hire</span>
						<span className="text-cyan-300">Flow</span>
					</span>
				</div>

				<p className="mt-12 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
					404
				</p>
				<h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
					Page not found
				</h1>
				<p className="mt-4 max-w-sm text-sm text-white/75">
					The page you were looking for has moved, expired, or never
					existed. Let's get you back on track.
				</p>

				<Link to={ROUTES.LANDING} className="mt-8 inline-block">
					<Button variant="secondary">Back home</Button>
				</Link>
			</div>
		</div>
	);
}

export default NotFound;

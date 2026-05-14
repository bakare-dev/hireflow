function LandingSectionGlow() {
	return (
		<div
			aria-hidden
			className="relative h-24 overflow-hidden sm:h-32"
		>
			<div className="absolute inset-0 [background:radial-gradient(ellipse_55%_60%_at_50%_50%,rgba(6,182,212,0.18),transparent_70%)]" />
			<div className="absolute inset-0 [background:radial-gradient(ellipse_30%_50%_at_50%_50%,rgba(30,64,175,0.18),transparent_70%)]" />

			<div className="absolute inset-x-0 top-1/2 mx-auto h-px max-w-4xl -translate-y-1/2 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

			<span className="absolute left-[22%] top-[30%] h-1.5 w-1.5 rounded-full bg-cyan-400 opacity-70" />
			<span className="absolute left-[35%] bottom-[28%] h-1 w-1 rounded-full bg-blue-800 opacity-60" />
			<span className="absolute right-[24%] top-[34%] h-1 w-1 rounded-full bg-emerald-500 opacity-70" />
			<span className="absolute right-[38%] bottom-[30%] h-1.5 w-1.5 rounded-full bg-cyan-500 opacity-60" />

			<div className="absolute inset-x-0 top-1/2 mx-auto h-2 max-w-4xl -translate-y-1/2">
				<div className="relative h-full animate-comet">
					<span className="absolute top-1/2 right-full h-px w-24 -translate-y-1/2 bg-gradient-to-l from-cyan-400 to-transparent" />
					<span className="absolute top-1/2 right-full h-[3px] w-12 -translate-y-1/2 rounded-full bg-gradient-to-l from-cyan-300/70 to-transparent blur-sm" />
					<span className="block h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_2px_rgba(34,211,238,0.75)]" />
				</div>
			</div>
		</div>
	);
}

export default LandingSectionGlow;

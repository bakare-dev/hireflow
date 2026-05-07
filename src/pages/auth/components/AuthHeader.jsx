function AuthHeader({ eyebrow, title, subtitle }) {
	return (
		<div className="space-y-2">
			{eyebrow ? (
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
					{eyebrow}
				</p>
			) : null}
			<h1 className="text-2xl font-semibold tracking-tight text-slate-950">
				{title}
			</h1>
			{subtitle ? (
				<p className="text-sm text-slate-600">{subtitle}</p>
			) : null}
		</div>
	);
}

export default AuthHeader;

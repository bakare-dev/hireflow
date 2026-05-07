import EmptyState from "../../components/common/EmptyState";

function ComingSoon({ title = "Coming soon", description }) {
	return (
		<EmptyState
			title={title}
			description={
				description ??
				"This screen is on the build list — we are building screens one at a time."
			}
		/>
	);
}

export default ComingSoon;

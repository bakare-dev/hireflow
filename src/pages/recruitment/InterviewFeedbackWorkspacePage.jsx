import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { selectInterviewSlots } from "../../store/slices/interviewsSlice";

function InterviewFeedbackWorkspacePage() {
	const { id } = useParams();
	const slots = useSelector(selectInterviewSlots);
	const slot = slots.find((item) => item.id === id) ?? null;
	const [scores, setScores] = useState({
		technical: 3,
		behavioural: 3,
		communication: 3,
		culture: 3,
		problemSolving: 3,
	});
	const [notes, setNotes] = useState("");

	const overall = useMemo(() => {
		const values = Object.values(scores);
		return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
	}, [scores]);

	if (!slot) {
		return (
			<div className="space-y-4">
				<PageHeader
					eyebrow="Interviews"
					title="Feedback Workspace"
					description="Interview session not found."
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Interviews"
				title="Interview Feedback Workspace"
				description={`Capture weighted scorecards and review notes for slot ${slot.id}.`}
			/>

			<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">Scorecards</h2>
					</CardHeader>
					<CardBody className="space-y-4">
						<ScoreSlider
							label="Technical"
							value={scores.technical}
							onChange={(value) => setScores((s) => ({ ...s, technical: value }))}
						/>
						<ScoreSlider
							label="Behavioural"
							value={scores.behavioural}
							onChange={(value) => setScores((s) => ({ ...s, behavioural: value }))}
						/>
						<ScoreSlider
							label="Communication"
							value={scores.communication}
							onChange={(value) =>
								setScores((s) => ({ ...s, communication: value }))
							}
						/>
						<ScoreSlider
							label="Culture Fit"
							value={scores.culture}
							onChange={(value) => setScores((s) => ({ ...s, culture: value }))}
						/>
						<ScoreSlider
							label="Problem Solving"
							value={scores.problemSolving}
							onChange={(value) =>
								setScores((s) => ({ ...s, problemSolving: value }))
							}
						/>
						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-800">
								Notes
							</span>
							<textarea
								rows={6}
								value={notes}
								onChange={(event) => setNotes(event.target.value)}
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
								placeholder="Internal interview notes"
							/>
						</label>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">Summary</h2>
					</CardHeader>
					<CardBody className="space-y-3 text-sm text-slate-700">
						<p>Overall weighted score: {overall}/5</p>
						<p>AI-generated summary: Candidate demonstrates steady interview readiness with clear communication and technical depth.</p>
						<div className="flex gap-2 pt-2">
							<Button>Submit feedback</Button>
							<Button variant="secondary">Save draft</Button>
						</div>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}

function ScoreSlider({ label, value, onChange }) {
	return (
		<label className="block">
			<div className="mb-1 flex items-center justify-between text-sm">
				<span className="font-medium text-slate-800">{label}</span>
				<span className="text-slate-600">{value}</span>
			</div>
			<input
				type="range"
				min={1}
				max={5}
				step={1}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				className="w-full"
			/>
		</label>
	);
}

export default InterviewFeedbackWorkspacePage;

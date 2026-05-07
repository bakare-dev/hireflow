import Modal from "./Modal";
import Button from "./Button";

const TYPE_BUTTON_VARIANTS = {
	destructive: "danger",
	success: "primary",
	neutral: "secondary",
};

function ConfirmModal({
	open,
	onClose,
	onConfirm,
	title = "Please Confirm",
	description,
	confirmButtonText = "Confirm",
	cancelButtonText = "Cancel",
	type = "neutral",
}) {
	return (
		<Modal
			open={open}
			onClose={onClose}
			title={title}
			footer={
				<>
					<Button variant="ghost" onClick={onClose}>
						{cancelButtonText}
					</Button>
					<Button
						variant={TYPE_BUTTON_VARIANTS[type] ?? "secondary"}
						onClick={() => {
							onConfirm?.();
							onClose?.();
						}}
					>
						{confirmButtonText}
					</Button>
				</>
			}
		>
			<p className="text-sm text-slate-700">{description}</p>
		</Modal>
	);
}

export default ConfirmModal;

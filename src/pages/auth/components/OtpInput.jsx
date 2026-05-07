import { useEffect, useRef } from "react";
import { cn } from "../../../utils/classnames";

function OtpInput({
	value = "",
	onChange,
	length = 6,
	autoFocus = true,
	error,
	disabled,
}) {
	const refs = useRef([]);

	useEffect(() => {
		if (autoFocus) refs.current[0]?.focus();
	}, [autoFocus]);

	const digits = Array.from({ length }, (_, i) => value[i] ?? "");

	function setDigit(idx, ch) {
		const next = digits.slice();
		next[idx] = ch;
		onChange?.(next.join("").slice(0, length));
	}

	function handleChange(idx, e) {
		const ch = e.target.value.replace(/\D/g, "").slice(-1);
		if (!ch) {
			setDigit(idx, "");
			return;
		}
		setDigit(idx, ch);
		const nextIdx = Math.min(idx + 1, length - 1);
		refs.current[nextIdx]?.focus();
	}

	function handleKeyDown(idx, e) {
		if (e.key === "Backspace" && !digits[idx] && idx > 0) {
			refs.current[idx - 1]?.focus();
		}
		if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
		if (e.key === "ArrowRight" && idx < length - 1)
			refs.current[idx + 1]?.focus();
	}

	function handlePaste(e) {
		const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
		if (!pasted) return;
		e.preventDefault();
		onChange?.(pasted.slice(0, length));
		const nextIdx = Math.min(pasted.length, length - 1);
		refs.current[nextIdx]?.focus();
	}

	return (
		<div className="space-y-2">
			<div className="flex justify-between gap-2" onPaste={handlePaste}>
				{digits.map((d, i) => (
					<input
						key={i}
						ref={(el) => {
							refs.current[i] = el;
						}}
						inputMode="numeric"
						pattern="\d*"
						maxLength={1}
						value={d}
						disabled={disabled}
						onChange={(e) => handleChange(i, e)}
						onKeyDown={(e) => handleKeyDown(i, e)}
						aria-label={`Digit ${i + 1}`}
						className={cn(
							"h-12 w-full rounded-md border bg-white text-center text-lg font-semibold tabular-nums text-slate-900 transition focus:outline-none focus:ring-2",
							error
								? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
								: "border-slate-200 focus:border-slate-900 focus:ring-slate-200",
							disabled && "cursor-not-allowed opacity-60",
						)}
					/>
				))}
			</div>
			{error ? <p className="text-xs text-rose-600">{error}</p> : null}
		</div>
	);
}

export default OtpInput;

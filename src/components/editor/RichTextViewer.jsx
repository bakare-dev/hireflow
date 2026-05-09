function RichTextViewer({ content, className = "" }) {
	return (
		<div
			className={`prose prose-sm max-w-none ${className}`}
			dangerouslySetInnerHTML={{ __html: content }}
			style={{
				"--list-disc": "disc",
				"--list-decimal": "decimal",
			}}
		/>
	);
}

export default RichTextViewer;

/**
 * important: Reusable component for status and error messages
 */
const Message = ({ type = 'info', content }) => {
	if (!content) return null

	return (
		<div
			className="position-fixed start-50 translate-middle-x p-3"
			style={{ top: '80px', zIndex: 1050 }}
		>
			<div
				className={`alert alert-${type} `}
				role="alert"
			>
				{content}
			</div>
		</div>
	)
}

export default Message

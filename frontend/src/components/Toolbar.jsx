import { BrushCleaning, Lock, LockOpen, Trash } from 'lucide-react'
import { Tooltip } from 'react-tooltip'

/**
 * important: Table action toolbar
 */
const Toolbar = ({ selectedCount, loading, actions }) => {
	const isNoSelection = selectedCount === 0 || loading

	const buttons = [
		{
			onClick: actions.block,
			disabled: isNoSelection,
			variant: 'outline-primary',
			label: 'Block',
			icon: <Lock size={16} />
		},
		{
			onClick: actions.unblock,
			disabled: isNoSelection,
			variant: 'outline-primary',
			label: 'Unblock',
			icon: <LockOpen size={16} />
		},
		{
			onClick: actions.delete,
			disabled: isNoSelection,
			variant: 'outline-danger',
			label: 'Delete',
			icon: <Trash size={16} />
		},
		{
			onClick: actions.deleteUnverified,
			disabled: loading,
			variant: 'outline-danger',
			label: 'Delete unverified',
			icon: <BrushCleaning size={16} />
		}
	]

	return (
		<div className="card-header d-flex gap-2 p-3">
			{buttons.map(({ onClick, disabled, variant, label, icon }, index) => (
				<button
					key={index}
					onClick={onClick}
					disabled={disabled}
					className={`btn btn-${variant} d-flex align-items-center gap-2 ${
						label !== 'Block' ? 'p-2' : ''
					}`}
					data-tooltip-id="toolbar-tooltip"
					data-tooltip-content={label}
				>
					{icon}
					{label === 'Block' && label}
				</button>
			))}

			<Tooltip
				id="toolbar-tooltip"
				style={{ fontSize: '12px' }}
			/>
		</div>
	)
}

export default Toolbar

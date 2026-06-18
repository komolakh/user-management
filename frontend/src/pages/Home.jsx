import axios from 'axios'
import { format, formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'
import Message from '../components/Message'
import Toolbar from '../components/Toolbar'

/**
 * important: User management component (Home page)
 */
const Home = ({ users, setUsers, user, error }) => {
	const [selectedIds, setSelectedIds] = useState([])
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const navigate = useNavigate()

	/**
	 * important: Redirect to login if user is not authenticated or is blocked
	 */
	useEffect(() => {
		if (!user || user.status === 'blocked') {
			navigate('/login')
		}
	}, [user, navigate])

	/**
	 * note: Toggles selection state for the entire user list
	 */
	const handleSelectAll = () => {
		setSelectedIds(
			selectedIds.length === users.length ? [] : users.map(u => u.id)
		)
	}

	/**
	 * note: Toggle selection for a single user by ID
	 */
	const handleSelect = rowId => {
		setSelectedIds(prev =>
			prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
		)
	}

	const isSelected = rowId => selectedIds.includes(rowId)
	const isAllSelected = users.length > 0 && selectedIds.length === users.length

	/**
	 * important: Universal controller for API actions
	 */
	const executeAction = async ({ request, onUpdateState }) => {
		setLoading(true)
		try {
			const response = await request()
			onUpdateState()
			setSelectedIds([])
			setMessage(response.data.message)
		} catch (err) {
			if (err.response?.data?.redirectToLogin) {
				setMessage(err.response?.data?.message)
				setTimeout(() => navigate('/login'), 1500)
				return
			}
			setMessage(err.response?.data?.message)
		} finally {
			setLoading(false)
		}
	}

	const toolbarActions = {
		block: () =>
			executeAction({
				request: () =>
					axios.post('/api/users/block', { userIds: selectedIds.map(Number) }),
				onUpdateState: () =>
					setUsers(
						users.map(u =>
							selectedIds.includes(u.id) ? { ...u, status: 'blocked' } : u
						)
					)
			}),

		unblock: () =>
			executeAction({
				request: () =>
					axios.post('/api/users/unblock', {
						userIds: selectedIds.map(Number)
					}),
				onUpdateState: async () => {
					const res = await axios.get('/api/users')
					setUsers(res.data.users)
				}
			}),

		delete: () =>
			executeAction({
				request: () =>
					axios.delete('/api/users/delete', {
						data: { userIds: selectedIds.map(Number) }
					}),
				onUpdateState: () =>
					setUsers(users.filter(u => !selectedIds.includes(u.id)))
			}),

		deleteUnverified: () =>
			executeAction({
				request: () => axios.delete('/api/users/delete-unverified'),
				onUpdateState: () =>
					setUsers(users.filter(u => u.status !== 'unverified'))
			})
	}

	useEffect(() => {
		if (message) {
			const timer = setTimeout(() => setMessage(''), 1500)
			return () => clearTimeout(timer)
		}
	}, [message])

	return (
		<div className="container py-4">
			<Message
				type={error ? 'danger' : 'info'}
				content={error || message}
			/>

			<div className="card border-0">
				<Toolbar
					selectedCount={selectedIds.length}
					loading={loading}
					actions={toolbarActions}
				/>

				<div className="table-responsive">
					<table className="table align-middle">
						<thead>
							<tr>
								<th>
									<input
										type="checkbox"
										checked={isAllSelected}
										onChange={handleSelectAll}
									/>
								</th>
								<th>Name</th>
								<th>Email</th>
								<th>Status</th>
								<th>Last seen</th>
							</tr>
						</thead>
						<tbody>
							{users.map(user => (
								<tr key={user.id}>
									<td>
										<input
											type="checkbox"
											checked={isSelected(user.id)}
											onChange={() => handleSelect(user.id)}
										/>
									</td>
									<td>{user.name}</td>
									<td>{user.email}</td>
									<td>{user.status}</td>
									<td
										data-tooltip-id="last-seen"
										data-tooltip-content={format(
											new Date(user.last_login_time),
											'MMMM d, yyyy, HH:mm:ss'
										)}
									>
										{formatDistanceToNow(new Date(user.last_login_time), {
											addSuffix: true
										})}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			<Tooltip
				id="last-seen"
				style={{
					fontSize: '12px',
					backgroundColor: 'black',
					color: 'white'
				}}
				place="bottom"
			/>
		</div>
	)
}

export default Home

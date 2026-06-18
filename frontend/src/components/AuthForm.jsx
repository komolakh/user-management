import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import Message from './Message'

const FIELDS = [
	{ id: 'name', type: 'text', label: 'Name', isReg: true },
	{ id: 'email', type: 'email', label: 'Email' },
	{ id: 'password', type: 'password', label: 'Password' }
]

/**
 * important: Reusable authentication component for login and register
 */
const AuthForm = ({ type, setUser, isLogin, navigateMessage, navigateTo }) => {
	const navigate = useNavigate()
	const [success, setSuccess] = useState('')
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors }
	} = useForm()

	const onSubmit = async data => {
		try {
			const res = await axios.post(`/api/auth/${type}`, data)
			setSuccess(`Successful ${type}`)
			setUser(res.data.user)
			setTimeout(() => navigate('/'), 1500)
		} catch (err) {
			setError('root', {
				message: err.response?.data?.message || 'Server error'
			})
		}
	}

	return (
		<div
			className="container d-flex flex-column align-items-center justify-content-center p-4"
			style={{ minHeight: 'calc(100vh - 56px)' }}
		>
			<Message
				type={errors.root && 'danger'}
				content={errors.root?.message || success}
			/>

			<div
				className="card shadow p-4 w-100 border-0"
				style={{ maxWidth: '450px' }}
			>
				<form onSubmit={handleSubmit(onSubmit)}>
					<h2 className="mb-4 text-center h4 fw-bold text-capitalize">
						{type}
					</h2>

					{/**
					 * note: Hides the Name field on the login page
					 */}
					{FIELDS.map(
						f =>
							(!f.isReg || !isLogin) && (
								<div
									key={f.id}
									className={'mb-3'}
								>
									<input
										type={f.type}
										placeholder={f.label}
										className="form-control"
										{...register(f.id, { required: true })}
									/>
								</div>
							)
					)}

					<button
						className="btn btn-primary w-100 mb-3 mt-2"
						type="submit"
					>
						{type}
					</button>
				</form>

				<div className="d-flex justify-content-center gap-2 small text-muted mt-2">
					<span>{navigateMessage}</span>
					<Link
						to={`/${navigateTo}`}
						className="text-decoration-none fw-semibold text-capitalize"
					>
						{navigateTo}
					</Link>
				</div>
			</div>
		</div>
	)
}

export default AuthForm

import axios from 'axios'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Message from '../components/Message'

/**
 * important: Email verification page
 */
function VerifyEmail() {
	const [searchParams] = useSearchParams()
	const token = searchParams.get('token')
	const [message, setMessage] = useState({ type: '', text: '' })

	/**
	 * important: Verify email token
	 */
	useEffect(() => {
		const verifyEmail = async () => {
			if (!token) {
				setMessage({ type: 'danger', text: 'No verification token provided' })

				return
			}
			try {
				const res = await axios.get(`/api/auth/verify-email?token=${token}`)
				setMessage({
					text: res.data.message || 'Successful verification'
				})
			} catch (err) {
				setMessage({
					type: 'danger',
					text: err.response?.data?.message || 'Server error'
				})
			}
		}

		verifyEmail()
	}, [token])

	return (
		<Message
			type={message.type}
			content={message.text}
		/>
	)
}

export default VerifyEmail

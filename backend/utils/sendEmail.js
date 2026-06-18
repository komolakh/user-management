import dotenv from 'dotenv'
import { Resend } from 'resend'
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * nota bene: Emails are restricted to a single recipient (owner email)
 */
const sendEmail = async (email, subject, text) => {
	try {
		const data = await resend.emails.send({
			from: 'onboarding@resend.dev',
			to: 'komolakhidirova@gmail.com',
			subject: subject,
			text: text
		})

		return data
	} catch (err) {
		throw err
	}
}

export default sendEmail

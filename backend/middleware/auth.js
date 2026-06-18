import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

/**
 * important: Authentication middleware
 */
export const protect = async (req, res, next) => {
	let token

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1]
	}

	if (!token) {
		return res
			.status(401)
			.json({ message: 'Not authorized, no token', redirectToLogin: true })
	}
	try {
		// important: Verify token signature and decode payload
		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		const { rows } = await pool.query(
			'SELECT id, name, email, status FROM users WHERE id = $1',
			[decoded.id]
		)
		const user = rows[0]

		// nota bene: No access for nonexistent or blocked users
		if (!user || user.status === 'blocked') {
			const isBlocked = user?.status === 'blocked'
			return res.status(isBlocked ? 403 : 401).json({
				message: isBlocked
					? 'Account is blocked'
					: 'Not authorized, user not found',
				redirectToLogin: true
			})
		}

		req.user = user
		next()
	} catch (err) {
		res
			.status(401)
			.json({ message: 'Not authorized, token failed', redirectToLogin: true })
	}
}

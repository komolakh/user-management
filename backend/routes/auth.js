import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import express from 'express'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'
import { protect } from '../middleware/auth.js'
import sendEmail from '../utils/sendEmail.js'

const router = express.Router()

/**
 * note: Generate JWT access token for authenticated user
 */
const generateToken = id =>
	jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

/**
 * important: User registration endpoint
 */
router.post('/register', async (req, res) => {
	const { name, email, password } = req.body

	try {
		const hashedPassword = await bcrypt.hash(password, 10)

		const verificationToken = crypto.randomBytes(32).toString('hex')

		// note: DB UNIQUE INDEX handles duplicate emails
		const { rows } = await pool.query(
			`INSERT INTO users (name, email, password, status, verification_token) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, status, last_login_time`,
			[name, email, hashedPassword, 'unverified', verificationToken]
		)
		const user = rows[0]

		const token = generateToken(user.id)

		const verificationLink = `https://user-management-eight-gold.vercel.app/verify-email?token=${verificationToken}`

		// nota bene: Email is sent asynchronously
		sendEmail(
			user.email,
			'Verify Your Email Address',
			`Click the link to activate your account: ${verificationLink}`
		).catch(err => {
			console.error(err.message)
		})

		return res.status(201).json({
			user,
			token,
			message: 'Registration successful! Check your email.'
		})
	} catch (err) {
		return res.status(err.code === '23505' ? 409 : 400).json({
			message:
				err.code === '23505'
					? 'User with this email already exists'
					: 'Registration failed.'
		})
	}
})

/**
 * important: email verification endpoint
 */
router.get('/verify-email', async (req, res) => {
	const { token } = req.query

	if (!token) {
		return res.status(400).json({ message: 'Verification token is required' })
	}

	try {
		const { rows } = await pool.query(
			`UPDATE users SET status = 'active', verification_token = NULL WHERE verification_token = $1 RETURNING id`,
			[token]
		)
		if (rows.length === 0)
			return res.status(400).json({ message: 'Invalid or expired token' })

		res.status(200).json({ message: 'Email verified successfully' })
	} catch (err) {
		res.status(500).json({ message: 'Verification failed' })
	}
})

/**
 * important: User login endpoint
 */
router.post('/login', async (req, res) => {
	const { email, password } = req.body

	try {
		const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [
			email
		])
		const user = rows[0]

		if (!user) return res.status(401).json({ message: 'Invalid credentials' })
		if (user.status === 'blocked')
			return res
				.status(403)
				.json({ message: 'Account is blocked', redirectToLogin: true })

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch)
			return res.status(401).json({ message: 'Invalid credentials' })

		// note: Update last login
		const updated = await pool.query(
			'UPDATE users SET last_login_time = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, status, last_login_time',
			[user.id]
		)

		const token = generateToken(user.id)

		res.json({
			user: updated.rows[0],
			token
		})
	} catch (err) {
		res.status(500).json({ message: 'Login failed' })
	}
})

/**
 * note: Get currently authenticated user
 */
router.get('/me', protect, (req, res) => res.json(req.user))

/**
 * note: Logout user by clearing JWT cookie
 */
router.post('/logout', (req, res) => {
	res.json({ message: 'Logged out successfully' })
})

export default router

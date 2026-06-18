import express from 'express'
import pool from '../config/db.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
router.use(protect)

/**
 * important: Get all users sorted by latest login
 */
router.get('/', async (req, res) => {
	try {
		const { rows } = await pool.query(
			'SELECT id, name, email, last_login_time, status FROM users ORDER BY last_login_time DESC'
		)
		res.json({ users: rows })
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch users' })
	}
})

const handleAction = (queryText, successActionText) => async (req, res) => {
	const { userIds } = req.body

	try {
		const { rows } = await pool.query(queryText, [userIds])
		res.json({
			message: `${rows.length} user(s) ${successActionText} successfully`
		})
	} catch (err) {
		res.status(500).json({ message: `Failed to ${successActionText} users` })
	}
}

/**
 * important: Block users & save previous_status
 */
router.post(
	'/block',
	handleAction(
		`UPDATE users SET status = 'blocked', previous_status = status WHERE id = ANY($1::int[]) AND status != 'blocked' RETURNING id, name, email, last_login_time, status`,
		'blocked'
	)
)

/**
 * important: Unblock multiple users returning them to previous state
 */
router.post(
	'/unblock',
	handleAction(
		`UPDATE users SET status = previous_status, previous_status = NULL WHERE id = ANY($1::int[]) AND status = 'blocked' RETURNING id, name, email, last_login_time, status`,
		'unblocked'
	)
)

/**
 * important: Permanent delete users
 */
router.delete(
	'/delete',
	handleAction(
		`DELETE FROM users WHERE id = ANY($1::int[]) RETURNING id, name, email, last_login_time, status`,
		'deleted'
	)
)

/**
 * important: Delete all unverified users
 */
router.delete('/delete-unverified', async (req, res) => {
	try {
		const { rows } = await pool.query(
			`DELETE FROM users WHERE status = 'unverified' RETURNING id, name, email, last_login_time, status`
		)
		res.json({
			message: `${rows.length} unverified user(s) deleted successfully`
		})
	} catch (err) {
		res.status(500).json({ message: 'Failed to delete unverified users' })
	}
})

export default router

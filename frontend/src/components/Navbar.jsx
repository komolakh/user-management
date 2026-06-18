import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = ({ user, setUser }) => {
	const navigate = useNavigate()

	const handleLogout = async () => {
		await axios.post('/api/auth/logout')
		setUser(null)
		navigate('/login')
	}

	return (
		<nav className="navbar shadow-sm">
			<div className="container">
				<Link
					to="/"
					className="font-bold text-decoration-none"
				>
					User management
				</Link>
				<div>
					{user ? (
						<button
							onClick={handleLogout}
							className="btn btn-outline-danger"
						>
							Logout
						</button>
					) : (
						<Link
							to="/login"
							className="btn btn-outline-primary"
						>
							Login
						</Link>
					)}
				</div>
			</div>
		</nav>
	)
}

export default Navbar

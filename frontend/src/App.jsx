import axios from 'axios'
import { useEffect, useState } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Message from './components/Message'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'

axios.defaults.baseURL = ''
axios.defaults.withCredentials = true

function App() {
	const [user, setUser] = useState(null)
	const [users, setUsers] = useState([])
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axios.get('/api/auth/me')
				setUser(res.data)
			} catch (err) {
				setUser(null)
				console.log(err)
			} finally {
				setLoading(false)
			}
		}
		fetchUser()
	}, [])

	useEffect(() => {
		const fetchUsers = async () => {
			if (!user) return
			try {
				const res = await axios.get('/api/users')
				setUsers(res.data.users)
			} catch (err) {
				console.log(err)
				setError("Couldn't get users")
			}
		}
		fetchUsers()
	}, [user])

	if (loading) {
		return <Message content={'Loading..'} />
	}

	return (
		<Router>
			<Navbar
				user={user}
				setUser={setUser}
			/>
			<Routes>
				<Route
					path="/"
					element={
						<Home
							user={user}
							users={users}
							setUsers={setUsers}
							error={error}
						/>
					}
				/>
				<Route
					path="/login"
					element={<Login setUser={setUser} />}
				/>
				<Route
					path="/register"
					element={<Register setUser={setUser} />}
				/>
				<Route
					path="/verify-email"
					element={<VerifyEmail />}
				/>
			</Routes>
		</Router>
	)
}

export default App

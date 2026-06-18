import AuthForm from '../components/AuthForm'

const Register = ({ setUser }) => {
	return (
		<AuthForm
			type="register"
			setUser={setUser}
			navigateMessage={'Have an account?'}
			navigateTo={'login'}
		/>
	)
}

export default Register

import AuthForm from '../components/AuthForm'

const Login = ({ setUser }) => {
	return (
		<AuthForm
			type="login"
			setUser={setUser}
			isLogin={true}
			navigateMessage={"Don't have an account?"}
			navigateTo={'register'}
		/>
	)
}

export default Login

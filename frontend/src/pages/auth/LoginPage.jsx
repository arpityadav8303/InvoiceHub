import LoginForm from '../../components/auth/LoginForm';

function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
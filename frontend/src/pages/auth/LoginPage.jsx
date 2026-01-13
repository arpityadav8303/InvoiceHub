import LoginForm from '../../components/auth/LoginForm';

function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center tracking-wide">
          Secure Login
        </h1>
        <LoginForm />
        <p className="mt-6 text-xs text-gray-500 text-center">
          © 2026 InvoiceHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
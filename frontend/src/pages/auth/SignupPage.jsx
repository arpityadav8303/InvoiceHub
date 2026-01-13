import SignupForm from '../../components/auth/SignupForm';

function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center tracking-wide">
          Create Your Account
        </h1>
        <SignupForm />
        <p className="mt-6 text-xs text-gray-500 text-center">
          © InvoiceHub All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
import SignupForm from '../../components/auth/SignupForm';

function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <SignupForm />
      </div>
    </div>
  );
}

export default SignupPage;
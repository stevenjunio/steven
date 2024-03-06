const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to TaskList Pro</h1>
        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
            Enter your email address to get started
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="name@yourcompany.com"
          />
        </div>
        <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 mb-4">
          Continue with Email
        </button>
        <div className="flex justify-center mb-4">
          <span className="text-gray-500 mx-2">OR</span>
        </div>
        <button className="w-full bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 mb-2">
          Continue with Google
        </button>
        <button className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800">
          Continue with Apple
        </button>
        <div className="mt-6 text-center">
          <span className="text-gray-500">Already have an account?</span>
          <a href="#" className="text-blue-500 ml-2">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

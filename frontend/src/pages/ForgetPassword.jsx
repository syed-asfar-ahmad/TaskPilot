import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const API = process.env.REACT_APP_API_BASE_URL || 'https://taskpilot-1-mzxb.onrender.com/api';

function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/password-reset/forgot-password`, {
        email
      });

      toast.success(response.data.message);
      setEmailSent(true);
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full">
            {/* Success State */}
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h1>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your email and click the link to reset your password.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Important:</strong> The reset link will expire in 1 hour for security reasons.
                </p>
              </div>
              
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <ArrowLeft size={18} />
                Back to Login
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-green-100 mb-4">
              <Mail size={24} className="text-green-600" />
              <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
            </div>
            <p className="text-gray-600">Enter your email to receive a password reset link</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> If you don't receive an email within a few minutes, 
              check your spam folder or try again.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ForgetPassword; 
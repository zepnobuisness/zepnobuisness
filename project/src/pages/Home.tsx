import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { MessageCircle, Shield, CreditCard, Clock } from 'lucide-react';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Get <span className="text-indigo-600">Virtual Numbers</span> for OTP Verification
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Secure, temporary phone numbers for receiving verification codes from any service. No SIM card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/services">
                <Button size="lg">
                  Get Started
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg">
                    Create Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <img 
            src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="OTP Verification" 
            className="w-full h-80 object-cover object-center"
          />
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Why Choose OTPHub?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 p-3 inline-block rounded-full text-indigo-600 mb-4">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Multiple Services</h3>
            <p className="text-gray-600">
              Receive OTPs for Telegram, WhatsApp, Facebook, and many more popular services.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 p-3 inline-block rounded-full text-indigo-600 mb-4">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Privacy Protected</h3>
            <p className="text-gray-600">
              Keep your personal phone number private. Use our disposable numbers instead.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 p-3 inline-block rounded-full text-indigo-600 mb-4">
              <CreditCard size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Pay As You Go</h3>
            <p className="text-gray-600">
              No subscriptions needed. Only pay for the OTPs you request.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 p-3 inline-block rounded-full text-indigo-600 mb-4">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Delivery</h3>
            <p className="text-gray-600">
              Receive OTPs instantly with our real-time monitoring system.
            </p>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto bg-gray-50 rounded-2xl my-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3">Choose a Service</h3>
            <p className="text-gray-600">
              Select the platform you need to verify your account with.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3">Get a Number</h3>
            <p className="text-gray-600">
              Receive a temporary phone number to use for verification.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3">Receive OTP</h3>
            <p className="text-gray-600">
              We'll show you the OTP as soon as it arrives on our system.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link to={isAuthenticated ? "/services" : "/signup"}>
            <Button>
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
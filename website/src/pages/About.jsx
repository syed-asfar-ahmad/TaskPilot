import { useEffect } from 'react';
import { Lightbulb, Rocket, Heart, Users, Target, Award, CheckCircle, ArrowRight, Star, Zap, Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section - Compact */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 py-16 px-6">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2304d361' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <Star size={16} className="mr-2" />
            Trusted by 1,000+ teams worldwide
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 bg-clip-text text-transparent leading-tight">
            We Built TaskPilot for
            <span className="block text-green-600">Teams That Care</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            From freelancers to enterprises, our mission is to help people do more with less chaos. 
            <span className="font-semibold text-green-600"> Beautiful. Simple. Focused.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="https://taskpilot-dashboard.vercel.app/signup"
              className="group inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/features"
              className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-green-500 hover:text-green-600 transition-all duration-300"
            >
              See Features
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - Compact */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">1K+</div>
              <div className="text-gray-600 font-medium text-sm">Active Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">5K+</div>
              <div className="text-gray-600 font-medium text-sm">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">99.9%</div>
              <div className="text-gray-600 font-medium text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">4.9★</div>
              <div className="text-gray-600 font-medium text-sm">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section - Compact */}
      <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <Target size={16} className="mr-2" />
            Our Mission
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 leading-tight">
            Why TaskPilot Exists
          </h2>

          <div className="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed mb-8">
            <p>
              Project management tools were either <span className="font-semibold text-green-600">too complex</span> or <span className="font-semibold text-green-600">too limited</span>.
              We wanted something that was easy, powerful, and actually enjoyable to use.
            </p>
            <p>
              That's why we created <span className="font-semibold text-gray-900">TaskPilot</span> - a tool that feels just right. It's designed to bring clarity, focus, and balance
              to every team's workflow.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-blue-50 opacity-50"></div>
            <div className="relative">
              <div className="text-2xl md:text-3xl italic text-green-700 font-semibold mb-2">
                "Beautiful. Simple. Focused."
              </div>
              <p className="text-gray-600 font-medium text-sm">- The TaskPilot Philosophy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - Compact */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Award size={16} className="mr-2" />
              Our Values
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we design and build.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Value 1 */}
            <div className="group bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">Clarity</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We design with intention, reducing clutter and complexity. Every feature serves a purpose.
              </p>
            </div>
            
            {/* Value 2 */}
            <div className="group bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">Momentum</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Helping teams move fast and stay aligned is our top goal. Speed without chaos.
              </p>
            </div>
            
            {/* Value 3 */}
            <div className="group bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 mx-auto mb-4 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">Empathy</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We listen to users and build features that actually help. Your success is our success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight - Compact */}
      <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Built for Modern Teams</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage projects, collaborate with your team, and deliver results on time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-3">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Team Collaboration</h3>
              <p className="text-gray-600 text-sm">Real-time updates, comments, and seamless communication.</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">Optimized for speed. No more waiting for pages to load.</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Enterprise Security</h3>
              <p className="text-gray-600 text-sm">Bank-level security to keep your data safe and private.</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-3">
                <Globe size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Global Access</h3>
              <p className="text-gray-600 text-sm">Work from anywhere with our cloud-based platform.</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Simple Workflow</h3>
              <p className="text-gray-600 text-sm">Intuitive design that gets out of your way.</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-3">
                <Star size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Premium Support</h3>
              <p className="text-gray-600 text-sm">24/7 support to help you succeed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Compact */}
      <section className="py-16 px-6 bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to simplify your projects?</h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Start using TaskPilot today - it's completely free and designed for teams like yours. 
            Join thousands of teams already working smarter.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="https://taskpilot-dashboard.vercel.app/signup"
              className="group inline-flex items-center px-8 py-4 bg-white text-green-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-green-600 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
          
          <div className="mt-8 text-green-100 text-xs">
            Completely free • No credit card required • Start using immediately
          </div>
        </div>
      </section>
    </div>
  );
}

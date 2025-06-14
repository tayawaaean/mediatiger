import React from 'react';
import { ContactProps } from '../types';
import { useContactForm } from '../hooks/useContactForm';

const Contact: React.FC<ContactProps> = ({ onSubmit }) => {
  const {
    formData,
    formErrors,
    isSubmitting,
    handleInputChange,
    submitForm,
  } = useContactForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(onSubmit);
  };

  return (
    <div
      id="contact"
      className="bg-slate-900 py-20 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="relative inline-block text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 mb-4 px-6 py-2
            before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r
            before:from-indigo-500/10 before:via-purple-500/10 before:to-indigo-500/10
            before:z-[-1] before:animate-pulse before:blur-lg
            after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r
            after:from-indigo-500/5 after:via-purple-500/5 after:to-indigo-500/5
            after:z-[-1] after:blur-xl after:animate-pulse"
          >
            Contact Us
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to our team by
            filling out the form below.
          </p>
          <div className="mt-6 inline-flex items-center px-6 py-3 rounded-full bg-slate-800 text-lg text-slate-300 shadow-lg hover:shadow-xl transition-shadow">
            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-indigo-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="mr-2">Email us directly at</span>
              <a
                href="mailto:support@mediatiger.co"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                support@mediatiger.co
              </a>
            </div>

            {/* Mobile Layout */}
            <div className="flex flex-col items-center w-full sm:hidden">
              <div className="flex items-center w-full">
                <svg
                  className="w-5 h-5 mr-2 text-indigo-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="mr-2">Email us directly at</span>
              </div>
              <a
                href="mailto:support@mediatiger.co"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                support@mediatiger.co
              </a>
            </div>  
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto">
          <div
            className="relative bg-slate-800 p-8 rounded-2xl
            before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r
            before:from-slate-800/80 before:to-slate-700/80
            before:z-[-1] before:animate-pulse before:blur-sm
            after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r
            after:from-indigo-500/20 after:via-purple-500/20 after:to-indigo-500/20
            after:z-[-1] after:blur-xl after:animate-pulse
            shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:shadow-[0_0_40px_rgba(79,70,229,0.3)] transition-shadow duration-500"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-700 border ${
                    formErrors.name
                      ? "border-red-500"
                      : "border-slate-600"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-white hover:border-indigo-500`}
                  placeholder="John Doe"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-700 border ${
                    formErrors.email
                      ? "border-red-500"
                      : "border-slate-600"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-white hover:border-indigo-500`}
                  placeholder="your.email@example.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-700 border ${
                    formErrors.message
                      ? "border-red-500"
                      : "border-slate-600"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-white hover:border-indigo-500 resize-none`}
                  placeholder="How can we help you?"
                ></textarea>
                {formErrors.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {formErrors.message}
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-500
                    before:absolute before:inset-0 before:rounded-md before:bg-indigo-600 before:z-[-1]
                    before:animate-pulse before:blur-lg
                    after:absolute after:inset-0 after:rounded-md after:bg-gradient-to-r 
                    after:from-indigo-600 after:via-purple-600 after:to-indigo-600
                    after:z-[-1] after:blur-xl after:animate-pulse
                    shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]
                    disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="relative z-10 flex items-center">
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg
                          className="ml-2 -mr-1 w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>

              <div className="text-xs text-center space-y-2">
                <p className="text-slate-400 bg-slate-700/50 p-3 rounded-lg">
                  By submitting this form, you agree to our privacy policy and
                  terms of service. Your information will be used solely to
                  respond to your inquiry.
                </p>
                <p className="text-slate-400 bg-slate-700/50 p-3 rounded-lg">
                  You can also use this form to send feedback about our user
                  support experiences. We value your input and continuously
                  work to improve our services.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
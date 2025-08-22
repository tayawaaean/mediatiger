import {
  ArrowLeft,
  BarChart,
  BarChart4,
  CreditCard,
  DollarSign,
  PieChart,
  Puzzle,
  UnlockKeyhole,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
// import YoutubePartnerProgram from "../components/YoutubePartnerComponent";

export default function BoutiqueMonetization() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
        {/* Red haze animation background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-red-600/5 to-red-900/10 animate-pulse"
            style={{ animationDuration: "8s" }}
          ></div>
          <div
            className="absolute inset-0 bg-gradient-radial from-red-600/10 to-transparent"
            style={{ animationDuration: "12s" }}
          ></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-red-600/10 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-red-600/10 rounded-full filter blur-3xl"></div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 relative z-10"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to home
        </Link>

        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-8 relative z-10 shadow-xl">
          <div className="flex items-center mb-6">
            <DollarSign className="h-12 w-12 text-indigo-500 mr-4" />
            <h1 className="text-4xl font-bold text-white">
              Boutique Monetization Strategy
            </h1>
          </div>

          <p className="text-xl text-slate-300 mb-8">
            Maximize your revenue potential with personalized, innovative
            monetization strategies tailored to your unique content and
            audience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <Wallet className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">
                Revenue Diversification
              </h3>
              <p className="text-slate-300 relative z-10">
                Create multiple income streams through strategic partnerships,
                merchandise, and premium content offerings.
              </p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <BarChart4 className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">
                Performance Analysis
              </h3>
              <p className="text-slate-300 relative z-10">
                Detailed insights into which content types and formats generate
                the highest revenue for your specific audience.
              </p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <CreditCard className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">
                Subscription Models
              </h3>
              <p className="text-slate-300 relative z-10">
                Implement and optimize tiered subscription offerings with
                exclusive perks that your audience values most.
              </p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <UnlockKeyhole className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">
                Unlocking Hidden Revenue
              </h3>
              <p className="text-slate-300 relative z-10">
                We provide unique solutions to scaling your revenue income with
                the slightest tweaks.
              </p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <Puzzle className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">
                Effortless Integration
              </h3>
              <p className="text-slate-300 relative z-10">
                Integrate these monetization strategies without any complex
                processes.
              </p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              <BarChart className="h-8 w-8 text-indigo-400 mb-4 relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-2 relative z-10">
                Transparent Tracking
              </h3>
              <p className="text-slate-300 relative z-10">
                Track your performance and revenue through our dashboard. We
                value ourselves on the upmost transparency in how your earnings
                are calculated and paid out to you.
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="mt-8 bg-gradient-to-r from-slate-700 to-slate-600 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                <PieChart className="h-6 w-6 text-indigo-400 mr-2" />
                Revenue Breakdown
              </h3>
              <p className="text-slate-300 mb-4">
                Our clients typically see their revenue distributed across these
                channels:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-indigo-600/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <span className="text-white">Platform Ad Revenue</span>
                    <span className="text-indigo-400 font-semibold">
                      30-40%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 relative z-10">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full"
                      style={{ width: "35%" }}
                    ></div>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <span className="text-white">Brand Partnerships</span>
                    <span className="text-purple-400 font-semibold">
                      20-30%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 relative z-10">
                    <div
                      className="bg-purple-500 h-2.5 rounded-full"
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <span className="text-white">Music Revenue</span>
                    <span className="text-blue-400 font-semibold">50-100%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 relative z-10">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <span className="text-white">Merchandise & Products</span>
                    <span className="text-emerald-400 font-semibold">
                      10-20%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 relative z-10">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full"
                      style={{ width: "15%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* MediaTiger youtube partner program  */}
              {/* <YoutubePartnerProgram /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  AlertCircle,
  Check,
  CreditCard as CreditCardIcon,
  Disc,
  DollarSign,
  FileSignature,
  HelpCircle,
  LineChart,
  Music,
  SplitSquareVertical,
  Users,
  WalletCards,
  Youtube,
} from "lucide-react";

const YoutubePartnerProgram = () => {
  return (
    <div className="mt-8 bg-slate-800/80 p-6 rounded-lg border border-slate-700 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-amber-500/5 to-red-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
      <div className="flex items-center mb-4 relative z-10">
        <Youtube className="h-6 w-6 text-red-500 mr-2" />
        <h3 className="text-xl font-semibold text-white">
          MediaTiger Youtube Partner Program
        </h3>
      </div>
      <div className="text-slate-300 mb-4 relative z-10">
        <p className="mb-2">
          Did you know you can double your current income you earn from Youtube
          shorts that is completely separate from your existing partner program?
        </p>
        <p className="mb-2">
          Our Youtube Partner Program offers a unique opportunity to monetize
          your shorts through music, in addition to your existing Adsense
          revenue.
        </p>
        <p>
          This is done by partnering up with top tier music labels, along with
          Youtube to make this happen.
        </p>
      </div>
      <div className="mt-4 flex items-center relative z-10">
        <Music className="h-5 w-5 text-amber-400 mr-2" />
        <span className="text-amber-400 font-medium">
          Potential income increase: 50-100%+
        </span>
      </div>
      <p className="mt-2 text-green-400 text-sm relative z-10">
        Creators that are working with us typically earn about $0.25 to $0.70
        RPM in a whole new source of revenue.
      </p>

      <div className="mt-6 relative z-10">
        <h4 className="text-lg font-semibold text-white mb-4">How it works</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/70 p-4 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-amber-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center mr-3">
                <Check className="h-5 w-5 text-red-400" />
              </div>
              <h5 className="font-semibold text-white">
                Official Music Partner
              </h5>
            </div>
            <p className="text-slate-300 text-sm">
              MediaTiger is an official music partner with Youtube, along with
              major labels. This is done through a Youtube CMS (Content
              Management System). This allows us to give opportunities to shorts
              creators to earn a whole new separate income with no compromise.
            </p>
          </div>

          <div className="bg-slate-700/70 p-4 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center mr-3">
                <Disc className="h-5 w-5 text-amber-400" />
              </div>
              <h5 className="font-semibold text-white">Music Selection</h5>
            </div>
            <p className="text-slate-300 text-sm">
              Creators can choose from a wide array of music from established or
              indie artists. The selection is vast for any occasion to fit their
              shorts.
            </p>
          </div>

          <div className="bg-slate-700/70 p-4 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                <SplitSquareVertical className="h-5 w-5 text-green-400" />
              </div>
              <h5 className="font-semibold text-white">
                Revenue Split (50% Share)
              </h5>
            </div>
            <p className="text-slate-300 text-sm">
              You will get half of the revenue that is made from the music on
              your shorts. This is in addition to your already existing Adsense
              revenue.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 relative z-10">
        <h4 className="text-lg font-semibold text-white mb-4">
          How To Get Started
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/70 p-4 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                <FileSignature className="h-5 w-5 text-indigo-400" />
              </div>
              <h5 className="font-semibold text-white">
                Simple Onboarding Process
              </h5>
            </div>
            <p className="text-slate-300">
              Sign up and select Music Program. You will sign a contract that
              outlines all of the details. Once signed, you will be presented
              with a dashboard where you can see and manage everything along
              with other options you may have chosen like Channel Management.
            </p>
          </div>

          <div className="bg-slate-700/70 p-4 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                <Music className="h-5 w-5 text-blue-400" />
              </div>
              <h5 className="font-semibold text-white">
                Use Music From The Selection
              </h5>
            </div>
            <p className="text-slate-300">
              You can use music from the vast array for options, choose one that
              would match the theme of your video. For example, if you make
              anime content, choose anime music, if you make rap content, use
              rap music, etc. The possibilities are endless.
            </p>
          </div>

          <div className="bg-slate-700/70 p-4 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                  <WalletCards className="h-5 w-5 text-green-400" />
                </div>
                <h5 className="font-semibold text-white">
                  Collect Your Revenue
                </h5>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-slate-300">
              You will be receiving payments 2 months in, if you are a new
              creator, then every month afterwards. You will be sent an email to
              sign up to Tipalti to automate payments, in which you will fill
              out your correlating information such as bank accounts, tax id,
              etc.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions Section */}
      <div className="mt-10 relative z-10">
        <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
          <HelpCircle className="h-5 w-5 text-indigo-400 mr-2" />
          Frequently Asked Questions
        </h4>

        <div className="space-y-4">
          {/* FAQ Item 1 */}
          <div className="bg-slate-700/70 p-5 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <CreditCardIcon className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <h5 className="font-medium text-white text-lg mb-2">
                  How are Payments Allocated?
                </h5>
                <p className="text-slate-300">
                  Payments are distributed through Wire Transfer, ACH & More.
                  You can see the full options when you get an email to sign up
                  to Tipalti. Minimum payouts are $500.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Item 2 */}
          <div className="bg-slate-700/70 p-5 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-red-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <AlertCircle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <h5 className="font-medium text-white text-lg mb-2">
                  Can I use other background music in the video when adding the
                  music to my shorts?
                </h5>
                <p className="text-slate-300">
                  No you cannot, as this will cause confusion in the system. You
                  can only use the song that you choose and not anything else.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Item 3 */}
          <div className="bg-slate-700/70 p-5 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h5 className="font-medium text-white text-lg mb-2">
                  Is there a minimum requirement to join this specific program?
                </h5>
                <p className="text-slate-300">
                  Generally, MediaTiger only works with channels that garner 20
                  million views and up on Youtube shorts. However, depending on
                  the circumstance, exceptions can be made.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Item 4 */}
          <div className="bg-slate-700/70 p-5 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <LineChart className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h5 className="font-medium text-white text-lg mb-2">
                  How can I track how much I made?
                </h5>
                <p className="text-slate-300">
                  You will be given a dashboard in which where you be given
                  information on your revenue and performance.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Item 5 */}
          <div className="bg-slate-700/70 p-5 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <DollarSign className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <h5 className="font-medium text-white text-lg mb-2">
                  Is there any upfront cost involved?
                </h5>
                <p className="text-slate-300">
                  There is absolutely no upfront cost. Any fees and costs that
                  may occur happens after money has been generated.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Item 6 */}
          <div className="bg-slate-700/70 p-5 rounded-lg border border-slate-600 hover:border-indigo-500 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Music className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h5 className="font-medium text-white text-lg mb-2">
                  Will using the music claim my revenue from Adsense?
                </h5>
                <p className="text-slate-300">
                  No, this program is completely separate to the Youtube Partner
                  Program. This revenue will come in addition to your current
                  one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YoutubePartnerProgram;

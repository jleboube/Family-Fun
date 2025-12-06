import React, { useState } from 'react';
import {
  Gamepad2, Star, Users, Brain, ShieldCheck,
  ChevronDown, ArrowRight, Zap, Trophy, Smile, X, Play
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

type ModalType = 'privacy' | 'terms' | 'contact' | 'demo' | null;

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-background font-sans text-gray-900">
      {/* --- Navbar --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">FamilyFun</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
              <a href="#reviews" className="hover:text-primary transition-colors">Reviews</a>
              <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
            </div>

            <button 
              onClick={onGetStarted}
              className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
            >
              Play Now
            </button>
          </div>
        </div>
      </nav>

      {/* --- Hero Area --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Social Proof Pill */}
            <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-fade-in-up">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden`}>
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 55}&skinColor=pale,light`} alt="user" />
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600">Joined by <span className="text-primary font-bold">1,200+</span> families this week</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              Turn Screen Time into <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Quality Family Time</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              The only mobile-friendly game hub designed for ages 12 to 80. Compete in daily trivia, logic puzzles, and word games. 
              <span className="font-bold text-gray-800 block mt-2">No ads. Just fun.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-orange-700 text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl shadow-orange-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center"
              >
                Start Playing Free <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveModal('demo')}
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-lg font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" /> Watch Demo
              </button>
            </div>
          </div>

          {/* Product Visual */}
          <div className="relative mx-auto max-w-5xl animate-fade-in-up" style={{animationDelay: '0.5s'}}>
            <div className="relative rounded-3xl bg-gray-900 p-2 sm:p-4 shadow-2xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-800 rounded-b-xl z-20"></div>
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-[16/9] md:aspect-[21/9] flex flex-col md:flex-row">
                 {/* Mock UI Left: Sidebar/Nav */}
                 <div className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col p-6 space-y-6">
                    <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="space-y-3">
                       <div className="h-10 w-full bg-primary/10 rounded-lg"></div>
                       <div className="h-10 w-full bg-white rounded-lg"></div>
                       <div className="h-10 w-full bg-white rounded-lg"></div>
                    </div>
                 </div>
                 {/* Mock UI Right: Dashboard */}
                 <div className="flex-1 p-6 sm:p-8 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
                    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                       <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100"></div>
                          <div className="space-y-1">
                             <div className="h-4 w-24 bg-gray-200 rounded"></div>
                             <div className="h-3 w-16 bg-gray-100 rounded"></div>
                          </div>
                       </div>
                       <div className="h-20 bg-gray-50 rounded-xl"></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                       <div className="h-8 w-1/2 bg-gray-200 rounded mb-4"></div>
                       <div className="space-y-2">
                          <div className="h-3 w-full bg-gray-100 rounded"></div>
                          <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                       </div>
                    </div>
                    <div className="sm:col-span-2 bg-gradient-to-r from-primary to-orange-400 h-32 rounded-2xl flex items-center justify-center text-white font-bold text-2xl opacity-90">
                       <Gamepad2 className="mr-3 w-8 h-8" /> Play Daily Challenge
                    </div>
                 </div>
              </div>
            </div>
            {/* Floating Elements */}
            <div className="absolute -left-4 top-1/4 bg-white p-4 rounded-2xl shadow-xl animate-float hidden lg:block">
              <div className="flex items-center space-x-3">
                <Trophy className="text-yellow-500 w-8 h-8" />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Current Leader</p>
                  <p className="font-bold text-gray-900">Grandma_Sue</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl animate-float hidden lg:block" style={{animationDelay: '1s'}}>
               <div className="flex items-center space-x-3">
                <ShieldCheck className="text-green-500 w-8 h-8" />
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Cheater Caught!</p>
                  <p className="font-bold text-gray-900">Uncle_Bob</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* --- Partners/Trusted Section --- */}
      <section className="py-10 border-y border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Families playing from around the world</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Mock Logos */}
             {['The Smiths', 'The Johnsons', 'Team Miller', 'Garcia Fam', 'Lee House'].map((name) => (
               <span key={name} className="text-xl md:text-2xl font-black text-gray-800 flex items-center">
                 <Smile className="mr-2 text-gray-400" /> {name}
               </span>
             ))}
          </div>
        </div>
      </section>

      {/* --- Benefits (Bento Grid) --- */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:text-center max-w-3xl mx-auto">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-2">Why Families Love Us</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">More than just a game. <br/>It's a daily ritual.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Card 1 */}
           <div className="md:col-span-2 bg-gray-50 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:shadow-lg transition-all">
             <div className="relative z-10">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6">
                  <Brain className="w-8 h-8 text-secondary" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Educational & Sharp</h4>
                <p className="text-gray-600 text-lg max-w-md">
                  Our AI generates unique questions every single day. From history to math, keep your brain young and your kids sharp.
                </p>
             </div>
             <div className="absolute right-0 bottom-0 w-64 h-64 bg-secondary/10 rounded-full translate-x-1/3 translate-y-1/3 group-hover:scale-110 transition-transform duration-500"></div>
           </div>

           {/* Card 2 */}
           <div className="bg-primary text-white rounded-3xl p-8 md:p-12 relative overflow-hidden group shadow-lg shadow-orange-500/30">
              <div className="relative z-10">
                 <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                   <Zap className="w-8 h-8 text-white" />
                 </div>
                 <h4 className="text-2xl font-bold mb-4">5 Minutes Max</h4>
                 <p className="text-orange-100 text-lg">
                   Busy lives? No problem. Every game is designed to be played in under 5 minutes.
                 </p>
              </div>
           </div>

           {/* Card 3 */}
           <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Anti-Cheat Tech</h4>
              <p className="text-gray-600 text-lg">
                We know your uncle googles the answers. Our app detects tab-switching and shames cheaters publicly.
              </p>
           </div>

           {/* Card 4 */}
           <div className="md:col-span-2 bg-gray-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                 <div>
                    <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold mb-4">Inclusive for Ages 12-80</h4>
                    <p className="text-gray-400 text-lg max-w-md">
                      Grandpa can play Trivia. The teenager can play Word Wizard. Everyone competes on the same leaderboard.
                    </p>
                 </div>
                 {/* Visual Decoration */}
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-16 h-16 rounded-full border-4 border-gray-900 bg-gray-800 overflow-hidden transform hover:-translate-y-2 transition-transform">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=fam${i}&skinColor=pale,light`} alt="fam" />
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- How it Works --- */}
      <section id="how-it-works" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">How to Start the Fun</h2>
            <p className="mt-4 text-lg text-gray-600">Get your family set up in less than 60 seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
             {/* Connector Line */}
             <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-primary to-gray-200 z-0"></div>

             {[
                { title: "Create Profile", desc: "Sign up and customize your avatar. No email required.", step: 1 },
                { title: "Play Daily", desc: "Complete the daily challenges. Earn coins for high scores.", step: 2 },
                { title: "Brag Rights", desc: "Check the dashboard to see who is the smartest today.", step: 3 }
             ].map((item) => (
               <div key={item.step} className="relative z-10 flex flex-col items-center">
                 <div className="w-24 h-24 bg-white border-4 border-gray-50 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-4xl font-extrabold text-gray-200">{item.step}</span>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                 <p className="text-gray-600 leading-relaxed px-4">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* --- Testimonials --- */}
      <section id="reviews" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <div className="flex justify-center mb-4 space-x-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />)}
             </div>
             <h2 className="text-3xl font-extrabold text-gray-900">Loved by Real Families</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "We actually talk at dinner now about the trivia questions. Best thing we did this year.", author: "Sarah M.", role: "Mom of 3" },
              { text: "I love catching my brother cheating. The pop-up is hilarious.", author: "Mikey", role: "Age 14" },
              { text: "Finally, a game on my iPad that doesn't have annoying ads every 5 seconds.", author: "Grandpa Joe", role: "Age 72" }
            ].map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <p className="text-gray-600 italic mb-6 text-lg">"{review.text}"</p>
                <div className="flex items-center">
                   <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.author}&skinColor=pale,light`} />
                   </div>
                   <div>
                      <p className="font-bold text-gray-900">{review.author}</p>
                      <p className="text-xs text-gray-500 uppercase font-semibold">{review.role}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-4">
         <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
         <div className="space-y-4">
            {[
              { q: "Is it really free?", a: "Yes! The core game is completely free. You can earn coins by playing well to unlock retries." },
              { q: "Can we play on different devices?", a: "Absolutely. It works on phones, tablets, and desktops. Just log in with your username." },
              { q: "How does the anti-cheat work?", a: "We monitor if the browser tab loses focus. If you switch tabs to Google an answer, we know!" },
              { q: "Is it safe for kids?", a: "100%. All content is AI-generated with strict safety filters, and there are no external ads or chat features with strangers." }
            ].map((item, idx) => (
               <div key={idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition-colors"
                  >
                     <span className="font-bold text-gray-900 text-lg">{item.q}</span>
                     <ChevronDown className={`transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                     <div className="px-6 pb-6 text-gray-600 leading-relaxed animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                        {item.a}
                     </div>
                  )}
               </div>
            ))}
         </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-20 px-4">
         <div className="max-w-5xl mx-auto bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8">Ready to crown the family genius?</h2>
               <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                 Join the thousands of families making screen time meaningful.
               </p>
               <button 
                 onClick={onGetStarted}
                 className="bg-primary hover:bg-orange-600 text-white text-xl font-bold px-12 py-5 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:-translate-y-1"
               >
                 Get Started Now
               </button>
               <p className="mt-6 text-sm text-gray-500">No credit card required • Instant access</p>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
         </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white py-12 border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
               <div className="bg-primary/10 p-2 rounded-lg">
                 <Gamepad2 className="h-5 w-5 text-primary" />
               </div>
               <span className="font-bold text-gray-900">FamilyFun</span>
            </div>
            <div className="text-sm text-gray-500">
               © {new Date().getFullYear()} FamilyFun App. Built with Gemini AI.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
               <button onClick={() => setActiveModal('privacy')} className="text-gray-400 hover:text-gray-900">Privacy</button>
               <button onClick={() => setActiveModal('terms')} className="text-gray-400 hover:text-gray-900">Terms</button>
               <button onClick={() => setActiveModal('contact')} className="text-gray-400 hover:text-gray-900">Contact</button>
            </div>
         </div>
      </footer>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center rounded-t-3xl">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms of Service'}
                {activeModal === 'contact' && 'Contact Us'}
                {activeModal === 'demo' && 'How to Play'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-gray-600">
              {activeModal === 'privacy' && (
                <>
                  <p className="font-semibold text-gray-900">Last updated: {new Date().toLocaleDateString()}</p>
                  <h3 className="font-bold text-gray-900 mt-4">Data Collection</h3>
                  <p>FamilyFun stores all game data locally on your device using browser localStorage. We do not collect, transmit, or store any personal information on external servers.</p>
                  <h3 className="font-bold text-gray-900 mt-4">Google Sign-In</h3>
                  <p>If you choose to sign in with Google, we receive only your basic profile information (name, email, profile picture) which is stored locally on your device. This information is never sent to our servers.</p>
                  <h3 className="font-bold text-gray-900 mt-4">AI-Generated Content</h3>
                  <p>Our trivia questions and puzzles are generated using Google's Gemini AI. Your gameplay data is not used to train AI models.</p>
                  <h3 className="font-bold text-gray-900 mt-4">Cookies</h3>
                  <p>We do not use tracking cookies. Google Sign-In may use necessary cookies for authentication purposes.</p>
                  <h3 className="font-bold text-gray-900 mt-4">Children's Privacy</h3>
                  <p>FamilyFun is designed for family use. We recommend parental supervision for users under 13. No data is collected from children.</p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p className="font-semibold text-gray-900">Last updated: {new Date().toLocaleDateString()}</p>
                  <h3 className="font-bold text-gray-900 mt-4">Acceptance of Terms</h3>
                  <p>By using FamilyFun, you agree to these terms. If you disagree, please do not use the application.</p>
                  <h3 className="font-bold text-gray-900 mt-4">Use of Service</h3>
                  <p>FamilyFun is provided free of charge for personal, non-commercial use. You agree to use the service fairly and not attempt to manipulate scores or exploit the anti-cheat system.</p>
                  <h3 className="font-bold text-gray-900 mt-4">Content</h3>
                  <p>All trivia questions and puzzles are AI-generated. While we strive for accuracy, we cannot guarantee all information is correct. Content is for entertainment purposes.</p>
                  <h3 className="font-bold text-gray-900 mt-4">Local Data</h3>
                  <p>Your game progress is stored locally on your device. Clearing browser data will reset your account and scores.</p>
                  <h3 className="font-bold text-gray-900 mt-4">Disclaimer</h3>
                  <p>FamilyFun is provided "as is" without warranties. We are not responsible for data loss due to browser clearing or device changes.</p>
                </>
              )}

              {activeModal === 'contact' && (
                <>
                  <p>We'd love to hear from you! FamilyFun is a hobby project built with love for families everywhere.</p>
                  <h3 className="font-bold text-gray-900 mt-4">Feedback & Suggestions</h3>
                  <p>Have ideas for new games or features? Found a bug? We welcome all feedback.</p>
                  <div className="bg-gray-50 rounded-xl p-6 mt-4">
                    <p className="font-semibold text-gray-900 mb-2">Get in Touch:</p>
                    <ul className="space-y-2">
                      <li>• Report issues on our GitHub repository</li>
                      <li>• Share your family's high scores with #FamilyFunApp</li>
                    </ul>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">FamilyFun is an open-source project. Built with React, TypeScript, and Gemini AI.</p>
                </>
              )}

              {activeModal === 'demo' && (
                <>
                  <div className="space-y-6">
                    <div className="bg-orange-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 flex items-center"><span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span> Create Your Profile</h3>
                      <p className="mt-2 ml-11">Sign up with a fun username or use Google Sign-In. No email required for username login!</p>
                    </div>

                    <div className="bg-teal-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 flex items-center"><span className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span> Choose Your Challenge</h3>
                      <p className="mt-2 ml-11">Pick from 5 different game modes: Trivia, Word Wizard, Logic Lab, Emoji Enigma, or Math Mania.</p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 flex items-center"><span className="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span> Play Fair (We're Watching!)</h3>
                      <p className="mt-2 ml-11">Don't switch tabs to Google answers - our anti-cheat system will catch you and mark your score!</p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 flex items-center"><span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span> Earn Coins & Brag Rights</h3>
                      <p className="mt-2 ml-11">Score high to earn coins! Use coins for retries. Check the leaderboard to see who's the family genius.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => { closeModal(); onGetStarted(); }}
                    className="w-full mt-6 bg-primary hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
                  >
                    Start Playing Now!
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

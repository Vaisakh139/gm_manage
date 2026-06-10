import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/public/Navbar';
import RegisterModal from '../../components/public/RegisterModal';
import GymSearchSection from '../../components/public/GymSearchSection';

export default function Home() {
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar onRegisterClick={() => setShowRegister(true)} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        id="home"
        className="relative bg-gray-900 text-white overflow-hidden"
        style={{ minHeight: '100vh' }}
      >
        {/* Background gradient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600 opacity-10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-red-500 opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-indigo-600 opacity-10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-28 flex flex-col lg:flex-row items-center gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-red-600/20 text-red-400 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
              Gym Management Platform
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
              Run Your Gym<br />
              <span className="text-red-500">Smarter.</span>
            </h1>
            <p className="text-gray-400 text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Everything you need to manage members, track payments, and grow
              your fitness business — in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => setShowRegister(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 hover:-translate-y-0.5"
              >
                Register Your Gym — Free
              </button>
              <button
                onClick={() => navigate('/login')}
                className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200"
              >
                Sign In →
              </button>
            </div>
          </div>

          {/* Stats card */}
          <div className="flex-shrink-0 w-full max-w-sm">
            <div className="bg-gray-800/60 backdrop-blur border border-gray-700 rounded-2xl p-8 space-y-6">
              {[
                { icon: '🏢', value: '500+', label: 'Gyms Registered' },
                { icon: '👥', value: '25,000+', label: 'Members Managed' },
                { icon: '⚡', value: '99.9%', label: 'Uptime' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-5">
                  <div className="text-3xl w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-sm text-gray-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 animate-bounce">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Gym Search ───────────────────────────────────────── */}
      <GymSearchSection />

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Gym
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Purpose-built tools for gym owners who want to focus on fitness,
              not paperwork.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — visual */}
            <div className="relative">
              <div className="bg-gray-900 rounded-3xl p-10 text-white">
                <div className="text-6xl mb-6">🏋️</div>
                <h3 className="text-3xl font-bold mb-4">Built for Gym Owners</h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  We understand the daily challenges of running a gym. From
                  tracking membership renewals to managing trainers — GymPro
                  handles the operations so you can focus on what you do best.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Admin Portal', 'Full system control'],
                    ['Owner Dashboard', 'Real-time insights'],
                    ['Member Portal', 'Self-service access'],
                    ['Email Automation', 'Auto credential delivery'],
                  ].map(([t, d]) => (
                    <div key={t} className="bg-gray-800 rounded-xl p-4">
                      <p className="font-semibold text-sm text-white">{t}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-red-600/10 rounded-full blur-2xl" />
            </div>

            {/* Right — text */}
            <div>
              <span className="text-red-600 font-semibold text-sm tracking-widest uppercase">About GymPro</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-6">
                A Platform That Grows<br />With Your Business
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                GymPro was created to solve the real problems gym owners face every
                day. No more spreadsheets, no more missed renewals, no more manual
                credential emails. Our platform automates the routine so you can
                focus on building a community.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Whether you run a boutique studio or a multi-floor fitness centre,
                GymPro's three-tier role system — Admin, Gym Owner, and Member —
                gives everyone exactly the access they need, nothing more.
              </p>
              <div className="space-y-4">
                {[
                  'Members receive login credentials automatically via email',
                  'Gym owners get a full member management dashboard',
                  'Admins maintain full visibility across all gyms',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700 text-sm">{item}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowRegister(true)}
                className="mt-10 bg-gray-900 hover:bg-gray-700 text-white px-7 py-3.5 rounded-xl font-semibold transition-colors duration-200"
              >
                Get Started Today →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg">Up and running in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {i + 1}
                </div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+3rem)] w-[calc(100%-6rem)] border-t-2 border-dashed border-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────── */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info */}
            <div>
              <span className="text-red-600 font-semibold text-sm tracking-widest uppercase">Contact Us</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-6">
                We'd Love to Hear<br />From You
              </h2>
              <p className="text-gray-600 leading-relaxed mb-10">
                Have questions about GymPro? Need help setting up your account?
                Our team is here to help. Send us a message and we'll get back
                to you within 24 hours.
              </p>
              <div className="space-y-6">
                {contactInfo.map((c) => (
                  <div key={c.label} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {c.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{c.label}</p>
                      <p className="font-medium text-gray-900">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Gym?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join hundreds of gym owners who trust GymPro to manage their business.
          </p>
          <button
            onClick={() => setShowRegister(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-red-900/40 hover:-translate-y-0.5"
          >
            Register Your Gym — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏃</span>
            <span className="text-white font-bold text-lg">GymPro</span>
          </div>
          <p className="text-sm text-center">
            © {new Date().getFullYear()} GymPro. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <button onClick={() => setShowRegister(true)} className="hover:text-white transition-colors">Register</button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login</button>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* ── Registration Modal ───────────────────────────────── */}
      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
    </div>
  );
}

// ── Static data ──────────────────────────────────────────────

const features = [
  { icon: '👥', title: 'Member Management', desc: 'Add, edit, and track all your gym members in one place. Search, filter, and manage memberships with ease.' },
  { icon: '📊', title: 'Dashboard Analytics', desc: 'Real-time stats on active members, expiring memberships, and revenue — all in a clean visual dashboard.' },
  { icon: '📧', title: 'Automated Emails', desc: 'New members receive their login credentials automatically. No manual effort required.' },
  { icon: '🔒', title: 'Secure & Role-Based', desc: 'JWT-based authentication with three-tier access control — Admin, Gym Owner, and Member roles.' },
  { icon: '📱', title: 'Responsive Design', desc: 'Manage your gym from any device. The platform works beautifully on desktop, tablet, and mobile.' },
  { icon: '⚡', title: 'Fast Onboarding', desc: 'Register your gym in minutes. Create member accounts and start managing your business immediately.' },
];

const steps = [
  { icon: '📝', title: 'Register Your Gym', desc: 'Fill in your gym details and create your owner account. Takes less than 2 minutes.' },
  { icon: '👥', title: 'Add Your Members', desc: 'Add member profiles. Credentials are sent to them automatically by email.' },
  { icon: '📊', title: 'Manage & Grow', desc: 'Track memberships, view dashboards, and manage your gym from anywhere.' },
];

const contactInfo = [
  { icon: '📧', label: 'Email', value: 'support@gympro.com' },
  { icon: '📞', label: 'Phone', value: '+1 (800) 123-4567' },
  { icon: '📍', label: 'Address', value: '123 Fitness Ave, Wellness City, WC 10001' },
  { icon: '🕐', label: 'Support Hours', value: 'Mon – Fri, 9 AM – 6 PM' },
];

// ── Contact Form ──────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, POST to a contact endpoint
    setSent(true);
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  if (sent) return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
      <p className="text-gray-500">We'll get back to you within 24 hours.</p>
      <button onClick={() => setSent(false)} className="mt-6 text-sm text-red-600 hover:underline">
        Send another message
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Your Name" value={form.name} onChange={f('name')} placeholder="John Doe" required />
        <FormField label="Email Address" type="email" value={form.email} onChange={f('email')} placeholder="you@example.com" required />
      </div>
      <FormField label="Subject" value={form.subject} onChange={f('subject')} placeholder="How can we help?" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
        <textarea value={form.message} onChange={f('message')} rows={5} required
          placeholder="Tell us more about your question..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 resize-none" />
      </div>
      <button type="submit"
        className="w-full bg-gray-900 hover:bg-gray-700 text-white py-3.5 rounded-xl font-semibold transition-colors duration-200">
        Send Message
      </button>
    </form>
  );
}

function FormField({ label, value, onChange, placeholder, type = 'text', required = false }:
  { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10" />
    </div>
  );
}

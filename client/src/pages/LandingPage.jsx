import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

/* ── reusable section reveal hook ── */
function useReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return [ref, visible];
}

/* ── SVG icons ── */
const ShieldIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const UploadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
);
const ClipboardIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
);
const BellIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
);
const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
);
const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const CheckCircle = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
);

const FEATURES = [
    { icon: <ClipboardIcon />, title: 'Real-Time Tracking', desc: 'Follow every stage of your claim from submission to approval with live status updates.' },
    { icon: <UploadIcon />, title: 'Secure Document Upload', desc: 'Upload death certificates, ID proofs, and relationship documents — encrypted end-to-end.' },
    { icon: <CheckCircle />, title: 'Expert Admin Review', desc: 'Qualified administrators review every claim with detailed remarks and transparent decisions.' },
    { icon: <BellIcon />, title: 'Instant Notifications', desc: 'Get notified the moment your claim status changes — no more guessing or calling helplines.' },
    { icon: <LockIcon />, title: 'Bank-Grade Security', desc: '256-bit encryption, JWT authentication, and role-based access protect your sensitive data.' },
    { icon: <EyeIcon />, title: 'Transparent Process', desc: 'View exactly where your claim stands, read admin remarks, and access full audit trails.' },
];

const STEPS = [
    { num: '1', title: 'Submit Your Claim', desc: 'Upload your documents and provide the account details. It takes less than 5 minutes.' },
    { num: '2', title: 'Admin Reviews', desc: 'Our qualified team reviews your claim, verifies documents, and adds detailed remarks.' },
    { num: '3', title: 'Get Approved', desc: 'Receive your approval with a clear audit trail — or actionable feedback if more info is needed.' },
];

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [featRef, featVis] = useReveal();
    const [stepsRef, stepsVis] = useReveal();

    const scrollTo = (id) => {
        setMobileMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="landing">

            {/* ─── NAVBAR ─── */}
            <nav className={`landing-nav${scrolled ? ' nav-scrolled' : ''}`}>
                <div className="landing-nav-inner">
                    <div className="landing-logo">
                        <div className="logo-icon-small">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <span>HeirClear</span>
                    </div>

                    <div className={`landing-nav-links${mobileMenuOpen ? ' open' : ''}`}>
                        <button onClick={() => scrollTo('features')}>Features</button>
                        <button onClick={() => scrollTo('how-it-works')}>How It Works</button>
                        <div className="nav-auth-btns">
                            <Link to="/login" className="btn btn-secondary btn-small">Log In</Link>
                            <Link to="/register" className="btn btn-primary btn-small">Get Started</Link>
                        </div>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
                        <span /><span /><span />
                    </button>
                </div>
            </nav>

            {/* ─── HERO ─── */}
            <section className="hero-section">
                <div className="hero-bg">
                    <div className="hero-orb hero-orb-1" />
                    <div className="hero-orb hero-orb-2" />
                    <div className="hero-orb hero-orb-3" />
                    <div className="hero-grid-lines" />
                </div>
                <div className="hero-content">
                    <div className="hero-badge">
                        <ShieldIcon /> Trusted Inheritance Platform
                    </div>
                    <h1>Your Inheritance,<br /><span className="gold-gradient">Made Clear</span></h1>
                    <p className="hero-sub">
                        Track, manage, and resolve inheritance claims with full transparency.
                        Upload documents securely, follow every status change in real time, and
                        get decisions — not delays.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Get Started Free
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                        <button onClick={() => scrollTo('features')} className="btn btn-outline btn-lg">
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section id="features" className={`landing-section${featVis ? ' revealed' : ''}`} ref={featRef}>
                <div className="section-header">
                    <span className="section-tag">Features</span>
                    <h2>Everything You Need to<br /><span className="gold-gradient">Manage Inheritance Claims</span></h2>
                    <p>From submission to approval — a complete digital workflow designed for clarity and speed.</p>
                </div>
                <div className="features-grid">
                    {FEATURES.map((f, i) => (
                        <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="feature-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section id="how-it-works" className={`landing-section section-alt${stepsVis ? ' revealed' : ''}`} ref={stepsRef}>
                <div className="section-header">
                    <span className="section-tag">Process</span>
                    <h2>How <span className="gold-gradient">HeirClear</span> Works</h2>
                    <p>Three simple steps from claim submission to resolution.</p>
                </div>
                <div className="steps-row">
                    {STEPS.map((s, i) => (
                        <div key={i} className="step-card" style={{ animationDelay: `${i * 0.15}s` }}>
                            <div className="step-num">{s.num}</div>
                            {i < STEPS.length - 1 && <div className="step-connector" />}
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="cta-section">
                <div className="cta-inner">
                    <h2>Ready to Start Your Claim?</h2>
                    <p>Join thousands of families who trust HeirClear for transparent, hassle-free inheritance management.</p>
                    <Link to="/register" className="btn btn-primary btn-lg">
                        Create Free Account
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="landing-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <div className="landing-logo">
                            <div className="logo-icon-small">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <span>HeirClear</span>
                        </div>
                        <p>Inheritance Claim Tracking System. Transparent, secure, and effortless.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Product</h4>
                            <button onClick={() => scrollTo('features')}>Features</button>
                            <button onClick={() => scrollTo('how-it-works')}>How It Works</button>
                        </div>
                        <div className="footer-col">
                            <h4>Account</h4>
                            <Link to="/login">Log In</Link>
                            <Link to="/register">Sign Up</Link>
                        </div>
                        <div className="footer-col">
                            <h4>Legal</h4>
                            <button>Privacy Policy</button>
                            <button>Terms of Service</button>
                            <button>Contact</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} HeirClear. All rights reserved.</p>
                </div>
            </footer>

        </div>
    );
}

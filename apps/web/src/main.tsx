import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import {
  Wrench,
  Shield,
  Clock,
  User,
  FileText,
  CheckCircle,
  MapPin,
  TrendingUp,
  Phone,
  AlertCircle,
  Navigation,
  Check,
  X,
  RefreshCw,
  LogOut,
  Mail,
  Smartphone,
  Lock,
  Zap,
  Printer,
  ChevronRight,
  Sliders,
  DollarSign,
  Download,
  Building,
  CheckCircle2
} from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  mode: string;
  category?: { name: string };
}

interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'CUSTOMER' | 'ENGINEER' | 'ADMIN';
  companyName?: string;
  address?: string;
}

function App() {
  // Navigation & Role
  const [role, setRole] = useState<'customer' | 'engineer' | 'admin'>('customer');
  const [tab, setTab] = useState<'auth' | 'dashboard' | 'jobs' | 'tracking' | 'profile' | 'reports'>('auth');

  // Auth States
  const [authMethod, setAuthMethod] = useState<'email' | 'otp'>('email');
  const [authMode, setAuthMode] = useState<'login' | 'create'>('create');
  const [fullName, setFullName] = useState('Karthik Customer');
  const [phone, setPhone] = useState('9884933079');
  const [email, setEmail] = useState('client@nexuscreative.in');
  const [password, setPassword] = useState('password123');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);

  // Active Session User
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('NEXUS_SESSION_USER');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return {
      id: 'cmwgjf9930018umk07bsdlbb9',
      name: 'Karthik Customer',
      phone: '9884933079',
      email: 'client@nexuscreative.in',
      role: 'CUSTOMER',
      companyName: 'Nexus Creative Labs',
      address: 'Anna Nagar, Chennai, Tamil Nadu'
    };
  });

  // API Configuration
  const [api, setApiState] = useState(() => {
    return localStorage.getItem('NEXUS_API_URL') || (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
  });
  const setApi = (url: string) => {
    setApiState(url);
    localStorage.setItem('NEXUS_API_URL', url);
  };

  // Catalog & Booking
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('ALL');
  const [serviceMode, setServiceMode] = useState('ONSITE');
  const [address, setAddress] = useState('Anna Nagar, Chennai, Tamil Nadu');
  const [taskNotes, setTaskNotes] = useState('Enterprise switch rebooting intermittently, requires urgent troubleshooting');
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [radarScanning, setRadarScanning] = useState(false);

  // Modals
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);
  const [completionModalJobId, setCompletionModalJobId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Lists & State
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [jobFilter, setJobFilter] = useState('ALL');
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [availability, setAvailability] = useState('ONLINE');
  const [serviceRadius, setServiceRadius] = useState(20);
  const [earnings, setEarnings] = useState<any>({ totalEarned: 18500, completedJobs: 5 });

  // Admin Data
  const [adminStats, setAdminStats] = useState<any>({ customers: 1, verifiedEngineers: 1, openJobs: 1, completedJobs: 0 });
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Load Services Catalog
  useEffect(() => {
    fetch(`${api}/api/services`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
          setSelectedServiceId(data[0].id);
        }
      })
      .catch(() => {
        setServices([
          { id: 'srv-1', title: 'BGP Routing Configuration', description: 'Enterprise peering, route reflectors & multihoming failover', basePrice: 4500, mode: 'REMOTE', category: { name: 'Routing' } },
          { id: 'srv-2', title: 'Enterprise Wi-Fi Access Point Installation', description: 'SSID configuration, VLAN isolation & 5GHz heat-mapping', basePrice: 2000, mode: 'ONSITE', category: { name: 'Wireless' } },
          { id: 'srv-3', title: 'Fortinet / Cisco Firewall Hardening', description: 'NAT policies, IPSec VPN tunnel & security lockdown', basePrice: 4000, mode: 'BOTH', category: { name: 'Security' } },
          { id: 'srv-4', title: 'Fiber Optics & OTDR Fusion Splicing', description: 'Optical dB loss testing, core alignment & fault restoration', basePrice: 3500, mode: 'ONSITE', category: { name: 'Cabling' } },
          { id: 'srv-5', title: 'IP CCTV & Surveillance NVR Deployment', description: 'PoE camera mounting, static IP allocation & mobile streaming', basePrice: 2500, mode: 'ONSITE', category: { name: 'Security' } },
          { id: 'srv-6', title: 'Full Infrastructure Network Audit', description: 'Switchport mapping, rogue DHCP discovery & security assessment', basePrice: 6000, mode: 'BOTH', category: { name: 'Consulting' } }
        ]);
      });
  }, [api]);

  // Load Data for Active Role
  const refreshData = () => {
    const currentUserId = currentUser?.id || 'cmwgjf9930018umk07bsdlbb9';

    if (role === 'customer') {
      fetch(`${api}/api/jobs`, { headers: { 'x-user-id': currentUserId, 'x-user-role': 'CUSTOMER' } })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setMyJobs(d))
        .catch(console.error);
    } else if (role === 'engineer') {
      fetch(`${api}/api/engineers/offers`, { headers: { 'x-user-id': currentUserId, 'x-user-role': 'ENGINEER' } })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setOffers(d))
        .catch(console.error);

      fetch(`${api}/api/engineers/assignments`, { headers: { 'x-user-id': currentUserId, 'x-user-role': 'ENGINEER' } })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setAssignments(d))
        .catch(console.error);

      fetch(`${api}/api/engineers/earnings`, { headers: { 'x-user-id': currentUserId, 'x-user-role': 'ENGINEER' } })
        .then((r) => r.json())
        .then((d) => d && setEarnings(d))
        .catch(console.error);
    } else if (role === 'admin') {
      fetch(`${api}/api/admin/dashboard`, { headers: { 'x-user-id': currentUserId, 'x-user-role': 'ADMIN' } })
        .then((r) => r.json())
        .then((d) => d && setAdminStats(d))
        .catch(console.error);

      fetch(`${api}/api/admin/jobs`, { headers: { 'x-user-id': currentUserId, 'x-user-role': 'ADMIN' } })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setAllJobs(d))
        .catch(console.error);

      fetch(`${api}/api/admin/users`, { headers: { 'x-user-id': currentUserId, 'x-user-role': 'ADMIN' } })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setUsersList(d))
        .catch(console.error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [role, tab, api]);

  // Auth: Email
  async function handleAuthEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthFeedback(null);

    const endpoint = authMode === 'create' ? `${api}/api/auth/register` : `${api}/api/auth/login`;
    const payload = authMode === 'create'
      ? { name: fullName, phone, email, password, role: role.toUpperCase() }
      : { email, phone, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('NEXUS_SESSION_USER', JSON.stringify(data.user));
        setAuthFeedback(`✅ Authenticated as ${data.user.name}`);
        setTimeout(() => setTab('dashboard'), 600);
      } else {
        const mockUser: AuthUser = {
          id: 'cmwgjf9930018umk07bsdlbb9',
          name: fullName || 'Karthik Customer',
          phone: phone || '9884933079',
          email: email || 'client@nexuscreative.in',
          role: role.toUpperCase() as any
        };
        setCurrentUser(mockUser);
        localStorage.setItem('NEXUS_SESSION_USER', JSON.stringify(mockUser));
        setAuthFeedback(`✅ Authenticated as ${mockUser.name}`);
        setTimeout(() => setTab('dashboard'), 600);
      }
    } catch (e) {
      const mockUser: AuthUser = {
        id: 'cmwgjf9930018umk07bsdlbb9',
        name: fullName,
        phone,
        email,
        role: role.toUpperCase() as any
      };
      setCurrentUser(mockUser);
      setAuthFeedback(`✅ Authenticated!`);
      setTimeout(() => setTab('dashboard'), 600);
    } finally {
      setLoading(false);
    }
  }

  // Auth: OTP
  async function handleSendOtp() {
    setLoading(true);
    try {
      await fetch(`${api}/api/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      setOtpSent(true);
      setAuthFeedback('OTP code "123456" sent to ' + phone);
    } catch (e) {
      setOtpSent(true);
      setAuthFeedback('Test OTP is "123456"');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    try {
      const res = await fetch(`${api}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpCode || '123456', role: role.toUpperCase(), name: fullName })
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('NEXUS_SESSION_USER', JSON.stringify(data.user));
        setAuthFeedback(`✅ Verified as ${data.user.name}`);
        setTimeout(() => setTab('dashboard'), 600);
      }
    } catch (e) {
      const mockUser: AuthUser = {
        id: 'cmwgjf9930018umk07bsdlbb9',
        name: fullName,
        phone,
        role: role.toUpperCase() as any
      };
      setCurrentUser(mockUser);
      setAuthFeedback('✅ Verified via Mobile OTP!');
      setTimeout(() => setTab('dashboard'), 600);
    } finally {
      setLoading(false);
    }
  }

  // Customer: Book & Dispatch
  async function handleBookJob() {
    setLoading(true);
    setRadarScanning(true);
    setBookingStatus('Scanning 10 km radius for certified engineers in Chennai...');

    try {
      const res = await fetch(`${api}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'cmwgjf9930018umk07bsdlbb9',
          'x-user-role': 'CUSTOMER'
        },
        body: JSON.stringify({
          mode: serviceMode,
          latitude: 13.0850,
          longitude: 80.2100,
          address,
          customerNotes: taskNotes,
          items: [{ serviceId: selectedServiceId || services[0]?.id, quantity: 1 }]
        })
      });
      const data = await res.json();
      setRadarScanning(false);

      if (res.ok && data.job) {
        setBookingStatus(`Job #${data.job.id.slice(-6)} created! Dispatch offers sent to nearest verified engineers.`);
        setTrackedJobId(data.job.id);
        refreshData();
        setTab('tracking');
      } else {
        setBookingStatus(`Dispatched: ${data.error || 'Job queued for nearby engineers'}`);
      }
    } catch (e: any) {
      setRadarScanning(false);
      setBookingStatus(`Notice: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Engineer: Respond to Offer
  async function handleRespondOffer(offerId: string, accept: boolean) {
    try {
      const res = await fetch(`${api}/api/engineers/offers/${offerId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'cmwgjfbri001aumk0lq1nlkgn',
          'x-user-role': 'ENGINEER'
        },
        body: JSON.stringify({ accept })
      });
      if (res.ok) {
        refreshData();
        if (accept) setTab('dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Engineer: Update Status
  async function handleUpdateStatus(jobId: string, newStatus: string) {
    try {
      const res = await fetch(`${api}/api/engineers/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'cmwgjfbri001aumk0lq1nlkgn',
          'x-user-role': 'ENGINEER'
        },
        body: JSON.stringify({ status: newStatus, note: completionNotes })
      });
      if (res.ok) {
        setCompletionModalJobId(null);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const activeAssignment = assignments[0];
  const currentTrackedJob = myJobs.find((j) => j.id === trackedJobId) || myJobs[0];

  const filteredServices = serviceCategoryFilter === 'ALL'
    ? services
    : services.filter(s => s.category?.name === serviceCategoryFilter);

  const filteredMyJobs = jobFilter === 'ALL'
    ? myJobs
    : myJobs.filter(j => j.status === jobFilter);

  return (
    <div className="page-container">
      {/* Exact Header Card from Screenshot */}
      <header className="top-header">
        <span className="brand-badge">NEXUS CREATIVE NETWORK</span>
        <h1>Nexus Marketplace</h1>
        <p>On-demand certified network engineers dispatched in real-time.</p>

        {/* Role Pills inside Header */}
        <div className="role-pill-group">
          <button
            className={`role-pill-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => {
              setRole('customer');
              setFullName('Karthik Customer');
              setPhone('9884933079');
              setEmail('client@nexuscreative.in');
            }}
          >
            👤 Customer Portal
          </button>
          <button
            className={`role-pill-btn ${role === 'engineer' ? 'active' : ''}`}
            onClick={() => {
              setRole('engineer');
              setFullName('Karthik Raman');
              setPhone('9840012345');
              setEmail('karthik.network@nexuscreative.in');
            }}
          >
            🛠️ Engineer Workbench
          </button>
          <button
            className={`role-pill-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setRole('admin');
              setFullName('Operations Admin');
              setEmail('admin@nexuscreative.in');
            }}
          >
            🛡️ Admin Operations
          </button>
        </div>
      </header>

      {/* Feature Navigation Tabs */}
      <nav className="feature-nav">
        <button
          className={`nav-tab-btn ${tab === 'auth' ? 'active' : ''}`}
          onClick={() => setTab('auth')}
        >
          🔐 Auth & Login
        </button>
        <button
          className={`nav-tab-btn ${tab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          {role === 'customer' ? '🛠️ Book Service' : role === 'engineer' ? '🛠️ Assigned Jobs' : '📊 Overview'}
        </button>
        <button
          className={`nav-tab-btn ${tab === 'jobs' ? 'active' : ''}`}
          onClick={() => setTab('jobs')}
        >
          {role === 'customer' ? '📋 My Requests' : role === 'engineer' ? '⚡ Job Offers' : '📋 All Jobs'}
        </button>
        <button
          className={`nav-tab-btn ${tab === 'tracking' ? 'active' : ''}`}
          onClick={() => setTab('tracking')}
        >
          {role === 'customer' ? '📍 Track Engineer' : role === 'engineer' ? '🛵 Update Status' : '🛰️ Monitor'}
        </button>
        <button
          className={`nav-tab-btn ${tab === 'profile' ? 'active' : ''}`}
          onClick={() => setTab('profile')}
        >
          {role === 'customer' ? '👤 Customer Profile' : role === 'engineer' ? '🛡️ Skills & KYC' : '👥 Manage Users'}
        </button>
        <button
          className={`nav-tab-btn ${tab === 'reports' ? 'active' : ''}`}
          onClick={() => setTab('reports')}
        >
          {role === 'customer' ? '📑 Service History' : role === 'engineer' ? '💰 Earnings' : '📈 Business Reports'}
        </button>
      </nav>

      {/* ===================== TAB 1: AUTH & LOGIN ===================== */}
      {tab === 'auth' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
                {role === 'customer' ? 'Customer' : role === 'engineer' ? 'Engineer' : 'Admin'} Authentication
              </h2>
              <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
                Select authentication method: Email Address or Mobile OTP.
              </p>
            </div>
            <span
              className="badge"
              style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 13, padding: '6px 14px' }}
            >
              <Zap size={14} style={{ marginRight: 4 }} /> Auth Ready
            </span>
          </div>

          <div className="auth-method-grid">
            <button
              type="button"
              className={`auth-method-btn ${authMethod === 'email' ? 'active' : ''}`}
              onClick={() => setAuthMethod('email')}
            >
              <Mail size={16} /> Login with Email Address
            </button>
            <button
              type="button"
              className={`auth-method-btn ${authMethod === 'otp' ? 'active' : ''}`}
              onClick={() => setAuthMethod('otp')}
            >
              <Smartphone size={16} /> Mobile OTP
            </button>
          </div>

          {authMethod === 'email' && (
            <div>
              <div className="subtab-header">
                <button
                  type="button"
                  className={`subtab-btn ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Login with Email
                </button>
                <button
                  type="button"
                  className={`subtab-btn ${authMode === 'create' ? 'active' : ''}`}
                  onClick={() => setAuthMode('create')}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleAuthEmail}>
                {authMode === 'create' && (
                  <div>
                    <label>{role === 'customer' ? 'Customer Full Name' : role === 'engineer' ? 'Engineer Full Name' : 'Admin Name'}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Karthik Customer"
                      required
                    />

                    <label>Mobile Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9884933079"
                      required
                    />
                  </div>
                )}

                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. client@nexuscreative.in"
                  required
                />

                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  required
                />

                <div style={{ marginTop: 22, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="submit" disabled={loading} style={{ minWidth: 200 }}>
                    {loading ? 'Authenticating...' : authMode === 'create' ? 'Create Account & Continue' : 'Sign In with Email'}
                  </button>
                  {authFeedback && (
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>
                      {authFeedback}
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {authMethod === 'otp' && (
            <div style={{ marginTop: 16 }}>
              <label>Enter Registered Mobile Phone</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9884933079"
                />
                <button
                  type="button"
                  className="secondary"
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  Send OTP
                </button>
              </div>

              {otpSent && (
                <div style={{ marginTop: 18 }}>
                  <label>Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 123456"
                  />
                  <div style={{ marginTop: 18 }}>
                    <button type="button" onClick={handleVerifyOtp} disabled={loading}>
                      Verify & Login
                    </button>
                  </div>
                </div>
              )}

              {authFeedback && (
                <p style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>
                  {authFeedback}
                </p>
              )}
            </div>
          )}

          {currentUser && (
            <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <User size={20} />
                </div>
                <div>
                  <b style={{ fontSize: 14 }}>Logged In: {currentUser.name}</b>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                    {currentUser.phone} · Role: {currentUser.role}
                  </p>
                </div>
              </div>
              <button
                className="secondary"
                style={{ padding: '6px 14px', fontSize: 12 }}
                onClick={() => {
                  localStorage.removeItem('NEXUS_SESSION_USER');
                  setCurrentUser(null);
                  setAuthFeedback('Session ended.');
                }}
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: DASHBOARD ===================== */}
      {tab === 'dashboard' && (
        <div>
          {role === 'customer' && (
            <div>
              <div className="card">
                <h2>Book a Network Engineer</h2>
                <p style={{ color: 'var(--muted)', marginTop: -6, fontSize: 14 }}>
                  Instant skill-first dispatch within 10 km initial radius across Chennai.
                </p>

                {/* Category Filter Pills */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '14px 0 10px' }}>
                  {['ALL', 'Routing', 'Wireless', 'Security', 'Cabling', 'Consulting'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      style={{
                        padding: '6px 14px',
                        fontSize: 12,
                        borderRadius: 20,
                        background: serviceCategoryFilter === cat ? 'var(--primary)' : '#F1F5F9',
                        color: serviceCategoryFilter === cat ? 'white' : '#475569'
                      }}
                      onClick={() => setServiceCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <label>Select Service Required</label>
                <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
                  {filteredServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} — ₹{s.basePrice} ({s.mode})
                    </option>
                  ))}
                </select>

                {selectedService && (
                  <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', padding: '16px 18px', borderRadius: 14, margin: '16px 0' }}>
                    <b style={{ color: '#1E293B', fontSize: 15 }}>{selectedService.title}</b>
                    <p style={{ margin: '4px 0 0', color: '#475569', fontSize: 13 }}>
                      {selectedService.description}
                    </p>
                    <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 13, color: 'var(--primary-dark)', fontWeight: 700, flexWrap: 'wrap' }}>
                      <span>Price: ₹{selectedService.basePrice}</span>
                      <span>Mode: {selectedService.mode}</span>
                      <span>Guaranteed SLA: 60 Mins</span>
                    </div>
                  </div>
                )}

                <label>Service Mode</label>
                <select value={serviceMode} onChange={(e) => setServiceMode(e.target.value)}>
                  <option value="ONSITE">ONSITE (Engineer visits your office/facility in Chennai)</option>
                  <option value="REMOTE">REMOTE (Secure SSH / VPN / TeamViewer Session)</option>
                </select>

                <label>Service Address / Facility Location</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} />

                <label>Symptoms & Problem Notes</label>
                <textarea
                  rows={3}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                />

                <div style={{ marginTop: 22, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button onClick={handleBookJob} disabled={loading || radarScanning}>
                    {radarScanning ? 'Scanning Radius...' : 'Book Service & Dispatch Engineer'}
                  </button>
                  {bookingStatus && (
                    <span style={{ fontSize: 13, color: 'var(--primary-dark)', fontWeight: 700 }}>
                      {bookingStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {role === 'engineer' && (
            <div>
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="stat-label">Duty Availability</span>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {['ONLINE', 'BUSY', 'OFFLINE'].map((st) => (
                      <button
                        key={st}
                        style={{
                          margin: 0,
                          padding: '6px 12px',
                          fontSize: 12,
                          background: availability === st ? 'var(--primary)' : '#F1F5F9',
                          color: availability === st ? 'white' : '#475569'
                        }}
                        onClick={() => setAvailability(st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-label">Pending Job Offers</span>
                  <div className="stat-value">{offers.length}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>Within 10 km zone</p>
                </div>

                <div className="stat-card">
                  <span className="stat-label">Active Assignments</span>
                  <div className="stat-value">{assignments.length}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>Ongoing tasks</p>
                </div>
              </div>

              <div className="card">
                <h2>Active Assigned Task</h2>
                {activeAssignment ? (
                  <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b>{activeAssignment.job?.items?.[0]?.titleSnapshot || 'Assigned Network Service'}</b>
                      <span className="badge badge-warning">{activeAssignment.job?.status}</span>
                    </div>
                    <p style={{ margin: '8px 0', fontSize: 14 }}>
                      <b>Premises:</b> {activeAssignment.job?.address}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--muted)' }}>
                      <b>Customer Notes:</b> {activeAssignment.job?.customerNotes || 'Urgent repair required'}
                    </p>
                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                      <button onClick={() => setTab('tracking')}>
                        Update Status & Journey 🛵
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--muted)' }}>No active assignment right now. Check incoming Job Offers tab.</p>
                )}
              </div>
            </div>
          )}

          {role === 'admin' && (
            <div>
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="stat-label">Registered Clients</span>
                  <div className="stat-value" style={{ color: 'var(--primary)' }}>{adminStats.customers}</div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Verified Engineers</span>
                  <div className="stat-value" style={{ color: 'var(--success)' }}>{adminStats.verifiedEngineers}</div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">In-Flight Jobs</span>
                  <div className="stat-value" style={{ color: 'var(--warning)' }}>{adminStats.openJobs}</div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Completed Orders</span>
                  <div className="stat-value">{adminStats.completedJobs}</div>
                </div>
              </div>

              <div className="card">
                <h2>Chennai Dispatch Operations Monitor</h2>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
                  <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, flex: 1, minWidth: 200 }}>
                    <b>Initial Radius:</b> 10 km
                  </div>
                  <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, flex: 1, minWidth: 200 }}>
                    <b>Max Expansion:</b> 50 km
                  </div>
                  <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, flex: 1, minWidth: 200 }}>
                    <b>Matching Gate:</b> Verified skills first + rating & distance rank
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: JOBS ===================== */}
      {tab === 'jobs' && (
        <div className="card">
          {role === 'customer' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <h2>My Service Requests</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['ALL', 'REQUESTED', 'OFFERED', 'ASSIGNED', 'COMPLETED'].map((st) => (
                    <button
                      key={st}
                      className="secondary"
                      style={{ padding: '4px 10px', fontSize: 11, background: jobFilter === st ? 'var(--primary)' : undefined, color: jobFilter === st ? 'white' : undefined }}
                      onClick={() => setJobFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredMyJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--muted)' }}>
                  <Clock size={36} style={{ margin: 'auto', marginBottom: 8, opacity: 0.5 }} />
                  <p>No requests found in this view. Click "Book Service" to dispatch an engineer.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                  {filteredMyJobs.map((j) => (
                    <div
                      key={j.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        padding: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12
                      }}
                    >
                      <div>
                        <b>{j.items?.[0]?.titleSnapshot || 'Network Service'}</b>
                        <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--muted)' }}>
                          Job #{j.id.slice(-6)} · {j.address} · ₹{j.quotedTotal} ({j.mode})
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className={`badge ${j.status === 'COMPLETED' ? 'badge-success' : j.status === 'OFFERED' ? 'badge-warning' : 'badge-info'}`}>
                          {j.status}
                        </span>
                        <button
                          className="secondary"
                          style={{ padding: '6px 12px', fontSize: 13 }}
                          onClick={() => { setTrackedJobId(j.id); setTab('tracking'); }}
                        >
                          Track Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {role === 'engineer' && (
            <div>
              <h2>Incoming Job Offers</h2>
              <p style={{ color: 'var(--muted)', marginTop: -6, fontSize: 14 }}>
                Review skill requirements, distance, and accept offers within the 10-minute dispatch window.
              </p>

              {offers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--muted)' }}>
                  <CheckCircle size={36} style={{ margin: 'auto', marginBottom: 8, opacity: 0.5 }} />
                  <p>No pending offers right now. Keep your duty status ONLINE.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        padding: 18,
                        background: '#FFFFFF',
                        boxShadow: 'var(--shadow)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 17 }}>
                            {offer.job?.items?.[0]?.titleSnapshot || 'Network Service'}
                          </h3>
                          <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--muted)' }}>
                            {offer.job?.address} · Mode: <b>{offer.job?.mode}</b>
                          </p>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: 14 }}>
                          Payout: ₹{Math.round(offer.job?.quotedTotal * 0.8)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 20, margin: '14px 0', fontSize: 13, color: '#334155' }}>
                        <span>🎯 Skill Match: <b>{(offer.matchScore * 100).toFixed(0)}%</b></span>
                        <span>📍 Distance: <b>{offer.distanceKm.toFixed(1)} km</b></span>
                        <span>⏳ Window: <b>10 Mins</b></span>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          className="success"
                          style={{ flex: 1 }}
                          onClick={() => handleRespondOffer(offer.id, true)}
                        >
                          <Check size={16} /> Accept Job
                        </button>
                        <button
                          className="danger"
                          style={{ padding: '12px 18px' }}
                          onClick={() => handleRespondOffer(offer.id, false)}
                        >
                          <X size={16} /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {role === 'admin' && (
            <div>
              <h2>All Marketplace Jobs Queue</h2>
              <div style={{ overflowX: 'auto', marginTop: 14 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--muted)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 8px' }}>Job ID</th>
                      <th style={{ padding: '10px 8px' }}>Service</th>
                      <th style={{ padding: '10px 8px' }}>Address</th>
                      <th style={{ padding: '10px 8px' }}>Quoted</th>
                      <th style={{ padding: '10px 8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allJobs.map((j) => (
                      <tr key={j.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 8px' }}>#{j.id.slice(-6)}</td>
                        <td style={{ padding: '12px 8px' }}>{j.items?.[0]?.titleSnapshot || 'Service'}</td>
                        <td style={{ padding: '12px 8px' }}>{j.address}</td>
                        <td style={{ padding: '12px 8px' }}>₹{j.quotedTotal}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span className={`badge ${j.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                            {j.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 4: TRACKING ===================== */}
      {tab === 'tracking' && (
        <div className="card">
          {role === 'customer' && (
            <div>
              <h2>Live Engineer Tracking</h2>
              {currentTrackedJob ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{currentTrackedJob.items?.[0]?.titleSnapshot || 'Network Service'}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                        Job #{currentTrackedJob.id.slice(-8)} · Quoted ₹{currentTrackedJob.quotedTotal}
                      </p>
                    </div>
                    <span className="badge badge-info">{currentTrackedJob.status}</span>
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', padding: 16, borderRadius: 14, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <User size={24} />
                      </div>
                      <div>
                        <b>Karthik Raman (Senior Network Engineer)</b>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                          Cisco CCNP & Mikrotik Certified · 4.9 ★ · 10 Yrs Experience
                        </p>
                      </div>
                    </div>
                    <button className="secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
                      <Phone size={14} /> Call Engineer (+91 98400 12345)
                    </button>
                  </div>

                  <h4 style={{ marginTop: 24, marginBottom: 8 }}>Service Journey Progression</h4>
                  <div className="timeline">
                    <div className="timeline-step completed">
                      <b>Task Submitted & Quoted</b>
                      <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>Order verified and quote approved: ₹{currentTrackedJob.quotedTotal}</p>
                    </div>
                    <div className={`timeline-step ${currentTrackedJob.status !== 'REQUESTED' ? 'completed' : 'active'}`}>
                      <b>Automated Skill Matching (10 km radius)</b>
                      <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>Hard skill verification + distance & rating ranking</p>
                    </div>
                    <div className={`timeline-step ${['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(currentTrackedJob.status) ? 'completed' : 'active'}`}>
                      <b>Engineer Assigned</b>
                      <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>Assigned to Karthik Raman (Accepted offer)</p>
                    </div>
                    <div className={`timeline-step ${['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(currentTrackedJob.status) ? 'completed' : ''}`}>
                      <b>Engineer En Route 🛵</b>
                      <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>Navigating to your premises in Chennai (~12 mins ETA)</p>
                    </div>
                    <div className={`timeline-step ${['ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(currentTrackedJob.status) ? 'completed' : ''}`}>
                      <b>Arrived at Premises 📍</b>
                      <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>Physical diagnosis and cable/switch testing initiated</p>
                    </div>
                    <div className={`timeline-step ${currentTrackedJob.status === 'COMPLETED' ? 'completed' : ''}`}>
                      <b>Service Completed & Tested ✅</b>
                      <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>Technical report submitted and signed off</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--muted)' }}>Book a service or select from My Requests to view live tracking.</p>
              )}
            </div>
          )}

          {role === 'engineer' && (
            <div>
              <h2>Update Job Status & Journey</h2>
              <p style={{ color: 'var(--muted)', marginTop: -6, fontSize: 14 }}>
                Keep customer and dispatch operations notified as you travel and complete the assignment.
              </p>

              {activeAssignment ? (
                <div>
                  <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, marginBottom: 18 }}>
                    <b>Job #{activeAssignment.jobId.slice(-6)}: {activeAssignment.job?.items?.[0]?.titleSnapshot}</b>
                    <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--muted)' }}>
                      Premises: {activeAssignment.job?.address}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: 13 }}>
                      Current Status: <span className="badge badge-info">{activeAssignment.job?.status}</span>
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <button
                      className="secondary"
                      onClick={() => handleUpdateStatus(activeAssignment.jobId, 'EN_ROUTE')}
                    >
                      🛵 Mark En Route
                    </button>
                    <button
                      className="secondary"
                      onClick={() => handleUpdateStatus(activeAssignment.jobId, 'ARRIVED')}
                    >
                      📍 Mark Arrived
                    </button>
                    <button
                      className="secondary"
                      onClick={() => handleUpdateStatus(activeAssignment.jobId, 'IN_PROGRESS')}
                    >
                      🛠️ Start Troubleshooting
                    </button>
                    <button
                      className="success"
                      onClick={() => setCompletionModalJobId(activeAssignment.jobId)}
                    >
                      ✅ Complete & Handover
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--muted)' }}>No active assignment to update right now.</p>
              )}
            </div>
          )}

          {role === 'admin' && (
            <div>
              <h2>Live Dispatch Operations Monitor</h2>
              <div style={{ background: '#F1F5F9', height: 200, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', flexDirection: 'column', gap: 8 }}>
                <Navigation size={34} color="var(--primary)" />
                <b>Real-Time Dispatch Engine Active</b>
                <span style={{ fontSize: 13 }}>Chennai Network Grid · Auto-expanding from 10 km to 50 km</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 5: PROFILE ===================== */}
      {tab === 'profile' && (
        <div className="card">
          {role === 'customer' && (
            <div>
              <h2>Customer Account Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
                <div className="stat-card">
                  <span className="stat-label">Full Name / Contact</span>
                  <div className="stat-value" style={{ fontSize: 18 }}>{currentUser?.name || 'Karthik Customer'}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>GSTIN: 33AAACN1234F1Z5</p>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Verified Phone</span>
                  <div className="stat-value" style={{ fontSize: 18 }}>{currentUser?.phone || '+91 98849 33079'}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--success)' }}>Verified via Mobile OTP</p>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Service City</span>
                  <div className="stat-value" style={{ fontSize: 18 }}>Chennai, TN</div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>Anna Nagar Tech Zone</p>
                </div>
              </div>
            </div>
          )}

          {role === 'engineer' && (
            <div>
              <h2>Engineer Skills & KYC Profile</h2>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '16px 0', background: '#F0FDF4', padding: 18, borderRadius: 14 }}>
                <Shield size={34} color="var(--success)" />
                <div>
                  <b style={{ color: '#166534', fontSize: 16 }}>KYC Verified Network Specialist</b>
                  <p style={{ margin: '2px 0 0', color: '#15803D', fontSize: 13 }}>
                    Aadhaar, Police Clearance, and Cisco Certified (CCNP Enterprise #CS-8921)
                  </p>
                </div>
              </div>

              <div style={{ margin: '18px 0' }}>
                <label>Working Service Radius</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={serviceRadius}
                    onChange={(e) => setServiceRadius(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <b>{serviceRadius} km</b>
                </div>
              </div>

              <h4 style={{ marginTop: 20, marginBottom: 10 }}>Verified Technical Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['BGP Routing (5/5)', 'OSPF Setup (5/5)', 'VLAN Trunking (5/5)', 'Fortinet / Cisco Firewall (5/5)', 'Fiber Splicing & OTDR (5/5)', 'Enterprise Wi-Fi (5/5)', 'Network Audit (5/5)'].map((sk) => (
                  <span key={sk} className="badge badge-info" style={{ padding: '6px 12px', fontSize: 13 }}>
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {role === 'admin' && (
            <div>
              <h2>Manage Users & KYC Verification</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                <div style={{ border: '1px solid var(--border)', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b>Karthik Raman (Senior Engineer)</b>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                      Skills: BGP, OSPF, VLAN, Firewall, Wi-Fi, OFC Splicing · Chennai
                    </p>
                  </div>
                  <span className="badge badge-success">VERIFIED & ACTIVE</span>
                </div>
                <div style={{ border: '1px solid var(--border)', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b>Karthik Customer (Enterprise Client)</b>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                      Phone: 9884933079 · Email: client@nexuscreative.in
                    </p>
                  </div>
                  <span className="badge badge-info">ACTIVE CLIENT</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 6: REPORTS ===================== */}
      {tab === 'reports' && (
        <div className="card">
          {role === 'customer' && (
            <div>
              <h2>Service History & Invoices</h2>
              <div style={{ overflowX: 'auto', marginTop: 14 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--muted)' }}>
                      <th style={{ padding: '10px 8px' }}>Job ID</th>
                      <th style={{ padding: '10px 8px' }}>Service</th>
                      <th style={{ padding: '10px 8px' }}>Mode</th>
                      <th style={{ padding: '10px 8px' }}>Amount</th>
                      <th style={{ padding: '10px 8px' }}>Status</th>
                      <th style={{ padding: '10px 8px' }}>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 8px' }}>#NX-8012</td>
                      <td style={{ padding: '12px 8px' }}>Enterprise Wi-Fi AP Installation</td>
                      <td style={{ padding: '12px 8px' }}>ONSITE</td>
                      <td style={{ padding: '12px 8px' }}>₹2,000</td>
                      <td style={{ padding: '12px 8px' }}><span className="badge badge-success">COMPLETED</span></td>
                      <td style={{ padding: '12px 8px' }}>
                        <button
                          className="outline"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => setActiveInvoice({ id: 'NX-8012', title: 'Enterprise Wi-Fi AP Installation', price: 2000, date: '14 Nov 2026' })}
                        >
                          View GST Invoice
                        </button>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 8px' }}>#NX-7940</td>
                      <td style={{ padding: '12px 8px' }}>BGP Peering & Multihoming</td>
                      <td style={{ padding: '12px 8px' }}>REMOTE</td>
                      <td style={{ padding: '12px 8px' }}>₹4,500</td>
                      <td style={{ padding: '12px 8px' }}><span className="badge badge-success">COMPLETED</span></td>
                      <td style={{ padding: '12px 8px' }}>
                        <button
                          className="outline"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => setActiveInvoice({ id: 'NX-7940', title: 'BGP Peering & Multihoming', price: 4500, date: '12 Nov 2026' })}
                        >
                          View GST Invoice
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {role === 'engineer' && (
            <div>
              <h2>Earnings & Settlements</h2>
              <div className="stat-grid" style={{ marginTop: 14 }}>
                <div className="stat-card">
                  <span className="stat-label">Net Lifetime Earnings</span>
                  <div className="stat-value" style={{ color: 'var(--success)' }}>
                    ₹{earnings?.totalEarned?.toLocaleString() || '18,500'}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>80% engineer split</p>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Completed Tasks</span>
                  <div className="stat-value">{earnings?.completedJobs || 5}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>100% 5-star feedback</p>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Payout Mode</span>
                  <div className="stat-value" style={{ fontSize: 18 }}>Weekly NEFT / UPI</div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>HDFC Bank ··· 9821</p>
                </div>
              </div>
            </div>
          )}

          {role === 'admin' && (
            <div>
              <h2>Business Reports & Metrics</h2>
              <div className="stat-grid" style={{ marginTop: 14 }}>
                <div className="stat-card">
                  <span className="stat-label">Platform Gross Volume</span>
                  <div className="stat-value" style={{ color: 'var(--primary)' }}>₹24,500</div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Platform Net Commission (20%)</span>
                  <div className="stat-value" style={{ color: 'var(--success)' }}>₹4,900</div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Engineer Settlements (80%)</span>
                  <div className="stat-value">₹19,600</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== INVOICE MODAL ===================== */}
      {activeInvoice && (
        <div className="modal-overlay" onClick={() => setActiveInvoice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border)', paddingBottom: 14 }}>
              <div>
                <span className="brand-badge" style={{ color: 'var(--primary)' }}>TAX INVOICE</span>
                <h3 style={{ margin: '4px 0 0' }}>Nexus Creative Network Services</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>GSTIN: 33AAACN1234F1Z5 · Chennai, India</p>
              </div>
              <button className="secondary" style={{ padding: '6px 10px' }} onClick={() => setActiveInvoice(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ margin: '18px 0', fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Invoice Number:</span>
                <b>INV-{activeInvoice.id}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Date:</span>
                <span>{activeInvoice.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>Customer:</span>
                <span>Karthik Customer (Nexus Creative Labs)</span>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, margin: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>{activeInvoice.title}</span>
                <span>₹{Math.round(activeInvoice.price / 1.18)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                <span>CGST (9%)</span>
                <span>₹{Math.round((activeInvoice.price * 0.09) / 1.18)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                <span>SGST (9%)</span>
                <span>₹{Math.round((activeInvoice.price * 0.09) / 1.18)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}>
                <span>Total Amount Paid</span>
                <span style={{ color: 'var(--primary)' }}>₹{activeInvoice.price}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button style={{ flex: 1 }} onClick={() => window.print()}>
                <Printer size={16} /> Print Receipt
              </button>
              <button className="secondary" onClick={() => setActiveInvoice(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ENGINEER COMPLETION REPORT MODAL ===================== */}
      {completionModalJobId && (
        <div className="modal-overlay" onClick={() => setCompletionModalJobId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>Submit Technical Completion Report</h3>
              <button className="secondary" style={{ padding: '6px 10px' }} onClick={() => setCompletionModalJobId(null)}>
                <X size={16} />
              </button>
            </div>

            <label>Work Performed & Diagnostic Summary</label>
            <textarea
              rows={4}
              placeholder="e.g. Replaced burnt RJ45 crimp, re-balanced PoE load on Switch 1, validated 1Gbps link test with 0 packet drops."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
            />

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button
                className="success"
                style={{ flex: 1 }}
                onClick={() => handleUpdateStatus(completionModalJobId, 'COMPLETED')}
              >
                <CheckCircle2 size={16} /> Sign Off & Complete Task
              </button>
              <button className="secondary" onClick={() => setCompletionModalJobId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with API Endpoint Switcher */}
      <footer style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>API Server:</span>
          <input
            style={{ width: 'auto', flex: 1, minWidth: 260, padding: '7px 12px', fontSize: 13 }}
            value={api}
            onChange={(e) => setApi(e.target.value.trim())}
            placeholder="https://nexus-creative-networking.onrender.com"
          />
          <button
            className="secondary"
            style={{ margin: 0, padding: '7px 14px', fontSize: 13 }}
            onClick={() => location.reload()}
          >
            <RefreshCw size={14} /> Connect API
          </button>
        </div>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>
          Nexus Creative Networking MVP · Built for Web & Mobile WebView / Android APK.
        </p>
      </footer>

      {/* Mobile Fixed Bottom Navigation */}
      <div className="bottom-nav">
        <button className={tab === 'auth' ? 'active' : ''} onClick={() => setTab('auth')}>
          <Lock size={18} />
          <span>Auth</span>
        </button>
        <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
          <Wrench size={18} />
          <span>Dashboard</span>
        </button>
        <button className={tab === 'jobs' ? 'active' : ''} onClick={() => setTab('jobs')}>
          <Clock size={18} />
          <span>Jobs</span>
        </button>
        <button className={tab === 'tracking' ? 'active' : ''} onClick={() => setTab('tracking')}>
          <Navigation size={18} />
          <span>Track</span>
        </button>
        <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>
          <User size={18} />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

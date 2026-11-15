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
  Building,
  Key
} from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  mode: string;
  category?: { name: string };
}

const DEFAULT_CUSTOMER_ID = 'cmwgjf9930018umk07bsdlbb9';
const DEFAULT_ENGINEER_ID = 'cmwgjfbri001aumk0lq1nlkgn';

function App() {
  // Role & Feature Tab state
  const [role, setRole] = useState<'customer' | 'engineer' | 'admin'>('customer');
  const [tab, setTab] = useState<'dashboard' | 'jobs' | 'tracking' | 'profile' | 'reports'>('dashboard');

  // Auth & Session
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneInput, setPhoneInput] = useState('+91 98765 43210');
  const [otpInput, setOtpInput] = useState('');

  // API Config
  const [api, setApiState] = useState(() => {
    return localStorage.getItem('NEXUS_API_URL') || (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
  });
  const setApi = (url: string) => {
    setApiState(url);
    localStorage.setItem('NEXUS_API_URL', url);
  };

  // Live Data State
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [serviceMode, setServiceMode] = useState('ONSITE');
  const [address, setAddress] = useState('Anna Nagar, Chennai, Tamil Nadu');
  const [taskNotes, setTaskNotes] = useState('Network switch rebooting intermittently, requires urgent diagnosis');
  const [statusMsg, setStatusMsg] = useState('Connected to network dispatcher.');
  const [loading, setLoading] = useState(false);

  // Customer Data
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);

  // Engineer Data
  const [offers, setOffers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [availability, setAvailability] = useState('ONLINE');
  const [earnings, setEarnings] = useState<any>({ totalEarned: 18500, completedJobs: 5, recentPayouts: [] });

  // Admin Data
  const [adminStats, setAdminStats] = useState<any>({ customers: 1, verifiedEngineers: 1, openJobs: 1, completedJobs: 0 });
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adminReports, setAdminReports] = useState<any>({ totalRevenue: 24500, platformMargin: 4900, engineerPayouts: 19600, completedOrders: 6 });

  // Load Services on mount or API change
  useEffect(() => {
    fetch(`${api}/api/services`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
          setSelectedServiceId(data[0].id);
        }
      })
      .catch(() => {
        // Fallback default sample services if API is temporarily sleeping
        setServices([
          { id: 'srv-1', title: 'BGP Routing Configuration', description: 'Enterprise peering & multi-homing setup', basePrice: 4500, mode: 'REMOTE' },
          { id: 'srv-2', title: 'Wi-Fi Access Point Installation', description: 'Enterprise SSID, VLAN mapping & coverage tuning', basePrice: 2000, mode: 'ONSITE' },
          { id: 'srv-3', title: 'Fortinet / Cisco Firewall Hardening', description: 'NAT policy, VPN tunnel & security lockdown', basePrice: 4000, mode: 'BOTH' },
          { id: 'srv-4', title: 'Fiber Optics & OTDR Troubleshooting', description: 'Fiber splicing, dB loss testing & fault restoration', basePrice: 3500, mode: 'ONSITE' }
        ]);
      });
  }, [api]);

  // Load role-specific data
  const loadData = () => {
    if (role === 'customer') {
      fetch(`${api}/api/jobs`, { headers: { 'x-user-id': DEFAULT_CUSTOMER_ID, 'x-user-role': 'CUSTOMER' } })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setMyJobs(d))
        .catch(console.error);
    } else if (role === 'engineer') {
      fetch(`${api}/api/engineers/offers`, { headers: { 'x-user-id': DEFAULT_ENGINEER_ID, 'x-user-role': 'ENGINEER' } })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setOffers(d))
        .catch(console.error);

      fetch(`${api}/api/engineers/assignments`, { headers: { 'x-user-id': DEFAULT_ENGINEER_ID, 'x-user-role': 'ENGINEER' } })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setAssignments(d))
        .catch(console.error);

      fetch(`${api}/api/engineers/earnings`, { headers: { 'x-user-id': DEFAULT_ENGINEER_ID, 'x-user-role': 'ENGINEER' } })
        .then((r) => r.json())
        .then((d) => d && setEarnings(d))
        .catch(console.error);
    } else if (role === 'admin') {
      fetch(`${api}/api/admin/dashboard`, { headers: { 'x-user-id': DEFAULT_CUSTOMER_ID, 'x-user-role': 'ADMIN' } })
        .then((r) => r.json())
        .then((d) => d && setAdminStats(d))
        .catch(console.error);

      fetch(`${api}/api/admin/jobs`, { headers: { 'x-user-id': DEFAULT_CUSTOMER_ID, 'x-user-role': 'ADMIN' } })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setAllJobs(d))
        .catch(console.error);

      fetch(`${api}/api/admin/users`, { headers: { 'x-user-id': DEFAULT_CUSTOMER_ID, 'x-user-role': 'ADMIN' } })
        .then((r) => r.json())
        .then((d) => Array.isArray(d) && setUsersList(d))
        .catch(console.error);

      fetch(`${api}/api/admin/reports`, { headers: { 'x-user-id': DEFAULT_CUSTOMER_ID, 'x-user-role': 'ADMIN' } })
        .then((r) => r.json())
        .then((d) => d && setAdminReports(d))
        .catch(console.error);
    }
  };

  useEffect(() => {
    loadData();
  }, [role, tab, api]);

  // Handle Customer Job Booking
  async function handleBookJob() {
    setLoading(true);
    setStatusMsg('Matching nearest verified engineer within 10 km...');
    try {
      const res = await fetch(`${api}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': DEFAULT_CUSTOMER_ID, 'x-user-role': 'CUSTOMER' },
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
      if (res.ok && data.job) {
        setStatusMsg(`Job #${data.job.id.slice(-6)} created! Offers dispatched to verified engineers.`);
        setTrackedJobId(data.job.id);
        loadData();
        setTab('tracking');
      } else {
        setStatusMsg(`Booking response: ${data.error || 'Check server connection'}`);
      }
    } catch (e: any) {
      setStatusMsg(`Notice: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Handle Engineer Offer Response (Accept / Reject)
  async function respondOffer(offerId: string, accept: boolean) {
    try {
      const res = await fetch(`${api}/api/engineers/offers/${offerId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': DEFAULT_ENGINEER_ID, 'x-user-role': 'ENGINEER' },
        body: JSON.stringify({ accept })
      });
      if (res.ok) {
        loadData();
        if (accept) {
          setTab('dashboard');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Handle Engineer Job Status Update
  async function updateJobStatus(jobId: string, status: string) {
    try {
      const res = await fetch(`${api}/api/engineers/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': DEFAULT_ENGINEER_ID, 'x-user-role': 'ENGINEER' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Handle Engineer Availability Toggle
  async function toggleAvailability(newStatus: string) {
    try {
      const res = await fetch(`${api}/api/engineers/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': DEFAULT_ENGINEER_ID, 'x-user-role': 'ENGINEER' },
        body: JSON.stringify({ availability: newStatus })
      });
      if (res.ok) {
        setAvailability(newStatus);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Handle Admin Engineer Verification
  async function verifyEngineer(engineerId: string) {
    try {
      const res = await fetch(`${api}/api/admin/engineers/${engineerId}/verify`, {
        method: 'PATCH',
        headers: { 'x-user-id': DEFAULT_CUSTOMER_ID, 'x-user-role': 'ADMIN' }
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const activeAssignment = assignments[0];
  const currentTrackedJob = myJobs.find((j) => j.id === trackedJobId) || myJobs[0];

  return (
    <div className="page-container">
      {/* Top Header & Role Switcher */}
      <header className="top-header">
        <div>
          <span className="brand-badge">NEXUS CREATIVE NETWORKING</span>
          <h1>Nexus Network Services</h1>
          <p style={{ margin: '4px 0 0', color: '#CBD5E1', fontSize: 13 }}>
            On-Demand Network Engineering Marketplace · Chennai Region
          </p>
        </div>

        <div className="role-pill-group">
          <button
            className={`role-pill-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => { setRole('customer'); setTab('dashboard'); }}
          >
            Customer
          </button>
          <button
            className={`role-pill-btn ${role === 'engineer' ? 'active' : ''}`}
            onClick={() => { setRole('engineer'); setTab('dashboard'); }}
          >
            Engineer
          </button>
          <button
            className={`role-pill-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => { setRole('admin'); setTab('dashboard'); }}
          >
            Admin
          </button>
        </div>
      </header>

      {/* Feature Navigation Tabs */}
      <nav className="feature-nav">
        <button
          className={`nav-tab-btn ${tab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          {role === 'customer' ? 'Book Service' : role === 'engineer' ? 'Assigned Jobs' : 'Overview'}
        </button>
        <button
          className={`nav-tab-btn ${tab === 'jobs' ? 'active' : ''}`}
          onClick={() => setTab('jobs')}
        >
          {role === 'customer' ? 'My Requests' : role === 'engineer' ? 'Job Offers' : 'All Jobs'}
        </button>
        <button
          className={`nav-tab-btn ${tab === 'tracking' ? 'active' : ''}`}
          onClick={() => setTab('tracking')}
        >
          {role === 'customer' ? 'Track Engineer' : role === 'engineer' ? 'Update Status' : 'Live Monitor'}
        </button>
        <button
          className={`nav-tab-btn ${tab === 'profile' ? 'active' : ''}`}
          onClick={() => setTab('profile')}
        >
          {role === 'customer' ? 'Customer Profile' : role === 'engineer' ? 'Skills & KYC' : 'Manage Users'}
        </button>
        <button
          className={`nav-tab-btn ${tab === 'reports' ? 'active' : ''}`}
          onClick={() => setTab('reports')}
        >
          {role === 'customer' ? 'Service History' : role === 'engineer' ? 'Earnings' : 'Business Reports'}
        </button>
      </nav>

      {/* ===================== CUSTOMER PORTAL ===================== */}
      {role === 'customer' && (
        <main>
          {tab === 'dashboard' && (
            <div className="card">
              <h2>Book a Network Engineer</h2>
              <p style={{ color: 'var(--muted)', marginTop: -6, fontSize: 14 }}>
                Instant skill-first dispatch within 10 km initial radius.
              </p>

              <label>Select Required Service</label>
              <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} — ₹{s.basePrice} ({s.mode})
                  </option>
                ))}
              </select>

              {selectedService && (
                <div style={{ background: '#F1F5F9', padding: '12px 16px', borderRadius: 10, margin: '14px 0' }}>
                  <b style={{ color: '#1E293B', fontSize: 14 }}>Service Scope:</b>
                  <p style={{ margin: '4px 0 0', color: '#475569', fontSize: 13 }}>
                    {selectedService.description}
                  </p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--primary-dark)', fontWeight: 600 }}>
                    <span>Fixed Price: ₹{selectedService.basePrice}</span>
                    <span>Service Mode: {selectedService.mode}</span>
                    <span>Standard SLA: 60 Mins</span>
                  </div>
                </div>
              )}

              <label>Service Mode</label>
              <select value={serviceMode} onChange={(e) => setServiceMode(e.target.value)}>
                <option value="ONSITE">ONSITE (Engineer visits your facility / office)</option>
                <option value="REMOTE">REMOTE (Secure SSH / VPN / TeamViewer)</option>
              </select>

              <label>Location / Premises Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} />

              <label>Task Details & Router/Switch Symptoms</label>
              <textarea
                rows={3}
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
              />

              <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleBookJob} disabled={loading}>
                  {loading ? 'Dispatching...' : 'Book Service & Dispatch Engineer'}
                </button>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {statusMsg}
                </span>
              </div>
            </div>
          )}

          {tab === 'jobs' && (
            <div className="card">
              <h2>My Service Requests</h2>
              <p style={{ color: 'var(--muted)', marginTop: -6, fontSize: 14 }}>
                Review active tasks and dispatch status.
              </p>

              {myJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--muted)' }}>
                  <Clock size={36} style={{ margin: 'auto', marginBottom: 8, opacity: 0.5 }} />
                  <p>No active service requests. Book a service to dispatch an engineer.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myJobs.map((j) => (
                    <div
                      key={j.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 12,
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
                          Job #{j.id.slice(-6)} · {j.address} · ₹{j.quotedTotal}
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

          {tab === 'tracking' && (
            <div className="card">
              <h2>Live Engineer Tracking</h2>
              {currentTrackedJob ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{currentTrackedJob.items?.[0]?.titleSnapshot || 'Wi-Fi / Network Task'}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                        Job #{currentTrackedJob.id.slice(-8)} · Quoted ₹{currentTrackedJob.quotedTotal}
                      </p>
                    </div>
                    <span className="badge badge-info">{currentTrackedJob.status}</span>
                  </div>

                  {/* Assigned Engineer Card */}
                  <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', padding: 16, borderRadius: 12, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <User size={24} />
                      </div>
                      <div>
                        <b>Karthik Raman (Senior Network Specialist)</b>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                          Cisco CCNP & Mikrotik Certified · 4.9 ★ · 10 Yrs Experience
                        </p>
                      </div>
                    </div>
                    <button className="secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
                      <Phone size={14} /> Call Engineer
                    </button>
                  </div>

                  {/* Timeline Progression */}
                  <h4 style={{ marginTop: 24, marginBottom: 8 }}>Dispatch & Service Progress</h4>
                  <div className="timeline">
                    <div className="timeline-step completed">
                      <b>Task Submitted & Quoted</b>
                      <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>System verified service scope (₹{currentTrackedJob.quotedTotal})</p>
                    </div>
                    <div className={`timeline-step ${currentTrackedJob.status !== 'REQUESTED' ? 'completed' : 'active'}`}>
                      <b>Automated Skill Matching (10 km radius)</b>
                      <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>Ranked candidates by Cisco/BGP certification & proximity</p>
                    </div>
                    <div className={`timeline-step ${['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(currentTrackedJob.status) ? 'completed' : 'active'}`}>
                      <b>Engineer Assigned</b>
                      <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>Offer accepted by Karthik Raman</p>
                    </div>
                    <div className={`timeline-step ${['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(currentTrackedJob.status) ? 'completed' : ''}`}>
                      <b>Engineer En Route</b>
                      <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>Estimated travel time ~15 minutes</p>
                    </div>
                    <div className={`timeline-step ${currentTrackedJob.status === 'COMPLETED' ? 'completed' : ''}`}>
                      <b>Service Completed & Tested</b>
                      <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>Technical report and customer signoff</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--muted)' }}>Select a job from My Requests to track live status.</p>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="card">
              <h2>Customer Account Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
                <div className="stat-card">
                  <span className="stat-label">Company / Account</span>
                  <div className="stat-value" style={{ fontSize: 18 }}>Nexus Creative Labs</div>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>GSTIN: 33AAACN1234F1Z5</p>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Registered Phone</span>
                  <div className="stat-value" style={{ fontSize: 18 }}>+91 98765 43210</div>
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

          {tab === 'reports' && (
            <div className="card">
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
                      <td style={{ padding: '12px 8px' }}><button className="outline" style={{ padding: '4px 8px', fontSize: 12 }}>View GST Invoice</button></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 8px' }}>#NX-7940</td>
                      <td style={{ padding: '12px 8px' }}>BGP Peering & Multihoming</td>
                      <td style={{ padding: '12px 8px' }}>REMOTE</td>
                      <td style={{ padding: '12px 8px' }}>₹4,500</td>
                      <td style={{ padding: '12px 8px' }}><span className="badge badge-success">COMPLETED</span></td>
                      <td style={{ padding: '12px 8px' }}><button className="outline" style={{ padding: '4px 8px', fontSize: 12 }}>View GST Invoice</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ===================== ENGINEER PORTAL ===================== */}
      {role === 'engineer' && (
        <main>
          {tab === 'dashboard' && (
            <div>
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="stat-label">Duty Status</span>
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
                        onClick={() => toggleAvailability(st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-label">Incoming Offers</span>
                  <div className="stat-value">{offers.length}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>Within 10 km radius</p>
                </div>

                <div className="stat-card">
                  <span className="stat-label">Current Assignments</span>
                  <div className="stat-value">{assignments.length}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>In progress jobs</p>
                </div>
              </div>

              {/* Active Assigned Job */}
              <div className="card">
                <h2>Active Assigned Task</h2>
                {activeAssignment ? (
                  <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b>{activeAssignment.job?.items?.[0]?.titleSnapshot || 'Assigned Network Service'}</b>
                      <span className="badge badge-warning">{activeAssignment.job?.status}</span>
                    </div>
                    <p style={{ margin: '8px 0', fontSize: 14 }}>
                      <b>Premises:</b> {activeAssignment.job?.address}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--muted)' }}>
                      <b>Customer Notes:</b> {activeAssignment.job?.customerNotes || 'No extra notes provided'}
                    </p>
                    <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                      <button onClick={() => setTab('tracking')}>
                        Update Status & Journey 🛵
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--muted)' }}>No currently active job. Keep status ONLINE to receive incoming offers.</p>
                )}
              </div>
            </div>
          )}

          {tab === 'jobs' && (
            <div className="card">
              <h2>Nearby Job Offers</h2>
              <p style={{ color: 'var(--muted)', marginTop: -6, fontSize: 14 }}>
                Review skill fit, distance, and accept offers within the 10-minute dispatch window.
              </p>

              {offers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--muted)' }}>
                  <CheckCircle size={36} style={{ margin: 'auto', marginBottom: 8, opacity: 0.5 }} />
                  <p>No pending offers right now. Keep your availability ONLINE.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 12,
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
                            {offer.job?.address} · Service Mode: <b>{offer.job?.mode}</b>
                          </p>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: 14 }}>
                          Payout: ₹{Math.round(offer.job?.quotedTotal * 0.8)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 20, margin: '14px 0', fontSize: 13, color: '#334155' }}>
                        <span>🎯 Match Score: <b>{(offer.matchScore * 100).toFixed(0)}%</b></span>
                        <span>📍 Distance: <b>{offer.distanceKm.toFixed(1)} km</b></span>
                        <span>⏳ Expires in: <b>10 Mins</b></span>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          className="success"
                          style={{ flex: 1 }}
                          onClick={() => respondOffer(offer.id, true)}
                        >
                          <Check size={16} /> Accept Job
                        </button>
                        <button
                          className="danger"
                          style={{ padding: '12px 18px' }}
                          onClick={() => respondOffer(offer.id, false)}
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

          {tab === 'tracking' && (
            <div className="card">
              <h2>Update Job Status & Journey</h2>
              <p style={{ color: 'var(--muted)', marginTop: -6, fontSize: 14 }}>
                Keep customer and dispatch operations notified as you travel and complete the assignment.
              </p>

              {activeAssignment ? (
                <div>
                  <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, marginBottom: 18 }}>
                    <b>Job #{activeAssignment.jobId.slice(-6)}: {activeAssignment.job?.items?.[0]?.titleSnapshot}</b>
                    <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--muted)' }}>
                      Location: {activeAssignment.job?.address}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: 13 }}>
                      Current Status: <span className="badge badge-info">{activeAssignment.job?.status}</span>
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <button
                      className="secondary"
                      onClick={() => updateJobStatus(activeAssignment.jobId, 'EN_ROUTE')}
                    >
                      🛵 Mark En Route
                    </button>
                    <button
                      className="secondary"
                      onClick={() => updateJobStatus(activeAssignment.jobId, 'ARRIVED')}
                    >
                      📍 Mark Arrived
                    </button>
                    <button
                      className="secondary"
                      onClick={() => updateJobStatus(activeAssignment.jobId, 'IN_PROGRESS')}
                    >
                      🛠️ Start Work
                    </button>
                    <button
                      className="success"
                      onClick={() => updateJobStatus(activeAssignment.jobId, 'COMPLETED')}
                    >
                      ✅ Complete & Submit Report
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--muted)' }}>No active assignment to update right now.</p>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="card">
              <h2>Engineer Skills & KYC Profile</h2>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '16px 0', background: '#F0FDF4', padding: 16, borderRadius: 12 }}>
                <Shield size={32} color="var(--success)" />
                <div>
                  <b style={{ color: '#166534', fontSize: 16 }}>KYC Verified Engineer</b>
                  <p style={{ margin: '2px 0 0', color: '#15803D', fontSize: 13 }}>
                    Aadhaar, Cisco Certifications, and Police Clearance Approved
                  </p>
                </div>
              </div>

              <h4 style={{ marginTop: 20, marginBottom: 10 }}>Verified Technical Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['BGP Routing (Proficiency 5/5)', 'OSPF Setup (5/5)', 'VLAN Trunking (5/5)', 'Fortinet / Cisco Firewall (5/5)', 'Fiber Splicing & OTDR (5/5)', 'Enterprise Wi-Fi (5/5)', 'Network Audit (5/5)'].map((sk) => (
                  <span key={sk} className="badge badge-info" style={{ padding: '6px 12px', fontSize: 13 }}>
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tab === 'reports' && (
            <div className="card">
              <h2>Earnings & Settlements</h2>
              <div className="stat-grid" style={{ marginTop: 14 }}>
                <div className="stat-card">
                  <span className="stat-label">Net Earnings</span>
                  <div className="stat-value" style={{ color: 'var(--success)' }}>
                    ₹{earnings?.totalEarned?.toLocaleString() || '18,500'}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>80% engineer split</p>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Completed Jobs</span>
                  <div className="stat-value">{earnings?.completedJobs || 5}</div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>100% customer satisfaction</p>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Settlement Mode</span>
                  <div className="stat-value" style={{ fontSize: 18 }}>Weekly Direct Bank</div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>HDFC Bank ··· 9821</p>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ===================== ADMIN PORTAL ===================== */}
      {role === 'admin' && (
        <main>
          {tab === 'dashboard' && (
            <div>
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Customers</span>
                  <div className="stat-value" style={{ color: 'var(--primary)' }}>{adminStats.customers}</div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Verified Engineers</span>
                  <div className="stat-value" style={{ color: 'var(--success)' }}>{adminStats.verifiedEngineers}</div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Active / Open Jobs</span>
                  <div className="stat-value" style={{ color: 'var(--warning)' }}>{adminStats.openJobs}</div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Completed Services</span>
                  <div className="stat-value">{adminStats.completedJobs}</div>
                </div>
              </div>

              <div className="card">
                <h2>Dispatch Operations Monitor</h2>
                <p style={{ color: 'var(--muted)', marginTop: -6, fontSize: 14 }}>
                  Current active marketplace traffic and radius health.
                </p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
                  <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, flex: 1, minWidth: 200 }}>
                    <b>Initial Radius:</b> 10 km
                  </div>
                  <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, flex: 1, minWidth: 200 }}>
                    <b>Max Expansion:</b> 50 km
                  </div>
                  <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, flex: 1, minWidth: 200 }}>
                    <b>Matching Logic:</b> Hard skill gate + Weighted rank
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'jobs' && (
            <div className="card">
              <h2>All Marketplace Jobs</h2>
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

          {tab === 'tracking' && (
            <div className="card">
              <h2>Live Dispatch Monitor</h2>
              <p style={{ color: 'var(--muted)', marginTop: -6, fontSize: 14 }}>
                Real-time tracking of candidate matching and offer dispatches across Chennai.
              </p>
              <div style={{ background: '#F1F5F9', height: 200, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', flexDirection: 'column', gap: 8 }}>
                <Navigation size={32} color="var(--primary)" />
                <b>Real-Time Dispatch Engine Active</b>
                <span style={{ fontSize: 13 }}>Anna Nagar & Central Chennai Service Zones Active</span>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="card">
              <h2>Manage Users & KYC Verification</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                <div style={{ border: '1px solid var(--border)', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b>Karthik Raman (Engineer)</b>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                      Skills: BGP, OSPF, VLAN, Firewall, Wi-Fi, OFC Splicing · Chennai
                    </p>
                  </div>
                  <span className="badge badge-success">VERIFIED & ACTIVE</span>
                </div>
                <div style={{ border: '1px solid var(--border)', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b>Nexus Creative Labs (Customer)</b>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                      GST Registered · Anna Nagar, Chennai
                    </p>
                  </div>
                  <span className="badge badge-info">ACTIVE CLIENT</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'reports' && (
            <div className="card">
              <h2>Business Reports & Metrics</h2>
              <div className="stat-grid" style={{ marginTop: 14 }}>
                <div className="stat-card">
                  <span className="stat-label">Platform Gross Revenue</span>
                  <div className="stat-value" style={{ color: 'var(--primary)' }}>
                    ₹{adminReports.totalRevenue?.toLocaleString() || '24,500'}
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Platform Margin (20%)</span>
                  <div className="stat-value" style={{ color: 'var(--success)' }}>
                    ₹{adminReports.platformMargin?.toLocaleString() || '4,900'}
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Engineer Settlements (80%)</span>
                  <div className="stat-value">
                    ₹{adminReports.engineerPayouts?.toLocaleString() || '19,600'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Footer with API Endpoint Switcher */}
      <footer style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>API Server:</span>
          <input
            style={{ width: 'auto', flex: 1, minWidth: 260, padding: '7px 12px', fontSize: 13 }}
            value={api}
            onChange={(e) => setApi(e.target.value.trim())}
            placeholder="https://your-backend.onrender.com"
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
          Nexus Creative Networking MVP · Built for On-Demand Network Engineers.
        </p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="bottom-nav">
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
        <button className={tab === 'reports' ? 'active' : ''} onClick={() => setTab('reports')}>
          <FileText size={18} />
          <span>Reports</span>
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  mode: string;
  category?: { name: string };
}

interface AdminStats {
  customers: number;
  verifiedEngineers: number;
  openJobs: number;
  completedJobs: number;
}

const DEFAULT_CUSTOMER_ID = 'cmwgjf9930018umk07bsdlbb9';
const DEFAULT_ENGINEER_ID = 'cmwgjfbri001aumk0lq1nlkgn';

function App() {
  const role = (new URLSearchParams(location.search).get('role') || 'customer').toLowerCase();
  const [api, setApi] = useState('http://localhost:4000');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [mode, setMode] = useState('ONSITE');
  const [address, setAddress] = useState('Anna Nagar, Chennai, Tamil Nadu');
  const [notes, setNotes] = useState('Urgent assistance required');
  const [status, setStatus] = useState('Loading live services from database...');
  const [loading, setLoading] = useState(false);

  // Admin Dashboard State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  // Engineer State
  const [offers, setOffers] = useState<any[]>([]);
  const [engineerAvailability, setEngineerAvailability] = useState('ONLINE');

  // Load services on mount
  useEffect(() => {
    fetch(`${api}/api/services`)
      .then((res) => res.json())
      .then((data: ServiceItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
          setSelectedServiceId(data[0].id);
          setStatus('Ready to match network engineers.');
        } else {
          setStatus('No services found in database.');
        }
      })
      .catch(() => {
        setStatus('Could not connect to API server at ' + api);
      });
  }, [api]);

  // Load admin data when in admin view
  useEffect(() => {
    if (role === 'admin') {
      fetch(`${api}/api/admin/dashboard`, {
        headers: { 'x-user-id': DEFAULT_CUSTOMER_ID, 'x-user-role': 'ADMIN' },
      })
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(console.error);

      fetch(`${api}/api/admin/jobs`, {
        headers: { 'x-user-id': DEFAULT_CUSTOMER_ID, 'x-user-role': 'ADMIN' },
      })
        .then((res) => res.json())
        .then((data) => setJobs(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [role, api]);

  // Load engineer offers
  useEffect(() => {
    if (role === 'engineer') {
      fetch(`${api}/api/engineers/offers`, {
        headers: { 'x-user-id': DEFAULT_ENGINEER_ID, 'x-user-role': 'ENGINEER' },
      })
        .then((res) => res.json())
        .then((data) => setOffers(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [role, api]);

  async function createTask() {
    if (!selectedServiceId) {
      setStatus('Please select a service.');
      return;
    }
    setLoading(true);
    setStatus('Submitting task & matching nearest verified engineer...');

    try {
      const res = await fetch(`${api}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': DEFAULT_CUSTOMER_ID,
          'x-user-role': 'CUSTOMER',
        },
        body: JSON.stringify({
          mode,
          latitude: 13.085,
          longitude: 80.21,
          address,
          customerNotes: notes,
          items: [{ serviceId: selectedServiceId, quantity: 1 }],
        }),
      });

      const data = await res.json();
      if (res.ok && data.job) {
        setStatus(
          `✅ Task Created: #${data.job.id} | Status: ${data.job.status} | Total: ₹${data.job.quotedTotal} | Dispatch: ${
            data.dispatch?.offersSent ?? 1
          } engineer(s) notified!`
        );
      } else {
        setStatus(`Error: ${data.error || 'Failed to create task'}`);
      }
    } catch (e: any) {
      setStatus(`Connection error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function updateAvailability(newStatus: string) {
    try {
      const res = await fetch(`${api}/api/engineers/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': DEFAULT_ENGINEER_ID,
          'x-user-role': 'ENGINEER',
        },
        body: JSON.stringify({ availability: newStatus }),
      });
      if (res.ok) {
        setEngineerAvailability(newStatus);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <main>
      <header>
        <div>
          <small>NEXUS CREATIVE</small>
          <h1>Nexus Network Services</h1>
          <p>On-demand network engineers matched to your task in real-time.</p>
        </div>
        <span className="pill">{role.toUpperCase()} PORTAL</span>
      </header>

      <nav>
        <a href="?role=customer" style={{ fontWeight: role === 'customer' ? 'bold' : 'normal' }}>
          Customer Portal
        </a>
        <a href="?role=engineer" style={{ fontWeight: role === 'engineer' ? 'bold' : 'normal' }}>
          Engineer Workbench
        </a>
        <a href="?role=admin" style={{ fontWeight: role === 'admin' ? 'bold' : 'normal' }}>
          Operations Dashboard
        </a>
      </nav>

      {role === 'customer' ? (
        <section>
          <h2>Book a Network Engineer</h2>
          <label>Select Service Required</label>
          <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} — ₹{s.basePrice} ({s.category?.name || s.mode})
              </option>
            ))}
          </select>

          {selectedService && (
            <p style={{ margin: '8px 0', color: '#475569', fontSize: 14 }}>
              <b>Description:</b> {selectedService.description}
            </p>
          )}

          <label>Service Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="ONSITE">ONSITE (Engineer visits location)</option>
            <option value="REMOTE">REMOTE (Remote CLI / TeamViewer / SSH)</option>
          </select>

          <label>Service Address / City</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} />

          <label>Task Notes / Issues</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} />

          <button onClick={createTask} disabled={loading}>
            {loading ? 'Matching...' : 'Find My Engineer (Dispatch)'}
          </button>

          <p className="notice">{status}</p>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            ⚡ <b>Live Matching Algorithm:</b> Checks verified engineering skills (BGP, OSPF, VLAN, Firewall, etc.) within 10 km before ranking by rating and distance.
          </p>
        </section>
      ) : role === 'engineer' ? (
        <section>
          <h2>Engineer Workbench</h2>
          <div className="tiles">
            <article>
              <b>Availability Status</b>
              <p>Current: <b>{engineerAvailability}</b></p>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {['ONLINE', 'BUSY', 'OFFLINE'].map((st) => (
                  <button
                    key={st}
                    style={{
                      margin: 0,
                      padding: '6px 10px',
                      fontSize: 12,
                      background: engineerAvailability === st ? '#1265b3' : '#e2e8f0',
                      color: engineerAvailability === st ? 'white' : '#334155',
                    }}
                    onClick={() => updateAvailability(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </article>
            <article>
              <b>Nearby Job Offers</b>
              <p>{offers.length} active offer(s) within your dispatch zone.</p>
            </article>
            <article>
              <b>Verified Profile</b>
              <p>Karthik Raman · 10 Yrs Exp · 4.9 ★</p>
            </article>
          </div>

          <h3 style={{ marginTop: 24 }}>Incoming Dispatch Offers</h3>
          {offers.length === 0 ? (
            <p className="notice">No pending offers right now. Keep your status ONLINE to receive automatic job assignments.</p>
          ) : (
            offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: 16,
                  marginTop: 10,
                  background: '#f8fafc',
                }}
              >
                <b>Task: {offer.job?.items?.[0]?.titleSnapshot || 'Network Service'}</b>
                <p style={{ margin: '4px 0', fontSize: 14 }}>
                  Match Score: {(offer.matchScore * 100).toFixed(0)}% · Distance: {offer.distanceKm.toFixed(1)} km · Quoted: ₹{offer.job?.quotedTotal}
                </p>
                <p style={{ margin: '4px 0', fontSize: 13, color: '#64748b' }}>
                  Address: {offer.job?.address}
                </p>
              </div>
            ))
          )}
        </section>
      ) : (
        <section>
          <h2>Operations Dashboard</h2>
          <div className="tiles">
            <article>
              <b>Registered Customers</b>
              <p style={{ fontSize: 24, fontWeight: 'bold', margin: '8px 0', color: '#1265b3' }}>
                {stats ? stats.customers : '...'}
              </p>
            </article>
            <article>
              <b>Verified Engineers</b>
              <p style={{ fontSize: 24, fontWeight: 'bold', margin: '8px 0', color: '#16a34a' }}>
                {stats ? stats.verifiedEngineers : '...'}
              </p>
            </article>
            <article>
              <b>Open / Active Jobs</b>
              <p style={{ fontSize: 24, fontWeight: 'bold', margin: '8px 0', color: '#ea580c' }}>
                {stats ? stats.openJobs : '...'}
              </p>
            </article>
          </div>

          <h3 style={{ marginTop: 24 }}>Recent Jobs in Queue</h3>
          {jobs.length === 0 ? (
            <p className="notice">No jobs recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {jobs.map((j) => (
                <div
                  key={j.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: 14,
                    background: '#fcfcfc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <b>Job #{j.id.slice(-8)}</b> — {j.items?.[0]?.titleSnapshot || 'Network Job'}
                    <p style={{ margin: '4px 0', fontSize: 13, color: '#64748b' }}>
                      {j.address} · ₹{j.quotedTotal} ({j.mode})
                    </p>
                  </div>
                  <span
                    style={{
                      background: j.status === 'OFFERED' ? '#fef3c7' : '#dcfce7',
                      color: j.status === 'OFFERED' ? '#b45309' : '#15803d',
                      padding: '4px 10px',
                      borderRadius: 14,
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    {j.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <footer>
        Connected to Supabase PostgreSQL & Express Engine · Nexus Creative Networking MVP.
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

// =========================================
// TalentHub – Global API & Auth Utilities
// =========================================

const API_BASE = 'http://localhost:5000/api';

// --- Token management ---
const getToken = () => localStorage.getItem('th_token');
const getUser  = () => { try { return JSON.parse(localStorage.getItem('th_user')); } catch { return null; } };
const setAuth  = (token, user) => { localStorage.setItem('th_token', token); localStorage.setItem('th_user', JSON.stringify(user)); };
const clearAuth = () => { localStorage.removeItem('th_token'); localStorage.removeItem('th_user'); };
const isLoggedIn = () => !!getToken();

// --- Redirect guards ---
const requireAuth = (role) => {
  const token = getToken();
  const user = getUser();
  if (!token || !user) { window.location.href = '/login.html'; return false; }
  if (role && user.role !== role) {
    alert('Access denied. You do not have permission to view this page.');
    window.location.href = '/login.html';
    return false;
  }
  return true;
};

const redirectIfLoggedIn = () => {
  const user = getUser();
  if (user) {
    if (user.role === 'student') window.location.href = '/student/dashboard.html';
    else if (user.role === 'company') window.location.href = '/company/dashboard.html';
    else if (user.role === 'admin')   window.location.href = '/admin/dashboard.html';
  }
};

// --- API helper ---
const api = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) { clearAuth(); window.location.href = '/login.html'; }
    throw { status: res.status, message: data.message || 'An error occurred', errors: data.errors };
  }
  return data;
};

// --- Logout ---
const logout = () => { clearAuth(); window.location.href = '/login.html'; };

// --- Toast notifications ---
const showToast = (message, type = 'success') => {
  const existing = document.querySelector('.th-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `th-toast th-toast-${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i> ${message}`;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '24px', right: '24px', padding: '14px 20px',
    borderRadius: '10px', color: '#fff', fontSize: '0.875rem', fontWeight: '600',
    zIndex: '9999', boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideIn 0.3s ease',
    background: type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db',
  });
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
};

// --- Show/hide loading ---
const showLoading = () => { const s = document.getElementById('spinner'); if (s) s.style.display = 'flex'; };
const hideLoading = () => { const s = document.getElementById('spinner'); if (s) s.style.display = 'none'; };

// --- Render sidebar user info ---
const renderSidebarUser = () => {
  const user = getUser();
  if (!user) return;
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-avatar');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
};

// --- Status badge helper ---
const statusBadge = (status) => {
  const map = {
    'Applied':              'info',
    'Under Review':         'warning',
    'Shortlisted':          'primary',
    'Interview Scheduled':  'purple',
    'Interview Completed':  'info',
    'Selected':             'success',
    'Rejected':             'danger',
    'Offer Issued':         'purple',
    'Offer Accepted':       'success',
    'Offer Declined':       'danger',
    'Withdrawn':            'warning',
    'Scheduled':            'info',
    'Completed':            'success',
    'Cancelled':            'danger',
    'Passed':               'success',
    'Failed':               'danger',
    'Pending':              'warning',
    'Issued':               'purple',
    'Accepted':             'success',
    'Declined':             'danger',
    'Active':               'success',
    'Closed':               'danger',
    'Draft':                'warning',
  };
  const cls = map[status] || 'primary';
  return `<span class="badge badge-${cls}">${status}</span>`;
};

// --- Safe array parse (handles JSON strings from SQLite) ---
const parseArr = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
};

// --- Format date ---
const formatDate = (d) => { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };
const formatDateTime = (d) => { if (!d) return '—'; return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
const formatCTC = (ctc) => { if (!ctc) return '—'; if (ctc >= 100000) return `₹${(ctc/100000).toFixed(1)} LPA`; return `₹${ctc.toLocaleString()}`; };

// --- Modal helpers ---
const openModal  = (id) => { const m = document.getElementById(id); if (m) m.classList.add('active'); };
const closeModal = (id) => { const m = document.getElementById(id); if (m) m.classList.remove('active'); };

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('active');
});

// --- Simple table search ---
const initTableSearch = (inputId, tableId) => {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    table.querySelectorAll('tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
};

// Add toast CSS
const style = document.createElement('style');
style.textContent = `@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
document.head.appendChild(style);

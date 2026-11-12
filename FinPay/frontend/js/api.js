// FinPay API Helper
const API_BASE = window.location.origin.includes('8000') 
  ? window.location.origin 
  : 'http://127.0.0.1:8000';

function getToken() {
  return localStorage.getItem('finpay_token');
}

function setToken(token) {
  localStorage.setItem('finpay_token', token);
}

function getUser() {
  const u = localStorage.getItem('finpay_user');
  return u ? JSON.parse(u) : null;
}

function setUser(user) {
  localStorage.setItem('finpay_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('finpay_token');
  localStorage.removeItem('finpay_user');
  // Detect relative redirect back to login
  if (window.location.pathname.includes('/student/') || 
      window.location.pathname.includes('/merchant/') || 
      window.location.pathname.includes('/admin/')) {
    window.location.href = '../login.html';
  } else {
    window.location.href = 'login.html';
  }
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    logout();
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data && data.detail ? data.detail : `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

function requireAuth(allowedRoles = []) {
  const token = getToken();
  const user = getUser();
  const inSubdir = window.location.pathname.includes('/student/') || 
                   window.location.pathname.includes('/merchant/') || 
                   window.location.pathname.includes('/admin/');
  const loginPath = inSubdir ? '../login.html' : 'login.html';

  if (!token || !user) {
    window.location.href = loginPath;
    return false;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    alert(`Access denied for role: ${user.role}`);
    window.location.href = loginPath;
    return false;
  }

  return true;
}

function generateIdempotencyKey() {
  return 'idemp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}

function formatRupees(amount) {
  if (amount === undefined || amount === null) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

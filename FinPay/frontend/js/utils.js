// Common UI Utilities
function initSidebarUser() {
  const user = getUser();
  const nameEl = document.getElementById('user-display-name');
  const roleEl = document.getElementById('user-display-role');

  if (user) {
    if (nameEl) nameEl.textContent = user.name || 'User';
    if (roleEl) {
      if (user.role === 'student') {
        const tier = user.membership_tier || 'BASIC';
        roleEl.innerHTML = `Student &bull; <span class="badge badge-${tier.toLowerCase()}">${tier}</span>`;
      } else {
        roleEl.textContent = user.role.toUpperCase();
      }
    }
  }
}

function renderTierBadge(tier) {
  const t = (tier || 'BASIC').toUpperCase();
  const cls = t === 'PREMIUM' ? 'badge-premium' : (t === 'PRIME' ? 'badge-prime' : 'badge-basic');
  return `<span class="badge ${cls}">${t}</span>`;
}

function renderStatusBadge(status) {
  const s = (status || 'SUCCESS').toUpperCase();
  const cls = s === 'SUCCESS' ? 'badge-success' : 'badge-danger';
  return `<span class="badge ${cls}">${s}</span>`;
}

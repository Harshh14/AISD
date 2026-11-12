// FinPay Auth Forms Handler
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const alertBox = document.getElementById('alert-box');

  function showAlert(msg, type = 'danger') {
    if (!alertBox) return;
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = msg;
    alertBox.style.display = 'block';
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.style.display = 'none';
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        const data = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        setToken(data.access_token);
        setUser({
          name: data.name,
          email: data.email,
          role: data.role,
          membership_tier: data.membership_tier
        });

        // Redirect based on role
        if (data.role === 'admin') {
          window.location.href = 'admin/dashboard.html';
        } else if (data.role === 'merchant') {
          window.location.href = 'merchant/dashboard.html';
        } else {
          window.location.href = 'student/dashboard.html';
        }
      } catch (err) {
        showAlert(err.message, 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }

  // Handle Student Registration
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        });

        showAlert('Registration successful! Redirecting to login...', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      } catch (err) {
        showAlert(err.message, 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register Student Account';
      }
    });
  }
});

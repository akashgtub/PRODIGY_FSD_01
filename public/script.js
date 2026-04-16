document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authMessage = document.getElementById('auth-message');
    const dashboardMessage = document.getElementById('dashboard-message');
    const logoutBtn = document.getElementById('logout-btn');

    // API URL
    const API_URL = 'http://localhost:5000';

    // Check if user is already logged in
    const checkAuthStatus = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await fetch(`${API_URL}/dashboard`, {
                    headers: {
                        'Authorization': token
                    }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    showDashboard(data);
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
            }
        }
    };

    checkAuthStatus();

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active-form'));
            
            // Add active class to clicked tab and corresponding form
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}-form`).classList.add('active-form');
            
            // Clear any messages
            hideMessage();
        });
    });

    // Helper: Show Message
    const showMessage = (msg, type) => {
        authMessage.textContent = typeof msg === 'object' ? JSON.stringify(msg) : msg;
        authMessage.className = `message show ${type}`;
    };

    // Helper: Hide Message
    const hideMessage = () => {
        authMessage.className = 'message';
    };

    // Show Dashboard
    const showDashboard = (msg) => {
        authSection.classList.remove('active-section');
        authSection.classList.add('hidden-section');
        
        setTimeout(() => {
            dashboardSection.classList.remove('hidden-section');
            dashboardSection.classList.add('active-section');
            dashboardMessage.textContent = typeof msg === 'object' ? JSON.stringify(msg) : msg;
        }, 300);
    };

    // Show Auth Form
    const showAuth = () => {
        dashboardSection.classList.remove('active-section');
        dashboardSection.classList.add('hidden-section');
        
        setTimeout(() => {
            authSection.classList.remove('hidden-section');
            authSection.classList.add('active-section');
            hideMessage();
            loginForm.reset();
            registerForm.reset();
        }, 300);
    };

    // Login Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerHTML;
        
        try {
            btn.innerHTML = 'Signing in...';
            btn.disabled = true;
            
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('token', data.token);
                // Fetch dashboard
                const dashRes = await fetch(`${API_URL}/dashboard`, {
                    headers: { 'Authorization': data.token }
                });
                const dashData = await dashRes.json();
                showDashboard(dashData);
            } else {
                showMessage(data, 'error');
            }
        } catch (err) {
            showMessage('Connection error. Is the server running?', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // Register Submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const btn = registerForm.querySelector('button');
        const originalText = btn.innerHTML;
        
        try {
            btn.innerHTML = 'Creating account...';
            btn.disabled = true;
            
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                showMessage('Registration successful! Please login.', 'success');
                // Switch to login tab
                setTimeout(() => {
                    document.querySelector('[data-tab="login"]').click();
                    document.getElementById('login-email').value = email;
                    document.getElementById('login-password').focus();
                }, 1500);
            } else {
                showMessage(data, 'error');
            }
        } catch (err) {
            showMessage('Connection error. Is the server running?', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        showAuth();
    });
});

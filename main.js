// Jeff Gilbert - Home Maintenance Professional - Main JavaScript

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Check login status on page load
    checkLoginStatus();
});

// Local Storage Keys
const STORAGE_KEYS = {
    USER: 'jg_current_user',
    USERS: 'jg_users',
    INVOICES: 'jg_invoices',
    BOOKINGS: 'jg_bookings'
};

// Initialize demo data if not exists
function initializeDemoData() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const demoUsers = [
            {
                id: 1,
                email: 'demo@example.com',
                password: 'demo123',
                name: 'Demo User',
                phone: '555-0123'
            }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
    }

    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
        const demoInvoices = [
            {
                id: 1001,
                userId: 1,
                service: 'Power Washing - Driveway',
                amount: 250.00,
                date: '2025-10-15',
                status: 'paid'
            },
            {
                id: 1002,
                userId: 1,
                service: 'Furniture Assembly',
                amount: 150.00,
                date: '2025-10-28',
                status: 'pending'
            }
        ];
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(demoInvoices));
    }
}

// Authentication Functions
function login(email, password) {
    initializeDemoData();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const userSession = {
            id: user.id,
            email: user.email,
            name: user.name
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userSession));
        return { success: true, user: userSession };
    }
    
    return { success: false, message: 'Invalid email or password' };
}

function register(name, email, password, phone) {
    initializeDemoData();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    const newUser = {
        id: users.length + 1,
        email,
        password,
        name,
        phone
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    const userSession = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userSession));
    
    return { success: true, user: userSession };
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.location.href = '../index.html';
}

function getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
}

function checkLoginStatus() {
    const user = getCurrentUser();
    const loginBtn = document.querySelector('.btn-login');
    
    if (loginBtn) {
        if (user) {
            loginBtn.textContent = 'My Account';
            loginBtn.href = './pages/portal.html';
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.href = './pages/portal.html';
        }
    }
}

// Booking Form Handler
function handleBookingSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        service: form.service.value,
        date: form.date.value,
        time: form.time.value,
        message: form.message.value,
        timestamp: new Date().toISOString()
    };
    
    // Save booking
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    bookings.push(formData);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    
    // Show success message
    showAlert('success', 'Booking request submitted successfully! We will contact you soon.');
    form.reset();
}

// Login Form Handler
function handleLoginSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    
    const result = login(email, password);
    
    if (result.success) {
        showAlert('success', 'Login successful! Redirecting...');
        setTimeout(() => {
            loadDashboard();
        }, 1000);
    } else {
        showAlert('error', result.message);
    }
}

// Register Form Handler
function handleRegisterSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const phone = form.phone.value;
    
    if (password !== confirmPassword) {
        showAlert('error', 'Passwords do not match');
        return;
    }
    
    const result = register(name, email, password, phone);
    
    if (result.success) {
        showAlert('success', 'Registration successful! Loading your account...');
        setTimeout(() => {
            loadDashboard();
        }, 1000);
    } else {
        showAlert('error', result.message);
    }
}

// Load Dashboard
function loadDashboard() {
    const user = getCurrentUser();
    
    if (!user) {
        return;
    }
    
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    
    if (loginSection) loginSection.classList.add('hidden');
    if (dashboardSection) dashboardSection.classList.remove('hidden');
    
    // Update user name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    // Load invoices
    loadInvoices(user.id);
}

// Load Invoices
function loadInvoices(userId) {
    initializeDemoData();
    const invoices = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
    const userInvoices = invoices.filter(inv => inv.userId === userId);
    
    const invoicesList = document.getElementById('invoicesList');
    if (!invoicesList) return;
    
    if (userInvoices.length === 0) {
        invoicesList.innerHTML = '<p>No invoices found.</p>';
        return;
    }
    
    invoicesList.innerHTML = userInvoices.map(invoice => `
        <div class="invoice-card">
            <div class="invoice-info">
                <h4>Invoice #${invoice.id}</h4>
                <p><strong>Service:</strong> ${invoice.service}</p>
                <p><strong>Amount:</strong> $${invoice.amount.toFixed(2)}</p>
                <p><strong>Date:</strong> ${invoice.date}</p>
                <span class="invoice-status status-${invoice.status}">
                    ${invoice.status.toUpperCase()}
                </span>
            </div>
            ${invoice.status === 'pending' ? `
                <button class="btn btn-pay" onclick="payInvoice(${invoice.id})">
                    Pay Now
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Pay Invoice
function payInvoice(invoiceId) {
    const invoices = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
    const invoice = invoices.find(inv => inv.id === invoiceId);
    
    if (invoice) {
        invoice.status = 'paid';
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
        
        showAlert('success', `Payment of $${invoice.amount.toFixed(2)} processed successfully!`);
        
        const user = getCurrentUser();
        if (user) {
            loadInvoices(user.id);
        }
    }
}

// Show/Hide Forms
function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

function showLoginForm() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

// Alert Function
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} show`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Set minimum date for booking (today)
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
});

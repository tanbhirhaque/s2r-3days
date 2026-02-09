// ============================================
// SUPABASE CONFIGURATION
// ============================================
const SUPABASE_URL = 'https://nfttnqlixtpjlelspvhl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdHRucWxpeHRwamxlbHNwdmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzY5MTgsImV4cCI6MjA4NjExMjkxOH0.WSkmjDU3gmVVyZwPH--CQvNmB54JodQDWVQ--fqwRYk';

let supabase = null;

// Load Supabase CDN
function loadSupabaseCDN() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Initialize Supabase client
function initSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn("Supabase credentials not configured");
        document.getElementById('supabase-warning').style.display = 'block';
        return false;
    }

    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase initialized successfully");
    return true;
}

// ============================================
// VALIDATION HELPERS
// ============================================
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
}

// ============================================
// FORM VALIDATION
// ============================================
// Store enrollment data temporarily
let enrollmentData = {};

function validateForm(formData) {
    let isValid = true;
    clearAllErrors();

    // Full Name
    if (!formData.full_name || formData.full_name.trim().length < 2) {
        showError('full_name', 'Please enter your full name');
        isValid = false;
    }

    // Email
    if (!formData.email || !validateEmail(formData.email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }

    // WhatsApp Number
    if (!formData.whatsapp_number || !validatePhone(formData.whatsapp_number)) {
        showError('whatsapp_number', 'Please enter a valid WhatsApp number (at least 10 digits)');
        isValid = false;
    }

    // Enrollment Package
    if (!formData.enrollment_package) {
        showError('enrollment_package', 'Please select an enrollment package');
        isValid = false;
    }

    return isValid;
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(`error-${fieldId}`);
    const inputElement = document.getElementById(fieldId);

    if (errorElement) {
        errorElement.textContent = message;
    }
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearError(fieldId) {
    const errorElement = document.getElementById(`error-${fieldId}`);
    const inputElement = document.getElementById(fieldId);

    if (errorElement) {
        errorElement.textContent = '';
    }
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');

    const inputElements = document.querySelectorAll('.error');
    inputElements.forEach(el => el.classList.remove('error'));
}

// ============================================
// ENROLLMENT FORM SUBMISSION (STEP 1)
// ============================================
async function handleSubmit(event) {
    event.preventDefault();

    // Check for honeypot (spam protection)
    if (document.getElementById('website').value) {
        console.log("Spam detected");
        return;
    }

    // Get form data
    const form = event.target;
    const packageSelect = form.enrollment_package;
    const selectedOption = packageSelect.options[packageSelect.selectedIndex];
    const packagePrice = parseInt(selectedOption.getAttribute('data-price'));

    enrollmentData = {
        full_name: form.full_name.value.trim(),
        email: form.email.value.trim().toLowerCase(),
        whatsapp_number: form.whatsapp_number.value.trim(),
        enrollment_package: form.enrollment_package.value,
        package_price: packagePrice,
        source_page: window.location.href,
        user_agent: navigator.userAgent,
        status: 'payment_pending'
    };

    // Validate form
    if (!validateForm(enrollmentData)) {
        return;
    }

    // Show payment modal
    showPaymentModal(enrollmentData);
}

// ============================================
// PAYMENT MODAL
// ============================================
function showPaymentModal(data) {
    const modal = document.getElementById('payment-modal');
    const packageNameEl = document.getElementById('selected-package-name');
    const packagePriceEl = document.getElementById('selected-package-price');

    // Set package info
    const packageNames = {
        '3_days_workshop': '3 Days Workshop',
        '3_days_with_support': '3 Days Workshop + 6 Month Support'
    };

    packageNameEl.textContent = packageNames[data.enrollment_package] || data.enrollment_package;
    packagePriceEl.textContent = `BDT ${data.package_price.toLocaleString()}/=`;

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';

    // Clear transaction ID field
    document.getElementById('transaction_id').value = '';
    clearError('transaction_id');
}

// ============================================
// PAYMENT FORM SUBMISSION (STEP 2)
// ============================================
async function handlePaymentSubmit(event) {
    event.preventDefault();

    const bkashNumber = document.getElementById('bkash_number').value.trim();
    const transactionId = document.getElementById('transaction_id').value.trim();

    // Validate bKash number
    if (!bkashNumber || !validatePhone(bkashNumber)) {
        showError('bkash_number', 'Please enter a valid bKash number');
        return;
    }

    // Validate transaction ID
    if (!transactionId || transactionId.length < 5) {
        showError('transaction_id', 'Please enter a valid transaction ID');
        return;
    }

    // Add payment info to enrollment data
    enrollmentData.payment_method = 'bKash';
    enrollmentData.payer_bkash_number = bkashNumber;
    enrollmentData.payment_transaction_id = transactionId;
    enrollmentData.payment_submitted_at = new Date().toISOString();
    enrollmentData.status = 'payment_submitted';

    // Show loading state
    const submitButton = document.getElementById('payment-submit-button');
    const buttonText = document.getElementById('payment-button-text');
    const buttonLoader = document.getElementById('payment-button-loader');

    submitButton.disabled = true;
    buttonText.style.display = 'none';
    buttonLoader.style.display = 'inline-block';

    try {
        // Submit to Supabase
        if (!supabase) {
            throw new Error("Supabase not initialized");
        }

        const { data, error } = await supabase
            .from('enrollments')
            .insert([enrollmentData]);

        if (error) {
            throw error;
        }

        console.log("Enrollment submitted successfully:", data);

        // Close payment modal
        closePaymentModal();

        // Hide form and show success message
        document.getElementById('enrollment-form').style.display = 'none';
        document.getElementById('success-message').style.display = 'block';

        // Scroll to success message
        document.getElementById('success-message').scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error("Error submitting enrollment:", error);

        let errorMessage = 'Failed to submit enrollment. Please try again.';

        if (error.message.includes('duplicate') || error.code === '23505') {
            if (error.message.includes('email')) {
                errorMessage = 'This email is already enrolled. Please use a different email.';
            } else if (error.message.includes('transaction')) {
                errorMessage = 'This transaction ID has already been used. Please check your transaction ID.';
            }
        }

        alert(errorMessage + (error.message ? '\n\nError: ' + error.message : ''));

    } finally {
        // Reset button state
        submitButton.disabled = false;
        buttonText.style.display = 'inline';
        buttonLoader.style.display = 'none';
    }
}

// ============================================
// RESET FORM
// ============================================
function resetForm() {
    document.getElementById('enrollment-form').reset();
    document.getElementById('enrollment-form').style.display = 'block';
    document.getElementById('success-message').style.display = 'none';
    clearAllErrors();
    enrollmentData = {};
}

// ============================================
// SMOOTH SCROLLING
// ============================================
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ============================================
// REAL-TIME VALIDATION (clear errors on input)
// ============================================
function setupRealTimeValidation() {
    const fields = ['full_name', 'email', 'whatsapp_number', 'enrollment_package'];

    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => clearError(fieldId));
            field.addEventListener('change', () => clearError(fieldId));
        }
    });

    // Also setup for payment form fields
    const bkashField = document.getElementById('bkash_number');
    if (bkashField) {
        bkashField.addEventListener('input', () => clearError('bkash_number'));
    }

    const transactionField = document.getElementById('transaction_id');
    if (transactionField) {
        transactionField.addEventListener('input', () => clearError('transaction_id'));
    }
}

// ============================================
// INITIALIZATION ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', async function () {
    console.log("Page loaded, initializing...");

    // Load Supabase CDN
    try {
        await loadSupabaseCDN();
        initSupabase();
    } catch (error) {
        console.error("Failed to load Supabase:", error);
        document.getElementById('supabase-warning').style.display = 'block';
    }

    // Setup enrollment form submission
    const enrollmentForm = document.getElementById('enrollment-form');
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', handleSubmit);
    }

    // Setup payment form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }

    // Setup real-time validation
    setupRealTimeValidation();

    // Setup smooth scrolling
    setupSmoothScroll();

    // Setup scroll animations
    setupScrollAnimations();

    console.log("Initialization complete");
});

// ============================================
// SCROLL ANIMATIONS
// ============================================
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.card, .timeline-item, .faq-item');
    animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// CONTACT MODAL
// ============================================
function openContactModal() {
    const modal = document.getElementById('contact-modal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ============================================
// COLLAPSIBLE SECTIONS (ACCORDION)
// ============================================
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const button = document.getElementById(sectionId.replace('-section', '-btn'));
    const buttonText = button.querySelector('span:first-child');
    const icon = button.querySelector('.toggle-icon');

    if (section.style.display === 'none') {
        section.style.display = 'grid';
        buttonText.textContent = 'Hide Details';
        icon.textContent = '−';
        button.classList.add('expanded');
    } else {
        section.style.display = 'none';
        buttonText.textContent = 'Show Details';
        icon.textContent = '+';
        button.classList.remove('expanded');
    }
}

// Keep toggleCard for FAQ section
function toggleCard(card) {
    card.classList.toggle('expanded');
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });
});


// ============================================
// TOGGLE LEARN CARDS FUNCTIONALITY
// ============================================
function toggleLearnCards() {
    const hiddenCards = document.querySelectorAll('.hidden-card');
    const toggleBtn = document.getElementById('toggle-learn-btn');
    const enrollCta = document.getElementById('enroll-cta-learn');

    // Check if cards are currently hidden
    const isHidden = hiddenCards[0].style.display === 'none' || hiddenCards[0].style.display === '';

    if (isHidden) {
        // Show all cards
        hiddenCards.forEach(card => {
            card.style.display = 'block';
        });

        // Update button text
        toggleBtn.textContent = 'Show Less';

        // Show Enroll Now button
        enrollCta.style.display = 'inline-block';
    } else {
        // Hide cards
        hiddenCards.forEach(card => {
            card.style.display = 'none';
        });

        // Update button text
        toggleBtn.textContent = 'See All Modules';

        // Hide Enroll Now button
        enrollCta.style.display = 'none';
    }
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mainNav = document.getElementById('main-nav');

if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', function () {
        this.classList.toggle('active');
        mainNav.classList.toggle('active');
    });

    // Close menu when clicking nav links
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            mobileMenuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        }
    });
}

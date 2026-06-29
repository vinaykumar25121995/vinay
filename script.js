document.addEventListener('DOMContentLoaded', () => {
    // Current Year for Footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navList = document.querySelector('.nav-list');

    mobileToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navList.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile nav when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Active Navigation Link on Scroll
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
        
        // Header styling on scroll
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.style.padding = '0.5rem 0';
            header.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        } else {
            header.style.padding = '1rem 0';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    });
});

// Lightbox functionality
function openLightbox(element) {
    const lightbox = document.getElementById('lightbox');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    // Get data from clicked element
    const title = element.getAttribute('data-title');
    
    // Set content
    lightboxCaption.textContent = title;
    
    // Display lightbox
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close lightbox on outside click or ESC key
document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this) {
        closeLightbox();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('lightbox').classList.contains('active')) {
        closeLightbox();
    }
    if (e.key === 'Escape' && document.getElementById('passcode-modal').style.display === 'flex') {
        closePasscodeModal();
    }
});

// Passcode Modal Logic
let targetDocUrl = '';

function requestPasscode(url) {
    targetDocUrl = url;
    document.getElementById('passcode-modal').style.display = 'flex';
    document.getElementById('doc-passcode').value = '';
    document.getElementById('passcode-error').style.display = 'none';
    document.getElementById('doc-passcode').focus();
}

function closePasscodeModal() {
    document.getElementById('passcode-modal').style.display = 'none';
    targetDocUrl = '';
}

function submitPasscode() {
    const code = document.getElementById('doc-passcode').value;
    if (code === 'Vinay01@') {
        window.location.href = targetDocUrl;
        closePasscodeModal();
    } else {
        document.getElementById('passcode-error').style.display = 'block';
    }
}

// Allow pressing Enter to submit passcode
document.getElementById('doc-passcode').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitPasscode();
    }
});

// Handle Contact Form Submission
function handleContactSubmit(event) {
    event.preventDefault();
    
    const myForm = event.target;
    const formData = new FormData(myForm);
    
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString()
    })
    .then(() => {
        // Hide form and show beautiful success UI
        document.getElementById('contact-form-element').style.display = 'none';
        document.getElementById('contact-success').style.display = 'flex';
    })
    .catch((error) => alert("There was an error sending the message: " + error));
}

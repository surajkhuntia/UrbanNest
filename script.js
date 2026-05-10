document.addEventListener('DOMContentLoaded', () => {
    // Determine API Base URL for local vs Vercel
    const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? (window.location.port === '5000' || window.location.port === '3000' ? '' : 'http://localhost:5000') 
        : (window.location.protocol === 'file:' ? 'http://localhost:5000' : '');

    // 1. Sticky Navigation
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's just '#'
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Offset for fixed navbar
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, revealOptions);
    
    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 4. Animated Counters (Benefits Section)
    const counters = document.querySelectorAll('.counter');
    let hasCounted = false;
    
    const counterObserver = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasCounted) {
            hasCounted = true;
            
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps
                
                let currentCount = 0;
                
                const updateCounter = () => {
                    currentCount += increment;
                    if (currentCount < target) {
                        counter.innerText = Math.ceil(currentCount);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };
                
                updateCounter();
            });
        }
    }, { threshold: 0.5 });
    
    const benefitsSection = document.getElementById('benefits');
    if (benefitsSection) {
        counterObserver.observe(benefitsSection);
    }

    // 5. FAQ Accordion
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            
            // Close other open items
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.maxHeight = null;
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // 6. Mobile Menu Toggle (Basic implementation)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            // Note: For a production app, you'd want a proper slide-out menu or dropdown.
            // This is a simple toggle for demonstration.
            const isExpanded = navLinks.style.display === 'flex';
            
            if (isExpanded) {
                navLinks.style.display = 'none';
                navActions.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'white';
                navLinks.style.padding = '1rem';
                navLinks.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                
                navActions.style.display = 'flex';
                navActions.style.flexDirection = 'column';
                navActions.style.position = 'absolute';
                navActions.style.top = 'calc(100% + 200px)'; // rough estimate
                navActions.style.left = '0';
                navActions.style.width = '100%';
                navActions.style.background = 'white';
                navActions.style.padding = '1rem';
            }
        });
    }

    // 7. 3D Tilt Effect Initialization
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".problem-card, .sol-card, .feature-card, .uc-card, .price-card, .testimo-card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.15,
            scale: 1.05
        });
        
        VanillaTilt.init(document.querySelectorAll(".gallery-item img, .hero-image-container"), {
            max: 10,
            speed: 300,
            scale: 1.02
        });
    }
    // 8. Scroll Progress Bar
    const scrollProgress = document.getElementById('scrollProgress');
    
    // 9. Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        // Progress Bar Logic
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        
        if (scrollProgress) {
            scrollProgress.style.width = scrollPercentage + '%';
        }
        
        // Back to Top Logic
        if (scrollTop > 300) {
            if (backToTopBtn) backToTopBtn.classList.add('visible');
        } else {
            if (backToTopBtn) backToTopBtn.classList.remove('visible');
        }
    });
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 10. Form Submission to Backend Database
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            try {
                const response = await fetch(`${API_BASE_URL}/api/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });
                
                const responseText = await response.text();
                try {
                    const data = JSON.parse(responseText);
                    if (response.ok) {
                        alert('Thanks for your message! We will get back to you soon.');
                        contactForm.reset();
                    } else {
                        alert('Error: ' + (data.error || 'Something went wrong'));
                    }
                } catch(e) {
                    console.error("Non-JSON response from server:", responseText);
                    alert(`Server Error (${response.status}): Please check Vercel Function logs. MongoDB Atlas IP Allowlist might need to be set to 0.0.0.0/0`);
                }
            } catch (err) {
                console.error(err);
                alert(`Network Error: ${err.message}. Failed to connect to the server.`);
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            
            const email = document.getElementById('newsletterEmail').value;

            try {
                const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const responseText = await response.text();
                try {
                    const data = JSON.parse(responseText);
                    if (response.ok) {
                        alert('Thanks for subscribing!');
                        newsletterForm.reset();
                    } else {
                        alert(data.error || 'Something went wrong');
                    }
                } catch(e) {
                    console.error("Non-JSON response from server:", responseText);
                    alert(`Server Error (${response.status}): Please check Vercel Function logs. MongoDB Atlas IP Allowlist might need to be set to 0.0.0.0/0`);
                }
            } catch (err) {
                console.error(err);
                alert(`Network Error: ${err.message}. Failed to connect to the server.`);
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // 11. Auth Modal Logic
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');
    const modalTabs = document.querySelectorAll('.modal-tab');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const registerFormContainer = document.getElementById('registerFormContainer');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Resident Dashboard Elements
    const dashboardSection = document.getElementById('dashboard');
    const navDashboard = document.getElementById('navDashboard');
    const dashboardUserName = document.getElementById('dashboardUserName');

    const showDashboard = async (user) => {
        if(loginBtn) loginBtn.style.display = 'none';
        if(logoutBtn) logoutBtn.style.display = 'inline-flex';
        if(navDashboard) navDashboard.style.display = 'inline-flex';
        if(dashboardSection) dashboardSection.style.display = 'block';
        if (dashboardUserName && user.name) {
            dashboardUserName.innerText = user.name.split(' ')[0];
        }

        // Fetch Dashboard Data
        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard?email=${encodeURIComponent(user.email)}`);
            const data = await response.json();
            if (response.ok) {
                // Update Project Tracker
                const statusText = document.getElementById('projectStatusText');
                const progressBar = document.getElementById('projectProgressBar');
                const note = document.getElementById('projectNote');
                const milestones = document.querySelectorAll('.milestone');
                
                if (data.project) {
                    if(statusText) statusText.innerText = data.project.status;
                    if(progressBar) progressBar.style.width = data.project.progress_percent + '%';
                    if(note) note.innerHTML = `<i class="ph-fill ph-info"></i> ${data.project.note || 'Project tracking active.'}`;
                    
                    let activeIndex = 0;
                    if (data.project.progress_percent >= 25) activeIndex = 0;
                    if (data.project.progress_percent >= 50) activeIndex = 1;
                    if (data.project.progress_percent >= 75) activeIndex = 2;
                    if (data.project.progress_percent >= 100) activeIndex = 3;
                    
                    milestones.forEach((m, idx) => {
                        m.className = 'milestone';
                        if (idx < activeIndex) m.classList.add('completed');
                        if (idx === activeIndex) m.classList.add('active');
                    });
                } else {
                    if(statusText) statusText.innerText = "No Project Started";
                    if(progressBar) progressBar.style.width = '0%';
                    if(note) note.innerHTML = `<i class="ph-fill ph-info"></i> Save a configuration to start your project.`;
                    
                    milestones.forEach((m) => {
                        m.className = 'milestone';
                    });
                }
                
                // Update Saved Configs
                const grid = document.getElementById('savedConfigsGrid');
                if (grid) {
                    Array.from(grid.children).forEach(child => {
                        if (child.id !== 'btnNewConfig') child.remove();
                    });
                    
                    const btnNewConfig = document.getElementById('btnNewConfig');
                    
                    data.configs.forEach(config => {
                        const dateStr = new Date(config.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                        const cardHTML = `
                            <div class="saved-card glass-card">
                                <img src="${config.image_url}" alt="${config.name}">
                                <div class="saved-card-content">
                                    <h4>${config.name}</h4>
                                    <p class="saved-date">Saved on: ${dateStr}</p>
                                    <button class="btn btn-outline btn-full mt-4" onclick="alert('Opening 3D viewer for ${config.name}...')">View 3D Plan</button>
                                </div>
                            </div>
                        `;
                        btnNewConfig.insertAdjacentHTML('beforebegin', cardHTML);
                    });
                }
            }
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        }
    };

    const hideDashboard = () => {
        if(loginBtn) loginBtn.style.display = 'inline-flex';
        if(logoutBtn) logoutBtn.style.display = 'none';
        if(navDashboard) navDashboard.style.display = 'none';
        if(dashboardSection) dashboardSection.style.display = 'none';
    };

    // Check if user is already logged in (simple client-side check)
    const currentUserStr = localStorage.getItem('urbanNestUser');
    if (currentUserStr) {
        try {
            showDashboard(JSON.parse(currentUserStr));
        } catch(e) {
            console.error('Invalid user data', e);
        }
    }

    // Open Modal
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.classList.add('active');
        });
    }

    // Close Modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            authModal.classList.remove('active');
        });
    }

    // Close on overlay click
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.classList.remove('active');
            }
        });
    }

    // Tab Switching
    modalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modalTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const target = tab.getAttribute('data-tab');
            if (target === 'login') {
                loginFormContainer.style.display = 'block';
                registerFormContainer.style.display = 'none';
            } else {
                loginFormContainer.style.display = 'none';
                registerFormContainer.style.display = 'block';
            }
        });
    });

    // Login Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Logging in...';
            submitBtn.disabled = true;

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch(`${API_BASE_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const responseText = await response.text();
                try {
                    const data = JSON.parse(responseText);
                    if (response.ok) {
                        alert('Login successful! Welcome back, ' + data.user.name);
                        localStorage.setItem('urbanNestUser', JSON.stringify(data.user));
                        authModal.classList.remove('active');
                        showDashboard(data.user);
                        if(dashboardSection) dashboardSection.scrollIntoView({ behavior: 'smooth' });
                        loginForm.reset();
                    } else {
                        alert('Error: ' + (data.error || 'Invalid credentials'));
                    }
                } catch(e) {
                    console.error("Non-JSON response from server:", responseText);
                    alert(`Server Error (${response.status}): Please check Vercel Function logs. MongoDB Atlas IP Allowlist might need to be set to 0.0.0.0/0`);
                }
            } catch (err) {
                console.error(err);
                alert(`Network Error: ${err.message}. Failed to connect to the server.`);
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Register Submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Creating...';
            submitBtn.disabled = true;

            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            try {
                const response = await fetch(`${API_BASE_URL}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                const responseText = await response.text();
                try {
                    const data = JSON.parse(responseText);
                    if (response.ok) {
                        alert('Registration successful! You can now log in.');
                        // Switch to login tab
                        modalTabs[0].click();
                        document.getElementById('loginEmail').value = email;
                        registerForm.reset();
                    } else {
                        alert('Error: ' + (data.error || 'Registration failed'));
                    }
                } catch(e) {
                    console.error("Non-JSON response from server:", responseText);
                    alert(`Server Error (${response.status}): Please check Vercel Function logs. MongoDB Atlas IP Allowlist might need to be set to 0.0.0.0/0`);
                }
            } catch (err) {
                console.error(err);
                alert(`Network Error: ${err.message}. Failed to connect to the server.`);
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Logout Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('urbanNestUser');
            hideDashboard();
            alert('You have been logged out.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Quick Actions & Dashboard Interactivity
    const btnDocuments = document.getElementById('btnDocuments');
    if (btnDocuments) {
        btnDocuments.addEventListener('click', () => alert('Your documents are securely stored. A link to download your floor plans and permits will be emailed to you shortly.'));
    }

    const btnUpgrades = document.getElementById('btnUpgrades');
    if (btnUpgrades) {
        btnUpgrades.addEventListener('click', () => alert('Upgrade options are currently locked while your module framework is in assembly. Contact support for emergency changes.'));
    }

    const btnSchedule = document.getElementById('btnSchedule');
    if (btnSchedule) {
        btnSchedule.addEventListener('click', () => alert('The site survey is scheduled for next month. You will receive an SMS reminder 24 hours prior.'));
    }

    const btnSupport = document.getElementById('btnSupport');
    if (btnSupport) {
        btnSupport.addEventListener('click', () => {
            const userStr = localStorage.getItem('urbanNestUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                document.getElementById('name').value = user.name;
                document.getElementById('email').value = user.email;
                document.getElementById('message').value = "Support Request regarding my Urban Nest project:";
            }
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        });
    }

    const btnNewConfig = document.getElementById('btnNewConfig');
    if (btnNewConfig) {
        btnNewConfig.addEventListener('click', async () => {
            const userStr = localStorage.getItem('urbanNestUser');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const configName = prompt("Enter a name for your new configuration:");
            if (configName && configName.trim() !== "") {
                btnNewConfig.querySelector('p').innerText = 'Saving...';
                try {
                    const response = await fetch(`${API_BASE_URL}/api/configs`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.email, name: configName })
                    });
                    if (response.ok) {
                        alert('Configuration saved successfully!');
                        // Refresh dashboard
                        showDashboard(user);
                    } else {
                        alert('Failed to save configuration.');
                    }
                } catch (err) {
                    console.error(err);
                    alert('Error connecting to server.');
                } finally {
                    btnNewConfig.querySelector('p').innerText = 'Start New Config';
                }
            }
        });
    }
});

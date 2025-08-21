import type { APIRoute } from 'astro';
import { sessions } from './verify-purchase';

export const GET: APIRoute = async ({ request, url, clientAddress }) => {
  try {
    const searchParams = url.searchParams;
    const sessionId = searchParams.get('session');

    if (!sessionId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Also check for session cookie
    const cookieHeader = request.headers.get('cookie');
    const sessionFromCookie = cookieHeader?.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    // Session must match both URL parameter and cookie
    if (sessionFromCookie !== sessionId) {
      return new Response('Unauthorized - Session mismatch', { status: 401 });
    }

    // Verify session
    const sessionData = sessions.get(sessionId);
    
    if (!sessionData || Date.now() > sessionData.expiresAt) {
      if (sessionData) {
        sessions.delete(sessionId); // Clean up expired session
      }
      return new Response('Session expired', { status: 401 });
    }

    // Verify browser fingerprint
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const currentFingerprint = Buffer.from(`${userAgent}:${acceptLanguage}:${acceptEncoding}`).toString('base64');

    if (currentFingerprint !== sessionData.browserFingerprint) {
      sessions.delete(sessionId); // Delete session on fingerprint mismatch
      return new Response('Unauthorized - Browser mismatch', { status: 401 });
    }

    // Generate secure access page for digital content
    const digitalContentHtml = generateDigitalContentPage(sessionData, sessionId);

    return new Response(digitalContentHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });

  } catch (error) {
    console.error('Error serving digital content:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

function generateDigitalContentPage(sessionData: any, sessionId: string): string {
  const { theme, organization, kitType } = sessionData;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Content - ${theme}</title>
  <meta name="robots" content="noindex, nofollow">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    .skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
    }
    .skip-link:focus {
      top: 6px;
    }
    .hero-banner {
      background: linear-gradient(rgba(4, 16, 88, 0.7), rgba(4, 16, 88, 0.7)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"><rect fill="%23f8f9fa" width="1200" height="400"/><text x="600" y="200" text-anchor="middle" fill="%236c757d" font-size="24" font-family="Arial">Hero Banner Image Placeholder</text></svg>');
      background-size: cover;
      background-position: center;
      min-height: 400px;
    }
    .custom-tabs {
      background-color: #f1f1f1;
      border: none;
      padding: 0;
      margin: 0;
      list-style: none;
      display: flex;
      width: 100vw;
      position: relative;
      left: 50%;
      right: 50%;
      margin-left: -50vw;
      margin-right: -50vw;
    }
    .tab-nav-container {
      width: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .tab-nav-container .container {
      padding: 0;
      max-width: 100%;
    }
    .tab-nav-container nav {
      width: 100%;
    }
    .custom-tab {
      background-color: #f1f1f1;
      color: #000;
      text-decoration: none;
      padding: 20px 30px;
      border: none;
      border-bottom: 3px solid transparent;
      font-weight: normal;
      transition: all 0.2s ease;
      display: block;
      position: relative;
    }
    .custom-tab:hover {
      color: #000;
      text-decoration: none;
      background-color: #f1f1f1;
    }
    .custom-tab.active {
      font-weight: bold;
      border-bottom: 3px solid #000;
      background-color: #f1f1f1;
    }
    .tab-content-section {
      display: block;
      padding: 50px 0;
      min-height: 500px;
      margin-bottom: 100px;
      scroll-margin-top: 80px;
    }
    .tab-content-section:last-child {
      margin-bottom: 50px;
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <!-- Hero Banner -->
  <section class="hero-banner d-flex align-items-center text-white">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <h1 class="display-2 fw-bold mb-3">Digital Content</h1>
          <h2 class="h3 mb-3">Kit: ${theme}</h2>
          <p class="lead">Purchased by: <strong>${organization}</strong></p>
          <p class="lead">Kit Type: <strong>${kitType === 'build' ? 'Build-your-own Kit' : 'Ready-made Kit'}</strong></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Tab Navigation - Full Width -->
  <div class="tab-nav-container">
    <div class="container">
      <nav>
        <ul class="custom-tabs">
          <li>
            <a href="#instructions" class="custom-tab active">
              Instructions
            </a>
          </li>
          <li>
            <a href="#elements" class="custom-tab">
              Elements
            </a>
          </li>
          <li>
            <a href="#layout" class="custom-tab">
              Room Layout
            </a>
          </li>
          <li>
            <a href="#leaderboard" class="custom-tab">
              Leaderboard
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <main id="main-content" role="main">
    <div class="container py-5">
      <!-- Tab Content -->
      <div class="row">
        <div class="col-12">
          <div class="tab-content-wrapper">
            <!-- Instructions Tab -->
            <section id="instructions" class="tab-content-section active">
              <div class="row">
                <div class="col-lg-8">
                  <h3>Setup Instructions</h3>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                  
                  <h4>Video Guide</h4>
                  <div class="bg-light p-4 rounded mb-4">
                    <p class="mb-2 fw-medium">[Video Player Placeholder]</p>
                    <small class="text-muted">Content Type: MP4 Video with Captions</small>
                  </div>

                  <h4>Step-by-Step Guide</h4>
                  <ol>
                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                    <li>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
                    <li>Ut enim ad minim veniam, quis nostrud exercitation ullamco.</li>
                    <li>Duis aute irure dolor in reprehenderit in voluptate velit esse.</li>
                  </ol>
                </div>
                <div class="col-lg-4">
                  <h4>Audio Descriptions</h4>
                  <div class="bg-light p-3 rounded">
                    <p class="mb-2 fw-medium">[Audio Player Placeholder]</p>
                    <small class="text-muted">Content Type: MP3 Audio</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Elements Tab -->
            <section id="elements" class="tab-content-section">
              <h3>Interactive Elements</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation.</p>
              
              <div class="row g-4">
                <div class="col-md-4">
                  <div class="card">
                    <div class="card-body text-center">
                      <h5 class="card-title">Puzzle Element 1</h5>
                      <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      <button class="btn btn-primary" disabled>Launch Element</button>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card">
                    <div class="card-body text-center">
                      <h5 class="card-title">Puzzle Element 2</h5>
                      <p class="card-text">Sed do eiusmod tempor incididunt ut labore et dolore.</p>
                      <button class="btn btn-primary" disabled>Launch Element</button>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card">
                    <div class="card-body text-center">
                      <h5 class="card-title">Final Challenge</h5>
                      <p class="card-text">Ut enim ad minim veniam, quis nostrud exercitation.</p>
                      <button class="btn btn-success" disabled>Launch Challenge</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Room Layout Tab -->
            <section id="layout" class="tab-content-section">
              <h3>Room Layout & Setup</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              
              <div class="row">
                <div class="col-lg-8">
                  <div class="bg-light p-4 rounded mb-4">
                    <p class="mb-2 fw-medium text-center">[Room Layout Diagram Placeholder]</p>
                    <small class="text-muted d-block text-center">Interactive room layout would appear here</small>
                  </div>
                  
                  <h4>Setup Requirements</h4>
                  <ul>
                    <li>Lorem ipsum dolor sit amet - minimum 10x10 feet</li>
                    <li>Consectetur adipiscing elit - adequate lighting</li>
                    <li>Sed do eiusmod tempor - 4-6 participants recommended</li>
                    <li>Incididunt ut labore - tables and chairs for setup</li>
                  </ul>
                </div>
                <div class="col-lg-4">
                  <h4>Downloads</h4>
                  <div class="list-group">
                    <a href="#" class="list-group-item list-group-item-action disabled">
                      Floor Plan PDF
                    </a>
                    <a href="#" class="list-group-item list-group-item-action disabled">
                      Setup Checklist
                    </a>
                    <a href="#" class="list-group-item list-group-item-action disabled">
                      Materials List
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Leaderboard Tab -->
            <section id="leaderboard" class="tab-content-section">
              <h3>Leaderboard & Results</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Track your team's progress and compare with others.</p>
              
              <div class="row">
                <div class="col-lg-8">
                  <h4>Current Rankings</h4>
                  <div class="table-responsive">
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Team Name</th>
                          <th>Completion Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>Lorem Ipsum Team</td>
                          <td>24:35</td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>Consectetur Elit</td>
                          <td>27:12</td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>Sed Do Eiusmod</td>
                          <td>31:48</td>
                        </tr>
                        <tr>
                          <td>4</td>
                          <td>Tempor Incididunt</td>
                          <td>35:22</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="col-lg-4">
                  <h4>Your Stats</h4>
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Team Progress</h5>
                      <p class="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      <ul class="list-unstyled">
                        <li><strong>Best Time:</strong> Not yet completed</li>
                        <li><strong>Attempts:</strong> 0</li>
                        <li><strong>Current Rank:</strong> Unranked</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    // Flag to disable scroll updates during jumps
    let isJumping = false;
    
    function updateActiveTab() {
      // Don't update during jump animations
      if (isJumping) return;
      
      const sections = document.querySelectorAll('.tab-content-section');
      const tabs = document.querySelectorAll('.custom-tab');
      const tabBarHeight = document.querySelector('.tab-nav-container').offsetHeight;
      let activeSection = 'instructions'; // default
      let closestSection = null;
      let closestDistance = Infinity;
      
      // Check which section is currently in view or closest to view
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionBottom = rect.bottom;
        const triggerPoint = tabBarHeight + 100;
        
        // Section is active if it's in the main viewport area
        if (sectionTop <= triggerPoint && sectionBottom > triggerPoint) {
          activeSection = section.id;
        } else {
          // Find the closest section if none are in the trigger zone
          const distanceFromTrigger = Math.abs(sectionTop - triggerPoint);
          if (distanceFromTrigger < closestDistance) {
            closestDistance = distanceFromTrigger;
            closestSection = section.id;
          }
        }
      });
      
      // If no section is in the trigger zone, use the closest one
      if (activeSection === 'instructions' && closestSection && closestDistance < 300) {
        activeSection = closestSection;
      }
      
      // Special case: if we're near the bottom of the page, make leaderboard active
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop + windowHeight >= documentHeight - 200) {
        activeSection = 'leaderboard';
      }
      
      // Update tab styles - remove active from all first
      tabs.forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Add active to the current section's tab
      tabs.forEach(tab => {
        const href = tab.getAttribute('href');
        if (href === '#' + activeSection) {
          tab.classList.add('active');
        }
      });
    }
    
    // Throttle scroll events for better performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(updateActiveTab, 10);
    });
    
    // Update on tab click
    document.querySelectorAll('.custom-tab').forEach(tab => {
      tab.addEventListener('click', function(e) {
        // Set jumping flag to prevent scroll updates during jump
        isJumping = true;
        
        // Remove active from all tabs immediately
        document.querySelectorAll('.custom-tab').forEach(t => t.classList.remove('active'));
        // Add active to clicked tab
        this.classList.add('active');
        
        // Re-enable scroll updates after jump animation completes
        setTimeout(() => {
          isJumping = false;
          updateActiveTab(); // Final check after jump
        }, 800); // Give enough time for smooth scroll to complete
      });
    });
    
    // Initialize on page load
    window.addEventListener('load', updateActiveTab);
    document.addEventListener('DOMContentLoaded', updateActiveTab);
    
    // Call immediately
    updateActiveTab();
  </script>
</body>
</html>`;
}

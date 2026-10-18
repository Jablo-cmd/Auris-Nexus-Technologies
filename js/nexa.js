(function () {
  'use strict';

  const Nexa = {
    init() {
      this.createWidget();
      this.bindEvents();
      this.showWelcome();
    },

    createWidget() {
      const widget = document.createElement('div');

      widget.id = 'nexa-widget';

      widget.innerHTML = `
        <button
          class="nexa-launcher"
          id="nexa-launcher"
          aria-label="Open Nexa assistant"
          aria-expanded="false"
        >
          <span class="nexa-orb" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 01-4.6 7.5 8.5 8.5 0 01-8.7-.4L3 20l1.5-4.5a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 0117-.2z"></path><circle cx="8.5" cy="11.5" r="1"></circle><circle cx="12" cy="11.5" r="1"></circle><circle cx="15.5" cy="11.5" r="1"></circle></svg>
          </span>
          <span class="nexa-launcher-text">Nexa</span>
        </button>

        <section
          class="nexa-panel"
          id="nexa-panel"
          aria-label="Nexa assistant"
          aria-hidden="true"
        >
          <header class="nexa-header">
            <div class="nexa-brand">
              <div class="nexa-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 01-4.6 7.5 8.5 8.5 0 01-8.7-.4L3 20l1.5-4.5a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 0117-.2z"></path><circle cx="8.5" cy="11.5" r="1"></circle><circle cx="12" cy="11.5" r="1"></circle><circle cx="15.5" cy="11.5" r="1"></circle></svg>
              </div>

              <div>
                <strong>Nexa</strong>
                <small>Auris Nexus assistant</small>
              </div>
            </div>

            <button
              class="nexa-close"
              id="nexa-close"
              aria-label="Close Nexa"
            >
              ×
            </button>
          </header>

          <div class="nexa-status">
            <span></span>
            Online
          </div>

          <div
            class="nexa-messages"
            id="nexa-messages"
            aria-live="polite"
          ></div>

          <div class="nexa-suggestions" id="nexa-suggestions">
            <button data-question="Explore your services">
              Explore our solutions
            </button>

            <button data-question="I need custom software">
              Custom software
            </button>

            <button data-question="I want to automate my business">
              Business automation
            </button>

            <button data-question="I need an AI solution">
              AI solutions
            </button>
          </div>

          <form class="nexa-input-area" id="nexa-form">
            <input
              id="nexa-input"
              type="text"
              placeholder="Ask Nexa anything..."
              autocomplete="off"
              maxlength="500"
            />

            <button
              type="submit"
              aria-label="Send message"
            >
              ↑
            </button>
          </form>

          <div class="nexa-footer">
            Powered by Auris Nexus Technologies
          </div>
        </section>
      `;

      document.body.appendChild(widget);
    },

    bindEvents() {
      const launcher = document.getElementById('nexa-launcher');
      const close = document.getElementById('nexa-close');
      const form = document.getElementById('nexa-form');
      const input = document.getElementById('nexa-input');

      launcher.addEventListener('click', () => this.toggle(true));
      close.addEventListener('click', () => this.toggle(false));

      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        const panel = document.getElementById('nexa-panel');
        if (panel && panel.classList.contains('is-open')) {
          this.toggle(false);
          launcher.focus();
        }
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();

        const message = input.value.trim();

        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';

        this.respond(message);
      });

      document
        .getElementById('nexa-suggestions')
        .addEventListener('click', (event) => {
          const button = event.target.closest('[data-question]');

          if (!button) return;

          const question = button.dataset.question;

          this.addMessage(question, 'user');
          this.respond(question);
        });
    },

    toggle(open) {
      const panel = document.getElementById('nexa-panel');
      const launcher = document.getElementById('nexa-launcher');

      panel.classList.toggle('is-open', open);
      launcher.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));

      if (open) {
        setTimeout(() => {
          document.getElementById('nexa-input')?.focus();
        }, 250);
      }
    },

    showWelcome() {
      this.addMessage(
        "Hello. I'm Nexa, the Auris Nexus Technologies assistant. Ask me about our services, prices, how a project works or how to reach the team.",
        'nexa'
      );
    },

    addMessage(text, sender, links = []) {
      const container = document.getElementById('nexa-messages');

      const message = document.createElement('div');

      message.className = `nexa-message nexa-message--${sender}`;

      message.textContent = text;

      if (links.length) {
        const row = document.createElement('div');
        row.className = 'nexa-links';

        links.forEach(([label, href]) => {
          const link = document.createElement('a');
          link.href = href;
          link.textContent = label;

          if (/^https?:/.test(href)) {
            link.target = '_blank';
            link.rel = 'noopener';
          }

          row.appendChild(link);
        });

        message.appendChild(row);
      }

      container.appendChild(message);

      container.scrollTop = container.scrollHeight;
    },

    // Each topic: words that point to it, the reply, and links to the page that
    // answers it in full. Every fact here is taken from the site's own pages.
    topics: [
      {
        words: ['hi', 'hello', 'hey', 'howzit', 'sawubona', 'molo', 'dumela', 'good morning', 'good afternoon'],
        reply: "Hi there. Tell me what you're trying to improve, automate or build, or ask about our services, prices or how a project works.",
        links: [['Our services', '/services.html']]
      },
      {
        words: ['services', 'solutions', 'what do you do', 'what do you guys do', 'what does auris do', 'what do you offer', 'offer', 'explore'],
        reply: 'We help South African businesses with five things: technology consulting, custom software development, business automation, digital transformation and AI integration. We also build websites, web apps and mobile apps. Most work starts with a free consultation.',
        links: [['All services', '/services.html'], ['Free consultation', '/contact.html']]
      },
      {
        words: ['price', 'prices', 'pricing', 'cost', 'costs', 'how much', 'quote', 'budget', 'rand', 'expensive', 'cheap', 'affordable'],
        reply: 'Starting prices in rand: professional websites from R12,500, business systems (CRM, HR and leave, bookings, workflow automation) from R30,000, and custom platforms, including mobile apps, from R50,000. These are starting points; after a short conversation you get a written scope and a fixed quote.',
        links: [['See pricing', '/pricing.html'], ['Get a quote', '/contact.html']]
      },
      {
        words: ['contact', 'phone', 'call', 'number', 'your email', 'email address', 'whatsapp', 'speak', 'talk to', 'human', 'person', 'someone'],
        reply: 'You can reach the team on 063 122 6552 (call or WhatsApp) or info@aurisnexus.co.za. We aim to reply within one business day, Monday to Friday.',
        links: [['WhatsApp us', 'https://wa.me/27631226552'], ['Contact form', '/contact.html']]
      },
      {
        words: ['where', 'address', 'location', 'located', 'office', 'sandton', 'sandown', 'johannesburg', 'joburg', 'jozi', 'gauteng', 'visit'],
        reply: 'Our office is at 140 Linden Street, Sandown, Sandton, Gauteng 2196, South Africa. We work with businesses across South Africa.',
        links: [['Directions and contact', '/contact.html']]
      },
      {
        words: ['hours', 'open', 'opening', 'weekend', 'saturday', 'sunday', 'when are you'],
        reply: 'We work Monday to Friday, 08:00 to 17:00. Send a message any time and we aim to reply within one business day.',
        links: [['Contact us', '/contact.html']]
      },
      {
        words: ['consultation', 'consult', 'free', 'meeting', 'appointment', 'book'],
        reply: "The first consultation is free and there's no obligation. It's a short conversation about the problem, how the work happens today and what success would look like. If there's a fit, you get a written scope and fixed quote; if you don't need new technology, we'll say so.",
        links: [['Book a free consultation', '/contact.html']]
      },
      {
        words: ['consulting', 'consultant', 'advice', 'roadmap', 'strategy', 'not sure', 'where to start', 'it consulting'],
        reply: "Technology consulting is for when you know something needs fixing but not what to build. We map how the work really happens, assess your current systems and spreadsheets, compare build, buy or configure options, and give you a phased roadmap with scope and budget ranges.",
        links: [['Technology consulting', '/technology-consulting.html']]
      },
      {
        words: ['automation', 'automate', 'automating', 'workflow', 'workflows', 'manual', 'repetitive', 'approvals', 'invoices', 'data entry'],
        reply: 'We automate approvals, notifications, data entry, invoices and hand-offs between systems, so your team stops retyping the same information. We start by finding the processes where automation saves the most time.',
        links: [['Business automation', '/business-automation.html']]
      },
      {
        words: ['ai', 'artificial intelligence', 'chatbot', 'chatgpt', 'machine learning', 'assistant', 'llm'],
        reply: 'We build practical AI into real workflows: AI assistants that answer from your own policies and documents, document processing for forms, contracts and invoices, AI-assisted drafting and triage, and decision support with a person making the final call.',
        links: [['AI integration', '/ai-integration.html']]
      },
      {
        words: ['crm', 'customers', 'clients', 'sales', 'leads', 'hr', 'leave', 'leave management'],
        reply: 'We build CRM, HR and leave management, booking, inventory and membership systems. For example, we delivered the CIT Leave Management System, which replaced email and spreadsheet leave requests.',
        links: [['Business systems', '/crm-business-management-systems.html'], ['CIT case study', '/case-studies/cit-leave-management-system.html']]
      },
      {
        words: ['spreadsheet', 'spreadsheets', 'excel'],
        reply: "When a critical process runs on spreadsheets and email, we replace it with a proper system that keeps the data in one place, controls who can change what, and produces the reports automatically.",
        links: [['Read: stop running critical processes on spreadsheets', '/insights/why-south-african-businesses-should-stop-running-critical-processes-on-spreadsheets.html']]
      },
      {
        words: ['website', 'websites', 'web', 'site', 'web design', 'landing page', 'seo', 'redesign'],
        reply: 'We design and build business websites that are fast, mobile-friendly and built to bring in enquiries, from R12,500 for up to 10 pages including WhatsApp integration, Google Maps, analytics, basic SEO and 30 days of support after launch.',
        links: [['Web design', '/web-design.html'], ['Web development', '/web-development.html']]
      },
      {
        words: ['app', 'apps', 'mobile', 'android', 'ios', 'iphone'],
        reply: "We build Android and iOS apps for customers and field teams, usually as the mobile side of a system you already have, so the app and your office work from the same data. Mobile apps fall under custom platforms, from R50,000.",
        links: [['Mobile app development', '/mobile-app-development.html']]
      },
      {
        words: ['report', 'reports', 'reporting', 'dashboard', 'dashboards', 'data', 'analytics', 'bi', 'business intelligence'],
        reply: 'We connect the data scattered across your CRM, finance system and spreadsheets, agree the numbers that matter, and build dashboards and reports that update themselves.',
        links: [['Business intelligence', '/data-analytics-business-intelligence.html']]
      },
      {
        words: ['school', 'schools', 'school management', 'school system', 'education', 'learners', 'students', 'lms', 'college', 'teachers'],
        reply: 'We build school management systems, LMS and school apps for South African schools and colleges: admissions, fees, learner records and parent portals. Funda360 is our school management platform.',
        links: [['Education', '/education.html'], ['Funda360 case study', '/case-studies/funda360-school-management-platform.html']]
      },
      {
        words: ['logistics', 'fleet', 'transport', 'courier', 'drivers', 'trucks', 'deliveries', 'distribution'],
        reply: 'We build logistics and fleet management software for transport, courier and distribution operators: jobs, scheduling, fleet, drivers, incidents and reporting. LOGIOS OS is our logistics platform, in active development.',
        links: [['Logistics software', '/logistics.html'], ['LOGIOS case study', '/case-studies/logios-logistics-operations-platform.html']]
      },
      {
        words: ['healthcare', 'clinic', 'clinics', 'practice', 'medical', 'doctor', 'patients'],
        reply: "We build administration software for practices, clinics and care providers: bookings, patient admin, rostering, compliance and reporting. We don't build clinical software.",
        links: [['Healthcare', '/healthcare.html']]
      },
      {
        words: ['software', 'system', 'systems', 'platform', 'custom', 'bespoke', 'build', 'develop', 'development'],
        reply: 'We build custom business software around how your organisation actually works: internal platforms, management systems, client portals and integrations between the tools you already use. Business systems start from R30,000.',
        links: [['Custom business software', '/crm-business-management-systems.html']]
      },
      {
        words: ['popia', 'privacy', 'security', 'secure', 'safe', 'compliance', 'gdpr'],
        reply: "Solutions are designed with POPIA principles in mind, with secure development practices such as HTTPS, secure authentication and role-based access. How we handle your own information is set out in our privacy policy.",
        links: [['Privacy policy', '/privacy.html'], ['Read: POPIA checklist', '/insights/popia-checklist-business-software.html']]
      },
      {
        words: ['portfolio', 'case study', 'case studies', 'examples', 'previous work', 'projects', 'work you have done', 'references'],
        reply: 'Recent work includes Funda360 (school management), the CIT Leave Management System, LOGIOS OS (logistics), Sebetsa (workforce operations) and the Pro Energy Solutions website.',
        links: [['See our work', '/portfolio.html']]
      },
      {
        words: ['process', 'how does it work', 'how do you work', 'steps', 'how long', 'timeline', 'timeframe', 'deadline'],
        reply: "We reply within one business day, then hold a free consultation. If there's a fit, you get a written scope and a fixed quote in rand. Timelines depend on scope, so we set them out once the work is scoped.",
        links: [['Start a project', '/contact.html']]
      },
      {
        words: ['support', 'maintenance', 'maintain', 'after launch', 'updates', 'hosting', 'cloud', 'server'],
        reply: 'We provide maintenance, support plans and ongoing improvements after launch. Hosting and cloud are part of how we build and deploy your project rather than separate products we sell.',
        links: [['Talk to us about support', '/contact.html']]
      },
      {
        words: ['who are you', 'about', 'company', 'auris', 'nexus', 'founded', 'team'],
        reply: 'Auris Nexus Technologies (Pty) Ltd is a Sandton-based technology company that starts with the business problem, then designs, builds and supports the technology that solves it.',
        links: [['About us', '/about.html']]
      },
      {
        words: ['bot', 'robot', 'real person', 'are you human', 'are you ai'],
        reply: "I'm an automated assistant with set answers about Auris Nexus. For anything specific to your business, the team will answer you directly.",
        links: [['WhatsApp the team', 'https://wa.me/27631226552']]
      },
      {
        words: ['thanks', 'thank you', 'cheers', 'great', 'awesome', 'perfect'],
        reply: "You're welcome. When you're ready, the quickest next step is a free consultation.",
        links: [['Contact us', '/contact.html']]
      }
    ],

    // Pick the topic with the most matching words; a phrase counts once per
    // word, so "where to start" outweighs "where". Whole words only, so "ai"
    // does not match "email" or "maintain".
    match(message) {
      const text = ` ${message.toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `;
      let best = null;
      let bestScore = 0;

      this.topics.forEach((topic) => {
        const score = topic.words
          .filter((word) => text.includes(` ${word} `))
          .reduce((sum, word) => sum + word.split(' ').length, 0);

        if (score > bestScore) {
          best = topic;
          bestScore = score;
        }
      });

      return best;
    },

    respond(message) {
      setTimeout(() => {
        const topic = this.match(message);

        if (topic) {
          this.addMessage(topic.reply, 'nexa', topic.links);
        } else {
          this.addMessage(
            "I don't have a set answer for that one, but the team can help directly. You can also ask me about our services, prices, how a project works, or our work for schools, logistics and healthcare.",
            'nexa',
            [['WhatsApp the team', 'https://wa.me/27631226552'], ['Contact form', '/contact.html']]
          );
        }
      }, 600);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Nexa.init();
  });
})();
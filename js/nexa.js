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
          aria-label="Open Nexa AI Assistant"
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
          aria-label="Nexa AI Assistant"
          aria-hidden="true"
        >
          <header class="nexa-header">
            <div class="nexa-brand">
              <div class="nexa-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 01-4.6 7.5 8.5 8.5 0 01-8.7-.4L3 20l1.5-4.5a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 0117-.2z"></path><circle cx="8.5" cy="11.5" r="1"></circle><circle cx="12" cy="11.5" r="1"></circle><circle cx="15.5" cy="11.5" r="1"></circle></svg>
              </div>

              <div>
                <strong>Nexa</strong>
                <small>Auris Nexus AI</small>
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
        "Hello. I'm Nexa — Auris Nexus Technologies' intelligent assistant. I can help you explore our technology solutions and find the right direction for your organisation.",
        'nexa'
      );
    },

    addMessage(text, sender) {
      const container = document.getElementById('nexa-messages');

      const message = document.createElement('div');

      message.className = `nexa-message nexa-message--${sender}`;

      message.textContent = text;

      container.appendChild(message);

      container.scrollTop = container.scrollHeight;
    },

    respond(message) {
      const lower = message.toLowerCase();

      setTimeout(() => {
        let response;

        if (
          lower.includes('software') ||
          lower.includes('system')
        ) {
          response =
            "Auris Nexus builds custom business software around your organisation's actual workflows. We can help with internal platforms, management systems, automation and integrations.";
        } else if (
          lower.includes('automation') ||
          lower.includes('automate')
        ) {
          response =
            "We can identify repetitive processes and design automation around them — reducing manual work, improving consistency and giving your team more time to focus on higher-value work.";
        } else if (lower.includes('ai')) {
          response =
            "Auris Nexus helps organisations apply AI practically — from intelligent assistants and workflow automation to AI-powered business systems and integrations.";
        } else if (
          lower.includes('website') ||
          lower.includes('web')
        ) {
          response =
            "We design and develop modern, responsive websites focused on credibility, performance, user experience and business conversion.";
        } else if (
          lower.includes('cloud') ||
          lower.includes('hosting')
        ) {
          response =
            "Cloud, hosting and infrastructure aren't standalone services we sell — they're part of how we build and deploy the software and business systems your project needs.";
        } else {
          response =
            "I can help you explore Auris Nexus services, identify a suitable technology solution, or connect you with our team. What are you trying to achieve?";
        }

        this.addMessage(response, 'nexa');
      }, 600);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Nexa.init();
  });
})();
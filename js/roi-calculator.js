/* ============================================================
   AURIS NEXUS — ROI CALCULATOR
   Dependency-free ROI / Automation Opportunity Calculator
   ============================================================ */

(function () {
  'use strict';

  function initROICalculator() {
    const calculator = document.querySelector('[data-roi-calculator]');
    if (!calculator) return;

    const employeesInput = calculator.querySelector('#roi-employees');
    const hoursInput = calculator.querySelector('#roi-hours');
    const hourlyCostInput = calculator.querySelector('#roi-hourly-cost');
    const automationInput = calculator.querySelector('#roi-automation');
    const investmentInput = calculator.querySelector('#roi-investment');

    const automationValue = calculator.querySelector('#roi-automation-value');

    const annualCostOutput = calculator.querySelector('#roi-annual-cost');
    const annualSavingsOutput = calculator.querySelector('#roi-annual-savings');
    const monthlySavingsOutput = calculator.querySelector('#roi-monthly-savings');
    const threeYearValueOutput = calculator.querySelector('#roi-three-year');
    const paybackOutput = calculator.querySelector('#roi-payback');
    const roiOutput = calculator.querySelector('#roi-percentage');

    const calculateButton = calculator.querySelector('#roi-calculate');
    const resetButton = calculator.querySelector('#roi-reset');

    const results = calculator.querySelector('[data-roi-results]');
    const errorMessage = calculator.querySelector('[data-roi-error]');

    if (
      !employeesInput ||
      !hoursInput ||
      !hourlyCostInput ||
      !automationInput
    ) {
      console.warn('Auris ROI Calculator: Required fields missing.');
      return;
    }

    function formatCurrency(value) {
      if (!Number.isFinite(value)) return 'R0';

      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0
      }).format(value);
    }

    function formatNumber(value) {
      return new Intl.NumberFormat('en-ZA', {
        maximumFractionDigits: 0
      }).format(value);
    }

    function getNumber(input) {
      return Number.parseFloat(input.value) || 0;
    }

    function calculate() {
      clearError();

      const employees = getNumber(employeesInput);
      const hoursPerWeek = getNumber(hoursInput);
      const hourlyCost = getNumber(hourlyCostInput);
      const automationPercentage = getNumber(automationInput);

      /*
       * Optional implementation investment.
       *
       * If the user leaves it blank, we use a conservative
       * planning estimate based on the potential annual savings.
       */
      let investment = getNumber(investmentInput);

      if (employees <= 0) {
        showError('Please enter the number of employees.');
        employeesInput.focus();
        return;
      }

      if (hoursPerWeek <= 0) {
        showError('Please enter the weekly manual-work hours.');
        hoursInput.focus();
        return;
      }

      if (hourlyCost <= 0) {
        showError('Please enter an estimated hourly employee cost.');
        hourlyCostInput.focus();
        return;
      }

      if (automationPercentage <= 0) {
        showError('Please select an estimated automation percentage.');
        automationInput.focus();
        return;
      }

      /*
       * 52 weeks per year.
       */
      const weeksPerYear = 52;

      /*
       * Current annual cost of manual work.
       */
      const annualManualCost =
        employees *
        hoursPerWeek *
        hourlyCost *
        weeksPerYear;

      /*
       * Potential annual savings.
       */
      const annualSavings =
        annualManualCost *
        (automationPercentage / 100);

      /*
       * Monthly savings.
       */
      const monthlySavings = annualSavings / 12;

      /*
       * Three-year potential value.
       */
      const threeYearValue = annualSavings * 3;

      /*
       * If no implementation cost was entered,
       * estimate an illustrative project investment.
       *
       * This is deliberately presented as an estimate,
       * not a quote.
       */
      if (investment <= 0) {
        investment = Math.max(25000, annualSavings * 0.35);
      }

      /*
       * Payback period.
       */
      const paybackMonths =
        monthlySavings > 0
          ? investment / monthlySavings
          : 0;

      /*
       * ROI.
       */
      const roi =
        investment > 0
          ? ((annualSavings - investment) / investment) * 100
          : 0;

      /*
       * Display results.
       */
      annualCostOutput.textContent =
        formatCurrency(annualManualCost);

      annualSavingsOutput.textContent =
        formatCurrency(annualSavings);

      monthlySavingsOutput.textContent =
        formatCurrency(monthlySavings);

      threeYearValueOutput.textContent =
        formatCurrency(threeYearValue);

      if (paybackMonths < 1) {
        paybackOutput.textContent = 'Under 1 month';
      } else if (paybackMonths > 120) {
        paybackOutput.textContent = '10+ years';
      } else {
        paybackOutput.textContent =
          paybackMonths.toFixed(1) + ' months';
      }

      roiOutput.textContent =
        formatNumber(Math.round(roi)) + '%';

      /*
       * Reveal results.
       */
      if (results) {
        results.hidden = false;

        results.classList.remove('roi-results--animate');

        /*
         * Restart animation.
         */
        void results.offsetWidth;

        results.classList.add('roi-results--animate');

        results.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }

    function reset() {
      employeesInput.value = '';
      hoursInput.value = '';
      hourlyCostInput.value = '';
      automationInput.value = '25';

      if (investmentInput) {
        investmentInput.value = '';
      }

      if (automationValue) {
        automationValue.textContent = '25%';
      }

      if (results) {
        results.hidden = true;
      }

      clearError();

      employeesInput.focus();
    }

    function showError(message) {
      if (!errorMessage) return;

      errorMessage.textContent = message;
      errorMessage.hidden = false;
    }

    function clearError() {
      if (!errorMessage) return;

      errorMessage.textContent = '';
      errorMessage.hidden = true;
    }

    /*
     * Automation slider.
     */
    automationInput.addEventListener('input', function () {
      if (automationValue) {
        automationValue.textContent =
          automationInput.value + '%';
      }
    });

    /*
     * Calculate.
     */
    if (calculateButton) {
      calculateButton.addEventListener('click', calculate);
    }

    /*
     * Reset.
     */
    if (resetButton) {
      resetButton.addEventListener('click', reset);
    }

    /*
     * Enter key support.
     */
    calculator.addEventListener('keydown', function (event) {
      if (
        event.key === 'Enter' &&
        event.target.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        calculate();
      }
    });
  }

  /*
   * Initialise after DOM is ready.
   */
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initROICalculator
    );
  } else {
    initROICalculator();
  }
})();
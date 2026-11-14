/**
 * ============================================================================
 * PUMO TECHNOVATION - STUDENT DEMO REGISTRATION PORTAL
 * Application Script: script.js
 * Technology: Pure Vanilla JavaScript (ES6+) - Zero external dependencies
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Configuration & Constants
  // --------------------------------------------------------------------------
  const CONFIG = {
    // Active Google Apps Script Web App Deployment URL (Verified & Live)
    DEFAULT_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby6Hnbdf1kPgIhLFt2MgEzmRGm9-nLcUlxn6NwFSs6_cHIvC7DabpEBRQIspFazwTsO/exec',

    // Google Spreadsheet ID for direct admin inspection
    SPREADSHEET_ID: '1jBZ1tbLNVroOzcTTXbcRRBVk1G1hrQXJklHlig3nmbk',

    // Retrieves active Web App URL (stored in localStorage if customized by admin)
    getScriptUrl() {
      const stored = localStorage.getItem('pumo_custom_script_url');
      // If stored URL points to the old blocked 401 deployment, automatically clear it
      if (stored && stored.includes('AKfycbzbCTbfYJNvVnwcuBHe8_8waroJ-S4aHdkd3K7lxcEobEmUz9cwWMIYbGAjxaKuaza8Ig')) {
        localStorage.removeItem('pumo_custom_script_url');
        return this.DEFAULT_SCRIPT_URL;
      }
      return stored || this.DEFAULT_SCRIPT_URL;
    },

    setScriptUrl(url) {
      if (url && url.trim().startsWith('https://script.google.com')) {
        localStorage.setItem('pumo_custom_script_url', url.trim());
        return true;
      }
      return false;
    },

    resetScriptUrl() {
      localStorage.removeItem('pumo_custom_script_url');
    },

    // Direct link to the live Google Spreadsheet
    get SHEET_URL() {
      return `https://docs.google.com/spreadsheets/d/${this.SPREADSHEET_ID}/edit`;
    },

    // Minimum input validation lengths
    MIN_NAME_LENGTH: 3,
    MIN_COLLEGE_LENGTH: 2,
    PHONE_REGEX: /^[6-9]\d{9}$/, // Valid Indian 10-digit mobile starting with 6,7,8,9
    EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  };

  // --------------------------------------------------------------------------
  // 2. DOM Elements Cache
  // --------------------------------------------------------------------------
  const DOM = {
    // Form & Cards
    form: document.getElementById('studentRegistrationForm'),
    formCard: document.getElementById('formCard'),
    successView: document.getElementById('successView'),
    clearFormBtn: document.getElementById('clearFormBtn'),
    registerAnotherBtn: document.getElementById('registerAnotherBtn'),
    viewSheetBtn: document.getElementById('viewSheetBtn'),

    // Submit Button & Spinner
    submitBtn: document.getElementById('submitBtn'),
    submitSpinner: document.getElementById('submitSpinner'),
    btnText: document.querySelector('.btn-submit .btn-text'),
    btnArrow: document.querySelector('.btn-submit .btn-arrow'),

    // Alert Banner
    alertBanner: document.getElementById('systemAlertBanner'),
    alertTitle: document.getElementById('alertTitle'),
    alertMessage: document.getElementById('alertMessage'),
    alertIcon: document.getElementById('alertIcon'),
    closeAlertBtn: document.getElementById('closeAlertBtn'),

    // Input Fields
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    mobileNumber: document.getElementById('mobileNumber'),
    whatsappNumber: document.getElementById('whatsappNumber'),
    sameAsMobile: document.getElementById('sameAsMobile'),
    collegeName: document.getElementById('collegeName'),
    degree: document.getElementById('degree'),
    department: document.getElementById('department'),
    yearOfPassing: document.getElementById('yearOfPassing'),
    interestedCourse: document.getElementById('interestedCourse'),
    demoDate: document.getElementById('demoDate'),
    demoTime: document.getElementById('demoTime'),
    remarks: document.getElementById('remarks'),
    remarksCharCount: document.getElementById('remarksCharCount'),
    honeypot: document.getElementById('pumo_hp_field'),

    // Training Mode & Branch Selectors
    modeRadios: document.querySelectorAll('input[name="trainingMode"]'),
    branchRadios: document.querySelectorAll('input[name="branchLocation"]'),
    branchHelperText: document.getElementById('branchHelperText'),

    // Success Receipt Elements
    receiptStudentName: document.getElementById('receiptStudentName'),
    receiptRefId: document.getElementById('receiptRefId'),
    receiptCourse: document.getElementById('receiptCourse'),
    receiptDateTime: document.getElementById('receiptDateTime'),
    receiptMode: document.getElementById('receiptMode'),
    receiptBranch: document.getElementById('receiptBranch'),
    receiptMobile: document.getElementById('receiptMobile'),
    receiptAcademic: document.getElementById('receiptAcademic'),
    successHeading: document.getElementById('successHeading'),
    successDescription: document.getElementById('successDescription'),
    verificationDetailText: document.getElementById('verificationDetailText'),

    // Modal & Diagnostic Controls
    openApiModalBtn: document.getElementById('openApiModalBtn'),
    closeApiModalBtn: document.getElementById('closeApiModalBtn'),
    closeModalBottomBtn: document.getElementById('closeModalBottomBtn'),
    apiModalBackdrop: document.getElementById('apiModalBackdrop'),
    headerDiagIndicator: document.getElementById('headerDiagIndicator'),
    diagStatusBadge: document.getElementById('diagStatusBadge'),
    diagExplanation: document.getElementById('diagExplanation'),
    runDiagTestBtn: document.getElementById('runDiagTestBtn'),
    sendTestRowBtn: document.getElementById('sendTestRowBtn'),
    configApiUrl: document.getElementById('configApiUrl'),
    saveApiUrlBtn: document.getElementById('saveApiUrlBtn'),
    resetApiUrlBtn: document.getElementById('resetApiUrlBtn'),
    configSaveHint: document.getElementById('configSaveHint'),
    copyAppsScriptCodeBtn: document.getElementById('copyAppsScriptCodeBtn'),
    copyCodeBtnText: document.getElementById('copyCodeBtnText'),
    appsScriptCodeBlock: document.getElementById('appsScriptCodeBlock'),

    // Mobile Viewport Simulator Controls
    toggleMobileViewBtn: document.getElementById('toggleMobileViewBtn'),
    deviceToggleText: document.getElementById('deviceToggleText'),
    deviceToggleIcon: document.getElementById('deviceToggleIcon'),

    // Error Text Spans
    errors: {
      fullName: document.getElementById('fullNameError'),
      email: document.getElementById('emailError'),
      mobileNumber: document.getElementById('mobileNumberError'),
      whatsappNumber: document.getElementById('whatsappNumberError'),
      collegeName: document.getElementById('collegeNameError'),
      degree: document.getElementById('degreeError'),
      department: document.getElementById('departmentError'),
      yearOfPassing: document.getElementById('yearOfPassingError'),
      interestedCourse: document.getElementById('interestedCourseError'),
      demoDate: document.getElementById('demoDateError'),
      demoTime: document.getElementById('demoTimeError'),
      trainingMode: document.getElementById('trainingModeError'),
      branchLocation: document.getElementById('branchLocationError')
    }
  };

  // State Tracking
  let isSubmitting = false;

  // --------------------------------------------------------------------------
  // 3. Initialization
  // --------------------------------------------------------------------------
  function init() {
    setupMinDate();
    initModalControls();
    attachEventListeners();
    // Pre-populate configuration URL in modal
    if (DOM.configApiUrl) {
      DOM.configApiUrl.value = CONFIG.getScriptUrl();
    }
    // Perform initial passive endpoint probe
    runApiDiagnostics(false);
  }

  function setupMinDate() {
    if (!DOM.demoDate) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDateStr = `${yyyy}-${mm}-${dd}`;
    DOM.demoDate.min = minDateStr;
  }

  // --------------------------------------------------------------------------
  // 4. Modal & Diagnostic Handlers
  // --------------------------------------------------------------------------
  function initModalControls() {
    if (!DOM.openApiModalBtn || !DOM.apiModalBackdrop) return;

    DOM.openApiModalBtn.addEventListener('click', () => {
      DOM.configApiUrl.value = CONFIG.getScriptUrl();
      DOM.apiModalBackdrop.classList.remove('hidden');
      runApiDiagnostics(true);
    });

    if (DOM.closeApiModalBtn) {
      DOM.closeApiModalBtn.addEventListener('click', closeApiModal);
    }
    if (DOM.closeModalBottomBtn) {
      DOM.closeModalBottomBtn.addEventListener('click', closeApiModal);
    }

    DOM.apiModalBackdrop.addEventListener('click', (e) => {
      if (e.target === DOM.apiModalBackdrop) {
        closeApiModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !DOM.apiModalBackdrop.classList.contains('hidden')) {
        closeApiModal();
      }
    });

    // Save URL button
    if (DOM.saveApiUrlBtn) {
      DOM.saveApiUrlBtn.addEventListener('click', () => {
        const inputUrl = DOM.configApiUrl.value.trim();
        if (CONFIG.setScriptUrl(inputUrl)) {
          DOM.configSaveHint.textContent = '✓ Saved active endpoint!';
          DOM.configSaveHint.style.color = '#059669';
          setTimeout(() => { DOM.configSaveHint.textContent = ''; }, 3000);
          runApiDiagnostics(true);
        } else {
          DOM.configSaveHint.textContent = '✗ Invalid Google Script URL.';
          DOM.configSaveHint.style.color = '#dc2626';
        }
      });
    }

    // Reset URL button
    if (DOM.resetApiUrlBtn) {
      DOM.resetApiUrlBtn.addEventListener('click', () => {
        CONFIG.resetScriptUrl();
        DOM.configApiUrl.value = CONFIG.DEFAULT_SCRIPT_URL;
        DOM.configSaveHint.textContent = '✓ Reset to default.';
        setTimeout(() => { DOM.configSaveHint.textContent = ''; }, 2500);
        runApiDiagnostics(true);
      });
    }

    // Test connection button
    if (DOM.runDiagTestBtn) {
      DOM.runDiagTestBtn.addEventListener('click', () => runApiDiagnostics(true));
    }

    // Send test row button
    if (DOM.sendTestRowBtn) {
      DOM.sendTestRowBtn.addEventListener('click', handleSendLiveTestRow);
    }

    // Copy Apps Script code button
    if (DOM.copyAppsScriptCodeBtn && DOM.appsScriptCodeBlock) {
      DOM.copyAppsScriptCodeBtn.addEventListener('click', () => {
        const codeText = DOM.appsScriptCodeBlock.textContent;
        navigator.clipboard.writeText(codeText).then(() => {
          DOM.copyCodeBtnText.textContent = 'Copied!';
          setTimeout(() => { DOM.copyCodeBtnText.textContent = 'Copy Code'; }, 2500);
        }).catch(() => {
          DOM.copyCodeBtnText.textContent = 'Select all & copy';
        });
      });
    }
  }

  function closeApiModal() {
    if (DOM.apiModalBackdrop) {
      DOM.apiModalBackdrop.classList.add('hidden');
    }
  }

  /**
   * Diagnostic probe for the active Google Apps Script endpoint
   */
  async function runApiDiagnostics(verbose = false) {
    const url = CONFIG.getScriptUrl();
    if (DOM.diagStatusBadge) {
      DOM.diagStatusBadge.className = 'diag-badge-pill pill-neutral';
      DOM.diagStatusBadge.innerHTML = '<span class="pulse-dot"></span> Checking endpoint...';
    }

    try {
      // Send a GET request with standard CORS to probe response status
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      
      if (response.ok) {
        setDiagStatus(
          'ok',
          'Status: 200 OK (Connected)',
          'Google Apps Script is active and successfully accepting requests with public CORS access.'
        );
      } else {
        setDiagStatus(
          'warning',
          `Status: HTTP ${response.status}`,
          'Google Apps Script responded, but may need authorization or execution permissions update.'
        );
      }
    } catch (err) {
      /**
       * Cross-origin redirect to accounts.google.com or 401 Unauthorized
       * is blocked by CORS, triggering a fetch TypeError in browser.
       */
      setDiagStatus(
        'error',
        'Status: 401 Unauthorized / Google Login Blocked',
        'Google blocked the request because the web app deployment is set to "Only myself". To allow submissions to reach your sheet, go to Apps Script > Deploy > Manage Deployments and change "Who has access" to "Anyone".'
      );

      if (verbose) {
        showAlert(
          'warning',
          'Google Sheets Permissions Required (401 Error)',
          'Submissions are currently blocked by Google because your Apps Script deployment is set to "Only myself". Click "API Diagnostics" in the header to view the 60-second fix.'
        );
      }
    }
  }

  function setDiagStatus(status, badgeText, explanation) {
    if (DOM.headerDiagIndicator) {
      DOM.headerDiagIndicator.className = `diag-indicator status-${status}`;
    }
    if (DOM.diagStatusBadge) {
      DOM.diagStatusBadge.className = `diag-badge-pill pill-${status}`;
      DOM.diagStatusBadge.textContent = badgeText;
    }
    if (DOM.diagExplanation) {
      DOM.diagExplanation.textContent = explanation;
    }
  }

  /**
   * Sends a live test row directly into the Google Sheet to confirm write access
   */
  async function handleSendLiveTestRow() {
    if (!DOM.sendTestRowBtn) return;
    const originalText = DOM.sendTestRowBtn.innerHTML;
    DOM.sendTestRowBtn.disabled = true;
    DOM.sendTestRowBtn.innerHTML = '<span>Sending Test Row...</span>';

    const testParams = new URLSearchParams();
    const testId = 'TEST-' + Math.floor(1000 + Math.random() * 9000);
    testParams.append('fullName', 'Pumo System Test Student');
    testParams.append('mobileNumber', '9876543210');
    testParams.append('whatsappNumber', '9876543210');
    testParams.append('email', 'test.student@pumotechnovation.com');
    testParams.append('collegeName', 'Pumo Technovation Lab Test');
    testParams.append('degree', 'B.E / B.Tech');
    testParams.append('department', 'Computer Science (CSE)');
    testParams.append('yearOfPassing', '2025 (Final Year)');
    testParams.append('interestedCourse', 'Full Stack Python Development');
    testParams.append('demoDate', new Date().toISOString().split('T')[0]);
    testParams.append('demoTime', '10:00 AM - 11:30 AM');
    testParams.append('trainingMode', 'Offline');
    testParams.append('branchLocation', 'Poonamallee');
    testParams.append('remarks', 'Live Connection Test via Web App Diagnostics');
    testParams.append('referenceId', testId);
    testParams.append('submissionDate', new Date().toISOString());

    try {
      await fetch(CONFIG.getScriptUrl(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: testParams
      });

      DOM.diagExplanation.innerHTML = `
        <span style="color: #059669; font-weight: 700;">✓ Test payload dispatched (ID: ${testId})!</span><br>
        Check your Google Sheet now. If the test row does not appear, your Apps Script is blocked by Google with <strong>401 Unauthorized</strong>. Follow the 5-step checklist below to set <em>"Who has access: Anyone"</em>.
      `;
      window.open(CONFIG.SHEET_URL, '_blank');
    } catch (testErr) {
      DOM.diagExplanation.textContent = 'Failed to dispatch test row: ' + testErr.message;
    } finally {
      DOM.sendTestRowBtn.disabled = false;
      DOM.sendTestRowBtn.innerHTML = originalText;
    }
  }

  // --------------------------------------------------------------------------
  // 5. Event Listeners Setup
  // --------------------------------------------------------------------------
  function attachEventListeners() {
    DOM.form.addEventListener('submit', handleFormSubmit);
    DOM.clearFormBtn.addEventListener('click', handleClearForm);
    DOM.registerAnotherBtn.addEventListener('click', handleRegisterAnother);
    DOM.closeAlertBtn.addEventListener('click', hideAlert);
    DOM.sameAsMobile.addEventListener('change', handleSameAsMobileToggle);
    DOM.mobileNumber.addEventListener('input', handleMobileNumberInput);

    if (DOM.remarks && DOM.remarksCharCount) {
      DOM.remarks.addEventListener('input', () => {
        const currentLength = DOM.remarks.value.length;
        DOM.remarksCharCount.textContent = `${currentLength} / 500 characters`;
      });
    }

    DOM.modeRadios.forEach((radio) => {
      radio.addEventListener('change', handleTrainingModeChange);
    });

    // Floating Mobile Simulator Toggle
    if (DOM.toggleMobileViewBtn) {
      DOM.toggleMobileViewBtn.addEventListener('click', toggleMobileViewportMode);
    }

    setupInlineValidationListeners();
  }

  function toggleMobileViewportMode() {
    document.body.classList.toggle('mobile-view-mode');
    const isMobileMode = document.body.classList.contains('mobile-view-mode');
    if (DOM.deviceToggleText && DOM.deviceToggleIcon) {
      if (isMobileMode) {
        DOM.deviceToggleText.textContent = 'Switch to Desktop View';
        DOM.deviceToggleIcon.textContent = '🖥️';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        DOM.deviceToggleText.textContent = 'Switch to Mobile View';
        DOM.deviceToggleIcon.textContent = '📱';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 6. Training Mode & WhatsApp Sync Logic
  // --------------------------------------------------------------------------
  function handleSameAsMobileToggle() {
    if (DOM.sameAsMobile.checked) {
      DOM.whatsappNumber.value = DOM.mobileNumber.value;
      DOM.whatsappNumber.readOnly = true;
      validateField('whatsappNumber');
    } else {
      DOM.whatsappNumber.readOnly = false;
    }
  }

  function handleMobileNumberInput() {
    DOM.mobileNumber.value = DOM.mobileNumber.value.replace(/\D/g, '').slice(0, 10);
    if (DOM.sameAsMobile.checked) {
      DOM.whatsappNumber.value = DOM.mobileNumber.value;
    }
    clearFieldError('mobileNumber');
  }

  function handleTrainingModeChange(e) {
    const selectedMode = e.target.value;
    if (selectedMode === 'Online') {
      DOM.branchHelperText.textContent = '(Base branch for certificate issuance & physical workshop access)';
    } else {
      DOM.branchHelperText.textContent = '(Select the Chennai branch nearest to you)';
    }
  }

  // --------------------------------------------------------------------------
  // 7. Validation Engine
  // --------------------------------------------------------------------------
  function setupInlineValidationListeners() {
    ['fullName', 'email', 'mobileNumber', 'whatsappNumber', 'collegeName'].forEach((fieldName) => {
      const el = DOM[fieldName];
      if (el) {
        el.addEventListener('blur', () => validateField(fieldName));
        el.addEventListener('input', () => {
          if (el.classList.contains('is-invalid')) {
            validateField(fieldName);
          }
        });
      }
    });

    ['degree', 'department', 'yearOfPassing', 'interestedCourse', 'demoDate', 'demoTime'].forEach((fieldName) => {
      const el = DOM[fieldName];
      if (el) {
        el.addEventListener('change', () => validateField(fieldName));
      }
    });

    DOM.whatsappNumber.addEventListener('input', () => {
      DOM.whatsappNumber.value = DOM.whatsappNumber.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  function validateField(fieldName) {
    const el = DOM[fieldName];
    const errorEl = DOM.errors[fieldName];
    if (!el || !errorEl) return true;

    const value = el.value.trim();
    let errorMessage = '';

    switch (fieldName) {
      case 'fullName':
        if (!value) {
          errorMessage = 'Please enter student full name.';
        } else if (value.length < CONFIG.MIN_NAME_LENGTH) {
          errorMessage = `Full name must be at least ${CONFIG.MIN_NAME_LENGTH} characters.`;
        } else if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
          errorMessage = 'Please enter a valid name using alphabet characters only.';
        }
        break;

      case 'email':
        if (!value) {
          errorMessage = 'Please enter student email address.';
        } else if (!CONFIG.EMAIL_REGEX.test(value)) {
          errorMessage = 'Please enter a valid email address (e.g. name@domain.com).';
        }
        break;

      case 'mobileNumber':
        if (!value) {
          errorMessage = 'Please enter 10-digit mobile number.';
        } else if (!CONFIG.PHONE_REGEX.test(value)) {
          errorMessage = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
        }
        break;

      case 'whatsappNumber':
        if (!value) {
          errorMessage = 'Please enter 10-digit WhatsApp number.';
        } else if (!CONFIG.PHONE_REGEX.test(value)) {
          errorMessage = 'Enter a valid 10-digit WhatsApp number starting with 6, 7, 8, or 9.';
        }
        break;

      case 'collegeName':
        if (!value) {
          errorMessage = 'Please enter college or institution name.';
        } else if (value.length < CONFIG.MIN_COLLEGE_LENGTH) {
          errorMessage = 'Please provide a valid college name.';
        }
        break;

      case 'degree':
        if (!value) errorMessage = 'Please select degree program.';
        break;

      case 'department':
        if (!value) errorMessage = 'Please select engineering/academic department.';
        break;

      case 'yearOfPassing':
        if (!value) errorMessage = 'Please select year of passing.';
        break;

      case 'interestedCourse':
        if (!value) errorMessage = 'Please select the course technology for the demo.';
        break;

      case 'demoDate':
        if (!value) {
          errorMessage = 'Please select preferred demo date.';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            errorMessage = 'Demo date cannot be in the past. Please choose today or a future date.';
          }
        }
        break;

      case 'demoTime':
        if (!value) errorMessage = 'Please select preferred demo time slot.';
        break;
    }

    if (errorMessage) {
      el.classList.add('is-invalid');
      el.classList.remove('is-valid');
      errorEl.textContent = errorMessage;
      return false;
    } else {
      el.classList.remove('is-invalid');
      el.classList.add('is-valid');
      errorEl.textContent = '';
      return true;
    }
  }

  function clearFieldError(fieldName) {
    const el = DOM[fieldName];
    const errorEl = DOM.errors[fieldName];
    if (el) el.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
  }

  function validateEntireForm() {
    let isValid = true;
    let firstInvalidElement = null;

    const fieldsToValidate = [
      'fullName',
      'email',
      'mobileNumber',
      'whatsappNumber',
      'collegeName',
      'degree',
      'department',
      'yearOfPassing',
      'interestedCourse',
      'demoDate',
      'demoTime'
    ];

    fieldsToValidate.forEach((field) => {
      const fieldValid = validateField(field);
      if (!fieldValid) {
        isValid = false;
        if (!firstInvalidElement && DOM[field]) {
          firstInvalidElement = DOM[field];
        }
      }
    });

    const selectedMode = document.querySelector('input[name="trainingMode"]:checked');
    if (!selectedMode) {
      isValid = false;
      DOM.errors.trainingMode.textContent = 'Please choose a training mode (Offline or Online).';
    } else {
      DOM.errors.trainingMode.textContent = '';
    }

    const selectedBranch = document.querySelector('input[name="branchLocation"]:checked');
    if (!selectedBranch) {
      isValid = false;
      DOM.errors.branchLocation.textContent = 'Please choose a branch location.';
    } else {
      DOM.errors.branchLocation.textContent = '';
    }

    if (!isValid && firstInvalidElement) {
      firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidElement.focus();
    }

    return isValid;
  }

  // --------------------------------------------------------------------------
  // 8. Form Submission Handler & Google Sheets Sync
  // --------------------------------------------------------------------------
  async function handleFormSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    if (DOM.honeypot && DOM.honeypot.value.trim() !== '') {
      console.warn('Bot submission blocked via honeypot.');
      return;
    }

    hideAlert();

    const isFormValid = validateEntireForm();
    if (!isFormValid) {
      showAlert(
        'error',
        'Incomplete Form Details',
        'Please correct the highlighted fields in red before submitting your registration.'
      );
      return;
    }

    const formData = extractFormData();
    setSubmittingState(true);

    try {
      const params = new URLSearchParams();

      // Primary Keys (Exact match with backend schema)
      params.append('fullName', formData.fullName);
      params.append('mobileNumber', formData.mobileNumber);
      params.append('whatsappNumber', formData.whatsappNumber);
      params.append('email', formData.email);
      params.append('collegeName', formData.collegeName);
      params.append('degree', formData.degree);
      params.append('department', formData.department);
      params.append('yearOfPassing', formData.yearOfPassing);
      params.append('interestedCourse', formData.interestedCourse);
      params.append('demoDate', formData.demoDate);
      params.append('demoTime', formData.demoTime);
      params.append('trainingMode', formData.trainingMode);
      params.append('branchLocation', formData.branchLocation);
      params.append('remarks', formData.remarks);
      params.append('submissionDate', formData.submissionTimestamp);
      params.append('referenceId', formData.referenceId);

      // Alias keys
      params.append('studentName', formData.fullName);
      params.append('name', formData.fullName);
      params.append('phone', formData.mobileNumber);
      params.append('mobile', formData.mobileNumber);
      params.append('whatsapp', formData.whatsappNumber);
      params.append('college', formData.collegeName);
      params.append('course', formData.interestedCourse);
      params.append('date', formData.demoDate);
      params.append('time', formData.demoTime);
      params.append('mode', formData.trainingMode);
      params.append('branch', formData.branchLocation);
      params.append('comments', formData.remarks);

      const activeUrl = CONFIG.getScriptUrl();
      let jsonResult = null;
      let rawResponse = null;

      try {
        // Attempt transparent CORS fetch first
        const response = await fetch(activeUrl, {
          method: 'POST',
          body: params
        });

        rawResponse = response;
        if (response.ok) {
          try {
            jsonResult = await response.json();
          } catch (_) {
            jsonResult = null;
          }
        }
      } catch (corsErr) {
        // Fallback to no-cors mode if cross-origin redirect blocks reading
        const fallbackRes = await fetch(activeUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        });
        rawResponse = fallbackRes;
      }

      handleSubmissionResponse(rawResponse, formData, jsonResult);

    } catch (networkError) {
      console.error('Submission Network Error:', networkError);

      showAlert(
        'error',
        'Network Submission Failed',
        'We were unable to connect to the Google Apps Script endpoint. Please verify your internet connection. Your entered information has been preserved so you can retry.'
      );

      setSubmittingState(false);
    }
  }

  function extractFormData() {
    const selectedMode = document.querySelector('input[name="trainingMode"]:checked');
    const selectedBranch = document.querySelector('input[name="branchLocation"]:checked');
    const now = new Date();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const referenceId = `PT-DEMO-${now.getFullYear()}-${randomHex}`;

    return {
      referenceId: referenceId,
      fullName: DOM.fullName.value.trim(),
      email: DOM.email.value.trim(),
      mobileNumber: DOM.mobileNumber.value.trim(),
      whatsappNumber: DOM.whatsappNumber.value.trim(),
      collegeName: DOM.collegeName.value.trim(),
      degree: DOM.degree.value,
      department: DOM.department.value,
      yearOfPassing: DOM.yearOfPassing.value,
      interestedCourse: DOM.interestedCourse.value,
      demoDate: DOM.demoDate.value,
      demoTime: DOM.demoTime.value,
      trainingMode: selectedMode ? selectedMode.value : 'Offline',
      branchLocation: selectedBranch ? selectedBranch.value : 'Poonamallee',
      remarks: DOM.remarks.value.trim() || 'No remarks provided',
      submissionTimestamp: now.toISOString(),
      readableTimestamp: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
  }

  function handleSubmissionResponse(response, formData, jsonResult = null) {
    setSubmittingState(false);

    // If server returned a rate-limit / spam error
    if (jsonResult && jsonResult.result === 'error') {
      showAlert('warning', 'Google Sheets Notice', jsonResult.message || 'Please wait a moment before submitting again.');
      return;
    }

    // Populate Receipt Modal / Card
    DOM.receiptStudentName.textContent = formData.fullName;
    DOM.receiptRefId.textContent = (jsonResult && jsonResult.referenceId) ? jsonResult.referenceId : formData.referenceId;
    DOM.receiptCourse.textContent = formData.interestedCourse;
    DOM.receiptDateTime.textContent = `${formatDateDisplay(formData.demoDate)} • ${formData.demoTime}`;
    DOM.receiptMode.textContent = formData.trainingMode;
    DOM.receiptBranch.textContent = formData.branchLocation;
    DOM.receiptMobile.textContent = `+91 ${formData.mobileNumber}`;
    DOM.receiptAcademic.textContent = `${formData.degree} (${formData.department}) - ${formData.collegeName}`;

    // Inspect response status
    if (jsonResult && jsonResult.result === 'success') {
      DOM.successHeading.textContent = 'Registration Confirmed & Verified!';
      DOM.successDescription.textContent = `Welcome, ${formData.fullName}! Your demo session has been logged directly into Google Sheets.`;
      DOM.verificationDetailText.innerHTML = `
        <span style="color: #059669; font-weight: 700;">✓ Verified Google Sheets Entry:</span> 
        Successfully recorded at <strong>Row #${jsonResult.rowNumber || 'Appended'}</strong> (Reference: <code>${jsonResult.referenceId || formData.referenceId}</code>).
      `;
    } else if (response && response.type === 'opaque') {
      DOM.successHeading.textContent = 'Demo Registration Request Dispatched!';
      DOM.successDescription.textContent = `Thank you, ${formData.fullName}! Your registration has been dispatched to Google Apps Script.`;
      
      DOM.verificationDetailText.innerHTML = `
        The browser dispatched your registration payload via cross-origin <code>no-cors</code> mode.<br>
        <strong>Verification Tip:</strong> Check your Google Sheet to confirm your entry. You can also use the <strong>"API Diagnostics"</strong> button in the top menu to run live health checks anytime.
      `;
    } else if (response && response.ok) {
      DOM.successHeading.textContent = 'Registration Confirmed & Verified!';
      DOM.successDescription.textContent = `Welcome, ${formData.fullName}! Your demo session has been logged into Google Sheets.`;
      DOM.verificationDetailText.textContent = 'Your registration was verified directly with the Google Apps Script API (HTTP 200 OK).';
    } else {
      DOM.successHeading.textContent = 'Registration Request Dispatched!';
      DOM.successDescription.textContent = `Registration for ${formData.fullName} has been sent.`;
      DOM.verificationDetailText.textContent = 'The response could not be verified automatically. Please verify the entry in the Google Sheet.';
    }

    DOM.formCard.classList.add('hidden');
    DOM.successView.classList.remove('hidden');
    DOM.successView.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  // --------------------------------------------------------------------------
  // 9. State Management
  // --------------------------------------------------------------------------
  function setSubmittingState(submitting) {
    isSubmitting = submitting;
    if (submitting) {
      DOM.submitBtn.disabled = true;
      DOM.submitSpinner.classList.remove('hidden');
      DOM.btnText.textContent = 'Submitting to Google Sheets...';
      if (DOM.btnArrow) DOM.btnArrow.style.display = 'none';
    } else {
      DOM.submitBtn.disabled = false;
      DOM.submitSpinner.classList.add('hidden');
      DOM.btnText.textContent = 'Confirm & Register Demo';
      if (DOM.btnArrow) DOM.btnArrow.style.display = 'inline-block';
    }
  }

  function handleClearForm() {
    if (confirm('Are you sure you want to clear all entered details in this registration form?')) {
      resetFormInputs();
      hideAlert();
    }
  }

  function handleRegisterAnother() {
    resetFormInputs();
    hideAlert();
    DOM.successView.classList.add('hidden');
    DOM.formCard.classList.remove('hidden');
    DOM.formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetFormInputs() {
    DOM.form.reset();
    DOM.whatsappNumber.readOnly = false;
    
    const inputs = DOM.form.querySelectorAll('.form-control');
    inputs.forEach((input) => {
      input.classList.remove('is-valid', 'is-invalid');
    });

    Object.keys(DOM.errors).forEach((key) => {
      if (DOM.errors[key]) DOM.errors[key].textContent = '';
    });

    if (DOM.remarksCharCount) {
      DOM.remarksCharCount.textContent = '0 / 500 characters';
    }

    setupMinDate();
  }

  // --------------------------------------------------------------------------
  // 10. Alert Banner Helper
  // --------------------------------------------------------------------------
  function showAlert(type, title, message) {
    DOM.alertBanner.className = `alert-banner alert-${type}`;
    DOM.alertTitle.textContent = title;
    DOM.alertMessage.textContent = message;

    if (type === 'error') {
      DOM.alertIcon.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>`;
    } else if (type === 'warning') {
      DOM.alertIcon.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`;
    } else {
      DOM.alertIcon.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>`;
    }

    DOM.alertBanner.classList.remove('hidden');
    DOM.alertBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    DOM.alertBanner.classList.add('hidden');
  }

  // --------------------------------------------------------------------------
  // 11. Start Application
  // --------------------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

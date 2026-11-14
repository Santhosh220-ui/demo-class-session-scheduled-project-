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

    // Form Input Fields
    fullName: document.getElementById('fullName'),
    contactNumber: document.getElementById('contactNumber'),
    courseName: document.getElementById('courseName'),
    courseTiming: document.getElementById('courseTiming'),
    trainingModeRadios: document.querySelectorAll('input[name="trainingMode"]'),
    demoDate: document.getElementById('demoDate'),
    honeypot: document.getElementById('pumo_hp_field'),

    // Success Receipt Elements
    receiptStudentName: document.getElementById('receiptStudentName'),
    receiptRefId: document.getElementById('receiptRefId'),
    receiptContact: document.getElementById('receiptContact'),
    receiptCourse: document.getElementById('receiptCourse'),
    receiptTiming: document.getElementById('receiptTiming'),
    receiptMode: document.getElementById('receiptMode'),
    receiptDemoDate: document.getElementById('receiptDemoDate'),
    successHeading: document.getElementById('successHeading'),
    successDescription: document.getElementById('successDescription'),
    verificationDetailText: document.getElementById('verificationDetailText'),
    successViewRecordsBtn: document.getElementById('successViewRecordsBtn'),

    // Student Demo Dashboard Modal Controls
    openRecordsModalBtn: document.getElementById('openRecordsModalBtn'),
    cardOpenRecordsBtn: document.getElementById('cardOpenRecordsBtn'),
    closeRecordsModalBtn: document.getElementById('closeRecordsModalBtn'),
    closeRecordsModalBottomBtn: document.getElementById('closeRecordsModalBottomBtn'),
    recordsModalBackdrop: document.getElementById('recordsModalBackdrop'),
    recordsSearchInput: document.getElementById('recordsSearchInput'),
    recordsFilterPills: document.getElementById('recordsFilterPills'),
    recordsTableBody: document.getElementById('recordsTableBody'),
    recordsDataTable: document.getElementById('recordsDataTable'),
    recordsEmptyState: document.getElementById('recordsEmptyState'),
    exportRecordsCsvBtn: document.getElementById('exportRecordsCsvBtn'),
    refreshRecordsBtn: document.getElementById('refreshRecordsBtn'),

    // Inline Student Demo Records Elements (Mobile View Direct Display)
    inlineRecordsCard: document.getElementById('inlineRecordsCard'),
    inlineRecordsBadge: document.getElementById('inlineRecordsBadge'),
    inlineExportCsvBtn: document.getElementById('inlineExportCsvBtn'),
    inlineSyncBtn: document.getElementById('inlineSyncBtn'),
    inlineSyncBtnText: document.getElementById('inlineSyncBtnText'),
    inlineClearLocalBtn: document.getElementById('inlineClearLocalBtn'),
    inlineSyncIndicator: document.getElementById('inlineSyncIndicator'),
    inlineSyncStatusText: document.getElementById('inlineSyncStatusText'),
    inlineKpiTotal: document.getElementById('inlineKpiTotal'),
    inlineKpiOffline: document.getElementById('inlineKpiOffline'),
    inlineKpiOnline: document.getElementById('inlineKpiOnline'),
    inlineSearchInput: document.getElementById('inlineSearchInput'),
    inlineFilterPills: document.getElementById('inlineFilterPills'),
    inlineRecordsList: document.getElementById('inlineRecordsList'),
    inlineRecordsEmpty: document.getElementById('inlineRecordsEmpty'),
    modalSyncBtn: document.getElementById('modalSyncBtn'),
    modalClearLocalBtn: document.getElementById('modalClearLocalBtn'),

    // KPI & Badge Indicators
    kpiTotalDemos: document.getElementById('kpiTotalDemos'),
    kpiOffline: document.getElementById('kpiOffline'),
    kpiOnline: document.getElementById('kpiOnline'),
    chipAllCount: document.getElementById('chipAllCount'),
    chipOfflineCount: document.getElementById('chipOfflineCount'),
    chipOnlineCount: document.getElementById('chipOnlineCount'),
    navRecordsBadge: document.getElementById('navRecordsBadge'),
    cardRecordsBadge: document.getElementById('cardRecordsBadge'),

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
      contactNumber: document.getElementById('contactNumberError'),
      courseName: document.getElementById('courseNameError'),
      courseTiming: document.getElementById('courseTimingError'),
      trainingMode: document.getElementById('trainingModeError'),
      demoDate: document.getElementById('demoDateError')
    }
  };

  // State Tracking
  let isSubmitting = false;

  // --------------------------------------------------------------------------
  // 3. Demo Records Storage & Dashboard Management
  // --------------------------------------------------------------------------
  const RECORDS_STORAGE_KEY = 'pumo_student_demo_records';
  const SYNCED_STORAGE_FLAG = 'pumo_records_synced_with_sheet';
  let currentFilter = 'all';
  let currentSearchQuery = '';
  let isSyncingWithSheet = false;

  /**
   * Normalizes course names strictly to the 10 approved IT courses
   */
  function normalizeCourseName(course) {
    if (!course) return 'Python Full Stack';
    const c = course.trim();
    const lower = c.toLowerCase();
    if (lower.includes('python')) return 'Python Full Stack';
    if (lower.includes('data science')) return 'Data Science';
    if (lower.includes('data analytics')) return 'Data Analytics';
    if (lower.includes('data engineering')) return 'Data Engineering';
    if (lower.includes('aws') || lower.includes('devops') || lower.includes('cloud')) return 'AWS & DevOps';
    if (lower.includes('java')) return 'Java Full Stack';
    if (lower.includes('.net') || lower.includes('dotnet')) return '.NET Full Stack';
    if (lower.includes('cyber') || lower.includes('security')) return 'Cybersecurity';
    if (lower.includes('prompt') || lower.includes('promt')) return 'Prompt Engineering';
    if (lower.includes('ai')) return 'AI Courses';
    return c;
  }

  function getStoredDemoRecords() {
    try {
      const stored = localStorage.getItem(RECORDS_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Return exact array (even if empty [] because user deleted rows in Google Sheets)
          return parsed.map(rec => ({
            ...rec,
            courseName: normalizeCourseName(rec.courseName)
          }));
        }
      }
    } catch (e) {
      console.warn('Failed parsing demo records from storage:', e);
    }

    // If user has previously synced with Google Sheet or cleared, keep empty
    if (localStorage.getItem(SYNCED_STORAGE_FLAG) === 'true') {
      return [];
    }

    // Default pre-populated seed records (Strictly using the 10 approved IT courses)
    const seedRecords = [
      {
        referenceId: 'PT-DEMO-2026-9481',
        fullName: 'Karthik Raja',
        contactNumber: '9840123456',
        courseName: 'Python Full Stack',
        courseTiming: '10:00 AM - 11:30 AM (Morning Slot)',
        trainingMode: 'Offline',
        demoDate: '2026-11-15',
        submissionTimestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        readableTimestamp: '14/11/2026, 11:15 AM'
      },
      {
        referenceId: 'PT-DEMO-2026-7823',
        fullName: 'Sneha Priya V',
        contactNumber: '9791456789',
        courseName: 'Data Science',
        courseTiming: '02:30 PM - 04:00 PM (Afternoon Slot)',
        trainingMode: 'Online',
        demoDate: '2026-11-16',
        submissionTimestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        readableTimestamp: '14/11/2026, 09:30 AM'
      },
      {
        referenceId: 'PT-DEMO-2026-5512',
        fullName: 'Arun Kumar M',
        contactNumber: '9884234567',
        courseName: 'AWS & DevOps',
        courseTiming: '06:30 PM - 08:00 PM (Working Professionals)',
        trainingMode: 'Offline',
        demoDate: '2026-11-17',
        submissionTimestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        readableTimestamp: '13/11/2026, 06:45 PM'
      },
      {
        referenceId: 'PT-DEMO-2026-3190',
        fullName: 'Vigneshwaran S',
        contactNumber: '9940765432',
        courseName: 'Java Full Stack',
        courseTiming: '11:30 AM - 01:00 PM (Mid-Day Slot)',
        trainingMode: 'Offline',
        demoDate: '2026-11-18',
        submissionTimestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
        readableTimestamp: '13/11/2026, 10:20 AM'
      },
      {
        referenceId: 'PT-DEMO-2026-1204',
        fullName: 'Pooja Sundaram',
        contactNumber: '9677123890',
        courseName: 'Prompt Engineering',
        courseTiming: '04:00 PM - 05:30 PM (Evening Slot)',
        trainingMode: 'Online',
        demoDate: '2026-11-19',
        submissionTimestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
        readableTimestamp: '12/11/2026, 04:30 PM'
      }
    ];

    saveStoredDemoRecords(seedRecords);
    return seedRecords;
  }

  function saveStoredDemoRecords(records) {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed saving demo records to localStorage:', e);
    }
  }

  function addDemoRecord(newRecord) {
    const records = getStoredDemoRecords();
    records.unshift(newRecord);
    saveStoredDemoRecords(records);
    updateRecordsBadgeCounts();
    renderRecordsTable();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --------------------------------------------------------------------------
  // Live Google Sheet Two-Way Synchronization Engine
  // --------------------------------------------------------------------------
  function setSyncingState(isSyncing) {
    isSyncingWithSheet = isSyncing;
    if (DOM.inlineSyncBtn) {
      if (isSyncing) DOM.inlineSyncBtn.classList.add('is-syncing');
      else DOM.inlineSyncBtn.classList.remove('is-syncing');
    }
    if (DOM.modalSyncBtn) {
      if (isSyncing) DOM.modalSyncBtn.classList.add('is-syncing');
      else DOM.modalSyncBtn.classList.remove('is-syncing');
    }
    if (DOM.inlineSyncBtnText) {
      DOM.inlineSyncBtnText.textContent = isSyncing ? 'Syncing...' : 'Sync Sheet';
    }
  }

  function setSyncStatusIndicator(text, type = 'success') {
    if (DOM.inlineSyncIndicator) {
      DOM.inlineSyncIndicator.className = `sync-status-indicator status-${type}`;
    }
    if (DOM.inlineSyncStatusText) {
      DOM.inlineSyncStatusText.textContent = text;
    }
  }

  /**
   * Parses Google Visualization API Query responses into structured records
   */
  function parseGvizTableRows(table) {
    if (!table || !Array.isArray(table.rows)) return [];
    const cols = table.cols || [];

    let idxTimestamp = 0;
    let idxRef = 1;
    let idxName = 2;
    let idxContact = 3;
    let idxCourse = 4;
    let idxTiming = 5;
    let idxMode = 6;
    let idxDate = 7;
    let idxStatus = 8;

    cols.forEach((col, idx) => {
      const lbl = (col.label || col.id || '').toLowerCase();
      if (lbl.includes('ref') || lbl.includes('id')) idxRef = idx;
      else if (lbl.includes('name') || lbl.includes('student')) idxName = idx;
      else if (lbl.includes('contact') || lbl.includes('mobile') || lbl.includes('phone')) idxContact = idx;
      else if (lbl.includes('course') || lbl.includes('program')) idxCourse = idx;
      else if (lbl.includes('time') || lbl.includes('slot')) idxTiming = idx;
      else if (lbl.includes('mode')) idxMode = idx;
      else if (lbl.includes('date')) idxDate = idx;
      else if (lbl.includes('status') || lbl.includes('convert') || lbl.includes('remark')) idxStatus = idx;
      else if (lbl.includes('timestamp')) idxTimestamp = idx;
    });

    const records = [];

    table.rows.forEach((rowObj, rIdx) => {
      const cells = rowObj.c || [];
      const getVal = (idx) => {
        if (idx < 0 || idx >= cells.length || !cells[idx]) return '';
        const cell = cells[idx];
        return (cell.f !== undefined && cell.f !== null) ? String(cell.f) : (cell.v !== undefined && cell.v !== null ? String(cell.v) : '');
      };

      const name = getVal(idxName).trim();
      const contact = getVal(idxContact).replace(/^'/, '').trim();
      const refId = getVal(idxRef).trim() || `PT-DEMO-${rIdx + 1000}`;
      const course = getVal(idxCourse).trim() || 'Python Full Stack';
      const timing = getVal(idxTiming).trim() || '10:00 AM - 11:30 AM (Morning Slot)';
      const mode = getVal(idxMode).trim() || 'Offline';
      const demoDate = getVal(idxDate).trim() || '';
      const rawStatus = getVal(idxStatus).trim();
      const timestamp = getVal(idxTimestamp).trim() || new Date().toISOString();

      if (!name && !contact && !refId) return; // Skip empty row

      records.push({
        referenceId: refId,
        fullName: name,
        contactNumber: contact,
        courseName: course,
        courseTiming: timing,
        trainingMode: mode,
        demoDate: demoDate,
        readableTimestamp: timestamp,
        submissionTimestamp: timestamp
      });
    });

    return records;
  }

  /**
   * Fetches current data directly from the Google Sheet.
   * If rows were manually deleted in the Sheet, this automatically clears them from the website!
   */
  async function syncRecordsWithGoogleSheet(showFeedback = false) {
    if (isSyncingWithSheet) return;
    setSyncingState(true);
    setSyncStatusIndicator('Syncing live sheet...', 'syncing');

    try {
      const scriptUrl = CONFIG.getScriptUrl();
      const timestamp = Date.now();
      let recordsFetched = null;

      // Method 1: Google Apps Script Web App doGet API
      try {
        const getUrl = `${scriptUrl}?action=get&t=${timestamp}`;
        const res = await fetch(getUrl, { method: 'GET' });
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.records)) {
            recordsFetched = json.records;
            console.log(`[Pumo Sync] Retrieved ${recordsFetched.length} live records from Google Apps Script.`);
          }
        }
      } catch (scriptErr) {
        console.warn('[Pumo Sync] Apps Script doGet notice:', scriptErr);
      }

      // Method 2: Google Visualization API (Direct live query from Google Sheets)
      if (recordsFetched === null) {
        try {
          const gvizUrl = `https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/gviz/tq?tqx=out:json&t=${timestamp}`;
          const gvizRes = await fetch(gvizUrl);
          if (gvizRes.ok) {
            const rawText = await gvizRes.text();
            const match = rawText.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
            if (match && match[1]) {
              const gvizData = JSON.parse(match[1]);
              if (gvizData && gvizData.table) {
                recordsFetched = parseGvizTableRows(gvizData.table);
                console.log(`[Pumo Sync] Retrieved ${recordsFetched.length} live records via GViz endpoint.`);
              }
            }
          }
        } catch (gvizErr) {
          console.warn('[Pumo Sync] Google Sheets GViz fallback notice:', gvizErr);
        }
      }

      // If we received live rows from Google Sheets (or an empty array [] because user deleted rows)
      if (Array.isArray(recordsFetched)) {
        const normalized = recordsFetched.map(r => ({
          ...r,
          courseName: normalizeCourseName(r.courseName)
        }));

        // AUTOMATIC DELETE FIX: Overwrite local records with the sheet's current live state!
        // Any rows manually deleted in Google Sheets are now deleted here automatically.
        saveStoredDemoRecords(normalized);
        localStorage.setItem(SYNCED_STORAGE_FLAG, 'true');
        renderRecordsTable();
        updateRecordsBadgeCounts();
        setSyncStatusIndicator(`Live Sheet Synced (${normalized.length})`, 'success');

        if (showFeedback) {
          if (normalized.length === 0) {
            showAlert('success', 'Google Sheet Synced', 'Your Google Sheet has 0 candidate rows. Deleted records were removed.');
          } else {
            showAlert('success', 'Google Sheet Synced', `Loaded ${normalized.length} student demo record(s) directly from your Google Sheet.`);
          }
        }
        return true;
      } else {
        setSyncStatusIndicator('Sync Ready', 'neutral');
        if (showFeedback) {
          showAlert('warning', 'Live Sync Notice', 'Could not read directly from Google Sheets. Ensure your Apps Script deployment is set to "Who has access: Anyone".');
        }
        return false;
      }
    } catch (err) {
      console.error('[Pumo Sync] Error syncing records:', err);
      setSyncStatusIndicator('Sync Offline', 'neutral');
      if (showFeedback) {
        showAlert('error', 'Sync Failed', 'Unable to reach Google Sheets. Please check your network connection.');
      }
      return false;
    } finally {
      setSyncingState(false);
    }
  }

  /**
   * Deletes a student demo record both locally and in Google Sheets
   */
  async function deleteStudentDemoRecord(refId, studentName) {
    if (!refId) return;
    const confirmMsg = studentName 
      ? `Are you sure you want to delete demo record for "${studentName}" (${refId})?\n\nThis will remove it from this website and Google Sheets.`
      : `Are you sure you want to delete demo record ${refId}?`;

    if (!confirm(confirmMsg)) return;

    // 1. Instant optimistic UI deletion
    const records = getStoredDemoRecords();
    const updated = records.filter(r => r.referenceId !== refId);
    saveStoredDemoRecords(updated);
    localStorage.setItem(SYNCED_STORAGE_FLAG, 'true');
    renderRecordsTable();
    updateRecordsBadgeCounts();
    showAlert('success', 'Record Deleted', `Record ${refId} was deleted.`);

    // 2. Dispatch delete request to Google Apps Script
    try {
      const deleteUrl = `${CONFIG.getScriptUrl()}?action=delete&refId=${encodeURIComponent(refId)}&t=${Date.now()}`;
      await fetch(deleteUrl, { method: 'GET', mode: 'no-cors' });
      console.log('[Pumo Delete] Delete signal sent for:', refId);
    } catch (err) {
      console.warn('[Pumo Delete] Background delete notice:', err);
    }
  }

  /**
   * Clears all cached demo records and resets state
   */
  function handleClearAllLocalRecords() {
    if (confirm('Clear all stored candidate records from this browser? (Clicking "Sync Sheet" will reload live rows from Google Sheets at any time.)')) {
      saveStoredDemoRecords([]);
      localStorage.setItem(SYNCED_STORAGE_FLAG, 'true');
      renderRecordsTable();
      updateRecordsBadgeCounts();
      setSyncStatusIndicator('Cleared (0 records)', 'neutral');
      showAlert('success', 'Records Cleared', 'All local records have been cleared. Click "Sync Sheet" to pull live data from Google Sheets.');
    }
  }

  function handleRecordDeleteClick(e) {
    const deleteBtn = e.target.closest('.btn-record-delete');
    if (!deleteBtn) return;
    e.stopPropagation();
    const refId = deleteBtn.getAttribute('data-refid');
    const studentName = deleteBtn.getAttribute('data-name');
    deleteStudentDemoRecord(refId, studentName);
  }

  function renderRecordsTable() {
    const records = getStoredDemoRecords();
    updateRecordsBadgeCounts();

    const filtered = records.filter(rec => {
      if (currentFilter !== 'all') {
        if (currentFilter === 'Offline' && !(rec.trainingMode || '').includes('Offline')) return false;
        if (currentFilter === 'Online' && !(rec.trainingMode || '').includes('Online')) return false;
      }
      if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        const matchName = (rec.fullName || '').toLowerCase().includes(q);
        const matchContact = (rec.contactNumber || '').toLowerCase().includes(q);
        const matchCourse = (rec.courseName || '').toLowerCase().includes(q);
        const matchTiming = (rec.courseTiming || '').toLowerCase().includes(q);
        const matchMode = (rec.trainingMode || '').toLowerCase().includes(q);
        const matchRef = (rec.referenceId || '').toLowerCase().includes(q);
        if (!matchName && !matchContact && !matchCourse && !matchTiming && !matchMode && !matchRef) return false;
      }
      return true;
    });

    // 1. Render Modal Data Table
    if (DOM.recordsTableBody) {
      DOM.recordsTableBody.innerHTML = '';

      if (filtered.length === 0) {
        if (DOM.recordsEmptyState) DOM.recordsEmptyState.classList.remove('hidden');
        if (DOM.recordsDataTable) DOM.recordsDataTable.style.display = 'none';
      } else {
        if (DOM.recordsEmptyState) DOM.recordsEmptyState.classList.add('hidden');
        if (DOM.recordsDataTable) DOM.recordsDataTable.style.display = '';

        filtered.forEach((rec, idx) => {
          const tr = document.createElement('tr');

          const modeBadgeClass = (rec.trainingMode && rec.trainingMode.includes('Online')) ? 'mode-tag-online' : 'mode-tag-offline';
          const cleanPhone = (rec.contactNumber || '').replace(/\D/g, '');

          tr.innerHTML = `
            <td data-label="#"><strong>${idx + 1}</strong></td>
            <td data-label="Student Name">
              <div class="student-name-cell">${escapeHtml(rec.fullName)}</div>
              <span class="student-ref-id">${escapeHtml(rec.referenceId || 'N/A')}</span>
            </td>
            <td data-label="Contact" class="contact-phone-cell">+91 ${escapeHtml(rec.contactNumber)}</td>
            <td data-label="IT Course"><strong>${escapeHtml(rec.courseName)}</strong></td>
            <td data-label="Timing Slot">${escapeHtml(rec.courseTiming || 'Flexible Slot')}</td>
            <td data-label="Mode">
              <span class="mode-tag ${modeBadgeClass}">${escapeHtml(rec.trainingMode || 'Offline')}</span>
            </td>
            <td data-label="Demo Date">${formatDateDisplay(rec.demoDate)}</td>
            <td data-label="Action">
              <div class="row-actions-group">
                <a href="https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(rec.fullName)},%20this%20is%20Pumo%20Technovation%20regarding%20your%20upcoming%20${encodeURIComponent(rec.courseName)}%20technical%20demo%20session." target="_blank" rel="noopener noreferrer" class="btn-table-whatsapp" title="Message on WhatsApp">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </a>
                <button type="button" class="btn-record-delete" data-refid="${escapeHtml(rec.referenceId)}" data-name="${escapeHtml(rec.fullName)}" title="Delete candidate record">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </td>
          `;
          DOM.recordsTableBody.appendChild(tr);
        });
      }
    }

    // 2. Render Inline Records List (Direct Mobile Display)
    if (DOM.inlineRecordsList) {
      DOM.inlineRecordsList.innerHTML = '';

      if (filtered.length === 0) {
        if (DOM.inlineRecordsEmpty) DOM.inlineRecordsEmpty.classList.remove('hidden');
      } else {
        if (DOM.inlineRecordsEmpty) DOM.inlineRecordsEmpty.classList.add('hidden');

        filtered.forEach(rec => {
          const modeBadgeClass = (rec.trainingMode && rec.trainingMode.includes('Online')) ? 'mode-tag-online' : 'mode-tag-offline';
          const cleanPhone = (rec.contactNumber || '').replace(/\D/g, '');

          const card = document.createElement('div');
          card.className = 'student-record-item';
          card.innerHTML = `
            <div class="record-item-top">
              <div>
                <div class="record-item-name">${escapeHtml(rec.fullName)}</div>
                <span class="record-item-ref">${escapeHtml(rec.referenceId || 'N/A')}</span>
              </div>
              <div class="record-top-right-actions">
                <span class="mode-tag ${modeBadgeClass}">${escapeHtml(rec.trainingMode || 'Offline')}</span>
                <button type="button" class="btn-record-delete" data-refid="${escapeHtml(rec.referenceId)}" data-name="${escapeHtml(rec.fullName)}" title="Delete record">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </div>
            <div class="record-item-details">
              <div class="record-detail-field">
                <span class="record-detail-label">IT Course</span>
                <span class="record-detail-value">${escapeHtml(rec.courseName)}</span>
              </div>
              <div class="record-detail-field">
                <span class="record-detail-label">Timing Slot</span>
                <span class="record-detail-value">${escapeHtml(rec.courseTiming || 'Flexible Slot')}</span>
              </div>
              <div class="record-detail-field">
                <span class="record-detail-label">Training Mode</span>
                <span class="record-detail-value">
                  <span class="mode-tag ${modeBadgeClass}">${escapeHtml(rec.trainingMode || 'Offline')}</span>
                </span>
              </div>
              <div class="record-detail-field">
                <span class="record-detail-label">Demo Date</span>
                <span class="record-detail-value">${formatDateDisplay(rec.demoDate)}</span>
              </div>
            </div>
            <div class="record-item-bottom">
              <a href="tel:+91${cleanPhone}" class="record-contact-link" title="Call candidate">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +91 ${escapeHtml(rec.contactNumber)}
              </a>
              <div class="record-contact-actions">
                <a href="https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(rec.fullName)},%20this%20is%20Pumo%20Technovation%20regarding%20your%20upcoming%20${encodeURIComponent(rec.courseName)}%20technical%20demo%20session." target="_blank" rel="noopener noreferrer" class="btn-whatsapp-chip" title="Chat on WhatsApp">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          `;
          DOM.inlineRecordsList.appendChild(card);
        });
      }
    }
  }

  function updateRecordsBadgeCounts() {
    const records = getStoredDemoRecords();
    const total = records.length;
    const offlineCount = records.filter(r => (r.trainingMode || '').includes('Offline')).length;
    const onlineCount = records.filter(r => (r.trainingMode || '').includes('Online')).length;

    // Modal KPIs
    if (DOM.kpiTotalDemos) DOM.kpiTotalDemos.textContent = total;
    if (DOM.kpiOffline) DOM.kpiOffline.textContent = offlineCount;
    if (DOM.kpiOnline) DOM.kpiOnline.textContent = onlineCount;

    // Modal Filter Chip Counts
    if (DOM.chipAllCount) DOM.chipAllCount.textContent = total;
    if (DOM.chipOfflineCount) DOM.chipOfflineCount.textContent = offlineCount;
    if (DOM.chipOnlineCount) DOM.chipOnlineCount.textContent = onlineCount;

    // Header & Card Badges
    if (DOM.navRecordsBadge) DOM.navRecordsBadge.textContent = total;
    if (DOM.cardRecordsBadge) DOM.cardRecordsBadge.textContent = total;

    // Inline Card KPIs (Mobile View Direct Display)
    if (DOM.inlineKpiTotal) DOM.inlineKpiTotal.textContent = total;
    if (DOM.inlineKpiOffline) DOM.inlineKpiOffline.textContent = offlineCount;
    if (DOM.inlineKpiOnline) DOM.inlineKpiOnline.textContent = onlineCount;
    if (DOM.inlineRecordsBadge) DOM.inlineRecordsBadge.textContent = total;
  }

  function exportRecordsToCsv() {
    const records = getStoredDemoRecords();
    if (records.length === 0) {
      alert('No demo records available to export.');
      return;
    }

    const headers = [
      'Reference ID',
      'Student Name',
      'Contact Number',
      'IT Course Name',
      'Course Timing',
      'Training Mode',
      'Date of Demo',
      'Submission Timestamp'
    ];

    const csvRows = [headers.join(',')];

    records.forEach(r => {
      const row = [
        `"${(r.referenceId || '').replace(/"/g, '""')}"`,
        `"${(r.fullName || '').replace(/"/g, '""')}"`,
        `"${(r.contactNumber || '').replace(/"/g, '""')}"`,
        `"${(r.courseName || '').replace(/"/g, '""')}"`,
        `"${(r.courseTiming || '').replace(/"/g, '""')}"`,
        `"${(r.trainingMode || '').replace(/"/g, '""')}"`,
        `"${(r.demoDate || '').replace(/"/g, '""')}"`,
        `"${(r.readableTimestamp || r.submissionTimestamp || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    const todayStr = new Date().toISOString().split('T')[0];
    downloadAnchor.href = url;
    downloadAnchor.download = `pumo-student-demos-${todayStr}.csv`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  }

  function initRecordsDashboard() {
    if (DOM.openRecordsModalBtn) {
      DOM.openRecordsModalBtn.addEventListener('click', openRecordsModal);
    }
    if (DOM.cardOpenRecordsBtn) {
      DOM.cardOpenRecordsBtn.addEventListener('click', openRecordsModal);
    }
    if (DOM.closeRecordsModalBtn) {
      DOM.closeRecordsModalBtn.addEventListener('click', closeRecordsModal);
    }
    if (DOM.closeRecordsModalBottomBtn) {
      DOM.closeRecordsModalBottomBtn.addEventListener('click', closeRecordsModal);
    }

    if (DOM.recordsModalBackdrop) {
      DOM.recordsModalBackdrop.addEventListener('click', (e) => {
        if (e.target === DOM.recordsModalBackdrop) {
          closeRecordsModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.recordsModalBackdrop && !DOM.recordsModalBackdrop.classList.contains('hidden')) {
        closeRecordsModal();
      }
    });

    // Modal Search Input
    if (DOM.recordsSearchInput) {
      DOM.recordsSearchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.trim();
        if (DOM.inlineSearchInput) DOM.inlineSearchInput.value = currentSearchQuery;
        renderRecordsTable();
      });
    }

    // Modal Filter Pills
    if (DOM.recordsFilterPills) {
      DOM.recordsFilterPills.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button[data-filter]');
        if (!targetBtn) return;
        DOM.recordsFilterPills.querySelectorAll('.filter-chip').forEach(btn => btn.classList.remove('active'));
        targetBtn.classList.add('active');
        currentFilter = targetBtn.getAttribute('data-filter') || 'all';

        // Synchronize with inline filter chips
        if (DOM.inlineFilterPills) {
          DOM.inlineFilterPills.querySelectorAll('.filter-chip').forEach(btn => {
            if (btn.getAttribute('data-filter') === currentFilter) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });
        }

        renderRecordsTable();
      });
    }

    // Inline Search Input (Direct on Mobile View)
    if (DOM.inlineSearchInput) {
      DOM.inlineSearchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.trim();
        if (DOM.recordsSearchInput) DOM.recordsSearchInput.value = currentSearchQuery;
        renderRecordsTable();
      });
    }

    // Inline Filter Pills (Direct on Mobile View)
    if (DOM.inlineFilterPills) {
      DOM.inlineFilterPills.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button[data-filter]');
        if (!targetBtn) return;
        DOM.inlineFilterPills.querySelectorAll('.filter-chip').forEach(btn => btn.classList.remove('active'));
        targetBtn.classList.add('active');
        currentFilter = targetBtn.getAttribute('data-filter') || 'all';

        // Synchronize with modal filter chips
        if (DOM.recordsFilterPills) {
          DOM.recordsFilterPills.querySelectorAll('.filter-chip').forEach(btn => {
            if (btn.getAttribute('data-filter') === currentFilter) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });
        }

        renderRecordsTable();
      });
    }

    // Inline Export CSV Button
    if (DOM.inlineExportCsvBtn) {
      DOM.inlineExportCsvBtn.addEventListener('click', exportRecordsToCsv);
    }

    if (DOM.exportRecordsCsvBtn) {
      DOM.exportRecordsCsvBtn.addEventListener('click', exportRecordsToCsv);
    }

    // Live Sync Buttons (Pulls live data from Google Sheets & removes deleted rows)
    if (DOM.inlineSyncBtn) {
      DOM.inlineSyncBtn.addEventListener('click', () => syncRecordsWithGoogleSheet(true));
    }
    if (DOM.modalSyncBtn) {
      DOM.modalSyncBtn.addEventListener('click', () => syncRecordsWithGoogleSheet(true));
    }

    // Clear Local Cached Records Buttons
    if (DOM.inlineClearLocalBtn) {
      DOM.inlineClearLocalBtn.addEventListener('click', handleClearAllLocalRecords);
    }
    if (DOM.modalClearLocalBtn) {
      DOM.modalClearLocalBtn.addEventListener('click', handleClearAllLocalRecords);
    }

    // Refresh Records Button
    if (DOM.refreshRecordsBtn) {
      DOM.refreshRecordsBtn.addEventListener('click', () => {
        syncRecordsWithGoogleSheet(true);
      });
    }

    // Individual Record Deletion Delegation
    if (DOM.recordsTableBody) {
      DOM.recordsTableBody.addEventListener('click', handleRecordDeleteClick);
    }
    if (DOM.inlineRecordsList) {
      DOM.inlineRecordsList.addEventListener('click', handleRecordDeleteClick);
    }

    renderRecordsTable();
    updateRecordsBadgeCounts();
  }

  function openRecordsModal(e) {
    const isMobile = window.innerWidth <= 768 || document.body.classList.contains('mobile-view-mode');
    
    // In mobile view, clicking the form card records button scrolls directly to the inline list
    if (isMobile && DOM.inlineRecordsCard && e && (e.currentTarget === DOM.cardOpenRecordsBtn || e.currentTarget === DOM.successViewRecordsBtn)) {
      DOM.inlineRecordsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!DOM.recordsModalBackdrop) return;
    renderRecordsTable();
    updateRecordsBadgeCounts();
    DOM.recordsModalBackdrop.classList.remove('hidden');
  }

  function closeRecordsModal() {
    if (!DOM.recordsModalBackdrop) return;
    DOM.recordsModalBackdrop.classList.add('hidden');
  }

  // --------------------------------------------------------------------------
  // 4. Initialization
  // --------------------------------------------------------------------------
  function init() {
    setupMinDate();
    initMobileViewportMode();
    initModalControls();
    initRecordsDashboard();
    attachEventListeners();
    // Pre-populate configuration URL in modal
    if (DOM.configApiUrl) {
      DOM.configApiUrl.value = CONFIG.getScriptUrl();
    }
    // Perform initial passive endpoint probe
    runApiDiagnostics(false);

    // Initial Live Sync with Google Sheets (removes any rows deleted in Excel / Google Sheets)
    syncRecordsWithGoogleSheet(false);

    // Periodic Background Sync: check every 45 seconds so manual edits/deletions in Sheets mirror automatically
    setInterval(() => {
      syncRecordsWithGoogleSheet(false);
    }, 45000);
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
    const testName = 'Pumo System Test Candidate';
    const testPhone = '9876543210';
    const testCourse = 'Python Full Stack';
    const testTiming = '10:00 AM - 11:30 AM (Morning Slot)';
    const testMode = 'Offline';
    const testDate = new Date().toISOString().split('T')[0];

    testParams.append('fullName', testName);
    testParams.append('name', testName);
    testParams.append('studentName', testName);
    testParams.append('contactNumber', testPhone);
    testParams.append('phone', testPhone);
    testParams.append('mobile', testPhone);
    testParams.append('mobileNumber', testPhone);
    testParams.append('whatsappNumber', testPhone);
    testParams.append('courseName', testCourse);
    testParams.append('course', testCourse);
    testParams.append('interestedCourse', testCourse);
    testParams.append('courseTiming', testTiming);
    testParams.append('demoTime', testTiming);
    testParams.append('time', testTiming);
    testParams.append('slot', testTiming);
    testParams.append('trainingMode', testMode);
    testParams.append('mode', testMode);
    testParams.append('branchLocation', 'Poonamallee / Chennai Campus');
    testParams.append('demoDate', testDate);
    testParams.append('date', testDate);
    testParams.append('joiningStatus', 'Joining');
    testParams.append('status', 'Joining');
    testParams.append('convert', 'Joining');
    testParams.append('conversion', 'Joining');
    testParams.append('remarks', `Joining Status: Joining | Slot: ${testTiming} | Mode: ${testMode}`);
    testParams.append('referenceId', testId);
    testParams.append('submissionDate', new Date().toISOString());

    // Compatibility fallbacks for older Apps Script validator
    testParams.append('email', 'testcandidate@pumodemo.in');
    testParams.append('collegeName', 'N/A');
    testParams.append('college', 'N/A');
    testParams.append('degree', 'N/A');
    testParams.append('department', 'N/A');
    testParams.append('dept', 'N/A');
    testParams.append('yearOfPassing', 'N/A');
    testParams.append('yop', 'N/A');
    testParams.append('branch', 'Poonamallee');

    try {
      await fetch(CONFIG.getScriptUrl(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: testParams
      });

      // Also record this candidate in our local demo dashboard
      addDemoRecord({
        referenceId: testId,
        fullName: testName,
        contactNumber: testPhone,
        courseName: testCourse,
        courseTiming: testTiming,
        trainingMode: testMode,
        demoDate: testDate,
        joiningStatus: 'Joining',
        submissionTimestamp: new Date().toISOString(),
        readableTimestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
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

    if (DOM.contactNumber) {
      DOM.contactNumber.addEventListener('input', handleContactNumberInput);
    }

    // Floating Mobile Simulator Toggle
    if (DOM.toggleMobileViewBtn) {
      DOM.toggleMobileViewBtn.addEventListener('click', toggleMobileViewportMode);
    }

    // Success View Records Button
    if (DOM.successViewRecordsBtn) {
      DOM.successViewRecordsBtn.addEventListener('click', openRecordsModal);
    }

    setupInlineValidationListeners();
  }

  function handleContactNumberInput() {
    if (!DOM.contactNumber) return;
    DOM.contactNumber.value = DOM.contactNumber.value.replace(/\D/g, '').slice(0, 10);
    clearFieldError('contactNumber');
  }

  function initMobileViewportMode() {
    // Default to Mobile View
    const storedPreference = localStorage.getItem('pumo_preferred_viewport');
    if (storedPreference === 'desktop') {
      document.body.classList.remove('mobile-view-mode');
      if (DOM.deviceToggleText) DOM.deviceToggleText.textContent = 'Switch to Mobile View';
      if (DOM.deviceToggleIcon) DOM.deviceToggleIcon.textContent = '📱';
    } else {
      document.body.classList.add('mobile-view-mode');
      if (DOM.deviceToggleText) DOM.deviceToggleText.textContent = 'Switch to Desktop View';
      if (DOM.deviceToggleIcon) DOM.deviceToggleIcon.textContent = '🖥️';
    }
  }

  function toggleMobileViewportMode() {
    document.body.classList.toggle('mobile-view-mode');
    const isMobileMode = document.body.classList.contains('mobile-view-mode');
    localStorage.setItem('pumo_preferred_viewport', isMobileMode ? 'mobile' : 'desktop');
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
  // 6. Validation Engine
  // --------------------------------------------------------------------------
  function setupInlineValidationListeners() {
    ['fullName', 'contactNumber'].forEach((fieldName) => {
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

    ['courseName', 'courseTiming', 'demoDate'].forEach((fieldName) => {
      const el = DOM[fieldName];
      if (el) {
        el.addEventListener('change', () => validateField(fieldName));
      }
    });

    if (DOM.trainingModeRadios) {
      DOM.trainingModeRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
          if (DOM.errors.trainingMode) DOM.errors.trainingMode.textContent = '';
        });
      });
    }
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
        } else if (value.length < 2) {
          errorMessage = 'Student name must be at least 2 characters.';
        } else if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
          errorMessage = 'Please enter a valid name using alphabet characters only.';
        }
        break;

      case 'contactNumber':
        if (!value) {
          errorMessage = 'Please enter 10-digit contact number.';
        } else if (!CONFIG.PHONE_REGEX.test(value)) {
          errorMessage = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
        }
        break;

      case 'courseName':
        if (!value) {
          errorMessage = 'Please select IT course name for the demo.';
        }
        break;

      case 'courseTiming':
        if (!value) {
          errorMessage = 'Please select preferred course timing slot.';
        }
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

    const fieldsToValidate = ['fullName', 'contactNumber', 'courseName', 'courseTiming', 'demoDate'];

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
      if (DOM.errors.trainingMode) {
        DOM.errors.trainingMode.textContent = 'Please choose training mode (Offline or Online).';
      }
    } else {
      if (DOM.errors.trainingMode) DOM.errors.trainingMode.textContent = '';
    }

    if (!isValid && firstInvalidElement) {
      firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidElement.focus();
    }

    return isValid;
  }

  // --------------------------------------------------------------------------
  // 7. Form Submission Handler & Google Sheets Sync
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
        'Incomplete Details',
        'Please fill in all required fields before submitting.'
      );
      return;
    }

    const formData = extractFormData();
    setSubmittingState(true);

    try {
      const params = new URLSearchParams();

      // 1. Name
      params.append('fullName', formData.fullName);
      params.append('name', formData.fullName);
      params.append('studentName', formData.fullName);

      // 2. Contact Number
      params.append('contactNumber', formData.contactNumber);
      params.append('contact', formData.contactNumber);
      params.append('mobileNumber', formData.contactNumber);
      params.append('phone', formData.contactNumber);
      params.append('mobile', formData.contactNumber);
      params.append('whatsappNumber', formData.contactNumber);

      // 3. IT Course Name
      params.append('courseName', formData.courseName);
      params.append('course', formData.courseName);
      params.append('interestedCourse', formData.courseName);

      // 4. Course Timing Slot
      params.append('courseTiming', formData.courseTiming);
      params.append('demoTime', formData.courseTiming);
      params.append('time', formData.courseTiming);
      params.append('slot', formData.courseTiming);

      // 5. Training Mode (Offline or Online)
      params.append('trainingMode', formData.trainingMode);
      params.append('mode', formData.trainingMode);

      // 6. Date of Demo
      params.append('demoDate', formData.demoDate);
      params.append('date', formData.demoDate);

      // 7. Status & Remarks
      params.append('joiningStatus', 'Demo Registered');
      params.append('status', 'Demo Registered');
      params.append('remarks', `Training Mode: ${formData.trainingMode} | Timing: ${formData.courseTiming}`);
      params.append('comments', `Training Mode: ${formData.trainingMode}`);

      // Branch & Compatibility
      params.append('branchLocation', formData.trainingMode.includes('Online') ? 'Online Live Virtual Classroom' : 'Poonamallee / Chennai Campus');
      params.append('branch', formData.trainingMode.includes('Online') ? 'Online' : 'Poonamallee');

      // Compatibility fallbacks for older Apps Script validation schemas
      const safeAlias = (formData.fullName || 'student').toLowerCase().replace(/[^a-z0-9]/g, '');
      params.append('email', `${safeAlias || 'student'}@pumodemo.in`);
      params.append('collegeName', 'N/A');
      params.append('college', 'N/A');
      params.append('degree', 'N/A');
      params.append('department', 'N/A');
      params.append('dept', 'N/A');
      params.append('yearOfPassing', 'N/A');
      params.append('yop', 'N/A');

      // Metadata
      params.append('submissionDate', formData.submissionTimestamp);
      params.append('referenceId', formData.referenceId);

      const activeUrl = CONFIG.getScriptUrl();
      let jsonResult = null;
      let rawResponse = null;

      try {
        // Transparent CORS fetch attempt
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
        // Fallback to no-cors mode if required by Google redirects
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
    const now = new Date();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const referenceId = `PT-DEMO-${now.getFullYear()}-${randomHex}`;

    return {
      referenceId: referenceId,
      fullName: DOM.fullName.value.trim(),
      contactNumber: DOM.contactNumber.value.trim(),
      courseName: DOM.courseName.value,
      courseTiming: DOM.courseTiming ? DOM.courseTiming.value : '10:00 AM - 11:30 AM (Morning Slot)',
      trainingMode: selectedMode ? selectedMode.value : 'Offline',
      demoDate: DOM.demoDate.value,
      submissionTimestamp: now.toISOString(),
      readableTimestamp: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };
  }

  function handleSubmissionResponse(response, formData, jsonResult = null) {
    setSubmittingState(false);

    if (jsonResult && jsonResult.result === 'error') {
      showAlert('warning', 'Google Sheets Notice', jsonResult.message || 'Please wait a moment before submitting again.');
      return;
    }

    // Update receipt card
    if (DOM.receiptStudentName) DOM.receiptStudentName.textContent = formData.fullName;
    if (DOM.receiptRefId) DOM.receiptRefId.textContent = (jsonResult && jsonResult.referenceId) ? jsonResult.referenceId : formData.referenceId;
    if (DOM.receiptContact) DOM.receiptContact.textContent = `+91 ${formData.contactNumber}`;
    if (DOM.receiptCourse) DOM.receiptCourse.textContent = formData.courseName;
    if (DOM.receiptTiming) DOM.receiptTiming.textContent = formData.courseTiming;
    if (DOM.receiptMode) DOM.receiptMode.textContent = formData.trainingMode;
    if (DOM.receiptDemoDate) DOM.receiptDemoDate.textContent = formatDateDisplay(formData.demoDate);

    // Save record to persistent local store & refresh dashboard
    addDemoRecord({
      referenceId: (jsonResult && jsonResult.referenceId) ? jsonResult.referenceId : formData.referenceId,
      fullName: formData.fullName,
      contactNumber: formData.contactNumber,
      courseName: formData.courseName,
      courseTiming: formData.courseTiming,
      trainingMode: formData.trainingMode,
      demoDate: formData.demoDate,
      submissionTimestamp: formData.submissionTimestamp,
      readableTimestamp: formData.readableTimestamp
    });

    // Inspect response status
    if (jsonResult && jsonResult.result === 'success') {
      DOM.successHeading.textContent = 'Demo Registration Saved!';
      DOM.successDescription.textContent = `Details for ${formData.fullName} have been recorded in Google Sheets.`;
      DOM.verificationDetailText.innerHTML = `
        <span style="color: #059669; font-weight: 700;">✓ Verified Google Sheets Entry:</span> 
        Recorded at <strong>Row #${jsonResult.rowNumber || 'Appended'}</strong> (Reference: <code>${jsonResult.referenceId || formData.referenceId}</code>).
      `;
    } else if (response && response.type === 'opaque') {
      DOM.successHeading.textContent = 'Demo Registration Dispatched!';
      DOM.successDescription.textContent = `Details for ${formData.fullName} have been dispatched to Google Apps Script.`;
      DOM.verificationDetailText.innerHTML = `
        The payload was dispatched via cross-origin <code>no-cors</code> mode.<br>
        <strong>Verification Tip:</strong> Check your Google Sheet to confirm your entry.
      `;
    } else if (response && response.ok) {
      DOM.successHeading.textContent = 'Demo Registration Confirmed!';
      DOM.successDescription.textContent = `Demo registration for ${formData.fullName} was verified directly with Google Sheets.`;
      DOM.verificationDetailText.textContent = 'Entry verified with Google Apps Script API (HTTP 200 OK).';
    } else {
      DOM.successHeading.textContent = 'Demo Registration Dispatched!';
      DOM.successDescription.textContent = `Registration for ${formData.fullName} has been sent.`;
      DOM.verificationDetailText.textContent = 'Please check the Google Sheet to verify the entry.';
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
  // 8. State Management
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
    if (confirm('Are you sure you want to clear this form?')) {
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
    
    const inputs = DOM.form.querySelectorAll('.form-control');
    inputs.forEach((input) => {
      input.classList.remove('is-valid', 'is-invalid');
    });

    Object.keys(DOM.errors).forEach((key) => {
      if (DOM.errors[key]) DOM.errors[key].textContent = '';
    });

    const defaultModeRadio = document.getElementById('modeOffline');
    if (defaultModeRadio) defaultModeRadio.checked = true;

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

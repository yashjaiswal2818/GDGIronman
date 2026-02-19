/**
 * Shared form and validation utilities for stage submissions
 * Requires api-config.js for getTeamName fallback
 */
(function () {
    'use strict';

    var MAX_FILE_SIZE_MB = 10;
    var MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    var URL_PATTERNS = {
        github: /^https?:\/\/(www\.)?github\.com\/.+/i,
        figma: /^https?:\/\/(www\.)?(figma\.com|figma\.app)\/.+/i,
        any: /^https?:\/\/.+/i
    };

    window.FormUtils = {
        getTeamName: function () {
            var stored = (sessionStorage.getItem('teamName') || '').trim();
            var fallback = (window.API_CONFIG && window.API_CONFIG.TEST_TEAM_NAME) || 'xyz';
            return stored || fallback;
        },

        validateFileSize: function (files, maxMb) {
            maxMb = maxMb || MAX_FILE_SIZE_MB;
            var maxBytes = maxMb * 1024 * 1024;
            for (var i = 0; i < files.length; i++) {
                if (files[i].size > maxBytes) {
                    return { valid: false, message: 'File "' + files[i].name + '" exceeds ' + maxMb + 'MB limit.' };
                }
            }
            return { valid: true };
        },

        validateUrl: function (url, type) {
            if (!url || !url.trim()) return { valid: false, message: 'URL is required.' };
            var pattern = URL_PATTERNS[type] || URL_PATTERNS.any;
            if (!pattern.test(url.trim())) {
                var hint = type === 'github' ? 'GitHub' : type === 'figma' ? 'Figma' : 'valid http(s)';
                return { valid: false, message: 'Please enter a valid ' + hint + ' URL.' };
            }
            return { valid: true };
        },

        parseApiError: function (data, status) {
            if (!data) return 'Submission failed: ' + status;
            var detail = data.detail;
            if (typeof detail === 'string') return detail;
            if (detail && typeof detail === 'object' && detail.msg) return detail.msg;
            if (detail && Array.isArray(detail) && detail[0] && detail[0].msg) return detail[0].msg;
            return JSON.stringify(detail) || 'Submission failed: ' + status;
        },

        showFeedback: function (el, text, isError, extraClass) {
            if (!el) return;
            el.textContent = text;
            el.classList.remove('hidden');
            el.className = 'text-xs font-mono py-2 ' + (isError ? 'text-red-400' : 'text-emerald-400') + (extraClass ? ' ' + extraClass : '');
        }
    };
})();

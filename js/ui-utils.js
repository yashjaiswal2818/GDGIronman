/**
 * UI Utilities - Toast notifications, loading states, form feedback
 */
(function () {
    'use strict';

    window.UIUtils = {
        /**
         * Show a toast notification
         * @param {string} message - Message to display
         * @param {string} type - 'success', 'error', 'warning', 'info'
         * @param {number} duration - Duration in ms (default: 3000)
         */
        showToast: function (message, type, duration) {
            type = type || 'info';
            duration = duration || 3000;

            var toast = document.createElement('div');
            toast.className = 'ui-toast ui-toast-' + type;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

            var icon = '';
            switch (type) {
                case 'success':
                    icon = '<span class="material-symbols-outlined">check_circle</span>';
                    break;
                case 'error':
                    icon = '<span class="material-symbols-outlined">error</span>';
                    break;
                case 'warning':
                    icon = '<span class="material-symbols-outlined">warning</span>';
                    break;
                default:
                    icon = '<span class="material-symbols-outlined">info</span>';
            }

            toast.innerHTML = '<div class="ui-toast-content">' + icon + '<span class="ui-toast-message">' + message + '</span></div>';

            var container = document.getElementById('ui-toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'ui-toast-container';
                container.className = 'ui-toast-container';
                document.body.appendChild(container);
            }

            container.appendChild(toast);
            setTimeout(function () {
                toast.classList.add('ui-toast-show');
            }, 10);

            var removeToast = function () {
                toast.classList.remove('ui-toast-show');
                setTimeout(function () {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            };

            if (duration > 0) {
                setTimeout(removeToast, duration);
            }

            toast.addEventListener('click', removeToast);
            return { remove: removeToast };
        },

        /**
         * Set button loading state
         * @param {HTMLElement} btn - Button element
         * @param {boolean} loading - Loading state
         * @param {string} loadingText - Text to show when loading
         */
        setButtonLoading: function (btn, loading, loadingText) {
            if (!btn) return;
            loadingText = loadingText || 'Loading...';

            if (loading) {
                btn.disabled = true;
                btn.setAttribute('data-original-html', btn.innerHTML);
                btn.classList.add('ui-loading');
                btn.innerHTML = '<span class="ui-spinner"></span><span>' + loadingText + '</span>';
            } else {
                btn.disabled = false;
                btn.classList.remove('ui-loading');
                var original = btn.getAttribute('data-original-html');
                if (original) {
                    btn.innerHTML = original;
                    btn.removeAttribute('data-original-html');
                }
            }
        },

        /**
         * Set form field validation state
         * @param {HTMLElement} input - Input element
         * @param {boolean} valid - Is valid
         * @param {string} message - Error message (if invalid)
         */
        setFieldValidation: function (input, valid, message) {
            if (!input) return;
            var group = input.closest('.form-group') || input.parentElement;
            var errorEl = group.querySelector('.field-error');

            input.classList.remove('field-valid', 'field-invalid');
            if (valid) {
                input.classList.add('field-valid');
                if (errorEl) errorEl.textContent = '';
            } else {
                input.classList.add('field-invalid');
                if (!errorEl && message) {
                    errorEl = document.createElement('div');
                    errorEl.className = 'field-error text-xs text-red-400 mt-1 font-mono';
                    group.appendChild(errorEl);
                }
                if (errorEl && message) {
                    errorEl.textContent = message;
                }
            }
        },

        /**
         * Format file size for display
         * @param {number} bytes - File size in bytes
         * @returns {string} Formatted size string
         */
        formatFileSize: function (bytes) {
            if (bytes === 0) return '0 Bytes';
            var k = 1024;
            var sizes = ['Bytes', 'KB', 'MB', 'GB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }
    };

    // Inject toast styles
    if (!document.getElementById('ui-utils-styles')) {
        var style = document.createElement('style');
        style.id = 'ui-utils-styles';
        style.textContent = `
            .ui-toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            }
            .ui-toast {
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-left: 3px solid;
                color: white;
                padding: 14px 18px;
                border-radius: 6px;
                min-width: 280px;
                max-width: 400px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(10px);
                opacity: 0;
                transform: translateX(400px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: auto;
                cursor: pointer;
            }
            .ui-toast-show {
                opacity: 1;
                transform: translateX(0);
            }
            .ui-toast-success { border-left-color: #10b981; }
            .ui-toast-error { border-left-color: #ef4444; }
            .ui-toast-warning { border-left-color: #f59e0b; }
            .ui-toast-info { border-left-color: #3b82f6; }
            .ui-toast-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .ui-toast-content .material-symbols-outlined {
                font-size: 20px;
                flex-shrink: 0;
            }
            .ui-toast-success .material-symbols-outlined { color: #10b981; }
            .ui-toast-error .material-symbols-outlined { color: #ef4444; }
            .ui-toast-warning .material-symbols-outlined { color: #f59e0b; }
            .ui-toast-info .material-symbols-outlined { color: #3b82f6; }
            .ui-toast-message {
                font-size: 13px;
                line-height: 1.4;
                font-family: 'JetBrains Mono', monospace;
            }
            .ui-spinner {
                display: inline-block;
                width: 14px;
                height: 14px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top-color: currentColor;
                border-radius: 50%;
                animation: ui-spin 0.6s linear infinite;
                margin-right: 8px;
            }
            @keyframes ui-spin {
                to { transform: rotate(360deg); }
            }
            .ui-loading {
                opacity: 0.7;
                cursor: wait !important;
            }
            .field-valid {
                border-color: #10b981 !important;
                box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2) !important;
            }
            .field-invalid {
                border-color: #ef4444 !important;
                box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2) !important;
            }
            .field-error {
                color: #ef4444;
                font-size: 11px;
                margin-top: 4px;
                font-family: 'JetBrains Mono', monospace;
            }
            .ui-drag-over {
                border-color: #47b4eb !important;
                background: rgba(26, 42, 50, 0.9) !important;
                transform: scale(1.02);
            }
            .ui-drag-drop {
                transition: all 0.2s ease;
            }
            .ui-chip-loader {
                width: 100%;
                max-width: 400px;
            }
            .ui-chip-loader .trace-bg {
                stroke: #333;
                stroke-width: 1.8;
                fill: none;
            }
            .ui-chip-loader .trace-flow {
                stroke-width: 1.8;
                fill: none;
                stroke-dasharray: 40 400;
                stroke-dashoffset: 438;
                filter: drop-shadow(0 0 6px currentColor);
                animation: trace-flow 3s cubic-bezier(0.5, 0, 0.9, 1) infinite;
            }
            .ui-chip-loader .trace-flow.yellow { stroke: #ffea00; color: #ffea00; }
            .ui-chip-loader .trace-flow.blue { stroke: #00ccff; color: #00ccff; }
            .ui-chip-loader .trace-flow.green { stroke: #00ff15; color: #00ff15; }
            .ui-chip-loader .trace-flow.purple { stroke: #9900ff; color: #9900ff; }
            .ui-chip-loader .trace-flow.red { stroke: #ff3300; color: #ff3300; }
            @keyframes trace-flow {
                to { stroke-dashoffset: 0; }
            }
            .ui-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(4px);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            .ui-loading-overlay.show {
                opacity: 1;
                pointer-events: auto;
            }
            .ui-loading-overlay .loading-text {
                color: #00ff88;
                font-family: 'JetBrains Mono', monospace;
                font-size: 14px;
                margin-top: 20px;
                text-shadow: 0 0 10px #00ff88;
                letter-spacing: 2px;
            }
            .ui-blob-btn {
                position: relative;
                font-family: inherit;
                font-size: 14px;
                border-radius: 40em;
                min-width: 10em;
                height: 3em;
                z-index: 1;
                color: white;
                cursor: pointer;
                overflow: hidden;
                border: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .ui-blob-btn .blob-text {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                line-height: 3em;
                border-radius: 40em;
                border: none;
                background: linear-gradient(rgba(255, 255, 255, 0.25), rgba(150, 150, 150, 0.15));
                z-index: 1;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5em;
            }
            .ui-blob-btn .blob {
                position: absolute;
                z-index: -1;
                border-radius: 5em;
                width: 5em;
                height: 3em;
                transition: transform 0.3s ease-in-out, background 0.3s ease-in-out;
            }
            .ui-blob-btn .blob:nth-child(2) {
                left: 0;
                top: 0;
                background: #ff930f;
            }
            .ui-blob-btn .blob:nth-child(3) {
                left: 1.8em;
                top: 0;
                background: #bf0fff;
            }
            .ui-blob-btn .blob:nth-child(4) {
                left: 4em;
                top: -1em;
                background: #ff1b6b;
            }
            .ui-blob-btn .blob:nth-child(5) {
                left: 4.3em;
                top: 1.6em;
                background: #0061ff;
            }
            .ui-blob-btn:hover .blob:nth-child(2) {
                background: #0061ff;
            }
            .ui-blob-btn:hover .blob:nth-child(3) {
                background: #ff1b6b;
            }
            .ui-blob-btn:hover .blob:nth-child(4) {
                background: #bf0fff;
            }
            .ui-blob-btn:hover .blob:nth-child(5) {
                background: #ff930f;
            }
            .ui-blob-btn:hover .blob {
                transform: scale(1.3);
            }
            .ui-blob-btn:active {
                border: 2px solid rgba(255, 255, 255, 0.5);
            }
            .ui-blob-btn:focus-visible {
                outline: 2px solid rgba(255, 255, 255, 0.6);
                outline-offset: 2px;
            }
            .ui-btn {
                --btn-default-bg: rgb(41, 41, 41);
                --btn-padding: 15px 20px;
                --btn-hover-bg: rgb(51, 51, 51);
                --btn-transition: .3s;
                --btn-letter-spacing: .1rem;
                --btn-animation-duration: 1.2s;
                --btn-shadow-color: rgba(0, 0, 0, 0.137);
                --btn-shadow: 0 2px 10px 0 var(--btn-shadow-color);
                --hover-btn-color: #FAC921;
                --default-btn-color: #fff;
                --font-size: 16px;
                --font-weight: 600;
                --font-family: Menlo, Roboto Mono, monospace;
            }
            .ui-btn {
                box-sizing: border-box;
                padding: var(--btn-padding);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--default-btn-color);
                font: var(--font-weight) var(--font-size) var(--font-family);
                background: var(--btn-default-bg);
                border: none;
                cursor: pointer;
                transition: var(--btn-transition);
                overflow: hidden;
                box-shadow: var(--btn-shadow);
            }
            .ui-btn span {
                letter-spacing: var(--btn-letter-spacing);
                transition: var(--btn-transition);
                box-sizing: border-box;
                position: relative;
                background: inherit;
            }
            .ui-btn span::before {
                box-sizing: border-box;
                position: absolute;
                content: "";
                background: inherit;
            }
            .ui-btn:hover, .ui-btn:focus {
                background: var(--btn-hover-bg);
            }
            .ui-btn:hover span, .ui-btn:focus span {
                color: var(--hover-btn-color);
            }
            .ui-btn:hover span::before, .ui-btn:focus span::before {
                animation: chitchat linear both var(--btn-animation-duration);
            }
            @keyframes chitchat {
                0% { content: "#"; }
                5% { content: "."; }
                10% { content: "^{"; }
                15% { content: "-!"; }
                20% { content: "#$_"; }
                25% { content: "№:0"; }
                30% { content: "#{+."; }
                35% { content: "@}-?"; }
                40% { content: "?{4@%"; }
                45% { content: "=.,^!"; }
                50% { content: "?2@%"; }
                55% { content: "\\;1}]"; }
                60% { content: "?{%:%"; right: 0; }
                65% { content: "|{f[4"; right: 0; }
                70% { content: "{4%0%"; right: 0; }
                75% { content: "'1_0<"; right: 0; }
                80% { content: "{0%"; right: 0; }
                85% { content: "]>'"; right: 0; }
                90% { content: "4"; right: 0; }
                95% { content: "2"; right: 0; }
                100% { content: ""; right: 0; }
            }
            .ui-btn:focus-visible {
                outline: 2px solid var(--hover-btn-color);
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show full-screen chip/circuit loader overlay
     * @param {string} message - Optional message to display in chip
     * @returns {Object} Control object with remove method
     */
    window.UIUtils.showMatrixLoader = function (message) {
        message = message || 'Loading';

        var overlay = document.createElement('div');
        overlay.className = 'ui-loading-overlay';
        overlay.id = 'ui-matrix-loader-overlay';

        var loader = document.createElement('div');
        loader.className = 'ui-chip-loader';
        loader.innerHTML = '<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">' +
            '<defs>' +
            '<linearGradient id="chipGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2d2d2d"></stop><stop offset="100%" stop-color="#0f0f0f"></stop></linearGradient>' +
            '<linearGradient id="textGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#eeeeee"></stop><stop offset="100%" stop-color="#888888"></stop></linearGradient>' +
            '<linearGradient id="pinGradient" x1="1" y1="0" x2="0" y2="0"><stop offset="0%" stop-color="#bbbbbb"></stop><stop offset="50%" stop-color="#888888"></stop><stop offset="100%" stop-color="#555555"></stop></linearGradient>' +
            '</defs>' +
            '<g id="traces">' +
            '<path d="M100 100 H200 V210 H326" class="trace-bg"></path><path d="M100 100 H200 V210 H326" class="trace-flow purple"></path>' +
            '<path d="M80 180 H180 V230 H326" class="trace-bg"></path><path d="M80 180 H180 V230 H326" class="trace-flow blue"></path>' +
            '<path d="M60 260 H150 V250 H326" class="trace-bg"></path><path d="M60 260 H150 V250 H326" class="trace-flow yellow"></path>' +
            '<path d="M100 350 H200 V270 H326" class="trace-bg"></path><path d="M100 350 H200 V270 H326" class="trace-flow green"></path>' +
            '<path d="M700 90 H560 V210 H474" class="trace-bg"></path><path d="M700 90 H560 V210 H474" class="trace-flow blue"></path>' +
            '<path d="M740 160 H580 V230 H474" class="trace-bg"></path><path d="M740 160 H580 V230 H474" class="trace-flow green"></path>' +
            '<path d="M720 250 H590 V250 H474" class="trace-bg"></path><path d="M720 250 H590 V250 H474" class="trace-flow red"></path>' +
            '<path d="M680 340 H570 V270 H474" class="trace-bg"></path><path d="M680 340 H570 V270 H474" class="trace-flow yellow"></path>' +
            '</g>' +
            '<rect x="330" y="190" width="140" height="100" rx="20" ry="20" fill="url(#chipGradient)" stroke="#222" stroke-width="3" filter="drop-shadow(0 0 6px rgba(0,0,0,0.8))"></rect>' +
            '<g><rect x="322" y="205" width="8" height="10" fill="url(#pinGradient)" rx="2"></rect><rect x="322" y="225" width="8" height="10" fill="url(#pinGradient)" rx="2"></rect><rect x="322" y="245" width="8" height="10" fill="url(#pinGradient)" rx="2"></rect><rect x="322" y="265" width="8" height="10" fill="url(#pinGradient)" rx="2"></rect></g>' +
            '<g><rect x="470" y="205" width="8" height="10" fill="url(#pinGradient)" rx="2"></rect><rect x="470" y="225" width="8" height="10" fill="url(#pinGradient)" rx="2"></rect><rect x="470" y="245" width="8" height="10" fill="url(#pinGradient)" rx="2"></rect><rect x="470" y="265" width="8" height="10" fill="url(#pinGradient)" rx="2"></rect></g>' +
            '<text x="400" y="240" font-family="Arial, sans-serif" font-size="14" font-weight="bold" letter-spacing="1" fill="url(#textGradient)" text-anchor="middle" dominant-baseline="middle">' + message + '</text>' +
            '<circle cx="100" cy="100" r="5" fill="black"></circle><circle cx="80" cy="180" r="5" fill="black"></circle><circle cx="60" cy="260" r="5" fill="black"></circle><circle cx="100" cy="350" r="5" fill="black"></circle>' +
            '<circle cx="700" cy="90" r="5" fill="black"></circle><circle cx="740" cy="160" r="5" fill="black"></circle><circle cx="720" cy="250" r="5" fill="black"></circle><circle cx="680" cy="340" r="5" fill="black"></circle>' +
            '</svg>';

        overlay.appendChild(loader);
        document.body.appendChild(overlay);

        setTimeout(function () {
            overlay.classList.add('show');
        }, 10);

        return {
            remove: function () {
                overlay.classList.remove('show');
                setTimeout(function () {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 300);
            }
        };
    };
})();

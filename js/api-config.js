/**
 * Shared API configuration - single source of truth for backend URL
 * Load this before any script that makes API calls
 */
(function () {
    'use strict';

    window.API_CONFIG = {
        BASE_URL: 'http://127.0.0.1:8000',
        TEST_TEAM_NAME: 'xyz'
    };

    window.API_CONFIG.getUrl = function (path) {
        var base = this.BASE_URL.replace(/\/$/, '');
        var p = (path || '').replace(/^\//, '');
        return base + (p ? '/' + p : '');
    };
})();

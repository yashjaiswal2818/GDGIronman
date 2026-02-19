/**
 * Leaderboard routing - sets Back and Continue links based on ?from= param
 */
(function () {
    'use strict';

    var ROUTES = {
        1: { back: 'stageone.html', continue: 'stagetwo.html', label: 'STAGE 2' },
        2: { back: 'website.html', continue: 'stagethree.html', label: 'STAGE 3' },
        3: { back: 'stagethree_hub.html', continue: 'stagefour.html', label: 'STAGE 4' },
        4: { back: 'stagefour_logic_hub.html', continue: 'stagefive.html', label: 'STAGE 5' },
        5: { back: 'stagefive.html', continue: 'stagefive_presentation.html', label: 'PRESENTATION' }
    };

    function getFromParam() {
        var params = new URLSearchParams(window.location.search);
        var from = parseInt(params.get('from') || '0', 10);
        return from >= 1 && from <= 5 ? from : 1;
    }

    function init() {
        var from = getFromParam();
        var route = ROUTES[from] || ROUTES[1];

        var backLink = document.getElementById('leaderboard-back-link');
        var continueBtn = document.getElementById('leaderboard-continue-btn');

        if (backLink) backLink.href = route.back;
        if (continueBtn) {
            continueBtn.href = route.continue;
            var span = continueBtn.querySelector('span:first-child');
            if (span) span.textContent = 'CONTINUE TO ' + route.label;
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();

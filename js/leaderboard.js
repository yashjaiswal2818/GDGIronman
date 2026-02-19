/**
 * Leaderboard - fetches data from API and renders dynamically
 * Also handles routing for Back and Continue links
 */
(function () {
    'use strict';

    // Ensure API_CONFIG is loaded
    if (!window.API_CONFIG) {
        console.error('API_CONFIG not found. Make sure api-config.js is loaded first.');
        return;
    }

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

    function setupRouting() {
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

    /**
     * Calculate stages cleared from team score
     * Assuming max score per stage is 20, so 5 stages = 100 max
     */
    function calculateStagesCleared(score) {
        if (!score || score === 0) return 0;
        // Each stage worth ~20 points, max 5 stages
        var stages = Math.min(5, Math.ceil(score / 20));
        return stages;
    }

    /**
     * Format score as percentage (assuming max is 100)
     */
    function formatEfficiency(score) {
        if (!score) return '0.0 points';
        var percentage = Math.min(100, score);
        return percentage.toFixed(1) + ' points';
    }

    /**
     * Render a single leaderboard row
     */
    function renderRow(team, rank) {
        var rankClass = '';
        var rankColor = '';
        var glowClass = '';
        var rankText = rank.toString().padStart(2, '0');

        if (rank === 1) {
            rankClass = 'gold-glow';
            rankColor = 'text-stark-gold';
            glowClass = 'drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]';
        } else if (rank === 2) {
            rankClass = 'silver-glow';
            rankColor = 'text-stark-silver';
            glowClass = 'drop-shadow-[0_0_8px_rgba(192,192,192,0.4)]';
        } else if (rank === 3) {
            rankClass = 'bronze-glow';
            rankColor = 'text-stark-bronze';
            glowClass = 'drop-shadow-[0_0_8px_rgba(205,127,50,0.4)]';
        }

        var stagesCleared = calculateStagesCleared(team.team_score || 0);
        var efficiency = formatEfficiency(team.team_score || 0);

        // Build stage indicators (5 dots)
        var stageDots = '';
        for (var i = 0; i < 5; i++) {
            if (i < stagesCleared) {
                var dotClass = rank <= 3 ? 'bg-primary shadow-[0_0_8px_#13a4ec]' : 'bg-primary/70';
                var dotSize = rank <= 3 ? 'h-2 w-2' : 'h-1.5 w-1.5';
                stageDots += '<div class="' + dotSize + ' rounded-full ' + dotClass + '"></div>';
            } else {
                var emptyDotSize = rank <= 3 ? 'h-2 w-2' : 'h-1.5 w-1.5';
                stageDots += '<div class="' + emptyDotSize + ' rounded-full bg-white/10"></div>';
            }
        }

        var isTopThree = rank <= 3;
        var rowClass = isTopThree
            ? 'group relative grid grid-cols-12 gap-4 px-6 py-5 items-center border-b border-white/5 hover:bg-white/[0.03] transition-all duration-300 cursor-default'
            : 'grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/5 hover:bg-white/[0.03] transition-colors duration-200';

        var rankDisplay = isTopThree
            ? '<span class="text-2xl font-bold ' + rankColor + ' ' + glowClass + '">' + rankText + '</span>'
            : '<span class="text-lg font-medium text-slate-500 font-mono">' + rankText + '</span>';

        var teamNameDisplay = isTopThree
            ? '<div class="text-white font-semibold tracking-wide text-lg">' + escapeHtml(team.Team_Name) + '</div>'
            : '<div class="text-slate-200 font-medium tracking-wide">' + escapeHtml(team.Team_Name) + '</div>';

        var glowBorder = isTopThree
            ? '<div class="absolute inset-x-2 inset-y-1 rounded-lg border border-transparent ' + rankClass + ' opacity-' + (rank === 1 ? '60' : '40') + ' group-hover:opacity-' + (rank === 1 ? '100' : '80') + ' transition-opacity"></div>'
            : '';

        var efficiencyDisplay = isTopThree
            ? '<span class="text-xl font-bold text-white">' + efficiency + '</span>'
            : '<span class="text-lg font-medium text-slate-300">' + efficiency + '</span>';

        return '<div class="' + rowClass + '">' +
            glowBorder +
            '<div class="col-span-1 relative z-10 text-center">' + rankDisplay + '</div>' +
            '<div class="col-span-5 md:col-span-4 pl-4 relative z-10">' +
            teamNameDisplay +
            '</div>' +
            '<div class="col-span-3 md:col-span-4 flex justify-center items-center gap-1.5 relative z-10">' +
            stageDots +
            '<span class="ml-2 text-xs ' + (isTopThree ? 'text-primary/80' : 'text-slate-500') + ' font-mono">' + stagesCleared + '/5</span>' +
            '</div>' +
            '<div class="col-span-3 text-right pr-4 relative z-10">' + efficiencyDisplay + '</div>' +
            '</div>';
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Fetch leaderboard data from API
     */
    async function fetchLeaderboard() {
        try {
            var url = window.API_CONFIG.getUrl('/leaderboard');
            var response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard: ' + response.status);
            }

            var data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }

    /**
     * Render leaderboard rows
     */
    function renderLeaderboard(teams) {
        var container = document.querySelector('.overflow-y-auto.flex-1');
        if (!container) {
            console.error('Leaderboard container not found');
            return;
        }

        // Clear existing content (except header)
        container.innerHTML = '';

        if (teams.length === 0) {
            container.innerHTML = '<div class="px-6 py-12 text-center text-slate-400"><p>No teams found. Be the first to register!</p></div>';
            return;
        }

        // Render each team
        teams.forEach(function (team, index) {
            var rank = index + 1;
            container.innerHTML += renderRow(team, rank);
        });

        // Update footer stats
        updateFooterStats(teams);
    }

    /**
     * Update footer statistics
     */
    function updateFooterStats(teams) {
        var totalSquads = document.querySelector('footer .text-white.text-base');
        if (totalSquads && teams.length > 0) {
            totalSquads.textContent = teams.length;
        }
    }

    /**
     * Show loading state
     */
    function showLoading() {
        var container = document.querySelector('.overflow-y-auto.flex-1');
        if (container) {
            container.innerHTML = '<div class="px-6 py-12 text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><p class="mt-4 text-slate-400">Loading rankings...</p></div>';
        }
    }

    /**
     * Initialize leaderboard
     */
    async function init() {
        setupRouting();
        showLoading();

        var teams = await fetchLeaderboard();
        renderLeaderboard(teams);
    }

    // Wait for DOM and API_CONFIG
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

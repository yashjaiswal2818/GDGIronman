/**
 * Stage 2: Jarvis Command Room
 * Handles Stage 2 briefing (stagetwo.html) and AI Knowledge Ingestion Core (website.html)
 * Backend: POST /round_2 (Team_Name, git_hub_link, hosted_link, files)
 */
(function () {
    'use strict';

    var API_BASE = 'http://127.0.0.1:8000';
    var ROUND_2_ENDPOINT = API_BASE + '/round_2';
    var TEST_TEAM_NAME = 'm'; // fallback for testing without registration

    /**
     * Initializes the team badge display from sessionStorage.
     */
    function initTeamBadge() {
        var teamName = sessionStorage.getItem('teamName');
        var badge = document.getElementById('stagetwo-team-badge') || document.getElementById('website-team-badge');
        var displayEl = document.getElementById('display-team-name');

        if (teamName && badge && displayEl) {
            displayEl.textContent = teamName;
            badge.classList.remove('hidden');
            badge.classList.add('flex');
        }
    }

    /**
     * Validates uploads on website.html and shows feedback.
     */
    function initSubmitPrototype() {
        var btn = document.getElementById('submit-prototype-btn');
        var proceedBtn = document.getElementById('proceed-anyway-btn');
        var proceedWrap = document.getElementById('proceed-anyway-wrap');
        var feedback = document.getElementById('upload-feedback');
        var imageInput = document.getElementById('image-input');
        var webUrl = document.getElementById('web-url');
        var repoLink = document.getElementById('repo-link');
        var statusVisual = document.getElementById('status-visual');
        var statusNetwork = document.getElementById('status-network');
        var statusRepository = document.getElementById('status-repository');

        if (!btn) return;

        function showUploadStatus() {
            var hasImage = imageInput && imageInput.files && imageInput.files.length > 0;
            var hasWebUrl = webUrl && webUrl.value && webUrl.value.trim().length > 0;
            var hasRepo = repoLink && repoLink.value && repoLink.value.trim().length > 0;

            // Update status panel
            if (statusVisual) {
                statusVisual.textContent = hasImage ? 'UPLOADED' : 'PENDING';
                statusVisual.className = 'terminal-line text-xs tracking-wide ' + (hasImage ? 'text-ingest-green' : 'text-amber-500');
            }
            if (statusNetwork) {
                statusNetwork.textContent = hasWebUrl ? 'UPLOADED' : 'PENDING';
                statusNetwork.className = 'terminal-line text-xs tracking-wide ' + (hasWebUrl ? 'text-ingest-green' : 'text-amber-500');
            }
            if (statusRepository) {
                statusRepository.textContent = hasRepo ? 'UPLOADED' : 'PENDING';
                statusRepository.className = 'terminal-line text-xs tracking-wide ' + (hasRepo ? 'text-ingest-green' : 'text-amber-500');
            }

            // Show feedback message
            if (feedback) {
                feedback.classList.remove('hidden');
                var complete = [hasImage ? 'IMAGE' : null, hasWebUrl ? 'WEB_URL' : null, hasRepo ? 'REPO_LINK' : null].filter(Boolean);
                var pending = [!hasImage ? 'IMAGE_INPUT' : null, !hasWebUrl ? 'WEB_URL' : null, !hasRepo ? 'REPO_LINK' : null].filter(Boolean);

                var msg = '';
                if (complete.length > 0) {
                    msg += '<span class="text-ingest-green">UPLOADED: ' + complete.join(', ') + '</span>';
                }
                if (pending.length > 0) {
                    msg += (msg ? '<br/>' : '') + '<span class="text-amber-500">PENDING: ' + pending.join(', ') + '</span>';
                }
                feedback.innerHTML = msg;
                feedback.className = 'mb-3 p-4 rounded-lg border text-xs font-mono ' +
                    (pending.length === 0 ? 'border-ingest-green/50 bg-ingest-green/5' : 'border-amber-500/50 bg-amber-500/5');
            }

            return { hasImage: hasImage, hasWebUrl: hasWebUrl, hasRepo: hasRepo };
        }

        btn.addEventListener('click', function () {
            var status = showUploadStatus();

            if (status.hasImage && status.hasWebUrl && status.hasRepo) {
                submitToBackend();
            } else if (proceedWrap) {
                proceedWrap.classList.remove('hidden');
            }
        });

        if (proceedBtn) {
            proceedBtn.addEventListener('click', function () {
                window.location.href = 'leaderboard.html?from=2';
            });
        }

        function submitToBackend() {
            var teamName = (sessionStorage.getItem('teamName') || '').trim() || TEST_TEAM_NAME;
            var hostedLink = webUrl ? webUrl.value.trim() : '';
            var gitHubLink = repoLink ? repoLink.value.trim() : '';
            var fileList = imageInput && imageInput.files ? imageInput.files : [];

            if (!teamName) {
                if (feedback) {
                    feedback.classList.remove('hidden');
                    feedback.innerHTML = '<span class="text-amber-500">Register first. No team name in session.</span>';
                    feedback.className = 'mb-3 p-4 rounded-lg border border-amber-500/50 bg-amber-500/5 text-xs font-mono';
                }
                return;
            }

            var formData = new FormData();
            formData.append('Team_Name', teamName);
            formData.append('git_hub_link', gitHubLink);
            formData.append('hosted_link', hostedLink);
            for (var i = 0; i < fileList.length; i++) {
                formData.append('files', fileList[i]);
            }

            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined text-base animate-pulse">hourglass_empty</span><span>TRANSMITTING…</span>';
            if (feedback) {
                feedback.classList.remove('hidden');
                feedback.innerHTML = '<span class="text-hologram">Transmitting to backend…</span>';
                feedback.className = 'mb-3 p-4 rounded-lg border border-hologram/30 bg-black/50 text-xs font-mono';
            }

            fetch(ROUND_2_ENDPOINT, {
                method: 'POST',
                body: formData
            })
                .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, status: res.status, data: data }; }); })
                .then(function (result) {
                    if (result.ok) {
                        if (feedback) {
                            feedback.innerHTML = '<span class="text-ingest-green">Submitted successfully.' + (result.data.urls && result.data.urls.length ? ' ' + result.data.urls.length + ' file(s) uploaded.' : '') + '</span>';
                            feedback.className = 'mb-3 p-4 rounded-lg border border-ingest-green/50 bg-ingest-green/5 text-xs font-mono';
                        }
                        setTimeout(function () {
                            window.location.href = 'leaderboard.html?from=2';
                        }, 800);
                    } else {
                        var msg = (result.data && result.data.detail) ? (typeof result.data.detail === 'string' ? result.data.detail : JSON.stringify(result.data.detail)) : 'Submission failed: ' + result.status;
                        if (feedback) {
                            feedback.innerHTML = '<span class="text-red-400">' + msg + '</span>';
                            feedback.className = 'mb-3 p-4 rounded-lg border border-red-500/50 bg-red-500/5 text-xs font-mono';
                        }
                        btn.disabled = false;
                        btn.innerHTML = '<span class="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">send</span><span class="tracking-wide">SUBMIT THE PROTOTYPE</span>';
                    }
                })
                .catch(function (err) {
                    if (feedback) {
                        feedback.innerHTML = '<span class="text-red-400">Network error: ' + (err.message || 'Could not reach server.') + '</span>';
                        feedback.className = 'mb-3 p-4 rounded-lg border border-red-500/50 bg-red-500/5 text-xs font-mono';
                    }
                    btn.disabled = false;
                    btn.innerHTML = '<span class="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">send</span><span class="tracking-wide">SUBMIT THE PROTOTYPE</span>';
                });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initTeamBadge();
        initSubmitPrototype();
    });
})();

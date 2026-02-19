/**
 * Stage 3: Mark UI Design Bay
 * Handles stagethree_hub.html - Uplink Protocol
 * Backend: POST /round_3 (Team_Name, figma_links, description, files)
 */
(function () {
    'use strict';

    var API_BASE = 'http://127.0.0.1:8000';
    var ROUND_3_ENDPOINT = API_BASE + '/round_3';
    var TEST_TEAM_NAME = 'xyz';

    var previewObjectUrls = [];

    function getTeamName() {
        return (sessionStorage.getItem('teamName') || '').trim() || TEST_TEAM_NAME;
    }

    function isImageFile(file) {
        return file.type && file.type.indexOf('image/') === 0;
    }

    function setFileInputFiles(input, files) {
        if (!input || !files) return;
        var dt = new DataTransfer();
        for (var i = 0; i < files.length; i++) dt.items.add(files[i]);
        input.files = dt.files;
    }

    function renderPreviews(filesInput, previewWrap, previewEl) {
        previewObjectUrls.forEach(function (url) { URL.revokeObjectURL(url); });
        previewObjectUrls = [];

        if (!previewEl) return;
        previewEl.innerHTML = '';

        if (!previewWrap) return;
        if (!filesInput || !filesInput.files || filesInput.files.length === 0) {
            previewWrap.classList.add('hidden');
            return;
        }

        previewWrap.classList.remove('hidden');
        var files = filesInput.files;

        for (var i = 0; i < files.length; i++) {
            (function (index) {
                var file = files[index];
                var card = document.createElement('div');
                card.className = 'flex-shrink-0 rounded border border-primary/30 bg-[#15232b]/80 overflow-hidden relative';

                if (isImageFile(file)) {
                    var url = URL.createObjectURL(file);
                    previewObjectUrls.push(url);
                    var img = document.createElement('img');
                    img.src = url;
                    img.alt = file.name;
                    img.className = 'block w-20 h-20 md:w-24 md:h-24 object-cover';
                    card.appendChild(img);
                } else {
                    card.style.width = '6rem';
                    card.style.height = '6rem';
                    card.className += ' flex flex-col items-center justify-center p-2';
                    var icon = document.createElement('span');
                    icon.className = 'material-symbols-outlined text-primary text-2xl';
                    icon.textContent = 'image';
                    card.appendChild(icon);
                }

                var nameWrap = document.createElement('div');
                nameWrap.className = 'px-1.5 py-1 truncate text-[9px] text-white/80 font-mono max-w-[5.5rem]';
                nameWrap.title = file.name;
                nameWrap.textContent = file.name;
                card.appendChild(nameWrap);

                var removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 hover:bg-red-500/90 text-white flex items-center justify-center transition-colors';
                removeBtn.setAttribute('aria-label', 'Remove');
                removeBtn.innerHTML = '<span class="material-symbols-outlined text-xs">close</span>';
                removeBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var newFiles = [];
                    for (var j = 0; j < files.length; j++) {
                        if (j !== index) newFiles.push(files[j]);
                    }
                    setFileInputFiles(filesInput, newFiles);
                    renderPreviews(filesInput, previewWrap, previewEl);
                    var label = document.getElementById('upload-area-label');
                    if (label) label.textContent = newFiles.length ? newFiles.length + ' FILE(S) SELECTED' : 'INITIATE UPLOAD (multiple images)';
                });
                card.appendChild(removeBtn);

                previewEl.appendChild(card);
            })(i);
        }
    }

    function init() {
        var transmitBtn = document.getElementById('transmit-data-btn');
        var figmaInput = document.getElementById('figma-link');
        var descInput = document.getElementById('tactical-rationale');
        var filesInput = document.getElementById('interface-schematics');
        var uploadArea = document.getElementById('upload-area');
        var feedbackEl = document.getElementById('stage3-feedback');
        var previewWrap = document.getElementById('stage3-preview-wrap');
        var previewEl = document.getElementById('stage3-preview');

        // File upload area click
        if (uploadArea && filesInput) {
            uploadArea.addEventListener('click', function () {
                filesInput.click();
            });
            filesInput.addEventListener('change', function () {
                var count = this.files ? this.files.length : 0;
                var label = document.getElementById('upload-area-label');
                if (label) label.textContent = count ? count + ' FILE(S) SELECTED' : 'INITIATE UPLOAD (multiple images)';
                renderPreviews(filesInput, previewWrap, previewEl);
            });
        }

        if (!transmitBtn) return;

        transmitBtn.addEventListener('click', function (e) {
            e.preventDefault();

            var teamName = getTeamName();
            var figmaLinks = figmaInput ? figmaInput.value.trim() : '';
            var description = descInput ? descInput.value.trim() : '';
            var fileList = filesInput && filesInput.files ? filesInput.files : [];

            if (!figmaLinks) {
                showFeedback(feedbackEl, 'Figma source link is required.', true);
                return;
            }

            if (fileList.length === 0) {
                showFeedback(feedbackEl, 'Please upload at least one interface schematic.', true);
                return;
            }

            var formData = new FormData();
            formData.append('Team_Name', teamName);
            formData.append('figma_links', figmaLinks);
            formData.append('description', description);
            for (var i = 0; i < fileList.length; i++) {
                formData.append('files', fileList[i]);
            }

            transmitBtn.disabled = true;
            transmitBtn.innerHTML = '<span class="material-symbols-outlined !text-[16px] animate-pulse">hourglass_empty</span><span>TRANSMITTING…</span>';
            showFeedback(feedbackEl, 'Transmitting to backend…', false);

            fetch(ROUND_3_ENDPOINT, {
                method: 'POST',
                body: formData
            })
                .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, status: res.status, data: data }; }); })
                .then(function (result) {
                    if (result.ok) {
                        showFeedback(feedbackEl, 'Submitted successfully.' + (result.data.urls && result.data.urls.length ? ' ' + result.data.urls.length + ' file(s) uploaded.' : ''), false);
                        setTimeout(function () {
                            window.location.href = 'leaderboard.html?from=3';
                        }, 800);
                    } else {
                        var msg = (result.data && result.data.detail) ? (typeof result.data.detail === 'string' ? result.data.detail : JSON.stringify(result.data.detail)) : 'Submission failed: ' + result.status;
                        showFeedback(feedbackEl, msg, true);
                        transmitBtn.disabled = false;
                        transmitBtn.innerHTML = '<span class="relative z-10 flex items-center justify-center gap-2">TRANSMIT DATA<span class="material-symbols-outlined !text-[16px] group-hover:translate-x-1 transition-transform">send</span></span>';
                    }
                })
                .catch(function (err) {
                    showFeedback(feedbackEl, 'Network error: ' + (err.message || 'Could not reach server.'), true);
                    transmitBtn.disabled = false;
                    transmitBtn.innerHTML = '<span class="relative z-10 flex items-center justify-center gap-2">TRANSMIT DATA<span class="material-symbols-outlined !text-[16px] group-hover:translate-x-1 transition-transform">send</span></span>';
                });
        });
    }

    function showFeedback(el, text, isError) {
        if (!el) return;
        el.textContent = text;
        el.classList.remove('hidden');
        el.className = 'text-xs font-mono py-2 ' + (isError ? 'text-red-400' : 'text-emerald-400');
    }

    var stage3Timer = null;

    function initTimer() {
        var timerWrap = document.getElementById('stage3-timer');
        var timerDisplay = document.getElementById('stage3-timer-display');
        var transmitBtn = document.getElementById('transmit-data-btn');

        if (!timerWrap || !timerDisplay) return;

        timerWrap.classList.remove('hidden');
        timerWrap.classList.add('flex');

        stage3Timer = window.TimerUtils.init('STAGE_3_DURATION', timerDisplay, function () {
            if (transmitBtn) {
                transmitBtn.disabled = true;
                transmitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            var feedback = document.getElementById('stage3-feedback');
            if (feedback) {
                feedback.classList.remove('hidden');
                feedback.textContent = 'Time is up. Submission disabled.';
                feedback.className = 'text-xs font-mono py-2 text-red-500';
            }
        });

        stage3Timer.start();
    }

    function init() {
        var transmitBtn = document.getElementById('transmit-data-btn');
        var figmaInput = document.getElementById('figma-link');
        var descInput = document.getElementById('tactical-rationale');
        var filesInput = document.getElementById('interface-schematics');
        var uploadArea = document.getElementById('upload-area');
        var feedbackEl = document.getElementById('stage3-feedback');
        var previewWrap = document.getElementById('stage3-preview-wrap');
        var previewEl = document.getElementById('stage3-preview');

        // File upload area click
        if (uploadArea && filesInput) {
            uploadArea.addEventListener('click', function () {
                filesInput.click();
            });
            filesInput.addEventListener('change', function () {
                var count = this.files ? this.files.length : 0;
                var label = document.getElementById('upload-area-label');
                if (label) label.textContent = count ? count + ' FILE(S) SELECTED' : 'INITIATE UPLOAD (multiple images)';
                renderPreviews(filesInput, previewWrap, previewEl);
            });
        }

        if (!transmitBtn) return;

        transmitBtn.addEventListener('click', function (e) {
            e.preventDefault();

            if (stage3Timer && stage3Timer.getRemaining() <= 0) {
                showFeedback(feedbackEl, 'Time is up. Submission disabled.', true);
                return;
            }

            var teamName = getTeamName();
            var figmaLinks = figmaInput ? figmaInput.value.trim() : '';
            var description = descInput ? descInput.value.trim() : '';
            var fileList = filesInput && filesInput.files ? filesInput.files : [];

            if (!figmaLinks) {
                showFeedback(feedbackEl, 'Figma source link is required.', true);
                return;
            }

            if (fileList.length === 0) {
                showFeedback(feedbackEl, 'Please upload at least one interface schematic.', true);
                return;
            }

            var formData = new FormData();
            formData.append('Team_Name', teamName);
            formData.append('figma_links', figmaLinks);
            formData.append('description', description);
            for (var i = 0; i < fileList.length; i++) {
                formData.append('files', fileList[i]);
            }

            transmitBtn.disabled = true;
            transmitBtn.innerHTML = '<span class="material-symbols-outlined !text-[16px] animate-pulse">hourglass_empty</span><span>TRANSMITTING…</span>';
            showFeedback(feedbackEl, 'Transmitting to backend…', false);

            fetch(ROUND_3_ENDPOINT, {
                method: 'POST',
                body: formData
            })
                .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, status: res.status, data: data }; }); })
                .then(function (result) {
                    if (result.ok) {
                        showFeedback(feedbackEl, 'Submitted successfully.' + (result.data.urls && result.data.urls.length ? ' ' + result.data.urls.length + ' file(s) uploaded.' : ''), false);
                        if (stage3Timer) stage3Timer.stop();
                        setTimeout(function () {
                            window.location.href = 'leaderboard.html?from=3';
                        }, 800);
                    } else {
                        var msg = (result.data && result.data.detail) ? (typeof result.data.detail === 'string' ? result.data.detail : JSON.stringify(result.data.detail)) : 'Submission failed: ' + result.status;
                        showFeedback(feedbackEl, msg, true);
                        transmitBtn.disabled = false;
                        transmitBtn.innerHTML = '<span class="relative z-10 flex items-center justify-center gap-2">TRANSMIT DATA<span class="material-symbols-outlined !text-[16px] group-hover:translate-x-1 transition-transform">send</span></span>';
                    }
                })
                .catch(function (err) {
                    showFeedback(feedbackEl, 'Network error: ' + (err.message || 'Could not reach server.'), true);
                    transmitBtn.disabled = false;
                    transmitBtn.innerHTML = '<span class="relative z-10 flex items-center justify-center gap-2">TRANSMIT DATA<span class="material-symbols-outlined !text-[16px] group-hover:translate-x-1 transition-transform">send</span></span>';
                });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (window.TimerUtils) {
            initTimer();
        }
        init();
    });
})();

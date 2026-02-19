/**
 * Stage 5: Arc Reactor Pitch
 * Handles stagefive_presentation.html - Innovation Pitch submission
 * Backend: POST /round_5 (Team_Name, abstract, score_5, files)
 * Requires: api-config.js, form-utils.js
 */
(function () {
    'use strict';

    var ROUND_5_ENDPOINT = (window.API_CONFIG && window.API_CONFIG.getUrl('round_5')) || 'http://127.0.0.1:8000/round_5';

    var formEl = document.getElementById('round5-form');
    var codenameEl = document.getElementById('round5-codename');
    var abstractEl = document.getElementById('round5-abstract');
    var filesInput = document.getElementById('round5-files');
    var filesLabel = document.getElementById('round5-files-label');
    var previewEl = document.getElementById('round5-preview');
    var submitBtn = document.getElementById('round5-submit-btn');
    var messageEl = document.getElementById('round5-message');

    var previewObjectUrls = [];
    var stage5Timer = null;

    function getTeamName() {
        return (window.FormUtils && window.FormUtils.getTeamName()) || (sessionStorage.getItem('teamName') || '').trim() || 'xyz';
    }

    function showMessage(text, isError) {
        if (!messageEl) return;
        messageEl.textContent = text;
        messageEl.classList.remove('hidden', 'text-stark-red', 'text-stark-blue');
        messageEl.classList.add(isError ? 'text-stark-red' : 'text-stark-blue');
    }

    function hideMessage() {
        if (messageEl) messageEl.classList.add('hidden');
    }

    function isImageFile(file) {
        return file.type && file.type.indexOf('image/') === 0;
    }

    function renderPreviews(files) {
        if (!previewEl) return;
        previewObjectUrls.forEach(function (url) { URL.revokeObjectURL(url); });
        previewObjectUrls = [];
        previewEl.innerHTML = '';
        previewEl.classList.add('hidden');
        if (!files || files.length === 0) return;

        previewEl.classList.remove('hidden');
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var card = document.createElement('div');
            card.className = 'flex-shrink-0 rounded border border-[#C6A15B]/30 bg-black/40 overflow-hidden';
            if (isImageFile(file)) {
                var url = URL.createObjectURL(file);
                previewObjectUrls.push(url);
                var img = document.createElement('img');
                img.src = url;
                img.alt = file.name;
                img.className = 'block w-20 h-20 md:w-24 md:h-24 object-cover';
                card.style.width = '5rem';
                card.style.maxWidth = '6rem';
                card.appendChild(img);
                var nameWrap = document.createElement('div');
                nameWrap.className = 'px-1.5 py-1 truncate text-[9px] md:text-[10px] text-white/80 font-mono max-w-[5rem] md:max-w-[6rem]';
                nameWrap.title = file.name;
                nameWrap.textContent = file.name;
                card.appendChild(nameWrap);
            } else {
                card.className += ' flex flex-col items-center justify-center p-3 w-24 md:w-28';
                var icon = document.createElement('span');
                icon.className = 'material-symbols-outlined text-[#C6A15B] text-2xl md:text-3xl mb-1';
                icon.textContent = 'description';
                card.appendChild(icon);
                var nameWrap = document.createElement('div');
                nameWrap.className = 'text-[9px] md:text-[10px] text-white/80 font-mono text-center truncate w-full px-1';
                nameWrap.title = file.name;
                nameWrap.textContent = file.name;
                card.appendChild(nameWrap);
            }
            previewEl.appendChild(card);
        }
    }

    if (filesInput) {
        filesInput.addEventListener('change', function () {
            var files = this.files;
            var count = files ? files.length : 0;
            if (filesLabel) {
                filesLabel.textContent = count ? count + ' FILE(S) SELECTED' : 'PORT READY';
            }
            renderPreviews(files);
        });
    }

    function initTimer() {
        var timerWrap = document.getElementById('stage5-timer');
        var timerDisplay = document.getElementById('stage5-timer-display');
        var submitBtn = document.getElementById('round5-submit-btn');

        if (!timerWrap || !timerDisplay) return;

        timerWrap.classList.remove('hidden');
        timerWrap.classList.add('flex');

        stage5Timer = window.TimerUtils.init('STAGE_5_DURATION', timerDisplay, function () {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            if (messageEl) {
                showMessage('Time is up. Submission disabled.', true);
            }
        });

        stage5Timer.start();
    }

    function handleSubmit(e) {
        if (e && e.preventDefault) e.preventDefault();

        (async function () {
            if (stage5Timer && stage5Timer.getRemaining() <= 0) {
                if (window.UIUtils) {
                    window.UIUtils.showToast('Time is up. Submission disabled.', 'error', 3000);
                } else {
                    showMessage('Time is up. Submission disabled.', true);
                }
                return;
            }

            var teamName = getTeamName();
            var codename = codenameEl ? (codenameEl.value || '').trim() : '';
            if (!codename) {
                showMessage('Project Codename is required.', true);
                return;
            }
            var abstract = abstractEl ? (abstractEl.value || '').trim() : '';
            if (!abstract) {
                showMessage('Technical Abstract is required.', true);
                return;
            }
            var fileList = filesInput && filesInput.files ? filesInput.files : [];
            if (fileList.length === 0) {
                showMessage('Please upload at least one file (PDF, PPT, PPTX, KEY, or images).', true);
                return;
            }
            if (fileList.length > 0 && window.FormUtils && window.FormUtils.validateFileSize) {
                var fs = window.FormUtils.validateFileSize(fileList);
                if (!fs.valid) {
                    showMessage(fs.message, true);
                    return;
                }
            }

            var formData = new FormData();
            formData.append('Team_Name', teamName);
            formData.append('abstract', abstract);
            formData.append('score_5', '0');
            for (var i = 0; i < fileList.length; i++) {
                formData.append('files', fileList[i]);
            }

            var matrixLoader = null;
            if (window.UIUtils) {
                window.UIUtils.setButtonLoading(submitBtn, true, 'Transmitting...');
                matrixLoader = window.UIUtils.showMatrixLoader('TRANSMITTING');
            } else {
                submitBtn.disabled = true;
                hideMessage();
                showMessage('Transmitting...', false);
            }

            try {
                var res = await fetch(ROUND_5_ENDPOINT, {
                    method: 'POST',
                    body: formData
                });
                var data = await res.json().catch(function () { return {}; });
                if (matrixLoader) matrixLoader.remove();
                if (res.ok) {
                    var successMsg = 'Submitted successfully. ' + (data.urls && data.urls.length ? data.urls.length + ' file(s) uploaded.' : '');
                    if (window.UIUtils) {
                        window.UIUtils.showToast(successMsg, 'success', 2000);
                        window.UIUtils.setButtonLoading(submitBtn, false);
                    } else {
                        showMessage(successMsg, false);
                    }
                    if (stage5Timer) stage5Timer.stop();
                    setTimeout(function () {
                        window.location.href = 'leaderboard.html?from=5';
                    }, 1500);
                } else {
                    var errMsg = data.detail || 'Submission failed: ' + res.status;
                    if (window.UIUtils) {
                        window.UIUtils.showToast(errMsg, 'error', 4000);
                        window.UIUtils.setButtonLoading(submitBtn, false);
                    } else {
                        showMessage(errMsg, true);
                        submitBtn.disabled = false;
                    }
                }
            } catch (err) {
                if (matrixLoader) matrixLoader.remove();
                var netErr = 'Network error: ' + (err.message || 'Could not reach server.');
                if (window.UIUtils) {
                    window.UIUtils.showToast(netErr, 'error', 4000);
                    window.UIUtils.setButtonLoading(submitBtn, false);
                } else {
                    showMessage(netErr, true);
                    submitBtn.disabled = false;
                }
            }
        })();

        return false;
    }

    if (formEl) {
        formEl.addEventListener('submit', handleSubmit);
    } else if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }

    if (window.TimerUtils) {
        initTimer();
    }
})();

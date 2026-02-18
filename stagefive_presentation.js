/**
 * Stark OS v8.5 Elite Hub - Round 5 (Innovation Pitch) submission
 * Submits to POST http://127.0.0.1:8000/round_5
 */
(function () {
    'use strict';

    const API_BASE = 'http://127.0.0.1:8000';
    const ROUND_5_ENDPOINT = API_BASE + '/round_5';

    const formEl = document.getElementById('round5-form');
    const codenameEl = document.getElementById('round5-codename');
    const abstractEl = document.getElementById('round5-abstract');
    const filesInput = document.getElementById('round5-files');
    const filesLabel = document.getElementById('round5-files-label');
    const previewEl = document.getElementById('round5-preview');
    const submitBtn = document.getElementById('round5-submit-btn');
    const messageEl = document.getElementById('round5-message');

    var previewObjectUrls = [];

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

    function handleSubmit(e) {
        if (e && e.preventDefault) e.preventDefault();

        (async function () {
         //   var teamName = sessionStorage.getItem('teamName');
         //   if (!teamName || !teamName.trim()) {
              //  showMessage('Register first. No team name in //session.', true);
             //   return;
         //   }
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

            var formData = new FormData();
            formData.append('Team_Name', "xyz");
            formData.append('abstract', abstract);
            formData.append('score_5', '0');
            for (var i = 0; i < fileList.length; i++) {
                formData.append('files', fileList[i]);
            }

            submitBtn.disabled = true;
            hideMessage();
            showMessage('Transmitting...', false);

            try {
                var res = await fetch(ROUND_5_ENDPOINT, {
                    method: 'POST',
                    body: formData
                });
                var data = await res.json().catch(function () { return {}; });
                if (res.ok) {
                    showMessage('Submitted successfully. ' + (data.urls && data.urls.length ? data.urls.length + ' file(s) uploaded.' : ''), false);
                } else {
                    showMessage(data.detail || 'Submission failed: ' + res.status, true);
                }
            } catch (err) {
                showMessage('Network error: ' + (err.message || 'Could not reach server.'), true);
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        })();

        return false;
    }

    if (formEl) {
        formEl.addEventListener('submit', handleSubmit);
    } else if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }
})();

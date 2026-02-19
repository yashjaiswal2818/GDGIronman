/**
 * Stage 4: Friday Logic Core
 * Handles stagefour_logic_hub.html - Logic nodes + tactical rationale
 * Backend: POST /round_4 (JSON: Team_Name, structured_submission, status_4, question, score_4)
 * Requires: api-config.js, form-utils.js
 */
(function () {
    'use strict';

    var ROUND_4_ENDPOINT = (window.API_CONFIG && window.API_CONFIG.getUrl('round_4')) || 'http://127.0.0.1:8000/round_4';

    function getTeamName() {
        return (window.FormUtils && window.FormUtils.getTeamName()) || (sessionStorage.getItem('teamName') || '').trim() || 'xyz';
    }

    function collectLogicNodes() {
        var conditions = document.querySelectorAll('.logic-condition');
        var actions = document.querySelectorAll('.logic-action');
        var nodes = [];
        var len = Math.min(conditions.length, actions.length);
        for (var i = 0; i < len; i++) {
            var condition = conditions[i] && conditions[i].value ? conditions[i].value.trim() : '';
            var action = actions[i] && actions[i].value ? actions[i].value.trim() : '';
            nodes.push({ condition: condition, action: action });
        }
        return nodes;
    }

    var stage4Timer = null;

    function initTimer() {
        var timerWrap = document.getElementById('stage4-timer');
        var timerDisplay = document.getElementById('stage4-timer-display');
        var submitBtn = document.getElementById('initialize-uplink-btn');

        if (!timerWrap || !timerDisplay) return;

        timerWrap.classList.remove('hidden');
        timerWrap.classList.add('flex');

        stage4Timer = window.TimerUtils.init('STAGE_4_DURATION', timerDisplay, function () {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            var feedback = document.getElementById('stage4-feedback');
            if (feedback) {
                feedback.classList.remove('hidden');
                feedback.textContent = 'Time is up. Submission disabled.';
                feedback.className = 'text-xs font-mono py-2 text-red-500';
            }
        });

        stage4Timer.start();
    }

    function init() {
        var submitBtn = document.getElementById('initialize-uplink-btn');
        var tacticalEl = document.getElementById('tactical-rationale');
        var feedbackEl = document.getElementById('stage4-feedback');

        if (!submitBtn) return;

        submitBtn.addEventListener('click', function (e) {
            e.preventDefault();

            if (stage4Timer && stage4Timer.getRemaining() <= 0) {
                if (window.UIUtils) {
                    window.UIUtils.showToast('Time is up. Submission disabled.', 'error', 3000);
                } else {
                    showFeedback(feedbackEl, 'Time is up. Submission disabled.', true);
                }
                return;
            }

            var teamName = getTeamName();
            var nodes = collectLogicNodes();
            var structuredSubmission = JSON.stringify(nodes);
            var question = tacticalEl ? tacticalEl.value.trim() : '';
            var status_4 = 'Submitted';
            var score_4 = 0;

            if (nodes.length === 0 || (nodes.length === 1 && !nodes[0].condition && !nodes[0].action)) {
                showFeedback(feedbackEl, 'Add at least one logic node (condition + action).', true);
                return;
            }

            var payload = {
                Team_Name: teamName,
                structured_submission: structuredSubmission,
                status_4: status_4,
                question: question,
                score_4: score_4
            };

            var matrixLoader = null;
            if (window.UIUtils) {
                window.UIUtils.setButtonLoading(submitBtn, true, 'TRANSMITTING…');
                matrixLoader = window.UIUtils.showMatrixLoader('TRANSMITTING');
            } else {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="material-symbols-outlined text-xl animate-pulse">hourglass_empty</span><span class="text-sm font-bold tracking-[0.2em] uppercase relative z-10">TRANSMITTING…</span>';
                showFeedback(feedbackEl, 'Transmitting to backend…', false);
            }

            fetch(ROUND_4_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, status: res.status, data: data }; }); })
                .then(function (result) {
                    if (matrixLoader) matrixLoader.remove();
                    if (result.ok) {
                        if (window.UIUtils) {
                            window.UIUtils.showToast('Submitted successfully.', 'success', 2000);
                            window.UIUtils.setButtonLoading(submitBtn, false);
                        } else {
                            showFeedback(feedbackEl, 'Submitted successfully.', false);
                        }
                        if (stage4Timer) stage4Timer.stop();
                        setTimeout(function () {
                            window.location.href = 'leaderboard.html?from=4';
                        }, 1500);
                    } else {
                        var msg = (window.FormUtils && window.FormUtils.parseApiError(result.data, result.status)) || 'Submission failed: ' + result.status;
                        if (window.UIUtils) {
                            window.UIUtils.showToast(msg, 'error', 4000);
                            window.UIUtils.setButtonLoading(submitBtn, false);
                        } else {
                            showFeedback(feedbackEl, msg, true);
                            submitBtn.disabled = false;
                            resetSubmitButton(submitBtn);
                        }
                    }
                })
                .catch(function (err) {
                    if (matrixLoader) matrixLoader.remove();
                    var errMsg = 'Network error: ' + (err.message || 'Could not reach server.');
                    if (window.UIUtils) {
                        window.UIUtils.showToast(errMsg, 'error', 4000);
                        window.UIUtils.setButtonLoading(submitBtn, false);
                    } else {
                        showFeedback(feedbackEl, errMsg, true);
                        submitBtn.disabled = false;
                        resetSubmitButton(submitBtn);
                    }
                });
        });
    }

    function resetSubmitButton(btn) {
        btn.innerHTML = '<div class="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>' +
            '<span class="material-symbols-outlined text-xl transition-transform group-hover:rotate-90">settings_power</span>' +
            '<span class="text-sm font-bold tracking-[0.2em] uppercase relative z-10">Initialize Logic Uplink</span>' +
            '<span class="material-symbols-outlined text-xl transition-transform group-hover:-rotate-90">settings_power</span>';
    }

    function showFeedback(el, text, isError) {
        if (!el) return;
        el.textContent = text;
        el.classList.remove('hidden');
        el.className = 'text-xs font-mono py-2 ' + (isError ? 'text-red-400' : 'text-emerald-400');
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (window.TimerUtils) {
            initTimer();
        }
        init();
    });
})();

/**
 * Timer Utilities - Shared timer functionality for all stages
 * Requires timer-config.js to be loaded first
 */
(function () {
    'use strict';

    window.TimerUtils = {
        /**
         * Initialize a timer for a stage
         * @param {string} stageKey - Stage key from TIMER_CONFIG (e.g., 'STAGE_2_DURATION')
         * @param {HTMLElement} displayEl - Element to display timer (optional)
         * @param {Function} onExpire - Callback when timer expires (optional)
         * @returns {Object} Timer control object { start, stop, reset, getRemaining }
         */
        init: function (stageKey, displayEl, onExpire) {
            var config = window.TIMER_CONFIG || {};
            var duration = config[stageKey] || 60;
            var remaining = duration;
            var intervalId = null;
            var formatTime = window.formatTimerTime || function (secs) {
                var mins = Math.floor(secs / 60);
                var s = sec % 60;
                return (mins < 10 ? '0' : '') + mins + ':' + (s < 10 ? '0' : '') + s;
            };

            function updateDisplay() {
                if (!displayEl) return;
                displayEl.textContent = formatTime(remaining);
                
                var warningAt = config.SHOW_WARNING_AT || 30;
                var criticalAt = config.SHOW_CRITICAL_AT || 10;
                
                if (remaining <= criticalAt) {
                    displayEl.className = 'text-sm font-bold text-red-500 tabular-nums animate-pulse';
                } else if (remaining <= warningAt) {
                    displayEl.className = 'text-sm font-bold text-yellow-400 tabular-nums';
                } else {
                    displayEl.className = 'text-sm font-bold text-primary tabular-nums';
                }
            }

            function tick() {
                if (remaining <= 0) {
                    stop();
                    if (displayEl) {
                        displayEl.textContent = '00:00';
                        displayEl.className = 'text-sm font-bold text-red-500 tabular-nums';
                    }
                    if (onExpire) onExpire();
                    return;
                }
                remaining--;
                updateDisplay();
            }

            function start() {
                if (intervalId) return;
                intervalId = setInterval(tick, 1000);
                updateDisplay();
            }

            function stop() {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }

            function reset(newDuration) {
                stop();
                remaining = newDuration !== undefined ? newDuration : duration;
                updateDisplay();
            }

            return {
                start: start,
                stop: stop,
                reset: reset,
                getRemaining: function () { return remaining; }
            };
        }
    };
})();

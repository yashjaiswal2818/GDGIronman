/**
 * Timer Configuration
 * 
 * Customize timer durations for testing and events.
 * Set TIMER_DURATION_SECONDS to the desired duration in seconds.
 * 
 * Examples:
 * - 60 seconds (1 minute) for testing
 * - 300 seconds (5 minutes) for quick demos
 * - 1800 seconds (30 minutes) for actual events
 * - 3600 seconds (60 minutes) for extended events
 */

(function () {
    'use strict';

    window.TIMER_CONFIG = {
        // Stage 1 (Editor) - Competitive Programming
        STAGE_1_DURATION: 300, // 5 minutes
        
        // Stage 2 (Website) - Web Development
        STAGE_2_DURATION: 300, // 5 minutes
        
        // Stage 3 (Design) - UI/UX Design
        STAGE_3_DURATION: 300, // 5 minutes
        
        // Stage 4 (Logic) - Logic & Decision Making
        STAGE_4_DURATION: 300, // 5 minutes
        
        // Stage 5 (Presentation) - Presentation
        STAGE_5_DURATION: 300, // 5 minutes
        
        // Enable/disable timer warnings
        SHOW_WARNING_AT: 30, // Show warning when X seconds remaining
        SHOW_CRITICAL_AT: 10 // Show critical warning when X seconds remaining
    };
    
    // ============================================
    // Helper function to format time
    // ============================================
    window.formatTimerTime = function (seconds) {
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    };
})();

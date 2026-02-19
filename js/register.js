const USE_API = true;
const API_ENDPOINT = (window.API_CONFIG && window.API_CONFIG.getUrl('register')) || 'http://127.0.0.1:8000/register';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('team-register-form');
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');

    if (!form || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const teamName = (document.getElementById('team-name')?.value || '').trim();
        const teamLeader = (document.getElementById('team-leader')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim();
        const members = [1, 2, 3, 4]
            .map((i) => (document.getElementById(`member-${i}`)?.value || '').trim())
            .filter((m) => m);

        if (!teamName) {
            showError('team-name', 'Team name is required');
            return;
        }
        clearError('team-name');

        if (!teamLeader) {
            showError('team-leader', 'Team leader name is required');
            return;
        }
        clearError('team-leader');

        if (!email) {
            showError('email', 'Email is required');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            return;
        }
        clearError('email');

        const team_members = [
            { name: teamLeader, role: "LEADER", email: email },
            ...members.map((name) => ({ name, role: "MEMBER", email: "" }))
        ];
        const payload = {
            Team_Name: teamName,
            team_members
        };

        try {
            sessionStorage.setItem('teamName', teamName);
            sessionStorage.setItem('teamLeader', teamLeader);
            sessionStorage.setItem('teamEmail', email);
            sessionStorage.setItem('teamData', JSON.stringify(payload));
        } catch (err) {
              console.warn('sessionStorage unavailable:', err);
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-icons text-lg animate-pulse">hourglass_empty</span><span>TRANSMITTING…</span>';
        hideMessage();

        try {
            if (USE_API && API_ENDPOINT) {
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    showMessage('Registration successful! Redirecting to mission briefing...', 'success');
                    // Redirect to Stage 1 Mission Briefing after 1.5 seconds
                    setTimeout(() => {
                        window.location.href = 'stageone.html';
                    }, 1500);
                    return; // Exit early to prevent button reset
                } else {
                    throw new Error(`Server error: ${response.status}`);
                }
            } else {
                showMessage('Team registered! Data saved. Redirecting to mission briefing...', 'success');
                // Redirect to Stage 1 Mission Briefing after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'stageone.html';
                }, 1500);
                return; // Exit early to prevent button reset
            }
        } catch (err) {
            showMessage('Registration saved locally. API error: ' + (err.message || 'Unknown error'), 'info');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="material-icons text-lg">cloud_upload</span><span>TRANSMIT REGISTRATION</span>';
        }
    });
});

function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    const group = document.getElementById(`${fieldId}-group`) || input?.closest('.input-group');
    if (input) input.classList.add('border-red-500', 'focus:ring-red-500');
    if (group) group.classList.add('error');
    if (errorEl) errorEl.textContent = message;
}

function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    const group = document.getElementById(`${fieldId}-group`) || input?.closest('.input-group');
    if (input) input.classList.remove('border-red-500', 'focus:ring-red-500');
    if (group) group.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
}

function showMessage(text, type) {
    const el = document.getElementById('form-message');
    if (!el) return;
    el.textContent = text;
    el.className = 'form-message visible mt-4 p-3 rounded text-sm ' + (type === 'success' ? 'success' : type === 'error' ? 'error' : 'info');
}

function hideMessage() {
    const el = document.getElementById('form-message');
    if (el) {
        el.textContent = '';
        el.className = 'form-message mt-4 p-3 rounded text-sm';
    }
}

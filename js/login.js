document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginMessageEl = document.getElementById('login-message');
    const submitBtn = document.getElementById('login-submit-btn');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const teamName = document.getElementById('login-team-name').value.trim();
        const leaderEmail = document.getElementById('login-leader-email').value.trim();

        if (!teamName || !leaderEmail) return;

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>AUTHENTICATING...</span><span class="btn-arrow">→</span>';
            if (loginMessageEl) loginMessageEl.style.display = 'none';

            // Check if endpoint is using Leader_Email or Loader_Email based on requirements
            const url = `https://gdg-ironman-participants-latest.onrender.com/login?Team_Name=${encodeURIComponent(teamName)}&Leader_Email=${encodeURIComponent(leaderEmail)}`;
            const fallbackUrl = `https://gdg-ironman-participants-latest.onrender.com/login?Team_Name=${encodeURIComponent(teamName)}&Loader_Email=${encodeURIComponent(leaderEmail)}`;

            let response = await fetch(fallbackUrl); // Using Loader_Email as per user url example, although Leader_Email was mentioned. It's safer to use the one from the provided URL.

            // If the above fails, let's try the logical one
            if (!response.ok) {
                response = await fetch(url);
            }

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            if (data.flag === "Success") {
                sessionStorage.setItem('teamName', data.Team_Name);
                if (leaderEmail) {
                    sessionStorage.setItem('teamEmail', leaderEmail);
                }
                window.location.href = 'html/stagethree.html';
            } else {
                alert("name or email is wrong please try again.");
                if (loginMessageEl) {
                    loginMessageEl.textContent = "name or email is wrong please try again.";
                    loginMessageEl.style.display = 'block';
                }
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("name or email is wrong please try again.");
            if (loginMessageEl) {
                loginMessageEl.textContent = "name or email is wrong please try again.";
                loginMessageEl.style.display = 'block';
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>AUTHENTICATE</span><span class="btn-arrow">→</span>';
        }
    });
});

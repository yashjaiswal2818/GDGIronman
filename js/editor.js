document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('code-input');
    const lineNumbers = document.getElementById('line-numbers');
    const runBtn = document.getElementById('run-btn');
    const submitBtn = document.getElementById('submit-btn');
    const lineCountEl = document.getElementById('line-count');
    const colCountEl = document.getElementById('col-count');
    const langSelect = document.getElementById('lang-select');
    const terminalToggleBtn = document.getElementById('terminal-toggle-btn');
    const terminalCloseBtn = document.getElementById('terminal-close-btn');
    const terminalContainer = document.getElementById('terminal-container');
    const timerDisplay = document.getElementById('timer-display');
    
    let isTerminalOpen = false;
    
    // Timer configuration - uses timer-config.js
    const TIMER_DURATION = (window.TIMER_CONFIG && window.TIMER_CONFIG.STAGE_1_DURATION) || 60; // Default 1 minute for testing
    let timeRemaining = TIMER_DURATION;
    let timerInterval = null;
    
    // Backend API configuration - uses api-config.js when available
    const API_BASE_URL = (window.API_CONFIG && window.API_CONFIG.BASE_URL) || 'http://127.0.0.1:8000';
    const JUDGE0_API = 'https://ce.judge0.com/submissions?wait=true&base64_encoded=false';
    
    // Language configuration
    const LANG_CONFIG = {
        "python": {
            "language": "python",
            "version": "3.10.0",
            "filename": "main.py",
            "judge0_id": 92  // Python 3.10.0
        },
        "cpp": {
            "language": "cpp",
            "version": "10.2.0",
            "filename": "main.cpp",
            "judge0_id": 54  // GCC 10.2.0
        },
        "java": {
            "language": "java",
            "version": "15.0.2",
            "filename": "Main.java",
            "judge0_id": 62  // OpenJDK 15.0.2
        },
        "c": {
            "language": "c",
            "version": "10.2.0",
            "filename": "main.c",
            "judge0_id": 50  // GCC 10.2.0
        },
        "javascript": {
            "language": "javascript",
            "version": "18.15.0",
            "filename": "main.js",
            "judge0_id": 93  // Node.js 18.15.0
        }
    };
    
    // Store current problem data
    let currentProblem = null;
    
    // Get problem_id from URL parameters or use default
    function getProblemIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const problemId = urlParams.get('problem_id');
        return problemId ? parseInt(problemId) : 1; // Default to problem 1
    }
    
    // Fetch problem data from backend
    async function fetchProblem(problemId) {
        try {
            const response = await fetch(`${API_BASE_URL}/problem/${5}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch problem: ${response.statusText}`);
            }
            const problem = await response.json();
            return problem;
        } catch (error) {
            console.error('Error fetching problem:', error);
            throw error;
        }
    }
    
    // Update UI with problem data
    function updateProblemUI(problem) {
        // Store problem data for later use
        currentProblem = problem;
        
        // Update title
        const titleElement = document.getElementById('problem-title');
        if (titleElement && problem.title) {
            titleElement.textContent = problem.title;
        }
        
        // Update problem ID badge
        const problemIdBadge = document.getElementById('problem-id-badge');
        if (problemIdBadge && problem.problem_id) {
            problemIdBadge.textContent = `TASK_ID: ${problem.problem_id}`;
        }
        
        // Update score badge
        const scoreBadge = document.getElementById('problem-score-badge');
        if (scoreBadge && problem.score !== undefined) {
            scoreBadge.textContent = `SCORE: ${problem.score}`;
        }
        
        // Update description
        const descriptionElement = document.getElementById('problem-description');
        if (descriptionElement && problem.description) {
            descriptionElement.textContent = problem.description;
        }
        
        // Update test cases
        const testCasesList = document.getElementById('test-cases-list');
        if (testCasesList && problem.test_cases && Array.isArray(problem.test_cases)) {
            testCasesList.innerHTML = ''; // Clear existing test cases
            
            problem.test_cases.forEach((testCase, index) => {
                const testCaseDiv = document.createElement('div');
                testCaseDiv.className = 'mb-3 p-3 bg-stark-bg-dark/60 border border-stark-border/30 rounded-sm';
                
                const testCaseHeader = document.createElement('div');
                testCaseHeader.className = 'flex items-center justify-between mb-2';
                
                const testCaseNumber = document.createElement('span');
                testCaseNumber.className = 'text-[10px] font-bold text-stark-blue uppercase';
                testCaseNumber.textContent = `Test Case ${index + 1}`;
                
                if (testCase.hidden) {
                    const hiddenBadge = document.createElement('span');
                    hiddenBadge.className = 'text-[9px] px-1.5 py-0.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded';
                    hiddenBadge.textContent = 'HIDDEN';
                    testCaseHeader.appendChild(hiddenBadge);
                }
                
                testCaseHeader.appendChild(testCaseNumber);
                testCaseDiv.appendChild(testCaseHeader);
                
                const testCaseGrid = document.createElement('div');
                testCaseGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-3';
                
                // Input
                const inputDiv = document.createElement('div');
                const inputLabel = document.createElement('h4');
                inputLabel.className = 'text-[10px] font-bold uppercase text-slate-500 mb-2';
                inputLabel.textContent = 'Input';
                const inputValue = document.createElement('div');
                inputValue.className = 'font-mono text-xs bg-stark-bg-dark/80 p-2 border rounded-sm break-all whitespace-pre-wrap';
                
                if (testCase.hidden) {
                    // Hide input for hidden test cases
                    inputValue.className += ' text-yellow-400 border-yellow-500/20';
                    inputValue.textContent = 'Hidden';
                } else {
                    // Display input clearly - show spaces and newlines
                    inputValue.className += ' text-stark-blue border-stark-border/30';
                    const inputText = testCase.input || 'N/A';
                    inputValue.textContent = inputText;
                    inputValue.title = `Raw input: ${JSON.stringify(inputText)}`; // Show raw format on hover
                }
                
                inputDiv.appendChild(inputLabel);
                inputDiv.appendChild(inputValue);
                
                // Output
                const outputDiv = document.createElement('div');
                const outputLabel = document.createElement('h4');
                outputLabel.className = 'text-[10px] font-bold uppercase text-slate-500 mb-2';
                outputLabel.textContent = 'Expected Output';
                const outputValue = document.createElement('div');
                outputValue.className = 'font-mono text-xs text-green-400 bg-stark-bg-dark/80 p-2 border border-green-500/20 rounded-sm break-all';
                outputValue.textContent = testCase.hidden ? 'Hidden' : (testCase.output || 'N/A');
                outputDiv.appendChild(outputLabel);
                outputDiv.appendChild(outputValue);
                
                testCaseGrid.appendChild(inputDiv);
                testCaseGrid.appendChild(outputDiv);
                testCaseDiv.appendChild(testCaseGrid);
                
                testCasesList.appendChild(testCaseDiv);
            });
        }
        
        // Store post_code for later use (during submission)
        // Note: post_code is typically appended to user's solution during submission
        // We don't pre-fill it in the editor, but store it for reference
        if (problem.post_code && typeof problem.post_code === 'object') {
            console.log('Post code available:', problem.post_code);
            // This will be used when submitting the solution
        }
        
        // Handle pre_code if available (starter code)
        if (problem.pre_code) {
            // pre_code can be a string or object with language keys
            if (typeof problem.pre_code === 'string' && codeInput) {
                codeInput.value = problem.pre_code;
                updateLineNumbers();
            } else if (typeof problem.pre_code === 'object' && codeInput) {
                const currentLang = langSelect ? langSelect.value : 'js';
                const langMap = {
                    'python': 'python',
                    'java': 'java',
                    'js': 'javascript',
                    'javascript': 'javascript',
                    'cpp': 'cpp',
                    'c': 'c'
                };
                const langKey = langMap[currentLang] || 'javascript';
                if (problem.pre_code[langKey]) {
                    codeInput.value = problem.pre_code[langKey];
                    updateLineNumbers();
                }
            }
        }
    }
    
    // Initialize problem loading
    async function initializeProblem() {
        const problemId = getProblemIdFromURL();
        
        try {
            const problem = await fetchProblem(problemId);
            updateProblemUI(problem);
            console.log('Problem loaded successfully:', problem);
        } catch (error) {
            console.error('Failed to load problem:', error);
            // Show error message to user
            const titleElement = document.getElementById('problem-title');
            if (titleElement) {
                titleElement.textContent = 'Failed to load problem';
            }
            const descriptionElement = document.getElementById('problem-description');
            if (descriptionElement) {
                descriptionElement.textContent = `Error: ${error.message}. Please check if the backend server is running at ${API_BASE_URL}`;
                descriptionElement.className = 'mb-4 text-sm opacity-90 text-red-400';
            }
        }
    }

    function updateLineNumbers() {
        const lines = codeInput.value.split('\n');
        const lineCount = lines.length;
        
        // Generate line numbers as div elements for proper alignment
        if (lineNumbers) {
            lineNumbers.innerHTML = '';
            for (let i = 1; i <= Math.max(lineCount, 1); i++) {
                const lineDiv = document.createElement('div');
                lineDiv.textContent = i;
                lineDiv.style.lineHeight = '1.75rem';
                lineNumbers.appendChild(lineDiv);
            }
        }
        
        // Update line count display
        if (lineCountEl) {
            lineCountEl.textContent = lineCount;
        }
        
        // Update column count display (approximate)
        if (colCountEl && codeInput) {
            const lines = codeInput.value.split('\n');
            const currentLine = lines[lines.length - 1] || '';
            colCountEl.textContent = currentLine.length;
        }
    }

    function syncScroll() {
        if (lineNumbers && codeInput) {
            lineNumbers.scrollTop = codeInput.scrollTop;
        }
    }

    // Handle input changes
    codeInput.addEventListener('input', () => {
        updateLineNumbers();
    });

    // Sync scrolling
    codeInput.addEventListener('scroll', syncScroll);

    // Handle tab key for indentation
    codeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = codeInput.selectionStart;
            const end = codeInput.selectionEnd;
            const value = codeInput.value;
            
            if (e.shiftKey) {
                // Remove indentation
                const lines = value.substring(0, start).split('\n');
                const currentLine = lines[lines.length - 1];
                if (currentLine.startsWith('  ')) {
                    codeInput.value = value.substring(0, start - 2) + value.substring(start);
                    codeInput.selectionStart = codeInput.selectionEnd = start - 2;
                }
            } else {
                // Add indentation
                codeInput.value = value.substring(0, start) + '  ' + value.substring(end);
                codeInput.selectionStart = codeInput.selectionEnd = start + 2;
            }
            updateLineNumbers();
        }
    });

    // Language selection handler
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            const lang = e.target.value;
            // Update syntax highlighting or other language-specific features
            console.log('Language changed to:', lang);
            
            // Update post_code if problem is loaded
            if (currentProblem && currentProblem.post_code && typeof currentProblem.post_code === 'object') {
                const langMap = {
                    'python': 'python',
                    'java': 'java',
                    'js': 'java', // Based on the API response, post_code has 'java' key
                    'javascript': 'java',
                    'cpp': 'cpp',
                    'c': 'c'
                };
                
                const langKey = langMap[lang] || 'java';
                if (currentProblem.post_code[langKey]) {
                    // Get current code without post_code
                    const currentCode = codeInput.value.trim();
                    // Replace with new post_code
                    codeInput.value = currentProblem.post_code[langKey];
                    updateLineNumbers();
                }
            }
        });
    }

    // Format stdin based on language requirements
    function formatStdin(stdin, language) {
        if (!stdin) return '';
        
        // If stdin already contains newlines, use as-is
        if (stdin.includes('\n')) {
            return stdin;
        }
        
        // For languages that typically read line-by-line (Python, Java, C++)
        // Convert space-separated values to newline-separated
        const lineByLineLanguages = ['python', 'java', 'cpp', 'c'];
        const langKey = language === 'js' ? 'javascript' : language;
        
        if (lineByLineLanguages.includes(langKey)) {
            // Split by spaces and join with newlines
            return stdin.split(/\s+/).filter(s => s.length > 0).join('\n');
        }
        
        // For JavaScript and others, use as-is
        return stdin;
    }
    
    // Execute code via Judge0
    async function executeCode(code, language, stdin = '') {
        const langKey = language === 'js' ? 'javascript' : language;
        const langConfig = LANG_CONFIG[langKey];
        
        if (!langConfig) {
            throw new Error(`Unsupported language: ${language}`);
        }
        
        // Format stdin based on language
        const formattedStdin = formatStdin(stdin, language);
        
        const payload = {
            source_code: code,
            language_id: langConfig.judge0_id,
            stdin: formattedStdin,
            expected_output: null,
            cpu_time_limit: 2,
            memory_limit: 128000
        };
        
        try {
            const response = await fetch(JUDGE0_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Judge0 API error: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error executing code:', error);
            throw error;
        }
    }
    
    // Display output in terminal
    function displayTerminalOutput(output, isError = false) {
        const terminalOutput = document.getElementById('terminal-output');
        if (!terminalOutput) return;
        
        // Open terminal if closed
        if (!isTerminalOpen) {
            toggleTerminal();
        }
        
        const container = terminalOutput.querySelector('.space-y-1');
        if (!container) return;
        
        // Handle multi-line output
        const lines = String(output).split('\n');
        
        lines.forEach((line, index) => {
            const outputDiv = document.createElement('div');
            
            if (isError) {
                outputDiv.className = 'flex items-start gap-2 text-red-400 pt-1';
                if (index === 0) {
                    outputDiv.innerHTML = `<span class="text-red-500">[FAIL]</span> <span>${escapeHtml(line)}</span>`;
                } else {
                    outputDiv.className = 'text-red-400 pt-1 pl-5';
                    outputDiv.innerHTML = `<span>${escapeHtml(line)}</span>`;
                }
            } else {
                outputDiv.className = 'text-slate-300';
                if (index === 0) {
                    outputDiv.innerHTML = `<span class="text-green-500">➜</span> <span class="text-blue-400">~/protocols/mk85</span> <span class="text-slate-300">${escapeHtml(line)}</span>`;
                } else {
                    outputDiv.className = 'text-slate-300 pl-5';
                    outputDiv.innerHTML = `<span>${escapeHtml(line)}</span>`;
                }
            }
            
            container.appendChild(outputDiv);
        });
        
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Clear terminal output (keep initial system messages)
    function clearTerminalOutput() {
        const terminalOutput = document.getElementById('terminal-output');
        if (terminalOutput) {
            const container = terminalOutput.querySelector('.space-y-1');
            if (container) {
                // Remove all but the first 4 initial system messages
                const allDivs = container.querySelectorAll('div');
                allDivs.forEach((div, index) => {
                    if (index >= 4) { // Keep first 4 divs (initial messages)
                        div.remove();
                    }
                });
            }
        }
    }
    
    // Run button handler
    if (runBtn) {
        runBtn.addEventListener('click', async () => {
            console.log('Run Diagnostics clicked');
            const code = codeInput.value.trim();
            
            if (!code) {
                displayTerminalOutput('Error: No code to execute', true);
                return;
            }
            
            const language = langSelect ? langSelect.value : 'js';
            
            // Add visual feedback
            runBtn.disabled = true;
            const originalHTML = runBtn.innerHTML;
            runBtn.innerHTML = '<span class="material-icons-round text-[16px] animate-spin">hourglass_empty</span>';
            
            clearTerminalOutput();
            displayTerminalOutput('Executing code...');
            
            try {
                // Use first test case input if available
                let stdin = '';
                let stdinDisplay = '';
                if (currentProblem && currentProblem.test_cases && currentProblem.test_cases.length > 0) {
                    stdin = currentProblem.test_cases[0].input || '';
                    stdinDisplay = stdin;
                    // Show the input being used
                    if (stdin) {
                        displayTerminalOutput(`Input: ${stdin}`);
                    }
                }
                
                const result = await executeCode(code, language, stdin);
                
                // Display results
                if (result.status && result.status.id === 3) {
                    // Accepted
                    displayTerminalOutput(`Output: ${result.stdout || '(no output)'}`);
                    if (result.stderr) {
                        displayTerminalOutput(`Warning: ${result.stderr}`, true);
                    }
                } else if (result.status && result.status.id === 4) {
                    // Wrong Answer
                    displayTerminalOutput(`Wrong Answer. Expected different output.`, true);
                    if (result.stdout) {
                        displayTerminalOutput(`Your output: ${result.stdout}`);
                    }
                } else if (result.status && result.status.id === 5) {
                    // Time Limit Exceeded
                    displayTerminalOutput('Time Limit Exceeded', true);
                } else if (result.status && result.status.id === 6) {
                    // Compilation Error
                    displayTerminalOutput(`Compilation Error: ${result.compile_output || 'Unknown error'}`, true);
                } else if (result.status && result.status.id === 7) {
                    // Runtime Error
                    displayTerminalOutput(`Runtime Error: ${result.stderr || result.message || 'Unknown error'}`, true);
                } else {
                    displayTerminalOutput(`Status: ${result.status?.description || 'Unknown status'}`, true);
                    if (result.stdout) {
                        displayTerminalOutput(`Output: ${result.stdout}`);
                    }
                    if (result.stderr) {
                        displayTerminalOutput(`Error: ${result.stderr}`, true);
                    }
                }
                
                if (result.time) {
                    displayTerminalOutput(`Execution time: ${result.time}s`);
                }
                if (result.memory) {
                    displayTerminalOutput(`Memory used: ${(result.memory / 1024).toFixed(2)} KB`);
                }
                
            } catch (error) {
                displayTerminalOutput(`Error: ${error.message}`, true);
            } finally {
                runBtn.disabled = false;
                runBtn.innerHTML = originalHTML;
            }
        });
    }

    // Submit button handler - Test against all test cases
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            console.log('Submit Solution clicked');
            
            // Check if time is up
            if (timeRemaining <= 0) {
                displayTerminalOutput('Time is up. Submission disabled.', true);
                return;
            }
            
            // Check if submit button is disabled
            if (submitBtn.disabled && submitBtn.textContent.includes('TIME UP')) {
                displayTerminalOutput('Time is up. Submission disabled.', true);
                return;
            }
            
            const code = codeInput.value.trim();
            
            if (!code) {
                displayTerminalOutput('Error: No code to submit', true);
                return;
            }
            
            if (!currentProblem || !currentProblem.test_cases || currentProblem.test_cases.length === 0) {
                displayTerminalOutput('Error: No test cases available for this problem', true);
                return;
            }
            
            const language = langSelect ? langSelect.value : 'js';
            
            // Add visual feedback
            submitBtn.disabled = true;
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="material-icons-round text-[12px] animate-spin">hourglass_empty</span><span class="hidden sm:inline">SUBMITTING...</span>';
            
            clearTerminalOutput();
            displayTerminalOutput('Testing solution against all test cases...');
            
            try {
                const testCases = currentProblem.test_cases;
                let passedTests = 0;
                let totalTests = testCases.length;
                
                for (let i = 0; i < testCases.length; i++) {
                    const testCase = testCases[i];
                    const isHidden = testCase.hidden === true;
                    
                    if (!isHidden) {
                        displayTerminalOutput(`Running test case ${i + 1}/${totalTests}...`);
                        displayTerminalOutput(`Input: ${testCase.input}`);
                    } else {
                        displayTerminalOutput(`Running hidden test case ${i + 1}/${totalTests}...`);
                        // Don't show input for hidden test cases
                    }
                    
                    try {
                        const result = await executeCode(code, language, testCase.input);
                        
                        if (result.status && result.status.id === 3) {
                            // Accepted - check if output matches
                            const output = (result.stdout || '').trim();
                            const expectedOutput = (testCase.output || '').trim();
                            
                            if (output === expectedOutput) {
                                passedTests++;
                                if (isHidden) {
                                    displayTerminalOutput(`[OK] Test ${i + 1}: PASSED (hidden)`);
                                } else {
                                    displayTerminalOutput(`[OK] Test ${i + 1}: PASSED`);
                                }
                            } else {
                                displayTerminalOutput(`[FAIL] Test ${i + 1}: FAILED`, true);
                                if (!isHidden) {
                                    displayTerminalOutput(`  Expected: ${expectedOutput}`);
                                    displayTerminalOutput(`  Got: ${output}`);
                                } else {
                                    displayTerminalOutput(`  Output does not match expected result`);
                                }
                            }
                        } else if (result.status && result.status.id === 6) {
                            // Compilation Error
                            displayTerminalOutput(`[FAIL] Test ${i + 1}: COMPILATION ERROR`, true);
                            displayTerminalOutput(`  ${result.compile_output || 'Unknown compilation error'}`);
                            break; // Stop testing if compilation fails
                        } else if (result.status && result.status.id === 7) {
                            // Runtime Error
                            displayTerminalOutput(`[FAIL] Test ${i + 1}: RUNTIME ERROR`, true);
                            displayTerminalOutput(`  ${result.stderr || result.message || 'Unknown runtime error'}`);
                        } else {
                            displayTerminalOutput(`[FAIL] Test ${i + 1}: ${result.status?.description || 'FAILED'}`, true);
                        }
                    } catch (error) {
                        displayTerminalOutput(`[FAIL] Test ${i + 1}: ERROR - ${error.message}`, true);
                    }
                }
                
                // Final summary
                displayTerminalOutput('');
                const allTestsPassed = passedTests === totalTests;
                const status = allTestsPassed ? 'PASSED' : 'failed';
                
                if (allTestsPassed) {
                    displayTerminalOutput(`[OK] All tests passed (${passedTests}/${totalTests})`);
                    displayTerminalOutput('Solution accepted!');
                } else {
                    displayTerminalOutput(`[FAIL] Tests passed: ${passedTests}/${totalTests}`, true);
                    displayTerminalOutput('Solution needs improvement.', true);
                }
                
                // Submit to backend
                displayTerminalOutput('');
                displayTerminalOutput('Submitting solution to server...');
                
                try {
                    // Get team name from sessionStorage
                    const teamName = sessionStorage.getItem('teamName');
                    if (!teamName) {
                       throw new Error('Team name not found. Please register first.');
                    }
                    
                    // Static values for now
                    const contestId = 'con';
                    const problemId = 5;
                    
                    // Prepare submission payload
                    const submissionPayload = {
                        Team_Name: teamName,
                        contest_id: contestId,
                        problem_id: problemId,
                        code: code,
                        status: status
                    };
                    
                    console.log('Submitting payload:', {
                        Team_Name: submissionPayload.Team_Name,
                        contest_id: submissionPayload.contest_id,
                        problem_id: submissionPayload.problem_id,
                        code: submissionPayload.code.substring(0, 50) + '...', // Preview first 50 chars
                        status: submissionPayload.status
                    });
                    
                    // Send submission to backend
                    const submitResponse = await fetch(`${API_BASE_URL}/submit`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(submissionPayload)
                    });
                    
                    if (!submitResponse.ok) {
                        const errorData = await submitResponse.json().catch(() => ({ message: submitResponse.statusText }));
                        throw new Error(`Submission failed: ${errorData.message || submitResponse.statusText}`);
                    }
                    
                    const submitResult = await submitResponse.json();
                    displayTerminalOutput(`[OK] Submission successful. Status: ${status}`);
                    if (submitResult.submission_id) {
                        displayTerminalOutput(`Submission ID: ${submitResult.submission_id}`);
                    }
                    if (submitResult.message) {
                        displayTerminalOutput(`Message: ${submitResult.message}`);
                    }
                    
                } catch (submitError) {
                    displayTerminalOutput(`[FAIL] Submission error: ${submitError.message}`, true);
                    console.error('Submission error:', submitError);
                }
                
            } catch (error) {
                displayTerminalOutput(`Error: ${error.message}`, true);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            }
        });
    }

    // Terminal toggle functionality
    function toggleTerminal() {
        if (!terminalContainer) return;
        
        isTerminalOpen = !isTerminalOpen;
        
        if (isTerminalOpen) {
            terminalContainer.style.height = '300px';
            terminalContainer.style.opacity = '1';
            terminalContainer.style.borderTopWidth = '1px';
            if (terminalToggleBtn) {
                terminalToggleBtn.setAttribute('data-open', 'true');
                const icon = terminalToggleBtn.querySelector('.material-icons-round');
                if (icon) icon.textContent = 'keyboard_arrow_down';
            }
        } else {
            terminalContainer.style.height = '0';
            terminalContainer.style.opacity = '0';
            terminalContainer.style.borderTopWidth = '0';
            if (terminalToggleBtn) {
                terminalToggleBtn.removeAttribute('data-open');
                const icon = terminalToggleBtn.querySelector('.material-icons-round');
                if (icon) icon.textContent = 'keyboard_arrow_up';
            }
        }
    }
    
    if (terminalToggleBtn) {
        terminalToggleBtn.addEventListener('click', toggleTerminal);
    }
    
    if (terminalCloseBtn) {
        terminalCloseBtn.addEventListener('click', toggleTerminal);
    }

    // Timer functionality
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    function updateTimer() {
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timeRemaining);
            
            // Change color when time is running low
            if (timeRemaining <= 60) {
                timerDisplay.className = 'text-sm font-bold text-red-400 tabular-nums animate-pulse';
            } else if (timeRemaining <= 120) {
                timerDisplay.className = 'text-sm font-bold text-yellow-400 tabular-nums';
            } else {
                timerDisplay.className = 'text-sm font-bold text-stark-blue tabular-nums';
            }
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            if (timerDisplay) {
                timerDisplay.textContent = '00:00';
                timerDisplay.className = 'text-sm font-bold text-red-500 tabular-nums';
            }
            // Disable submit button
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
                submitBtn.innerHTML = '<span class="material-icons-round text-[12px]">block</span><span class="hidden sm:inline">TIME UP</span>';
            }
            // Show notification
            displayTerminalOutput('Time is up. Submission disabled.', true);
            return;
        }
        
        timeRemaining--;
    }
    
    function startTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        timeRemaining = TIMER_DURATION;
        updateTimer(); // Initial display
        timerInterval = setInterval(updateTimer, 1000); // Update every second
    }
    
    // Start the timer when page loads
    startTimer();

    // Display logged-in team name
    const teamNameEl = document.getElementById('display-team-name');
    if (teamNameEl) {
        const teamName = sessionStorage.getItem('teamName');
        if (teamName) {
            teamNameEl.textContent = teamName;
            teamNameEl.title = 'Logged in as ' + teamName;
        } else {
            teamNameEl.textContent = 'Not logged in';
        }
    }

    // Initialize
    updateLineNumbers();
    
    // Load problem data from backend
    initializeProblem();
    
    // Focus the code input
    codeInput.focus();
});

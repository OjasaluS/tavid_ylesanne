(function () {
    'use strict';

    const form = document.getElementById('phone-form');
    const phoneInput = document.getElementById('phone');
    const resultDiv = document.getElementById('result');
    const validateBtn = document.getElementById('validate-btn');
    const btnText = validateBtn.querySelector('.btn-text');
    const btnSpinner = validateBtn.querySelector('.btn-spinner');

    /**
     * Show loading state on button
     */
    function setLoading(loading) {
        validateBtn.disabled = loading;
        btnText.hidden = loading;
        btnSpinner.hidden = !loading;
    }

    /**
     * Render validation result
     */
    function renderResult(data) {
        resultDiv.hidden = false;
        resultDiv.className = 'result ' + (data.valid ? 'valid' : 'invalid');

        if (data.valid) {
            resultDiv.innerHTML = `
                <div class="result-header">
                    <span>Valid phone number</span>
                </div>
                <div class="result-details">
                    <div class="result-row">
                        <span class="label">National</span>
                        <span class="value">${escapeHtml(data.national_number)}</span>
                    </div>
                    <div class="result-row">
                        <span class="label">Country</span>
                        <span class="value">${escapeHtml(data.country)} (+${data.country_code})</span>
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="result-header">
                    <span>Invalid phone number</span>
                </div>
                <p class="result-error">${escapeHtml(data.error || 'The number could not be validated.')}</p>
            `;
        }
    }

    /**
     * Send validation request to API
     */
    async function validatePhone() {
        const phone = phoneInput.value.trim();

        if (!phone) {
            resultDiv.hidden = true;
            return;
        }

        setLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            const response = await fetch('/api/validate.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            let data;
            try {
                data = await response.json();
            } catch {
                renderResult({
                    valid: false,
                    error: 'Server returned an unexpected response. Please try again.',
                });
                return;
            }

            renderResult(data);
        } catch (err) {
            clearTimeout(timeoutId);
            const message = err.name === 'AbortError'
                ? 'Request timed out. Please try again.'
                : 'Could not connect to the validation server. Please try again.';
            renderResult({ valid: false, error: message });
        } finally {
            setLoading(false);
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Disable form submission, handle with JS
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        validatePhone();
    });

    phoneInput.focus();
})();

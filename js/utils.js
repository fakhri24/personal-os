/* =============================================
   PERSONAL OS — Shared Utilities
   ============================================= */

// === HTML ESCAPING ===
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// === DATE FORMATTING ===
function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

// === CURRENCY FORMATTING ===
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '0';
    return Number(amount).toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

// === DATE HELPERS ===
function isDateToday(dateStr) {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
}

function isDateOverdue(dateStr) {
    if (!dateStr) return false;
    // Compare at end of day to avoid timezone edge cases
    const endOfDay = new Date(dateStr + 'T23:59:59');
    return endOfDay < new Date();
}

// === TOAST NOTIFICATIONS ===
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// === RETRY WRAPPER ===
async function withRetry(fn, maxRetries = 2, delayMs = 1000) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt === maxRetries) throw err;
            console.warn(`Retry ${attempt + 1}/${maxRetries} after error:`, err.message);
            await new Promise((r) => setTimeout(r, delayMs));
            delayMs *= 2; // exponential backoff
        }
    }
}

// === GLOBAL ERROR HANDLER ===
function initErrorBoundary() {
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        // Don't show toast for realtime subscription errors (noisy)
        if (!event.reason?.message?.includes('subscription')) {
            showToast('Something went wrong. Try refreshing.', 'error');
        }
    });
}

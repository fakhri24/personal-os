/* =============================================
   PERSONAL OS — Main Application Logic
   ============================================= */

// Table registry
const TABLES = {
    ideas_brainstorm: IdeasTable,
    clothes_tracker: ClothesTable,
    learning_reminders: LearningTable,
    package_tracker: PackageTable,
    local_files_index: FilesTable,
    finance_tracker: FinanceTable,
    to_learn: ToLearnTable,
};

// Current state
let currentTable = 'dashboard';
let editingId = null;
let tableData = {};
let searchQuery = '';
let searchTimeout = null;

// === REALTIME SUBSCRIPTION ===
function initRealtimeSubscription() {
    sb.channel('public-schema-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
            console.log('Realtime change detected:', payload.table, payload.eventType);

            // Always refresh dashboard stats
            loadDashboardStats();

            // Refresh current table view if it matches the changed table
            if (currentTable === payload.table) {
                loadTableData(currentTable);
            }

            // Refresh upcoming reviews if learning_reminders changed
            if (payload.table === 'learning_reminders') {
                loadUpcomingReviews();
            }
        })
        .subscribe();
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
    initErrorBoundary();
    await testConnection();
    await loadDashboardStats();
    await loadUpcomingReviews();
    initRealtimeSubscription();
});

// === NAVIGATION ===
function navigateTo(tableName) {
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.table === tableName);
    });

    // Update page title
    const title =
        tableName === 'dashboard' ? 'Dashboard' : TABLES[tableName]?.displayName || tableName;
    document.getElementById('pageTitle').textContent = title;

    // Show/hide add button
    document.getElementById('addNewBtn').style.display =
        tableName === 'dashboard' ? 'none' : 'inline-flex';

    // Switch views
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    const view = document.getElementById(`view-${tableName}`);
    if (view) view.classList.add('active');

    currentTable = tableName;

    // Show/hide search bar
    const searchWrapper = document.getElementById('searchWrapper');
    if (tableName === 'dashboard') {
        searchWrapper.classList.remove('visible');
        clearSearch();
    } else {
        searchWrapper.classList.add('visible');
    }

    // Load data if not dashboard
    if (tableName !== 'dashboard') {
        loadTableData(tableName);
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// === DASHBOARD ===
async function loadDashboardStats() {
    const elements = {
        ideas_brainstorm: document.getElementById('stat-ideas'),
        clothes_tracker: document.getElementById('stat-clothes'),
        learning_reminders: document.getElementById('stat-learning'),
        package_tracker: document.getElementById('stat-packages'),
        local_files_index: document.getElementById('stat-files'),
        finance_tracker: document.getElementById('stat-finance'),
        to_learn: document.getElementById('stat-tolearn'),
    };

    const tables = Object.keys(elements);

    const results = await Promise.allSettled(tables.map((table) => db.getCount(table)));

    results.forEach((result, i) => {
        const el = elements[tables[i]];
        if (result.status === 'fulfilled') {
            el.textContent = result.value ?? '0';
        } else {
            el.textContent = '⚠';
            console.error(`Error loading ${tables[i]} stats:`, result.reason);
        }
    });
}

async function loadUpcomingReviews() {
    const container = document.getElementById('upcomingReviews');
    try {
        const reviews = await db.query(
            'learning_reminders',
            {},
            {
                orderBy: 'next_review',
                ascending: true,
                limit: 5,
            },
        );

        if (!reviews || reviews.length === 0) {
            container.innerHTML =
                '<p class="empty-state">No topics added yet. Add your first learning topic!</p>';
            return;
        }

        container.innerHTML = reviews
            .map((item) => {
                const isOverdue = isDateOverdue(item.next_review);
                const isToday = isDateToday(item.next_review);
                let dateClass = '';
                let dateLabel = formatDate(item.next_review);

                if (isOverdue) {
                    dateClass = 'overdue';
                    dateLabel = '⚠ Overdue';
                } else if (isToday) {
                    dateClass = 'today';
                    dateLabel = '📌 Today';
                }

                return `
                <div class="review-item" onclick="navigateTo('learning_reminders')">
                    <span class="review-topic">${escapeHtml(item.topic_name)}</span>
                    <span class="review-date ${dateClass}">${dateLabel}</span>
                </div>
            `;
            })
            .join('');
    } catch (err) {
        container.innerHTML = '<p class="empty-state">Unable to load reviews</p>';
    }
}

// === TABLE DATA LOADING ===
async function loadTableData(tableName) {
    const view = document.getElementById(`view-${tableName}`);
    if (!view) return;

    const tableConfig = TABLES[tableName];
    if (!tableConfig) return;

    // Show loading
    view.innerHTML = '<p class="empty-state">Loading...</p>';

    try {
        // Use correct sort column per table (not all have created_at)
        const SORT_COLUMNS = {
            clothes_tracker: 'last_worn',
            learning_reminders: 'next_review',
            package_tracker: 'last_checked',
            local_files_index: 'indexed_at',
            to_learn: 'sort_order',
        };
        const SORT_ASCENDING = {
            to_learn: true,
        };
        const orderBy = SORT_COLUMNS[tableName] || 'created_at';
        const ascending = SORT_ASCENDING[tableName] || false;
        const data = await db.getAll(tableName, orderBy, ascending);
        tableData[tableName] = data;

        if (!data || data.length === 0) {
            view.innerHTML = `
                <div class="table-container">
                    <div class="table-header">
                        <span class="table-title">${tableConfig.displayName}</span>
                        <span class="table-count">0 items</span>
                    </div>
                    <p class="empty-state">No data yet. Click "+ Add New" to get started.</p>
                </div>
            `;
            return;
        }

        // Build table headers
        const headers = tableConfig.columns.map((col) => `<th>${col.label}</th>`).join('');
        const filteredData = getFilteredData(tableName, data);
        const rows = filteredData.map((item) => tableConfig.renderRow(item)).join('');

        // Render custom stats bar if the table module defines one
        let statsHTML = '';
        if (tableConfig.renderStats) {
            statsHTML = tableConfig.renderStats(data);
        }

        view.innerHTML = `
            ${statsHTML}
            <div class="table-container">
                <div class="table-header">
                    <span class="table-title">${tableConfig.displayName}</span>
                    <span class="table-count" id="tableCount-${tableName}">${filteredData.length} items</span>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>${headers}<th>Actions</th></tr>
                    </thead>
                    <tbody id="tableBody-${tableName}">${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        view.innerHTML = `
            <div class="empty-state">
                <p>Error loading data: ${escapeHtml(err.message)}</p>
                <p style="margin-top:8px;font-size:0.8rem;color:var(--text-muted)">
                    Make sure the table "${tableName}" exists in your Supabase project.
                </p>
            </div>
        `;
    }
}

// === MODAL (ADD/EDIT) ===
function openModal(editData = null) {
    if (currentTable === 'dashboard') return;

    const tableConfig = TABLES[currentTable];
    if (!tableConfig) return;

    editingId = editData ? editData.id : null;

    document.getElementById('modalTitle').textContent = editData
        ? `Edit ${tableConfig.displayName}`
        : `Add New ${tableConfig.displayName}`;

    const defaults = editData || tableConfig.getDefaultValues();
    const formFields = document.getElementById('formFields');

    formFields.innerHTML = tableConfig.columns
        .map((col) => {
            const value = defaults[col.key] || '';
            const required = col.required ? 'required' : '';

            let input;
            switch (col.type) {
                case 'textarea':
                    input = `<textarea id="field-${col.key}" ${required} placeholder="Enter ${col.label.toLowerCase()}...">${escapeHtml(value)}</textarea>`;
                    break;
                case 'select':
                    const options = col.options
                        .map(
                            (opt) =>
                                `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`,
                        )
                        .join('');
                    input = `<select id="field-${col.key}" ${required}>${options}</select>`;
                    break;
                case 'date':
                    input = `<input type="date" id="field-${col.key}" value="${value}" ${required}>`;
                    break;
                case 'datetime-local':
                    const dtValue = value ? new Date(value).toISOString().slice(0, 16) : '';
                    input = `<input type="datetime-local" id="field-${col.key}" value="${dtValue}" ${required}>`;
                    break;
                case 'number':
                    input = `<input type="number" id="field-${col.key}" value="${value}" min="1" ${required}>`;
                    break;
                default:
                    input = `<input type="text" id="field-${col.key}" value="${escapeHtml(value)}" ${required} placeholder="Enter ${col.label.toLowerCase()}...">`;
            }

            return `
            <div class="form-group">
                <label for="field-${col.key}">${col.label}</label>
                ${input}
            </div>
        `;
        })
        .join('');

    document.getElementById('submitBtn').textContent = editData ? 'Update' : 'Save';
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modalOverlay').classList.remove('active');
    editingId = null;
}

// === FORM SUBMISSION ===
async function handleFormSubmit(event) {
    event.preventDefault();

    const tableConfig = TABLES[currentTable];
    if (!tableConfig) return;

    // Collect form data
    const formData = {};
    tableConfig.columns.forEach((col) => {
        const field = document.getElementById(`field-${col.key}`);
        if (field) {
            let value = field.value.trim();
            // Convert empty strings to null for optional fields
            if (value === '' && !col.required) value = null;
            // Convert number fields
            if (col.type === 'number' && value !== null) value = parseInt(value, 10);
            formData[col.key] = value;
        }
    });

    try {
        if (editingId) {
            await db.update(currentTable, editingId, formData);
            showToast('Updated successfully!', 'success');
        } else {
            await db.insert(currentTable, formData);
            showToast('Added successfully!', 'success');
        }

        closeModal();
        loadTableData(currentTable);
        loadDashboardStats();

        if (currentTable === 'learning_reminders') {
            loadUpcomingReviews();
        }
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

// === ROW ACTIONS ===
async function editRow(tableName, id) {
    const data = tableData[tableName];
    if (!data) return;

    const item = data.find((r) => r.id === id);
    if (!item) return;

    navigateTo(tableName);
    setTimeout(() => openModal(item), 100);
}

async function deleteRow(tableName, id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        await db.remove(tableName, id);
        showToast('Deleted successfully!', 'success');
        loadTableData(tableName);
        loadDashboardStats();

        if (tableName === 'learning_reminders') {
            loadUpcomingReviews();
        }
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

// === KEYBOARD SHORTCUTS ===
document.addEventListener('keydown', (e) => {
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
    // Ctrl+N to add new
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && currentTable !== 'dashboard') {
        e.preventDefault();
        openModal();
    }
    // "/" to focus search (when not typing in an input)
    if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) &&
        currentTable !== 'dashboard'
    ) {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

// === SEARCH ===
function initSearchListener() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = searchInput.value.trim().toLowerCase();
            const clearBtn = document.getElementById('searchClear');
            clearBtn.classList.toggle('visible', searchQuery.length > 0);
            filterTableRows();
        }, 150);
    });
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    searchQuery = '';
    document.getElementById('searchClear').classList.remove('visible');
    if (currentTable !== 'dashboard') {
        filterTableRows();
    }
}

function getFilteredData(tableName, data) {
    if (!searchQuery) return data;

    const config = TABLES[tableName];
    if (!config) return data;

    const searchKeys = config.columns.map((col) => col.key);

    return data.filter((item) =>
        searchKeys.some((key) => {
            const val = item[key];
            if (val === null || val === undefined) return false;
            return String(val).toLowerCase().includes(searchQuery);
        }),
    );
}

function filterTableRows() {
    const tableName = currentTable;
    if (tableName === 'dashboard') return;

    const config = TABLES[tableName];
    const data = tableData[tableName];
    if (!config || !data) return;

    const filtered = getFilteredData(tableName, data);

    // Update rows
    const tbody = document.getElementById(`tableBody-${tableName}`);
    if (tbody) {
        tbody.innerHTML =
            filtered.length > 0
                ? filtered.map((item) => config.renderRow(item)).join('')
                : `<tr><td colspan="${config.columns.length + 1}" class="no-results">Tidak ada hasil untuk "${escapeHtml(searchQuery)}"</td></tr>`;
    }

    // Update count
    const countEl = document.getElementById(`tableCount-${tableName}`);
    if (countEl) {
        countEl.textContent = searchQuery
            ? `${filtered.length} / ${data.length} items`
            : `${data.length} items`;
    }
}

// Initialize search on DOM ready
document.addEventListener('DOMContentLoaded', initSearchListener);

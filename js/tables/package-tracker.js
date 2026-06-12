/* =============================================
   PACKAGE TRACKER — Table Module
   ============================================= */

const PackageTable = {
    name: 'package_tracker',
    displayName: 'Package Tracker',
    icon: '📦',

    columns: [
        { key: 'courier', label: 'Courier', type: 'text', required: true },
        { key: 'receipt_number', label: 'Receipt Number', type: 'text', required: true },
        { key: 'package_name', label: 'Package Name', type: 'text' },
        { key: 'last_status', label: 'Last Status', type: 'text' },
        { key: 'last_checked', label: 'Last Checked', type: 'datetime-local' }
    ],

    renderRow(item) {
        return `
            <tr>
                <td>${escapeHtml(item.courier)}</td>
                <td><code style="background:var(--bg-hover);padding:2px 6px;border-radius:4px;font-size:0.82rem">${escapeHtml(item.receipt_number)}</code></td>
                <td>${escapeHtml(item.package_name || '—')}</td>
                <td>${escapeHtml(item.last_status || 'Not checked yet')}</td>
                <td>${formatDateTime(item.last_checked)}</td>
                <td>
                    <div class="row-actions">
                        <button onclick="editRow('package_tracker', ${item.id})">Edit</button>
                        <button class="delete" onclick="deleteRow('package_tracker', ${item.id})">Del</button>
                    </div>
                </td>
            </tr>
        `;
    },

    getDefaultValues() {
        return {
            last_status: 'Not checked yet',
            last_checked: null
        };
    }
};

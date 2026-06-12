/* =============================================
   LOCAL FILES INDEX — Table Module
   ============================================= */

const FilesTable = {
    name: 'local_files_index',
    displayName: 'Local Files Index',
    icon: '📁',

    columns: [
        { key: 'original_name', label: 'Original Name', type: 'text', required: true },
        { key: 'new_name', label: 'New Name', type: 'text' },
        { key: 'file_path', label: 'File Path', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'indexed_at', label: 'Indexed At', type: 'datetime-local' },
    ],

    renderRow(item) {
        return `
            <tr>
                <td>${escapeHtml(item.original_name)}</td>
                <td>${escapeHtml(item.new_name || '—')}</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis" title="${escapeHtml(item.file_path || '')}">${escapeHtml(item.file_path || '—')}</td>
                <td>${escapeHtml(item.category || '—')}</td>
                <td>${formatDateTime(item.indexed_at)}</td>
                <td>
                    <div class="row-actions">
                        <button onclick="editRow('local_files_index', ${item.id})">Edit</button>
                        <button class="delete" onclick="deleteRow('local_files_index', ${item.id})">Del</button>
                    </div>
                </td>
            </tr>
        `;
    },

    getDefaultValues() {
        return {
            indexed_at: new Date().toISOString(),
        };
    },
};

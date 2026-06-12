/* =============================================
   IDEAS BRAINSTORM — Table Module
   ============================================= */

const IdeasTable = {
    name: 'ideas_brainstorm',
    displayName: 'Ideas Brainstorm',
    icon: '💡',

    columns: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Done', 'Archived'] }
    ],

    renderRow(item) {
        const statusClass = {
            'Active': 'badge-idea',
            'Done': 'badge-done',
            'Archived': 'badge-archived'
        }[item.status] || 'badge-idea';

        return `
            <tr>
                <td>${escapeHtml(item.title)}</td>
                <td>${escapeHtml(item.description || '—')}</td>
                <td>${escapeHtml(item.category || '—')}</td>
                <td><span class="badge ${statusClass}">${escapeHtml(item.status || 'Active')}</span></td>
                <td>${formatDate(item.created_at)}</td>
                <td>
                    <div class="row-actions">
                        <button onclick="editRow('ideas_brainstorm', ${item.id})">Edit</button>
                        <button class="delete" onclick="deleteRow('ideas_brainstorm', ${item.id})">Del</button>
                    </div>
                </td>
            </tr>
        `;
    },

    getDefaultValues() {
        return {
            status: 'Active'
        };
    }
};

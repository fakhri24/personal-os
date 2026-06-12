/* =============================================
   CLOTHES TRACKER — Table Module
   ============================================= */

const ClothesTable = {
    name: 'clothes_tracker',
    displayName: 'Clothes Tracker',
    icon: '👕',

    columns: [
        { key: 'clothing_name', label: 'Clothing Name', type: 'text', required: true },
        { key: 'status', label: 'Status', type: 'select', options: ['Bersih', 'Dipakai', 'Di Keranjang Cuci', 'Sedang Dijemur'] },
        { key: 'last_worn', label: 'Last Worn', type: 'date' },
        { key: 'last_washed', label: 'Last Washed', type: 'date' }
    ],

    renderRow(item) {
        const statusClass = {
            'Bersih': 'badge-bersih',
            'Dipakai': 'badge-dipakai',
            'Di Keranjang Cuci': 'badge-cuci',
            'Sedang Dijemur': 'badge-jemur'
        }[item.status] || 'badge-bersih';

        return `
            <tr>
                <td>${escapeHtml(item.clothing_name)}</td>
                <td><span class="badge ${statusClass}">${escapeHtml(item.status)}</span></td>
                <td>${formatDate(item.last_worn)}</td>
                <td>${formatDate(item.last_washed)}</td>
                <td>
                    <div class="row-actions">
                        <button onclick="editRow('clothes_tracker', ${item.id})">Edit</button>
                        <button class="delete" onclick="deleteRow('clothes_tracker', ${item.id})">Del</button>
                    </div>
                </td>
            </tr>
        `;
    },

    getDefaultValues() {
        return {
            status: 'Bersih',
            last_worn: null,
            last_washed: new Date().toISOString().split('T')[0]
        };
    }
};

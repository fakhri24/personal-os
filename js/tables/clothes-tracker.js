/* =============================================
   CLOTHES TRACKER — Table Module
   ============================================= */

const ClothesTable = {
    name: 'clothes_tracker',
    displayName: 'Clothes Tracker',
    icon: '👕',

    columns: [
        { key: 'clothing_name', label: 'Clothing Name', type: 'text', required: true },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['Bersih', 'Dipakai', 'Di Keranjang Cuci', 'Sedang Dijemur'],
        },
        { key: 'last_worn', label: 'Last Worn', type: 'date' },
        { key: 'last_washed', label: 'Last Washed', type: 'date' },
    ],

    renderRow(item) {
        const statusClass =
            {
                Bersih: 'badge-bersih',
                Dipakai: 'badge-dipakai',
                'Di Keranjang Cuci': 'badge-cuci',
                'Sedang Dijemur': 'badge-jemur',
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
            last_washed: new Date().toISOString().split('T')[0],
        };
    },

    renderStats(data) {
        const total = data.length;
        const bersih = data.filter(function (i) {
            return i.status === 'Bersih';
        }).length;

        const cuciAll = data.filter(function (i) {
            return i.status === 'Di Keranjang Cuci';
        });
        const cuciPure = cuciAll.filter(function (i) {
            const name = i.clothing_name.toLowerCase();
            return !name.startsWith('cd ') && !name.startsWith('kaos kaki ');
        });

        const cuciText =
            cuciPure.length < cuciAll.length
                ? cuciAll.length + ' (' + cuciPure.length + ')'
                : String(cuciAll.length);

        // Using string concatenation to avoid template-literal escaping issues
        return (
            '<div class="clothes-stats">' +
            '<div class="clothes-stat">' +
            '<span class="clothes-stat-value">' +
            total +
            '</span>' +
            '<span class="clothes-stat-label">Total</span>' +
            '</div>' +
            '<div class="clothes-stat">' +
            '<span class="clothes-stat-value bersih">' +
            bersih +
            '</span>' +
            '<span class="clothes-stat-label">Bersih</span>' +
            '</div>' +
            '<div class="clothes-stat">' +
            '<span class="clothes-stat-value cuci">' +
            cuciText +
            '</span>' +
            '<span class="clothes-stat-label">Cucian</span>' +
            '</div>' +
            '</div>'
        );
    },
};

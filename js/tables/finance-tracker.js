/* =============================================
   FINANCE TRACKER — Table Module
   ============================================= */

const FinanceTable = {
    name: 'finance_tracker',
    displayName: 'Finance Tracker',
    icon: '💰',

    columns: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'amount', label: 'Amount (Rp)', type: 'number', required: true },
        {
            key: 'type',
            label: 'Type',
            type: 'select',
            options: ['Income', 'Expense'],
            required: true,
        },
        { key: 'category', label: 'Category', type: 'text' },
    ],

    renderRow(item) {
        const isIncome = item.type === 'Income';
        const typeClass = isIncome ? 'badge-active' : 'badge-cuci';
        const amountColor = isIncome ? 'var(--accent-green)' : 'var(--accent-red)';
        const amountPrefix = isIncome ? '+' : '-';
        const formattedAmount = formatCurrency(item.amount);

        return `
            <tr>
                <td>${escapeHtml(item.title)}</td>
                <td style="color:${amountColor};font-weight:600;font-variant-numeric:tabular-nums">
                    ${amountPrefix}Rp${formattedAmount}
                </td>
                <td><span class="badge ${typeClass}">${escapeHtml(item.type)}</span></td>
                <td>${escapeHtml(item.category || '—')}</td>
                <td>${formatDate(item.created_at)}</td>
                <td>
                    <div class="row-actions">
                        <button onclick="editRow('finance_tracker', ${item.id})">Edit</button>
                        <button class="delete" onclick="deleteRow('finance_tracker', ${item.id})">Del</button>
                    </div>
                </td>
            </tr>
        `;
    },

    getDefaultValues() {
        return {
            type: 'Expense',
        };
    },
};

// Finance tracker uses formatCurrency from utils.js

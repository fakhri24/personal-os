/* =============================================
   TO LEARN — Roadmap Table Module
   Tracks learning sub-tasks grouped by phase
   ============================================= */

const ToLearnTable = {
    name: 'to_learn',
    displayName: 'To Learn',
    icon: '🎯',
    sortColumn: 'sort_order',
    sortAscending: true,

    columns: [
        { key: 'phase', label: 'Phase', type: 'number', required: true },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: ['Not Started', 'In Progress', 'Done'],
        },
    ],

    renderRow(item) {
        const statusBadge =
            {
                'Not Started': 'badge-not-started',
                'In Progress': 'badge-in-progress',
                Done: 'badge-done',
            }[item.status] || 'badge-not-started';

        const optionalLabel = item.is_optional ? '<span class="optional-tag">OPSIONAL</span>' : '';

        const linkHtml = item.link
            ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener" class="link-icon" title="Open link">🔗</a>`
            : '';

        // Indent child items
        const indent = item.parent_id ? 'style="padding-left:28px"' : '';
        const childIndicator = item.parent_id ? '└─ ' : '';

        return `
            <tr class="phase-${item.phase} ${item.status === 'Done' ? 'row-done' : ''}" ${indent}>
                <td><span class="phase-badge phase-badge-${item.phase}">F${item.phase}</span></td>
                <td class="title-cell">${childIndicator}${escapeHtml(item.title)} ${optionalLabel} ${linkHtml}</td>
                <td class="desc-cell">${escapeHtml(item.description || '—')}</td>
                <td><span class="badge ${statusBadge}">${escapeHtml(item.status)}</span></td>
                <td>
                    <div class="row-actions">
                        <button onclick="updateLearnStatus(${item.id}, 'Not Started')" title="Not Started">○</button>
                        <button onclick="updateLearnStatus(${item.id}, 'In Progress')" title="In Progress">◐</button>
                        <button onclick="updateLearnStatus(${item.id}, 'Done')" title="Done">●</button>
                        <button onclick="editRow('to_learn', ${item.id})" title="Edit">Edit</button>
                        <button class="delete" onclick="deleteRow('to_learn', ${item.id})" title="Delete">Del</button>
                    </div>
                </td>
            </tr>
        `;
    },

    getDefaultValues() {
        return {
            phase: 1,
            status: 'Not Started',
            is_optional: false,
            sort_order: 1,
        };
    },

    renderStats(data) {
        if (!data || data.length === 0) return '';

        const phases = {};
        let totalDone = 0;
        let totalItems = data.length;

        data.forEach((item) => {
            if (!phases[item.phase]) {
                phases[item.phase] = { total: 0, done: 0 };
            }
            phases[item.phase].total++;
            if (item.status === 'Done') {
                phases[item.phase].done++;
                totalDone++;
            }
            // Count In Progress
            if (item.status === 'In Progress') {
                phases[item.phase].inProgress = (phases[item.phase].inProgress || 0) + 1;
            }
        });

        const overallPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

        const phaseBars = Object.keys(phases)
            .sort((a, b) => a - b)
            .map((phase) => {
                const p = phases[phase];
                const pct = Math.round((p.done / p.total) * 100);
                const barWidth = pct;
                return `
                    <div class="phase-progress">
                        <div class="phase-progress-label">
                            <span>Phase ${phase}</span>
                            <span>${p.done}/${p.total}</span>
                        </div>
                        <div class="phase-progress-bar">
                            <div class="phase-progress-fill" style="width:${barWidth}%"></div>
                        </div>
                    </div>
                `;
            })
            .join('');

        return `
            <div class="learn-stats-bar">
                <div class="learn-stats-summary">
                    <div class="learn-stat-box">
                        <span class="learn-stat-value">${overallPct}%</span>
                        <span class="learn-stat-label">Overall</span>
                    </div>
                    <div class="learn-stat-box">
                        <span class="learn-stat-value">${totalDone}</span>
                        <span class="learn-stat-label">Done</span>
                    </div>
                    <div class="learn-stat-box">
                        <span class="learn-stat-value">${totalItems - totalDone - data.filter((i) => i.status === 'In Progress').length}</span>
                        <span class="learn-stat-label">Remaining</span>
                    </div>
                    <div class="learn-stat-box">
                        <span class="learn-stat-value">${data.filter((i) => i.status === 'In Progress').length}</span>
                        <span class="learn-stat-label">In Progress</span>
                    </div>
                </div>
                <div class="phase-progress-list">
                    ${phaseBars}
                </div>
            </div>
        `;
    },
};

// Quick status update without opening modal
async function updateLearnStatus(id, newStatus) {
    try {
        await db.update('to_learn', id, { status: newStatus });
        showToast(`Status → ${newStatus}`, 'success');
        loadTableData('to_learn');
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

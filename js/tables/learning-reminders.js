/* =============================================
   LEARNING REMINDERS — Table Module
   ============================================= */

const LearningTable = {
    name: 'learning_reminders',
    displayName: 'Learning Reminders',
    icon: '📚',

    columns: [
        { key: 'topic_name', label: 'Topic Name', type: 'text', required: true },
        { key: 'last_reviewed', label: 'Last Reviewed', type: 'date' },
        { key: 'interval_days', label: 'Interval (Days)', type: 'number' },
        { key: 'next_review', label: 'Next Review', type: 'date' },
    ],

    renderRow(item) {
        const isOverdue = item.next_review && new Date(item.next_review) < new Date();
        const isToday = item.next_review && isDateToday(item.next_review);

        let reviewClass = '';
        let reviewLabel = formatDate(item.next_review);

        if (isOverdue) {
            reviewClass = 'overdue';
            reviewLabel = '⚠ Overdue — ' + reviewLabel;
        } else if (isToday) {
            reviewClass = 'today';
            reviewLabel = '📌 Today';
        }

        return `
            <tr>
                <td>${escapeHtml(item.topic_name)}</td>
                <td>${formatDate(item.last_reviewed)}</td>
                <td>${item.interval_days || 1} days</td>
                <td><span class="review-date ${reviewClass}">${reviewLabel}</span></td>
                <td>
                    <div class="row-actions">
                        <button onclick="markReviewed(${item.id})" title="Mark as reviewed">✓</button>
                        <button onclick="editRow('learning_reminders', ${item.id})">Edit</button>
                        <button class="delete" onclick="deleteRow('learning_reminders', ${item.id})">Del</button>
                    </div>
                </td>
            </tr>
        `;
    },

    getDefaultValues() {
        const today = new Date().toISOString().split('T')[0];
        return {
            last_reviewed: today,
            interval_days: 1,
            next_review: today,
        };
    },
};

// Mark a topic as reviewed today and calculate next review
async function markReviewed(id) {
    try {
        const { data: item } = await sb
            .from('learning_reminders')
            .select('*')
            .eq('id', id)
            .single();

        if (!item) throw new Error('Topic not found');

        const today = new Date().toISOString().split('T')[0];

        // Guard: don't double-review on the same day
        if (item.last_reviewed === today) {
            showToast(`"${item.topic_name}" already reviewed today`, 'info');
            return;
        }

        const interval = item.interval_days || 1;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + interval);
        const nextReview = nextDate.toISOString().split('T')[0];

        await db.update('learning_reminders', id, {
            last_reviewed: today,
            next_review: nextReview,
            interval_days: Math.min(interval * 2, 30), // Double interval, max 30 days
        });

        showToast(
            `"${item.topic_name}" marked as reviewed! Next: ${formatDate(nextReview)}`,
            'success',
        );
        loadTableData('learning_reminders');
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

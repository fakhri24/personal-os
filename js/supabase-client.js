/* =============================================
   SUPABASE CLIENT — Connection & Config
   ============================================= */

const SUPABASE_URL = 'https://jhwnmdcgibqciettibkp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Bltr1lzuWMjT-O1pF2df6w_BPHtDKmJ';

// Initialize Supabase client (use 'sb' to avoid shadowing window.supabase)
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Connection test
async function testConnection() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');

    try {
        const { data, error } = await sb.from('ideas_brainstorm').select('id').limit(1);

        if (error) throw error;

        statusDot.classList.add('connected');
        statusText.textContent = 'Connected';
        return true;
    } catch (err) {
        statusDot.classList.add('error');
        statusText.textContent = 'Error: ' + (err.message || 'Connection failed');
        console.error('Supabase connection error:', err);
        return false;
    }
}

// Generic CRUD helpers
const db = {
    async getAll(table, orderBy = 'created_at', ascending = false) {
        const { data, error } = await sb
            .from(table)
            .select('*')
            .order(orderBy, { ascending });
        if (error) throw error;
        return data;
    },

    async getCount(table) {
        const { count, error } = await sb
            .from(table)
            .select('*', { count: 'exact', head: true });
        if (error) throw error;
        return count;
    },

    async insert(table, row) {
        const { data, error } = await sb
            .from(table)
            .insert(row)
            .select();
        if (error) throw error;
        return data[0];
    },

    async update(table, id, updates) {
        const { data, error } = await sb
            .from(table)
            .update(updates)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async remove(table, id) {
        const { error } = await sb
            .from(table)
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    async query(table, filters = {}, options = {}) {
        let query = sb.from(table).select('*');

        // Apply filters
        for (const [column, value] of Object.entries(filters)) {
            if (typeof value === 'object' && value.operator) {
                query = query[value.operator](column, value.value);
            } else {
                query = query.eq(column, value);
            }
        }

        // Apply ordering
        if (options.orderBy) {
            query = query.order(options.orderBy, {
                ascending: options.ascending ?? false
            });
        }

        // Apply limit
        if (options.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }
};

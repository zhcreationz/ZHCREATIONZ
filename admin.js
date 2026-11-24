import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://ojhgbvagjyzmrhuqhsat.supabase.co';
const SUPABASE_KEY = 'sb_publishable__HZbRrV5DWcmQNusjSuQ9A_Cdzl32gX';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const loginForm = document.getElementById('login-form');
const message = document.getElementById('login-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    message.textContent = 'Logging in...';

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        message.textContent = error.message;
        return;
    }

    const { data: admin, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

    if (adminError || !admin) {
        await supabase.auth.signOut();
        message.textContent = 'You are not authorized as an admin.';
        return;
    }

    window.location.href = 'admin-dashboard.html';
});
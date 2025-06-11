// Supabase configuration
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Function to get user ID from Clerk
async function getClerkUserId() {
    const user = await Clerk.user();
    return user ? user.id : null;
}

// Function to register user in Supabase
async function registerUser(userId, email) {
    try {
        const { data, error } = await supabase
            .from('users')
            .insert([{ id: userId, email: email, role: 'user' }])
            .select()
            .single();

        if (error) {
            // If user already exists, return null
            if (error.code === '23505') return null;
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

// Function to check if user is admin
async function isUserAdmin(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data?.role === 'admin';
}

export { supabase, getClerkUserId };

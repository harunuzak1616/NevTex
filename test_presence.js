const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://laksjzketaxelkzquvht.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxha3NqemtldGF4ZWxrenF1dmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDI2NzUsImV4cCI6MjA5MjUxODY3NX0.PxA_97pYXvGV5dxR6ZEWngrqfYakntqKE8EqRTNO5WE');
const channel = supabase.channel('online-users');
channel.on('presence', { event: 'sync' }, () => {
    console.log(channel.presenceState());
    process.exit(0);
}).subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
        await channel.track({ user: 'test' });
    }
});

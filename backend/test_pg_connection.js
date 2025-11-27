const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://johang_user:zH0aGC1NPXnkXCGa7MMJr4bCr1QyZTW4@dpg-d4jqgs49c44c73egqnvg-a.oregon-postgres.render.com:5432/johang_joopjoop_db',
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const client = await pool.connect();
    console.log('✅ Connection successful');
    
    const result = await client.query('SELECT tablename FROM pg_tables WHERE schemaname = $1', ['public']);
    console.log('📋 Tables:', result.rows.map(r => r.tablename));
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

test();

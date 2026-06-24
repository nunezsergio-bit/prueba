const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // clear
  await knex('photos').del().catch(()=>{});
  await knex('items').del().catch(()=>{});
  await knex('users').del().catch(()=>{});
  await knex('sites').del().catch(()=>{});

  // sites
  const sites = [];
  for (let i=1;i<=6;i++) sites.push({ name: `Sede ${i}` });
  await knex('sites').insert(sites);
  const s = await knex('sites').select();

  // users
  const adminPass = await bcrypt.hash('Admin123!', 10);
  const userPass = await bcrypt.hash('User123!', 10);
  await knex('users').insert([
    { name: 'Admin', email: 'admin@example.com', password_hash: adminPass, role: 'admin', site_id: null },
    { name: 'Sede1 User', email: 'sede1@example.com', password_hash: userPass, role: 'user', site_id: s[0].id },
    { name: 'Sede2 User', email: 'sede2@example.com', password_hash: userPass, role: 'user', site_id: s[1].id }
  ]);
};

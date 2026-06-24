const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const helmet = require('helmet');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

// static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// multer setup
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(__dirname, '../uploads');
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = Date.now() + '-' + Math.round(Math.random()*1e9) + ext;
      cb(null, name);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') cb(null, true);
    else cb(null, false);
  }
});

// auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db('users').where({ email }).first();
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.user = { id: user.id, email: user.email, role: user.role, site_id: user.site_id };
  res.json({ id: user.id, email: user.email, role: user.role, site_id: user.site_id });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.session.user);
});

function ensureAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

// sites
app.get('/api/sites', async (req, res) => {
  const sites = await db('sites').select();
  res.json(sites);
});

// items list
app.get('/api/items', ensureAuth, async (req, res) => {
  const { site } = req.query;
  const q = db('items').select('items.*', 'users.name as registered_by_name')
    .leftJoin('users', 'items.registered_by', 'users.id')
    .orderBy('items.created_at', 'desc');
  if (site) q.where('items.site_id', site);
  const items = await q;
  // attach photos
  const itemsWithPhotos = await Promise.all(items.map(async item => {
    const photos = await db('photos').where({ item_id: item.id }).select('file_path','thumb_path');
    return { ...item, photos };
  }));
  res.json(itemsWithPhotos);
});

// create item
app.post('/api/items', ensureAuth, upload.array('photos', 8), async (req, res) => {
  try {
    const { name, category, serial_number, quantity, acquisition_date, condition, site_id, notes } = req.body;
    const [id] = await db('items').insert({
      name, category, serial_number, quantity: quantity || 1, acquisition_date: acquisition_date || null,
      condition, site_id, registered_by: req.session.user.id, notes, created_at: new Date()
    });

    // handle files
    const files = req.files || [];
    for (const f of files) {
      const fullPath = path.join(__dirname, '..', 'uploads', f.filename);
      const thumbName = 'thumb-' + f.filename;
      const thumbPath = path.join(__dirname, '..', 'uploads', thumbName);
      // create thumbnail
      await sharp(fullPath).resize(300,300,{fit:'inside'}).toFile(thumbPath);
      await db('photos').insert({ item_id: id, file_path: '/uploads/'+f.filename, thumb_path: '/uploads/'+thumbName, created_at: new Date() });
    }

    const item = await db('items').where({ id }).first();
    res.json({ ok: true, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// export CSV
app.get('/api/export', ensureAuth, async (req, res) => {
  const { site } = req.query;
  const q = db('items').select('items.*','users.email as registered_by_email').leftJoin('users','items.registered_by','users.id');
  if (site) q.where('items.site_id', site);
  const rows = await q;
  const lines = [];
  lines.push('id,name,category,serial_number,quantity,acquisition_date,condition,site_id,registered_by,notes,created_at,photos');
  for (const r of rows) {
    const photos = await db('photos').where({ item_id: r.id }).pluck('file_path');
    const ph = photos.join(';');
    const safe = v=>('"'+String(v||'').replace(/"/g,'""')+'"');
    lines.push([r.id,r.name,r.category,r.serial_number,r.quantity,r.acquisition_date,r.condition,r.site_id,r.registered_by_email,r.notes,r.created_at,ph].map(safe).join(','));
  }
  const csv = lines.join('\n');
  res.header('Content-Type','text/csv');
  res.attachment('export.csv');
  res.send(csv);
});

// start
app.listen(PORT, ()=> console.log('Server listening on', PORT));

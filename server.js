require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://fajarbalushi63_db_user:LOtlDaqbz3BybHze@cluster0.0g3gqhj.mongodb.net/';
const DB_NAME = 'abaya_tracker';

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 10mb allows base64 photos
app.use(express.static(path.join(__dirname, 'public')));

// ── MongoDB Connection ──────────────────────────────────────────────────────
let db;
async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`✅ Connected to MongoDB — database: ${DB_NAME}`);

    // Create indexes for faster queries
    await db.collection('orders').createIndex({ orderDate: -1 });
    await db.collection('catalog').createIndex({ name: 1 });
    await db.collection('customers').createIndex({ name: 1 });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

// ── Helper ──────────────────────────────────────────────────────────────────
function toId(id) {
  try { return new ObjectId(id); } catch { return null; }
}

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: DB_NAME, time: new Date().toISOString() });
});

// ════════════════════════════════════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.collection('orders').find({}).sort({ orderDate: -1 }).toArray();
    res.json(orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = { ...req.body, createdAt: new Date() };
    delete order._id;
    const result = await db.collection('orders').insertOne(order);
    res.json({ ...order, _id: result.insertedId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const update = { ...req.body, updatedAt: new Date() };
    delete update._id;
    await db.collection('orders').replaceOne({ _id: id }, update);
    res.json({ _id: req.params.id, ...update });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    await db.collection('orders').deleteOne({ _id: id });
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════════════
// ABAYA CATALOG
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/catalog', async (req, res) => {
  try {
    const items = await db.collection('catalog').find({}).sort({ name: 1 }).toArray();
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/catalog', async (req, res) => {
  try {
    const item = { ...req.body, createdAt: new Date() };
    delete item._id;
    const result = await db.collection('catalog').insertOne(item);
    res.json({ ...item, _id: result.insertedId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/catalog/:id', async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const update = { ...req.body, updatedAt: new Date() };
    delete update._id;
    await db.collection('catalog').replaceOne({ _id: id }, update);
    res.json({ _id: req.params.id, ...update });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/catalog/:id', async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    await db.collection('catalog').deleteOne({ _id: id });
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await db.collection('customers').find({}).sort({ name: 1 }).toArray();
    res.json(customers);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/customers', async (req, res) => {
  try {
    const customer = { ...req.body, createdAt: new Date() };
    delete customer._id;
    const result = await db.collection('customers').insertOne(customer);
    res.json({ ...customer, _id: result.insertedId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const update = { ...req.body, updatedAt: new Date() };
    delete update._id;
    await db.collection('customers').replaceOne({ _id: id }, update);
    res.json({ _id: req.params.id, ...update });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    await db.collection('customers').deleteOne({ _id: id });
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════════════
// MATERIALS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/materials', async (req, res) => {
  try {
    const materials = await db.collection('materials').find({}).sort({ name: 1 }).toArray();
    res.json(materials);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/materials', async (req, res) => {
  try {
    const material = { ...req.body, createdAt: new Date() };
    delete material._id;
    const result = await db.collection('materials').insertOne(material);
    res.json({ ...material, _id: result.insertedId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/materials/:id', async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const update = { ...req.body, updatedAt: new Date() };
    delete update._id;
    await db.collection('materials').replaceOne({ _id: id }, update);
    res.json({ _id: req.params.id, ...update });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/materials/:id', async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    await db.collection('materials').deleteOne({ _id: id });
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════════════
// GOALS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/goals', async (req, res) => {
  try {
    const goals = await db.collection('goals').find({}).sort({ month: -1 }).toArray();
    res.json(goals);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/goals', async (req, res) => {
  try {
    const goal = { ...req.body, createdAt: new Date() };
    delete goal._id;
    const result = await db.collection('goals').insertOne(goal);
    res.json({ ...goal, _id: result.insertedId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const update = { ...req.body, updatedAt: new Date() };
    delete update._id;
    await db.collection('goals').replaceOne({ _id: id }, update);
    res.json({ _id: req.params.id, ...update });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    await db.collection('goals').deleteOne({ _id: id });
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════════════
// SETTINGS (packaging setup, etc.)
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/settings/:key', async (req, res) => {
  try {
    const doc = await db.collection('settings').findOne({ key: req.params.key });
    res.json(doc || { key: req.params.key, value: null });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/settings/:key', async (req, res) => {
  try {
    const { value } = req.body;
    await db.collection('settings').replaceOne(
      { key: req.params.key },
      { key: req.params.key, value, updatedAt: new Date() },
      { upsert: true }
    );
    res.json({ key: req.params.key, value });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Catch-all: serve frontend ────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ───────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Abaya Tracker running on http://localhost:${PORT}`);
  });
});

const express = require('express');
const router = express.Router();

module.exports = function (pool) {
  // GET /api/items — list all items with contribution summary
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          i.id, i.name, i.description, i.category, i.price_range, i.price,
          i.image_url, i.sort_order,
          COALESCE(c.funded_amount, 0) AS funded_amount,
          COALESCE(c.contributor_count, 0) AS contributor_count
        FROM items i
        LEFT JOIN (
          SELECT
            item_id,
            SUM(amount) AS funded_amount,
            COUNT(*) AS contributor_count
          FROM contributions
          WHERE paid = TRUE
          GROUP BY item_id
        ) c ON c.item_id = i.id
        ORDER BY i.sort_order ASC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching items:', err);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  });

  // GET /api/items/:id — single item with contributions
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    try {
      const itemResult = await pool.query(
        'SELECT id, name, description, category, price_range, price, image_url, sort_order FROM items WHERE id = $1',
        [id]
      );
      if (itemResult.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      const item = itemResult.rows[0];

      const contribResult = await pool.query(
        'SELECT id, contributor_name, amount, paid, created_at FROM contributions WHERE item_id = $1 ORDER BY created_at DESC',
        [id]
      );
      item.contributions = contribResult.rows;

      const paid = contribResult.rows.filter(c => c.paid);
      item.funded_amount = parseFloat(paid.reduce((s, c) => s + parseFloat(c.amount), 0));
      item.contributor_count = paid.length;

      res.json(item);
    } catch (err) {
      console.error('Error fetching item:', err);
      res.status(500).json({ error: 'Failed to fetch item' });
    }
  });

  // GET /api/items/:id/contributions — list unpaid contributions for an item
  router.get('/:id/contributions', async (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    try {
      const result = await pool.query(
        'SELECT id, contributor_name, amount, paid, created_at FROM contributions WHERE item_id = $1 ORDER BY created_at DESC',
        [id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching contributions:', err);
      res.status(500).json({ error: 'Failed to fetch contributions' });
    }
  });

  // POST /api/items/:id/contribute — create a contribution (paid=false)
  router.post('/:id/contribute', async (req, res) => {
    const { id } = req.params;
    const { name, amount } = req.body;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const contribAmount = parseFloat(amount);
    if (!contribAmount || contribAmount < 10000) {
      return res.status(400).json({ error: 'Minimum contribution is ₦10,000' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO contributions (item_id, contributor_name, amount, paid)
         VALUES ($1, $2, $3, FALSE)
         RETURNING id, contributor_name, amount, paid, created_at`,
        [id, name.trim(), contribAmount]
      );

      res.json({
        success: true,
        contribution: result.rows[0],
        account: {
          name: 'Janada Oluwafunmilayo Anjorin',
          number: '7036288231',
          bank: 'Opay'
        }
      });
    } catch (err) {
      console.error('Error creating contribution:', err);
      res.status(500).json({ error: 'Failed to create contribution' });
    }
  });

  // POST /api/items/:id/confirm/:contributionId — mark contribution as paid
  router.post('/:id/confirm/:contributionId', async (req, res) => {
    const { id, contributionId } = req.params;
    const { name } = req.body;

    if (!/^\d+$/.test(id) || !/^\d+$/.test(contributionId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const result = await pool.query(
        `UPDATE contributions
         SET paid = TRUE
         WHERE id = $1 AND item_id = $2 AND contributor_name = $3 AND paid = FALSE
         RETURNING id, contributor_name, amount, paid, created_at`,
        [contributionId, id, name.trim()]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Contribution not found or already confirmed. Check your name matches.'
        });
      }

      // Fetch updated item summary
      const itemResult = await pool.query(`
        SELECT i.id, i.name, i.price,
          COALESCE(SUM(c.amount), 0) AS funded_amount,
          COUNT(c.id) AS contributor_count
        FROM items i
        LEFT JOIN contributions c ON c.item_id = i.id AND c.paid = TRUE
        WHERE i.id = $1
        GROUP BY i.id, i.name, i.price
      `, [id]);

      res.json({
        success: true,
        contribution: result.rows[0],
        item: itemResult.rows[0]
      });
    } catch (err) {
      console.error('Error confirming payment:', err);
      res.status(500).json({ error: 'Failed to confirm payment' });
    }
  });

  return router;
};
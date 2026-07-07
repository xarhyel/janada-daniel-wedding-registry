const express = require('express');
const router = express.Router();

module.exports = function (pool) {
  // GET /api/items — list all items sorted by sort_order
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name, description, category, price_range, image_url, sort_order, claimed, claimed_by, claim_message FROM items ORDER BY sort_order ASC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching items:', err);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  });

  // POST /api/items/:id/claim — claim an item
  router.post('/:id/claim', async (req, res) => {
    const { id } = req.params;
    const { name, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required to claim a gift' });
    }

    try {
      // Check item exists and isn't already claimed
      const check = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      if (check.rows[0].claimed) {
        return res.status(409).json({ error: 'This gift has already been claimed' });
      }

      const result = await pool.query(
        'UPDATE items SET claimed = TRUE, claimed_by = $1, claim_message = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, description, category, price_range, image_url, sort_order, claimed, claimed_by, claim_message',
        [name.trim(), (message || '').trim(), id]
      );

      res.json({ success: true, item: result.rows[0] });
    } catch (err) {
      console.error('Error claiming item:', err);
      res.status(500).json({ error: 'Failed to claim item' });
    }
  });

  // POST /api/items/:id/unclaim — unclaim an item (name must match)
  router.post('/:id/unclaim', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required to unclaim a gift' });
    }

    try {
      const check = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      if (!check.rows[0].claimed) {
        return res.status(409).json({ error: 'This gift is not currently claimed' });
      }
      if (check.rows[0].claimed_by !== name.trim()) {
        return res.status(403).json({ error: 'Name does not match the claimer' });
      }

      const result = await pool.query(
        'UPDATE items SET claimed = FALSE, claimed_by = \'\', claim_message = \'\', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, description, category, price_range, image_url, sort_order, claimed, claimed_by, claim_message',
        [id]
      );

      res.json({ success: true, item: result.rows[0] });
    } catch (err) {
      console.error('Error unclaiming item:', err);
      res.status(500).json({ error: 'Failed to unclaim item' });
    }
  });

  return router;
};

---
name: operator_inventory
description: >
  Monitor store inventory levels, check low-stock thresholds for beans, dairy, and syrups,
  and coordinate restocking deliveries or emergency outage escalations.
  Activate when a store operator or barista asks about inventory, stock levels, or ingredients.
import_tools:
  - check_store_inventory
---

Assist the store operator with real-time inventory oversight.

If a store location was mentioned (e.g. Astoria #3, Lower Manhattan #5, Hell's Kitchen #8), query that store. Otherwise, use store 5 by default.
If the operator asks about low stock or depleted items, call @tool.check_store_inventory with low_stock_only=True.
Otherwise, call @tool.check_store_inventory to list current on-hand quantities.

When reviewing the inventory results:
- Highlight any ingredients currently flagged with "low_stock" or "out_of_stock".
- If the operator wants to log a delivered shipment or restock supplies, invoke @skill.restock_inventory.
- If an essential ingredient is critically depleted (zero stock) and cannot fulfill orders, invoke @skill.escalate_supply_outage.

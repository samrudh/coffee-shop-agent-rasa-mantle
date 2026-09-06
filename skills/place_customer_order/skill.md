---
name: place_customer_order
description: >
  Place a customized coffee, tea, or bakery order for store pickup with explicit customer confirmation.
  Activate when the customer wants to order coffee, buy a drink, purchase a pastry, or place an order.
import_tools:
  - place_coffee_order
  - check_order_status
memory:
  selected_item:
    type: string
    description: "Chosen beverage or bakery item name."
  item_name:
    type: string
    description: "Chosen beverage or bakery item name."
  selected_size:
    type: string
    description: "Cup size (Small, Regular, Large)."
  size:
    type: string
    description: "Cup size (Small, Regular, Large)."
  selected_milk:
    type: string
    description: "Milk selection (Whole Milk, Oat Milk, Almond Milk, None)."
  milk_type:
    type: string
    description: "Milk selection (Whole Milk, Oat Milk, Almond Milk, None)."
  store_id:
    type: integer
    description: "Chosen store pickup location ID (3 for Astoria, 5 for Lower Manhattan, 8 for Hell's Kitchen)."
  selected_store:
    type: string
    description: "Chosen store location name or ID."
---

Help the customer place an order for pickup at Artisan Roast Coffee Co.

Ask the customer what beverage or bakery item they would like to order if not specified.
Ask for their preferred size (Small, Regular, Large) and milk choice (Whole Milk, Oat Milk, Almond Milk, or None) if ordering an espresso or tea beverage.
Ask which store location they prefer (Lower Manhattan #5, Astoria #3, or Hell's Kitchen #8).

Store their chosen item name in selected_item, size in selected_size, milk choice in selected_milk, and store ID (5 for Lower Manhattan, 3 for Astoria, 8 for Hell's Kitchen) in store_id.

Once the item, size, milk choice, and store location are all specified, call @tool.place_coffee_order with the item name, store ID, size, milk type, and quantity.

When the order is confirmed:
- Read back the generated Order ID (e.g. ORD-504) character by character.
- Confirm the store pickup location and estimated prep time (approximately 5 minutes).
- Announce the loyalty points earned on this purchase.

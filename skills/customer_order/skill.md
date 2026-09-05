---
name: customer_order
description: >
  Place a customized coffee, tea, or bakery order for store pickup with explicit customer confirmation.
  Activate when the customer wants to order coffee, buy a drink, purchase a pastry, or place an order.
import_tools:
  - place_coffee_order
  - check_order_status
tool_constraints:
  - place_coffee_order:
      requires: session.project.selected_item
      requires_confirmation:
        enabled: true
        utter_for_confirmation: utter_confirm_coffee_order
        utter_on_user_denial: utter_coffee_order_cancelled
      on_success: utter_coffee_order_success
---

Help the customer place an order for pickup at Artisan Roast Coffee Co.

Ask the customer what beverage or bakery item they would like to order if not specified.
Ask for their preferred size (Small, Regular, Large) and milk choice (Whole Milk, Oat Milk, Almond Milk, or None) if ordering an espresso or tea beverage.
Ask which store location they prefer (Lower Manhattan #5, Astoria #3, or Hell's Kitchen #8).

Store their chosen item name in @memory.project.selected_item.

Once all details are gathered, summarize the drink customization, store location, and estimated price.
Call @tool.place_coffee_order with the item name, store ID, size, milk type, and quantity.

When the order is confirmed:
- Read back the generated Order ID (e.g. ORD-504) character by character.
- Confirm the store pickup location and estimated prep time (approximately 5 minutes).
- Announce the loyalty points earned on this purchase.

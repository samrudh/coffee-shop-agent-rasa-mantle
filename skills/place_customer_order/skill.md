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

<!-- 
================================================================================
RASA MANTLE TEAM FEEDBACK & ISSUE SUMMARY
================================================================================
ISSUE:
When running with LiteLLM and Google Gemini (e.g., gemini/gemini-2.5-flash), multi-turn tool execution occasionally fails with:
  litellm.BadRequestError: Vertex_ai_betaException BadRequestError - 400 INVALID_ARGUMENT
  "Please ensure that function call turn comes immediately after a user turn or after a function response turn."

ROOT CAUSE:
In Rasa Mantle's Orchestrator (`rasa.mantle.orchestration.orchestrator`), conversation history turns passed to LiteLLM can contain consecutive `assistant` role messages (e.g. an `assistant` turn with `tool_calls` followed by an `assistant` utterance or prompt) without an intervening `tool` role response turn. Google Gemini strictly rejects message histories that break the `user` -> `assistant (tool_calls)` -> `tool (response)` sequence.

EXPECTED BEHAVIOR:
1. Mantle's history formatter should normalize turn history before passing messages to LiteLLM/Gemini, ensuring any `assistant` turn containing `tool_calls` is immediately followed by a matching `tool` response turn.
2. If tool execution is gated or requires confirmation (`requires_confirmation: enabled`), Mantle should inject a synthetic `tool` response event (e.g., `content: "confirmation_pending"`) to preserve strict provider role ordering.
================================================================================
-->

When the order is confirmed:
- Read back the generated Order ID (e.g. ORD-504) character by character.
- Confirm the store pickup location and estimated prep time (approximately 5 minutes).
- Announce the loyalty points earned on this purchase.

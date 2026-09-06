---
name: verify_ceo_authentication
description: >
  Verify the 4-digit CEO Executive Security PIN to unlock privileged business and financial analytics.
  Activate when the user explicitly asks to authenticate as CEO or provides their executive PIN.
import_tools:
  - verify_ceo_pin
tool_constraints:
  - verify_ceo_pin:
      requires: session.verify_ceo_authentication.pin_attempt
---

Verify CEO / Executive credentials to grant analytics access.

Ask for their 4-digit Executive Security PIN. Store what they say in pin_attempt.
Never disclose, state, or hint the PIN to the user.

Call @tool.verify_ceo_pin with that PIN.

If authentication succeeds, confirm that CEO privileges are verified and ask which financial or operational metrics they would like to review (Revenue, Gross Margins, Store Benchmarks, or Customer Retention).
If authentication fails, inform the user that the PIN is incorrect and access to financial analytics remains restricted.

---
paths:
  - "contract-template-be/models/**"
  - "contract-template-be/controllers/**"
  - "contract-template-fe/src/types/**"
  - "contract-template-fe/src/services/**"
---

# Cross-app API contract

The two apps talk only over HTTP and share no types package. Any change to a Go model or response shape has to be mirrored by hand in `contract-template-fe/src/types/` and the matching `src/services/*.ts` caller, and the reverse applies too.

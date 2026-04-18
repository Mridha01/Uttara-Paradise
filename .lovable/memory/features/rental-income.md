---
name: Rental Income Module
description: Editable rooms/shops/rent config, monthly collection records, dashboard widget
type: feature
---
- `rental_config` table holds rooms, rent_per_room, shops, rent_per_shop, target_months (default 24), notes
- `rental_collections` table records monthly amounts (UNIQUE month+year), with optional screenshot
- Page `/rental` shows: expected vs collected summary, breakdown by rooms/shops, monthly collection list
- Admin can edit config inline and add/delete monthly entries
- Dashboard shows total collected widget linking to `/rental`
- Used to track current land rental income (~৳40-50k/month from existing rooms+shops)

# People Ops — Phase 0

Frontend-only React 18 + TypeScript app over two entities and one foreign key.

| Entity | Fields |
| --- | --- |
| `Department` | `id`, `name`, `code` |
| `Employee` | `id`, `firstName`, `lastName`, `email`, `phone`, `departmentId` → `Department.id` |

Plain create / list / update / delete for both, shown as a sidebar shell with a
table card per entity, a `+ Add` dialog, row Edit/Delete actions, and 10-row pagination. The FK is enforced on employee
create and on reassignment. No search, no filters, no theming. State is in memory only.

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

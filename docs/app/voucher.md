
### Recommended Usage

#### 1. **`VoucherTable.status` (EVoucherStatus)**

- **Enum Values**: `ACTIVE`, `INACTIVE`, `EXPIRED`, `USED`
- **Purpose**: Represents the voucher's global state, determining whether it’s available for assignment or has reached the end of its lifecycle.
- **Recommended Logic**:
  - **`ACTIVE`**:
    - The voucher is available for assignment.
    - Conditions:
      - `status` is explicitly set to `ACTIVE` by an admin.
      - `startDate` (if exists) ≤ current date.
      - `expiresAt` (if exists) > current date or null.
      - `usageCount` < `maxUsageCount` (if `maxUsageCount` is defined).
    - Use Case: Default state for a new, assignable voucher.
  - **`INACTIVE`**:
    - The voucher is not available for assignment, typically set manually by an admin.
    - Conditions: Explicitly set by admin (e.g., paused or not yet launched).
    - Use Case: Voucher is created but not ready for use, or temporarily disabled.
  - **`EXPIRED`**:
    - The voucher is no longer valid due to time constraints.
    - Conditions: `expiresAt` < current date.
    - Use Case: Automatically updated when the expiration date passes; blocks further assignments.
  - **`USED`**:
    - The voucher has reached its maximum assignment capacity.
    - Conditions: `usageCount` ≥ `maxUsageCount` (if `maxUsageCount` is defined).
    - Use Case: Automatically updated when all available assignments are exhausted.

- **Interaction with `usageCount`**:
  - `usageCount` increments with each assignment (new row in `VoucherUsageTable`).
  - When `usageCount` hits `maxUsageCount`, transition `status` to `USED`.
  - If `usageCount` is still below `maxUsageCount` but `expiresAt` passes, transition to `EXPIRED`.

#### 2. **`VoucherUsageTable.usageStatus` (EVoucherUsageStatus)**

- **Enum Values**: `PENDING`, `USED`, `EXPIRED`
- **Purpose**: Tracks the state of a specific voucher assignment for a user, independent of the voucher's global `status`.
- **Recommended Logic**:
  - **`PENDING`**:
    - The voucher has been assigned to a user but not yet redeemed or applied.
    - Conditions: Set when a new row is created in `VoucherUsageTable` during assignment.
    - Use Case: Initial state after admin assigns the voucher; user hasn’t acted on it yet.
  - **`USED`**:
    - The user has redeemed or applied the voucher (e.g., during a booking or purchase).
    - Conditions: Updated when the user takes an action that consumes the voucher (outside this admin flow).
    - Use Case: Indicates the assignment has been fulfilled by the user.
  - **`EXPIRED`**:
    - The assignment is no longer valid for the user, typically due to time expiration.
    - Conditions:
      - `VoucherTable.expiresAt` < current date (mirrors voucher's `EXPIRED` state).
      - Or a user-specific expiration logic (if you add a per-assignment expiration field).
    - Use Case: Automatically updated if the voucher expires before the user uses it.

- **Interaction with `usageCount`**:
  - `usageCount` increments when `usageStatus` is set to `PENDING` (assignment happens).
  - `usageCount` is unaffected by transitions from `PENDING` to `USED` or `EXPIRED`, as it tracks assignments, not redemptions.

### Summary

- **`usageCount`**: Counts assignments (rows in `VoucherUsageTable` with `usageStatus: PENDING` initially).
- **`VoucherTable.status`**:
  - `ACTIVE`: Assignable.
  - `INACTIVE`: Manually disabled.
  - `EXPIRED`: Time-based end.
  - `USED`: Assignment cap reached.
- **`VoucherUsageTable.usageStatus`**:
  - `PENDING`: Assigned, awaiting use.
  - `USED`: Redeemed by user.
  - `EXPIRED`: Assignment no longer valid.

This setup keeps `usageCount` tied to assignments, `status` as the voucher’s global state, and `usageStatus` as the per-user state. Does this fit your vision, or should we adjust how `USED` or `EXPIRED` behaves? Let me know!

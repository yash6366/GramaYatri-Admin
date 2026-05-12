# Grama-Yatri Security Specification

## Data Invariants
1. A **Route** must have a unique ID and at least one stop to be active.
2. A **BusReport** must be associated with an existing Route and Stop.
3. Only **Admins** can change user roles or ban users.
4. Only **Moderators** and **Admins** can approve/reject BusReports.
5. Users can only update their own profile data (name, email), not their role or credibility score.

## The Dirty Dozen (Payloads to Block)

1. **Self-Promotion Attack**: A user trying to set their own role to 'admin'.
2. **Shadow Field Injection**: Adding `isVerified: true` to a BusReport to bypass moderation.
3. **Ghost Route Creation**: Creating a route without an ID or name.
4. **Credential Spoofing**: Updating another user's email or status.
5. **Orphaned Report**: Submitting a report for a non-existent RouteID.
6. **Time Travel**: Submitting a report with a future `timestamp`.
7. **Mass Deletion**: A moderator trying to delete a user account (only Admins should).
8. **Spam Overflow**: Submitting a BusReport with a 2MB string in `stopId`.
9. **Identity Theft**: Submitting a report while claiming to be another `userId`.
10. **State Skipping**: Updating a report directly from 'pending' to 'approved' by a standard user.
11. **Admin Lockdown**: Trying to delete the bootstrap admin account.
12. **Path Poisoning**: Using `../` or special characters in a document ID.

## Security Rules Strategy
1. **Default Deny**: All paths locked by default.
2. **Validation Helpers**: `isValidUser`, `isValidRoute`, `isValidReport`.
3. **Role Checks**: `isAdmin()`, `isModerator()`, `isRouteManager()`.
4. **Master Gate**: Access to reports requires checking the user's role in the `users` collection.

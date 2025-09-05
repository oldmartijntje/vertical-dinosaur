# Managing Dashboard Pages

This guide explains how to remove or add a dashboard tab/page in the project. The dashboard uses EJS views and dynamic tab loading via client-side JavaScript and Express routes.

## Removing a Dashboard Page

Suppose you want to remove the `users` tab/page. You need to update the following:

### 1. Sidebar Navigation (`views/pages/dashboard.ejs`)
- Remove the corresponding `<li>` or `<a>` for the tab you want to delete.
- Remove any related JS logic for that tab (event listeners, tab switching, etc.).

### 2. Tab Content Route (`src/server.ts`)
- Remove the Express route that serves the tab's content, e.g.:
  ```js
  app.get('/dashboard/users-content', (req, res) => {
      res.render('pages/dashboardUsers');
  });
  ```
- Remove any EJS route for the tab shell if present.

### 3. EJS View File (`views/pages/`)
- Delete the EJS file for the tab, e.g. `dashboardUsers.ejs`.

### 4. Any Other References
- Check for references in helper scripts, documentation, or other files.

---

## Adding a Dashboard Page

Suppose you want to add a new tab called `settings`.

### 1. Create the EJS View
- Add a new file: `views/pages/dashboardSettings.ejs`.
- Add your content for the new tab.

### 2. Add Sidebar Navigation (`views/pages/dashboard.ejs`)
- Add a new `<li>` or `<a>` for the tab in the sidebar.
- Update JS logic to handle tab switching for the new tab.

### 3. Add Tab Content Route (`src/server.ts`)
- Add a new Express route to serve the tab's content:
  ```js
  app.get('/dashboard/settings-content', (req, res) => {
      res.render('pages/dashboardSettings');
  });
  ```
- If using separate shell routes, add those as well.

### 4. Any Other References
- Update helper scripts or documentation as needed.

---

## Summary Table

| Action   | Sidebar Nav | Server Route | EJS View | Other References |
|----------|-------------|--------------|----------|------------------|
| Remove   | Delete tab  | Delete route | Delete   | Check scripts    |
| Add      | Add tab     | Add route    | Create   | Update scripts   |

---

**Tip:** Always restart your server after making these changes to ensure routes and views are updated.

## Frontend Optimization Restructuring & Refactoring Guide

1. `src/blocks` folder will be the designated folder that would replace the old `src/components` folder.

- For now, the `src/components` will remain as is, untouched.
- Any changes would now be saved and implemented inside `src/blocks` for smooth transistion.
- The `src/blocks` folder implements the structure & hierarchy displayed in `~/docs/Optimization Guide/NextJS14`

2. `app/block/` route would now be main testing or sandbox for changes made in `src/blocks`. `app/block/page.tsx` should be the initial landing page.
3. The restructuring & refactoring approach would be broken down into these steps:
4. Implement redundant components, with the use of the `src/blocks` folder.
5. The structure of the `src/blocks` will be treated as a Tree Structure (in Programming).
6. Changes should start on the Leaves or Leaf nodes. These are sub/child components who doesn't have sub components of their own.
7. Changes should be tested in `app/blocks`. The structure for `app/blocks` should eventually mimic the entire `src/app`.
   Use this as a reference:

```
  ├── app/                         # Next.js 14 app directory (Server Components by default)
  │   ├── layout.tsx              # Root layout: Providers, global UI elements
  │   ├── page.tsx                # Landing page: Initial entry point
  │   ├── error.tsx               # Global error boundary for error handling
  │   ├── loading.tsx             # Global loading UI for Suspense
  │   ├── not-found.tsx          # Custom 404 page
  │   ├── globals.css            # Global styles and CSS reset
  │   │
  │   ├── dashboard/             # Dashboard section
  │   │   ├── layout.tsx         # Dashboard layout: Navigation, sidebar, common UI
  │   │   ├── page.tsx          # Dashboard home: Overview and metrics
  │   │   ├── loading.tsx       # Dashboard-specific loading UI
  │   │   ├── error.tsx         # Dashboard error handling
  │   │   │
  │   │   ├── admin/           # Admin section
  │   │   │   ├── page.tsx     # Admin dashboard: System management
  │   │   │   └── layout.tsx   # Admin-specific layout and navigation
  │   │   │
  │   │   ├── manager/        # Manager section
  │   │   │   ├── page.tsx    # Manager dashboard: Team overview
  │   │   │   └── layout.tsx  # Manager-specific layout
  │   │   │
  │   │   └── staff/         # Staff section
  │   │       ├── page.tsx   # Staff dashboard: Personal overview
  │   │       └── layout.tsx # Staff-specific layout
  │   └── blocks/
  │       ├── layout.tsx              # Root layout: Providers, global UI elements
  │       ├── page.tsx                # Landing page: Initial entry point
  │       ├── error.tsx               # Global error boundary for error handling
  │       ├── loading.tsx             # Global loading UI for Suspense
  │       ├── not-found.tsx          # Custom 404 page
  │       ├── globals.css            # Global styles and CSS reset
  │       │
  │       └── dashboard/             # Dashboard section
  │           ├── layout.tsx         # Dashboard layout: Navigation, sidebar, common UI
  │           ├── page.tsx          # Dashboard home: Overview and metrics
  │           ├── loading.tsx       # Dashboard-specific loading UI
  │           ├── error.tsx         # Dashboard error handling
  │           │
  │           ├── admin/           # Admin section
  │           │   ├── page.tsx     # Admin dashboard: System management
  │           │   └── layout.tsx   # Admin-specific layout and navigation
  │           │
  │           ├── manager/        # Manager section
  │           │   ├── page.tsx    # Manager dashboard: Team overview
  │           │   └── layout.tsx  # Manager-specific layout
  │           │
  │           └── staff/         # Staff section
  │               ├── page.tsx   # Staff dashboard: Personal overview
  │               └── layout.tsx # Staff-specific layout
```

8. Once the changes are identical to the matching `src/components/` components, you can proceed to either (a) refactor leaf nodes within the same folder
   or (b) refactor to the parent component of the component you are working on. Repeat steps 6-8 until we reach the root node.
9. Upon finalization of the root node and such that all branches under the root are working as expected & optimized, we can proceed to delete the original `src/components` and rename `src/blocks` -> `src/components`. As for the `app/blocks`, we defer to the easiest implementation, whether doing the same thing as what we did to the components or just remove `app/blocks` altogether and move the changes to the `app` directory.

<br />

## Additional Notes:

1. The `root` as referred in steps 8 & 9 would be the Landing Page, Admin Dashboard, Manager Dashboard, & Staff Dashboard.
2. In `app/blocks`, **YOUR** access should only be limited to `app/blocks/dashboard`. Everything else should **NOT BE MODIFIED OR TAMPERED**, only one _assigned member_ would handle the other components. The _assigned member_ would be the only one to initiate the final change **(Step 9)**. Therefore the _assigned member_ would oversee the branch and ensure that everything is updated and working as intended.
3. Each error alternative and loading of a component is placed inside the specific component Folder. For example, ErrorCard can be found inside `Dashboard/components/Cards/`.

<br />

## Reuseable Component Requests:

### List down properly any requests for a reuseable component here! Kindly follow the example

Example: `ErrorCard - props(error: Type, message: String, refetech: ()=>Promise<void>) - description for additional context & use case.`

1.

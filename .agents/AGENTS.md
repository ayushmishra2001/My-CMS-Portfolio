# Project Memory & Context Rules

To operate efficiently and minimize token usage, adhere to the following rules:

1. **Read Project Memory First**: Before scanning directories or running global search tools, always read the project memory file at [memory.md](file:///d:/Portfolio/devfolio-cms/.agents/memory.md). This contains the up-to-date folder structure, active task state, and architecture.
2. **Do Not Scan Extensively**: Avoid recursive directory listings or global grep searches if the information can be deduced or is documented in the memory file.
3. **Maintain the Memory File**: After implementing features, modifying folder structures, or changing dependencies, update [memory.md](file:///d:/Portfolio/devfolio-cms/.agents/memory.md) to reflect the new state, directory map, and completed/active tasks.

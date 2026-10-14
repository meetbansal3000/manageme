# Critical Rule: Drive D Exclusive Workspace Policy

## Storage and Working Directory Enforcement
1. **Drive C Restriction**:
   - DO NOT create, write, or store files on Drive C.
   - DO NOT write scratch scripts, project files, dependencies, or artifacts to Drive C.
   - Preserve all remaining space on Drive C.

2. **Drive D Exclusive Operations**:
   - Primary Workspace: `D:\AI-Workspace`
   - Agent Work & Scratch Directory: `D:\AI-Workspace\Antigravity`
     - Scratch directory: `D:\AI-Workspace\Antigravity\scratch`
     - Data storage: `D:\AI-Workspace\Antigravity\data`
     - Memory & run logs: `D:\AI-Workspace\Antigravity\memory`
   - Primary Application Project: `D:\AI-Workspace\Projects\manageme`
     - The `manageme` project has been permanently transferred from Drive C to Drive D.
     - All updates, builds, runs, tests, and database migrations for `manageme` must execute in `D:\AI-Workspace\Projects\manageme`.
   - Skills & Tools:
     - Shared Skills: `D:\AI-Workspace\Global-Skills`
     - Workspace Skills: `D:\AI-Workspace\.agents\skills`
     - Tools Directory: `D:\AI-Workspace\Tools`

3. **Execution Context**:
   - Set current working directory (`Cwd`) to `D:\AI-Workspace\Projects\manageme` for ManageMe tasks.
   - Set `Cwd` to `D:\AI-Workspace\Antigravity` for standalone agent tasks.

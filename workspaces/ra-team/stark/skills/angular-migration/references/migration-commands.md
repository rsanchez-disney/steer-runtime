# Migration Commands per Version Hop

## General pattern

```bash
# 1. Switch to correct Node version
nvm use <required-node>

# 2. Update Angular core + CLI
ng update @angular/core@<target> @angular/cli@<target>

# 3. Update other Angular packages
ng update @angular/cdk@<target>  # if using CDK
ng update @angular/material@<target>  # if using Material

# 4. Verify
npm run build && npm run test
```

## Specific commands per hop

### 5 → 6
```bash
nvm use 8
npm install @angular/cli@6 -g
ng update @angular/core@6 @angular/cli@6
# Install RxJS compat layer
npm install rxjs-compat
# Migrate RxJS imports later (see rxjs-migration.md)
```

### 6 → 7
```bash
ng update @angular/core@7 @angular/cli@7
ng update @angular/material@7  # if used
```

### 7 → 8
```bash
nvm use 10
ng update @angular/core@8 @angular/cli@8
# Automatic migration: lazy loading syntax will be updated
ng update @angular/material@8  # if used
```

### 8 → 9
```bash
ng update @angular/core@9 @angular/cli@9
# Ivy is now default — verify: tsconfig.json should NOT have enableIvy:false
ng update @angular/material@9  # if used
```

### 9 → 10
```bash
ng update @angular/core@10 @angular/cli@10
# Remove moduleId from any @Component decorators
```

### 10 → 11
```bash
ng update @angular/core@11 @angular/cli@11
# Optional: migrate tslint→eslint
ng add @angular-eslint/schematics
ng g @angular-eslint/schematics:convert-tslint-to-eslint
```

### 11 → 12
```bash
nvm use 14
ng update @angular/core@12 @angular/cli@12
# Remove `enableIvy` from tsconfig (no longer needed)
# Remove `emitDecoratorMetadata` from tsconfig
# Fix Sass imports: replace ~package with package
```

### 12 → 13
```bash
ng update @angular/core@13 @angular/cli@13
# Remove `entryComponents` from all NgModules
# Update TestBed: add teardown config
# If using ComponentFactoryResolver, replace with ViewContainerRef.createComponent
```

### 13 → 14
```bash
nvm use 16
ng update @angular/core@14 @angular/cli@14
# Optional: start using typed forms
# Optional: start using inject() function
# Optional: start using standalone components
```

### 14 → 15
```bash
ng update @angular/core@15 @angular/cli@15
# Material: MDC migration (visual changes!)
ng update @angular/material@15
# Optional: convert modules to standalone
ng generate @angular/core:standalone
# Optional: replace HttpClientModule with provideHttpClient()
```

### 15 → 16
```bash
ng update @angular/core@16 @angular/cli@16
# Optional: start using signals
# Optional: use takeUntilDestroyed with DestroyRef
# Optional: use required inputs
```

### 16 → 17
```bash
nvm use 18
ng update @angular/core@17 @angular/cli@17
# Migrate control flow (recommended):
ng generate @angular/core:control-flow
# SSR: replace @nguniversal/* with @angular/ssr
ng update @angular/ssr@17  # if using SSR
```

### 17 → 18
```bash
ng update @angular/core@18 @angular/cli@18
# Migrate to signal inputs:
ng generate @angular/core:signal-input
# Migrate to signal queries:
ng generate @angular/core:signal-queries
# Migrate to inject():
ng generate @angular/core:inject
# Optional: enable zoneless
```

### 18 → 19
```bash
ng update @angular/core@19 @angular/cli@19
# Karma deprecated — consider migrating to Jest:
# npm install jest @angular-builders/jest --save-dev
# Optional: use resource()/httpResource() for data fetching
```

### 19 → 20
```bash
nvm use 20
ng update @angular/core@20 @angular/cli@20
# Zoneless is now stable — remove "Experimental" prefix if used:
# provideExperimentalZonelessChangeDetection() → provideZonelessChangeDetection()
# effect() no longer needs allowSignalWrites
```

### 20 → 21
```bash
ng update @angular/core@21 @angular/cli@21
# linkedSignal() now stable
# afterRenderEffect() now stable
```

### 21 → 22
```bash
nvm use 22
ng update @angular/core@22 @angular/cli@22
# Standalone is now the only bootstrapping mode for new projects
# Existing NgModule apps still work but are legacy
# Full ESM package format
```

## Handling errors during ng update

### Peer dependency conflicts
```bash
# Try with --force flag
ng update @angular/core@<target> @angular/cli@<target> --force

# If still fails, manually update package.json versions and run:
npm install
```

### TypeScript version mismatch
```bash
# Check required TS version
ng update @angular/core@<target> --next

# Install correct TS
npm install typescript@~<version> --save-dev
```

### Package not found / registry errors
```bash
# Clear cache and retry
npm cache clean --force
rm package-lock.json
npm install
ng update @angular/core@<target> @angular/cli@<target>
```

### Build fails after update
Common causes:
1. **Import paths changed** — Angular consolidates/moves exports between versions
2. **Deprecated API removed** — Check the breaking changes reference
3. **Type strictness increased** — Fix type errors or temporarily set `strict: false`
4. **Third-party libs incompatible** — Update them separately

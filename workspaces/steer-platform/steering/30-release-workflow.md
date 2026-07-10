---
inclusion: auto
description: Release management workflow for steer-platform repos
---

# Release workflow

## publish-all (primary release command)

Run from Koda repo:

```bash
cd ~/Workspace/Disney/SANCR225/Koda
make publish-all SKIP_CERTIFY=1
```

### Pipeline order

1. Pre-flight `verify-versions` — checks version consistency across private/public/local
2. Koda — if commits since last tag, bump patch, build all platforms, publish, verify
3. steer-runtime — if commits since last public release, bump patch, validate, publish tarball + checksum, verify
4. steer-autopilot — same pattern
5. Kite, Mouseketool, DCC — same pattern
6. Post-flight report generated

### Version schemes

| Repo            | Scheme  | Example   | Where published                            |
|-----------------|---------|-----------|---------------------------------------------|
| Koda            | v0.4.x  | v0.4.224  | github.com/rsanchez-disney/Koda             |
| steer-runtime   | v0.2.x  | v0.2.156  | github.com/rsanchez-disney/steer-runtime    |
| steer-autopilot | v1.0.x  | v1.0.3    | github.disney.com/SANCR225/steer-autopilot  |

### Verification gates

After each publish step, these targets run automatically:

- `verify-release-koda` — confirms all 4 platform binaries present
- `verify-release-steer` — confirms tarball asset accessible (auto-recovers if missing)
- `verify-versions` — asserts private/public/local consistency

### Common failure modes

| Symptom                                  | Cause                          | Fix                                           |
|------------------------------------------|--------------------------------|-----------------------------------------------|
| `no .tar.gz asset found in release`      | Tarball not uploaded           | `make pack-steer && gh release upload`        |
| `tag already exists`                     | Stale tag from failed publish  | Automatic cleanup (delete + recreate)         |
| Private ≠ Public version                 | Partial publish failure        | Re-run `publish-all` or manual `publish-steer`|
| `Cannot resolve tag in local repo`       | Missing tag locally            | `git fetch --tags` in steer-runtime           |

### SHA-256 checksums

Every published tarball has a `.sha256` companion file uploaded alongside it. Koda verifies the checksum on download (backward-compatible: skips if no checksum file exists).

### Manual hotfix release

If you need to re-publish a specific version without bumping:

```bash
cd ~/Workspace/Disney/SANCR225/Koda
make pack-steer STEER_ROOT=../steer-runtime
GH_HOST=github.com gh release upload v0.2.156 bin/steer-runtime.tar.gz.enc \
  --repo rsanchez-disney/steer-runtime --clobber
```

### Cleanup

- `publish-all` keeps only the last 3 releases per repo
- Internal v3+ tags should not exist on steer-runtime (clean with `git tag -d` + `git push --delete`)

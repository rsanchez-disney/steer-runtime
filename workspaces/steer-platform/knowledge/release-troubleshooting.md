# Release troubleshooting

## v0.2.155 incident (2026-07-10)

### Symptom

Users on Windows reported:

```text
koda upgrade
steer-runtime not found. Cloning...
Error: auto-clone failed: download failed: no .tar.gz asset found in release v0.2.155
```

### Root cause

Release v0.2.155 was published to github.com/rsanchez-disney/steer-runtime with 0 assets. The tag and release existed but no tarball was attached.

**How it happened:** The release was created (tag pushed + `gh release create`) but the tarball upload step either failed silently or was run separately from `make publish-steer` which bundles create + upload atomically.

### How Koda downloads steer-runtime

1. `internal/ops/steer.go` → `DownloadFromRelease()`
2. Calls `fetchLatestRelease()` → hits `api.github.com/repos/rsanchez-disney/steer-runtime/releases/latest`
3. Calls `findTarball(rel)` → iterates `rel.Assets` looking for `.tar.gz` or `.tar.gz.enc`
4. If no match → returns the error

### Fix applied

1. Ran `make publish-all SKIP_CERTIFY=1` to create v0.2.156 with the tarball
2. Added verification gates to the Makefile (PR #259, merged):
   - `verify-release-steer` — confirms tarball exists after upload, auto-recovers
   - `verify-release-koda` — confirms all platform binaries
   - `verify-versions` — pre/post-flight consistency check
3. Added SHA-256 checksum upload + verification on download

### Prevention

The `verify-release-steer` target now runs automatically after every `publish-steer`. If the upload fails, it attempts recovery from the local artifact before failing the pipeline.

### Manual recovery (if it happens again)

```bash
cd ~/Workspace/Disney/SANCR225/Koda
make pack-steer STEER_ROOT=../steer-runtime
GH_HOST=github.com gh release upload <TAG> bin/steer-runtime.tar.gz.enc \
  --repo rsanchez-disney/steer-runtime --clobber
```

## Version drift between private and public repos

### Pattern

Private repo (github.disney.com) and public repo (github.com) can drift because:

- `publish-all` pushes tags to private origin but creates releases on public
- If publish partially fails, one side gets the tag and the other doesn't
- The "keep last 3" cleanup on public deletes old releases that still exist on private

### Current state (as of v0.2.156)

- Private latest release: v0.2.152
- Public latest release: v0.2.156
- This is expected — private releases are less frequent

### Internal v3+ tags

Tags v3.5.0 through v3.10.0 exist locally but should not be on the public repo. These are from internal versioning that leaked. Clean with:

```bash
git tag -d v3.5.0 v3.7.0 v3.8.0 v3.9.1 v3.10.0
git push origin --delete v3.5.0 v3.7.0 v3.8.0 v3.9.1 v3.10.0
```

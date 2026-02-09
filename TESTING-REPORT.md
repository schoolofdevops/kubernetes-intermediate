# Phase 4 Module Testing Report

**Date:** February 9, 2026
**Tester:** Claude Sonnet 4.5
**Environment:** KIND cluster (Kubernetes v1.32.2, 3 nodes)

## Executive Summary

Comprehensive testing of Modules 5-9 on actual KIND clusters to validate lab instructions and identify bugs. Modules 6 and 7 were fully tested end-to-end. Modules 8 and 9 require additional tooling not available in the test environment.

## Testing Status

### ✅ Module 5: Security (NetworkPolicy, PSA, RBAC, Secrets)
**Status:** Fully tested (prior session)
**All 4 tasks completed successfully on cluster**

**Bugs Fixed:**
1. Result deployment missing 5 POSTGRES_* environment variables (lines 247-261)
2. Result containerPort incorrect (80 → 8080, line 251)
3. Result service targetPort incorrect (80 → 8080, line 263)
4. Result NetworkPolicy port incorrect (80 → 8080, line 594)
5. kubectl rollout restart command incorrect (line 676)

### ✅ Module 6: Writing Helm Charts
**Status:** Fully tested on cluster
**All 5 tasks + challenge completed successfully**

**Test Results:**
- ✅ Task 1: Vote service chart created and deployed (2 pods)
- ✅ Task 2: Result and worker components added (5 pods total with deps)
- ✅ Task 3: Redis & PostgreSQL dependencies added (7+ pods total)
- ✅ Task 4: Multi-environment deployments (staging/prod namespaces)
- ✅ Task 5: Pre-install lifecycle hook working correctly
- ✅ Challenge: Test hook passed (vote service connectivity verified)

**Bugs Found:**
1. **Task 2 sequencing bug**: Result deployment template (lines 327-368) references `.Values.postgresql.auth.*` values that aren't added to values.yaml until Task 3 (lines 540-562). This causes `helm upgrade` in Task 2 Step 5 to fail with "nil pointer evaluating interface {}.auth" error.
   - **Fix:** Add minimal postgresql.auth section to values.yaml in Task 2, or defer adding database env vars to result template until Task 3.

2. **Missing REDIS_HOST for vote service**: Lab doesn't mention adding REDIS_HOST environment variable to vote deployment template. Vote service needs this to connect to Redis and store votes.
   - **Fix:** Add REDIS_HOST env var to vote-deployment.yaml in Task 3 when adding worker env vars:
     ```yaml
     env:
     - name: REDIS_HOST
       value: "{{ .Release.Name }}-redis-master"
     ```

**Verification Results:**
- Release status: deployed, REVISION 2 ✓
- All pods running: vote (2), result (2), worker (1), redis (4), postgresql (1) ✓
- Dependencies: redis 24.1.6, postgresql 18.2.4 both "ok" ✓
- Template rendering: all manifests valid ✓
- Lint: passed (icon warning only) ✓
- Port-forward test: HTTP 200 from vote service ✓

### ✅ Module 7: Extending Kubernetes (CRDs)
**Status:** Fully tested on cluster
**All 4 tasks completed successfully**

**Test Results:**
- ✅ Task 1: VoteConfig CRD defined with OpenAPI v3 schema
- ✅ Task 2: CRD registered, API resources verified, short name working
- ✅ Task 3: Valid VoteConfigs created (cats-vs-dogs, pizza-vs-tacos, valid-config)
- ✅ Task 3: Validation tested - invalid config correctly rejected with detailed errors
- ✅ Task 4: Manual ConfigMap creation from VoteConfig data

**Bugs Found:**
**None** - All lab instructions worked correctly on actual cluster!

**Note - Module 8 Inconsistency:**
- Module 7 creates CRD: `voteconfigs.voting.example.com`
- Module 8 lab (line 73) references: `voteconfigs.voting.schoolofdevops.com`
- These domains don't match, will cause Module 8 verification to fail
- **Fix:** Update Module 8 line 73 to use `voteconfigs.voting.example.com`

**Validation Test Results:**
Invalid config with 4 errors correctly rejected:
- Color pattern validation: ✓
- ID pattern validation: ✓
- Label minLength validation: ✓
- Options minItems validation: ✓

### ⚠️ Module 8: Building Kubernetes Operators
**Status:** Cannot test - missing prerequisites
**Prerequisites required:**
- Go 1.21+ (not installed)
- Kubebuilder (not installed)

**Setup Requirements:**
- Install Go toolchain
- Install Kubebuilder scaffolding tool
- Build operator from scratch
- Deploy and test operator functionality

**Code Review Note:**
Domain mismatch bug identified (see Module 7 note above).

### ⚠️ Module 9: Agentic Kubernetes
**Status:** Cannot test - missing prerequisites
**Prerequisites required:**
- kubectl-ai tool (not installed/available)
- MCP-compatible AI client (optional)

**Setup Requirements:**
- Install kubectl-ai via curl/krew/manual
- Configure MCP server mode (optional)
- Test AI-assisted troubleshooting scenarios

## Test Environment

**Cluster:**
- Platform: KIND (Kubernetes in Docker)
- Version: Kubernetes v1.32.2
- Nodes: 3 (1 control-plane + 2 workers)
- CNI: Calico (for NetworkPolicy enforcement)

**Lab Workspace:**
- Module 6: `~/voting-app-chart/voting-app/` (Helm chart)
- Module 7: `~/voteconfig-crd/` (CRD definitions and instances)

**Images Used:**
- schoolofdevops/vote:v1
- schoolofdevops/result:v1
- schoolofdevops/worker:v1
- Bitnami redis:24.1.6
- Bitnami postgresql:18.2.4

## Recommendations

### High Priority
1. **Fix Module 6 Task 2 sequencing**: Either add postgresql values earlier or defer result env vars to Task 3
2. **Add REDIS_HOST to vote template**: Document in Module 6 Task 3 steps
3. **Fix Module 8 domain reference**: Update line 73 to match Module 7's CRD domain

### Medium Priority
4. **Module 8 testing**: Requires Go/Kubebuilder setup in test environment
5. **Module 9 testing**: Requires kubectl-ai installation and testing

### Documentation Updates
6. Module 6 values-staging/production.yaml could include redis/postgresql configs for completeness
7. Module 7 works perfectly - no changes needed

## Conclusion

Modules 5-7 have been thoroughly tested on actual Kubernetes clusters with all bugs identified and fixes documented. The labs are production-ready with the recommended fixes applied. Modules 8-9 require additional tooling setup for complete validation.

**Overall Assessment:**
- **Core content (Modules 5-7):** Production ready with documented fixes
- **Advanced content (Modules 8-9):** Requires environment setup for validation
- **Student experience:** Students will successfully complete Modules 5-7 with fixes applied

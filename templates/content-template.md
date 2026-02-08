# [Topic Name]

:::note[Flexible Framework]
This template provides suggested sections for reading materials. Authors should adapt the structure to fit module needs - not all sections are required for every topic. The goal is clear, practical content that can be read in 10-20 minutes.
:::

## Overview

[1-2 paragraphs introducing the topic. What is this concept/feature? Why does it matter in Kubernetes? How does it relate to the Example Voting App and previous modules?]

[Second paragraph: Set the context for intermediate learners - assume they know basic Kubernetes but need deeper understanding of this specific area.]

## Key Concepts

### [Concept 1]

[Detailed explanation of the first key concept. Break down complex ideas into digestible pieces.]

[Use concrete examples where possible. Connect to real-world scenarios.]

```yaml title="example-config.yaml"
# Example demonstrating this concept
apiVersion: v1
kind: [ResourceKind]
metadata:
  name: example-resource
spec:
  # Key configuration relevant to this concept
  # highlight-next-line
  importantSetting: value
  anotherSetting: value
```

[Explain what this configuration does and why these settings matter.]

:::tip[Pro Tip]
[Practical advice, shortcut, or best practice related to this concept that intermediate users will appreciate.]
:::

### [Concept 2]

[Detailed explanation of the second key concept.]

[Build on the previous concept where appropriate - show how ideas connect.]

```bash
# Example commands demonstrating this concept
kubectl [command] [args]
kubectl [another-command] [args]
```

Expected output:

```bash
[Show what users should expect to see]
```

[Explain the output and what it tells us.]

### [Concept 3]

[Detailed explanation of the third key concept.]

[Continue building a complete picture of the topic.]

:::info[Version Note]
[Information about version-specific behavior, compatibility notes, or changes between Kubernetes versions that affect this concept.]
:::

## Practical Examples

### Example 1: [Scenario with Example Voting App]

[Describe a realistic scenario using the Example Voting App that demonstrates the concepts covered above.]

[Explain the problem or requirement this solves.]

```yaml title="voting-app-[feature].yaml"
# Configuration for the voting app that demonstrates this module's concepts
apiVersion: [api-version]
kind: [ResourceKind]
metadata:
  name: voting-app-[component]
  namespace: voting-app
  labels:
    app: voting-app
    component: [component-name]
spec:
  # Configuration relevant to this module's topic
  [setting]: [value]
  [nested-setting]:
    [key]: [value]
```

[Walk through the configuration - explain key decisions and their implications.]

```bash
# Apply and verify
kubectl apply -f voting-app-[feature].yaml
kubectl get [resource] -n voting-app
```

### Example 2: [Another Practical Scenario]

[Second realistic example that demonstrates a different aspect or use case.]

[Build complexity gradually - this example might combine multiple concepts.]

```bash
# Multi-step example with explanation between commands
kubectl [first-command]

# [Explain what happened and why the next step matters]
kubectl [second-command]
```

## Common Patterns

### Pattern 1: [Best Practice or Common Approach]

[Describe a recommended pattern or approach for using this feature in production.]

[Explain when to use this pattern and what problems it solves.]

```yaml
# Example demonstrating the pattern
apiVersion: [api-version]
kind: [ResourceKind]
metadata:
  name: [resource-name]
spec:
  # Pattern-specific configuration
  [key]: [value]
```

:::tip[When to Use This]
[Guidance on when this pattern is most appropriate - scenarios, scale considerations, etc.]
:::

### Pattern 2: [Another Pattern]

[Describe another common pattern or approach.]

[Contrast with Pattern 1 where appropriate - help learners understand tradeoffs.]

## Gotchas and Pitfalls

### Pitfall 1: [Common Mistake]

[Describe a common mistake intermediate users make with this feature.]

**The Problem:**

[Explain what goes wrong and why.]

**What to Do Instead:**

[Provide the correct approach with explanation.]

```yaml
# Correct configuration avoiding the pitfall
apiVersion: [api-version]
kind: [ResourceKind]
spec:
  # highlight-next-line
  correctSetting: [proper-value]
```

:::caution[Watch Out]
[Additional warning or context about this pitfall - why it's particularly important to avoid.]
:::

### Pitfall 2: [Another Common Issue]

[Describe another gotcha or anti-pattern.]

**The Problem:**

[Explain the issue.]

**What to Do Instead:**

[Provide guidance on the better approach.]

### Pitfall 3: [Third Issue to Avoid]

[Third common mistake or misconception.]

**Why This Matters:**

[Explain the consequences of this mistake - performance, reliability, security, etc.]

**The Right Way:**

[Clear guidance on the correct approach.]

## Summary

Key takeaways from this module:

- [Concise summary point 1 - core concept or capability learned]
- [Summary point 2 - how this fits into the bigger Kubernetes picture]
- [Summary point 3 - practical application or best practice]
- [Summary point 4 - how this builds on previous modules]
- [Summary point 5 - preparation for what comes next]

## Further Reading

- [Official Kubernetes Documentation: Relevant Topic](https://kubernetes.io/docs/...)
- [Kubernetes API Reference: Resource Type](https://kubernetes.io/docs/reference/...)
- [Additional resource or blog post with specific, actionable content]
- [Community resource or tool related to this topic]

:::info[Next Steps]
You're now ready to apply these concepts hands-on in the lab. You'll use the Example Voting App to practice [brief description of what the lab will cover].
:::

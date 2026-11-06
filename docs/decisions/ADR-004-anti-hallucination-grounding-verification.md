# ADR-004: Strict Numeric Grounding and Anti-Hallucination Verification

## Status
Accepted

## Context
A major failure mode of LLM-based data assistants is hallucinating figures, inventing trends, or pulling numbers from model pretraining weights rather than the executed database query.

## Decision
1. **Tool-Gated Execution**: The LLM has zero direct database credentials; it must call `run_sql` to obtain data.
2. **Numeric Grounding Extraction**:
   - The generated response prose is parsed for all numerical values (percentages, currencies, integers, floating-point numbers).
   - Every number must match an entry in the returned result set or be verifiable by a deterministic mathematical relationship (sum of column, delta between two cells, percentage of total).
3. **Automated Recovery Loop**:
   - If ungrounded numbers are detected, the system issues a single regeneration prompt to the LLM indicating which figures could not be verified.
   - If regeneration fails grounding a second time, the prose explanation is suppressed, and the user receives only the verified data table and chart with an explicit warning banner: *"Prose omitted due to grounding check failure."*
4. **Zero Prediction Policy**: Requests for forecasts or predictions are rejected by the assistant with an explanation that the tool operates solely on recorded historical data.

## Consequences
- **Positive**: Guarantees users never see ungrounded or fabricated metrics in business reports.
- **Negative**: Increases latency slightly when verification triggers a regeneration pass.


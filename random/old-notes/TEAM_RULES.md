# Team Rules (legacy notes)

- Never fetch related records one at a time inside a loop (the N+1 query
  pattern). If you need data for a list of IDs, fetch it in a single
  batched call instead of calling a per-item lookup function repeatedly.

import type {
  EnvelopeError,
  EnvelopeMeta,
  ErrorEnvelope,
  LinearAction,
  LinearEntity,
  OutputEnvelope,
  SuccessEnvelope,
} from "../types/public.js";

export function successEnvelope<Data>(
  entity: LinearEntity,
  action: LinearAction,
  data: Data,
  meta?: EnvelopeMeta,
): SuccessEnvelope<Data> {
  return {
    ok: true,
    entity,
    action,
    data,
    meta,
  };
}

export function errorEnvelope(
  entity: LinearEntity,
  action: LinearAction,
  error: EnvelopeError,
  meta?: EnvelopeMeta,
): ErrorEnvelope {
  return {
    ok: false,
    entity,
    action,
    error,
    meta,
  };
}

export function isErrorEnvelope<Data>(payload: OutputEnvelope<Data>): payload is ErrorEnvelope {
  return payload.ok === false;
}

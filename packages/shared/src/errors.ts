import { PROBLEM_TYPE_BASE_URL } from "./constants.js";

export type ErrorCode =
  "ENV_VALIDATION_ERROR" | "INTERNAL_SERVER_ERROR" | "UPSTREAM_DATA_ERROR" | "VALIDATION_ERROR";

export type ProblemDetails = {
  readonly code: ErrorCode;
  readonly detail?: string;
  readonly instance?: string;
  readonly status: number;
  readonly title: string;
  readonly type: string;
};

type QShieldErrorOptions = {
  readonly code: ErrorCode;
  readonly detail?: string | undefined;
  readonly status: number;
};

export class QShieldError extends Error {
  readonly code: ErrorCode;
  readonly detail: string | undefined;
  readonly status: number;

  constructor(message: string, options: QShieldErrorOptions) {
    super(message);
    this.name = "QShieldError";
    this.code = options.code;
    this.detail = options.detail;
    this.status = options.status;
  }
}

export class ValidationError extends QShieldError {
  constructor(message: string, options: { readonly detail?: string | undefined } = {}) {
    super(message, {
      code: "VALIDATION_ERROR",
      detail: options.detail,
      status: 400,
    });
    this.name = "ValidationError";
  }
}

export class UpstreamDataError extends QShieldError {
  constructor(message: string, options: { readonly detail?: string | undefined } = {}) {
    super(message, {
      code: "UPSTREAM_DATA_ERROR",
      detail: options.detail,
      status: 502,
    });
    this.name = "UpstreamDataError";
  }
}

export function toProblemJson(error: unknown, instance?: string): ProblemDetails {
  if (error instanceof QShieldError) {
    return withOptionalFields(
      {
        code: error.code,
        status: error.status,
        title: error.message,
        type: problemType(error.code),
      },
      {
        detail: error.detail,
        instance,
      },
    );
  }

  return withOptionalFields(
    {
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
      title: "Internal Server Error",
      type: problemType("INTERNAL_SERVER_ERROR"),
    },
    {
      instance,
    },
  );
}

function problemType(code: ErrorCode): string {
  return `${PROBLEM_TYPE_BASE_URL}/${code.toLowerCase().replaceAll("_", "-")}`;
}

function withOptionalFields(
  problem: Omit<ProblemDetails, "detail" | "instance">,
  optionalFields: {
    readonly detail?: string | undefined;
    readonly instance?: string | undefined;
  } = {},
): ProblemDetails {
  return {
    ...problem,
    ...(optionalFields.detail === undefined ? {} : { detail: optionalFields.detail }),
    ...(optionalFields.instance === undefined ? {} : { instance: optionalFields.instance }),
  };
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

export function getLogger(serviceName: string) {
  return {
    info: (msg: string, meta?: object) =>
      console.log(JSON.stringify({ level: "info", service: serviceName, message: msg, ...meta })),
    error: (msg: string, err?: unknown, meta?: object) =>
      console.error(
        JSON.stringify({
          level: "error",
          service: serviceName,
          message: msg,
          error: err instanceof Error ? err.message : err,
          ...meta,
        })
      ),
    warn: (msg: string, meta?: object) =>
      console.warn(JSON.stringify({ level: "warn", service: serviceName, message: msg, ...meta })),
  };
}

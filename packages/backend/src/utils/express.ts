import type { RequestHandler } from "express";

export const asyncHandler =
  <T extends RequestHandler>(fn: T) =>
  (...args: Parameters<T>): any =>
    Promise.resolve(fn.apply(null, args)).catch(args[2]);

export const cache = (req, res, next) => {
  const cc = req.get("Cache-Control");
  cc && res.header("Cache-Control", cc);
  next();
};

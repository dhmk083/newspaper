import React from "react";

type Merge = {
  <T>(a: T, b: Partial<T>): T;
  <T, P = Partial<T>>(b: P): (a: T) => T;
};

export const merge: Merge = (a, b?) => {
  return b ? { ...a, ...b } : (b) => ({ ...b, ...a });
};

const join = <A extends string, B extends string, S extends string>(
  a: A,
  sep: S,
  b: B
) => (a + sep + b) as `${A}${S}${B}`;

export const namespace =
  <S extends string>(s: S) =>
  <SS extends string>(suffix: SS) =>
    join(s, "/", suffix);

type F<P, R> = (p: P) => R;

type Refine<S, T> = {
  <R = T>(fb?: F<T, R>): F<S, R>;
  refine<R = T>(fb?: F<T, R>): Refine<S, R>;
};

export function selector<S, T, R>(fa: F<S, T>, fb: F<T, R>): F<S, R>;
export function selector<S, T>(fa: F<S, T>): Refine<S, T>;
export function selector(fa, fb?) {
  if (fb) return (s) => fb(fa(s));
  else {
    const ff =
      (fb = (x) => x) =>
      (s) =>
        fb(fa(s));

    ff.refine = (fb = (x) => x) => selector((s) => fb(fa(s)));

    return ff;
  }
}

type Action<P> = { type: string; payload: P; [extraProps: string]: any };

export const cs =
  <S, P = any, A extends Action<P> = any>(
    fn: (payload: P, action: A) => (s: S) => S
  ) =>
  (s: S, a: A): S =>
    fn((a as any).payload, a)(s);

export function usePromise<T, E = any>(p?: Promise<T>) {
  const [state, setState] = React.useState({
    isPending: false,
    value: undefined as T | undefined,
    error: undefined as E | undefined,
  });
  const isDisposed = React.useRef(false);
  const setPromise = React.useCallback((p) => {
    setState({
      isPending: true,
      value: undefined,
      error: undefined,
    });
    p.then(
      (value) =>
        !isDisposed.current &&
        setState({ isPending: false, value, error: undefined }),
      (error) =>
        !isDisposed.current &&
        setState({ isPending: false, value: undefined, error })
    );
    return p;
  }, []);
  React.useEffect(() => {
    p && setPromise(p);
    return () => {
      isDisposed.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [state, setPromise] as const;
}

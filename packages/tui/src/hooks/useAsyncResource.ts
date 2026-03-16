import { useEffect, useState } from "react";

interface AsyncState<T> {
  readonly loading: boolean;
  readonly error?: string;
  readonly data?: T;
}

export function useAsyncResource<T>(loader: () => Promise<T>, refreshToken: number): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    loading: true,
  });

  useEffect(() => {
    let isActive = true;
    void refreshToken;

    setState({ loading: true });

    loader()
      .then((data) => {
        if (isActive) {
          setState({
            loading: false,
            data,
          });
        }
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Unknown load error";
        if (isActive) {
          setState({
            loading: false,
            error: message,
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [loader, refreshToken]);

  return state;
}

import Router, { useRouter } from "next/router";
import { LoginReqBody } from "pages/api/login";
import { AuthUserResponse } from "pages/api/user";
import { useCallback, useEffect } from "react";
import useSWR from "swr";

export type AnnotatedError = Error & {
  response: Response;
  data: any;
};

async function fetchJSON(...args: any[]): Promise<any> {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const response = await fetch(...args);

    // if the server replies, there's always some data in json
    // if there's a network error, it will throw at the previous line
    const data = await response.json();

    if (response.ok) {
      return data;
    }

    const error = new Error(response.statusText) as AnnotatedError;
    error.response = response;
    error.data = data;
    throw error;
  } catch (error) {
    if (!error.data) {
      error.data = { message: error.message };
    }
    throw error;
  }
}

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
} = {}): {
  user?: AuthUserResponse;
  login: (
    loginData: LoginReqBody
  ) => Promise<AnnotatedError | AuthUserResponse | undefined>;
  logout: (redirectOnLogout?: string) => Promise<void>;
} {
  const router = useRouter();
  const { data: user, mutate: mutateUser } = useSWR<AuthUserResponse>(
    "/api/user"
  );

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return;

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user?.isLoggedIn)
    ) {
      Router.push(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo]);

  const login = useCallback(
    async (loginData: LoginReqBody) => {
      try {
        return await mutateUser(
          fetchJSON("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
          })
        );
      } catch (error) {
        console.error("useUser::failed to log in user", error);
        return error as AnnotatedError;
      }
    },
    [mutateUser]
  );

  const logout = useCallback(
    async (redirectOnLogout?: string) => {
      await mutateUser(fetchJSON("/api/logout"));
      if (redirectOnLogout) {
        router.push(redirectOnLogout);
      }
    },
    [mutateUser, router]
  );

  return { user, login, logout };
}
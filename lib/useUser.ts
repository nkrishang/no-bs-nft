import { useToast } from "@chakra-ui/react";
import { magicClient } from "lib/magic";
import { useRouter } from "next/router";
import { AuthUserResponse } from "pages/api/user";
import { useEffect } from "react";
import useSWR from "swr";
import { useState } from 'react'
type UserHandler = {
  user?: AuthUserResponse;
  // setUser: (properties: Record<string, any>) => void; 
  // login: (email: string) => void;
  login: any;
  // logout: () => void;
  logout: any;
};

export default function useUser(): UserHandler {
  const toast = useToast();
  const router = useRouter();
  // const { data: user, mutate } = useSWR<AuthUserResponse>("/api/user");
  const { data, mutate } = useSWR<any>("/api/user");

  const [user, setUser] = useState<any>('');

  useEffect(() => {
    if(data && Object.keys(data).includes(user)) {
      setUser(data.user);
    }
  }, [])

  async function login(email: string) {
    const token = await magicClient?.auth.loginWithMagicLink({
      email,
    });

    const res: any = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        token,
        provider: "magiclink",
      }),
    });

    console.log("Login response: ", await res)
    const loginData = await res.json();

    if (res.status === 200) {
      toast({ title: "Magic.link wallet retrieved", status: "success" });
      setUser({...loginData})
      return true
    } else {
      toast({ title: "Magic.link wallet could not be generated. Please use Metamask.", status: "error" });
      return false
    }
    // router.push("/marketplace");
  }

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await mutate((user: any) => {
      if (user) {
        return {
          ...user,
          isLoggedIn: false,
        };
      } else {
        return user;
      }
    });
    // console.log("result on mutate", result);
    setUser(result);
    // router.push("/login");
  }

  // function setUser(properties: Record<string, any>): void {
  //   mutate((user) => {
  //     if (user) {
  //       let updated = { ...user };

  //       Object.keys(updated).forEach((key) => {
  //         if (Object.keys(properties).includes(key)) {
  //           updated = {
  //             ...updated,
  //             [key]: properties[key],
  //           };
  //         }
  //       });

  //       return updated;
  //     } else {
  //       return user;
  //     }
  //   });
  // }

  useEffect(() => {
    let isCancelled = false;
    if (user && user.isLoggedIn) {
      magicClient?.user.isLoggedIn().then((isMagicLoggedIn) => {
        if (isCancelled) {
          return;
        }

        if (!isMagicLoggedIn) {
          // console.log("Forced logged out by unsynced auth state");
          logout();
        } else if (!Object.keys(user).includes("username")) {
          // router.push("/onboarding");
        }
      });
    }
    return () => {
      isCancelled = false;
    };
  }, [user]);

  // return { user, setUser, login, logout };
  return { user, login, logout };
}
import withSession, { SESSION_KEY } from "lib/session";
import { NextApiResponse } from "next";
import { genKeyPairFromSeed, SkynetClient } from "skynet-js";
import { AuthUser } from "./login";

type AuthUserLoggedInResponse = AuthUser & {
  isLoggedIn: true;
};
type AuthUserLoggedOutResponse = AuthUser & {
  isLoggedIn: false;
};

export type AuthUserResponse =
  | AuthUserLoggedInResponse
  | AuthUserLoggedOutResponse;

export default withSession(
  async (req, res: NextApiResponse<AuthUserResponse>) => {
    // Setup skynet client
    const client = new SkynetClient("https://siasky.net");
    const { publicKey } = genKeyPairFromSeed(
      process.env.NEXT_PUBLIC_ALCHEMY_ROPSTEN_KEY || ""
    );

    // Get skyDB data
    const data = (await client.db.getJSON(publicKey, "user-info")).data || {};

    // Get user session key
    const user: Record<string, unknown> = req.session.get(SESSION_KEY);

    if (user) {
      if (Object.keys(data).includes(user.publicAddress as string)) {
        // If the user is already onboarded in skyDB, joined skyDB user data to magic.link object
        res.json({
          ...user,
          ...((data[user.publicAddress as string] || {}) as Record<
            string,
            unknown
          >),
          isLoggedIn: true,
        } as AuthUserLoggedInResponse);
      } else {
        // Otherwise only retun magic.link object
        res.json({
          ...user,
          isLoggedIn: true,
        } as AuthUserLoggedInResponse);
      }
    } else {
      // No user is logged in
      res.json({
        isLoggedIn: false,
      } as AuthUserLoggedOutResponse);
    }
  }
);
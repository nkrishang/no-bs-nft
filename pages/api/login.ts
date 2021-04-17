  
import withSession, {
  NextApiRequestWithSession,
  SESSION_KEY,
} from "lib/session";
import { magicServer } from "lib/magic";

export type LoginReqBody = {
  token: string;
  provider: string;
};

export type AuthUser = {
  token: string;
  provider: string;
  issuer: string | null;
  email: string | null;
  publicAddress: string | null;
  name?: string;
  username?: string;
  bio?: string;
  photo_url?: string;
};

async function getAuthorizedUser(
  token: string,
  provider: string
): Promise<AuthUser> {
  if (provider === "magiclink") {
    const metadata = await magicServer.users.getMetadataByToken(token);
    return Promise.resolve({ token, provider, ...metadata });
  }

  return Promise.reject("unknown provider");
}

export default withSession(
  async (req: NextApiRequestWithSession<LoginReqBody>, res) => {
    // Grab the data of the login request
    const { token, provider } = req.body;

    try {
      // Login user with magic.link
      const magicUser = await getAuthorizedUser(token, provider);

      const user = { isLoggedIn: true, ...magicUser };

      // Set session key (used in user.ts)
      req.session.set(SESSION_KEY, user);
      await req.session.save();

      res.json(user);
    } catch (error) {
      const { response } = error;
      res.status(response?.status || 500).json(error.data);
    }
  }
);
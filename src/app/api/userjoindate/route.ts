// src/app/api/userjoindate/route.ts
import { fetchGithubUserJoinDate } from '../../services/githubService';
import { errorHandler } from '../../utils/errorHandler';

// Handler for POST requests
export async function POST(req: Request, res: Response) {
    try {
        const { username } = await req.json();
        if (!username) {
            return new Response(JSON.stringify({ message: "Username is required" }), {
                status: 400,
              });
        }

        const userData = await fetchGithubUserJoinDate(username);
        if (userData) {
            return new Response(JSON.stringify(userData), { status: 200 });
        } else {
          return new Response(JSON.stringify({ message: "Failed to fetch user data" }), { status: 500 });
        }
    } catch (error) {
        errorHandler(res, error);
    }
}

// Example placeholder for GET requests if needed
// export async function get(req: NextApiRequest, res: NextApiResponse) {
//     // Handle GET requests
// }

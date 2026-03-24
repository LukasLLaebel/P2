import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';

const filePath = path.resolve('src/lib/auth.json');

export const POST: RequestHandler = async ({ request }) => {
  try {
    const newUser = await request.json();

    const file = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(file);

    if (!json.users) json.users = [];
    if (!json.shares) json.shares = [];
    if (!json.roles) json.roles = [];

    // Generate USER ID
    const newUserId =
      json.users.length > 0
        ? Math.max(...json.users.map((user: any) => user.id)) + 1
        : 1;

    // Helper: generate SHARE ID
    const getNextShareId = () =>
      json.shares.length > 0
        ? Math.max(...json.shares.map((share: any) => share.id)) + 1
        : 1;

    const processedShares = (newUser.shares || []).map((incomingShare: any) => {
      if (!incomingShare.name) {
        throw new Error("Share must include a name");
      }

      // 🔍 Find by NAME (primary key now)
      let share = json.shares.find(
        (share: any) => share.name.toLowerCase() === incomingShare.name.toLowerCase()
      );

      // ➕ Create if not exists
      if (!share) {
        const newShareId = getNextShareId();

        share = {
          id: newShareId,
          name: incomingShare.name,
          path: incomingShare.path || ""
        };

        json.shares.push(share);
      }

      // 🎭 Validate roles (MULTIPLE)
      const validRoles = (incomingShare.roles || []).filter((role: string) =>
        json.roles.some((r: any) => r.name === role)
      );

      return {
        id: share.id,
        name: share.name,
        roles: [...new Set(validRoles)]
      };
    });

    // Remove duplicate shares per user
    const uniqueShares = Array.from(
      new Map(processedShares.map((s: any) => [s.name, s])).values()
    );

    const userToInsert = {
      id: newUserId,
      username: newUser.username,
      shares: uniqueShares
    };

    json.users.push(userToInsert);

    await fs.writeFile(filePath, JSON.stringify(json, null, 2));

    return new Response(JSON.stringify(userToInsert), { status: 200 });

  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

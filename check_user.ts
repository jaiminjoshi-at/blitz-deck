
import { db } from "./src/lib/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking for learner@test.com...");
    const user = await db.query.users.findFirst({
        where: eq(users.email, "learner@test.com")
    });

    if (user) {
        console.log("User found:", user);
    } else {
        console.log("User NOT found.");
    }
    process.exit(0);
}

main().catch(console.error);

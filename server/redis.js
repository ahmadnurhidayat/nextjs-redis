import { Client, Entity, Schema } from "redis-om";

class GitRepo extends Entity {}

let schema = new Schema(GitRepo, {
  login: { type: "string" },
  url: { type: "string" },
  avatar_url: { type: "string" },
  type: { type: "string" },
  public_repos: { type: "number" },
  followers: { type: "number" },
  following: { type: "number" },
  time: { type: "number" },
});

const client = new Client();

export default async function getRepository() {
  if (!client.isOpen()) {
    try {
      await client.open(process.env.REDIS_OM_URL ?? "redis://localhost:6379");
      console.log("Successfully connected to Redis");
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      throw error;
    }
  }

  const repository = client.fetchRepository(schema);

  // Check if the index exists, create it only if necessary
  try {
    console.log("Attempting to create or verify index...");
    try {
      await repository.createIndex();
      console.log("Index created successfully.");
    } catch (indexError) {
      if (indexError.message.includes("Index already exists")) {
        console.log("Index already exists, skipping creation.");
      } else {
        console.error("Error creating index:", indexError.message);
        throw indexError;
      }
    }
  } catch (error) {
    console.error("Failed to create index:", error.message, error.stack);
    throw error;
  }

  return repository;
}

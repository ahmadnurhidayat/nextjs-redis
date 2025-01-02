import { Client, Entity, Schema } from 'redis-om';

class GitRepo extends Entity {}

const schema = new Schema(GitRepo, {
  login: { type: 'string' },
  url: { type: 'string' },
  avatar_url: { type: 'string' },
  type: { type: 'string' },
  public_repos: { type: 'number' },
  followers: { type: 'number' },
  following: { type: 'number' },
  time: { type: 'number' },
});

const client = new Client();

const getRepository = async () => {
  if (!client.isOpen()) {
    try {
      await client.open(process.env.REDIS_OM_URL || 'redis://localhost:6379');
      console.log('Successfully connected to Redis');
    } catch (error) {
      console.error('Error connecting to Redis:', error);
      throw error;
    }
  }

  const repository = client.fetchRepository(schema);

  try {
    console.log('Attempting to create or verify index...');
    await repository.createIndex();
    console.log('Index created successfully.');
  } catch (error) {
    if (error.message.includes('Index already exists')) {
      console.log('Index already exists, skipping creation.');
    } else {
      console.error('Error creating index:', error.message);
      throw error;
    }
  }

  return repository;
};

export default getRepository;
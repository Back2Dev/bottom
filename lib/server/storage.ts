import { promises as fs } from "fs";
import path from "path";
import { MongoClient, Collection } from "mongodb";

type PageData = {
  content: any;
  root: any;
  zones?: Record<string, any>;
};

const getDatabaseUri = () => {
  const uri = process.env.DATABASE_URI;

  if (!uri) {
    throw new Error(
      "DATABASE_URI is not set. Provide a file:// or mongodb:// URI in .env.local."
    );
  }

  return uri;
};

const isFileUri = (uri: string) => uri.startsWith("file://");

const randomId = (length = 17) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const ensureFileStorePath = async (uri: string) => {
  const filePath = uri.replace(/^file:\/\//, "");
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });

  try {
    await fs.access(absolutePath);
  } catch {
    await fs.writeFile(absolutePath, JSON.stringify({}), "utf8");
  }

  return absolutePath;
};

const readFileStore = async (uri: string) => {
  const filePath = await ensureFileStorePath(uri);
  const raw = await fs.readFile(filePath, "utf8");

  try {
    return JSON.parse(raw) as Record<string, PageData>;
  } catch {
    return {};
  }
};

const writeFileStore = async (uri: string, data: Record<string, PageData>) => {
  const filePath = await ensureFileStorePath(uri);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

let mongoClient: MongoClient | null = null;
let mongoCollection: Collection<
  { path: string } & PageData & { _id?: string }
> | null = null;

const getMongoCollection = async (uri: string) => {
  if (mongoCollection) return mongoCollection;

  mongoClient = new MongoClient(uri);
  await mongoClient.connect();

  let dbName = "puck-db";

  try {
    const url = new URL(uri);
    dbName = url.pathname.replace("/", "") || dbName;
  } catch {
    // Keep default
  }

  mongoCollection = mongoClient.db(dbName).collection("pages");
  await mongoCollection.createIndex({ path: 1 }, { unique: true });

  return mongoCollection;
};

export const getPageData = async (pagePath: string): Promise<PageData | null> => {
  const uri = getDatabaseUri();

  if (isFileUri(uri)) {
    const store = await readFileStore(uri);
    const record = store[pagePath];
    if (!record) return null;

    if ("data" in record && record.data) {
      // backward compatibility
      const legacy = record.data as any;
      return {
        content: legacy.content,
        root: legacy.root,
        zones: legacy.zones,
      };
    }

    return {
      content: record.content,
      root: record.root,
      zones: record.zones,
    };
  }

  const collection = await getMongoCollection(uri);
  const doc = await collection.findOne({ path: pagePath });

  if (!doc) return null;

  if ("data" in (doc as any)) {
    const legacy = (doc as any).data as any;
    return {
      content: legacy?.content,
      root: legacy?.root,
      zones: legacy?.zones,
    };
  }

  return {
    content: doc.content,
    root: doc.root,
    zones: doc.zones,
  };
};

export const savePageData = async (
  pagePath: string,
  data: PageData
): Promise<void> => {
  const uri = getDatabaseUri();

  const prepared: PageData = {
    content: data.content,
    root: data.root,
    zones: data.zones,
  };

  if (isFileUri(uri)) {
    const store = await readFileStore(uri);
    store[pagePath] = prepared;
    await writeFileStore(uri, store);
    return;
  }

  const collection = await getMongoCollection(uri);
  await collection.updateOne(
    { path: pagePath },
    {
      $set: {
        path: pagePath,
        content: prepared.content,
        root: prepared.root,
        zones: prepared.zones,
      },
      $setOnInsert: { _id: randomId(), path: pagePath },
    },
    { upsert: true }
  );
};

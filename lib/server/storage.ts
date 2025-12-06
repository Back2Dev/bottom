import { promises as fs } from "fs";
import path from "path";
import { MongoClient, Collection } from "mongodb";

type PageData = {
  content: any;
  root: any;
  zones?: Record<string, any>;
};

const normalizePath = (p: string) => {
  const withSlash = p.startsWith("/") ? p : `/${p}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash || "/";
};

const getDatabaseUri = () => {
  const uri =
    process.env.DATABASE_URI && process.env.DATABASE_URI.trim().length > 0
      ? process.env.DATABASE_URI
      : "file://./puck-db.json";

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
  const normalizedPath = normalizePath(pagePath);

  if (isFileUri(uri)) {
    const store = await readFileStore(uri);

    let existingKey = normalizedPath;

    if (!store[normalizedPath]) {
      const match = Object.keys(store).find(
        (k) => normalizePath(k) === normalizedPath
      );
      if (match) {
        existingKey = match;
      }
    }

    const record = store[existingKey];
    if (!record) return null;

    let migrated = false;
    let value: PageData = record as any;

    if ("data" in record && (record as any).data) {
      const legacy = (record as any).data as any;
      value = {
        content: legacy?.content,
        root: legacy?.root,
        zones: legacy?.zones,
      };
      migrated = true;
    }

    if (existingKey !== normalizedPath) {
      delete store[existingKey];
      store[normalizedPath] = value;
      migrated = true;
    }

    if (migrated) {
      await writeFileStore(uri, store);
    }

    return value;
  }

  const collection = await getMongoCollection(uri);
  const doc =
    (await collection.findOne({ path: normalizedPath })) ||
    (await collection.findOne({ path: normalizePath(normalizedPath) })) ||
    (await collection.findOne({ path: normalizedPath.slice(1) }));

  if (!doc) return null;

  let migrated = false;
  let value: PageData = {
    content: (doc as any).content,
    root: (doc as any).root,
    zones: (doc as any).zones,
  };

  if ("data" in (doc as any)) {
    const legacy = (doc as any).data as any;
    value = {
      content: legacy?.content,
      root: legacy?.root,
      zones: legacy?.zones,
    };
    migrated = true;
  }

  if (doc.path !== normalizedPath || migrated) {
    await collection.updateOne(
      { _id: (doc as any)._id },
      {
        $set: {
          path: normalizedPath,
          content: value.content,
          root: value.root,
          zones: value.zones,
        },
        $unset: { data: "" },
      }
    );
  }

  return value;
};

export const savePageData = async (
  pagePath: string,
  data: PageData
): Promise<void> => {
  const uri = getDatabaseUri();
  const normalizedPath = normalizePath(pagePath);

  const prepared: PageData = {
    content: data.content,
    root: data.root,
    zones: data.zones,
  };

  if (isFileUri(uri)) {
    const store = await readFileStore(uri);
    store[normalizedPath] = prepared;
    await writeFileStore(uri, store);
    return;
  }

  const collection = await getMongoCollection(uri);
  await collection.updateOne(
    { path: normalizedPath },
    {
      $set: {
        path: normalizedPath,
        content: prepared.content,
        root: prepared.root,
        zones: prepared.zones,
      },
      $setOnInsert: { _id: randomId() },
    },
    { upsert: true }
  );
};

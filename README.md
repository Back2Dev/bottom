# Puck Demo - Standalone

This demo is for the Puck editor. See https://github.com/puckeditor/puck

It is a fully featured block editor.

This demo is extracted from the Puck repo in /apps/demo. That code is woven into the whole repository, so it's not a good starting point for a project. I asked ChatGPT to extract it as a standalone app, and it did a good job of that.

## Why is it called Bottom?

Nick Bottom is a character in Shakespeare's A Midsummer Night's Dream who provides comic relief throughout the play. A weaver by trade, he is famously known for getting his head transformed into that of a donkey by the elusive Puck.

<img width="284" height="200" alt="image" src="https://github.com/user-attachments/assets/46b8f9f5-9cbd-4c5d-a4b0-1f06f716ce74" />

## Demonstrates

- Next.js 15 App Router implementation
- Server side database in mongodb or JSON file
- Catch-all routes to use puck for any route on the platform

## Getting started

Install dependencies

```
npm i
```

Set up database, create a `.env.local` file containing

```
DATABASE_URI=mongodb://localhost:27017/puck-db
```

OR

```
DATABASE_URI=file://./puck-db.json
```

Start the server

```
npm run dev
```

Navigate to the homepage at https://localhost:3000. To edit the homepage, access the Puck editor at https://localhost:3000/edit.

You can do this for any route on the application, **even if the page doesn't exist**. For example, visit https://localhost:3000/hello/world and you'll receive a 404. You can author and publish a page by visiting https://localhost:3000/hello/world/edit. After publishing, go back to the original URL to see your page.

## Using this demo

To adopt this demo you will need to:

- **IMPORTANT** Add authentication to `/edit` routes. This can be done by modifying the example API routes in `/app/api/puck/route.ts` and server component in `/app/[...puckPath]/page.tsx`. **If you don't do this, Puck will be completely public.**
- Integrate your database into the API calls in `/app/api/puck/route.ts`
- Implement a custom puck configuration in `puck.config.tsx`

## License

MIT

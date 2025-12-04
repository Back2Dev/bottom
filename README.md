# Puck Demo - fully featured

This demo is for the Puck editor. See https://github.com/puckeditor/puck

It is a fully featured block editor.

This demo is based on the `next` recipe, but it includes a number of components to make it look like a real app rather than an empty shell.

## Demonstrates

- Next.js 13 App Router implementation
- JSON database implementation with HTTP API
- Catch-all routes to use puck for any route on the platform

## Usage

Run the generator and enter `next` when prompted

```
npx create-puck-app my-app
```

Start the server

```
yarn dev
```

Navigate to the homepage at https://localhost:3000. To edit the homepage, access the Puck editor at https://localhost:3000/edit.

You can do this for any route on the application, **even if the page doesn't exist**. For example, visit https://localhost:3000/hello/world and you'll receive a 404. You can author and publish a page by visiting https://localhost:3000/hello/world/edit. After publishing, go back to the original URL to see your page.

## Using this recipe

To adopt this recipe you will need to:

- **IMPORTANT** Add authentication to `/edit` routes. This can be done by modifying the example API routes in `/app/api/puck/route.ts` and server component in `/app/[...puckPath]/page.tsx`. **If you don't do this, Puck will be completely public.**
- Integrate your database into the API calls in `/app/api/puck/route.ts`
- Implement a custom puck configuration in `puck.config.tsx`

## License

MIT © [The Puck Contributors](https://github.com/measuredco/puck/graphs/contributors).

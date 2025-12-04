import { Metadata } from "next";
import config from "../../config/server";
import { initialData } from "../../config/initial-data";
import { Components, RootProps } from "../../config/types";

import { Render, resolveAllData } from "@measured/puck/rsc";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: initialData["/"].root.title,
  };
}

export default async function Page() {
  const data = initialData["/"];
  const metadata = {
    example: "Hello, world",
  };

  const resolvedData = await resolveAllData<Components, RootProps>(
    data,
    config,
    metadata
  );

  return <Render config={config} data={resolvedData} metadata={metadata} />;
}

"use client";

import { AutoField, Button, FieldLabel, Puck, Render } from "@measured/puck";
import headingAnalyzer from "@measured/puck-plugin-heading-analyzer";
import config from "../../config";
import { useDemoData } from "../../lib/use-demo-data";
import { useEffect, useState } from "react";
import { Type } from "lucide-react";
import { savePageData } from "@/lib/puck-data-client";

export function Client({ path, isEdit }: { path: string; isEdit: boolean }) {
  const metadata = {
    example: "Hello, world",
  };

  const { data, resolvedData } = useDemoData({
    path,
    isEdit,
    metadata,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const params = new URL(window.location.href).searchParams;

  if (isEdit) {
    return (
      <div>
        <Puck
          config={config}
          data={data}
          onPublish={async (data) => {
            await savePageData(path, data);
          }}
          plugins={[headingAnalyzer]}
          headerPath={path}
          iframe={{
            enabled: params.get("disableIframe") === "true" ? false : true,
          }}
          fieldTransforms={{
            userField: ({ value }) => value, // Included to check types
          }}
          overrides={{
            fieldTypes: {
              // Example of user field provided via overrides
              userField: ({ readOnly, field, name, value, onChange }) => (
                <FieldLabel
                  label={field.label || name}
                  readOnly={readOnly}
                  icon={<Type size={16} />}
                >
                  <AutoField
                    field={{ type: "text" }}
                    onChange={onChange}
                    value={value}
                  />
                </FieldLabel>
              ),
            },
            headerActions: ({ children }) => (
              <>
                <div>
                  <Button href={path} newTab variant="secondary">
                    View page
                  </Button>
                </div>

                {children}
              </>
            ),
          }}
          metadata={metadata}
        />
      </div>
    );
  }

  if (data.content) {
    return <Render config={config} data={resolvedData} metadata={metadata} />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <h1>404</h1>
        <p>Page was not found in persistent storage</p>
      </div>
    </div>
  );
}

export default Client;

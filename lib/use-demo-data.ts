import { useEffect, useState } from "react";
import config, { componentKey } from "../config";
import { initialData } from "../config/initial-data";
import { Metadata, resolveAllData } from "@measured/puck";
import { Components, UserData } from "../config/types";
import { RootProps } from "../config/root";
import { loadPageData } from "./puck-data-client";

const isBrowser = typeof window !== "undefined";

export const useDemoData = ({
  path,
  isEdit,
  metadata = {},
}: {
  path: string;
  isEdit: boolean;
  metadata?: Metadata;
}) => {
  const key = `puck-demo:${componentKey}:${path}`;

  const [data, setData] = useState<Partial<UserData> | undefined>(
    initialData[path] || {}
  );
  const [resolvedData, setResolvedData] = useState<Partial<UserData> | undefined>(
    initialData[path] || {}
  );

  useEffect(() => {
    if (!isBrowser) return;

    let cancelled = false;

    loadPageData(path)
      .then((remote) => {
        if (cancelled) return;
        const nextData = remote || initialData[path] || {};
        setData(nextData);
        setResolvedData(nextData);
      })
      .catch(() => {
        if (cancelled) return;
        setData(initialData[path] || {});
        setResolvedData(initialData[path] || {});
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  useEffect(() => {
    if (data && !isEdit) {
      let cancelled = false;

      resolveAllData<Components, RootProps>(data, config, metadata).then(
        (resolved) => {
          if (!cancelled) {
            setResolvedData(resolved);
          }
        }
      );

      return () => {
        cancelled = true;
      };
    }
  }, [data, isEdit, metadata]);

  useEffect(() => {
    if (!isEdit && data) {
      const title = data?.root?.props?.title || data?.root?.title;
      document.title = title || "";
    }
  }, [data, isEdit]);

  return { data, resolvedData, key };
};

import { useEffect, useState } from "react";
import config, { componentKey } from "../config";
import { initialData } from "../config/initial-data";
import { Metadata, resolveAllData } from "@measured/puck";
import { Components, UserData } from "../config/types";
import { RootProps } from "../config/root";
import { loadPageData } from "./puck-data-client";

const isBrowser = typeof window !== "undefined";

const emptyData: UserData = {
  content: [],
  root: { props: {} },
  zones: {},
};

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

  const initial = initialData[path] || emptyData;

  const [data, setData] = useState<UserData>(initial);
  const [resolvedData, setResolvedData] = useState<UserData>(initial);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isBrowser) return;

    let cancelled = false;
    setIsLoading(true);

    loadPageData(path)
      .then((remote) => {
        if (cancelled) return;
        const nextData = (remote as UserData | null) || initial;
        setData(nextData);
        setResolvedData(nextData);
      })
      .catch(() => {
        if (cancelled) return;
        setData(initial);
        setResolvedData(initial);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [path, initial]);

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

  return { data, resolvedData, key, isLoading };
};

import classnames from "classnames";

type OptionsObj = Record<string, any>;
type Options = string | OptionsObj;

export const getGlobalClassName = (rootClass: string, options: Options) => {
  if (typeof options === "string") {
    return `${rootClass}-${options}`;
  } else {
    const mappedOptions: Options = {};
    for (let option in options) {
      mappedOptions[`${rootClass}--${option}`] = options[option];
    }

    return classnames({
      [rootClass]: true,
      ...mappedOptions,
    });
  }
};

export const getClassNameFactory =
  (
    rootClass: string,
    styles: Record<string, string>,
    config: { baseClass?: string } = { baseClass: "" }
  ) =>
  (options: Options = {}) => {
    if (typeof options === "string") {
      const descendant = options;

      const style = styles[`${rootClass}-${descendant}`];

      if (style) {
        return config.baseClass + styles[`${rootClass}-${descendant}`] || "";
      }

      return "";
    } else if (typeof options === "object") {
      const modifiers = options;

      const prefixedModifiers: OptionsObj = {};

      for (let modifier in modifiers) {
        prefixedModifiers[styles[`${rootClass}--${modifier}`]] =
          modifiers[modifier];
      }

      const c = styles[rootClass];

      return (
        config.baseClass +
        classnames({
          [c]: !!c,
          ...prefixedModifiers,
        })
      );
    } else {
      return config.baseClass + styles[rootClass] || "";
    }
  };

export const generateId = (type?: string | number) => {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return type ? `${type}-${id}` : id;
};

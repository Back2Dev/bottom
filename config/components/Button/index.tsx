"use client";

import { ReactNode } from "react";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@/lib/puck-helpers";

const getClassName = getClassNameFactory("Button", styles);

export type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: (e: any) => void | Promise<void>;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  tabIndex?: number;
  newTab?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  size?: "medium" | "large";
};

export const Button = ({
  children,
  href,
  onClick,
  variant = "primary",
  type,
  disabled,
  tabIndex,
  newTab,
  fullWidth,
  icon,
  size = "medium",
  ...props
}: ButtonProps) => {
  const ElementType = href ? "a" : type ? "button" : "span";

  return (
    <ElementType
      className={getClassName({
        primary: variant === "primary",
        secondary: variant === "secondary",
        disabled,
        fullWidth,
        [size]: true,
      })}
      onClick={onClick as any}
      type={type}
      disabled={disabled}
      tabIndex={tabIndex}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
      href={href}
      {...props}
    >
      {icon && <div className={getClassName("icon")}>{icon}</div>}
      {children}
    </ElementType>
  );
};

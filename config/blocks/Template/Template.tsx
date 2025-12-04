import React from "react";
import { PuckComponent, Slot } from "@measured/puck";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@/lib/puck-helpers";
import { Section } from "../../components/Section";

const getClassName = getClassNameFactory("Template", styles);

export type TemplateProps = {
  template: string;
  children: Slot;
};

export const Template: PuckComponent<TemplateProps> = ({
  children: Children,
}) => {
  return (
    <Section>
      <Children className={getClassName()} />
    </Section>
  );
};

export default Template;

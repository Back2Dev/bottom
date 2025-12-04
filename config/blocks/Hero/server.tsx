/* eslint-disable @next/next/no-img-element */
import { ComponentConfig } from "@measured/puck";
import HeroComponent, { HeroProps } from "./Hero";

export const Hero: ComponentConfig<HeroProps> = {
  render: HeroComponent,
};

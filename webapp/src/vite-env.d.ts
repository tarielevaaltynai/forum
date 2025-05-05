/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
declare module "react/jsx-runtime" {
  export default any;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.scss' {
  const content: { [className: string]: string };
  export default content;
}




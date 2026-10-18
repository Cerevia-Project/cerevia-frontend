/** The layout extensions ship without types; they register themselves on use. */
declare module "cytoscape-fcose" {
  import type { Ext } from "cytoscape";
  const extension: Ext;
  export default extension;
}

declare module "cytoscape-dagre" {
  import type { Ext } from "cytoscape";
  const extension: Ext;
  export default extension;
}

import { Node as ProsemirrorNode } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import * as React from "react";
import { DefaultTheme } from "styled-components";

export enum ToastType {
  Error = "error",
  Info = "info",
}

export type MenuItem = {
  icon?: typeof React.Component | React.FC<any>;
  name?: string;
  title?: string;
  shortcut?: string;
  keywords?: string;
  tooltip?: string;
  defaultHidden?: boolean;
  attrs?: Record<string, any>;
  visible?: boolean;
  active?: (state: EditorState) => boolean;
};

export type EmbedDescriptor = MenuItem & {
  icon: React.FC<any>;
  matcher: (url: string) => boolean | [] | RegExpMatchArray;
  component: typeof React.Component | React.FC<any>;
};

export type ComponentProps = {
  theme: DefaultTheme;
  node: ProsemirrorNode;
  isSelected: boolean;
  isEditable: boolean;
  getPos: () => number;
};

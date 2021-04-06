export interface ClassNamedFunction {
  // Used when creating a classNamed component from a native HTML element
  <T extends keyof JSX.IntrinsicElements, P extends PropsLike>(tag: T): Tagged<
    JSX.LibraryManagedAttributes<T, JSX.IntrinsicElements[T]> & P
  >;

  // Used to extend other classNamed components.
  // Inherits props from the extended component
  <PP extends PropsLike, P extends PropsLike>(tag: ClassNamedVNode<PP>): Tagged<
    PP & P
  >;

  // Used to create a classNamed component
  // from a JSX element (both functional and class-based)
  <T extends JSX.Element | JSX.ElementClass, P extends PropsLike>(
    tag: T
  ): Tagged<P>;
}

export type Tagged<P extends PropsLike> = <PP extends PropsLike>(
  tag: TemplateStringsArray | string,
  ...tagItems: Array<(props: P & PP) => string | number | false | undefined>
) => ClassNamedVNode<P & PP>;

export type ClassNamedVNode<T> = (props: T, ...args: any[]) => any;

export type PropsLike = Record<string, unknown>;

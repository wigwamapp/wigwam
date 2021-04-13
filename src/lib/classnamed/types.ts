export interface ClassNamedFactory {
  // Used when creating a classNamed component from a native HTML element
  <T extends keyof JSX.IntrinsicElements, P extends PropsLike>(
    Component: T
  ): Tagged<JSX.LibraryManagedAttributes<T, JSX.IntrinsicElements[T]> & P>;

  // Used to extend other classNamed components.
  // Inherits props from the extended component
  <PP extends PropsLike, P extends PropsLike>(
    Component: ClassNamedComponent<PP>
  ): Tagged<PP & P>;
}

export type Tagged<P extends PropsLike> = <PP extends PropsLike>(
  tag: TemplateStringsArray | string,
  ...tagItems: Array<
    | string
    | number
    | false
    | undefined
    | ((props: P & PP) => string | number | false | undefined)
  >
) => React.ForwardRefExoticComponent<P & PP>;

export type ClassNamedComponent<P> = (props: P, ...args: any[]) => any;

export type PropsLike = Record<string, unknown>;

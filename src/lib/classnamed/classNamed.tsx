import React, { forwardRef } from "react";
import classNames from "clsx";
import { htmlElementAttributes } from "html-element-attributes";
import { ClassNamedFunction } from "./types";

export const classNamed: ClassNamedFunction = (
  Component: React.ElementType
): any => (tag: any, ...tagItems: any[]) =>
  forwardRef((props: any, ref) => {
    const propsToPass =
      typeof Component === "string"
        ? Object.entries(props).reduce(
            (sum, [key, val]) =>
              key === "children" || isHTMLAttribute(Component, key)
                ? { ...sum, [key]: val }
                : sum,
            {}
          )
        : props;

    return (
      <Component
        ref={ref}
        {...propsToPass}
        className={parseClassNames(
          cleanTemplate(tag, props.className),
          ...tagItems.map((t) => (typeof t === "function" ? t(props) : t))
        )}
      />
    );
  });

function parseClassNames(template: string[], ...templateElements: any[]) {
  return template
    .reduce((sum, n, index) => {
      const templateElement = templateElements[index];
      if (typeof templateElement === "string") {
        return `${sum} ${n} ${templateElement}`;
      }
      return `${sum} ${n}`;
    }, "")
    .trim()
    .replace(/\s{2,}/g, " "); // replace line return by space
}

function cleanTemplate(template: TemplateStringsArray, inheritedClasses = "") {
  const newClasses: string[] = template
    .toString()
    .trim()
    .replace(/\s{2,}/g, " ")
    .split(" ")
    .filter((c) => c !== ","); // remove comma introduced by template to string

  const inheritedClassesArray: any = inheritedClasses
    ? inheritedClasses.split(" ")
    : [];

  return classNames(
    ...inheritedClassesArray
      .concat(newClasses) // add new classes
      .filter((c: string) => c !== " ") // remove empty classes
      .filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i) // remove duplicate
  ).split(" ");
}

function isHTMLAttribute(tag: string, name: string) {
  return (
    htmlElementAttributes["*"].includes(name) ||
    Boolean((htmlElementAttributes as any)[tag]?.includes(name))
  );
}

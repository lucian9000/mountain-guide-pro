/**
 * Minimal Radix primitive stand-ins for tests.
 *
 * Why: the local node_modules has truncated ESM builds for several
 * @radix-ui packages (see the alias block in vite.config.ts — the app
 * works because Vite aliases them to the intact CJS builds, but
 * vitest.config.ts has no such aliases, so importing them in tests dies
 * with "SyntaxError: Unexpected end of input").
 *
 * These stubs mirror the one Radix behaviour the a11y tests rely on:
 * triggers forward arbitrary props (id, aria-*) to the rendered button,
 * and `asChild` renders the child element as-is with props merged.
 */
import * as React from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

type AnyProps = Record<string, any> & { children?: React.ReactNode };

const passThrough = ({ children }: AnyProps) => <>{children}</>;

const asChildable = (fallbackTag: "button") =>
  React.forwardRef<HTMLElement, AnyProps>(function AsChildable(
    { asChild, children, ...props },
    ref
  ) {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ...props,
        ref,
      });
    }
    const Tag = fallbackTag;
    return (
      <Tag type="button" ref={ref as React.Ref<HTMLButtonElement>} {...props}>
        {children}
      </Tag>
    );
  });

/** Stub for `@radix-ui/react-select` (shape used by components/ui/select.tsx). */
export const selectStub = {
  Root: passThrough,
  Group: passThrough,
  Value: ({ placeholder, children }: AnyProps) => (
    <span>{children ?? placeholder}</span>
  ),
  Trigger: React.forwardRef<HTMLButtonElement, AnyProps>(function Trigger(
    { children, ...props },
    ref
  ) {
    return (
      <button type="button" role="combobox" ref={ref} {...props}>
        {children}
      </button>
    );
  }),
  Icon: ({ children }: AnyProps) => <>{children}</>,
  Portal: passThrough,
  // A closed Radix select renders no content; the tests never open it.
  Content: () => null,
  Viewport: passThrough,
  Label: passThrough,
  Item: passThrough,
  ItemIndicator: passThrough,
  ItemText: passThrough,
  Separator: () => null,
  ScrollUpButton: () => null,
  ScrollDownButton: () => null,
};

/** Stub for `@radix-ui/react-popover` (shape used by components/ui/popover.tsx). */
export const popoverStub = {
  Root: passThrough,
  Anchor: passThrough,
  Trigger: asChildable("button"),
  Portal: passThrough,
  // Closed popover renders no content; the tests never open it.
  Content: () => null,
};

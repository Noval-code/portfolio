import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children }) => (
      <a href={href} className="mdx-link">
        {children}
      </a>
    ),
    ...components,
  };
}

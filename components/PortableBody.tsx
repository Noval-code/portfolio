import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { TypedObject } from "sanity";

import { urlForImage } from "../lib/sanity/image-url";

const components: PortableTextComponents = {
  types: {
    code: ({ value }) => {
      const lang = value?.language ? ` lang-${value.language}` : "";
      return (
        <pre className={`portable-code${lang}`}>
          <code>{value?.code ?? ""}</code>
        </pre>
      );
    },
    image: ({ value }) => {
      if (!value?.asset?._ref) return null;
      const src = urlForImage(value).width(1200).height(675).fit("crop").auto("format").url();
      const alt = typeof value.alt === "string" && value.alt ? value.alt : "";
      return (
        <span className="portable-image">
          <Image src={src} alt={alt} width={1200} height={675} sizes="(max-width: 760px) 92vw, 760px" />
        </span>
      );
    },
  },
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    normal: ({ children }) => <p>{children}</p>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
};

interface PortableBodyProps {
  body: TypedObject | TypedObject[];
}

export default function PortableBody({ body }: PortableBodyProps) {
  return <PortableText value={body} components={components} />;
}

"use client";

import { Fragment } from "react";
import { MdOutlineOpenInNew } from "react-icons/md";

export const MultiLineBody = ({ body }: { body: string }) => {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name and extension
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  const texts = body.split("\n").map((item, index) => {
    return (
      <p key={index}>
        {item.split(" ").map((fragment, fragmentIndex) => {
          if (urlPattern.test(fragment)) {
            return (
              <Fragment key={fragmentIndex}>
                <a
                  href={fragment}
                  target="_blank"
                  className="text-neutral-400 underline hover:text-neutral-300"
                >
                  {fragment}
                  <MdOutlineOpenInNew className="inline-block h-4 w-4 mb-[7.2px]" />
                </a>
                <> </>
              </Fragment>
            );
          } else {
            return (
              <Fragment key={fragmentIndex}>
                {fragment}
                <> </>
              </Fragment>
            );
          }
        })}
        <br />
      </p>
    );
  });
  return <div className="leading-9 break-words space-y-8">{texts}</div>;
};

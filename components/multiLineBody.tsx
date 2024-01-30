"use client";
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
    if (urlPattern.test(item)) {
      return (
        <a href={item} key={index} className="block text-neutral-500">
          {item}
        </a>
      );
    } else {
      return (
        <div key={index}>
          {item}
          <br />
        </div>
      );
    }
  });
  return <div className="leading-9">{texts}</div>;
};

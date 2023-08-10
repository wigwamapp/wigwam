import { createQueue } from "lib/system/queue";

const enqueue = createQueue();

export function downloadFile(
  data: Blob | string,
  name: string,
  type = "text/plain",
) {
  return enqueue(
    () =>
      new Promise<void>((res) => {
        if (typeof data === "string") {
          data = new Blob([data], { type });
        }

        const fileURL = URL.createObjectURL(data);

        const anchor = document.createElement("a");
        anchor.style.display = "none";
        anchor.href = fileURL;
        anchor.download = name;
        document.body.appendChild(anchor);

        setTimeout(() => {
          anchor.click();
          document.body.removeChild(anchor);

          setTimeout(() => {
            URL.revokeObjectURL(anchor.href);
            res();
          }, 250);
        }, 66);
      }),
  );
}

import { QRCodeSVG } from "qrcode.react";
import Dialog from "./dialog";
import { MdOutlineContentCopy } from "react-icons/md";
import SimpleButton from "./simpleButton";

export default function IdScanAndCopyDialog({
  dialogViewFlag,
  npub,
  onClick,
}: {
  dialogViewFlag: boolean;
  npub: string;
  onClick: () => void;
}) {
  return (
    <Dialog valid={dialogViewFlag}>
      <h2 className="text-xl font-bold">IDをスキャン・コピー</h2>
      <div className="space-y-4 w-48 ml-auto mr-auto">
        <QRCodeSVG value={npub} className="h-48 w-48 ml-auto mr-auto" />
        <button
          onClick={() => {
            navigator.clipboard.writeText(npub);
          }}
          className="w-48 flex text-neutral-500 px-2 rounded-xl outline-2 outline outline-neutral-200 hover:bg-neutral-200"
        >
          <p className="truncate">{npub}</p>
          <div className="mt-auto mb-auto">
            <MdOutlineContentCopy className="h-4 w-4" />
          </div>
        </button>
      </div>

      <SimpleButton onClick={onClick}>閉じる</SimpleButton>
    </Dialog>
  );
}

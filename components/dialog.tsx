"use client";
export default function Dialog({
  children,
  valid,
}: {
  children: React.ReactNode;
  valid: boolean;
}) {
  return (
    valid && (
      <div className="h-screen w-screen fixed top-0 left-0 z-30 backdrop-blur bg-black/50 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl p-8 space-y-8">{children}</div>
      </div>
    )
  );
}

import dynamic from "next/dynamic";
const QueryDetect = dynamic(() => import("./QueryDetect"), { ssr: false });
export default function Page() {
  return (
    <div className="p-7">
      <QueryDetect />
    </div>
  );
}

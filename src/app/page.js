import dynamic from "next/dynamic";
const CreataFace = dynamic(() => import("@/Components/CreataFace"));
export default function Home() {
  return (
    <>
      <div>
        <CreataFace />
      </div>
    </>
  );
}

import { FriendProfileClient } from "./FriendProfileClient";

// Required for static export with dynamic routes
export function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
    { id: "6" },
  ];
}

export default async function FriendProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <FriendProfileClient id={resolvedParams.id} />;
}

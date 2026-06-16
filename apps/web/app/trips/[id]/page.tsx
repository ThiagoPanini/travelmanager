import TripDetail from "./trip-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;
  return <TripDetail id={id} activeTab="overview" />;
}

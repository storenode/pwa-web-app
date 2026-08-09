import { useEffect, useState } from "react";
import { fetchChildStores } from "@/modules/account/account.api";
import { fetchVoiceReviews, type VoiceReviewRecord } from "../voicenotes.api";
import { useSecureParams } from "@/shared/hooks/useSecureParams";
import ComponentCard from "@/shared/fields/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/fields/ComponentTable";

export default function VoiceReviews() {
  const { nodeId } = useSecureParams<{ nodeId: string }>();
  const [reviews, setReviews] = useState<VoiceReviewRecord[]>([]);
  const [storeNameById, setStoreNameById] = useState<Map<string, string>>(
    new Map(),
  );

  useEffect(() => {
    if (!nodeId) return;

    let cancelled = false;

    fetchChildStores(nodeId)
      .then(async (stores) => {
        const childStores = stores.filter((store) => store.id !== nodeId);
        if (cancelled) return;
        setStoreNameById(
          new Map(
            childStores.map((store) => [
              store.id,
              store.displayName ?? store.name ?? store.id,
            ]),
          ),
        );

        const rows = await fetchVoiceReviews(
          childStores.map((store) => store.id),
        );
        if (cancelled) return;
        setReviews(rows);
      })
      .catch((err: Error) => {
        console.error("Failed to fetch voice reviews:", err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <ComponentCard
        title="Voice Reviews"
        desc="Customer feedback recorded via voice on the public store page."
      >
        {reviews.length === 0 ? (
          <p className="text-sm text-base-content/60">
            No voice reviews yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="text-start">
                  Store
                </TableCell>
                <TableCell isHeader className="text-start">
                  Phone
                </TableCell>
                <TableCell isHeader className="text-start">
                  Review
                </TableCell>
                <TableCell isHeader className="text-start">
                  Submitted At
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    {storeNameById.get(review.nodeId) ?? review.nodeId}
                  </TableCell>
                  <TableCell>{review.phone}</TableCell>
                  <TableCell className="max-w-md">
                    {review.reviewText}
                  </TableCell>
                  <TableCell>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ComponentCard>
    </div>
  );
}

"use client";

interface FlashCardProps {
  front: string;
  back: string;
  flipped: boolean;
  onFlip: () => void;
}

export default function FlashCard({
  front,
  back,
  flipped,
  onFlip,
}: FlashCardProps) {
  return (
    <div className="perspective w-full max-w-sm mx-auto" onClick={onFlip}>
      <div
        className={`flip-card-inner relative w-full aspect-[3/2] cursor-pointer ${
          flipped ? "flipped" : ""
        }`}
      >
        {/* Front */}
        <div className="flip-card-front absolute inset-0 flex items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg p-6">
          <p className="text-3xl font-bold text-center">{front}</p>
        </div>
        {/* Back */}
        <div className="flip-card-back absolute inset-0 flex items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg p-6">
          <p className="text-3xl font-bold text-center">{back}</p>
        </div>
      </div>
    </div>
  );
}

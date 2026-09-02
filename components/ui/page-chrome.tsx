/**
 * Page chrome shared by the marketing-style surfaces: the crosshatch ground and
 * the decorative bar band that closes a page.
 */

/** neutral-50 with the subtle 24px crosshatch texture. */
export const hatchedBackground: React.CSSProperties = {
  backgroundColor: "#FAFAFC",
  backgroundImage: [
    "repeating-linear-gradient(45deg, rgba(15,23,42,0.03) 0, rgba(15,23,42,0.03) 1px, transparent 0, transparent 50%)",
    "repeating-linear-gradient(-45deg, rgba(15,23,42,0.03) 0, rgba(15,23,42,0.03) 1px, transparent 0, transparent 50%)",
  ].join(", "),
  backgroundSize: "24px 24px",
};

export interface DecorativeBar {
  left: string;
  width: string;
  height: number;
  color: string;
}

export interface DecorativeBarsProps {
  bars: DecorativeBar[];
  /** Band height in px. Must clear the tallest bar. */
  height?: number;
  className?: string;
}

/** Purely ornamental band of bars rising from the bottom edge. */
export function DecorativeBars({
  bars,
  height = 160,
  className = "",
}: DecorativeBarsProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
    >
      {bars.map((bar, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            bottom: 0,
            left: bar.left,
            width: bar.width,
            height: bar.height,
            backgroundColor: bar.color,
            borderRadius: "6px 6px 0 0",
          }}
        />
      ))}
    </div>
  );
}

import type { QualityMeterProps } from './types';

/** Labeled segmented meter (e.g. data-enrichment quality) with N filled bars. */
export function QualityMeter({
  label,
  value,
  filled,
  total = 5,
}: QualityMeterProps) {
  const segments = Array.from({ length: total }, (_, index) => index < filled);
  return (
    <div className="qualityMeter">
      <div className="qualityMeterHead">
        <span className="qualityMeterLabel">{label}</span>
        <span className="qualityMeterValue">{value}</span>
      </div>
      <div className="qualityMeterBar">
        {segments.map((isFilled, index) => (
          <span
            key={index}
            className={
              isFilled
                ? 'qualityMeterSegment qualityMeterSegmentFilled'
                : 'qualityMeterSegment'
            }
          />
        ))}
      </div>
    </div>
  );
}

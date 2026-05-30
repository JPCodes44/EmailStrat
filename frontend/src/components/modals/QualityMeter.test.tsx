import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QualityMeter } from './QualityMeter';

describe('QualityMeter', () => {
  it('renders the label, value, and the right number of filled segments', () => {
    const { container } = render(
      <QualityMeter label="Quality" value="Excellent" filled={3} total={5} />,
    );
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
    expect(container.querySelectorAll('.qualityMeterSegment')).toHaveLength(5);
    expect(
      container.querySelectorAll('.qualityMeterSegmentFilled'),
    ).toHaveLength(3);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Slider from './Slider';

describe('Slider', () => {
  it('clamps a value below the minimum into range and passes onChange a number', () => {
    const onChange = vi.fn();
    render(<Slider id="area" name="carpetAreaSqft" value={200} onChange={onChange} min={150} max={6000} />);

    const readout = screen.getByLabelText('carpetAreaSqft value');
    fireEvent.change(readout, { target: { value: '10' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const received = onChange.mock.calls[0][0];
    expect(typeof received).toBe('number');
    expect(received).toBe(150);
  });

  it('clamps a value above the maximum into range and passes onChange a number', () => {
    const onChange = vi.fn();
    render(<Slider id="area" name="carpetAreaSqft" value={200} onChange={onChange} min={150} max={6000} />);

    const readout = screen.getByLabelText('carpetAreaSqft value');
    fireEvent.change(readout, { target: { value: '99999' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const received = onChange.mock.calls[0][0];
    expect(typeof received).toBe('number');
    expect(received).toBe(6000);
  });

  it('passes a value within range through unchanged, still as a number', () => {
    const onChange = vi.fn();
    render(<Slider id="area" name="carpetAreaSqft" value={200} onChange={onChange} min={150} max={6000} />);

    const track = screen.getByRole('slider');
    fireEvent.change(track, { target: { value: '3000' } });

    expect(onChange).toHaveBeenCalledWith(3000);
    expect(typeof onChange.mock.calls[0][0]).toBe('number');
  });
});

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onValueChange: (newValue: number) => void;
}

export const QuantityStepper = ({ value, onValueChange }: QuantityStepperProps) => {
  const handleDecrement = () => {
    if (value > 1) {
      onValueChange(value - 1);
    }
  };

  const handleIncrement = () => {
    onValueChange(value + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-6 w-6"
        onClick={handleDecrement}
        disabled={value <= 1}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-semibold">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-6 w-6"
        onClick={handleIncrement}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

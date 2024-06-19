import React from "react";
import { MEALTYPE } from "../../lib/enum";
import { Select } from "@mantine/core";

type SelectMealTypeProps = {
  value: MEALTYPE | null;
  label: string;
  variant: string;
  error: React.ReactNode;
  placeholder: string;
  onChange: (value: MEALTYPE) => void;
};

const SelectMealType: React.FC<SelectMealTypeProps> = ({
  label,
  onChange,
  value,
  variant,
  error,
  placeholder,
}) => {
  return (
    <Select
      label={label}
      value={value}
      data={[MEALTYPE.BREAKFAST, MEALTYPE.LUNCH, MEALTYPE.DINNER]}
      variant={variant}
      placeholder={placeholder}
      onChange={(value: string | null) => {
        if (Object.values(MEALTYPE).includes(value as MEALTYPE)) {
          onChange(value as MEALTYPE);
        }
      }}
      error={error}
    />
  );
};

export default SelectMealType;

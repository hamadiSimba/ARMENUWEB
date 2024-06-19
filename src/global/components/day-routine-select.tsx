import { Select } from "@mantine/core";
import React from "react";
import { STATUS } from "../../lib/enum";

type SelectDayRoutineProps = {
  value: STATUS | null;
  label: string;
  variant: string;
  error: React.ReactNode;
  placeholder: string;
  onChange: (value: STATUS) => void;
};

const SelectDayRoutine: React.FC<SelectDayRoutineProps> = ({
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
      placeholder={placeholder}
      data={[STATUS.AVAILABLE, STATUS.NOT_AVAILABLE]}
      variant={variant}
      error={error}
      onChange={(value: string | null) => {
        if (Object.values(STATUS).includes(value as STATUS)) {
          onChange(value as STATUS);
        }
      }}
    />
  );
};

export default SelectDayRoutine;

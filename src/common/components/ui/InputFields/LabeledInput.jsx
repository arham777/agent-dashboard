import dropdown from "../../../../assets/icons/dropdown.svg";

const LabeledInput = ({
  label,
  placeholder,
  value,
  onChange,
  name,
  type = "text",
  options = [],
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-[#475569]">{label}</label>

      {type === "select" ? (
        <div className="relative">
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={`cursor-pointer appearance-none w-full text-sm border border-[#E2E8F0] rounded-md px-3 pr-10 py-2 ${
              value === "" ? "text-[#94A3B8]" : "text-[#344054]"
            }`}
          >
            <option disabled value="">
              {placeholder || "Select an option"}
            </option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#344054]">
            <img src={dropdown} alt="" className="w-[16px] h-[16px]" />
          </div>
        </div>
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="rounded-lg text-sm font-normal border border-[#E2E8F0]  p-4 text-[#475569] placeholder-[#94A3B8]  focus:outline-none focus:ring-2 focus:ring-[#cbd5e1]"
        />
      )}
    </div>
  );
};

export default LabeledInput;

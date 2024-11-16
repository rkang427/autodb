import Select from 'react-select';

const Dropdown = ({ label, name, options, value, onChange, placeholder = "Select...", isMulti = false }) => {
  const selectOptions = options.map((option) => ({ value: option, label: option }));

  const selectedOption = isMulti
    ? selectOptions.filter((option) => value?.includes(option.value))
    : selectOptions.find((option) => option.value === value) || null; // Default to null

  return (
    <div style={{ marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>
      <label 
        htmlFor={name} 
        style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
      >
        {label}
      </label>
      <Select
        inputId={name}
        name={name}
        value={selectedOption}
        options={selectOptions}
        onChange={(selected) => onChange({ 
          target: { 
            name, 
            value: isMulti ? selected.map(opt => opt.value) : selected ? selected.value : "" 
          } 
        })}
        placeholder={placeholder}
        isClearable
        isSearchable
        isMulti={isMulti}
        styles={{
          control: (base) => ({
            ...base,
            borderColor: '#ccc',
            borderRadius: '4px',
            fontSize: '14px',
            transition: 'border-color 0.3s ease',
          }),
        }}
      />
    </div>
  );
};

export default Dropdown;
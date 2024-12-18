import './Modal.css';

const AddCustomerModal = ({
  closeAddCustomerModal,
  form,
  handleChange,
  handleRadioChange,
  handleSubmit,
  isAddCustomerModalOpen,
  onCustomerTaxIdReceived,
  error,
}) => {
  // Don't render the modal if it's closed
  if (!isAddCustomerModalOpen) {
    console.log("add customer modal is not open");
    return null; // Return null if the modal should not be shown
  }
  const onFormSubmit = (e) => {
    console.log("in onFormSubmit");
    handleSubmit(e, onCustomerTaxIdReceived); // Pass the handler to handleSubmit
  };
  console.log("add customer modal is open!!"); // Log when modal is open

  return (
    <div className="modal-overlay" onClick={closeAddCustomerModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Customer</h2>
        {
        error && (<div className="error-box">
          <p>{error}</p>
        </div>)
        }
        <form onSubmit={onFormSubmit}>
          {/* Radio buttons for selecting Individual or Business */}
          <div>
            <label>
              Individual
              <input
                type="radio"
                name="type"
                value="i"
                checked={form.customer_type === 'i'}
                onChange={handleRadioChange}
              />
            </label>
            <label>
              Business
              <input
                type="radio"
                name="type"
                value="b"
                checked={form.customer_type === 'b'}
                onChange={handleRadioChange}
              />
            </label>
          </div>

          {/* Fields for Individual */}
          {form.customer_type === 'i' && (
            <>
              <div>
                <label htmlFor="tax_id">
                  {form.customer_type === 'i' ? 'SSN' : 'TIN'} <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  id="tax_id"
                  name="tax_id"
                  required
                  pattern="\d{9}"
                  title="Must be exactly 9 numeric digits"
                  maxLength="9"
                  value={form.tax_id}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                  }}
                />
              </div>
            </>
          )}
          {/* Fields for Business */}
          {form.customer_type === 'b' && (
            <>
              <div>
                <label htmlFor="tax_id">TIN <span style={{ color: "red" }}>*</span></label>
                <input
                  type="text"
                  id="tax_id"
                  name="tax_id"
                  required
                  pattern="\d{9}"
                  value={form.tax_id}
                  onChange={handleChange}
                  maxLength="9"
                  minLength="9"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                  }}
                />
              </div>
              <div>
                <label htmlFor="bName">Business Name <span style={{ color: "red" }}>*</span></label>
                <input
                  type="text"
                  id="business_name"
                  name="business_name"
                  value={form.business_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="title">Primary Contact Title <span style={{ color: "red" }}>*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* Common fields */}
          <div>
            <label htmlFor="first_name">First Name <span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="last_name">Last Name <span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="phone">Phone <span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              required
              pattern="\d{10}"
              title="Phone number must be 10 digits"
              maxLength="10"
              minLength="10"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              }}
            />
          </div>
          <div>
            <label htmlFor="email">Email <span style={{ color: "red" }}>*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="street">Street <span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              id="street"
              name="street"
              value={form.street}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="city">City <span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="state">State <span style={{ color: "red" }}>*</span></label>
            <input
              type="text"
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="postal_code">Postal Code <span style={{ color: "red" }}>*</span></label>
            <input
              type="postal_code"
              id="postal_code"
              name="postal_code"
              value={form.postal_code}
              onChange={handleChange}
              maxLength="5"
              minLength="5"
              required
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              }}
            />
          </div>
          <div>
            <button type="submit">Submit</button>
            <button type="button" onClick={closeAddCustomerModal}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;

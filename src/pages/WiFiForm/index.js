import { useForm } from "react-hook-form";

import AppLayout from "../../components/AppLayout";

const WiFiForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = data => {
    const qs = new URLSearchParams(data).toString();
    window.open(`./wifi-invoice?${qs}`, "_blank");
  }

  return (
    <AppLayout>
      <section>
        <div className="container py-4">
          <h4>WiFi Invoice</h4>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
              <div className="col-12 col-md-6">
                <input
                  placeholder="Name"
                  className="form-control"
                  type="text"
                  {...register("name", { required: true })}
                />
                {errors.name && <div className="text-danger small">This field is required</div>}
              </div>
              <div className="col-12 col-md-6">
                <input
                  placeholder="Date"
                  className="form-control"
                  type="date"
                  {...register("date", { required: true })}
                />
                {errors.date && <div className="text-danger small">This field is required</div>}
              </div>
              <div className="col-12 col-md-6">
                <input
                  placeholder="Landline Number"
                  className="form-control"
                  type="number"
                  min="0"
                  {...register("landline", { required: true })}
                />
                {errors.landline && <div className="text-danger small">This field is required</div>}
              </div>
              <div className="col-12 col-md-6">
                <input
                  placeholder="Item Price"
                  className="form-control"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { required: true })}
                />
                {errors.price && <div className="text-danger small">This field is required</div>}
              </div>
              <div className="col-12 mt-3">
                <button type="submit" className="btn btn-primary">
                  Create Receipt
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </AppLayout>
  );
};

export default WiFiForm;

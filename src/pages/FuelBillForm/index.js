import round from "lodash.round";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import AppLayout from "../../components/AppLayout";

const FuelBillForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const canvasRef = useRef();

  const initCanvas = (callback) => {
    const context = canvasRef.current.getContext('2d');

    // reset
    context.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height);

    // image draw
    const image = new Image();
    image.src = "/assets/images/fuel-bill-template.jpg";

    
    image.onload = () => {
      context.drawImage(image, 0, 0, canvasRef.current?.width, canvasRef.current?.height);
      callback && callback();
    };
  };

  const writeText = (text, x, y, option = {}) => {
    const context = canvasRef.current.getContext('2d');

    context.beginPath();
    if (option.font) {
      let font = '';
      if (option.font.weight) 
        font = font + option.font.weight + ' ';

      if (option.font.size)
        font = font + option.font.size + 'px ';

      if (option.font.family)
        font = font + option.font.family;

      context.font = font;
    }
    
    if (option.textBaseline) context.textBaseline = option.textBaseline;
    if(option.fillStyle) context.fillStyle = option.fillStyle;
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      context.fillText(line, x, y + (i * (option.font.size + 15)));
    });

    context.stroke();
  };

  const onSubmit = data => {
    initCanvas(() => {
      const volume = round(parseFloat(data?.price) / parseFloat(data?.rate), 2).toFixed(2);
      const price = round(parseFloat(data?.price), 2).toFixed(2);
      const rate = round(parseFloat(data?.rate), 2).toFixed(2);

      writeText(rate, 400, 749, {
        font: {
          size: 30,
          weight: "bold",
          family: "Fake Receipt"
        },
        textBaseline: "top",
        fillStyle: "#1c1d1f",
      });

      writeText(volume, 163, 803, {
        font: {
          size: 18,
          weight: "bold",
          family: "Merchant Copy"
        },
        textBaseline: "top",
        fillStyle: "#1c1d1f",
      });

      writeText(price, 215, 776, {
        font: {
          size: 18,
          weight: "bold",
          family: "Merchant Copy"
        },
        textBaseline: "top",
        fillStyle: "#1c1d1f",
      });
    });
  }

  return (
    <AppLayout>
      <section>
        <div className="container py-4">
          <h4>Fuel Bill</h4>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
              <div className="col-12 col-md-6">
                <input
                  placeholder="Rate"
                  className="form-control"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("rate", { required: true })}
                />
                {errors.rate && <div className="text-danger small">This field is required</div>}
              </div>
              <div className="col-12 col-md-6">
                <input
                  placeholder="Total Price"
                  className="form-control"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { required: true })}
                />
                {errors.price && <div className="text-danger small">This field is required</div>}
              </div>
              <div className="col-12 mt-3">
                <p style={{fontFamily: "Merchant Copy"}}>hiiii</p>
                <button type="submit" className="btn btn-primary">
                  Create Bill
                </button>
              </div>
            </div>
          </form>
        </div>
        <canvas ref={canvasRef} height={1048} width={444}/>
      </section>
    </AppLayout>
  );
};

export default FuelBillForm;
